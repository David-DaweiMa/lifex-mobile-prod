# 🎯 重点商家筛选标准

**更新时间：** 2024-10-17

---

## 📋 **核心原则**

在前期采集 5,000 家商家时，我们要**精挑细选**，确保每一家商家都是高质量的，能为用户提供最大价值。

**关键目标：**
- ✅ 高质量数据
- ✅ 详细信息可获取
- ✅ 可持续更新
- ✅ 用户体验最佳

---

## ⭐ **必须满足的条件（硬性要求）**

### **1. 必须有官方网址（Website）** 🌐 ⭐⭐⭐⭐⭐

**为什么这是最重要的？**
```
有网址 = 可以获取更多详细信息！

✅ 菜单（餐厅）
✅ 价格表（美容院、理发店）
✅ 服务项目（游乐场、健身房）
✅ 在线预订链接
✅ 最新活动信息
✅ 高质量图片
✅ 详细介绍
```

**如何验证：**
```javascript
// Google Places API 会返回网址
const business = {
  name: "Best Cafe",
  website: "https://bestcafe.co.nz",  // ✅ 必须有
  // ...
};

// 如果没有网址，跳过这个商家
if (!business.website || business.website === '') {
  console.log('❌ Skip: No website');
  return;
}
```

**网址的额外价值：**
- 🎯 可以 Web Scraping 获取菜单、价格
- 🎯 可以定期检查更新
- 🎯 可以验证商家真实性
- 🎯 用户可以直接访问获取更多信息

---

### **2. 必须有 Google Rating ≥ 4.0** ⭐⭐⭐⭐

**为什么？**
- ✅ 确保商家质量
- ✅ 用户满意度高
- ✅ 减少投诉和差评

```javascript
if (business.rating < 4.0) {
  console.log('❌ Skip: Low rating');
  return;
}
```

---

### **3. 必须有至少 50+ 条评论** ⭐⭐⭐⭐

**为什么？**
- ✅ 评分更可靠
- ✅ 商家有一定知名度
- ✅ 有足够的用户反馈

```javascript
if (business.user_ratings_total < 50) {
  console.log('❌ Skip: Too few reviews');
  return;
}
```

---

### **4. 必须有清晰的类别和地址** ⭐⭐⭐

**为什么？**
- ✅ 用户可以找到
- ✅ 可以正确分类
- ✅ 地图定位准确

```javascript
if (!business.formatted_address || !business.types || business.types.length === 0) {
  console.log('❌ Skip: Incomplete info');
  return;
}
```

---

## 🎯 **优先选择的条件（加分项）**

### **1. 有照片（Google Photos）** ⭐⭐⭐

```javascript
if (business.photos && business.photos.length >= 5) {
  priorityScore += 10;
}
```

---

### **2. 有营业时间** ⭐⭐⭐

```javascript
if (business.opening_hours && business.opening_hours.weekday_text) {
  priorityScore += 10;
}
```

---

### **3. 有电话号码** ⭐⭐

```javascript
if (business.formatted_phone_number) {
  priorityScore += 5;
}
```

---

### **4. 最近更新过（活跃商家）** ⭐⭐

```javascript
// Google Places 会显示最近的评论时间
const recentReviews = business.reviews?.filter(r => 
  new Date(r.time * 1000) > Date.now() - 90 * 24 * 60 * 60 * 1000
);

if (recentReviews && recentReviews.length > 0) {
  priorityScore += 5;
}
```

---

### **5. 有价格等级信息** ⭐

```javascript
if (business.price_level) {
  priorityScore += 3;
}
```

---

## 🏙️ **城市和地区分布**

### **目标：5,000 家商家**

| 城市 | 人口 | 商家配额 | 优先级 |
|-----|------|---------|--------|
| Auckland | 1,700,000 | 2,000 | ⭐⭐⭐⭐⭐ |
| Wellington | 420,000 | 1,000 | ⭐⭐⭐⭐ |
| Christchurch | 380,000 | 800 | ⭐⭐⭐⭐ |
| Hamilton | 180,000 | 600 | ⭐⭐⭐ |
| Tauranga | 160,000 | 600 | ⭐⭐⭐ |

---

## 🍴 **行业分布**

### **重点行业（必须覆盖）**

| 行业 | 商家数 | 为什么重要 |
|-----|--------|-----------|
| **Restaurants & Cafes** | 1,500 | 高频消费，用户需求大 |
| **Beauty & Hair Salons** | 800 | 预约需求强，回头客多 |
| **Bars & Nightlife** | 500 | 社交需求，周末高峰 |
| **Entertainment & Gyms** | 600 | 活动丰富，家庭需求 |
| **Health & Medical** | 400 | 刚需，信任度要求高 |
| **Shopping & Retail** | 600 | 促销多，潜力大 |
| **Professional Services** | 600 | B2B + B2C，稳定收入 |

**总计：5,000 家**

---

## 🔍 **筛选优先级算法**

```javascript
function calculatePriorityScore(business) {
  let score = 0;
  
  // =============== 必须条件（不满足直接跳过）===============
  if (!business.website) return -1;  // ❌ 没网址，直接跳过
  if (business.rating < 4.0) return -1;  // ❌ 评分太低
  if (business.user_ratings_total < 50) return -1;  // ❌ 评论太少
  
  // =============== 基础评分 ===============
  score += business.rating * 20;  // 4.0 = 80, 5.0 = 100
  
  // =============== 评论数评分 ===============
  if (business.user_ratings_total >= 500) score += 30;
  else if (business.user_ratings_total >= 200) score += 20;
  else if (business.user_ratings_total >= 100) score += 10;
  else score += 5;
  
  // =============== 网址质量评分（新增）===============
  if (business.website) {
    score += 15;  // 有网址
    
    // 检查是否是专业域名（非社交媒体）
    const isProDomain = !business.website.includes('facebook.com') &&
                        !business.website.includes('instagram.com');
    if (isProDomain) score += 10;
  }
  
  // =============== 照片评分 ===============
  if (business.photos && business.photos.length >= 10) score += 15;
  else if (business.photos && business.photos.length >= 5) score += 10;
  
  // =============== 营业时间评分 ===============
  if (business.opening_hours) score += 10;
  
  // =============== 联系方式评分 ===============
  if (business.formatted_phone_number) score += 5;
  
  // =============== 价格信息评分 ===============
  if (business.price_level) score += 3;
  
  // =============== 活跃度评分 ===============
  const hasRecentReviews = business.reviews?.some(r => 
    new Date(r.time * 1000) > Date.now() - 90 * 24 * 60 * 60 * 1000
  );
  if (hasRecentReviews) score += 10;
  
  return score;
}

// 使用示例
const businesses = await fetchBusinesses(city, category);
const qualifiedBusinesses = businesses
  .map(b => ({ ...b, priorityScore: calculatePriorityScore(b) }))
  .filter(b => b.priorityScore > 0)  // 排除不合格的
  .sort((a, b) => b.priorityScore - a.priorityScore)  // 按分数排序
  .slice(0, targetCount);  // 取前 N 个
```

---

## 📝 **完整筛选流程**

```javascript
async function selectPriorityBusinesses(city, category, targetCount) {
  console.log(`🔍 Searching ${category} in ${city}...`);
  
  // 1. 从 Google Places API 获取商家
  const allBusinesses = await googlePlaces.textSearch({
    query: `${category} in ${city}, New Zealand`,
    type: getCategoryType(category),
  });
  
  console.log(`📊 Found ${allBusinesses.length} businesses`);
  
  // 2. 筛选和评分
  const qualified = [];
  
  for (const business of allBusinesses) {
    // 必须有网址
    if (!business.website || business.website === '') {
      console.log(`❌ Skip: ${business.name} - No website`);
      continue;
    }
    
    // 必须评分 >= 4.0
    if (!business.rating || business.rating < 4.0) {
      console.log(`❌ Skip: ${business.name} - Low rating (${business.rating})`);
      continue;
    }
    
    // 必须有至少 50 条评论
    if (!business.user_ratings_total || business.user_ratings_total < 50) {
      console.log(`❌ Skip: ${business.name} - Too few reviews (${business.user_ratings_total})`);
      continue;
    }
    
    // 计算优先级分数
    const priorityScore = calculatePriorityScore(business);
    
    qualified.push({
      ...business,
      priorityScore,
    });
    
    console.log(`✅ Qualified: ${business.name} - Score: ${priorityScore}`);
  }
  
  console.log(`✅ ${qualified.length} businesses qualified`);
  
  // 3. 按优先级排序
  qualified.sort((a, b) => b.priorityScore - a.priorityScore);
  
  // 4. 选择前 N 个
  const selected = qualified.slice(0, targetCount);
  
  console.log(`🎯 Selected top ${selected.length} businesses`);
  
  // 5. 获取详细信息（包括从网址抓取数据）
  for (const business of selected) {
    // 获取 Google Place Details
    const details = await googlePlaces.placeDetails({
      place_id: business.place_id,
    });
    
    // 从网址抓取额外信息
    try {
      const webData = await scrapeWebsite(business.website);
      business.menuItems = webData.menu;
      business.priceList = webData.prices;
      business.services = webData.services;
      console.log(`🌐 Scraped ${business.name}: ${webData.menu?.length || 0} menu items`);
    } catch (error) {
      console.log(`⚠️ Could not scrape ${business.name}: ${error.message}`);
    }
  }
  
  return selected;
}
```

---

## 🌐 **网址数据抓取策略**

### **可以从网址获取的信息：**

#### **1. 餐厅（Restaurants & Cafes）**
```javascript
async function scrapeRestaurantWebsite(url) {
  const page = await browser.newPage();
  await page.goto(url);
  
  return {
    menu: extractMenu(page),           // 菜单
    prices: extractPrices(page),       // 价格
    specialOffers: extractOffers(page), // 特惠
    photos: extractPhotos(page),       // 高质量图片
    bookingUrl: extractBookingLink(page), // 预订链接
  };
}
```

**示例：**
- Menu: "Beef Burger - $18.50"
- Specials: "Happy Hour 3-6pm - 50% off drinks"
- Booking: "https://bookme.co.nz/..."

---

#### **2. 美容院（Beauty Salons）**
```javascript
async function scrapeBeautySalonWebsite(url) {
  return {
    services: extractServices(page),   // 服务项目
    priceList: extractPriceList(page), // 价格表
    staffProfiles: extractStaff(page), // 员工介绍
    bookingUrl: extractBookingLink(page),
  };
}
```

**示例：**
- Services: "Haircut - $45", "Color - $120"
- Booking: "https://timely.co.nz/..."

---

#### **3. 游乐场/健身房（Entertainment & Gyms）**
```javascript
async function scrapeEntertainmentWebsite(url) {
  return {
    activities: extractActivities(page), // 活动项目
    pricing: extractPricing(page),       // 票价
    schedule: extractSchedule(page),     // 时间表
    membershipPlans: extractPlans(page), // 会员计划
  };
}
```

---

### **Web Scraping 工具选择：**

**推荐：Cheerio（轻量、快速）**
```javascript
import axios from 'axios';
import cheerio from 'cheerio';

async function scrapeWebsite(url) {
  try {
    const { data } = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'LifeX-Bot/1.0',
      },
    });
    
    const $ = cheerio.load(data);
    
    // 提取菜单（示例）
    const menuItems = [];
    $('.menu-item').each((i, el) => {
      const name = $(el).find('.item-name').text().trim();
      const price = $(el).find('.item-price').text().trim();
      const description = $(el).find('.item-description').text().trim();
      
      if (name && price) {
        menuItems.push({ name, price, description });
      }
    });
    
    return {
      menu: menuItems,
      success: true,
    };
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error.message);
    return { success: false };
  }
}
```

---

## 📊 **数据质量保证**

### **抓取成功率目标：**
```
✅ 100% 商家有网址
✅ 80%+ 成功抓取基本信息
✅ 60%+ 成功抓取菜单/价格
✅ 40%+ 成功抓取高质量图片
```

### **失败时的降级策略：**
```javascript
if (!webData || !webData.success) {
  // 使用 Google Places 数据
  console.log('Using Google Places data as fallback');
  business.description = business.editorial_summary?.overview || '';
  business.photos = business.photos?.slice(0, 5) || [];
}
```

---

## 📋 **执行检查清单**

### **Phase 1: 商家筛选**
- [ ] 仅选择有网址的商家 ⭐⭐⭐⭐⭐
- [ ] 评分 ≥ 4.0
- [ ] 评论 ≥ 50 条
- [ ] 有完整地址和分类
- [ ] 计算优先级分数
- [ ] 按分数排序

### **Phase 2: 详细信息采集**
- [ ] Google Place Details API
- [ ] 从网址抓取菜单/价格
- [ ] 下载/引用高质量图片
- [ ] 获取营业时间
- [ ] 获取联系方式

### **Phase 3: 数据验证**
- [ ] 验证网址可访问
- [ ] 验证数据格式正确
- [ ] 去重
- [ ] 人工抽查 5%

### **Phase 4: 存储到数据库**
- [ ] 保存到 `businesses` 表
- [ ] 包含 `website` 字段
- [ ] 包含 `priority_score` 字段
- [ ] 包含从网址抓取的额外数据（如菜单）

---

## 🎯 **成功标准**

```
✅ 5,000 家高质量商家
✅ 100% 有官方网址
✅ 平均评分 ≥ 4.3
✅ 80%+ 有详细菜单/价格信息
✅ 覆盖 5 个主要城市
✅ 覆盖 7 个重点行业
✅ 可持续更新和维护
```

---

## 💡 **关键优势**

### **与普通数据采集相比：**

| 特性 | 普通采集 | 我们的策略 ⭐ |
|-----|---------|-------------|
| 商家质量 | 随机 | 高评分（4.0+） ✅ |
| 详细程度 | 基础信息 | 菜单+价格+服务 ✅ |
| 可更新性 | 难 | 从网址定期更新 ✅ |
| 用户价值 | 中 | 高（完整信息）✅ |
| 数据来源 | 单一 | 多源（Google + Website）✅ |

---

**结论：通过筛选有网址的商家，我们可以获得远超基础信息的详细数据，为用户提供最佳体验！** 🚀✨





