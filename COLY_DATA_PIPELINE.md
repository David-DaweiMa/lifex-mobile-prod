# Coly 数据管线（抓取 / 调度 / 合规 / 成本）

> Guiding Principle（Lifex Manifesto）
> 我们的核心价值是利用 AI 的能力深入理解每个 business 和每个用户，并据此做最合适的匹配。所有可以合法获取的数据都用于帮助 AI 持续加深理解；随着时间与数据增长，这份理解会不断进化。唯有基于这种理解，我们才能提供让客户满意的一切服务（chat、推荐、AI 助手）以及后续的优惠券、订座、订餐、服务预定、票务购买等下游交易。

## 数据源
- Google Places（30天缓存限制）
- 商家官网（菜单/价目/优惠/预约）
- 超市促销/类别页（Woolworths/New World/PAK'nSAVE）
- First Table（公开时段/席位）
- 城市活动页；天气（Open‑Meteo）

## 抓取策略
- 优先 Cheerio；遇动态少量使用无头浏览器；QPS≤1–2；退避+重试
- 仅抓公开页；保留来源URL与更新时间；失败回退上次数据

## 调度与频率
- 周更：超市促销与类别价格、菜单/价目、通用优惠
- 日更：First Table 时段与席位、新店/热点优惠
- Cron + 队列；分批执行；缓存与去重

## 体量与配额估算
- 门店级覆盖：≈380–420店；每店10–30页；周请求≈4k–12k
- First Table：Top500店；日更2次；每次请求≤500
- 计算与存储：文本为主；每周新增数据<数十MB

## 失败恢复
- 解析失败：降级使用上周数据；记录 source_url 与 last_checked
- 反爬命中：自动降频、退避；必要时转备用选择器

## 结构化字段（示例）
- deals：business_id, source, title, price/discount, valid_from/to, booking_url, url
- first_table_slots：business_id, date, timeslot, seats, discount, url, last_checked
- supermarket_stores：chain, name, city, slug, website
- supermarket_skus：brand, name, size, unit, category, normalized_key
- supermarket_prices：store_id, sku_id, price, promo_text, valid_from/to, scraped_at

## 监控与降级
- 指标：失败率、解析命中率、覆盖率、延迟
- 策略：阈值报警；自动降频；回退上一版本数据

## 成本
- 请求量：周<1–2万；边缘函数 + 免费额度基本覆盖；存储以文本为主


## 燃油价格数据（增量）
- 数据源：连锁官网/站点页促销与标价（白名单）、政府/行业周均价（参考）；不抓社区众包（需合作）。
- 刷新：日更或隔日更；失败回退；保留 source_url 与 scraped_at。
- 字段：fuel_stations(chain/name/city/coords/url)、fuel_prices(station_id, fuel_type, price_cents, valid_from/to, scraped_at)。

### 备注：第三方众包平台区分
- Gassy（`https://www.gassy.co.nz/`）与 Gaspy 为不同平台。
- 管线策略：第三方众包采用“合作/深链”模式；抓取仅限官方公开页面与许可资源。

### 数据源登记（Registry）
- 统一登记候选来源、准确性与合规状态，见 `COLY_DATA_SOURCES_REGISTRY.md`；获取细节与接入形态标记为 TBD，待后续验证。
- Registry 字段：采集方式(API/抓取/开放数据)、成本、更新周期、用途、DB 表、合规与状态。

## EV 充电桩数据（增量）
- 数据源：政府/开放数据门户（如数据集/GeoJSON）、运营商官网/网点页；第三方平台以合作/深链为主。
- 刷新：基础站点位置与参数周更；若有开放可用性接口则 5–15 分钟拉取一次“指示性”状态并带时间戳。
- 字段：
  - ev_stations(name, operator, network, address, coords, city, amenities, power_kw_max, source_url)
  - ev_connectors(station_id, connector_type[CCS2/CHAdeMO/Type2], power_kw)
  - ev_availability_snapshot(optional: station_id, status[available/busy/offline], updated_at, source_url)




## Coly 调度分类（固定 + 临时）
- 每日 Daily
  - First Table 时段与席位增量刷新
  - 燃油“城市周最低/附近更便宜×3”指示价（日更/隔日更）
  - 高热度商家/SKU 的轻量抽样刷新
  - 提醒生成与发送窗口（当日到期/近3日）
- 每周 Weekly
  - 超市促销与类别页主刷新；热门门店深度抓取
  - 商家官网菜单/价目页常规刷新
  - EV 站点基础信息与字段标准化
  - 数据质量抽检与差异分析（价格、库存、门店差异）
- 每月 Monthly
  - Places 低活跃实体的过期清理/回填（遵守30天缓存）
  - 向量索引/标签重建与冷启动检查
  - 成本与配额复盘、阈值与频控参数调整
- 每年 Yearly
  - 法务与合规条款复核（ToS/robots/许可清单）
  - 数据保留策略与归档审计（隐私/最小化）
- 临时 Ad‑hoc
  - 热点事件/节假日前加密度抓取与提醒
  - 选择器/站点结构变化热修
  - 合作数据源试点接入与回滚

