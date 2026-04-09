# Double Visual Feedback Fix - CORRECTED

## Problem

When dragging a card above a group, visual feedback appeared in TWO places simultaneously:

- Above the ConditionGroup (showing where it will be inserted into the group)
- Above the nested Card1 (wrong - duplicate feedback)

## Root Cause

When a group contains nested cards, BOTH the group's drop handler AND the nested card's drop handler respond to drops. Since both set their own `isInsertTop` state independently, both render visual feedback based on `isInsertTop && isOver`.

Additionally, level 2 card's drop handler was attempting to process drops of level 1 items, causing incorrect behavior.

## Solution (Two-Part Fix)

### Part 1: Drop Handler Logic (useCardDrag.ts)

Added check to prevent level 2 cards from handling level 1 item drops:

```typescript
drop: (item: DragItem, monitor) => {
  // ...

  // CRITICAL: Level 1 items should NOT be dropped on level 2 cards
  // They should only be dropped on level 1 cards or groups
  if (item.level === 1 && level === 2) {
    console.log(
      "SKIP DROP: Level 1 item dropped on level 2 card - parent will handle"
    );
    return;
  }

  // ... rest of drop logic
};
```

**Why this works:**

- Prevents nested card handlers from trying to process merges
- Only the group (level 1) processes the drop
- Card is correctly placed

### Part 2: Visual Feedback Suppression (Card.tsx)

Added logic to hide top feedback for level 2 cards:

```typescript
const shouldShowTopFeedback = useMemo(() => {
  if (level === 2 && isInsertTop) {
    // Suppress feedback for nested cards
    return false;
  }
  return isInsertTop && isOver;
}, [level, isInsertTop, isOver]);

// Then use shouldShowTopFeedback instead of (isInsertTop && isOver)
```

**Why this works:**

- Level 2 cards don't show feedback when dragging above them
- Only the parent group shows feedback
- Eliminates duplicate visual feedback

## Test Scenario

1. **Add Card1** → Click "添加卡片"
2. **Convert to Group** → Click "扩展" on Card1 (creates ConditionGroup with Card1 inside)
3. **Add Card2** → Click "添加卡片" (adds another card at root level)
4. **Drag Card2 BELOW ConditionGroup** (to merge into group)
   - Expected: One visual feedback appears below ConditionGroup (indicating insertion into group)
   - Card2 should merge INTO the group (becomes nested inside)
5. **Drag Card2 ABOVE ConditionGroup** (to reorder)
   - Expected: One visual feedback appears above ConditionGroup
   - Card2 should stay at root level, above the group

## Files Changed

- `src/module/useCardDrag.ts`:
  - Lines 109-115: Added check to skip level 2 handlers for level 1 items
- `src/module/Card.tsx`:
  - Lines 69-78: Added `shouldShowTopFeedback` memoized computation
  - Line 205: Changed `isInsertTop && isOver` to `shouldShowTopFeedback`

## Commits

- **73c01d0**: Fix double visual feedback by preventing level 2 handlers + suppressing nested feedback
- **9be8a3f**: Remove incorrect shallow drop target documentation

## Why the Previous "Shallow" Approach Failed

The `monitor.isOver({ shallow: true })` approach was too restrictive:

- It completely prevented the group's handler from detecting when the drag was over nested cards
- This prevented merging cards INTO groups (since the cursor is technically over the nested cards)
- While it prevented duplicate feedback, it broke core functionality

## Verification

Open DevTools console and drag cards:

```
DROP EVENT: {
  draggedCardId: "card-2",
  draggedCardLevel: 1,
  targetCardId: "group-1",
  isUpDragValue: false,  ← For merge (below), should be false
  isUpDragValue: true,   ← For reorder (above), should be true
  ...
}
```

You should NOT see:

```
SKIP DROP: Level 1 item dropped on level 2 card
```

(This log only appears if a level 2 card incorrectly tried to handle the drop - which shouldn't happen with this fix)
