# 🔧 Specials 瀑布流布局修复 - 2025年10月4日

## 🐛 问题

1. 卡片显示很长
2. 图片格式/比例不对
3. 部分卡片高度不一致

---

## ✅ 修复内容

### 1. **图片高度调整** ⭐
```typescript
// 之前 ❌
const waterfallHeights = [100, 80, 110, 90, 105, 85];

// 现在 ✅
const waterfallHeights = [180, 160, 180, 160, 180, 160, 180, 160];
```

**改进**:
- 增加图片高度（100→180, 80→160）
- 更统一的高度模式（交替180和160）
- 图片不再被压缩

### 2. **图片容器样式** ⭐
```typescript
waterfallImageContainer: {
  position: 'relative',
  overflow: 'hidden',  // ✨ 新增：防止图片溢出
}
```

### 3. **减少内容区域padding** ⭐
```typescript
// 之前 ❌
waterfallContent: {
  padding: spacing.md,  // 16px
}

// 现在 ✅
waterfallContent: {
  padding: spacing.sm,  // 12px
}
```

### 4. **优化文字间距** ⭐

**标题**:
```typescript
waterfallTitle: {
  marginBottom: spacing.xs / 2,  // 减少到4px
  lineHeight: typography.fontSize.sm * 1.3,  // 添加行高
}
```

**商家名称**:
```typescript
waterfallBusiness: {
  fontSize: typography.fontSize.xs,  // 减小字号
  marginBottom: spacing.xs / 2,  // 减少间距
}
```

**价格容器**:
```typescript
waterfallPriceContainer: {
  marginBottom: spacing.xs,  // 从spacing.sm减少到spacing.xs
}
```

---

## 📐 布局改进

### 之前 ❌
```
┌──────────┐
│          │ ← 100px (太矮，图片压缩)
│  Image   │
├──────────┤
│  Title   │
│  Business│ ← spacing.md padding (太大)
│  $$ $$   │
│          │ ← 卡片太长
└──────────┘
```

### 现在 ✅
```
┌──────────┐
│          │
│          │ ← 180px/160px (合适的高度)
│  Image   │
│          │
├──────────┤
│ Title    │
│ Business │ ← spacing.sm padding (紧凑)
│ $$ $$    │
└──────────┘
```

---

## 🎯 视觉效果

| 项目 | 之前 | 现在 | 改进 |
|------|------|------|------|
| 图片高度 | 100/80px | 180/160px | +80px ✅ |
| 内容padding | 16px | 12px | -4px ✅ |
| 标题间距 | 8px | 4px | -4px ✅ |
| 商家字号 | sm | xs | 更小 ✅ |
| 价格间距 | 12px | 8px | -4px ✅ |

**总体**: 图片更大，文字更紧凑，卡片高度更一致

---

## 📊 卡片高度计算

```
卡片总高度 = 图片高度 + 内容高度

左列 (偶数):
- 图片: 180px
- 内容: ~100px
- 总计: ~280px

右列 (奇数):
- 图片: 160px
- 内容: ~100px
- 总计: ~260px

交替高度差: 20px (适度的瀑布流效果)
```

---

## ✨ 额外优化

### 图片显示
- ✅ `overflow: hidden` 防止溢出
- ✅ `resizeMode: 'cover'` 保持比例
- ✅ 循环使用默认图片
- ✅ 支持数据库image_url

### 文字显示
- ✅ 标题限制2行
- ✅ 商家名称限制1行
- ✅ 合理的行高
- ✅ 适当的字号层级

---

## 🧪 测试要点

1. ✅ 图片高度一致，不被压缩
2. ✅ 图片比例正确
3. ✅ 卡片整体高度合理
4. ✅ 文字不会太拥挤
5. ✅ 瀑布流效果自然
6. ✅ 左右两列高度交替
7. ✅ OFF标签显示在图片上

---

## 📱 最终效果

- **图片**: 清晰、不变形、合适的高度
- **卡片**: 紧凑但不拥挤
- **布局**: 整齐的瀑布流效果
- **一致性**: 与Events、Places页面风格统一

---

**修复时间**: 2025年10月4日  
**文件**: `src/screens/SpecialsScreen.tsx`  
**状态**: ✅ 已修复  
**无Lint错误**: ✅

