'use client';

import React, { useState } from 'react';
import { City, CityFormData } from '../types/city';
import { createCity, uploadImage } from '../lib/api';
import { Upload, Plus, Image as ImageIcon, CheckCircle, AlertCircle, Link as LinkIcon } from 'lucide-react';

interface AddCityFormProps {
  allCities: City[];
  onCityAdded: () => void;
}

export function AddCityForm({ allCities, onCityAdded }: AddCityFormProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [pageId, setPageId] = useState('');
  const [categoryTagline, setCategoryTagline] = useState('');
  const [customUri, setCustomUri] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    const generatedSlug = newName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-');

    setSlug(generatedSlug);
    if (!customUri || customUri === slug) {
      setCustomUri(generatedSlug);
    }
  };

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

    const formData: CityFormData = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      parent_id: parentId ? Number(parentId) : null,
      description: description.trim() || undefined,
      page_id: pageId.trim() || undefined,
      featured_image: featuredImage || undefined,
      category_tagline: categoryTagline.trim() || undefined,
      custom_uri: customUri.trim() || undefined,
      is_active: true,
    };

    try {
      await createCity(formData);
      setMessage({ type: 'success', text: 'City added successfully!' });

      setName('');
      setSlug('');
      setParentId(null);
      setDescription('');
      setPageId('');
      setCategoryTagline('');
      setCustomUri('');
      setFeaturedImage('');

      onCityAdded();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to add city' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-800">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" /> Add New City
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Fill out the fields to add a new city listing.</p>
        </div>
      </div>

      {message && (
        <div
          className={`mb-5 p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Aalborg, Denmark"
            value={name}
            onChange={handleNameChange}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <p className="text-[11px] text-slate-500 mt-1">The name is how it appears on your site.</p>
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Slug</label>
          <input
            type="text"
            placeholder="e.g. aalborg"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            The “slug” is the URL-friendly version of the name. It is usually all lowercase.
          </p>
        </div>

        {/* Parent Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Category</label>
          <select
            value={parentId || ''}
            onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="">None</option>
            {allCities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 mt-1">Assign a parent term to create a hierarchy.</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
          <textarea
            rows={3}
            placeholder="Description of the city..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          />
        </div>

        {/* Page ID */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Page ID for this term</label>
          <input
            type="text"
            placeholder="e.g. 1348"
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Featured Image</label>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Image URL or upload below"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
            
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium rounded-xl cursor-pointer transition-colors">
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

              {featuredImage && (
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate max-w-[150px]">{featuredImage}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Tagline */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Category Tagline</label>
          <input
            type="text"
            placeholder="e.g. Premium serviced apartments in Aalborg"
            value={categoryTagline}
            onChange={(e) => setCategoryTagline(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Custom URI */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-blue-600" /> Custom URI
          </label>
          <input
            type="text"
            placeholder="e.g. dk/aalborg"
            value={customUri}
            onChange={(e) => setCustomUri(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
          <p className="text-[11px] text-slate-500 mt-1">Clear/leave empty to use default permalink.</p>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add New City
          </button>
        </div>
      </form>
    </div>
  );
}
