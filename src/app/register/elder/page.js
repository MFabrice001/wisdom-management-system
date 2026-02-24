'use client';

import { useState } from 'react';
import { 
  BookOpen, Mail, User, AlertCircle, 
  CheckCircle, MapPin, Fingerprint, Loader2,
  Upload, FileText, X, Users
} from 'lucide-react';
import styles from './page.module.css';

export default function ElderApplicationPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nationalId: '',
    residence: '',
    gender: ''
  });
  const [cvFile, setCvFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleFileUpload = async (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('files', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const fileData = { name: file.name, url: data.urls[0] };
        
        if (fileType === 'cv') {
          setCvFile(fileData);
        } else {
          setDocumentFile(fileData);
        }
      } else {
        setError(`Failed to upload ${fileType}`);
      }
    } catch (error) {
      setError(`Error uploading ${fileType}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.nationalId || 
        !formData.residence || !formData.gender) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (!cvFile) {
      setError('CV is required');
      setLoading(false);
      return;
    }

    if (!documentFile) {
      setError('Supporting document is required');
      setLoading(false);
      return;
    }

    // Email validation
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // National ID validation
    if (!/^\d{16}$/.test(formData.nationalId)) {
      setError('Please enter a valid 16-digit National ID');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/elder-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          nationalId: formData.nationalId,
          residence: formData.residence,
          gender: formData.gender,
          cvUrl: cvFile.url,
          documentUrl: documentFile.url
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Application failed');
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        nationalId: '',
        residence: '',
        gender: ''
      });
      setCvFile(null);
      setDocumentFile(null);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <BookOpen size={32} color="white" />
          </div>
          <h2 className={styles.title}>Elder Application</h2>
          <p className={styles.subtitle}>Apply to become a community elder</p>
        </div>

        {/* Form Card */}
        <div className={styles.card}>
          {/* Success Message */}
          {success && (
            <div className={styles.success}>
              <CheckCircle className={styles.successIcon} size={20} />
              <div className={styles.successContent}>
                <p className={styles.successTitle}>Application Submitted Successfully!</p>
                <p className={styles.successText}>Your application is under review. You will receive feedback via email whether accepted or rejected.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={styles.error}>
              <AlertCircle className={styles.errorIcon} size={20} />
              <p className={styles.errorText}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
            {/* Name Field */}
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Full Name *</label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={20} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Enter your full name"
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email Address *</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="your.email@example.com"
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            {/* National ID Field */}
            <div className={styles.formGroup}>
              <label htmlFor="nationalId" className={styles.label}>National ID *</label>
              <div className={styles.inputWrapper}>
                <Fingerprint className={styles.inputIcon} size={20} />
                <input
                  id="nationalId"
                  name="nationalId"
                  type="text"
                  value={formData.nationalId}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="16-digit National ID"
                  maxLength={16}
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            {/* Residence Field */}
            <div className={styles.formGroup}>
              <label htmlFor="residence" className={styles.label}>Residence *</label>
              <div className={styles.inputWrapper}>
                <MapPin className={styles.inputIcon} size={20} />
                <input
                  id="residence"
                  name="residence"
                  type="text"
                  value={formData.residence}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="District, Sector"
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            {/* Gender Field */}
            <div className={styles.formGroup}>
              <label htmlFor="gender" className={styles.label}>Gender *</label>
              <div className={styles.inputWrapper}>
                <Users className={styles.inputIcon} size={20} />
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={styles.input}
                  disabled={loading || success}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* CV Upload */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Upload CV *</label>
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'cv')}
                  id="cv-upload"
                  className={styles.fileInput}
                  disabled={loading || success || uploading}
                />
                <label htmlFor="cv-upload" className={styles.uploadLabel}>
                  <Upload size={24} />
                  <span>{uploading ? 'Uploading...' : 'Click to upload your CV'}</span>
                  <small>PDF, DOC, DOCX (Max 5MB)</small>
                </label>
              </div>
              {cvFile && (
                <div className={styles.uploadedFile}>
                  <FileText size={16} />
                  <span>{cvFile.name}</span>
                  <button type="button" onClick={() => setCvFile(null)} className={styles.removeBtn}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Document Upload */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Supporting Document *</label>
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'document')}
                  id="doc-upload"
                  className={styles.fileInput}
                  disabled={loading || success || uploading}
                />
                <label htmlFor="doc-upload" className={styles.uploadLabel}>
                  <Upload size={24} />
                  <span>{uploading ? 'Uploading...' : 'Click to upload supporting document'}</span>
                  <small>PDF, JPG, PNG, DOC, DOCX (Max 5MB)</small>
                </label>
              </div>
              {documentFile && (
                <div className={styles.uploadedFile}>
                  <FileText size={16} />
                  <span>{documentFile.name}</span>
                  <button type="button" onClick={() => setDocumentFile(null)} className={styles.removeBtn}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <Loader2 className={styles.spinner} />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <BookOpen size={20} />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}