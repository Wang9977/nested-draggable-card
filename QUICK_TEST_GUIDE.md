# 🚀 快速测试卡片合并修复

## 立即测试

```bash
# 启动开发服务器
npm start

# 在浏览器中打开
# http://localhost:3000

# 打开 DevTools (F12)，切换到 Console 标签页
```

## 测试场景

### ✅ 场景 1: 最简单的合并测试（5 秒钟）

1. 点击"添加卡片"→ 添加一张卡片
2. 点击卡片上的"扩展"按钮
3. 现在你有了一个条件组，打开它看内部
4. 再添加一张卡片到根级
5. **关键测试**：拖拽新卡片到条件组**下方**（不是上方！）
6. 释放鼠标

**预期**：新卡片应该进入条件组内

### ✅ 场景 2: 观察控制台日志（很重要！）

拖拽时在 Console 中查看：

```
DROP EVENT: {..., isUpDragValue: false}
ACTION: Merging into group (revised)
MOVE_CARD_CALLED: {..., isMovingToGroup: true}
```

**关键指标**：

- `isUpDragValue: false` ✅ (表示在下方)
- `isMovingToGroup: true` ✅ (表示正在合并)

### ✅ 场景 3: 验证卡片进入组

1. 完成场景 1 的拖拽
2. 打开条件组，验证新卡片是否在里面
3. 如果在，合并成功！

## 如果不工作

### 🔍 诊断步骤

1. **检查 console 日志**

   ```
   - 是否看到 "DROP EVENT" 日志？
   - isMovingToGroup 是 true 还是 false？
   - 是否有红色错误？
   ```

2. **检查视觉反馈**

   ```
   - 拖拽时反馈是否只显示在目标位置？
   - 还是显示在多个地方？
   ```

3. **刷新页面**

   ```
   Ctrl+Shift+R (Windows)
   Cmd+Shift+R (Mac)
   ```

4. **重新构建**
   ```
   npm run build
   ```

## 关键文件查看

### 要验证的修复位置

**1. Drop 验证器** - `src/module/useCardDrag.ts:59-75`

```
canDrop: (item: DragItem) => {
  if (item.isGroup) return false;
  if (item.level === 1) return true;
  if (item.level === 2) return level === 1 || level === 2;
  return false;
}
```

**2. 组判断** - `src/module/Wrapper.tsx:32`

```
const isMovingToGroup = hoverItem.isGroup === true && (targetHasChildren || hoverItem.level === 2);
```

**3. Children 初始化** - `src/module/Wrapper.tsx:159-160`

```
if (!cardsTmp[targetIdx].children) {
  cardsTmp[targetIdx].children = [];
}
```

## 成功标志

✅ 修复成功的标志：

- [ ] 可以拖拽卡片进入条件组
- [ ] 视觉反馈准确显示
- [ ] Console 中 `isMovingToGroup: true`
- [ ] 卡片实际进入了组内
- [ ] 没有 JavaScript 错误

## 需要帮助？

查看完整文档：

- `MERGE_FIX_SUMMARY.md` - 完整说明
- `MERGE_FIX_DEBUG_GUIDE.md` - 详细调试指南
- `TESTING_GUIDE.md` - 完整测试场景
