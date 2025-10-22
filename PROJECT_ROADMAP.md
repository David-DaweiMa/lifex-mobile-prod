# 🗺️ LifeX 项目路线图

> Guiding Principle（Lifex Manifesto）
> 我们的核心价值是利用 AI 的能力深入理解每个 business 和每个用户，并据此做最合适的匹配。所有可以合法获取的数据都用于帮助 AI 持续加深理解；随着时间与数据增长，这份理解会不断进化。唯有基于这种理解，我们才能提供让客户满意的一切服务（chat、推荐、AI 助手）以及后续的优惠券、订座、订餐、服务预定、票务购买等下游交易。

**更新时间：** 2024-10-17

---

## 📍 当前状态

### ✅ **已完成：**
- ✅ React Native 移动应用开发
- ✅ Supabase 后端集成
- ✅ AI Chat 功能（OpenAI + RAG）
- ✅ Places, Events, Specials 功能
- ✅ 收藏和用户系统
- ✅ Apple Developer 账号设置
- ✅ EAS 配置和构建
- ✅ 提交到 TestFlight

### 🔄 **进行中：**
- ⏳ 等待 TestFlight 处理（预计 5-10 分钟）
- ⏳ 验证真实数据连接

### ⏸️ **暂停（等待 TestFlight）：**
- TestFlight 真机测试
- 数据连接验证

---

## 🎯 接下来的任务

### **Phase 1: 验证和测试（本周）** ⭐⭐⭐⭐⭐

**优先级：极高 | 预计时间：1-2 天**

#### **1.1 TestFlight 测试**
- [ ] 在 iPhone 安装 TestFlight app
- [ ] 安装 LifeX 测试版
- [ ] 验证基本功能正常
- [ ] 测试真实数据连接
  - [ ] Places 显示真实商家
  - [ ] Events 显示真实活动
  - [ ] AI Chat 返回真实推荐
- [ ] 收集 Bug 和问题

#### **1.2 环境变量验证**
- [ ] 确认 Supabase 连接正常
- [ ] 确认 AI Chat 正常工作
- [ ] 检查缓存和性能

#### **1.3 问题修复**
- [ ] 修复发现的 Bug
- [ ] 优化性能问题
- [ ] 更新 TestFlight 版本

**成功标准：**
- ✅ App 在真机稳定运行
- ✅ 显示真实数据（不是 mock）
- ✅ AI Chat 正常工作
- ✅ 无严重 Bug

---

### **Phase 2: 数据采集（2-3 周）** ⭐⭐⭐⭐⭐

**优先级：高 | 预计时间：2-3 周**

#### **2.1 Google Cloud 设置**
- [ ] 注册 Google Cloud 账号
- [ ] 获取 $300 新用户福利 + $200/月 免费额度
- [ ] 启用 Google Places API
- [ ] 获取 API Key
- [ ] 配置 EAS Secrets

**文档：** `DATA_ACQUISITION_STRATEGY.md`

#### **2.2 数据采集服务**
- [ ] 创建 Supabase Edge Function (data-collector)
- [ ] 实现 Google Places API 调用
- [ ] 实现数据清洗和验证
- [ ] 设置 Cron Job（定时采集）
- [ ] 测试采集流程

**代码位置：** `supabase/functions/data-collector/`

#### **2.3 初始数据采集**
- [ ] 采集 Auckland 商家（1,000-2,000 家）
- [ ] 采集 Wellington 商家（500-1,000 家）
- [ ] 采集 Christchurch 商家（500-1,000 家）
- [ ] 采集近期活动（100-200 个）
- [ ] 验证数据质量

**预计成本：** $0（在免费额度内）

#### **2.4 数据更新机制**
- [ ] 实现被动更新（用户访问时检查）
- [ ] 实现主动更新（定期批量）
- [ ] 实现缓存管理
- [ ] 监控 API 使用量

**文档：** `DATA_UPDATE_STRATEGY.md`, `GOOGLE_API_COMPLIANCE_GUIDE.md`

**成功标准：**
- ✅ 5,000+ 商家数据
- ✅ 200+ 活动数据
- ✅ 自动更新机制运行
- ✅ 合规使用 Google API

---

### **Phase 3: 检索优化（2-3 周）** ⭐⭐⭐⭐

**优先级：高 | 预计时间：2-3 周**

#### **3.1 基础优化（立即）**
- [ ] 实现多维度综合评分算法
- [ ] 更新 chat-v2 Edge Function
- [ ] 添加相关性评分
- [ ] 添加距离评分
- [ ] 添加热度评分
- [ ] 测试和调优

**文档：** `DATA_RETRIEVAL_OPTIMIZATION.md`

**预期效果：** 相关性从 40% 提升到 75-80%

#### **3.2 地理位置优化**
- [ ] 启用 PostGIS 扩展
- [ ] 添加地理索引
- [ ] 实现位置过滤
- [ ] 在移动端获取用户位置
- [ ] 集成到搜索流程

**预期效果：** 距离相关性提升

#### **3.3 性能优化**
- [ ] 添加查询缓存
- [ ] 优化数据库索引
- [ ] 实现智能预加载
- [ ] 监控查询性能

**成功标准：**
- ✅ 相关性提升到 75-80%
- ✅ 响应时间 < 200ms
- ✅ 用户满意度提升

---

### **Phase 4: 向量搜索（3-4 周）** ⭐⭐⭐⭐⭐

**优先级：中-高 | 预计时间：3-4 周**

#### **4.1 向量数据库配置**
- [ ] 安装 pgvector 扩展
- [ ] 添加 embedding 列
- [ ] 创建向量索引
- [ ] 创建向量搜索函数

#### **4.2 生成向量**
- [ ] 创建 generate-embeddings Edge Function
- [ ] 为所有商家生成向量
- [ ] 设置定期向量生成
- [ ] 测试向量搜索

**成本：** $0.50（一次性）+ $0（查询在免费额度内）

#### **4.3 混合搜索**
- [ ] 实现语义搜索
- [ ] 实现混合搜索（语义 + 传统）
- [ ] 实现结果重排序
- [ ] A/B 测试

**文档：** `DATA_RETRIEVAL_OPTIMIZATION.md`, `SYSTEM_ARCHITECTURE_OVERVIEW.md`

**预期效果：** 相关性提升到 90-95%

**成功标准：**
- ✅ 语义搜索正常工作
- ✅ 相关性提升到 90%+
- ✅ 用户"哇"的体验

---

### **Phase 5: 商家画像与标签（3-4 周）** ⭐⭐⭐⭐

**优先级：中 | 预计时间：3-4 周**

#### **5.1 标签体系**
- [ ] 设计标签分类（50+ 标签）
- [ ] 更新数据库 schema
- [ ] 创建标签管理界面
- [ ] 实现标签自动提取（AI）

#### **5.2 商家画像**
- [ ] 实现评论分析功能
- [ ] 实现用户行为分析
- [ ] 生成完整商家画像
- [ ] 定期更新机制

#### **5.3 商家后台**
- [ ] 创建商家注册系统
- [ ] 创建商家管理后台
- [ ] 允许商家上传内容
- [ ] 审核机制

**文档：** `ADVANCED_RECOMMENDATION_SYSTEM.md`

**成功标准：**
- ✅ 完整的标签体系
- ✅ 详细的商家画像
- ✅ 商家可以自主管理

---

### **Phase 6: 个性化推荐（4-6 周）** ⭐⭐⭐⭐⭐

**优先级：中 | 预计时间：4-6 周**

#### **6.1 用户画像**
- [ ] 跟踪用户行为
- [ ] 生成用户兴趣向量
- [ ] 实现偏好学习
- [ ] 隐私保护机制

#### **6.2 个性化推荐**
- [ ] 实现个性化评分
- [ ] 实现推荐解释功能
- [ ] A/B 测试
- [ ] 持续优化

#### **6.3 推荐系统优化**
- [ ] 实现协同过滤
- [ ] 实现冷启动处理
- [ ] 实现多样性保证
- [ ] 实现实时更新

**文档：** `ADVANCED_RECOMMENDATION_SYSTEM.md`

**预期效果：** 相关性提升到 95%+

**成功标准：**
- ✅ 个性化推荐正常工作
- ✅ 用户满意度 > 90%
- ✅ 推荐转化率提升

---

### **Phase 7: App Store 正式发布（2-3 周）** ⭐⭐⭐

**优先级：低-中 | 预计时间：2-3 周**

#### **7.1 准备发布资料**
- [ ] 准备 App 截图（6.7", 6.5", 5.5"）
- [ ] 准备 App 预览视频
- [ ] 撰写 App 描述（多语言）
- [ ] 准备市场营销材料
- [ ] 准备支持 URL 和隐私政策

#### **7.2 App Store Connect 配置**
- [ ] 完善 App 信息
- [ ] 设置定价和可用性
- [ ] 设置年龄分级
- [ ] 配置 App 内购买（如果有）
- [ ] 提交审核

#### **7.3 审核和发布**
- [ ] 等待 Apple 审核（1-3 天）
- [ ] 处理审核反馈
- [ ] 发布到 App Store
- [ ] 监控用户反馈

**成功标准：**
- ✅ 通过 Apple 审核
- ✅ 成功发布到 App Store
- ✅ 获得用户好评

---

## 📅 时间线概览

```
Week 1-2:   Phase 1 - TestFlight 测试验证 ⭐⭐⭐⭐⭐
Week 3-5:   Phase 2 - 数据采集系统 ⭐⭐⭐⭐⭐
Week 6-8:   Phase 3 - 检索优化 ⭐⭐⭐⭐
Week 9-12:  Phase 4 - 向量搜索 ⭐⭐⭐⭐⭐
Week 13-16: Phase 5 - 商家画像 ⭐⭐⭐⭐
Week 17-22: Phase 6 - 个性化推荐 ⭐⭐⭐⭐⭐
Week 23-25: Phase 7 - App Store 发布 ⭐⭐⭐

总计：约 6 个月完整实施
```

---

## 📊 里程碑

### **Milestone 1: TestFlight 成功** 🎯
- **时间：** Week 2
- **标志：** App 在真机稳定运行，显示真实数据

### **Milestone 2: 数据系统完成** 🎯
- **时间：** Week 5
- **标志：** 5,000+ 商家，自动更新运行

### **Milestone 3: 智能推荐** 🎯
- **时间：** Week 12
- **标志：** 相关性 > 90%，向量搜索运行

### **Milestone 4: 个性化系统** 🎯
- **时间：** Week 22
- **标志：** 个性化推荐，用户满意度 > 90%

### **Milestone 5: App Store 发布** 🎯
- **时间：** Week 25
- **标志：** 公开发布，开始获取用户

---

## 🎯 当前焦点（本周）

### **立即任务（今天）：**
1. ✅ 整理项目文档
2. ✅ 删除临时文件
3. ✅ 创建路线图

### **本周任务：**
1. ⏳ 等待 TestFlight 处理完成
2. ⏳ 在 iPhone 安装测试
3. ⏳ 验证真实数据连接
4. ⏳ 修复发现的问题

### **下周准备：**
1. 📋 注册 Google Cloud
2. 📋 规划数据采集策略
3. 📋 设计采集服务架构

---

## 📚 核心文档

### **策略文档（保留）：**
1. `DATA_ACQUISITION_STRATEGY.md` - 数据采集策略
2. `DATA_UPDATE_STRATEGY.md` - 数据更新策略
3. `DATA_RETRIEVAL_OPTIMIZATION.md` - 检索优化策略
4. `GOOGLE_API_COMPLIANCE_GUIDE.md` - Google API 合规指南
5. `SYSTEM_ARCHITECTURE_OVERVIEW.md` - 系统架构概览
6. `ADVANCED_RECOMMENDATION_SYSTEM.md` - 高级推荐系统
7. `PROJECT_ROADMAP.md` - 项目路线图（本文档）

### **配置文件：**
- `app.json` - Expo 配置
- `eas.json` - EAS 构建配置
- `package.json` - 依赖管理
- `.env` - 环境变量（本地）

---

## 💡 关键原则

### **开发原则：**
1. ✅ **合法合规** - 遵守所有服务条款
2. ✅ **成本控制** - 充分利用免费额度
3. ✅ **用户体验** - 快速响应，精准推荐
4. ✅ **可持续发展** - 转向用户生成内容
5. ✅ **数据驱动** - 基于数据优化决策

### **质量标准：**
- ⚡ 响应时间 < 200ms
- 🎯 推荐相关性 > 90%
- 😊 用户满意度 > 85%
- 🐛 严重 Bug = 0
- 📱 崩溃率 < 0.1%

---

## 📞 支持资源

### **技术栈：**
- Frontend: React Native + Expo
- Backend: Supabase (PostgreSQL + Edge Functions)
- AI: OpenAI GPT-4o-mini + Embeddings
- Maps: Google Places API
- Build: EAS (Expo Application Services)
- Distribution: TestFlight → App Store

### **文档链接：**
- Expo: https://docs.expo.dev
- Supabase: https://supabase.com/docs
- OpenAI: https://platform.openai.com/docs
- Google Places: https://developers.google.com/maps/documentation/places

---

## ✅ 检查清单

### **每周回顾：**
- [ ] 检查进度是否符合计划
- [ ] 更新路线图
- [ ] 识别阻碍和风险
- [ ] 调整优先级

### **每月回顾：**
- [ ] 评估里程碑完成情况
- [ ] 收集用户反馈
- [ ] 优化推荐算法
- [ ] 检查成本使用情况

---

**最后更新：** 2024-10-17
**下次更新：** TestFlight 测试完成后

---

🚀 **准备好了就开始下一个 Phase！**

