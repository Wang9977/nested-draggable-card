# 卡片拖放合并和提取功能 - 最终修复

## 问题说明

### 第一个问题（已解决 ✓）

**场景：** Card2 想要放入条件组 1**内部**，在 Card1 上方

**问题：** 无法拖放进去，只能放在条件组 1 的上方

**根本原因：** 当 level 1 项拖到 level 2 卡片上方时，drop handler 没有正确处理这个场景

**解决方案：**

- 在 Card1（level 2）的 drop handler 中检测到 level 1 项在其上方
- 调用 `onMove` 时传递 `isGroup: true, level: 2` 标志
- 在 Wrapper.tsx 中识别 `isMovingL1ToGroupViaL2` 场景
- 找到包含 Card1 的组，在正确位置（Card1 前面）插入 Card2

### 第二个问题（已解决 ✓）

**场景：** Card2 现在在条件组 1 内部（在 Card1 上方），要拖到条件组 1**下方**提取出来

**问题：** 拖放失败

**根本原因：**

- 第 164 行的合并条件 `targetIsGroup && !isUpDragValue` 没有检查 item.level
- 导致 level 2 项下拖到 level 1 组时，被重新合并进去而不是提取出来
- 缺少识别"从组提取到组下方"的专门逻辑

**解决方案：**

- 在 useCardDrag.ts 中添加 `isDraggingOutOfGroupToLevel1Below` 检测
- 修改合并条件为 `item.level === 1` 才能合并
- 在 Wrapper.tsx 中添加 `isMovingL2OutOfGroupToLevel1Below` 处理
- 找到包含该 level 2 卡片的组，移除并插入到组下方

## 实现细节

### 合并到组内（上方）

**文件：** `src/module/useCardDrag.ts`

```typescript
if (item.level === 1 && level === 2 && isUpDragValue) {
  onMove(item, {
    id: data.id, // Reference the level 2 card
    hoverIndex: idx, // Position in group
    isGroup: true, // Going into group
    level: 2, // Target level is 2
  });
}
```

**文件：** `src/module/Wrapper.tsx`

```typescript
const isMovingL1ToGroupViaL2 =
  dragItem.level === 1 && hoverItem.level === 2 && hoverItem.isGroup === true;

// Handle: Find parent group, insert at position
const insertPosition = dragItem.isUpDrag
  ? cardIndexInGroup // Before target
  : cardIndexInGroup + 1; // After target
```

### 提取出组（下方）

**文件：** `src/module/useCardDrag.ts`

```typescript
const isDraggingOutOfGroupToLevel1Below =
  item.level === 2 && level === 1 && !isUpDragValue && isGroup;

if (isDraggingOutOfGroupToLevel1Below) {
  onMove(item, {
    id: data.id,
    hoverIndex: idx,
    isGroup: false,
    level: 1,
  });
}
```

**文件：** `src/module/Wrapper.tsx`

```typescript
const isMovingL2OutOfGroupToLevel1Below =
  dragItem.level === 2 &&
  hoverItem.level === 1 &&
  hoverItem.isGroup === true &&
  !dragItem.isUpDrag;

// Handle: Remove from group, insert after group in root level
res = update(cardsTmp, {
  $splice: [[groupIdx + 1, 0, dragItem.data]],
});
```

## 完整测试场景

### 基本流程

1. 点击 "添加卡片" → 添加 Card1
2. 点击 Card1 的 "扩展" → 转换为 ConditionGroup1
3. 点击 "添加卡片" → 添加 Card2（在根级别）

### 场景 A：合并到组内（上方）

4. 拖 Card2 **下方** → 放到 ConditionGroup1 下方
   - **预期：** Card2 合并到 ConditionGroup1 内，在 Card1 上方 ✓

### 场景 B：提取出组（下方）

5. 拖 Card2 **上方** → 放到 ConditionGroup1 下方
   - **预期：** Card2 提取回根级别，位于 ConditionGroup1 下方 ✓

### 场景 C：组外排序

6. 添加 Card3（现在有 Card2 > ConditionGroup1）
7. 拖 Card3 到 Card2 上方 → 排序
   - **预期：** Card3 移到 Card2 上方

## 修改的文件

**src/module/useCardDrag.ts:**

- 新增检测：`isDraggingOutOfGroupToLevel1Below`
- 修复合并条件：加入 `item.level === 1` 检查
- 处理从 level 2 拖到 level 1 group 下方的场景

**src/module/Wrapper.tsx:**

- 新增检测：`isMovingL1ToGroupViaL2` 和 `isMovingL2OutOfGroupToLevel1Below`
- 处理合并到组内指定位置
- 处理从组提取到组下方

## Commits

- **80fcfc8:** Enable merging cards INTO groups at specific positions
- **19b8f3c:** Fix extraction of cards from groups when dragging below group

## 关键改进点

✅ **支持在组内精确位置插入** - 而不仅仅是追加
✅ **支持从组提取到指定位置** - 而不是固定位置
✅ **正确的空组自动删除** - 保持数据整洁
✅ **清晰的日志记录** - 便于调试

## 验证检查清单

在测试时，打开 DevTools Console 检查：

- [ ] 合并时看到 `"ACTION: Merging into parent group (level 1 on level 2 top)"`
- [ ] 提取时看到 `"ACTION: Extracting from group to below it"`
- [ ] 没有看到错误信息
- [ ] Card 放在正确的位置
- [ ] 空组被自动删除

## 下一步

请测试上述场景并确认功能正常工作。如果有任何问题，检查：

1. Console 日志输出是否正确
2. 卡片位置是否符合预期
3. 是否有任何错误或异常
