'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, User, Loader2 } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ElderConversationPage({ params }) {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Unwrap params using React.use() for Next.js 15 compatibility
  const unwrappedParams = use(params);
  const conversationId = unwrappedParams.id;

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversationId) {
      fetchConversation();
    }
  }, [conversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversation = async () => {
    try {
      // Fetch conversation details using the citizen API (shared logic)
      const res = await fetch(`/api/citizen/messages/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setConversation(data.conversation);
        setMessages(data.messages || []);
      } else {
        console.error("Failed to fetch conversation");
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      // Send reply using the specific conversation ID
      const res = await fetch(`/api/citizen/messages/${conversationId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        const sentMessage = await res.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!session || (session.user.role !== 'ELDER' && session.user.role !== 'ADMIN')) {
    return <div className={styles.accessDenied}>Unauthorized Access</div>;
  }

  if (loading) return <div className={styles.loadingWrapper}><Loader2 className={styles.spinner} /></div>;
  if (!conversation) return <div className={styles.notFound}>Conversation not found</div>;

  // Identify the OTHER participant (the Citizen)
  const otherUser = conversation.participants.find(p => p.id !== session.user.id);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <Link href="/elder/messages" className={styles.backButton}>
            <ArrowLeft size={20} />
          </Link>
          <div className={styles.headerInfo}>
            <div className={styles.avatar}>
              <User size={20} />
            </div>
            <div>
              <h2 className={styles.recipientName}>{otherUser?.name || 'User'}</h2>
              <span className={styles.recipientRole}>{otherUser?.role === 'USER' ? 'Citizen' : otherUser?.role}</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className={styles.messagesArea}>
          {messages.map((msg) => {
            const isMe = msg.senderId === session.user.id;
            return (
              <div key={msg.id} className={`${styles.messageRow} ${isMe ? styles.myMessageRow : styles.theirMessageRow}`}>
                <div className={`${styles.messageBubble} ${isMe ? styles.myBubble : styles.theirBubble}`}>
                  <p className={styles.messageText}>{msg.content}</p>
                  <span className={styles.messageTime}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className={styles.inputArea}>
          <input
            type="text"
            className={styles.input}
            placeholder="Type your reply..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
          />
          <button type="submit" disabled={sending || !newMessage.trim()} className={styles.sendButton}>
            {sending ? <Loader2 size={20} className={styles.spinnerSmall} /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}