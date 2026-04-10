# 拖动视觉反馈优化 Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Replace shadow zone feedback with a single clean insertion line indicator, improving visual clarity and removing duplicate feedback when dragging into groups.

**Architecture:** Replace the dashed shadow box with a thin horizontal line indicator that appears at the exact insertion point, making it immediately clear where the card will be placed.

**Tech Stack:** styled-components, React, react-dnd

---

## File Structure

**Files to modify:**

- `src/module/Card.tsx` - Replace ShadowZone components with InsertionLine
- `src/module/useCardDrag.ts` - Adjust feedback calculation if needed

**New styled components:**

- `InsertionLine` - Single line indicator at insertion point

---

## Task 1: Create new InsertionLine styled component

**Files:**

- Modify: `src/module/Card.tsx` (add new styled component, remove old ones)

- [ ] **Step 1: Create InsertionLine styled component**

Replace the `ShadowZone` and `ShadowContent` styled components with this new one in `src/module/Card.tsx`:

```typescript
const InsertionLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    ${theme.colors.primary} 20%,
    ${theme.colors.primary} 80%,
    transparent 100%
  );
  pointer-events: none;
  z-index: ${theme.zIndex.drag};
  box-shadow: 0 0 8px rgba(22, 119, 255, 0.4);
`;
```

- [ ] **Step 2: Update JSX to use InsertionLine**

Find these two lines in the JSX (around lines 312-346):

```typescript
{isInsertTop && isOver && (
  <ShadowZone style={{ top: "-12px", ... }}>
    <ShadowContent />
  </ShadowZone>
)}
// ... card content ...
{isInsertTop === false && isOver && (
  <ShadowZone style={{ bottom: "-12px", ... }}>
    <ShadowContent />
  </ShadowZone>
)}
```

Replace with:

```typescript
{
  isInsertTop && isOver && (
    <InsertionLine
      style={{
        top: 0,
        transform: "translateY(-50%)",
      }}
    />
  );
}
// ... card content ...
{
  isInsertTop === false && isOver && (
    <InsertionLine
      style={{
        bottom: 0,
        transform: "translateY(50%)",
      }}
    />
  );
}
```

- [ ] **Step 3: Remove old styled components**

Delete these styled components from the file:

```typescript
const ShadowZone = styled.div`...`;
const ShadowContent = styled.div`...`;
```

- [ ] **Step 4: Build and verify**

```bash
npm run build 2>&1 | grep -E "Compiled|error"
```

Expected: Build succeeds with no errors

- [ ] **Step 5: Commit**

```bash
git add src/module/Card.tsx
git commit -m "feat: replace shadow zone feedback with clean insertion line"
```

---

## Task 2: Improve InsertionLine visual design

**Files:**

- Modify: `src/module/Card.tsx` (enhance InsertionLine styling)

- [ ] **Step 1: Enhance InsertionLine with animations**

Update the `InsertionLine` styled component for better visual appeal:

```typescript
const InsertionLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    ${theme.colors.primary} 20%,
    ${theme.colors.primary} 80%,
    transparent 100%
  );
  pointer-events: none;
  z-index: ${theme.zIndex.drag};
  box-shadow: 0 0 8px rgba(22, 119, 255, 0.4);
  animation: insertionPulse 1.5s ease-in-out infinite;

  @keyframes insertionPulse {
    0% {
      opacity: 0.8;
      box-shadow: 0 0 8px rgba(22, 119, 255, 0.4);
    }
    50% {
      opacity: 1;
      box-shadow: 0 0 12px rgba(22, 119, 255, 0.6);
    }
    100% {
      opacity: 0.8;
      box-shadow: 0 0 8px rgba(22, 119, 255, 0.4);
    }
  }
`;
```

- [ ] **Step 2: Build and verify**

```bash
npm run build 2>&1 | grep -E "Compiled|error"
```

- [ ] **Step 3: Commit**

```bash
git add src/module/Card.tsx
git commit -m "feat: add pulsing animation to insertion line for better visibility"
```

---

## Task 3: Test visual feedback in browser

**Files:**

- No modifications, this is a verification task

- [ ] **Step 1: Start dev server**

```bash
npm start
```

- [ ] **Step 2: Visual verification checklist**

In the browser at http://localhost:3000, test these scenarios:

**Scenario 1: Drag card at level 1**

- [ ] Single horizontal line appears above/below the target card
- [ ] Line is blue (#1677ff) with gradient edges
- [ ] Line has subtle glow effect
- [ ] Line pulses gently (not distracting)
- [ ] No duplicate feedback

**Scenario 2: Drag card into condition group**

- [ ] Only ONE line appears inside the group (at insertion point)
- [ ] Group itself does NOT show any shadow/highlight
- [ ] Line clearly shows where card will be placed
- [ ] When hovering over different cards in group, line moves correctly

**Scenario 3: Drag condition group at level 1**

- [ ] Line appears above/below target group
- [ ] Single clear indicator
- [ ] No duplicate feedback

**Scenario 4: Drag card out of group**

- [ ] Line appears at correct position relative to group
- [ ] Single clean indicator

- [ ] **Step 3: Console verification**

Open DevTools Console and verify:

- [ ] No errors
- [ ] No warnings
- [ ] Only relevant drag events logged

- [ ] **Step 4: If everything looks good, stop server and commit**

```bash
git add -A
git commit -m "test: verify insertion line visual feedback is clean and single"
```

---

## Success Criteria

✅ Single insertion line appears instead of shadow zones
✅ No duplicate feedback when dragging into groups
✅ Line has clear visual design (blue gradient with glow)
✅ Line pulses gently for visibility
✅ All drag scenarios show correct feedback
✅ Build succeeds with no errors
✅ No console errors

---

## Notes

- The insertion line is more elegant and clearer than the shadow zone approach
- Gradient edges prevent harsh lines
- Pulsing animation draws attention without being distracting
- Line position (top/bottom) precisely indicates insertion point
- Removing nested feedback prevents confusion when dragging into groups
