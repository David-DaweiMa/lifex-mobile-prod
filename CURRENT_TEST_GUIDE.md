# 🧪 当前测试指南 - RAG Chat v2

**时间：** 2025年10月5日  
**目标：** 验证 AI 是否使用数据库真实数据

---

## ✅ 当前状态

1. ✅ `chat-v2` Edge Function 已部署
2. ✅ 移动应用已配置调用 `chat-v2`
3. ✅ Expo 服务器已重启（清理了缓存）
4. ⏳ 等待您的测试

---

## 📱 测试步骤

### 1️⃣ 等待应用重新加载

应用应该会自动重新加载。如果没有：
- **Android 模拟器：** 按 `r` 键或 Ctrl+M → Reload
- **iOS 模拟器：** 按 `r` 键或 Cmd+D → Reload
- **真机：** 摇一摇设备 → Reload

---

### 2️⃣ 打开 Chat 页面

点击底部导航栏的 **Chat** 图标 💬

---

### 3️⃣ 测试 - 商家查询

**输入这个问题：**
```
Best coffee shops in Auckland?
```

**然后等待 2-5 秒...**

---

### 4️⃣ 查看结果

#### ✅ 成功（使用了数据库）

**AI 回复应该像这样：**
```
G'day! Here are some top-rated coffee shops:

1. **The Little Larder** (4.8⭐) in Ponsonby
   📍 123 Ponsonby Rd, Auckland
   ☎️ 09-123-4567
   Known for their artisan coffee and cozy atmosphere...

2. **Atomic Coffee Roasters** (4.7⭐) in Mt Eden
   📍 456 Mt Eden Rd
   Great single-origin beans roasted on-site...

3. **Eighthirty Coffee** (4.6⭐) in CBD
   📍 789 Queen St
   Perfect for a quick espresso...
```

**终端日志应该显示：**
```
LOG  ✅ AI Response from Supabase (chat-v2 with RAG): {
  "messageLength": 740,
  "followUpCount": 3,
  "usage": { "total_tokens": 567 },
  "debug": {
    "intent": "business",
    "hasContextData": true,  ← ✅ 这个是关键！
    "dataSourcesUsed": ["business"]
  }
}
```

---

#### ❌ 失败（没有使用数据库）

**AI 回复会是通用建议：**
```
Auckland has many great coffee shops. Some popular 
areas include Ponsonby Road, K Road, Mt Eden Village, 
and the CBD. Would you like recommendations for a 
specific area?
```

**终端日志会显示：**
```
LOG  ✅ AI Response from Supabase (chat-v2 with RAG): {
  "debug": {
    "intent": "business",
    "hasContextData": false,  ← ❌ 表示没有查到数据
    "dataSourcesUsed": []
  }
}
```

**如果失败，可能的原因：**
1. 数据库 `businesses` 表为空
2. `SUPABASE_SERVICE_ROLE_KEY` 未配置
3. 数据的 `status` 字段不是 `'active'`

---

### 5️⃣ 额外测试（可选）

#### 测试活动查询：
```
What events are happening this weekend?
```

**预期：** `intent: "event"`

#### 测试优惠查询：
```
Any good deals right now?
```

**预期：** `intent: "special"`

---

## 🔍 关键指标

### 必须检查的：

| 指标 | 成功 ✅ | 失败 ❌ |
|------|---------|---------|
| **AI 回复** | 包含具体商家名称、地址、电话 | 只有通用建议 |
| **hasContextData** | `true` | `false` |
| **intent** | `"business"` | `"business"` |
| **dataSourcesUsed** | `["business"]` | `[]` |
| **响应时间** | 2-5 秒 | 1-3 秒 |

---

## 📊 日志示例对比

### ✅ 成功的日志

```javascript
LOG  ✅ AI Response from Supabase (chat-v2 with RAG): {
  messageLength: 740,
  followUpCount: 3,
  usage: {
    completion_tokens: 177,
    prompt_tokens: 211,
    total_tokens: 388
  },
  debug: {
    intent: "business",
    hasContextData: true,
    dataSourcesUsed: ["business"]
  }
}
```

**特征：**
- ✅ `hasContextData: true`
- ✅ `dataSourcesUsed` 不为空
- ✅ `messageLength` 较长（包含详细信息）

---

### ❌ 失败的日志

```javascript
LOG  ✅ AI Response from Supabase (chat-v2 with RAG): {
  messageLength: 320,
  followUpCount: 3,
  usage: {
    total_tokens: 280
  },
  debug: {
    intent: "business",
    hasContextData: false,
    dataSourcesUsed: []
  }
}
```

**特征：**
- ❌ `hasContextData: false`
- ❌ `dataSourcesUsed` 为空
- ❌ `messageLength` 较短（通用回复）

---

## 🐛 问题排查

### 如果 `hasContextData: false`

#### 步骤 1：检查数据库
1. 打开 https://supabase.com/dashboard
2. 选择项目 → **Table Editor**
3. 查看 `businesses` 表
4. 确认有数据且 `status = 'active'`

#### 步骤 2：检查 Edge Function 环境变量
1. Dashboard → **Edge Functions** → `chat-v2`
2. 点击 **Secrets** 或 **Settings**
3. 确认这 4 个变量都已配置：
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`

#### 步骤 3：查看 Edge Function 日志
1. Dashboard → **Edge Functions** → `chat-v2` → **Logs**
2. 查找错误信息
3. 检查是否有数据库查询错误

---

### 如果收到错误信息

#### "OPENAI_API_KEY is not configured"
→ 在 Edge Function Secrets 中添加 `OPENAI_API_KEY`

#### "Failed to send a request to the Edge Function"
→ 冷启动（首次调用慢），等待 5-10 秒后重试

#### "Supabase function error: [FunctionsFetchError]"
→ 检查 Edge Function 是否成功部署

---

## ✅ 成功标准

**测试通过的条件：**

- [ ] AI 回复包含具体商家名称（不是"Auckland has many..."）
- [ ] AI 回复包含地址（例如："123 Ponsonby Rd"）
- [ ] AI 回复包含电话号码（例如："09-123-4567"）
- [ ] 终端日志显示 `hasContextData: true`
- [ ] 终端日志显示 `intent: "business"`
- [ ] 终端日志显示 `dataSourcesUsed: ["business"]`
- [ ] 无错误信息

**如果全部 ✅ → RAG 部署成功！** 🎉

---

## 📝 测试完成后

### 请告诉我：

1. **终端日志的内容**
   - 特别是 `debug` 对象
   - `hasContextData` 是 true 还是 false？

2. **AI 的回复内容**
   - 是具体商家信息？
   - 还是通用建议？

3. **有没有错误信息？**

4. **响应时间大概多久？**

---

## 🎯 预期效果对比

### 旧版 vs 新版

| 方面 | 旧版 (chat) | 新版 (chat-v2 RAG) |
|------|-------------|-------------------|
| **数据来源** | OpenAI 训练数据 | 数据库 + OpenAI |
| **回复类型** | 通用建议 | 具体推荐 |
| **包含信息** | 区域名称 | 商家+地址+电话+评分 |
| **用户价值** | 需要二次搜索 | 可直接行动 |
| **数据新鲜度** | 2023 年 | 实时 |

---

## 🚀 下一步

如果测试成功：
1. ✅ 保持使用 `chat-v2`
2. ✅ 可以测试其他查询（活动、优惠）
3. ✅ 考虑进一步优化（向量搜索、地理位置过滤）

如果测试失败：
1. 📋 提供日志信息
2. 🔍 一起排查问题
3. 🛠️ 修复配置

---

**准备好了吗？** 请在 Chat 页面输入问题，然后告诉我结果！ 🚀

---

**快速测试命令：**
```
Best coffee shops in Auckland?
```

**关键看什么：**
1. 终端的 `debug.hasContextData`
2. AI 是否回复了具体商家名称

