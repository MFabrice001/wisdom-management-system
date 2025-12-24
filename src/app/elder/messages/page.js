'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Mail, MessageCircle, User, Loader2, Send } from 'lucide-react';
import styles from './page.module.css';

export default function ElderMessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === 'ELDER' || session?.user?.role === 'ADMIN') {
      fetchConversations();
    }
  }, [session]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      // Reuse the same API as it fetches based on "my" ID (session.user.id)
      const res = await fetch('/api/citizen/messages'); 
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session || (session.user.role !== 'ELDER' && session.user.role !== 'ADMIN')) {
    return <div className={styles.accessDenied}>Unauthorized Access.</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Inbox</h1>
          <div className={styles.badge}>{conversations.length} Conversations</div>
        </div>

        {loading ? (
          <div className={styles.loadingWrapper}><Loader2 className={styles.spinner} /></div>
        ) : conversations.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageCircle size={48} className={styles.emptyIcon} />
            <p>No messages yet.</p>
          </div>
        ) : (
          <div className={styles.conversationList}>
            {conversations.map((conv) => {
              // Find the OTHER participant to display their name
              const otherUser = conv.participants.find(p => p.email !== session.user.email);
              return (
                // FIXED LINK: Points to /elder/messages/[id]
                <Link href={`/elder/messages/${conv.id}`} key={conv.id} className={styles.conversationCard}>
                  <div className={styles.avatar}>
                    <User size={24} />
                  </div>
                  <div className={styles.conversationInfo}>
                    <h3 className={styles.participantName}>
                      {otherUser?.name || 'Unknown User'} 
                      <span className={styles.roleBadge}>{otherUser?.role}</span>
                    </h3>
                    <p className={styles.lastMessage}>
                      {conv.lastMessage?.content || 'No messages'}
                    </p>
                  </div>
                  <span className={styles.time}>
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}