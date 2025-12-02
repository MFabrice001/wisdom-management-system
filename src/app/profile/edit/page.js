'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, ArrowLeft, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import styles from './page.module.css';

export default function EditProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session) {
      fetchProfile();
    }
  }, [status, session, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || '',
          email: data.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    // Validation
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      setSaving(false);
      return;
    }

    // If changing password, validate
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setError('Current password is required to change password');
        setSaving(false);
        return;
      }

      if (!formData.newPassword) {
        setError('New password is required');
        setSaving(false);
        return;
      }

      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        setSaving(false);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        setSaving(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess(true);

      // Update session
      await update({
        ...session,
        user: {
          ...session.user,
          name: formData.name,
          email: formData.email
        }
      });

      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 2000);

    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={48} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <Link href="/profile" className={styles.backButton}>
            <ArrowLeft size={20} />
            Back to Profile
          </Link>
        </div>

        <div className={styles.content}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Edit Profile</h1>
            <p className={styles.subtitle}>Update your personal information</p>
          </div>

          {/* Form Card */}
          <div className={styles.card}>
            {/* Success Message */}
            {success && (
              <div className={styles.success}>
                <CheckCircle className={styles.successIcon} size={20} />
                <div>
                  <p className={styles.successTitle}>Profile Updated Successfully!</p>
                  <p className={styles.successText}>Redirecting to profile...</p>
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

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Basic Information Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Basic Information</h3>

                {/* Name Field */}
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Full Name *
                  </label>
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
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address *
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
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Change Password</h3>
                <p className={styles.sectionDescription}>
                  Leave blank if you don't want to change your password
                </p>

                {/* Current Password */}
                <div className={styles.formGroup}>
                  <label htmlFor="currentPassword" className={styles.label}>
                    Current Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} size={20} />
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="••••••••"
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className={styles.formGroup}>
                  <label htmlFor="newPassword" className={styles.label}>
                    New Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} size={20} />
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="••••••••"
                      disabled={saving}
                    />
                  </div>
                  <p className={styles.helpText}>Must be at least 6 characters</p>
                </div>

                {/* Confirm Password */}
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    Confirm New Password
                  </label>
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
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.actions}>
                <Link href="/profile" className={styles.cancelButton}>
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.saveButton}
                >
                  {saving ? (
                    <>
                      <Loader2 className={styles.buttonSpinner} size={18} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}