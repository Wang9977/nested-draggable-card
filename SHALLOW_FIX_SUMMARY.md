# Fix Summary: Double Visual Feedback Issue

## What Was Broken

Dragging a card above a group showed visual feedback in TWO places:

1. Above the ConditionGroup (correct)
2. Above the nested Card1 inside the group (wrong)

## Why It Happened

When you convert Card1 to ConditionGroup1:

```
ConditionGroup1 (level 1, isGroup=true)
  └─ Card1 (level 2, inside group)
```

When dragging Card2 above this structure:

- ConditionGroup1's drop handler fires → shows feedback
- Card1's drop handler ALSO fires → shows duplicate feedback

Both handlers responded because `monitor.isOver()` returns true for ALL nested drop targets.

## The Fix

Changed three lines in `src/module/useCardDrag.ts`:

```typescript
// BEFORE
isOver: monitor.isOver(),
hover: (item, monitor) => { ... }
drop: (item) => { ... }

// AFTER
isOver: monitor.isOver({ shallow: true }),
hover: (item, monitor) => {
  if (!monitor.isOver({ shallow: true })) return;
  ...
}
drop: (item, monitor) => {
  if (!monitor.isOver({ shallow: true })) return;
  ...
}
```

The `{ shallow: true }` option tells react-dnd to only match the **direct** drop target, not nested ones.

## Result

✅ Only the intended drop handler fires
✅ Single visual feedback appears
✅ Card drops at correct position
✅ Nested drag-drop still works correctly

## Verification

1. Open browser DevTools (F12)
2. Go to Console tab
3. Perform the test scenario:
   - Add Card1
   - Convert to ConditionGroup
   - Add Card2
   - Drag Card2 above ConditionGroup
4. Look for logs:
   - Should see ONE `HOVER UPDATE` with `targetLevel: 1` (the group)
   - Should NOT see `HOVER UPDATE` with `targetLevel: 2` (nested card)
5. Release to drop
6. Verify Card2 is now above ConditionGroup

## Commit

```
277e1c8 Fix double visual feedback with shallow drop target matching
```

## Files Changed

- `src/module/useCardDrag.ts` - Applied shallow drop target matching
- `src/module/Card.tsx` - Added title attribute to feedback div (debugging)
