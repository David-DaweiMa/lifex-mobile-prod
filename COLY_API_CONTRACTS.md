# Coly API 契约草案（不改代码版）

说明：用于前后端对齐的接口定义与字段约定，后续实现时据此创建/调整接口。

## 1) 周报数据
- GET /api/coly/weekly-brief?city=AKL
- 响应（示例）
```json
{
  "week": "2025-10-20",
  "cards": [
    { "type": "supermarket", "title": "本周命中 6 项降价", "items": [] },
    { "type": "dining", "title": "餐饮优惠 3 条", "items": [] },
    { "type": "hair", "title": "理发套系 2 条", "items": [] },
    { "type": "weekend", "title": "周末计划", "items": [] }
  ]
}
```

## 2) 降价命中列表
- GET /api/coly/price-hits?userId=:id
- 响应字段：skuId, storeId, oldPrice, newPrice, discountPercent, validTo, sourceUrl

## 3) First Table 时段
- GET /api/coly/first-table/slots?businessId=:id&days=14
- 响应字段：date, timeslot, seats, discount, url, lastChecked

## 4) 用户关注（阈值）
- POST /api/coly/watchlist
```json
{
  "userId": "uuid",
  "watchType": "sku|business|service",
  "refId": "uuid",
  "thresholdPercent": 10,
  "thresholdAmount": 5
}
```
- DELETE /api/coly/watchlist/:id

## 5) 到期提醒
- POST /api/coly/reminders
```json
{
  "userId": "uuid",
  "type": "wof|rego|coupon|membership|subscription",
  "title": "WOF - Corolla",
  "dueDate": "2025-12-01",
  "period": "none|weekly|monthly|yearly",
  "notes": "",
  "active": true
}
```
- GET /api/coly/reminders?userId=:id

## 6) 餐饮优惠（官网/聚合）
- GET /api/coly/deals?city=AKL&category=dining&limit=20
- 响应字段：businessId, title, price/discount, validFrom/To, bookingUrl, url

## 7) 比价（Top SKU 指示价）
- GET /api/coly/compare?city=AKL&skuId=:id
- 响应字段：storeId, price, promoText, validTo, sourceUrl

## 8) 燃油价格（指示性）
- GET /api/coly/fuel/nearby?lat&lng&fuelType=91|95|98|diesel
  - 返回：stations[{ stationId, name, distanceKm, priceCents, updatedAt, sourceUrl }]
- GET /api/coly/fuel/weekly-low?city=AKL&fuelType=91
  - 返回：{ city, fuelType, stationId, priceCents, updatedAt, sourceUrl }
- POST /api/coly/fuel/watchlist { stationId|area, fuelType, deltaCents }
- GET /api/coly/fuel/price-hits?userId=:id

### 补充：第三方深链字段（可选）
- 为支持 Gassy（非 Gaspy）等第三方众包平台深链，响应对象可增加：
  - externalDeepLink: string  // 指向第三方的详情页，仅深链，不含抓取
  - externalSource: string    // 例如 "gassy"


## 错误规范
```json
{
  "error": {
    "code": "INVALID_PARAM|NOT_FOUND|RATE_LIMIT|INTERNAL",
    "message": "..."
  }
}
```

## 备注
- 鉴权：Bearer（用户态）、服务间密钥（内部）
- 限流：IP + 用户，周报接口加缓存
- 数据来源标注与更新时间统一返回
