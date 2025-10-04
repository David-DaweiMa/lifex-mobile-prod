# Events功能设置指南

## 📋 概述

本指南将帮助您在LifeX Mobile App中设置Events功能，包括数据库配置和功能测试。

## 🎯 功能特性

### 已实现的功能
- ✅ Events数据库表结构和类型定义
- ✅ EventsService - 完整的数据服务层
- ✅ TrendingScreen集成 - 显示热门events
- ✅ EventDetailScreen - 事件详情页面
- ✅ 自动fallback到mock数据（当数据库为空时）
- ✅ 浏览次数跟踪
- ✅ 分类过滤和搜索
- ✅ 点赞和分享功能界面

### Events Service功能
- 获取所有events（支持过滤）
- 获取热门events
- 获取即将到来的events
- 按分类获取events
- 搜索events
- 增加浏览次数
- CRUD操作（创建、更新、删除）

## 🗄️ 数据库设置

### 步骤 1: 登录Supabase

1. 访问 [https://supabase.com](https://supabase.com)
2. 登录您的账户
3. 选择您的项目

### 步骤 2: 创建Events表

1. 在Supabase仪表板中，点击左侧菜单的 **SQL Editor**
2. 点击 **New Query** 创建新查询
3. 复制 `database/events_table.sql` 文件中的全部内容
4. 粘贴到SQL编辑器中
5. 点击 **Run** 执行SQL脚本

### 步骤 3: 验证表创建

执行以下SQL验证表是否正确创建：

```sql
-- 查看events表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'events';

-- 查看示例数据
SELECT id, title, category, date, is_hot
FROM events
LIMIT 5;
```

### 步骤 4: 检查Row Level Security (RLS)

确认RLS策略已启用：

```sql
-- 查看RLS策略
SELECT * FROM pg_policies WHERE tablename = 'events';
```

## 📱 应用配置

### 环境变量

确保 `.env` 文件包含正确的Supabase配置：

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 文件结构

```
src/
├── services/
│   ├── supabase.ts              # Supabase客户端和类型定义
│   └── eventsService.ts         # Events数据服务
├── screens/
│   ├── TrendingScreen.tsx       # 显示events列表
│   └── EventDetailScreen.tsx    # Events详情页面
├── utils/
│   ├── eventHelpers.ts          # Events辅助函数
│   └── mockData.ts              # Mock数据（fallback）
├── types/
│   └── index.ts                 # TypeScript类型定义
└── navigation/
    └── AppNavigator.tsx         # 导航配置

database/
└── events_table.sql             # 数据库创建脚本
```

## 🚀 使用方法

### 在代码中使用EventsService

```typescript
import EventsService from '../services/eventsService';
import { Event } from '../types';

// 获取所有events
const { data, error } = await EventsService.getEvents();

// 获取热门events
const { data: hotEvents } = await EventsService.getHotEvents(5);

// 获取即将到来的events
const { data: upcomingEvents } = await EventsService.getUpcomingEvents();

// 按分类获取
const { data: foodEvents } = await EventsService.getEventsByCategory('Food & Drink');

// 搜索events
const { data: searchResults } = await EventsService.searchEvents('festival');

// 获取单个event详情
const { data: event } = await EventsService.getEventById(eventId);

// 增加浏览次数
await EventsService.incrementViewCount(eventId);
```

### 导航到Event详情页

```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

// 导航到event详情
navigation.navigate('EventDetail', { eventId: 'event-uuid-here' });
```

## 🧪 测试

### 测试清单

1. **数据库连接测试**
   - [ ] 应用启动时可以连接到Supabase
   - [ ] Events数据可以成功加载
   - [ ] 错误处理正常工作

2. **TrendingScreen测试**
   - [ ] 热门events横幅正确显示
   - [ ] Events图片加载正常
   - [ ] 点击event可以导航到详情页

3. **EventDetailScreen测试**
   - [ ] Event详情正确显示
   - [ ] 所有信息字段都显示
   - [ ] 返回按钮正常工作
   - [ ] 分享功能正常
   - [ ] 点赞按钮交互正常

4. **Fallback功能测试**
   - [ ] 当数据库为空时，显示mock数据
   - [ ] 当网络错误时，显示错误信息
   - [ ] Loading状态正确显示

### 运行测试

```bash
# 启动应用
npx expo start

# 在iOS上测试
npx expo start --ios

# 在Android上测试
npx expo start --android

# 在Web上测试
npx expo start --web
```

### 测试步骤

1. 启动应用
2. 查看控制台输出确认events加载状态
3. 进入Trending页面
4. 查看events横幅是否显示
5. 点击event查看详情
6. 测试所有交互功能

## 📊 数据库Schema

### Events表结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| title | VARCHAR(255) | 事件标题 |
| description | TEXT | 详细描述 |
| date | DATE | 事件日期 |
| time | VARCHAR(50) | 事件时间 |
| location | VARCHAR(255) | 地点 |
| category | VARCHAR(100) | 分类 |
| price | VARCHAR(50) | 价格 |
| attendees | INTEGER | 参与人数 |
| image_url | TEXT | 图片URL |
| tags | TEXT[] | 标签数组 |
| is_hot | BOOLEAN | 是否热门 |
| organizer_id | UUID | 组织者ID |
| business_id | UUID | 关联商家ID |
| is_active | BOOLEAN | 是否活跃 |
| view_count | INTEGER | 浏览次数 |
| like_count | INTEGER | 点赞数 |
| share_count | INTEGER | 分享数 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 索引

- `idx_events_date` - 按日期查询
- `idx_events_category` - 按分类查询
- `idx_events_is_hot` - 查询热门events
- `idx_events_is_active` - 查询活跃events

## 🔒 安全性

### Row Level Security (RLS)

Events表启用了RLS，策略如下：

1. **公开读取**: 所有人可以查看活跃的events
2. **认证创建**: 只有登录用户可以创建events
3. **所有者更新**: 只有创建者可以更新自己的events
4. **所有者删除**: 只有创建者可以删除自己的events

### 权限管理

- 匿名用户：只能查看events
- 认证用户：可以创建、更新、删除自己的events
- 管理员：可以管理所有events（需额外配置）

## 🐛 故障排除

### 常见问题

**问题 1: Events不显示**
```
解决方案：
1. 检查.env文件配置
2. 确认Supabase URL和Key正确
3. 查看控制台错误信息
4. 验证events表已创建
```

**问题 2: Mock数据总是显示**
```
解决方案：
1. 确认数据库有数据
2. 检查RLS策略是否正确
3. 验证网络连接
```

**问题 3: 导航到详情页报错**
```
解决方案：
1. 确认EventDetailScreen已在AppNavigator注册
2. 检查eventId是否正确传递
3. 验证event存在于数据库
```

**问题 4: 图片不显示**
```
解决方案：
1. 检查image_url是否有效
2. 验证网络连接
3. 使用默认图片fallback
```

## 📈 下一步

### 待实现功能

- [ ] 实际的点赞功能（后端集成）
- [ ] 实际的分享统计
- [ ] Event注册/报名功能
- [ ] 用户收藏events
- [ ] Push通知提醒
- [ ] 日历集成
- [ ] 地图显示event位置
- [ ] 评论和评分功能

### 性能优化

- [ ] 实现分页加载
- [ ] 图片缓存优化
- [ ] 离线模式支持
- [ ] 预加载热门events

## 📚 相关文档

- [Supabase文档](https://supabase.com/docs)
- [React Native文档](https://reactnative.dev/)
- [Expo文档](https://docs.expo.dev/)
- [React Navigation文档](https://reactnavigation.org/)

## ✅ 完成确认

完成以下检查表确认events功能正常：

- [ ] SQL脚本已执行
- [ ] Events表已创建
- [ ] 示例数据已插入
- [ ] RLS策略已启用
- [ ] 应用可以加载events
- [ ] TrendingScreen显示正常
- [ ] 可以导航到详情页
- [ ] EventDetailScreen功能正常
- [ ] Fallback机制工作正常
- [ ] 没有console错误

---

**最后更新**: 2025年10月4日  
**版本**: 1.0  
**维护者**: David Ma

