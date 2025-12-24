'use client';

import { useState } from 'react';
import { X, Link as LinkIcon, Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import styles from './ShareModal.module.css';

export default function ShareModal({ isOpen, onClose, title, url }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={24} />,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: '#25D366'
    },
    {
      name: 'Facebook',
      icon: <Facebook size={24} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: '#1877F2'
    },
    {
      name: 'Twitter',
      icon: <Twitter size={24} />,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: '#1DA1F2'
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin size={24} />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: '#0A66C2'
    }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Share Wisdom</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.grid}>
          {shareLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.shareOption}
              style={{ color: link.color }}
            >
              <div className={styles.iconWrapper} style={{ borderColor: link.color }}>
                {link.icon}
              </div>
              <span className={styles.shareName}>{link.name}</span>
            </a>
          ))}
        </div>

        <div className={styles.copySection}>
          <div className={styles.urlDisplay}>{url}</div>
          <button 
            onClick={handleCopy} 
            className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
          >
            {copied ? 'Copied!' : <><LinkIcon size={16} /> Copy Link</>}
          </button>
        </div>
      </div>
    </div>
  );
}