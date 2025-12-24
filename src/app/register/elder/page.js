'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, Mail, Lock, User, AlertCircle, 
  CheckCircle, MapPin, Fingerprint, Loader2 
} from 'lucide-react';
import styles from './page.module.css';

export default function ElderRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    nationalId: '',
    residence: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Clear sensitive data on mount to prevent stale state
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      email: '',
      password: '',
      confirmPassword: '',
      nationalId: ''
    }));
  }, []);

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

    // 1. Basic Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.nationalId || !formData.residence) {
      setError('All fields are required for Elder registration');
      setLoading(false);
      return;
    }

    // 2. Password Match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      return;
    }

    // 3. Password Strength (6+ chars, 1 Capital, 1 Number)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 6 characters and contain a capital letter & number');
      setLoading(false);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      return;
    }

    // 4. Gmail Validation
    if (!formData.email.endsWith('@gmail.com')) {
      setError('Please use a valid @gmail.com address');
      setLoading(false);
      return;
    }

    // 5. National ID Format (16 digits check)
    if (!/^\d{16}$/.test(formData.nationalId)) {
        setError('Please enter a valid 16-digit Rwandan National ID');
        setLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'ELDER', 
          nationalId: formData.nationalId,
          residence: formData.residence
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Registration failed the account already exists');
      }

      setSuccess(true);
      
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        nationalId: '',
        residence: ''
      });
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error) {
      setError(error.message);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
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
            <BookOpen size={32} color="white" />
          </div>
          <h2 className={styles.title}>Elder Application</h2>
          <p className={styles.subtitle}>Join as a guardian of our community wisdom</p>
        </div>

        {/* Form Card */}
        <div className={styles.card}>
          {/* Success Message */}
          {success && (
            <div className={styles.success}>
              <CheckCircle className={styles.successIcon} size={20} />
              <div className={styles.successContent}>
                <p className={styles.successTitle}>Application Successful!</p>
                <p className={styles.successText}>Redirecting to login...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={styles.error}>
              <AlertCircle className={styles.errorIcon} size={20} />
              <p className={styles.errorText}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
            {/* Name Field */}
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Full Name</label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={20} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Mzee Habimana"
                  disabled={loading || success}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="habimana@gmail.com"
                  disabled={loading || success}
                  autoComplete="new-email"
                />
              </div>
            </div>

            {/* National ID Field */}
            <div className={styles.formGroup}>
                <label htmlFor="nationalId" className={styles.label}>National ID (NID)</label>
                <div className={styles.inputWrapper}>
                    <Fingerprint className={styles.inputIcon} size={20} />
                    <input
                    id="nationalId"
                    name="nationalId"
                    type="text"
                    value={formData.nationalId}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="1 19XX 8 XXXXXXXX"
                    maxLength={16}
                    disabled={loading || success}
                    autoComplete="off"
                    />
                </div>
            </div>

            {/* Residence Field */}
            <div className={styles.formGroup}>
                <label htmlFor="residence" className={styles.label}>Residence (District, Sector)</label>
                <div className={styles.inputWrapper}>
                    <MapPin className={styles.inputIcon} size={20} />
                    <input
                    id="residence"
                    name="residence"
                    type="text"
                    value={formData.residence}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g., Gasabo, Kacyiru"
                    disabled={loading || success}
                    autoComplete="off"
                    />
                </div>
            </div>

            {/* Password Field */}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
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
                  disabled={loading || success}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={20} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="••••••••"
                  disabled={loading || success}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <Loader2 className={styles.spinner} />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <BookOpen size={20} />
                  <span>Register as Elder</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className={styles.footer}>
            <p className={styles.footerText}>
              Already have an account?{' '}
              <Link href="/login" className={styles.loginLink}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}