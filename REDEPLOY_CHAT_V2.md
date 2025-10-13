# 🔄 重新部署 chat-v2（正确配置版）

**目标：** 创建一个允许匿名访问的 Edge Function

---

## 📝 步骤

### 1. 删除旧的 chat-v2 函数（可选）

如果要从头开始：
1. Dashboard → Edge Functions → chat-v2
2. 点击右上角的 **Delete** 或 "..." → Delete
3. 确认删除

---

### 2. 创建新的 chat-v2 函数

#### 2.1 创建函数
1. Edge Functions 页面，点击 **Create a new function**
2. **Function name:** `chat-v2`
3. 点击 **Create**

#### 2.2 粘贴代码
1. 删除默认代码
2. 从 `supabase/functions/chat-v2/index.ts` 复制全部代码
3. 粘贴到编辑器

#### 2.3 配置部署选项（⚠️ 关键步骤！）

在点击 Deploy 之前，查找部署选项：

**可能在：**
- 代码编辑器下方
- 右侧面板
- Deploy 按钮旁边的设置

**查找并设置：**
- ☐ **取消勾选** "Verify JWT"
- ☐ **取消勾选** "Require Auth"
- 或 ☑ **勾选** "Public Access"

#### 2.4 配置环境变量（Secrets）

在 **Secrets** 或 **Environment Variables** 中添加：

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://muuzilttuddlljumoiig.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | [从 Settings → API 复制] |
| `OPENAI_API_KEY` | [从您的 OpenAI 账户] |
| `OPENAI_MODEL` | `gpt-5-nano` |

#### 2.5 部署
点击 **Deploy** 按钮

---

### 3. 测试

部署完成后，运行测试：

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
  ...
}
```

---

## 🆘 如果仍然失败

请提供以下信息：

1. **Dashboard 截图：**
   - Edge Functions 列表
   - chat-v2 函数详情页面
   - 所有可见的标签和选项

2. **测试结果：**
   ```bash
   node test-edge-function.js
   ```
   的完整输出

3. **Edge Function Logs：**
   - Dashboard → Edge Functions → chat-v2 → Logs
   - 最新的几条日志

---

## 💡 替代方案：使用旧的 chat 函数

如果 chat-v2 一直有问题，我们可以：

1. **检查旧的 `chat` 函数是否可以工作**
2. **将 RAG 代码部署到 `chat` 函数**（替换旧代码）
3. **保持移动应用调用 `chat`**（不用改代码）

需要我帮您这样做吗？

