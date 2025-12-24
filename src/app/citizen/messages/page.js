'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Mail, MessageCircle, User, Loader2, Send } from 'lucide-react';
import styles from './page.module.css';

export default function MessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);

  useEffect(() => {
    if (session) {
      fetchConversations();
    }
  }, [session]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/citizen/messages');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/citizen/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail, initialMessage: newMessage }),
      });
      
      if (res.ok) {
        setShowNewMessageModal(false);
        setRecipientEmail('');
        setNewMessage('');
        fetchConversations(); // Refresh list
      } else {
        alert('Failed to send message. Check the email address.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!session) {
    return <div className={styles.accessDenied}>Please log in to view your messages.</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Messages</h1>
          <button 
            className={styles.composeButton}
            onClick={() => setShowNewMessageModal(true)}
          >
            <Mail size={18} /> New Message
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingWrapper}>
            <Loader2 className={styles.spinner} />
          </div>
        ) : conversations.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageCircle size={48} className={styles.emptyIcon} />
            <p>No messages yet. Start a conversation with an Elder or Admin!</p>
          </div>
        ) : (
          <div className={styles.conversationList}>
            {conversations.map((conv) => (
              <Link href={`/citizen/messages/${conv.id}`} key={conv.id} className={styles.conversationCard}>
                <div className={styles.avatar}>
                  <User size={24} />
                </div>
                <div className={styles.conversationInfo}>
                  <h3 className={styles.participantName}>
                    {conv.participants.find(p => p.email !== session.user.email)?.name || 'Unknown User'}
                  </h3>
                  <p className={styles.lastMessage}>
                    {conv.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
                <span className={styles.time}>
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* New Message Modal */}
        {showNewMessageModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>New Conversation</h2>
              <form onSubmit={startConversation}>
                <div className={styles.formGroup}>
                  <label>Recipient Email</label>
                  <input 
                    type="email" 
                    required 
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="elder@gmail.com"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Message</label>
                  <textarea 
                    required 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Write your message..."
                    className={styles.textarea}
                    rows={4}
                  />
                </div>
                <div className={styles.modalActions}>
                  <button 
                    type="button" 
                    onClick={() => setShowNewMessageModal(false)}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.sendButton}>
                    <Send size={18} /> Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}