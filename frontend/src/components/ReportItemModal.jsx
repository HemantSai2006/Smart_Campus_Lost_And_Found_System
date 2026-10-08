import React, { useState } from 'react';
import { X, Upload, Calendar, MapPin, Tag, Palette, CheckCircle, AlertCircle } from 'lucide-react';
import { itemAPI } from '../services/api';

const CATEGORIES = ['Electronics', 'Bags', 'Documents/Cards', 'Keys', 'Books', 'Clothing', 'Others'];
const LOCATIONS = ['Library', 'Cafeteria', 'CSE Block', 'Mechanical Block', 'Sports Complex', 'Auditorium', 'Hostel Block', 'Main Parking', 'Campus Lawn'];

export default function ReportItemModal({ isOpen, onClose, initialType = 'LOST', onItemReported }) {
  const [type, setType] = useState(initialType);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validateAndProcessFile = (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const ext = file.name ? file.name.substring(file.name.lastIndexOf('.')).toLowerCase() : '';
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];

    if (!allowedTypes.includes(file.type.toLowerCase()) && !allowedExts.includes(ext)) {
      setError('Please select a JPG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5 MB.');
      return;
    }

    setError('');
    setImageFile(file);
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndProcessFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let finalImageUrl = imageUrl;

      // If user selected an image file, upload it
      if (imageFile) {
        setUploading(true);
        try {
          const uploadRes = await itemAPI.uploadImage(imageFile);
          const uploadedUrl = typeof uploadRes?.data === 'string' ? uploadRes.data : uploadRes?.data?.imageUrl;
          if (uploadRes && uploadRes.success && uploadedUrl) {
            finalImageUrl = uploadedUrl;
          } else {
            throw new Error(uploadRes?.message || 'Upload response unsuccessful');
          }
        } catch (uploadErr) {
          console.error('Image upload error:', uploadErr);
          setUploading(false);
          setLoading(false);
          setError(uploadErr?.message || 'Image upload failed. Please try again.');
          return;
        } finally {
          setUploading(false);
        }
      }

      const payload = {
        type,
        name,
        category,
        location,
        date,
        brand,
        color,
        description,
        imageUrl: finalImageUrl,
      };

      const res = type === 'LOST'
        ? await itemAPI.reportLost(payload)
        : await itemAPI.reportFound(payload);

      if (res.success) {
        if (onItemReported) onItemReported(res.data);
        handleRemoveImage();
        onClose();
      } else {
        setError(res.message || 'Failed to submit report');
      }
    } catch (err) {
      setError(err.message || 'Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full my-8 overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className={`p-5 text-white flex items-center justify-between ${
          type === 'LOST' ? 'bg-gradient-to-r from-red-600 to-rose-600' : 'bg-gradient-to-r from-emerald-600 to-teal-600'
        }`}>
          <div>
            <h2 className="text-xl font-bold">
              {type === 'LOST' ? 'Report Lost Item' : 'Report Found Item'}
            </h2>
            <p className="text-xs opacity-90">Enter accurate details to improve matching accuracy</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Report Category</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('LOST')}
                className={`py-2 px-3 rounded-lg text-sm font-semibold border text-center transition cursor-pointer ${
                  type === 'LOST'
                    ? 'bg-red-50 border-red-500 text-red-700 ring-2 ring-red-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🔴 I Lost Something
              </button>
              <button
                type="button"
                onClick={() => setType('FOUND')}
                className={`py-2 px-3 rounded-lg text-sm font-semibold border text-center transition cursor-pointer ${
                  type === 'FOUND'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🟢 I Found Something
              </button>
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HP Pavilion 15 Laptop, Wildcraft Bag, Blue Water Bottle"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Location *</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date {type === 'LOST' ? 'Lost' : 'Found'} *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brand (Optional)</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. HP, Apple, Wildcraft"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Color (Optional)</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Black, Blue, Silver"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide identifiable markings, stickers, engravings, or circumstances..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Item Image (Optional)</label>
            {!imagePreview ? (
              <label
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition block bg-slate-50 hover:bg-slate-100/50"
              >
                <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-700 block">Choose Image</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">JPG, PNG, or WEBP up to 5 MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-14 h-14 rounded-md object-cover border border-slate-200 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {imageFile ? imageFile.name : 'Attached Image'}
                    </p>
                    {imageFile && (
                      <p className="text-[10px] text-slate-500">
                        {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <label className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-md cursor-pointer transition">
                    Change Image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-md transition cursor-pointer"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            )}

            <div className="mt-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (e.target.value) {
                    if (imagePreview && imagePreview.startsWith('blob:')) {
                      URL.revokeObjectURL(imagePreview);
                    }
                    setImageFile(null);
                    setImagePreview(e.target.value);
                  }
                }}
                placeholder="Or paste image URL (https://...)"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || uploading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className={`px-5 py-2 text-sm font-semibold text-white rounded-lg shadow transition cursor-pointer disabled:opacity-50 ${
                type === 'LOST' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {uploading ? 'Uploading Image...' : loading ? 'Submitting Report...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
