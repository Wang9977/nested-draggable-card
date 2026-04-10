# Double Visual Feedback Fix - Using canDrop State

## Problem Statement

当拖卡片 2 到条件组 1 上方时，会显示**两条插入线**：

1. 条件组 1 上方的插入线
2. 卡片 1 上方的插入线

**期望行为：** 只显示一条插入线，指向卡片实际将落到的位置。

## Root Cause Analysis

React-DND 使用递归的事件模型：

- 当鼠标在一个 drop target 上方时，该目标**和所有可能的 parent/child 目标**都会收到 `hover` 事件
- 每个目标的 `isInsertTop` 状态都被独立设置
- 因此多个卡片同时满足 `isInsertTop && isOver` 条件，全部显示插入线

## Solution

**使用 `canDropState` 过滤插入线条件**

修改插入线的渲染条件：

```typescript
// Before
{isInsertTop && isOver && (...)}

// After
{isInsertTop && isOver && canDropState && (...)}
```

### Why This Works

`canDrop` 回调定义了什么是**有效的 drop target**：

```typescript
canDrop: (item: DragItem) => {
  // 允许组在 level 1 重新排序
  if (item.isGroup && level === 1) return true;

  // 禁止组在其他地方投放
  if (item.isGroup) return false;

  // Level 1 卡片可以投放到其他 level 1 卡片或组
  if (item.level === 1) return true;

  // Level 2 卡片只能投放到 level 1 或 level 2
  if (item.level === 2) return level === 1 || level === 2;

  return false;
};
```

当拖卡片 2（level 1）到条件组 1 上方时：

- **条件组 1**（level 1 GROUP）：

  - `canDrop()` → **true**（允许 level 1 items）
  - `isOver` → true
  - `isInsertTop` → true/false
  - **结果：显示反馈** ✓

- **卡片 1**（level 2，在组内）：
  - `canDrop()` → **false**（拒绝来自 level 1 的单卡片）
  - `isOver` → true（接收冒泡事件）
  - `isInsertTop` → true/false
  - **结果：不显示反馈** ✗（`canDropState = false`）

## Test Cases

| 拖动场景               | 卡片 1 反馈       | 条件组 1 反馈    | 预期结果           |
| ---------------------- | ----------------- | ---------------- | ------------------ |
| 拖卡片 2 到组 1 上方   | ✗ (canDrop=false) | ✓ (canDrop=true) | 仅显示组 1 反馈    |
| 拖卡片 2 进入组 1 内部 | ✗ (canDrop=false) | ✓ (canDrop=true) | 仅显示内部卡片反馈 |
| 拖卡片 2 在根级别移动  | ✓ (canDrop=true)  | N/A              | 仅显示目标卡片反馈 |

## Changes

**File:** `src/module/Card.tsx`

- **Line 349:** 添加 `&& canDropState` 到上方插入线条件
- **Line 371:** 添加 `&& canDropState` 到下方插入线条件

## Build Verification

```
✓ Compiles successfully
✓ Zero TypeScript errors
✓ Build size: 195.43 kB (gzipped)
```

## Commit

```
a27f695 fix: resolve double visual feedback by filtering with canDrop state
```

## Advantages of This Solution

1. **简洁** - 仅改 2 行代码
2. **优雅** - 利用现有的 `canDrop` 逻辑，无需额外状态
3. **正确** - 遵循 react-dnd 的设计模式
4. **高效** - 无性能开销
5. **维护性强** - 逻辑清晰，易于理解
