'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, AlertCircle, CheckCircle, Loader2, X, Upload, FileText } from 'lucide-react';

export default function AddWisdomPage() {
  const { data: session, status, update } = useSession();
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
      const res = await fetch('/api/user/refresh-session');
      if (res.ok) {
        const data = await res.json();
        if (data.user.approvedCategory) {
          setUserApprovedCategory(data.user.approvedCategory);
          setFormData(prev => ({ ...prev, category: data.user.approvedCategory }));
          await update({
            ...session,
            user: {
              ...session.user,
              approvedCategory: data.user.approvedCategory
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching fresh user data:', error);
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
      if (userApprovedCategory) {
        return allCategories.filter(cat => cat.value === userApprovedCategory);
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
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Share Your Wisdom</h1>
          <p className="mt-2 text-sm text-gray-600">Contribute to preserving our cultural heritage</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 flex items-start space-x-3">
              <CheckCircle size={20} className="text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-800">Wisdom Added Successfully!</p>
                <p className="text-sm text-green-700">Redirecting to library...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 flex items-start space-x-3 text-red-700">
              <AlertCircle size={20} className="text-red-500" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter a descriptive title"
                disabled={loading || success}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                rows="5"
                value={formData.content}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Share the wisdom, story, or proverb..."
                disabled={loading || success}
              />
              <p className={`text-xs mt-1 ${formData.content.length < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.content.length} characters (minimum 20)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={session?.user?.role === 'ELDER' || loading || success}
                >
                  {getAvailableCategories().map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {session?.user?.role === 'ELDER' && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Locked to your approved Elder category.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                  Language <span className="text-red-500">*</span>
                </label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddTag(e);
                  }}
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Add a tag and press Enter"
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  disabled={loading || success}
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1.5 inline-flex text-green-500 hover:text-green-700 focus:outline-none"
                        disabled={loading || success}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="audioUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Audio URL (Optional)
              </label>
              <input
                id="audioUrl"
                name="audioUrl"
                type="url"
                value={formData.audioUrl}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="https://example.com/audio.mp3"
                disabled={loading || success}
              />
              <p className="text-xs text-gray-500 mt-1">Link to an audio recording of the wisdom</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Document (Optional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-500 transition-colors">
                {!formData.documentFile ? (
                  <div className="space-y-1 text-center w-full">
                    <input
                      type="file"
                      id="documentFile"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="sr-only"
                      disabled={loading || success}
                    />
                    <label htmlFor="documentFile" className="cursor-pointer flex flex-col items-center text-gray-600 hover:text-green-500">
                      <Upload size={24} className="mb-2" />
                      <span className="text-sm font-medium">Upload PDF or Word Document</span>
                      <small className="text-xs text-gray-500">Max 10MB</small>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md w-full">
                    <div className="flex items-center overflow-hidden">
                      <FileText size={20} className="text-gray-400 flex-shrink-0" />
                      <div className="flex flex-col ml-3 overflow-hidden">
                        <span className="text-sm font-medium text-gray-900 truncate">{formData.documentFile.name}</span>
                        <small className="text-xs text-gray-500">
                          {(formData.documentFile.size / (1024 * 1024)).toFixed(2)} MB
                        </small>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1 hover:bg-gray-200 rounded-full text-gray-500 flex-shrink-0 ml-4"
                      disabled={loading || success}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Images (Optional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-500 transition-colors">
                <div className="space-y-1 text-center w-full">
                  <input
                    type="file"
                    id="imageFiles"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="sr-only"
                    disabled={loading || success || uploadingImages}
                  />
                  <label htmlFor="imageFiles" className="cursor-pointer flex flex-col items-center text-gray-600 hover:text-green-500">
                    <Upload size={24} className="mb-2" />
                    <span className="text-sm font-medium">{uploadingImages ? 'Uploading...' : 'Upload Images'}</span>
                    <small className="text-xs text-gray-500">JPG, PNG, GIF (Max 5MB each)</small>
                  </label>
                </div>
              </div>
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 h-24">
                      <img src={url} alt={`Preview ${index + 1}`} className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                        disabled={loading || success}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-gray-200 mt-6">
              <button 
                type="submit" 
                disabled={loading || success} 
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} className="mr-2" />
                    <span>Publish Wisdom</span>
                  </>
                )}
              </button>
              <Link 
                href="/wisdom" 
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}