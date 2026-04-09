# 快速参考 - 视觉反馈样式改动

## 🚀 快速开始

启动项目并查看效果：

```bash
npm start
# 访问 http://localhost:3000
# 拖拽任何卡片，看到蓝色虚线框反馈
```

## 🎨 视觉反馈特性

| 特性     | 说明                                     |
| -------- | ---------------------------------------- |
| **样式** | 蓝色虚线边框 (`#3c88f0`)                 |
| **背景** | 淡蓝色透明填充 `rgba(60, 136, 240, 0.1)` |
| **位置** | 上拖: 卡片上方 / 下拖: 卡片下方          |
| **高度** | 动态测量（自适应卡片大小）               |
| **默认** | 100px (如果测量失败)                     |

## 📝 核心代码位置

### 样式定义

**文件**: `src/module/index.module.scss` (行 132-158)

```scss
.shadowZone {
  /* 位置定位 */
  position: absolute;
  /* ... */

  .shadowContent {
    width: 100%;
    height: 100%; // 关键：填充整个容器
    background: rgba(60, 136, 240, 0.1);
    border: 2px dashed #3c88f0; // 关键：虚线边框
  }
}
```

### 组件逻辑

**文件**: `src/module/Card.tsx`

**测量高度** (行 61-65):

```tsx
const cardHeightRef = useRef<HTMLDivElement>(null);
const cardHeight = useMemo(() => {
  return cardHeightRef.current?.offsetHeight || 100;
}, [isGroup, data, isDragging]);
```

**上方反馈** (行 194-205):

```tsx
{isInsertTop && isOver && (
  <div style={{ height: `${cardHeight}px`, ... }}>
    <div className={moduleStyle.shadowContent} />
  </div>
)}
```

**下方反馈** (行 218-229):

```tsx
{isInsertTop === false && isOver && (
  <div style={{ height: `${cardHeight}px`, ... }}>
    <div className={moduleStyle.shadowContent} />
  </div>
)}
```

## 🔧 自定义样式

### 修改反馈框颜色

在 `index.module.scss` 中修改 `shadowContent`:

```scss
.shadowContent {
  background: rgba(255, 0, 0, 0.1); // 红色
  border: 2px dashed #ff0000;
}
```

### 修改反馈框厚度

```scss
.shadowContent {
  border: 3px dashed #3c88f0; // 更粗
}
```

### 修改反馈框形状

```scss
.shadowContent {
  border: 2px dotted #3c88f0; // 点状而非虚线
  // 或
  border: 2px solid #3c88f0; // 实线
}
```

## 🐛 常见问题排查

| 问题           | 原因              | 解决方案                            |
| -------------- | ----------------- | ----------------------------------- |
| 反馈框没有显示 | `isOver` 为 false | 确保 react-dnd 配置正确             |
| 反馈框高度不对 | 测量失败          | 检查 `cardHeightRef` 是否正确挂载   |
| 虚线不清晰     | CSS 未正确应用    | 清除浏览器缓存，重新构建            |
| 反馈框位置错误 | 定位问题          | 检查 `top/bottom` 和 `transform` 值 |

## 📊 性能考虑

- ✅ `useMemo` 缓存高度计算，避免每次渲染都测量
- ✅ `pointer-events: none` 防止反馈框阻挡交互
- ✅ `z-index: 1` 确保反馈框显示在卡片下方

## 🎯 相关提交

```
89bcdb0 - docs: final visual feedback update summary
5195345 - improve: dynamic card height for visual feedback
a769c55 - docs: visual feedback styling update guide
fdb2b4a - style: update visual feedback to full card size with dashed border
```

## 📚 更多信息

详见文档：

- `VISUAL_FEEDBACK_FINAL.md` - 完整总结
- `VISUAL_FEEDBACK_UPDATE.md` - 详细说明
- `TESTING_GUIDE.md` - 测试指南
