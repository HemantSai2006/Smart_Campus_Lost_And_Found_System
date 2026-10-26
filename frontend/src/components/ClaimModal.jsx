import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, CheckCircle2, Upload, FileText, Trash2, AlertTriangle } from 'lucide-react';
import { claimAPI, itemAPI } from '../services/api';

export default function ClaimModal({ isOpen, onClose, item, onClaimSubmitted }) {
  const [ownershipDescription, setOwnershipDescription] = useState('');
  const [proofDetails, setProofDetails] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [isPdf, setIsPdf] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !item) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = allowedExts.some(ext => fileName.endsWith(ext));

    if (!hasValidExt) {
      setError('Please upload a valid JPG, PNG, WEBP image, or PDF document.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Proof file size must be less than 5 MB.');
      return;
    }

    setError('');
    setProofFile(file);
    setProofFileName(file.name);

    if (fileName.endsWith('.pdf')) {
      setIsPdf(true);
      setProofPreview('');
    } else {
      setIsPdf(false);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveProof = () => {
    if (proofPreview && proofPreview.startsWith('blob:')) {
      URL.revokeObjectURL(proofPreview);
    }
    setProofFile(null);
    setProofFileName('');
    setProofPreview('');
    setIsPdf(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let uploadedProofUrl = null;

      if (proofFile) {
        setUploading(true);
        try {
          const uploadRes = await itemAPI.uploadImage(proofFile);
          uploadedProofUrl = typeof uploadRes?.data === 'string' ? uploadRes.data : uploadRes?.data?.imageUrl;
          if (!uploadedProofUrl) {
            throw new Error(uploadRes?.message || 'Proof document upload failed');
          }
        } catch (uploadErr) {
          setUploading(false);
          setLoading(false);
          setError(uploadErr?.message || 'Proof file upload failed. Please try again.');
          return;
        } finally {
          setUploading(false);
        }
      }

      const payload = {
        itemId: item.id,
        itemName: item.name,
        ownershipDescription: ownershipDescription.trim(),
        proofDetails: proofDetails ? proofDetails.trim() : null,
        proofFileUrl: uploadedProofUrl,
      };

      const res = await claimAPI.submitClaim(payload);
      if (res.success) {
        setSuccessMsg('Your claim was successfully submitted to campus authorities for manual verification!');
        setTimeout(() => {
          if (onClaimSubmitted) onClaimSubmitted(res.data);
          handleRemoveProof();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-8 overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
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
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{item.name}</span>
              {item.highValue && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-white shadow-sm">
                  ★ High-Value Item
                </span>
              )}
            </div>
            <span className="text-slate-500">Category: {item.category} • Location: {item.location}</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
            {item.status}
          </span>
        </div>

        {/* High-Value Item Warning */}
        {item.highValue && (
          <div className="mx-6 mt-4 p-3.5 bg-amber-50/90 rounded-xl border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-amber-950 mb-0.5">High-Value Item Verification Policy:</strong>
              This item is flagged as high-value (gold ornaments, laptops, phones, etc.). You must provide concrete evidence such as an invoice, warranty receipt, previous photographs, or exact secret identifying markings.
              <span className="block mt-1 font-semibold text-amber-800">Automatic approvals are never granted; physical verification by campus authorities is mandatory.</span>
            </div>
          </div>
        )}

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
              Secret / Identifiable Details (Unique Marks, Serial No, Stickers, Passcode hint)
            </label>
            <textarea
              rows={2}
              value={proofDetails}
              onChange={(e) => setProofDetails(e.target.value)}
              placeholder="e.g. Serial number, lock screen wallpaper, specific scratch or engraving..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Multiple Ownership Proofs Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Upload Ownership Proof (Purchase Bill, Previous Photo, Warranty Card, or ID)
            </label>
            {!proofFile ? (
              <label className="border-2 border-dashed border-slate-300 rounded-lg p-3.5 text-center cursor-pointer hover:border-indigo-500 transition block bg-slate-50 hover:bg-slate-100/50">
                <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-700 block">Attach Document / Photo</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">JPG, PNG, WEBP, or PDF up to 5 MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  {isPdf ? (
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                  ) : (
                    <img src={proofPreview} alt="Proof" className="w-12 h-12 rounded object-cover border border-slate-200 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{proofFileName}</p>
                    <p className="text-[10px] text-slate-500">{(proofFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveProof}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Remove File"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800">
            <strong>Campus Verification Policy:</strong> False claims are strictly recorded against college ID. Administrators manually verify proof against finder records before physical handover.
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || uploading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading || !!successMsg}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition cursor-pointer disabled:opacity-50"
            >
              {uploading ? 'Uploading Proof...' : loading ? 'Submitting Claim...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
