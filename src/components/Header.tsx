import React from 'react';
import { Building2, Home, Globe2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'cities' | 'properties';
  onTabChange: (tab: 'cities' | 'properties') => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-2">
              PAJASA Dashboard <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">FastAPI + Next.js</span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">Property & City Admin Management Portal</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onTabChange('cities')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'cities'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Cities
          </button>
          <button
            onClick={() => onTabChange('properties')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'properties'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
          >
            <Home className="w-3.5 h-3.5" />
            Properties <span className="text-[10px] opacity-80 font-mono"></span>
          </button>
        </div>

        {/* Right Status */}
        <div className="hidden lg:flex items-center space-x-4">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/docs`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <Globe2 className="w-3.5 h-3.5 text-blue-400" />
            FastAPI OpenAPI
          </a>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Backend Active
          </div>
        </div>
      </div>
    </header>
  );
}
