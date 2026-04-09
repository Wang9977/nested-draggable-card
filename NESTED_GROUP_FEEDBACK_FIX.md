# 嵌套组双重反馈修复

## 问题描述

**症状**：

- 拖拽卡片 2 到条件组 1（由卡片 1 扩展）上方
- 同时在卡片 1 上方和条件组 1 上方显示视觉反馈
- 释放时卡片 2 被放在条件组 1 上方（正确），但反馈显示有问题

**根本原因**：

- 当卡片 1 转换为条件组时，原始数据进入 `children[0]`
- 原始卡片 1 现在是 level 2 的元素（在组内）
- 但它仍然有自己的 drop handler
- 当 level 1 的卡片 2 拖拽到这个结构上方时，两个 drop handlers 都被激活

**结构**：

```
条件组（外层，level 1, isGroup=true）
  └─ 原始卡片1（内层，level 2, drop handler 仍在）
```

拖拽卡片 2**上方**时，鼠标实际上是在原始卡片 1**上方**，导致两个反馈。

## 应用的修复

### 修复 1：在 Hover 事件中跳过

**文件**: `src/module/useCardDrag.ts` (hover 函数)

```typescript
hover: (item: DragItem, monitor) => {
  if (item.isGroup) return;

  // 预检查：如果 level 1 卡片在 level 2 卡片上方，跳过
  if (item.level === 1 && level === 2) {
    // 计算是否在上方
    const isInserTop = /* 计算逻辑 */;

    // 如果是上方，跳过 - 让父组处理
    if (isInserTop) {
      console.log("SKIP HOVER");
      return;
    }
  }

  // 正常 hover 处理
  // ...
}
```

**作用**：

- 防止 level 2 卡片响应来自 level 1 的**上方** hover
- 让父组的 drop handler 优先处理
- 避免重复的 `setIsInsertTop` 调用

### 修复 2：在 Drop 事件中返回

**文件**: `src/module/useCardDrag.ts` (drop 函数)

```typescript
drop: (item: DragItem) => {
  // ...

  // 如果 level 1 卡片 drop 到 level 2 卡片上方，返回
  // 让父组处理
  if (item.level === 1 && level === 2 && isUpDragValue) {
    console.log("SKIP DROP");
    return;
  }

  // 正常 drop 处理
  // ...
};
```

**作用**：

- 防止 level 2 卡片处理不应该处理的 drop
- 父组（条件组）会处理这个 drop
- 避免双重处理

## 工作原理

**之前**（有问题）：

```
拖拽卡片2 → 上方 →
  ├─ 条件组(level 1)的 hover 触发 → setIsInsertTop(true)
  ├─ 原卡片1(level 2)的 hover 也触发 → setIsInsertTop(true)
  └─ 两个反馈都显示
```

**之后**（修复后）：

```
拖拽卡片2 → 上方 →
  ├─ 原卡片1(level 2)检查：item.level===1 && level===2 && isTop
  │  └─ 返回，不做处理
  └─ 条件组(level 1)的 hover 触发 → setIsInsertTop(true)
     └─ 只显示一个反馈
```

## 测试方法

### 测试 1：观察反馈

1. 添加卡片 1，转换为条件组
2. 添加卡片 2
3. 拖拽卡片 2 到条件组**上方**
4. **验证**：只在条件组上方显示一个反馈（不是两个）

### 测试 2：检查 console 日志

应该看到：

```
SKIP HOVER: Level 1 item to top of level 2 - let parent handle
SKIP DROP: Level 1 item to top of level 2 - let parent handle
```

### 测试 3：验证放置位置

- 拖拽卡片 2 到条件组上方
- 释放
- **验证**：卡片 2 应该在条件组上方

### 测试 4：拖拽到下方仍可合并

1. 拖拽卡片 2 到条件组**下方**
2. **验证**：卡片 2 应该进入组内

## 相关代码位置

- 修改: `src/module/useCardDrag.ts`
  - hover 函数 (行 ~84-117)
  - drop 函数开始处 (行 ~101-122)

## 相关提交

```
31f3f2e - fix: prevent double visual feedback when dragging above nested group
```

## 边界情况

这个修复正确处理以下情况：

- ✅ Level 1 拖拽到 level 2 上方 → 跳过 level 2，让父组处理
- ✅ Level 1 拖拽到 level 2 下方 → Level 2 正常处理（可能是合并）
- ✅ Level 2 拖拽到其他 level 2 上方 → 正常处理（同级重排）
- ✅ Level 2 拖拽到 level 1 → 正常处理（提取）

## 性能影响

- ✅ 零性能开销（只是提前 return）
- ✅ 减少了一次 setIsInsertTop 调用
- ✅ 减少了不必要的 state 更新
