import React, { useState, useEffect } from 'react'
import API, { submitFeedback, getUserFeedback } from '../services/api'

export default function Feedback() {
  const [activeTab, setActiveTab] = useState('submit')
  const [formData, setFormData] = useState({
    type: 'BUG',
    subject: '',
    description: '',
    rating: 5
  })
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const userId = localStorage.getItem('userId')

  useEffect(() => {
    if (activeTab === 'history' && userId) {
      loadHistory()
    }
  }, [activeTab, userId])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const data = await getUserFeedback(userId)
      setHistory(data)
    } catch (err) {
      console.error("Failed to load history", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userId) return

    try {
      setSubmitting(true)
      await submitFeedback(userId, formData)
      setMessage({ type: 'success', text: 'Feedback submitted successfully!' })
      setFormData({ type: 'BUG', subject: '', description: '', rating: 5 })
      // Switch to history or reload if needed? Maybe just show success.
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Failed to submit feedback.' })
    } finally {
      setSubmitting(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const getStatusColor = (status) => {
    return status === 'CLEARED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in relative">
      <div>
        <h2 className="text-3xl font-display font-bold gradient-text">User Feedback</h2>
        <p className="text-white/60 mt-1">Help us improve AIMMS by reporting issues or sharing ideas.</p>
      </div>

      <div className="flex space-x-4 border-b border-white/10 pb-1">
        <button
          onClick={() => setActiveTab('submit')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'submit'
              ? 'border-accent-400 text-white'
              : 'border-transparent text-white/50 hover:text-white'
            }`}
        >
          Submit Feedback
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'history'
              ? 'border-accent-400 text-white'
              : 'border-transparent text-white/50 hover:text-white'
            }`}
        >
          My History
        </button>
      </div>

      {activeTab === 'submit' ? (
        <div className="card-vibrant max-w-2xl">
          {message && (
            <div className={`mb-4 p-3 rounded text-sm ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'
              }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Feedback Type</label>
              <select
                className="input-vibrant w-full"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="BUG">🐛 Bug / Issue</option>
                <option value="FEATURE">✨ Feature Request</option>
                <option value="AI_FEEDBACK">🤖 AI Prediction Feedback</option>
                <option value="GENERAL">📝 General Suggestion</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Subject</label>
              <input
                required
                className="input-vibrant w-full"
                placeholder="Brief title of the issue"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Description</label>
              <textarea
                required
                rows={4}
                className="input-vibrant w-full"
                placeholder="Describe the issue or suggestion in detail..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Rating (Optional)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={`text-2xl transition-transform hover:scale-110 ${formData.rating >= star ? 'text-yellow-400' : 'text-white/20'
                      }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 text-right">
              <button
                type="submit"
                disabled={submitting}
                className="btn-vibrant px-8 py-2 rounded-full"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="text-white/50 text-sm animate-pulse">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 card-vibrant">
              <p className="text-white/50">You haven't submitted any feedback yet.</p>
            </div>
          ) : (
            history.map(item => (
              <div key={item.id} className="card-vibrant p-5 flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs px-2 py-1 rounded font-mono ${item.type === 'BUG' ? 'bg-red-500/20 text-red-300' :
                        item.type === 'FEATURE' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-purple-500/20 text-purple-300'
                      }`}>
                      {item.type}
                    </span>
                    <span className="text-white/50 text-xs">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-lg">{item.subject}</h3>
                  <p className="text-white/70 text-sm">{item.description}</p>
                  {item.adminRemarks && (
                    <div className="mt-3 p-3 bg-white/5 rounded border-l-2 border-accent-400">
                      <p className="text-xs text-accent-300 font-bold mb-1">Admin Remarks:</p>
                      <p className="text-sm text-white/80">{item.adminRemarks}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  {item.rating && <span className="text-yellow-400 text-sm">{'★'.repeat(item.rating)}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
