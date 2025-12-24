'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Bookmark, Loader2, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export default function BookmarksPage() {
  const { data: session } = useSession();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchBookmarks();
    }
  }, [session]);

  const fetchBookmarks = async () => {
    try {
      const res = await fetch('/api/citizen/bookmarks');
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return <div className={styles.accessDenied}>Please login to view bookmarks.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Bookmark size={24} />
          </div>
          <h1 className={styles.title}>My Saved Wisdom</h1>
        </div>

        {loading ? (
          <div className={styles.loadingWrapper}><Loader2 className={styles.spinner} /></div>
        ) : bookmarks.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>You haven't saved any wisdom yet.</p>
            <Link href="/wisdom" className={styles.exploreLink}>
              Explore Library
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {bookmarks.map((item) => (
              <Link href={`/wisdom/${item.wisdom.id}`} key={item.id} className={styles.cardLink}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>
                    {item.wisdom.title}
                  </h3>
                  <p className={styles.cardExcerpt}>{item.wisdom.content}</p>
                  <div className={styles.readMore}>
                    Read more <ArrowRight className={styles.arrowIcon} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}