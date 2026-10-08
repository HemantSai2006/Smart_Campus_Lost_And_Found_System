import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Tag, MapPin, Calendar, RefreshCw } from 'lucide-react';
import { matchingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PossibleMatches({ onClaim, onViewDetails }) {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await matchingAPI.getAllMatches();
      if (res.success && res.data) {
        setMatches(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to calculate matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-xs uppercase font-bold tracking-wider text-purple-200">
            Automated Match Suggestions
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Potential Item Matches
        </h1>
        <p className="mt-1 text-sm text-purple-200 max-w-xl">
          Matches are identified by comparing item categories, locations, brands, and descriptions to help reconnect lost belongings with their owners.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2 text-indigo-600" />
          <p className="text-sm">Searching for matching items across campus...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Sparkles className="w-10 h-10 mx-auto text-amber-500 mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Potential Matches Yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            As more lost and found reports are submitted with corresponding categories and locations, matching pairs will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((pair, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4"
            >
              {/* Score Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Match Confidence:
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                    pair.score >= 80
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : pair.score >= 60
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {pair.score}% Match Score
                  </span>
                </div>

                {/* Match Reasons Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {pair.matchReasons?.map((reason, rIdx) => (
                    <span
                      key={rIdx}
                      className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-semibold"
                    >
                      ✓ {reason}
                    </span>
                  ))}
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lost Item */}
                <div className="p-4 rounded-xl bg-red-50/50 border border-red-100 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-600 text-white">
                        LOST ITEM
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">ID #{pair.lostItem.id}</span>
                    </div>

                    {/* Image Box */}
                    <div className="h-32 bg-white rounded-lg border border-red-100 overflow-hidden mb-3 flex items-center justify-center">
                      {pair.lostItem.imageUrl ? (
                        <img
                          src={pair.lostItem.imageUrl}
                          alt={pair.lostItem.name}
                          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                      <div
                        className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50"
                        style={{ display: pair.lostItem.imageUrl ? 'none' : 'flex' }}
                      >
                        <Tag className="w-6 h-6 mb-1 text-slate-300" />
                        <span className="text-[10px] font-medium text-slate-400">No Image Available</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{pair.lostItem.name}</h4>
                    <div className="mt-2 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <span>Category: {pair.lostItem.category} {pair.lostItem.brand ? `• ${pair.lostItem.brand}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Lost at: {pair.lostItem.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Date: {pair.lostItem.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-red-100 text-[11px] text-slate-500">
                    Reported by: <strong>{pair.lostItem.reporterName || 'Student'}</strong>
                  </div>
                </div>

                {/* Found Item */}
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-600 text-white">
                        FOUND ITEM
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">ID #{pair.foundItem.id}</span>
                    </div>

                    {/* Image Box */}
                    <div className="h-32 bg-white rounded-lg border border-emerald-100 overflow-hidden mb-3 flex items-center justify-center">
                      {pair.foundItem.imageUrl ? (
                        <img
                          src={pair.foundItem.imageUrl}
                          alt={pair.foundItem.name}
                          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                      <div
                        className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50"
                        style={{ display: pair.foundItem.imageUrl ? 'none' : 'flex' }}
                      >
                        <Tag className="w-6 h-6 mb-1 text-slate-300" />
                        <span className="text-[10px] font-medium text-slate-400">No Image Available</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{pair.foundItem.name}</h4>
                    <div className="mt-2 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <span>Category: {pair.foundItem.category} {pair.foundItem.brand ? `• ${pair.foundItem.brand}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Found at: {pair.foundItem.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Date: {pair.foundItem.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Reported by: <strong>{pair.foundItem.reporterName || 'Student'}</strong>
                    </span>

                    {/* Claim Button */}
                    {isAuthenticated && !isAdmin && pair.foundItem.status !== 'RETURNED' && (
                      <button
                        onClick={() => onClaim(pair.foundItem)}
                        className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Claim Found Item
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
