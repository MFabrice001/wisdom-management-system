'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, Plus, BookOpen, Heart, MessageCircle, Eye, Loader2 } from 'lucide-react';
import styles from './page.module.css';

export default function WisdomLibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wisdoms, setWisdoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');

  const categories = [
    'ALL',
    'MARRIAGE_GUIDANCE',
    'AGRICULTURE',
    'CONFLICT_RESOLUTION',
    'HEALTH_WELLNESS',
    'MORAL_CONDUCT',
    'TRADITIONAL_CEREMONIES',
    'PROVERBS',
    'STORIES',
    'LIFE_LESSONS',
    'COMMUNITY_VALUES'
  ];

  const languages = ['ALL', 'KINYARWANDA', 'ENGLISH', 'FRENCH'];

  useEffect(() => {
    fetchWisdoms();
  }, [selectedCategory, selectedLanguage]);

  const fetchWisdoms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (selectedLanguage !== 'ALL') params.append('language', selectedLanguage);

      const response = await fetch(`/api/wisdom?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setWisdoms(data.wisdoms || data || []);
      }
    } catch (error) {
      console.error('Error fetching wisdom:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWisdoms = wisdoms.filter(wisdom =>
    wisdom.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wisdom.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCategory = (category) => {
    return category.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>Wisdom Library</h1>
              <p className={styles.subtitle}>Explore traditional knowledge and cultural wisdom</p>
            </div>
            {session && (
              <Link href="/wisdom/add" className={styles.addButton}>
                <Plus size={20} />
                <span>Add Wisdom</span>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersCard}>
          <div className={styles.filterGrid}>
            {/* Search */}
            <div className={styles.searchWrapper}>
              <div className={styles.searchBox}>
                <Search className={styles.searchIcon} size={20} />
                <input
                  type="text"
                  placeholder="Search wisdom by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>
                <Filter size={16} />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.select}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'ALL' ? 'All Categories' : formatCategory(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={styles.select}
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang === 'ALL' ? 'All Languages' : lang.charAt(0) + lang.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className={styles.resultsCount}>
              <p>
                Showing <span className={styles.countBold}>{filteredWisdoms.length}</span> results
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
          </div>
        )}

        {/* Wisdom Grid */}
        {!loading && filteredWisdoms.length > 0 && (
          <div className={styles.wisdomGrid}>
            {filteredWisdoms.map((wisdom) => (
              <WisdomCard key={wisdom.id} wisdom={wisdom} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredWisdoms.length === 0 && (
          <div className={styles.emptyState}>
            <BookOpen className={styles.emptyIcon} size={64} />
            <h3 className={styles.emptyTitle}>No wisdom found</h3>
            <p className={styles.emptyDescription}>
              {searchTerm || selectedCategory !== 'ALL' || selectedLanguage !== 'ALL'
                ? 'Try adjusting your filters or search term'
                : 'Be the first to share wisdom with the community'}
            </p>
            {session && (
              <Link href="/wisdom/add" className={styles.emptyButton}>
                <Plus size={20} />
                <span>Add Wisdom</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Wisdom Card Component
function WisdomCard({ wisdom }) {
  const formatCategory = (category) => {
    return category.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link href={`/wisdom/${wisdom.id}`} className={styles.wisdomCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <span className={styles.categoryBadge}>
          {formatCategory(wisdom.category)}
        </span>
        <span className={styles.languageBadge}>
          {wisdom.language}
        </span>
      </div>

      {/* Title */}
      <h3 className={styles.cardTitle}>{wisdom.title}</h3>

      {/* Content Preview */}
      <p className={styles.cardContent}>{wisdom.content}</p>

      {/* Tags */}
      {wisdom.tags && wisdom.tags.length > 0 && (
        <div className={styles.cardTags}>
          {wisdom.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className={styles.tag}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className={styles.cardFooter}>
        <div className={styles.cardStats}>
          <div className={styles.statItem}>
            <Eye size={16} />
            <span>{wisdom.views || 0}</span>
          </div>
          <div className={styles.statItem}>
            <Heart size={16} />
            <span>{wisdom._count?.likes || 0}</span>
          </div>
          <div className={styles.statItem}>
            <MessageCircle size={16} />
            <span>{wisdom._count?.comments || 0}</span>
          </div>
        </div>
        <p className={styles.cardDate}>
          {formatDate(wisdom.createdAt)}
        </p>
      </div>
    </Link>
  );
}