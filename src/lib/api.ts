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

// ---------------- UPLOAD API (DIRECT TO S3) ----------------

export async function getPresignedUploadUrl(params: {
  filename: string;
  content_type: string;
  size: number;
  folder?: string;
}): Promise<{ upload_url: string; key: string; url: string }> {
  const res = await fetch(`${API_BASE_URL}/api/upload/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to request upload URL' }));
    throw new Error(errorData.detail || 'Failed to request direct upload authorization');
  }

  return res.json();
}

export async function uploadImage(
  file: File,
  folder: string = 'properties'
): Promise<{ filename: string; key: string; url: string }> {
  // 1. Request presigned PUT URL from FastAPI (stateless, no DB writes)
  const contentType = file.type || 'application/octet-stream';
  const presign = await getPresignedUploadUrl({
    filename: file.name,
    content_type: contentType,
    size: file.size,
    folder,
  });

  // 2. Direct browser upload to S3 using PUT (never sends image bytes to FastAPI)
  const uploadTargetUrl = presign.upload_url.startsWith('http')
    ? presign.upload_url
    : `${API_BASE_URL}${presign.upload_url}`;

  const s3Res = await fetch(uploadTargetUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: file,
  });

  if (!s3Res.ok) {
    throw new Error(`Direct image upload to S3 failed (HTTP status ${s3Res.status})`);
  }

  // 3. Return key (to store in database) and url (CloudFront URL to preview)
  return {
    filename: file.name,
    key: presign.key,
    url: presign.url,
  };
}

// ---------------- BLOG API ----------------

export async function fetchBlogs(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort_by?: string;
  order?: string;
}): Promise<{ items: any[]; total: number; page: number; limit: number; total_pages: number }> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.search) queryParams.set('search', params.search);
  if (params.category) queryParams.set('category', params.category);
  if (params.sort_by) queryParams.set('sort_by', params.sort_by);
  if (params.order) queryParams.set('order', params.order);

  const res = await fetch(`${API_BASE_URL}/api/blogs?${queryParams.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch blogs');
  }

  return res.json();
}

export async function createBlog(data: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/blogs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to create blog' }));
    throw new Error(errorData.detail || 'Failed to create blog');
  }

  return res.json();
}

export async function updateBlog(id: number, data: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to update blog' }));
    throw new Error(errorData.detail || 'Failed to update blog');
  }

  return res.json();
}

export async function deleteBlog(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete blog');
  }
}

