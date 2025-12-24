'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { MessageSquare, Check, X, Loader2, Send } from 'lucide-react';
import styles from './page.module.css';

export default function ElderSuggestionsPage() {
  const { data: session } = useSession();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({}); // Map of suggestionId -> text
  const [sendingReply, setSendingReply] = useState(null);

  useEffect(() => {
    if (session?.user?.role === 'ELDER' || session?.user?.role === 'ADMIN') {
      fetchSuggestions();
    }
  }, [session]);

  const fetchSuggestions = async () => {
    try {
      // Assuming you have an API route to fetch all suggestions
      // You might need to create src/app/api/elder/suggestions/route.js if it doesn't exist
      const res = await fetch('/api/elder/suggestions'); 
      if (res.ok) {
        const data = await res.json();
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
      // Assuming you have an API route to handle replies
      const res = await fetch(`/api/elder/suggestions/${suggestionId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: text }),
      });

      if (res.ok) {
        alert('Reply sent successfully!');
        fetchSuggestions(); // Refresh list to show updated reply
        setReplyText(prev => ({ ...prev, [suggestionId]: '' }));
      } else {
        alert('Failed to send reply.');
      }
    } catch (error) {
      console.error('Error replying:', error);
      alert('An error occurred.');
    } finally {
      setSendingReply(null);
    }
  };

  // Access Control
  if (!session || (session.user.role !== 'ELDER' && session.user.role !== 'ADMIN')) {
    return <div className={styles.accessDenied}>Unauthorized Access. Only Elders and Admins can view suggestions.</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Citizen Suggestions</h1>
          <p className={styles.subtitle}>Review and respond to community feedback.</p>
        </div>
        
        {loading ? (
          <div className={styles.loadingWrapper}>
            <Loader2 className={styles.spinner} />
          </div>
        ) : suggestions.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare size={48} className={styles.emptyIcon} />
            <p>No suggestions found at the moment.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {suggestions.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.userInfo}>
                    <h3 className={styles.userName}>{item.user?.name || 'Citizen'}</h3>
                    <span className={styles.date}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`${styles.statusBadge} ${item.status === 'PENDING' ? styles.pending : styles.reviewed}`}>
                    {item.status}
                  </span>
                </div>
                
                <h4 className={styles.suggestionTitle}>{item.title}</h4>
                <div className={styles.suggestionContent}>
                  <p>{item.content}</p>
                </div>

                <div className={styles.replySection}>
                  {item.reply ? (
                    <div className={styles.existingReply}>
                      <p className={styles.replyLabel}>Response:</p>
                      <p className={styles.replyText}>{item.reply}</p>
                      <p className={styles.replyMeta}>
                        Replied by {item.repliedBy || 'Elder'} on {item.repliedAt ? new Date(item.repliedAt).toLocaleDateString() : 'recent'}
                      </p>
                    </div>
                  ) : (
                    <div className={styles.replyForm}>
                      <textarea 
                        className={styles.replyInput}
                        rows="2"
                        placeholder="Write a response to this suggestion..."
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