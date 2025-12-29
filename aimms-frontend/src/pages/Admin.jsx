import React, { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { getAdmins, getUsers, grantSubAdmin, deleteUser, getActiveAlerts } from '../services/api'
import AdminNotifications from './AdminNotifications'
import ActiveAlerts from '../components/ActiveAlerts'
import AdminFeedback from '../components/AdminFeedback'
import AdminGamification from './AdminGamification'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'users', 'notifications', 'rewards'

  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthScore, setHealthScore] = useState(100);
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Sub-Admin State
  const [showSubAdminModal, setShowSubAdminModal] = useState(false);
  const [subAdminForm, setSubAdminForm] = useState({ userId: '', phone: '', department: '', reason: '', permissions: [] });
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterRole, setFilterRole] = useState('ALL'); // 'ALL', 'SUB_ADMIN', 'USER'
  const PERMISSIONS_LIST = ['READ', 'WRITE', 'UPDATE', 'DELETE', 'USER_MANAGEMENT'];
  const currentRole = localStorage.getItem('role');
  const currentUserId = parseInt(localStorage.getItem('userId')) || 0;
  const currentUserEmail = localStorage.getItem('userEmail') || '';

  const getUserRole = (email) => {
    const adminRec = admins.find(a => a.email === email);
    return adminRec ? adminRec.role : 'USER';
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const startTime = performance.now();
    try {
      const [adminsData, usersData, alertsData] = await Promise.all([getAdmins(), getUsers(), getActiveAlerts()]);
      setAdmins(adminsData);
      setUsers(usersData);
      setActiveAlertCount(alertsData.length);

      // Calculate Health Score based on Latency
      const endTime = performance.now();
      const latency = endTime - startTime;

      // Base score 100, deduct 1% for every 100ms over 500ms
      let score = 100;
      if (latency > 500) {
        const penalty = Math.floor((latency - 500) / 100);
        score = Math.max(80, 100 - penalty); // Floor at 80% for usability
      }
      setHealthScore(score);

    } catch (err) {
      console.error("Failed to load admin data", err);
      setHealthScore(45); // Error state
    } finally {
      setLoading(false);
    }
  };

  // --- Derived Metrics for Dashboard ---
  // --- Derived Metrics for Dashboard ---
  // Filter users who are NOT in the admins list (by email) to get "Regular Users"
  const regularUsers = users.filter(u => !admins.some(a => a.email === u.email));
  const regularUserCount = regularUsers.length;
  const totalAdmins = admins.length;
  const systemHealth = `${healthScore}%`;

  const distributionData = [
    { name: 'Regular Users', value: regularUserCount, color: '#8884d8' },
    { name: 'Admins', value: totalAdmins, color: '#82ca9d' }
  ];

  // --- Dynamic Growth Data Calculation ---
  const growthData = (() => {
    // 1. Sort users by creation date
    const sortedUsers = [...users].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

    // 2. Initialize last 6 months buckets
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        date: d,
        users: 0
      });
    }

    // 3. Calculate cumulative counts for each bucket
    // We count how many users existed BEFORE or DURING each month bucket
    return months.map(bucket => {
      // End of this bucket's month
      const endOfMonth = new Date(bucket.date.getFullYear(), bucket.date.getMonth() + 1, 0);

      const count = sortedUsers.filter(u => {
        const userDate = u.createdAt ? new Date(u.createdAt) : new Date(0); // If no date, assume old
        return userDate <= endOfMonth;
      }).length;

      return { month: bucket.name, users: count };
    });
  })();

  // --- Handlers ---
  const handleGrantSubAdmin = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...subAdminForm, userId: parseInt(subAdminForm.userId), permissions: subAdminForm.permissions.join(',') };
      await grantSubAdmin(payload);
      alert("Sub-Admin granted!");
      setShowSubAdminModal(false);
      loadData();
    } catch (err) {
      alert("Failed: " + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await deleteUser(userId);
      alert("User deleted successfully.");
      setSelectedUser(null);
      loadData();
    } catch (err) {
      alert("Failed to delete user: " + err.message);
    }
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "ID,Name,Email,Role\n" +
      users.map(u => `${u.userId},${u.name},${u.email},USER`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "aimms_users.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="p-6 space-y-6 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">Admin Command Center</h1>
          <p className="text-white/80">Monitor system health, manage users, and broadcast updates.</p>
        </div>
        <div className="flex glass p-1 rounded-lg">
          {['dashboard', 'users', 'notifications', 'feedback', 'rewards'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab ? 'bg-white/20 text-white shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content Switcher */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          {/* Active Alerts Section */}
          <ActiveAlerts />

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard title="Regular Users" value={regularUserCount} icon="👥" change="Active" color="bg-blue-50 border-blue-200 text-blue-700" />
            <KPICard title="Total Admins" value={totalAdmins} icon="🛡️" change="Stable" color="bg-purple-50 border-purple-200 text-purple-700" />
            <KPICard title="System Health" value={systemHealth} icon="❤️" change="All Systems Go" color="bg-green-50 border-green-200 text-green-700" />
            <KPICard
              title="Active Alerts"
              value={activeAlertCount}
              icon="⚠️"
              change={activeAlertCount > 0 ? "Needs Attention" : "All Clear"}
              color={activeAlertCount > 0 ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-slate-50 border-slate-200 text-slate-500"}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-4">User Growth Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-4">User Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2 text-sm text-slate-500">
                  {distributionData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                      {d.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
          <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
              </div>

              {currentRole === 'ADMIN' && (
                <div className="flex bg-slate-100 rounded-lg p-1 text-xs font-medium border border-slate-200">
                  {['ALL', 'SUB_ADMIN', 'USER'].map(role => (
                    <button
                      key={role}
                      onClick={() => setFilterRole(role)}
                      className={`px-3 py-1.5 rounded-md transition-all ${filterRole === role ? 'bg-white text-purple-700 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {role === 'ALL' ? 'All' : role === 'SUB_ADMIN' ? 'Sub-Admins' : 'Regular Users'}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={exportData} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm">
                📥 Export CSV
              </button>
              <button onClick={() => setShowSubAdminModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm">
                + Add Sub-Admin
              </button>
            </div>
          </div>

          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users
                .filter(u => {
                  const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase());
                  const isSelf = u.email === currentUserEmail;

                  // Debug logging
                  // console.log(`User: ${u.email}, Role: ${getUserRole(u.email)}, Filter: ${filterRole}, Self: ${isSelf}`);

                  if (!matchesSearch || isSelf) return false;

                  if (filterRole === 'ALL') return true;

                  const actualRole = getUserRole(u.email);
                  return actualRole === filterRole;
                })
                .map(u => (
                  <tr key={u.userId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-400">#{u.userId}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700">{u.name}</div>
                      <div className="text-slate-400 text-xs">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const adminRec = admins.find(a => a.email === u.email);
                        let role = adminRec ? adminRec.role : 'USER';

                        // HIDE SUB_ADMIN status from anyone other than super ADMIN
                        if (currentRole !== 'ADMIN' && role === 'SUB_ADMIN') {
                          role = 'USER';
                        }

                        const badgeColor = role === 'USER' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';

                        return (
                          <span className={`px-2 py-1 rounded-full ${badgeColor} text-xs font-bold`}>
                            {role}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-green-600 font-medium text-xs">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="text-slate-400 hover:text-purple-600 font-medium">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="animate-fade-in">
          <AdminNotifications />
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="animate-fade-in">
          <AdminFeedback />
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="animate-fade-in">
          <AdminGamification />
        </div>
      )}

      {/* Modals */}
      {showSubAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-slate-800">Grant Sub-Admin Access</h3>
            </div>
            <form onSubmit={handleGrantSubAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select User</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={subAdminForm.userId}
                  onChange={e => setSubAdminForm({ ...subAdminForm, userId: e.target.value })}
                  required
                >
                  <option value="">-- Choose User --</option>
                  {users.map(u => <option key={u.userId} value={u.userId}>{u.name} ({u.email})</option>)}
                </select>
              </div>
              {/* Other inputs kept simple for brevity but functionally same as before */}
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Phone" className="p-2 border rounded-lg" onChange={e => setSubAdminForm({ ...subAdminForm, phone: e.target.value })} required />
                <input placeholder="Department" className="p-2 border rounded-lg" onChange={e => setSubAdminForm({ ...subAdminForm, department: e.target.value })} required />
              </div>
              <textarea placeholder="Reason for access" className="w-full p-2 border rounded-lg" rows="2" onChange={e => setSubAdminForm({ ...subAdminForm, reason: e.target.value })} required></textarea>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {PERMISSIONS_LIST.map(p => (
                    <label key={p} className="flex items-center gap-2 text-sm text-slate-600">
                      <input type="checkbox" onChange={(e) => {
                        const perms = e.target.checked
                          ? [...subAdminForm.permissions, p]
                          : subAdminForm.permissions.filter(perm => perm !== p);
                        setSubAdminForm({ ...subAdminForm, permissions: perms });
                      }} />
                      {p}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowSubAdminModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Grant Access</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">User Management</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl">
                  👤
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800">{selectedUser.name}</h4>
                  <p className="text-slate-500">{selectedUser.email}</p>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold">Active User</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">User ID</span>
                  <span className="font-mono text-slate-700">#{selectedUser.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Joined</span>
                  <span className="text-slate-700">Unknown Date</span>
                  {/* Date not in standard user object yet, mocked or would be createdAt */}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => {
                    setSubAdminForm({ ...subAdminForm, userId: selectedUser.userId });
                    setSelectedUser(null);
                    setShowSubAdminModal(true);
                  }}
                  className="flex-1 py-2 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 font-medium"
                >
                  Promote to Admin
                </button>
                <button
                  onClick={() => handleDeleteUser(selectedUser.userId)}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function KPICard({ title, value, icon, change, color }) {
  return (
    <div className={`p-6 rounded-xl border ${color} transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold uppercase opacity-70 mb-1">{title}</h3>
          <div className="text-3xl font-display font-bold mb-2">{value}</div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">{change}</span>
        </div>
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </div>
  )
}
