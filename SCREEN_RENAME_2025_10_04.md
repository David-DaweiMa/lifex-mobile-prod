# 🔄 屏幕文件重命名 - 2025年10月4日

## 📋 重命名原因

为了让文件名与底部Tab菜单名称保持一致，避免混淆，进行了以下重命名操作。

---

## ✅ 重命名记录

### 1. TrendingScreen → EventsScreen

**旧文件名**: `src/screens/TrendingScreen.tsx`  
**新文件名**: `src/screens/EventsScreen.tsx`  
**菜单名称**: "Events"

**理由**: 该屏幕实际显示的是Events内容（events瀑布流、横幅等），而不是Trending内容。

### 2. DiscoverScreen → PlacesScreen

**旧文件名**: `src/screens/DiscoverScreen.tsx`  
**新文件名**: `src/screens/PlacesScreen.tsx`  
**菜单名称**: "Places"

**理由**: 该屏幕显示的是Places（地点/商家），而不是Discover内容。

---

## 🔧 修改内容

### 文件重命名
```bash
git mv src/screens/TrendingScreen.tsx src/screens/EventsScreen.tsx
git mv src/screens/DiscoverScreen.tsx src/screens/PlacesScreen.tsx
```

### 代码更新

#### 1. EventsScreen.tsx
```typescript
// 组件名称
- const TrendingScreen: React.FC = () => {
+ const EventsScreen: React.FC = () => {

// 导出语句
- export default TrendingScreen;
+ export default EventsScreen;
```

#### 2. PlacesScreen.tsx
```typescript
// 组件名称
- const DiscoverScreen: React.FC = () => {
+ const PlacesScreen: React.FC = () => {

// 导出语句
- export default DiscoverScreen;
+ export default PlacesScreen;
```

#### 3. AppNavigator.tsx
```typescript
// 导入语句
- import TrendingScreen from '../screens/TrendingScreen';
- import DiscoverScreen from '../screens/DiscoverScreen';
+ import EventsScreen from '../screens/EventsScreen';
+ import PlacesScreen from '../screens/PlacesScreen';

// Tab配置
<Tab.Screen
  name="Events"
- component={TrendingScreen}
+ component={EventsScreen}
/>

<Tab.Screen
  name="Places"
- component={DiscoverScreen}
+ component={PlacesScreen}
/>
```

---

## 📱 底部Tab菜单结构

更新后的菜单与文件名完全对应：

| Tab名称 | 屏幕文件 | 图标 | 功能 |
|---------|----------|------|------|
| **Chat** | `ChatScreen.tsx` | `chatbubbles-outline` | AI聊天 |
| **Events** | `EventsScreen.tsx` ✅ | `people-outline` | Events瀑布流 |
| **Specials** | `SpecialsScreen.tsx` | `pricetag-outline` | 特价优惠 |
| **Places** | `PlacesScreen.tsx` ✅ | `storefront-outline` | 地点/商家 |
| **Coly** | `ColyScreen.tsx` | `sparkles-outline` | AI助手 |

---

## ✨ 改进效果

### 之前的混淆
```
文件名: TrendingScreen.tsx
菜单名: Events
内容: Events瀑布流
❌ 文件名与菜单名不匹配

文件名: DiscoverScreen.tsx
菜单名: Places
内容: 地点/商家
❌ 文件名与菜单名不匹配
```

### 现在的清晰结构
```
文件名: EventsScreen.tsx
菜单名: Events
内容: Events瀑布流
✅ 完全一致

文件名: PlacesScreen.tsx
菜单名: Places
内容: 地点/商家
✅ 完全一致
```

---

## 🎯 命名规范

### 文件命名原则
1. **与菜单名称一致**: 文件名应该直接反映在菜单中显示的名称
2. **使用Screen后缀**: 所有屏幕组件统一使用`Screen`后缀
3. **PascalCase**: 使用大驼峰命名法

### 示例
- 菜单显示 "Events" → 文件名 `EventsScreen.tsx`
- 菜单显示 "Places" → 文件名 `PlacesScreen.tsx`
- 菜单显示 "Chat" → 文件名 `ChatScreen.tsx`

---

## 📊 影响范围

### 直接影响
- ✅ `src/screens/EventsScreen.tsx` - 重命名并更新内部组件名
- ✅ `src/screens/PlacesScreen.tsx` - 重命名并更新内部组件名
- ✅ `src/navigation/AppNavigator.tsx` - 更新导入和引用

### 无影响
- ✅ 其他screen文件
- ✅ 组件功能
- ✅ 路由导航
- ✅ 用户体验

---

## ✅ 验证清单

- [x] 文件成功重命名
- [x] 组件名称更新
- [x] 导出语句更新
- [x] 导入语句更新
- [x] 组件引用更新
- [x] 无Linter错误
- [x] 无TypeScript错误
- [x] 应用正常运行

---

## 🚀 后续建议

### 保持一致性
今后添加新屏幕时，请遵循以下原则：

1. **先确定菜单名称**: 如 "Settings"
2. **使用相同名称**: 文件命名为 `SettingsScreen.tsx`
3. **组件名称一致**: `const SettingsScreen: React.FC = () => {`
4. **导出名称一致**: `export default SettingsScreen;`

### 避免的命名
- ❌ 使用描述性名称但不匹配菜单（如 TrendingScreen vs Events）
- ❌ 使用缩写（如 DiscScreen）
- ❌ 使用不一致的大小写

---

## 📝 Git提交信息

```bash
git add src/screens/EventsScreen.tsx
git add src/screens/PlacesScreen.tsx
git add src/navigation/AppNavigator.tsx

git commit -m "refactor: rename screens to match tab menu names

- Rename TrendingScreen → EventsScreen
- Rename DiscoverScreen → PlacesScreen
- Update component names and exports
- Update AppNavigator imports and references

This improves code clarity by matching file names with their corresponding tab menu names."
```

---

## 🎉 总结

通过这次重命名，我们实现了：

1. ✅ **文件名清晰**: 文件名直接反映其在应用中的位置
2. ✅ **易于维护**: 开发者可以快速找到对应屏幕的代码
3. ✅ **减少混淆**: 不再需要记住"Trending其实是Events"
4. ✅ **统一命名**: 所有屏幕遵循相同的命名规范

---

**执行时间**: 2025年10月4日  
**执行者**: David Ma  
**影响**: 2个文件重命名 + 3个文件更新  
**状态**: ✅ 完成并验证

