'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { MessageSquare, Check, X, Loader2, Send, Filter, Award, UserCheck } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function AdminSuggestionsPage() {
  const { data: session } = useSession();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [replyText, setReplyText] = useState({});
  const [sendingReply, setSendingReply] = useState(null);
  const [awarding, setAwarding] = useState(null);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN' || session?.user?.role === 'ELDER') {
      fetchSuggestions();
    }
  }, [session]);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch('/api/admin/suggestions'); 
      if (res.ok) {
        const data = await res.json(); // Fixed typo: 'response' -> 'res'
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (suggestionId) => {
    const text = replyText[suggestionId];
    if (!text) return;

    setSendingReply(suggestionId);
    try {
      const res = await fetch(`/api/admin/suggestions/${suggestionId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: text }),
      });

      if (res.ok) {
        alert('Reply sent successfully!');
        fetchSuggestions();
        setReplyText(prev => ({ ...prev, [suggestionId]: '' }));
      } else {
        alert('Failed to send reply.');
      }
    } catch (error) {
      console.error('Error replying:', error);
      alert('Failed to send reply.');
    } finally {
      setSendingReply(null);
    }
  };

  const handleStatusUpdate = async (suggestionId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/suggestions/${suggestionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchSuggestions();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAwardBadge = async (userId, badgeType) => {
    if (!confirm(`Are you sure you want to award the "${badgeType}" badge to this citizen?`)) return;
    
    setAwarding(userId);
    try {
      const res = await fetch('/api/admin/badges/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, badgeType }),
      });

      if (res.ok) {
        alert('Badge awarded successfully!');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to award badge.');
      }
    } catch (error) {
      console.error('Error awarding badge:', error);
    } finally {
      setAwarding(null);
    }
  };

  const filteredSuggestions = suggestions.filter(item => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'ELDER')) {
    return <div className={styles.accessDenied}>Unauthorized Access</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* BACK BUTTON */}
        <div style={{ marginBottom: '1rem' }}>
            <Link href="/admin" className={styles.backButton} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>
                 Back to Dashboard
            </Link>
        </div>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Citizen Suggestions</h1>
            <p className={styles.subtitle}>Review feedback and award contributors.</p>
          </div>
          
          <div className={styles.filterControls}>
            <Filter size={16} className={styles.filterIcon} />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="ALL">All Suggestions</option>
              <option value="PENDING">Pending Review</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="IMPLEMENTED">Implemented</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className={styles.loadingWrapper}><Loader2 className={styles.spinner} /></div>
        ) : filteredSuggestions.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare size={48} className={styles.emptyIcon} />
            <p>No suggestions found.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredSuggestions.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                      {item.user?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <h3 className={styles.userName}>{item.user?.name || 'Citizen'}</h3>
                      <span className={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    {/* Award Badge Button */}
                    <button 
                      onClick={() => handleAwardBadge(item.userId, 'Active Voice')}
                      className={styles.awardButton}
                      title="Award 'Active Voice' Badge"
                      disabled={awarding === item.userId}
                    >
                      {awarding === item.userId ? <Loader2 size={14} className={styles.spinnerSmall} /> : <Award size={14} />}
                      <span>Award Badge</span>
                    </button>
                  </div>
                  <div className={styles.actions}>
                    <select 
                        value={item.status} 
                        onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                        className={`${styles.statusBadge} ${item.status === 'PENDING' ? styles.pending : styles.reviewed}`}
                    >
                        <option value="PENDING">Pending</option>
                        <option value="REVIEWED">Reviewed</option>
                        <option value="IMPLEMENTED">Implemented</option>
                    </select>
                  </div>
                </div>
                
                <h4 className={styles.suggestionTitle}>{item.title}</h4>
                <p className={styles.suggestionContent}>{item.content}</p>

                <div className={styles.replySection}>
                  {item.reply ? (
                    <div className={styles.existingReply}>
                      <p className={styles.replyLabel}>Response:</p>
                      <p className={styles.replyText}>{item.reply}</p>
                      <p className={styles.replyMeta}>
                        Replied by {item.repliedBy || 'Admin'} on {item.repliedAt ? new Date(item.repliedAt).toLocaleDateString() : 'recent'}
                      </p>
                    </div>
                  ) : (
                    <div className={styles.replyForm}>
                      <textarea 
                        className={styles.replyInput}
                        rows="2"
                        placeholder="Write a response..."
                        value={replyText[item.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [item.id]: e.target.value })}
                      />
                      <button 
                        onClick={() => handleReply(item.id)}
                        className={styles.replyButton}
                        disabled={!replyText[item.id] || sendingReply === item.id}
                        title="Send Reply"
                      >
                        {sendingReply === item.id ? <Loader2 className={styles.spinnerSmall} /> : <Send size={18} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}