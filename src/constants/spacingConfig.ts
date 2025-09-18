// 手动调整容器间距的配置文件
// 修改这些数值来调整不同容器的间距

export const spacingConfig = {
  // 主分类按钮容器 (Following/Recommended/Nearby 等)
  mainCategories: {
    marginTop: 4,        // 距离顶部的间距 (spacing.xs)
    marginBottom: 4,     // 距离底部的间距 (spacing.xs)
    marginHorizontal: 8, // 左右边距 (spacing.sm)
    paddingVertical: 4,  // 上下内边距 (spacing.xs)
    paddingHorizontal: 16, // 左右内边距 (spacing.md)
  },

  // 分类标签容器 (All/Food/Lifestyle 等)
  tagsContainer: {
    marginTop: 0,        // 距离顶部的间距
    marginBottom: 0,     // 距离底部的间距
    paddingVertical: 4,  // 上下内边距 (spacing.xs)
    paddingHorizontal: 16, // 左右内边距 (spacing.md)
    minHeight: 40,       // 最小高度，确保可点击
  },

  // 单个标签
  tag: {
    paddingVertical: 2,   // 标签上下内边距 (spacing.xs / 2)
    paddingHorizontal: 12, // 标签左右内边距 (spacing.sm)
    marginRight: 4,       // 标签右边距 (spacing.xs)
    borderWidth: 1,       // 标签边框宽度
    height: 32,           // 固定高度，让所有标签一致
  },

  // 内容滚动区域
  scrollView: {
    marginTop: 0,        // 内容区域向上移动的距离 (已移除负边距)
  },

  // 内容容器
  scrollContent: {
    paddingHorizontal: 16, // 内容左右内边距 (spacing.md)
    paddingTop: 8,        // 内容顶部内边距 (spacing.sm)
    paddingBottom: 32,    // 内容底部内边距 (spacing.xl)
  },
};

// 使用说明：
// 1. 修改数值后保存文件
// 2. 应用会自动重新加载并应用新的间距
// 3. 数值单位是像素 (px)
// 4. 负值表示向上或向左移动
// 5. 建议每次只修改一个数值，观察效果后再调整其他数值
