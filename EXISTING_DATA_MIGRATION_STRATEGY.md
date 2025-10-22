# 📊 现有数据评估与迁移策略

**更新时间：** 2024-10-17

---

## 🎯 **目标**

评估现有 `businesses` 表中的数据质量，制定迁移策略，确保：
1. ✅ 保留所有现有有价值的数据
2. ✅ 添加 Google Places API 集成所需字段
3. ✅ 符合 Google 30 天缓存政策
4. ✅ 不影响现有功能
5. ✅ 为未来扩展做好准备

---

## 📋 **第一步：数据评估**

### **运行评估查询**

1. **在 Supabase Dashboard SQL Editor 中运行：**
   ```sql
   -- 文件位置：database/check_existing_data.sql
   ```

2. **关键问题需要回答：**
   - ✅ 有多少商家数据？
   - ✅ 数据分布在哪些城市？
   - ✅ 哪些类别？
   - ✅ `rating` 和 `review_count` 的来源？（Google 还是自有）
   - ✅ 数据完整性如何？（有多少商家有完整信息）
   - ✅ 是否已有 `google_place_id`？

---

## 🔍 **数据来源分析**

### **Scenario 1: 数据来自 Google（之前采集的）**

```
如果现有数据是从 Google Places API 采集的：

✅ 可以继续使用
⚠️ 需要检查采集时间
⚠️ 如果超过 30 天，需要重新更新

行动：
1. 添加 google_place_id（如果没有保存）
2. 将 rating → cached_google_rating
3. 将 review_count → cached_google_reviews
4. 设置 cached_at 和 cache_expires_at
5. 运行更新流程
```

### **Scenario 2: 数据是平台自有的**

```
如果数据是用户在你平台上创建/评分的：

✅ 完全可以继续使用
✅ 不受 Google 政策限制
✅ 可以永久存储

行动：
1. 保留原有 rating 和 review_count
2. 添加 lifex_rating 和 lifex_review_count
3. 标记 data_source = 'manual' 或 'owner'
4. 后续可选择性关联 Google Place ID
```

### **Scenario 3: 混合数据**

```
部分来自 Google，部分来自平台：

行动：
1. 分别处理不同来源的数据
2. Google 数据：按 Scenario 1 处理
3. 自有数据：按 Scenario 2 处理
4. 标记 data_source = 'hybrid'
```

---

## 🔄 **迁移策略**

### **阶段 1: 无破坏性添加字段（立即执行）** ✅

```sql
-- 运行迁移脚本
-- 文件位置：database/migrate_businesses_for_google_api.sql

-- 这个脚本会：
✅ 添加所有新字段（不影响现有数据）
✅ 创建必要的索引
✅ 创建辅助函数
✅ 创建便捷视图
✅ 保留所有现有数据
```

**执行步骤：**
1. 在 Supabase Dashboard → SQL Editor
2. 粘贴 `migrate_businesses_for_google_api.sql` 内容
3. 点击 Run
4. 检查输出是否有错误

---

### **阶段 2: 数据分类和标记**

```sql
-- 2.1 标记数据来源
UPDATE businesses
SET data_source = CASE
  WHEN google_place_id IS NOT NULL THEN 'google'
  WHEN owner_id IS NOT NULL THEN 'owner'
  ELSE 'manual'
END;

-- 2.2 迁移评分数据到对应字段
-- 如果是 Google 数据
UPDATE businesses
SET 
  cached_google_rating = rating,
  cached_google_reviews = review_count,
  cached_name = name,
  -- 假设采集时间是 created_at（根据实际情况调整）
  cached_at = created_at,
  cache_expires_at = created_at + INTERVAL '30 days'
WHERE data_source = 'google' AND cached_at IS NULL;

-- 如果是平台自有数据
UPDATE businesses
SET 
  lifex_rating = rating,
  lifex_review_count = review_count
WHERE data_source IN ('owner', 'manual') AND lifex_rating IS NULL;
```

---

### **阶段 3: 提取城市信息**

```sql
-- 3.1 如果 address 是文本格式
-- 示例："123 Queen St, Auckland 1010, New Zealand"
UPDATE businesses
SET city = CASE
  WHEN address::TEXT ILIKE '%auckland%' THEN 'Auckland'
  WHEN address::TEXT ILIKE '%wellington%' THEN 'Wellington'
  WHEN address::TEXT ILIKE '%christchurch%' THEN 'Christchurch'
  WHEN address::TEXT ILIKE '%hamilton%' THEN 'Hamilton'
  WHEN address::TEXT ILIKE '%tauranga%' THEN 'Tauranga'
  -- 添加更多城市...
  ELSE NULL
END
WHERE city IS NULL AND address IS NOT NULL;

-- 3.2 如果 address 是 JSON 格式
-- 示例：{"street": "123 Queen St", "city": "Auckland", "postcode": "1010"}
UPDATE businesses
SET city = address->>'city'
WHERE city IS NULL 
  AND address IS NOT NULL 
  AND jsonb_typeof(address) = 'object'
  AND address ? 'city';
```

---

### **阶段 4: 计算优先级评分**

```sql
-- 更新所有商家的优先级评分
SELECT update_all_priority_scores();

-- 查看结果
SELECT 
  name,
  category,
  city,
  priority_score,
  COALESCE(cached_google_rating, lifex_rating, rating) as display_rating
FROM businesses
ORDER BY priority_score DESC
LIMIT 10;
```

---

## 📊 **数据质量评估标准**

### **高质量商家（可以保留）：** ✅

```
✅ 有完整的名称和类别
✅ 有联系方式或地址
✅ 评分 >= 3.0
✅ is_active = true
✅ 数据看起来合理（不是测试数据）
```

### **低质量商家（考虑清理）：** ⚠️

```
❌ 缺少基本信息（名称、类别）
❌ 明显的测试数据（"Test Business"）
❌ 评分 < 2.0 且没有描述
❌ is_active = false 且很久没更新
❌ 重复数据
```

### **清理脚本（可选）：**

```sql
-- 备份低质量数据（以防万一）
CREATE TABLE businesses_backup AS
SELECT * FROM businesses
WHERE is_active = false 
  OR (name ILIKE '%test%' AND created_at < NOW() - INTERVAL '90 days');

-- 软删除低质量商家
UPDATE businesses
SET is_active = false
WHERE 
  -- 测试数据
  (name ILIKE '%test%' OR name ILIKE '%dummy%')
  -- 或缺少关键信息
  OR (description IS NULL AND contact_info IS NULL AND address IS NULL)
  -- 或评分过低
  OR (rating < 2.0 AND review_count < 3);
```

---

## 🎯 **现有数据与新采集数据的结合**

### **策略 A: 保留所有现有数据，新增 Google 数据**

```
现有商家（例如 500 个）：
├─ 保持原样
├─ 添加新字段
├─ 标记 data_source = 'manual'
└─ 继续显示

新采集商家（5,000 个）：
├─ 从 Google Places API 获取
├─ 填充 google_place_id 和缓存字段
├─ 标记 data_source = 'google'
└─ 与现有数据共存

总数：5,500 商家 ✅
```

### **策略 B: 关联现有商家到 Google Place ID**

```
对于现有商家：
1. 使用名称 + 地址搜索 Google Place ID
2. 如果匹配成功：
   ├─ 添加 google_place_id
   ├─ 合并数据（保留最佳）
   └─ 标记 data_source = 'hybrid'
3. 如果找不到匹配：
   └─ 保持为 data_source = 'manual'

优点：
✅ 数据更丰富
✅ 可以显示 Google 照片
✅ 评分更可信

缺点：
⚠️ 需要额外 API 调用（成本）
⚠️ 可能匹配错误
```

---

## 📋 **实施检查清单**

### **Phase 1: 评估（1 天）**

- [ ] 运行 `check_existing_data.sql`
- [ ] 记录数据量和分布
- [ ] 确定数据来源
- [ ] 评估数据质量
- [ ] 决定迁移策略（A 或 B）

### **Phase 2: 备份（必须）**

```sql
-- 创建完整备份
CREATE TABLE businesses_backup_20241017 AS
SELECT * FROM businesses;

-- 验证备份
SELECT COUNT(*) FROM businesses_backup_20241017;
```

### **Phase 3: 迁移（1-2 小时）**

- [ ] 运行 `migrate_businesses_for_google_api.sql`
- [ ] 验证新字段已添加
- [ ] 验证索引已创建
- [ ] 验证函数已创建
- [ ] 测试视图查询

### **Phase 4: 数据处理（2-4 小时）**

- [ ] 标记数据来源
- [ ] 迁移评分数据
- [ ] 提取城市信息
- [ ] 计算优先级评分
- [ ] 验证数据完整性

### **Phase 5: 测试（1 天）**

- [ ] 测试移动应用是否正常
- [ ] 测试 Places 页面
- [ ] 测试 AI Chat 推荐
- [ ] 测试搜索功能
- [ ] 检查性能

### **Phase 6: 新数据采集（按计划）**

- [ ] 注册 Google Cloud
- [ ] 实现采集脚本
- [ ] 开始采集 5,000 新商家
- [ ] 验证数据质量
- [ ] 上线

---

## 🎓 **最佳实践建议**

### **1. 保留历史数据**

```typescript
// 在视图或查询中优雅地处理新旧数据
const displayData = {
  // 优先使用 Google 缓存数据
  name: business.cached_name || business.name,
  rating: business.cached_google_rating || business.lifex_rating || business.rating,
  reviews: business.cached_google_reviews || business.lifex_review_count || business.review_count,
  
  // 标记数据来源
  dataSource: business.data_source,
  
  // 显示最新数据
  isGoogleData: !!business.google_place_id,
  isCacheValid: business.cache_expires_at > new Date(),
};
```

### **2. 渐进式迁移**

```
不要一次性处理所有数据：
├─ Week 1: 迁移数据库结构
├─ Week 2: 测试新采集 100 商家
├─ Week 3: 批量采集 5,000 商家
├─ Week 4: 关联现有商家（可选）
└─ Week 5: 全面上线
```

### **3. 监控和调整**

```sql
-- 创建监控视图
CREATE VIEW data_health_check AS
SELECT 
  data_source,
  COUNT(*) as count,
  COUNT(CASE WHEN is_active THEN 1 END) as active_count,
  AVG(COALESCE(cached_google_rating, lifex_rating, rating)) as avg_rating,
  SUM(view_count) as total_views,
  COUNT(CASE WHEN cache_expires_at < NOW() THEN 1 END) as expired_cache
FROM businesses
GROUP BY data_source;

-- 每周检查
SELECT * FROM data_health_check;
```

---

## ✅ **迁移成功标准**

```
✅ 所有现有商家数据保留
✅ 新字段成功添加
✅ 索引创建成功
✅ 现有功能正常工作
✅ 可以开始新数据采集
✅ 性能无明显下降
✅ AI Chat 推荐正常
```

---

## 🆘 **回滚计划（如果出错）**

```sql
-- 1. 恢复备份
DROP TABLE IF EXISTS businesses;
ALTER TABLE businesses_backup_20241017 RENAME TO businesses;

-- 2. 重建索引（如果需要）
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_is_active ON businesses(is_active);

-- 3. 测试应用
-- 确保所有功能正常

-- 4. 分析失败原因
-- 修复问题后重新尝试迁移
```

---

## 📞 **下一步行动**

### **立即执行：**

1. 📊 **运行数据评估查询**
   - 文件：`database/check_existing_data.sql`
   - 位置：Supabase SQL Editor
   - 记录结果

2. 💾 **创建数据备份**
   ```sql
   CREATE TABLE businesses_backup_20241017 AS SELECT * FROM businesses;
   ```

3. 🔧 **运行迁移脚本**
   - 文件：`database/migrate_businesses_for_google_api.sql`
   - 位置：Supabase SQL Editor
   - 检查输出

4. ✅ **验证迁移成功**
   - 检查新字段
   - 测试应用
   - 确认无错误

### **反馈给我：**

请运行评估查询后告诉我：
1. 总共有多少商家？
2. 各类别分布如何？
3. rating 和 review_count 的来源？
4. 是否有 google_place_id？
5. address 和 contact_info 的格式？

我会根据实际情况调整迁移策略！📊

---

**现有数据是宝贵资产！我们会妥善处理！** ✅💪

