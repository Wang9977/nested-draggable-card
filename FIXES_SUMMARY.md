# 拖拽功能修复总结

## 问题回顾

### 问题 1：卡片和条件组无法交换位置
**症状**: 拖动卡片到条件组上方，显示红线视觉反馈，但释放后卡片不动

**根本原因**: Drop handler中的条件判断不够精确
- 当拖动卡片悬停在条件组上时，无法区分是想要"在组上方交换位置"还是"合并进组"
- 所有对条件组的drop都被当作"合并进组"处理

### 问题 2：无法从条件组中拖出卡片  
**症状**: 从条件组内拖出卡片到根level，显示红线视觉反馈，但释放后卡片不动

**根本原因**: 同上，drop handler没有正确路由动作

### 问题 3：单卡片条件组→拖出后卡片消失
**症状**: 
1. 有1张卡片 (Card1)
2. 点击"扩展"转换成条件组
3. 从组里拖出Card1
4. Card1消失了

**根本原因**: 
- `moveCard` 中"拖出组"分支使用了 `deleteCard` 工具函数
- `deleteCard` 有特殊逻辑：删除组内最后一个卡片时，如果组的 `type === 4`，会同时删除该组
- 导致流程：Card1被从组中删除 → 组变空 → 组被删除 → Card1也消失了

## 修复方案

### 修复 1：Drop Handler 中的边界检测 ✅
**文件**: `src/module/useCardDrag.ts` (第108行)

**改变前**:
```javascript
else if (targetIsGroup && targetHasChildren) {
  // Moving into a group - 所有对group的drop都走这里
  onMove(item, {
    ...hoverItem.level: 2,  // 都被加入组
  });
}
```

**改变后**:
```javascript
else if (targetIsGroup && targetHasChildren && !isUpDragValue) {
  // Only move INTO a group if dropping in the lower half
  // isUpDragValue=true 表示在上半部分，应该做reordering
  // isUpDragValue=false 表示在下半部分，可以merge into group
  onMove(item, {
    ...hoverItem.level: 2,
  });
}
```

**效果**:
- 在条件组上方释放 → 在根level reordering（swap position）✅
- 在条件组下方释放 → 合并进组 ✅

### 修复 2：自动路由 ✅
**文件**: `src/module/useCardDrag.ts` (第98-126行)

当 `isUpDragValue === true` 时，drop会进入 else 分支：
```javascript
else {
  // Normal reordering at same level
  const targetLevel = item.level === 2 && !targetIsGroup ? 2 : 1;
  onMove(item, {
    id: data.id,
    hoverIndex: idx,
    isGroup: targetIsGroup,
    level: targetLevel,  // 正确设置目标level
  });
}
```

这样就能正确处理：
- 卡片在组上方 + `isUpDragValue=true` → 在根level reordering ✅
- 卡片从组内拖出 + `isUpDragValue=false` → 合并进组 ✅

### 修复 3：避免卡片消失 ✅
**文件**: `src/module/Wrapper.tsx` (第64-106行)

**改变前**:
```javascript
else if (isMovingOutOfGroup) {
  let cardsTmp = deleteCard(cards, dragItem);  // ❌ deleteCard会删除空组
  // 后续逻辑...
}
```

**改变后**:
```javascript
else if (isMovingOutOfGroup) {
  // 手动处理，避免deleteCard的副作用
  let groupIndex = -1;
  let cardIndexInGroup = -1;
  
  // 找到包含该卡片的组
  cards.forEach((card, idx) => {
    const childIndex = card.children?.findIndex((c) => c.id === dragItem.id);
    if (childIndex !== undefined && childIndex > -1) {
      groupIndex = idx;
      cardIndexInGroup = childIndex;
    }
  });
  
  if (groupIndex > -1 && cardIndexInGroup > -1) {
    // 只从children数组删除，不触发deleteCard的"删除空组"逻辑
    let cardsTmp = update(cards, {
      [groupIndex]: {
        children: {
          $splice: [[cardIndexInGroup, 1]],  // ✅ 只删除这一项
        },
      },
    });
    
    // 然后在根level插入
    const hoverIdx = cardsTmp.findIndex((card) => card.id === hoverItem.id);
    if (hoverIdx > -1) {
      res = update(cardsTmp, {
        $splice: [[dragItem?.isUpDrag ? hoverIdx : hoverIdx + 1, 0, dragItem.data]],
      });
    } else {
      res = [...cardsTmp, dragItem.data];
    }
  }
}
```

**效果**: 卡片正确提取，组保留但可能为空（后续可选优化自动删除空组）✅

## 修复清单

| 问题 | 文件 | 行号 | 状态 |
|------|------|------|------|
| 卡片-组交换位置 | useCardDrag.ts | 108 | ✅ 已修复 |
| 卡片无法拖出组 | useCardDrag.ts + Wrapper.tsx | 98-126, 64-106 | ✅ 已修复 |
| 单卡片组拖出后消失 | Wrapper.tsx | 64-106 | ✅ 已修复 |

## Git 提交历史

```
5f10850 fix: enable card-group position swapping and group exit dragging
b10ff1b fix: prevent card deletion when extracting from single-card group
9118b1e docs: add test instructions for single-card group extraction
5b7010a refactor: remove debug logs from card extraction logic
570ef21 chore: complete TypeScript migration and project setup
```

## 测试验证

### 场景 A: 卡片-组交换
1. 添加 Card1, Card2
2. 将 Card2 转换为 Group2
3. 拖动 Card1 到 Group2 上方并释放
4. **预期**: Card1 和 Group2 交换位置 ✅

### 场景 B: 从组中提取卡片
1. 添加 Card1
2. 将 Card1 转换为 Group1
3. 从 Group1 内拖出卡片到 Group1 上方并释放
4. **预期**: 卡片出现在 Group1 上方，不会消失 ✅

### 场景 C: 多卡片-组合并
1. 添加 Card1, Card2, Card3
2. 将 Card2 转换为 Group2
3. 拖动 Card1 到 Group2 下方并释放
4. **预期**: Card1 被添加到 Group2 的 children ✅

## 依赖的技术细节

### 位置检测原理
```
hoverBoundingRect = 元素的边界矩形
floatItemY = 拖拽项当前的Y坐标
hoverMiddleY = 悬停目标的中点Y坐标

if (floatItemY < hoverMiddleY)
  isInsertTop = true  (在上半部分)
else
  isInsertTop = false (在下半部分)
```

### 边界层级处理
- **Level 1**: 根level，所有直接卡片
- **Level 2**: 条件组内的卡片
- 拖拽时自动判断源和目标的level，计算应该采取的动作

### 不可变性保证
- 使用 `immutability-helper` 库进行不可变更新
- 所有state更新都返回新对象，保证React可以正确追踪变化

## 后续优化建议

1. **自动删除空组**: 当组的children为空时，自动删除该组
2. **批量操作**: 支持批量拖拽多张卡片
3. **撤销/重做**: 记录操作历史
4. **性能优化**: 对大量卡片的场景进行虚拟化
5. **拖拽预览**: 显示拖拽项的预览而不是隐藏原项
