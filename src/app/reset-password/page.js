'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

// Wrapper for Suspense (Required for useSearchParams)
export default function ResetPasswordPageWrapper() {
  return (
    <Suspense fallback={<div className={styles.loadingWrapper}><Loader2 className={styles.spinner} /></div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.errorContainer}>
                        <AlertCircle className={styles.errorIcon} size={48} />
                        <h2 className={styles.errorTitle}>Invalid Link</h2>
                        <p className={styles.errorText}>This password reset link is invalid or missing.</p>
                        <Link href="/forgot-password" className={styles.backLink}>Request a new link</Link>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>Enter your new password below.</p>
          </div>

          {success ? (
            <div className={styles.successContainer}>
              <CheckCircle className={styles.successIcon} size={48} />
              <h3 className={styles.successTitle}>Password Reset!</h3>
              <p className={styles.successText}>
                Your password has been successfully updated. Redirecting to login...
              </p>
              <Link href="/login" className={styles.loginButton}>
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              {error && (
                <div className={styles.errorMessage}>
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>New Password</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={20} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={20} />
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.input}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? <Loader2 className={styles.spinner} /> : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}