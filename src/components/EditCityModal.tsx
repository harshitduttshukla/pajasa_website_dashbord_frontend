'use client';

import React, { useState, useEffect } from 'react';
import { City, CityFormData } from '../types/city';
import { updateCity, uploadImage } from '../lib/api';
import { X, Save, Upload, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';

interface EditCityModalProps {
  city: City | null;
  allCities: City[];
  onClose: () => void;
  onCityUpdated: () => void;
}

export function EditCityModal({ city, allCities, onClose, onCityUpdated }: EditCityModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [pageId, setPageId] = useState('');
  const [categoryTagline, setCategoryTagline] = useState('');
  const [customUri, setCustomUri] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (city) {
      setName(city.name || '');
      setSlug(city.slug || '');
      setParentId(city.parent_id || null);
      setDescription(city.description || '');
      setPageId(city.page_id || '');
      setCategoryTagline(city.category_tagline || '');
      setCustomUri(city.custom_uri || '');
      setFeaturedImage(city.featured_image || '');
      setIsActive(city.is_active ?? true);
      setMessage(null);
    }
  }, [city]);

  if (!city) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    try {
      const res = await uploadImage(file, 'cities');
      setFeaturedImage(res.key);
      setMessage({ type: 'success', text: 'Image uploaded successfully to S3!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Image upload failed' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'City name is required' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const updateData: Partial<CityFormData> = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      parent_id: parentId ? Number(parentId) : null,
      description: description.trim() || undefined,
      page_id: pageId.trim() || undefined,
      featured_image: featuredImage || undefined,
      category_tagline: categoryTagline.trim() || undefined,
      custom_uri: customUri.trim() || undefined,
      is_active: isActive,
    };

    try {
      await updateCity(city.id, updateData);
      setMessage({ type: 'success', text: 'City updated successfully!' });
      setTimeout(() => {
        onCityUpdated();
        onClose();
      }, 500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update city' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-800">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-base font-bold text-slate-900">Edit City</h3>
            <p className="text-xs text-slate-500">ID #{city.id} — {city.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              {message.text}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Category</label>
            <select
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">None</option>
              {allCities
                .filter((c) => c.id !== city.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Page ID for this term</label>
            <input
              type="text"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Featured Image</label>
            <div className="space-y-2">
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category Tagline</label>
            <input
              type="text"
              value={categoryTagline}
              onChange={(e) => setCategoryTagline(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Custom URI</label>
            <input
              type="text"
              value={customUri}
              onChange={(e) => setCustomUri(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="edit-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="edit-active" className="text-xs text-slate-700 font-semibold">
              Active Status
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
