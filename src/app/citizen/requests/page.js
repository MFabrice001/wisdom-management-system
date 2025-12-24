'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { HelpCircle, Send, Loader2, CheckCircle } from 'lucide-react';
import styles from './page.module.css';

export default function RequestsPage() {
  const { data: session } = useSession();
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/citizen/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, details }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTopic('');
        setDetails('');
      } else {
        alert('Failed to submit request.');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <div className={styles.accessDenied}>Please log in to submit a wisdom request.</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <HelpCircle size={32} className={styles.icon} />
          </div>
          <h1 className={styles.title}>Request Wisdom</h1>
          <p className={styles.subtitle}>
            Looking for a specific proverb, story, or traditional knowledge? Ask our Elders.
          </p>
        </div>

        {submitted ? (
          <div className={styles.successCard}>
            <CheckCircle className={styles.successIcon} size={48} />
            <h2 className={styles.successTitle}>Request Submitted!</h2>
            <p className={styles.successText}>
              Your request has been sent to our community elders. You will be notified when a response is available.
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className={styles.resetButton}
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.formCard}>
            <div className={styles.formGroup}>
              <label htmlFor="topic" className={styles.label}>Topic / Subject</label>
              <input
                id="topic"
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={styles.input}
                placeholder="e.g., Proverbs about patience"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="details" className={styles.label}>Details</label>
              <textarea
                id="details"
                required
                rows={5}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className={styles.textarea}
                placeholder="Describe what you are looking for in detail..."
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <Loader2 className={styles.spinner} size={20} />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}