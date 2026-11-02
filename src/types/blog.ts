export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  featured_image?: string | null;
  category?: string | null;
  author?: string | null;
  reading_time?: string | null;
  tags?: string[];
  is_featured?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface BlogFormData {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  category?: string;
  author?: string;
  reading_time?: string;
  tags?: string[];
  is_featured?: boolean;
}

export interface PaginatedBlogs {
  items: Blog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
