'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Mail, Calendar, Edit2, Save, X, Loader2, 
  BookOpen, Heart, MessageCircle, Award 
} from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [userWisdoms, setUserWisdoms] = useState([]);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          name: data.user.name,
          bio: data.user.bio || '',
        });
        setUserStats(data.stats);
        setUserWisdoms(data.wisdoms);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        setIsEditing(false);
        // Optionally refresh session
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCategory = (category) => {
    return category.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 h-32"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16">
              <div className="flex items-end space-x-4">
                <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-white font-bold text-4xl">
                    {session?.user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="mb-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="text-3xl font-bold text-gray-900 border-b-2 border-green-500 focus:outline-none bg-white text-black"
                      style={{ color: 'black' }}
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-gray-900">{profileData.name}</h1>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{session?.user.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Joined {formatDate(session?.user.createdAt || new Date())}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 mb-4">
                {isEditing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setProfileData({
                          name: session?.user.name || '',
                          bio: userStats?.bio || '',
                        });
                      }}
                      className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Bio</h3>
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-black placeholder-gray-400"
                  placeholder="Tell us about yourself..."
                  style={{ color: 'black' }}
                />
              ) : (
                <p className="text-gray-600">
                  {profileData.bio || 'No bio added yet. Click Edit Profile to add one.'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Wisdom Shared</p>
                <p className="text-3xl font-bold text-green-600">{userStats?.wisdomCount || 0}</p>
              </div>
              <BookOpen className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Likes</p>
                <p className="text-3xl font-bold text-red-600">{userStats?.totalLikes || 0}</p>
              </div>
              <Heart className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Comments Made</p>
                <p className="text-3xl font-bold text-blue-600">{userStats?.commentCount || 0}</p>
              </div>
              <MessageCircle className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Views</p>
                <p className="text-3xl font-bold text-purple-600">{userStats?.totalViews || 0}</p>
              </div>
              <Award className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* My Wisdom Entries */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Wisdom Entries</h2>
            <Link
              href="/wisdom/add"
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Add New +
            </Link>
          </div>

          {userWisdoms.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">You haven't shared any wisdom yet</p>
              <Link
                href="/wisdom/add"
                className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                <span>Share Your First Wisdom</span>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {userWisdoms.map((wisdom) => (
                <Link key={wisdom.id} href={`/wisdom/${wisdom.id}`}>
                  <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-green-500 transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        {formatCategory(wisdom.category)}
                      </span>
                      <span className="text-xs text-gray-500 uppercase">
                        {wisdom.language}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                      {wisdom.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {wisdom.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{wisdom._count?.likes || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{wisdom._count?.comments || 0}</span>
                        </div>
                      </div>
                      <span className="text-xs">{formatDate(wisdom.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}