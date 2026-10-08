import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, PlusCircle, AlertCircle } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import { itemAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['ALL', 'Electronics', 'Bags', 'Documents/Cards', 'Keys', 'Books', 'Clothing', 'Others'];
const LOCATIONS = ['ALL', 'Library', 'Cafeteria', 'CSE Block', 'Mechanical Block', 'Sports Complex', 'Auditorium', 'Hostel Block', 'Main Parking', 'Campus Lawn'];
const STATUSES = ['ALL', 'REPORTED', 'MATCHED', 'CLAIMED', 'RETURNED'];

export default function BrowseItems({ onViewDetails, onClaim, onOpenReportLost, onOpenReportFound, refreshTrigger }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter States
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [location, setLocation] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await itemAPI.getItems({
        type: type !== 'ALL' ? type : null,
        category: category !== 'ALL' ? category : null,
        location: location !== 'ALL' ? location : null,
        status: status !== 'ALL' ? status : null,
        keyword: keyword.trim() || null,
      });

      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type, category, location, status, refreshTrigger]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete '${item.name}'?`)) return;
    try {
      await itemAPI.deleteItem(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      alert(err.message || 'Failed to delete item');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner with Search */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <span className="inline-block py-1 px-3 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
            Campus Lost &amp; Found Portal
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Find What You Lost. Return What You Found.
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            A centralized platform for university students, faculty, and campus security to report and recover lost belongings.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search item name, brand, color, or location..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/20 transition"
              />
            </div>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md transition cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Decorative circle glow */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Type Toggle Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {['ALL', 'LOST', 'FOUND'].map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  type === t
                    ? t === 'LOST'
                      ? 'bg-red-600 text-white shadow'
                      : t === 'FOUND'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-indigo-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchItems}
              title="Refresh"
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category, Location, Status Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-slate-500 font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Campus Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2 text-indigo-600" />
          <p className="text-sm">Fetching campus items...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No items match your filter</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try broadening your search keyword or clearing the category/location filters.
          </p>
          {isAuthenticated && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={onOpenReportLost}
                className="py-2 px-3 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Report Lost Item
              </button>
              <button
                onClick={onOpenReportFound}
                className="py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                Report Found Item
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onViewDetails={onViewDetails}
              onClaim={onClaim}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
