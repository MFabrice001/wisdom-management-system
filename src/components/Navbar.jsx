'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Home, BookOpen, User, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <Link href="/" className={styles.navLink}>
              <Home size={18} />
              Home
            </Link>
            <Link href="/wisdom" className={styles.navLink}>
              <BookOpen size={18} />
              Wisdom Library
            </Link>
            <Link href="/about" className={styles.navLink}>
              <User size={18} />
              About
            </Link>
          </div>

          {/* User Section */}
          <div className={styles.navUser}>
            {session ? (
              <div className={styles.userAvatar}>
                {session.user.name?.[0]?.toUpperCase() || 'F'}
              </div>
            ) : (
              <Link href="/login" className={styles.userButton}>
                Sign In
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
              <Link href="/" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                <Home size={18} />
                Home
              </Link>
              <Link href="/wisdom" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                <BookOpen size={18} />
                Wisdom Library
              </Link>
              <Link href="/about" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                <User size={18} />
                About
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}