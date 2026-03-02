'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, AlertCircle, CheckCircle, Loader2, X, Upload, FileText } from 'lucide-react';
import styles from './page.module.css';

export default function AddWisdomPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    language: 'KINYARWANDA',
    tags: [],
    audioUrl: '',
    images: [],
    documentFile: null,
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [userApprovedCategory, setUserApprovedCategory] = useState(null);

  // Redirect if not logged in and fetch user's approved category
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user) {
      // Set approved category for elders
      if (session.user.role === 'ELDER' && session.user.approvedCategory) {
        setUserApprovedCategory(session.user.approvedCategory);
        setFormData(prev => ({ ...prev, category: session.user.approvedCategory }));
      } else if (session.user.role !== 'ELDER') {
        // Non-elders can use any category, set default
        setFormData(prev => ({ ...prev, category: 'PROVERBS' }));
      }
    }
  }, [status, router, session]);

  // Get available categories based on user role
  const getAvailableCategories = () => {
    const allCategories = [
      { value: 'MARRIAGE_GUIDANCE', label: 'Marriage Guidance' },
      { value: 'AGRICULTURE', label: 'Agriculture' },
      { value: 'CONFLICT_RESOLUTION', label: 'Conflict Resolution' },
      { value: 'RWANDAN_HISTORY', label: 'Rwandan History' },
      { value: 'MORAL_CONDUCT', label: 'Moral Conduct' },
      { value: 'TRADITIONAL_CEREMONIES', label: 'Traditional Ceremonies' },
      { value: 'PROVERBS', label: 'Proverbs' },
      { value: 'STORIES', label: 'Stories' },
      { value: 'LIFE_LESSONS', label: 'Life Lessons' },
      { value: 'COMMUNITY_VALUES', label: 'Community Values' },
    ];

    // If user is an elder, only show their approved category
    if (session?.user?.role === 'ELDER' && userApprovedCategory) {
      return allCategories.filter(cat => cat.value === userApprovedCategory);
    }
    
    // For admins and other users, show all categories
    return allCategories;
  };

  const languages = [
    { value: 'KINYARWANDA', label: 'Kinyarwanda' },
    { value: 'ENGLISH', label: 'English' },
    { value: 'FRENCH', label: 'French' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a PDF or Word document (.pdf, .doc, .docx)');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setFormData({
        ...formData,
        documentFile: file
      });
      setError('');
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be less than 5MB');
        return;
      }
    }

    setUploadingImages(true);
    const uploadFormData = new FormData();
    files.forEach(file => uploadFormData.append('files', file));

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...data.urls]
        }));
      } else {
        setError('Failed to upload images');
      }
    } catch (error) {
      setError('Error uploading images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const handleRemoveFile = () => {
    setFormData({
      ...formData,
      documentFile: null
    });
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.title || !formData.content || !formData.category) {
      setError('Title, content, and category are required');
      setLoading(false);
      return;
    }

    if (formData.title.length < 5) {
      setError('Title must be at least 5 characters');
      setLoading(false);
      return;
    }

    if (formData.content.length < 20) {
      setError('Content must be at least 20 characters');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'tags' || key === 'images') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'documentFile' && formData[key]) {
          submitData.append('document', formData[key]);
        } else if (key !== 'documentFile') {
          submitData.append(key, formData[key]);
        }
      });

      const response = await fetch('/api/wisdom', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add wisdom');
      }

      setSuccess(true);
      
      // Redirect to wisdom library after 2 seconds
      setTimeout(() => {
        router.push('/wisdom');
      }, 2000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <Loader2 className={styles.spinner} size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Share Your Wisdom</h1>
          <p className={styles.subtitle}>
            Contribute to preserving our cultural heritage
          </p>
        </div>

        {/* Form */}
        <div className={styles.form}>
          {/* Success Message */}
          {success && (
            <div className={styles.success}>
              <CheckCircle size={20} />
              <div>
                <p><strong>Wisdom Added Successfully!</strong></p>
                <p>Redirecting to library...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={styles.error}>
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>
                Title <span className={styles.required}>*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter a descriptive title"
                disabled={loading || success}
              />
            </div>

            {/* Content */}
            <div className={styles.formGroup}>
              <label htmlFor="content" className={styles.label}>
                Content <span className={styles.required}>*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Share the wisdom, story, or proverb..."
                disabled={loading || success}
              />
              <p className={`${styles.charCount} ${formData.content.length < 20 ? styles.charCountError : ''}`}>
                {formData.content.length} characters (minimum 20)
              </p>
            </div>

            {/* Category and Language */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Category */}
              <div className={styles.formGroup}>
                <label htmlFor="category" className={styles.label}>
                  Category <span className={styles.required}>*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={styles.select}
                  disabled={loading || success || (session?.user?.role === 'ELDER')}
                >
                  {getAvailableCategories().map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {session?.user?.role === 'ELDER' && (
                  <p className={styles.helpText}>
                    As an elder, you can only share wisdom in your approved category.
                  </p>
                )}
              </div>

              {/* Language */}
              <div className={styles.formGroup}>
                <label htmlFor="language" className={styles.label}>
                  Language <span className={styles.required}>*</span>
                </label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className={styles.select}
                  disabled={loading || success}
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Tags (Optional)</label>
              <div className={styles.tagInput}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTag(e);
                    }
                  }}
                  className={`${styles.input} ${styles.tagInputField}`}
                  placeholder="Add a tag and press Enter"
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className={styles.addButton}
                  disabled={loading || success}
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className={styles.tagList}>
                  {formData.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className={styles.tagRemove}
                        disabled={loading || success}
                      >
                        <X size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Audio URL */}
            <div className={styles.formGroup}>
              <label htmlFor="audioUrl" className={styles.label}>
                Audio URL (Optional)
              </label>
              <input
                id="audioUrl"
                name="audioUrl"
                type="url"
                value={formData.audioUrl}
                onChange={handleChange}
                className={styles.input}
                placeholder="https://example.com/audio.mp3"
                disabled={loading || success}
              />
              <p className={styles.helpText}>Link to an audio recording of the wisdom</p>
            </div>

            {/* Document Upload */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Supporting Document (Optional)
              </label>
              <div className={styles.fileUpload}>
                {!formData.documentFile ? (
                  <>
                    <input
                      type="file"
                      id="documentFile"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className={styles.fileInput}
                      disabled={loading || success}
                    />
                    <label htmlFor="documentFile" className={styles.fileLabel}>
                      <Upload size={20} />
                      <span>Upload PDF or Word Document</span>
                      <small>Max 10MB</small>
                    </label>
                  </>
                ) : (
                  <div className={styles.fileSelected}>
                    <FileText size={20} />
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName}>{formData.documentFile.name}</span>
                      <small className={styles.fileSize}>
                        {(formData.documentFile.size / (1024 * 1024)).toFixed(2)} MB
                      </small>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className={styles.fileRemove}
                      disabled={loading || success}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
              <p className={styles.helpText}>Upload a PDF or Word document with additional details</p>
            </div>

            {/* Image Upload */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Images (Optional)
              </label>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  id="imageFiles"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className={styles.fileInput}
                  disabled={loading || success || uploadingImages}
                />
                <label htmlFor="imageFiles" className={styles.fileLabel}>
                  <Upload size={20} />
                  <span>{uploadingImages ? 'Uploading...' : 'Upload Images'}</span>
                  <small>JPG, PNG, GIF (Max 5MB each)</small>
                </label>
              </div>
              {formData.images.length > 0 && (
                <div className={styles.imagePreviewGrid}>
                  {formData.images.map((url, index) => (
                    <div key={index} className={styles.imagePreview}>
                      <img src={url} alt={`Preview ${index + 1}`} className={styles.previewImg} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className={styles.removeImageBtn}
                        disabled={loading || success}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className={styles.helpText}>Upload images to make your wisdom more engaging</p>
            </div>

            {/* Buttons */}
            <div className={styles.buttonGroup}>
              <button
                type="submit"
                disabled={loading || success}
                className={styles.submitButton}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    <span>Publish Wisdom</span>
                  </>
                )}
              </button>
              <Link href="/wisdom" className={styles.cancelButton}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}