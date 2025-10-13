# 🚀 快速部署清单 - Edge Function (chat-v2)

**⏱️ 预计时间：** 10 分钟  
**🎯 目标：** 让 AI 使用真实数据库数据推荐

---

## 📋 部署步骤（按顺序操作）

### ✅ 步骤 1：打开 Supabase Dashboard

1. 访问：https://supabase.com/dashboard
2. 登录账户
3. 选择项目：**lifex-mobile-prod**

---

### ✅ 步骤 2：进入 Edge Functions

1. 左侧菜单点击 **Edge Functions**
2. 点击 **Create a new function** 按钮
3. 输入：
   - **Name:** `chat-v2`
   - **Description:** `AI Chat with RAG`
4. 点击 **Create**

---

### ✅ 步骤 3：粘贴代码

#### 3.1 复制代码
1. 打开文件：`supabase/functions/chat-v2/index.ts`
2. 全选并复制（Ctrl+A → Ctrl+C）

#### 3.2 粘贴到 Dashboard
1. 在 Dashboard 编辑器中，**删除所有默认代码**
2. **粘贴**刚才复制的代码（Ctrl+V）
3. 点击 **Deploy** 或 **Save** 按钮

---

### ✅ 步骤 4：配置环境变量（重要！）

#### 4.1 找到 Secrets 设置
1. 在 `chat-v2` 函数页面
2. 找到 **Settings** 或 **Secrets** 标签
3. 点击 **Add Secret** 或 **New Secret**

#### 4.2 添加以下 4 个环境变量：

| Key（名称） | Value（值） | 从哪里获取？ |
|------------|------------|-------------|
| `SUPABASE_URL` | `https://muuzilttuddlljumoiig.supabase.co` | 固定值 |
| `SUPABASE_SERVICE_ROLE_KEY` | `[见下方说明]` | Dashboard → Settings → API |
| `OPENAI_API_KEY` | `[从您的 .env 复制]` | 您的 OpenAI 账户 |
| `OPENAI_MODEL` | `gpt-5-nano` | 固定值 |

#### 如何获取 Service Role Key？

1. 在 Supabase Dashboard 左侧点击 **Settings**
2. 点击 **API** 
3. 找到 **service_role** 部分（标记为 secret）
4. 点击 **Reveal** 或 **Copy**
5. 复制完整的 key

**示例格式：**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11dXppbHR0dWRkbGxqdW1vaWlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NzU5MjAwMCwiZXhwIjoyMDEzMTY4MDAwfQ.xxxxxxxxxxxxxxxxxxxxx
```

⚠️ **警告：** Service Role Key 拥有完全数据库权限，务必保密！

---

### ✅ 步骤 5：测试 Edge Function

#### 5.1 在 Dashboard 中测试

1. 在 `chat-v2` 函数页面，找到 **Invoke** 或 **Test** 按钮
2. 输入测试数据：

```json
{
  "message": "Best coffee shops in Auckland?",
  "conversationHistory": [],
  "userId": "test-user"
}
```

3. 点击 **Send** 或 **Invoke**

#### 5.2 验证响应

**✅ 成功的响应应该包含：**

```json
{
  "message": "G'day! Here are some top-rated coffee shops:\n\n1. **The Little Larder** (4.8⭐) in Ponsonby\n   📍 123 Ponsonby Rd | ☎️ 09-123-4567\n   Known for their artisan coffee...",
  "followUpQuestions": [
    "What are their opening hours?",
    "Do they have outdoor seating?",
    "Best brunch spots nearby?"
  ],
  "usage": {
    "total_tokens": 567
  },
  "debug": {
    "intent": "business",
    "hasContextData": true,
    "dataSourcesUsed": ["business"]
  }
}
```

**重点检查：**
- ✅ `message` 包含具体商家名称、地址、评分
- ✅ `debug.hasContextData` = `true`（表示使用了数据库数据）
- ✅ `debug.intent` = `"business"`（意图识别正确）
- ✅ `debug.dataSourcesUsed` 不为空

**❌ 如果看到通用建议（失败）：**
```json
{
  "message": "Auckland has many great coffee shops. Try areas like Ponsonby...",
  "debug": {
    "hasContextData": false  // ← 表示没有查到数据
  }
}
```

**原因可能是：**
- 环境变量未配置正确
- Service Role Key 错误
- 数据库表为空

---

### ✅ 步骤 6：在移动应用中测试

#### 6.1 修改调用代码

打开文件：`src/services/chatService.ts`

找到这一行：

```typescript
const { data, error } = await supabase.functions.invoke('chat', {
```

临时改为：

```typescript
const { data, error } = await supabase.functions.invoke('chat-v2', {
```

#### 6.2 重新加载应用

在终端按 `r` 键重新加载应用。

#### 6.3 测试对话

在 Chat 页面输入：
```
"Best coffee shops in Auckland?"
```

**预期结果：**
- ✅ AI 回复包含真实商家名称
- ✅ 包含地址、评分、电话
- ✅ 不是通用建议

#### 6.4 查看日志

检查终端日志应该显示：

```
LOG  ✅ AI Response from Supabase: {
  "followUpCount": 3,
  "messageLength": 740,
  "usage": {...},
  "debug": {
    "intent": "business",
    "hasContextData": true,
    "dataSourcesUsed": ["business"]
  }
}
```

---

## 🎯 效果对比

### ❌ 旧版（chat）- 通用建议

```
用户: "Best coffee shops in Auckland?"

AI: "Auckland has many great coffee shops! 
Some popular areas include:
- Ponsonby Road
- Karangahape Road (K Road)
- Mt Eden Village
- The CBD area

Would you like recommendations for a specific area?"
```

👆 **没有具体商家信息**

---

### ✅ 新版（chat-v2）- 真实数据推荐

```
用户: "Best coffee shops in Auckland?"

AI: "G'day! Here are some top-rated coffee shops:

1. **The Little Larder** (4.8⭐) in Ponsonby
   📍 123 Ponsonby Rd
   ☎️ 09-123-4567
   Known for their artisan coffee and cozy atmosphere.

2. **Atomic Coffee Roasters** (4.7⭐) in Mt Eden
   📍 456 Mt Eden Rd
   ☎️ 09-234-5678
   Local favorite with excellent single-origin beans.

3. **Eighthirty Coffee** (4.6⭐) in CBD
   📍 789 Queen St
   ☎️ 09-345-6789
   Perfect for a quick espresso on your way to work.

Would you like opening hours or directions?"
```

👆 **基于真实数据库数据的推荐**

---

## 🐛 常见问题

### 问题 1：测试时返回错误 "OPENAI_API_KEY is not configured"

**解决：**
1. 检查 Secrets 中是否添加了 `OPENAI_API_KEY`
2. 确认 Key 值正确（没有多余空格）
3. 重新部署函数

---

### 问题 2：`hasContextData: false`（没有查到数据）

**可能原因：**
- 数据库表（`businesses`/`events`/`specials`）为空
- Service Role Key 未配置或错误
- 查询条件不匹配

**排查：**
1. 在 Dashboard → Table Editor 检查是否有数据
2. 验证 Service Role Key 是否正确复制
3. 查看 Edge Function Logs

---

### 问题 3：冷启动超时（首次调用慢）

**正常现象！** 首次调用需要 5-10 秒启动。

**解决：** 等待几秒后重试，后续调用会很快（< 2秒）。

---

### 问题 4：部署后仍然返回通用建议

**检查清单：**
- [ ] 确认调用的是 `chat-v2`（不是 `chat`）
- [ ] 4 个环境变量都已配置
- [ ] Service Role Key 正确
- [ ] 数据库表有数据
- [ ] Edge Function 已成功部署

---

## ✅ 验证清单

部署完成后，确认以下所有项目：

- [ ] `chat-v2` 函数在 Dashboard 显示为 **Active**
- [ ] 4 个 Secrets 都已添加（SUPABASE_URL, SERVICE_ROLE_KEY, OPENAI_API_KEY, OPENAI_MODEL）
- [ ] Dashboard 测试返回 `hasContextData: true`
- [ ] 响应包含具体商家名称、地址、评分
- [ ] `debug.intent` 正确识别（business/event/special）
- [ ] Follow-up questions 生成成功
- [ ] 移动应用中测试成功
- [ ] 日志显示 "AI Response from Supabase"

---

## 🚀 部署成功后

### 如果效果满意，可以替换旧版：

#### 方案 A：在代码中永久切换

`src/services/chatService.ts` 中保持使用 `chat-v2`。

#### 方案 B：重命名函数（可选）

1. 在 Dashboard 重命名 `chat-v2` → `chat`（删除旧的 `chat`）
2. 代码保持调用 `chat`

---

## 📊 预期提升

| 指标 | 提升 |
|------|------|
| **推荐准确性** | 🚀 10x |
| **用户价值** | 🚀 5-10x |
| **响应质量** | 🚀 真实数据 vs 通用建议 |
| **用户满意度** | 🚀 显著提升 |

---

## 📚 更多信息

- **`DEPLOY_EDGE_FUNCTION_GUIDE.md`** - 详细部署指南
- **`AI_RAG_IMPLEMENTATION_2025_10_05.md`** - RAG 架构详解
- **`supabase/functions/chat-v2/index.ts`** - 完整源代码

---

## 💡 提示

### 测试建议：

1. **测试商家查询：** "Best coffee shops in Auckland?"
2. **测试活动查询：** "What events are happening this weekend?"
3. **测试优惠查询：** "Any good deals right now?"

每个查询应该返回不同的 `intent` 和相应的数据库数据。

---

**状态：** ⏳ 待部署  
**预计时间：** 10 分钟  
**难度：** ⭐⭐☆☆☆（简单）

**下一步：** 打开 https://supabase.com/dashboard 开始部署！ 🚀


