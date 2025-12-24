'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileText, Download, Award, Calendar } from 'lucide-react';
import styles from './page.module.css';

export default function CertificatesPage() {
  const { data: session } = useSession();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchCertificates();
    }
  }, [session]);

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/citizen/certificates');
      if (res.ok) {
        const data = await res.json();
        setCertificates(data.certificates);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificateId) => {
    try {
      const res = await fetch(`/api/citizen/certificates/${certificateId}/download`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${certificateId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  if (!session) {
    return <div className={styles.accessDenied}>Please log in to view your certificates.</div>;
  }

  if (loading) {
    return <div className={styles.loading}>Loading certificates...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <FileText size={32} />
          <h1>My Certificates</h1>
          <p>Download your earned certificates</p>
        </div>

        {certificates.length === 0 ? (
          <div className={styles.emptyState}>
            <Award size={48} />
            <h3>No Certificates Yet</h3>
            <p>Complete the proctored quiz with a score of 70% or higher to earn your first certificate.</p>
          </div>
        ) : (
          <div className={styles.certificatesList}>
            {certificates.map((cert) => (
              <div key={cert.id} className={styles.certificateCard}>
                <div className={styles.certificateInfo}>
                  <div className={styles.certificateIcon}>
                    <Award size={24} />
                  </div>
                  <div className={styles.certificateDetails}>
                    <h3>Rwandan Wisdom Knowledge Certificate</h3>
                    <p>Certificate Number: {cert.certificateNumber}</p>
                    <div className={styles.certificateStats}>
                      <span>Score: {cert.quizAttempt.score}/{cert.quizAttempt.totalQuestions} ({cert.quizAttempt.percentage.toFixed(1)}%)</span>
                      <span className={styles.date}>
                        <Calendar size={14} />
                        {new Date(cert.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => downloadCertificate(cert.id)}
                  className={styles.downloadButton}
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}