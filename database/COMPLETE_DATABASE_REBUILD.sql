-- =====================================================
-- LifeX 数据库完整重建脚本
-- 执行前请确保已阅读 DATABASE_CLEAN_REBUILD.md
-- =====================================================
-- 
-- 警告：此脚本会重命名现有表并创建全新表结构
-- 确保您了解每一步的含义
-- 
-- 建议：分段执行，不要一次性运行全部
-- =====================================================

-- =====================================================
-- Phase 1: 备份现有表
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Phase 1: Backing up existing tables...';
  RAISE NOTICE '========================================';
END $$;

-- 通用：自动重命名所有 public 架构下的现有表为 _old（避免遗漏）
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename NOT LIKE '%_old'
  ) LOOP
    EXECUTE format('ALTER TABLE IF EXISTS %I.%I RENAME TO %I', 'public', r.tablename, r.tablename || '_old');
  END LOOP;
END $$;

-- 兼容：显式列出常见表（若已被上面重命名则忽略）
ALTER TABLE IF EXISTS user_profiles RENAME TO user_profiles_old;
ALTER TABLE IF EXISTS user_preferences RENAME TO user_preferences_old;
ALTER TABLE IF EXISTS user_quotas RENAME TO user_quotas_old;
ALTER TABLE IF EXISTS businesses RENAME TO businesses_old;
ALTER TABLE IF EXISTS events RENAME TO events_old;
ALTER TABLE IF EXISTS specials RENAME TO specials_old;
ALTER TABLE IF EXISTS chat_messages RENAME TO chat_messages_old;
ALTER TABLE IF EXISTS chat_sessions RENAME TO chat_sessions_old;
ALTER TABLE IF EXISTS trending_posts RENAME TO trending_posts_old;
ALTER TABLE IF EXISTS advertisements RENAME TO advertisements_old;
ALTER TABLE IF EXISTS assistant_usage RENAME TO assistant_usage_old;
ALTER TABLE IF EXISTS anonymous_usage RENAME TO anonymous_usage_old;
ALTER TABLE IF EXISTS favorites RENAME TO favorites_old;
ALTER TABLE IF EXISTS reviews RENAME TO reviews_old;
ALTER TABLE IF EXISTS notifications RENAME TO notifications_old;

-- 验证备份
DO $$
DECLARE
  backup_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO backup_count
  FROM pg_tables 
  WHERE schemaname = 'public' AND tablename LIKE '%_old';
  
  RAISE NOTICE '✅ Backup completed';
  RAISE NOTICE 'Tables backed up: %', backup_count;
END $$;

-- =====================================================
-- Phase 2: 创建辅助函数
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Phase 2: Creating helper functions...';
  RAISE NOTICE '========================================';
END $$;

-- 更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Phase 3: 创建新表 - 用户系统
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Phase 3: Creating new tables - User System...';
  RAISE NOTICE '========================================';
END $$;

-- 用户资料表
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  bio TEXT,
  city TEXT,
  country TEXT DEFAULT 'New Zealand',
  address JSONB,
  location GEOGRAPHY(POINT, 4326),
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'essential', 'premium')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'expired', 'cancelled', 'trial')),
  subscription_expires_at TIMESTAMPTZ,
  chat_quota_daily INTEGER DEFAULT 10,
  chat_used_today INTEGER DEFAULT 0,
  quota_reset_date DATE DEFAULT CURRENT_DATE,
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_city ON user_profiles(city);
CREATE INDEX idx_user_profiles_location ON user_profiles USING GIST(location);

CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 用户偏好表
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  preferred_categories TEXT[] DEFAULT '{}',
  preferred_cuisines TEXT[] DEFAULT '{}',
  dietary_restrictions TEXT[] DEFAULT '{}',
  price_preference TEXT CHECK (price_preference IN ('budget', 'moderate', 'upscale', 'luxury')),
  default_search_radius INTEGER DEFAULT 5000,
  preferred_cities TEXT[] DEFAULT '{}',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

CREATE TRIGGER trigger_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

RAISE NOTICE '✅ User system tables created';

-- =====================================================
-- Phase 4: 创建新表 - 商家系统
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Phase 4: Creating new tables - Business System...';
  RAISE NOTICE '========================================';
END $$;

-- 商家分类表
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

-- 插入初始分类
INSERT INTO business_categories (name, slug, description, display_order) VALUES
  ('Food & Dining', 'food-dining', 'Restaurants, cafes, bars, and food services', 1),
  ('Beauty & Wellness', 'beauty-wellness', 'Hair salons, beauty salons, spas', 2),
  ('Entertainment', 'entertainment', 'Cinemas, gyms, entertainment venues', 3),
  ('Health & Medical', 'health-medical', 'Healthcare and medical services', 4),
  ('Shopping & Retail', 'shopping-retail', 'Shops and retail stores', 5);

-- 商家主表
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  category_id UUID REFERENCES business_categories(id) ON DELETE SET NULL,
  subcategories TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  address JSONB,
  city TEXT,
  country TEXT DEFAULT 'New Zealand',
  postcode TEXT,
  location GEOGRAPHY(POINT, 4326),
  contact_info JSONB,
  website TEXT,
  business_hours JSONB,
  owner_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  logo_url TEXT,
  cover_image_url TEXT,
  owner_uploaded_photos TEXT[] DEFAULT '{}',
  google_place_id TEXT UNIQUE,
  google_photo_reference TEXT,
  cached_google_rating DECIMAL(2,1),
  cached_google_reviews INTEGER,
  cached_at TIMESTAMPTZ,
  cache_expires_at TIMESTAMPTZ,
  lifex_rating DECIMAL(2,1),
  lifex_review_count INTEGER DEFAULT 0,
  display_rating DECIMAL(2,1) GENERATED ALWAYS AS (
    COALESCE(cached_google_rating, lifex_rating, 0)
  ) STORED,
  display_review_count INTEGER GENERATED ALWAYS AS (
    COALESCE(cached_google_reviews, lifex_review_count, 0)
  ) STORED,
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  priority_score DECIMAL(5,2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  data_source TEXT DEFAULT 'manual' CHECK (data_source IN ('manual', 'google', 'owner', 'hybrid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_businesses_category_id ON businesses(category_id);
CREATE INDEX idx_businesses_city ON businesses(city);
CREATE INDEX idx_businesses_location ON businesses USING GIST(location);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_google_place_id ON businesses(google_place_id);
CREATE INDEX idx_businesses_priority_score ON businesses(priority_score DESC);

CREATE TRIGGER trigger_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

RAISE NOTICE '✅ Business system tables created';

-- =====================================================
-- Phase 5: 创建新表 - 活动和优惠
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Phase 5: Creating new tables - Events & Specials...';
  RAISE NOTICE '========================================';
END $$;

-- 活动表
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  timezone TEXT DEFAULT 'Pacific/Auckland',
  location TEXT NOT NULL,
  venue_name TEXT,
  city TEXT,
  location_coords GEOGRAPHY(POINT, 4326),
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  price_type TEXT DEFAULT 'free' CHECK (price_type IN ('free', 'paid', 'donation')),
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  currency TEXT DEFAULT 'NZD',
  capacity INTEGER,
  attendees_count INTEGER DEFAULT 0,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  organizer_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  is_hot BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_city ON events(city);

CREATE TRIGGER trigger_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 优惠表
CREATE TABLE specials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount', 'bogo', 'other')),
  discount_value TEXT NOT NULL,
  original_price DECIMAL(10,2),
  discounted_price DECIMAL(10,2),
  currency TEXT DEFAULT 'NZD',
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  terms_and_conditions TEXT,
  image_url TEXT,
  view_count INTEGER DEFAULT 0,
  claim_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_specials_business_id ON specials(business_id);
CREATE INDEX idx_specials_expires_at ON specials(expires_at);

CREATE TRIGGER trigger_specials_updated_at
  BEFORE UPDATE ON specials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

RAISE NOTICE '✅ Events & Specials tables created';

-- =====================================================
-- Phase 6: 创建新表 - 收藏、评论、通知
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Phase 6: Creating new tables - Favorites, Reviews, Notifications...';
  RAISE NOTICE '========================================';
END $$;

-- 收藏表
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

-- 评论表
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

CREATE TRIGGER trigger_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 通知表
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
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

RAISE NOTICE '✅ Favorites, Reviews, Notifications tables created';

-- =====================================================
-- Phase 7: 创建新表 - Chat 系统
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Phase 7: Creating new tables - Chat System...';
  RAISE NOTICE '========================================';
END $$;

-- Chat 会话表
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

CREATE TRIGGER trigger_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Chat 消息表
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

RAISE NOTICE '✅ Chat system tables created';

-- =====================================================
-- Phase 8: 最终验证
-- =====================================================

DO $$
DECLARE
  new_tables_count INTEGER;
  old_tables_count INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SUMMARY';
  RAISE NOTICE '========================================';
  
  SELECT COUNT(*) INTO new_tables_count 
  FROM pg_tables 
  WHERE schemaname = 'public' AND tablename NOT LIKE '%_old';
  
  SELECT COUNT(*) INTO old_tables_count 
  FROM pg_tables 
  WHERE schemaname = 'public' AND tablename LIKE '%_old';
  
  RAISE NOTICE '✅ New database structure created successfully!';
  RAISE NOTICE 'New tables: %', new_tables_count;
  RAISE NOTICE 'Old tables (backup): %', old_tables_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run data migration script';
  RAISE NOTICE '2. Test application';
  RAISE NOTICE '3. Update code to use new structure';
  RAISE NOTICE '========================================';
END $$;

-- 显示所有新表
SELECT tablename, pg_size_pretty(pg_total_relation_size('public.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' AND tablename NOT LIKE '%_old'
ORDER BY tablename;


