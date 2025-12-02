'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Search, Trash2, Eye, Heart, MessageCircle, Loader2, User } from 'lucide-react';
import styles from './page.module.css';

export default function AdminWisdomsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wisdoms, setWisdoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else {
      fetchWisdoms();
    }
  }, [status, session, router]);

  const fetchWisdoms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/wisdoms');
      if (response.ok) {
        const data = await response.json();
        setWisdoms(data.wisdoms || []);
      }
    } catch (error) {
      console.error('Error fetching wisdoms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (wisdomId) => {
    if (!confirm('Are you sure you want to delete this wisdom entry? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/wisdoms/${wisdomId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchWisdoms();
      }
    } catch (error) {
      console.error('Error deleting wisdom:', error);
    }
  };

  const filteredWisdoms = wisdoms.filter(wisdom =>
    wisdom.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wisdom.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={48} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerTop}>
          <Link href="/admin" className={styles.backButton}>
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <BookOpen size={32} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Manage Wisdom
            </h1>
            <p className={styles.subtitle}>Review and moderate wisdom entries ({wisdoms.length} total)</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search wisdom by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Wisdom List */}
        <div className={styles.wisdomsList}>
          {filteredWisdoms.length === 0 ? (
            <div className={styles.empty}>
              <BookOpen size={64} className={styles.emptyIcon} />
              <p>No wisdom entries found</p>
            </div>
          ) : (
            filteredWisdoms.map((wisdom) => (
              <div key={wisdom.id} className={styles.wisdomCard}>
                <div className={styles.wisdomHeader}>
                  <div>
                    <h3 className={styles.wisdomTitle}>{wisdom.title}</h3>
                    <p className={styles.wisdomAuthor}>
                      <User size={14} />
                      By {wisdom.author.name}
                    </p>
                  </div>
                  <div className={styles.wisdomBadges}>
                    <span className={styles.categoryBadge}>{wisdom.category}</span>
                    <span className={styles.languageBadge}>{wisdom.language}</span>
                  </div>
                </div>

                <p className={styles.wisdomContent}>
                  {wisdom.content.substring(0, 200)}...
                </p>

                <div className={styles.wisdomFooter}>
                  <div className={styles.wisdomStats}>
                    <span>
                      <Eye size={14} />
                      {wisdom.views} views
                    </span>
                    <span>
                      <Heart size={14} />
                      {wisdom._count?.likes || 0} likes
                    </span>
                    <span>
                      <MessageCircle size={14} />
                      {wisdom._count?.comments || 0} comments
                    </span>
                  </div>

                  <div className={styles.wisdomActions}>
                    <Link href={`/wisdom/${wisdom.id}`} className={styles.viewButton}>
                      <Eye size={18} />
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(wisdom.id)}
                      className={styles.deleteButton}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}