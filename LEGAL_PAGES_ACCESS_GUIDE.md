# 法律页面访问指南

## 📍 法律页面访问位置

### 1. **Profile页面** (主要访问入口)
- **位置**: 底部Tab导航 → Coly → 用户头像或Profile按钮
- **菜单项**:
  - 🔒 **Privacy Policy** - 隐私政策
  - 📋 **Terms of Service** - 使用条款
- **访问方式**: 点击菜单项即可进入对应页面

### 2. **Chat页面** (首次使用提示)
- **位置**: 底部Tab导航 → Chat
- **显示位置**: 页面底部
- **内容**: "By using LifeX, you agree to our Terms of Service and Privacy Policy"
- **访问方式**: 点击链接文字

### 3. **Subscription页面** (订阅确认)
- **位置**: 底部Tab导航 → Coly → 升级计划
- **显示位置**: 页面底部
- **内容**: "By using LifeX, you agree to our Terms of Service and Privacy Policy"
- **访问方式**: 点击链接文字

## 🔙 返回按钮功能

### ✅ 已实现的功能
- **返回按钮**: 所有法律页面都有返回按钮
- **导航逻辑**: 点击返回按钮回到上一页
- **UI设计**: 使用左箭头图标，符合移动端设计规范

### 🎨 设计特点
- **返回按钮**: 左侧箭头图标
- **页面标题**: 居中显示
- **简洁布局**: 无搜索和用户按钮，专注内容阅读

## 📱 用户体验流程

### 典型用户路径:
1. **新用户**: Chat页面 → 点击法律链接 → 阅读条款 → 返回按钮返回
2. **设置用户**: Profile页面 → 隐私政策/使用条款 → 阅读内容 → 返回按钮返回
3. **订阅用户**: Subscription页面 → 点击法律链接 → 确认条款 → 返回按钮返回

## 🔧 技术实现

### Header组件更新
```typescript
interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;  // 新增
  onBackPress?: () => void;  // 新增
  onSearchPress?: () => void;
  onProfilePress?: () => void;
}
```

### 法律页面集成
- ✅ PrivacyPolicyScreen - 隐私政策页面
- ✅ TermsOfServiceScreen - 使用条款页面
- ✅ 返回按钮功能
- ✅ 导航集成

## 📋 应用商店合规

### 满足的要求
- ✅ **隐私政策**: 完整的隐私保护说明
- ✅ **使用条款**: 详细的服务条款
- ✅ **用户访问**: 多个入口方便用户查看
- ✅ **返回功能**: 良好的导航体验

### 法律内容包含
- 信息收集说明
- 数据使用目的
- 信息共享政策
- 数据安全措施
- 联系方式
- 服务条款
- 用户权利
- 免责声明

---

**总结**: 法律页面现在已经完全集成到应用中，用户可以通过多个入口访问，并且所有页面都有返回按钮，提供了良好的用户体验和应用商店合规性。
