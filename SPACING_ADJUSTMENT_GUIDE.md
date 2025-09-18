# 容器间距调整工具使用指南

## 文件位置
配置文件：`src/constants/spacingConfig.ts`

## 如何调整间距

### 1. 打开配置文件
在编辑器中打开 `src/constants/spacingConfig.ts` 文件

### 2. 修改数值
找到你想要调整的容器，修改对应的数值：

```typescript
export const spacingConfig = {
  // 主分类按钮容器 (Following/Recommended/Nearby 等)
  mainCategories: {
    marginTop: 8,        // 距离顶部的间距
    marginBottom: 0,     // 距离底部的间距
    marginHorizontal: 16, // 左右边距
    paddingVertical: 4,   // 上下内边距
    paddingHorizontal: 16, // 左右内边距
  },

  // 分类标签容器 (All/Food/Lifestyle 等)
  tagsContainer: {
    marginTop: 0,        // 距离顶部的间距
    marginBottom: 0,     // 距离底部的间距
    paddingVertical: 0,  // 上下内边距
    paddingHorizontal: 4, // 左右内边距
  },

  // 单个标签
  tag: {
    paddingVertical: 0,   // 标签上下内边距
    paddingHorizontal: 4, // 标签左右内边距
    marginRight: 4,       // 标签右边距
    borderWidth: 0.5,     // 标签边框宽度
  },

  // 内容滚动区域
  scrollView: {
    marginTop: -8,       // 内容区域向上移动的距离 (负值表示向上)
  },

  // 内容容器
  scrollContent: {
    paddingHorizontal: 4, // 内容左右内边距
    paddingBottom: 4,     // 内容底部内边距
  },
};
```

### 3. 保存并查看效果
- 保存文件后，应用会自动重新加载
- 观察效果，如果不满意可以继续调整

## 常用调整示例

### 增加主分类按钮和标签之间的间距
```typescript
mainCategories: {
  marginBottom: 8,  // 从 0 改为 8
}
```

### 减少标签容器的高度
```typescript
tagsContainer: {
  paddingVertical: -2,  // 从 0 改为 -2
}
```

### 让内容区域更贴近标签
```typescript
scrollView: {
  marginTop: -16,  // 从 -8 改为 -16
}
```

### 增加标签之间的间距
```typescript
tag: {
  marginRight: 8,  // 从 4 改为 8
}
```

## 注意事项

1. **数值单位**：所有数值的单位都是像素 (px)
2. **负值**：负值表示向上或向左移动
3. **逐步调整**：建议每次只修改一个数值，观察效果后再调整其他数值
4. **影响范围**：修改会影响所有三个页面（Discover、Specials、Trending）
5. **备份**：如果需要，可以先备份当前的配置

## 快速重置
如果需要重置到默认值，可以使用以下配置：

```typescript
export const spacingConfig = {
  mainCategories: {
    marginTop: 8,
    marginBottom: 0,
    marginHorizontal: 16,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  tagsContainer: {
    marginTop: 0,
    marginBottom: 0,
    paddingVertical: 0,
    paddingHorizontal: 4,
  },
  tag: {
    paddingVertical: 0,
    paddingHorizontal: 4,
    marginRight: 4,
    borderWidth: 0.5,
  },
  scrollView: {
    marginTop: -8,
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
};
```
