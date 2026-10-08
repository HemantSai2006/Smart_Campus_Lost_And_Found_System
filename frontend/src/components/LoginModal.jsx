import React, { useState } from 'react';
import { X, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      onClose();
    } else {
      setError(res.message);
    }
  };

  const fillCredentials = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Sign In</h2>
            <p className="text-xs text-indigo-100 mt-1">Smart Campus Lost & Found System</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campus.edu"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Login Accounts */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider text-center">
              Sample Login Accounts
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials('admin@campus.edu', 'Admin@123')}
                className="p-1.5 rounded border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition cursor-pointer text-center"
              >
                Administrator
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('rahul@campus.edu', 'Student@123')}
                className="p-1.5 rounded border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium transition cursor-pointer text-center"
              >
                Student (Rahul)
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('priya@campus.edu', 'Student@123')}
                className="p-1.5 rounded border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium transition cursor-pointer text-center col-span-2"
              >
                Student (Priya)
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-indigo-600 hover:underline font-semibold cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
