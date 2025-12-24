'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle, BookOpen, MapPin, Fingerprint, Loader2 } from 'lucide-react';
import styles from './page.module.css';

// Wrapper for Suspense (Required for useSearchParams)
export default function RegisterPageWrapper() {
  return (
    <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get role from URL (default to USER/Citizen)
  const roleParam = searchParams.get('role');
  const initialRole = roleParam === 'ELDER' ? 'ELDER' : 'USER';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
    nationalId: '', // New field for Elder
    residence: ''   // New field for Elder
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Clear sensitive data on mount to prevent browser autofill persistence
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      email: '',
      password: '',
      confirmPassword: '',
      nationalId: '',
      // We keep the role from the URL if present
    }));
  }, []);

  useEffect(() => {
    if (roleParam === 'ELDER') {
      setFormData(prev => ({ ...prev, role: 'ELDER' }));
    } else {
      setFormData(prev => ({ ...prev, role: 'USER' }));
    }
  }, [roleParam]);

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

    // Basic Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All basic fields are required');
      setLoading(false);
      return;
    }

    // Elder Specific Validation
    if (formData.role === 'ELDER') {
        if (!formData.nationalId || !formData.residence) {
            setError('National ID and Residence are required for Elder registration');
            setLoading(false);
            return;
        }
        // Basic Rwandan ID format check (16 digits)
        if (!/^\d{16}$/.test(formData.nationalId)) {
            setError('Please enter a valid 16-digit Rwandan National ID');
            setLoading(false);
            return;
        }
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      // Security: Clear passwords on mismatch
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      return;
    }

    // Password Validation: At least 6 chars, 1 Capital, 1 Number
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 6 characters and contain a capital letter & number');
      setLoading(false);
      // Security: Clear passwords on weak password error
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      return;
    }

    if (!formData.email.endsWith('@gmail.com')) {
      setError('Please use a valid @gmail.com address');
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
          role: formData.role,
          nationalId: formData.role === 'ELDER' ? formData.nationalId : undefined,
          residence: formData.role === 'ELDER' ? formData.residence : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess(true);
      
      // Security: Clear all form data on success
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        nationalId: '',
        residence: '',
        role: formData.role
      });
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error) {
      setError(error.message);
      // Security: Clear passwords on API error
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } finally {
      setLoading(false);
    }
  };

  const isElder = formData.role === 'ELDER';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={`${styles.logoWrapper} ${isElder ? styles.logoWrapperElder : ''}`}>
            {isElder ? <BookOpen size={32} color="white" /> : <UserPlus size={32} color="white" />}
          </div>
          <h2 className={styles.title}>
            {isElder ? 'Elder Application' : 'Create Account'}
          </h2>
          <p className={styles.subtitle}>
            {isElder 
              ? 'Join as a guardian of our community wisdom' 
              : 'Join the Umurage Wubwenge community'}
          </p>
        </div>

        <div className={styles.card}>
          {success && (
            <div className={styles.success}>
              <CheckCircle className={styles.successIcon} size={20} />
              <div className={styles.successContent}>
                <p className={styles.successTitle}>Registration Successful!</p>
                <p className={styles.successText}>Redirecting to login...</p>
              </div>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <AlertCircle className={styles.errorIcon} size={20} />
              <p className={styles.errorText}>{error}</p>
            </div>
          )}

          {/* Form with autoComplete="off" */}
          <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
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
                  placeholder="John Doe"
                  disabled={loading || success}
                  autoComplete="off"
                />
              </div>
            </div>

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
                  placeholder="john@gmail.com"
                  disabled={loading || success}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Elder Specific Fields */}
            {isElder && (
                <>
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
                </>
            )}

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
                  autoComplete="new-password" // Prevents autofill of old passwords
                />
              </div>
              <p className={styles.helpText}>Must contain at least 1 capital letter & 1 number</p>
            </div>

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
                  autoComplete="new-password" // Prevents autofill
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className={`${styles.submitButton} ${isElder ? styles.submitButtonElder : ''}`}
            >
              {loading ? (
                <>
                  <Loader2 className={styles.spinner} />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  {isElder ? <BookOpen size={20} /> : <UserPlus size={20} />}
                  <span>{isElder ? 'Register as Elder' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Already have an account?{' '}
              <Link href="/login" className={styles.loginLink}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}