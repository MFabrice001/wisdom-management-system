'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ElderRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [formData, setFormData] = useState({
    reason: '',
    experience: ''
  });
  const [certificates, setCertificates] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkExistingRequest();
  }, []);

  const checkExistingRequest = async () => {
    try {
      const res = await fetch('/api/citizen/elder-request');
      if (res.ok) {
        const data = await res.json();
        if (data.request) {
          setExistingRequest(data.request);
        }
      }
    } catch (error) {
      console.error('Error checking request:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setCertificates(prev => [...prev, ...data.urls]);
      } else {
        alert('Failed to upload files');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading files');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reason || !formData.experience) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/citizen/elder-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, certificates })
      });

      if (res.ok) {
        alert('Request submitted successfully!');
        router.push('/citizen/my-requests');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error submitting request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { icon: Clock, color: 'warning', text: 'Pending Review' },
      APPROVED: { icon: CheckCircle, color: 'success', text: 'Approved' },
      REJECTED: { icon: XCircle, color: 'danger', text: 'Rejected' }
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <div className={`${styles.statusBadge} ${styles[badge.color]}`}>
        <Icon size={20} />
        <span>{badge.text}</span>
      </div>
    );
  };

  if (existingRequest) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <Link href="/citizen/my-requests" className={styles.backButton}>
            <ArrowLeft size={16} /> Back
          </Link>
          
          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <h1>Elder Request Status</h1>
              {getStatusBadge(existingRequest.status)}
            </div>

            <div className={styles.requestDetails}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Submitted:</span>
                <span>{new Date(existingRequest.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className={styles.detailRow}>
                <span className={styles.label}>Reason:</span>
                <p>{existingRequest.reason}</p>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.label}>Experience:</span>
                <p>{existingRequest.experience}</p>
              </div>

              {existingRequest.certificates?.length > 0 && (
                <div className={styles.detailRow}>
                  <span className={styles.label}>Certificates:</span>
                  <div className={styles.certificateList}>
                    {existingRequest.certificates.map((cert, idx) => (
                      <a key={idx} href={cert} target="_blank" rel="noopener noreferrer" className={styles.certLink}>
                        <FileText size={16} /> Certificate {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {existingRequest.reviewNote && (
                <div className={styles.reviewNote}>
                  <h3>Admin Review:</h3>
                  <p>{existingRequest.reviewNote}</p>
                  {existingRequest.reviewedAt && (
                    <small>Reviewed on {new Date(existingRequest.reviewedAt).toLocaleDateString()}</small>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href="/citizen/my-requests" className={styles.backButton}>
          <ArrowLeft size={16} /> Back
        </Link>

        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h1>Request Elder Status</h1>
            <p>Submit your request to become an elder and share your wisdom with the community</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Why do you want to become an elder? *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Explain your motivation and how you can contribute..."
                rows={4}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Your Experience & Qualifications *</label>
              <textarea
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="Describe your relevant experience, knowledge, and expertise..."
                rows={4}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Upload Certificates (Optional)</label>
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  id="file-upload"
                  className={styles.fileInput}
                />
                <label htmlFor="file-upload" className={styles.uploadLabel}>
                  <Upload size={24} />
                  <span>{uploading ? 'Uploading...' : 'Click to upload certificates'}</span>
                  <small>PDF, JPG, PNG (Max 5MB each)</small>
                </label>
              </div>

              {certificates.length > 0 && (
                <div className={styles.uploadedFiles}>
                  {certificates.map((cert, idx) => (
                    <div key={idx} className={styles.fileItem}>
                      <FileText size={16} />
                      <span>Certificate {idx + 1}</span>
                      <button type="button" onClick={() => setCertificates(certificates.filter((_, i) => i !== idx))}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
