import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  LayoutDashboard,
  FileText,
  ShieldAlert,
  Bell,
  User,
  LogOut,
  PlusCircle,
  Menu,
  X,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { notificationAPI } from '../services/api';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenLogin,
  onOpenRegister,
  onOpenReportLost,
  onOpenReportFound
}) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchUnread = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationAPI.getUnreadCount();
      if (res.success) {
        setUnreadCount(res.data);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div
            onClick={() => setActiveTab('browse')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Compass className="w-5 h-5 group-hover:rotate-45 transition duration-300" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 tracking-tight block">
                Campus <span className="text-indigo-600">Lost & Found</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium block -mt-0.5">
                Centralized Smart Portal
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'browse'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Browse Items
            </button>

            <button
              onClick={() => setActiveTab('matches')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'matches'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Possible Matches
            </button>

            {isAuthenticated && (
              <>
                <button
                  onClick={() => setActiveTab(isAdmin ? 'admin-dashboard' : 'student-dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab.includes('dashboard')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </button>

                {!isAdmin && (
                  <>
                    <button
                      onClick={() => setActiveTab('my-reports')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'my-reports'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      My Reports
                    </button>

                    <button
                      onClick={() => setActiveTab('my-claims')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'my-claims'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      My Claims
                    </button>
                  </>
                )}

                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('admin-claims')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'admin-claims'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                    Verify Claims
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Quick Report CTAs */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={onOpenReportLost}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition cursor-pointer flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-red-600" />
                  Report Lost
                </button>
                <button
                  onClick={onOpenReportFound}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Report Found
                </button>
              </div>
            ) : null}

            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition relative cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>

                <NotificationDropdown
                  isOpen={isNotifOpen}
                  onClose={() => setIsNotifOpen(false)}
                />
              </div>
            )}

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                    {user?.name ? user.name[0] : 'U'}
                  </div>
                  <span className="hidden lg:inline-block max-w-[120px] truncate">{user?.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isAdmin ? 'ADMIN' : 'STUDENT'}
                  </span>
                </button>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-2">
          <button
            onClick={() => { setActiveTab('browse'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 text-sm font-semibold rounded text-slate-700 hover:bg-slate-50"
          >
            Browse Items
          </button>
          <button
            onClick={() => { setActiveTab('matches'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 text-sm font-semibold rounded text-slate-700 hover:bg-slate-50"
          >
            Possible Matches
          </button>
          {isAuthenticated && (
            <>
              <button
                onClick={() => { setActiveTab(isAdmin ? 'admin-dashboard' : 'student-dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 px-3 text-sm font-semibold rounded text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </button>
              {!isAdmin && (
                <>
                  <button
                    onClick={() => { setActiveTab('my-reports'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 px-3 text-sm font-semibold rounded text-slate-700 hover:bg-slate-50"
                  >
                    My Reports
                  </button>
                  <button
                    onClick={() => { setActiveTab('my-claims'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 px-3 text-sm font-semibold rounded text-slate-700 hover:bg-slate-50"
                  >
                    My Claims
                  </button>
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => { onOpenReportLost(); setMobileMenuOpen(false); }}
                      className="flex-1 py-2 text-xs font-semibold rounded bg-red-50 text-red-700 text-center"
                    >
                      Report Lost
                    </button>
                    <button
                      onClick={() => { onOpenReportFound(); setMobileMenuOpen(false); }}
                      className="flex-1 py-2 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 text-center"
                    >
                      Report Found
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
}