import React, { useState, useEffect } from 'react';
import { Menu, Bell, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { notificationAPI } from '../services/api';

const tabTitles = {
  'browse': { title: 'Browse Items', subtitle: 'Explore lost and found belongings across campus' },
  'matches': { title: 'Possible Matches', subtitle: 'Potential matches identified for reported belongings' },
  'student-dashboard': { title: 'Student Dashboard', subtitle: 'Overview of your reports, claims, and activity' },
  'admin-dashboard': { title: 'Admin Overview', subtitle: 'System-wide metrics and verification management' },
  'admin-claims': { title: 'Claim Verification', subtitle: 'Review and approve student ownership claims' },
  'my-reports': { title: 'My Reported Items', subtitle: 'Track your reported lost and found items' },
  'my-claims': { title: 'My Ownership Claims', subtitle: 'View the status of your submitted claims' },
  'profile': { title: 'Account Settings', subtitle: 'Manage your profile and change your password' },
};

export default function Header({
  activeTab,
  onOpenReportLost,
  onOpenReportFound,
  onToggleMobileSidebar
}) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const fetchUnread = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationAPI.getUnreadCount();
      if (res.success) {
        const count = res.data?.count ?? res.data?.unreadCount ?? (typeof res.data === 'number' ? res.data : 0);
        setUnreadCount(count);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const currentInfo = tabTitles[activeTab] || { title: 'Campus Lost & Found', subtitle: 'Campus Community Portal' };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-tight">
            {currentInfo.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-400 font-normal">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick actions & Notifications */}
      <div className="flex items-center gap-3">
        {/* Quick Report CTAs in Header (Desktop) */}
        {isAuthenticated && (
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={onOpenReportLost}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-red-600" />
              Report Lost
            </button>
            <button
              onClick={onOpenReportFound}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              Report Found
            </button>
          </div>
        )}

        {/* Notifications */}
        {isAuthenticated && (
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <NotificationDropdown
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
            />
          </div>
        )}

        {/* User Pill */}
        {isAuthenticated && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 max-w-[120px] truncate">
              {user?.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
