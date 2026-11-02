'use client';

import React, { useState } from 'react';
import { Blog, PaginatedBlogs } from '../types/blog';
import { deleteBlog } from '../lib/api';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  BookOpen,
  Calendar,
  Clock,
  User,
} from 'lucide-react';

interface BlogTableProps {
  paginatedData: PaginatedBlogs;
  currentPage: number;
  searchQuery: string;
  limit: number;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onLimitChange: (limit: number) => void;
  onEditBlog: (blog: Blog) => void;
  onRefresh: () => void;
}

export function BlogTable({
  paginatedData,
  currentPage,
  searchQuery,
  limit,
  onPageChange,
  onSearchChange,
  onLimitChange,
  onEditBlog,
  onRefresh,
}: BlogTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { items, total, total_pages } = paginatedData;

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this blog article?')) return;
    setDeletingId(id);
    try {
      await deleteBlog(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete blog article');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search articles by title, excerpt, category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <strong className="text-slate-800">{items.length}</strong> of{' '}
          <strong className="text-slate-800">{total}</strong> articles
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Title & Slug</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Author</th>
              <th className="py-3 px-4">Published</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold">No blog articles found</p>
                </td>
              </tr>
            ) : (
              items.map((blog) => (
                <tr key={blog.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-xs line-clamp-1">{blog.title}</div>
                    <div className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
                      /blog/{blog.slug}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px]">
                      {blog.category || 'General'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    <div>{blog.author || 'PAJASA'}</div>
                    <div className="text-[10px] text-slate-400">{blog.reading_time || '5 min read'}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {formatDate(blog.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditBlog(blog)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Article"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        disabled={deletingId === blog.id}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {total_pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
          <div className="text-slate-500 font-medium">
            Page {currentPage} of {total_pages}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= total_pages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
