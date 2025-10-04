import { supabase } from './supabase';
import type { Database } from './supabase';

type Event = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];
type EventUpdate = Database['public']['Tables']['events']['Update'];

export interface EventFilters {
  category?: string;
  isHot?: boolean;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

/**
 * Events Service
 * 处理所有与events相关的数据库操作
 */
export class EventsService {
  /**
   * 获取所有活跃的events
   * @param filters 可选的过滤条件
   * @param limit 限制返回数量
   * @returns events列表
   */
  static async getEvents(filters: EventFilters = {}, limit: number = 50): Promise<{ data: Event[] | null; error: any }> {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
        .limit(limit);

      // 应用过滤条件
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters.isHot !== undefined) {
        query = query.eq('is_hot', filters.isHot);
      }

      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      } else {
        // 默认只返回活跃的events
        query = query.eq('is_active', true);
      }

      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching events:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception in getEvents:', error);
      return { data: null, error };
    }
  }

  /**
   * 获取热门events
   * @param limit 限制返回数量
   * @returns 热门events列表
   */
  static async getHotEvents(limit: number = 10): Promise<{ data: Event[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .eq('is_hot', true)
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching hot events:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception in getHotEvents:', error);
      return { data: null, error };
    }
  }

  /**
   * 根据ID获取单个event
   * @param id event的ID
   * @returns event详情
   */
  static async getEventById(id: string): Promise<{ data: Event | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching event by id:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception in getEventById:', error);
      return { data: null, error };
    }
  }

  /**
   * 获取即将到来的events
   * @param limit 限制返回数量
   * @returns 即将到来的events列表
   */
  static async getUpcomingEvents(limit: number = 20): Promise<{ data: Event[] | null; error: any }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching upcoming events:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception in getUpcomingEvents:', error);
      return { data: null, error };
    }
  }

  /**
   * 按分类获取events
   * @param category 分类名称
   * @param limit 限制返回数量
   * @returns 该分类的events列表
   */
  static async getEventsByCategory(category: string, limit: number = 20): Promise<{ data: Event[] | null; error: any }> {
    return this.getEvents({ category, isActive: true }, limit);
  }

  /**
   * 搜索events
   * @param searchTerm 搜索关键词
   * @param limit 限制返回数量
   * @returns 搜索结果
   */
  static async searchEvents(searchTerm: string, limit: number = 20): Promise<{ data: Event[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
        .order('date', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error searching events:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception in searchEvents:', error);
      return { data: null, error };
    }
  }

  /**
   * 增加event的查看次数
   * @param id event的ID
   * @returns 更新结果
   */
  static async incrementViewCount(id: string): Promise<{ data: Event | null; error: any }> {
    try {
      const { data, error } = await supabase.rpc('increment_event_views', { event_id: id });

      if (error) {
        // 如果RPC函数不存在，使用手动更新
        const { data: event } = await this.getEventById(id);
        if (event) {
          const { data: updatedData, error: updateError } = await supabase
            .from('events')
            .update({ view_count: event.view_count + 1 })
            .eq('id', id)
            .select()
            .single();

          return { data: updatedData, error: updateError };
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception in incrementViewCount:', error);
      return { data: null, error };
    }
  }

  /**
   * 创建新的event（需要认证）
   * @param event event数据
   * @returns 创建的event
   */
  static async createEvent(event: EventInsert): Promise<{ data: Event | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert(event)
        .select()
        .single();

      if (error) {
        console.error('Error creating event:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception in createEvent:', error);
      return { data: null, error };
    }
  }

  /**
   * 更新event（需要认证）
   * @param id event的ID
   * @param updates 要更新的字段
   * @returns 更新后的event
   */
  static async updateEvent(id: string, updates: EventUpdate): Promise<{ data: Event | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating event:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception in updateEvent:', error);
      return { data: null, error };
    }
  }

  /**
   * 删除event（软删除，设置为inactive）
   * @param id event的ID
   * @returns 删除结果
   */
  static async deleteEvent(id: string): Promise<{ data: Event | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error deleting event:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception in deleteEvent:', error);
      return { data: null, error };
    }
  }
}

export default EventsService;

