import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Clock } from 'lucide-react';
import { notificationAPI } from '../services/api';

export default function NotificationDropdown({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getNotifications(false);
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-sm text-slate-800">Notifications</span>
        </div>
        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium transition cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {loading ? (
          <div className="p-4 text-center text-xs text-slate-400">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">
            No notifications yet
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`p-3 text-left transition ${n.read ? 'bg-white' : 'bg-indigo-50/50'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className={`text-xs ${n.read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>
                  {n.message}
                </p>
                {!n.read && (
                  <button
                    onClick={(e) => handleMarkAsRead(n.id, e)}
                    title="Mark as read"
                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer flex-shrink-0"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                <Clock className="w-2.5 h-2.5" />
                <span>{n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}</span>
                <span className="ml-auto font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {n.type?.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
