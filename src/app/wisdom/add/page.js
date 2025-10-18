'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
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
    category: 'PROVERBS',
    language: 'KINYARWANDA',
    tags: [],
    audioUrl: '',
    imageUrl: '',
  });

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const categories = [
    { value: 'MARRIAGE_GUIDANCE', label: 'Marriage Guidance' },
    { value: 'AGRICULTURE', label: 'Agriculture' },
    { value: 'CONFLICT_RESOLUTION', label: 'Conflict Resolution' },
    { value: 'HEALTH_WELLNESS', label: 'Health & Wellness' },
    { value: 'MORAL_CONDUCT', label: 'Moral Conduct' },
    { value: 'TRADITIONAL_CEREMONIES', label: 'Traditional Ceremonies' },
    { value: 'PROVERBS', label: 'Proverbs' },
    { value: 'STORIES', label: 'Stories' },
    { value: 'LIFE_LESSONS', label: 'Life Lessons' },
    { value: 'COMMUNITY_VALUES', label: 'Community Values' },
  ];

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
      const response = await fetch('/api/wisdom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
                  disabled={loading || success}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
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

            {/* Image URL */}
            <div className={styles.formGroup}>
              <label htmlFor="imageUrl" className={styles.label}>
                Image URL (Optional)
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleChange}
                className={styles.input}
                placeholder="https://example.com/image.jpg"
                disabled={loading || success}
              />
              <p className={styles.helpText}>Link to a relevant image</p>
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