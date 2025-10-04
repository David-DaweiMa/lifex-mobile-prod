import { supabase } from './supabase';
import type { Database } from './supabase';

type Business = Database['public']['Tables']['businesses']['Row'];
type BusinessInsert = Database['public']['Tables']['businesses']['Insert'];
type BusinessUpdate = Database['public']['Tables']['businesses']['Update'];

export const BusinessesService = {
  /**
   * 获取所有活跃的商家
   */
  async getActiveBusinesses() {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching businesses:', error);
      throw error;
    }

    return data as Business[];
  },

  /**
   * 获取认证商家（用于推荐展示）
   */
  async getVerifiedBusinesses(limit?: number) {
    let query = supabase
      .from('businesses')
      .select('*')
      .eq('is_active', true)
      .eq('is_verified', true)
      .order('rating', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching verified businesses:', error);
      throw error;
    }

    return data as Business[];
  },

  /**
   * 根据ID获取单个商家
   */
  async getBusinessById(id: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching business by id:', error);
      throw error;
    }

    return data as Business;
  },

  /**
   * 根据分类获取商家
   */
  async getBusinessesByCategory(category: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching businesses by category:', error);
      throw error;
    }

    return data as Business[];
  },

  /**
   * 根据子分类获取商家
   */
  async getBusinessesBySubcategory(subcategory: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_active', true)
      .contains('subcategories', [subcategory])
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching businesses by subcategory:', error);
      throw error;
    }

    return data as Business[];
  },

  /**
   * 搜索商家
   */
  async searchBusinesses(query: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error searching businesses:', error);
      throw error;
    }

    return data as Business[];
  },

  /**
   * 根据评分范围获取商家
   */
  async getBusinessesByRating(minRating: number = 4.0) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_active', true)
      .gte('rating', minRating)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching businesses by rating:', error);
      throw error;
    }

    return data as Business[];
  },

  /**
   * 根据拥有者ID获取商家
   */
  async getBusinessesByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching businesses by owner:', error);
      throw error;
    }

    return data as Business[];
  },

  /**
   * 创建新商家
   */
  async createBusiness(business: BusinessInsert) {
    const { data, error } = await supabase
      .from('businesses')
      .insert(business)
      .select()
      .single();

    if (error) {
      console.error('Error creating business:', error);
      throw error;
    }

    return data as Business;
  },

  /**
   * 更新商家信息
   */
  async updateBusiness(id: string, updates: BusinessUpdate) {
    const { data, error } = await supabase
      .from('businesses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating business:', error);
      throw error;
    }

    return data as Business;
  },

  /**
   * 删除商家（软删除）
   */
  async deleteBusiness(id: string) {
    const { error } = await supabase
      .from('businesses')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting business:', error);
      throw error;
    }

    return true;
  },

  /**
   * 获取热门商家（根据评分和评论数）
   */
  async getPopularBusinesses(limit: number = 10) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_active', true)
      .gte('rating', 4.0)
      .gte('review_count', 10)
      .order('rating', { ascending: false })
      .order('review_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching popular businesses:', error);
      throw error;
    }

    return data as Business[];
  },
};

