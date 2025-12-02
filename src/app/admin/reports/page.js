'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Printer, 
  Loader2,
  Calendar,
  TrendingUp,
  Users,
  BookOpen,
  MessageCircle,
  Heart,
  Award
} from 'lucide-react';
import styles from './page.module.css';

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else {
      setLoading(false);
      // Set default dates (last 30 days)
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      
      setDateRange({
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      });
    }
  }, [status, session, router]);

  const generateReport = async () => {
    try {
      setGenerating(true);
      const response = await fetch(
        `/api/admin/reports?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a printable HTML version
    const printWindow = window.open('', '', 'width=800,height=600');
    const reportHTML = document.getElementById('report-content').innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Wisdom Management System Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #22c55e; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f3f4f6; font-weight: bold; }
            .stat-card { display: inline-block; margin: 10px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .stat-value { font-size: 2em; font-weight: bold; color: #22c55e; }
            .stat-label { color: #6b7280; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${reportHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

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
        {/* Header */}
        <div className={styles.headerTop}>
          <Link href="/admin" className={styles.backButton}>
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <FileText size={32} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Generate Reports
            </h1>
            <p className={styles.subtitle}>Create comprehensive system reports</p>
          </div>
        </div>

        {/* Report Configuration */}
        <div className={styles.configSection}>
          <h2 className={styles.sectionTitle}>Report Configuration</h2>
          
          <div className={styles.dateSelector}>
            <div className={styles.formGroup}>
              <label htmlFor="startDate" className={styles.label}>
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endDate" className={styles.label}>
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className={styles.input}
              />
            </div>

            <button
              onClick={generateReport}
              disabled={generating || !dateRange.startDate || !dateRange.endDate}
              className={styles.generateButton}
            >
              {generating ? (
                <>
                  <Loader2 className={styles.spinning} size={18} />
                  Generating...
                </>
              ) : (
                <>
                  <FileText size={18} />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Report Display */}
        {reportData && (
          <>
            <div className={styles.actionBar}>
              <button onClick={handlePrint} className={styles.printButton}>
                <Printer size={18} />
                Print Report
              </button>
              <button onClick={handleDownload} className={styles.downloadButton}>
                <Download size={18} />
                Download PDF
              </button>
            </div>

            <div id="report-content" className={styles.reportContent}>
              {/* Report Header */}
              <div className={styles.reportHeader}>
                <h1 className={styles.reportTitle}>Wisdom Management System</h1>
                <h2 className={styles.reportSubtitle}>System Report</h2>
                <p className={styles.reportDate}>
                  Report Period: {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
                </p>
                <p className={styles.reportGenerated}>
                  Generated on: {new Date().toLocaleString()}
                </p>
              </div>

              {/* Executive Summary */}
              <div className={styles.reportSection}>
                <h3 className={styles.reportSectionTitle}>
                  <TrendingUp size={20} />
                  Executive Summary
                </h3>
                <div className={styles.summaryGrid}>
                  <SummaryCard
                    icon={Users}
                    label="Total Users"
                    value={reportData.summary.totalUsers}
                    color="#3b82f6"
                  />
                  <SummaryCard
                    icon={BookOpen}
                    label="Total Wisdom"
                    value={reportData.summary.totalWisdoms}
                    color="#22c55e"
                  />
                  <SummaryCard
                    icon={MessageCircle}
                    label="Total Comments"
                    value={reportData.summary.totalComments}
                    color="#a855f7"
                  />
                  <SummaryCard
                    icon={Heart}
                    label="Total Likes"
                    value={reportData.summary.totalLikes}
                    color="#ef4444"
                  />
                </div>
              </div>

              {/* User Statistics */}
              <div className={styles.reportSection}>
                <h3 className={styles.reportSectionTitle}>
                  <Users size={20} />
                  User Statistics
                </h3>
                <table className={styles.reportTable}>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Total Registered Users</td>
                      <td>{reportData.userStats.total}</td>
                    </tr>
                    <tr>
                      <td>New Users (Period)</td>
                      <td>{reportData.userStats.newUsers}</td>
                    </tr>
                    <tr>
                      <td>Active Users (Period)</td>
                      <td>{reportData.userStats.activeUsers}</td>
                    </tr>
                    <tr>
                      <td>Users by Role - Admin</td>
                      <td>{reportData.userStats.byRole.ADMIN || 0}</td>
                    </tr>
                    <tr>
                      <td>Users by Role - Elder</td>
                      <td>{reportData.userStats.byRole.ELDER || 0}</td>
                    </tr>
                    <tr>
                      <td>Users by Role - User</td>
                      <td>{reportData.userStats.byRole.USER || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Wisdom Statistics */}
              <div className={styles.reportSection}>
                <h3 className={styles.reportSectionTitle}>
                  <BookOpen size={20} />
                  Wisdom Statistics
                </h3>
                <table className={styles.reportTable}>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Total Wisdom Entries</td>
                      <td>{reportData.wisdomStats.total}</td>
                    </tr>
                    <tr>
                      <td>New Wisdom (Period)</td>
                      <td>{reportData.wisdomStats.newWisdoms}</td>
                    </tr>
                    <tr>
                      <td>Published Wisdom</td>
                      <td>{reportData.wisdomStats.published}</td>
                    </tr>
                    <tr>
                      <td>Featured Wisdom</td>
                      <td>{reportData.wisdomStats.featured}</td>
                    </tr>
                    <tr>
                      <td>Total Views</td>
                      <td>{reportData.wisdomStats.totalViews}</td>
                    </tr>
                    <tr>
                      <td>Average Views per Wisdom</td>
                      <td>{reportData.wisdomStats.avgViews}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Category Distribution */}
              <div className={styles.reportSection}>
                <h3 className={styles.reportSectionTitle}>
                  <Award size={20} />
                  Category Distribution
                </h3>
                <table className={styles.reportTable}>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Count</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.categoryStats.map((cat) => (
                      <tr key={cat.category}>
                        <td>{formatCategory(cat.category)}</td>
                        <td>{cat.count}</td>
                        <td>{cat.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Top Wisdom */}
              <div className={styles.reportSection}>
                <h3 className={styles.reportSectionTitle}>
                  <Award size={20} />
                  Top 10 Most Popular Wisdom
                </h3>
                <table className={styles.reportTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Views</th>
                      <th>Likes</th>
                      <th>Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.topWisdoms.map((wisdom, index) => (
                      <tr key={wisdom.id}>
                        <td>{index + 1}</td>
                        <td>{wisdom.title}</td>
                        <td>{wisdom.views}</td>
                        <td>{wisdom.likesCount}</td>
                        <td>{wisdom.commentsCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Engagement Statistics */}
              <div className={styles.reportSection}>
                <h3 className={styles.reportSectionTitle}>
                  <MessageCircle size={20} />
                  Engagement Statistics
                </h3>
                <table className={styles.reportTable}>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Total Comments</td>
                      <td>{reportData.engagementStats.totalComments}</td>
                    </tr>
                    <tr>
                      <td>New Comments (Period)</td>
                      <td>{reportData.engagementStats.newComments}</td>
                    </tr>
                    <tr>
                      <td>Total Likes</td>
                      <td>{reportData.engagementStats.totalLikes}</td>
                    </tr>
                    <tr>
                      <td>New Likes (Period)</td>
                      <td>{reportData.engagementStats.newLikes}</td>
                    </tr>
                    <tr>
                      <td>Total Bookmarks</td>
                      <td>{reportData.engagementStats.totalBookmarks}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Report Footer */}
              <div className={styles.reportFooter}>
                <p>This report was automatically generated by the Wisdom Management System</p>
                <p>© {new Date().getFullYear()} Umurage Wubwenge. All rights reserved.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className={styles.summaryCard}>
      <div className={styles.summaryIcon} style={{ color }}>
        <Icon size={24} />
      </div>
      <div>
        <p className={styles.summaryValue}>{value}</p>
        <p className={styles.summaryLabel}>{label}</p>
      </div>
    </div>
  );
}

// Helper function
function formatCategory(category) {
  return category.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ');
}