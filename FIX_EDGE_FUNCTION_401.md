# 🔧 修复 Edge Function 401 错误

**问题：** `Edge Function returned a non-2xx status code`  
**根本原因：** `401 Unauthorized - Invalid JWT`  
**解释：** Edge Function 默认要求 JWT 认证，但我们需要允许匿名访问

---

## ✅ 解决方案：在 Dashboard 禁用 JWT 验证

### 方法 1：在函数设置中调整（最简单）

#### 步骤 1：打开函数设置
1. 访问 Supabase Dashboard → **Edge Functions**
2. 点击 **chat-v2** 函数
3. 查找以下标签页之一：
   - **Settings** ⚙️
   - **Configuration**
   - **Auth**

#### 步骤 2：查找 JWT/Auth 设置
在设置页面中，查找以下任一选项：
- ☐ **Verify JWT** 或 **JWT Verification**
- ☐ **Require Authentication**
- ☐ **Auth Required**
- ☐ **Public Access**

#### 步骤 3：禁用 JWT 验证
- **取消勾选** "Verify JWT" / "Require Auth"
- 或 **勾选** "Public Access" / "Allow Anonymous"
- 点击 **Save** 保存

---

### 方法 2：重新部署函数（如果方法 1 找不到设置）

#### 在 Dashboard 中重新部署：

1. **Edge Functions** → **chat-v2**
2. 点击 **Code** 或 **Editor** 标签
3. 在代码编辑器下方或侧边栏，查找 **Deploy Settings** 或 **Deployment Configuration**
4. 在部署选项中，找到：
   - ☐ **Verify JWT**
   - 或 ☐ **Require Authorization**
5. **取消勾选** 该选项
6. 点击 **Deploy** 或 **Redeploy**

---

### 方法 3：使用正确的 Headers（临时方案）

如果无法禁用 JWT 验证，我们可以修改移动应用的调用方式：

<function_calls>
<invoke name="read_file">
<parameter name="target_file">src/services/chatService.ts
