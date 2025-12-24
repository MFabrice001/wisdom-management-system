'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HelpCircle, Loader2, CheckCircle, MessageSquare } from 'lucide-react';
import styles from './page.module.css';

export default function ElderRequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === 'ELDER' || session?.user?.role === 'ADMIN') {
      fetchRequests();
    }
  }, [session]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/citizen/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Access Control
  if (!session || (session.user.role !== 'ELDER' && session.user.role !== 'ADMIN')) {
    return <div className={styles.accessDenied}>Unauthorized Access</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Citizen Requests</h1>
          <p className={styles.subtitle}>
            Topics and wisdom requested by the community.
          </p>
        </div>

        {loading ? (
          <div className={styles.loadingWrapper}>
            <Loader2 className={styles.spinner} />
          </div>
        ) : requests.length === 0 ? (
          <div className={styles.emptyState}>
            <HelpCircle size={48} className={styles.emptyIcon} />
            <p>No open requests found.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {requests.map((req) => (
              <div key={req.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{req.user?.name || 'Citizen'}</span>
                    <span className={styles.date}>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className={styles.statusBadge}>{req.status}</span>
                </div>
                
                {/* Remove [REQUEST] prefix for display if present */}
                <h3 className={styles.reqTitle}>{req.title.replace('[REQUEST] ', '')}</h3>
                <p className={styles.reqContent}>{req.content}</p>

                <div className={styles.actions}>
                  {/* Action to fulfill request could go here, e.g. Link to Add Wisdom with pre-filled title */}
                  <button className={styles.actionButton}>
                    <CheckCircle size={16} /> Mark as Answered
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}