import React, { useEffect, useState } from 'react';
import { getGamificationConfig, updateGamificationConfig, getRewardLogs, getGamificationOverview, getAdminBadges, createBadge, updateBadge } from '../services/api';

export default function AdminGamification() {
    const [config, setConfig] = useState(null);
    const [stats, setStats] = useState({ totalBadgesAwarded: 0, totalLogs: 0 });
    const [logs, setLogs] = useState([]);
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Badge Modal State
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    const [currentBadge, setCurrentBadge] = useState(null);
    const [badgeForm, setBadgeForm] = useState({ name: '', code: '', description: '', ruleType: 'TOTAL_BUDGET_PERCENT', threshold: 1.0, icon: '🏅', active: true });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [c, l, s, b] = await Promise.all([
                getGamificationConfig(),
                getRewardLogs(),
                getGamificationOverview(),
                getAdminBadges()
            ]);
            setConfig(c);
            setLogs(l);
            setStats(s);
            setBadges(b);
        } catch (error) {
            console.error("Failed to load admin gamification data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfigChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : parseFloat(value)
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateGamificationConfig(config);
            alert("Configuration saved!");
        } catch (error) {
            console.error("Failed to save config", error);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    // Badge Handlers
    const openBadgeModal = (badge = null) => {
        if (badge) {
            setCurrentBadge(badge);
            setBadgeForm(badge);
        } else {
            setCurrentBadge(null);
            setBadgeForm({ name: '', code: '', description: '', ruleType: 'TOTAL_BUDGET_PERCENT', threshold: 1.0, icon: '🏅', active: true });
        }
        setShowBadgeModal(true);
    };

    const saveBadge = async (e) => {
        e.preventDefault();
        try {
            if (currentBadge) {
                await updateBadge(currentBadge.badgeId, badgeForm);
            } else {
                await createBadge(badgeForm);
            }
            setShowBadgeModal(false);
            loadData(); // Reload all
        } catch (err) {
            alert("Failed to save badge: " + err.message);
        }
    };

    const toggleBadgeStatus = async (badge) => {
        try {
            await updateBadge(badge.badgeId, { ...badge, active: !badge.active });
            loadData();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Rewards Management</h1>
            <p className="text-gray-500 mb-8">Configure User Rewards and Monitor System Performance</p>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm font-bold text-gray-400 uppercase">Total Badges Awarded</p>
                    <h3 className="text-4xl font-extrabold text-blue-600 mt-2">{stats.totalBadgesAwarded}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm font-bold text-gray-400 uppercase">Total Reward Events</p>
                    <h3 className="text-4xl font-extrabold text-purple-600 mt-2">{stats.totalLogs}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm font-bold text-gray-400 uppercase">Active Badges</p>
                    <h3 className="text-4xl font-extrabold text-green-600 mt-2">{badges.filter(b => b.active).length} / {badges.length}</h3>
                </div>
            </div>

            {/* Badge Management Section - Modern Grid */}
            <div className="mb-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Badge Library</h3>
                        <p className="text-sm text-gray-500">Manage available achievements and earning rules</p>
                    </div>
                    {/* Filter or View Toggle could go here */}
                </div>

                <div className="space-y-4">
                    {/* Add New Badge Row */}
                    <button
                        onClick={() => openBadgeModal()}
                        className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center gap-3 text-gray-500 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all group"
                    >
                        <span className="text-xl font-bold">+</span>
                        <span className="font-semibold">Create New Badge Definition</span>
                    </button>

                    {/* Badge List Rows */}
                    {badges.map(badge => (
                        <div key={badge.badgeId} className={`flex flex-col md:flex-row items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-6 transition-all hover:shadow-md ${!badge.active ? 'opacity-60 bg-gray-50' : ''}`}>
                            {/* Icon */}
                            <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-3xl shadow-inner">
                                {badge.icon}
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <h4 className="font-bold text-gray-800 text-lg">{badge.name}</h4>
                                    {!badge.active && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-500 uppercase tracking-wide">Inactive</span>}
                                    {badge.active && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wide">Active</span>}
                                </div>
                                <p className="text-xs text-gray-500">{badge.description}</p>
                                <div className="text-xs font-mono text-gray-300 mt-1 uppercase">{badge.code}</div>
                            </div>

                            {/* Rule Details */}
                            <div className="flex flex-col gap-2 w-full md:w-auto min-w-[150px]">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-medium text-xs uppercase">Trigger Rule</span>
                                    <span className="font-bold text-gray-700">{badge.ruleType === 'TOTAL_BUDGET_PERCENT' ? 'Budget Limit' : 'Savings Goal'}</span>
                                </div>
                                <div className="bg-gray-100 rounded-full h-1.5 w-full overflow-hidden">
                                    <div className="bg-purple-500 h-full" style={{ width: `${Math.min(100, badge.threshold * 100)}%` }}></div>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400">Threshold</span>
                                    <span className="font-mono font-bold text-purple-600">{(badge.threshold * 100).toFixed(0)}%</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                                <button
                                    onClick={() => toggleBadgeStatus(badge)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors border ${badge.active
                                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                                        : 'border-green-200 text-green-600 hover:bg-green-50'
                                        }`}
                                >
                                    {badge.active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                    onClick={() => openBadgeModal(badge)}
                                    className="px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-bold hover:bg-gray-900 transition-colors shadow-sm"
                                >
                                    Edit Config
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration Panel */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Global Reward Settings</h3>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Budget Tolerance (0.0 - 1.0)</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number" step="0.01" min="0" max="1"
                                    name="budgetTolerance"
                                    value={config.budgetTolerance}
                                    onChange={handleConfigChange}
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-500 w-24">= {(config.budgetTolerance * 100).toFixed(0)}%</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Percentage over budget allowed while still qualifying for rewards.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Savings Goal Threshold (0.0 - 1.0)</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number" step="0.01" min="0" max="1"
                                    name="savingsGoalThreshold"
                                    value={config.savingsGoalThreshold}
                                    onChange={handleConfigChange}
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-500 w-24">= {(config.savingsGoalThreshold * 100).toFixed(0)}%</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Maximum spending allowed as % of total budget to qualify as 'Savings Guru'.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                        >
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </form>
                </div>

                {/* Logs Panel */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-4">Recent Reward Decisions</h3>
                    <div className="overflow-y-auto flex-1 space-y-3 pr-2">
                        {logs.length > 0 ? (
                            logs.map(log => (
                                <div key={log.id} className="p-3 border rounded-lg bg-gray-50 text-sm">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`font-bold ${log.action.includes('DENIED') ? 'text-red-600' : 'text-green-600'
                                            }`}>{log.action}</span>
                                        <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="text-gray-600">{log.details}</p>
                                    <p className="text-xs text-gray-400 mt-1">User ID: {log.userId}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-center py-10">No logs found.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showBadgeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="p-6 border-b font-bold text-lg">
                            {currentBadge ? 'Edit Badge' : 'Create New Badge'}
                        </div>
                        <form onSubmit={saveBadge} className="p-6 space-y-4">
                            <div>
                                <label className="label">Name</label>
                                <input className="input-field" value={badgeForm.name} onChange={e => setBadgeForm({ ...badgeForm, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="label">Code (Unique)</label>
                                <input className="input-field" value={badgeForm.code} onChange={e => setBadgeForm({ ...badgeForm, code: e.target.value })} required disabled={!!currentBadge} />
                            </div>
                            <div>
                                <label className="label">Description</label>
                                <textarea className="input-field" value={badgeForm.description} onChange={e => setBadgeForm({ ...badgeForm, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Rule Type</label>
                                    <select className="input-field" value={badgeForm.ruleType} onChange={e => setBadgeForm({ ...badgeForm, ruleType: e.target.value })}>
                                        <option value="TOTAL_BUDGET_PERCENT">Budget Percent</option>
                                        <option value="SAVINGS_GOAL_MET">Savings Goal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Threshold (0.0-1.0)</label>
                                    <input type="number" step="0.01" className="input-field" value={badgeForm.threshold} onChange={e => setBadgeForm({ ...badgeForm, threshold: parseFloat(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="label">Icon (Emoji)</label>
                                <input className="input-field text-2xl" value={badgeForm.icon} onChange={e => setBadgeForm({ ...badgeForm, icon: e.target.value })} maxLength="2" />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowBadgeModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded font-bold">Save Badge</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
                .input-field { width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; outline: none; transition: border-color 0.2s; }
                .input-field:focus { border-color: #2563eb; ring: 2px solid #2563eb; }
            `}</style>
        </div>
    );
}
