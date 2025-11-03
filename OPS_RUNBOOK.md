# 🧭 Ops Runbook — Google Places 刷新 & AI 嵌入

本运行手册覆盖两条流水线的日常操作、手动触发、烟测、回滚与故障排查。

## 1. 环境变量与密钥
- SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
- GOOGLE_PLACES_API_KEY
- EMBEDDING_PROVIDER (e.g., openai)
- OPENAI_API_KEY 或对应提供商密钥
- RATE_LIMIT_QPS / BATCH_SIZE / CONCURRENCY

## 2. 调度策略
- Google Places 刷新：热门城市每日，长尾每周；支持按城市/网格/类目手动触发。
- Events/Specials 抓取：核心来源每周 2-3 次，热点站点可每日；支持按站点/城市手动触发。
- 语料刷新：每日低峰 `REFRESH MATERIALIZED VIEW CONCURRENTLY ai.business_corpus`。
- 嵌入生成：增量实时 + 周/月一次全量校准；索引维护按需执行。

## 3. 常用操作
### 3.1 手动刷新语料
执行 `database/AI_CORPUS_REFRESH.sql`：

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY ai.business_corpus;
ANALYZE ai.business_corpus;
```

### 3.2 维护向量索引
执行 `database/AI_EMBEDDING_INDEX_MAINTENANCE.sql`（必要时在维护窗口重建索引，调整 lists）。

### 3.3 手动触发 Google Places 抓取
- 通过作业系统：创建 `ops.jobs` 记录（城市/网格/类目），或调用 Edge Function/Worker HTTP 入口。
- 预期写入：`catalog.google_place_cache`、`catalog.place_photos_meta`，并按需调用 `public.upsert_business_from_ingest`。

### 3.4 手动触发 Events/Specials 抓取
- 方式：创建 `ops.jobs`（来源站点、城市/站点 URL、抓取窗口），或调用 Edge Function/Worker HTTP 入口。
- 预期写入：`catalog.event_scrape_cache`、`catalog.special_scrape_cache`，随后触发 `public.promote_scraped_event/special` 或由 `moderate_*` 入主表。

## 4. 烟测清单（最小验证）
- Cache 写入：
  - `SELECT count(*) FROM catalog.google_place_cache WHERE fetched_at > now() - interval '1 hour';`
  - 重复键冲突应为 0。
- 规范化：
  - 样本核对 `catalog.businesses` 与地址/坐标/类目/营业时间。
- 语料与嵌入：
  - `SELECT count(*) FROM ai.business_corpus;`
  - 检查空/短文本占比 < 合理阈值；
  - 向量检索 RPC（keyword/vector/hybrid）抽样返回合理排序，P95 < 200ms。

- Events/Specials：
  - `SELECT count(*) FROM catalog.event_scrape_cache WHERE fetched_at > now() - interval '24 hours';`
  - 随机抽样 10 条用 `promote_*` 入主表并在 `public.events_page/public.deals_page` 中可见。
  - 违例应返回 forbidden（非 service_role 调用 `promote_*`）。

## 5. 回滚与降级
- 临时停止调度（Cron/作业）；
- 降级至 keyword 检索路径；
- 必要时删除并重建向量索引；
- 恢复后逐步放量（降低并发与批量）。

## 6. 故障排查
- 作业记录：`ops.job_runs`（参数、耗时、成功/失败计数）；
- 失败事件：`ops.outbox`（类别、重试建议）；
- 常见问题：
  - API 429/配额：降低 QPS、指数退避、改时间窗；
  - 数据异常：`content_hash` 不变导致不触发规范化 → 检查映射与哈希字段；
  - 嵌入失败：空文本、超时、限额 → 缩小 batch、减少并发、增加重试；
  - 慢查询：检查 `ivfflat` 列表参数、ANALYZE 是否更新、过滤是否走索引。

## 7. 何时迁移到 Cloud Run/Functions（迁移判据）
- 时长/并发：单次任务 > 5 分钟或需要高并发/并行处理，且 Edge Function 有时长限制。
- 依赖：需要 Node/Python 第三方库（如 Puppeteer、Playwright、重型解析/ML），Edge 环境不易支持。
- 吞吐/配额：高吞吐批处理导致 Edge Cron/配额吃紧，需要弹性伸缩与更强配额。
- 成本/隔离：希望与前端后端隔离部署，独立计费、资源隔离与扩缩容策略。

### 迁移方式（保持入口不变）
- 将抓取/嵌入逻辑封装为 HTTP 入口（参数：城市/网格/站点/窗口），Cloud Scheduler 定时 POST 调用。
- 保持数据库交互通过 `service_role`/RPC，沿用 `ops.jobs/job_runs` 记录与告警；
- 容器化（Docker）+ 挂载配置（环境变量/Secret Manager），分阶段放量迁移。

---

此手册为骨架，后续随实现细节迭代补充参数与命令。


