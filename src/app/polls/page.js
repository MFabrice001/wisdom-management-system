'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/context/LanguageContext';
import { Award, TrendingUp, Clock, CheckCircle, Users, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function PollsPage() {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const router = useRouter();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // active, closed

  const translations = {
    en: {
      title: 'Community Polls',
      subtitle: 'Share your voice and shape our community',
      createPoll: 'Create Poll',
      tabs: {
        active: 'Active Polls',
        closed: 'Closed Polls'
      },
      vote: 'Vote',
      voted: 'You Voted',
      viewResults: 'View Results',
      votes: 'votes',
      endsIn: 'Ends in',
      ended: 'Ended',
      days: 'days',
      hours: 'hours',
      noPolls: 'No polls available',
      loading: 'Loading polls...',
      loginToVote: 'Login to vote',
      totalVotes: 'Total Votes'
    },
    rw: {
      title: 'Amatora y\'Abaturage',
      subtitle: 'Tanga igitekerezo cyawe kandi ugire uruhare mu muryango',
      createPoll: 'Kora Itora',
      tabs: {
        active: 'Amatora Akiri mu Gihe',
        closed: 'Amatora Yarangiye'
      },
      vote: 'Tora',
      voted: 'Waratoye',
      viewResults: 'Reba Ibisubizo',
      votes: 'amatora',
      endsIn: 'Bizarangira mu',
      ended: 'Byarangiye',
      days: 'iminsi',
      hours: 'amasaha',
      noPolls: 'Nta matora aboneka',
      loading: 'Gupakurura amatora...',
      loginToVote: 'Injira kugira ngo utore',
      totalVotes: 'Amatora Yose'
    }
  };

  const t = translations[language];

  useEffect(() => {
    fetchPolls();
  }, [activeTab]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/polls?status=${activeTab}`);
      if (response.ok) {
        const data = await response.json();
        setPolls(data.polls || []);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId, optionId) => {
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionId }),
      });

      if (response.ok) {
        fetchPolls(); // Refresh polls
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <Award className={styles.heroIcon} size={64} />
            <h1 className={styles.title}>{t.title}</h1>
            <p className={styles.subtitle}>{t.subtitle}</p>
            
            {session?.user?.role === 'ADMIN' && (
              <button 
                onClick={() => router.push('/admin/polls/create')}
                className={styles.createButton}
              >
                <Plus size={20} />
                {t.createPoll}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className={styles.tabsSection}>
        <div className={styles.container}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'active' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('active')}
            >
              <TrendingUp size={18} />
              {t.tabs.active}
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'closed' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('closed')}
            >
              <CheckCircle size={18} />
              {t.tabs.closed}
            </button>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>{t.loading}</p>
        </div>
      )}

      {/* Polls Grid */}
      {!loading && polls.length > 0 && (
        <section className={styles.pollsSection}>
          <div className={styles.container}>
            <div className={styles.pollsGrid}>
              {polls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  onVote={handleVote}
                  session={session}
                  t={t}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && polls.length === 0 && (
        <div className={styles.empty}>
          <Award size={64} className={styles.emptyIcon} />
          <p className={styles.emptyText}>{t.noPolls}</p>
        </div>
      )}
    </div>
  );
}

// Poll Card Component
function PollCard({ poll, onVote, session, t }) {
  const [showResults, setShowResults] = useState(false);
  const hasVoted = poll.userVote !== null;
  const isClosed = new Date(poll.endDate) < new Date();

  const totalVotes = poll.options.reduce((sum, option) => sum + option._count.votes, 0);

  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(poll.endDate);
    const diff = end - now;

    if (diff <= 0) return { ended: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return { days, hours, ended: false };
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div className={styles.pollCard}>
      {/* Poll Header */}
      <div className={styles.pollHeader}>
        <h3 className={styles.pollQuestion}>{poll.question}</h3>
        <div className={styles.pollMeta}>
          <span className={styles.pollMetaItem}>
            <Users size={14} />
            {totalVotes} {t.votes}
          </span>
          {!timeRemaining.ended ? (
            <span className={`${styles.pollMetaItem} ${styles.pollActive}`}>
              <Clock size={14} />
              {t.endsIn} {timeRemaining.days}d {timeRemaining.hours}h
            </span>
          ) : (
            <span className={`${styles.pollMetaItem} ${styles.pollEnded}`}>
              <CheckCircle size={14} />
              {t.ended}
            </span>
          )}
        </div>
      </div>

      {/* Poll Options */}
      <div className={styles.pollOptions}>
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 
            ? ((option._count.votes / totalVotes) * 100).toFixed(1)
            : 0;
          const isUserVote = hasVoted && poll.userVote === option.id;

          return (
            <div key={option.id} className={styles.optionWrapper}>
              {!hasVoted && !isClosed ? (
                <button
                  onClick={() => onVote(poll.id, option.id)}
                  className={styles.optionButton}
                  disabled={!session}
                >
                  {option.text}
                </button>
              ) : (
                <div className={`${styles.optionResult} ${isUserVote ? styles.userVoted : ''}`}>
                  <div className={styles.optionText}>
                    <span>{option.text}</span>
                    {isUserVote && (
                      <span className={styles.votedBadge}>
                        <CheckCircle size={14} />
                        {t.voted}
                      </span>
                    )}
                  </div>
                  <div className={styles.optionStats}>
                    <div 
                      className={styles.optionBar}
                      style={{ width: `${percentage}%` }}
                    ></div>
                    <span className={styles.optionPercentage}>{percentage}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Poll Footer */}
      {!session && !hasVoted && !isClosed && (
        <div className={styles.pollFooter}>
          <p className={styles.loginPrompt}>{t.loginToVote}</p>
        </div>
      )}
    </div>
  );
}