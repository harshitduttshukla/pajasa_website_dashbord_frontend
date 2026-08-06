import React from 'react';
import { Building2, Home, Globe, LayoutDashboard, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: 'cities' | 'properties';
  onTabChange: (tab: 'cities' | 'properties') => void;
  cityCount: number;
  propertyCount: number;
}

export function Sidebar({ activeTab, onTabChange, cityCount, propertyCount }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col justify-between z-30 shadow-sm shrink-0">
      <div className="p-6 space-y-6">
        {/* Logo / Brand */}
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-100">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 text-white">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base tracking-tight">PAJASA Admin</h1>

          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Modules
          </div>

          {/* Cities Tab */}
          <button
            onClick={() => onTabChange('cities')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'cities'
              ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            <div className="flex items-center gap-3">
              <Building2 className={`w-4 h-4 ${activeTab === 'cities' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>City Management</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium ${activeTab === 'cities' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                }`}
            >
              {cityCount}
            </span>
          </button>

          {/* Properties Tab */}
          <button
            onClick={() => onTabChange('properties')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'properties'
              ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            <div className="flex items-center gap-3">
              <Home className={`w-4 h-4 ${activeTab === 'properties' ? 'text-blue-600' : 'text-slate-400'}`} />
              <div className="text-left">
                <div>Properties</div>
                <div className="text-[10px] text-slate-400 font-normal font-mono">estate_property</div>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium ${activeTab === 'properties' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                }`}
            >
              {propertyCount}
            </span>
          </button>




        </nav>
      </div>


    </aside>
  );
}
