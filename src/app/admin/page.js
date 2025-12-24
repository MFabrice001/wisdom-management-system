'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, BookOpen, MessageCircle, Heart, TrendingUp, Award,
  ArrowUpRight, Loader2, Settings, BarChart3, RefreshCw, FileText, Eye, Calendar, Lightbulb
} from 'lucide-react';
import AnalyticsChart from '@/components/admin/AnalyticsChart';
import styles from './page.module.css';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else {
      fetchStats();
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await fetchStats();
  };

  if (loading || status === 'loading') {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={48} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header - Compact Spacing */}
        <div className={styles.header} style={{ marginBottom: '2rem' }}>
          <div>
            <h1 className={styles.title} style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Admin Dashboard</h1>
            <p className={styles.subtitle} style={{ color: '#6b7280' }}>Overview of system performance and management</p>
          </div>
          <div className={styles.headerActions}>
            <button onClick={handleRefresh} className={styles.refreshButton} disabled={refreshing}>
              <RefreshCw size={18} className={refreshing ? styles.spinning : ''} />
              Refresh
            </button>
            <Link href="/wisdom" className={styles.backButton}>
              <ArrowUpRight size={18} />
              View Site
            </Link>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className={styles.statsGrid} style={{ marginBottom: '2.5rem', gap: '1.5rem' }}>
          <StatCard
            icon={Users}
            label="Total Users"
            value={analytics?.userAnalytics?.totalUsers || 0}
            color="linear-gradient(135deg, #3b82f6, #2563eb)"
            link="/admin/users"
          />
          <StatCard
            icon={Eye}
            label="Total Views"
            value={analytics?.contentAnalytics?.totalViews || 0}
            color="linear-gradient(135deg, #22c55e, #16a34a)"
            link="/admin/wisdoms"
          />
          <StatCard
            icon={Heart}
            label="Total Likes"
            value={analytics?.engagement?.likes || 0}
            color="linear-gradient(135deg, #f59e0b, #d97706)"
            link="/admin/likes"
          />
          <StatCard
            icon={MessageCircle}
            label="Total Comments"
            value={analytics?.engagement?.comments || 0}
            color="linear-gradient(135deg, #8b5cf6, #7c3aed)"
            link="/admin/comments"
          />
        </div>

        {/* Analytics Chart */}
        <div style={{ marginBottom: '2.5rem' }}>
          <AnalyticsChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Quick Actions & Recent Activity */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Actions */}
            <div className={styles.section} style={{ marginBottom: '0' }}>
              <h2 className={styles.sectionTitle} style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
                <Settings size={20} />
                Quick Actions
              </h2>
              <div className={styles.actionsGrid} style={{ gap: '1rem' }}>
                <ActionCard
                  icon={Award}
                  title="Manage Polls"
                  description="Create community polls"
                  link="/admin/polls"
                  color="#6366f1"
                />
                <ActionCard
                  icon={Lightbulb}
                  title="Suggestions"
                  description="Review citizen ideas"
                  link="/admin/suggestions"
                  color="#f59e0b"
                />
                <ActionCard
                  icon={Users}
                  title="Users"
                  description="Manage accounts"
                  link="/admin/users"
                  color="#3b82f6"
                />
                <ActionCard
                  icon={BookOpen}
                  title="Wisdom"
                  description="Moderate entries"
                  link="/admin/wisdoms"
                  color="#22c55e"
                />
                <ActionCard
                  icon={FileText}
                  title="Reports"
                  description="System reports"
                  link="/admin/reports"
                  color="#ec4899"
                />
              </div>
            </div>

            {/* Engagement Stats */}
            <div className={styles.section} style={{ marginBottom: '0' }}>
              <h2 className={styles.sectionTitle} style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
                <TrendingUp size={20} />
                Engagement Analytics
              </h2>
              <div className={styles.activityGrid} style={{ gap: '1rem' }}>
                <ActivityCard
                  icon={Users}
                  label="Active Users"
                  value={analytics?.userAnalytics?.activeUsers || 0}
                  color="#3b82f6"
                />
                <ActivityCard
                  icon={Eye}
                  label="Avg Views"
                  value={Math.round(analytics?.contentAnalytics?.avgViews || 0)}
                  color="#22c55e"
                />
                <ActivityCard
                  icon={Lightbulb}
                  label="Suggestions"
                  value={analytics?.engagement?.suggestions || 0}
                  color="#a855f7"
                />
              </div>
            </div>
          </div>

          {/* Sidebar Column: Top Contributors & Categories */}
          <div className="space-y-8">
            {/* Top Contributors */}
            {analytics?.topContributors && analytics.topContributors.length > 0 && (
              <div className={styles.section} style={{ marginBottom: '0' }}>
                <h2 className={styles.sectionTitle} style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
                  <BarChart3 size={20} />
                  Top Contributors
                </h2>
                <div className={styles.wisdomList} style={{ gap: '0.75rem' }}>
                  {analytics.topContributors.map((contributor, index) => (
                    <ContributorCard key={contributor.id} contributor={contributor} rank={index + 1} />
                  ))}
                </div>
              </div>
            )}

            {/* Category Stats */}
            {analytics?.contentAnalytics?.topCategories && analytics.contentAnalytics.topCategories.length > 0 && (
              <div className={styles.section} style={{ marginBottom: '0' }}>
                <h2 className={styles.sectionTitle} style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
                  <Calendar size={20} />
                  Top Categories
                </h2>
                <div className={styles.categoryGrid} style={{ gap: '0.75rem' }}>
                  {analytics.contentAnalytics.topCategories.slice(0, 5).map((cat) => (
                    <CategoryCard key={cat.category} category={cat.category} count={cat._count.category} views={cat._sum.views} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color, link }) {
  const content = (
    <>
      <div className={styles.statIcon} style={{ background: color, width: '3rem', height: '3rem', borderRadius: '0.75rem' }}>
        <Icon size={20} color="white" />
      </div>
      <div className={styles.statInfo}>
        <p className={styles.statValue} style={{ fontSize: '1.5rem', marginBottom: '0' }}>{value}</p>
        <p className={styles.statLabel} style={{ fontSize: '0.8rem' }}>{label}</p>
      </div>
    </>
  );

  if (link) {
    return (
      <Link href={link} className={styles.statCard} style={{ padding: '1.25rem', gap: '1rem' }}>
        {content}
      </Link>
    );
  }

  return <div className={styles.statCard} style={{ padding: '1.25rem', gap: '1rem' }}>{content}</div>;
}

// Activity Card Component
function ActivityCard({ icon: Icon, label, value, color }) {
  return (
    <div className={styles.activityCard} style={{ padding: '1.25rem', gap: '1rem' }}>
      <div className={styles.activityIcon} style={{ color, width: '2.5rem', height: '2.5rem' }}>
        <Icon size={20} />
      </div>
      <div>
        <p className={styles.activityValue} style={{ fontSize: '1.5rem', marginBottom: '0' }}>{value}</p>
        <p className={styles.activityLabel} style={{ fontSize: '0.8rem' }}>{label}</p>
      </div>
    </div>
  );
}

// Action Card Component
function ActionCard({ icon: Icon, title, description, link, onClick, color, isRefreshing }) {
  const content = (
    <>
      <div className={styles.actionIcon} style={{ background: color, width: '2.5rem', height: '2.5rem', marginBottom: '0.75rem' }}>
        <Icon size={18} color="white" className={isRefreshing ? styles.spinning : ''} />
      </div>
      <h3 className={styles.actionTitle} style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{title}</h3>
      <p className={styles.actionDescription} style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>{description}</p>
    </>
  );

  if (link) {
    return (
      <Link href={link} className={styles.actionCard} style={{ padding: '1.25rem' }}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={styles.actionCard} disabled={isRefreshing} style={{ padding: '1.25rem' }}>
      {content}
    </button>
  );
}

// Contributor Card Component
function ContributorCard({ contributor, rank }) {
  return (
    <Link href={`/admin/users`} className={styles.wisdomCard} style={{ padding: '1rem', gap: '1rem' }}>
      <div className={styles.wisdomRank} style={{ width: '2rem', height: '2rem', fontSize: '0.9rem' }}>#{rank}</div>
      <div className={styles.wisdomContent}>
        <h4 className={styles.wisdomTitle} style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{contributor.name}</h4>
        <div className={styles.wisdomStats} style={{ gap: '1rem', fontSize: '0.75rem' }}>
          <span>
            <BookOpen size={12} />
            {contributor._count.wisdoms}
          </span>
          <span>
            <MessageCircle size={12} />
            {contributor._count.comments}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Category Card Component
function CategoryCard({ category, count, views }) {
  const formatCategory = (cat) => {
    return cat.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className={styles.categoryCard} style={{ padding: '1rem' }}>
      <p className={styles.categoryName} style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>{formatCategory(category)}</p>
      <p className={styles.categoryCount} style={{ fontSize: '1.25rem' }}>{count}</p>
      <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>{views || 0} views</p>
    </div>
  );
}