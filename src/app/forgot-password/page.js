'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './page.module.css';

export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const translations = {
    en: {
      title: 'Reset Password',
      subtitle: 'Enter your email to receive a reset link',
      checkYourEmail: 'Check your email',
      emailSentMessage: 'If an account exists for',
      emailSentMessage2: ', we have sent a password reset confirmation.',
      returnToLogin: 'Return to Login',
      emailAddress: 'Email Address',
      sendResetLink: 'Send Reset Link',
      backToLogin: 'Back to Login',
      errors: {
        somethingWrong: 'Something went wrong. Please try again.',
        failedToConnect: 'Failed to connect to the server.'
      }
    },
    rw: {
      title: 'Guhindura Ijambo Ryibanga',
      subtitle: 'Shyiramo email yawe kugira ngo uhabwe link yo guhindura',
      checkYourEmail: 'Reba email yawe',
      emailSentMessage: 'Niba konti ihari kuri',
      emailSentMessage2: ', twohereje ubutumwa bwo kwemeza guhindura ijambo ryibanga.',
      returnToLogin: 'Garuka ku Kwinjira',
      emailAddress: 'Aderesi ya Email',
      sendResetLink: 'Ohereza Link yo Guhindura',
      backToLogin: 'Garuka ku Kwinjira',
      errors: {
        somethingWrong: 'Habaye ikosa. Ongera ugerageze.',
        failedToConnect: 'Byanze guhuza na seriveri.'
      }
    }
  };

  const t = translations[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // We treat both 200 OK and 404 (user not found logic handled in API) as success
      // to prevent email enumeration attacks, unless the API returns a specific error.
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || t.errors.somethingWrong);
      }
    } catch (err) {
      console.error('Error sending reset email:', err);
      setError(t.errors.failedToConnect);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>{t.title}</h1>
            <p className={styles.subtitle}>{t.subtitle}</p>
          </div>

          {submitted ? (
            <div className={styles.successContainer}>
              <div className={styles.successIconWrapper}>
                <CheckCircle className={styles.successIcon} />
              </div>
              <h3 className={styles.successTitle}>{t.checkYourEmail}</h3>
              <p className={styles.successText}>
                {t.emailSentMessage} <strong>{email}</strong>{t.emailSentMessage2}
              </p>
              <Link href="/login" className={styles.loginButton}>
                {t.returnToLogin}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              {error && (
                <div className={styles.error} style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                  <p>{error}</p>
                </div>
              )}
              
              <div className={styles.formGroup}>
                <label className={styles.label}>{t.emailAddress}</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={20} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    placeholder="name@gmail.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? <Loader2 className={styles.spinner} /> : t.sendResetLink}
              </button>

              <div className={styles.footer}>
                <Link href="/login" className={styles.backLink}>
                  <ArrowLeft size={16} /> {t.backToLogin}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}