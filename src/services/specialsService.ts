import { supabase } from './supabase';
import type { Database } from './supabase';

type Special = Database['public']['Tables']['specials']['Row'];
type SpecialInsert = Database['public']['Tables']['specials']['Insert'];
type SpecialUpdate = Database['public']['Tables']['specials']['Update'];

export const SpecialsService = {
  /**
   * 获取所有活跃的特惠信息
   */
  async getActiveSpecials() {
    const { data, error } = await supabase
      .from('specials')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching specials:', error);
      throw error;
    }

    return data as Special[];
  },

  /**
   * 获取特色/推荐特惠（用于Hero Banner）
   */
  async getFeaturedSpecials(limit: number = 5) {
    const { data, error } = await supabase
      .from('specials')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured specials:', error);
      throw error;
    }

    return data as Special[];
  },

  /**
   * 根据ID获取单个特惠信息
   */
  async getSpecialById(id: string) {
    const { data, error } = await supabase
      .from('specials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching special by id:', error);
    }

    return { data: data as Special | null, error };
  },

  /**
   * 根据分类获取特惠
   */
  async getSpecialsByCategory(category: string) {
    const { data, error } = await supabase
      .from('specials')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching specials by category:', error);
      throw error;
    }

    return data as Special[];
  },

  /**
   * 根据商家ID获取特惠
   */
  async getSpecialsByBusiness(businessId: string) {
    const { data, error } = await supabase
      .from('specials')
      .select('*')
      .eq('is_active', true)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching specials by business:', error);
      throw error;
    }

    return data as Special[];
  },

  /**
   * 搜索特惠
   */
  async searchSpecials(query: string) {
    const { data, error } = await supabase
      .from('specials')
      .select('*')
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching specials:', error);
      throw error;
    }

    return data as Special[];
  },

  /**
   * 创建新特惠
   */
  async createSpecial(special: SpecialInsert) {
    const { data, error } = await supabase
      .from('specials')
      .insert(special)
      .select()
      .single();

    if (error) {
      console.error('Error creating special:', error);
      throw error;
    }

    return data as Special;
  },

  /**
   * 更新特惠信息
   */
  async updateSpecial(id: string, updates: SpecialUpdate) {
    const { data, error } = await supabase
      .from('specials')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating special:', error);
      throw error;
    }

    return data as Special;
  },

  /**
   * 删除特惠（软删除）
   */
  async deleteSpecial(id: string) {
    const { error } = await supabase
      .from('specials')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting special:', error);
      throw error;
    }

    return true;
  },

  /**
   * 增加浏览次数
   */
  async incrementViewCount(id: string) {
    const { error } = await supabase.rpc('increment_special_views', {
      special_id: id,
    });

    if (error) {
      console.error('Error incrementing view count:', error);
      // 不抛出错误，因为这不是关键操作
    }
  },

  /**
   * 增加领取次数
   */
  async incrementClaimCount(id: string) {
    const { error } = await supabase.rpc('increment_special_claims', {
      special_id: id,
    });

    if (error) {
      console.error('Error incrementing claim count:', error);
      // 不抛出错误，因为这不是关键操作
    }
  },
};

