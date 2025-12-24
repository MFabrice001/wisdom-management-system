'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Calendar, Users, BookOpen, MessageCircle } from 'lucide-react';
import styles from './AnalyticsChart.module.css';

export default function AnalyticsChart() {
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [timeRange]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const data = await response.json();
        // Transform analytics data for chart display
        const chartData = transformAnalyticsData(data);
        setChartData(chartData);
      } else {
        generateMockData();
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const transformAnalyticsData = (analytics) => {
    const userGrowth = analytics.userAnalytics?.growth || [];
    const dailyWisdoms = analytics.contentAnalytics?.dailyWisdoms || [];
    const dailyComments = analytics.engagement?.dailyComments || [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    
    // Create maps for quick lookup
    const userMap = {};
    const wisdomMap = {};
    const commentMap = {};
    
    userGrowth.forEach(item => {
      const date = new Date(item.createdAt).toDateString();
      userMap[date] = (userMap[date] || 0) + item._count.id;
    });
    
    dailyWisdoms.forEach(item => {
      const date = new Date(item.createdAt).toDateString();
      wisdomMap[date] = (wisdomMap[date] || 0) + item._count.id;
    });
    
    dailyComments.forEach(item => {
      const date = new Date(item.createdAt).toDateString();
      commentMap[date] = (commentMap[date] || 0) + item._count.id;
    });
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const users = userMap[dateStr] || 0;
      const wisdoms = wisdomMap[dateStr] || 0;
      const comments = commentMap[dateStr] || 0;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users,
        wisdoms,
        comments,
        engagement: users + wisdoms + comments, // Combined engagement score
      });
    }
    
    return data;
  };

  const generateMockData = () => {
    // Only use as absolute fallback - show zeros if no real data
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: 0,
        wisdoms: 0,
        comments: 0,
        engagement: 0,
      });
    }
    
    setChartData(data);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className={styles.tooltipValue}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>
          <TrendingUp size={24} />
          <h2>System Analytics</h2>
        </div>
        <div className={styles.timeRangeSelector}>
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`${styles.timeButton} ${timeRange === range ? styles.active : ''}`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartWrapper}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading analytics...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="wisdomsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="commentsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Zigzag lines with different patterns */}
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                name="New Users"
              />
              <Line
                type="monotone"
                dataKey="wisdoms"
                stroke="#22c55e"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2, fill: '#fff' }}
                name="Wisdom Posts"
              />
              <Line
                type="monotone"
                dataKey="comments"
                stroke="#a855f7"
                strokeWidth={3}
                strokeDasharray="10 5"
                dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#a855f7', strokeWidth: 2, fill: '#fff' }}
                name="Comments"
              />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="2 2"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2, fill: '#fff' }}
                name="Engagement Score"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className={styles.chartLegend}>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#3b82f6' }}></div>
          <Users size={16} />
          <span>New Users</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#22c55e' }}></div>
          <BookOpen size={16} />
          <span>Wisdom Posts</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#a855f7' }}></div>
          <MessageCircle size={16} />
          <span>Comments</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#f59e0b' }}></div>
          <TrendingUp size={16} />
          <span>Engagement</span>
        </div>
      </div>
    </div>
  );
}