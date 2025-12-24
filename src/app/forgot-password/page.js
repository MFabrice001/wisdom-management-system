'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import styles from './page.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

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
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Error sending reset email:', err);
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>Enter your email to receive a reset link</p>
          </div>

          {submitted ? (
            <div className={styles.successContainer}>
              <div className={styles.successIconWrapper}>
                <CheckCircle className={styles.successIcon} />
              </div>
              <h3 className={styles.successTitle}>Check your email</h3>
              <p className={styles.successText}>
                If an account exists for <strong>{email}</strong>, we have sent a password reset confirmation.
              </p>
              <Link href="/login" className={styles.loginButton}>
                Return to Login
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
                <label className={styles.label}>Email Address</label>
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
                {loading ? <Loader2 className={styles.spinner} /> : 'Send Reset Link'}
              </button>

              <div className={styles.footer}>
                <Link href="/login" className={styles.backLink}>
                  <ArrowLeft size={16} /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}