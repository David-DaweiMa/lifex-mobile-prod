# Specials Detail Page Error Fix - 2025-10-04

## 🐛 问题描述

打开 Specials 详情页面时出现错误：
```
ERROR: Cannot read property 'getSpecialById' of undefined
Exception loading special: [TypeError: Cannot read property 'getSpecialById' of undefined]
```

## 🔍 原因分析

有两个问题需要修复：

### 问题 1: 导入方式错误 ⚠️ **主要原因**

`SpecialDetailScreen.tsx` 使用了错误的导入方式：

```typescript
// ❌ 错误：使用默认导入
import SpecialsService from '../services/specialsService';
```

但 `specialsService.ts` 使用的是命名导出：
```typescript
// specialsService.ts
export const SpecialsService = {  // 命名导出
  // ...
};
```

这导致 `SpecialsService` 为 `undefined`。

### 问题 2: 返回格式不一致

`specialsService.ts` 中的 `getSpecialById` 方法返回格式不一致：

### 问题代码
```typescript
// specialsService.ts - 直接返回数据或抛出错误
async getSpecialById(id: string) {
  const { data, error } = await supabase
    .from('specials')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching special by id:', error);
    throw error;  // ❌ 抛出错误
  }

  return data as Special;  // ❌ 直接返回数据
}
```

### SpecialDetailScreen 期望的格式
```typescript
const { data, error } = await SpecialsService.getSpecialById(specialId);
// ❌ 期望返回 { data, error }，但实际返回的是 Special 或抛出异常
```

## ✅ 解决方案

### 修复 1: 更正导入方式 (主要修复)

**`src/screens/SpecialDetailScreen.tsx`**
```typescript
// ❌ Before: 默认导入
import SpecialsService from '../services/specialsService';

// ✅ After: 命名导入
import { SpecialsService } from '../services/specialsService';
```

### 修复 2: 统一返回格式

修改 `getSpecialById` 方法，返回 `{ data, error }` 格式，与其他 service 方法保持一致：

**`src/services/specialsService.ts`**
```typescript
// specialsService.ts - 返回 { data, error }
async getSpecialById(id: string) {
  const { data, error } = await supabase
    .from('specials')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching special by id:', error);
    // ✅ 不抛出错误，让调用者处理
  }

  return { data: data as Special | null, error };  // ✅ 返回统一格式
}
```

## 🔧 修改文件

### 1. `src/screens/SpecialDetailScreen.tsx`
- ✅ 修改导入方式：`import { SpecialsService }` (命名导入)
- ✅ 解决了 `SpecialsService` 为 `undefined` 的问题

### 2. `src/services/specialsService.ts`
- ✅ 修改 `getSpecialById` 方法返回格式
- ✅ 移除 `throw error`
- ✅ 返回 `{ data, error }` 对象

## ✅ 验证

### Before (错误)
```
点击 Special 卡片 → TypeError → 无法打开详情页 ❌
```

### After (修复)
```
点击 Special 卡片 → 正常打开详情页 ✅
```

## 📝 注意事项

这个修复确保了：
1. ✅ 返回格式与 `EventsService.getEventById` 一致
2. ✅ 错误处理更优雅，不会直接抛出异常
3. ✅ 调用者可以同时检查 `data` 和 `error`
4. ✅ 支持 mock 数据回退逻辑

## 🎯 影响范围

| 文件 | 修改类型 | 说明 |
|------|---------|------|
| `SpecialDetailScreen.tsx` | 修复 | 更正导入方式（主要修复） |
| `specialsService.ts` | 修复 | 统一返回格式 |

## ✅ 完成状态

- ✅ 修复导入方式（命名导入）
- ✅ 修复 `getSpecialById` 返回格式
- ✅ 无 Lint 错误
- ✅ 详情页可以正常打开

## 💡 经验教训

### 导入导出要匹配

**命名导出** 必须使用 **命名导入**：
```typescript
// 导出
export const SpecialsService = { ... };

// 导入
import { SpecialsService } from './specialsService';  // ✅
```

**默认导出** 才能使用 **默认导入**：
```typescript
// 导出
export default SpecialsService;

// 导入
import SpecialsService from './specialsService';  // ✅
```

---

**修复时间**: 2025-10-04
**状态**: ✅ 已修复

