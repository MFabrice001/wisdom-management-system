'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Heart, MessageCircle, Eye, Calendar, User, Tag, 
  ArrowLeft, Loader2, Send, Bookmark, Share2 
} from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  if (!wisdom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Wisdom not found</p>
          <Link href="/wisdom" className="text-green-600 hover:underline mt-4 inline-block">
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/wisdom"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Library</span>
        </Link>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block px-4 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full mb-3">
                  {formatCategory(wisdom.category)}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {wisdom.title}
                </h1>
              </div>
              <span className="text-sm text-gray-500 uppercase px-3 py-1 bg-gray-100 rounded">
                {wisdom.language}
              </span>
            </div>

            {/* Author and Date */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{wisdom.author?.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(wisdom.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{wisdom.views} views</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                {wisdom.content}
              </p>
            </div>

            {/* Audio Player */}
            {wisdom.audioUrl && (
              <div className="mt-6">
                <audio controls className="w-full">
                  <source src={wisdom.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Image */}
            {wisdom.imageUrl && (
              <div className="mt-6">
                <img
                  src={wisdom.imageUrl}
                  alt={wisdom.title}
                  className="w-full rounded-lg"
                />
              </div>
            )}

            {/* Tags */}
            {wisdom.tags && wisdom.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {wisdom.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    <span>#{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions Bar */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likeCount}</span>
                </button>

                {/* Comment Count */}
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                  <MessageCircle className="w-5 h-5" />
                  <span>{comments.length}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Bookmark Button */}
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-colors ${
                    isBookmarked
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Bookmark"
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>

                {/* Share Button */}
                <button
                  className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          {session ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex gap-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows="3"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-black placeholder-gray-400"
                  disabled={submittingComment}
                  style={{ color: 'black' }}
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  {submittingComment ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Post</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-blue-800">
                <Link href="/login" className="font-semibold underline">
                  Sign in
                </Link>{' '}
                to leave a comment
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="font-semibold text-gray-900">{comment.user?.name}</p>
                        <span className="text-gray-400">•</span>
                        <p className="text-sm text-gray-500">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
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