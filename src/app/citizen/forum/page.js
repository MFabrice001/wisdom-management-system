'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link'; // Import Link
import { MessageSquare, Plus, Loader2, Users, MessageCircle, X, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './page.module.css';

export default function ForumPage() {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', category: 'Traditions', content: '' });
  const [creating, setCreating] = useState(false);

  const translations = {
    en: {
      title: 'Community Forum',
      subtitle: 'Discuss traditional wisdom, share insights, and connect.',
      newTopic: 'New Topic',
      accessDenied: 'Please log in to access the community forum.',
      noDiscussions: 'No discussions found. Be the first to start one!',
      startNewDiscussion: 'Start New Discussion',
      topicTitle: 'Topic Title',
      topicPlaceholder: 'What do you want to discuss?',
      category: 'Category',
      content: 'Content',
      contentPlaceholder: 'Share your thoughts...',
      cancel: 'Cancel',
      postTopic: 'Post Topic',
      categories: {
        Traditions: 'Traditions',
        Proverbs: 'Proverbs', 
        Stories: 'Stories',
        General: 'General'
      }
    },
    rw: {
      title: 'Uruganiriro rw\'Abaturage',
      subtitle: 'Ganirira ku bwenge bwa kera, sangira ibitekerezo, kandi muhurire.',
      newTopic: 'Ingingo Nshya',
      accessDenied: 'Nyamuneka injira kugira ngo ubone uruganiriro rw\'abaturage.',
      noDiscussions: 'Nta biganiro byabonetse. Ba uwa mbere gutangira!',
      startNewDiscussion: 'Tangira Ikiganiro Gishya',
      topicTitle: 'Umutwe w\'Ingingo',
      topicPlaceholder: 'Ni iki ushaka kuganiraho?',
      category: 'Icyiciro',
      content: 'Ibirimo',
      contentPlaceholder: 'Sangira ibitekerezo byawe...',
      cancel: 'Kuraguza',
      postTopic: 'Ohereza Ingingo',
      categories: {
        Traditions: 'Imigenzo',
        Proverbs: 'Imigani',
        Stories: 'Inkuru',
        General: 'Rusange'
      }
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (session) {
      fetchDiscussions();
    }
  }, [session]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/citizen/forum');
      if (res.ok) {
        const data = await res.json();
        setDiscussions(data.discussions || []);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/citizen/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTopic)
      });

      if (res.ok) {
        setShowModal(false);
        setNewTopic({ title: '', category: 'Traditions', content: '' });
        fetchDiscussions(); // Refresh list
      } else {
        alert('Failed to create topic');
      }
    } catch (error) {
      console.error('Error creating topic:', error);
    } finally {
      setCreating(false);
    }
  };

  if (!session) {
    return <div className={styles.accessDenied}>{t.accessDenied}</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t.title}</h1>
            <p className={styles.subtitle}>{t.subtitle}</p>
          </div>
          <button onClick={() => setShowModal(true)} className={styles.createButton}>
            <Plus size={20} />
            <span>{t.newTopic}</span>
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingWrapper}>
            <Loader2 className={styles.spinner} />
          </div>
        ) : (
          <div className={styles.grid}>
            {discussions.length > 0 ? (
              discussions.map((topic) => (
                // Changed div to Link for navigation and added style to remove underlines
                <Link 
                  href={`/citizen/forum/${topic.id}`} 
                  key={topic.id} 
                  className={styles.card}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.categoryBadge}>{topic.category}</span>
                    <span className={styles.timestamp}>
                      {new Date(topic.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className={styles.topicTitle}>{topic.title}</h3>
                  <p className={styles.topicPreview}>{topic.preview}</p>
                  <div className={styles.cardFooter}>
                    <div className={styles.author}>
                      <div className={styles.avatar}>
                        {topic.author ? topic.author[0].toUpperCase() : 'U'}
                      </div>
                      <span>{topic.author}</span>
                    </div>
                    <div className={styles.stats}>
                      <span className={styles.stat}>
                        <MessageCircle size={16} /> {topic.replies || 0}
                      </span>
                      <span className={styles.stat}>
                        <Users size={16} /> {topic.views || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className={styles.emptyState}>{t.noDiscussions}</div>
            )}
          </div>
        )}

        {/* New Topic Modal */}
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>{t.startNewDiscussion}</h2>
                <button onClick={() => setShowModal(false)} className={styles.closeButton}>
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateTopic}>
                <div className={styles.formGroup}>
                  <label>{t.topicTitle}</label>
                  <input 
                    type="text" 
                    required 
                    value={newTopic.title}
                    onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                    placeholder={t.topicPlaceholder}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t.category}</label>
                  <select 
                    value={newTopic.category}
                    onChange={(e) => setNewTopic({...newTopic, category: e.target.value})}
                    className={styles.select}
                  >
                    <option value="Traditions">{t.categories.Traditions}</option>
                    <option value="Proverbs">{t.categories.Proverbs}</option>
                    <option value="Stories">{t.categories.Stories}</option>
                    <option value="General">{t.categories.General}</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>{t.content}</label>
                  <textarea 
                    rows="5"
                    required
                    value={newTopic.content}
                    onChange={(e) => setNewTopic({...newTopic, content: e.target.value})}
                    placeholder={t.contentPlaceholder}
                    className={styles.textarea}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className={styles.cancelButton}
                  >
                    {t.cancel}
                  </button>
                  <button type="submit" disabled={creating} className={styles.submitButton}>
                    {creating ? <Loader2 className={styles.spinnerSmall} /> : t.postTopic}
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