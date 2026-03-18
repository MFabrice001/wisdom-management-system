'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Mail, Search, Filter, Eye, Reply, Trash2, 
  CheckCircle, Clock, MessageSquare, ArrowLeft,
  Loader2, Calendar, User, Send
} from 'lucide-react';
import styles from './page.module.css';

export default function ContactsAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else {
      fetchContacts();
    }
  }, [status, session, router, filters]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page.toString());
      
      const response = await fetch(`/api/admin/contacts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
        setPagination(data.pagination);
        
        // If a contact is currently selected (e.g. after a reply), refresh its data in the modal
        if (selectedContact) {
          const updatedContact = data.contacts.find(c => c.id === selectedContact.id);
          if (updatedContact) setSelectedContact(updatedContact);
        }
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (contactId, action, data = {}) => {
    try {
      const response = await fetch('/api/admin/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, action, ...data })
      });
      
      if (response.ok) {
        if (action === 'reply') {
          setReplyMessage('');
          // Refresh data so the new reply shows up in the modal
          await fetchContacts(); 
        } else {
          fetchContacts();
        }
      }
    } catch (error) {
      console.error('Error handling action:', error);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) return;
    
    setSending(true);
    await handleAction(selectedContact.id, 'reply', { replyMessage });
    setSending(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return '#f59e0b';
      case 'READ': return '#3b82f6';
      case 'REPLIED': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'NEW': return 'New';
      case 'READ': return 'Read';
      case 'REPLIED': return 'Replied';
      default: return status;
    }
  };

  if (loading && contacts.length === 0) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={48} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <button onClick={() => router.back()} className={styles.backButton}>
              <ArrowLeft size={20} />
              Back
            </button>
            <h1 className={styles.title}>Contact Management</h1>
            <p className={styles.subtitle}>Manage contact form submissions</p>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className={styles.statusFilter}
          >
            <option value="">All Status</option>
            <option value="NEW">New</option>
            <option value="READ">Read</option>
            <option value="REPLIED">Replied</option>
          </select>
        </div>

        {/* Contacts List */}
        <div className={styles.contactsList}>
          {contacts.length === 0 ? (
            <div className={styles.emptyState}>
              <Mail size={48} />
              <h3>No contacts found</h3>
              <p>No contact submissions match your current filters.</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <div key={contact.id} className={styles.contactCard}>
                <div className={styles.contactHeader}>
                  <div className={styles.contactInfo}>
                    <h3>{contact.name}</h3>
                    <p>{contact.email}</p>
                  </div>
                  <div className={styles.contactMeta}>
                    <span 
                      className={styles.status}
                      style={{ backgroundColor: getStatusColor(contact.status) }}
                    >
                      {getStatusText(contact.status)}
                    </span>
                    <span className={styles.date}>
                      <Calendar size={14} />
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className={styles.contactContent}>
                  <h4>{contact.subject}</h4>
                  <p>{contact.message.substring(0, 150)}...</p>
                </div>
                
                <div className={styles.contactActions}>
                  <button
                    onClick={() => setSelectedContact(contact)}
                    className={styles.viewButton}
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  
                  {contact.status === 'NEW' && (
                    <button
                      onClick={() => handleAction(contact.id, 'mark_read')}
                      className={styles.markReadButton}
                    >
                      <CheckCircle size={16} />
                      Mark Read
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleAction(contact.id, 'delete')}
                    className={styles.deleteButton}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
                
                {contact._count?.replies > 0 && (
                  <div className={styles.replyCount}>
                    <MessageSquare size={14} />
                    {contact._count.replies} replies
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className={styles.pagination}>
            <button
              disabled={filters.page === 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </button>
            <span>Page {filters.page} of {pagination.pages}</span>
            <button
              disabled={filters.page === pagination.pages}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </button>
          </div>
        )}

        {/* Contact Detail Modal */}
        {selectedContact && (
          <div className={styles.modal}>
            <div className={styles.modalContent} style={{ maxWidth: '800px' }}>
              <div className={styles.modalHeader}>
                <h2>Contact Details</h2>
                <button onClick={() => setSelectedContact(null)}>×</button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.contactDetails} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div className={styles.detailRow}>
                    <strong>Name:</strong> {selectedContact.name}
                  </div>
                  <div className={styles.detailRow}>
                    <strong>Email:</strong> {selectedContact.email}
                  </div>
                  <div className={styles.detailRow}>
                    <strong>Subject:</strong> {selectedContact.subject}
                  </div>
                  <div className={styles.detailRow}>
                    <strong>Date:</strong> {new Date(selectedContact.createdAt).toLocaleString()}
                  </div>
                  <div className={styles.detailRow}>
                    <strong>Status:</strong> 
                    <span 
                      className={styles.status}
                      style={{ backgroundColor: getStatusColor(selectedContact.status), marginLeft: '0.5rem' }}
                    >
                      {getStatusText(selectedContact.status)}
                    </span>
                  </div>
                </div>
                
                <div className={styles.messageSection}>
                  <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#475569', fontSize: '0.875rem', textTransform: 'uppercase' }}>Original Message:</strong>
                    <div style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', color: '#1e293b' }}>
                      {selectedContact.message}
                    </div>
                  </div>

                  {/* Display Conversation History (Replies) */}
                  {selectedContact.replies && selectedContact.replies.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <strong style={{ color: '#475569', fontSize: '0.875rem', textTransform: 'uppercase' }}>Your Sent Replies:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                        {selectedContact.replies.map((reply, idx) => (
                          <div key={reply.id || idx} style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem', borderLeft: '4px solid #3b82f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                              <span style={{ fontWeight: 'bold', color: '#1d4ed8' }}>Admin Reply</span>
                              <span>{new Date(reply.createdAt).toLocaleString()}</span>
                            </div>
                            <p style={{ whiteSpace: 'pre-wrap', margin: 0, color: '#1e293b' }}>{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className={styles.replySection} style={{ marginTop: '2rem' }}>
                  <h3>Send a New Reply</h3>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={4}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', marginBottom: '1rem' }}
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyMessage.trim() || sending}
                    className={styles.sendButton}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                  >
                    {sending ? (
                      <Loader2 size={16} className={styles.spinning} />
                    ) : (
                      <Send size={16} />
                    )}
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}