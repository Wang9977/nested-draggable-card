# 卡片合并问题修复总结

## 🔍 问题描述

**症状**：

- 拖拽卡片到条件组下方时，视觉反馈同时显示在条件组上方和卡片上方
- 松手时，卡片只放到条件组上方，无法合并进组内

**原因**：

- React-DND 在嵌套 drop targets 的情况下，会同时在多个元素上触发 hover 和 drop 事件
- 条件组内的 Container 和条件组本身都有 drop handlers
- 导致 drop 事件被路由到错误的处理器

## ✅ 应用的修复

### 1. 添加 Drop 验证器 (canDrop)

**文件**: `src/module/useCardDrag.ts` (行 59-75)

```typescript
canDrop: (item: DragItem) => {
  if (item.isGroup) return false;
  if (item.level === 1) return true; // Level 1 可以 drop 到任何地方
  if (item.level === 2) return level === 1 || level === 2; // Level 2 只能同级
  return false;
};
```

**作用**：防止不适当的元素接收 drop 事件，确保只有正确的元素能处理 drop

### 2. 使用 hoverItem.isGroup 标志

**文件**: `src/module/Wrapper.tsx` (行 32)

```typescript
// 之前 - 只检查 targetCard 是否有 children
const isMovingToGroup = targetHasChildren;

// 之后 - 同时检查 drop handler 传入的 isGroup 标志
const isMovingToGroup =
  hoverItem.isGroup === true && (targetHasChildren || hoverItem.level === 2);
```

**作用**：更精确地识别是否在做合并操作，避免误判

### 3. 初始化 Children 数组

**文件**: `src/module/Wrapper.tsx` (行 159-160)

```typescript
if (!cardsTmp[targetIdx].children) {
  cardsTmp[targetIdx].children = [];
}
```

**作用**：确保目标组有 children 数组，即使之前没有

### 4. 增强调试日志

**文件**: `src/module/useCardDrag.ts` 和 `src/module/Wrapper.tsx`

新增日志：

- `DROP EVENT` - 详细的 drop 事件信息
- `ACTION` - 采取的操作（extract/merge/reorder）
- `MOVE_CARD_CALLED` - moveCard 函数调用的详细信息

## 🧪 测试方法

### 测试 1: 基本合并（最重要）

```
1. 添加两张卡片：Card1, Card2
2. 将 Card2 转换为条件组（点"扩展"）
3. 拖拽 Card1 到条件组下方
4. 观看视觉反馈（应该只在条件组下方显示）
5. 释放鼠标
✅ 预期结果：Card1 进入条件组内
```

### 测试 2: 检查控制台日志

打开 DevTools Console，应该看到：

```
DROP EVENT: {
  draggedCardId: "card2",
  draggedCardLevel: 1,
  targetCardId: "card1",    // 条件组 ID
  targetCardIsGroup: true,
  isUpDragValue: false,     // 在下方
  ...
}

ACTION: Merging into group (revised) {
  reason: "targetIsGroup && !isUpDragValue"
}

MOVE_CARD_CALLED: {
  isMovingToGroup: true,    // 关键！应该是 true
  reason: "Moving to group"
}
```

### 测试 3: 多个操作序列

```
1. 创建 3 张卡片，第 2 张转换为组
2. 将卡片 1 放入组内
3. 将组内的卡片提取出来
4. 再次将卡片 1 放入组内
✅ 预期结果：所有操作都应该正确执行
```

## 📝 关键检查点

| 检查项                   | 预期             | 如果失败                      |
| ------------------------ | ---------------- | ----------------------------- |
| 视觉反馈位置             | 只在目标卡片下方 | 检查 `isInsertTop` 值         |
| 控制台 `isMovingToGroup` | true             | 检查 `hoverItem.isGroup` 标志 |
| 卡片是否进入组           | 是               | 检查 `moveCard` 是否被调用    |
| 组内卡片列表             | 应该增加         | 检查 `children` 数组更新      |

## 🐛 故障排查

如果仍然不工作：

1. **清除浏览器缓存**

   - Ctrl+Shift+R (或 Cmd+Shift+R)

2. **检查 console 错误**

   - 应该没有 JavaScript 错误

3. **验证修复是否应用**

   - 检查 `canDrop` 函数是否存在
   - 检查 `isMovingToGroup` 的判断条件

4. **添加临时日志**
   - 在 `moveCard` 开始处添加 `console.log("DEBUG moveCard:", {hoverItem, dragItem})`

## 📊 相关提交

```
bdb70a0 - docs: merge fix debugging guide
665f3e4 - fix: improve card merging into groups with better drop handling
```

## 📚 相关文档

- `MERGE_FIX_DEBUG_GUIDE.md` - 详细调试指南
- `TESTING_GUIDE.md` - 完整测试指南
- `VISUAL_FEEDBACK_QUICK_REFERENCE.md` - 视觉反馈参考

## 🎯 预期结果

修复后，你应该能够：

- ✅ 将根级卡片拖入条件组
- ✅ 视觉反馈准确显示在目标位置
- ✅ 多个 drop targets 不会相互干扰
- ✅ Console 日志清晰显示操作流程
