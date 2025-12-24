'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Video, Calendar, Link as LinkIcon, Loader2, Users } from 'lucide-react';
import styles from './page.module.css';

export default function ElderMeetingsPage() {
  const { data: session } = useSession();
  const [meetingData, setMeetingData] = useState({
    title: '',
    date: '',
    link: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  // Role check
  if (session?.user?.role !== 'ELDER' && session?.user?.role !== 'ADMIN') {
    return (
        <div className={styles.accessDenied}>
            <div className={styles.deniedCard}>
                <h2 className={styles.deniedTitle}>Access Restricted</h2>
                <p className={styles.deniedText}>Only Elders can schedule live meetings.</p>
            </div>
        </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/elder/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingData),
      });

      if (res.ok) {
        alert('Meeting scheduled successfully! Citizens will be notified.');
        setMeetingData({ title: '', date: '', link: '', description: '' });
      } else {
        alert('Failed to schedule meeting.');
      }
    } catch (error) {
      console.error(error);
      alert('Error scheduling meeting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Video className={styles.headerIcon} size={48} />
          <h1 className={styles.title}>Schedule Live Wisdom Session</h1>
          <p className={styles.subtitle}>
            Connect with the community in real-time. Share your knowledge directly.
          </p>
        </div>

        <div className={styles.formSection}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Session Topic</label>
              <input
                type="text"
                required
                className={styles.input}
                value={meetingData.title}
                onChange={(e) => setMeetingData({...meetingData, title: e.target.value})}
                placeholder="e.g., Traditional Wedding Customs Explained"
              />
            </div>

            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Date & Time</label>
                <div className={styles.inputWrapper}>
                  <Calendar className={styles.icon} size={20} />
                  <input
                    type="datetime-local"
                    required
                    className={styles.input}
                    value={meetingData.date}
                    onChange={(e) => setMeetingData({...meetingData, date: e.target.value})}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Meeting Link (Zoom/Meet)</label>
                <div className={styles.inputWrapper}>
                  <LinkIcon className={styles.icon} size={20} />
                  <input
                    type="url"
                    required
                    className={styles.input}
                    value={meetingData.link}
                    onChange={(e) => setMeetingData({...meetingData, link: e.target.value})}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <textarea
                rows="4"
                className={styles.textarea}
                value={meetingData.description}
                onChange={(e) => setMeetingData({...meetingData, description: e.target.value})}
                placeholder="Briefly describe what you will discuss..."
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Users className="mr-2" />}
                {loading ? 'Scheduling...' : 'Schedule & Notify Citizens'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}