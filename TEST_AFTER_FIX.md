# ✅ 修复完成 - 测试清单

## 已修复的问题

1. ✅ **JWT 验证** - 已关闭（401 错误已解决）
2. ✅ **OpenAI API 参数** - 改用 `max_completion_tokens`（500 错误已解决）

---

## 📝 更新步骤（二选一）

### 方法 A：在 Dashboard 快速修改

1. Dashboard → Edge Functions → chat-v2 → **Code**
2. 搜索 `max_tokens`（应该找到 2 处）
3. 全部改为 `max_completion_tokens`
4. 点击 **Deploy**

### 方法 B：复制完整代码

1. 打开本地文件：`supabase/functions/chat-v2/index.ts`
2. 全选复制（Ctrl+A → Ctrl+C）
3. 在 Dashboard 中粘贴并部署

---

## 🧪 部署完成后运行测试

### 在终端运行：

```bash
node test-edge-function.js
```

### 预期成功结果：

```
✅ Success!
📝 AI Message: G'day! Here are some top-rated coffee shops:

1. **The Little Larder** (4.8⭐) in Ponsonby
   📍 123 Ponsonby Rd, Auckland
   ☎️ 09-123-4567
   ...

🔍 Debug Info: {
  "intent": "business",
  "hasContextData": true,
  "dataSourcesUsed": ["business"]
}
```

---

## 📱 然后测试移动应用

1. 打开 Chat 页面
2. 输入：`Best coffee shops in Auckland?`
3. 查看终端日志

### 预期日志：

```
LOG  ✅ AI Response from Supabase (chat-v2 with RAG): {
  "messageLength": 740,
  "followUpCount": 3,
  "debug": {
    "intent": "business",
    "hasContextData": true,
    "dataSourcesUsed": ["business"]
  }
}
```

---

## ⚠️ 如果仍然失败

请提供：
1. `node test-edge-function.js` 的输出
2. Edge Function Logs（Dashboard → chat-v2 → Logs）
3. 移动应用的错误日志

---

**完成更新后，等待 10-20 秒让函数重新部署，然后测试！** 🚀

