// Core user types
export interface User {
  id: string;
  email: string;
  subscription: 'free' | 'essential' | 'premium';
  createdAt: string;
  updatedAt: string;
}

// Business types
export interface Business {
  id: string;
  name: string;
  description?: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  images: string[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Enhanced Business interface (merging both definitions)
export interface BusinessExtended extends Business {
  // Additional fields from web package
  type: string;
  distance: string;
  price: string;
  image: string;
  highlights: string[];
  isOpen: boolean;
  aiReason: string;
  waitTime?: string;
  confidence?: number;
  website?: string;
  logo_url?: string;
  cover_photo_url?: string;
  external_id?: string;
  google_maps_url?: string;
  descriptions?: any[];
  menus?: any[];
  photos?: any[];
  reviews?: any[];
  opening_hours?: string;
  email?: string;
  city?: string;
  country?: string;
  postal_code?: string;
}

// AI Chat types
export interface Message {
  type: 'user' | 'assistant';
  content: string;
  assistant?: string;
  recommendations?: BusinessExtended[];
}

export interface Booking {
  id: number;
  service: string;
  provider: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  category: string;
  price: string;
  reminder: boolean;
}

export interface TrendingData {
  id: number;
  title: string;
  category: string;
  growth: string;
  description: string;
  icon: any;
  color: string;
  trend: string;
  author: string;
  likes: string;
  tags: string[];
  readTime: string;
}

export interface DiscoverContent {
  id: number;
  title: string;
  description: string;
  category: string;
  author: string;
  likes: string;
  image: string;
  tags: string[];
  readTime: string;
}

export interface SpecialsData {
  id: number;
  title: string;
  business: string;
  category: string;
  discount: string;
  originalPrice: string;
  newPrice: string;
  validUntil: string;
  description: string;
}

// Special type from Supabase
export interface Special {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  category: string;
  discount: string;
  original_price: string;
  new_price: string;
  valid_until: string;
  image_url: string | null;
  terms: string | null;
  is_featured: boolean;
  is_active: boolean;
  view_count: number;
  claim_count: number;
  created_at: string;
  updated_at: string;
}

// Events types
export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location: string;
  category: string;
  price: string;
  attendees: number;
  image_url: string | null;
  tags: string[] | null;
  is_hot: boolean;
  organizer_id: string | null;
  business_id: string | null;
  is_active: boolean;
  view_count: number;
  like_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
}

// For UI display (legacy format compatibility)
export interface EventDisplay {
  id: number | string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: string;
  attendees: string;
  image: string;
  description: string;
  tags: string[];
  isHot: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
}

export type ViewType = 'chat' | 'trending' | 'discover' | 'specials' | 'subscription' | 'profile' | 'membership';

// Chat Service Response
export interface ChatServiceResponse {
  message: string;
  recommendations?: BusinessExtended[];
  followUpQuestions?: string[];
}

// Location types
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
}

export interface LocationPreferences {
  userId: string;
  homeLocation: Location;
  workLocation?: Location;
  favoriteAreas: Location[];
  radius: number; // in kilometers
}

// Trending content types
export interface TrendingPost {
  id: string;
  title: string;
  content: string;
  images: string[];
  authorId: string;
  businessId?: string;
  category: string;
  tags: string[];
  likes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// Enhanced TrendingPost interface
export interface TrendingPostExtended extends TrendingPost {
  // Additional fields from web package
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  comments: number;
  shares: number;
  location: string;
  timeAgo: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
