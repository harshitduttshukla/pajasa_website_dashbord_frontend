'use client';

import React, { useState } from 'react';
import { City, PaginatedCities } from '../types/city';
import { deleteCity, bulkDeleteCities, updateCity } from '../lib/api';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit2,
  Trash2,
  Globe
} from 'lucide-react';

interface CityTableProps {
  paginatedData: PaginatedCities;
  allCities: City[];
  currentPage: number;
  searchQuery: string;
  limit: number;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onLimitChange: (limit: number) => void;
  onEditCity: (city: City) => void;
  onRefresh: () => void;
}

export function CityTable({
  paginatedData,
  allCities,
  currentPage,
  searchQuery,
  limit,
  onPageChange,
  onSearchChange,
  onLimitChange,
  onEditCity,
  onRefresh,
}: CityTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { items, total, total_pages } = paginatedData;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(items.map((c) => c.id));
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
      alert('Please select at least one city.');
      return;
    }

    if (bulkAction === 'delete') {
      if (confirm(`Are you sure you want to delete ${selectedIds.length} selected cities?`)) {
        setIsDeleting(true);
        try {
          await bulkDeleteCities(selectedIds);
          setSelectedIds([]);
          setBulkAction('');
          onRefresh();
        } catch (err: any) {
          alert(err.message || 'Failed to bulk delete cities');
        } finally {
          setIsDeleting(false);
        }
      }
    }
  };

  const handleDeleteOne = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      setDeletingId(id);
      try {
        await deleteCity(id);
        if (selectedIds.includes(id)) {
          setSelectedIds(selectedIds.filter((item) => item !== id));
        }
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Failed to delete city');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleToggleActive = async (city: City) => {
    try {
      await updateCity(city.id, { is_active: !city.is_active });
      onRefresh();
    } catch (err: any) {
      alert('Failed to update city status');
    }
  };

  const isAllSelected = items.length > 0 && items.every((c) => selectedIds.includes(c.id));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-slate-800">
      {/* Filter & Actions Header */}
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

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Cities / Slugs..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64 transition-all"
            />
          </div>
        </div>

        {/* Counter and Pagination Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-500">
          <div className="font-semibold text-slate-700 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
            {total} items
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
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= total_pages}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(total_pages)}
                disabled={currentPage >= total_pages}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
                title="Last Page"
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
              <th className="p-4">Name</th>
              <th className="p-4">Slug</th>
              <th className="p-4 text-center">Count</th>
              <th className="p-4 text-center">ID</th>
              <th className="p-4">Custom Permalink</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  No cities found.
                </td>
              </tr>
            ) : (
              items.map((city) => {
                const isSelected = selectedIds.includes(city.id);
                return (
                  <tr
                    key={city.id}
                    className={`hover:bg-blue-50/40 transition-colors group ${
                      isSelected ? 'bg-blue-50/80' : ''
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(city.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    {/* Name */}
                    <td className="p-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        {city.parent_name && (
                          <span className="text-slate-400 font-mono text-[10px]">—</span>
                        )}
                        <button
                          onClick={() => onEditCity(city)}
                          className="hover:text-blue-600 font-bold tracking-tight transition-colors text-left"
                        >
                          {city.name}
                        </button>
                      </div>
                      {city.category_tagline && (
                        <p className="text-[11px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                          {city.category_tagline}
                        </p>
                      )}
                    </td>

                    {/* Slug */}
                    <td className="p-4 text-slate-500 font-mono text-[11px]">{city.slug}</td>

                    {/* Count */}
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono font-bold text-[11px] border border-slate-200">
                        {city.count}
                      </span>
                    </td>

                    {/* ID */}
                    <td className="p-4 text-center text-slate-500 font-mono text-[11px]">
                      {city.id}
                    </td>

                    {/* Custom Permalink */}
                    <td className="p-4">
                      <span className="text-slate-600 font-mono text-[11px] bg-slate-100 px-2 py-1 rounded border border-slate-200 inline-flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400" />
                        {city.custom_uri || `${city.slug}`}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleActive(city)}
                        title={`Click to ${city.is_active ? 'deactivate' : 'activate'}`}
                        className="inline-flex items-center justify-center"
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full transition-transform transform group-hover:scale-125 ${
                            city.is_active ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-300'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => onEditCity(city)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit City"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOne(city.id, city.name)}
                        disabled={deletingId === city.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete City"
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
          {Math.min(currentPage * limit, total)} of {total} entries
        </div>
      </div>
    </div>
  );
}
