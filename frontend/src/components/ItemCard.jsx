import React from 'react';
import { MapPin, Calendar, Tag, ShieldCheck, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ItemCard({ item, onViewDetails, onClaim, onDelete }) {
  const { user, isAdmin } = useAuth();
  const [imageError, setImageError] = React.useState(false);
  const isOwner = user?.id === item.userId;
  const canDelete = isOwner || isAdmin;
  const isFound = item.type === 'FOUND';
  const canClaim = isFound && item.status !== 'RETURNED' && !isOwner && !isAdmin && !!user;

  const getStatusColor = (status) => {
    switch (status) {
      case 'REPORTED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MATCHED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CLAIMED': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'RETURNED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col group">
      {/* Top Banner / Image */}
      <div className="relative h-44 bg-slate-100 overflow-hidden flex items-center justify-center">
        {item.imageUrl && !imageError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="text-slate-400 text-center p-4 flex flex-col items-center justify-center">
            <Tag className="w-9 h-9 mx-auto mb-1 text-slate-300 stroke-1" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">No Image Available</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase shadow-sm ${
            item.type === 'LOST' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
          }`}>
            {item.type}
          </span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border uppercase shadow-sm ${getStatusColor(item.status)}`}>
            {item.status}
          </span>
        </div>

        {canDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(item); }}
            title="Delete Item"
            className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-600 hover:text-white rounded-lg text-slate-500 shadow transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
            {item.name}
          </h3>

          <div className="mt-2 space-y-1 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>{item.category} {item.brand ? `• ${item.brand}` : ''}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{item.location}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{item.date}</span>
            </div>
          </div>

          {item.description && (
            <p className="mt-2.5 text-xs text-slate-600 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => onViewDetails(item)}
            className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Details
          </button>

          {canClaim && (
            <button
              onClick={() => onClaim(item)}
              className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Claim
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
