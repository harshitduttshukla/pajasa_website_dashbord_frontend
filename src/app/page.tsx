'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';

// City Components
import { AddCityForm } from '../components/AddCityForm';
import { CityTable } from '../components/CityTable';
import { EditCityModal } from '../components/EditCityModal';
import { City, PaginatedCities } from '../types/city';
import { fetchCities } from '../lib/api';

// Property Components
import { AddPropertyForm } from '../components/AddPropertyForm';
import { PropertyTable } from '../components/PropertyTable';
import { EditPropertyModal } from '../components/EditPropertyModal';
import { Property, PaginatedProperties } from '../types/property';
import { fetchProperties } from '../lib/api';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'cities' | 'properties'>('cities');

  // ---------- CITIES STATE ----------
  const [paginatedCities, setPaginatedCities] = useState<PaginatedCities>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 1,
  });
  const [allCities, setAllCities] = useState<City[]>([]);
  const [cityPage, setCityPage] = useState(1);
  const [cityLimit, setCityLimit] = useState(10);
  const [citySearch, setCitySearch] = useState('');
  const [editingCity, setEditingCity] = useState<City | null>(null);

  // ---------- PROPERTIES STATE ----------
  const [paginatedProperties, setPaginatedProperties] = useState<PaginatedProperties>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 1,
  });
  const [propPage, setPropPage] = useState(1);
  const [propLimit, setPropLimit] = useState(10);
  const [propSearch, setPropSearch] = useState('');
  const [propCityFilter, setPropCityFilter] = useState<number | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Cities Data
  const loadCities = useCallback(async () => {
    try {
      const res = await fetchCities({
        page: cityPage,
        limit: cityLimit,
        search: citySearch || undefined,
      });
      setPaginatedCities(res);

      const allRes = await fetchCities({ page: 1, limit: 1000 });
      setAllCities(allRes.items);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cities from backend');
    }
  }, [cityPage, cityLimit, citySearch]);

  // Load Properties Data
  const loadProperties = useCallback(async () => {
    try {
      const res = await fetchProperties({
        page: propPage,
        limit: propLimit,
        search: propSearch || undefined,
        city_id: propCityFilter,
      });
      setPaginatedProperties(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch properties from backend');
    }
  }, [propPage, propLimit, propSearch, propCityFilter]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (activeTab === 'cities') {
      await loadCities();
    } else {
      await loadProperties();
      await loadCities();
    }
    setIsLoading(false);
  }, [activeTab, loadCities, loadProperties]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-row font-sans">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        cityCount={paginatedCities.total}
        propertyCount={paginatedProperties.total}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Bar Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-20 shadow-xs flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'cities' ? 'City Management' : 'Property Management'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'cities'
                ? 'Create, edit, and organize property cities, custom permalinks, and hierarchies.'
                : 'Add and manage property listings, custom pricing, amenities, and location settings.'}
            </p>
          </div>


        </header>

        <main className="p-8 space-y-8 max-w-[1600px] w-full mx-auto">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center justify-between">
              <div>
                <strong className="font-semibold">Connection Alert:</strong> {error}
              </div>
              <button
                onClick={loadData}
                className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold rounded-lg transition-colors border border-rose-200"
              >
                Retry
              </button>
            </div>
          )}

          {/* CITIES MODULE */}
          {activeTab === 'cities' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
              {/* Left Panel - Add City Form */}
              <div className="lg:col-span-4 sticky top-24">
                <AddCityForm allCities={allCities} onCityAdded={loadData} />
              </div>

              {/* Right Panel - City Table */}
              <div className="lg:col-span-8">
                {isLoading && paginatedCities.items.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3 shadow-sm">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">Loading cities from FastAPI backend...</p>
                  </div>
                ) : (
                  <CityTable
                    paginatedData={paginatedCities}
                    allCities={allCities}
                    currentPage={cityPage}
                    searchQuery={citySearch}
                    limit={cityLimit}
                    onPageChange={(page) => setCityPage(page)}
                    onSearchChange={(q) => {
                      setCitySearch(q);
                      setCityPage(1);
                    }}
                    onLimitChange={(l) => {
                      setCityLimit(l);
                      setCityPage(1);
                    }}
                    onEditCity={(city) => setEditingCity(city)}
                    onRefresh={loadData}
                  />
                )}
              </div>
            </div>
          )}

          {/* PROPERTIES MODULE */}
          {activeTab === 'properties' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
              {/* Left Panel - Add Property Form */}
              <div className="lg:col-span-5 sticky top-24">
                <AddPropertyForm cities={allCities} onPropertyAdded={loadData} />
              </div>

              {/* Right Panel - Property Table */}
              <div className="lg:col-span-7">
                {isLoading && paginatedProperties.items.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3 shadow-sm">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">Loading properties from FastAPI backend...</p>
                  </div>
                ) : (
                  <PropertyTable
                    paginatedData={paginatedProperties}
                    cities={allCities}
                    currentPage={propPage}
                    searchQuery={propSearch}
                    selectedCityId={propCityFilter}
                    limit={propLimit}
                    onPageChange={(page) => setPropPage(page)}
                    onSearchChange={(q) => {
                      setPropSearch(q);
                      setPropPage(1);
                    }}
                    onCityFilterChange={(cid) => {
                      setPropCityFilter(cid);
                      setPropPage(1);
                    }}
                    onLimitChange={(l) => {
                      setPropLimit(l);
                      setPropPage(1);
                    }}
                    onEditProperty={(prop) => setEditingProperty(prop)}
                    onRefresh={loadData}
                  />
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Edit Modals */}
      <EditCityModal
        city={editingCity}
        allCities={allCities}
        onClose={() => setEditingCity(null)}
        onCityUpdated={loadData}
      />

      <EditPropertyModal
        property={editingProperty}
        cities={allCities}
        onClose={() => setEditingProperty(null)}
        onPropertyUpdated={loadData}
      />
    </div>
  );
}
