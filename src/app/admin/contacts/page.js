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
  const [conversationMessages, setConversationMessages] = useState([]);
  const [loadingConversation, setLoadingConversation] = useState(false);
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
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationDetails = async (conversationId) => {
    try {
      setLoadingConversation(true);
      const response = await fetch(`/api/admin/contacts/conversation?id=${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setConversationMessages(data.conversation.messages || []);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoadingConversation(false);
    }
  };

  const handleViewContact = async (contact) => {
    setSelectedContact(contact);
    if (contact.isConversation && contact.conversationId) {
      await fetchConversationDetails(contact.conversationId);
    } else {
      setConversationMessages([]);
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
        fetchContacts();
        if (action === 'reply') {
          setReplyMessage('');
          // If replying to a conversation, refresh conversation messages
          if (selectedContact?.isConversation && selectedContact?.conversationId) {
            await fetchConversationDetails(selectedContact.conversationId);
          } else {
            setSelectedContact(null);
          }
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
            <p className={styles.subtitle}>Manage contact form submissions and elder applicant conversations</p>
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
                    <h3>{contact.name} {contact.isConversation && <span style={{ fontSize: '10px', background: '#0ea5e9', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>ELDER CHAT</span>}</h3>
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
                    onClick={() => handleViewContact(contact)}
                    className={styles.viewButton}
                  >
                    <Eye size={16} />
                    {contact.isConversation ? 'View Conversation' : 'View Details'}
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
                
                {contact._count.replies > 0 && (
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
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>{selectedContact.isConversation ? 'Conversation with Elder Applicant' : 'Contact Details'}</h2>
                <button onClick={() => { setSelectedContact(null); setConversationMessages([]); }}>×</button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.contactDetails}>
                  <div className={styles.detailRow}>
                    <strong>Name:</strong> {selectedContact.name}
                  </div>
                  <div className={styles.detailRow}>
                    <strong>Email:</strong> {selectedContact.email}
                  </div>
                  {!selectedContact.isConversation && (
                    <>
                      <div className={styles.detailRow}>
                        <strong>Subject:</strong> {selectedContact.subject}
                      </div>
                      <div className={styles.detailRow}>
                        <strong>Date:</strong> {new Date(selectedContact.createdAt).toLocaleString()}
                      </div>
                    </>
                  )}
                  <div className={styles.detailRow}>
                    <strong>Status:</strong> 
                    <span 
                      className={styles.status}
                      style={{ backgroundColor: getStatusColor(selectedContact.status) }}
                    >
                      {getStatusText(selectedContact.status)}
                    </span>
                  </div>
                </div>
                
                {selectedContact.isConversation ? (
                  /* Show conversation messages */
                  <div className={styles.messageSection}>
                    <h3>Conversation Messages</h3>
                    {loadingConversation ? (
                      <div className={styles.loading}>
                        <Loader2 className={styles.spinner} size={24} />
                      </div>
                    ) : conversationMessages.length > 0 ? (
                      <div className={styles.messageContent} style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {conversationMessages.map((msg) => (
                          <div 
                            key={msg.id} 
                            style={{ 
                              marginBottom: '12px',
                              padding: '10px',
                              borderRadius: '8px',
                              backgroundColor: msg.senderId === session?.user?.id ? '#e0f2fe' : '#f3f4f6',
                              marginLeft: msg.senderId === session?.user?.id ? '40px' : '0',
                              marginRight: msg.senderId === session?.user?.id ? '0' : '40px'
                            }}
                          >
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                              <strong>{msg.sender?.name || 'Unknown'}</strong> - {new Date(msg.createdAt).toLocaleString()}
                            </div>
                            <div>{msg.content}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No messages in this conversation yet.</p>
                    )}
                  </div>
                ) : (
                  /* Show regular contact message */
                  <div className={styles.messageSection}>
                    <h3>Message</h3>
                    <div className={styles.messageContent}>
                      {selectedContact.message}
                    </div>
                  </div>
                )}
                
                <div className={styles.replySection}>
                  <h3>Send Reply</h3>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={4}
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyMessage.trim() || sending}
                    className={styles.sendButton}
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