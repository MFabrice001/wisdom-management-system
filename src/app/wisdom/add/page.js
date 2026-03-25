'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, AlertCircle, CheckCircle, Loader2, X, Upload, FileText, Video, Brain, Mic } from 'lucide-react';
import AudioRecorder from '@/components/AudioRecorder';
import styles from './page.module.css';

export default function AddWisdomPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  // Selection state for choosing between video upload or wisdom sharing
  const [contentType, setContentType] = useState(null); // null = show selection, 'video' = video form, 'wisdom' = wisdom form
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    language: 'KINYARWANDA',
    tags: [],
    audioUrl: '',
    images: [],
    documentFile: null,
    // New: Video/Reels for youth
    videoFile: null,
    videoThumbnail: '',
    // New: Quiz questions for youth engagement
    quizzes: [],
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [userApprovedCategory, setUserApprovedCategory] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user) {
      if (session.user.role === 'ELDER' && session.user.approvedCategory) {
        setUserApprovedCategory(session.user.approvedCategory);
        setFormData(prev => ({ ...prev, category: session.user.approvedCategory }));
      } else if (session.user.role === 'ELDER' && !session.user.approvedCategory) {
        fetchFreshUserData();
      } else if (session.user.role !== 'ELDER') {
        setFormData(prev => ({ ...prev, category: 'PROVERBS' }));
      }
    }
  }, [status, router, session]);

  const fetchFreshUserData = async () => {
    try {
      const res = await fetch('/api/auth/session?update=true');
      if (res.ok) {
        const data = await res.json();
        if (data?.user?.approvedCategory) {
          setUserApprovedCategory(data.user.approvedCategory);
          setFormData(prev => ({ ...prev, category: data.user.approvedCategory }));
        } else {
          setUserApprovedCategory('UNASSIGNED');
        }
      } else {
        setUserApprovedCategory('UNASSIGNED');
      }
    } catch (error) {
      console.error('Error fetching fresh user data:', error);
      setUserApprovedCategory('UNASSIGNED');
    }
  };

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

    if (session?.user?.role === 'ELDER') {
      if (userApprovedCategory && userApprovedCategory !== 'UNASSIGNED') {
        const matched = allCategories.filter(cat => cat.value === userApprovedCategory);
        return matched.length > 0 ? matched : [{ value: userApprovedCategory, label: userApprovedCategory }];
      } else if (userApprovedCategory === 'UNASSIGNED') {
        return [{ value: '', label: '⚠️ No category assigned in database' }];
      } else {
        return [{ value: '', label: 'Loading your approved category...' }];
      }
    }
    
    return allCategories;
  };

  const languages = [
    { value: 'KINYARWANDA', label: 'Kinyarwanda' },
    { value: 'ENGLISH', label: 'English' },
    { value: 'FRENCH', label: 'French' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      
      setFormData({ ...formData, documentFile: file });
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
    setFormData({ ...formData, documentFile: null });
  };

  // Handle video upload for Reels feature
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a video file (.mp4, .webm, .mov)');
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) {
        setError('Video size must be less than 50MB');
        return;
      }
      
      setFormData({ ...formData, videoFile: file, videoThumbnail: '' });
      setError('');
    }
  };

  const handleRemoveVideo = () => {
    setFormData({ ...formData, videoFile: null, videoThumbnail: '' });
  };

  const handleVideoThumbnailChange = (e) => {
    setFormData({ ...formData, videoThumbnail: e.target.value });
  };

  // Quiz management for youth engagement
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  });

  const handleAddQuiz = () => {
    if (!newQuiz.question.trim()) {
      setError('Question is required');
      return;
    }
    if (newQuiz.options.filter(o => o.trim()).length < 2) {
      setError('At least 2 options are required');
      return;
    }
    if (!newQuiz.correctAnswer) {
      setError('Please select the correct answer');
      return;
    }

    const quiz = {
      question: newQuiz.question,
      options: newQuiz.options.filter(o => o.trim()),
      correctAnswer: newQuiz.correctAnswer,
      explanation: newQuiz.explanation
    };

    setFormData(prev => ({
      ...prev,
      quizzes: [...prev.quizzes, quiz]
    }));

    setNewQuiz({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: ''
    });
    setShowQuizBuilder(false);
  };

  const handleRemoveQuiz = (index) => {
    setFormData(prev => ({
      ...prev,
      quizzes: prev.quizzes.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...newQuiz.options];
    newOptions[index] = value;
    setNewQuiz({ ...newQuiz, options: newOptions });
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
        if (key === 'tags' || key === 'images' || key === 'quizzes') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'documentFile' && formData[key]) {
          submitData.append('document', formData[key]);
        } else if (key === 'videoFile' && formData[key]) {
          submitData.append('video', formData[key]);
        } else if (key === 'audioUrl' && formData[key] instanceof Blob) {
          // Handle audio blob - would need additional upload handling
          submitData.append(key, formData[key]);
        } else if (key !== 'documentFile' && key !== 'videoFile' && key !== 'audioUrl') {
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
        {/* Selection Screen - Show first to choose content type */}
        {contentType === null && (
          <div className={styles.selectionContainer}>
            <div className={styles.header}>
              <h1 className={styles.title}>Share Your Wisdom</h1>
              <p className={styles.subtitle}>Choose how you want to share with the community</p>
            </div>

            <div className={styles.selectionGrid}>
              {/* Option 1: Upload Reels/Short Videos */}
              <button 
                className={styles.selectionCard}
                onClick={() => setContentType('video')}
              >
                <div className={styles.selectionIcon}>
                  <Video size={48} />
                </div>
                <h3>Upload Reels</h3>
                <p>Share short videos - youth users can watch them as Reels (TikTok/Instagram style)</p>
              </button>

              {/* Option 2: Share Traditional Wisdom */}
              <button 
                className={styles.selectionCard}
                onClick={() => setContentType('wisdom')}
              >
                <div className={styles.selectionIcon}>
                  <Brain size={48} />
                </div>
                <h3>Share Wisdom</h3>
                <p>Share traditional knowledge, stories, proverbs, and cultural wisdom</p>
              </button>
            </div>
          </div>
        )}

        {/* Video Upload Form */}
        {contentType === 'video' && (
          <div className={styles.formContainer}>
            <button 
              className={styles.backButton}
              onClick={() => setContentType(null)}
            >
              <X size={20} />
              Back to Selection
            </button>
            <div className={styles.header}>
              <h1 className={styles.title}>Upload Reels</h1>
              <p className={styles.subtitle}>Share short videos with the community</p>
            </div>
            <UploadVideoForm />
          </div>
        )}

        {/* Traditional Wisdom Form */}
        {contentType === 'wisdom' && (
          <>
            <button 
              className={styles.backButton}
              onClick={() => setContentType(null)}
            >
              <X size={20} />
              Back to Selection
            </button>
            <div className={styles.header}>
              <h1 className={styles.title}>Share Your Wisdom</h1>
              <p className={styles.subtitle}>Contribute to preserving our cultural heritage</p>
            </div>

            <div className={styles.form}>
          {success && (
            <div className={styles.success}>
              <CheckCircle size={20} />
              <div>
                <p><strong>Wisdom Added Successfully!</strong></p>
                <p>Redirecting to library...</p>
              </div>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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
              disabled={session?.user?.role === 'ELDER' || loading || success}
            >
              {getAvailableCategories().map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {session?.user?.role === 'ELDER' && userApprovedCategory !== 'UNASSIGNED' && (
              <p className={styles.helpText} style={{color: 'green', marginTop: '4px'}}>
                ✓ Locked to your approved Elder category.
              </p>
            )}
            {session?.user?.role === 'ELDER' && userApprovedCategory === 'UNASSIGNED' && (
              <p className={styles.helpText} style={{color: 'red', marginTop: '4px'}}>
                ⚠️ Error: Admin approved you without assigning a category.
              </p>
            )}
          </div>

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

            <div className={styles.formGroup}>
              <label className={styles.label}>Tags (Optional)</label>
              <div className={styles.tagInput}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddTag(e);
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

            <div className={styles.formGroup}>
              <label htmlFor="audioUrl" className={styles.label}>
                <Mic size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Voice Recording (Optional)
              </label>
              <p className={styles.helpText}>For blind elders - record your wisdom using your voice</p>
              <AudioRecorder 
                onAudioReady={(url) => setFormData({ ...formData, audioUrl: url })}
                initialAudioUrl={formData.audioUrl}
              />
              <input
                id="audioUrl"
                name="audioUrl"
                type="url"
                value={formData.audioUrl}
                onChange={handleChange}
                className={styles.input}
                placeholder="Or enter audio URL manually"
                disabled={loading || success}
                style={{ marginTop: '0.5rem' }}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Supporting Document (Optional)</label>
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
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Images (Optional)</label>
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
            </div>

            {/* Video/Reels Upload Section */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Video size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Video/Reels (Optional)
              </label>
              <p className={styles.helpText}>Upload a short video - youth users can watch it as Reels</p>
              <div className={styles.fileUpload}>
                {!formData.videoFile ? (
                  <>
                    <input
                      type="file"
                      id="videoFile"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={handleVideoChange}
                      className={styles.fileInput}
                      disabled={loading || success}
                    />
                    <label htmlFor="videoFile" className={styles.fileLabel}>
                      <Video size={20} />
                      <span>Upload Video (Max 50MB)</span>
                      <small>MP4, WebM, MOV</small>
                    </label>
                  </>
                ) : (
                  <div className={styles.fileSelected}>
                    <Video size={20} />
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName}>{formData.videoFile.name}</span>
                      <small className={styles.fileSize}>
                        {(formData.videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </small>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className={styles.fileRemove}
                      disabled={loading || success}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
              {formData.videoFile && (
                <div style={{ marginTop: '1rem' }}>
                  <label className={styles.label}>Video Thumbnail URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.videoThumbnail}
                    onChange={handleVideoThumbnailChange}
                    className={styles.input}
                    placeholder="https://example.com/thumbnail.jpg"
                    disabled={loading || success}
                  />
                  <p className={styles.helpText}>Custom thumbnail for your video (optional)</p>
                </div>
              )}
            </div>

            {/* Quiz Builder Section for Youth Engagement */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Brain size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Quiz Questions for Youth (Optional)
              </label>
              <p className={styles.helpText}>Add quiz questions to make wisdom engaging for young users</p>
              
              {formData.quizzes.length > 0 && (
                <div className={styles.quizList}>
                  {formData.quizzes.map((quiz, index) => (
                    <div key={index} className={styles.quizItem}>
                      <div className={styles.quizQuestion}>
                        <strong>Q{index + 1}:</strong> {quiz.question}
                      </div>
                      <div className={styles.quizOptions}>
                        {quiz.options.map((opt, i) => (
                          <span key={i} className={quiz.correctAnswer === opt ? styles.correctOption : ''}>
                            {opt}{quiz.correctAnswer === opt && ' ✓'}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuiz(index)}
                        className={styles.removeQuizBtn}
                        disabled={loading || success}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!showQuizBuilder ? (
                <button
                  type="button"
                  onClick={() => setShowQuizBuilder(true)}
                  className={styles.addQuizButton}
                  disabled={loading || success}
                >
                  <Plus size={20} />
                  Add Quiz Question
                </button>
              ) : (
                <div className={styles.quizBuilder}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Question</label>
                    <input
                      type="text"
                      value={newQuiz.question}
                      onChange={(e) => setNewQuiz({ ...newQuiz, question: e.target.value })}
                      className={styles.input}
                      placeholder="Enter your quiz question"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Options (select correct answer)</label>
                    {newQuiz.options.map((option, index) => (
                      <div key={index} className={styles.optionRow}>
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={newQuiz.correctAnswer === option}
                          onChange={() => setNewQuiz({ ...newQuiz, correctAnswer: option })}
                          disabled={!option.trim()}
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className={styles.input}
                          placeholder={`Option ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Explanation (shown after answering)</label>
                    <textarea
                      value={newQuiz.explanation}
                      onChange={(e) => setNewQuiz({ ...newQuiz, explanation: e.target.value })}
                      className={styles.textarea}
                      placeholder="Explain the correct answer..."
                      rows={3}
                    />
                  </div>
                  
                  <div className={styles.quizBuilderButtons}>
                    <button
                      type="button"
                      onClick={handleAddQuiz}
                      className={styles.submitButton}
                      disabled={loading || success}
                    >
                      <CheckCircle size={20} />
                      Add Question
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQuizBuilder(false)}
                      className={styles.cancelButton}
                      disabled={loading || success}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.buttonGroup}>
              <button type="submit" disabled={loading || success} className={styles.submitButton}>
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
        </>
        )}
      </div>
    </div>
  );
}

// Video Upload Form Component
function UploadVideoForm() {
  const [videoFile, setVideoFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a video file (.mp4, .webm, .mov)');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Video size must be less than 50MB');
      return;
    }

    setError('');
    setVideoFile(file);
  };

  const handleUpload = async () => {
    if (!videoFile || !title.trim()) {
      setError('Please select a video and provide a title');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('title', title);
      formData.append('description', description);

      const response = await fetch('/api/wisdom', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadSuccess(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to upload video');
      }
    } catch (err) {
      setError('Error uploading video');
    } finally {
      setUploading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <div className={styles.success}>
        <CheckCircle size={48} />
        <h3>Reel Uploaded Successfully!</h3>
        <p>Your video has been shared with the community.</p>
        <button 
          className={styles.submitButton}
          onClick={() => {
            setVideoFile(null);
            setTitle('');
            setDescription('');
            setUploadSuccess(false);
          }}
        >
          Upload Another
        </button>
      </div>
    );
  }

  return (
    <div className={styles.videoForm}>
      {error && (
        <div className={styles.error}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.label}>Video File</label>
        <div className={styles.videoUploadArea}>
          {videoFile ? (
            <div className={styles.videoPreview}>
              <video src={URL.createObjectURL(videoFile)} controls />
              <button 
                type="button"
                className={styles.removeVideo}
                onClick={() => setVideoFile(null)}
              >
                <X size={16} /> Remove
              </button>
            </div>
          ) : (
            <>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoChange}
                className={styles.fileInput}
                id="videoUpload"
              />
              <label htmlFor="videoUpload" className={styles.videoUploadLabel}>
                <Upload size={32} />
                <span>Click to upload video</span>
                <span className={styles.videoHint}>MP4, WebM, MOV - Max 50MB</span>
              </label>
            </>
          )}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your reel a title..."
          className={styles.input}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Description (Optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what's in your video..."
          className={styles.textarea}
          rows={3}
        />
      </div>

      <button 
        type="button"
        onClick={handleUpload}
        disabled={uploading || !videoFile || !title.trim()}
        className={styles.submitButton}
      >
        {uploading ? (
          <>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Upload size={20} />
            <span>Upload Reel</span>
          </>
        )}
      </button>
    </div>
  );
}