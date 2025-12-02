'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Edit, BookOpen, Heart, MessageCircle, Award, Mail, Calendar, Loader2 } from 'lucide-react';
import styles from './page.module.css';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session) {
      fetchProfile();
    }
  }, [status, session, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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

  if (!profile) {
    return (
      <div className={styles.error}>
        <p>Failed to load profile</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>My Profile</h1>
          <Link href="/profile/edit" className={styles.editButton}>
            <Edit size={18} />
            Edit Profile
          </Link>
        </div>

        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>
              {profile.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className={styles.profileInfo}>
              <h2 className={styles.name}>{profile.name}</h2>
              <p className={styles.email}>
                <Mail size={16} />
                {profile.email}
              </p>
              <div className={styles.badges}>
                {profile.role === 'ADMIN' && (
                  <span className={styles.adminBadge}>
                    <Award size={14} />
                    Admin
                  </span>
                )}
                {profile.role === 'ELDER' && (
                  <span className={styles.elderBadge}>
                    <Award size={14} />
                    Elder
                  </span>
                )}
                <span className={styles.dateBadge}>
                  <Calendar size={14} />
                  Joined {formatDate(profile.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className={styles.statsSection}>
          <h3 className={styles.sectionTitle}>Statistics</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #22c55e, #16a34a)'}}>
                <BookOpen size={24} />
              </div>
              <div className={styles.statInfo}>
                <p className={styles.statNumber}>{profile._count?.wisdoms || 0}</p>
                <p className={styles.statLabel}>Wisdom Shared</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #ef4444, #dc2626)'}}>
                <Heart size={24} />
              </div>
              <div className={styles.statInfo}>
                <p className={styles.statNumber}>{profile._count?.likes || 0}</p>
                <p className={styles.statLabel}>Likes Given</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #3b82f6, #2563eb)'}}>
                <MessageCircle size={24} />
              </div>
              <div className={styles.statInfo}>
                <p className={styles.statNumber}>{profile._count?.comments || 0}</p>
                <p className={styles.statLabel}>Comments</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #a855f7, #9333ea)'}}>
                <Award size={24} />
              </div>
              <div className={styles.statInfo}>
                <p className={styles.statNumber}>{profile._count?.bookmarks || 0}</p>
                <p className={styles.statLabel}>Bookmarks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Wisdom */}
        {profile.wisdoms && profile.wisdoms.length > 0 && (
          <div className={styles.wisdomSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Recent Wisdom</h3>
              <Link href="/wisdom" className={styles.viewAllLink}>
                View All
              </Link>
            </div>
            <div className={styles.wisdomGrid}>
              {profile.wisdoms.slice(0, 3).map((wisdom) => (
                <Link
                  key={wisdom.id}
                  href={`/wisdom/${wisdom.id}`}
                  className={styles.wisdomCard}
                >
                  <div className={styles.wisdomHeader}>
                    <span className={styles.categoryBadge}>
                      {wisdom.category.split('_').join(' ')}
                    </span>
                    <span className={styles.languageBadge}>
                      {wisdom.language}
                    </span>
                  </div>
                  <h4 className={styles.wisdomTitle}>{wisdom.title}</h4>
                  <p className={styles.wisdomContent}>
                    {wisdom.content.substring(0, 100)}...
                  </p>
                  <div className={styles.wisdomFooter}>
                    <span className={styles.wisdomStat}>
                      <Heart size={14} />
                      {wisdom._count?.likes || 0}
                    </span>
                    <span className={styles.wisdomStat}>
                      <MessageCircle size={14} />
                      {wisdom._count?.comments || 0}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>Account Information</h3>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Full Name</span>
              <span className={styles.infoValue}>{profile.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email Address</span>
              <span className={styles.infoValue}>{profile.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Account Type</span>
              <span className={styles.infoValue}>
                {profile.role === 'ADMIN' ? 'Administrator' : 
                 profile.role === 'ELDER' ? 'Elder' : 'Member'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Member Since</span>
              <span className={styles.infoValue}>{formatDate(profile.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}