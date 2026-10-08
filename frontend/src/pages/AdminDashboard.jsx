import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  Check,
  X,
  Trash2,
  RefreshCw,
  Search
} from 'lucide-react';
import { userAPI, itemAPI, claimAPI, matchingAPI } from '../services/api';

export default function AdminDashboard({ onViewDetails }) {
  const [activeAdminTab, setActiveAdminTab] = useState('overview'); // 'overview' | 'users' | 'items' | 'claims'
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLost: 0,
    totalFound: 0,
    totalMatched: 0,
    pendingClaims: 0,
    returnedItems: 0,
  });

  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);

  // Review Modal State
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [reviewAction, setReviewAction] = useState(''); // 'APPROVE' or 'REJECT'
  const [adminComment, setAdminComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, itemsRes, claimsRes, itemStatsRes, matchesRes] = await Promise.all([
        userAPI.getAllUsers(),
        itemAPI.getItems({}),
        claimAPI.getAllClaims('ALL'),
        itemAPI.getStats(),
        matchingAPI.getAllMatches(),
      ]);

      const allUsers = usersRes?.data || [];
      const allItems = itemsRes?.data || [];
      const allClaims = claimsRes?.data || [];
      const itemStats = itemStatsRes?.data || {};
      const matches = matchesRes?.data || [];

      setUsers(allUsers);
      setItems(allItems);
      setClaims(allClaims);

      setStats({
        totalUsers: allUsers.length,
        totalLost: itemStats.lostItems || 0,
        totalFound: itemStats.foundItems || 0,
        totalMatched: matches.length,
        pendingClaims: allClaims.filter(c => c.status === 'PENDING').length,
        returnedItems: itemStats.returnedItems || 0,
      });
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprove = async () => {
    if (!selectedClaim) return;
    setReviewLoading(true);
    try {
      await claimAPI.approveClaim(selectedClaim.id, adminComment || 'Approved by administrator');
      setSelectedClaim(null);
      setAdminComment('');
      fetchAdminData();
    } catch (e) {
      alert(e.message || 'Error approving claim');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedClaim) return;
    setReviewLoading(true);
    try {
      await claimAPI.rejectClaim(selectedClaim.id, adminComment || 'Rejected by administrator');
      setSelectedClaim(null);
      setAdminComment('');
      fetchAdminData();
    } catch (e) {
      alert(e.message || 'Error rejecting claim');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this report as invalid?')) return;
    try {
      await itemAPI.deleteItem(itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (e) {
      alert(e.message || 'Failed to delete item');
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-300">
            System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Campus Admin Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1">
            Manage student registrations, review claims, and monitor all campus lost & found activity.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer text-white"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Users</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-black text-slate-900">{stats.totalUsers}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Lost Items</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-2xl font-black text-red-600">{stats.totalLost}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Found Items</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-emerald-600">{stats.totalFound}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Matches</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl font-black text-purple-600">{stats.totalMatched}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Pending Claims</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-600">{stats.pendingClaims}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Returned</span>
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-emerald-600">{stats.returnedItems}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`pb-2 transition cursor-pointer ${
            activeAdminTab === 'overview'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Verification Queue ({stats.pendingClaims})
        </button>

        <button
          onClick={() => setActiveAdminTab('claims')}
          className={`pb-2 transition cursor-pointer ${
            activeAdminTab === 'claims'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All Claims History
        </button>

        <button
          onClick={() => setActiveAdminTab('items')}
          className={`pb-2 transition cursor-pointer ${
            activeAdminTab === 'items'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Items ({items.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`pb-2 transition cursor-pointer ${
            activeAdminTab === 'users'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Registered Users ({users.length})
        </button>
      </div>

      {/* Tab 1: Verification Queue / Pending Claims */}
      {activeAdminTab === 'overview' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">
              Pending Ownership Claims Awaiting Admin Verification
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {claims.filter(c => c.status === 'PENDING').length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No pending claims in the verification queue.
              </div>
            ) : (
              claims.filter(c => c.status === 'PENDING').map(claim => (
                <div key={claim.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{claim.itemName}</span>
                      <span className="text-xs text-slate-400 font-mono">Claim #{claim.id}</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Claimant: <strong>{claim.claimantName}</strong> ({claim.claimantEmail} • {claim.claimantPhone})
                    </p>
                    <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <strong>Ownership Proof:</strong> {claim.ownershipDescription}
                      {claim.proofDetails && <span className="block mt-0.5 text-slate-500">Details: {claim.proofDetails}</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setSelectedClaim(claim); setReviewAction('APPROVE'); }}
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve & Hand Over
                    </button>
                    <button
                      onClick={() => { setSelectedClaim(claim); setReviewAction('REJECT'); }}
                      className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: All Claims History */}
      {activeAdminTab === 'claims' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="p-3">Claim ID</th>
                <th className="p-3">Item</th>
                <th className="p-3">Claimant</th>
                <th className="p-3">Description</th>
                <th className="p-3">Status</th>
                <th className="p-3">Admin Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {claims.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono">#{c.id}</td>
                  <td className="p-3 font-semibold text-slate-900">{c.itemName}</td>
                  <td className="p-3">{c.claimantName} ({c.claimantEmail})</td>
                  <td className="p-3 max-w-xs truncate">{c.ownershipDescription}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      c.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      c.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{c.adminComment || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Manage Items */}
      {activeAdminTab === 'items' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="p-3">Image</th>
                <th className="p-3">Type</th>
                <th className="p-3">Item Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Location</th>
                <th className="p-3">Date</th>
                <th className="p-3">Reporter</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                        className="w-12 h-12 rounded-md object-cover border border-slate-200"
                      />
                    ) : null}
                    <div
                      className="w-12 h-12 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] font-medium text-slate-400 text-center leading-tight p-1"
                      style={{ display: item.imageUrl ? 'none' : 'flex' }}
                    >
                      No Image Available
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.type === 'LOST' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">{item.location}</td>
                  <td className="p-3">{item.date}</td>
                  <td className="p-3">{item.reporterName}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition cursor-pointer"
                      title="Delete Invalid Report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Registered Users */}
      {activeAdminTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="p-3">User ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Role</th>
                <th className="p-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono">#{u.id}</td>
                  <td className="p-3 font-semibold text-slate-900">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.phone || 'N/A'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === 'ROLE_ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role?.replace('ROLE_', '')}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Initial'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal Dialog */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {reviewAction === 'APPROVE' ? 'Approve Claim & Return Item' : 'Reject Claim'}
            </h3>
            <p className="text-xs text-slate-600">
              Item: <strong>{selectedClaim.itemName}</strong>
              <br />
              Claimant: {selectedClaim.claimantName} ({selectedClaim.claimantEmail})
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Comment / Feedback
              </label>
              <textarea
                rows={3}
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder={reviewAction === 'APPROVE'
                  ? 'Identity verified in admin office; item handed over.'
                  : 'Serial number did not match original found device.'}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setSelectedClaim(null); setAdminComment(''); }}
                className="py-1.5 px-3 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={reviewAction === 'APPROVE' ? handleApprove : handleReject}
                disabled={reviewLoading}
                className={`py-1.5 px-4 text-xs font-bold text-white rounded-lg shadow-sm transition cursor-pointer ${
                  reviewAction === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {reviewLoading ? 'Processing...' : reviewAction === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
