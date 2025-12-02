'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, User, Menu, X, LogOut, Settings, Award, Users, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();

  const translations = {
    en: {
      home: 'Home',
      wisdom: 'Wisdom Library',
      contributors: 'Contributors',
      polls: 'Weekly Polls',
      about: 'About',
      signIn: 'Sign In',
      profile: 'Profile',
      editProfile: 'Edit Profile',
      logout: 'Logout',
      admin: 'Admin Dashboard'
    },
    rw: {
      home: 'Ahabanza',
      wisdom: 'Isomero ry\'Ubwenge',
      contributors: 'Abafasha',
      polls: 'Amatora y\'Icyumweru',
      about: 'Ibyerekeye',
      signIn: 'Injira',
      profile: 'Umwirondoro',
      editProfile: 'Hindura Umwirondoro',
      logout: 'Sohoka',
      admin: 'Ubuyobozi'
    }
  };

  const t = translations[language];

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.navContent}>
          {/* Logo */}
          <Link href="/" className={styles.navBrand}>
            <div className={styles.navLogo}>UW</div>
            <span className={styles.navTitle}>Umurage Wubwenge</span>
          </Link>

          {/* Desktop Links */}
          <div className={styles.navLinks}>
            <Link 
              href="/" 
              className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}
            >
              <Home size={18} />
              {t.home}
            </Link>
            <Link 
              href="/wisdom" 
              className={`${styles.navLink} ${pathname === '/wisdom' ? styles.active : ''}`}
            >
              <BookOpen size={18} />
              {t.wisdom}
            </Link>
            <Link 
              href="/contributors" 
              className={`${styles.navLink} ${pathname === '/contributors' ? styles.active : ''}`}
            >
              <Users size={18} />
              {t.contributors}
            </Link>
            <Link 
              href="/polls" 
              className={`${styles.navLink} ${pathname === '/polls' ? styles.active : ''}`}
            >
              <Award size={18} />
              {t.polls}
            </Link>
            <Link 
              href="/about" 
              className={`${styles.navLink} ${pathname === '/about' ? styles.active : ''}`}
            >
              <User size={18} />
              {t.about}
            </Link>
          </div>

          {/* User Section */}
          <div className={styles.navUser}>
            {/* Language Toggle */}
            <button onClick={toggleLanguage} className={styles.languageButton}>
              <Globe size={18} />
              <span>{language === 'en' ? 'EN' : 'RW'}</span>
            </button>

            {session ? (
              <div className={styles.profileDropdown}>
                <button
                  className={styles.userAvatar}
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
                  {session.user.name?.[0]?.toUpperCase() || 'U'}
                </button>

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <p className={styles.userName}>{session.user.name}</p>
                      <p className={styles.userEmail}>{session.user.email}</p>
                    </div>
                    <div className={styles.dropdownDivider}></div>
                    <Link 
                      href="/profile" 
                      className={styles.dropdownItem}
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <User size={16} />
                      {t.profile}
                    </Link>
                    <Link 
                      href="/profile/edit" 
                      className={styles.dropdownItem}
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <Settings size={16} />
                      {t.editProfile}
                    </Link>
                    {session.user.role === 'ADMIN' && (
                      <Link 
                        href="/admin" 
                        className={styles.dropdownItem}
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <Award size={16} />
                        {t.admin}
                      </Link>
                    )}
                    <div className={styles.dropdownDivider}></div>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className={`${styles.dropdownItem} ${styles.logoutButton}`}
                    >
                      <LogOut size={16} />
                      {t.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className={styles.userButton}>
                {t.signIn}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className={styles.mobileMenuButton}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <div className={styles.mobileMenuLinks}>
              <Link 
                href="/" 
                className={styles.mobileMenuLink} 
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={18} />
                {t.home}
              </Link>
              <Link 
                href="/wisdom" 
                className={styles.mobileMenuLink} 
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen size={18} />
                {t.wisdom}
              </Link>
              <Link 
                href="/contributors" 
                className={styles.mobileMenuLink} 
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users size={18} />
                {t.contributors}
              </Link>
              <Link 
                href="/polls" 
                className={styles.mobileMenuLink} 
                onClick={() => setMobileMenuOpen(false)}
              >
                <Award size={18} />
                {t.polls}
              </Link>
              <Link 
                href="/about" 
                className={styles.mobileMenuLink} 
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={18} />
                {t.about}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}