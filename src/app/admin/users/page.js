'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Users, Search, Loader2, Edit, Trash2, Plus, UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from './page.module.css';

export default function ManageUsersPage() {
  const { language } = useLanguage();
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'USER' });

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
        console.log('Fetched users:', data);
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users:', res.status);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
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

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('User deleted successfully!');
        fetchUsers();
        setShowDeleteModal(false);
        setSelectedUser(null);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete user.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred.');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    setAdding(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        alert('User added successfully!');
        fetchUsers();
        setShowAddModal(false);
        setNewUser({ name: '', email: '', role: 'USER' });
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to add user.');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('An error occurred.');
    } finally {
      setAdding(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!session || session.user.role !== 'ADMIN') {
      return <div className={styles.loadingWrapper}>Unauthorized Access</div>;
  }

  if (loading) return <div className={styles.loadingWrapper}><Loader2 className={styles.spinner} /></div>;

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
            <h1 className={styles.title}>
            <Users className={styles.titleIcon} /> Manage Users ({users.length})
            </h1>
            <div className={styles.headerActions}>
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
                <button 
                    onClick={() => setShowAddModal(true)}
                    className={styles.addButton}
                >
                    <UserPlus size={20} />
                    Add User
                </button>
            </div>
        </div>

        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>User</th>
                <th className={styles.th}>Role</th>
                <th className={styles.th}>Joined</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
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
                    <td className={styles.tdActions}>
                        <div className={styles.actionGroup}>
                            {user.id !== session.user.id && (
                                <button 
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setShowDeleteModal(true);
                                    }}
                                    className={styles.deleteButton}
                                    title="Delete User"
                                >
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
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

        {/* Add User Modal */}
        {showAddModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3 className={styles.modalTitle}>Add New User</h3>
              <form onSubmit={handleAddUser} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className={styles.select}
                  >
                    <option value="USER">Citizen</option>
                    <option value="ELDER">Elder</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={styles.cancelButton}
                    disabled={adding}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={adding}
                  >
                    {adding ? (
                      <>
                        <Loader2 className={styles.spinner} />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Add User
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className={styles.modalOverlay}>
            <div className={styles.deleteModal}>
              <h3 className={styles.deleteModalTitle}>Delete User</h3>
              <p className={styles.deleteModalText}>
                Are you sure you want to delete <strong>{selectedUser.name}</strong>? This action cannot be undone.
              </p>
              <div className={styles.modalActions}>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  className={styles.cancelButton}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className={styles.deleteConfirmButton}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className={styles.spinner} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}