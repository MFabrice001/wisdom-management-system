import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Email transporter for 2FA (lazy initialization)
let transporter = null;
const getTransporter = async () => {
  if (!transporter && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
    const nodemailer = (await import('nodemailer')).default;
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }
  return transporter;
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        // 1. Standard Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
          throw new Error('Please enter a valid email address.');
        }

        // 2. Find user by email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user) {
          throw new Error('No user found with this email');
        }

        // 3. Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        // 4. Two-Factor Authentication for Elders
        if (user.role === 'ELDER') {
          if (!credentials.twoFactorCode) {
            // Generate and send 2FA code
            const code = crypto.randomInt(100000, 999999).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // Store 2FA code in database
            await prisma.user.update({
              where: { id: user.id },
              data: {
                twoFactorCode: code,
                twoFactorExpiry: expiresAt
              }
            });

            // Send email
            try {
              const emailTransporter = await getTransporter();
              if (emailTransporter) {
                await emailTransporter.sendMail({
                  from: process.env.SMTP_EMAIL,
                  to: user.email,
                  subject: 'Your Login Verification Code',
                  html: `
                    <h2>Login Verification</h2>
                    <p>Your verification code is: <strong>${code}</strong></p>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                  `
                });
              }
            } catch (error) {
              console.error('Failed to send 2FA email:', error);
            }

            throw new Error('2FA_REQUIRED');
          } else {
            // Verify 2FA code
            if (!user.twoFactorCode || !user.twoFactorExpiry) {
              throw new Error('No verification code found. Please try logging in again.');
            }

            if (new Date() > user.twoFactorExpiry) {
              throw new Error('Verification code has expired. Please try logging in again.');
            }

            if (credentials.twoFactorCode !== user.twoFactorCode) {
              throw new Error('Invalid verification code.');
            }

            // Clear 2FA code after successful verification
            await prisma.user.update({
              where: { id: user.id },
              data: {
                twoFactorCode: null,
                twoFactorExpiry: null
              }
            });
          }
        }

        // 5. Return user object
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          requirePasswordChange: user.requirePasswordChange,
          approvedCategory: user.approvedCategory,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.requirePasswordChange = user.requirePasswordChange;
        token.approvedCategory = user.approvedCategory;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.requirePasswordChange = token.requirePasswordChange;
        session.user.approvedCategory = token.approvedCategory;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };