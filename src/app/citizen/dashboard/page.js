'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Award, FileText, Mail, MessageSquare, Bookmark, 
  BrainCircuit, Users, Clock, CheckCircle, Star,
  TrendingUp, BookOpen, Gift, Heart
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './page.module.css';

export default function CitizenDashboard() {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const [stats, setStats] = useState({
    badges: 0,
    certificates: 0,
    messages: 0,
    bookmarks: 0
  });
  const [recentBadges, setRecentBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const translations = {
    en: {
      dashboard: 'Dashboard',
      welcome: 'Welcome back',
      myBadges: 'My Badges',
      myCertificates: 'My Certificates',
      myMessages: 'Messages',
      myBookmarks: 'Saved Wisdom',
      forum: 'Forum',
      quiz: 'Quiz',
      myRequests: 'My Requests',
      suggestions: 'Suggestions',
      viewAll: 'View All',
      recentBadges: 'Recent Badges',
      quickActions: 'Quick Actions',
      noBadges: 'No badges yet',
      earnBadges: 'Earn badges by participating in quizzes and contributing!'
    },
    rw: {
      dashboard: 'Ikibuga',
      welcome: 'Murakaza neza',
      myBadges: 'Imidari Yanjye',
      myCertificates: 'Impamyabumenyi',
      myMessages: 'Ubutumwa',
      myBookmarks: 'Ubwenge Bwakiriye',
      forum: 'Uruganiriro',
      quiz: 'Ibibazo',
      myRequests: 'Ubusabe Bwanjye',
      suggestions: 'Ibitekerezo',
      viewAll: 'Reba Byose',
      recentBadges: 'Imidari Yakoresherejwe',
      quickActions: 'Ibikorwa',
      noBadges: 'Nta midari',
      earnBadges: 'Fata imidari ukaba ugira uruhare mu ibibazo!'
    }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.id) return;
      
      try {
        const [badgesRes, certsRes, msgsRes, bookmarksRes] = await Promise.all([
          fetch(`/api/citizen/badges?userId=${session.user.id}`),
          fetch(`/api/citizen/certificates?userId=${session.user.id}`),
          fetch(`/api/citizen/messages?userId=${session.user.id}`),
          fetch(`/api/citizen/bookmarks?userId=${session.user.id}`)
        ]);

        const [badgesData, certsData, msgsData, bookmarksData] = await Promise.all([
          badgesRes.json(),
          certsRes.json(),
          msgsRes.json(),
          bookmarksRes.json()
        ]);

        setStats({
          badges: badgesData.badges?.length || 0,
          certificates: certsData.certificates?.length || 0,
          messages: msgsData.messages?.length || 0,
          bookmarks: bookmarksData.bookmarks?.length || 0
        });

        if (badgesData.badges && badgesData.badges.length > 0) {
          setRecentBadges(badgesData.badges.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  const menuItems = [
    { href: '/citizen/badges', icon: Award, label: t.myBadges, color: '#f59e0b', count: stats.badges },
    { href: '/citizen/certificates', icon: FileText, label: t.myCertificates, color: '#10b981', count: stats.certificates },
    { href: '/citizen/messages', icon: Mail, label: t.myMessages, color: '#3b82f6', count: stats.messages },
    { href: '/citizen/bookmarks', icon: Bookmark, label: t.myBookmarks, color: '#ec4899', count: stats.bookmarks },
    { href: '/citizen/forum', icon: MessageSquare, label: t.forum, color: '#8b5cf6' },
    { href: '/citizen/quiz', icon: BrainCircuit, label: t.quiz, color: '#06b6d4' },
    { href: '/citizen/my-requests', icon: Clock, label: t.myRequests, color: '#f97316' },
    { href: '/citizen/suggestions', icon: Star, label: t.suggestions, color: '#ef4444' }
  ];

  if (!session) {
    return (
      <div className={styles.container}>
        <div className={styles.authPrompt}>
          <h2>{language === 'en' ? 'Please sign in to view your dashboard' : 'Ugire w injure kugira ikibuga cwawe'}</h2>
          <Link href="/login" className={styles.loginButton}>
            {language === 'en' ? 'Sign In' : 'Injira'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.welcomeSection}>
          <h1>{t.welcome}, {session.user.name?.split(' ')[0]}! 👋</h1>
          <p>{language === 'en' ? 'Track your achievements and activity' : 'Rondera ibigiro na gikorwa cyawe'}</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard} style={{ borderLeftColor: '#f59e0b' }}>
          <Award size={24} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.badges}</span>
            <span className={styles.statLabel}>{t.myBadges}</span>
          </div>
        </div>
        <div className={styles.statCard} style={{ borderLeftColor: '#10b981' }}>
          <FileText size={24} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.certificates}</span>
            <span className={styles.statLabel}>{t.myCertificates}</span>
          </div>
        </div>
        <div className={styles.statCard} style={{ borderLeftColor: '#3b82f6' }}>
          <Mail size={24} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.messages}</span>
            <span className={styles.statLabel}>{t.myMessages}</span>
          </div>
        </div>
        <div className={styles.statCard} style={{ borderLeftColor: '#ec4899' }}>
          <Bookmark size={24} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.bookmarks}</span>
            <span className={styles.statLabel}>{t.myBookmarks}</span>
          </div>
        </div>
      </div>

      <div className={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <Link 
            key={index} 
            href={item.href} 
            className={styles.menuCard}
            style={{ '--accent-color': item.color }}
          >
            <div className={styles.menuIcon}>
              <item.icon size={28} />
            </div>
            <span className={styles.menuLabel}>{item.label}</span>
            {item.count !== undefined && item.count > 0 && (
              <span className={styles.menuBadge}>{item.count}</span>
            )}
          </Link>
        ))}
      </div>

      {recentBadges.length > 0 && (
        <div className={styles.recentSection}>
          <div className={styles.sectionHeader}>
            <h2>{t.recentBadges}</h2>
            <Link href="/citizen/badges" className={styles.viewAllLink}>
              {t.viewAll} →
            </Link>
          </div>
          <div className={styles.badgesList}>
            {recentBadges.map((badge) => (
              <div key={badge.id} className={styles.badgeItem}>
                <div className={styles.badgeIcon}>
                  <Award size={20} />
                </div>
                <div className={styles.badgeInfo}>
                  <span className={styles.badgeName}>{badge.name}</span>
                  <span className={styles.badgeDate}>
                    {new Date(badge.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
