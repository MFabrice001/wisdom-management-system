'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LogIn, Mail, Lock, AlertCircle, Shield, 
  User as UserIcon, BookOpen, Heart 
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [selectedRole, setSelectedRole] = useState('USER'); // Default to Citizen (USER)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const translations = {
    en: {
      welcomeBack: 'Welcome Back',
      signInTo: 'Sign in to Umurage Wubwenge',
      selectRole: 'Select Your Role',
      emailAddress: 'Email Address',
      password: 'Password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      signingIn: 'Signing In...',
      signInAs: 'Sign In as',
      newHere: 'New here?',
      continueAsGuest: 'Continue as Guest (Read Only)',
      adminInviteOnly: 'Admin accounts are invitation only.',
      roles: {
        USER: { label: 'Citizen', registerText: 'Create Account' },
        ELDER: { label: 'Elder', registerText: 'Apply as Elder Contributor' },
        ADMIN: { label: 'Admin', registerText: null }
      },
      errors: {
        fillBoth: 'Please enter both email and password',
        validGmail: 'Please use a valid @gmail.com address',
        passwordRequirements: 'Password must be at least 6 characters and contain a capital letter & number',
        invalidCredentials: 'Invalid email or password',
        noAdminPrivileges: 'You do not have admin privileges',
        notElder: 'This account is not registered as an Elder',
        errorOccurred: 'An error occurred. Please try again.'
      }
    },
    rw: {
      welcomeBack: 'Murakaza Neza',
      signInTo: 'Injira muri Umurage Wubwenge',
      selectRole: 'Hitamo Uruhare Rwawe',
      emailAddress: 'Aderesi ya Email',
      password: 'Ijambo Ryibanga',
      rememberMe: 'Nyibuke',
      forgotPassword: 'Wibagiwe ijambo ryibanga?',
      signingIn: 'Kwinjira...',
      signInAs: 'Injira nka',
      newHere: 'Ntabwo ufite konti?',
      continueAsGuest: 'Komeza nk\'Umukerarugendo (Gusoma Gusa)',
      adminInviteOnly: 'Konti z\'ubuyobozi zihabwa gusa.',
      roles: {
        USER: { label: 'Umuturage', registerText: 'Fungura Konti' },
        ELDER: { label: 'Umusaza', registerText: 'Saba Kuba Umusaza Ufasha' },
        ADMIN: { label: 'Umuyobozi', registerText: null }
      },
      errors: {
        fillBoth: 'Nyamuneka shyiramo email n\'ijambo ryibanga',
        validGmail: 'Nyamuneka koresha @gmail.com',
        passwordRequirements: 'Ijambo ryibanga rigomba kuba rifite byibuze inyuguti 6, inyuguti nkuru n\'umubare',
        invalidCredentials: 'Email cyangwa ijambo ryibanga sibyo',
        noAdminPrivileges: 'Ntufite uburenganzira bw\'ubuyobozi',
        notElder: 'Iyi konti ntiyanditswe nk\'umusaza',
        errorOccurred: 'Habaye ikosa. Ongera ugerageze.'
      }
    }
  };

  const t = translations[language];

  // Role Configurations with Descriptions based on Use Cases
  const roles = [
    {
      id: 'USER',
      label: t.roles.USER.label,
      icon: UserIcon,
      description: '',
      colorClass: styles.roleButtonUser,
      registerLink: '/register', // Standard registration
      registerText: t.roles.USER.registerText
    },
    {
      id: 'ELDER',
      label: t.roles.ELDER.label,
      icon: BookOpen,
      description: '',
      colorClass: styles.roleButtonElder,
      registerLink: '/register?role=ELDER', // Dedicated Elder registration link
      registerText: t.roles.ELDER.registerText
    },
    {
      id: 'ADMIN',
      label: t.roles.ADMIN.label,
      icon: Shield,
      description: '',
      colorClass: styles.roleButtonAdmin,
      registerLink: null, // Admins usually created manually or via secret link
      registerText: t.roles.ADMIN.registerText
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
      setError(t.errors.fillBoth);
      setLoading(false);
      return;
    }

    // 2. Strict Gmail Validation (Security Requirement)
    if (!formData.email.endsWith('@gmail.com')) {
      setError(t.errors.validGmail);
      setLoading(false);
      return;
    }

    // 3. Strict Password Validation (Capital Letter + Number)
    // This enforces the security policy on login attempts as well
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError(t.errors.passwordRequirements);
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
        setError(t.errors.invalidCredentials);
        // Clear password field on failed login attempt
        setFormData(prev => ({ ...prev, password: '' }));
      } else {
        // Fetch user details to verify role matches selected role
        const response = await fetch('/api/user/check-role');
        const data = await response.json();
        
        // Role mismatch check
        if (data.role !== selectedRole && data.role !== 'ADMIN') {
          if (selectedRole === 'ADMIN' && data.role !== 'ADMIN') {
             setError(t.errors.noAdminPrivileges);
             setLoading(false);
             return;
          }
          if (selectedRole === 'ELDER' && data.role !== 'ELDER') {
             setError(t.errors.notElder);
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
      setError(t.errors.errorOccurred);
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
          <h2 className={styles.title}>{t.welcomeBack}</h2>
          <p className={styles.subtitle}>{t.signInTo}</p>
        </div>

        {/* Role Selection Grid */}
        <div className={styles.roleSelection}>
          <p className={styles.roleLabel}>{t.selectRole}</p>
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
              <label htmlFor="email" className={styles.label}>{t.emailAddress}</label>
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
              <label htmlFor="password" className={styles.label}>{t.password}</label>
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
                <label htmlFor="remember" className={styles.checkboxLabel}>{t.rememberMe}</label>
              </div>
              <Link href="/forgot-password" className={styles.forgotLink}>
                {t.forgotPassword}
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
                  <span>{t.signingIn}</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>{t.signInAs} {currentRoleConfig?.label}</span>
                </>
              )}
            </button>
          </form>

          <div className={styles.footer}>
            {/* DYNAMIC REGISTRATION LINK BASED ON ROLE */}
            {currentRoleConfig?.registerLink ? (
              <p className={styles.footerText}>
                {t.newHere}{' '}
                <Link href={currentRoleConfig.registerLink} className={styles.registerLink}>
                  {currentRoleConfig.registerText}
                </Link>
              </p>
            ) : (
              <p className={styles.footerText}>
                {t.adminInviteOnly}
              </p>
            )}
            
            <div className={styles.guestLinkWrapper}>
               <Link href="/wisdom" className={styles.guestLink}>
                 {t.continueAsGuest}
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}