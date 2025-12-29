import React, { useEffect, useState } from 'react';
import { getActiveAlerts, resolveAlert, triggerAIAnalysis } from '../services/api';

export default function ActiveAlerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, CRITICAL, HIGH, MEDIUM, LOW

    useEffect(() => {
        loadAlerts();
        const interval = setInterval(loadAlerts, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const loadAlerts = async () => {
        try {
            const data = await getActiveAlerts();
            setAlerts(data);
        } catch (err) {
            console.error("Failed to load alerts", err);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id) => {
        try {
            await resolveAlert(id);
            setAlerts(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            alert("Failed to resolve alert");
        }
    };

    const handleTriggerAI = async () => {
        try {
            await triggerAIAnalysis();
            alert("AI Analysis Triggered. Refreshing in 3s...");
            setTimeout(loadAlerts, 3000);
        } catch (err) {
            alert("Failed to trigger AI");
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'CRITICAL': return 'border-red-500 bg-red-50 text-red-700';
            case 'HIGH': return 'border-orange-500 bg-orange-50 text-orange-700';
            case 'MEDIUM': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
            case 'LOW': return 'border-blue-500 bg-blue-50 text-blue-700';
            default: return 'border-slate-200 bg-white text-slate-700';
        }
    };

    const filteredAlerts = filter === 'ALL' ? alerts : alerts.filter(a => a.severity === filter);

    if (loading && alerts.length === 0) return <div className="p-4 text-center">Loading AI Alerts...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">🚨 Active AI Alerts</h3>
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">{alerts.length}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleTriggerAI} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition-colors">
                        ⚡ Trigger AI Scan
                    </button>
                    <select
                        className="text-xs border rounded p-1 bg-white"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="ALL">All Severities</option>
                        <option value="CRITICAL">Critical</option>
                        <option value="HIGH">High Risk</option>
                        <option value="MEDIUM">Medium Risk</option>
                        <option value="LOW">Low Risk</option>
                    </select>
                </div>
            </div>

            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {filteredAlerts.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <div className="text-4xl mb-2">✅</div>
                        <p className="text-sm">System Healthy. No active alerts.</p>
                    </div>
                ) : (
                    filteredAlerts.map(alert => (
                        <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)} shadow-sm relative group transition-all hover:shadow-md`}>
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm tracking-wide uppercase">{alert.type} ALERT</span>
                                    <span className="text-xs opacity-75">• {new Date(alert.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono bg-white/50 px-2 py-0.5 rounded border border-black/5" title="AI Confidence Score">
                                        🤖 {alert.confidenceScore}%
                                    </span>
                                    <button
                                        onClick={() => handleResolve(alert.getId || alert.id)}
                                        className="text-xs font-bold hover:underline opacity-60 hover:opacity-100"
                                    >
                                        RESOLVE
                                    </button>
                                </div>
                            </div>

                            <h4 className="font-bold mb-1">{alert.message}</h4>

                            {/* AI Explanation Tooltip equivalent - always visible as actionable insight */}
                            <div className="mt-2 text-xs bg-white/60 p-2 rounded border border-black/5">
                                <span className="font-bold">🧠 AI Insight:</span> {alert.aiExplanation}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
