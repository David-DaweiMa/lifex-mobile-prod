# LifeX 应用商店上线完整指南

## 🎯 当前状态
- ✅ 应用配置完成 (app.json)
- ✅ 构建配置完成 (eas.json)
- ✅ 法律页面完成
- ✅ 核心功能开发完成
- ✅ 搜索功能优化完成

## 📋 上线前必须完成的步骤

### 1. 环境配置 (必需)
```bash
# 1. 创建环境变量文件
cp env.example .env

# 2. 编辑 .env 文件，填入真实的 Supabase 配置
# EXPO_PUBLIC_SUPABASE_URL=你的Supabase URL
# EXPO_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

### 2. 开发者账号注册 (必需)

#### Apple Developer Account
- 🔗 访问: https://developer.apple.com/
- 💰 费用: $99/年
- ⏱️ 审核时间: 1-3个工作日
- 📋 需要: Apple ID, 信用卡信息

#### Google Play Console
- 🔗 访问: https://play.google.com/console/
- 💰 费用: $25 (一次性)
- ⏱️ 审核时间: 即时
- 📋 需要: Google账号, 信用卡信息

### 3. EAS CLI 安装和配置
```bash
# 安装 EAS CLI
npm install -g @expo/eas-cli

# 登录 Expo 账号
eas login

# 配置项目
eas build:configure

# 验证配置
eas build:list
```

### 4. 应用图标和资源检查
```bash
# 检查必需的资源文件
ls assets/
# 应该包含:
# - icon.png (1024x1024)
# - adaptive-icon.png (1024x1024)
# - splash-icon.png (1242x2436 或类似比例)
# - favicon.png (48x48)
```

### 5. 构建测试版本
```bash
# 构建 Android 预览版本 (用于测试)
npm run build:preview

# 下载并测试 APK 文件
# 确保所有功能正常工作
```

### 6. 应用商店资源准备

#### 应用截图策略 (基于现有设备)
**详细策略请参考: `SCREENSHOT_STRATEGY.md`**

**Android 截图 (使用 Android 模拟器):**
- 设备: Pixel 6 模拟器
- 尺寸: 1080 x 1920
- 数量: 8张主要功能页面

**iOS 截图 (使用 iPhone 12 + 在线工具调整):**
- 基础设备: iPhone 12 (1170 x 2532)
- 目标尺寸: 3种iPhone尺寸
- 调整工具: Photopea/Canva (免费)

**截图内容 (8张推荐):**
1. Chat/AI 推荐功能
2. Discover 页面
3. Trending 页面
4. Specials 页面
5. Search 功能
6. Coly 页面
7. Profile 页面
8. Membership 页面

#### 应用描述
```
Discover amazing local services in New Zealand with LifeX, your AI-powered local discovery companion.

🌟 Key Features:
• AI-powered chat for personalized recommendations
• Trending local businesses and services
• Special deals and exclusive offers
• Community-driven content discovery
• Premium subscription for enhanced features

🎯 Perfect for:
• Finding the best coffee shops and restaurants
• Discovering local services and activities
• Getting personalized AI recommendations
• Staying updated with trending local spots
• Accessing exclusive deals and offers

Download LifeX today and explore your city like never before!
```

#### 关键词
```
local discovery, AI recommendations, New Zealand, restaurants, coffee shops, local services, trending, deals, lifestyle, community
```

### 7. 最终构建和提交

#### 生产版本构建
```bash
# 构建 Android 生产版本
npm run build:android

# 构建 iOS 生产版本
npm run build:ios
```

#### 提交到应用商店
```bash
# 提交到 Google Play
npm run submit:android

# 提交到 App Store
npm run submit:ios
```

## 🚨 常见问题和解决方案

### 1. 构建失败
```bash
# 清理缓存
expo r -c
npm start -- --clear

# 检查 EAS 构建日志
eas build:list
eas build:view [BUILD_ID]
```

### 2. 权限问题
- 确保在 `app.json` 中只声明必需的权限
- 检查 Android 权限是否合理

### 3. Bundle ID 冲突
- 确保 `com.lifex.mobile` 在 Apple Developer 中可用
- 确保包名在 Google Play 中可用

### 4. 法律页面问题
- 确保隐私政策和服务条款链接可访问
- 内容要符合应用商店要求

## 📊 上线后监控

### 1. 应用商店指标
- 下载量
- 评分和评论
- 崩溃率
- 用户留存率

### 2. 用户反馈
- 定期查看应用商店评论
- 响应用户反馈
- 及时修复问题

### 3. 更新计划
- 准备第一个更新版本
- 收集用户反馈
- 规划新功能

## 💰 总成本预估
- Apple Developer: $99/年
- Google Play Console: $25 (一次性)
- EAS Build: 免费额度通常足够
- **总计**: ~$124 第一年

## ⏱️ 时间线预估
- 环境配置: 1天
- 开发者账号注册: 1-3天
- 构建和测试: 2-3天
- 应用商店提交: 1天
- 审核等待: 1-2周
- **总计**: 2-3周

## 🎉 上线检查清单

### 技术准备
- [ ] 环境变量配置完成
- [ ] EAS CLI 安装和登录
- [ ] 应用图标和资源文件准备
- [ ] 构建测试版本并验证功能
- [ ] 生产版本构建成功

### 应用商店准备
- [ ] Apple Developer 账号注册
- [ ] Google Play Console 账号注册
- [ ] 应用截图准备 (所有必需尺寸)
- [ ] 应用描述和关键词准备
- [ ] 法律页面内容审核

### 提交准备
- [ ] 最终构建版本测试
- [ ] 提交到 Google Play
- [ ] 提交到 App Store
- [ ] 监控审核状态

---

**🎯 下一步**: 开始环境配置和开发者账号注册，这是上线的基础！
