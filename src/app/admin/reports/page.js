'use client';

import { useState, useEffect } from 'react';
import { Printer, BookOpen, MessageSquare, Activity, ArrowLeft, Users, FileText, Calendar, X } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from './page.module.css';

export default function ReportsPage() {
  const { language } = useLanguage();
  const [reportType, setReportType] = useState('GENERAL_SYSTEM');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
      
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
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
              <button 
                onClick={() => setReportType('QUIZ_ATTEMPTS')}
                className={`${styles.typeButton} ${reportType === 'QUIZ_ATTEMPTS' ? styles.active : ''}`}
              >
                <FileText size={20} /> Quiz Attempts
              </button>
              <button 
                onClick={() => setReportType('CERTIFICATES_BADGES')}
                className={`${styles.typeButton} ${reportType === 'CERTIFICATES_BADGES' ? styles.active : ''}`}
              >
                <FileText size={20} /> Certificates & Badges
              </button>
              <button 
                onClick={() => setReportType('POLLS_REPORT')}
                className={`${styles.typeButton} ${reportType === 'POLLS_REPORT' ? styles.active : ''}`}
              >
                <FileText size={20} /> Polls Report
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

            {/* Date Filter for All Report Types */}
            <div className={styles.dateFilterSection}>
              <div className={styles.dateFilterHeader}>
                <Calendar size={20} className={styles.calendarIcon} />
                <h3 className={styles.dateFilterTitle}>Date Range Filter</h3>
              </div>
              <div className={styles.dateFilter}>
                <div className={styles.dateInputWrapper}>
                  <label className={styles.dateLabel}>
                    <Calendar size={16} />
                    <span>Start Date</span>
                  </label>
                  <div className={styles.dateInputContainer}>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={styles.dateInput}
                      placeholder="Select start date"
                    />
                    {startDate && (
                      <button
                        onClick={() => setStartDate('')}
                        className={styles.clearDateBtn}
                        title="Clear date"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className={styles.dateRangeSeparator}>to</div>
                <div className={styles.dateInputWrapper}>
                  <label className={styles.dateLabel}>
                    <Calendar size={16} />
                    <span>End Date</span>
                  </label>
                  <div className={styles.dateInputContainer}>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={styles.dateInput}
                      placeholder="Select end date"
                    />
                    {endDate && (
                      <button
                        onClick={() => setEndDate('')}
                        className={styles.clearDateBtn}
                        title="Clear date"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {(startDate || endDate) && (
                <div className={styles.dateRangeInfo}>
                  {startDate && endDate ? (
                    <span>📅 Showing data from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}</span>
                  ) : startDate ? (
                    <span>📅 Showing data from {new Date(startDate).toLocaleDateString()} onwards</span>
                  ) : (
                    <span>📅 Showing data until {new Date(endDate).toLocaleDateString()}</span>
                  )}
                </div>
              )}
            </div>

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
                  <div className={styles.logo}>
                    <div className={styles.logoCircle}>UW</div>
                    <div className={styles.logoText}>
                      <div className={styles.logoLine1}>UMURAGE</div>
                      <div className={styles.logoLine2}>WUBWENGE</div>
                    </div>
                  </div>
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

            {/* Table */}
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>No.</th>
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
                  {reportType === 'QUIZ_ATTEMPTS' && (
                    <>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Time (mins)</th>
                      <th>Attempts</th>
                      <th>Date</th>
                    </>
                  )}
                  {reportType === 'CERTIFICATES_BADGES' && (
                    <>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Type</th>
                      <th>Details</th>
                      <th>Date</th>
                    </>
                  )}
                  {reportType === 'POLLS_REPORT' && (
                    <>
                      <th>Poll Question</th>
                      <th>Total Votes</th>
                      <th>Voters</th>
                      <th>Status</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {reportData.items?.map((item, index) => (
                  <tr key={index}>
                    <td style={{textAlign: 'center', fontWeight: 'bold'}}>{index + 1}</td>
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
                    {reportType === 'QUIZ_ATTEMPTS' && (
                      <>
                        <td>{item.userName}</td>
                        <td>{item.email}</td>
                        <td style={{textAlign: 'center'}}>{item.score}/{item.totalQuestions}</td>
                        <td style={{textAlign: 'center'}}>{item.percentage}%</td>
                        <td style={{textAlign: 'center'}}>{item.timeSpent}</td>
                        <td style={{textAlign: 'center'}}>{item.attempts}</td>
                        <td>{item.date}</td>
                      </>
                    )}
                    {reportType === 'CERTIFICATES_BADGES' && (
                      <>
                        <td>{item.userName}</td>
                        <td>{item.email}</td>
                        <td>{item.type}</td>
                        <td>{item.details}</td>
                        <td>{item.date}</td>
                      </>
                    )}
                    {reportType === 'POLLS_REPORT' && (
                      <>
                        <td>{item.question}</td>
                        <td style={{textAlign: 'center'}}>{item.totalVotes}</td>
                        <td>{item.voters}</td>
                        <td>{item.status}</td>
                        <td>{item.startDate}</td>
                        <td>{item.endDate}</td>
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