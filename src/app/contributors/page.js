'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Users, Award, BookOpen, Heart, TrendingUp, Search, Filter } from 'lucide-react';
import styles from './page.module.css';

export default function ContributorsPage() {
  const { language } = useLanguage();
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('wisdom'); // wisdom, likes, recent

  const translations = {
    en: {
      title: 'Our Contributors',
      subtitle: 'Honoring those who preserve and share wisdom',
      searchPlaceholder: 'Search contributors...',
      sortBy: 'Sort by',
      sortOptions: {
        wisdom: 'Most Wisdom',
        likes: 'Most Liked',
        recent: 'Most Recent'
      },
      stats: {
        wisdom: 'Wisdom Shared',
        likes: 'Total Likes',
        comments: 'Comments'
      },
      noContributors: 'No contributors found',
      loading: 'Loading contributors...',
      elder: 'Elder',
      member: 'Member',
      topContributors: 'Top Contributors',
      allContributors: 'All Contributors'
    },
    rw: {
      title: 'Abafasha Bacu',
      subtitle: 'Guha agaciro abagize uruhare mu kubungabunga no gusangira ubwenge',
      searchPlaceholder: 'Shakisha abafasha...',
      sortBy: 'Shiraho',
      sortOptions: {
        wisdom: 'Ubwenge Bwinshi',
        likes: 'Byakunzwe Cyane',
        recent: 'Ibishya'
      },
      stats: {
        wisdom: 'Ubwenge Bwasangiwe',
        likes: 'Umubare w\'Abakunze',
        comments: 'Ibisobanuro'
      },
      noContributors: 'Nta bafasha babonetse',
      loading: 'Gupakurura abafasha...',
      elder: 'Umusaza',
      member: 'Umunyamuryango',
      topContributors: 'Abafasha Bakomeye',
      allContributors: 'Abafasha Bose'
    }
  };

  const t = translations[language];

  useEffect(() => {
    fetchContributors();
  }, []);

  const fetchContributors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contributors');
      if (response.ok) {
        const data = await response.json();
        setContributors(data.contributors || []);
      }
    } catch (error) {
      console.error('Error fetching contributors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedContributors = contributors
    .filter(contributor => 
      contributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contributor.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'wisdom') {
        return (b._count?.wisdoms || 0) - (a._count?.wisdoms || 0);
      } else if (sortBy === 'likes') {
        return (b.totalLikes || 0) - (a.totalLikes || 0);
      } else {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const topContributors = filteredAndSortedContributors.slice(0, 3);
  const otherContributors = filteredAndSortedContributors.slice(3);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <Users className={styles.heroIcon} size={64} />
            <h1 className={styles.title}>{t.title}</h1>
            <p className={styles.subtitle}>{t.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className={styles.filtersSection}>
        <div className={styles.container}>
          <div className={styles.filtersCard}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={20} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.sortWrapper}>
              <Filter size={16} />
              <label className={styles.sortLabel}>{t.sortBy}:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="wisdom">{t.sortOptions.wisdom}</option>
                <option value="likes">{t.sortOptions.likes}</option>
                <option value="recent">{t.sortOptions.recent}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>{t.loading}</p>
        </div>
      )}

      {/* Top Contributors */}
      {!loading && topContributors.length > 0 && (
        <section className={styles.topSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>
              <Award size={28} />
              {t.topContributors}
            </h2>
            <div className={styles.topGrid}>
              {topContributors.map((contributor, index) => (
                <ContributorCard
                  key={contributor.id}
                  contributor={contributor}
                  rank={index + 1}
                  isTop={true}
                  t={t}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Contributors */}
      {!loading && otherContributors.length > 0 && (
        <section className={styles.allSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>
              <Users size={28} />
              {t.allContributors}
            </h2>
            <div className={styles.contributorsGrid}>
              {otherContributors.map((contributor) => (
                <ContributorCard
                  key={contributor.id}
                  contributor={contributor}
                  isTop={false}
                  t={t}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && filteredAndSortedContributors.length === 0 && (
        <div className={styles.empty}>
          <Users size={64} className={styles.emptyIcon} />
          <p className={styles.emptyText}>{t.noContributors}</p>
        </div>
      )}
    </div>
  );
}

// Contributor Card Component
function ContributorCard({ contributor, rank, isTop, t }) {
  const getRankColor = (rank) => {
    if (rank === 1) return 'linear-gradient(135deg, #fbbf24, #f59e0b)'; // Gold
    if (rank === 2) return 'linear-gradient(135deg, #d1d5db, #9ca3af)'; // Silver
    if (rank === 3) return 'linear-gradient(135deg, #fed7aa, #fdba74)'; // Bronze
    return 'linear-gradient(135deg, #22c55e, #16a34a)';
  };

  return (
    <div className={`${styles.card} ${isTop ? styles.topCard : ''}`}>
      {isTop && rank && (
        <div className={styles.rankBadge} style={{ background: getRankColor(rank) }}>
          #{rank}
        </div>
      )}
      
      <div className={styles.cardHeader}>
        <div 
          className={styles.avatar}
          style={{ background: getRankColor(rank) }}
        >
          {contributor.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className={styles.cardInfo}>
          <h3 className={styles.cardName}>{contributor.name}</h3>
          <p className={styles.cardEmail}>{contributor.email}</p>
          {contributor.role === 'ELDER' && (
            <span className={styles.elderBadge}>
              <Award size={14} />
              {t.elder}
            </span>
          )}
        </div>
      </div>

      <div className={styles.cardStats}>
        <div className={styles.statItem}>
          <BookOpen size={18} />
          <div>
            <p className={styles.statNumber}>{contributor._count?.wisdoms || 0}</p>
            <p className={styles.statLabel}>{t.stats.wisdom}</p>
          </div>
        </div>
        <div className={styles.statItem}>
          <Heart size={18} />
          <div>
            <p className={styles.statNumber}>{contributor.totalLikes || 0}</p>
            <p className={styles.statLabel}>{t.stats.likes}</p>
          </div>
        </div>
        <div className={styles.statItem}>
          <TrendingUp size={18} />
          <div>
            <p className={styles.statNumber}>{contributor._count?.comments || 0}</p>
            <p className={styles.statLabel}>{t.stats.comments}</p>
          </div>
        </div>
      </div>
    </div>
  );
}