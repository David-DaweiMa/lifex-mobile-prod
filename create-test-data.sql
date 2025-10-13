-- 创建测试数据：咖啡店示例

-- 清空现有数据（可选）
-- DELETE FROM businesses WHERE name LIKE '%Test%' OR name LIKE '%Little Larder%';

-- 插入测试数据
INSERT INTO businesses (
  name,
  category,
  address,
  rating,
  phone,
  description,
  status,
  created_at,
  updated_at
) VALUES
(
  'The Little Larder',
  'Cafe',
  '123 Ponsonby Rd, Auckland',
  4.8,
  '09-123-4567',
  'Cozy cafe known for artisan coffee and all-day brunch. Perfect spot for remote work with great WiFi.',
  'active',
  NOW(),
  NOW()
),
(
  'Atomic Coffee Roasters',
  'Coffee Shop',
  '456 Mt Eden Rd, Auckland',
  4.7,
  '09-234-5678',
  'Local favorite with excellent single-origin beans roasted on-site. Great outdoor seating area.',
  'active',
  NOW(),
  NOW()
),
(
  'Eighthirty Coffee',
  'Cafe',
  '789 Queen St, Auckland CBD',
  4.6,
  '09-345-6789',
  'Perfect for a quick espresso on your way to work. Specialty coffee and fresh pastries daily.',
  'active',
  NOW(),
  NOW()
),
(
  'Allpress Espresso',
  'Coffee Roastery',
  '8 Drake St, Freemans Bay, Auckland',
  4.5,
  '09-456-7890',
  'Industrial-chic space with house-roasted beans. Popular breakfast spot with amazing coffee.',
  'active',
  NOW(),
  NOW()
),
(
  'The Coffee Club Newmarket',
  'Cafe & Restaurant',
  '277 Broadway, Newmarket, Auckland',
  4.3,
  '09-567-8901',
  'Casual chain serving breakfast, lunch & dinner with extensive coffee menu. Family-friendly atmosphere.',
  'active',
  NOW(),
  NOW()
);

-- 查询插入的数据
SELECT id, name, category, rating, status 
FROM businesses 
WHERE status = 'active' 
ORDER BY rating DESC 
LIMIT 5;

