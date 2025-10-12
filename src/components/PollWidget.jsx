'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BarChart3, Clock, CheckCircle } from 'lucide-react';

export default function PollWidget() {
  const { data: session } = useSession();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivePolls();
  }, []);

  const fetchActivePolls = async () => {
    try {
      const res = await fetch('/api/polls');
      const data = await res.json();
      setPolls(data.filter(poll => poll.isActive && new Date(poll.endDate) > new Date()));
    } catch (error) {
      console.error('Failed to fetch polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId, option) => {
    if (!session) {
      alert('Please sign in to vote');
      return;
    }

    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option })
      });

      if (res.ok) {
        fetchActivePolls(); // Refresh polls to show updated results
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Vote error:', error);
      alert('Failed to record vote');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (polls.length === 0) {
    return null; // Don't show widget if no active polls
  }

  return (
    <div className="space-y-6">
      {polls.map((poll) => {
        const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
        const hasVoted = poll.userVote !== null;
        const daysLeft = Math.ceil((new Date(poll.endDate) - new Date()) / (1000 * 60 * 60 * 24));

        return (
          <div key={poll.id} className="bg-white rounded-lg shadow-md p-6">
            {/* Poll Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {poll.question}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                  </span>
                </div>
              </div>
              {hasVoted && (
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Voted
                </div>
              )}
            </div>

            {/* Poll Options */}
            <div className="space-y-3">
              {poll.options.map((option, idx) => {
                const percentage = totalVotes > 0 
                  ? Math.round((option.votes / totalVotes) * 100) 
                  : 0;
                const isUserChoice = hasVoted && poll.userVote === option.text;

                return (
                  <div key={idx}>
                    <button
                      onClick={() => handleVote(poll.id, option.text)}
                      disabled={hasVoted || !session}
                      className={`w-full text-left transition-all ${
                        hasVoted
                          ? 'cursor-default'
                          : session
                          ? 'cursor-pointer hover:bg-gray-50'
                          : 'cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-medium ${
                          isUserChoice ? 'text-blue-600' : 'text-gray-700'
                        }`}>
                          {option.text} {isUserChoice && '✓'}
                        </span>
                        {hasVoted && (
                          <span className="text-sm text-gray-600">
                            {option.votes} ({percentage}%)
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          {hasVoted && (
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                isUserChoice ? 'bg-blue-600' : 'bg-gray-400'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {!session && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                Sign in to vote on this poll
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}