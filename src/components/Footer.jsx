'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, MapPin, Mail, Phone } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Footer.module.css';

export default function Footer() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'Umurage Wubwenge',
      description: 'Preserving traditional knowledge and wisdom for future generations.',
      quickLinks: 'Quick Links',
      categoriesTitle: 'Categories',
      contactUs: 'Contact Us',
      copyright: '© 2025 Umurage Wubwenge. All rights reserved.',
      builtWith: 'Built with',
      forPreserving: 'for preserving African cultural heritage',
      links: {
        home: 'Home',
        library: 'Wisdom Library',
        about: 'About Us',
        contact: 'Contact'
      },
      categories: [
        
        { label: 'Agriculture', id: 'AGRICULTURE' },
        
        { label: 'Proverbs', id: 'PROVERBS' },
        { label: 'Stories', id: 'STORY' },
        
       
      ]
    },
    rw: {
      title: 'Umurage Wubwenge',
      description: 'Kubungabunga ubumenyi n\'ubwenge bwa kera bw\'Afurika ku bizazi bizaza.',
      quickLinks: 'Imiyoboro Yihuse',
      categoriesTitle: 'Ibyiciro',
      contactUs: 'Twandikire',
      copyright: '© 2025 Umurage Wubwenge. Uburenganzira bwose burubahirijwe.',
      builtWith: 'Byakozwe na',
      forPreserving: 'mu kubungabunga umurage w\'umuco w\'Afurika',
      links: {
        home: 'Ahabanza',
        library: 'Isomero ry\'Ubwenge',
        about: 'Turi Bande',
        contact: 'Twandikire'
      },
      categories: [
        
        { label: 'Ubuhinzi', id: 'AGRICULTURE' },
        
        { label: 'Imigani', id: 'PROVERBS' },
        { label: 'Inkuru', id: 'STORY' },
       
        
      ]
    }
  };

  const t = translations[language];

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          {/* Brand Section */}
          <div>
            <div className={styles.footerBrand}>
              <h3 className={styles.footerTitle}>{t.title}</h3>
              <p className={styles.footerDescription}>
                {t.description}
              </p>
            </div>
            <div className={styles.footerSocial}>
              <a href="https://www.facebook.com/profile.php?id=61584750495086" className={styles.socialLink} aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://x.com/wisdomsystem20" className={styles.socialLink} aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="https://www.instagram.com/wisdom_management_system/" className={styles.socialLink} aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>{t.quickLinks}</h4>
            <div className={styles.footerLinks}>
              <Link href="/" className={styles.footerLink}>{t.links.home}</Link>
              <Link href="/about" className={styles.footerLink}>{t.links.about}</Link>
              <Link href="/contact" className={styles.footerLink}>{t.links.contact}</Link>
            </div>
          </div>

          {/* Categories - DYNAMIC LIST (One line) */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>{t.categoriesTitle}</h4>
            <div className={styles.footerLinks} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {t.categories.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/wisdom?category=${category.id}`} 
                  className={styles.footerLink}
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>{t.contactUs}</h4>
            <div className={styles.footerContact}>
              <div className={styles.contactItem}>
                <MapPin size={16} />
                <span>KG 181 st, Kigali, Rwanda</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={16} />
                <a href="mailto:wisdomsystem20@gmail.com">wisdomsystem20@gmail.com</a>
              </div>
              <div className={styles.contactItem}>
                <Phone size={16} />
                <a href="tel:+250788205421">+250 788 205421</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            {t.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}