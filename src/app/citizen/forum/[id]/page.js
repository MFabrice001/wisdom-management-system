'use client';

import { useState, useEffect, use } from 'react'; // Added 'use' for params unwrapping
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Correct import
import { MessageCircle, User, Calendar, ArrowLeft, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ForumTopicPage({ params }) {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Unwrap params using React.use() as per Next.js 15
  const unwrappedParams = use(params);
  const topicId = unwrappedParams.id;

  const [topic, setTopic] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (topicId) {
      fetchTopic();
    }
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      const res = await fetch(`/api/citizen/forum/${topicId}`);
      if (res.ok) {
        const data = await res.json();
        setTopic(data.topic);
      } else {
        // Handle error (e.g., redirect to forum list)
        console.error("Failed to load topic");
      }
    } catch (error) {
      console.error('Error fetching topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/citizen/forum/${topicId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      });

      if (res.ok) {
        const newReply = await res.json();
        // Optimistically update UI or re-fetch
        setTopic(prev => ({
          ...prev,
          replies: [newReply, ...prev.replies] // Add new reply to top
        }));
        setReplyContent('');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loadingWrapper}><Loader2 className={styles.spinner} /></div>;
  if (!topic) return <div className={styles.notFound}>Topic not found.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href="/citizen/forum" className={styles.backLink}>
          <ArrowLeft size={18} /> Back to Forum
        </Link>

        {/* Main Topic Post */}
        <div className={styles.mainPost}>
          <div className={styles.postHeader}>
            <span className={styles.categoryBadge}>{topic.category}</span>
            <h1 className={styles.title}>{topic.title}</h1>
            <div className={styles.meta}>
              <div className={styles.authorInfo}>
                <div className={styles.avatar}>
                  {topic.author?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span>{topic.author?.name}</span>
              </div>
              <span className={styles.date}>
                <Calendar size={14} /> {new Date(topic.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className={styles.postContent}>
            {topic.content}
          </div>
        </div>

        {/* Replies Section */}
        <div className={styles.repliesSection}>
          <h3 className={styles.sectionTitle}>
            <MessageCircle size={20} /> Replies ({topic.replies?.length || 0})
          </h3>

          {/* Reply Form */}
          {session && (
            <form onSubmit={handleReply} className={styles.replyForm}>
              <textarea
                className={styles.replyInput}
                placeholder="Join the discussion..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
              />
              <button type="submit" disabled={submitting || !replyContent.trim()} className={styles.submitButton}>
                {submitting ? <Loader2 className={styles.spinnerSmall} /> : <Send size={18} />}
                Reply
              </button>
            </form>
          )}

          {/* Replies List */}
          <div className={styles.repliesList}>
            {topic.replies?.map((reply) => (
              <div key={reply.id} className={styles.replyCard}>
                <div className={styles.replyHeader}>
                  <div className={styles.replyAuthor}>
                    <div className={styles.smallAvatar}>
                      {reply.author?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className={styles.authorName}>{reply.author?.name}</span>
                  </div>
                  <span className={styles.replyDate}>
                    {new Date(reply.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className={styles.replyText}>{reply.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}