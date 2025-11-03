# Coly 数据源登记（Registry）

用途：集中记录候选数据源，统一追踪“准确性/合规/成本/更新频率/接入状态”。本文件仅登记与评估，具体抓取/接入方式后续实施再定（TBD）。

## 字段说明
- 域：功能域（超市/燃油/EV/餐饮/Places 等）
- 候选来源：站点或平台名（含链接）
- 类型：官方/开放数据/第三方众包/商业合作
- 许可与合规：ToS/robots/版权简述（TBD 可留空）
- 准确性：初步判断（TBD）
- 更新频率：官方标注或观测（TBD）
- 备注：特殊限制、成本、失败回退等（TBD）
- 状态：TBD / 待联系 / 观测中 / 合作中 / 使用中

## 目录
1) 超市价格（指示性）
2) 燃油价格（指示性）
3) EV 充电桩
4) 餐饮优惠/订位（含 First Table）
5) 基础地点（Google Places）

---

### 1) 超市价格（指示性）
- Countdown/Woolworths（官网/门店页/促销页） | 官方 | 许可：TBD | 准确性：TBD | 周期：TBD | 备注：门店差异需标注 | 状态：TBD
- New World / PAK'nSAVE（食品杂货连锁） | 官方 | 许可：TBD | 准确性：TBD | 周期：TBD | 备注：促销时段差异 | 状态：TBD

### 2) 燃油价格（指示性）
- 连锁官网/站点页（Z, BP, Mobil, Gull 等） | 官方 | 许可：TBD | 准确性：TBD | 日/隔日 | 备注：门店差异明显 | 状态：TBD
- 行业/政府周均价参考（若有） | 开放/官方 | 许可：TBD | 准确性：TBD | 周更 | 备注：仅作参考基线 | 状态：TBD
- Gassy（https://www.gassy.co.nz/） | 第三方众包 | 许可：深链/合作优先 | 准确性：TBD | 频率：用户更新 | 备注：不抓取 | 状态：TBD
- Gaspy | 第三方众包 | 许可：深链/合作优先 | 准确性：TBD | 频率：用户更新 | 备注：不抓取 | 状态：TBD

### 3) EV 充电桩
- 政府/开放数据门户（GeoJSON/CSV） | 开放 | 许可：TBD | 准确性：TBD | 周更 | 备注：字段标准化 | 状态：TBD
- 运营商官网/站点页（ChargeNet 等） | 官方 | 许可：TBD | 准确性：TBD | 5–15 分 | 备注：可用性多为指示性 | 状态：TBD
- 第三方平台（地图/聚合） | 第三方 | 许可：合作/深链 | 准确性：TBD | TBD | 备注：不抓取 | 状态：TBD

### 4) 餐饮优惠/订位（含 First Table）
- First Table（活动名额） | 第三方 | 许可：合作/深链 | 准确性：TBD | 频率：TBD | 备注：仅深链，不抓取 | 状态：TBD
- 商家官网/菜单/促销页 | 官方 | 许可：TBD | 准确性：TBD | 周期：TBD | 备注：选择器容错 | 状态：TBD

### 5) 基础地点（Google Places）
- Google Places API | 官方 | 许可：遵守 30 天缓存、不存照片 | 准确性：高 | 更新：按策略 | 备注：混合更新策略与清理 | 状态：使用中（合规）

---

备注：本表为“登记 + 评估”，在未完成法务与技术验证前不进行抓取或调用。所有第三方众包平台默认为“深链/合作优先，不抓取”。

---

## 详细条目（结构化）

### A) Places（地点基础数据）
- 名称：Google Places API
- 采集方式：API（Place Details/Autocomplete/Find Place）
- 成本：按调用计费（新户$300试用 + 每月$200永久免费额度）；超过按官方价目
- 更新周期：混合策略（被动触发 + 过期清理 ≤30天）；缓存遵循30天限制；不存照片
- 用途：业务基础库、检索排序、Coly 推荐上下文
- 数据表：businesses（google_place_id、cache_ts 等）、business_categories、business_hours
- 对应接口：/api/places/search、/api/places/detail（TBD）
- 合规：遵守 Google ToS；30天缓存、照片仅远程引用
- 状态：使用中（合规）
- 备注：低活跃商家过期后清理或延后再取，控制成本

### B) Specials（超市促销/指示性价格）
- 名称：Woolworths/Countdown、New World、PAK'nSAVE（官网与门店/促销页）
- 采集方式：Web Scraping（白名单选择器；尊重 robots；频控）
- 成本：边缘函数计算成本为主（低）；无第三方API费
- 更新周期：周更为主（促销周期）；热门 SKU/门店可日更抽样
- 用途：购物清单比价、周报“本周省钱”、到店提醒
- 数据表：supermarket_stores、supermarket_skus、supermarket_prices
- 对应接口：/api/coly/supermarket/weekly、/api/coly/compare
- 合规：只抓官方公开页；注明来源/更新时间；不同门店可能不同价
- 状态：TBD
- 备注：选择器容错、失败回退、价格为指示性

### C) Events（活动/演出）
- 名称：Eventfinda API、各市政官网活动页、场馆官网
- 采集方式：API（优先）+ Web Scraping（官方公开页）
- 成本：API按配额/费率；抓取计算成本低
- 更新周期：日更；临近开演高频更新（可选）
- 用途：周末/假期计划卡片、个性化推荐
- 数据表（提案）：events、event_venues、event_categories（TBD）
- 对应接口：/api/coly/events/search、/api/coly/events/nearby（TBD）
- 合规：遵守各源 ToS/版权；仅摘录必要元数据并标注来源
- 状态：TBD
- 备注：去重同一活动多源信息；票务链接深链

### D) Dining / First Table（餐饮订位/优惠名额）
- 名称：First Table、餐厅官网优惠页
- 采集方式：合作/深链（不抓取 First Table 内容）；官网公开页可抓
- 成本：合作为主；抓取计算成本低
- 更新周期：日更或小时级（名额变动较快，建议只做命中提醒+深链）
- 用途：Top500名额提醒、就餐计划建议
- 数据表：first_table_slots、deals（提案）
- 对应接口：/api/coly/first-table/slots（仅我方存量/指标性）、深链外部
- 合规：不抓取第三方受限内容；来源标注清晰
- 状态：TBD
- 备注：以深链为主，减少维护成本与合规风险

### E) Fuel（燃油价格，指示性）
- 名称：连锁官网/站点页；第三方众包（Gassy 深链、Gaspy 深链）
- 采集方式：官网公开页抓取 + 第三方深链（不抓取第三方内容）
- 成本：计算成本低；无API费
- 更新周期：日更/隔日更；城市周最低与附近更便宜×3
- 用途：通勤/出行省钱、阈值提醒、路线顺路更省
- 数据表：fuel_stations、fuel_prices、user_fuel_prefs（可选）
- 对应接口：/api/coly/fuel/nearby、/api/coly/fuel/weekly-low
- 合规：标注来源/时间；以到站价为准；第三方仅深链
- 状态：TBD
- 备注：门店差异明显，展示“指示性价”

### F) EV Charging（充电桩）
- 名称：政府/开放数据集（GeoJSON/CSV）、运营商站点页（如 ChargeNet）
- 采集方式：开放数据下载/API；官网公开页抓取（可选）；第三方深链
- 成本：开放数据多为免费；计算成本低
- 更新周期：站点基础周更；可用性（若有接口）5–15分钟指示性刷新
- 用途：附近可充/快充筛选、路线停靠建议、开通/恢复提醒
- 数据表：ev_stations、ev_connectors、ev_availability_snapshot（可选）
- 对应接口：/api/coly/ev/nearby、/api/coly/ev/route-stops（TBD）
- 合规：遵守开放许可；来源/更新时间标注
- 状态：TBD
- 备注：若无可用性接口，仅展示“指示性”并提示以官方为准

### G) Business Websites（商家网站明细：菜单/服务/价格）
- 名称：商家官网/菜单页/价目表
- 采集方式：Web Scraping（需网站存在且允许）；解析结构化信息
- 成本：计算成本中等；解析/清洗开销
- 更新周期：月更为主；热门商家半月/周更
- 用途：精准标签、服务范围、基础价位、评分解释
- 数据表：business_details（提案）、business_tags、price_points（提案）
- 对应接口：/api/coly/business/profile（TBD）
- 合规：尊重 robots/版权；仅抓取公开信息；来源标注
- 状态：TBD
- 备注：解析规则按行业定制；失败回退至摘要级信息



---

## Feeds Checklist (Live Sources)

用途：落地“可抓取的订阅/页面清单”，用于定期更新；逐步补全 URL、负责人与状态。

字段：
- 名称 | 城市/范围 | 类型(ICS/RSS/HTML/API) | URL | 频率 | 负责人 | 状态 | 备注

### A) Events（优先 ICS，其次 RSS；HTML 仅作补充）
- Auckland Council What's On | Auckland | ICS | <待填> | 日更 | <负责人> | 待确认 | 全站或分类日历
- Auckland Live（The Civic/Aotea 等） | Auckland | ICS | <待填> | 日更 | <负责人> | 待确认 | 场馆级日历
- Auckland Museum | Auckland | ICS | <待填> | 日更 | <负责人> | 待确认 | 官方活动
- Auckland Art Gallery | Auckland | ICS | <待填> | 日更 | <负责人> | 待确认 | 官方活动
- Auckland Libraries | Auckland | ICS | <待填> | 日更 | <负责人> | 待确认 | 全网活动
- WellingtonNZ Events | Wellington | ICS | <待填> | 日更 | <负责人> | 待确认 | 官方活动
- Te Papa Museum | Wellington | ICS | <待填> | 日更 | <负责人> | 待确认 | 官方活动
- Wellington City Libraries | Wellington | ICS | <待填> | 日更 | <负责人> | 待确认 | 全网活动
- Christchurch City Council What's On | Christchurch | ICS | <待填> | 日更 | <负责人> | 待确认 | 官方活动
- Christchurch City Libraries | Christchurch | ICS | <待填> | 日更 | <负责人> | 待确认 | 全网活动
- University of Auckland | Auckland | ICS | <待填> | 日更 | <负责人> | 待确认 | 校园活动
- University of Canterbury | Christchurch | ICS | <待填> | 日更 | <负责人> | 待确认 | 校园活动
- Meetup（各 Group） | Nationwide | ICS | <待填多项> | 日更 | <负责人> | 待确认 | Group 级 iCal
- Eventbrite（Organizer/Collection） | Nationwide | RSS/ICS | <待填> | 日更 | <负责人> | 待确认 | 依页面而定

提示：站点常见“Subscribe/Add to calendar/iCal”可获得 ICS；WordPress 列表页可尝试在 URL 末尾加 `/feed` 获取 RSS。

### B) Specials（品牌/门店促销；RSS 优先，无则 HTML）
- Woolworths/Countdown | Nationwide | HTML | <待填> | 周更 | <负责人> | 待接入 | 促销/门店页
- New World | Nationwide | HTML | <待填> | 周更 | <负责人> | 待接入 | 促销/门店页
- PAK'nSAVE | Nationwide | HTML | <待填> | 周更 | <负责人> | 待接入 | 促销/门店页
- 选定品牌博客/News（WordPress） | Various | RSS | <待填多项> | 日/周更 | <负责人> | 待确认 | 末尾 `/feed`
- 本地场馆/商家“Offers/News” | Various | RSS/HTML | <待填多项> | 周更 | <负责人> | 待确认 | 作为特惠线索

说明：超市普遍无 RSS；以 HTML 适配器为主。RSS 用于品牌博客/公告栏作为“特惠线索”。

### C) Places（基础地点；API）
- Google Places API（新版） | Nationwide | API | 控制台密钥 | 策略刷新 | 平台 | 使用中 | 30 天缓存；photos 仅引用
- Website seeds（from websiteUri） | Per-business | HTML/JSON-LD | 来源于 Places detail | 月更 | <负责人> | 待接入 | 解析菜单/标签/结构化数据

执行备注：
- Events：优先填充 5–10 个 ICS 源，跑 `events-scrape` dryRun 验证覆盖面，再启用入库。
- Specials：先选 2–3 个品牌做 HTML 适配器 MVP；RSS 源逐步补齐。
- Places：沿用 `places-refresh`，并择优对热门商家用 websiteUri 补齐画像信息。

