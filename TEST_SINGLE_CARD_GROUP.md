# 单卡片条件组提取测试

## 问题
当有一张卡片被转换成条件组后，将这张卡片从组里拖出时，卡片会被删除。

## 根本原因
在 `moveCard` 的"拖出组"分支中，使用了 `deleteCard` 工具函数。
`deleteCard` 有一个特殊逻辑：当删除组内最后一张卡片时，如果该组的 `type === 4` (条件组)，会同时删除该组。
这导致：
1. 卡片从组中被删除
2. 组变为空
3. 空组被删除
4. 卡片也因此消失了

## 修复方法
不使用 `deleteCard`，而是手动从组的 `children` 数组中删除卡片，然后将卡片插入到根level。

修改位置: `src/module/Wrapper.tsx` 第64-122行

## 测试步骤

### 场景A: 单卡片→条件组→拖出
1. 点击"添加卡片"添加1张卡片，显示"卡片名称1"
2. 悬停在卡片上，点击"扩展"按钮
3. 卡片转换成"条件组"，内部显示"卡片名称1"
4. **从条件组内拖出卡片到条件组上方**
   - 预期视觉: 红线显示在条件组上方
   - 预期结果: 卡片应该出现在条件组上方
   - **验证**: 卡片没有被删除，而是正确显示在根level

### 场景B: 多卡片→条件组→拖出一张
1. 点击"添加卡片"添加3张卡片
2. 将第2张卡片转换成条件组（此时该组内只有1张卡片）
3. 从条件组内拖出那张卡片
4. **验证**: 卡片正确提取，条件组保留但为空 OR 空条件组被自动删除（后续可选优化）

## 调试输出
启用浏览器控制台，查看以下日志来确认提取过程：
```
[EXTRACT_FROM_GROUP] Starting extraction
[EXTRACT_FROM_GROUP] dragItem: {...}
[EXTRACT_FROM_GROUP] hoverItem: {...}
[EXTRACT_FROM_GROUP] Found at groupIndex: X cardIndexInGroup: Y
[EXTRACT_FROM_GROUP] After removing from group: [...]
[EXTRACT_FROM_GROUP] After inserting at root: [...]
```

## 预期行为对比

### 修复前 ❌
单卡片→条件组→拖出 = 卡片消失
原因: `deleteCard` 删除了空组及其内部的卡片

### 修复后 ✅
单卡片→条件组→拖出 = 卡片出现在条件组外
原因: 手动提取逻辑正确处理了卡片的移动
