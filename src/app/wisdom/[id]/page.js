'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Heart, MessageCircle, Eye, Calendar, User, Tag, 
  ArrowLeft, Loader2, Send, Bookmark, Share2 
} from 'lucide-react';
import styles from './WisdomDetail.module.css';

export default function WisdomDetailPage({ params }) {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const wisdomId = unwrappedParams.id;
  
  const [wisdom, setWisdom] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (wisdomId) {
      fetchWisdomDetail();
    }
  }, [wisdomId]);

  const fetchWisdomDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/wisdom/${wisdomId}`);
      if (response.ok) {
        const data = await response.json();
        setWisdom(data.wisdom);
        setComments(data.wisdom.comments || []);
        setLikeCount(data.wisdom._count?.likes || 0);
        setIsLiked(data.isLiked || false);
        setIsBookmarked(data.isBookmarked || false);
      } else {
        router.push('/wisdom');
      }
    } catch (error) {
      console.error('Error fetching wisdom:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/wisdom/${wisdomId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(data.liked ? likeCount + 1 : likeCount - 1);
      }
    } catch (error) {
      console.error('Error liking wisdom:', error);
    }
  };

  const handleBookmark = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/wisdom/${wisdomId}/bookmark`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.bookmarked);
      }
    } catch (error) {
      console.error('Error bookmarking wisdom:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!session) {
      router.push('/login');
      return;
    }

    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await fetch(`/api/wisdom/${wisdomId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: commentText }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([data.comment, ...comments]);
        setCommentText('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatCategory = (category) => {
    return category.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} />
      </div>
    );
  }

  if (!wisdom) {
    return (
      <div className={styles.notFoundContainer}>
        <div className={styles.notFoundContent}>
          <p className={styles.notFoundText}>Wisdom not found</p>
          <Link href="/wisdom" className={styles.notFoundLink}>
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Back Button */}
        <Link href="/wisdom" className={styles.backButton}>
          <ArrowLeft className={styles.backIcon} />
          <span>Back to Library</span>
        </Link>

        {/* Main Content Card */}
        <div className={styles.card}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTop}>
              <div className={styles.headerLeft}>
                <span className={styles.categoryBadge}>
                  {formatCategory(wisdom.category)}
                </span>
                <h1 className={styles.title}>
                  {wisdom.title}
                </h1>
              </div>
              <span className={styles.languageBadge}>
                {wisdom.language}
              </span>
            </div>

            {/* Author and Date */}
            <div className={styles.metadata}>
              <div className={styles.metaItem}>
                <User className={styles.metaIcon} />
                <span>{wisdom.author?.name}</span>
              </div>
              <div className={styles.metaItem}>
                <Calendar className={styles.metaIcon} />
                <span>{formatDate(wisdom.createdAt)}</span>
              </div>
              <div className={styles.metaItem}>
                <Eye className={styles.metaIcon} />
                <span>{wisdom.views} views</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            <div className={styles.prose}>
              <p>{wisdom.content}</p>
            </div>

            {/* Audio Player */}
            {wisdom.audioUrl && (
              <div className={styles.audioPlayer}>
                <audio controls>
                  <source src={wisdom.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Image */}
            {wisdom.imageUrl && (
              <div className={styles.imageContainer}>
                <img
                  src={wisdom.imageUrl}
                  alt={wisdom.title}
                  className={styles.wisdomImage}
                />
              </div>
            )}

            {/* Tags */}
            {wisdom.tags && wisdom.tags.length > 0 && (
              <div className={styles.tagsContainer}>
                {wisdom.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    <Tag className={styles.tagIcon} />
                    <span>#{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions Bar */}
          <div className={styles.actionsBar}>
            <div className={styles.actionsLeft}>
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
              >
                <Heart className={`${styles.likeIcon} ${isLiked ? styles.filled : ''}`} />
                <span>{likeCount}</span>
              </button>

              {/* Comment Count */}
              <div className={styles.commentCount}>
                <MessageCircle className={styles.commentIcon} />
                <span>{comments.length}</span>
              </div>
            </div>

            <div className={styles.actionsRight}>
              {/* Bookmark Button */}
              <button
                onClick={handleBookmark}
                className={`${styles.iconButton} ${isBookmarked ? styles.bookmarked : ''}`}
                title="Bookmark"
              >
                <Bookmark className={styles.bookmarkIcon} />
              </button>

              {/* Share Button */}
              <button
                className={styles.iconButton}
                title="Share"
              >
                <Share2 className={styles.shareIcon} />
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className={styles.commentsCard}>
          <h2 className={styles.commentsTitle}>
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          {session ? (
            <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
              <div className={styles.commentFormInner}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows="3"
                  className={styles.commentTextarea}
                  disabled={submittingComment}
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className={styles.submitButton}
                >
                  {submittingComment ? (
                    <Loader2 className={styles.submitIcon} />
                  ) : (
                    <>
                      <Send className={styles.submitIcon} />
                      <span>Post</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.loginPrompt}>
              <p>
                <Link href="/login" className={styles.loginLink}>
                  Sign in
                </Link>{' '}
                to leave a comment
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className={styles.commentsList}>
            {comments.length === 0 ? (
              <p className={styles.noComments}>
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className={styles.comment}>
                  <div className={styles.commentContent}>
                    <div className={styles.commentBody}>
                      <div className={styles.commentHeader}>
                        <p className={styles.commentAuthor}>{comment.user?.name}</p>
                        <span className={styles.commentDivider}>•</span>
                        <p className={styles.commentDate}>
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                      <p className={styles.commentText}>{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}