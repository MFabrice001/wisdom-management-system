import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import { LanguageProvider } from '@/context/LanguageContext';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Umurage Wubwenge - Community Wisdom Management System',
  description: 'Preserving traditional African knowledge and wisdom for future generations',
  keywords: ['African wisdom', 'traditional knowledge', 'community', 'culture', 'heritage'],
  authors: [{ name: 'Umurage Wubwenge Team' }],
  openGraph: {
    title: 'Umurage Wubwenge',
    description: 'Preserving traditional African knowledge and wisdom',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <LanguageProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}