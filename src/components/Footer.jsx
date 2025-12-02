import Link from 'next/link';
import { Facebook, Twitter, Instagram, MapPin, Mail, Phone } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          {/* Brand Section */}
          <div>
            <div className={styles.footerBrand}>
              <h3 className={styles.footerTitle}>Umurage Wubwenge</h3>
              <p className={styles.footerDescription}>
                Preserving traditional African knowledge and wisdom for future generations.
              </p>
            </div>
            <div className={styles.footerSocial}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>Quick Links</h4>
            <div className={styles.footerLinks}>
              <Link href="/" className={styles.footerLink}>Home</Link>
              <Link href="/wisdom" className={styles.footerLink}>Wisdom Library</Link>
              <Link href="/about" className={styles.footerLink}>About Us</Link>
              <Link href="/contact" className={styles.footerLink}>Contact</Link>
            </div>
          </div>

          {/* Categories */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>Categories</h4>
            <div className={styles.footerLinks}>
              <Link href="/wisdom?category=proverbs" className={styles.footerLink}>Proverbs</Link>
              <Link href="/wisdom?category=stories" className={styles.footerLink}>Stories</Link>
              <Link href="/wisdom?category=marriage-guidance" className={styles.footerLink}>Marriage Guidance</Link>
              <Link href="/wisdom?category=agriculture" className={styles.footerLink}>Agriculture</Link>
            </div>
          </div>

          {/* Contact */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>Contact Us</h4>
            <div className={styles.footerContact}>
              <div className={styles.contactItem}>
                <MapPin size={16} />
                <span>Kigali, Rwanda</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={16} />
                <a href="mailto:info@umurage.rw">info@umurage.rw</a>
              </div>
              <div className={styles.contactItem}>
                <Phone size={16} />
                <a href="tel:+250788123456">+250 788 123 456</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            © 2025 Umurage Wubwenge. All rights reserved.
          </p>
          <p className={styles.copyright}>
            Built with <span className={styles.footerHeart}>❤️</span> for preserving African cultural heritage
          </p>
        </div>
      </div>
    </footer>
  );
}