# 🔄 数据库全新重建方案（推荐）

**更新时间：** 2024-10-17

---

## 🎯 **策略：全新数据重建（Clean Rebuild, no data migration）**

```
当前表（有数据）
    ↓
重命名为 _old（备份）
    ↓
创建全新表（理想结构）
    ↓
不迁移旧数据（仅保留 _old 备份）
    ↓
测试验证
    ↓
删除 _old 表（可选）
```

**优势：**
- ✅ 干净的全新架构
- ✅ 无历史遗留问题
- ✅ 测试新旧隔离
- ✅ 随时可回滚
- ✅ API/抓取重建数据，更可控、更合规

---

## 📋 **完整实施步骤**

### **Phase 1: 备份现有表（5 分钟）** ⭐⭐⭐⭐⭐

```sql
-- =====================================================
-- Step 1: 重命名所有现有表为 _old
-- =====================================================

-- 用户相关
ALTER TABLE IF EXISTS user_profiles RENAME TO user_profiles_old;
ALTER TABLE IF EXISTS user_quotas RENAME TO user_quotas_old;

-- 商家相关
ALTER TABLE IF EXISTS businesses RENAME TO businesses_old;

-- 活动和优惠
ALTER TABLE IF EXISTS events RENAME TO events_old;
ALTER TABLE IF EXISTS specials RENAME TO specials_old;

-- Chat
ALTER TABLE IF EXISTS chat_messages RENAME TO chat_messages_old;

-- 热门和广告
ALTER TABLE IF EXISTS trending_posts RENAME TO trending_posts_old;
ALTER TABLE IF EXISTS advertisements RENAME TO advertisements_old;

-- 其他
ALTER TABLE IF EXISTS assistant_usage RENAME TO assistant_usage_old;
ALTER TABLE IF EXISTS anonymous_usage RENAME TO anonymous_usage_old;

-- 验证
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename LIKE '%_old'
ORDER BY tablename;

-- 成功提示
DO $$
BEGIN
  RAISE NOTICE '✅ All tables renamed to _old';
  RAISE NOTICE 'Old tables count: %', (
    SELECT COUNT(*) FROM pg_tables 
    WHERE schemaname = 'public' AND tablename LIKE '%_old'
  );
END $$;
```

---

### **Phase 2: 创建全新表结构（30-60 分钟）** ⭐⭐⭐⭐⭐

#### **2.1 用户系统表**

```sql
-- =====================================================
-- 用户资料表（全新）
-- =====================================================
CREATE TABLE user_profiles (
  -- 基本信息
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  
  -- 个人信息
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  bio TEXT,
  
  -- 地址信息
  city TEXT,
  country TEXT DEFAULT 'New Zealand',
  address JSONB,
  location GEOGRAPHY(POINT, 4326),
  
  -- 订阅（简化，直接在这里）
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'essential', 'premium')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'expired', 'cancelled', 'trial')),
  subscription_expires_at TIMESTAMPTZ,
  
  -- 配额（简化）
  chat_quota_daily INTEGER DEFAULT 10,
  chat_used_today INTEGER DEFAULT 0,
  quota_reset_date DATE DEFAULT CURRENT_DATE,
  
  -- 状态
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- 索引
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_city ON user_profiles(city);
CREATE INDEX idx_user_profiles_subscription ON user_profiles(subscription_plan, subscription_status);
CREATE INDEX idx_user_profiles_location ON user_profiles USING GIST(location);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 用户偏好表（新）
-- =====================================================
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- 偏好设置
  preferred_categories TEXT[] DEFAULT '{}',
  preferred_cuisines TEXT[] DEFAULT '{}',
  dietary_restrictions TEXT[] DEFAULT '{}',
  price_preference TEXT CHECK (price_preference IN ('budget', 'moderate', 'upscale', 'luxury')),
  
  -- 搜索偏好
  default_search_radius INTEGER DEFAULT 5000,
  preferred_cities TEXT[] DEFAULT '{}',
  
  -- 通知偏好
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

CREATE TRIGGER trigger_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### **2.2 商家系统表**

```sql
-- =====================================================
-- 商家分类表（新）
-- =====================================================
CREATE TABLE business_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES business_categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_business_categories_slug ON business_categories(slug);
CREATE INDEX idx_business_categories_parent_id ON business_categories(parent_id);
CREATE INDEX idx_business_categories_display_order ON business_categories(display_order);

-- 插入初始分类
INSERT INTO business_categories (name, slug, description, display_order) VALUES
  ('Food & Dining', 'food-dining', 'Restaurants, cafes, bars, and food services', 1),
  ('Beauty & Wellness', 'beauty-wellness', 'Hair salons, beauty salons, spas, and wellness centers', 2),
  ('Entertainment', 'entertainment', 'Cinemas, playgrounds, gyms, and entertainment venues', 3),
  ('Health & Medical', 'health-medical', 'Doctors, dentists, pharmacies, and healthcare services', 4),
  ('Shopping & Retail', 'shopping-retail', 'Shops, boutiques, and retail stores', 5);

-- =====================================================
-- 商家主表（全新，完美结构）
-- =====================================================
CREATE TABLE businesses (
  -- 基本信息
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  
  -- 分类
  category_id UUID REFERENCES business_categories(id) ON DELETE SET NULL,
  subcategories TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  -- 地址和位置
  address JSONB,
  city TEXT,
  country TEXT DEFAULT 'New Zealand',
  postcode TEXT,
  location GEOGRAPHY(POINT, 4326),
  
  -- 联系方式
  contact_info JSONB,
  website TEXT,  -- 官方网址（重要！用于抓取菜单、价格等详细信息）
  
  -- 营业时间
  business_hours JSONB,
  
  -- 商家所有者
  owner_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  -- 媒体
  logo_url TEXT,
  cover_image_url TEXT,
  owner_uploaded_photos TEXT[] DEFAULT '{}',
  
  -- Google Places 集成
  google_place_id TEXT UNIQUE,
  google_photo_reference TEXT,
  cached_google_rating DECIMAL(2,1),
  cached_google_reviews INTEGER,
  cached_at TIMESTAMPTZ,
  cache_expires_at TIMESTAMPTZ,
  
  -- LifeX 自有评分
  lifex_rating DECIMAL(2,1),
  lifex_review_count INTEGER DEFAULT 0,
  
  -- 显示评分（计算列）
  display_rating DECIMAL(2,1) GENERATED ALWAYS AS (
    COALESCE(cached_google_rating, lifex_rating, 0)
  ) STORED,
  display_review_count INTEGER GENERATED ALWAYS AS (
    COALESCE(cached_google_reviews, lifex_review_count, 0)
  ) STORED,
  
  -- 统计数据
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- 排序和筛选
  priority_score DECIMAL(5,2) DEFAULT 0,
  
  -- 状态
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- 数据来源
  data_source TEXT DEFAULT 'manual' CHECK (data_source IN ('manual', 'google', 'owner', 'hybrid')),
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_businesses_category_id ON businesses(category_id);
CREATE INDEX idx_businesses_city ON businesses(city);
CREATE INDEX idx_businesses_location ON businesses USING GIST(location);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_google_place_id ON businesses(google_place_id) WHERE google_place_id IS NOT NULL;
CREATE INDEX idx_businesses_owner_id ON businesses(owner_id) WHERE owner_id IS NOT NULL;
CREATE INDEX idx_businesses_priority_score ON businesses(priority_score DESC);
CREATE INDEX idx_businesses_display_rating ON businesses(display_rating DESC);
CREATE INDEX idx_businesses_active_city ON businesses(is_active, city) WHERE is_active = TRUE;

CREATE TRIGGER trigger_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### **2.3 活动和优惠表**

```sql
-- =====================================================
-- 活动表（全新）
-- =====================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基本信息
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  
  -- 时间和地点
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  timezone TEXT DEFAULT 'Pacific/Auckland',
  location TEXT NOT NULL,
  venue_name TEXT,
  city TEXT,
  location_coords GEOGRAPHY(POINT, 4326),
  
  -- 分类和标签
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  
  -- 票价
  price_type TEXT DEFAULT 'free' CHECK (price_type IN ('free', 'paid', 'donation')),
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  currency TEXT DEFAULT 'NZD',
  
  -- 人数
  capacity INTEGER,
  attendees_count INTEGER DEFAULT 0,
  
  -- 媒体
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  
  -- 关联
  organizer_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  
  -- 统计
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- 状态
  is_hot BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_business_id ON events(business_id) WHERE business_id IS NOT NULL;
CREATE INDEX idx_events_organizer_id ON events(organizer_id) WHERE organizer_id IS NOT NULL;
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_location_coords ON events USING GIST(location_coords);
CREATE INDEX idx_events_active_date ON events(is_active, date, status) WHERE is_active = TRUE;

CREATE TRIGGER trigger_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 优惠表（全新）
-- =====================================================
CREATE TABLE specials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 关联商家
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- 基本信息
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  
  -- 分类
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  
  -- 折扣信息
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount', 'bogo', 'other')),
  discount_value TEXT NOT NULL,
  original_price DECIMAL(10,2),
  discounted_price DECIMAL(10,2),
  currency TEXT DEFAULT 'NZD',
  
  -- 有效期
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- 限制
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  terms_and_conditions TEXT,
  
  -- 媒体
  image_url TEXT,
  
  -- 统计
  view_count INTEGER DEFAULT 0,
  claim_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- 状态
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_specials_business_id ON specials(business_id);
CREATE INDEX idx_specials_category ON specials(category);
CREATE INDEX idx_specials_slug ON specials(slug);
CREATE INDEX idx_specials_expires_at ON specials(expires_at);
CREATE INDEX idx_specials_active_valid ON specials(is_active, expires_at) 
  WHERE is_active = TRUE AND expires_at > NOW();

CREATE TRIGGER trigger_specials_updated_at
  BEFORE UPDATE ON specials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### **2.4 收藏、评论、通知表**

```sql
-- =====================================================
-- 收藏表（新）
-- =====================================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  favoritable_type TEXT NOT NULL CHECK (favoritable_type IN ('business', 'event', 'special')),
  favoritable_id UUID NOT NULL,
  folder_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, favoritable_type, favoritable_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_favoritable ON favorites(favoritable_type, favoritable_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- =====================================================
-- 评论表（新）
-- =====================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reviewable_type TEXT NOT NULL CHECK (reviewable_type IN ('business', 'event')),
  reviewable_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  ratings JSONB,
  photos TEXT[] DEFAULT '{}',
  helpful_count INTEGER DEFAULT 0,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, reviewable_type, reviewable_id)
);

CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_reviewable ON reviews(reviewable_type, reviewable_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_active_approved ON reviews(is_active, moderation_status) 
  WHERE is_active = TRUE AND moderation_status = 'approved';

CREATE TRIGGER trigger_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 通知表（新）
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('system', 'event', 'special', 'review', 'booking', 'subscription')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_type TEXT,
  related_id UUID,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

#### **2.5 Chat 系统表**

```sql
-- =====================================================
-- Chat 会话表（新）
-- =====================================================
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT,
  summary TEXT,
  message_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_last_message_at ON chat_sessions(last_message_at DESC);
CREATE INDEX idx_chat_sessions_active ON chat_sessions(is_active, user_id) WHERE is_active = TRUE;

CREATE TRIGGER trigger_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Chat 消息表（全新）
-- =====================================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model TEXT,
  tokens_used INTEGER,
  metadata JSONB,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
```

---

### **Phase 3: 数据采集与回填（替代迁移）（持续）** ⭐⭐⭐⭐⭐

```sql
-- =====================================================
-- 数据采集：Google/官网/公共数据/API 抓取与回填（不从旧表复制）
-- =====================================================

-- 3.1 用户资料由注册流程与 OAuth 回填（不复制旧记录）

-- 显示迁移结果
DO $$
DECLARE
  old_count INTEGER;
  new_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO old_count FROM user_profiles_old;
  SELECT COUNT(*) INTO new_count FROM user_profiles;
  
  RAISE NOTICE '✅ User profiles migrated';
  RAISE NOTICE 'Old: % → New: %', old_count, new_count;
END $$;

-- 3.2 采集商家数据（Google Places 搜索/详情/照片引用）并写入：
-- INSERT INTO businesses (
  id, name, description,
  category_id,  -- 暂时 NULL，后面手动关联
  subcategories, tags,
  address, city, country,
  contact_info, business_hours,
  owner_id,
  logo_url, cover_image_url,
  google_place_id,
  lifex_rating, lifex_review_count,
  view_count, favorite_count,
  is_verified, is_active,
  data_source,
  created_at, updated_at
)
SELECT 
  id, name, description,
  NULL as category_id,  -- 需要后续关联到新的分类表
  subcategories,
  ARRAY[]::TEXT[] as tags,
  address, city,
  COALESCE(country, 'New Zealand'),
  contact_info, business_hours,
  owner_id,
  logo_url, cover_image_url,
  google_place_id,
  rating as lifex_rating,
  review_count as lifex_review_count,
  COALESCE(view_count, 0),
  COALESCE(favorite_count, 0),
  is_verified, is_active,
  CASE 
    WHEN google_place_id IS NOT NULL THEN 'google'
    WHEN owner_id IS NOT NULL THEN 'owner'
    ELSE 'manual'
  END as data_source,
  created_at, updated_at
-- FROM staging_google_places;

-- 尝试关联到新分类（基于旧的 category 字段）
-- 可选：根据 Google types 映射到标准类目，再人工调整

-- 显示迁移结果
DO $$
DECLARE
  old_count INTEGER;
  new_count INTEGER;
  with_category INTEGER;
BEGIN
  SELECT COUNT(*) INTO old_count FROM businesses_old;
  SELECT COUNT(*) INTO new_count FROM businesses;
  SELECT COUNT(*) INTO with_category FROM businesses WHERE category_id IS NOT NULL;
  
  RAISE NOTICE '✅ Businesses migrated';
  RAISE NOTICE 'Old: % → New: %', old_count, new_count;
  RAISE NOTICE 'With category: %', with_category;
END $$;

-- 3.3 活动数据：Eventbrite/城市公开页 API/抓取 → events
  id, title, description,
  date, start_time, end_time,
  location, venue_name, city,
  category, tags,
  price_type,
  attendees_count,
  image_url,
  organizer_id, business_id,
  view_count, like_count, share_count,
  is_hot, is_active,
  status,
  created_at, updated_at
)
SELECT 
  id, title, description,
  date, 
  time::TIME as start_time,
  NULL as end_time,
  location,
  NULL as venue_name,
  city,
  category, tags,
  CASE WHEN price = 'Free' OR price = '$0' THEN 'free' ELSE 'paid' END,
  attendees,
  image_url,
  organizer_id, business_id,
  view_count, like_count, share_count,
  is_hot, is_active,
  CASE 
    WHEN date < CURRENT_DATE THEN 'completed'
    WHEN date = CURRENT_DATE THEN 'ongoing'
    ELSE 'upcoming'
  END,
  created_at, updated_at
-- FROM staging_events;

-- 显示迁移结果
DO $$
DECLARE
  old_count INTEGER;
  new_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO old_count FROM events_old;
  SELECT COUNT(*) INTO new_count FROM events;
  
  RAISE NOTICE '✅ Events migrated';
  RAISE NOTICE 'Old: % → New: %', old_count, new_count;
END $$;

-- 3.4 优惠数据：官网/First Table 抓取缓存→审核→ specials
  id, business_id,
  title, description,
  category, tags,
  discount_value,
  original_price, discounted_price,
  starts_at, expires_at,
  terms_and_conditions,
  image_url,
  view_count, claim_count,
  is_featured, is_active,
  created_at, updated_at
)
SELECT 
  id, business_id,
  title, description,
  category,
  ARRAY[]::TEXT[] as tags,
  discount as discount_value,
  original_price::DECIMAL,
  new_price::DECIMAL,
  created_at as starts_at,
  valid_until::TIMESTAMPTZ,
  terms,
  image_url,
  view_count, claim_count,
  is_featured, is_active,
  created_at, updated_at
-- FROM catalog.special_scrape_cache WHERE ...（经审核/规则）

-- 显示迁移结果
DO $$
DECLARE
  old_count INTEGER;
  new_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO old_count FROM specials_old;
  SELECT COUNT(*) INTO new_count FROM specials;
  
  RAISE NOTICE '✅ Specials migrated';
  RAISE NOTICE 'Old: % → New: %', old_count, new_count;
END $$;

-- 3.5 Chat 历史不迁移；新会话从正式运行后开始累积

-- 显示迁移结果
DO $$
DECLARE
  old_messages INTEGER;
  new_messages INTEGER;
  sessions INTEGER;
BEGIN
  SELECT COUNT(*) INTO old_messages FROM chat_messages_old;
  SELECT COUNT(*) INTO new_messages FROM chat_messages;
  SELECT COUNT(*) INTO sessions FROM chat_sessions;
  
  RAISE NOTICE '✅ Chat data migrated';
  RAISE NOTICE 'Old messages: % → New messages: %', old_messages, new_messages;
  RAISE NOTICE 'Sessions created: %', sessions;
END $$;
```

---

### **Phase 4: 验证和测试（必须）** ⭐⭐⭐⭐⭐

```sql
-- =====================================================
-- 数据验证
-- =====================================================

-- 检查数据量对比
SELECT 
  '=== DATA MIGRATION SUMMARY ===' as section,
  (SELECT COUNT(*) FROM user_profiles_old) as old_users,
  (SELECT COUNT(*) FROM user_profiles) as new_users,
  (SELECT COUNT(*) FROM businesses_old) as old_businesses,
  (SELECT COUNT(*) FROM businesses) as new_businesses,
  (SELECT COUNT(*) FROM events_old) as old_events,
  (SELECT COUNT(*) FROM events) as new_events,
  (SELECT COUNT(*) FROM specials_old) as old_specials,
  (SELECT COUNT(*) FROM specials) as new_specials;

-- 检查外键关系
SELECT 
  COUNT(*) as businesses_with_owner,
  COUNT(CASE WHEN category_id IS NOT NULL THEN 1 END) as with_category,
  COUNT(CASE WHEN google_place_id IS NOT NULL THEN 1 END) as with_google_id
FROM businesses;

-- 检查活动关联
SELECT 
  COUNT(*) as total_events,
  COUNT(CASE WHEN business_id IS NOT NULL THEN 1 END) as linked_to_business,
  COUNT(CASE WHEN organizer_id IS NOT NULL THEN 1 END) as has_organizer
FROM events;

-- 显示总结
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ NEW DATABASE STRUCTURE READY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total tables: %', (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE '%_old');
  RAISE NOTICE 'Old tables (backup): %', (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%_old');
  RAISE NOTICE '========================================';
END $$;
```

---

### **Phase 5: 切换和清理（可选）** ⭐⭐⭐

```sql
-- =====================================================
-- 删除旧表（仅在确认新表正常工作后）
-- =====================================================

-- ⚠️ 警告：这一步会永久删除旧表，确保已备份！
-- ⚠️ 建议等待 1-2 周，确认一切正常后再执行

-- 删除所有 _old 表
-- DROP TABLE IF EXISTS user_profiles_old CASCADE;
-- DROP TABLE IF EXISTS user_quotas_old CASCADE;
-- DROP TABLE IF EXISTS businesses_old CASCADE;
-- DROP TABLE IF EXISTS events_old CASCADE;
-- DROP TABLE IF EXISTS specials_old CASCADE;
-- DROP TABLE IF EXISTS chat_messages_old CASCADE;
-- DROP TABLE IF EXISTS trending_posts_old CASCADE;
-- DROP TABLE IF EXISTS advertisements_old CASCADE;
-- DROP TABLE IF EXISTS assistant_usage_old CASCADE;
-- DROP TABLE IF EXISTS anonymous_usage_old CASCADE;

-- 验证清理
-- SELECT tablename FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename LIKE '%_old';
```

---

## 🔄 **回滚方案（如果需要）**

```sql
-- =====================================================
-- 紧急回滚：恢复旧表
-- =====================================================

-- 1. 删除新表
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS specials CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS business_categories CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 2. 重命名旧表回来
ALTER TABLE user_profiles_old RENAME TO user_profiles;
ALTER TABLE businesses_old RENAME TO businesses;
ALTER TABLE events_old RENAME TO events;
ALTER TABLE specials_old RENAME TO specials;
ALTER TABLE chat_messages_old RENAME TO chat_messages;
-- ... 其他表

-- 3. 重启应用并测试
```

---

## ✅ **实施检查清单**

```
Phase 1: 备份现有表
- [ ] 重命名所有表为 _old
- [ ] 验证所有表都已重命名
- [ ] 记录表数量

Phase 2: 创建全新表
- [ ] 创建 user_profiles
- [ ] 创建 user_preferences
- [ ] 创建 business_categories
- [ ] 创建 businesses
- [ ] 创建 events
- [ ] 创建 specials
- [ ] 创建 favorites
- [ ] 创建 reviews
- [ ] 创建 notifications
- [ ] 创建 chat_sessions
- [ ] 创建 chat_messages

Phase 3: 数据迁移
- [ ] 迁移用户数据
- [ ] 迁移商家数据
- [ ] 迁移活动数据
- [ ] 迁移优惠数据
- [ ] 迁移 Chat 数据
- [ ] 验证数据完整性

Phase 4: 测试
- [ ] 应用可以启动
- [ ] 用户可以登录
- [ ] Places 页面正常
- [ ] Events 页面正常
- [ ] Specials 页面正常
- [ ] AI Chat 正常
- [ ] 无严重错误

Phase 5: 清理（1-2 周后）
- [ ] 确认新表稳定
- [ ] 删除 _old 表
```

---

## 📊 **预期结果**

```
之前（旧表）：
├─ 10-12 个表
├─ 结构不统一
├─ 缺少核心功能
└─ 历史包袱

之后（新表）：
├─ 15-17 个表 ✅
├─ 清晰的结构 ✅
├─ 完整的核心功能 ✅
├─ 无历史包袱 ✅
├─ 符合最佳实践 ✅
└─ 易于扩展 ✅
```

---

## ⏱️ **时间估算**

```
Phase 1: 备份（5 分钟）
Phase 2: 创建新表（30-60 分钟）
Phase 3: 数据迁移（30-60 分钟）
Phase 4: 测试（1-2 小时）
Phase 5: 代码更新（2-3 天）

总计：约 3-4 小时（数据库）+ 2-3 天（代码）
```

---

**这是最干净的方案！准备好就开始！** 🚀✨


