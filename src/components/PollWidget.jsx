'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import styles from './PollWidget.module.css';

export default function PollWidget() {
  const { data: session } = useSession();
  const router = useRouter();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPollIndex, setCurrentPollIndex] = useState(0);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetchActivePolls();
  }, []);

  const fetchActivePolls = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/polls?status=active');
      const data = await res.json();
      
      // Filter active polls that haven't ended
      const activePolls = (data.polls || []).filter(
        poll => new Date(poll.endDate) > new Date()
      );
      
      setPolls(activePolls);
    } catch (error) {
      console.error('Failed to fetch polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId) => {
    if (!session) {
      router.push('/login');
      return;
    }

    const currentPoll = polls[currentPollIndex];
    if (!currentPoll) return;

    try {
      setVoting(true);
      const response = await fetch(`/api/polls/${currentPoll.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionId }),
      });

      if (response.ok) {
        // Refresh polls to show updated results
        await fetchActivePolls();
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={32} />
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No active polls at the moment</p>
      </div>
    );
  }

  const currentPoll = polls[currentPollIndex];
  const totalVotes = currentPoll.options.reduce(
    (sum, option) => sum + (option._count?.votes || 0),
    0
  );
  const hasVoted = currentPoll.userVote !== null;

  return (
    <div className={styles.pollWidget}>
      <div className={styles.pollQuestion}>{currentPoll.question}</div>

      <div className={styles.pollOptions}>
        {currentPoll.options.map((option) => {
          const votes = option._count?.votes || 0;
          const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
          const isUserVote = hasVoted && currentPoll.userVote === option.id;

          if (hasVoted) {
            // Show results
            return (
              <div
                key={option.id}
                className={`${styles.pollResult} ${isUserVote ? styles.userVoted : ''}`}
              >
                <div className={styles.resultText}>
                  <span>{option.text}</span>
                  {isUserVote && (
                    <CheckCircle size={16} className={styles.checkIcon} />
                  )}
                </div>
                <div className={styles.resultBar}>
                  <div
                    className={styles.resultFill}
                    style={{ width: `${percentage}%` }}
                  />
                  <span className={styles.percentage}>{percentage}%</span>
                </div>
              </div>
            );
          }

          // Show vote buttons
          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={voting || !session}
              className={styles.pollOption}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      {!session && !hasVoted && (
        <p className={styles.loginPrompt}>
          <button onClick={() => router.push('/login')} className={styles.loginLink}>
            Sign in to vote
          </button>
        </p>
      )}

      {hasVoted && (
        <p className={styles.votedMessage}>
          Total votes: {totalVotes}
        </p>
      )}

      {polls.length > 1 && (
        <div className={styles.pollNavigation}>
          {polls.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPollIndex(index)}
              className={`${styles.navDot} ${
                index === currentPollIndex ? styles.activeDot : ''
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}