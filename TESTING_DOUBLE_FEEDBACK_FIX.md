# TESTING GUIDE - Double Visual Feedback Fix

## What Was Fixed

**Problem:** When dragging Card2 above ConditionGroup1, visual feedback appeared in **two places**

- Above ConditionGroup (correct)
- Above Card1 inside group (duplicate - WRONG)

**Solution:**

1. Level 2 card's drop handler now skips processing level 1 item drops
2. Visual feedback for level 2 cards is suppressed when inserting at top
3. Only the group shows the feedback

## How to Test

### Setup

1. Open http://localhost:3000 in browser
2. Open DevTools: Press F12
3. Go to Console tab

### Test Case 1: Merge Card Into Group

**Scenario:** Drag Card2 into ConditionGroup, above Card1

Steps:

1. Click "添加卡片" (add Card1)
2. Click "扩展" on Card1 (convert to group - becomes ConditionGroup)
3. Click "添加卡片" again (add Card2 at root level)
4. Hold down mouse on Card2's drag handle (≡ icon)
5. Drag **downward and slightly over** ConditionGroup (towards the inside of the group)
6. Release the mouse

**Expected Result:**

- ✅ One visual feedback box appears
- ✅ Card2 merges INSIDE the group (below Card1 or as new level 2 card)
- ✅ Console shows "DROP EVENT" with `isUpDragValue: false`

**Check Console:**

```
DROP EVENT: {
  draggedCardId: "card-uuid-2",
  draggedCardLevel: 1,
  targetCardId: "group-uuid",
  targetIsGroup: true,
  isUpDragValue: false,    ← Key indicator: false = merge into group
  ...
}
```

### Test Case 2: Reorder Card Above Group

**Scenario:** Drag Card2 above ConditionGroup to reorder

Steps:

1. (Start from after Test Case 1, or repeat setup and add Card2)
2. Hold down mouse on Card2's drag handle
3. Drag **upward** to position ABOVE the ConditionGroup
4. Release the mouse

**Expected Result:**

- ✅ One visual feedback box appears (above ConditionGroup)
- ✅ Card2 stays at root level, ABOVE the group
- ✅ Console shows "DROP EVENT" with `isUpDragValue: true`

**Check Console:**

```
DROP EVENT: {
  draggedCardId: "card-uuid-2",
  draggedCardLevel: 1,
  targetCardId: "group-uuid",
  isUpDragValue: true,     ← Key indicator: true = insert above
  ...
}
```

### Test Case 3: NO "SKIP DROP" Messages

During ALL drag operations:

- You should **NOT** see the message: `"SKIP DROP: Level 1 item dropped on level 2 card"`
- This message would indicate a level 2 card incorrectly tried to handle the drop
- If you see it, the fix didn't work properly

**What to look for in console:**

```
❌ AVOID: "SKIP DROP: Level 1 item dropped on level 2 card"
✅ EXPECTED: "DROP EVENT" messages with proper targetLevel
```

## Visual Feedback Verification

### Before Fix (Two Feedback Boxes)

```
[Group Container]
 ├─ ┌─────────────────┐  ← Feedback box 1 (above ConditionGroup)
 │  │ ConditionGroup  │
 │  │ ┌─────────────┐ │
 │  │ │ ┌────────┐  │ │  ← Feedback box 2 (above Card1 - WRONG!)
 │  │ │ │ Card1  │  │ │
 │  │ │ └────────┘  │ │
 │  │ └─────────────┘ │
 │  └─────────────────┘
 └─ Card2 (being dragged)
```

### After Fix (One Feedback Box)

```
[Group Container]
 ├─ ┌─────────────────┐  ← Feedback box (above ConditionGroup) ✓
 │  │ ConditionGroup  │
 │  │ ┌─────────────┐ │
 │  │ │ Card1 (no   │ │  ← NO feedback box here ✓
 │  │ │ feedback)   │ │
 │  │ └─────────────┘ │
 │  └─────────────────┘
 └─ Card2 (being dragged)
```

## Troubleshooting

### Problem: Still seeing double feedback

- [ ] Refresh the browser (Ctrl+R or Cmd+R)
- [ ] Rebuild the app: `npm run build`
- [ ] Restart the dev server: Ctrl+C then `npm start`
- [ ] Check that changes were actually applied:
  ```bash
  git diff src/module/useCardDrag.ts
  ```
  Should show: `if (item.level === 1 && level === 2) return;`

### Problem: Card2 won't merge into group

- [ ] Check console for error messages
- [ ] Verify console shows `isUpDragValue: false` when dragging below group
- [ ] Make sure you're dragging INSIDE the group, not above it
- [ ] Verify the group was created correctly (should say "条件组" in title)

### Problem: Visual feedback in wrong location

- [ ] Feedback should appear at the insertion point (above or below target)
- [ ] For merging: feedback appears as part of the group container
- [ ] For reordering: feedback appears between cards at same level

## Expected Behavior Summary

| Scenario               | Feedback                  | Result            | Console                      |
| ---------------------- | ------------------------- | ----------------- | ---------------------------- |
| Drag Card2 above group | 1 box above group         | Card2 above group | `isUpDragValue: true`        |
| Drag Card2 into group  | 1 box inside group        | Card2 merges in   | `isUpDragValue: false`       |
| Drag within group      | 1 box in correct position | Card reordered    | Depends on position          |
| Extract from group     | 1 box at root level       | Card to root      | `isDraggingOutOfGroup: true` |

## Commit Information

**Main Fix:**

- Commit: `73c01d0`
- Files: `src/module/useCardDrag.ts`, `src/module/Card.tsx`
- Changes: Drop handler skip + visual feedback suppression

**What Changed:**

```typescript
// useCardDrag.ts - Added this check in drop handler
if (item.level === 1 && level === 2) {
  console.log(
    "SKIP DROP: Level 1 item dropped on level 2 card - parent will handle"
  );
  return;
}

// Card.tsx - Added this computed value
const shouldShowTopFeedback = useMemo(() => {
  if (level === 2 && isInsertTop) {
    return false;
  }
  return isInsertTop && isOver;
}, [level, isInsertTop, isOver]);

// Then use shouldShowTopFeedback instead of (isInsertTop && isOver)
```

## Success Criteria

When complete, you should be able to:

- ✅ Drag cards above groups without double feedback
- ✅ Drag cards into groups and see them merge
- ✅ See only ONE visual feedback box at any time
- ✅ Have cards placed in the correct position
- ✅ See no "SKIP DROP" messages in console (during normal operation)
- ✅ Extract cards from groups
- ✅ Reorder cards at same level

If all above are true: **Fix is working correctly!**
