import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { itemAPI, claimAPI, matchingAPI, notificationAPI } from '../services/api';

export default function StudentDashboard({
  onOpenReportLost,
  onOpenReportFound,
  onNavigateToTab,
  onViewDetails,
  refreshTrigger
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    myReportsCount: 0,
    lostCount: 0,
    foundCount: 0,
    myClaimsCount: 0,
    pendingClaimsCount: 0,
    matchesCount: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [recentClaims, setRecentClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [itemsRes, claimsRes, matchesRes, notifsRes] = await Promise.all([
        itemAPI.getMyItems(),
        claimAPI.getMyClaims(),
        matchingAPI.getAllMatches(),
        notificationAPI.getNotifications(false),
      ]);

      const myItems = Array.isArray(itemsRes?.data) ? itemsRes.data : (Array.isArray(itemsRes) ? itemsRes : []);
      const myClaims = Array.isArray(claimsRes?.data) ? claimsRes.data : (Array.isArray(claimsRes) ? claimsRes : []);
      const matches = Array.isArray(matchesRes?.data) ? matchesRes.data : (Array.isArray(matchesRes) ? matchesRes : []);
      const notifs = Array.isArray(notifsRes?.data) ? notifsRes.data : (Array.isArray(notifsRes) ? notifsRes : []);

      setRecentReports(myItems.slice(0, 4));
      setRecentClaims(myClaims.slice(0, 4));
      setNotifications(notifs.slice(0, 4));

      const lostItems = myItems.filter(i => i.type === 'LOST');
      const foundItems = myItems.filter(i => i.type === 'FOUND');

      setStats({
        myReportsCount: myItems.length,
        lostCount: lostItems.length,
        foundCount: foundItems.length,
        myClaimsCount: myClaims.length,
        pendingClaimsCount: myClaims.filter(c => c.status === 'PENDING').length,
        matchesCount: matches.length,
      });
    } catch (e) {
      console.error('Error loading student dashboard:', e);
      setError(e.message || 'Failed to load your dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [refreshTrigger]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold text-blue-200 tracking-wider">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs text-blue-100 mt-1 max-w-lg">
            Track your reported items, review potential matches, and manage ownership claims.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenReportLost}
            className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Report Lost
          </button>
          <button
            onClick={onOpenReportFound}
            className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Report Found
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="py-1 px-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-xs transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Reports</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-black text-slate-900">{error ? '—' : stats.myReportsCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Lost Items</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-2xl font-black text-red-600">{error ? '—' : stats.lostCount}</span>
        </div>

        <div
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
          title="Items reported as found by you"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Found Items</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-emerald-600">{error ? '—' : stats.foundCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Matches</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-600">{error ? '—' : stats.matchesCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">My Claims</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl font-black text-blue-600">{error ? '—' : stats.myClaimsCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Pending Claims</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl font-black text-purple-600">{error ? '—' : stats.pendingClaimsCount}</span>
        </div>
      </div>

      {/* Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Reports */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                My Recent Reports
              </h3>
              <button
                onClick={() => onNavigateToTab('my-reports')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {error ? (
                <div className="p-8 text-center text-xs text-red-600 font-medium">
                  Failed to load reports. Please retry.
                </div>
              ) : recentReports.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  You haven't reported any lost or found items yet.
                </div>
              ) : (
                recentReports.map(item => (
                  <div
                    key={item.id}
                    onClick={() => onViewDetails(item)}
                    className="p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.type === 'LOST' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.type}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">{item.name}</h4>
                        <span className="text-[11px] text-slate-500">
                          {item.category} • {item.location} • {item.date}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Claims */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                My Ownership Claims
              </h3>
              <button
                onClick={() => onNavigateToTab('my-claims')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {error ? (
                <div className="p-8 text-center text-xs text-red-600 font-medium">
                  Failed to load claims. Please retry.
                </div>
              ) : recentClaims.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No claims submitted yet.
                </div>
              ) : (
                recentClaims.map(claim => (
                  <div key={claim.id} className="p-3.5 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{claim.itemName}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{claim.ownershipDescription}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                      claim.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : claim.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Notifications Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              Recent Alerts
            </h3>
          </div>

          <div className="p-4 flex-1 space-y-3">
            {error ? (
              <div className="p-6 text-center text-xs text-red-600 font-medium">
                Failed to load alerts.
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No notifications received yet.
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-xs text-slate-800 font-medium">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
