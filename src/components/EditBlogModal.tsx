'use client';

import React, { useState, useEffect } from 'react';
import { Blog } from '../types/blog';
import { updateBlog, uploadImage } from '../lib/api';
import { BlogContentField, parseTags } from './BlogContentField';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface EditBlogModalProps {
  blog: Blog | null;
  isOpen: boolean;
  onClose: () => void;
  onBlogUpdated: () => void;
}

export function EditBlogModal({ blog, isOpen, onClose, onBlogUpdated }: EditBlogModalProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [readingTime, setReadingTime] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [tags, setTags] = useState('');
  const [uploadedPreview, setUploadedPreview] = useState<{ key: string; url: string } | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (blog) {
      setTitle(blog.title || '');
      setSlug(blog.slug || '');
      setCategory(blog.category || 'Corporate Travel');
      setAuthor(blog.author || 'PAJASA Hospitality');
      setReadingTime(blog.reading_time || '5 min read');
      setExcerpt(blog.excerpt || '');
      setContent(blog.content || '');
      setFeaturedImage(blog.featured_image || '');
      setIsFeatured(Boolean(blog.is_featured));
      setTags((blog.tags || []).join(', '));
      setMessage(null);
    }
  }, [blog]);

  if (!isOpen || !blog) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    try {
      const res = await uploadImage(file, 'blogs');
      setFeaturedImage(res.key);
      setUploadedPreview({ key: res.key, url: res.url });
      setMessage({ type: 'success', text: 'Image uploaded successfully to S3!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Image upload failed' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Article title is required' });
      return;
    }

    const newSlug = slug.trim();
    if (newSlug !== (blog.slug || '')) {
      const ok = window.confirm(
        `Changing the slug changes this article's URL from /blog/${blog.slug} to ${newSlug ? '/blog/' + newSlug : 'a new URL based on the title'}.\n\nOld links and Google results will stop working. Continue?`
      );
      if (!ok) return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await updateBlog(blog.id, {
        title,
        slug: newSlug || undefined,
        category,
        author,
        reading_time: readingTime,
        excerpt,
        content,
        // null clears the image; the backend then deletes the old file
        featured_image: featuredImage.trim() || null,
        tags: parseTags(tags),
        is_featured: isFeatured,
      });

      onBlogUpdated();
      onClose();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update article' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Edit Blog Article</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {message && (
          <div
            className={`m-5 p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Article Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category, Author, Reading Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reading Time</label>
              <input
                type="text"
                value={readingTime}
                onChange={(e) => setReadingTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Featured Image</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="cursor-pointer px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            {featuredImage && (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={uploadedPreview?.key === featuredImage ? uploadedPreview.url : featuredImage} alt="Featured preview" className="h-16 w-28 object-cover rounded-lg border border-slate-200" />
                <button
                  type="button"
                  onClick={() => setFeaturedImage('')}
                  className="px-2.5 py-1 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer"
                >
                  Remove image
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Mumbai, Corporate Stay, Serviced Apartments"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-[10px] text-slate-400">Separate tags with commas.</p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Excerpt</label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Content</label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-blog-featured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="edit-blog-featured" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Mark as Featured Article
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
