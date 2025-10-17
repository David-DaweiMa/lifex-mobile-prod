# 🎯 高级推荐系统 - 混合搜索 + 个性化 + 商家画像

## 📋 目录
1. [混合搜索架构](#混合搜索架构)
2. [商家画像系统](#商家画像系统)
3. [用户画像与个性化](#用户画像与个性化)
4. [标签体系](#标签体系)
5. [实施方案](#实施方案)

---

## 🔄 混合搜索架构

### **你说得对！最终是三者结合：**

```
最终推荐 = 混合搜索 + 个性化 + 商家画像

混合搜索：
├─ 向量搜索（语义理解）60%
├─ 基础优化（综合评分）30%
└─ 个性化权重 10%

最终评分 = 
  向量相似度 × 0.40 +
  质量得分 × 0.20 +
  用户偏好匹配度 × 0.15 +
  距离得分 × 0.10 +
  热度得分 × 0.10 +
  商家画像匹配度 × 0.05
```

---

## 🏢 商家画像系统

### **1. 商家画像的重要性**

**为什么需要详细的商家画像？**

| 好处 | 说明 |
|-----|------|
| **精准推荐** | 理解商家特征，匹配用户需求 |
| **多维搜索** | 支持复杂的搜索条件 |
| **个性化** | 根据用户偏好匹配最合适的商家 |
| **可解释性** | 能告诉用户"为什么推荐" |

---

### **2. 商家画像数据结构**

```typescript
// 完整的商家画像
interface BusinessProfile {
  // ===== 基础信息 =====
  id: string;
  name: string;
  description: string;
  category: string;
  subcategories: string[];
  
  // ===== 标签体系 =====
  tags: {
    // 菜系/类型标签（餐饮）
    cuisine: string[];  // ['italian', 'mediterranean', 'fusion']
    
    // 特色标签
    features: string[];  // ['outdoor_seating', 'family_friendly', 'romantic']
    
    // 价格标签
    priceRange: string;  // 'budget' | 'moderate' | 'upscale' | 'luxury'
    priceLevel: number;  // 1-4 ($, $$, $$$, $$$$)
    
    // 场景标签
    occasions: string[];  // ['date_night', 'business_lunch', 'casual_dining']
    
    // 餐饮时段
    mealTypes: string[];  // ['breakfast', 'brunch', 'lunch', 'dinner']
    
    // 饮食限制
    dietary: string[];  // ['vegetarian', 'vegan', 'gluten_free', 'halal']
    
    // 氛围标签
    ambiance: string[];  // ['cozy', 'lively', 'quiet', 'modern', 'traditional']
    
    // 服务标签
    services: string[];  // ['delivery', 'takeaway', 'dine_in', 'catering']
    
    // 设施标签
    amenities: string[];  // ['wifi', 'parking', 'wheelchair_accessible', 'kids_menu']
    
    // AI 生成的标签（从评论中提取）
    aiExtracted: string[];  // ['great_pizza', 'fast_service', 'noisy']
  };
  
  // ===== 质量指标 =====
  metrics: {
    // Google 评分
    googleRating: number;
    googleReviews: number;
    
    // 我们的评分
    lifexRating: number;
    lifexReviews: number;
    
    // 各维度评分（从评论中提取）
    ratings: {
      food: number;       // 食物质量
      service: number;    // 服务质量
      ambiance: number;   // 环境氛围
      value: number;      // 性价比
      cleanliness: number; // 清洁度
    };
    
    // 热度指标
    viewCount: number;
    favoriteCount: number;
    shareCount: number;
    bookmarkCount: number;
  };
  
  // ===== 情感分析 =====
  sentiment: {
    overall: number;  // -1 到 1
    positive: number;  // 0-100%
    neutral: number;   // 0-100%
    negative: number;  // 0-100%
    
    // 高频好评词
    positiveKeywords: Array<{ word: string; count: number }>;
    
    // 高频差评词
    negativeKeywords: Array<{ word: string; count: number }>;
  };
  
  // ===== 用户行为数据 =====
  behavior: {
    // 用户画像（谁喜欢这家店？）
    userDemographics: {
      ageGroups: Record<string, number>;  // {'18-25': 30%, '26-35': 50%}
      genderSplit: Record<string, number>;
      visitPurpose: Record<string, number>;  // {'casual': 40%, 'date': 30%}
    };
    
    // 访问时段
    peakHours: number[];  // [12, 13, 18, 19] (高峰时段)
    
    // 平均停留时间
    avgDuration: number;  // 分钟
    
    // 回头率
    returnRate: number;  // 0-100%
    
    // 推荐率
    recommendationRate: number;  // 0-100%
  };
  
  // ===== 向量表示 =====
  embeddings: {
    // 文本向量（名称+描述）
    textEmbedding: number[];  // [0.1, 0.3, -0.2, ...] 1536 维
    
    // 标签向量（所有标签）
    tagEmbedding: number[];   // 标签的向量表示
    
    // 用户偏好向量（从用户行为学习）
    userPreferenceEmbedding: number[];
  };
  
  // ===== 时间相关 =====
  temporal: {
    trending: boolean;  // 是否正在流行
    seasonal: string[];  // ['summer', 'christmas']
    createdAt: string;
    lastUpdatedAt: string;
    profileCompletenessScore: number;  // 0-100% 画像完整度
  };
}
```

---

### **3. 商家画像生成流程**

#### **数据来源（多源）：**

```
商家画像 = 
  官方数据 +
  Google 数据 +
  用户评论 +
  用户行为 +
  AI 分析
```

```typescript
// 生成/更新商家画像
async function generateBusinessProfile(businessId: string) {
  
  // 1. 获取基础数据
  const business = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();
  
  // 2. 从 Google Places 获取数据
  const googleData = await fetchGooglePlacesData(business.google_place_id);
  
  // 3. 分析用户评论（提取标签和情感）
  const reviews = await fetchUserReviews(businessId);
  const reviewAnalysis = await analyzeReviews(reviews);
  
  // 4. 分析用户行为数据
  const behaviorData = await analyzeBehavior(businessId);
  
  // 5. AI 生成标签和向量
  const aiTags = await generateAITags(business, reviews);
  const embeddings = await generateEmbeddings(business, aiTags);
  
  // 6. 合并生成完整画像
  const profile: BusinessProfile = {
    ...business,
    tags: {
      ...business.tags,
      aiExtracted: aiTags,
      ...reviewAnalysis.tags
    },
    metrics: {
      ...business.metrics,
      ratings: reviewAnalysis.ratings
    },
    sentiment: reviewAnalysis.sentiment,
    behavior: behaviorData,
    embeddings,
    temporal: {
      ...business.temporal,
      profileCompletenessScore: calculateCompleteness(business, reviewAnalysis)
    }
  };
  
  // 7. 保存到数据库
  await saveBusinessProfile(businessId, profile);
  
  return profile;
}
```

---

### **4. 从用户评论提取标签**

```typescript
// 使用 AI 从评论中提取标签
async function analyzeReviews(reviews: Review[]) {
  const allReviewsText = reviews
    .map(r => r.content)
    .join('\n\n');
  
  // 调用 OpenAI 分析
  const analysis = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: `你是一个商家评论分析专家。分析以下评论，提取：
      1. 标签（特色、氛围、服务等）
      2. 各维度评分
      3. 情感倾向
      4. 高频关键词
      
      返回 JSON 格式。`
    }, {
      role: 'user',
      content: `评论内容：\n${allReviewsText}`
    }],
    response_format: { type: 'json_object' }
  });
  
  const result = JSON.parse(analysis.choices[0].message.content);
  
  return {
    tags: {
      features: result.features || [],
      ambiance: result.ambiance || [],
      dietary: result.dietary || [],
    },
    ratings: {
      food: result.ratings?.food || 0,
      service: result.ratings?.service || 0,
      ambiance: result.ratings?.ambiance || 0,
      value: result.ratings?.value || 0,
      cleanliness: result.ratings?.cleanliness || 0
    },
    sentiment: {
      overall: result.sentiment?.overall || 0,
      positive: result.sentiment?.positive || 0,
      neutral: result.sentiment?.neutral || 0,
      negative: result.sentiment?.negative || 0,
      positiveKeywords: result.positiveKeywords || [],
      negativeKeywords: result.negativeKeywords || []
    }
  };
}
```

**示例：**

```
输入评论：
"这家意大利餐厅的披萨太好吃了！环境很浪漫，适合约会。
服务员很热情。就是价格有点贵，但物有所值。停车很方便。"

AI 提取：
{
  "features": ["romantic", "great_pizza", "friendly_staff", "parking"],
  "ambiance": ["romantic", "cozy"],
  "priceLevel": 3,
  "occasions": ["date_night"],
  "ratings": {
    "food": 4.8,
    "service": 4.5,
    "ambiance": 4.7,
    "value": 4.0
  },
  "sentiment": {
    "overall": 0.85,
    "positive": 90,
    "neutral": 5,
    "negative": 5
  },
  "positiveKeywords": [
    {"word": "好吃", "count": 15},
    {"word": "浪漫", "count": 8},
    {"word": "热情", "count": 6}
  ]
}
```

---

### **5. 用户行为分析**

```typescript
// 分析用户行为，生成商家的受众画像
async function analyzeBehavior(businessId: string) {
  // 1. 获取所有互动用户
  const interactions = await supabase
    .from('user_interactions')
    .select(`
      user_id,
      action,
      created_at,
      user_profiles (
        age_range,
        gender,
        preferences
      )
    `)
    .eq('business_id', businessId)
    .gte('created_at', thirtyDaysAgo);
  
  // 2. 统计用户画像
  const userDemographics = {
    ageGroups: {},
    genderSplit: {},
    visitPurpose: {}
  };
  
  for (const interaction of interactions) {
    const profile = interaction.user_profiles;
    
    // 年龄分布
    const ageGroup = profile.age_range || 'unknown';
    userDemographics.ageGroups[ageGroup] = 
      (userDemographics.ageGroups[ageGroup] || 0) + 1;
    
    // 性别分布
    const gender = profile.gender || 'unknown';
    userDemographics.genderSplit[gender] = 
      (userDemographics.genderSplit[gender] || 0) + 1;
  }
  
  // 3. 转换为百分比
  const total = interactions.length;
  for (const key in userDemographics.ageGroups) {
    userDemographics.ageGroups[key] = 
      (userDemographics.ageGroups[key] / total * 100).toFixed(1);
  }
  
  // 4. 分析访问时段
  const peakHours = analyzePeakHours(interactions);
  
  // 5. 计算回头率
  const returnRate = calculateReturnRate(interactions);
  
  return {
    userDemographics,
    peakHours,
    returnRate,
    recommendationRate: calculateRecommendationRate(businessId)
  };
}
```

---

## 👤 用户画像与个性化

### **1. 用户画像结构**

```typescript
interface UserProfile {
  // ===== 基础信息 =====
  id: string;
  demographics: {
    ageRange: string;  // '18-25', '26-35', etc.
    gender: string;
    location: Location;
  };
  
  // ===== 偏好标签 =====
  preferences: {
    // 显式偏好（用户主动设置）
    explicit: {
      cuisines: string[];  // 喜欢的菜系
      dietary: string[];   // 饮食限制
      priceRange: string;  // 价格偏好
      ambiance: string[];  // 氛围偏好
    };
    
    // 隐式偏好（从行为推断）
    implicit: {
      favoriteCategories: string[];
      favoriteFeatures: string[];
      preferredPriceLevel: number;
      preferredDistance: number;  // km
    };
  };
  
  // ===== 行为历史 =====
  behavior: {
    // 浏览历史
    viewHistory: Array<{
      businessId: string;
      timestamp: string;
      duration: number;
    }>;
    
    // 收藏列表
    favorites: string[];
    
    // 预订历史
    bookings: Array<{
      businessId: string;
      date: string;
      occasion: string;
    }>;
    
    // 评论历史
    reviews: Array<{
      businessId: string;
      rating: number;
      content: string;
      tags: string[];
    }>;
    
    // 搜索历史
    searches: Array<{
      query: string;
      filters: any;
      clickedResults: string[];
    }>;
  };
  
  // ===== 兴趣向量 =====
  interestVector: number[];  // 用户兴趣的向量表示
  
  // ===== 个性化权重 =====
  weights: {
    // 用户对各因素的敏感度
    pricesensitivity: number;  // 0-1
    distanceSensitivity: number;
    qualitySensitivity: number;
    trendSensitivity: number;  // 喜欢流行还是小众
  };
}
```

---

### **2. 生成用户兴趣向量**

```typescript
// 从用户行为生成兴趣向量
async function generateUserInterestVector(userId: string) {
  // 1. 获取用户喜欢的商家
  const favorites = await getUserFavorites(userId);
  
  // 2. 获取这些商家的向量
  const businessVectors = await Promise.all(
    favorites.map(bid => getBusinessEmbedding(bid))
  );
  
  // 3. 计算平均向量（用户兴趣的中心）
  const interestVector = calculateMeanVector(businessVectors);
  
  // 4. 考虑最近的行为（时间衰减）
  const recentViews = await getRecentViews(userId, 30);
  const recentVectors = await Promise.all(
    recentViews.map(v => getBusinessEmbedding(v.businessId))
  );
  
  // 5. 加权合并（最近的权重更高）
  const finalVector = weightedMerge(
    interestVector, 
    calculateMeanVector(recentVectors),
    0.6,  // 历史权重
    0.4   // 最近权重
  );
  
  return finalVector;
}
```

---

### **3. 个性化推荐算法**

```typescript
// 最终推荐算法：混合搜索 + 个性化
async function personalizedRecommendation(
  userQuery: string,
  userId: string,
  userLocation: Location
) {
  // 1. 获取用户画像
  const userProfile = await getUserProfile(userId);
  
  // 2. 语义搜索（向量相似度）
  const semanticResults = await semanticSearch(userQuery, userProfile);
  
  // 3. 基于用户兴趣的推荐
  const interestBasedResults = await interestBasedSearch(userProfile);
  
  // 4. 传统综合搜索
  const traditionalResults = await comprehensiveSearch(
    userQuery,
    userLocation
  );
  
  // 5. 合并结果
  const allResults = mergeAndDedup([
    semanticResults,
    interestBasedResults,
    traditionalResults
  ]);
  
  // 6. 个性化评分
  const personalizedScores = allResults.map(business => {
    // 6.1 基础评分
    const baseScore = business.totalScore || 0;
    
    // 6.2 用户偏好匹配度
    const preferenceMatch = calculatePreferenceMatch(
      business.tags,
      userProfile.preferences
    );
    
    // 6.3 兴趣向量匹配度
    const interestMatch = cosineSimilarity(
      business.embeddings.textEmbedding,
      userProfile.interestVector
    );
    
    // 6.4 价格匹配度
    const priceMatch = calculatePriceMatch(
      business.tags.priceLevel,
      userProfile.preferences.implicit.preferredPriceLevel
    );
    
    // 6.5 距离匹配度
    const distanceMatch = calculateDistanceMatch(
      business.location,
      userLocation,
      userProfile.preferences.implicit.preferredDistance
    );
    
    // 6.6 综合个性化评分
    const personalizedScore = 
      baseScore * 0.30 +                    // 基础质量 30%
      preferenceMatch * 0.25 +              // 偏好匹配 25%
      interestMatch * 0.20 +                // 兴趣相似 20%
      priceMatch * 0.15 +                   // 价格匹配 15%
      distanceMatch * 0.10;                 // 距离匹配 10%
    
    // 6.7 考虑用户的个性化权重
    const adjustedScore = applyUserWeights(
      personalizedScore,
      userProfile.weights
    );
    
    return {
      ...business,
      personalizedScore: adjustedScore,
      matchReasons: {
        preferenceMatch,
        interestMatch,
        priceMatch,
        distanceMatch
      }
    };
  });
  
  // 7. 排序并返回
  return personalizedScores
    .sort((a, b) => b.personalizedScore - a.personalizedScore)
    .slice(0, 10);  // 返回前 10 个
}

// 计算偏好匹配度
function calculatePreferenceMatch(
  businessTags: any,
  userPreferences: any
): number {
  let score = 0;
  let checks = 0;
  
  // 菜系匹配
  if (userPreferences.explicit.cuisines) {
    const match = userPreferences.explicit.cuisines.some(
      c => businessTags.cuisine?.includes(c)
    );
    score += match ? 1 : 0;
    checks++;
  }
  
  // 饮食限制匹配
  if (userPreferences.explicit.dietary) {
    const match = userPreferences.explicit.dietary.every(
      d => businessTags.dietary?.includes(d)
    );
    score += match ? 1 : 0;
    checks++;
  }
  
  // 价格匹配
  if (userPreferences.explicit.priceRange) {
    const match = businessTags.priceRange === userPreferences.explicit.priceRange;
    score += match ? 1 : 0.5;  // 完全匹配 1，不匹配 0.5
    checks++;
  }
  
  // 氛围匹配
  if (userPreferences.explicit.ambiance) {
    const matchCount = userPreferences.explicit.ambiance.filter(
      a => businessTags.ambiance?.includes(a)
    ).length;
    score += matchCount / userPreferences.explicit.ambiance.length;
    checks++;
  }
  
  return checks > 0 ? score / checks : 0.5;
}

// 应用用户个性化权重
function applyUserWeights(
  score: number,
  weights: any
): number {
  // 根据用户的敏感度调整评分
  // 例如：价格敏感的用户，价格匹配度权重更高
  
  // 这里是简化版本，实际可以更复杂
  return score * (
    1 + 
    (weights.qualitySensitivity - 0.5) * 0.2  // 质量敏感度调整
  );
}
```

---

## 🏷️ 标签体系

### **完整的标签分类：**

```typescript
// 预定义标签体系
const TAG_TAXONOMY = {
  // ===== 餐饮类 =====
  restaurant: {
    cuisine: [
      'italian', 'chinese', 'japanese', 'korean', 'thai', 'vietnamese',
      'indian', 'mexican', 'mediterranean', 'french', 'american',
      'fusion', 'seafood', 'bbq', 'steakhouse', 'pizza', 'pasta',
      'sushi', 'ramen', 'burger', 'cafe', 'bakery', 'dessert'
    ],
    
    dietary: [
      'vegetarian', 'vegan', 'gluten_free', 'halal', 'kosher',
      'organic', 'farm_to_table', 'healthy', 'low_carb'
    ],
    
    mealTypes: [
      'breakfast', 'brunch', 'lunch', 'dinner', 'late_night',
      'all_day'
    ],
    
    priceRange: [
      'budget',      // $
      'moderate',    // $$
      'upscale',     // $$$
      'luxury'       // $$$$
    ],
    
    ambiance: [
      'casual', 'formal', 'cozy', 'romantic', 'lively', 'quiet',
      'modern', 'traditional', 'rustic', 'elegant', 'trendy',
      'family_friendly', 'upscale', 'intimate'
    ],
    
    features: [
      'outdoor_seating', 'waterfront', 'rooftop', 'garden',
      'fireplace', 'live_music', 'bar', 'wine_bar',
      'craft_beer', 'cocktails', 'happy_hour',
      'private_dining', 'chef_table'
    ],
    
    occasions: [
      'date_night', 'anniversary', 'birthday', 'celebration',
      'business_lunch', 'business_dinner', 'casual_dining',
      'family_meal', 'group_gathering', 'solo_dining'
    ],
    
    services: [
      'dine_in', 'takeaway', 'delivery', 'catering',
      'reservations', 'walk_in', 'online_ordering'
    ],
    
    amenities: [
      'wifi', 'parking', 'valet', 'wheelchair_accessible',
      'kids_menu', 'high_chairs', 'pet_friendly',
      'restrooms', 'coat_check'
    ]
  },
  
  // ===== 咖啡馆类 =====
  cafe: {
    features: [
      'specialty_coffee', 'single_origin', 'cold_brew',
      'espresso_bar', 'tea_house', 'smoothies',
      'pastries', 'breakfast', 'laptop_friendly',
      'study_spot', 'quiet', 'coworking'
    ],
    
    ambiance: [
      'cozy', 'modern', 'hipster', 'minimalist',
      'rustic', 'industrial', 'artistic'
    ]
  },
  
  // ===== 酒吧/夜生活类 =====
  bar: {
    features: [
      'craft_cocktails', 'wine_bar', 'sports_bar',
      'live_music', 'dj', 'dancing', 'karaoke',
      'pool_table', 'darts', 'rooftop', 'speakeasy'
    ],
    
    ambiance: [
      'lively', 'trendy', 'casual', 'upscale',
      'intimate', 'loud', 'relaxed'
    ]
  },
  
  // ===== 其他类别... =====
  // gym, spa, retail, etc.
};
```

---

### **标签生成流程：**

```typescript
// 自动生成商家标签
async function autoGenerateTags(business: Business) {
  const tags = {
    manual: [],      // 商家手动添加
    google: [],      // 从 Google 数据提取
    aiExtracted: [], // AI 从评论提取
    inferred: []     // 从其他数据推断
  };
  
  // 1. 从商家描述提取
  const descriptionTags = await extractTagsFromText(
    business.description,
    TAG_TAXONOMY[business.category]
  );
  tags.aiExtracted.push(...descriptionTags);
  
  // 2. 从用户评论提取
  const reviews = await getBusinessReviews(business.id);
  const reviewTags = await extractTagsFromReviews(reviews);
  tags.aiExtracted.push(...reviewTags);
  
  // 3. 从 Google 数据推断
  if (business.googleData) {
    // 从 types 字段推断
    const googleTypes = business.googleData.types;
    tags.google.push(...mapGoogleTypesToTags(googleTypes));
    
    // 从 opening_hours 推断
    if (business.googleData.opening_hours) {
      tags.inferred.push(inferMealTypesFromHours(
        business.googleData.opening_hours
      ));
    }
  }
  
  // 4. 从价格推断
  if (business.priceLevel) {
    tags.inferred.push(mapPriceLevelToRange(business.priceLevel));
  }
  
  // 5. 去重和验证
  const allTags = [
    ...tags.manual,
    ...tags.google,
    ...tags.aiExtracted,
    ...tags.inferred
  ];
  
  const validatedTags = validateAndDedup(
    allTags,
    TAG_TAXONOMY[business.category]
  );
  
  return validatedTags;
}

// 使用 AI 从文本提取标签
async function extractTagsFromText(
  text: string,
  allowedTags: any
): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: `从以下文本中提取相关标签。
      只返回以下类别的标签：${Object.keys(allowedTags).join(', ')}
      返回 JSON 数组格式。`
    }, {
      role: 'user',
      content: text
    }],
    response_format: { type: 'json_object' }
  });
  
  const result = JSON.parse(response.choices[0].message.content);
  return result.tags || [];
}
```

---

## 🎯 最终实施方案

### **Phase 1: 基础标签体系（1-2 周）**

```typescript
// 数据库 schema 更新
alter table businesses add column if not exists tags jsonb;
alter table businesses add column if not exists profile jsonb;

// 创建标签索引
create index idx_businesses_tags on businesses using gin(tags);

// 基础标签结构
{
  "cuisine": ["italian"],
  "priceRange": "moderate",
  "features": ["outdoor_seating", "romantic"],
  "dietary": ["vegetarian_options"],
  "ambiance": ["cozy", "intimate"]
}
```

**任务：**
- [ ] 设计标签分类体系
- [ ] 创建标签管理界面（商家后台）
- [ ] 实现标签自动提取（AI）
- [ ] 迁移现有商家数据

---

### **Phase 2: 商家画像系统（2-3 周）**

**任务：**
- [ ] 实现评论分析功能
- [ ] 实现用户行为分析
- [ ] 生成完整商家画像
- [ ] 创建画像管理后台
- [ ] 定期更新机制

---

### **Phase 3: 用户画像系统（3-4 周）**

**任务：**
- [ ] 跟踪用户行为
- [ ] 生成用户兴趣向量
- [ ] 实现偏好学习
- [ ] 隐私保护机制

---

### **Phase 4: 个性化推荐（4-6 周）**

**任务：**
- [ ] 实现混合搜索
- [ ] 实现个性化评分
- [ ] A/B 测试
- [ ] 推荐解释功能

---

## 📊 效果预期

### **推荐准确率提升：**

| 阶段 | 方法 | 准确率 | 用户满意度 |
|-----|------|--------|-----------|
| **当前** | 简单评分排序 | 40% | ⭐⭐⭐ |
| **Phase 1** | 综合评分 + 标签 | 75% | ⭐⭐⭐⭐ |
| **Phase 2** | + 商家画像 | 85% | ⭐⭐⭐⭐ |
| **Phase 3** | + 用户画像 | 90% | ⭐⭐⭐⭐⭐ |
| **Phase 4** | + 个性化混合 | 95%+ | ⭐⭐⭐⭐⭐ |

---

## 💡 关键要点

### **你的理解完全正确！**

1. ✅ **混合搜索**
   - 向量搜索 + 基础优化 + 个性化
   - 三者结合，效果最佳

2. ✅ **详细标签**
   - 越详细越好
   - 多维度标签体系
   - AI 自动提取 + 人工标注

3. ✅ **考虑评论**
   - 从评论中提取标签
   - 情感分析
   - 各维度评分

4. ✅ **用户偏好**
   - 显式偏好（用户设置）
   - 隐式偏好（行为推断）
   - 持续学习优化

---

## 🔄 持续优化

```typescript
// 持续学习和优化
async function continuousLearning() {
  // 1. 收集用户反馈
  const feedback = await collectUserFeedback();
  
  // 2. 分析推荐效果
  const effectiveness = await analyzeRecommendationEffectiveness();
  
  // 3. 调整权重
  if (effectiveness.clickRate < 0.3) {
    // 点击率低，调整权重
    await adjustRecommendationWeights();
  }
  
  // 4. 重新训练模型（如果使用 ML）
  if (hasEnoughNewData()) {
    await retrainModels();
  }
  
  // 5. 更新商家画像
  await updateBusinessProfiles();
  
  // 6. 更新用户画像
  await updateUserProfiles();
}
```

---

**这是一个完整的高级推荐系统！准备好了可以逐步实施！** 🚀

