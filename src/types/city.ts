export interface City {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  parent_name?: string | null;
  description?: string | null;
  page_id?: string | null;
  featured_image?: string | null;
  category_tagline?: string | null;
  custom_uri?: string | null;
  count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CityFormData {
  name: string;
  slug?: string;
  parent_id?: number | null;
  description?: string;
  page_id?: string;
  featured_image?: string;
  category_tagline?: string;
  custom_uri?: string;
  is_active?: boolean;
}

export interface PaginatedCities {
  items: City[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
