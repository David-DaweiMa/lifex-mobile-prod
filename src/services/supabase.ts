import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// 从环境变量获取 Supabase 配置
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// 检查环境变量是否存在
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Some features may not work properly.');
}

// 创建 Supabase 客户端
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// 数据库类型定义 - 从 lifex-mvp 同步
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          date_of_birth: string | null;
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          location: any | null;
          bio: string | null;
          website: string | null;
          social_links: any | null;
          subscription_level: 'free' | 'essential' | 'premium';
          email_verified: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          location?: any | null;
          bio?: string | null;
          website?: string | null;
          social_links?: any | null;
          user_type?: 'guest' | 'customer' | 'premium' | 'free_business' | 'professional_business' | 'enterprise_business';
          email_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          location?: any | null;
          bio?: string | null;
          website?: string | null;
          social_links?: any | null;
          user_type?: 'guest' | 'customer' | 'premium' | 'free_business' | 'professional_business' | 'enterprise_business';
          email_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_quotas: {
        Row: {
          id: string;
          user_id: string;
          quota_type: 'chat' | 'trending' | 'products' | 'ads' | 'stores';
          current_usage: number;
          max_limit: number;
          reset_period: 'daily' | 'monthly' | 'yearly';
          reset_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quota_type: 'chat' | 'trending' | 'products' | 'ads' | 'stores';
          current_usage?: number;
          max_limit: number;
          reset_period?: 'daily' | 'monthly' | 'yearly';
          reset_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quota_type?: 'chat' | 'trending' | 'products' | 'ads' | 'stores';
          current_usage?: number;
          max_limit?: number;
          reset_period?: 'daily' | 'monthly' | 'yearly';
          reset_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      businesses: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          logo_url: string | null;
          cover_image_url: string | null;
          category: string;
          subcategories: string[] | null;
          contact_info: any | null;
          address: any | null;
          business_hours: any | null;
          is_verified: boolean;
          is_active: boolean;
          rating: number;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          category: string;
          subcategories?: string[] | null;
          contact_info?: any | null;
          address?: any | null;
          business_hours?: any | null;
          is_verified?: boolean;
          is_active?: boolean;
          rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          category?: string;
          subcategories?: string[] | null;
          contact_info?: any | null;
          address?: any | null;
          business_hours?: any | null;
          is_verified?: boolean;
          is_active?: boolean;
          rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      trending_posts: {
        Row: {
          id: string;
          author_id: string;
          business_id: string | null;
          content: string;
          images: string[] | null;
          videos: string[] | null;
          hashtags: string[] | null;
          location: any | null;
          is_sponsored: boolean;
          sponsor_info: any | null;
          view_count: number;
          like_count: number;
          comment_count: number;
          share_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          business_id?: string | null;
          content: string;
          images?: string[] | null;
          videos?: string[] | null;
          hashtags?: string[] | null;
          location?: any | null;
          is_sponsored?: boolean;
          sponsor_info?: any | null;
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          share_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          business_id?: string | null;
          content?: string;
          images?: string[] | null;
          videos?: string[] | null;
          hashtags?: string[] | null;
          location?: any | null;
          is_sponsored?: boolean;
          sponsor_info?: any | null;
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          share_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          message_type: 'user' | 'ai' | 'system';
          content: string;
          metadata: any | null;
          is_ad_integrated: boolean;
          ad_info: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id: string;
          message_type: 'user' | 'ai' | 'system';
          content: string;
          metadata?: any | null;
          is_ad_integrated?: boolean;
          ad_info?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          message_type?: 'user' | 'ai' | 'system';
          content?: string;
          metadata?: any | null;
          is_ad_integrated?: boolean;
          ad_info?: any | null;
          created_at?: string;
        };
      };
      advertisements: {
        Row: {
          id: string;
          advertiser_id: string;
          business_id: string | null;
          title: string;
          description: string | null;
          content: string;
          ad_type: 'chat_recommendation' | 'trending_sponsored' | 'search_promoted' | 'native_content';
          placement_type: 'ai_response' | 'trending_feed' | 'search_results' | 'recommendations';
          target_audience: any | null;
          budget: number;
          daily_budget: number | null;
          total_spent: number;
          bid_amount: number | null;
          bid_type: 'cpc' | 'cpm' | 'cpv' | null;
          start_date: string;
          end_date: string | null;
          status: 'draft' | 'active' | 'paused' | 'completed' | 'rejected';
          impressions: number;
          clicks: number;
          conversions: number;
          ctr: number;
          cpc: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          advertiser_id: string;
          business_id?: string | null;
          title: string;
          description?: string | null;
          content: string;
          ad_type: 'chat_recommendation' | 'trending_sponsored' | 'search_promoted' | 'native_content';
          placement_type: 'ai_response' | 'trending_feed' | 'search_results' | 'recommendations';
          target_audience?: any | null;
          budget: number;
          daily_budget?: number | null;
          total_spent?: number;
          bid_amount?: number | null;
          bid_type?: 'cpc' | 'cpm' | 'cpv' | null;
          start_date: string;
          end_date?: string | null;
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'rejected';
          impressions?: number;
          clicks?: number;
          conversions?: number;
          ctr?: number;
          cpc?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          advertiser_id?: string;
          business_id?: string | null;
          title?: string;
          description?: string | null;
          content?: string;
          ad_type?: 'chat_recommendation' | 'trending_sponsored' | 'search_promoted' | 'native_content';
          placement_type?: 'ai_response' | 'trending_feed' | 'search_results' | 'recommendations';
          target_audience?: any | null;
          budget?: number;
          daily_budget?: number | null;
          total_spent?: number;
          bid_amount?: number | null;
          bid_type?: 'cpc' | 'cpm' | 'cpv' | null;
          start_date?: string;
          end_date?: string | null;
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'rejected';
          impressions?: number;
          clicks?: number;
          conversions?: number;
          ctr?: number;
          cpc?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      assistant_usage: {
        Row: {
          id: string;
          user_id: string;
          assistant_type: 'coly' | 'max';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          assistant_type: 'coly' | 'max';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          assistant_type?: 'coly' | 'max';
          created_at?: string;
        };
      };
      anonymous_usage: {
        Row: {
          id: string;
          session_id: string;
          device_fingerprint: string | null;
          quota_type: 'chat' | 'trending' | 'ads';
          usage_date: string;
          usage_count: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          device_fingerprint?: string | null;
          quota_type: 'chat' | 'trending' | 'ads';
          usage_date: string;
          usage_count?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          device_fingerprint?: string | null;
          quota_type?: 'chat' | 'trending' | 'ads';
          usage_date?: string;
          usage_count?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      events: {
        Row: {
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
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          date: string;
          time: string;
          location: string;
          category: string;
          price?: string;
          attendees?: number;
          image_url?: string | null;
          tags?: string[] | null;
          is_hot?: boolean;
          organizer_id?: string | null;
          business_id?: string | null;
          is_active?: boolean;
          view_count?: number;
          like_count?: number;
          share_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          date?: string;
          time?: string;
          location?: string;
          category?: string;
          price?: string;
          attendees?: number;
          image_url?: string | null;
          tags?: string[] | null;
          is_hot?: boolean;
          organizer_id?: string | null;
          business_id?: string | null;
          is_active?: boolean;
          view_count?: number;
          like_count?: number;
          share_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      specials: {
        Row: {
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
        };
        Insert: {
          id?: string;
          business_id: string;
          title: string;
          description?: string | null;
          category: string;
          discount: string;
          original_price: string;
          new_price: string;
          valid_until: string;
          image_url?: string | null;
          terms?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          view_count?: number;
          claim_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          discount?: string;
          original_price?: string;
          new_price?: string;
          valid_until?: string;
          image_url?: string | null;
          terms?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          view_count?: number;
          claim_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
