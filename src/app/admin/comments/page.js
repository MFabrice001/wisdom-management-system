'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Trash2, Loader2, Eye } from 'lucide-react';
import styles from '../page.module.css';

export default function AdminCommentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else {
      fetchComments();
    }
  }, [status, session, router]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/comments');
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

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
              <MessageCircle size={32} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Manage Comments
            </h1>
            <p className={styles.subtitle}>View and moderate user comments ({comments.length} total)</p>
          </div>
        </div>

        <div className={styles.commentsList}>
          {comments.length === 0 ? (
            <div className={styles.empty}>
              <MessageCircle size={64} className={styles.emptyIcon} />
              <p>No comments yet</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={styles.commentCard}>
                <div className={styles.commentHeader}>
                  <div className={styles.commentUser}>
                    <div className={styles.commentAvatar}>
                      {comment.user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className={styles.commentUserName}>{comment.user.name}</p>
                      <p className={styles.commentDate}>
                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className={styles.commentActions}>
                    <Link href={`/wisdom/${comment.wisdomId}`} className={styles.viewButton}>
                      <Eye size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className={styles.deleteButton}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className={styles.commentContent}>{comment.content}</p>
                <div className={styles.commentWisdom}>
                  On: <strong>{comment.wisdom.title}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}