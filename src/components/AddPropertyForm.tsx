'use client';

import React, { useState } from 'react';
import { City } from '../types/city';
import { PropertyFormData } from '../types/property';
import { createProperty, uploadImage } from '../lib/api';
import {
  Plus,
  DollarSign,
  MapPin,
  ListChecks,
  Image as ImageIcon,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Bed,
  Check
} from 'lucide-react';

interface AddPropertyFormProps {
  cities: City[];
  onPropertyAdded: () => void;
}

const AVAILABLE_AMENITIES = [
  'WiFi',
  'Kitchen',
  'Air Conditioning',
  'Heating',
  'Parking',
  'Elevator',
  'Housekeeping',
  'Gym',
  'Swimming Pool',
  'TV',
  'Security / CCTV',
  'Washing Machine',
  'Balcony',
  'Wheelchair Accessible',
  'Power Backup',
];

const PROPERTY_CATEGORIES = [
  'Serviced Apartments',
  'Corporate Housing',
  '1 BHK',
  '2 BHK',
  '3 BHK',
  'Studio',
  'Luxury Suite',
];

export function AddPropertyForm({ cities, onPropertyAdded }: AddPropertyFormProps) {
  const [activeSubTab, setActiveSubTab] = useState<'basic' | 'location' | 'pricing' | 'details' | 'amenities' | 'media'>('basic');

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('Serviced Apartments');
  const [rentType, setRentType] = useState('Rent');
  const [cityId, setCityId] = useState<number | null>(cities.length > 0 ? cities[0].id : null);
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');

  const [price, setPrice] = useState<number>(3500);
  const [priceBeforeLabel, setPriceBeforeLabel] = useState('From');
  const [priceAfterLabel, setPriceAfterLabel] = useState('/ night');
  const [cleaningFee, setCleaningFee] = useState<number | undefined>();
  const [securityDeposit, setSecurityDeposit] = useState<number | undefined>();

  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [rooms, setRooms] = useState(3);
  const [sizeSqft, setSizeSqft] = useState<number | undefined>(1100);
  const [guestNo, setGuestNo] = useState(4);
  const [minDaysBooking, setMinDaysBooking] = useState(1);

  const [featuredImage, setFeaturedImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const [isFeatured, setIsFeatured] = useState(false);
  const [instantBooking, setInstantBooking] = useState(true);

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'WiFi', 'Kitchen', 'Air Conditioning', 'Parking', 'Housekeeping'
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-');
    setSlug(autoSlug);
  };

  const handleAmenityToggle = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'featured' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    try {
      const res = await uploadImage(file, 'properties');
      if (target === 'featured') {
        setFeaturedImage(res.key);
      } else {
        setGalleryImages((prev) => [...prev, res.key]);
      }
      setMessage({ type: 'success', text: 'Image uploaded directly to S3!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Image upload failed' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Property Title is required' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const formData: PropertyFormData = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      status: 'publish',
      category,
      rent_type: rentType,
      city_id: cityId ? Number(cityId) : null,
      neighborhood: neighborhood.trim() || undefined,
      address: address.trim() || undefined,
      state: state.trim() || undefined,
      zip_code: zipCode.trim() || undefined,
      country: country.trim() || undefined,
      price: Number(price) || 0,
      price_before_label: priceBeforeLabel || undefined,
      price_after_label: priceAfterLabel || undefined,
      cleaning_fee: cleaningFee ? Number(cleaningFee) : undefined,
      security_deposit: securityDeposit ? Number(securityDeposit) : undefined,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      rooms: Number(rooms),
      size_sqft: sizeSqft ? Number(sizeSqft) : undefined,
      guest_no: Number(guestNo),
      min_days_booking: Number(minDaysBooking),
      featured_image: featuredImage || undefined,
      gallery_images: galleryImages,
      is_featured: isFeatured,
      instant_booking: instantBooking,
      amenities: selectedAmenities,
    };

    try {
      await createProperty(formData);
      setMessage({ type: 'success', text: 'Property added successfully!' });

      setTitle('');
      setSlug('');
      setDescription('');
      setExcerpt('');
      setNeighborhood('');
      setAddress('');
      setFeaturedImage('');
      setGalleryImages([]);

      onPropertyAdded();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to add property' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-800">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" /> Add New Property
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Replicating WordPress estate_property fields.</p>
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

      {/* Sub Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 mb-6 overflow-x-auto text-xs font-semibold text-slate-600">
        <button
          type="button"
          onClick={() => setActiveSubTab('basic')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'basic' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Basic Info
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('location')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'location' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" /> Location
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('pricing')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'pricing' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" /> Pricing
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('details')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'details' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          <Bed className="w-3.5 h-3.5" /> Specs
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('amenities')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'amenities' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          <ListChecks className="w-3.5 h-3.5" /> Amenities
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('media')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'media' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" /> Images
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* TAB 1: BASIC INFO */}
        {activeSubTab === 'basic' && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Executive 2 BHK Serviced Apartment"
                value={title}
                onChange={handleTitleChange}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                >
                  {PROPERTY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">What do you rent?</label>
                <select
                  value={rentType}
                  onChange={(e) => setRentType(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Rent">Rent</option>
                  <option value="Lease">Lease</option>
                  <option value="Sale">Sale</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <select
                value={cityId || ''}
                onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select City</option>
                {cities.map((c) => (
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
                placeholder="Full description of the property..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
            </div>
          </div>
        )}

        {/* TAB 2: LOCATION */}
        {activeSubTab === 'location' && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Property Address</label>
              <input
                type="text"
                placeholder="e.g. 102 Royal Residency, SG Highway"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Neighborhood / Area</label>
                <input
                  type="text"
                  placeholder="e.g. SG Highway"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  placeholder="e.g. Gujarat"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Zip Code</label>
                <input
                  type="text"
                  placeholder="e.g. 380054"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  placeholder="e.g. India"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRICING */}
        {activeSubTab === 'pricing' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Base Price (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 3500"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Before Label</label>
                <input
                  type="text"
                  placeholder="e.g. From"
                  value={priceBeforeLabel}
                  onChange={(e) => setPriceBeforeLabel(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">After Label</label>
                <input
                  type="text"
                  placeholder="e.g. / night"
                  value={priceAfterLabel}
                  onChange={(e) => setPriceAfterLabel(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cleaning Fee</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={cleaningFee || ''}
                  onChange={(e) => setCleaningFee(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Security Deposit</label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={securityDeposit || ''}
                  onChange={(e) => setSecurityDeposit(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DETAILS */}
        {activeSubTab === 'details' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Guests</label>
                <input
                  type="number"
                  value={guestNo}
                  onChange={(e) => setGuestNo(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Make Featured
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={instantBooking}
                  onChange={(e) => setInstantBooking(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Instant Booking
              </label>
            </div>
          </div>
        )}

        {/* TAB 5: AMENITIES */}
        {activeSubTab === 'amenities' && (
          <div className="space-y-3 animate-fadeIn">
            <p className="text-xs text-slate-500 font-medium">Select features available at this property:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {AVAILABLE_AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`p-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>{amenity}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: MEDIA */}
        {activeSubTab === 'media' && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Featured Cover Image</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="S3 Key or Image URL (e.g. uploads/properties/...)"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
                <label className="shrink-0 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-blue-600 inline mr-1" />
                  {isUploading ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'featured')}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gallery Images ({galleryImages.length})</label>
              <div className="flex items-center gap-3">
                <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-blue-600 inline mr-1" />
                  {isUploading ? 'Uploading...' : 'Add Gallery Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'gallery')}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
              {galleryImages.length > 0 && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {galleryImages.map((imgKey, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                      <span className="truncate max-w-[280px] text-slate-600">{imgKey}</span>
                      <button
                        type="button"
                        onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="pt-3 border-t border-slate-100">
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
            Add New Property
          </button>
        </div>
      </form>
    </div>
  );
}
