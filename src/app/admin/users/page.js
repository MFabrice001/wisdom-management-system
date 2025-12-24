'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Users, Search, Award, Loader2, CheckCircle, AlertCircle, Edit } from 'lucide-react';
import styles from './page.module.css';

export default function ManageUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [awarding, setAwarding] = useState(null);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
        fetchUsers();
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAwardBadge = async (userId, badgeType) => {
    if (!confirm(`Award "${badgeType}" badge to this citizen?`)) return;
    
    setAwarding(userId);
    try {
      const res = await fetch('/api/admin/badges/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, badgeType }),
      });

      if (res.ok) {
        alert('Badge awarded successfully!');
        fetchUsers(); // Refresh to potentially show badge status if API returns it
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to award badge.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred.');
    } finally {
      setAwarding(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    setUpdatingRole(userId);
    try {
        const res = await fetch(`/api/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
        });

        if (res.ok) {
            alert('Role updated successfully!');
            fetchUsers();
        } else {
            alert('Failed to update role.');
        }
    } catch (error) {
        console.error('Error updating role:', error);
    } finally {
        setUpdatingRole(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkEligibility = (user) => {
    if (user.role !== 'USER') return []; 

    const badges = [];
    
    // Active Voice: 5+ Comments
    if ((user._count?.comments || 0) >= 5) {
        badges.push('Active Voice');
    }
    
    // Community Pillar: 3+ Votes
    if ((user._count?.votes || 0) >= 3) {
        badges.push('Community Pillar');
    }

    // Wisdom Seeker: 5+ Bookmarks
    if ((user._count?.bookmarks || 0) >= 5) {
        badges.push('Wisdom Seeker');
    }

    return badges;
  };

  if (!session || session.user.role !== 'ADMIN') {
      return <div className={styles.loadingWrapper}>Unauthorized Access</div>;
  }

  if (loading) return <div className={styles.loadingWrapper}><Loader2 className={styles.spinner} /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
            <h1 className={styles.title}>
            <Users className={styles.titleIcon} /> Manage Users
            </h1>
            <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} size={20} />
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>User</th>
                <th className={styles.th}>Role</th>
                <th className={styles.th}>Joined</th>
                <th className={styles.th}>Badge Eligibility</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const eligibleBadges = checkEligibility(user);
                const isCitizen = user.role === 'USER';
                
                return (
                    <tr key={user.id} className={styles.tr}>
                    <td className={styles.td}>
                        <div className={styles.userName}>{user.name}</div>
                        <div className={styles.userEmail}>{user.email}</div>
                    </td>
                    <td className={styles.td}>
                        <select 
                            value={user.role} 
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            disabled={updatingRole === user.id || user.id === session.user.id}
                            className={`${styles.roleSelect} ${styles[user.role.toLowerCase()]}`}
                        >
                            <option value="USER">Citizen</option>
                            <option value="ELDER">Elder</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        {updatingRole === user.id && <Loader2 size={12} className="inline ml-2 animate-spin" />}
                    </td>
                    <td className={styles.tdText}>
                        {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className={styles.td}>
                        {eligibleBadges.length > 0 ? (
                            <div className={styles.badgesList}>
                                {eligibleBadges.map(b => (
                                    <span key={b} className={styles.eligibleBadge}>
                                        <CheckCircle size={12} /> {b}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className={styles.noEligibility}>
                                {isCitizen ? 'No tasks completed' : 'N/A'}
                            </span>
                        )}
                    </td>
                    <td className={styles.tdActions}>
                        {isCitizen && eligibleBadges.length > 0 ? (
                             <div className={styles.actionGroup}>
                                {eligibleBadges.map(badge => (
                                    <button 
                                        key={badge}
                                        onClick={() => handleAwardBadge(user.id, badge)}
                                        className={styles.awardButton}
                                        disabled={awarding === user.id}
                                        title={`Award ${badge}`}
                                    >
                                        {awarding === user.id ? <Loader2 size={12} className={styles.spinner} /> : <Award size={12} />}
                                        Award {badge}
                                    </button>
                                ))}
                             </div>
                        ) : (
                            <span className={styles.noActions}>-</span>
                        )}
                    </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
              <div className={styles.emptyState}>No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
}