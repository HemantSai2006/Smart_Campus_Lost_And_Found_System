import React from 'react';
import {
  Compass,
  Search,
  Sparkles,
  LayoutDashboard,
  FileText,
  ShieldAlert,
  PlusCircle,
  User,
  LogOut,
  LogIn,
  UserPlus,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenLogin,
  onOpenRegister,
  onOpenReportLost,
  onOpenReportFound,
  isMobileOpen,
  setIsMobileOpen
}) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between">
          <div
            onClick={() => handleNavClick('browse')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Compass className="w-5 h-5 group-hover:rotate-45 transition duration-300" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 tracking-tight block leading-tight">
                Campus <span className="text-indigo-600">Lost & Found</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                Campus Community Portal
              </span>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Report Action Buttons */}
        <div className="p-4 border-b border-slate-100 space-y-2">
          <button
            onClick={() => {
              onOpenReportLost();
              if (setIsMobileOpen) setIsMobileOpen(false);
            }}
            className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-red-600" />
            Report Lost Item
          </button>
          <button
            onClick={() => {
              onOpenReportFound();
              if (setIsMobileOpen) setIsMobileOpen(false);
            }}
            className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            Report Found Item
          </button>
        </div>

        {/* Vertical Navigation Options */}
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
          {/* Main Navigation */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu Options
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleNavClick('browse')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                  activeTab === 'browse'
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Search className={`w-4 h-4 ${activeTab === 'browse' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>Browse Items</span>
              </button>

              <button
                onClick={() => handleNavClick('matches')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                  activeTab === 'matches'
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className={`w-4 h-4 ${activeTab === 'matches' ? 'text-amber-500' : 'text-amber-400'}`} />
                  <span>Possible Matches</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
                  Auto
                </span>
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => handleNavClick(isAdmin ? 'admin-dashboard' : 'student-dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                    activeTab.includes('dashboard')
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className={`w-4 h-4 ${activeTab.includes('dashboard') ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>Dashboard</span>
                </button>
              )}
            </nav>
          </div>

          {/* User Activity Section */}
          {isAuthenticated && !isAdmin && (
            <div>
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                My Activity
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => handleNavClick('my-reports')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                    activeTab === 'my-reports'
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className={`w-4 h-4 ${activeTab === 'my-reports' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>My Reports</span>
                </button>

                <button
                  onClick={() => handleNavClick('my-claims')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                    activeTab === 'my-claims'
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ShieldAlert className={`w-4 h-4 ${activeTab === 'my-claims' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>My Claims</span>
                </button>
              </nav>
            </div>
          )}

          {/* Admin Tools Section */}
          {isAuthenticated && isAdmin && (
            <div>
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Administration
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => handleNavClick('admin-claims')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                    activeTab === 'admin-claims'
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ShieldAlert className={`w-4 h-4 ${activeTab === 'admin-claims' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>Verify Claims</span>
                </button>
              </nav>
            </div>
          )}

          {/* Quick Profile Link */}
          {isAuthenticated && (
            <div>
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Settings
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => handleNavClick('profile')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                    activeTab === 'profile'
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>Account &amp; Profile</span>
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* User Profile / Auth State at Bottom */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/70">
          {isAuthenticated ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0">
                  {user?.name ? user.name[0] : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 truncate leading-tight">
                    {user?.name || 'User'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isAdmin ? 'ADMIN' : 'STUDENT'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  onOpenLogin();
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                onClick={() => {
                  onOpenRegister();
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
