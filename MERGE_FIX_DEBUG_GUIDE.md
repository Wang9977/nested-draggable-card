# 卡片合并问题修复 - 调试指南

## 问题症状

- 拖拽卡片 2 到条件组下方时
- 视觉反馈同时显示在条件组上方和卡片 1 上方
- 释放时只将卡片放在条件组上方，无法放入组内

## 根本原因

React-DND 在嵌套 drop targets 时，会对多个元素触发 hover 和 drop 事件：

1. 条件组的容器 (Container) 也有 drop handler
2. 条件组本身 (Card) 也有 drop handler
3. 两个 drop handler 同时被激活，导致混淆

## 应用的修复

### 1. Drop 验证 (canDrop)

**文件**: `src/module/useCardDrag.ts` (行 57-81)

添加了 `canDrop` 验证器，确保只有适当的元素能接收 drop：

- Level 1 卡片可以 drop 到任何地方
- Level 2 卡片只能 drop 到 level 1 或 level 2
- 组不能被 drop

```typescript
canDrop: (item: DragItem) => {
  if (item.isGroup) return false;
  if (item.level === 1) return true;
  if (item.level === 2) return level === 1 || level === 2;
  return false;
};
```

### 2. 使用 hoverItem.isGroup 标志

**文件**: `src/module/Wrapper.tsx` (行 32)

改进 `isMovingToGroup` 的判断，使用 drop handler 传入的 `isGroup` 标志：

```typescript
// 之前：只检查 targetCard 是否有 children
const isMovingToGroup = targetHasChildren;

// 之后：同时检查 hoverItem.isGroup 标志
const isMovingToGroup =
  hoverItem.isGroup === true && (targetHasChildren || hoverItem.level === 2);
```

### 3. 初始化 Children 数组

**文件**: `src/module/Wrapper.tsx` (行 153-167)

当合并到组时，确保 children 数组存在：

```typescript
if (targetIdx > -1) {
  // Ensure the target has a children array
  if (!cardsTmp[targetIdx].children) {
    cardsTmp[targetIdx].children = [];
  }
  res = update(cardsTmp, {
    [targetIdx]: {
      children: { $push: [dragItem.data] },
    },
  });
}
```

### 4. 详细的调试日志

**文件**: `src/module/useCardDrag.ts` 和 `src/module/Wrapper.tsx`

添加了详细的 console.log，显示：

- DROP EVENT: 在哪个元素上发生 drop
- ACTION: 采取的操作（extract/merge/reorder）
- MOVE_CARD_CALLED: moveCard 函数的调用细节

## 测试步骤

### ✅ 测试 1: 基本合并

1. 添加 2 张卡片（Card1, Card2）
2. 将 Card2 转换为条件组（点"扩展"）
3. 拖拽 Card1 到条件组**下方**并释放
4. **预期**: Card1 进入条件组内

### ✅ 测试 2: 查看控制台日志

打开浏览器 DevTools → Console，你应该看到：

```
DROP EVENT: {
  draggedCardId: 2,
  draggedCardLevel: 1,
  targetCardId: 1,    // 条件组的 ID
  targetCardIsGroup: true,
  isUpDragValue: false,
  ...
}

ACTION: Merging into group (revised) {
  reason: "targetIsGroup && !isUpDragValue",
  ...
}

MOVE_CARD_CALLED: {
  draggedCardId: 2,
  draggedCardLevel: 1,
  targetCardIsGroup: true,
  isMovingToGroup: true,
  reason: "Moving to group"
}
```

### ✅ 测试 3: 提取卡片

1. 从条件组内拖拽卡片向上
2. **预期**: 卡片应该正确提取

### ✅ 测试 4: 条件组内重排

1. 添加多张卡片到条件组内
2. 在组内拖拽重排
3. **预期**: 应该正确重排

## 常见问题排查

| 问题               | 检查项                                        |
| ------------------ | --------------------------------------------- |
| 仍然无法合并       | 检查 console 中 `isMovingToGroup` 是否为 true |
| 卡片消失了         | 检查是否有 JavaScript 错误                    |
| 视觉反馈不对       | 验证 `isInsertTop` 值是否正确                 |
| 多个 drop 同时发生 | 检查 canDrop 是否工作                         |

## 关键日志关键字

在 console 中搜索以下关键字来追踪问题：

- `DROP EVENT` - 追踪 drop 事件
- `ACTION:` - 追踪采取的操作
- `MOVE_CARD_CALLED` - 追踪 moveCard 函数调用
- `reason:` - 了解为什么采取某个操作

## 相关文件

- 修改: `src/module/useCardDrag.ts` - 添加 canDrop 和增强日志
- 修改: `src/module/Wrapper.tsx` - 改进 isMovingToGroup 判断和初始化 children
- 提交: `665f3e4` - fix: improve card merging into groups with better drop handling

## 下一步

如果测试通过：

1. 移除或优化调试 console.log（可选）
2. 更新测试用例
3. 考虑是否需要进一步的 UX 改进
