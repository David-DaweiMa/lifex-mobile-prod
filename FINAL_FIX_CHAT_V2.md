# 🔧 最终修复 - chat-v2 Edge Function

## 📝 需要修改的地方

### 在 Dashboard 中只需要修改 3 行代码：

---

### 🔴 修改 1：约 line 226（主要 AI 调用）

**查找：**
```typescript
      body: JSON.stringify({
        model: openaiModel,
        messages,
        temperature: 0.7,
        max_tokens: 500,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
      }),
```

**改为：**
```typescript
      body: JSON.stringify({
        model: openaiModel,
        messages,
        max_completion_tokens: 500,
      }),
```

**删除的内容：**
- ❌ `temperature: 0.7,`（gpt-5-nano 不支持）
- ❌ `max_tokens: 500,`（改为 max_completion_tokens）
- ❌ `presence_penalty: 0.6,`（gpt-5-nano 不支持）
- ❌ `frequency_penalty: 0.3,`（gpt-5-nano 不支持）

---

### 🟡 修改 2：约 line 257（follow-up questions）

**查找：**
```typescript
        max_tokens: 100,
```

**改为：**
```typescript
        max_completion_tokens: 100,
```

**保留：** 这里的 `temperature: 0.8` 可以保留（因为用的是 gpt-4o-mini）

---

## 🎯 简化版：搜索替换

1. **搜索：** `temperature: 0.7,`
   - **删除这一行**

2. **搜索：** `presence_penalty: 0.6,`
   - **删除这一行**

3. **搜索：** `frequency_penalty: 0.3,`
   - **删除这一行**

4. **搜索：** `max_tokens:`（找到 2 处）
   - **全部改为：** `max_completion_tokens:`

---

## 📋 完整的修改后代码片段

### 第 1 处（约 line 217-227）：

```typescript
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: openaiModel,
        messages,
        max_completion_tokens: 500,
      }),
    });
```

### 第 2 处（约 line 250-258）：

```typescript
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that suggests brief follow-up questions.' },
          { role: 'user', content: followUpPrompt }
        ],
        temperature: 0.8,
        max_completion_tokens: 100,
      }),
```

---

## ✅ 修改清单

- [ ] 删除 `temperature: 0.7,`
- [ ] 删除 `presence_penalty: 0.6,`
- [ ] 删除 `frequency_penalty: 0.3,`
- [ ] 将 `max_tokens: 500,` 改为 `max_completion_tokens: 500,`
- [ ] 将 `max_tokens: 100,` 改为 `max_completion_tokens: 100,`
- [ ] 点击 **Deploy** 按钮
- [ ] 等待 10-20 秒

---

## 🧪 测试

修改并部署后，运行：

```bash
node test-edge-function.js
```

**预期结果：**
```
✅ Success!
📝 AI Message: G'day! Here are some top-rated coffee shops...
🔍 Debug Info: {
  "intent": "business",
  "hasContextData": true,
  "dataSourcesUsed": ["business"]
}
```

---

## 🆘 如果还有错误

请提供完整的错误信息，我会继续帮您修复。

**常见的 gpt-5-nano 限制：**
- ❌ 不支持 `temperature`（必须使用默认值 1）
- ❌ 不支持 `presence_penalty`
- ❌ 不支持 `frequency_penalty`
- ❌ 不支持 `max_tokens`（使用 `max_completion_tokens`）
- ✅ 支持 `max_completion_tokens`
- ✅ 支持 `messages`

---

**修改完成后告诉我！** 🚀

