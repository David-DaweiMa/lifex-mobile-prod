# Specials Banner Database Integration - 2025-10-04

## 🎯 更新目标

将 Specials 页面的 Hero Banner（横向轮播）从 mock 数据改为使用数据库数据，与瀑布流保持一致。

## 📊 更新前状态

### Before（不一致）

| 区域 | 数据源 | 状态 |
|------|--------|------|
| Hero Banner（横向滑动） | `mockSpecialsData` | ❌ Mock 数据 |
| 瀑布流卡片 | `specials`（数据库） | ✅ 数据库数据 |

**问题**：Banner 和瀑布流使用不同的数据源，数据不一致。

## ✅ 更新后状态

### After（统一）

| 区域 | 数据源 | 状态 |
|------|--------|------|
| Hero Banner（横向滑动） | `featuredSpecials`（数据库） | ✅ 数据库数据 |
| 瀑布流卡片 | `specials`（数据库） | ✅ 数据库数据 |

**改进**：所有区域统一使用数据库数据。

## 🔧 技术实现

### 1. 更新 featuredSpecials 定义

**Before:**
```typescript
const featuredSpecials = specials.slice(0, 3);
```

**After:**
```typescript
// Featured specials for hero banner (前6个用于轮播)
const featuredSpecials = specials.slice(0, 6);
```

### 2. 更新 Hero Banner JSX

#### Before (Mock 数据)
```typescript
{mockSpecialsData.slice(0, 6).map((special, index) => (
  <TouchableOpacity key={special.id} style={styles.heroCard}>
    <Image source={{ uri: specialImages[index] }} style={styles.heroImage} />
    <View style={styles.heroOverlay}>
      {/* ... */}
      <Text style={styles.heroTitle}>{special.title}</Text>
      <Text style={styles.heroDiscount}>{special.discount} OFF</Text>
      <Text style={styles.heroBusiness}>{special.business}</Text>
      {/* 静态倒计时 */}
      <Text>Ends in {index + 1} day{index > 0 ? 's' : ''}</Text>
      {/* 静态收藏数 */}
      <Text>{18 + index * 2}</Text>
    </View>
  </TouchableOpacity>
))}
```

#### After (数据库数据)
```typescript
{featuredSpecials.map((special, index) => {
  const isFavorited = favoriteSpecials.some(fav => fav.id === special.id);
  // 真实计算剩余天数
  const daysRemaining = Math.ceil(
    (new Date(special.validUntil).getTime() - new Date().getTime()) 
    / (1000 * 60 * 60 * 24)
  );
  
  return (
    <TouchableOpacity 
      key={special.id} 
      style={styles.heroCard}
      onPress={() => navigation.navigate('SpecialDetail', { specialId: special.id })}
    >
      {/* 使用数据库图片，回退到默认图片 */}
      <Image 
        source={{ uri: special.image || specialImages[index % specialImages.length] }} 
        style={styles.heroImage} 
      />
      <View style={styles.heroOverlay}>
        {/* 数据库数据 */}
        <Text style={styles.heroTitle}>{special.title}</Text>
        <Text style={styles.heroDiscount}>{special.discount} OFF</Text>
        <Text style={styles.heroBusiness}>{special.business}</Text>
        
        {/* 真实倒计时 */}
        <Text>
          {daysRemaining > 0 
            ? `Ends in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}` 
            : 'Expired'
          }
        </Text>
        
        {/* 真实收藏功能 */}
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite({ id: special.id, title: special.title });
          }}
        >
          <Ionicons 
            name={isFavorited ? "heart" : "heart-outline"} 
            size={14} 
            color="#ff4444" 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
})}
```

### 3. 更新 Dots Indicator

**Before:**
```typescript
{mockSpecialsData.slice(0, 6).map((_, index) => (
  <View key={index} style={[styles.dot, index === currentPage && styles.activeDot]} />
))}
```

**After:**
```typescript
{featuredSpecials.map((_, index) => (
  <View key={index} style={[styles.dot, index === currentPage && styles.activeDot]} />
))}
```

## 🎯 新增功能

### 1. **导航功能** ✅
```typescript
onPress={() => navigation.navigate('SpecialDetail', { specialId: special.id })}
```
- 点击 Banner 卡片可跳转到详情页

### 2. **真实倒计时** ✅
```typescript
const daysRemaining = Math.ceil(
  (new Date(special.validUntil).getTime() - new Date().getTime()) 
  / (1000 * 60 * 60 * 24)
);
```
- 根据 `validUntil` 字段实时计算剩余天数
- 过期显示 "Expired"

### 3. **收藏功能** ✅
```typescript
const isFavorited = favoriteSpecials.some(fav => fav.id === special.id);

<TouchableOpacity 
  onPress={(e) => {
    e.stopPropagation();
    toggleFavorite({ id: special.id, title: special.title });
  }}
>
  <Ionicons 
    name={isFavorited ? "heart" : "heart-outline"} 
    color="#ff4444" 
  />
</TouchableOpacity>
```
- 实时显示收藏状态
- 点击可收藏/取消收藏
- 使用 `stopPropagation` 防止触发卡片导航

### 4. **图片处理** ✅
```typescript
<Image 
  source={{ uri: special.image || specialImages[index % specialImages.length] }} 
/>
```
- 优先使用数据库图片 URL
- 无图片时使用默认图片数组

## 📊 数据流

```
Supabase Database
  ↓
SpecialsService.getActiveSpecials()
  ↓
loadSpecials() → setSpecials(formattedData)
  ↓
featuredSpecials = specials.slice(0, 6)
  ↓
Hero Banner 渲染
  ↓
用户交互（点击、收藏）
```

## 🎨 用户体验改进

### Before (Mock 数据)
```
❌ Banner 和瀑布流数据不一致
❌ 静态倒计时（假数据）
❌ 静态收藏数（假数据）
❌ 点击无法跳转详情
❌ 无法收藏
```

### After (数据库数据)
```
✅ Banner 和瀑布流数据一致
✅ 真实倒计时（基于有效期）
✅ 真实收藏状态
✅ 点击跳转到详情页
✅ 可以收藏/取消收藏
✅ 图片优先使用数据库 URL
```

## 🔍 技术细节

### 1. 事件冒泡处理
```typescript
onPress={(e) => {
  e.stopPropagation();  // 阻止事件冒泡
  toggleFavorite(...);
}}
```
防止点击收藏按钮时触发卡片的导航。

### 2. 日期计算
```typescript
const daysRemaining = Math.ceil(
  (new Date(special.validUntil).getTime() - new Date().getTime()) 
  / (1000 * 60 * 60 * 24)
);
```
- `Math.ceil` 确保向上取整（1.1天 = 2天）
- 时间戳差值 ÷ (1000 * 60 * 60 * 24) = 天数

### 3. 收藏状态检查
```typescript
const isFavorited = favoriteSpecials.some(fav => fav.id === special.id);
```
- `Array.some()` 高效检查是否已收藏
- 实时反映收藏状态

### 4. 图片回退
```typescript
special.image || specialImages[index % specialImages.length]
```
- 使用模运算符循环使用默认图片
- 确保即使没有数据库图片也有视觉内容

## 📝 修改文件

| 文件 | 修改类型 | 说明 |
|------|---------|------|
| `src/screens/SpecialsScreen.tsx` | 更新 | 完整更新 Hero Banner |

### 具体修改
1. ✅ `featuredSpecials` 定义：`slice(0, 3)` → `slice(0, 6)`
2. ✅ Banner 数据源：`mockSpecialsData` → `featuredSpecials`
3. ✅ 添加导航功能
4. ✅ 添加真实倒计时
5. ✅ 添加收藏功能
6. ✅ 图片 URL 处理
7. ✅ Dots indicator 数据源更新

## ✅ 完成状态

- ✅ Banner 使用数据库数据
- ✅ 导航到详情页
- ✅ 真实倒计时显示
- ✅ 收藏功能集成
- ✅ 图片优先使用数据库 URL
- ✅ Dots indicator 与数据同步
- ✅ 无 Lint 错误
- ✅ 与瀑布流数据一致

## 🎯 数据一致性

现在整个 Specials 页面完全使用数据库数据：

```
SpecialsService.getActiveSpecials()
    ↓
┌───────────────────────┐
│   Specials State      │
│   (数据库数据)         │
└───────────────────────┘
    ↓                ↓
Hero Banner    Waterfall Grid
(前6个)         (所有)
    ↓                ↓
详情页 ← ─ ─ ─ ─ ─ ↓
(点击跳转)
```

## 🚀 后续优化建议

### 1. 使用 `is_featured` 字段
```typescript
// 获取特色优惠用于 Banner
const { data } = await SpecialsService.getFeaturedSpecials(6);
const featuredSpecials = data || specials.slice(0, 6);
```

### 2. 添加加载状态
```typescript
{isLoadingSpecials ? (
  <ActivityIndicator />
) : (
  <ScrollView>
    {featuredSpecials.map(...)}
  </ScrollView>
)}
```

### 3. 缓存优化
```typescript
// 使用 useMemo 避免重复计算
const featuredSpecials = useMemo(
  () => specials.slice(0, 6),
  [specials]
);
```

---

**更新时间**: 2025-10-04
**功能状态**: ✅ 完全可用
**数据一致性**: ⭐⭐⭐⭐⭐

现在 Specials 页面的所有区域都使用统一的数据库数据了！🎉

