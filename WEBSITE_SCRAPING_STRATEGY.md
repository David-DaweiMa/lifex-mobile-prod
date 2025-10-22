# 🌐 网址数据抓取策略

**更新时间：** 2024-10-17

---

## 🎯 **核心目标**

通过抓取商家官方网址，获取 Google Places API 无法提供的详细信息：
- ✅ **菜单和价格**（餐厅、咖啡厅）
- ✅ **服务项目和价格表**（美容院、理发店）
- ✅ **活动和课程**（健身房、游乐场）
- ✅ **高质量图片**（产品、环境）
- ✅ **在线预订链接**
- ✅ **特惠和促销信息**

---

## 📊 **价值分析**

### **只有 Google Places 数据：**
```javascript
{
  name: "Best Cafe",
  rating: 4.5,
  address: "123 Queen St, Auckland",
  // ❌ 没有菜单
  // ❌ 没有价格
  // ❌ 照片有限
}
```

### **Google Places + 网址抓取：**
```javascript
{
  name: "Best Cafe",
  rating: 4.5,
  address: "123 Queen St, Auckland",
  website: "https://bestcafe.co.nz",
  // ✅ 完整菜单
  menu: [
    { name: "Flat White", price: "$4.50", category: "Coffee" },
    { name: "Beef Burger", price: "$18.50", category: "Mains" },
    // ... 50+ items
  ],
  // ✅ 当前促销
  specials: [
    { title: "Happy Hour", description: "50% off all drinks 3-6pm" }
  ],
  // ✅ 高质量图片
  photos: ["menu.jpg", "interior.jpg", "signature-dish.jpg"],
  // ✅ 在线预订
  bookingUrl: "https://bookme.co.nz/bestcafe"
}
```

**用户体验提升：** 📈 **300%+**

---

## 🛠️ **技术方案**

### **选择：Cheerio（推荐）**

**优势：**
- ✅ 轻量快速
- ✅ 类似 jQuery 语法
- ✅ 适合静态网站
- ✅ 低成本

```bash
npm install cheerio axios
```

### **备选：Puppeteer（适合动态网站）**

**适用场景：**
- 网站使用 JavaScript 渲染（React、Vue）
- 需要执行 JavaScript
- 需要截图

```bash
npm install puppeteer
```

---

## 📝 **实现代码**

### **基础抓取函数**

```javascript
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * 抓取商家网址的基础信息
 */
async function scrapeBusinessWebsite(url, businessType) {
  try {
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LifeX-Bot/1.0; +https://lifex.co.nz/bot)',
      },
    });
    
    const $ = cheerio.load(data);
    
    // 根据商家类型选择不同的抓取策略
    switch (businessType) {
      case 'restaurant':
      case 'cafe':
        return scrapeRestaurant($);
      
      case 'beauty_salon':
      case 'hair_salon':
        return scrapeSalon($);
      
      case 'gym':
      case 'fitness':
        return scrapeGym($);
      
      default:
        return scrapeGeneric($);
    }
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error.message);
    return { success: false, error: error.message };
  }
}
```

---

### **餐厅/咖啡厅抓取**

```javascript
/**
 * 抓取餐厅菜单和价格
 */
function scrapeRestaurant($) {
  const result = {
    success: true,
    menu: [],
    specials: [],
    bookingUrl: null,
    photos: [],
  };
  
  // 1. 抓取菜单（常见选择器）
  const menuSelectors = [
    '.menu-item',
    '.dish',
    '.food-item',
    '[class*="menu"] [class*="item"]',
    'li[class*="menu"]',
  ];
  
  for (const selector of menuSelectors) {
    $(selector).each((i, el) => {
      const item = extractMenuItem($, $(el));
      if (item) result.menu.push(item);
    });
    
    if (result.menu.length > 0) break;
  }
  
  // 2. 抓取特惠信息
  const specialSelectors = [
    '.special',
    '.promotion',
    '.offer',
    '[class*="deal"]',
    '[class*="discount"]',
  ];
  
  for (const selector of specialSelectors) {
    $(selector).each((i, el) => {
      const special = extractSpecial($, $(el));
      if (special) result.specials.push(special);
    });
  }
  
  // 3. 查找预订链接
  const bookingPatterns = [
    /bookme\.co\.nz/i,
    /opentable\.com/i,
    /resy\.com/i,
    /book|reserve|reservation/i,
  ];
  
  $('a[href]').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().toLowerCase();
    
    for (const pattern of bookingPatterns) {
      if (pattern.test(href) || pattern.test(text)) {
        result.bookingUrl = href;
        break;
      }
    }
  });
  
  // 4. 抓取高质量图片
  $('img[src]').each((i, el) => {
    const src = $(el).attr('src');
    const alt = $(el).attr('alt') || '';
    
    // 过滤掉 logo、icon 等小图
    if (isHighQualityImage(src, alt)) {
      result.photos.push({
        url: src,
        alt: alt,
      });
    }
  });
  
  return result;
}

/**
 * 提取单个菜单项
 */
function extractMenuItem($, $el) {
  const name = $el.find('[class*="name"], [class*="title"], h3, h4')
    .first()
    .text()
    .trim();
  
  const priceText = $el.find('[class*="price"]')
    .first()
    .text()
    .trim();
  
  const description = $el.find('[class*="desc"], [class*="detail"], p')
    .first()
    .text()
    .trim();
  
  const category = $el.closest('[class*="category"], section')
    .find('h2, h3')
    .first()
    .text()
    .trim();
  
  // 解析价格
  const price = parsePrice(priceText);
  
  if (name && price) {
    return {
      name,
      price,
      priceRaw: priceText,
      description,
      category,
    };
  }
  
  return null;
}

/**
 * 解析价格字符串
 */
function parsePrice(priceText) {
  // 提取数字和货币符号
  const match = priceText.match(/\$?\s*(\d+\.?\d*)/);
  if (match) {
    const amount = parseFloat(match[1]);
    return {
      amount,
      currency: 'NZD',
      formatted: `$${amount.toFixed(2)}`,
    };
  }
  return null;
}
```

---

### **美容院/理发店抓取**

```javascript
/**
 * 抓取美容院服务项目和价格表
 */
function scrapeSalon($) {
  const result = {
    success: true,
    services: [],
    priceList: [],
    staff: [],
    bookingUrl: null,
  };
  
  // 1. 抓取服务项目
  const serviceSelectors = [
    '.service',
    '.treatment',
    '[class*="service"] [class*="item"]',
    'tr',  // 通常是价格表
  ];
  
  for (const selector of serviceSelectors) {
    $(selector).each((i, el) => {
      const service = extractService($, $(el));
      if (service) result.services.push(service);
    });
    
    if (result.services.length > 0) break;
  }
  
  // 2. 查找预订链接（常见：Timely, Fresha, Booksy）
  const bookingPatterns = [
    /timely\.co\.nz/i,
    /fresha\.com/i,
    /booksy\.com/i,
    /book|appointment/i,
  ];
  
  $('a[href]').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().toLowerCase();
    
    for (const pattern of bookingPatterns) {
      if (pattern.test(href) || pattern.test(text)) {
        result.bookingUrl = href;
        break;
      }
    }
  });
  
  // 3. 抓取员工信息（可选）
  $('.staff, .team-member, [class*="stylist"]').each((i, el) => {
    const name = $(el).find('[class*="name"], h3, h4').text().trim();
    const role = $(el).find('[class*="role"], [class*="title"]').text().trim();
    const photo = $(el).find('img').attr('src');
    
    if (name) {
      result.staff.push({ name, role, photo });
    }
  });
  
  return result;
}

/**
 * 提取服务项目
 */
function extractService($, $el) {
  const name = $el.find('[class*="name"], [class*="service"], td:first, th:first')
    .first()
    .text()
    .trim();
  
  const priceText = $el.find('[class*="price"], td:last')
    .first()
    .text()
    .trim();
  
  const duration = $el.find('[class*="duration"], [class*="time"]')
    .first()
    .text()
    .trim();
  
  const price = parsePrice(priceText);
  
  if (name && price) {
    return {
      name,
      price,
      duration,
      category: extractCategory($el),
    };
  }
  
  return null;
}
```

---

### **健身房/游乐场抓取**

```javascript
/**
 * 抓取健身房活动和价格
 */
function scrapeGym($) {
  const result = {
    success: true,
    activities: [],
    membershipPlans: [],
    schedule: [],
    photos: [],
  };
  
  // 1. 抓取活动/课程
  const activitySelectors = [
    '.class',
    '.activity',
    '.program',
    '[class*="class"] [class*="item"]',
  ];
  
  for (const selector of activitySelectors) {
    $(selector).each((i, el) => {
      const activity = extractActivity($, $(el));
      if (activity) result.activities.push(activity);
    });
    
    if (result.activities.length > 0) break;
  }
  
  // 2. 抓取会员计划
  const planSelectors = [
    '.plan',
    '.membership',
    '.pricing-card',
    '[class*="price"] [class*="box"]',
  ];
  
  for (const selector of planSelectors) {
    $(selector).each((i, el) => {
      const plan = extractMembershipPlan($, $(el));
      if (plan) result.membershipPlans.push(plan);
    });
    
    if (result.membershipPlans.length > 0) break;
  }
  
  return result;
}
```

---

## 📦 **Supabase Edge Function 集成**

```typescript
// supabase/functions/scrape-business-website/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { businessId } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // 1. 获取商家信息
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();
    
    if (!business?.website) {
      return new Response(
        JSON.stringify({ error: 'No website found' }),
        { status: 400 }
      );
    }
    
    // 2. 抓取网址
    const scrapedData = await scrapeBusinessWebsite(
      business.website,
      business.category
    );
    
    if (!scrapedData.success) {
      throw new Error(scrapedData.error);
    }
    
    // 3. 保存到数据库
    const { error } = await supabase
      .from('businesses')
      .update({
        menu_items: scrapedData.menu,
        services: scrapedData.services,
        booking_url: scrapedData.bookingUrl,
        scraped_at: new Date().toISOString(),
      })
      .eq('id', businessId);
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({
        success: true,
        itemsFound: scrapedData.menu?.length || scrapedData.services?.length || 0,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

---

## ⏱️ **自动化更新策略**

### **使用 Supabase Cron Jobs**

```sql
-- 创建 pg_cron 扩展（如果未启用）
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 每周抓取所有有网址的商家
SELECT cron.schedule(
  'weekly-website-scraping',
  '0 2 * * 0',  -- 每周日凌晨 2 点
  $$
  SELECT net.http_post(
    url := 'https://[your-project].supabase.co/functions/v1/scrape-business-website',
    headers := '{"Authorization": "Bearer [your-anon-key]"}'::jsonb,
    body := json_build_object('businessId', id)::jsonb
  )
  FROM businesses
  WHERE website IS NOT NULL
    AND is_active = TRUE
    AND (scraped_at IS NULL OR scraped_at < NOW() - INTERVAL '7 days')
  LIMIT 100;
  $$
);
```

---

## 🚨 **注意事项**

### **1. 法律合规**
- ✅ 尊重 `robots.txt`
- ✅ 设置合理的请求频率（每秒 1-2 次）
- ✅ 使用友好的 User-Agent
- ✅ 不抓取用户生成内容（评论等）

### **2. 错误处理**
```javascript
// 优雅降级
if (!scrapedData || !scrapedData.success) {
  console.log('Scraping failed, using Google Places data only');
  // 继续使用 Google Places 数据
}
```

### **3. 数据验证**
```javascript
// 验证价格格式
function validatePrice(price) {
  return price && price.amount > 0 && price.amount < 10000;
}

// 去重
const uniqueMenu = Array.from(
  new Map(menu.map(item => [item.name, item])).values()
);
```

---

## 📊 **成功指标**

```
目标：
✅ 80%+ 有网址的商家成功抓取
✅ 60%+ 获取到菜单/价格信息
✅ 40%+ 获取到预订链接
✅ 每个商家平均 20+ 详细项目

成本：
✅ 抓取成本：$0（Supabase Edge Function 免费额度）
✅ 存储成本：~$1/月（文本数据）
```

---

**通过网址抓取，我们可以提供远超竞争对手的详细信息！** 🚀✨

