# 拖动视觉反馈增强 Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Make the insertion line feedback more prominent and visible with thicker line, decorator elements, and stronger visual presence. Remove the glow effect for a cleaner, more defined look.

**Architecture:**

- Increase line width from 2px to 5px
- Add circular dots at both ends as decorators
- Enhance color saturation
- Remove box-shadow glow effect
- Keep smooth pulsing animation but make it more obvious

**Tech Stack:** styled-components, React, react-dnd

---

## File Structure

**Files to modify:**

- `src/module/Card.tsx` - Update InsertionLine and add decorator elements

---

## Task 1: Enhance InsertionLine with thicker line and end decorators

**Files:**

- Modify: `src/module/Card.tsx`

- [ ] **Step 1: Update InsertionLine styled component**

Find the current `InsertionLine` styled component and replace it with:

```typescript
const InsertionLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 5px;
  background: ${theme.colors.primary};
  pointer-events: none;
  z-index: ${theme.zIndex.drag};
  border-radius: 2.5px;
  animation: insertionPulse 1.5s ease-in-out infinite;

  @keyframes insertionPulse {
    0% {
      transform: scaleY(0.8);
      opacity: 0.7;
    }
    50% {
      transform: scaleY(1.2);
      opacity: 1;
    }
    100% {
      transform: scaleY(0.8);
      opacity: 0.7;
    }
  }
`;
```

- [ ] **Step 2: Create EndDot styled component for decorator circles**

Add a new styled component right after InsertionLine:

```typescript
const EndDot = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background: ${theme.colors.primary};
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  z-index: ${theme.zIndex.drag};

  &.left {
    left: -4px;
  }

  &.right {
    right: -4px;
  }
`;
```

- [ ] **Step 3: Create InsertionLineWrapper to hold line + dots**

Add a wrapper component:

```typescript
const InsertionLineWrapper = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 5px;
  pointer-events: none;
  z-index: ${theme.zIndex.drag};
`;
```

- [ ] **Step 4: Update JSX to render line with decorator dots**

Find the two places where InsertionLine is rendered (around lines 327-328 and 349-350).

Old code:

```typescript
{
  isInsertTop && isOver && (
    <InsertionLine style={{ top: 0, transform: "translateY(-50%)" }} />
  );
}
```

Replace with:

```typescript
{
  isInsertTop && isOver && (
    <InsertionLineWrapper style={{ top: 0, transform: "translateY(-50%)" }}>
      <InsertionLine />
      <EndDot className="left" />
      <EndDot className="right" />
    </InsertionLineWrapper>
  );
}
```

And similarly for bottom:

Old code:

```typescript
{
  isInsertTop === false && isOver && (
    <InsertionLine style={{ bottom: 0, transform: "translateY(50%)" }} />
  );
}
```

Replace with:

```typescript
{
  isInsertTop === false && isOver && (
    <InsertionLineWrapper style={{ bottom: 0, transform: "translateY(50%)" }}>
      <InsertionLine />
      <EndDot className="left" />
      <EndDot className="right" />
    </InsertionLineWrapper>
  );
}
```

- [ ] **Step 5: Build and verify**

```bash
npm run build 2>&1 | grep -E "Compiled|error"
```

Expected: Build succeeds with no errors

- [ ] **Step 6: Commit**

```bash
git add src/module/Card.tsx
git commit -m "feat: enhance insertion line with thicker width and end decorator dots"
```

---

## Task 2: Improve animation for better visibility

**Files:**

- Modify: `src/module/Card.tsx`

- [ ] **Step 1: Enhance InsertionLine animation**

Update the `InsertionLine` animation to be more visible:

```typescript
const InsertionLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 5px;
  background: ${theme.colors.primary};
  pointer-events: none;
  z-index: ${theme.zIndex.drag};
  border-radius: 2.5px;
  animation: insertionPulse 1.5s ease-in-out infinite;

  @keyframes insertionPulse {
    0% {
      transform: scaleY(0.8);
      opacity: 0.7;
    }
    50% {
      transform: scaleY(1.2);
      opacity: 1;
    }
    100% {
      transform: scaleY(0.8);
      opacity: 0.7;
    }
  }
`;
```

This animation:

- Pulses the height (scaleY) from 80% to 120% to 80%
- Opacity changes from 0.7 to 1.0 to 0.7
- Creates obvious breathing effect
- Duration: 1.5 seconds

- [ ] **Step 2: Build and verify**

```bash
npm run build 2>&1 | grep -E "Compiled|error"
```

- [ ] **Step 3: Commit**

```bash
git add src/module/Card.tsx
git commit -m "feat: improve insertion line animation with height scaling for better visibility"
```

---

## Task 3: Visual testing in browser

**Files:**

- No modifications, this is a verification task

- [ ] **Step 1: Start dev server**

```bash
npm start
```

- [ ] **Step 2: Visual verification checklist**

In the browser at http://localhost:3000, test:

**Visual Design Check:**

- [ ] Insertion line is 5px tall (noticeably thicker)
- [ ] Line color is bright blue (#1677ff)
- [ ] Circular dots (8px) appear at both ends of the line
- [ ] Dots are centered vertically on the line
- [ ] NO glow effect - clean, solid appearance
- [ ] Overall looks clean and professional

**Animation Check:**

- [ ] Line pulses with scaling effect (gets taller then shorter)
- [ ] Opacity changes smoothly (0.7 → 1.0 → 0.7)
- [ ] Animation is obvious but not annoying
- [ ] Duration is 1.5 seconds
- [ ] Animation loops infinitely while dragging

**Drag Testing:**

- [ ] **Scenario 1:** Drag root card over another

  - [ ] Single line with two dots appears
  - [ ] Very obvious and visible
  - [ ] Line positions correctly above/below

- [ ] **Scenario 2:** Drag card INTO condition group (Critical!)

  - [ ] Only ONE line inside group
  - [ ] Group itself has NO highlight
  - [ ] Line with dots clearly shows insertion point
  - [ ] NO duplicate feedback
  - [ ] Very easy to see where card will go

- [ ] **Scenario 3:** Drag condition group

  - [ ] Single line with dots
  - [ ] Very obvious

- [ ] **Scenario 4:** Overall visual clarity

  - [ ] Much more visible than before
  - [ ] Easy to see insertion points
  - [ ] Clean and professional appearance

- [ ] **Step 3: Console check**

Open DevTools Console:

- [ ] No errors
- [ ] No warnings

- [ ] **Step 4: Performance check**

While dragging:

- [ ] No lag or stuttering
- [ ] Animation is smooth
- [ ] No frame rate drops

- [ ] **Step 5: If everything looks good, commit**

```bash
git add -A
git commit -m "test: verify enhanced insertion line is more visible and prominent"
```

---

## Success Criteria

✅ Insertion line is thicker (5px instead of 2px)
✅ End dots/decorators are visible at both ends
✅ No glow effect - clean solid appearance
✅ Animation pulses with height scaling
✅ Very obvious and easy to see during dragging
✅ Build succeeds with no errors
✅ All drag scenarios work correctly
✅ No console errors
✅ Smooth animation performance
✅ Professional and polished appearance

---

## Visual Comparison

**Before:**

```
2px thin line with glow
Subtle pulsing opacity
```

**After:**

```
5px thick line with NO glow
Scaling animation (height changes)
8px circular dots at both ends
Much more prominent and visible
```
