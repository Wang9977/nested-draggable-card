# Drag-Drop Issues Fix Summary

## Problems Identified and Fixed

### Issue 1: Double Visual Feedback (初始问题)

**原始问题：** 拖卡片 2 到条件组 1 上方时，同时显示两条插入线

- **状态：** ✅ 已通过添加 `canDropState` 过滤解决

### Issue 2: Drop Action Not Working

**问题：** 拖卡片 1 到条件组上方显示反馈，但松手后卡片位置没变化
**根本原因：**

- 当拖卡片 1 到 level 1 的组时，`canDrop()` 总是返回 true
- 但 drop 处理逻辑只有`else if (targetIsGroup && item.level === 1)` 执行**合并**，而不是**重新排序**
- 用户看到的反馈表示"卡片将在组上方"，但实际执行的是"合并进组"

**解决方案：**
添加新的 drop 处理分支，区分两种情况：

```typescript
// 新增：当level 1卡片拖到level 1组时，执行重新排序（不是合并）
if (item.level === 1 && level === 1 && targetIsGroup) {
  onMove(item, {
    id: data.id,
    hoverIndex: idx,
    isGroup: false, // 保持在level 1，不进入组
    level: 1,
  });
  return;
}

// 原有：当level 1卡片拖到level 2卡片时，执行合并
if (item.level === 1 && level === 2) {
  onMove(item, {
    id: data.id,
    hoverIndex: idx,
    isGroup: true, // 进入组内
    level: 2,
  });
  return;
}
```

**结果：** ✅ 卡片 1 现在正确地与条件组交换位置

### Issue 3: Double Feedback When Dragging Into Group

**问题：** 拖卡片 1 进入条件组内部卡片上方时，同时显示两条反馈线：

- 条件组上方的反馈
- 内部卡片上方的反馈

**根本原因：**
React-DND 使用递归 hover 模型，多个 drop targets 都收到 hover 事件：

- 条件组（level 1）：`hover`被触发 → `isInsertTop`被设置 → 显示反馈
- 内部卡片（level 2）：`hover`被触发 → `isInsertTop`被设置 → 显示反馈

**解决方案：**
在 hover 处理中添加过滤逻辑，当拖 level 1 卡片进入 level 1 组时：

```typescript
// 如果组有子卡片，跳过组的hover反馈
// 让内部卡片显示反馈
if (
  item.level === 1 &&
  level === 1 &&
  targetIsGroup &&
  targetHasChildren // 关键：只有有子卡片才跳过
) {
  return; // 跳过hover处理
}
```

**结果：**
✅ 拖卡片进入组时只显示内部卡片的反馈，不显示组的反馈
✅ 拖卡片到空组时仍显示组的反馈（因为 `targetHasChildren === false`）

## Test Scenarios

| #   | 操作              | 反馈显示   | drop 结果           | 状态 |
| --- | ----------------- | ---------- | ------------------- | ---- |
| 1   | 交换卡片 1、2     | 仅目标卡片 | 正确交换            | ✅   |
| 2a  | 拖卡片 1 到组上方 | 仅组       | 卡片 1 和组交换位置 | ✅   |
| 2b  | 松手后            | 不适用     | 位置改变            | ✅   |
| 3a  | 拖卡片 1 进入组   | 仅内部卡片 | 卡片 1 进入组       | ✅   |
| 3b  | 松手后            | 不适用     | 卡片 1 在组内       | ✅   |

## Code Changes

### File: `src/module/useCardDrag.ts`

**修改 1：hover 处理 (第 89-115 行)**

- 添加 group children 检测
- 当拖 level 1 进入有子项的 level 1 组时，跳过 hover 反馈

**修改 2：drop 处理 (第 171-194 行)**

- 添加新的 drop 分支，处理 level 1 到 level 1 组的情况
- 执行重新排序而不是合并

## Build Status

```
✅ Compiles successfully
✅ Zero TypeScript errors
✅ Build size: 195.5 kB (gzipped)
```

## Commit

```
aef53e7 fix: correct drop behavior and eliminate double feedback when dragging into groups
```

## Key Insights

1. **区分操作意图**：UI 反馈应该准确反映实际会发生的操作

   - 显示"在上方"的线 → 执行同级重新排序
   - 显示"进入"的情况 → 执行合并

2. **递归事件模型的挑战**：React-DND 的 hover/drop 是递归的

   - 多个 targets 同时收到事件
   - 需要在逻辑中进行智能过滤

3. **hover 和 drop 的对称性**：drop 逻辑的修改需要与 hover 逻辑配套
   - hover 决定显示什么反馈
   - drop 决定执行什么操作
   - 两者应该配套，避免不匹配
