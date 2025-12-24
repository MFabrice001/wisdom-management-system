'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LogIn, Mail, Lock, AlertCircle, Shield, 
  User as UserIcon, BookOpen, Heart 
} from 'lucide-react';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('USER'); // Default to Citizen (USER)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Role Configurations with Descriptions based on Use Cases
  const roles = [
    {
      id: 'USER',
      label: 'Citizen',
      icon: UserIcon,
      description: '',
      colorClass: styles.roleButtonUser,
      registerLink: '/register', // Standard registration
      registerText: 'Create Account' 
    },
    {
      id: 'ELDER',
      label: 'Elder',
      icon: BookOpen,
      description: '',
      colorClass: styles.roleButtonElder,
      registerLink: '/register?role=ELDER', // Dedicated Elder registration link
      registerText: 'Apply as Elder Contributor'
    },
    {
      id: 'ADMIN',
      label: 'Admin',
      icon: Shield,
      description: '',
      colorClass: styles.roleButtonAdmin,
      registerLink: null, // Admins usually created manually or via secret link
      registerText: null
    }
  ];

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

    // 1. Basic Empty Field Check
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    // 2. Strict Gmail Validation (Security Requirement)
    if (!formData.email.endsWith('@gmail.com')) {
      setError('Please use a valid @gmail.com address');
      setLoading(false);
      return;
    }

    // 3. Strict Password Validation (Capital Letter + Number)
    // This enforces the security policy on login attempts as well
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 6 characters and contain a capital letter & number');
      setLoading(false);
      // Clear password on validation failure to ensure it is not shown/persisted in state
      setFormData(prev => ({ ...prev, password: '' }));
      return;
    }

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError('Invalid email or password');
        // Clear password field on failed login attempt
        setFormData(prev => ({ ...prev, password: '' }));
      } else {
        // Fetch user details to verify role matches selected role
        const response = await fetch('/api/user/check-role');
        const data = await response.json();
        
        // Role mismatch check
        if (data.role !== selectedRole && data.role !== 'ADMIN') {
          if (selectedRole === 'ADMIN' && data.role !== 'ADMIN') {
             setError('You do not have admin privileges');
             setLoading(false);
             return;
          }
          if (selectedRole === 'ELDER' && data.role !== 'ELDER') {
             setError('This account is not registered as an Elder');
             setLoading(false);
             return;
          }
        }
        
        // Redirect logic
        if (data.role === 'ADMIN') {
          router.push('/admin');
        } else if (data.role === 'ELDER') {
          router.push('/elder/dashboard'); // Dedicated Elder Dashboard
        } else {
          router.push('/wisdom');
        }
        router.refresh();
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
       // Clear password field on error
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  const currentRoleConfig = roles.find(r => r.id === selectedRole);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <LogIn size={32} color="white" />
          </div>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to Umurage Wubwenge</p>
        </div>

        {/* Role Selection Grid */}
        <div className={styles.roleSelection}>
          <p className={styles.roleLabel}>Select Your Role</p>
          <div className={styles.roleGrid}>
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`${styles.roleButton} ${selectedRole === role.id ? styles.roleButtonActive : ''}`}
              >
                <role.icon 
                  className={`${styles.roleIcon} ${selectedRole === role.id ? styles.roleIconActive : ''}`} 
                />
                <p className={`${styles.roleText} ${selectedRole === role.id ? styles.roleTextActive : ''}`}>
                  {role.label}
                </p>
              </button>
            ))}
          </div>
          {/* Dynamic Description Box */}
          <div className={styles.roleDescriptionBox}>
            <p>{currentRoleConfig?.description}</p>
          </div>
        </div>

        {/* Form Card */}
        <div className={styles.card}>
          {error && (
            <div className={styles.error}>
              <AlertCircle className={styles.errorIcon} size={20} />
              <p className={styles.errorText}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
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
                  placeholder="name@gmail.com"
                  disabled={loading}
                  autoComplete="off" // Prevent browser autocomplete if desired
                />
              </div>
            </div>

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
                  disabled={loading}
                  autoComplete="off" // Prevent browser autocomplete if desired
                />
              </div>
            </div>

            <div className={styles.rememberRow}>
              <div className={styles.checkboxWrapper}>
                <input id="remember" type="checkbox" className={styles.checkbox} />
                <label htmlFor="remember" className={styles.checkboxLabel}>Remember me</label>
              </div>
              <Link href="/forgot-password" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${styles.submitButton} ${
                selectedRole === 'ADMIN' ? styles.submitButtonAdmin : 
                selectedRole === 'ELDER' ? styles.submitButtonElder : styles.submitButtonUser
              }`}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Sign In as {currentRoleConfig?.label}</span>
                </>
              )}
            </button>
          </form>

          <div className={styles.footer}>
            {/* DYNAMIC REGISTRATION LINK BASED ON ROLE */}
            {currentRoleConfig?.registerLink ? (
              <p className={styles.footerText}>
                New here?{' '}
                <Link href={currentRoleConfig.registerLink} className={styles.registerLink}>
                  {currentRoleConfig.registerText}
                </Link>
              </p>
            ) : (
              <p className={styles.footerText}>
                Admin accounts are invitation only.
              </p>
            )}
            
            <div className={styles.guestLinkWrapper}>
               <Link href="/wisdom" className={styles.guestLink}>
                 Continue as Guest (Read Only)
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}