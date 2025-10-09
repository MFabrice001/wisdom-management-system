'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, Plus, BookOpen, Heart, MessageCircle, Eye, Loader2 } from 'lucide-react';

export default function WisdomLibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wisdoms, setWisdoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');

  const categories = [
    'ALL',
    'MARRIAGE_GUIDANCE',
    'AGRICULTURE',
    'CONFLICT_RESOLUTION',
    'HEALTH_WELLNESS',
    'MORAL_CONDUCT',
    'TRADITIONAL_CEREMONIES',
    'PROVERBS',
    'STORIES',
    'LIFE_LESSONS',
    'COMMUNITY_VALUES'
  ];

  const languages = ['ALL', 'KINYARWANDA', 'ENGLISH', 'FRENCH'];

  // Fetch wisdom entries
  useEffect(() => {
    fetchWisdoms();
  }, [selectedCategory, selectedLanguage]);

  const fetchWisdoms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (selectedLanguage !== 'ALL') params.append('language', selectedLanguage);

      const response = await fetch(`/api/wisdom?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setWisdoms(data.wisdoms || []);
      }
    } catch (error) {
      console.error('Error fetching wisdom:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter wisdoms by search term
  const filteredWisdoms = wisdoms.filter(wisdom =>
    wisdom.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wisdom.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format category name for display
  const formatCategory = (category) => {
    return category.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Wisdom Library</h1>
              <p className="text-gray-600">Explore traditional knowledge and cultural wisdom</p>
            </div>
            {session && (
              <Link
                href="/wisdom/add"
                className="inline-flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Add Wisdom</span>
              </Link>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search wisdom by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-black placeholder-gray-400"
                  style={{ color: 'black' }}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-black"
                style={{ color: 'black' }}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'ALL' ? 'All Categories' : formatCategory(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-black"
                style={{ color: 'black' }}
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang === 'ALL' ? 'All Languages' : lang.charAt(0) + lang.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredWisdoms.length}</span> results
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-green-600" />
          </div>
        )}

        {/* Wisdom Grid */}
        {!loading && filteredWisdoms.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWisdoms.map((wisdom) => (
              <WisdomCard key={wisdom.id} wisdom={wisdom} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredWisdoms.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No wisdom found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'ALL' || selectedLanguage !== 'ALL'
                ? 'Try adjusting your filters or search term'
                : 'Be the first to share wisdom with the community'}
            </p>
            {session && (
              <Link
                href="/wisdom/add"
                className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Wisdom</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Wisdom Card Component
function WisdomCard({ wisdom }) {
  const formatCategory = (category) => {
    return category.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link href={`/wisdom/${wisdom.id}`}>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 h-full flex flex-col cursor-pointer border border-gray-100 hover:border-green-500">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
            {formatCategory(wisdom.category)}
          </span>
          <span className="text-xs text-gray-500 uppercase">
            {wisdom.language}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {wisdom.title}
        </h3>

        {/* Content Preview */}
        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
          {wisdom.content}
        </p>

        {/* Tags */}
        {wisdom.tags && wisdom.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {wisdom.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{wisdom.views || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{wisdom._count?.likes || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{wisdom._count?.comments || 0}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {formatDate(wisdom.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}