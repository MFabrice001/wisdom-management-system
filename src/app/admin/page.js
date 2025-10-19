'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  BookOpen, 
  MessageCircle, 
  Heart, 
  TrendingUp, 
  Award,
  Calendar,
  Eye,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import styles from './page.module.css';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
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
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>Manage users, wisdom, and system settings</p>
          </div>
          <Link href="/wisdom" className={styles.backButton}>
            <ArrowUpRight size={18} />
            Back to Wisdom
          </Link>
        </div>

        {/* Stats Overview */}
        <div className={styles.statsGrid}>
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats?.overview?.totalUsers || 0}
            color="linear-gradient(135deg, #3b82f6, #2563eb)"
            link="/admin/users"
          />
          <StatCard
            icon={BookOpen}
            label="Total Wisdom"
            value={stats?.overview?.totalWisdoms || 0}
            color="linear-gradient(135deg, #22c55e, #16a34a)"
            link="/admin/wisdoms"
          />
          <StatCard
            icon={MessageCircle}
            label="Total Comments"
            value={stats?.overview?.totalComments || 0}
            color="linear-gradient(135deg, #a855f7, #9333ea)"
            link="/admin"
          />
          <StatCard
            icon={Heart}
            label="Total Likes"
            value={stats?.overview?.totalLikes || 0}
            color="linear-gradient(135deg, #ef4444, #dc2626)"
            link="/admin"
          />
        </div>

        {/* Recent Activity */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <TrendingUp size={24} />
            Recent Activity (Last 30 Days)
          </h2>
          <div className={styles.activityGrid}>
            <ActivityCard
              icon={Users}
              label="New Users"
              value={stats?.recentActivity?.newUsers || 0}
              color="#3b82f6"
            />
            <ActivityCard
              icon={BookOpen}
              label="New Wisdom"
              value={stats?.recentActivity?.newWisdoms || 0}
              color="#22c55e"
            />
            <ActivityCard
              icon={Eye}
              label="Active Users"
              value={stats?.recentActivity?.activeUsers || 0}
              color="#a855f7"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Award size={24} />
            Quick Actions
          </h2>
          <div className={styles.actionsGrid}>
            <ActionCard
              title="Manage Polls"
              description="Create and manage community polls"
              link="/admin/polls"
              color="#6366f1"
            />
            <ActionCard
              title="Manage Users"
              description="View and manage user accounts"
              link="/admin/users"
              color="#3b82f6"
            />
            <ActionCard
              title="Manage Wisdom"
              description="Review and moderate wisdom entries"
              link="/admin/wisdoms"
              color="#22c55e"
            />
            <ActionCard
              title="Refresh Data"
              description="Update dashboard statistics"
              onClick={fetchStats}
              color="#a855f7"
            />
          </div>
        </div>

        {/* Popular Wisdom */}
        {stats?.popularWisdoms && stats.popularWisdoms.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Award size={24} />
              Most Popular Wisdom
            </h2>
            <div className={styles.wisdomList}>
              {stats.popularWisdoms.map((wisdom, index) => (
                <WisdomCard key={wisdom.id} wisdom={wisdom} rank={index + 1} />
              ))}
            </div>
          </div>
        )}

        {/* Category Stats */}
        {stats?.categoryStats && stats.categoryStats.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Calendar size={24} />
              Category Distribution
            </h2>
            <div className={styles.categoryGrid}>
              {stats.categoryStats.map((cat) => (
                <CategoryCard key={cat.category} category={cat.category} count={cat._count.category} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color, link }) {
  const content = (
    <>
      <div className={styles.statIcon} style={{ background: color }}>
        <Icon size={28} color="white" />
      </div>
      <div className={styles.statInfo}>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </>
  );

  if (link) {
    return (
      <Link href={link} className={styles.statCard}>
        {content}
      </Link>
    );
  }

  return <div className={styles.statCard}>{content}</div>;
}

// Activity Card Component
function ActivityCard({ icon: Icon, label, value, color }) {
  return (
    <div className={styles.activityCard}>
      <div className={styles.activityIcon} style={{ color }}>
        <Icon size={24} />
      </div>
      <div>
        <p className={styles.activityValue}>{value}</p>
        <p className={styles.activityLabel}>{label}</p>
      </div>
    </div>
  );
}

// Action Card Component
function ActionCard({ title, description, link, onClick, color }) {
  const content = (
    <>
      <div className={styles.actionIcon} style={{ background: color }}>
        <Award size={24} color="white" />
      </div>
      <h3 className={styles.actionTitle}>{title}</h3>
      <p className={styles.actionDescription}>{description}</p>
    </>
  );

  if (link) {
    return (
      <Link href={link} className={styles.actionCard}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={styles.actionCard}>
      {content}
    </button>
  );
}

// Wisdom Card Component
function WisdomCard({ wisdom, rank }) {
  return (
    <Link href={`/wisdom/${wisdom.id}`} className={styles.wisdomCard}>
      <div className={styles.wisdomRank}>#{rank}</div>
      <div className={styles.wisdomContent}>
        <h4 className={styles.wisdomTitle}>{wisdom.title}</h4>
        <div className={styles.wisdomStats}>
          <span>
            <Eye size={14} />
            {wisdom.views} views
          </span>
          <span>
            <Heart size={14} />
            {wisdom._count?.likes || 0} likes
          </span>
          <span>
            <MessageCircle size={14} />
            {wisdom._count?.comments || 0} comments
          </span>
        </div>
      </div>
    </Link>
  );
}

// Category Card Component
function CategoryCard({ category, count }) {
  const formatCategory = (cat) => {
    return cat.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className={styles.categoryCard}>
      <p className={styles.categoryName}>{formatCategory(category)}</p>
      <p className={styles.categoryCount}>{count}</p>
    </div>
  );
}