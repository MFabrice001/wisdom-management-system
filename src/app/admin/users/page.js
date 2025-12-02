'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Search, Shield, Trash2, Edit, Loader2, Mail, Calendar } from 'lucide-react';
import styles from './page.module.css';

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else {
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={48} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerTop}>
          <Link href="/admin" className={styles.backButton}>
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <Users size={32} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Manage Users
            </h1>
            <p className={styles.subtitle}>View and manage user accounts ({users.length} total)</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Users List */}
        <div className={styles.usersList}>
          {filteredUsers.length === 0 ? (
            <div className={styles.empty}>
              <Users size={64} className={styles.emptyIcon} />
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className={styles.userDetails}>
                    <h3 className={styles.userName}>{user.name}</h3>
                    <p className={styles.userEmail}>
                      <Mail size={14} />
                      {user.email}
                    </p>
                    <p className={styles.userDate}>
                      <Calendar size={14} />
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className={styles.userStats}>
                  <div className={styles.statBadge}>
                    <span className={styles.statValue}>{user._count?.wisdoms || 0}</span>
                    <span className={styles.statLabel}>Wisdom</span>
                  </div>
                  <div className={styles.statBadge}>
                    <span className={styles.statValue}>{user._count?.comments || 0}</span>
                    <span className={styles.statLabel}>Comments</span>
                  </div>
                </div>

                <div className={styles.userActions}>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className={styles.roleSelect}
                    disabled={user.id === session?.user?.id}
                  >
                    <option value="USER">User</option>
                    <option value="ELDER">Elder</option>
                    <option value="ADMIN">Admin</option>
                  </select>

                  <button
                    onClick={() => handleDelete(user.id)}
                    className={styles.deleteButton}
                    disabled={user.id === session?.user?.id}
                    title={user.id === session?.user?.id ? "You cannot delete yourself" : "Delete user"}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}