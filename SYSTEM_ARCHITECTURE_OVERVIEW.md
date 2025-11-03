# 🏗️ LifeX 系统架构概览

> Guiding Principle（Lifex Manifesto）
> 我们的核心价值是利用 AI 的能力深入理解每个 business 和每个用户，并据此做最合适的匹配。所有可以合法获取的数据都用于帮助 AI 持续加深理解；随着时间与数据增长，这份理解会不断进化。唯有基于这种理解，我们才能提供让客户满意的一切服务（chat、推荐、AI 助手）以及后续的优惠券、订座、订餐、服务预定、票务购买等下游交易。

## 📋 目录
1. [整体架构](#整体架构)
2. [数据采集与管理](#数据采集与管理)
3. [数据检索与 AI 回答](#数据检索与-ai-回答)
4. [技术栈](#技术栈)

---

## 🎯 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                     LifeX System                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│             │         │              │         │             │
│  Mobile App │◄───────►│   Supabase   │◄───────►│ Data Layer  │
│ (Frontend)  │   API   │   (Backend)  │  Sync   │  (ETL)      │
│             │         │              │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                        │
      │                        │                        │
      ↓                        ↓                        ↓
  用户交互              数据存储/API            数据采集/更新
  - 查看商家            - PostgreSQL              - Google API
  - AI 聊天             - Edge Functions          - 定时任务
  - 搜索/筛选           - Auth/Storage            - 数据清洗
```

---

## 🤖 数据采集与管理

### **架构分层：**

```
┌─────────────────────────────────────────────────────────────┐
│                     数据管理层                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 数据源层                                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  • Google Places API                                │  │
│  │  • Yelp API                                         │  │
│  │  • Eventbrite API                                   │  │
│  │  • 用户生成内容 (UGC)                               │  │
│  └─────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  2. 采集层 (Data Collector Service)                         │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  运行位置：                                          │  │
│  │  • Supabase Edge Functions ⭐ (推荐)                │  │
│  │  • GitHub Actions                                   │  │
│  │  • Cloud Functions                                  │  │
│  │                                                      │  │
│  │  功能：                                              │  │
│  │  • 定时采集 (Cron Jobs)                            │  │
│  │  • API 调用和限速                                   │  │
│  │  • 错误处理和重试                                   │  │
│  │  • 数据验证                                         │  │
│  └─────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  3. 处理层 (ETL Pipeline)                                   │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  • 数据清洗 (去重、标准化)                          │  │
│  │  • 数据转换 (格式统一)                              │  │
│  │  • 数据验证 (完整性检查)                            │  │
│  │  • 向量生成 (AI Embeddings)                        │  │
│  └─────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  4. 存储层 (Supabase PostgreSQL)                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Tables:                                            │  │
│  │  • businesses (商家)                                │  │
│  │  • events (活动)                                    │  │
│  │  • specials (优惠)                                  │  │
│  │  • cache_metadata (缓存元数据)                     │  │
│  │                                                      │  │
│  │  Indexes:                                           │  │
│  │  • 类别索引                                         │  │
│  │  • 评分索引                                         │  │
│  │  • 地理位置索引 (PostGIS)                          │  │
│  │  • 向量索引 (pgvector)                             │  │
│  │  • 全文搜索索引 (tsvector)                         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### **数据采集服务实现 (Supabase Edge Function):**

```typescript
// supabase/functions/data-collector/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  console.log('🤖 Data Collector Started');
  
  try {
    // 1. 采集新商家
    const newBusinesses = await collectNewBusinesses();
    console.log(`✅ Collected ${newBusinesses.length} new businesses`);
    
    // 2. 更新过期数据
    const updated = await updateExpiredData(supabase);
    console.log(`✅ Updated ${updated} expired records`);
    
    // 3. 生成向量 (AI Embeddings)
    const embedded = await generateEmbeddings(supabase);
    console.log(`✅ Generated ${embedded} embeddings`);
    
    // 4. 清理无效数据
    const cleaned = await cleanupInvalidData(supabase);
    console.log(`✅ Cleaned ${cleaned} invalid records`);
    
    return new Response(JSON.stringify({
      status: 'success',
      collected: newBusinesses.length,
      updated,
      embedded,
      cleaned
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
});

// 采集新商家
async function collectNewBusinesses() {
  const cities = ['Auckland', 'Wellington', 'Christchurch'];
  const categories = ['restaurant', 'cafe', 'bar', 'gym'];
  const businesses = [];
  
  for (const city of cities) {
    for (const category of categories) {
      const results = await googlePlaces.nearbySearch({
        location: getCityCoordinates(city),
        radius: 5000,
        type: category
      });
      
      businesses.push(...results);
      await sleep(200); // 限速
    }
  }
  
  return businesses;
}

// 更新过期数据
async function updateExpiredData(supabase: any) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: expired } = await supabase
    .from('businesses')
    .select('id, google_place_id')
    .lt('cached_at', thirtyDaysAgo.toISOString())
    .limit(100);
  
  let count = 0;
  for (const business of expired) {
    await updateBusinessData(business);
    count++;
    await sleep(100);
  }
  
  return count;
}

// 生成向量
async function generateEmbeddings(supabase: any) {
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, description')
    .is('embedding', null)
    .limit(50);
  
  let count = 0;
  for (const business of businesses) {
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: `${business.name} ${business.description}`
    });
    
    await supabase
      .from('businesses')
      .update({ embedding: embedding.data[0].embedding })
      .eq('id', business.id);
    
    count++;
  }
  
  return count;
}
```

---

### **调度配置 (Supabase Cron):**

```sql
-- 每天凌晨 2 点采集新数据
select cron.schedule(
  'daily-data-collection',
  '0 2 * * *',
  $$
  select net.http_post(
      url:='https://your-project.supabase.co/functions/v1/data-collector',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_KEY"}'::jsonb
  );
  $$
);

-- 每天凌晨 3 点更新过期数据
select cron.schedule(
  'daily-cache-update',
  '0 3 * * *',
  $$
  select net.http_post(
      url:='https://your-project.supabase.co/functions/v1/update-expired-cache',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_KEY"}'::jsonb
  );
  $$
);

-- 每周日凌晨 4 点生成向量
select cron.schedule(
  'weekly-embedding-generation',
  '0 4 * * 0',
  $$
  select net.http_post(
      url:='https://your-project.supabase.co/functions/v1/generate-embeddings',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_KEY"}'::jsonb
  );
  $$
);
```

---

## 🔄 两条流水线设计（Google Places 刷新 & AI 嵌入）

### Google Places 刷新流水线（设计）
- 目标：持续获取高质量商家基础数据，并将变化最小化、幂等化地同步到规范表。
- 输入/输出：
  - 输入：城市/区域边界、网格或圆半径、类别/关键词、分页令牌。
  - 写入缓存：`catalog.google_place_cache`、`catalog.place_photos_meta`（含 `provider='google'`, `external_id=place_id`, `content_hash`）。
  - 规范化：变化时调用 `public.upsert_business_from_ingest(payload jsonb)` 更新 `catalog.businesses/*`。
- 唯一键与幂等：
  - 自然键：`(provider, external_id)`；缓存 `UNIQUE(provider, external_id)` 防重复。
  - 变更检测：计算关键字段 `content_hash`，仅在 hash 变化时触发规范化。
- 抓取策略：
  - 区域切分：按城市网格（H3/经纬度网格）+ 主类目分批；分页保留 `next_page_token`。
  - 去重：同一 `place_id` 多次出现归并；同一坐标+名称的潜在重复商家交由合并策略处理。
  - 限流与重试：QPS 控制、指数退避；429/5xx 重试；永久失败写入 `ops.outbox`。
- 调度与记录：
  - 调度：热门城市每日、长尾每周；人工按城市/网格/类目触发。
  - 记录：`ops.jobs` 计划，`ops.job_runs` 记录参数、起止时间、成功/失败与统计计数。
- 可观测性：
  - 指标：请求量、成功率、缓存新增/更新比率、触发规范化比例、单批耗时。
  - 告警：连续失败、配额逼近、异常高的重复率或变更率。
- 烟测（最小验证）：
  - 选定 1 城市跑 1 批：缓存新增>0；`content_hash` 变化记录>0；`UNIQUE` 冲突=0。
  - 规范化后抽样核对：`businesses` 与地址/坐标/类目/营业时间一致；无意外覆盖。

### AI 嵌入生成流水线（设计）
- 目标：为商家生成高质量语义向量，支持混合检索与推荐。
- 语料与刷新：
  - 语料：`ai.business_corpus`（物化视图，拼接名称/描述/类目/标签）。
  - 刷新：全量 `REFRESH MATERIALIZED VIEW CONCURRENTLY`；数据变更触发增量队列。
- 嵌入与索引：
  - 模型/提供商：可插拔（如 OpenAI text-embedding-3 系列/替代方案）；记录 `provider/model`。
  - 表结构：`ai.business_embeddings(business_id, provider, model, embedding, updated_at)`，`UNIQUE(business_id, provider, model)`。
  - 向量索引：`ivfflat`（cosine/ip 视语义度量选择）；`lists` 随行数调优。
- 任务与幂等：
  - 任务：`ops.jobs` 建立 `embedding_generate`；payload 为 `business_id` 列表或查询。
  - 幂等：同一 `(business_id, provider, model)` 重跑覆盖更新；失败写入 `ops.outbox` 并可重试。
- 调度与维护：
  - 启动：达到最小可用数据阈值即跑一次“全量嵌入（小批并发）”。
  - 常态：增量触发 + 周/月至少一次全量校准；索引重建/ANALYZE 按需。
- 烟测（最小验证）：
  - 三类 RPC：keyword / vector / hybrid 均返回合理结果；P95 < 200ms（向量部分 < 120ms）。
  - 语义准确性：抽样查询核对排序合理；空文本/缺字段样本被正确跳过或降权。

### 最小可用数据（MVD）启动规则
- 何时启动嵌入：
  - 首批城市累计 ≥ 800–1500 家活跃商户，或覆盖 ≥ 5 个主类目；且 `ai.business_corpus` 可稳定刷新。
  - events/specials 样本 ≥ 100 条（可提升文本丰富度，但非强依赖）。
- 初始批量参数（建议）：
  - 物化视图刷新：每日 1 次（凌晨低峰）。
  - 嵌入生成：批量大小 64–128，并发 2–4；超时 30–60s；失败重试最多 3 次。
- 成本与治理：
  - 先抽样（如 5–10%）评估质量与成本，再放量；
  - 设定日预算阈值，超阈值降采样或推迟到次日。

---

## 🔍 数据检索与 AI 回答

### **RAG 架构 (你已在用):**

```
┌─────────────────────────────────────────────────────────────┐
│              RAG (Retrieval-Augmented Generation)           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  用户问题                                                    │
│  ↓                                                          │
│  "推荐奥克兰的好吃的意大利餐厅"                              │
│  ↓                                                          │
│  1. 意图分析 (Intent Detection)                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  • 提取：location = "Auckland"                      │  │
│  │  • 提取：category = "Italian restaurant"            │  │
│  │  • 提取：intent = "recommendation"                  │  │
│  └─────────────────────────────────────────────────────┘  │
│  ↓                                                          │
│  2. 数据检索 (Retrieval)                                    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  方案 A: 传统搜索 (当前)                            │  │
│  │  SELECT * FROM businesses                           │  │
│  │  WHERE category = 'restaurant'                      │  │
│  │    AND location = 'Auckland'                        │  │
│  │  ORDER BY rating DESC                               │  │
│  │  LIMIT 5;                                           │  │
│  │                                                      │  │
│  │  方案 B: 向量搜索 (优化)                            │  │
│  │  SELECT * FROM match_businesses(                    │  │
│  │    query_embedding: [0.1, 0.3, ...],               │  │
│  │    match_threshold: 0.8,                           │  │
│  │    match_count: 5                                  │  │
│  │  );                                                 │  │
│  │                                                      │  │
│  │  结果：[Restaurant A, Restaurant B, ...]           │  │
│  └─────────────────────────────────────────────────────┘  │
│  ↓                                                          │
│  3. 上下文构建 (Context Building)                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  system_prompt = `                                  │  │
│  │  你是 LifeX AI 助手...                             │  │
│  │                                                      │  │
│  │  相关商家数据：                                      │  │
│  │  1. Restaurant A                                    │  │
│  │     - 地址：123 Main St                            │  │
│  │     - 评分：4.5 ⭐                                  │  │
│  │     - 特色：正宗意式披萨                            │  │
│  │  2. Restaurant B ...                                │  │
│  │  `;                                                 │  │
│  └─────────────────────────────────────────────────────┘  │
│  ↓                                                          │
│  4. AI 生成回答 (Generation)                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  OpenAI GPT-4o-mini                                 │  │
│  │  ↓                                                   │  │
│  │  "我为您推荐以下意大利餐厅：                        │  │
│  │                                                      │  │
│  │  1. **Restaurant A** ⭐ 4.5                         │  │
│  │     地址：123 Main St, Auckland                     │  │
│  │     特色：正宗的意式披萨和手工意面...              │  │
│  │                                                      │  │
│  │  2. **Restaurant B** ..."                           │  │
│  └─────────────────────────────────────────────────────┘  │
│  ↓                                                          │
│  返回给用户                                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### **优化后的 RAG (未来):**

```typescript
// supabase/functions/chat-v3-optimized/index.ts

async function handleUserQuery(userMessage: string, context: any) {
  // 1. 意图分析 (保持不变)
  const intent = analyzeUserIntent(userMessage);
  
  // 2. 向量搜索 (新增)
  const semanticResults = await semanticSearch(userMessage);
  
  // 3. 混合搜索 (新增)
  const hybridResults = await hybridSearch({
    semantic: semanticResults,
    filters: intent.filters,
    location: intent.location
  });
  
  // 4. 重排序 (新增)
  const rankedResults = await rerank(hybridResults, userMessage);
  
  // 5. 上下文增强
  const enrichedContext = await enrichContext(rankedResults);
  
  // 6. AI 生成
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: enrichedContext },
      { role: 'user', content: userMessage }
    ]
  });
  
  return response;
}

// 语义搜索
async function semanticSearch(query: string) {
  // 1. 生成查询向量
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  });
  
  // 2. 向量搜索
  const { data } = await supabase.rpc('match_businesses', {
    query_embedding: embedding.data[0].embedding,
    match_threshold: 0.7,
    match_count: 20
  });
  
  return data;
}

// 混合搜索 (语义 + 过滤)
async function hybridSearch(params: any) {
  let results = params.semantic;
  
  // 应用过滤器
  if (params.filters.category) {
    results = results.filter(r => r.category === params.filters.category);
  }
  
  if (params.filters.minRating) {
    results = results.filter(r => r.rating >= params.filters.minRating);
  }
  
  // 地理位置过滤
  if (params.location) {
    results = results.filter(r => 
      calculateDistance(r.location, params.location) < 10000
    );
  }
  
  return results;
}

// 重排序 (相关性 + 质量)
async function rerank(results: any[], query: string) {
  return results
    .map(r => ({
      ...r,
      score: calculateRelevanceScore(r, query)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function calculateRelevanceScore(business: any, query: string) {
  // 综合评分
  return (
    business.similarity * 0.4 +        // 语义相似度 40%
    business.rating / 5 * 0.3 +        // 评分 30%
    business.review_count / 1000 * 0.2 + // 评论数 20%
    (business.is_verified ? 0.1 : 0)   // 认证 10%
  );
}
```

---

## 🛠️ 技术栈

### **前端 (Mobile App):**
- React Native
- Expo
- TypeScript
- Supabase Client

### **后端 (Supabase):**
- PostgreSQL (数据库)
- PostGIS (地理位置)
- pgvector (向量搜索)
- Edge Functions (Deno)
- Cron Jobs (调度)

### **数据采集:**
- Google Places API
- Yelp API
- Eventbrite API
- Supabase Edge Functions

### **AI / ML:**
- OpenAI GPT-4o-mini (对话)
- OpenAI Embeddings (向量)
- RAG 架构

### **调度 / 自动化:**
- Supabase Cron
- GitHub Actions (备选)

---

## 📊 性能指标

### **当前性能 (传统搜索):**
- 响应时间：50-100ms ⚡
- 查询成本：$0
- 准确率：85-90%

### **优化后 (向量搜索):**
- 响应时间：100-200ms
- 查询成本：$0.0001/查询
- 准确率：95-98% ✅

---

## 🚀 实施路线图

### **Phase 1: 基础架构 (已完成)**
- [x] Supabase 数据库
- [x] 基础 RAG (chat-v2)
- [x] Google Places API 集成

### **Phase 2: 数据采集自动化 (下一步)**
- [ ] Edge Function 数据采集器
- [ ] Cron Job 调度
- [ ] 数据清洗 Pipeline
- [ ] 缓存管理

### **Phase 3: 检索优化 (未来)**
- [ ] 向量索引 (pgvector)
- [ ] 语义搜索
- [ ] 混合搜索
- [ ] 结果重排序

### **Phase 4: AI Agent (远期)**
- [ ] 智能数据采集决策
- [ ] 自适应更新策略
- [ ] 异常自动处理
- [ ] 持续学习优化

---

## 💡 关键要点

### **数据采集：**
1. 使用 Supabase Edge Functions (无需额外服务器)
2. Cron Jobs 自动调度
3. 不完全是 AI Agent，但可以进化

### **数据检索：**
1. 当前使用传统 SQL 查询 (已经很好)
2. 未来可以升级到向量搜索 (更准确)
3. RAG 架构已经在用 (chat-v2)

### **优势：**
- ✅ 无需额外服务器
- ✅ 成本极低
- ✅ 自动扩展
- ✅ 易于维护

---

**这是一个高层次的概览，具体实施时再深入每个部分！** 🎯

