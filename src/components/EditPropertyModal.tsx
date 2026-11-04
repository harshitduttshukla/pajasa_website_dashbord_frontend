'use client';

import React, { useState, useEffect } from 'react';
import { Property, PropertyFormData } from '../types/property';
import { City } from '../types/city';
import { updateProperty } from '../lib/api';
import { X, Save, CheckCircle, AlertCircle } from 'lucide-react';

interface EditPropertyModalProps {
  property: Property | null;
  cities: City[];
  onClose: () => void;
  onPropertyUpdated: () => void;
}

export function EditPropertyModal({ property, cities, onClose, onPropertyUpdated }: EditPropertyModalProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [pricePerWeek, setPricePerWeek] = useState<number>(0);
  const [pricePerMonth, setPricePerMonth] = useState<number>(0);
  const [cityId, setCityId] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [guestNo, setGuestNo] = useState(2);
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (property) {
      setTitle(property.title || '');
      setSlug(property.slug || '');
      setPrice(property.price || 0);
      setPricePerWeek(property.price_per_week || 0);
      setPricePerMonth(property.price_per_month || 0);
      setCityId(property.city_id || null);
      setAddress(property.address || '');
      setNeighborhood(property.neighborhood || '');
      setBedrooms(property.bedrooms || 1);
      setBathrooms(property.bathrooms || 1);
      setGuestNo(property.guest_no || 2);
      setDescription(property.description || '');
      setIsFeatured(property.is_featured || false);
      setMessage(null);
    }
  }, [property]);

  if (!property) return null;

  // Week = 7 nights, month = 30 nights
  const fillFromNightly = () => {
    setPricePerWeek(Math.round(price * 7));
    setPricePerMonth(Math.round(price * 30));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Title is required' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const updateData: Partial<PropertyFormData> = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      price: Number(price),
      price_per_week: Number(pricePerWeek) || 0,
      price_per_month: Number(pricePerMonth) || 0,
      city_id: cityId ? Number(cityId) : null,
      address: address.trim() || undefined,
      neighborhood: neighborhood.trim() || undefined,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      guest_no: Number(guestNo),
      description: description.trim() || undefined,
      is_featured: isFeatured,
    };

    try {
      await updateProperty(property.id, updateData);
      setMessage({ type: 'success', text: 'Property updated successfully!' });
      setTimeout(() => {
        onPropertyUpdated();
        onClose();
      }, 500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update property' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-800">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-base font-bold text-slate-900">Edit Property</h3>
            <p className="text-xs text-slate-500">ID #{property.id} — {property.title}</p>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price / Night (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price / Week (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={pricePerWeek}
                  onChange={(e) => setPricePerWeek(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
                {pricePerWeek > 0 && (
                  <p className="mt-1 text-[10px] text-slate-500">≈ ₹{Math.round(pricePerWeek / 7).toLocaleString('en-IN')} / night</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price / Month (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={pricePerMonth}
                  onChange={(e) => setPricePerMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
                {pricePerMonth > 0 && (
                  <p className="mt-1 text-[10px] text-slate-500">≈ ₹{Math.round(pricePerMonth / 30).toLocaleString('en-IN')} / night</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] text-slate-500">
                Converter: 1 week = 7 nights, 1 month = 30 nights. Edit the weekly or monthly price to offer a discount.
              </p>
              <button
                type="button"
                onClick={fillFromNightly}
                disabled={!price}
                className="shrink-0 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold rounded-lg border border-blue-200 disabled:opacity-50"
              >
                Calculate from nightly
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <select
                value={cityId || ''}
                onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Unassigned</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
              <input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
              <input
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Guests</label>
              <input
                type="number"
                value={guestNo}
                onChange={(e) => setGuestNo(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Description</label>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className={`px-3 py-1 ${!showPreview ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className={`px-3 py-1 ${showPreview ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  Preview
                </button>
              </div>
            </div>
            {showPreview ? (
              <div
                className="w-full h-80 overflow-y-auto px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 leading-relaxed whitespace-pre-line [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:font-bold [&_strong]:font-semibold [&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                spellCheck
                className="w-full h-80 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 resize-y"
              />
            )}
            <p className="mt-1 text-[10px] text-slate-500">
              HTML tags like &lt;h2&gt;, &lt;strong&gt; and &lt;a&gt; are kept. Use Preview to check how it will look.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="edit-featured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="edit-featured" className="text-xs text-slate-700 font-semibold">
              Featured Property
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
