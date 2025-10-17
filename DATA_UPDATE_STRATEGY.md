# 🔄 数据更新策略 - 平衡成本与用户体验

## 🎯 **核心目标**

- ✅ **最佳用户体验**（快速、准确）
- ✅ **最低成本**（充分利用免费额度）
- ✅ **合规使用**（遵守 Google ToS）
- ✅ **可扩展性**（适应增长）

---

## 📋 **分层更新策略**

### **数据分类：**

| 数据类型 | 变化频率 | 重要性 | 更新策略 | 缓存时间 |
|---------|---------|--------|---------|---------|
| **名称** | 很少 | 低 | 被动 | 30 天 |
| **地址** | 很少 | 低 | 被动 | 30 天 |
| **电话** | 偶尔 | 中 | 被动 | 30 天 |
| **描述** | 很少 | 低 | 被动 | 30 天 |
| **评分** | 经常 | 高 | **混合** | **7 天** |
| **评论数** | 经常 | 中 | 混合 | 7 天 |
| **营业时间** | 偶尔 | 高 | **实时** | **0** |
| **营业状态** | 实时 | **极高** | **实时** | **0** |
| **照片** | 偶尔 | 中 | 实时加载 | 不缓存 |

---

## 🚀 **具体实现方案**

### **方案 1: 被动更新（基本信息）**

**适用于：** 名称、地址、电话、描述

```typescript
async function getBusinessBasicInfo(businessId: string) {
  // 1. 从数据库获取
  const business = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();
  
  // 2. 检查缓存年龄
  const cacheAge = Date.now() - new Date(business.cached_at).getTime();
  const CACHE_TTL = 30 * 24 * 60 * 60 * 1000;  // 30 天
  
  // 3. 如果过期，后台更新
  if (cacheAge > CACHE_TTL) {
    // 异步更新，不等待
    updateBasicInfoInBackground(business.google_place_id, businessId)
      .catch(err => console.error('Background update failed:', err));
  }
  
  // 4. 立即返回缓存数据
  return business;
}

async function updateBasicInfoInBackground(placeId: string, businessId: string) {
  console.log(`🔄 Updating business ${businessId} in background...`);
  
  try {
    // 从 Google API 获取最新数据
    const freshData = await googlePlaces.details({
      place_id: placeId,
      fields: [
        'name',
        'formatted_address',
        'formatted_phone_number',
        'website',
        'photos'
      ]
    });
    
    // 更新数据库
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    await supabase
      .from('businesses')
      .update({
        cached_name: freshData.name,
        cached_address: freshData.formatted_address,
        cached_phone: freshData.formatted_phone_number,
        cached_website: freshData.website,
        google_photo_reference: freshData.photos?.[0]?.photo_reference,
        cached_at: now.toISOString(),
        cache_expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', businessId);
    
    console.log(`✅ Business ${businessId} updated successfully`);
  } catch (error) {
    console.error(`❌ Failed to update business ${businessId}:`, error);
    // 失败不影响用户，下次再试
  }
}
```

**优点：**
- ⚡ 极快响应（50-100ms）
- 💰 成本低（按需更新）
- 👤 用户无感知

**缺点：**
- ⚠️ 数据可能过时（最多 30 天）
- ⚠️ 首次看到旧数据

---

### **方案 2: 混合更新（评分数据）**

**适用于：** 评分、评论数

```typescript
async function getBusinessRating(businessId: string) {
  // 1. 从数据库获取
  const business = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();
  
  // 2. 检查评分缓存年龄
  const cacheAge = Date.now() - new Date(business.rating_cached_at || 0).getTime();
  const RATING_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;  // 7 天（更短）
  
  // 3. 如果过期，后台更新
  if (cacheAge > RATING_CACHE_TTL) {
    updateRatingInBackground(business.google_place_id, businessId);
  }
  
  // 4. 返回双评分数据
  return {
    google: {
      rating: business.cached_google_rating,
      review_count: business.cached_google_reviews,
      updated_at: business.rating_cached_at,
      age_days: Math.floor(cacheAge / (24 * 60 * 60 * 1000))
    },
    lifex: {
      rating: business.lifex_rating,
      review_count: business.lifex_reviews,
      updated_at: 'realtime'  // 我们的评分是实时的
    }
  };
}

async function updateRatingInBackground(placeId: string, businessId: string) {
  try {
    // 只请求评分相关字段（减少成本）
    const freshData = await googlePlaces.details({
      place_id: placeId,
      fields: ['rating', 'user_ratings_total']
    });
    
    await supabase
      .from('businesses')
      .update({
        cached_google_rating: freshData.rating,
        cached_google_reviews: freshData.user_ratings_total,
        rating_cached_at: new Date().toISOString()
      })
      .eq('id', businessId);
    
    console.log(`✅ Rating updated for business ${businessId}`);
  } catch (error) {
    console.error(`❌ Failed to update rating:`, error);
  }
}
```

**优点：**
- ⚡ 快速响应
- 📊 评分更准确（7 天更新）
- 💡 显示双评分（更全面）

---

### **方案 3: 实时验证（关键数据）**

**适用于：** 营业状态、当前是否营业

```typescript
async function getBusinessOpenStatus(businessId: string) {
  const business = await supabase
    .from('businesses')
    .select('google_place_id, cached_name')
    .eq('id', businessId)
    .single();
  
  try {
    // 实时查询营业状态（轻量级 API）
    const result = await googlePlaces.details({
      place_id: business.google_place_id,
      fields: ['opening_hours', 'current_opening_hours']
    });
    
    return {
      isOpen: result.opening_hours?.open_now || false,
      openingHours: result.opening_hours,
      currentStatus: result.current_opening_hours,
      verified: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get open status:', error);
    return {
      isOpen: null,
      verified: false,
      error: 'Unable to verify current status'
    };
  }
}

// UI 组件中使用
function BusinessOpenStatus({ businessId }: { businessId: string }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getBusinessOpenStatus(businessId)
      .then(setStatus)
      .finally(() => setLoading(false));
  }, [businessId]);
  
  if (loading) {
    return <ActivityIndicator size="small" />;
  }
  
  if (!status.verified) {
    return <Text style={styles.unknown}>营业状态未知</Text>;
  }
  
  return (
    <View style={styles.statusContainer}>
      {status.isOpen ? (
        <Text style={styles.open}>✅ 营业中</Text>
      ) : (
        <Text style={styles.closed}>⛔ 已关闭</Text>
      )}
      <Text style={styles.timestamp}>
        (实时查询 {formatTime(status.timestamp)})
      </Text>
    </View>
  );
}
```

**优点：**
- ✅ 关键信息准确
- ✅ 避免用户白跑
- ✅ 建立信任

**成本：**
- 营业状态查询：$0.005/次
- 假设 1,000 次/天 = $5/天 = $150/月
- 在免费额度内！✅

---

### **方案 4: 智能预加载**

**适用于：** 热门商家、用户可能访问的商家

```typescript
// 在列表页面预加载热门商家
function BusinessListScreen() {
  const [businesses, setBusinesses] = useState([]);
  
  useEffect(() => {
    loadBusinesses();
  }, []);
  
  useEffect(() => {
    if (businesses.length > 0) {
      // 预加载前 10 个商家的数据
      preloadBusinessData(businesses.slice(0, 10));
    }
  }, [businesses]);
  
  async function preloadBusinessData(businessList: Business[]) {
    for (const business of businessList) {
      // 检查缓存状态
      const needsUpdate = await checkIfNeedsUpdate(business.id);
      
      if (needsUpdate) {
        // 后台更新（用户点击时数据已是新的）
        updateBusinessInBackground(business.google_place_id, business.id);
      }
    }
  }
  
  return (
    <FlatList
      data={businesses}
      renderItem={({ item }) => <BusinessCard business={item} />}
      onEndReached={() => {
        // 滚动到底部时，预加载下一批
        const nextBatch = businesses.slice(10, 20);
        preloadBusinessData(nextBatch);
      }}
    />
  );
}
```

**优点：**
- 🚀 用户点击时数据已更新
- ⚡ 无感知更新
- 💰 不增加额外成本

---

## 🎨 **用户体验优化**

### **1. 显示数据新鲜度**

```jsx
function BusinessCard({ business }: { business: Business }) {
  const cacheAge = useCacheAge(business.cached_at);
  
  return (
    <TouchableOpacity onPress={() => navigateTo(business.id)}>
      <View style={styles.card}>
        <Text style={styles.name}>{business.cached_name}</Text>
        
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>
            {business.cached_google_rating} ⭐
          </Text>
          <Text style={styles.cacheAge}>
            (更新于 {cacheAge})
          </Text>
        </View>
        
        {/* 如果数据太旧，显示警告 */}
        {getDaysOld(business.cached_at) > 20 && (
          <Text style={styles.warning}>
            ⚠️ 数据可能已过时
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// 辅助函数
function useCacheAge(cachedAt: string) {
  const days = getDaysOld(cachedAt);
  
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days} 天前`;
  if (days < 30) return `${Math.floor(days / 7)} 周前`;
  return `${Math.floor(days / 30)} 月前`;
}
```

---

### **2. 双评分系统**

```jsx
function BusinessRatings({ business }: { business: Business }) {
  return (
    <View style={styles.ratingsContainer}>
      {/* Google 评分（可能不是最新） */}
      <View style={styles.ratingCard}>
        <Image source={require('./assets/google-icon.png')} />
        <View>
          <Text style={styles.ratingValue}>
            {business.cached_google_rating} ⭐
          </Text>
          <Text style={styles.ratingSource}>
            Google ({business.cached_google_reviews} 评论)
          </Text>
          <Text style={styles.ratingAge}>
            更新于 {formatDate(business.rating_cached_at)}
          </Text>
        </View>
      </View>
      
      {/* LifeX 评分（实时） */}
      <View style={styles.ratingCard}>
        <Image source={require('./assets/lifex-icon.png')} />
        <View>
          <Text style={styles.ratingValue}>
            {business.lifex_rating} ⭐
          </Text>
          <Text style={styles.ratingSource}>
            LifeX ({business.lifex_reviews} 评论)
          </Text>
          <Text style={[styles.ratingAge, styles.realtime]}>
            实时评分 ✨
          </Text>
        </View>
      </View>
    </View>
  );
}
```

---

### **3. 手动刷新**

```jsx
function BusinessDetailsScreen({ businessId }: { businessId: string }) {
  const [business, setBusiness] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  async function loadBusiness() {
    const data = await getBusinessBasicInfo(businessId);
    setBusiness(data);
  }
  
  async function forceRefresh() {
    setRefreshing(true);
    try {
      // 强制从 Google API 获取最新数据
      await forceUpdateBusiness(businessId);
      await loadBusiness();
    } finally {
      setRefreshing(false);
    }
  }
  
  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={forceRefresh}
          title="下拉刷新数据"
        />
      }
    >
      <BusinessDetails business={business} />
      
      {/* 或者添加刷新按钮 */}
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={forceRefresh}
      >
        <Icon name="refresh" />
        <Text>刷新数据</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

---

### **4. 加载状态优化**

```jsx
function BusinessDetails({ businessId }: { businessId: string }) {
  const [business, setBusiness] = useState(null);
  const [openStatus, setOpenStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  
  useEffect(() => {
    // 1. 立即显示缓存数据
    getBusinessBasicInfo(businessId).then(setBusiness);
    
    // 2. 异步加载营业状态
    getBusinessOpenStatus(businessId)
      .then(setOpenStatus)
      .finally(() => setLoadingStatus(false));
  }, [businessId]);
  
  if (!business) {
    return <LoadingScreen />;
  }
  
  return (
    <View>
      {/* 基本信息立即显示 */}
      <Text style={styles.title}>{business.cached_name}</Text>
      <Text>{business.cached_address}</Text>
      
      {/* 营业状态显示加载动画 */}
      <View style={styles.statusContainer}>
        {loadingStatus ? (
          <>
            <ActivityIndicator size="small" />
            <Text>正在查询营业状态...</Text>
          </>
        ) : (
          <OpenStatusBadge status={openStatus} />
        )}
      </View>
    </View>
  );
}
```

---

## 📊 **成本与体验对比**

### **纯实时方案（不推荐）**

```
优点：
✅ 数据永远最新
✅ 无缓存过期问题

缺点：
❌ 响应慢（500-2000ms）
❌ 成本高（$500+/月）
❌ 用户体验差（加载慢）
❌ API 配额容易超

结论：❌ 不推荐
```

---

### **纯缓存方案（不合规）**

```
优点：
✅ 响应极快（50ms）
✅ 成本低（$0）

缺点：
❌ 违反 Google ToS
❌ 数据可能严重过时
❌ API 可能被禁用
❌ 用户投诉多

结论：❌ 不可行
```

---

### **混合方案（推荐）** ⭐⭐⭐⭐⭐

```
优点：
✅ 响应快（50-100ms）
✅ 成本低（$70/月）
✅ 合规使用
✅ 数据足够准确
✅ 关键信息实时

缺点：
⚠️ 需要设计和实现
⚠️ 需要监控更新状态

结论：✅ 强烈推荐
```

---

## 🎯 **最终推荐配置**

### **数据更新时间表：**

| 数据类型 | 更新策略 | 频率 | 成本/月 |
|---------|---------|------|---------|
| **基本信息** | 被动 | 30 天 | $84 |
| **评分** | 混合 | 7 天（热门） | $36 |
| **营业状态** | 实时 | 每次访问 | $150 |
| **照片** | 实时 | 动态加载 | $0 |
| **总计** | | | **$270** |
| **免费额度** | | | **-$200** |
| **实际支付** | | | **$70** ✅ |

### **用户体验评分：**

| 指标 | 评分 | 说明 |
|-----|------|------|
| **响应速度** | ⭐⭐⭐⭐⭐ | 50-100ms，极快 |
| **数据准确性** | ⭐⭐⭐⭐ | 关键数据实时，其他 7-30 天 |
| **信息完整性** | ⭐⭐⭐⭐⭐ | 双评分系统，更全面 |
| **用户控制** | ⭐⭐⭐⭐⭐ | 可手动刷新 |
| **信任度** | ⭐⭐⭐⭐⭐ | 显示数据新鲜度 |
| **总体体验** | **⭐⭐⭐⭐⭐** | **优秀** |

---

## 📝 **实施步骤**

### **Week 1: 基础缓存**
- [ ] 实现被动更新机制
- [ ] 添加缓存时间戳
- [ ] 测试基本更新流程

### **Week 2: 混合更新**
- [ ] 实现评分混合更新
- [ ] 添加双评分显示
- [ ] 热门商家主动更新

### **Week 3: 实时验证**
- [ ] 实现营业状态实时查询
- [ ] 添加加载状态UI
- [ ] 错误处理和降级

### **Week 4: UX 优化**
- [ ] 显示数据新鲜度
- [ ] 添加手动刷新
- [ ] 实现智能预加载
- [ ] 性能监控和优化

---

## 🔧 **监控和维护**

### **关键指标：**

```typescript
// 监控数据新鲜度
async function monitorDataFreshness() {
  const stats = await supabase
    .from('businesses')
    .select('cached_at')
    .then(({ data }) => {
      const now = Date.now();
      const ages = data.map(b => 
        (now - new Date(b.cached_at).getTime()) / (24 * 60 * 60 * 1000)
      );
      
      return {
        avg: average(ages),
        max: Math.max(...ages),
        expired: ages.filter(age => age > 30).length,
        total: ages.length
      };
    });
  
  console.log('Data Freshness Stats:', stats);
  // avg: 15 天（平均）
  // max: 29 天（最旧）
  // expired: 0（过期数量）
  // total: 5000（总数）
}

// 监控 API 使用量
async function monitorAPIUsage() {
  // 从 Google Cloud Console API & Services
  // 查看每日/每月使用量
  // 设置警报（如超过 $150 发邮件）
}

// 监控用户反馈
async function monitorUserFeedback() {
  const feedback = await supabase
    .from('user_feedback')
    .select('*')
    .ilike('content', '%数据不准%')
    .or('content.ilike.%已关闭%,content.ilike.%错误%');
  
  if (feedback.length > 10) {
    console.warn('⚠️ Many users reporting data accuracy issues');
    // 考虑增加更新频率
  }
}
```

---

## ✅ **结论**

### **被动更新对用户体验的影响：**

**✅ 几乎无负面影响，反而有诸多优势：**

1. ⚡ **极快响应**（10-40x 更快）
2. 📊 **数据足够准确**（7-30 天内）
3. 💰 **成本极低**（$70/月 vs $500+/月）
4. ✅ **关键信息实时**（营业状态）
5. 🎨 **UX 优化完善**（双评分、刷新、预加载）

**⚠️ 轻微影响（可忽略）：**
- 非关键数据可能有 7-30 天延迟
- 用户首次访问看到稍旧数据

**🚀 整体评价：**
- **用户体验：⭐⭐⭐⭐⭐ 优秀**
- **成本效益：⭐⭐⭐⭐⭐ 极佳**
- **推荐指数：⭐⭐⭐⭐⭐ 强烈推荐**

---

**混合更新策略 = 最佳用户体验 + 最低成本 + 完全合规！** ✅🎉

