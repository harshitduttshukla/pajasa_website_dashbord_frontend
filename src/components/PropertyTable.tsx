'use client';

import React, { useState } from 'react';
import { Property, PaginatedProperties } from '../types/property';
import { City } from '../types/city';
import { deleteProperty, bulkDeleteProperties, updateProperty } from '../lib/api';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit2,
  Trash2,
  Building2,
  Bed,
  Bath,
  Users,
  Star,
  MapPin
} from 'lucide-react';

interface PropertyTableProps {
  paginatedData: PaginatedProperties;
  cities: City[];
  currentPage: number;
  searchQuery: string;
  selectedCityId: number | null;
  limit: number;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onCityFilterChange: (cityId: number | null) => void;
  onLimitChange: (limit: number) => void;
  onEditProperty: (property: Property) => void;
  onRefresh: () => void;
}

export function PropertyTable({
  paginatedData,
  cities,
  currentPage,
  searchQuery,
  selectedCityId,
  limit,
  onPageChange,
  onSearchChange,
  onCityFilterChange,
  onLimitChange,
  onEditProperty,
  onRefresh,
}: PropertyTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { items, total, total_pages } = paginatedData;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(items.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleApplyBulkAction = async () => {
    if (!bulkAction) return;
    if (selectedIds.length === 0) {
      alert('Please select at least one property.');
      return;
    }

    if (bulkAction === 'delete') {
      if (confirm(`Are you sure you want to delete ${selectedIds.length} selected properties?`)) {
        setIsDeleting(true);
        try {
          await bulkDeleteProperties(selectedIds);
          setSelectedIds([]);
          setBulkAction('');
          onRefresh();
        } catch (err: any) {
          alert(err.message || 'Failed to bulk delete properties');
        } finally {
          setIsDeleting(false);
        }
      }
    }
  };

  const handleDeleteOne = async (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      setDeletingId(id);
      try {
        await deleteProperty(id);
        if (selectedIds.includes(id)) {
          setSelectedIds(selectedIds.filter((item) => item !== id));
        }
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Failed to delete property');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleToggleFeatured = async (property: Property) => {
    try {
      await updateProperty(property.id, { is_featured: !property.is_featured });
      onRefresh();
    } catch (err: any) {
      alert('Failed to update featured status');
    }
  };

  const isAllSelected = items.length > 0 && items.every((p) => selectedIds.includes(p.id));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-slate-800">
      {/* Top Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Bulk Actions */}
          <div className="flex items-center space-x-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="bg-white border border-slate-200 text-xs text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Bulk actions</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleApplyBulkAction}
              disabled={isDeleting || !bulkAction}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
            >
              Apply
            </button>

            {selectedIds.length > 0 && (
              <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
                {selectedIds.length} selected
              </span>
            )}
          </div>

          {/* Search & City Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedCityId || ''}
              onChange={(e) => onCityFilterChange(e.target.value ? Number(e.target.value) : null)}
              className="bg-white border border-slate-200 text-xs text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Cities</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Properties..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-56 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Counter & Pagination */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-500">
          <div className="font-semibold text-slate-700 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
            {total} properties found
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs">
              Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{total_pages}</strong>
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= total_pages}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(total_pages)}
                disabled={currentPage >= total_pages}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="p-4">Property Title</th>
              <th className="p-4">City / Area</th>
              <th className="p-4">Price</th>
              <th className="p-4 text-center">Specs</th>
              <th className="p-4 text-center">Featured</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  No properties found matching your search.
                </td>
              </tr>
            ) : (
              items.map((prop) => {
                const isSelected = selectedIds.includes(prop.id);
                return (
                  <tr
                    key={prop.id}
                    className={`hover:bg-blue-50/40 transition-colors group ${
                      isSelected ? 'bg-blue-50/80' : ''
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(prop.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    {/* Title */}
                    <td className="p-4 font-semibold text-slate-900">
                      <button
                        onClick={() => onEditProperty(prop)}
                        className="font-bold text-slate-900 hover:text-blue-600 tracking-tight transition-colors text-left"
                      >
                        {prop.title}
                      </button>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {prop.category || 'Serviced Apartment'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ID #{prop.id}</span>
                      </div>
                    </td>

                    {/* City & Address */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{prop.city_name || 'Unassigned'}</span>
                      </div>
                      {prop.neighborhood && (
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {prop.neighborhood}
                        </p>
                      )}
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <div className="font-bold text-emerald-600 text-sm">
                        ₹{prop.price.toLocaleString()}
                        <span className="text-[11px] font-normal text-slate-500 ml-1">
                          {prop.price_after_label || '/ night'}
                        </span>
                      </div>
                    </td>

                    {/* Specs */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-3 text-slate-600 text-[11px] font-medium">
                        <span className="flex items-center gap-1" title="Bedrooms">
                          <Bed className="w-3.5 h-3.5 text-slate-400" /> {prop.bedrooms}
                        </span>
                        <span className="flex items-center gap-1" title="Bathrooms">
                          <Bath className="w-3.5 h-3.5 text-slate-400" /> {prop.bathrooms}
                        </span>
                        <span className="flex items-center gap-1" title="Max Guests">
                          <Users className="w-3.5 h-3.5 text-slate-400" /> {prop.guest_no}
                        </span>
                      </div>
                    </td>

                    {/* Featured */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(prop)}
                        title={`Click to ${prop.is_featured ? 'unmark' : 'mark'} featured`}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          prop.is_featured
                            ? 'bg-amber-50 border-amber-200 text-amber-500'
                            : 'bg-slate-50 border-slate-200 text-slate-300 hover:text-slate-500'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => onEditProperty(prop)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Property"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOne(prop.id, prop.title)}
                        disabled={deletingId === prop.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Property"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <span>Items per page:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="bg-white border border-slate-200 text-xs text-slate-700 rounded-lg px-2 py-1 focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        <div>
          Showing {items.length > 0 ? (currentPage - 1) * limit + 1 : 0} to{' '}
          {Math.min(currentPage * limit, total)} of {total} properties
        </div>
      </div>
    </div>
  );
}
