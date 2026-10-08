import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            My Submitted Ownership Claims
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor verification progress and administrative decisions on your claims.
          </p>
        </div>

        <button
          onClick={fetchClaims}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500"
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
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">Claim #{claim.id}</span>
                  <h3 className="text-base font-bold text-slate-900">{claim.itemName}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  claim.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : claim.status === 'REJECTED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {claim.status}
                </span>
              </div>

              <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="font-semibold text-slate-700 block">Your Proof Description:</span>
                <p className="text-slate-600">{claim.ownershipDescription}</p>
                {claim.proofDetails && (
                  <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                    <strong>Details:</strong> {claim.proofDetails}
                  </p>
                )}
              </div>

              {/* Admin Comment */}
              {claim.adminComment && (
                <div className={`p-3 rounded-xl text-xs ${
                  claim.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
                }`}>
                  <span className="font-bold block">Authority Feedback:</span>
                  <span>{claim.adminComment}</span>
                </div>
              )}

              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                <span>Submitted on: {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : 'Recent'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
