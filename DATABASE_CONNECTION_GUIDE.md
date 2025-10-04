# 🗄️ Specials & Places 数据库连接指南

## 📋 已完成

✅ 在 `src/services/supabase.ts` 添加了 `specials` 表类型定义  
✅ 创建了 `src/services/specialsService.ts`  
✅ 创建了 `src/services/businessesService.ts`  

---

## 🔧 需要完成的步骤

### 1. 更新 Specials Screen

**文件**: `src/screens/SpecialsScreen.tsx`

#### 添加导入
```typescript
import { SpecialsService } from '../services/specialsService';
import { useFavorites } from '../contexts/FavoritesContext';
```

#### 添加状态管理
```typescript
const [specials, setSpecials] = useState<any[]>([]);
const [isLoadingSpecials, setIsLoadingSpecials] = useState(true);
const [specialsError, setSpecialsError] = useState<string | null>(null);
const { favoriteEvents: favoriteSpecials, toggleFavorite } = useFavorites();
```

#### 添加数据加载函数
```typescript
const loadSpecials = async () => {
  try {
    setIsLoadingSpecials(true);
    setSpecialsError(null);
    
    // 获取特色特惠（用于Hero Banner）
    const featuredData = await SpecialsService.getFeaturedSpecials(5);
    
    // 获取所有活跃特惠
    const allData = await SpecialsService.getActiveSpecials();
    
    if (allData && allData.length > 0) {
      setSpecials(allData);
      console.log('Loaded specials from database:', allData.length);
    } else {
      // 如果数据库为空，使用mock数据
      console.log('No specials in database, using mock data');
      setSpecials(mockSpecialsData);
    }
  } catch (error) {
    console.error('Error loading specials:', error);
    setSpecialsError('Failed to load specials');
    // 出错时使用mock数据
    setSpecials(mockSpecialsData);
  } finally {
    setIsLoadingSpecials(false);
  }
};

useEffect(() => {
  loadSpecials();
}, []);
```

#### 更新渲染逻辑
```typescript
// 在横幅中使用前5个特惠
const featuredSpecials = specials.slice(0, 5);

// 在瀑布流中使用所有特惠
const displaySpecials = specials;
```

#### 添加收藏按钮（已在之前版本中添加，保持现有代码）

---

### 2. 更新 Places Screen

**文件**: `src/screens/PlacesScreen.tsx`

#### 添加导入
```typescript
import { BusinessesService } from '../services/businessesService';
import { useFavorites } from '../contexts/FavoritesContext';
```

#### 添加状态管理
```typescript
const [businesses, setBusinesses] = useState<any[]>([]);
const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);
const [businessesError, setBusinessesError] = useState<string | null>(null);
const { favoriteEvents: favoriteBusinesses, toggleFavorite } = useFavorites();
```

#### 添加数据加载函数
```typescript
const loadBusinesses = async () => {
  try {
    setIsLoadingBusinesses(true);
    setBusinessesError(null);
    
    // 获取认证商家（用于Hero Banner）
    const verifiedData = await BusinessesService.getVerifiedBusinesses(5);
    
    // 获取所有活跃商家
    const allData = await BusinessesService.getActiveBusinesses();
    
    if (allData && allData.length > 0) {
      setBusinesses(allData);
      console.log('Loaded businesses from database:', allData.length);
    } else {
      // 如果数据库为空，使用mock数据
      console.log('No businesses in database, using mock data');
      setBusinesses(mockDiscoverData); // 或者您的places mock数据
    }
  } catch (error) {
    console.error('Error loading businesses:', error);
    setBusinessesError('Failed to load businesses');
    // 出错时使用mock数据
    setBusinesses(mockDiscoverData);
  } finally {
    setIsLoadingBusinesses(false);
  }
};

useEffect(() => {
  loadBusinesses();
}, []);
```

#### 添加收藏按钮
在每个business卡片的右下角添加收藏按钮（与Events和Specials相同位置和样式）：

```typescript
<TouchableOpacity 
  style={styles.waterfallFavoriteButton}
  onPress={(e) => {
    e.stopPropagation();
    toggleFavorite(business.id, business);
  }}
  activeOpacity={0.7}
>
  <Ionicons 
    name={favoriteBusinesses.has(business.id) ? "heart" : "heart-outline"} 
    size={14} 
    color={favoriteBusinesses.has(business.id) ? "#FF6B6B" : colors.textSecondary} 
  />
</TouchableOpacity>
```

#### 添加样式
```typescript
waterfallFavoriteButton: {
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: borderRadius.md,
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  minWidth: 32,
  alignItems: 'center',
  justifyContent: 'center',
},
```

---

## 🗄️ 数据库表 SQL（需要在Supabase中执行）

### Specials 表

```sql
-- Create specials table
CREATE TABLE IF NOT EXISTS public.specials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    discount VARCHAR(50) NOT NULL,
    original_price VARCHAR(50) NOT NULL,
    new_price VARCHAR(50) NOT NULL,
    valid_until DATE NOT NULL,
    image_url TEXT,
    terms TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    claim_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_specials_business_id ON public.specials(business_id);
CREATE INDEX idx_specials_category ON public.specials(category);
CREATE INDEX idx_specials_is_active ON public.specials(is_active);
CREATE INDEX idx_specials_is_featured ON public.specials(is_featured);
CREATE INDEX idx_specials_valid_until ON public.specials(valid_until);

-- Enable RLS
ALTER TABLE public.specials ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public specials are viewable by everyone"
ON public.specials FOR SELECT
USING (is_active = true);

CREATE POLICY "Business owners can insert their own specials"
ON public.specials FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT owner_id FROM public.businesses WHERE id = business_id
  )
);

CREATE POLICY "Business owners can update their own specials"
ON public.specials FOR UPDATE
USING (
  auth.uid() IN (
    SELECT owner_id FROM public.businesses WHERE id = business_id
  )
);

-- RPC Functions
CREATE OR REPLACE FUNCTION increment_special_views(special_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.specials
  SET view_count = view_count + 1
  WHERE id = special_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_special_claims(special_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.specials
  SET claim_count = claim_count + 1
  WHERE id = special_id;
END;
$$ LANGUAGE plpgsql;

-- Sample data
INSERT INTO public.specials (business_id, title, description, category, discount, original_price, new_price, valid_until, image_url, is_featured) VALUES
(
  (SELECT id FROM public.businesses LIMIT 1),
  '50% Off Coffee & Pastry Combo',
  'Perfect morning combo with our signature blend',
  'Food & Drink',
  '50%',
  '$15',
  '$7.50',
  CURRENT_DATE + INTERVAL '30 days',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
  TRUE
);
```

---

## 📊 数据类型映射

### Mock Data → Database

| Mock Field | Database Field | 转换说明 |
|-----------|---------------|---------|
| `id` (number) | `id` (UUID) | 需要生成UUID |
| `title` | `title` | 直接映射 |
| `business` | 通过`business_id`关联 | 需要先创建business |
| `category` | `category` | 直接映射 |
| `discount` | `discount` | 直接映射 |
| `originalPrice` | `original_price` | 字段名转换 |
| `newPrice` | `new_price` | 字段名转换 |
| `validUntil` | `valid_until` | 字段名转换 |
| `description` | `description` | 直接映射 |

---

## 🎯 实施优先级

### 高优先级（必须）
1. ✅ 添加specials表类型定义
2. ✅ 创建service文件
3. ⏳ 更新SpecialsScreen连接数据库
4. ⏳ 更新PlacesScreen连接数据库
5. ⏳ 在Supabase执行SQL创建表

### 中优先级（推荐）
6. ⏳ 为Places添加收藏功能
7. ⏳ 添加加载状态UI
8. ⏳ 添加错误处理UI

### 低优先级（可选）
9. ⏳ 添加下拉刷新
10. ⏳ 添加分类筛选
11. ⏳ 添加搜索功能

---

## 💡 提示

### 如果您想自己实施：

1. **Specials**: 参考 `EventsScreen.tsx` 的实现
2. **Places**: 类似的逻辑，只是数据来源不同
3. **收藏**: 使用已有的 `FavoritesContext`
4. **样式**: 复制EventsScreen的收藏按钮样式

### 如果需要我继续：

只需说"继续"或"帮我完成"，我会：
1. 更新SpecialsScreen
2. 更新PlacesScreen  
3. 创建SQL文件
4. 测试并修复任何问题

---

## 🔗 相关文件

- `src/services/supabase.ts` - ✅ 已更新
- `src/services/specialsService.ts` - ✅ 已创建
- `src/services/businessesService.ts` - ✅ 已创建
- `src/screens/SpecialsScreen.tsx` - ⏳ 待更新
- `src/screens/PlacesScreen.tsx` - ⏳ 待更新
- `database/specials_table.sql` - ⏳ 待创建
- `src/services/eventsService.ts` - 📚 参考示例

---

**更新时间**: 2025年10月4日  
**状态**: Service层完成，等待Screen层实施

