import React from 'react';
import { X, MapPin, Calendar, Tag, ShieldCheck, User, Phone, Mail, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ItemDetailsModal({ isOpen, onClose, item, onClaim, onDelete }) {
  const { user, isAdmin } = useAuth();
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [item]);

  if (!isOpen || !item) return null;

  const isOwner = user?.id === item.userId;
  const canDelete = isOwner || isAdmin;
  const isFound = item.type === 'FOUND';
  const canClaim = isFound && item.status !== 'RETURNED' && !isOwner && !isAdmin && !!user;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full my-8 overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative h-64 bg-slate-100 overflow-hidden flex items-center justify-center">
          {item.imageUrl && !imageError ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-slate-400 text-center flex flex-col items-center justify-center">
              <Tag className="w-12 h-12 mx-auto mb-1.5 text-slate-300 stroke-1" />
              <span className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400">{item.category}</span>
              <span className="text-[11px] text-slate-400 font-mono mt-0.5">No Image Available</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-3 flex gap-2">
            <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase shadow ${
              item.type === 'LOST' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {item.type}
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-bold uppercase shadow bg-white/90 text-slate-800">
              STATUS: {item.status}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{item.name}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                Category: {item.category}
              </span>
              <span className="flex items-center gap-1 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Location: {item.location}
              </span>
              <span className="flex items-center gap-1 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Date: {item.date}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400 block font-medium">Brand</span>
              <span className="text-slate-800 font-semibold">{item.brand || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Color</span>
              <span className="text-slate-800 font-semibold">{item.color || 'Not specified'}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Description</h4>
            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line">
              {item.description || 'No additional description provided.'}
            </p>
          </div>

          {/* Reporter Information */}
          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Reporter Information</h4>
            <div className="text-xs space-y-1 text-slate-600">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Name: <strong>{item.reporterName || 'Campus Student'}</strong></span>
              </div>
              {item.reporterEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email: {item.reporterEmail}</span>
                </div>
              )}
              {item.reporterPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Phone: {item.reporterPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            {canDelete && (
              <button
                onClick={() => { onDelete(item); onClose(); }}
                className="py-2 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Report
              </button>
            )}

            <div className="ml-auto flex gap-2">
              <button
                onClick={onClose}
                className="py-2 px-4 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Close
              </button>

              {canClaim && (
                <button
                  onClick={() => { onClose(); onClaim(item); }}
                  className="py-2 px-5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Claim This Item
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
