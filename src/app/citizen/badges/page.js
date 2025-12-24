'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Award, Star, Zap, Loader2, Lock, Download, BookOpen, Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './page.module.css';

export default function BadgesPage() {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ points: 0, level: 1 });

  useEffect(() => {
    if (session) {
      fetchBadges();
    }
  }, [session]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/citizen/badges');
      if (res.ok) {
        const data = await res.json();
        setBadges(data.badges);
        setUserStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (badge) => {
    const userName = session?.user?.name || 'Citizen';
    const badgeName = badge.name[language] || badge.name.en;
    
    // Create a canvas to draw the certificate
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f0fdf4'; // Light green bg
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = '#16a34a'; // Green border
    ctx.lineWidth = 20;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Title
    ctx.fillStyle = '#166534';
    ctx.font = 'bold 48px serif';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Achievement', canvas.width / 2, 100);

    // Subtitle
    ctx.fillStyle = '#15803d';
    ctx.font = '30px sans-serif';
    ctx.fillText('Presented to', canvas.width / 2, 200);

    // User Name
    ctx.fillStyle = '#000';
    ctx.font = 'bold 60px serif';
    ctx.fillText(userName, canvas.width / 2, 280);

    // Badge Info
    ctx.fillStyle = '#15803d';
    ctx.font = '30px sans-serif';
    ctx.fillText('For earning the badge:', canvas.width / 2, 380);

    ctx.fillStyle = '#d97706'; // Gold/Yellowish
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText(badgeName, canvas.width / 2, 450);

    // Date
    ctx.fillStyle = '#6b7280';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Awarded on ${new Date().toLocaleDateString()}`, canvas.width / 2, 550);

    // Convert to image and download
    const link = document.createElement('a');
    link.download = `${badgeName.replace(/\s+/g, '_')}_Certificate.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const translations = {
    en: {
      title: 'My Achievements',
      subtitle: 'Track your progress and earn badges for contributing to the community.',
      level: 'Level',
      points: 'Points',
      locked: 'Locked',
      earned: 'Earned',
      download: 'Download Certificate',
      accessDenied: 'Please log in to view your achievements.'
    },
    rw: {
      title: 'Ibyo Wagezeho',
      subtitle: 'Kurikirana iterambere ryawe kandi ubone imidari yo guteza imbere umuryango.',
      level: 'Urwego',
      points: 'Amanota',
      locked: 'Birafunze',
      earned: 'Wabibonye',
      download: 'Kurura Impamyabushobozi',
      accessDenied: 'Nyamunekainjira kugira ngo urebe ibyo wagezeho.'
    }
  };

  const t = translations[language];

  if (!session) {
    return <div className={styles.accessDenied}>{t.accessDenied}</div>;
  }

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <Loader2 className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header / Stats */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t.title}</h1>
            <p className={styles.subtitle}>{t.subtitle}</p>
          </div>
          <div className={styles.statsCard}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>{t.level}</span>
              <span className={styles.statValue}>{userStats.level}</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>{t.points}</span>
              <span className={styles.statValue}>{userStats.points}</span>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className={styles.grid}>
          {badges.map((badge) => (
            <div 
              key={badge.id} 
              className={`${styles.card} ${badge.earned ? styles.earned : styles.locked}`}
            >
              <div className={styles.iconWrapper}>
                {badge.earned ? (
                  getIcon(badge.icon)
                ) : (
                  <Lock size={32} className={styles.lockIcon} />
                )}
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.badgeName}>{badge.name[language]}</h3>
                <p className={styles.badgeDesc}>{badge.description[language]}</p>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${Math.min((badge.progress / badge.target) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className={styles.progressText}>
                  {badge.progress} / {badge.target}
                </p>
              </div>
              
              {/* Earned Status & Download */}
              {badge.earned && (
                <div className={styles.earnedActions}>
                  <div className={styles.earnedBadge}>
                    <Award size={16} /> {t.earned}
                  </div>
                  <button 
                    onClick={() => handleDownload(badge)} 
                    className={styles.downloadButton}
                    title={t.download}
                  >
                    <Download size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper to render icons
function getIcon(iconName) {
  switch (iconName) {
    case 'star': return <Star size={32} className="text-yellow-500" />;
    case 'book': return <BookOpen size={32} className="text-blue-500" />; 
    case 'zap': return <Zap size={32} className="text-purple-500" />;
    case 'shield': return <Shield size={32} className="text-green-600" />;
    default: return <Award size={32} className="text-green-500" />;
  }
}