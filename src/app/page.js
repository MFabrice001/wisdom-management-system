'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Library, Users, Globe2, Heart, TrendingUp, Award, Sparkles, ArrowRight, Shield, Zap, Star, BookOpen } from 'lucide-react';
import PollWidget from '@/components/PollWidget';
import { useLanguage } from '@/context/LanguageContext';
import styles from './page.module.css';

export default function Home() {
  const { language } = useLanguage();
  const { data: session } = useSession(); // Hook to check if user is logged in

  // State to hold the actual numbers from the database
  const [stats, setStats] = useState({
    wisdomCount: 0,
    userCount: 0,
    elderCount: 0
  });

  // Fetch real stats when page loads
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats/public');
        if (response.ok) {
          const data = await response.json();
          // FORCE WISDOM COUNT TO 2 AS REQUESTED
          // Original: wisdomCount: data.wisdomCount || 0,
          setStats({
            wisdomCount: 2, // Hardcoded to 2+ as requested
            userCount: data.userCount || 0,
            elderCount: data.elderCount || 0
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const translations = {
    en: {
      badge: 'Preserving Our Heritage',
      title1: 'Umurage',
      title2: 'Wubwenge',
      subtitle: 'Community Wisdom Management System',
      description: 'Preserving traditional African knowledge and wisdom for future generations. Connect with elders, share stories, and keep our cultural heritage alive.',
      exploreBtn: 'Explore Wisdom',
      joinBtn: 'Join Community',
      stats: {
        wisdom: 'Wisdom Entries',
        members: 'Members',
        elders: 'Elders'
      },
      pollTitle: 'Community Poll',
      pollSubtitle: 'Share your voice',
      features: {
        badge: 'Platform Features',
        title: 'Why Umurage Wubwenge?',
        subtitle: 'A digital platform bridging generations and preserving cultural wisdom',
        items: [
          {
            title: 'Digital Wisdom Library',
            description: 'Access thousands of traditional stories, proverbs, and advice from community elders'
          },
          {
            title: 'Community Engagement',
            description: 'Connect generations through shared cultural knowledge and experiences'
          },
          {
            title: 'Multilingual Support',
            description: 'Content available in Kinyarwanda, English, and French'
          },
          {
            title: 'Preserve Culture',
            description: 'Help preserve African traditional knowledge for future generations'
          },
          {
            title: 'Interactive Learning',
            description: 'Engage with content through comments, likes, and bookmarks'
          },
          {
            title: 'Elder Recognition',
            description: 'Honor and celebrate knowledge keepers in our communities'
          }
        ]
      },
      categories: {
        badge: 'Knowledge Categories',
        title: 'Explore by Category',
        subtitle: 'Discover wisdom across different aspects of traditional life',
        items: [
          { label: 'Marriage Guidance', id: 'MARRIAGE_GUIDANCE' },
          { label: 'Agriculture', id: 'AGRICULTURE' },
          { label: 'Conflict Resolution', id: 'CONFLICT_RESOLUTION' },
          { label: 'Health & Wellness', id: 'HEALTH_WELLNESS' },
          { label: 'Moral Conduct', id: 'MORAL_CONDUCT' },
          { label: 'Traditional Ceremonies', id: 'TRADITIONAL_CEREMONIES' },
          { label: 'Proverbs', id: 'PROVERBS' },
          { label: 'Stories', id: 'STORY' },
          { label: 'Life Lessons', id: 'LIFE_LESSONS' },
          { label: 'Community Values', id: 'COMMUNITY_VALUES' }
        ]
      },
      cta: {
        badge: 'Join the Movement',
        title: 'Join Our Community Today',
        description: 'Be part of preserving and sharing traditional wisdom. Start exploring, contributing, and connecting with your cultural heritage.',
        createBtn: 'Create Account',
        signInBtn: 'Sign In'
      },
      community: {
        badge: 'Community Impact',
        title: 'Trusted by Communities',
        stats: [
          {
            title: 'Wisdom Entries',
            description: 'Stories, proverbs, and advice preserved for generations'
          },
          {
            title: 'Community Members',
            description: 'Active users sharing and learning together'
          },
          {
            title: 'Elder Contributors',
            description: 'Knowledge keepers honored and recognized'
          }
        ]
      }
    },
    rw: {
      badge: 'Kubungabunga Umurage Wacu',
      title1: 'Umurage',
      title2: 'w\'Ubwenge',
      subtitle: 'Sisitemu yo Gucunga Ubwenge bw\'Abaturage',
      description: 'Kubungabunga ubumenyi n\'ubwenge bwa kera bw\'Afurika ku bizazi bizaza. Guhuza n\'abasaza, gusangira inkuru, no kubungabunga umurage wacu w\'umuco.',
      exploreBtn: 'Shakisha Ubwenge',
      joinBtn: 'Kwinjira mu Muryango',
      stats: {
        wisdom: 'Ubwenge Bwanditse',
        members: 'Abanyamuryango',
        elders: 'Abasaza'
      },
      pollTitle: 'Amatora y\'Abaturage',
      pollSubtitle: 'Tanga igitekerezo cyawe',
      features: {
        badge: 'Ibiranga Urubuga',
        title: 'Kuki Umurage Wubwenge?',
        subtitle: 'Urubuga rwa digitale ruhuza ibisekuru n\'ibizazi kandi rugabungabunga ubwenge bw\'umuco',
        items: [
          {
            title: 'Isomero ry\'Ubwenge',
            description: 'Gera ku nkuru z\'umuco, imigani n\'inama ziva ku basaza b\'umuryango'
          },
          {
            title: 'Kwitabira Abaturage',
            description: 'Guhuza ibisekuru n\'abana hakoreshejwe ubumenyi bw\'umuco'
          },
          {
            title: 'Indimi Nyinshi',
            description: 'Ibirimo byanditse mu Kinyarwanda, Icyongereza n\'Igifaransa'
          },
          {
            title: 'Kubungabunga Umuco',
            description: 'Gufasha kubungabunga ubumenyi bw\'umuco bw\'Afurika ku bizazi bizaza'
          },
          {
            title: 'Kwiga Hamwe',
            description: 'Gufatanya hakoreshejwe ibisobanuro, gukunda no kubika'
          },
          {
            title: 'Gushimira Abasaza',
            description: 'Guha agaciro no gushimira abagizi b\'ubumenyi mu miryango yacu'
          }
        ]
      },
      categories: {
        badge: 'Ibyiciro by\'Ubumenyi',
        title: 'Shakisha ku Cyiciro',
        subtitle: 'Menya ubwenge ku bice bitandukanye by\'ubuzima bwa kera',
        items: [
          { label: 'Ubufasha mu Bukwe', id: 'MARRIAGE_GUIDANCE' },
          { label: 'Ubuhinzi', id: 'AGRICULTURE' },
          { label: 'Gukemura Amakimbirane', id: 'CONFLICT_RESOLUTION' },
          { label: 'Ubuzima n\'Isuku', id: 'HEALTH_WELLNESS' },
          { label: 'Imyifatire Myiza', id: 'MORAL_CONDUCT' },
          { label: 'Imihango y\'Umuco', id: 'TRADITIONAL_CEREMONIES' },
          { label: 'Imigani', id: 'PROVERB' },
          { label: 'Inkuru', id: 'STORY' },
          { label: 'Amasomo y\'Ubuzima', id: 'LIFE_LESSONS' },
          { label: 'Indangagaciro z\'Umuryango', id: 'COMMUNITY_VALUES' }
        ]
      },
      cta: {
        badge: 'Injira muri Iri shyirahamwe',
        title: 'Injira mu Muryango Uyu Munsi',
        description: 'Kwitabira kubungabunga no gusangira ubwenge bwa kera. Tangira gushakisha, gutanga umusanzu, no guhuza n\'umurage wawe w\'umuco.',
        createBtn: 'Fungura Konti',
        signInBtn: 'Injira'
      },
      community: {
        badge: 'Ingaruka ku Muryango',
        title: 'Byizerwaho n\'Imitwaro',
        stats: [
          {
            title: 'Ubwenge Bwanditse',
            description: 'Inkuru, imigani n\'inama bibungabungwa ku bizazi'
          },
          {
            title: 'Abanyamuryango',
            description: 'Abakoresha bakora hamwe kandi biga hamwe'
          },
          {
            title: 'Abasaza Bafasha',
            description: 'Abagizi b\'ubumenyi bashimiwe kandi baheshejwe agaciro'
          }
        ]
      }
    }
  };

  const t = translations[language];

  const featureColors = [
    'linear-gradient(135deg, #22c55e, #16a34a)',
    'linear-gradient(135deg, #3b82f6, #2563eb)',
    'linear-gradient(135deg, #a855f7, #9333ea)',
    'linear-gradient(135deg, #ef4444, #dc2626)',
    'linear-gradient(135deg, #eab308, #ca8a04)',
    'linear-gradient(135deg, #6366f1, #4f46e5)'
  ];

  const featureIcons = [Library, Users, Globe2, Heart, Zap, Star];
  
  // Updated category icons with modern emojis
  const categoryIcons = ['💍', '🌱', '🤝', '🏥', '⚖️', '🎭', '💬', '📚', '💡', '🏘️'];

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroGrid}>
            {/* Left Content */}
            <div className={styles.heroContent}>
              <div className={styles.badge}>
                <Sparkles size={16} />
                {t.badge}
              </div>
              <h1 className={styles.heroTitle}>
                {t.title1}
                <span className={styles.heroTitleGreen}>{t.title2}</span>
              </h1>
              <p className={styles.heroSubtitle}>
                {t.subtitle}
              </p>
              <p className={styles.heroDescription}>
                {t.description}
              </p>
              <div className={styles.buttonGroup}>
                <Link href="/wisdom" className={styles.buttonPrimary}>
                  {t.exploreBtn}
                  <ArrowRight size={20} />
                </Link>
                {/* CONDITIONAL: Join Button hidden if logged in */}
                {!session && (
                  <Link href="/register" className={styles.buttonSecondary}>
                    {t.joinBtn}
                  </Link>
                )}
              </div>

              {/* Quick Stats - Using Dynamic Numbers */}
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <p className={styles.statNumber}>{stats.wisdomCount}+</p>
                  <p className={styles.statLabel}>{t.stats.wisdom}</p>
                </div>
                <div className={styles.statItem}>
                  <p className={styles.statNumber} style={{color: '#3b82f6'}}>{stats.userCount}+</p>
                  <p className={styles.statLabel}>{t.stats.members}</p>
                </div>
                <div className={styles.statItem}>
                  <p className={styles.statNumber} style={{color: '#a855f7'}}>{stats.elderCount}+</p>
                  <p className={styles.statLabel}>{t.stats.elders}</p>
                </div>
              </div>
            </div>

            {/* Right Content - Poll Widget */}
            <div className={styles.pollWidget}>
              <div className={styles.pollHeader}>
                <div className={styles.pollIcon}>
                  <Award size={24} />
                </div>
                <div>
                  <h3 className={styles.pollTitle}>{t.pollTitle}</h3>
                  <p className={styles.pollSubtitle}>{t.pollSubtitle}</p>
                </div>
              </div>
              <PollWidget />
            </div>
          </div>
        </div>

        {/* Animated Background */}
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.heroContainer}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>
              <Sparkles size={16} />
              {t.features.badge}
            </div>
            <h2 className={styles.sectionTitle}>
              {t.features.title}
            </h2>
            <p className={styles.sectionDescription}>
              {t.features.subtitle}
            </p>
          </div>

          <div className={styles.featureGrid}>
            {t.features.items.map((feature, index) => {
              const Icon = featureIcons[index];
              return (
                <div key={index} className={styles.featureCard}>
                  <div className={styles.featureIcon} style={{background: featureColors[index]}}>
                    <Icon size={28} color="white" />
                  </div>
                  <h3 className={styles.featureTitle}>
                    {feature.title}
                  </h3>
                  <p className={styles.featureDescription}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section - UPDATED Links to use ID filter */}
      <section className={styles.categoriesSection}>
        <div className={styles.heroContainer}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge} style={{background: '#e9d5ff', color: '#6b21a8'}}>
              <BookOpen size={16} />
              {t.categories.badge}
            </div>
            <h2 className={styles.sectionTitle}>
              {t.categories.title}
            </h2>
            <p className={styles.sectionDescription}>
              {t.categories.subtitle}
            </p>
          </div>

          <div className={styles.categoryGrid}>
            {t.categories.items.map((category, index) => (
              <Link
                key={index}
                href={`/wisdom?category=${category.id}`} // Filter link
                className={styles.categoryCard}
              >
                <div className={styles.categoryIcon}>
                  {categoryIcons[index]}
                </div>
                <p className={styles.categoryName}>{category.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - COMPLETELY HIDDEN IF LOGGED IN */}
      {!session && (
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <div className={styles.badge} style={{background: 'rgba(255,255,255,0.2)', color: 'white'}}>
              <Users size={16} />
              {t.cta.badge}
            </div>
            <h2 className={styles.ctaTitle}>
              {t.cta.title}
            </h2>
            <p className={styles.ctaDescription}>
              {t.cta.description}
            </p>
            <div className={styles.buttonGroup}>
              <Link href="/register" className={`${styles.buttonPrimary} ${styles.buttonWhite}`}>
                {t.cta.createBtn}
                <ArrowRight size={20} />
              </Link>
              <Link href="/login" className={`${styles.buttonPrimary} ${styles.buttonGreen}`}>
                {t.cta.signInBtn}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Community Section - Dynamic Stats */}
      <section className={styles.communitySection}>
        <div className={styles.heroContainer}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge} style={{background: '#e0e7ff', color: '#3730a3'}}>
              <Heart size={16} />
              {t.community.badge}
            </div>
            <h2 className={styles.sectionTitle}>
              {t.community.title}
            </h2>
          </div>

          <div className={styles.communityGrid}>
            <div className={styles.communityCard}>
              <div className={styles.communityNumber}>{stats.wisdomCount}+</div>
              <p className={styles.communityTitle}>{t.stats.wisdom}</p>
              <p className={styles.communityDescription}>{t.community.stats[0].description}</p>
            </div>
            
            <div 
              className={styles.communityCard} 
              style={{background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', borderColor: '#93c5fd'}}
            >
              <div className={styles.communityNumber} style={{color: '#2563eb'}}>{stats.userCount}+</div>
              <p className={styles.communityTitle}>{t.stats.members}</p>
              <p className={styles.communityDescription}>{t.community.stats[1].description}</p>
            </div>

            <div 
              className={styles.communityCard} 
              style={{background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)', borderColor: '#d8b4fe'}}
            >
              <div className={styles.communityNumber} style={{color: '#9333ea'}}>{stats.elderCount}+</div>
              <p className={styles.communityTitle}>{t.stats.elders}</p>
              <p className={styles.communityDescription}>{t.community.stats[2].description}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}