# LifeX Git 分支策略

## 🎯 目标
- 保存测试数据版本用于截图
- 支持真实Supabase数据版本
- 两个版本在Git中并存

## 🌿 分支结构

### 主分支
- **`master`** - 当前测试数据版本 (用于截图和演示)

### 功能分支
- **`feature/supabase-integration`** - 真实数据版本 (连接到Supabase)

## 📋 具体操作步骤

### 1. 创建功能分支
```bash
# 从当前master分支创建新分支
git checkout -b feature/supabase-integration

# 推送到远程仓库
git push -u origin feature/supabase-integration
```

### 2. 在功能分支中集成Supabase
```bash
# 确保在功能分支上
git checkout feature/supabase-integration

# 修改数据服务，连接到真实Supabase
# 更新所有页面使用真实数据

# 提交更改
git add .
git commit -m "feat: Integrate Supabase real data"

# 推送到远程
git push origin feature/supabase-integration
```

### 3. 保持两个版本同步
```bash
# 从master分支同步到功能分支
git checkout feature/supabase-integration
git merge master

# 或者从功能分支同步到master
git checkout master
git merge feature/supabase-integration
```

## 🔄 工作流程

### 截图时 (使用测试数据)
```bash
# 切换到测试数据版本
git checkout master

# 启动应用进行截图
npm start
```

### 开发时 (使用真实数据)
```bash
# 切换到真实数据版本
git checkout feature/supabase-integration

# 启动应用进行开发
npm start
```

### 发布时
```bash
# 选择要发布的版本
git checkout master  # 或 feature/supabase-integration

# 构建和提交到应用商店
npm run build:android
npm run submit:android
```

## 📁 版本管理策略

### 测试数据版本 (master分支)
- ✅ 包含所有mock数据
- ✅ 用于截图和演示
- ✅ 稳定版本，适合应用商店提交
- ✅ 不依赖外部服务

### 真实数据版本 (feature/supabase-integration分支)
- 🔗 连接到Supabase数据库
- 🔗 实时数据更新
- 🔗 用户认证功能
- 🔗 适合生产环境

## 🚀 快速切换命令

### 创建别名 (可选)
```bash
# 添加到 .gitconfig 或 .bashrc
git config --global alias.demo "checkout master"
git config --global alias.dev "checkout feature/supabase-integration"
```

### 使用别名
```bash
git demo  # 切换到测试数据版本
git dev   # 切换到真实数据版本
```

## 📊 分支状态管理

### 检查当前分支
```bash
git branch  # 查看所有分支
git status  # 查看当前分支状态
```

### 分支同步
```bash
# 从master同步到功能分支
git checkout feature/supabase-integration
git merge master

# 从功能分支同步到master
git checkout master
git merge feature/supabase-integration
```

## 🔧 环境配置

### 测试数据版本 (.env.demo)
```bash
# 测试数据版本 - 不需要真实Supabase配置
EXPO_PUBLIC_USE_MOCK_DATA=true
EXPO_PUBLIC_SUPABASE_URL=demo
EXPO_PUBLIC_SUPABASE_ANON_KEY=demo
```

### 真实数据版本 (.env.production)
```bash
# 真实数据版本 - 需要真实Supabase配置
EXPO_PUBLIC_USE_MOCK_DATA=false
EXPO_PUBLIC_SUPABASE_URL=your_real_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_real_supabase_key
```

## 📝 提交信息规范

### 测试数据版本提交
```bash
git commit -m "demo: Update mock data for screenshots"
git commit -m "demo: Fix UI layout for app store"
```

### 真实数据版本提交
```bash
git commit -m "feat: Add Supabase integration"
git commit -m "feat: Implement real-time data sync"
git commit -m "fix: Resolve authentication issues"
```

## 🎯 应用场景

### 截图和演示
1. 切换到 `master` 分支
2. 确保测试数据完整
3. 进行截图
4. 提交到应用商店

### 开发和测试
1. 切换到 `feature/supabase-integration` 分支
2. 连接真实Supabase
3. 开发和测试功能
4. 同步重要更改到master

### 生产发布
1. 选择要发布的版本
2. 构建应用
3. 提交到应用商店
4. 监控用户反馈

## ⚠️ 注意事项

1. **数据一致性**: 确保两个版本的功能保持一致
2. **UI同步**: 重要UI更改需要在两个分支中同步
3. **版本标记**: 使用Git tags标记重要版本
4. **备份**: 定期备份重要分支

## 🔄 自动化脚本 (可选)

### 创建切换脚本
```bash
# 创建 switch-to-demo.sh
#!/bin/bash
git checkout master
npm start

# 创建 switch-to-prod.sh
#!/bin/bash
git checkout feature/supabase-integration
npm start
```

---

**📝 总结**: 这个策略让您可以同时维护测试数据版本和真实数据版本，满足不同场景的需求，并且两个版本都在Git中安全保存。
