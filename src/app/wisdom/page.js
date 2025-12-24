'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, Plus, BookOpen, Heart, MessageCircle, Eye, Loader2, Share2, FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import ShareModal from '@/components/ShareModal';
import styles from './page.module.css';

// Wrapper for Suspense
export default function WisdomLibraryPageWrapper() {
  return (
    <Suspense fallback={<div className={styles.loading}><Loader2 className={styles.spinner} /></div>}>
      <WisdomLibraryPageContent />
    </Suspense>
  );
}

function WisdomLibraryPageContent() {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [wisdoms, setWisdoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareWisdom, setShareWisdom] = useState(null);

  const initialCategory = searchParams.get('category') || 'ALL';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const translations = {
    en: {
      title: 'Wisdom Library',
      subtitle: 'Explore traditional knowledge and cultural wisdom',
      addWisdom: 'Add Wisdom',
      searchPlaceholder: 'Search wisdom by title or content...',
      category: 'Category',
      allCategories: 'All Categories',
      language: 'Language',
      allLanguages: 'All Languages',
      showing: 'Showing',
      results: 'results',
      noWisdom: 'No wisdom found',
      tryAdjusting: 'Try adjusting your filters or search term',
      beFirst: 'Be the first to share wisdom with the community'
    },
    rw: {
      title: 'Isomero ry\'Ubwenge',
      subtitle: 'Shakisha ubumenyi gakondo n\'ubwenge bw\'umuco',
      addWisdom: 'Tanga Ubwenge',
      searchPlaceholder: 'Shakisha ubwenge...',
      category: 'Icyiciro',
      allCategories: 'Ibyiciro Byose',
      language: 'Ururimi',
      allLanguages: 'Indimi Zose',
      showing: 'Ibigaragara',
      results: 'ibisubizo',
      noWisdom: 'Nta bwenge bwabonetse',
      tryAdjusting: 'Gerageza guhindura ibyo ushakisha',
      beFirst: 'Ba uwa mbere mu gusangiza ubwenge umuryango'
    }
  };

  const t = translations[language];

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

  const openShareModal = (e, wisdom) => {
    e.preventDefault(); 
    e.stopPropagation();
    setShareWisdom(wisdom);
    setIsShareModalOpen(true);
  };

  const isElderOrAdmin = session?.user?.role === 'ELDER' || session?.user?.role === 'ADMIN';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>{t.title}</h1>
              <p className={styles.subtitle}>{t.subtitle}</p>
            </div>
            {/* Only Elders and Admins can add wisdom */}
            {isElderOrAdmin && (
              <Link href="/wisdom/add" className={styles.addButton}>
                <Plus size={20} />
                <span>{t.addWisdom}</span>
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
                  placeholder={t.searchPlaceholder}
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
                {t.category}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    const newParams = new URLSearchParams(searchParams);
                    if (e.target.value === 'ALL') newParams.delete('category');
                    else newParams.set('category', e.target.value);
                    router.push(`/wisdom?${newParams.toString()}`, { scroll: false });
                }}
                className={styles.select}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'ALL' ? t.allCategories : formatCategory(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>{t.language}</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={styles.select}
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang === 'ALL' ? t.allLanguages : lang.charAt(0) + lang.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className={styles.resultsCount}>
              <p>
                {t.showing} <span className={styles.countBold}>{filteredWisdoms.length}</span> {t.results}
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
              <WisdomCard 
                key={wisdom.id} 
                wisdom={wisdom} 
                onShare={(e) => openShareModal(e, wisdom)} 
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredWisdoms.length === 0 && (
          <div className={styles.emptyState}>
            <BookOpen className={styles.emptyIcon} size={64} />
            <h3 className={styles.emptyTitle}>{t.noWisdom}</h3>
            <p className={styles.emptyDescription}>
              {searchTerm || selectedCategory !== 'ALL' || selectedLanguage !== 'ALL'
                ? t.tryAdjusting
                : t.beFirst}
            </p>
            {/* Show Add Wisdom button in empty state only for Elders/Admins */}
            {isElderOrAdmin && (
              <Link href="/wisdom/add" className={styles.emptyButton}>
                <Plus size={20} />
                <span>{t.addWisdom}</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareWisdom && (
        <ShareModal 
          isOpen={isShareModalOpen} 
          onClose={() => setIsShareModalOpen(false)} 
          title={shareWisdom.title} 
          url={`${typeof window !== 'undefined' ? window.location.origin : ''}/wisdom/${shareWisdom.id}`} 
        />
      )}
    </div>
  );
}

// Wisdom Card Component
function WisdomCard({ wisdom, onShare }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [likes, setLikes] = useState(wisdom._count?.likes || 0);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!session) {
      router.push('/login');
      return;
    }

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikes(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      const response = await fetch(`/api/wisdom/${wisdom.id}/like`, {
        method: 'POST',
      });
      if (!response.ok) {
        setIsLiked(!newLikedState);
        setLikes(prev => !newLikedState ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error liking wisdom:', error);
    }
  };

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

      {/* Document Link */}
      {wisdom.documentUrl && (
        <div className={styles.cardDocument}>
          <FileText size={16} />
          <span>Document attached</span>
        </div>
      )}

      {/* Tags */}
      {wisdom.tags && wisdom.tags.length > 0 && (
        <div className={styles.cardTags}>
          {wisdom.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className={styles.tag}>#{tag}</span>
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
          
          {/* Interactive Like Button */}
          <button 
            className={`${styles.statButton} ${isLiked ? styles.liked : ''}`}
            onClick={handleLike}
            title="Like"
          >
            <Heart size={16} className={isLiked ? styles.filledHeart : ''} />
            <span>{likes}</span>
          </button>

          {/* Comment Count */}
          <div className={styles.statItem} title="Comments">
            <MessageCircle size={16} />
            <span>{wisdom._count?.comments || 0}</span>
          </div>
        </div>
        
        <div className={styles.cardActions}>
            <p className={styles.cardDate}>
            {formatDate(wisdom.createdAt)}
            </p>

            {/* Share Button on Card */}
            <button 
                className={styles.iconButton}
                onClick={onShare}
                title="Share"
            >
                <Share2 size={16} />
            </button>
        </div>
      </div>
    </Link>
  );
}