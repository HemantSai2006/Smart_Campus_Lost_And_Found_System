import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle, Clock, FileText, ExternalLink, AlertTriangle } from 'lucide-react';
import { claimAPI } from '../services/api';

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await claimAPI.getMyClaims();
      if (res.success && res.data) {
        setClaims(res.data);
      } else {
        setError(res.message || 'Failed to load your claims');
      }
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to load your claims. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const getStatusBadge = (claim) => {
    switch (claim.status) {
      case 'UNDER_VERIFICATION':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Under Verification
          </span>
        );
      case 'APPROVED':
        if (claim.handoverAt) {
          return (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Handover Complete
            </span>
          );
        }
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Approved (Awaiting Handover)
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-800 border border-red-200">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            My Submitted Ownership Claims
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor verification progress, submit supporting evidence, and view physical handover status.
          </p>
        </div>

        <button
          onClick={fetchClaims}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-indigo-600" />
          <p className="text-xs">Loading claims...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
          <h3 className="text-sm font-bold text-red-800">Error Loading Claims</h3>
          <p className="text-xs text-red-600 mt-1 mb-4">{error}</p>
          <button
            onClick={fetchClaims}
            className="py-1.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No Claims Submitted</h3>
          <p className="text-xs text-slate-500 mt-1">
            When you see a found item that belongs to you, click "Claim" to submit ownership proof.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {claims.map(claim => (
            <div
              key={claim.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">Claim #{claim.id}</span>
                      {claim.highValue && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-500 text-white">
                          ★ High Value
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{claim.itemName}</h3>
                  </div>
                  <div>{getStatusBadge(claim)}</div>
                </div>

                {/* Handover Notice Banner */}
                {claim.status === 'APPROVED' && !claim.handoverAt && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-emerald-950 text-xs">
                    <strong className="block font-bold mb-0.5">🎉 Claim Approved — Ready for Physical Handover!</strong>
                    <span>
                      Please visit the campus Lost & Found desk (Admin/Security Office) with your Student ID card to verify and collect your item.
                    </span>
                  </div>
                )}

                {/* Completed Handover Banner */}
                {claim.handoverAt && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs">
                    <strong className="block font-semibold text-slate-900 mb-0.5">Item Successfully Returned</strong>
                    <span>Handed over to <strong>{claim.handoverRecipient || claim.claimantName}</strong> {claim.handoverRecipientStudentId && `(Student ID: ${claim.handoverRecipientStudentId}) `}by admin <strong>{claim.handoverConfirmedBy || 'Staff'}</strong> on {new Date(claim.handoverAt).toLocaleString()}.</span>
                  </div>
                )}

                {/* Under Verification Banner */}
                {claim.status === 'UNDER_VERIFICATION' && (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-xs">
                    <strong className="block font-bold mb-0.5">🔍 Active Manual Verification in Progress</strong>
                    <span>
                      An authorized college administrator is reviewing your submitted evidence against the item's private identifying details.
                    </span>
                    {claim.verificationNotes && (
                      <p className="mt-1 pt-1 border-t border-blue-200 text-[11px] text-blue-800">
                        <strong>Admin Notes:</strong> {claim.verificationNotes}
                      </p>
                    )}
                  </div>
                )}

                <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                  <div>
                    <span className="font-semibold text-slate-700 block mb-0.5">Your Ownership Description:</span>
                    <p className="text-slate-600 leading-relaxed">{claim.ownershipDescription}</p>
                  </div>

                  {claim.proofDetails && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-semibold text-slate-700 block mb-0.5">Secret Details Submitted:</span>
                      <p className="text-slate-600">{claim.proofDetails}</p>
                    </div>
                  )}

                  {claim.proofFileUrl && (
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        Supporting Proof Document
                      </span>
                      <a
                        href={claim.proofFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        View File <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Admin Feedback */}
                {claim.adminComment && (
                  <div className={`p-3 rounded-xl text-xs ${
                    claim.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
                  }`}>
                    <span className="font-bold block mb-0.5">Authority Feedback:</span>
                    <span>{claim.adminComment}</span>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
                <span>Submitted on: {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : 'Recent'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
