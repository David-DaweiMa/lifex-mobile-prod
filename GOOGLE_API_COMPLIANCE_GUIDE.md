# 🔐 Google Places API 合规使用指南

## ⚠️ **重要提醒**

**必须严格遵守 Google Maps Platform 服务条款，否则可能导致：**
- 🔴 API 访问被禁用
- 🔴 账号被封禁
- 🔴 法律诉讼风险

---

## 📋 **Google Places API 数据使用政策**

### **1. 缓存政策（Cache Policy）**

根据 [Google Maps Platform ToS](https://cloud.google.com/maps-platform/terms)：

| 数据类型 | 是否可存储 | 缓存期限 | 说明 |
|---------|----------|---------|-----|
| **Place ID** | ✅ 是 | **永久** | 唯一标识符，可以永久存储 |
| **基本信息** | ⚠️ 限制 | **30 天** | 名称、地址、电话等 |
| **评分/评论** | ⚠️ 限制 | **30 天** | Rating、review_count |
| **营业状态** | ⚠️ 限制 | **24 小时** | opening_hours, is_open |
| **照片** | ❌ 否 | **禁止** | 只能通过 API 动态加载 |
| **评论内容** | ❌ 否 | **禁止** | Reviews 文本内容 |

---

### **2. 照片使用规则**

#### **❌ 禁止的操作：**
```javascript
// ❌ 错误：下载并存储照片
const photoUrl = `https://maps.googleapis.com/.../photo?...`;
const response = await fetch(photoUrl);
const blob = await response.blob();
await supabase.storage.from('photos').upload('business.jpg', blob); // 违规！
```

#### **✅ 正确的做法：**
```javascript
// ✅ 正确：只存储 photo_reference，动态加载
await supabase.from('businesses').insert({
  google_photo_reference: place.photos[0].photo_reference,  // 只存储引用
});

// 前端使用时实时生成 URL
const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?
  maxwidth=400&
  photo_reference=${photo_reference}&
  key=${API_KEY}`;  // 每次访问时动态生成
```

**要求：**
- ✅ 必须显示 "Powered by Google" 标识
- ✅ 不能修改、裁剪或编辑照片
- ✅ 不能缓存照片到本地

---

### **3. 数据归属（Attribution）**

**必须显示 Google 归属标识：**

```jsx
// 移动应用中的归属显示
<View>
  <Image source={{ uri: googlePhotoUrl }} />
  <Text style={{ fontSize: 10, color: 'gray' }}>
    📷 Photo by Google
  </Text>
</View>

// 商家信息页面
<View>
  <Text>评分: {business.google_rating} ⭐</Text>
  <Text style={{ fontSize: 10 }}>
    Data © Google Maps
  </Text>
</View>
```

**要求：**
- ✅ 必须在数据附近显示
- ✅ 必须清晰可见
- ✅ 不能隐藏或移除

---

## ✅ **合规的数据库设计**

### **方案 A: 混合存储（推荐）**

```typescript
// Supabase businesses 表结构
interface Business {
  // ===== 永久存储字段 =====
  id: string;                           // 我们的 ID
  google_place_id: string;              // ✅ Google Place ID（永久）
  
  // ===== 缓存字段（30 天） =====
  cached_name: string | null;           // ⚠️ 缓存的名称
  cached_address: string | null;        // ⚠️ 缓存的地址
  cached_phone: string | null;          // ⚠️ 缓存的电话
  cached_google_rating: number | null;  // ⚠️ 缓存的评分
  cached_google_reviews: number | null; // ⚠️ 缓存的评论数
  
  // ===== 缓存元数据 =====
  cached_at: string;                    // 缓存时间戳
  cache_expires_at: string;             // 过期时间（30 天后）
  
  // ===== 照片引用（不存储实际照片） =====
  google_photo_reference: string | null; // ✅ 照片引用（动态加载）
  
  // ===== 我们自己的数据（永久） =====
  category: string;                     // ✅ 我们的分类
  description: string | null;           // ✅ 商家自己提供
  is_verified: boolean;                 // ✅ 我们的认证
  is_featured: boolean;                 // ✅ 我们的推广标记
  business_owner_id: string | null;     // ✅ 如果商家注册
  owner_uploaded_photos: string[];      // ✅ 商家上传的照片（合法）
  
  // ===== 我们的评分系统（独立） =====
  lifex_rating: number | null;          // ✅ 我们的评分
  lifex_review_count: number;           // ✅ 我们的评论数
  
  // ===== 统计数据 =====
  view_count: number;
  favorite_count: number;
  created_at: string;
  updated_at: string;
}
```

---

### **方案 B: 最小存储（最合规但成本高）**

```typescript
// 只存储 Place ID 和我们的数据
interface BusinessMinimal {
  id: string;
  google_place_id: string;              // ✅ 永久存储
  category: string;                     // ✅ 我们的数据
  is_featured: boolean;                 // ✅ 我们的数据
  business_owner_id: string | null;     // ✅ 我们的数据
  
  // ❌ 不存储任何 Google 数据
  // 每次都从 API 实时获取
}

// 使用时实时获取
async function getBusinessDetails(businessId: string) {
  // 1. 从数据库获取基本信息
  const business = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();
  
  // 2. 从 Google API 实时获取详细信息
  const googleData = await googlePlaces.details({
    place_id: business.google_place_id,
    fields: ['name', 'formatted_address', 'rating', 'photos']
  });
  
  // 3. 合并返回
  return {
    ...business,
    ...googleData,  // 实时数据
  };
}
```

**优点：**
- ✅ 完全合规
- ✅ 数据永远最新
- ✅ 无缓存过期问题

**缺点：**
- ⚠️ 每次访问都调用 API（成本增加）
- ⚠️ 响应速度较慢

---

## 🔄 **数据更新策略**

### **策略 1: 被动更新（推荐）** ⭐⭐⭐⭐⭐

```typescript
// 用户访问时检查并更新
async function getBusinessWithAutoUpdate(businessId: string) {
  // 1. 从数据库获取
  const business = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();
  
  // 2. 检查缓存是否过期
  const cacheExpired = new Date(business.cache_expires_at) < new Date();
  
  if (cacheExpired) {
    // 3. 后台异步更新（不阻塞用户）
    updateBusinessInBackground(business.google_place_id, businessId);
  }
  
  // 4. 立即返回缓存数据（即使过期）
  return business;
}

async function updateBusinessInBackground(placeId: string, businessId: string) {
  try {
    // 从 Google API 获取最新数据
    const freshData = await googlePlaces.details({
      place_id: placeId,
      fields: ['name', 'formatted_address', 'formatted_phone_number', 
               'rating', 'user_ratings_total', 'photos']
    });
    
    // 更新数据库
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 天
    
    await supabase
      .from('businesses')
      .update({
        cached_name: freshData.name,
        cached_address: freshData.formatted_address,
        cached_phone: freshData.formatted_phone_number,
        cached_google_rating: freshData.rating,
        cached_google_reviews: freshData.user_ratings_total,
        google_photo_reference: freshData.photos?.[0]?.photo_reference,
        cached_at: now.toISOString(),
        cache_expires_at: expiresAt.toISOString(),
      })
      .eq('id', businessId);
      
    console.log(`✅ Updated business ${businessId} in background`);
  } catch (error) {
    console.error(`❌ Failed to update business ${businessId}:`, error);
  }
}
```

**优点：**
- ✅ 不阻塞用户体验
- ✅ 按需更新（节省 API 调用）
- ✅ 平滑的资源使用
- ✅ 成本最优

---

### **策略 2: 定期批量更新**

```typescript
// Supabase Edge Function 或 Cron Job

// 每天更新热门商家
export async function updatePopularBusinessesDaily() {
  console.log('🔄 Starting daily update of popular businesses...');
  
  // 获取最热门的 100 家商家
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, google_place_id, view_count')
    .order('view_count', { ascending: false })
    .limit(100);
  
  if (!businesses) return;
  
  let updated = 0;
  let failed = 0;
  
  for (const business of businesses) {
    try {
      await updateBusinessData(business.id, business.google_place_id);
      updated++;
      
      // 限速：每秒最多 10 个请求
      await sleep(100);
    } catch (error) {
      console.error(`Failed to update ${business.id}:`, error);
      failed++;
    }
  }
  
  console.log(`✅ Daily update complete: ${updated} updated, ${failed} failed`);
}

// 每周更新所有过期商家
export async function updateExpiredBusinessesWeekly() {
  console.log('🔄 Starting weekly update of expired businesses...');
  
  // 获取所有缓存过期的商家
  const now = new Date().toISOString();
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, google_place_id')
    .lt('cache_expires_at', now);
  
  if (!businesses) return;
  
  // 分批处理（每批 50 个）
  const batchSize = 50;
  for (let i = 0; i < businesses.length; i += batchSize) {
    const batch = businesses.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(b => updateBusinessData(b.id, b.google_place_id))
    );
    
    console.log(`Processed batch ${i / batchSize + 1}/${Math.ceil(businesses.length / batchSize)}`);
    
    // 批次间延迟 1 秒
    await sleep(1000);
  }
  
  console.log(`✅ Weekly update complete: ${businesses.length} businesses updated`);
}

// 辅助函数：延迟
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**调度配置（Supabase Cron Jobs）：**
```sql
-- 每天凌晨 2 点更新热门商家
select cron.schedule(
  'update-popular-businesses-daily',
  '0 2 * * *',  -- 凌晨 2 点
  $$
  select net.http_post(
      url:='https://your-project.supabase.co/functions/v1/update-popular-businesses',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_KEY"}'::jsonb
  );
  $$
);

-- 每周日凌晨 3 点更新所有过期商家
select cron.schedule(
  'update-expired-businesses-weekly',
  '0 3 * * 0',  -- 每周日凌晨 3 点
  $$
  select net.http_post(
      url:='https://your-project.supabase.co/functions/v1/update-expired-businesses',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_KEY"}'::jsonb
  );
  $$
);
```

**成本估算：**
```
每日更新 100 家商家：
100 × $0.017 = $1.7/天

每周更新 5,000 家商家（假设都过期）：
5,000 × $0.017 = $85/周 = $340/月

但如果使用被动更新策略，实际更新的商家会少得多：
预计 500-1,000 家/月 × $0.017 = $8.5-17/月

在 $200/月 免费额度内！✅
```

---

## 📊 **更新频率建议**

| 数据类型 | 变化频率 | 推荐更新频率 | 策略 |
|---------|---------|------------|-----|
| **名称** | 很少 | 30 天 | 被动更新 |
| **地址** | 很少 | 30 天 | 被动更新 |
| **电话** | 偶尔 | 30 天 | 被动更新 |
| **评分** | 经常 | **7-14 天** | 主动更新（热门商家） |
| **评论数** | 经常 | **7-14 天** | 主动更新（热门商家） |
| **营业时间** | 偶尔 | 30 天 | 被动更新 |
| **照片** | 偶尔 | 实时加载 | 不缓存，动态生成 URL |

---

## 🚨 **违规示例和后果**

### **❌ 违规行为：**

1. **下载并永久存储照片**
```javascript
// ❌ 违规！
const photos = await downloadAllPhotos(place.photos);
await saveToLocalStorage(photos);
```

2. **创建独立数据库（不更新）**
```javascript
// ❌ 违规！采集一次后永久使用
const businesses = await scrapeAllBusinesses();
await saveForever(businesses); // 永远不更新
```

3. **转售数据**
```javascript
// ❌ 违规！
const data = await getGooglePlacesData();
await sellToThirdParty(data); // 出售数据
```

4. **移除归属标识**
```jsx
// ❌ 违规！
<Image source={{ uri: googlePhoto }} />
{/* 没有显示 "Powered by Google" */}
```

### **⚠️ 可能的后果：**

1. **警告邮件** - Google 发现违规
2. **API 访问限制** - 降低配额或限速
3. **账号暂停** - 临时禁用 API 访问
4. **账号封禁** - 永久禁用
5. **法律诉讼** - 严重违规可能面临诉讼

---

## ✅ **合规检查清单**

在发布前，确保你的应用符合以下要求：

### **数据存储：**
- [ ] ✅ 只存储 Place ID（永久）
- [ ] ✅ 基本信息缓存不超过 30 天
- [ ] ✅ 照片不存储，只存储 photo_reference
- [ ] ✅ 实现缓存过期检查机制
- [ ] ✅ 定期更新过期缓存

### **照片使用：**
- [ ] ✅ 照片通过 API 动态加载
- [ ] ✅ 不下载或缓存照片文件
- [ ] ✅ 显示 "Photo by Google" 或类似归属

### **数据归属：**
- [ ] ✅ 显示 "Powered by Google" 或 Google logo
- [ ] ✅ 归属标识清晰可见
- [ ] ✅ 不隐藏或移除归属信息

### **数据使用：**
- [ ] ✅ 只用于自己的应用
- [ ] ✅ 不转售或分享给第三方
- [ ] ✅ 不创建竞争产品

### **更新机制：**
- [ ] ✅ 实现自动更新机制
- [ ] ✅ 检查缓存过期时间
- [ ] ✅ 定期刷新热门数据

---

## 💡 **最佳实践建议**

### **1. 数据层次化**

```typescript
// 区分数据来源
interface BusinessData {
  // Google 数据（缓存，需更新）
  google: {
    place_id: string;           // 永久
    cached_name: string;         // 30 天
    cached_rating: number;       // 30 天
    cached_at: string;
  };
  
  // 我们的数据（永久）
  lifex: {
    category: string;
    is_verified: boolean;
    lifex_rating: number;
    view_count: number;
  };
  
  // 商家数据（永久）
  owner: {
    description: string;
    uploaded_photos: string[];
    contact_email: string;
  };
}
```

### **2. 优先使用自己的数据**

```typescript
// 优先显示商家提供的内容
function getBusinessDescription(business: Business) {
  // 1. 商家自己的描述
  if (business.owner_description) {
    return business.owner_description;
  }
  
  // 2. 我们生成的描述
  if (business.lifex_description) {
    return business.lifex_description;
  }
  
  // 3. 最后才使用 Google 描述（如果有）
  if (business.cached_google_description) {
    return business.cached_google_description + '\n\nData © Google';
  }
  
  return null;
}

// 优先显示商家上传的照片
function getBusinessPhotos(business: Business) {
  const photos = [];
  
  // 1. 商家上传的照片（优先，无版权问题）
  if (business.owner_uploaded_photos?.length) {
    photos.push(...business.owner_uploaded_photos);
  }
  
  // 2. Google 照片（动态加载，需归属）
  if (business.google_photo_reference && photos.length < 5) {
    photos.push({
      url: generateGooglePhotoUrl(business.google_photo_reference),
      attribution: 'Photo by Google',
      source: 'google'
    });
  }
  
  // 3. 默认占位图
  if (photos.length === 0) {
    photos.push({
      url: getDefaultPhotoForCategory(business.category),
      attribution: 'Photo from Unsplash',
      source: 'unsplash'
    });
  }
  
  return photos;
}
```

### **3. 建立双评分系统**

```typescript
// 同时显示 Google 评分和我们的评分
interface BusinessRatings {
  google: {
    rating: number;           // Google 评分
    review_count: number;     // Google 评论数
    source: 'Google Maps';
  };
  lifex: {
    rating: number;           // 我们的评分
    review_count: number;     // 我们的评论数
    source: 'LifeX Users';
  };
}

// UI 显示
<View>
  <Text>Google: {business.google_rating} ⭐ ({business.google_reviews} reviews)</Text>
  <Text style={{ fontSize: 10 }}>via Google Maps</Text>
  
  <Text>LifeX: {business.lifex_rating} ⭐ ({business.lifex_reviews} reviews)</Text>
  <Text style={{ fontSize: 10 }}>from our community</Text>
</View>
```

**好处：**
- ✅ 更全面的评价
- ✅ 鼓励用户在我们平台评论
- ✅ 减少对 Google 数据的依赖
- ✅ 建立自己的社区

---

## 📝 **总结**

### **✅ 必须做：**
1. ✅ Place ID 可以永久存储
2. ✅ 基本信息缓存不超过 30 天
3. ✅ 照片只存储引用，动态加载
4. ✅ 显示 Google 归属标识
5. ✅ 实现缓存更新机制

### **❌ 禁止做：**
1. ❌ 下载并存储照片文件
2. ❌ 永久缓存 Google 数据
3. ❌ 移除归属标识
4. ❌ 转售或分享数据
5. ❌ 超过缓存时间限制

### **💡 推荐策略：**
1. 使用**被动更新**（按需更新）
2. 定期更新**热门商家**（每日/每周）
3. 建立**自己的评分和评论系统**
4. 鼓励**商家自己上传内容**
5. 逐步**减少对 Google 数据的依赖**

---

**遵守规则 = 长期可持续 = 用户信任 = 业务成功！** ✅🎉

