'use client';

import React, { useState } from 'react';

interface BlogContentFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * HTML content editor with a live preview. The public website renders
 * blog content as HTML, so the preview shows roughly how it will look.
 */
export function BlogContentField({ label, value, onChange, placeholder }: BlogContentFieldProps) {
  const [mode, setMode] = useState<'write' | 'preview'>('write');

  const tabClass = (active: boolean) =>
    `px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
      active ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
    }`;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-bold text-slate-700">{label}</label>
        <div className="flex gap-1">
          <button type="button" className={tabClass(mode === 'write')} onClick={() => setMode('write')}>
            Write HTML
          </button>
          <button type="button" className={tabClass(mode === 'preview')} onClick={() => setMode('preview')}>
            Preview
          </button>
        </div>
      </div>

      {mode === 'write' ? (
        <textarea
          rows={14}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <div
          className="w-full min-h-[200px] max-h-[420px] overflow-y-auto px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 leading-relaxed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-600 [&_a]:underline [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2"
          dangerouslySetInnerHTML={{ __html: value || '<p style="color:#94a3b8">Nothing to preview yet.</p>' }}
        />
      )}
      <p className="mt-1 text-[10px] text-slate-400">
        Use HTML tags such as &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;&lt;li&gt;, &lt;a href=&quot;…&quot;&gt; and &lt;img src=&quot;…&quot;&gt;.
      </p>
    </div>
  );
}

export function parseTags(input: string): string[] {
  const seen = new Set<string>();
  return input
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()));
}
