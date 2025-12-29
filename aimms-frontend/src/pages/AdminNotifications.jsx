import React, { useEffect, useState } from 'react';
import { getBroadcasts, createNotification, pinNotification, deleteNotification } from '../services/api';

export default function AdminNotifications() {
    const [broadcasts, setBroadcasts] = useState([]);
    const [form, setForm] = useState({
        title: '',
        body: '',
        priority: 'MEDIUM',
        isPinned: false,
        scheduledAt: '',
        expiresAt: ''
    });
    const [loading, setLoading] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [activeTab, setActiveTab] = useState('ALL'); // ALL, PUBLISHED, SCHEDULED
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        loadBroadcasts();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Stats Calculation
    const stats = {
        total: broadcasts.length,
        published: broadcasts.filter(b => b.status === 'PUBLISHED').length,
        scheduled: broadcasts.filter(b => b.status === 'SCHEDULED').length
    };

    // Filter Logic
    const filteredBroadcasts = broadcasts.filter(b => {
        if (activeTab === 'PUBLISHED') return b.status === 'PUBLISHED';
        if (activeTab === 'SCHEDULED') return b.status === 'SCHEDULED';
        return true;
    });

    const loadBroadcasts = async () => {
        try {
            const data = await getBroadcasts();
            // Sort: Pinned first, then created desc
            const sorted = data.sort((a, b) => (a.isPinned === b.isPinned) ? 0 : a.isPinned ? -1 : 1);
            setBroadcasts(sorted);
        } catch (err) {
            console.error("Failed to load broadcasts", err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // Consolidated submit logic
    const submitNotification = async (payloadOverride = {}) => {
        if (!form.title || !form.body) return alert("Title and Body required");

        setLoading(true);
        try {
            let adminId = localStorage.getItem('userId');
            if (adminId === 'undefined' || isNaN(parseInt(adminId))) {
                adminId = null;
            }
            const payload = {
                ...form,
                isBroadcast: true,
                expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
                ...payloadOverride // Merge override values (e.g. scheduledAt)
            };

            await createNotification(payload, adminId);
            alert("Announcement created!");

            // Reset form and state
            setForm({ title: '', body: '', priority: 'MEDIUM', isPinned: false, scheduledAt: '', expiresAt: '' });
            setIsScheduling(false);
            loadBroadcasts();
        } catch (err) {
            console.error("Create notification failed", err);
            alert("Failed to create announcement: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handlePublishNow = (e) => {
        e.preventDefault();
        // For immediate publish, ensure scheduledAt is null or ignored by backend
        // We explicitly send null or don't send it. Let's send null to be safe if backend allows, or just omit.
        // Based on previous code, if it wasn't in payload, backend handled it. 
        // We will make sure scheduledAt is NOT in the payload for immediate publish.
        // We pass an object that will OVERWRITE form.scheduledAt in the payload construction if needed, 
        // OR we rely on the fact that we won't set form.scheduledAt in the first place if the user didn't pick one.
        // BUT, if the user picked a date then switched back to "Publish Now", we must ensure that date is IGNORED.
        submitNotification({ scheduledAt: null });
    };

    const handleSchedule = (e) => {
        e.preventDefault();
        if (!form.scheduledAt) return alert("Please select a date and time to schedule.");
        submitNotification({ scheduledAt: new Date(form.scheduledAt).toISOString() });
    };

    const handlePin = async (id) => {
        try {
            await pinNotification(id);
            loadBroadcasts();
        } catch (err) {
            console.error("Failed to pin", err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this announcement?")) return;
        try {
            await deleteNotification(id);
            loadBroadcasts();
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header with Live Clock */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Announcement</h2>
                    <p className="text-gray-500 mt-1">Manage and schedule system-wide notifications</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-3">
                    <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">IST Time</div>
                        <div className="text-xl font-mono font-bold text-gray-800">
                            {currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-2 bg-blue-500"></div>
                    <p className="text-gray-500 font-medium">Total Announcements</p>
                    <h3 className="text-4xl font-bold text-gray-800 mt-2">{stats.total}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-2 bg-green-500"></div>
                    <p className="text-gray-500 font-medium">Published</p>
                    <h3 className="text-4xl font-bold text-gray-800 mt-2">{stats.published}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-2 bg-yellow-500"></div>
                    <p className="text-gray-500 font-medium">Scheduled</p>
                    <h3 className="text-4xl font-bold text-gray-800 mt-2">{stats.scheduled}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Create New Announcement</h3>
                        <form className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                                <input name="title" value={form.title} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" required placeholder="Enter title..." />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Message Body</label>
                                <textarea name="body" value={form.body} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" rows="4" required placeholder="Type your message..." />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                                    <select name="priority" value={form.priority} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center space-x-3 cursor-pointer group">
                                        <div className="relative">
                                            <input type="checkbox" name="isPinned" checked={form.isPinned} onChange={handleChange} className="sr-only" />
                                            <div className={`block w-10 h-6 rounded-full ${form.isPinned ? 'bg-blue-600' : 'bg-gray-300'} transition-colors`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${form.isPinned ? 'transform translate-x-4' : ''}`}></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Pin to Top</span>
                                    </label>
                                </div>
                            </div>

                            {/* Date Inputs */}
                            {isScheduling && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 animate-fadeIn">
                                    <div className="mb-3">
                                        <label className="block text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">Schedule For (IST)</label>
                                        <input type="datetime-local" name="scheduledAt" value={form.scheduledAt} onChange={handleChange} className="w-full border border-blue-200 p-2 rounded text-sm focus:ring-2 focus:ring-blue-400 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Expires On (Optional)</label>
                                        <input type="datetime-local" name="expiresAt" value={form.expiresAt} onChange={handleChange} className="w-full border border-gray-200 p-2 rounded text-sm focus:ring-2 focus:ring-gray-400 outline-none" />
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 pt-2">
                                {!isScheduling ? (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handlePublishNow}
                                            disabled={loading}
                                            className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-bold shadow-md transition-all transform hover:-translate-y-0.5"
                                        >
                                            {loading ? 'Publishing...' : '🚀 Publish Now'}
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); setIsScheduling(true); }}
                                            disabled={loading}
                                            className="flex-1 bg-white text-blue-600 border-2 border-blue-600 px-4 py-3 rounded-lg hover:bg-blue-50 font-bold transition-all"
                                        >
                                            📅 Schedule
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSchedule}
                                            disabled={loading}
                                            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-bold shadow-md transition-all transform hover:-translate-y-0.5"
                                        >
                                            {loading ? 'Scheduling...' : '✅ Confirm Schedule'}
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); setIsScheduling(false); }}
                                            disabled={loading}
                                            className="px-4 py-3 text-gray-500 hover:text-gray-700 font-semibold"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                        {/* Tabs */}
                        <div className="flex border-b">
                            {['ALL', 'PUBLISHED', 'SCHEDULED'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 
                                        ${activeTab === tab ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto flex-1">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Announcement</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredBroadcasts.length > 0 ? (
                                        filteredBroadcasts.map(b => (
                                            <tr key={b.notificationId} className={`hover:bg-gray-50 transition-colors ${b.isPinned ? "bg-blue-50/50" : ""}`}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {b.status === 'PUBLISHED' ? (
                                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800 border border-green-200">
                                                            PUBLISHED
                                                        </span>
                                                    ) : b.status === 'SCHEDULED' ? (
                                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                            SCHEDULED
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                                                            DRAFT
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900">{b.title}</span>
                                                        <span className="text-sm text-gray-500 truncate max-w-xs">{b.body}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                                                    {b.status === 'SCHEDULED' && b.scheduledAt ? (
                                                        <div className="text-blue-600">
                                                            <div className="uppercase text-[10px] text-gray-400">Scheduled For</div>
                                                            {new Date(b.scheduledAt).toLocaleString()}
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-600">
                                                            <div className="uppercase text-[10px] text-gray-400">Created At</div>
                                                            {new Date(b.createdAt).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded border
                                                        ${b.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            b.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                                        {b.priority}
                                                    </span>
                                                    {b.isPinned && (
                                                        <div className="mt-1 flex items-center text-blue-600 text-xs font-bold">
                                                            <span className="mr-1">📌</span> Pinned
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-3">
                                                        <button onClick={() => handlePin(b.notificationId)} className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 hover:bg-indigo-50 rounded">
                                                            {b.isPinned ? 'Unpin' : 'Pin'}
                                                        </button>
                                                        <button onClick={() => handleDelete(b.notificationId)} className="text-red-600 hover:text-red-900 transition-colors p-1 hover:bg-red-50 rounded">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <div className="text-4xl mb-3">📭</div>
                                                    <p className="font-medium">No announcements found in this category.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
