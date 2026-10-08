import React, { useState, useEffect } from 'react';
import { FileText, PlusCircle, Trash2, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import { itemAPI } from '../services/api';

export default function MyReports({ onOpenReportLost, onOpenReportFound, onViewDetails, refreshTrigger }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMyItems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await itemAPI.getMyItems();
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      if (res.success || Array.isArray(res?.data)) {
        setItems(list);
      } else {
        setError(res.message || 'Failed to load your reports');
      }
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to load your reports. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyItems();
  }, [refreshTrigger]);

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete report '${item.name}'?`)) return;
    try {
      await itemAPI.deleteItem(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (e) {
      alert(e.message || 'Failed to delete item');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            My Reported Items
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track status and manage all lost and found listings reported under your student account.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onOpenReportLost}
            className="py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition"
          >
            + Report Lost
          </button>
          <button
            onClick={onOpenReportFound}
            className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
          >
            + Report Found
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-indigo-600" />
          <p className="text-xs">Loading your reports...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
          <h3 className="text-sm font-bold text-red-800">Error Loading Reports</h3>
          <p className="text-xs text-red-600 mt-1 mb-4">{error}</p>
          <button
            onClick={fetchMyItems}
            className="py-1.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No Reports Filed Yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            If you lose or find any property on campus, report it to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="p-3">Image</th>
                <th className="p-3">Item Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Category</th>
                <th className="p-3">Location</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                        className="w-12 h-12 rounded-md object-cover border border-slate-200"
                      />
                    ) : null}
                    <div
                      className="w-12 h-12 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] font-medium text-slate-400 text-center leading-tight p-1"
                      style={{ display: item.imageUrl ? 'none' : 'flex' }}
                    >
                      No Image Available
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.type === 'LOST' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">{item.location}</td>
                  <td className="p-3">{item.date}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onViewDetails(item)}
                      title="View Details"
                      className="p-1 text-slate-500 hover:text-indigo-600 rounded transition cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      title="Delete Report"
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
