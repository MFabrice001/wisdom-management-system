'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, BookOpen, MessageCircle, Heart, TrendingUp, Award,
  ArrowUpRight, Loader2, Settings, BarChart3, RefreshCw, FileText, Eye, Calendar, Lightbulb, UserCheck, X, Check, Mail, Send
} from 'lucide-react';
import AnalyticsChart from '@/components/admin/AnalyticsChart';
import styles from './page.module.css';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [elderRequests, setElderRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestHistory, setRequestHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else {
      fetchStats();
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const [analyticsRes, elderRequestsRes, historyRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/admin/elder-requests'),
        fetch('/api/admin/elder-requests?status=APPROVED,REJECTED')
      ]);
      
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }
      
      if (elderRequestsRes.ok) {
        const data = await elderRequestsRes.json();
        setElderRequests(data.requests || []);
      }
      
      if (historyRes.ok) {
        const data = await historyRes.json();
        setRequestHistory(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await fetchStats();
  };

  const handleElderRequest = async (userId, action, additionalData = {}) => {
    try {
      const response = await fetch('/api/admin/elder-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, ...additionalData })
      });
      
      if (response.ok) {
        if (action !== 'contact') {
          // Only remove them from the list if we approved/denied them
          setElderRequests(prev => prev.filter(req => req.user.id !== userId));
          setSelectedRequest(null);
        } else {
          alert("Message sent to applicant successfully!");
        }
      } else {
        alert("Failed to process request.");
      }
    } catch (error) {
      console.error('Error handling elder request:', error);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={48} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>Overview of system performance and management</p>
          </div>
          <div className={styles.headerActions}>
            <button onClick={handleRefresh} className={styles.refreshButton} disabled={refreshing}>
              <RefreshCw size={18} className={refreshing ? styles.spinning : ''} />
              Refresh
            </button>
            <Link href="/wisdom" className={styles.backButton}>
              <ArrowUpRight size={18} />
              View Site
            </Link>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className={styles.statsGrid}>
          <StatCard
            icon={Users}
            label="Total Users"
            value={analytics?.userAnalytics?.totalUsers || 0}
            color="linear-gradient(135deg, #3b82f6, #2563eb)"
            link="/admin/users"
          />
          <StatCard
            icon={Eye}
            label="Total Views"
            value={analytics?.contentAnalytics?.totalViews || 0}
            color="linear-gradient(135deg, #22c55e, #16a34a)"
            link="/admin/wisdoms"
          />
          <StatCard
            icon={Heart}
            label="Total Likes"
            value={analytics?.engagement?.likes || 0}
            color="linear-gradient(135deg, #f59e0b, #d97706)"
            link="/admin/likes"
          />
          <StatCard
            icon={MessageCircle}
            label="Total Comments"
            value={analytics?.engagement?.comments || 0}
            color="linear-gradient(135deg, #8b5cf6, #7c3aed)"
            link="/admin/comments"
          />
        </div>

        {/* Analytics Chart */}
        <div style={{ marginBottom: '2.5rem' }}>
          <AnalyticsChart />
        </div>

        {/* CSS MODULE MAIN LAYOUT GRID */}
        <div className={styles.mainLayout}>
          
          {/* Main Column: Quick Actions & Recent Activity */}
          <div className={styles.mainColumn}>
            
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Settings size={20} />
                Quick Actions
              </h2>
              <div className={styles.actionsGrid}>
                <ActionCard
                  icon={Mail}
                  title="Contacts"
                  description="View user messages"
                  link="/admin/contacts"
                  color="#0ea5e9"
                />
                <ActionCard
                  icon={Award}
                  title="Manage Polls"
                  description="Create community polls"
                  link="/admin/polls"
                  color="#6366f1"
                />
                <ActionCard
                  icon={Lightbulb}
                  title="Suggestions"
                  description="Review citizen ideas"
                  link="/admin/suggestions"
                  color="#f59e0b"
                />
                <ActionCard
                  icon={Users}
                  title="Users"
                  description="Manage accounts"
                  link="/admin/users"
                  color="#3b82f6"
                />
                <ActionCard
                  icon={BookOpen}
                  title="Wisdom"
                  description="Moderate entries"
                  link="/admin/wisdoms"
                  color="#22c55e"
                />
                <ActionCard
                  icon={FileText}
                  title="Reports"
                  description="System reports"
                  link="/admin/reports"
                  color="#ec4899"
                />
                <ActionCard
                  icon={UserCheck}
                  title="Elder History"
                  description="View processed requests"
                  onClick={() => setShowHistory(true)}
                  color="#8b5cf6"
                />
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <TrendingUp size={20} />
                Engagement Analytics
              </h2>
              <div className={styles.activityGrid}>
                <ActivityCard
                  icon={Users}
                  label="Active Users"
                  value={analytics?.userAnalytics?.activeUsers || 0}
                  color="#3b82f6"
                />
                <ActivityCard
                  icon={Eye}
                  label="Avg Views"
                  value={Math.round(analytics?.contentAnalytics?.avgViews || 0)}
                  color="#22c55e"
                />
                <ActivityCard
                  icon={Lightbulb}
                  label="Suggestions"
                  value={analytics?.engagement?.suggestions || 0}
                  color="#a855f7"
                />
              </div>
            </div>
          </div>

          {/* Sidebar Column: Elder Requests, Top Contributors & Categories */}
          <div className={styles.sidebarColumn}>
            
            {elderRequests.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <UserCheck size={20} />
                  Elder Requests ({elderRequests.length})
                </h2>
                <div className={styles.wisdomList}>
                  {elderRequests.map((request) => (
                    <ElderRequestCard key={request.id} request={request} onAction={handleElderRequest} onView={setSelectedRequest} />
                  ))}
                </div>
              </div>
            )}
            
            {analytics?.topContributors && analytics.topContributors.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <BarChart3 size={20} />
                  Top Contributors
                </h2>
                <div className={styles.wisdomList}>
                  {analytics.topContributors.map((contributor, index) => (
                    <ContributorCard key={contributor.id} contributor={contributor} rank={index + 1} />
                  ))}
                </div>
              </div>
            )}

            {analytics?.contentAnalytics?.topCategories && analytics.contentAnalytics.topCategories.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <Calendar size={20} />
                  Top Categories
                </h2>
                <div className={styles.categoryGrid}>
                  {analytics.contentAnalytics.topCategories.slice(0, 4).map((cat) => (
                    <CategoryCard key={cat.category} category={cat.category} count={cat._count.category} views={cat._sum.views} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {showHistory && (
          <HistoryModal 
            history={requestHistory}
            onClose={() => setShowHistory(false)}
          />
        )}
        
        {selectedRequest && (
          <ElderRequestModal 
            request={selectedRequest} 
            onClose={() => setSelectedRequest(null)}
            onAction={handleElderRequest}
          />
        )}
      </div>
    </div>
  );
}

// Subcomponents using new clean CSS Module classes

function StatCard({ icon: Icon, label, value, color, link }) {
  const content = (
    <>
      <div className={styles.statIcon} style={{ background: color }}>
        <Icon size={24} color="white" />
      </div>
      <div className={styles.statInfo}>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </>
  );

  if (link) {
    return <Link href={link} className={styles.statCard}>{content}</Link>;
  }
  return <div className={styles.statCard}>{content}</div>;
}

function ActivityCard({ icon: Icon, label, value, color }) {
  return (
    <div className={styles.activityCard}>
      <div className={styles.activityIcon} style={{ color, backgroundColor: `${color}15` }}>
        <Icon size={24} />
      </div>
      <div>
        <p className={styles.activityValue}>{value}</p>
        <p className={styles.activityLabel}>{label}</p>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, description, link, onClick, color, isRefreshing }) {
  const content = (
    <>
      <div className={styles.actionIcon} style={{ background: color }}>
        <Icon size={20} color="white" className={isRefreshing ? styles.spinning : ''} />
      </div>
      <h3 className={styles.actionTitle}>{title}</h3>
      <p className={styles.actionDescription}>{description}</p>
    </>
  );

  if (link) {
    return <Link href={link} className={styles.actionCard}>{content}</Link>;
  }
  return <button onClick={onClick} className={styles.actionCard} disabled={isRefreshing}>{content}</button>;
}

function ContributorCard({ contributor, rank }) {
  return (
    <Link href={`/admin/users`} className={styles.wisdomCard}>
      <div className={styles.wisdomHeader}>
        <div className={styles.wisdomRank}>#{rank}</div>
        <div className={styles.wisdomContent}>
          <h4 className={styles.wisdomTitle}>{contributor.name}</h4>
          <div className={styles.wisdomStats}>
            <span><BookOpen size={14} />{contributor._count.wisdoms}</span>
            <span><MessageCircle size={14} />{contributor._count.comments}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CategoryCard({ category, count, views }) {
  const formatCategory = (cat) => {
    return cat.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className={styles.categoryCard}>
      <p className={styles.categoryName}>{formatCategory(category)}</p>
      <p className={styles.categoryCount}>{count}</p>
      <p className={styles.categoryViews}>{views || 0} views</p>
    </div>
  );
}

function ElderRequestCard({ request, onAction, onView }) {
  return (
    <div className={styles.wisdomCard}>
      <div className={styles.wisdomContent}>
        <h4 className={styles.wisdomTitle}>{request.user.name}</h4>
        <p className={styles.wisdomSubtitle}>{request.user.email}</p>
        <div className={styles.wisdomStats}>
          <span><BookOpen size={14} />{request.user._count?.wisdoms || 0} wisdoms</span>
          <span><MessageCircle size={14} />{request.user._count?.comments || 0} comments</span>
        </div>
      </div>
      <div className={styles.wisdomActions}>
        <button onClick={() => onView(request)} className={`${styles.actionBtn} ${styles.btnBlue}`}>
          <Eye size={14} /> View
        </button>
        <button onClick={() => onAction(request.user.id, 'approve')} className={`${styles.actionBtn} ${styles.btnGreen}`}>
          <Check size={14} /> Approve
        </button>
      </div>
    </div>
  );
}

function HistoryModal({ history, onClose }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Elder Request History</h2>
          <button onClick={onClose} className={styles.closeButton}><X size={24} /></button>
        </div>
        
        {history.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>No processed requests yet.</p>
        ) : (
          <div className={styles.wisdomList}>
            {history.map((request) => (
              <div key={request.id} className={styles.wisdomCard} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 className={styles.wisdomTitle}>{request.user.name}</h4>
                  <p className={styles.wisdomSubtitle}>{request.user.email}</p>
                  <p className={styles.wisdomSubtitle} style={{ marginBottom: 0 }}>
                    Reviewed: {new Date(request.reviewedAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '0.375rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  backgroundColor: request.status === 'APPROVED' ? '#22c55e' : '#ef4444'
                }}>
                  {request.status === 'APPROVED' ? 'Approved' : 'Denied'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ElderRequestModal({ request, onClose, onAction }) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendEmail = async () => {
    if (!contactMessage.trim()) return;
    setSendingEmail(true);
    await onAction(request.user.id, 'contact', { 
      customMessage: contactMessage,
      subject: 'Message regarding your Elder Application'
    });
    setSendingEmail(false);
    setShowContactForm(false);
    setContactMessage('');
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Elder Application Details</h2>
          <button onClick={onClose} className={styles.closeButton}><X size={24} /></button>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Applicant Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', fontSize: '0.95rem' }}>
            <div><strong>Name:</strong> {request.user.name}</div>
            <div><strong>Email:</strong> {request.user.email}</div>
            <div><strong>National ID:</strong> {request.user.nationalId}</div>
            <div><strong>Residence:</strong> {request.user.residence}</div>
            <div><strong>Gender:</strong> {request.user.gender}</div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <strong>Reason:</strong>
            <p style={{ marginTop: '0.5rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem', fontSize: '0.95rem' }}>
              {request.reason}
            </p>
          </div>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Documents</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {request.cvUrl && (
              <a href={request.cvUrl} target="_blank" rel="noopener noreferrer" className={`${styles.actionBtn} ${styles.btnBlue}`} style={{flex: '0 1 auto'}}>
                <FileText size={16} /> View CV
              </a>
            )}
            {request.documentsUrl && request.documentsUrl.map((doc, idx) => (
              <a key={idx} href={doc} target="_blank" rel="noopener noreferrer" className={`${styles.actionBtn} ${styles.btnBlue}`} style={{background: '#6366f1', flex: '0 1 auto'}}>
                <FileText size={16} /> Document {idx + 1}
              </a>
            ))}
          </div>
        </div>

        {showContactForm && (
          <div className={styles.contactBox}>
            <h4>Send Message to Applicant</h4>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Type your message here... They will receive an email."
              rows={4}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowContactForm(false)} className={styles.actionBtn} style={{ background: '#e2e8f0', color: '#475569', flex: 'none' }}>
                Cancel
              </button>
              <button onClick={handleSendEmail} disabled={sendingEmail || !contactMessage.trim()} className={`${styles.actionBtn} ${styles.btnBlue}`} style={{ flex: 'none' }}>
                {sendingEmail ? <Loader2 size={16} className={styles.spinning} /> : <Send size={16} />}
                Send Email
              </button>
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          {!showContactForm && (
            <button onClick={() => setShowContactForm(true)} className={`${styles.actionBtn} ${styles.btnBlue}`} style={{ marginRight: 'auto', flex: 'none' }}>
              <Mail size={16} /> Contact Applicant
            </button>
          )}

          <button onClick={() => { onAction(request.user.id, 'deny'); onClose(); }} className={`${styles.actionBtn} ${styles.btnRed}`} style={{ flex: 'none' }}>
            <X size={16} /> Deny
          </button>
          <button onClick={() => { onAction(request.user.id, 'approve'); onClose(); }} className={`${styles.actionBtn} ${styles.btnGreen}`} style={{ flex: 'none' }}>
            <Check size={16} /> Approve
          </button>
        </div>
      </div>
    </div>
  );
}