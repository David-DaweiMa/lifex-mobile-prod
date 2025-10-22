-- 检查现有 businesses 数据
-- 在 Supabase SQL Editor 中运行这些查询

-- 1. 统计总体数据
SELECT 
  COUNT(*) as total_businesses,
  COUNT(CASE WHEN is_active THEN 1 END) as active_businesses,
  COUNT(CASE WHEN is_verified THEN 1 END) as verified_businesses,
  COUNT(CASE WHEN owner_id IS NOT NULL THEN 1 END) as has_owner
FROM businesses;

-- 2. 按类别统计
SELECT 
  category,
  COUNT(*) as count,
  AVG(rating) as avg_rating,
  SUM(review_count) as total_reviews
FROM businesses
WHERE is_active = true
GROUP BY category
ORDER BY count DESC;

-- 3. 检查字段完整性
SELECT 
  COUNT(*) as total,
  COUNT(name) as has_name,
  COUNT(description) as has_description,
  COUNT(logo_url) as has_logo,
  COUNT(cover_image_url) as has_cover,
  COUNT(category) as has_category,
  COUNT(contact_info) as has_contact,
  COUNT(address) as has_address,
  COUNT(rating) as has_rating,
  COUNT(review_count) as has_reviews
FROM businesses;

-- 4. 查看示例数据（前 5 条）
SELECT 
  id,
  name,
  category,
  rating,
  review_count,
  contact_info,
  address,
  created_at
FROM businesses
WHERE is_active = true
LIMIT 5;

-- 5. 检查是否已有 Google Place ID
SELECT 
  COUNT(*) as total,
  COUNT(google_place_id) as has_google_id
FROM businesses;

-- 6. 检查地址格式（如果是 JSON）
SELECT 
  address,
  contact_info
FROM businesses
WHERE address IS NOT NULL
LIMIT 3;

-- 7. 评分分布
SELECT 
  CASE 
    WHEN rating >= 4.5 THEN '4.5-5.0 ⭐⭐⭐⭐⭐'
    WHEN rating >= 4.0 THEN '4.0-4.4 ⭐⭐⭐⭐'
    WHEN rating >= 3.5 THEN '3.5-3.9 ⭐⭐⭐'
    WHEN rating >= 3.0 THEN '3.0-3.4 ⭐⭐'
    ELSE '< 3.0 ⭐'
  END as rating_range,
  COUNT(*) as count
FROM businesses
WHERE is_active = true
GROUP BY rating_range
ORDER BY rating_range DESC;

-- 8. 评论数分布
SELECT 
  CASE 
    WHEN review_count >= 100 THEN '100+'
    WHEN review_count >= 50 THEN '50-99'
    WHEN review_count >= 20 THEN '20-49'
    WHEN review_count >= 10 THEN '10-19'
    ELSE '< 10'
  END as review_range,
  COUNT(*) as count
FROM businesses
WHERE is_active = true
GROUP BY review_range
ORDER BY review_range DESC;










