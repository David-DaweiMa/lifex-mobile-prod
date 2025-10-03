# 🎨 LifeX 应用图标设置指南

## 📋 已完成的步骤

### ✅ 1. 创建了 .env 文件
- 已从 `env.example` 复制创建 `.env` 文件
- **下一步**: 需要填入真实的 Supabase 配置

### ✅ 2. 生成了应用图标设计
- 创建了 SVG 格式的图标设计文件
- 设计了统一的 LifeX 品牌图标（紫色渐变背景 + 白色 L 字母 + 金色装饰星星）

## 🎯 接下来需要做的

### 1. 生成 PNG 图标文件
使用生成的 HTML 工具来创建 PNG 图标：

```bash
# 在浏览器中打开图标生成器
start assets/generate-icons.html
```

**需要保存的图标文件:**
- `icon-1024.png` (1024×1024) - iOS App Store
- `icon-512.png` (512×512) - Android Google Play  
- `icon-180.png` (180×180) - iOS 设备
- `icon-192.png` (192×192) - Android 设备

### 2. 配置 Supabase 连接
编辑 `.env` 文件，填入真实的 Supabase 配置：

```bash
# 编辑 .env 文件
notepad .env
```

需要填入：
- `EXPO_PUBLIC_SUPABASE_URL` - 你的 Supabase 项目 URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - 你的 Supabase 匿名密钥

### 3. 更新应用配置
当 PNG 图标文件准备好后，需要更新 `app.json`：

```json
{
  "expo": {
    "icon": "./assets/icon-1024.png",
    "ios": {
      "icon": "./assets/icon-180.png"
    },
    "android": {
      "icon": "./assets/icon-192.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon-512.png",
        "backgroundColor": "#8B5CF6"
      }
    }
  }
}
```

## 🎨 图标设计说明

### 设计元素
- **背景**: 紫色渐变 (#8B5CF6 → #A855F7)
- **主图标**: 白色字母 "L" (LifeX)
- **装饰**: 金色星星点缀
- **风格**: 现代、简洁、专业

### 品牌一致性
- 与应用内主题色彩保持一致
- 符合 iOS 和 Android 设计规范
- 在各种尺寸下都清晰可辨

## 📱 应用商店要求

### iOS App Store
- 图标尺寸: 1024×1024 像素
- 格式: PNG
- 背景: 可以使用颜色或渐变
- 圆角: 系统自动添加

### Android Google Play
- 图标尺寸: 512×512 像素
- 格式: PNG
- 背景: 可以使用颜色
- 形状: 自适应图标支持

## 🚀 下一步行动

1. **立即**: 打开 `assets/generate-icons.html` 生成 PNG 图标
2. **今天**: 配置 Supabase 连接
3. **本周**: 注册开发者账号
4. **下周**: 准备应用截图和提交审核

---

**注意**: 所有图标文件都应该保存在 `assets/` 目录下，文件名严格按照要求命名。

