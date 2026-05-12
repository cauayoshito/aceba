export interface Partner {
  id: string
  name: string
  description?: string | null
  logo_url?: string | null
  website_url?: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface GalleryImage {
  id: string
  title?: string | null
  category?: string | null
  image_url: string
  is_active: boolean
  created_at: string
}

export interface NewsItem {
  id: string
  title: string
  category?: string | null
  cover_url?: string | null
  excerpt?: string | null
  content?: string | null
  link_url?: string | null
  published_at?: string | null
  is_active: boolean
  created_at: string
}

export interface SiteSetting {
  id: string
  key: string
  value?: string | null
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  created_at: string
}
