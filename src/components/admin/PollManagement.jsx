'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, BarChart3, Calendar } from 'lucide-react';

export default function PollManagement() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    durationDays: 7
  });

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const res = await fetch('/api/polls?includeInactive=true');
      const data = await res.json();
      setPolls(data);
    } catch (error) {
      console.error('Failed to fetch polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    
    const validOptions = newPoll.options.filter(opt => opt.trim());
    
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    try {
      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newPoll.question,
          options: validOptions,
          durationDays: newPoll.durationDays
        })
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewPoll({ question: '', options: ['', ''], durationDays: 7 });
        fetchPolls();
      } else {
        alert('Failed to create poll');
      }
    } catch (error) {
      console.error('Create poll error:', error);
    }
  };

  const handleDeletePoll = async (id) => {
    if (!confirm('Are you sure you want to delete this poll?')) return;

    try {
      const res = await fetch(`/api/polls/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPolls();
      }
    } catch (error) {
      console.error('Delete poll error:', error);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      const res = await fetch(`/api/polls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (res.ok) {
        fetchPolls();
      }
    } catch (error) {
      console.error('Toggle poll error:', error);
    }
  };

  const addOption = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
  };

  const removeOption = (index) => {
    const options = newPoll.options.filter((_, i) => i !== index);
    setNewPoll({ ...newPoll, options });
  };

  const updateOption = (index, value) => {
    const options = [...newPoll.options];
    options[index] = value;
    setNewPoll({ ...newPoll, options });
  };

  if (loading) {
    return <div className="text-center py-8">Loading polls...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Poll Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create Poll
        </button>
      </div>

      {/* Polls List */}
      <div className="grid gap-4">
        {polls.map((poll) => {
          const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
          const isExpired = new Date() > new Date(poll.endDate);

          return (
            <div key={poll.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{poll.question}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      {totalVotes} votes
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Ends: {new Date(poll.endDate).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      poll.isActive && !isExpired 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {poll.isActive && !isExpired ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(poll.id, poll.isActive)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePoll(poll.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Poll Results */}
              <div className="space-y-2">
                {poll.options.map((opt, idx) => {
                  const percentage = totalVotes > 0 
                    ? Math.round((opt.votes / totalVotes) * 100) 
                    : 0;

                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{opt.text}</span>
                        <span className="text-gray-600">{opt.votes} votes ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create New Poll</h3>
            
            <form onSubmit={handleCreatePoll} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question</label>
                <input
                  type="text"
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Options</label>
                {newPoll.options.map((option, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                    />
                    {newPoll.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Option
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Duration (days)</label>
                <input
                  type="number"
                  value={newPoll.durationDays}
                  onChange={(e) => setNewPoll({ ...newPoll, durationDays: parseInt(e.target.value) })}
                  min="1"
                  max="90"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Poll
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}