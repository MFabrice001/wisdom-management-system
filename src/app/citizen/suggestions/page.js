'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Send, CheckCircle, Loader2, MessageSquare } from 'lucide-react';
import styles from './page.module.css'; // <-- Imported styles

export default function SuggestionsPage() {
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/citizen/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTitle('');
        setContent('');
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <div className={styles.accessDenied}>Please sign in to make a suggestion.</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.iconCircle}>
             <MessageSquare className={styles.headerIcon} />
          </div>
          <h1 className={styles.title}>Make a Suggestion</h1>
          <p className={styles.subtitle}>
            Help us improve Umurage Wubwenge. Your voice matters!
          </p>
        </div>

        {submitted ? (
          <div className={styles.successCard}>
            <CheckCircle className={styles.successIcon} />
            <h3 className={styles.successTitle}>Thank You!</h3>
            <p className={styles.successText}>
              Your suggestion has been received. We appreciate your contribution to the community.
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className={styles.resetButton}
            >
              Submit another suggestion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>
                Title / Subject
              </label>
              <input
                type="text"
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.input}
                placeholder="e.g., Add more proverbs about unity"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="content" className={styles.label}>
                Description
              </label>
              <textarea
                id="content"
                rows="5"
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={styles.textarea}
                placeholder="Describe your suggestion in detail..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? <div className={styles.spinner}></div> : <Send size={20} />}
              <span>{loading ? 'Submitting...' : 'Submit Suggestion'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}