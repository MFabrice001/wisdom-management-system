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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
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

        {/* FULL WIDTH HORIZONTAL LAYOUT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          
          {/* Quick Actions */}
          <div>
            <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.25rem', color: '#111827' }}>
              <Settings size={20} />
              Quick Actions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
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

          {/* Engagement Analytics */}
          <div>
            <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.25rem', color: '#111827' }}>
              <TrendingUp size={20} />
              Engagement Analytics
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
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

          {/* Elder Requests */}
          {elderRequests.length > 0 && (
            <div>
              <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.25rem', color: '#111827' }}>
                <UserCheck size={20} />
                Elder Requests ({elderRequests.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {elderRequests.map((request) => (
                  <ElderRequestCard key={request.id} request={request} onAction={handleElderRequest} onView={setSelectedRequest} />
                ))}
              </div>
            </div>
          )}
            
          {/* Top Contributors */}
          {analytics?.topContributors && analytics.topContributors.length > 0 && (
            <div>
              <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.25rem', color: '#111827' }}>
                <BarChart3 size={20} />
                Top Contributors
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {analytics.topContributors.map((contributor, index) => (
                  <ContributorCard key={contributor.id} contributor={contributor} rank={index + 1} />
                ))}
              </div>
            </div>
          )}

          {/* Top Categories */}
          {analytics?.contentAnalytics?.topCategories && analytics.contentAnalytics.topCategories.length > 0 && (
            <div>
              <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.25rem', color: '#111827' }}>
                <Calendar size={20} />
                Top Categories
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
                {analytics.contentAnalytics.topCategories.slice(0, 5).map((cat) => (
                  <CategoryCard key={cat.category} category={cat.category} count={cat._count.category} views={cat._sum.views} />
                ))}
              </div>
            </div>
          )}
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

// Subcomponents using clean layout adjustments

function StatCard({ icon: Icon, label, value, color, link }) {
  const content = (
    <>
      <div className={styles.statIcon} style={{ background: color, width: '3.5rem', height: '3.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <Icon size={24} />
      </div>
      <div className={styles.statInfo} style={{ display: 'flex', flexDirection: 'column' }}>
        <p className={styles.statValue} style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: '#111827', lineHeight: 1 }}>{value}</p>
        <p className={styles.statLabel} style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>{label}</p>
      </div>
    </>
  );

  const cardStyle = { background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '1.25rem', textDecoration: 'none', color: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };

  if (link) {
    return <Link href={link} style={cardStyle} className={styles.statCard}>{content}</Link>;
  }
  return <div style={cardStyle}>{content}</div>;
}

function ActivityCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{ background: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <div style={{ color, backgroundColor: `${color}15`, width: '3rem', height: '3rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={24} />
      </div>
      <div>
        <p style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: '#111827', lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>{label}</p>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, description, link, onClick, color, isRefreshing }) {
  const content = (
    <>
      <div style={{ background: color, width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
        <Icon size={20} color="white" className={isRefreshing ? styles.spinning : ''} />
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', margin: '0 0 0.25rem 0' }}>{title}</h3>
      <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0, lineHeight: 1.4, textAlign: 'left' }}>{description}</p>
    </>
  );

  const cardStyle = { background: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textDecoration: 'none', color: 'inherit', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer', width: '100%', height: '100%' };

  if (link) {
    return <Link href={link} style={cardStyle} className={styles.actionCard}>{content}</Link>;
  }
  return <button onClick={onClick} style={cardStyle} className={styles.actionCard} disabled={isRefreshing}>{content}</button>;
}

function ContributorCard({ contributor, rank }) {
  return (
    <Link href={`/admin/users`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #f3f4f6', textDecoration: 'none', color: 'inherit' }} className={styles.wisdomCard}>
      <div style={{ width: '2.5rem', height: '2.5rem', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#6b7280', fontSize: '1rem', flexShrink: 0 }}>
        #{rank}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: '0 0 0.35rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contributor.name}</h4>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><BookOpen size={14} />{contributor._count.wisdoms}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><MessageCircle size={14} />{contributor._count.comments}</span>
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
    <div style={{ background: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #f3f4f6', textAlign: 'center' }}>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0', fontWeight: '500' }}>{formatCategory(category)}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: '0 0 0.25rem 0' }}>{count}</p>
      <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>{views || 0} views</p>
    </div>
  );
}

function ElderRequestCard({ request, onAction, onView }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #f3f4f6' }}>
      <div>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: '0 0 0.25rem 0' }}>{request.user.name}</h4>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>{request.user.email}</p>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><BookOpen size={14} />{request.user._count?.wisdoms || 0} wisdoms</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><MessageCircle size={14} />{request.user._count?.comments || 0} comments</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button onClick={() => onView(request)} style={{ flex: 1, padding: '0.6rem 0.8rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '500' }}>
          <Eye size={14} /> View
        </button>
        <button onClick={() => onAction(request.user.id, 'approve')} style={{ flex: 1, padding: '0.6rem 0.8rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '500' }}>
          <Check size={14} /> Approve
        </button>
      </div>
    </div>
  );
}

function HistoryModal({ history, onClose }) {
  return (
    <div className={styles.modalOverlay} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className={styles.modalContent} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '2rem', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className={styles.modalHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className={styles.modalTitle} style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>Elder Request History</h2>
          <button onClick={onClose} className={styles.closeButton} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={24} /></button>
        </div>
        
        {history.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>No processed requests yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map((request) => (
              <div key={request.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #f3f4f6' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: '0 0 0.25rem 0' }}>{request.user.name}</h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>{request.user.email}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                    Reviewed: {new Date(request.reviewedAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ padding: '0.4rem 0.8rem', borderRadius: '0.375rem', color: 'white', fontSize: '0.875rem', fontWeight: 'bold', backgroundColor: request.status === 'APPROVED' ? '#22c55e' : '#ef4444' }}>
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
    <div className={styles.modalOverlay} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className={styles.modalContent} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '2rem', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className={styles.modalHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className={styles.modalTitle} style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>Elder Application Details</h2>
          <button onClick={onClose} className={styles.closeButton} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={24} /></button>
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
              <a href={request.cvUrl} target="_blank" rel="noopener noreferrer" style={{ flex: '0 1 auto', padding: '0.6rem 0.8rem', background: '#0ea5e9', color: 'white', borderRadius: '0.375rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '500' }}>
                <FileText size={16} /> View CV
              </a>
            )}
            {request.documentsUrl && request.documentsUrl.map((doc, idx) => (
              <a key={idx} href={doc} target="_blank" rel="noopener noreferrer" style={{ flex: '0 1 auto', padding: '0.6rem 0.8rem', background: '#6366f1', color: 'white', borderRadius: '0.375rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '500' }}>
                <FileText size={16} /> Document {idx + 1}
              </a>
            ))}
          </div>
        </div>

        {showContactForm && (
          <div style={{ marginBottom: '1.5rem', backgroundColor: '#f0f9ff', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #bae6fd' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#0369a1', margin: '0 0 0.5rem 0' }}>Send Message to Applicant</h4>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Type your message here... They will receive an email."
              rows={4}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', marginBottom: '1rem', resize: 'vertical', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowContactForm(false)} style={{ padding: '0.6rem 0.8rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}>
                Cancel
              </button>
              <button onClick={handleSendEmail} disabled={sendingEmail || !contactMessage.trim()} style={{ padding: '0.6rem 0.8rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '500' }}>
                {sendingEmail ? <Loader2 size={16} className={styles.spinning} /> : <Send size={16} />}
                Send Email
              </button>
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          {!showContactForm && (
            <button onClick={() => setShowContactForm(true)} style={{ marginRight: 'auto', padding: '0.6rem 0.8rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '500' }}>
              <Mail size={16} /> Contact Applicant
            </button>
          )}

          <button onClick={() => { onAction(request.user.id, 'deny'); onClose(); }} style={{ padding: '0.6rem 0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '500' }}>
            <X size={16} /> Deny
          </button>
          <button onClick={() => { onAction(request.user.id, 'approve'); onClose(); }} style={{ padding: '0.6rem 0.8rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '500' }}>
            <Check size={16} /> Approve
          </button>
        </div>
      </div>
    </div>
  );
}