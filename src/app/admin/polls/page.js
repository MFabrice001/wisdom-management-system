'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit, Calendar, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function AdminPollsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else {
      fetchPolls();
    }
  }, [status, session, router]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/polls');
      if (response.ok) {
        const data = await response.json();
        setPolls(data.polls || []);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pollId) => {
    if (!confirm('Are you sure you want to delete this poll?')) return;

    try {
      const response = await fetch(`/api/polls/${pollId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPolls();
      }
    } catch (error) {
      console.error('Error deleting poll:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={48} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header with Back Button */}
        <div className={styles.headerTop}>
          <Link href="/admin" className={styles.backButton}>
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Manage Polls</h1>
            <p className={styles.subtitle}>Create and manage community polls</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className={styles.createButton}
          >
            <Plus size={20} />
            Create Poll
          </button>
        </div>

        {/* Polls List */}
        <div className={styles.pollsList}>
          {polls.length === 0 ? (
            <div className={styles.empty}>
              <p>No polls yet. Create your first poll!</p>
            </div>
          ) : (
            polls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <CreatePollModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchPolls();
          }}
        />
      )}
    </div>
  );
}

// Poll Card Component
function PollCard({ poll, onDelete }) {
  const isActive = new Date(poll.endDate) > new Date();
  const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt._count?.votes || 0), 0) || 0;

  return (
    <div className={styles.pollCard}>
      <div className={styles.pollHeader}>
        <div>
          <h3 className={styles.pollQuestion}>{poll.question}</h3>
          <div className={styles.pollMeta}>
            <span className={isActive ? styles.activeStatus : styles.endedStatus}>
              {isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {isActive ? 'Active' : 'Ended'}
            </span>
            <span className={styles.metaItem}>
              <Calendar size={14} />
              Ends: {new Date(poll.endDate).toLocaleDateString()}
            </span>
            <span className={styles.metaItem}>
              {totalVotes} votes
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(poll.id)}
          className={styles.deleteButton}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className={styles.pollOptions}>
        {poll.options?.map((option) => {
          const percentage = totalVotes > 0
            ? ((option._count?.votes || 0) / totalVotes * 100).toFixed(1)
            : 0;

          return (
            <div key={option.id} className={styles.optionResult}>
              <span>{option.text}</span>
              <div className={styles.optionBar}>
                <div
                  className={styles.optionFill}
                  style={{ width: `${percentage}%` }}
                />
                <span className={styles.optionPercentage}>
                  {percentage}% ({option._count?.votes || 0})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Create Poll Modal Component - Keep the same as before
function CreatePollModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    question: '',
    options: ['', ''],
    endDate: ''
  });

  const handleAddOption = () => {
    if (formData.options.length < 6) {
      setFormData({
        ...formData,
        options: [...formData.options, '']
      });
    }
  };

  const handleRemoveOption = (index) => {
    if (formData.options.length > 2) {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index)
      });
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.question.trim()) {
      setError('Question is required');
      return;
    }

    const validOptions = formData.options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      setError('At least 2 options are required');
      return;
    }

    if (!formData.endDate) {
      setError('End date is required');
      return;
    }

    // Check if end date is in the future
    if (new Date(formData.endDate) <= new Date()) {
      setError('End date must be in the future');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: formData.question,
          options: validOptions,
          endDate: formData.endDate
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create poll');
      }
    } catch (error) {
      setError('Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Create New Poll</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && (
            <div className={styles.error}>{error}</div>
          )}

          {/* Question */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Question *</label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className={styles.input}
              placeholder="What's your question?"
              disabled={loading}
            />
          </div>

          {/* Options */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Options *</label>
            {formData.options.map((option, index) => (
              <div key={index} className={styles.optionInput}>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className={styles.input}
                  placeholder={`Option ${index + 1}`}
                  disabled={loading}
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className={styles.removeOptionButton}
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            {formData.options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className={styles.addOptionButton}
                disabled={loading}
              >
                <Plus size={16} />
                Add Option
              </button>
            )}
          </div>

          {/* End Date */}
          <div className={styles.formGroup}>
            <label className={styles.label}>End Date *</label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className={styles.input}
              disabled={loading}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Submit Button */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className={styles.spinner} />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Create Poll
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}