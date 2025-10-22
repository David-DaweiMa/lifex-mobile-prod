# 🏗️ LifeX 数据库架构全面审查与重构

> Guiding Principle（Lifex Manifesto）
> 我们的核心价值是利用 AI 的能力深入理解每个 business 和每个用户，并据此做最合适的匹配。所有可以合法获取的数据都用于帮助 AI 持续加深理解；随着时间与数据增长，这份理解会不断进化。唯有基于这种理解，我们才能提供让客户满意的一切服务（chat、推荐、AI 助手）以及后续的优惠券、订座、订餐、服务预定、票务购买等下游交易。

**更新时间：** 2024-10-17

---

## 📋 目录
1. [当前状态分析](#当前状态分析)
2. [应用功能需求](#应用功能需求)
3. [理想数据库架构](#理想数据库架构)
4. [表结构详细设计](#表结构详细设计)
5. [表关系图](#表关系图)
6. [迁移计划](#迁移计划)
7. [实施步骤](#实施步骤)

---

## 📊 当前状态分析

### **当前已知的表：**

```
✅ 已存在（从代码中看到）：
├─ user_profiles          // 用户资料
├─ user_quotas            // 用户配额
├─ businesses             // 商家信息
├─ events                 // 活动信息
├─ specials               // 优惠信息
├─ trending_posts         // 热门帖子
├─ chat_messages          // 聊天消息
├─ advertisements         // 广告
├─ assistant_usage        // AI 助手使用记录
└─ anonymous_usage        // 匿名用户使用记录

⚠️ 可能需要但不确定是否存在：
├─ favorites              // 收藏
├─ reviews                // 评论
├─ bookings               // 预订
├─ business_categories    // 商家分类
├─ user_preferences       // 用户偏好
└─ notifications          // 通知
```

---

## 🎯 应用功能需求分析

### **核心功能模块：**

```
1. 用户系统 👤
   ├─ 注册/登录
   ├─ 个人资料
   ├─ 订阅管理（Free/Essential/Premium）
   ├─ 使用配额
   └─ 偏好设置

2. 商家系统 🏪
   ├─ 商家信息展示
   ├─ 商家分类/筛选
   ├─ 商家搜索
   ├─ 商家认证
   ├─ 商家后台管理（未来）
   └─ Google Places 集成

3. 活动系统 🎉
   ├─ 活动列表
   ├─ 活动详情
   ├─ 活动分类
   ├─ 活动搜索
   └─ 活动关联商家

4. 优惠系统 🏷️
   ├─ 优惠列表
   ├─ 优惠详情
   ├─ 优惠分类
   ├─ 优惠领取
   └─ 优惠关联商家

5. 收藏系统 ❤️
   ├─ 收藏商家
   ├─ 收藏活动
   ├─ 收藏优惠
   └─ 收藏管理

6. AI Chat 系统 🤖
   ├─ 对话历史
   ├─ 推荐记录
   ├─ 会话管理
   └─ RAG 数据检索

7. 评论系统 ⭐
   ├─ 用户评论
   ├─ 评分
   ├─ 评论回复
   └─ 评论点赞

8. 通知系统 🔔
   ├─ 系统通知
   ├─ 活动提醒
   ├─ 优惠推送
   └─ 订阅通知
```

---

## 🏛️ 理想数据库架构

### **核心设计原则：**

```
✅ 清晰的表结构
✅ 明确的表关系
✅ 避免数据冗余
✅ 性能优化
✅ 易于扩展
✅ 符合规范
```

### **推荐的表结构（完整版）：**

```
🔵 核心表（必须）
═══════════════════════════════════════════════════════════

1. 用户相关（3 表）
   ├─ user_profiles           // 用户资料
   ├─ user_subscriptions      // 订阅管理（新）
   └─ user_preferences        // 用户偏好（新）

2. 商家相关（3 表）
   ├─ businesses              // 商家主表
   ├─ business_categories     // 商家分类（新）
   └─ business_photos         // 商家照片（新，可选）

3. 活动相关（1 表）
   └─ events                  // 活动表

4. 优惠相关（1 表）
   └─ specials                // 优惠表

5. 收藏相关（1 表）
   └─ favorites               // 统一收藏表（新）

6. AI Chat 相关（2 表）
   ├─ chat_sessions           // 会话管理（新）
   └─ chat_messages           // 消息记录

7. 评论相关（2 表）
   ├─ reviews                 // 评论主表（新）
   └─ review_replies          // 评论回复（新，可选）

8. 通知相关（1 表）
   └─ notifications           // 通知表（新）

═══════════════════════════════════════════════════════════
总计：15-17 个核心表

🟡 辅助表（可选/后期）
═══════════════════════════════════════════════════════════

9. 预订相关（可选）
   └─ bookings                // 预订表

10. 热门内容（保留）
    └─ trending_posts         // 热门帖子

11. 广告系统（保留）
    └─ advertisements         // 广告

12. 统计分析（后期）
    ├─ user_activity_logs     // 用户行为日志
    └─ business_analytics     // 商家统计
```

---

## 📐 表结构详细设计

### **1. 👤 用户系统**

#### **1.1 user_profiles（用户资料）**

```sql
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
  location GEOGRAPHY(POINT, 4326),
  
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
CREATE INDEX idx_user_profiles_location ON user_profiles USING GIST(location);
```

#### **1.2 user_subscriptions（订阅管理）🆕**

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- 订阅信息
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'essential', 'premium')),
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'trial')),
  
  -- 时间管理
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- 支付信息（可选）
  payment_method TEXT,
  payment_id TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'NZD',
  
  -- 配额（从 plan_type 自动设置）
  chat_quota INTEGER DEFAULT 10,
  chat_used INTEGER DEFAULT 0,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 约束
  UNIQUE(user_id, started_at)
);

-- 索引
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);
```

#### **1.3 user_preferences（用户偏好）🆕**

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- 偏好设置
  preferred_categories TEXT[],
  preferred_cuisines TEXT[],
  dietary_restrictions TEXT[],
  price_preference TEXT CHECK (price_preference IN ('budget', 'moderate', 'upscale', 'luxury')),
  
  -- 搜索偏好
  default_search_radius INTEGER DEFAULT 5000, -- 米
  preferred_cities TEXT[],
  
  -- 通知偏好
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  
  -- AI 偏好
  ai_language TEXT DEFAULT 'en',
  ai_personality TEXT DEFAULT 'friendly',
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

---

### **2. 🏪 商家系统**

#### **2.1 business_categories（商家分类）🆕**

```sql
CREATE TABLE business_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES business_categories(id) ON DELETE SET NULL,
  
  -- 显示设置
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_business_categories_slug ON business_categories(slug);
CREATE INDEX idx_business_categories_parent_id ON business_categories(parent_id);
CREATE INDEX idx_business_categories_display_order ON business_categories(display_order);

-- 示例数据
INSERT INTO business_categories (name, slug, description, display_order) VALUES
  ('Food & Dining', 'food-dining', 'Restaurants, cafes, and food services', 1),
  ('Beauty & Wellness', 'beauty-wellness', 'Salons, spas, and wellness centers', 2),
  ('Entertainment', 'entertainment', 'Fun activities and entertainment venues', 3),
  ('Health & Medical', 'health-medical', 'Healthcare and medical services', 4),
  ('Shopping & Retail', 'shopping-retail', 'Stores and shopping centers', 5);
```

#### **2.2 businesses（商家主表 - 优化版）**

```sql
CREATE TABLE businesses (
  -- 基本信息
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  
  -- 分类
  category_id UUID REFERENCES business_categories(id) ON DELETE SET NULL,
  subcategories TEXT[], -- 保留向后兼容
  tags TEXT[],
  
  -- 地址和位置
  address JSONB,
  city TEXT,
  country TEXT DEFAULT 'New Zealand',
  postcode TEXT,
  location GEOGRAPHY(POINT, 4326),
  
  -- 联系方式
  contact_info JSONB, -- {phone, email, website, social}
  
  -- 营业时间
  business_hours JSONB,
  
  -- 商家所有者
  owner_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  -- 媒体
  logo_url TEXT,
  cover_image_url TEXT,
  owner_uploaded_photos TEXT[],
  
  -- Google Places 集成
  google_place_id TEXT UNIQUE,
  google_photo_reference TEXT,
  
  -- 缓存的 Google 数据（30 天）
  cached_name TEXT,
  cached_address TEXT,
  cached_phone TEXT,
  cached_google_rating DECIMAL(2,1),
  cached_google_reviews INTEGER,
  cached_at TIMESTAMPTZ,
  cache_expires_at TIMESTAMPTZ,
  
  -- LifeX 自有评分
  lifex_rating DECIMAL(2,1),
  lifex_review_count INTEGER DEFAULT 0,
  
  -- 显示评分（自动计算）
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
  booking_count INTEGER DEFAULT 0,
  
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
CREATE INDEX idx_businesses_google_place_id ON businesses(google_place_id);
CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX idx_businesses_priority_score ON businesses(priority_score DESC);
CREATE INDEX idx_businesses_display_rating ON businesses(display_rating DESC);
CREATE INDEX idx_businesses_is_active_city_category ON businesses(is_active, city, category_id) WHERE is_active = TRUE;
```

---

### **3. 🎉 活动系统**

#### **3.1 events（活动表 - 优化版）**

```sql
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
  tags TEXT[],
  
  -- 票价和人数
  price_type TEXT CHECK (price_type IN ('free', 'paid', 'donation')),
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  currency TEXT DEFAULT 'NZD',
  capacity INTEGER,
  attendees_count INTEGER DEFAULT 0,
  
  -- 媒体
  image_url TEXT,
  images TEXT[],
  
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
CREATE INDEX idx_events_business_id ON events(business_id);
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_location_coords ON events USING GIST(location_coords);
CREATE INDEX idx_events_is_active_date ON events(is_active, date) WHERE is_active = TRUE;
```

---

### **4. 🏷️ 优惠系统**

#### **4.1 specials（优惠表 - 优化版）**

```sql
CREATE TABLE specials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 关联商家（必须）
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- 基本信息
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  
  -- 分类
  category TEXT NOT NULL,
  tags TEXT[],
  
  -- 折扣信息
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount', 'bogo', 'other')),
  discount_value TEXT NOT NULL,
  original_price DECIMAL(10,2),
  discounted_price DECIMAL(10,2),
  currency TEXT DEFAULT 'NZD',
  
  -- 有效期
  starts_at TIMESTAMPTZ,
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
CREATE INDEX idx_specials_expires_at ON specials(expires_at);
CREATE INDEX idx_specials_is_active_expires ON specials(is_active, expires_at) WHERE is_active = TRUE;
```

---

### **5. ❤️ 收藏系统**

#### **5.1 favorites（统一收藏表）🆕**

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 用户
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- 收藏对象（多态关联）
  favoritable_type TEXT NOT NULL CHECK (favoritable_type IN ('business', 'event', 'special')),
  favoritable_id UUID NOT NULL,
  
  -- 分组（可选）
  folder_name TEXT,
  notes TEXT,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 唯一约束
  UNIQUE(user_id, favoritable_type, favoritable_id)
);

-- 索引
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_favoritable ON favorites(favoritable_type, favoritable_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);
```

---

### **6. 🤖 AI Chat 系统**

#### **6.1 chat_sessions（会话管理）🆕**

```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 用户
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- 会话信息
  title TEXT,
  summary TEXT,
  
  -- 统计
  message_count INTEGER DEFAULT 0,
  
  -- 状态
  is_active BOOLEAN DEFAULT TRUE,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ
);

-- 索引
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_last_message_at ON chat_sessions(last_message_at DESC);
```

#### **6.2 chat_messages（消息记录 - 优化版）**

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 关联
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  -- 消息内容
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- AI 元数据
  model TEXT,
  tokens_used INTEGER,
  metadata JSONB,
  
  -- 推荐（如果有）
  recommendations JSONB, -- 推荐的商家/活动ID列表
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
```

---

### **7. ⭐ 评论系统**

#### **7.1 reviews（评论主表）🆕**

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 用户
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- 评论对象（多态）
  reviewable_type TEXT NOT NULL CHECK (reviewable_type IN ('business', 'event')),
  reviewable_id UUID NOT NULL,
  
  -- 评分和内容
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  
  -- 详细评分（可选）
  ratings JSONB, -- {food: 5, service: 4, ambiance: 5, value: 4}
  
  -- 媒体
  photos TEXT[],
  
  -- 互动
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  
  -- 状态
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 唯一约束（一个用户对同一对象只能评论一次）
  UNIQUE(user_id, reviewable_type, reviewable_id)
);

-- 索引
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_reviewable ON reviews(reviewable_type, reviewable_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_is_active_approved ON reviews(is_active, moderation_status) WHERE is_active = TRUE AND moderation_status = 'approved';
```

---

### **8. 🔔 通知系统**

#### **8.1 notifications（通知表）🆕**

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 用户
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- 通知内容
  type TEXT NOT NULL CHECK (type IN ('system', 'event', 'special', 'review', 'booking', 'subscription')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- 关联对象（可选）
  related_type TEXT,
  related_id UUID,
  
  -- 操作链接
  action_url TEXT,
  
  -- 状态
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- 索引
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
```

---

## 🔗 表关系图

```
┌──────────────────┐
│  user_profiles   │◀──────┐
└────────┬─────────┘       │
         │                 │
    ┌────┴────┬────────────┼─────────────┐
    │         │            │             │
    ▼         ▼            │             ▼
┌─────────┐ ┌────────────┐│      ┌──────────────┐
│subscri- │ │preferences ││      │  favorites   │
│ptions   │ │            ││      │              │
└─────────┘ └────────────┘│      └──────┬───────┘
                           │             │
┌──────────────────────────┼─────────────┤
│                          │             │
▼                          ▼             ▼
┌──────────────┐     ┌──────────┐  ┌─────────┐
│  businesses  │────▶│  events  │  │specials │
└──────┬───────┘     └────┬─────┘  └────┬────┘
       │                  │             │
       │◀─────────────────┴─────────────┘
       │
       ▼
┌──────────────┐
│  reviews     │
└──────────────┘

┌──────────────┐
│chat_sessions │◀───┐
└──────┬───────┘    │
       │            │
       ▼            │
┌──────────────┐    │
│chat_messages │────┘
└──────────────┘

┌──────────────┐
│notifications │
└──────────────┘

┌────────────────┐
│business_       │
│categories      │
└────────┬───────┘
         │
         ▼
    businesses
```

---

## 📋 迁移计划

### **阶段 0: 准备工作（必须）**

```sql
-- 1. 完整备份所有表
CREATE SCHEMA backup_20241017;

-- 备份每个表
CREATE TABLE backup_20241017.user_profiles AS SELECT * FROM user_profiles;
CREATE TABLE backup_20241017.businesses AS SELECT * FROM businesses;
CREATE TABLE backup_20241017.events AS SELECT * FROM events;
CREATE TABLE backup_20241017.specials AS SELECT * FROM specials;
CREATE TABLE backup_20241017.chat_messages AS SELECT * FROM chat_messages;
-- ... 备份所有表

-- 2. 记录当前状态
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### **阶段 1: 创建新表（不影响现有数据）**

```
优先级：⭐⭐⭐⭐⭐

创建以下新表：
✅ business_categories
✅ user_subscriptions
✅ user_preferences
✅ favorites
✅ chat_sessions
✅ reviews
✅ notifications

不影响现有功能
可以并行开发
```

### **阶段 2: 迁移现有表（谨慎）**

```
优先级：⭐⭐⭐⭐

对现有表进行优化：
⚠️ businesses - 添加新字段
⚠️ events - 添加新字段
⚠️ specials - 添加新字段
⚠️ chat_messages - 关联到 sessions

需要测试
需要验证数据完整性
```

### **阶段 3: 数据迁移**

```
优先级：⭐⭐⭐

迁移数据到新结构：
📊 user_quotas → user_subscriptions
📊 现有favorites数据 → favorites表
📊 chat_messages → 关联到 chat_sessions
```

### **阶段 4: 清理（后期）**

```
优先级：⭐⭐

删除过时的表/字段：
🗑️ user_quotas（迁移后）
🗑️ assistant_usage（可选）
🗑️ anonymous_usage（可选）
```

---

## 🚀 实施步骤（详细）

### **Step 1: 全面评估（1 天）**

- [ ] 运行数据库当前状态查询
- [ ] 导出所有表结构
- [ ] 记录所有数据量
- [ ] 确认所有外键关系
- [ ] 识别问题和冲突

### **Step 2: 创建备份（必须）**

- [ ] 创建backup schema
- [ ] 备份所有表
- [ ] 验证备份完整性
- [ ] 记录备份时间和大小

### **Step 3: 创建分类表（1 小时）**

- [ ] 创建 business_categories 表
- [ ] 插入初始分类数据
- [ ] 测试查询

### **Step 4: 创建用户相关新表（2 小时）**

- [ ] 创建 user_subscriptions
- [ ] 创建 user_preferences
- [ ] 从 user_quotas 迁移数据
- [ ] 测试查询

### **Step 5: 创建收藏表（1 小时）**

- [ ] 创建 favorites 表
- [ ] 迁移现有收藏数据（如果有）
- [ ] 更新应用代码

### **Step 6: 创建 Chat 会话表（1 小时）**

- [ ] 创建 chat_sessions
- [ ] 从现有 chat_messages 生成 sessions
- [ ] 关联消息到会话

### **Step 7: 创建评论表（1 小时）**

- [ ] 创建 reviews 表
- [ ] 测试插入和查询

### **Step 8: 创建通知表（1 小时）**

- [ ] 创建 notifications 表
- [ ] 测试插入和查询

### **Step 9: 优化 businesses 表（2-3 小时）**

- [ ] 添加新字段
- [ ] 迁移数据
- [ ] 重新计算 priority_score
- [ ] 测试所有查询

### **Step 10: 优化其他表（1-2 小时）**

- [ ] 优化 events 表
- [ ] 优化 specials 表
- [ ] 测试功能

### **Step 11: 全面测试（1-2 天）**

- [ ] 测试所有应用功能
- [ ] 验证数据完整性
- [ ] 性能测试
- [ ] 修复问题

### **Step 12: 文档更新（1 天）**

- [ ] 更新 TypeScript 类型定义
- [ ] 更新服务层代码
- [ ] 更新 API 文档
- [ ] 创建数据库文档

---

## ⏱️ 时间估算

```
总时间：5-7 天

详细分解：
├─ 准备和评估：1 天
├─ 创建新表：1 天
├─ 数据迁移：1-2 天
├─ 测试和修复：1-2 天
└─ 文档更新：1 天

建议分阶段进行，不要一次性完成
```

---

## ✅ 成功标准

```
✅ 所有数据保留，无丢失
✅ 所有功能正常工作
✅ 性能无明显下降
✅ 表关系清晰明确
✅ 符合最佳实践
✅ 易于维护和扩展
✅ 文档完整更新
```

---

**准备好开始了吗？** 🚀

**下一步：运行数据库状态评估查询！** 📊

---

## Coly 个人助手（新增）

### 新增数据域与表（提案）
- deals（餐饮/美容/娱乐优惠）
- first_table_slots（First Table 可订时段）
- supermarket_stores / supermarket_skus / supermarket_prices（超市门店、SKU与价格）
- user_watchlist（关注与阈值）
- reminders（到期/事项）

### 数据流与频率
- 周更：超市促销、菜单/价目、通用优惠
- 日更：First Table 名额、新店/热点
- Cron + 队列；失败回退；来源与更新时间留存

### 维护与合规
- 仅公开页；遵守 robots；限速与退避
- 追加写+软过期；索引按查询热点（valid_to/日期/门店/SKU）设计

