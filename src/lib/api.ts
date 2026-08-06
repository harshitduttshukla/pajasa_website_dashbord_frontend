import { City, CityFormData, PaginatedCities } from '../types/city';
import { Property, PropertyFormData, PaginatedProperties } from '../types/property';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ---------------- CITY API ----------------

export async function fetchCities(params: {
  page?: number;
  limit?: number;
  search?: string;
  parent_id?: number | null;
  sort_by?: string;
  order?: string;
}): Promise<PaginatedCities> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.search) queryParams.set('search', params.search);
  if (params.parent_id !== undefined && params.parent_id !== null) {
    queryParams.set('parent_id', params.parent_id.toString());
  }
  if (params.sort_by) queryParams.set('sort_by', params.sort_by);
  if (params.order) queryParams.set('order', params.order);

  const res = await fetch(`${API_BASE_URL}/api/cities?${queryParams.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch cities');
  }

  return res.json();
}

export async function createCity(data: CityFormData): Promise<City> {
  const res = await fetch(`${API_BASE_URL}/api/cities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to create city' }));
    throw new Error(errorData.detail || 'Failed to create city');
  }

  return res.json();
}

export async function updateCity(id: number, data: Partial<CityFormData>): Promise<City> {
  const res = await fetch(`${API_BASE_URL}/api/cities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to update city' }));
    throw new Error(errorData.detail || 'Failed to update city');
  }

  return res.json();
}

export async function deleteCity(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/cities/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete city');
  }
}

export async function bulkDeleteCities(ids: number[]): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/cities/bulk-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    throw new Error('Failed to bulk delete cities');
  }
}

// ---------------- PROPERTY API ----------------

export async function fetchProperties(params: {
  page?: number;
  limit?: number;
  search?: string;
  city_id?: number | null;
  category?: string;
  sort_by?: string;
  order?: string;
}): Promise<PaginatedProperties> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.search) queryParams.set('search', params.search);
  if (params.city_id !== undefined && params.city_id !== null) {
    queryParams.set('city_id', params.city_id.toString());
  }
  if (params.category) queryParams.set('category', params.category);
  if (params.sort_by) queryParams.set('sort_by', params.sort_by);
  if (params.order) queryParams.set('order', params.order);

  const res = await fetch(`${API_BASE_URL}/api/properties?${queryParams.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch properties');
  }

  return res.json();
}

export async function createProperty(data: PropertyFormData): Promise<Property> {
  const res = await fetch(`${API_BASE_URL}/api/properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to create property' }));
    throw new Error(errorData.detail || 'Failed to create property');
  }

  return res.json();
}

export async function updateProperty(id: number, data: Partial<PropertyFormData>): Promise<Property> {
  const res = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to update property' }));
    throw new Error(errorData.detail || 'Failed to update property');
  }

  return res.json();
}

export async function deleteProperty(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete property');
  }
}

export async function bulkDeleteProperties(ids: number[]): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/properties/bulk-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    throw new Error('Failed to bulk delete properties');
  }
}

// ---------------- UPLOAD API ----------------

export async function uploadImage(file: File): Promise<{ filename: string; url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to upload image' }));
    throw new Error(errorData.detail || 'Failed to upload image');
  }

  return res.json();
}
