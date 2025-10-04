import { Event, EventDisplay } from '../types';

/**
 * 将数据库Event转换为UI显示格式
 * @param event 数据库Event对象
 * @returns UI显示格式的EventDisplay对象
 */
export function eventToDisplay(event: Event): EventDisplay {
  return {
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time,
    location: event.location,
    category: event.category,
    price: event.price,
    attendees: formatAttendees(event.attendees),
    image: event.image_url || getDefaultEventImage(event.category),
    description: event.description || '',
    tags: event.tags || [],
    isHot: event.is_hot,
  };
}

/**
 * 格式化参与人数显示
 * @param attendees 参与人数
 * @returns 格式化后的字符串（如 "2.3k", "950"）
 */
export function formatAttendees(attendees: number): string {
  if (attendees >= 1000) {
    return `${(attendees / 1000).toFixed(1)}k`;
  }
  return attendees.toString();
}

/**
 * 根据分类获取默认图片
 * @param category 事件分类
 * @returns 默认图片URL
 */
export function getDefaultEventImage(category: string): string {
  const defaultImages: { [key: string]: string } = {
    'Food & Drink': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop&auto=format&q=60',
    'Sports & Fitness': 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=200&fit=crop&auto=format&q=60',
    'Arts & Culture': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop&auto=format&q=60',
    'Business & Technology': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=200&fit=crop&auto=format&q=60',
    'Music & Entertainment': 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=200&fit=crop&auto=format&q=60',
  };

  return defaultImages[category] || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=200&fit=crop&auto=format&q=60';
}

/**
 * 批量转换Events数组
 * @param events 数据库Event数组
 * @returns UI显示格式的EventDisplay数组
 */
export function eventsToDisplay(events: Event[]): EventDisplay[] {
  return events.map(eventToDisplay);
}

/**
 * 格式化日期显示
 * @param dateString ISO日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-NZ', options);
}

/**
 * 检查事件是否即将到来（7天内）
 * @param dateString 事件日期
 * @returns 是否即将到来
 */
export function isUpcoming(dateString: string): boolean {
  const eventDate = new Date(dateString);
  const today = new Date();
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 7;
}

/**
 * 检查事件是否已过期
 * @param dateString 事件日期
 * @returns 是否已过期
 */
export function isExpired(dateString: string): boolean {
  const eventDate = new Date(dateString);
  const today = new Date();
  return eventDate < today;
}

