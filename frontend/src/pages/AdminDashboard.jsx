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
  Search,
  FileText,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ChevronDown
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
  const [claimStatusFilter, setClaimStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Review & Verification Modal State
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [reviewAction, setReviewAction] = useState(''); // 'UNDER_VERIFICATION' | 'APPROVE' | 'CONFIRM_HANDOVER' | 'REJECT'
  const [adminComment, setAdminComment] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientStudentId, setRecipientStudentId] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [modalError, setModalError] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const openClaimActionModal = (claim, action) => {
    setSelectedClaim(claim);
    setReviewAction(action);
    setModalError('');
    if (action === 'CONFIRM_HANDOVER') {
      setRecipientName(claim.claimantName || '');
      setRecipientStudentId(claim.claimantUserId ? `STU-${claim.claimantUserId}` : '');
      setHandoverNotes('');
    } else if (action === 'APPROVE') {
      setAdminComment('');
    } else if (action === 'UNDER_VERIFICATION') {
      setVerificationNotes('');
    } else if (action === 'REJECT') {
      setAdminComment('');
    }
  };

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

      const activePendingCount = allClaims.filter(c => c.status === 'PENDING' || c.status === 'UNDER_VERIFICATION').length;

      setStats({
        totalUsers: allUsers.length,
        totalLost: itemStats.lostItems || 0,
        totalFound: itemStats.foundItems || 0,
        totalMatched: matches.length,
        pendingClaims: activePendingCount,
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

  const handleMarkUnderVerification = async () => {
    if (!selectedClaim) return;
    setModalError('');
    setReviewLoading(true);
    try {
      await claimAPI.markUnderVerification(selectedClaim.id, verificationNotes || 'Evidence placed under manual verification.');
      setSelectedClaim(null);
      setVerificationNotes('');
      setModalError('');
      await fetchAdminData();
    } catch (e) {
      setModalError(e.message || 'Error moving claim to under verification');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedClaim) return;
    setModalError('');
    setReviewLoading(true);
    try {
      await claimAPI.approveClaim(selectedClaim.id, adminComment || 'Ownership evidence verified by administrator.');
      setSelectedClaim(null);
      setAdminComment('');
      setModalError('');
      await fetchAdminData();
    } catch (e) {
      setModalError(e.message || 'Error approving claim');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleConfirmHandover = async () => {
    if (!selectedClaim) return;
    setModalError('');

    if (!recipientName || !recipientName.trim()) {
      setModalError('Recipient name is required to confirm handover.');
      return;
    }

    if (!recipientStudentId || !recipientStudentId.trim()) {
      setModalError('Recipient Student ID is required for identity verification.');
      return;
    }

    setReviewLoading(true);
    try {
      await claimAPI.confirmHandover(selectedClaim.id, {
        recipientName: recipientName.trim(),
        recipientStudentId: recipientStudentId.trim(),
        notes: handoverNotes ? handoverNotes.trim() : 'Physical item handed over to verified recipient in admin office.',
      });
      setSelectedClaim(null);
      setRecipientName('');
      setRecipientStudentId('');
      setHandoverNotes('');
      setModalError('');
      await fetchAdminData();
    } catch (e) {
      setModalError(e.message || 'Error confirming handover');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedClaim) return;
    setModalError('');
    setReviewLoading(true);
    try {
      await claimAPI.rejectClaim(selectedClaim.id, adminComment || 'Claim rejected: evidence or serial number does not match item.');
      setSelectedClaim(null);
      setAdminComment('');
      setModalError('');
      await fetchAdminData();
    } catch (e) {
      setModalError(e.message || 'Error rejecting claim');
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

  const getStatusBadge = (claim) => {
    switch (claim.status) {
      case 'UNDER_VERIFICATION':
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Under Verification
          </span>
        );
      case 'APPROVED':
        if (claim.handoverAt) {
          return (
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Handover Complete
            </span>
          );
        }
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <Check className="w-3 h-3" /> Approved (Awaiting Handover)
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800 border border-red-200">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
    }
  };

  const filteredHistoryClaims = claimStatusFilter === 'ALL'
    ? claims
    : claims.filter(c => c.status === claimStatusFilter);

  // Active queue: Pending or Under Verification or Approved awaiting handover
  const queueClaims = claims.filter(c => c.status === 'PENDING' || c.status === 'UNDER_VERIFICATION' || (c.status === 'APPROVED' && !c.handoverAt));

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-300">
            Security & Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Campus Admin Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1">
            Ownership verification authority, fraud prevention, proof evaluation, and physical item handover.
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
            <span className="text-xs font-semibold">Active Claims Queue</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-600">{stats.pendingClaims}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Lost Items</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-2xl font-black text-slate-900">{stats.totalLost}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Found Items</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-slate-900">{stats.totalFound}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Matched Pairs</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl font-black text-slate-900">{stats.totalMatched}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Returned Items</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl font-black text-emerald-600">{stats.returnedItems}</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-4 border-b border-slate-200 text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`pb-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeAdminTab === 'overview'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Active Verification Queue ({queueClaims.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('claims')}
          className={`pb-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeAdminTab === 'claims'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          All Claims History ({claims.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('items')}
          className={`pb-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeAdminTab === 'items'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Items ({items.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`pb-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeAdminTab === 'users'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Registered Users ({users.length})
        </button>
      </div>

      {/* Tab 1: Active Verification Queue */}
      {activeAdminTab === 'overview' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Ownership Verification & Handover Queue
              </h3>
              <p className="text-xs text-slate-500">
                Compare claimant's proof and description against the finder's confidential records before approving.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {queueClaims.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                No pending or unreleased claims in the verification queue.
              </div>
            ) : (
              queueClaims.map(claim => (
                <div key={claim.id} className="p-5 space-y-4 hover:bg-slate-50/50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">Claim #{claim.id}</span>
                        <h4 className="font-bold text-slate-900 text-base">{claim.itemName}</h4>
                        {claim.highValue && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-white shadow-sm flex items-center gap-0.5">
                            ★ High-Value Item
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Claimant: <strong>{claim.claimantName}</strong> ({claim.claimantEmail} • {claim.claimantPhone}) • User ID: #{claim.claimantUserId}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(claim)}
                    </div>
                  </div>

                  {/* Verification Comparison Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Left: Claimant Evidence */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        Claimant's Submitted Evidence
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block font-medium">Ownership Description:</span>
                        <p className="text-slate-700 leading-relaxed">{claim.ownershipDescription}</p>
                      </div>
                      {claim.proofDetails && (
                        <div className="pt-1.5 border-t border-slate-200">
                          <span className="text-slate-400 text-[11px] block font-medium">Unique Identifying Details:</span>
                          <p className="text-slate-700">{claim.proofDetails}</p>
                        </div>
                      )}
                      {claim.proofFileUrl ? (
                        <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">Supporting Document / Photo:</span>
                          <a
                            href={claim.proofFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            View Attached Proof <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : (
                        <div className="pt-1.5 border-t border-slate-200 text-slate-400 text-[11px]">
                          No file/bill uploaded by claimant.
                        </div>
                      )}
                    </div>

                    {/* Right: Finder's Confidential Record (Admin Only) */}
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                      <div className="font-semibold text-amber-950 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        Finder's Confidential Details (Admin Only)
                      </div>
                      <p className="text-[11px] text-amber-800">
                        {claim.privateItemDetails ? (
                          <span className="font-mono bg-white p-2 rounded block border border-amber-200 text-slate-800">
                            {claim.privateItemDetails}
                          </span>
                        ) : (
                          <span className="italic text-slate-500">
                            Finder did not record private identifying details. Verify physical appearance in office.
                          </span>
                        )}
                      </p>
                      {claim.verificationNotes && (
                        <div className="pt-1.5 border-t border-amber-200 text-[11px] text-slate-600">
                          <strong>Admin Verification Notes:</strong> {claim.verificationNotes}
                          {claim.reviewedBy && <span className="block text-slate-400 text-[10px]">Logged by: {claim.reviewedBy}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">
                      Submitted: {claim.createdAt ? new Date(claim.createdAt).toLocaleString() : 'Recent'}
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {claim.status === 'PENDING' && (
                        <button
                          onClick={() => openClaimActionModal(claim, 'UNDER_VERIFICATION')}
                          className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Mark Under Verification
                        </button>
                      )}

                      {(claim.status === 'PENDING' || claim.status === 'UNDER_VERIFICATION') && (
                        <>
                          <button
                            onClick={() => openClaimActionModal(claim, 'APPROVE')}
                            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve Claim
                          </button>
                          <button
                            onClick={() => openClaimActionModal(claim, 'REJECT')}
                            className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}

                      {claim.status === 'APPROVED' && !claim.handoverAt && (
                        <button
                          onClick={() => openClaimActionModal(claim, 'CONFIRM_HANDOVER')}
                          className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer ring-2 ring-indigo-300"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Confirm Physical Handover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: All Claims History with Filter */}
      {activeAdminTab === 'claims' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-3">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Complete Ownership Claims Audit Trail</h3>
              <p className="text-xs text-slate-500">Detailed records of all submitted claims, verification notes, and physical handovers.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Filter Status:</span>
              <select
                value={claimStatusFilter}
                onChange={(e) => setClaimStatusFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Statuses ({claims.length})</option>
                <option value="PENDING">PENDING</option>
                <option value="UNDER_VERIFICATION">UNDER_VERIFICATION</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="p-3">Claim ID</th>
                  <th className="p-3">Item</th>
                  <th className="p-3">Claimant</th>
                  <th className="p-3">Description & Proof</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Finder Secret Details</th>
                  <th className="p-3">Handover & Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistoryClaims.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono">#{c.id}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-900 block">{c.itemName}</span>
                      {c.highValue && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-500 text-white">
                          ★ High Value
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold block">{c.claimantName}</span>
                      <span className="text-slate-500 text-[11px] block">{c.claimantEmail}</span>
                      <span className="text-slate-400 text-[10px] block">{c.claimantPhone}</span>
                    </td>
                    <td className="p-3 max-w-xs">
                      <p className="line-clamp-2 text-slate-700">{c.ownershipDescription}</p>
                      {c.proofFileUrl && (
                        <a
                          href={c.proofFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[11px] text-indigo-600 font-semibold"
                        >
                          <FileText className="w-3 h-3" /> View Evidence
                        </a>
                      )}
                    </td>
                    <td className="p-3">{getStatusBadge(c)}</td>
                    <td className="p-3 max-w-xs text-slate-600 font-mono text-[11px]">
                      {c.privateItemDetails || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="p-3 text-slate-600 text-[11px]">
                      {c.handoverAt ? (
                        <div className="text-emerald-700">
                          <strong>Handed over:</strong> {new Date(c.handoverAt).toLocaleDateString()}
                          <span className="block text-[10px] text-slate-500">By {c.handoverConfirmedBy} to {c.handoverRecipient}</span>
                        </div>
                      ) : c.status === 'APPROVED' ? (
                        <button
                          onClick={() => openClaimActionModal(c, 'CONFIRM_HANDOVER')}
                          className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded cursor-pointer hover:bg-indigo-700"
                        >
                          Confirm Handover
                        </button>
                      ) : (
                        c.adminComment || c.verificationNotes || '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  <td className="p-3 font-semibold text-slate-900">
                    {item.name}
                    {item.highValue && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-500 text-white">
                        ★ High Value
                      </span>
                    )}
                  </td>
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

      {/* Action / Review Modal Dialog */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {reviewAction === 'UNDER_VERIFICATION' && 'Move Claim to Under Verification'}
                {reviewAction === 'APPROVE' && 'Approve Claim (Awaiting Handover)'}
                {reviewAction === 'CONFIRM_HANDOVER' && 'Confirm Physical Item Handover'}
                {reviewAction === 'REJECT' && 'Reject Ownership Claim'}
              </h3>
              <button
                onClick={() => setSelectedClaim(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p>Item: <strong>{selectedClaim.itemName}</strong> (Claim #{selectedClaim.id})</p>
              <p>Claimant: <strong>{selectedClaim.claimantName}</strong> ({selectedClaim.claimantEmail} • {selectedClaim.claimantPhone})</p>
              {selectedClaim.highValue && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-white">
                  ★ High-Value Item
                </span>
              )}
            </div>

            {/* Inline Validation / API Error Alert */}
            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span className="font-medium">{modalError}</span>
              </div>
            )}

            {/* Modal Input Content according to Action */}
            {reviewAction === 'UNDER_VERIFICATION' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Verification Notes / Escalation Details
                </label>
                <textarea
                  rows={3}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="e.g. Claimant requested to visit security desk with purchase invoice; or multiple claimants under review..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500">
                  This moves the claim to <strong>UNDER_VERIFICATION</strong> and notifies the student that their evidence is actively being examined.
                </p>
              </div>
            )}

            {reviewAction === 'APPROVE' && (
              <div className="space-y-2">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 text-xs">
                  <strong>Important Handover Process:</strong>
                  Approving this claim validates ownership, but will <em>keep the item awaiting physical handover</em>. The item is NOT returned until staff confirms physical receipt in the campus office.
                </div>
                <label className="block text-xs font-semibold text-slate-700">
                  Admin Approval Remarks
                </label>
                <textarea
                  rows={3}
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="e.g. Identity and purchase invoice successfully verified against confidential markings."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            {reviewAction === 'CONFIRM_HANDOVER' && (
              <div className="space-y-3">
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-indigo-900 text-xs">
                  <strong>Physical Verification & Handover:</strong>
                  Verify recipient identity with their physical College Student ID card. Handing over will mark the item as <strong>RETURNED</strong>, save audit details, and notify the claimant.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recipient Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => { setRecipientName(e.target.value); setModalError(''); }}
                    placeholder="Recipient's full legal name"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Auto-populated from approved claimant ({selectedClaim.claimantName}).
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recipient Student ID / Roll No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientStudentId}
                    onChange={(e) => { setRecipientStudentId(e.target.value); setModalError(''); }}
                    placeholder="e.g. STU-101, CS2024-042"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Check the physical ID card presented by recipient.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Handover Notes & Verification Details
                  </label>
                  <textarea
                    rows={2}
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    placeholder="e.g. Verified college ID card, matched serial number physically, handed over in security office."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {reviewAction === 'REJECT' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Reason for Rejection (Visible to Claimant)
                </label>
                <textarea
                  rows={3}
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="e.g. Serial number and markings provided do not match the found item."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedClaim(null)}
                className="py-1.5 px-3 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={
                  reviewAction === 'UNDER_VERIFICATION' ? handleMarkUnderVerification :
                  reviewAction === 'APPROVE' ? handleApprove :
                  reviewAction === 'CONFIRM_HANDOVER' ? handleConfirmHandover :
                  handleReject
                }
                disabled={reviewLoading}
                className={`py-1.5 px-4 text-xs font-bold text-white rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50 ${
                  reviewAction === 'UNDER_VERIFICATION' ? 'bg-blue-600 hover:bg-blue-700' :
                  reviewAction === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  reviewAction === 'CONFIRM_HANDOVER' ? 'bg-indigo-600 hover:bg-indigo-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                {reviewLoading ? 'Processing...' :
                  reviewAction === 'UNDER_VERIFICATION' ? 'Confirm Under Verification' :
                  reviewAction === 'APPROVE' ? 'Approve Claim' :
                  reviewAction === 'CONFIRM_HANDOVER' ? 'Confirm Handover & Complete' :
                  'Confirm Rejection'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
