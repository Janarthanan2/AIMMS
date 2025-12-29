import React, { useEffect, useState } from 'react'
import { getTransactions, createTransaction, deleteTransaction, getUsers, getCategories } from '../services/api'

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]); // New state
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(''); // Empty by default for Admin search
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    merchant: '',
    category: '',
    paymentMode: 'Cash', // Default
    txnDate: new Date().toISOString().split('T')[0]
  });

  // Check if current user is admin (read-only access for admins)
  const isAdmin = localStorage.getItem('userType') === 'admin';
  const userRole = localStorage.getItem('role');

  // Load categories on mount
  useEffect(() => {
    if (!isAdmin) {
      getCategories()
        .then(data => setCategories(data || []))
        .catch(err => console.error("Failed to load categories", err));
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
      }
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin && userId) {
      loadTransactions();
    }
  }, [userId, isAdmin]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("Please enter a User ID");
      return;
    }
    loadTransactions();
  };

  const loadTransactions = async () => {
    console.log("Loading transactions for userId:", userId);
    setLoading(true);
    setTransactions([]); // Clear previous
    try {
      const data = await getTransactions(userId);
      console.log("Loaded transactions:", data);
      setTransactions(data);
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting transaction:", formData, "for userId:", userId);
    try {
      const res = await createTransaction(userId, formData);
      console.log("Transaction created:", res);
      setFormData({
        amount: '',
        description: '',
        merchant: '',
        category: '',
        paymentMode: 'Cash',
        txnDate: new Date().toISOString().split('T')[0]
      });
      loadTransactions();
    } catch (err) {
      alert("Failed to create transaction");
      console.error("Create transaction error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete transaction?")) return;
    try {
      await deleteTransaction(id);
      setTransactions(transactions.filter(t => t.transactionId !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Transactions</h2>
        {isAdmin && (
          <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
            Admin View (Read-Only)
          </span>
        )}
      </div>

      {/* Simple User Selector for Demo */}
      {isAdmin && (
        <form onSubmit={handleSearch} className="mb-6 flex items-center gap-4 bg-gray-50 p-4 rounded border">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search User Transactions</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="border rounded p-2 w-40"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </div>
        </form>
      )}

      <div className={`grid grid-cols-1 ${!isAdmin ? 'md:grid-cols-3' : ''} gap-6`}>
        {/* Form - Only show for non-admin users */}
        {!isAdmin && (
          <div className="bg-white p-6 rounded shadow h-fit">
            <h3 className="text-lg font-semibold mb-4">Add Transaction</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required className="mt-1 block w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input type="text" name="description" value={formData.description} onChange={handleInputChange} required className="mt-1 block w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Merchant</label>
                <input type="text" name="merchant" value={formData.merchant} onChange={handleInputChange} required className="mt-1 block w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category <span className="text-gray-400 font-normal">(Optional - AI will detect if empty)</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded p-2"
                >
                  <option value="">Auto-Detect (AI)</option>
                  {categories.map(cat => (
                    <option key={cat.categoryId} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded p-2"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="NetBanking">NetBanking</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" name="txnDate" value={formData.txnDate} onChange={handleInputChange} required className="mt-1 block w-full border rounded p-2" />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Add Transaction</button>
            </form>
          </div>
        )}

        {/* List */}
        <div className={`${!isAdmin ? 'md:col-span-2' : ''} bg-white rounded shadow overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Merchant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  {!isAdmin && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={isAdmin ? "4" : "5"} className="p-4 text-center">Loading...</td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td colSpan={isAdmin ? "4" : "5"} className="p-4 text-center text-gray-500">
                    {isAdmin && !userId ? "Enter a User ID to view transactions." : "No transactions found."}
                  </td></tr>
                ) : (
                  transactions.map(t => (
                    <tr key={t.transactionId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.txnDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.merchant}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.paymentMode || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${t.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {t.predictedCategory || t.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      {!isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleDelete(t.transactionId)} className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
