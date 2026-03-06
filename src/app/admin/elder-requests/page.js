'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserCheck, Loader2, CheckCircle, XCircle, Clock, ArrowLeft, Eye, BookOpen, GraduationCap, Mail, Send, X } from 'lucide-react';
import Link from 'next/link';
import { CATEGORY_QUALIFICATIONS } from '@/lib/categoryQualifications';
import styles from './page.module.css';

export default function ElderRequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState('PENDING');

  // New state for Contacting
  const [contactModal, setContactModal] = useState({ isOpen: false, request: null, message: '' });
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchRequests();
    }
  }, [session, filter]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/admin/elder-requests?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId, action, additionalData = {}) => {
    setProcessing(requestId);
    try {
      // Find the user ID based on the request ID to match your API structure
      const targetRequest = requests.find(r => r.id === requestId);
      if (!targetRequest) return;

      const res = await fetch('/api/admin/elder-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetRequest.user.id, action, ...additionalData }),
      });

      if (res.ok) {
        if (action === 'contact') {
          alert('Email sent to applicant successfully!');
        } else {
          alert(`Request ${action.toLowerCase()} successfully!`);
          fetchRequests();
        }
      } else {
        alert('Failed to process request.');
      }
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setProcessing(null);
    }
  };

  const submitContactMessage = async () => {
    if (!contactModal.message.trim()) return;
    setSendingEmail(true);
    await handleRequest(contactModal.request.id, 'contact', { customMessage: contactModal.message });
    setSendingEmail(false);
    setContactModal({ isOpen: false, request: null, message: '' });
  };

  if (!session || session.user.role !== 'ADMIN') {
    return <div className={styles.accessDenied}>Unauthorized Access</div>;
  }

  if (loading) return <div className={styles.loadingWrapper}><Loader2 className={styles.spinner} /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href="/admin" className={styles.backButton}>
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <UserCheck size={32} /> Elder Requests
            </h1>
            <p className={styles.subtitle}>Review and approve elder applications</p>
          </div>
        </div>

        <div className={styles.filters}>
          {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`${styles.filterBtn} ${filter === status ? styles.active : ''}`}
            >
              {status}
            </button>
          ))}
        </div>

        {requests.length === 0 ? (
          <div className={styles.emptyState}>No {filter.toLowerCase()} requests found.</div>
        ) : (
          <div className={styles.grid}>
            {requests.map((request) => (
              <div key={request.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.userInfo}>
                    <h3 className={styles.userName}>{request.user.name}</h3>
                    <p className={styles.userEmail}>{request.user.email}</p>
                    <p className={styles.userDetail}>National ID: {request.user.nationalId}</p>
                    <p className={styles.userDetail}>Residence: {request.user.residence}</p>
                    <p className={styles.userDetail}>Gender: {request.user.gender}</p>
                    
                    {/* Category Qualifications Reference */}
                    {request.category && (
                      <div className={styles.categoryQualifications}>
                        <h4 className={styles.categoryTitle}>
                          <BookOpen size={16} />
                          {CATEGORY_QUALIFICATIONS[request.category]?.name.en} Requirements:
                        </h4>
                        <ul className={styles.compactRequirementsList}>
                          {CATEGORY_QUALIFICATIONS[request.category]?.requiredQualifications.en.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <span className={`${styles.badge} ${styles[request.status.toLowerCase()]}`}>
                    {request.status === 'PENDING' && <Clock size={14} />}
                    {request.status === 'APPROVED' && <CheckCircle size={14} />}
                    {request.status === 'REJECTED' && <XCircle size={14} />}
                    {request.status}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  {/* Category Application Details Section */}
                  {request.category && (
                    <div className={styles.categorySection}>
                      <h4 className={styles.sectionTitle}>
                        <BookOpen size={18} />
                        Category Application Details
                      </h4>
                      
                      <div className={styles.field}>
                        <strong>Applied Category:</strong>
                        <div className={styles.categoryInfo}>
                          <BookOpen size={16} className={styles.categoryIcon} />
                          <span>{CATEGORY_QUALIFICATIONS[request.category]?.name.en || request.category}</span>
                        </div>
                      </div>
                      
                      <div className={styles.field}>
                        <strong>Category Requirements (Admin Reference):</strong>
                        <div className={styles.adminReferenceBox}>
                          <div className={styles.referenceHeader}>
                            <GraduationCap size={16} />
                            <span>Required for {CATEGORY_QUALIFICATIONS[request.category]?.name.en}</span>
                          </div>
                          <ul className={styles.requirementsList}>
                            {CATEGORY_QUALIFICATIONS[request.category]?.requiredQualifications.en.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className={styles.field}>
                        <strong>Applicant's Qualifications:</strong>
                        <div className={styles.qualificationsBox}>
                          <GraduationCap size={16} className={styles.qualIcon} />
                          <p>{request.qualifications}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Application Details Section */}
                  <div className={styles.applicationSection}>
                    <h4 className={styles.sectionTitle}>
                      <UserCheck size={18} />
                      Application Details
                    </h4>
                    
                    <div className={styles.field}>
                      <strong>Reason:</strong>
                      <p>{request.reason}</p>
                    </div>
                    <div className={styles.field}>
                      <strong>Experience:</strong>
                      <p>{request.experience}</p>
                    </div>
                    
                    {/* Documents Section */}
                    <div className={styles.documentsSection}>
                      <h5 className={styles.subSectionTitle}>Submitted Documents</h5>
                      {request.cvUrl && (
                        <div className={styles.field}>
                          <strong>CV:</strong>
                          <a href={request.cvUrl} target="_blank" rel="noopener noreferrer" className={styles.documentLink}>
                            📄 View CV
                          </a>
                        </div>
                      )}
                      {request.documentsUrl && request.documentsUrl.length > 0 && (
                        <div className={styles.field}>
                          <strong>Supporting Documents ({request.documentsUrl.length}):</strong>
                          <div className={styles.documentLinks}>
                            {request.documentsUrl.map((url, index) => (
                              <a key={index} href={url} target="_blank" rel="noopener noreferrer" className={styles.documentLink}>
                                📎 Document {index + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {request.certificates.length > 0 && (
                        <div className={styles.field}>
                          <strong>Additional Certificates:</strong>
                          <p>{request.certificates.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.meta}>
                    <span>Applied: {new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {request.status === 'PENDING' && (
                  <div className={styles.actions} style={{ flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleRequest(request.id, 'approve')}
                      disabled={processing === request.id}
                      className={styles.approveBtn}
                    >
                      {processing === request.id ? <Loader2 className={styles.spinner} size={16} /> : <CheckCircle size={16} />}
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const note = prompt('Reason for rejection (optional):');
                        if (note !== null) handleRequest(request.id, 'deny', { note });
                      }}
                      disabled={processing === request.id}
                      className={styles.rejectBtn}
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                    
                    {/* Contact Button */}
                    <button
                      onClick={() => setContactModal({ isOpen: true, request, message: '' })}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        background: '#0ea5e9', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        width: '100%',
                        justifyContent: 'center',
                        marginTop: '0.5rem'
                      }}
                    >
                      <Mail size={16} />
                      Contact Applicant
                    </button>
                  </div>
                )}

                {request.reviewNote && (
                  <div className={styles.reviewNote}>
                    <strong>Review Note:</strong> {request.reviewNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {contactModal.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem',
            maxWidth: '500px', width: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Message {contactModal.request?.user.name}</h2>
              <button onClick={() => setContactModal({ isOpen: false, request: null, message: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <p style={{ marginBottom: '1rem', color: '#4b5563', fontSize: '0.875rem' }}>
              Send an email directly to the applicant to ask for more information or clarification regarding their application.
            </p>

            <textarea
              value={contactModal.message}
              onChange={(e) => setContactModal({ ...contactModal, message: e.target.value })}
              placeholder="Type your message here..."
              rows={5}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', marginBottom: '1.5rem', resize: 'vertical' }}
            />
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setContactModal({ isOpen: false, request: null, message: '' })}
                style={{ padding: '0.5rem 1rem', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={submitContactMessage}
                disabled={sendingEmail || !contactModal.message.trim()}
                style={{ padding: '0.5rem 1rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {sendingEmail ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}