# LifeX Mobile App - 最简应用商店配置

## ✅ 已完成的必须配置

### 1. 环境配置
- ✅ `env.example` - 环境变量模板
- ✅ `eas.json` - EAS构建配置

### 2. 应用配置
- ✅ `app.json` - 完整的应用配置
  - 应用名称: "LifeX"
  - Bundle ID: com.lifex.mobile
  - 权限配置
  - 平台声明

### 3. 构建脚本
- ✅ `package.json` - 添加构建和提交脚本
  - `npm run build:android`
  - `npm run build:ios`
  - `npm run submit:android`
  - `npm run submit:ios`

### 4. 法律页面
- ✅ `PrivacyPolicyScreen.tsx` - 隐私政策页面
- ✅ `TermsOfServiceScreen.tsx` - 使用条款页面
- ✅ 导航集成完成

## 🚀 下一步操作

### 1. 创建环境文件
```bash
# 复制环境变量模板
cp env.example .env

# 编辑 .env 文件，填入真实的 Supabase 配置
```

### 2. 安装 EAS CLI
```bash
npm install -g @expo/eas-cli
eas login
```

### 3. 配置 EAS
```bash
eas build:configure
```

### 4. 构建应用
```bash
# 构建 Android APK (测试用)
npm run build:preview

# 构建生产版本
npm run build:android
npm run build:ios
```

### 5. 提交到商店
```bash
# 提交到 Google Play
npm run submit:android

# 提交到 App Store
npm run submit:ios
```

## 📋 提交前检查清单

### 必须完成的项目
- [ ] 创建 `.env` 文件并配置 Supabase
- [ ] 注册 Apple Developer 账号 ($99/年)
- [ ] 注册 Google Play Console ($25一次性)
- [ ] 准备应用截图 (至少5张)
- [ ] 填写应用商店描述
- [ ] 测试应用所有功能

### 应用截图要求
- **iOS**: 6.7", 6.5", 5.5" 屏幕截图
- **Android**: 各种设备尺寸截图
- 展示主要功能页面

### 应用描述模板
```
Discover amazing local services in New Zealand with LifeX, your AI-powered local discovery companion.

Features:
• AI-powered chat for personalized recommendations
• Trending local businesses and services
• Special deals and exclusive offers
• Community-driven content discovery
• Premium subscription for enhanced features

Perfect for finding the best coffee shops, restaurants, services, and activities in your area.
```

## 💰 预估成本
- Apple Developer: $99/年
- Google Play Console: $25 (一次性)
- EAS Build: 免费额度足够初期使用

## ⏱️ 时间线
- **配置环境**: 1天
- **构建测试**: 2-3天
- **商店提交**: 1-2天
- **审核等待**: 1-2周
- **总计**: 2-3周

---

**注意**: 这是最简配置，满足应用商店的基本要求。如需更多功能，请参考完整的 `APP_STORE_CHECKLIST.md`。
