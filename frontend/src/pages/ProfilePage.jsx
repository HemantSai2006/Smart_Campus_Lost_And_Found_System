import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Lock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    setProfileLoading(true);

    try {
      const res = await userAPI.updateProfile({ name, phone });
      if (res.success && res.data) {
        updateUser(res.data);
        setProfileMsg('Profile updated successfully!');
      } else {
        setProfileErr(res.message || 'Update failed');
      }
    } catch (err) {
      setProfileErr(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg('');
    setPassErr('');
    setPassLoading(true);

    try {
      const res = await userAPI.changePassword({ oldPassword, newPassword });
      if (res.success) {
        setPassMsg('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
      } else {
        setPassErr(res.message || 'Password update failed');
      }
    } catch (err) {
      setPassErr(err.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl uppercase shadow-md shadow-indigo-200">
          {user?.name ? user.name[0] : 'U'}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700">
              {user?.role?.replace('ROLE_', '')}
            </span>
            <span className="text-[10px] text-slate-400">ID #{user?.id}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            Personal Information
          </h2>

          {profileMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{profileMsg}</span>
            </div>
          )}

          {profileErr && (
            <div className="p-2.5 rounded-lg bg-red-50 text-red-800 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{profileErr}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {profileLoading ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            Security & Password
          </h2>

          {passMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{passMsg}</span>
            </div>
          )}

          {passErr && (
            <div className="p-2.5 rounded-lg bg-red-50 text-red-800 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{passErr}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">New Password (min 6 chars)</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {passLoading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
