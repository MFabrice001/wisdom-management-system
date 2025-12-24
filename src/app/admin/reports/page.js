'use client';

import { useState, useEffect } from 'react';
import { Printer, BookOpen, MessageSquare, Activity, ArrowLeft, Users, FileText } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('GENERAL_SYSTEM');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = [
    { value: 'ALL', label: 'All Domains' },
    { value: 'MARRIAGE_GUIDANCE', label: 'Marriage Guidance' },
    { value: 'AGRICULTURE', label: 'Agriculture' },
    { value: 'CONFLICT_RESOLUTION', label: 'Conflict Resolution' },
    { value: 'HEALTH_WELLNESS', label: 'Health & Wellness' },
    { value: 'MORAL_CONDUCT', label: 'Moral Conduct' },
    { value: 'TRADITIONAL_CEREMONIES', label: 'Traditional Ceremonies' },
    { value: 'PROVERBS', label: 'Proverbs' },
    { value: 'STORIES', label: 'Stories' },
    { value: 'LIFE_LESSONS', label: 'Life Lessons' },
    { value: 'COMMUNITY_VALUES', label: 'Community Values' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/reports', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/reports?type=${reportType}`;
      if (reportType === 'USER_SPECIFIC') {
        if (!selectedUser) {
          alert('Please select a user');
          setLoading(false);
          return;
        }
        url += `&userId=${selectedUser}&category=${selectedCategory}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      } else {
        alert('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.page}>
      {/* Configuration Section (Hidden when printing) */}
      <div className={`${styles.configSection} print:hidden`}>
        <div className={styles.container}>
          <div className={styles.header}>
            <Link href="/admin" className={styles.backButton}>
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className={styles.title}>Generate Reports</h1>
          </div>
          
          <div className={styles.controlsCard}>
            <div className={styles.grid}>
              <button 
                onClick={() => setReportType('GENERAL_SYSTEM')}
                className={`${styles.typeButton} ${reportType === 'GENERAL_SYSTEM' ? styles.active : ''}`}
              >
                <Activity size={20} /> General System Report
              </button>
              <button 
                onClick={() => setReportType('USER_SPECIFIC')}
                className={`${styles.typeButton} ${reportType === 'USER_SPECIFIC' ? styles.active : ''}`}
              >
                <Users size={20} /> User Specific Report
              </button>
              <button 
                onClick={() => setReportType('WISDOM_ENTRIES')}
                className={`${styles.typeButton} ${reportType === 'WISDOM_ENTRIES' ? styles.active : ''}`}
              >
                <BookOpen size={20} /> Wisdom Contributors
              </button>
              <button 
                onClick={() => setReportType('SUGGESTIONS_ACTIVITY')}
                className={`${styles.typeButton} ${reportType === 'SUGGESTIONS_ACTIVITY' ? styles.active : ''}`}
              >
                <MessageSquare size={20} /> Suggestions Activity
              </button>
              <button 
                onClick={() => setReportType('SYSTEM_OVERVIEW')}
                className={`${styles.typeButton} ${reportType === 'SYSTEM_OVERVIEW' ? styles.active : ''}`}
              >
                <FileText size={20} /> System Overview
              </button>
            </div>

            {/* User Selection for User-Specific Reports */}
            {reportType === 'USER_SPECIFIC' && (
              <div className={styles.userSelection}>
                <div className={styles.selectGroup}>
                  <label>Select User:</label>
                  <select 
                    value={selectedUser} 
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Choose a user...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email}) - {user.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.selectGroup}>
                  <label>Select Domain:</label>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={styles.select}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button 
              onClick={generateReport} 
              className={styles.generateBtn}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* The Printable Report */}
      {reportData && (
        <div className={styles.reportWrapper}>
          <div className={styles.reportContainer} id="printable-area">
            {/* Header */}
            <div className={styles.reportHeader}>
              <div className={styles.headerTop}>
                <div className={styles.logoArea}>
                   <div className={styles.logoPlaceholder}>CWMS</div> 
                </div>
                <div className={styles.companyInfo}>
                  <h2 className={styles.companyName}>COMMUNITY WISDOM MANAGEMENT SYSTEM</h2>
                  <p>P.O. Box 2461, Kigali, Rwanda</p>
                  <p>Website: www.cwms.rw</p>
                </div>
              </div>
              
              <div className={styles.divider}></div>
              
              <h3 className={styles.reportTitle}>{reportData.title}</h3>
            </div>

            {/* Summary Section for General System Report */}
            {reportType === 'GENERAL_SYSTEM' && reportData.summary && (
              <div className={styles.summarySection}>
                <h4>System Statistics</h4>
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total Users:</span>
                    <span className={styles.statValue}>{reportData.summary.totalUsers}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total Wisdom Entries:</span>
                    <span className={styles.statValue}>{reportData.summary.totalWisdoms}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total Comments:</span>
                    <span className={styles.statValue}>{reportData.summary.totalComments}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total Likes:</span>
                    <span className={styles.statValue}>{reportData.summary.totalLikes}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>New Users (30 days):</span>
                    <span className={styles.statValue}>{reportData.summary.newUsersCount}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>New Wisdom (30 days):</span>
                    <span className={styles.statValue}>{reportData.summary.recentWisdomsCount}</span>
                  </div>
                </div>
                <h4 style={{marginTop: '20px'}}>Recent Activity (Last 30 Days)</h4>
              </div>
            )}

            {/* Summary Section for User-Specific Report */}
            {reportType === 'USER_SPECIFIC' && reportData.summary && (
              <div className={styles.summarySection}>
                <h4>User Summary</h4>
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total Wisdom Entries:</span>
                    <span className={styles.statValue}>{reportData.summary.totalWisdoms}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total Views:</span>
                    <span className={styles.statValue}>{reportData.summary.totalViews}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total Likes:</span>
                    <span className={styles.statValue}>{reportData.summary.totalLikes}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total Comments:</span>
                    <span className={styles.statValue}>{reportData.summary.totalComments}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  {reportType === 'GENERAL_SYSTEM' && (
                    <>
                      <th>Type</th>
                      <th>Name/Title</th>
                      <th>Email/Category</th>
                      <th>Role/Domain</th>
                      <th>Date</th>
                      <th>Details</th>
                    </>
                  )}
                  {reportType === 'USER_SPECIFIC' && (
                    <>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Views</th>
                      <th>Likes</th>
                      <th>Comments</th>
                      <th>Date</th>
                      <th>Status</th>
                    </>
                  )}
                  {reportType === 'WISDOM_ENTRIES' && (
                    <>
                      <th>Citizen Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th style={{textAlign: 'center'}}>Wisdom Entries Added</th>
                    </>
                  )}
                  {reportType === 'SUGGESTIONS_ACTIVITY' && (
                    <>
                      <th>Citizen</th>
                      <th>Suggestion Title</th>
                      <th>Status</th>
                      <th>Date</th>
                    </>
                  )}
                  {reportType === 'SYSTEM_OVERVIEW' && (
                    <>
                      <th>Metric</th>
                      <th>Value</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {reportData.items?.map((item, index) => (
                  <tr key={index}>
                    {reportType === 'GENERAL_SYSTEM' && (
                      <>
                        <td>{item.type}</td>
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        <td>{item.role}</td>
                        <td>{item.date}</td>
                        <td>{item.details}</td>
                      </>
                    )}
                    {reportType === 'USER_SPECIFIC' && (
                      <>
                        <td>{item.title}</td>
                        <td>{item.category}</td>
                        <td style={{textAlign: 'center'}}>{item.views}</td>
                        <td style={{textAlign: 'center'}}>{item.likes}</td>
                        <td style={{textAlign: 'center'}}>{item.comments}</td>
                        <td>{item.date}</td>
                        <td>{item.status}</td>
                      </>
                    )}
                    {reportType === 'WISDOM_ENTRIES' && (
                      <>
                        <td>{item.user}</td>
                        <td>{item.email}</td>
                        <td>{item.role === 'USER' ? 'Citizen' : item.role}</td>
                        <td style={{textAlign: 'center', fontWeight: 'bold'}}>{item.count}</td>
                      </>
                    )}
                    {reportType === 'SUGGESTIONS_ACTIVITY' && (
                      <>
                        <td>{item.user}</td>
                        <td>{item.title}</td>
                        <td>{item.status}</td>
                        <td>{new Date(item.date).toLocaleDateString()}</td>
                      </>
                    )}
                    {reportType === 'SYSTEM_OVERVIEW' && (
                      <>
                        <td>{item.metric}</td>
                        <td>{item.value}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Admin Only Notice */}
            <div className={styles.adminNotice}>
              <p>This report is for admin only.</p>
            </div>

            {/* Footer with Metadata */}
            <div className={styles.reportFooter}>
              <div className={styles.footerInfo}>
                <div className={styles.footerRow}>
                  <div className={styles.footerLeft}>
                    <div className={styles.footerItem}>
                      <span className={styles.footerLabel}>System Administrator</span>
                    </div>
                    <div className={styles.footerItem}>
                      <span className={styles.footerLabel}>Wisdom Management System</span>
                    </div>
                    <div className={styles.footerItem}>
                      <span className={styles.footerLabel}>Date: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className={styles.footerRight}>
                    <div className={styles.footerItem}>
                      <span className={styles.footerValue}>Musengimana Fabrice</span>
                    </div>
                    <div className={styles.footerItem}>
                      <span className={styles.footerValue}>Wisdom Preservation</span>
                    </div>
                    <div className={styles.footerItem}>
                      <span className={styles.footerValue}>Signature: _______________</span>
                    </div>
                  </div>
                </div>
                <div className={styles.copyright}>
                  ©2025 Umurage Wubwenge. All rights reserved
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handlePrint} 
            className={`${styles.fab} print:hidden`}
            title="Print Report"
          >
            <Printer size={24} />
          </button>
        </div>
      )}
    </div>
  );
}