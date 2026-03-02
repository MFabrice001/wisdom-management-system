'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserCheck, Loader2, CheckCircle, XCircle, Clock, ArrowLeft, Eye, BookOpen, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { CATEGORY_QUALIFICATIONS } from '@/lib/categoryQualifications';
import styles from './page.module.css';

export default function ElderRequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState('PENDING');

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

  const handleRequest = async (requestId, action, note = '') => {
    setProcessing(requestId);
    try {
      const res = await fetch(`/api/admin/elder-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note }),
      });

      if (res.ok) {
        alert(`Request ${action.toLowerCase()} successfully!`);
        fetchRequests();
      } else {
        alert('Failed to process request.');
      }
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setProcessing(null);
    }
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
                  </div>
                  <span className={`${styles.badge} ${styles[request.status.toLowerCase()]}`}>
                    {request.status === 'PENDING' && <Clock size={14} />}
                    {request.status === 'APPROVED' && <CheckCircle size={14} />}
                    {request.status === 'REJECTED' && <XCircle size={14} />}
                    {request.status}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  {request.category && (
                    <div className={styles.field}>
                      <strong>Applied Category:</strong>
                      <div className={styles.categoryInfo}>
                        <BookOpen size={16} className={styles.categoryIcon} />
                        <span>{CATEGORY_QUALIFICATIONS[request.category]?.name.en || request.category}</span>
                      </div>
                    </div>
                  )}
                  
                  {request.category && (
                    <div className={styles.field}>
                      <strong>Required Qualifications:</strong>
                      <div className={styles.requirementsBox}>
                        <ul className={styles.requirementsList}>
                          {CATEGORY_QUALIFICATIONS[request.category]?.requiredQualifications.en.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {request.qualifications && (
                    <div className={styles.field}>
                      <strong>Applicant's Qualifications:</strong>
                      <div className={styles.qualificationsBox}>
                        <GraduationCap size={16} className={styles.qualIcon} />
                        <p>{request.qualifications}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className={styles.field}>
                    <strong>Reason:</strong>
                    <p>{request.reason}</p>
                  </div>
                  <div className={styles.field}>
                    <strong>Experience:</strong>
                    <p>{request.experience}</p>
                  </div>
                  {request.cvUrl && (
                    <div className={styles.field}>
                      <strong>CV:</strong>
                      <a href={request.cvUrl} target="_blank" rel="noopener noreferrer" className={styles.documentLink}>
                        View CV
                      </a>
                    </div>
                  )}
                  {request.documentsUrl && request.documentsUrl.length > 0 && (
                    <div className={styles.field}>
                      <strong>Supporting Documents:</strong>
                      <div className={styles.documentLinks}>
                        {request.documentsUrl.map((url, index) => (
                          <a key={index} href={url} target="_blank" rel="noopener noreferrer" className={styles.documentLink}>
                            Document {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {request.certificates.length > 0 && (
                    <div className={styles.field}>
                      <strong>Certificates:</strong>
                      <p>{request.certificates.join(', ')}</p>
                    </div>
                  )}
                  <div className={styles.meta}>
                    <span>Applied: {new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {request.status === 'PENDING' && (
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleRequest(request.id, 'APPROVED')}
                      disabled={processing === request.id}
                      className={styles.approveBtn}
                    >
                      {processing === request.id ? <Loader2 className={styles.spinner} size={16} /> : <CheckCircle size={16} />}
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const note = prompt('Reason for rejection (optional):');
                        if (note !== null) handleRequest(request.id, 'REJECTED', note);
                      }}
                      disabled={processing === request.id}
                      className={styles.rejectBtn}
                    >
                      <XCircle size={16} />
                      Reject
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
    </div>
  );
}
