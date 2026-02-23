'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { BookOpen, Video, Users, Star, MessageSquare, Heart, HelpCircle, Loader2, Lightbulb, BarChart3, TrendingUp, Eye, ThumbsUp } from 'lucide-react';
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

          <Link href="/elder/messages" className={`${styles.card} ${styles.cardBlue}`}>
            <MessageSquare className={`${styles.icon} ${styles.iconBlue}`} />
            <h3 className={styles.cardTitle}>Messages</h3>
            <p className={styles.cardText}>Connect with community members</p>
          </Link>

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
                const maxActivities = Math.max(...monthlyData.map(d => d.activities), 1);
                const barHeight = (data.activities / maxActivities) * 200;
                const x = 70 + (index * 55);
                return (
                  <g key={data.month}>
                    {/* Bar */}
                    <rect
                      x={x}
                      y={250 - barHeight}
                      width="40"
                      height={Math.max(barHeight, 2)}
                      fill="#3B82F6"
                      className={styles.chartBar}
                    />
                    {/* X-axis label */}
                    <text x={x + 20} y="270" textAnchor="middle" fontSize="12" fill="#6B7280">
                      {data.month}
                    </text>
                    {/* Value label */}
                    {data.activities > 0 && (
                      <text x={x + 20} y={Math.max(240 - barHeight, 15)} textAnchor="middle" fontSize="10" fill="#374151" fontWeight="600">
                        {data.activities}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
        
        {/* Engagement Section */}
        <div className={styles.activitySection}>
            <h2 className={styles.sectionTitle}><TrendingUp size={24} /> Recent Engagement on Your Wisdom</h2>
            
            {loading ? (
              <div className={styles.loadingContainer}><Loader2 className={styles.spinner} size={40} /></div>
            ) : (
              <>
                {/* Engagement Stats Cards */}
                <div className={styles.statsGrid}>
                  <div className={`${styles.statCard} ${styles.statCardBlue}`}>
                    <div className={styles.statIcon}>
                      <MessageSquare size={24} />
                    </div>
                    <div className={styles.statContent}>
                      <div className={styles.statValue}>{engagement.comments.length}</div>
                      <div className={styles.statLabel}>Recent Comments</div>
                    </div>
                  </div>
                  
                  <div className={`${styles.statCard} ${styles.statCardPink}`}>
                    <div className={styles.statIcon}>
                      <Heart size={24} />
                    </div>
                    <div className={styles.statContent}>
                      <div className={styles.statValue}>{engagement.likes.length}</div>
                      <div className={styles.statLabel}>Recent Likes</div>
                    </div>
                  </div>
                  
                  <div className={`${styles.statCard} ${styles.statCardGreen}`}>
                    <div className={styles.statIcon}>
                      <ThumbsUp size={24} />
                    </div>
                    <div className={styles.statContent}>
                      <div className={styles.statValue}>{engagement.comments.length + engagement.likes.length}</div>
                      <div className={styles.statLabel}>Total Interactions</div>
                    </div>
                  </div>
                </div>

                {/* Engagement Timeline */}
                <div className={styles.engagementTimeline}>
                  <h3 className={styles.timelineTitle}><Eye size={20} /> Activity Timeline</h3>
                  
                  {engagement.comments.length === 0 && engagement.likes.length === 0 ? (
                    <div className={styles.emptyStateCard}>
                      <MessageSquare size={48} className={styles.emptyIcon} />
                      <p className={styles.emptyText}>No recent engagement yet</p>
                      <p className={styles.emptySubtext}>Share more wisdom to connect with your community!</p>
                    </div>
                  ) : (
                    <div className={styles.timelineList}>
                      {[...engagement.comments.map(c => ({...c, type: 'comment'})), 
                        ...engagement.likes.map(l => ({...l, type: 'like'}))]
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 10)
                        .map((item, index) => (
                        <div key={`${item.type}-${item.id}`} className={styles.timelineItem}>
                          <div className={`${styles.timelineIcon} ${item.type === 'comment' ? styles.timelineIconBlue : styles.timelineIconPink}`}>
                            {item.type === 'comment' ? <MessageSquare size={16} /> : <Heart size={16} />}
                          </div>
                          <div className={styles.timelineContent}>
                            <div className={styles.timelineUser}>{item.user?.name || 'User'}</div>
                            <div className={styles.timelineAction}>
                              {item.type === 'comment' ? 'commented on' : 'liked'} 
                              <span className={styles.timelineWisdom}> {item.wisdom?.title}</span>
                            </div>
                            {item.type === 'comment' && item.content && (
                              <div className={styles.timelineComment}>"{item.content.substring(0, 80)}{item.content.length > 80 ? '...' : ''}"</div>
                            )}
                            <div className={styles.timelineDate}>
                              {new Date(item.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
        </div>
      </div>
    </div>
  );
}