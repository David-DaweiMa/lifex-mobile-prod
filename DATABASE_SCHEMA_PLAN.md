## 数据库结构规划（当前版）

> 核心纲领：我们的核心价值是利用 AI 深入理解每个 business 与每个用户，并据此做最合适的匹配。所有可合法获取的数据都用于帮助 AI 持续加深理解；随着时间与数据增长，这份理解会不断进化。以此为前提设计 Schema、视图与 RPC。

### 设计目标
- 最小权限与分层访问：底表放在领域 Schema，App 仅读 `public` 视图；写入经由 RPC。
- 清晰边界：PII 仅在 `core`；商家事实在 `catalog`；UGC/抓取在 `content`；互动在 `social`。
- 全表启用 RLS：默认拒绝；仅对必要主体开放精确策略。

### 领域 Schema 与职责
- core：用户标识与内部运营
  - user_profiles（最小资料，依赖 auth.users 邮箱/手机）
- catalog：商家目录与时效信息
  - businesses, business_locations, business_hours, categories, business_category_links
  - events, specials
  - google_place_cache, place_photos_meta
  - business_curated, business_owner_updates
  - business_aliases, business_merge_map
  - tags, tag_aliases, business_tag_links
  - business_attributes（AI/抓取/Owner 的结构化属性，含 source/confidence）
  - event_curated, event_scrape_cache, special_scrape_cache（抓取缓存与人工覆盖）
- content：用户生成内容/编辑内容
  - reviews
- social：关系与互动
  - favorites
- ai：向量与检索
  - business_embeddings, review_embeddings
- ops：任务与运行
  - jobs, job_runs（在 COLY_DDL 中定义）
- billing：计费与订阅
  - customers, products, prices, subscriptions, payments（在 BILLING_DDL 中定义）

标签标准化（已采用）
- 规范表：catalog.tags, catalog.tag_aliases, catalog.business_tag_links
- 说明：旧的自由文本 `business_tags` 仅作为过渡/比对，不作为主写入通道

### 最小可用表集（Phase A 已落地于 DDL_DRAFT_INITIAL.sql）
- core.user_profiles（与 auth.users 对齐）
- catalog.businesses, business_locations, business_hours, categories, business_category_links
- catalog.events, specials
- catalog.google_place_cache, place_photos_meta
- catalog.business_curated, business_owner_updates
- catalog.tags, tag_aliases, business_tag_links, business_attributes
- content.reviews
- social.favorites

### 访问模式
- 前端读取：仅通过 `public` 视图
  - public.business_list, public.business_page, public.events_page, public.deals_page, public.business_profile
- 前端写入：仅通过 RPC
  - public.add_favorite(uuid), public.remove_favorite(uuid)
  - public.add_review(uuid,int,text)
  - public.submit_business_update(uuid,jsonb)
- 采集/运维写入（Google/抓取）：service 后端或仅 `service_role` 可执行的 RPC
  - public.upsert_business_from_ingest(text,text,text,text)
  - public.promote_scraped_event(uuid), public.promote_scraped_special(uuid)

### 安全模型
- 领域底表均启用 RLS：默认拒绝
- 策略示例：
  - core.user_profiles：本人可读/更；插入/删除仅后端
  - content.reviews：任何人可读；作者可增改删
  - social.favorites：本人可读；本人可增删
  - catalog.*：authenticated 可读；写入仅后端（service_role）
- public 视图：去除 PII；授予 anon/authenticated 只读
- RPC：用户动作授予 authenticated；仅服务写入的 RPC 检查 `auth.role()='service_role'`

### Public 视图（当前）
- business_list：列表卡片所需字段 + 聚合指标
- business_page：详情页（主地址、评分聚合）
- events_page：活动 + 场地信息
- deals_page：有效期内优惠 + 商家
- business_profile：多源合并（owner_approved → curated → base → google_cache）

### RPC 列表（当前）
- add_favorite(uuid), remove_favorite(uuid)
- add_review(uuid,int,text)
- submit_business_update(uuid,jsonb), moderate_business_update(uuid,boolean)[service]
- upsert_business_from_ingest(text,text,text,text)[service]
- promote_scraped_event(uuid)[service], promote_scraped_special(uuid)[service]

### 下一步
- 执行 AI 与搜索 RPC（`AI_SCHEMA_DRAFT.sql`, `AI_SEARCH_RPCS.sql`）
- 执行 Coly DDL 与 Billing DDL（ops/billing 表、视图与 RPC）
- 视图契约冻结后，推进迁移脚本 `MIGRATE_DATA_FROM_OLD.sql`


