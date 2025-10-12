'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, BookOpen, TrendingUp, Award, Calendar,
  Loader2, BarChart3, Shield, Settings, Edit, Trash2, Eye, MessageSquare
} from 'lucide-react';
import PollManagement from '@/components/admin/PollManagement';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [wisdoms, setWisdoms] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/wisdom');
    } else if (status === 'authenticated') {
      fetchAdminData();
    }
  }, [status, session, router]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, wisdomsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/wisdoms')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || data);
      }
      if (wisdomsRes.ok) {
        const data = await wisdomsRes.json();
        setWisdoms(data.wisdoms || data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
        alert('User deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleDeleteWisdom = async (wisdomId) => {
    if (!confirm('Are you sure you want to delete this wisdom?')) return;
    
    try {
      const response = await fetch(`/api/admin/wisdoms/${wisdomId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setWisdoms(wisdoms.filter(w => w.id !== wisdomId));
        alert('Wisdom deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting wisdom:', error);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="w-10 h-10 text-blue-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Manage users, wisdom, and system settings</p>
            </div>
            <Link
              href="/wisdom"
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Back to Wisdom
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.overview?.totalUsers || stats?.totalUsers || 0}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Wisdom</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.overview?.totalWisdoms || stats?.totalWisdoms || 0}
                </p>
              </div>
              <BookOpen className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Comments</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats?.overview?.totalComments || stats?.totalComments || 0}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Likes</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats?.overview?.totalLikes || stats?.totalLikes || 0}
                </p>
              </div>
              <Eye className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-5 h-5 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                Users ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('wisdom')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'wisdom'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookOpen className="w-5 h-5 inline mr-2" />
                Wisdom ({wisdoms.length})
              </button>
              <button
                onClick={() => setActiveTab('polls')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'polls'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="w-5 h-5 inline mr-2" />
                Polls
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">System Overview</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">New Users (Last 30 days)</span>
                        <span className="font-semibold">
                          {stats?.recentActivity?.newUsers || stats?.newUsersWeek || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">New Wisdom (Last 30 days)</span>
                        <span className="font-semibold">
                          {stats?.recentActivity?.newWisdoms || stats?.newWisdomsWeek || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Active Users</span>
                        <span className="font-semibold">
                          {stats?.recentActivity?.activeUsers || stats?.activeToday || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveTab('polls')}
                        className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left"
                      >
                        Manage Polls
                      </button>
                      <button
                        onClick={fetchAdminData}
                        className="w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-left"
                      >
                        Refresh Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">User Management</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Joined</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">{user.name}</td>
                          <td className="py-3 px-4 text-sm">{user.email}</td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'ELDER' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.role === 'ADMIN'}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              title={user.role === 'ADMIN' ? 'Cannot delete admin' : 'Delete user'}
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Wisdom Tab */}
            {activeTab === 'wisdom' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Wisdom Management</h3>
                <div className="space-y-4">
                  {wisdoms.map((wisdom) => (
                    <div key={wisdom.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{wisdom.title}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{wisdom.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>By: {wisdom.author?.name}</span>
                            <span>Category: {wisdom.category}</span>
                            <span>Views: {wisdom.views}</span>
                            <span>Likes: {wisdom._count?.likes || 0}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/wisdom/${wisdom.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteWisdom(wisdom.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Polls Tab */}
            {activeTab === 'polls' && (
              <div>
                <PollManagement />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}