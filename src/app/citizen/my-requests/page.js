'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function MyRequestsPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchMyRequests();
    }
  }, [session]);

  const fetchMyRequests = async () => {
    try {
      const res = await fetch('/api/citizen/my-requests');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <div className={styles.accessDenied}>Please log in to view your requests.</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Requests & Suggestions</h1>
          <div className={styles.actions}>
             <Link href="/citizen/requests" className={styles.actionButton}>New Request</Link>
             <Link href="/citizen/suggestions" className={styles.actionButtonSecondary}>New Suggestion</Link>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingWrapper}><Loader2 className={styles.spinner} /></div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <p>You haven't submitted any requests or suggestions yet.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={`
                    ${styles.statusBadge} 
                    ${item.status === 'PENDING' ? styles.pending : item.status === 'ANSWERED' || item.status === 'REVIEWED' ? styles.answered : ''}
                  `}>
                    {item.status}
                  </span>
                  <span className={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemContent}>{item.content}</p>

                {item.reply && (
                  <div className={styles.replyBox}>
                    <div className={styles.replyHeader}>
                      <span className={styles.replyLabel}>Reply from {item.repliedBy || 'Elder'}:</span>
                      <span className={styles.replyDate}>
                        {item.repliedAt ? new Date(item.repliedAt).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                    <p className={styles.replyText}>{item.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}