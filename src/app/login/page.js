'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock, AlertCircle, Shield, User as UserIcon } from 'lucide-react';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('USER');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        // Check if user role matches selected role
        const response = await fetch('/api/user/check-role');
        const data = await response.json();
        
        if (selectedRole === 'ADMIN' && data.role !== 'ADMIN') {
          setError('You do not have admin privileges');
          setLoading(false);
          return;
        }
        
        // Redirect based on role
        if (data.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/wisdom');
        }
        router.refresh();
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <LogIn size={32} color="white" />
          </div>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to access your wisdom library</p>
        </div>

        {/* Role Selection */}
        <div className={styles.roleSelection}>
          <p className={styles.roleLabel}>Select Login Type</p>
          <div className={styles.roleGrid}>
            <button
              type="button"
              onClick={() => setSelectedRole('USER')}
              className={`${styles.roleButton} ${selectedRole === 'USER' ? styles.roleButtonActive : ''}`}
            >
              <UserIcon className={`${styles.roleIcon} ${selectedRole === 'USER' ? styles.roleIconActive : ''}`} />
              <p className={`${styles.roleText} ${selectedRole === 'USER' ? styles.roleTextActive : ''}`}>
                User Login
              </p>
            </button>
            
            <button
              type="button"
              onClick={() => setSelectedRole('ADMIN')}
              className={`${styles.roleButton} ${selectedRole === 'ADMIN' ? styles.roleButtonAdminActive : ''}`}
            >
              <Shield className={`${styles.roleIcon} ${selectedRole === 'ADMIN' ? styles.roleIconAdminActive : ''}`} />
              <p className={`${styles.roleText} ${selectedRole === 'ADMIN' ? styles.roleTextAdminActive : ''}`}>
                Admin Login
              </p>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className={styles.card}>
          {/* Error Message */}
          {error && (
            <div className={styles.error}>
              <AlertCircle className={styles.errorIcon} size={20} />
              <p className={styles.errorText}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Email Field */}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="john@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={20} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className={styles.rememberRow}>
              <div className={styles.checkboxWrapper}>
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className={styles.checkbox}
                />
                <label htmlFor="remember" className={styles.checkboxLabel}>
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`${styles.submitButton} ${
                selectedRole === 'ADMIN' ? styles.submitButtonAdmin : styles.submitButtonUser
              }`}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  {selectedRole === 'ADMIN' ? <Shield size={20} /> : <LogIn size={20} />}
                  <span>Sign In as {selectedRole === 'ADMIN' ? 'Admin' : 'User'}</span>
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className={styles.footer}>
            <p className={styles.footerText}>
              Don't have an account?{' '}
              <Link href="/register" className={styles.registerLink}>
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}