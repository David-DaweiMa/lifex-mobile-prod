# Coly 数据库新增表（提案，不执行）

> Guiding Principle（Lifex Manifesto）
> 我们的核心价值是利用 AI 的能力深入理解每个 business 和每个用户，并据此做最合适的匹配。所有可以合法获取的数据都用于帮助 AI 持续加深理解；随着时间与数据增长，这份理解会不断进化。唯有基于这种理解，我们才能提供让客户满意的一切服务（chat、推荐、AI 助手）以及后续的优惠券、订座、订餐、服务预定、票务购买等下游交易。

## 新表与字段（核心）
- deals（餐饮/美容/娱乐优惠）
  - id, business_id, source, title, description, price, discount, valid_from, valid_to, booking_url, url, city, created_at, updated_at
- first_table_slots
  - id, business_id, date, timeslot, seats, discount, url, last_checked
- supermarket_stores
  - id, chain, name, city, address, website, slug, is_active, created_at
- supermarket_skus
  - id, brand, name, size, unit, category, normalized_key
- supermarket_prices
  - id, store_id, sku_id, price, promo_text, valid_from, valid_to, scraped_at, source_url
- user_watchlist（关注与阈值）
  - id, user_id, watch_type(business/sku/service), ref_id, threshold_percent, threshold_amount, created_at
- reminders（到期/事项）
  - id, user_id, type(wof/rego/coupon/membership/subscription), title, due_date, period, notes, is_active, created_at, updated_at

## 索引建议
- supermarket_prices(store_id, sku_id, valid_to DESC)
- deals(business_id, valid_to)
- first_table_slots(business_id, date, timeslot)

## 保留与过期策略
- prices：按 valid_to 软过期；仅保留最近12个月的周采样；归档至冷存储可选
- deals/slots：过期30天后清理；保留统计聚合

## 示例查询
```sql
-- 1) 我的门店常买SKU当前最低价
SELECT sp.store_id, sp.sku_id, sp.price
FROM supermarket_prices sp
JOIN user_watchlist uw ON uw.watch_type = 'sku' AND uw.ref_id = sp.sku_id
WHERE uw.user_id = :user_id AND sp.valid_to > NOW()
ORDER BY sp.price ASC
LIMIT 1;

-- 2) First Table 心愿时段命中
SELECT fts.*
FROM first_table_slots fts
JOIN user_watchlist uw ON uw.watch_type = 'business' AND uw.ref_id = fts.business_id
WHERE uw.user_id = :user_id AND fts.date BETWEEN NOW()::date AND NOW()::date + INTERVAL '14 days';
```

## 关联关系
- businesses.id → deals.business_id → first_table_slots.business_id
- user_profiles.id → user_watchlist.user_id → reminders.user_id

## 维护策略
- 追加写+软过期；保留来源与 last_checked；定期清理过期/重复


## 燃油价格（新增提案）
- fuel_stations
  - id, chain, name, address, coords(POINT), city, source_url, is_active, created_at
- fuel_prices
  - id, station_id, fuel_type(91/95/98/diesel), price_cents, valid_from, valid_to, scraped_at, source_url
- user_fuel_prefs（可选）
  - id, user_id, fuel_type, home_area, work_area, fav_station_ids[]

### 索引
- fuel_prices(station_id, fuel_type, valid_to DESC)

### 示例查询
```sql
-- 附近更便宜 ×3（指示性）
SELECT fp.station_id, fp.fuel_type, fp.price_cents
FROM fuel_prices fp
JOIN fuel_stations fs ON fs.id = fp.station_id
WHERE fp.fuel_type = '91' AND fp.valid_to > NOW()
ORDER BY fp.price_cents ASC
LIMIT 3;
```

## EV 充电桩（新增提案）
- ev_stations
  - id, operator, network, name, address, coords(POINT), city, amenities JSONB, power_kw_max, source_url, is_active, created_at
- ev_connectors
  - id, station_id, connector_type(CCS2/CHAdeMO/Type2), power_kw
- ev_availability_snapshot（可选）
  - id, station_id, status(available/busy/offline), updated_at, source_url

### 索引
- ev_stations USING GIST(coords)
- ev_connectors(station_id, connector_type)

### 示例查询
```sql
-- 附近 DC 快充（≥50kW）Top5
SELECT s.id, s.name, s.power_kw_max
FROM ev_stations s
JOIN ev_connectors c ON c.station_id = s.id
WHERE c.power_kw >= 50
ORDER BY s.power_kw_max DESC
LIMIT 5;
```


