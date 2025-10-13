# Edge Function 部署指南

**日期：** 2025年10月5日  
**目标：** 部署新版 RAG Edge Function (`chat-v2`)

---

## 🎯 推荐方案：通过 Supabase Dashboard 部署

### 为什么选择这种方式？
- ✅ 无需安装 CLI
- ✅ 可视化界面，简单直观
- ✅ 5 分钟内完成
- ✅ 不影响现有的 `chat` 函数

---

## 📝 部署步骤（Dashboard 方式）

### 步骤 1：登录 Supabase Dashboard

1. 打开浏览器访问：https://supabase.com/dashboard
2. 登录您的账户
3. 选择项目：**lifex-mobile-prod**

---

### 步骤 2：创建新的 Edge Function

1. 在左侧菜单中，点击 **Edge Functions**
2. 点击 **Create a new function**
3. 填写信息：
   - **Function name:** `chat-v2`
   - **Description:** `AI Chat with RAG (Retrieval-Augmented Generation)`
4. 点击 **Create function**

---

### 步骤 3：粘贴代码

1. 在代码编辑器中，**删除默认代码**
2. 打开本地文件：`supabase/functions/chat-v2/index.ts`
3. **复制全部代码**
4. **粘贴到 Dashboard 编辑器**
5. 点击 **Deploy**

---

### 步骤 4：配置环境变量（Secrets）

1. 在 Edge Functions 页面，选择 `chat-v2` 函数
2. 点击 **Settings** 或 **Secrets** 标签
3. 添加以下环境变量：

| Key | Value | 说明 |
|-----|-------|------|
| `SUPABASE_URL` | `https://muuzilttuddlljumoiig.supabase.co` | 您的 Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `[从 Dashboard 获取]` | 服务角色密钥 |
| `OPENAI_API_KEY` | `[从 .env 复制]` | OpenAI API 密钥 |
| `OPENAI_MODEL` | `gpt-5-nano` | AI 模型名称 |

#### 如何获取 Service Role Key？
1. 在 Dashboard 左侧菜单点击 **Settings** → **API**
2. 找到 **service_role** (secret) 部分
3. 点击 **Reveal** 显示密钥
4. **复制密钥**（⚠️ 保密，不要泄露）

---

### 步骤 5：测试部署

1. 在 Edge Functions 页面，选择 `chat-v2`
2. 点击 **Invoke** 或 **Test** 按钮
3. 输入测试数据：

```json
{
  "message": "Best coffee shops in Auckland?",
  "conversationHistory": [],
  "userId": "test-user"
}
```

4. 点击 **Send**
5. 查看响应，应该包含：
   - ✅ `message`: AI 的回答
   - ✅ `followUpQuestions`: 后续问题
   - ✅ `debug.intent`: "business"
   - ✅ `debug.hasContextData`: true

**成功示例：**
```json
{
  "message": "Here are some top-rated coffee shops:\n\n1. **The Little Larder**...",
  "followUpQuestions": [
    "What are their opening hours?",
    "Do they have outdoor seating?",
    "Best time to visit?"
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

---

### 步骤 6：在移动应用中使用

修改 `src/services/chatService.ts`：

```typescript
// 临时切换到 chat-v2 进行测试
const { data, error } = await supabase.functions.invoke('chat-v2', {
  body: {
    message: userMessage,
    conversationHistory: conversationContext,
    userId: 'current-user-id',
    sessionId: sessionId
  }
});
```

---

## 🔧 方案 B：安装 Supabase CLI 部署（专业用户）

### 安装 CLI（Windows）

#### 使用 Scoop（推荐）

```powershell
# 1. 安装 Scoop（如果未安装）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# 2. 安装 Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### 使用 npm

```bash
npm install -g supabase
```

---

### 部署命令

```bash
# 1. 登录 Supabase
supabase login

# 2. 链接项目
supabase link --project-ref muuzilttuddlljumoiig

# 3. 部署 chat-v2 函数
supabase functions deploy chat-v2 --no-verify-jwt

# 4. 配置环境变量
supabase secrets set SUPABASE_URL=https://muuzilttuddlljumoiig.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set OPENAI_API_KEY=your_openai_key
supabase secrets set OPENAI_MODEL=gpt-5-nano
```

---

## ⚠️ 注意事项

### 1. Service Role Key 安全性

- ⚠️ **极度机密**，拥有完全数据库访问权限
- ✅ 只能在服务器端使用（Edge Function）
- ❌ 绝不要在客户端代码中使用
- ❌ 不要提交到 Git

### 2. 费用考虑

**Edge Function 调用费用：**
- 免费额度：500,000 次/月
- 超出后：$2.00 / 100 万次

**OpenAI API 费用：**
- `gpt-5-nano`: ~$0.0003/次对话
- 预计：1000 次对话 ≈ $0.30

**总成本：** 每月 < $10（中等使用量）

### 3. 性能预期

| 指标 | 预期值 |
|------|--------|
| 冷启动 | 1-2 秒（首次调用） |
| 热启动 | 0.3-0.5 秒（后续调用） |
| 数据库查询 | 50-200ms |
| OpenAI 响应 | 1-2 秒 |
| **总响应时间** | **2-3 秒** |

---

## ✅ 验证清单

部署完成后，确认以下项目：

- [ ] `chat-v2` 函数在 Dashboard 中显示为 **Active**
- [ ] 所有 4 个环境变量已配置
- [ ] 测试调用返回真实数据（不是通用建议）
- [ ] `debug.hasContextData` 为 `true`
- [ ] `debug.dataSourcesUsed` 包含 `["business"]` 或 `["event"]` 或 `["special"]`
- [ ] 响应包含具体的商家名称、地址、评分
- [ ] Follow-up questions 生成成功

---

## 🐛 常见问题排查

### 问题 1：`OPENAI_API_KEY is not configured`

**原因：** 环境变量未设置

**解决：**
1. 在 Dashboard → Edge Functions → chat-v2 → Secrets
2. 添加 `OPENAI_API_KEY`

---

### 问题 2：`Failed to send a request to the Edge Function`

**原因：** 冷启动（首次调用需要时间）

**解决：** 等待 5-10 秒后重试

---

### 问题 3：`hasContextData: false`（没有查询到数据）

**可能原因：**
- 数据库表为空
- 查询条件不匹配
- Service Role Key 权限不足

**排查步骤：**
1. 检查数据库表是否有数据
2. 查看 Edge Function 日志
3. 验证 Service Role Key 配置正确

---

### 问题 4：返回通用建议（没有真实数据）

**示例：**
```
"Auckland has many great coffee shops. Try Ponsonby..."
```

**原因：** 数据库查询失败，AI 回退到通用知识

**解决：**
1. 检查 `debug.hasContextData`（应该为 `true`）
2. 查看 Edge Function 日志
3. 确认数据库连接正常

---

## 📊 测试用例

### 测试 1：咖啡店查询（business）

**输入：**
```json
{
  "message": "Best coffee shops in Auckland?"
}
```

**预期输出：**
- ✅ 包含真实商家名称
- ✅ 包含地址和评分
- ✅ `debug.intent` = "business"
- ✅ `debug.hasContextData` = true

---

### 测试 2：活动查询（event）

**输入：**
```json
{
  "message": "What events are happening this weekend?"
}
```

**预期输出：**
- ✅ 包含真实活动名称
- ✅ 包含日期和地点
- ✅ `debug.intent` = "event"

---

### 测试 3：优惠查询（special）

**输入：**
```json
{
  "message": "Any good deals right now?"
}
```

**预期输出：**
- ✅ 包含真实优惠信息
- ✅ 包含折扣百分比和有效期
- ✅ `debug.intent` = "special"

---

## 🚀 下一步优化

部署成功后，可以考虑：

1. **添加向量搜索** - 更智能的语义匹配
2. **增加缓存** - 减少重复查询
3. **用户偏好学习** - 个性化推荐
4. **地理位置过滤** - 基于用户位置推荐
5. **实时可用性检查** - 营业时间、库存状态

---

## 📚 相关文档

- **`AI_RAG_IMPLEMENTATION_2025_10_05.md`** - RAG 架构详解
- **`supabase/functions/chat-v2/index.ts`** - 源代码
- **`CHAT_BACKEND_ARCHITECTURE_2025_10_05.md`** - 后端架构

---

## ✅ 总结

### 推荐流程：

1. ✅ **通过 Dashboard 创建 `chat-v2` 函数**（5 分钟）
2. ✅ **配置环境变量**（2 分钟）
3. ✅ **测试调用**（1 分钟）
4. ✅ **在移动应用中测试**（5 分钟）
5. ✅ **确认效果满意后，替换 `chat` 函数**

### 预期结果：

- 🎯 AI 推荐真实商家/活动/优惠
- 🎯 响应包含具体名称、地址、评分
- 🎯 用户体验提升 5-10 倍

---

**状态：** ⏳ 待部署  
**优先级：** 🔥 高  
**预计时间：** 15 分钟


