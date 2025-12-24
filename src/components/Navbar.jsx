'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { 
  Home, BookOpen, User, Menu, X, LogOut, Settings, 
  Award, Users, Globe, MessageSquare, Video, LayoutDashboard, 
  MessagesSquare, Bookmark, HelpCircle, BrainCircuit, Mail, List, FileText
} from 'lucide-react';
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
      wisdom: 'Wisdom',
      contributors: 'Contributors',
      polls: 'Polls',
      about: 'About',
      signIn: 'Sign In',
      profile: 'Profile',
      editProfile: 'Edit Profile',
      logout: 'Logout',
      admin: 'Admin',
      elderDashboard: 'Dashboard',
      suggestions: 'Suggestions', 
      meetings: 'Live',
      forum: 'Forum',
      bookmarks: 'My Wisdom',
      requests: 'New Request',
      myRequests: 'My Requests', 
      quiz: 'Quiz',
      badges: 'Badges',
      messages: 'Messages',
      certificates: 'Certificates'
    },
    rw: {
      home: 'Ahabanza',
      wisdom: 'Ubwenge',
      contributors: 'Abafasha',
      polls: 'Amatora',
      about: 'Ibyerekeye',
      signIn: 'Injira',
      profile: 'Umwirondoro',
      editProfile: 'Hindura',
      logout: 'Sohoka',
      admin: 'Ubuyobozi',
      elderDashboard: 'Ikibuga',
      suggestions: 'Ibitekerezo', 
      meetings: 'Mbonankubone',
      forum: 'Uruganiriro',
      bookmarks: 'Ubwenge Bwanjye',
      requests: 'Gusaba',
      myRequests: 'Ubusabe Bwanjye',
      quiz: 'Ibibazo',
      badges: 'Imidari',
      messages: 'Ubutumwa',
      certificates: 'Impamyabumenyi'
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
            <span className={styles.navTitle}>Umurage</span>
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
            
            {/* ELDER LINKS */}
            {session?.user?.role === 'ELDER' && (
              <>
                <Link 
                  href="/elder/dashboard" 
                  className={`${styles.navLink} ${pathname === '/elder/dashboard' ? styles.active : ''}`}
                >
                  <LayoutDashboard size={18} />
                  {t.elderDashboard}
                </Link>
                <Link 
                  href="/elder/meetings" 
                  className={`${styles.navLink} ${pathname === '/elder/meetings' ? styles.active : ''}`}
                >
                  <Video size={18} />
                  {t.meetings}
                </Link>
              </>
            )}

            <Link 
              href="/wisdom" 
              className={`${styles.navLink} ${pathname === '/wisdom' ? styles.active : ''}`}
            >
              <BookOpen size={18} />
              {t.wisdom}
            </Link>
            
            {/* CITIZEN LINKS */}
            {session?.user?.role === 'USER' && (
              <>
                <Link 
                  href="/citizen/forum" 
                  className={`${styles.navLink} ${pathname === '/citizen/forum' ? styles.active : ''}`}
                >
                  <MessagesSquare size={18} />
                  {t.forum}
                </Link>
                <Link 
                  href="/citizen/quiz" 
                  className={`${styles.navLink} ${pathname === '/citizen/quiz' ? styles.active : ''}`}
                >
                  <BrainCircuit size={18} />
                  {t.quiz}
                </Link>
              </>
            )}

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
          </div>

          {/* User Section */}
          <div className={styles.navUser}>
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

                {profileMenuOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <p className={styles.userName}>{session.user.name}</p>
                      <p className={styles.userEmail}>{session.user.email}</p>
                      <p className={styles.userRole} style={{fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize'}}>
                        {session.user.role === 'USER' ? 'Citizen' : session.user.role.toLowerCase()}
                      </p>
                    </div>
                    
                    <div className={styles.dropdownDivider}></div>
                    
                    {session?.user?.role === 'USER' && (
                      <>
                        <Link 
                          href="/citizen/messages" 
                          className={styles.dropdownItem}
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <Mail size={16} />
                          {t.messages}
                        </Link>
                        <Link 
                          href="/citizen/bookmarks" 
                          className={styles.dropdownItem}
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <Bookmark size={16} />
                          {t.bookmarks}
                        </Link>
                        
                        {/* New Request Link */}
                        <Link 
                          href="/citizen/requests" 
                          className={styles.dropdownItem}
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <HelpCircle size={16} />
                          {t.requests}
                        </Link>

                        {/* My Requests Inbox Link */}
                        <Link 
                          href="/citizen/my-requests" 
                          className={styles.dropdownItem}
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <List size={16} />
                          {t.myRequests}
                        </Link>

                        <Link 
                          href="/citizen/certificates" 
                          className={styles.dropdownItem}
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <FileText size={16} />
                          {t.certificates}
                        </Link>

                        <Link 
                          href="/citizen/badges" 
                          className={styles.dropdownItem}
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <Award size={16} />
                          {t.badges}
                        </Link>

                        <Link 
                          href="/citizen/suggestions" 
                          className={styles.dropdownItem}
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <MessageSquare size={16} />
                          {t.suggestions}
                        </Link>
                      </>
                    )}

                    {session?.user?.role === 'ELDER' && (
                      <>
                        <Link 
                          href="/elder/messages" 
                          className={styles.dropdownItem}
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <Mail size={16} />
                          {t.messages}
                        </Link>
                        <Link 
                          href="/elder/dashboard" 
                          className={styles.dropdownItem}
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <LayoutDashboard size={16} />
                          {t.elderDashboard}
                        </Link>
                        <Link 
                          href="/elder/meetings" 
                          className={styles.dropdownItem}
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <Video size={16} />
                          {t.meetings}
                        </Link>
                        <Link 
                          href="/elder/suggestions" 
                          className={styles.dropdownItem}
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <MessageSquare size={16} />
                          {t.suggestions}
                        </Link>
                      </>
                    )}

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

            <button
              className={styles.mobileMenuButton}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <div className={styles.mobileMenuLinks}>
              <Link href="/" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                <Home size={18} /> {t.home}
              </Link>
              
              {/* Elder Mobile Links */}
              {session?.user?.role === 'ELDER' && (
                <>
                  <Link href="/elder/dashboard" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                    <LayoutDashboard size={18} /> {t.elderDashboard}
                  </Link>
                  <Link href="/elder/meetings" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                    <Video size={18} /> {t.meetings}
                  </Link>
                   <Link href="/elder/messages" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                    <Mail size={18} /> {t.messages}
                  </Link>
                  <Link href="/elder/suggestions" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                    <MessageSquare size={18} /> {t.suggestions}
                  </Link>
                </>
              )}

              <Link href="/wisdom" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                <BookOpen size={18} /> {t.wisdom}
              </Link>
              
              {/* Citizen Mobile Links */}
              {session?.user?.role === 'USER' && (
                <>
                  <Link href="/citizen/forum" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                    <MessagesSquare size={18} /> {t.forum}
                  </Link>
                  <Link href="/citizen/quiz" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                    <BrainCircuit size={18} /> {t.quiz}
                  </Link>
                  <Link href="/citizen/messages" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                    <Mail size={18} /> {t.messages}
                  </Link>
                  <Link href="/citizen/bookmarks" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                    <Bookmark size={18} /> {t.bookmarks}
                  </Link>
                  <Link href="/citizen/requests" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                    <HelpCircle size={18} /> {t.requests}
                  </Link>
                  <Link href="/citizen/my-requests" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                    <List size={18} /> {t.myRequests}
                  </Link>
                  
                  <Link href="/citizen/certificates" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                    <FileText size={18} /> {t.certificates}
                  </Link>
                  
                  {/* ADDED BADGES MOBILE LINK */}
                  <Link href="/citizen/badges" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                    <Award size={18} /> {t.badges}
                  </Link>
                  
                  <Link href="/citizen/suggestions" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                    <MessageSquare size={18} /> {t.suggestions}
                  </Link>
                </>
              )}

              <Link href="/contributors" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                <Users size={18} /> {t.contributors}
              </Link>
              <Link href="/polls" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                <Award size={18} /> {t.polls}
              </Link>
              <Link href="/about" className={styles.mobileMenuLink} onClick={() => setMobileMenuOpen(false)}>
                <User size={18} /> {t.about}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}