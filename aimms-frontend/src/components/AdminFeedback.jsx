import React, { useState, useEffect } from 'react'
import { getAllFeedback, updateFeedbackStatus, deleteUserFeedback } from '../services/api'

export default function AdminFeedback() {
    const [feedbacks, setFeedbacks] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('ALL') // ALL, CLEARED, UNCLEARED
    const [updatingId, setUpdatingId] = useState(null)

    useEffect(() => {
        loadFeedback()
    }, [])

    const loadFeedback = async () => {
        try {
            setLoading(true)
            const data = await getAllFeedback()
            setFeedbacks(data)
        } catch (err) {
            console.error("Failed to load feedback", err)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            setUpdatingId(id)
            const updated = await updateFeedbackStatus(id, newStatus, newStatus === 'CLEARED' ? 'Fixed by Admin' : null)

            setFeedbacks(prev => prev.map(f => f.id === id ? updated : f))
        } catch (err) {
            console.error("Failed to update status", err)
            alert("Failed to update status")
        } finally {
            setUpdatingId(null)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this feedback?")) return;
        try {
            await deleteUserFeedback(id);
            setFeedbacks(prev => prev.filter(f => f.id !== id));
        } catch (err) {
            console.error("Failed to delete feedback", err);
            alert("Failed to delete feedback");
        }
    }

    const filteredFeedbacks = feedbacks.filter(f => {
        if (statusFilter === 'ALL') return true
        return f.status === statusFilter
    })

    // Calculate stats
    const total = feedbacks.length
    const uncleared = feedbacks.filter(f => f.status === 'UNCLEARED').length
    const cleared = feedbacks.filter(f => f.status === 'CLEARED').length

    const getStatusColor = (status) => {
        return status === 'CLEARED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'
    }

    const getTypeIcon = (type) => {
        switch (type) {
            case 'BUG': return '🐛'
            case 'FEATURE': return '✨'
            case 'AI_FEEDBACK': return '🤖'
            default: return '📝'
        }
    }

    if (loading) return <div className="text-white/50 animate-pulse">Loading feedback...</div>

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
                <div className="card-vibrant p-4 flex items-center justify-between">
                    <div>
                        <p className="text-white/50 text-sm">Total Feedback</p>
                        <h3 className="text-2xl font-bold text-white">{total}</h3>
                    </div>
                    <div className="text-3xl">📨</div>
                </div>
                <div className="card-vibrant p-4 flex items-center justify-between border-l-4 border-l-yellow-500">
                    <div>
                        <p className="text-yellow-200/70 text-sm">Pending Issues</p>
                        <h3 className="text-2xl font-bold text-yellow-300">{uncleared}</h3>
                    </div>
                    <div className="text-3xl">⚠️</div>
                </div>
                <div className="card-vibrant p-4 flex items-center justify-between border-l-4 border-l-emerald-500">
                    <div>
                        <p className="text-emerald-200/70 text-sm">Resolved</p>
                        <h3 className="text-2xl font-bold text-emerald-300">{cleared}</h3>
                    </div>
                    <div className="text-3xl">✅</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${statusFilter === 'ALL' ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10'}`}
                >
                    All
                </button>
                <button
                    onClick={() => setStatusFilter('UNCLEARED')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${statusFilter === 'UNCLEARED' ? 'bg-yellow-500/20 text-yellow-300' : 'text-white/50 hover:bg-white/10'}`}
                >
                    Uncleared
                </button>
                <button
                    onClick={() => setStatusFilter('CLEARED')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${statusFilter === 'CLEARED' ? 'bg-emerald-500/20 text-emerald-300' : 'text-white/50 hover:bg-white/10'}`}
                >
                    Cleared
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredFeedbacks.length === 0 ? (
                    <div className="text-center py-10 card-vibrant">
                        <p className="text-white/50">No feedback found.</p>
                    </div>
                ) : (
                    filteredFeedbacks.map(item => (
                        <div key={item.id} className="card-vibrant p-4 group hover:bg-white/5 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2 text-xs mb-1">
                                        <span className="bg-white/10 px-2 py-0.5 rounded text-white/70 font-mono">#{item.id}</span>
                                        <span className={`px-2 py-0.5 rounded font-mono ${item.type === 'BUG' ? 'bg-red-500/20 text-red-300' :
                                            item.type === 'FEATURE' ? 'bg-blue-500/20 text-blue-300' :
                                                'bg-purple-500/20 text-purple-300'
                                            }`}>
                                            {getTypeIcon(item.type)} {item.type}
                                        </span>
                                        <span className="text-white/40">•</span>
                                        <span className="text-white/50">{item.user?.email}</span>
                                        <span className="text-white/40">•</span>
                                        <span className="text-white/50">{new Date(item.timestamp).toLocaleString()}</span>
                                    </div>
                                    <h3 className="font-bold text-white text-lg">{item.subject}</h3>
                                    <p className="text-white/70 text-sm whitespace-pre-wrap max-w-4xl">{item.description}</p>
                                    {item.rating && <div className="text-yellow-400 text-sm mt-1">Rating: {'★'.repeat(item.rating)}</div>}
                                </div>

                                <div className="flex flex-col items-end gap-3 ml-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>

                                    {item.status === 'UNCLEARED' ? (
                                        <button
                                            onClick={() => handleStatusUpdate(item.id, 'CLEARED')}
                                            disabled={updatingId === item.id}
                                            className="btn-vibrant px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500"
                                        >
                                            {updatingId === item.id ? 'Updating...' : 'Mark as Cleared'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleStatusUpdate(item.id, 'UNCLEARED')}
                                            disabled={updatingId === item.id}
                                            className="px-4 py-1.5 text-xs rounded-lg bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                                        >
                                            {updatingId === item.id ? 'Updating...' : 'Mark as Uncleared'}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-white/30 hover:text-red-400 transition-colors p-1"
                                        title="Delete Feedback"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
