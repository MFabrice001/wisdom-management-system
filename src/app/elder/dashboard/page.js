'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { BookOpen, Video, Users, Star, MessageSquare, Heart, HelpCircle, Loader2, Lightbulb, BarChart3 } from 'lucide-react';
import styles from './page.module.css';

export default function ElderDashboard() {
  const { data: session } = useSession();
  const [engagement, setEngagement] = useState({ comments: [], likes: [] });
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Basic role check
  if (!session || session.user.role !== 'ELDER') {
      return <div className={styles.accessDenied}>Unauthorized Access</div>;
  }

  useEffect(() => {
    fetchEngagement();
    generateMonthlyData();
  }, []);

  const generateMonthlyData = async () => {
    try {
      const res = await fetch('/api/elder/monthly-stats');
      if (res.ok) {
        const data = await res.json();
        setMonthlyData(data);
      } else {
        // Fallback to current year months with zero data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const fallbackData = months.map(month => ({ month, activities: 0 }));
        setMonthlyData(fallbackData);
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const fallbackData = months.map(month => ({ month, activities: 0 }));
      setMonthlyData(fallbackData);
    }
  };

  const fetchEngagement = async () => {
    try {
      const res = await fetch('/api/elder/engagement');
      if (res.ok) {
        const data = await res.json();
        setEngagement(data);
      }
    } catch (error) {
      console.error('Error fetching engagement:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Elder Dashboard</h1>
        <p className={styles.subtitle}>Welcome back, {session.user.name}. Thank you for preserving our heritage.</p>

        {/* Quick Actions Grid */}
        <div className={styles.grid}>
          <Link href="/wisdom/add" className={`${styles.card} ${styles.cardGreen}`}>
            <BookOpen className={`${styles.icon} ${styles.iconGreen}`} />
            <h3 className={styles.cardTitle}>Share Wisdom</h3>
            <p className={styles.cardText}>Document a new story or proverb</p>
          </Link>

          <Link href="/elder/meetings" className={`${styles.card} ${styles.cardPurple}`}>
            <Video className={`${styles.icon} ${styles.iconPurple}`} />
            <h3 className={styles.cardTitle}>Schedule Meeting</h3>
            <p className={styles.cardText}>Host a live session for citizens</p>
          </Link>

          {/* Citizen Requests (Specific Topics) */}
          <Link href="/elder/requests" className={`${styles.card} ${styles.cardBlue}`}>
            <HelpCircle className={`${styles.icon} ${styles.iconBlue}`} />
            <h3 className={styles.cardTitle}>Citizen Requests</h3>
            <p className={styles.cardText}>See requested wisdom topics</p>
          </Link>

          {/* General Suggestions (Feedback) - NEW */}
          <Link href="/elder/suggestions" className={`${styles.card} ${styles.cardYellow}`}>
            <Lightbulb className={`${styles.icon} ${styles.iconYellow}`} />
            <h3 className={styles.cardTitle}>Suggestions</h3>
            <p className={styles.cardText}>Review community feedback</p>
          </Link>
        </div>
        
        {/* Monthly Activities Chart */}
        <div className={styles.chartSection}>
          <h2 className={styles.sectionTitle}><BarChart3 size={20} /> Monthly Activities</h2>
          <div className={styles.chartContainer}>
            <svg width="100%" height="300" viewBox="0 0 800 300" className={styles.chart}>
              {/* Y-axis */}
              <line x1="50" y1="50" x2="50" y2="250" stroke="#374151" strokeWidth="2" />
              {/* X-axis */}
              <line x1="50" y1="250" x2="750" y2="250" stroke="#374151" strokeWidth="2" />
              
              {/* Y-axis labels */}
              {[0, 5, 10, 15, 20, 25].map((value, index) => (
                <g key={value}>
                  <text x="40" y={250 - (index * 40)} textAnchor="end" fontSize="12" fill="#6B7280">
                    {value}
                  </text>
                  <line x1="45" y1={250 - (index * 40)} x2="50" y2={250 - (index * 40)} stroke="#9CA3AF" strokeWidth="1" />
                </g>
              ))}
              
              {/* Bars and X-axis labels */}
              {monthlyData.map((data, index) => {
                const barHeight = (data.activities / 25) * 200;
                const x = 70 + (index * 55);
                return (
                  <g key={data.month}>
                    {/* Bar */}
                    <rect
                      x={x}
                      y={250 - barHeight}
                      width="40"
                      height={barHeight}
                      fill="#3B82F6"
                      className={styles.chartBar}
                    />
                    {/* X-axis label */}
                    <text x={x + 20} y="270" textAnchor="middle" fontSize="12" fill="#6B7280">
                      {data.month}
                    </text>
                    {/* Value label */}
                    <text x={x + 20} y={245 - barHeight} textAnchor="middle" fontSize="10" fill="#374151">
                      {data.activities}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
        
        {/* Engagement Section */}
        <div className={styles.activitySection}>
            <h2 className={styles.sectionTitle}>Recent Engagement on Your Wisdom</h2>
            
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className={styles.spinner} /></div>
            ) : (
              <div className={styles.engagementGrid}>
                {/* Recent Comments */}
                <div className={styles.engagementColumn}>
                  <h3 className={styles.columnTitle}><MessageSquare size={18} /> Recent Comments</h3>
                  {engagement.comments.length === 0 ? (
                    <p className={styles.emptyState}>No comments yet.</p>
                  ) : (
                    <ul className={styles.list}>
                      {engagement.comments.map((comment) => (
                        <li key={comment.id} className={styles.listItem}>
                          <p className={styles.itemText}>
                            <strong>{comment.user?.name || 'User'}</strong> commented on <em>{comment.wisdom?.title}</em>
                          </p>
                          <span className={styles.itemDate}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Recent Likes */}
                <div className={styles.engagementColumn}>
                  <h3 className={styles.columnTitle}><Heart size={18} /> Recent Likes</h3>
                  {engagement.likes.length === 0 ? (
                    <p className={styles.emptyState}>No likes yet.</p>
                  ) : (
                    <ul className={styles.list}>
                      {engagement.likes.map((like) => (
                        <li key={like.id} className={styles.listItem}>
                          <p className={styles.itemText}>
                            <strong>{like.user?.name || 'User'}</strong> liked <em>{like.wisdom?.title}</em>
                          </p>
                          <span className={styles.itemDate}>{new Date(like.createdAt).toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}