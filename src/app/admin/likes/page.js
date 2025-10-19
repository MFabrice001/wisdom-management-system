'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Loader2, Eye, User } from 'lucide-react';
import styles from '../page.module.css';

export default function AdminLikesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else {
      fetchLikes();
    }
  }, [status, session, router]);

  const fetchLikes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/likes');
      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes || []);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={48} />
      </div>
    );
  }

  // Group likes by wisdom
  const wisdomLikes = {};
  likes.forEach(like => {
    if (!wisdomLikes[like.wisdomId]) {
      wisdomLikes[like.wisdomId] = {
        wisdom: like.wisdom,
        count: 0,
        users: []
      };
    }
    wisdomLikes[like.wisdomId].count++;
    wisdomLikes[like.wisdomId].users.push(like.user);
  });

  const wisdomArray = Object.values(wisdomLikes).sort((a, b) => b.count - a.count);

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
              <Heart size={32} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Manage Likes
            </h1>
            <p className={styles.subtitle}>View wisdom popularity ({likes.length} total likes)</p>
          </div>
        </div>

        <div className={styles.likesList}>
          {wisdomArray.length === 0 ? (
            <div className={styles.empty}>
              <Heart size={64} className={styles.emptyIcon} />
              <p>No likes yet</p>
            </div>
          ) : (
            wisdomArray.map((item) => (
              <div key={item.wisdom.id} className={styles.likeCard}>
                <div className={styles.likeHeader}>
                  <div>
                    <h3 className={styles.likeTitle}>{item.wisdom.title}</h3>
                    <p className={styles.likeCount}>
                      <Heart size={16} />
                      {item.count} {item.count === 1 ? 'like' : 'likes'}
                    </p>
                  </div>
                  <Link href={`/wisdom/${item.wisdom.id}`} className={styles.viewButton}>
                    <Eye size={18} />
                    View
                  </Link>
                </div>
                <div className={styles.likeUsers}>
                  <User size={14} />
                  <span>Liked by: {item.users.slice(0, 3).map(u => u.name).join(', ')}
                    {item.users.length > 3 && ` +${item.users.length - 3} more`}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}