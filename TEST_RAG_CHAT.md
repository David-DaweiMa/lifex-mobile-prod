# 🧪 RAG Chat 测试指南

**目标：** 验证 AI 是否使用数据库中的真实数据

---

## ✅ 已完成

1. ✅ 部署了 `chat-v2` Edge Function（含 RAG）
2. ✅ 修改了 `chatService.ts` 调用 `chat-v2`
3. ✅ 添加了 debug 日志输出

---

## 🧪 测试步骤

### 测试 1：商家推荐（Business）

#### 在 Chat 页面输入：
```
"Best coffee shops in Auckland?"
```

#### 预期结果：

**✅ 成功（使用了数据库数据）：**
```
AI 回复：
"G'day! Here are some top-rated coffee shops:

1. **The Little Larder** (4.8⭐) in Ponsonby
   📍 123 Ponsonby Rd
   ☎️ 09-123-4567
   Known for their artisan coffee...

2. **Atomic Coffee Roasters** (4.7⭐) in Mt Eden
   📍 456 Mt Eden Rd
   Great single-origin beans...

3. **Eighthirty Coffee** (4.6⭐) in CBD
   📍 789 Queen St
   Perfect for a quick espresso..."

日志输出：
LOG  ✅ AI Response from Supabase (chat-v2 with RAG): {
  "messageLength": 740,
  "followUpCount": 3,
  "usage": {...},
  "debug": {
    "intent": "business",
    "hasContextData": true,  // ← 关键！表示使用了数据库
    "dataSourcesUsed": ["business"]
  }
}
```

**❌ 失败（没有使用数据库）：**
```
AI 回复：
"Auckland has many great coffee shops. Popular areas 
include Ponsonby, Mt Eden, and the CBD."

日志输出：
LOG  ✅ AI Response from Supabase (chat-v2 with RAG): {
  "debug": {
    "intent": "business",
    "hasContextData": false,  // ← 表示没有查到数据
    "dataSourcesUsed": []
  }
}
```

---

### 测试 2：活动查询（Event）

#### 输入：
```
"What events are happening this weekend?"
```

#### 预期结果：

**✅ 成功：**
- AI 回复包含真实活动名称、日期、地点
- 日志显示 `"intent": "event"` 和 `"hasContextData": true`

**示例：**
```
"Here are some events this weekend:

1. **Auckland Night Markets** - Fri-Sun
   📍 Victoria Park
   💰 Free entry
   Food stalls and live music...

2. **Art Gallery Exhibition** - Sat 2pm
   📍 Auckland Art Gallery
   💰 $15
   Contemporary NZ artists..."
```

---

### 测试 3：优惠查询（Special）

#### 输入：
```
"Any good deals right now?"
```

#### 预期结果：

**✅ 成功：**
- AI 回复包含真实优惠信息、折扣百分比、有效期
- 日志显示 `"intent": "special"` 和 `"hasContextData": true`

**示例：**
```
"Here are the best deals available:

1. **50% OFF Brunch** at The Cafe
   Valid until: Oct 31
   Max 4 people

2. **30% OFF Dinner** at Italian Place
   Valid until: Nov 15
   Mon-Thu only

3. **Buy 1 Get 1 Free Coffee** at Bean Bar
   Valid until: Oct 20
   Morning only"
```

---

### 测试 4：通用查询（General）

#### 输入：
```
"Tell me about Auckland"
```

#### 预期结果：

**✅ 正常：**
- AI 回复通用信息（因为不是商家/活动/优惠查询）
- 日志显示 `"intent": "general"` 和 `"hasContextData": false`

这是正常的！通用问题不会触发数据库查询。

---

## 📊 关键指标对比

### 旧版 (`chat`) - 无 RAG

```javascript
{
  "messageLength": 400,
  "followUpCount": 3,
  "usage": {...}
  // ❌ 没有 debug 信息
  // ❌ 不知道是否使用了数据库
  // ❌ 回复都是通用建议
}
```

### 新版 (`chat-v2`) - 有 RAG

```javascript
{
  "messageLength": 740,
  "followUpCount": 3,
  "usage": {...},
  "debug": {
    "intent": "business",          // ✅ 意图识别
    "hasContextData": true,        // ✅ 使用了数据库数据
    "dataSourcesUsed": ["business"] // ✅ 数据来源
  }
}
```

---

## 🎯 验证清单

测试完成后，确认以下项目：

- [ ] **测试 1（咖啡店）：** AI 回复包含具体商家名称、地址、评分
- [ ] **测试 1 日志：** `hasContextData: true` 和 `intent: "business"`
- [ ] **测试 2（活动）：** AI 回复包含真实活动信息
- [ ] **测试 2 日志：** `hasContextData: true` 和 `intent: "event"`
- [ ] **测试 3（优惠）：** AI 回复包含真实优惠信息
- [ ] **测试 3 日志：** `hasContextData: true` 和 `intent: "special"`
- [ ] **响应速度：** 2-3 秒内返回（首次可能稍慢）
- [ ] **Follow-up 问题：** 每次都生成 3 个相关后续问题

---

## 🐛 问题排查

### 问题 1：`hasContextData: false`（没有查到数据）

**可能原因：**
1. 数据库表为空（`businesses`/`events`/`specials`）
2. Service Role Key 未配置或错误
3. 数据状态不符（`status != 'active'` 或 `is_active != true`）

**排查步骤：**

#### 检查数据库是否有数据：
1. 打开 Supabase Dashboard
2. 进入 **Table Editor**
3. 查看 `businesses` 表是否有记录
4. 确认 `status` 字段为 `'active'`
5. 查看 `events` 表是否有未来的活动（`date >= 今天`）
6. 查看 `specials` 表是否有有效优惠（`is_active = true` 且 `valid_until >= 今天`）

#### 检查 Edge Function 环境变量：
1. 在 Dashboard → Edge Functions → chat-v2 → Secrets
2. 确认 4 个环境变量都已配置：
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`

#### 查看 Edge Function 日志：
1. 在 Dashboard → Edge Functions → chat-v2 → Logs
2. 查找错误信息
3. 检查是否有数据库查询错误

---

### 问题 2：返回错误 "OPENAI_API_KEY is not configured"

**解决：**
1. 在 Dashboard → Edge Functions → chat-v2 → Secrets
2. 添加 `OPENAI_API_KEY`
3. 重新部署函数（或等待自动重启）

---

### 问题 3：冷启动慢（首次调用 5-10 秒）

**正常现象！**

Edge Function 首次调用需要启动时间。后续调用会很快（< 2 秒）。

---

### 问题 4：意图识别错误

**示例：** 问 "coffee shops" 但 `intent` 是 `"general"`

**原因：** 关键词没有匹配到

**解决：** 在 `chat-v2/index.ts` 的 `analyzeUserIntent` 函数中添加更多关键词。

---

### 问题 5：AI 回复仍然是通用建议（即使 `hasContextData: true`）

**可能原因：** OpenAI 没有正确使用提供的数据

**排查：**
1. 检查 Edge Function Logs，看 `contextData` 是否正确构建
2. 可能需要调整 system prompt，让 AI 更优先使用真实数据

---

## 📈 成功案例对比

### ❌ 旧版回复（无数据库）

```
用户: "Best coffee shops in Auckland?"

AI: "Auckland has many excellent coffee shops! Some popular 
areas known for great coffee include:

- Ponsonby Road - trendy cafes and brunch spots
- K Road - eclectic mix of independent cafes
- Mt Eden Village - local favorites
- CBD - convenient for workers

Would you like recommendations for a specific area?"
```

**问题：**
- ❌ 没有具体商家名称
- ❌ 没有地址或联系方式
- ❌ 没有评分
- ❌ 用户需要再次询问

---

### ✅ 新版回复（有数据库）

```
用户: "Best coffee shops in Auckland?"

AI: "G'day! Here are some top-rated coffee shops in Auckland:

1. **The Little Larder** (4.8⭐) in Ponsonby
   📍 123 Ponsonby Rd, Auckland
   ☎️ 09-123-4567
   Known for their artisan coffee and all-day brunch menu. 
   Cozy atmosphere perfect for meetings or remote work.

2. **Atomic Coffee Roasters** (4.7⭐) in Mt Eden
   📍 456 Mt Eden Rd, Auckland
   ☎️ 09-234-5678
   Local favorite with excellent single-origin beans roasted 
   on-site. Great outdoor seating area.

3. **Eighthirty Coffee** (4.6⭐) in CBD
   📍 789 Queen St, Auckland
   ☎️ 09-345-6789
   Perfect for a quick espresso on your way to work. 
   Specialty coffee and pastries.

Would you like opening hours or directions to any of these?"
```

**优势：**
- ✅ 具体商家名称
- ✅ 真实地址和电话
- ✅ 真实评分
- ✅ 详细描述
- ✅ 用户可以直接行动

---

## 🎯 下一步优化（可选）

如果测试成功，可以考虑：

### 1. 添加更多意图类型
```typescript
// 在 analyzeUserIntent 中添加
if (lowerMessage.match(/gym|fitness|workout|yoga/)) {
  return { intent: 'fitness', ... };
}
```

### 2. 地理位置过滤
```typescript
// 基于用户位置推荐附近的商家
.lt('distance', 5) // 5km 内
```

### 3. 价格过滤
```typescript
// 基于用户预算推荐
if (intent.keywords.includes('cheap') || intent.keywords.includes('budget')) {
  query = query.lte('price_level', 2);
}
```

### 4. 向量搜索（高级）
```sql
-- 使用 pgvector 进行语义搜索
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE businesses ADD COLUMN embedding vector(1536);
```

---

## ✅ 成功标准

**测试通过条件：**

1. ✅ 至少 1 个测试用例返回 `hasContextData: true`
2. ✅ AI 回复包含具体商家/活动/优惠名称
3. ✅ 响应时间 < 5 秒（冷启动）或 < 2 秒（热启动）
4. ✅ 日志显示正确的意图识别
5. ✅ 无错误信息

**如果满足以上条件 → RAG 部署成功！** 🎉

---

## 📞 需要帮助？

如果遇到问题：

1. **检查日志：** 查看 `debug` 对象内容
2. **查看 Edge Function Logs：** Dashboard → Edge Functions → chat-v2 → Logs
3. **验证数据库：** Table Editor 确认有数据
4. **检查环境变量：** Secrets 配置正确

---

**祝测试顺利！** 🚀

