import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { claimAPI } from '../services/api';

export default function ClaimModal({ isOpen, onClose, item, onClaimSubmitted }) {
  const [ownershipDescription, setOwnershipDescription] = useState('');
  const [proofDetails, setProofDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        itemId: item.id,
        itemName: item.name,
        ownershipDescription,
        proofDetails,
      };

      const res = await claimAPI.submitClaim(payload);
      if (res.success) {
        setSuccessMsg('Your claim was successfully submitted to campus authorities for verification!');
        setTimeout(() => {
          if (onClaimSubmitted) onClaimSubmitted(res.data);
          onClose();
        }, 1500);
      } else {
        setError(res.message || 'Failed to submit claim');
      }
    } catch (err) {
      setError(err.message || 'Error submitting claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-200" />
            <div>
              <h2 className="text-lg font-bold">Claim Ownership</h2>
              <p className="text-xs text-blue-100">Submit proof to claim this found item</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Summary Card */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-700 flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-900 block text-sm">{item.name}</span>
            <span>Category: {item.category} • Location: {item.location}</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
            {item.status}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description of Ownership *
            </label>
            <textarea
              required
              rows={3}
              value={ownershipDescription}
              onChange={(e) => setOwnershipDescription(e.target.value)}
              placeholder="Describe when, where, and how you lost this item, along with any distinguishing details..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Proof / Identifiable Details (Optional but Recommended)
            </label>
            <textarea
              rows={3}
              value={proofDetails}
              onChange={(e) => setProofDetails(e.target.value)}
              placeholder="e.g. Serial number, lock screen wallpaper, specific scratch or sticker, invoice number..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800">
            <strong>Campus Verification Policy:</strong> False claims are strictly recorded against college ID. Admin verifies all claims before handover.
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!successMsg}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
