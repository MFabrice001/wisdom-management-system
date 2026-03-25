'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, Pause, Heart, MessageCircle, Share2, ChevronUp, ChevronDown, X, Loader2, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './page.module.css';

export default function ReelsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [liked, setLiked] = useState({});
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch reels data
  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await fetch('/api/reels');
        const data = await response.json();
        if (data.reels) {
          setReels(data.reels);
        }
      } catch (error) {
        console.error('Error fetching reels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w') {
        goToPrevious();
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        goToNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, reels.length]);

  // Handle touch swipe
  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e) => {
    touchEnd.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    const diffY = touchStart.current.y - touchEnd.current.y;
    const threshold = 50;

    if (diffY > threshold) {
      goToNext();
    } else if (diffY < -threshold) {
      goToPrevious();
    }
  };

  const goToNext = useCallback(() => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setPlaying(true);
    }
  }, [currentIndex, reels.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setPlaying(true);
    }
  }, [currentIndex]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleLike = async (reelId) => {
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/wisdom/${reelId}/like`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setLiked(prev => ({ ...prev, [reelId]: !prev[reelId] }));
      }
    } catch (error) {
      console.error('Error liking reel:', error);
    }
  };

  const handleShare = (reel) => {
    if (navigator.share) {
      navigator.share({
        title: reel.title,
        text: reel.content.substring(0, 100),
        url: `/wisdom/${reel.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/wisdom/${reel.id}`);
      alert('Link copied to clipboard!');
    }
  };

  // Auto-play current video
  useEffect(() => {
    if (videoRef.current && playing) {
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex, playing]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={48} />
        <p>Loading reels...</p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>🎬</div>
        <h2>No Reels Yet</h2>
        <p>Elders can upload short videos that will appear here as Reels.</p>
        <button 
          className={styles.uploadButton}
          onClick={() => router.push('/wisdom/add')}
        >
          Upload a Reel
        </button>
      </div>
    );
  }

  const currentReel = reels[currentIndex];

  return (
    <div className={styles.page}>
      {/* Header with Navigation */}
      <div className={styles.header}>
        <Link href="/" className={styles.homeButton}>
          <X size={24} />
        </Link>
        <h1>Reels</h1>
        <div className={styles.headerRight}>
          <Link href="/wisdom/add" className={styles.uploadLink}>
            + Upload
          </Link>
          <div className={styles.counter}>
            {currentIndex + 1} / {reels.length}
          </div>
        </div>
      </div>

      {/* Quick Navigation Bar */}
      <div className={styles.quickNav}>
        <Link href="/" className={styles.quickNavItem}>
          🏠 Home
        </Link>
        <Link href="/wisdom" className={styles.quickNavItem}>
          📚 Wisdom
        </Link>
        <Link href="/polls" className={styles.quickNavItem}>
          📊 Polls
        </Link>
        <Link href="/contributors" className={styles.quickNavItem}>
          👥 Contributors
        </Link>
      </div>

      {/* Main Reel Container */}
      <div 
        ref={containerRef}
        className={styles.reelContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Video */}
        <div className={styles.videoWrapper}>
          <video
            ref={videoRef}
            src={currentReel.videoUrl}
            className={styles.video}
            playsInline
            loop
            muted={false}
            onClick={togglePlay}
          />
          
          {/* Play/Pause Overlay */}
          {!playing && (
            <div className={styles.playOverlay} onClick={togglePlay}>
              <Play size={64} />
            </div>
          )}

          {/* Video Info Overlay */}
          <div className={styles.videoOverlay}>
            <div className={styles.videoInfo}>
              <div className={styles.authorInfo}>
                {currentReel.author?.profileImage ? (
                  <img 
                    src={currentReel.author.profileImage} 
                    alt={currentReel.author.name}
                    className={styles.authorAvatar}
                  />
                ) : (
                  <div className={styles.authorAvatarPlaceholder}>
                    <User size={20} />
                  </div>
                )}
                <span className={styles.authorName}>{currentReel.author?.name || 'Anonymous'}</span>
              </div>
              <h2 className={styles.videoTitle}>{currentReel.title}</h2>
              <p className={styles.videoContent}>
                {currentReel.content.length > 150 
                  ? currentReel.content.substring(0, 150) + '...' 
                  : currentReel.content}
              </p>
              {currentReel.tags && currentReel.tags.length > 0 && (
                <div className={styles.tags}>
                  {currentReel.tags.map((tag, i) => (
                    <span key={i} className={styles.tag}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button 
                className={`${styles.actionButton} ${liked[currentReel.id] ? styles.liked : ''}`}
                onClick={() => handleLike(currentReel.id)}
              >
                <Heart size={28} fill={liked[currentReel.id] ? 'currentColor' : 'none'} />
                <span>{currentReel._count?.likes || 0}</span>
              </button>
              <button className={styles.actionButton}>
                <MessageCircle size={28} />
                <span>{currentReel._count?.comments || 0}</span>
              </button>
              <button className={styles.actionButton} onClick={() => handleShare(currentReel)}>
                <Share2 size={28} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button 
          className={`${styles.navButton} ${styles.navUp} ${currentIndex === 0 ? styles.disabled : ''}`}
          onClick={goToPrevious}
          disabled={currentIndex === 0}
        >
          <ChevronUp size={32} />
        </button>
        <button 
          className={`${styles.navButton} ${styles.navDown} ${currentIndex === reels.length - 1 ? styles.disabled : ''}`}
          onClick={goToNext}
          disabled={currentIndex === reels.length - 1}
        >
          <ChevronDown size={32} />
        </button>
      </div>

      {/* Progress Indicators */}
      <div className={styles.progressContainer}>
        {reels.map((_, index) => (
          <div 
            key={index} 
            className={`${styles.progressDot} ${index === currentIndex ? styles.activeDot : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
