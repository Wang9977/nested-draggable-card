# Double Visual Feedback Fix - Testing Guide

## Summary of Fix

**Problem**: When dragging a card above a group containing nested cards, visual feedback appeared in TWO places simultaneously.

**Root Cause**: Both the parent group and the nested level 2 card had active drop handlers. React-DND's `monitor.isOver()` returns true for all nested drop targets, causing both to respond.

**Solution**: Use `monitor.isOver({ shallow: true })` in the drop handler to only match direct targets, preventing nested handlers from firing.

## Files Changed

- `src/module/useCardDrag.ts`:

  - Line 81: `collect` - Changed `monitor.isOver()` → `monitor.isOver({ shallow: true })`
  - Lines 87-89: `hover` - Added early return if not shallow match
  - Lines 116-118: `drop` - Added early return if not shallow match
  - Lines 102-111: Added detailed hover console logging
  - Line 147: Added `isDirectTarget` to drop console logging

- `src/module/Card.tsx`:
  - Line 202: Added `title` attribute to visual feedback div for debugging

## How to Test

### Test Scenario: Double Feedback Bug

This is the exact scenario that caused the bug:

1. **Add first card**

   - Click "添加卡片" button on the left panel
   - A new card appears (Card1)

2. **Convert to ConditionGroup**

   - Click "扩展" button on Card1
   - Card1 becomes a ConditionGroup with Card1 nested inside

3. **Add second card**

   - Click "添加卡片" button again
   - A new card appears at root level (Card2)

4. **Drag Card2 ABOVE ConditionGroup**

   - Grab the drag handle (≡ icon) on Card2
   - Drag it upward, positioning it ABOVE the ConditionGroup (not below)
   - ⚠️ **CRITICAL**: Drag to above the group, not inside it

5. **Observe Visual Feedback**

   - **Expected (with fix)**: ONE blue dashed box appears above ConditionGroup
   - **Before fix**: TWO dashed boxes appeared (one above ConditionGroup, one above Card1)

6. **Release the drag**
   - Drop Card2 above ConditionGroup
   - Verify Card2 is now at the top level, above ConditionGroup

### Verify with Console Logs

Open browser DevTools (F12) and check the Console tab:

**During hover while dragging:**

```
HOVER UPDATE: {
  itemId: <Card2 id>,
  itemLevel: 1,
  targetId: <ConditionGroup id>,
  targetLevel: 1,
  isGroup: true,
  isInserTop: true,
  isShallowMatch: true,  ← Should be TRUE
  timestamp: "..."
}
```

**You should NOT see:**

```
HOVER UPDATE: {
  targetLevel: 2,  ← Should NOT appear (would indicate Card1's handler fired)
  ...
}
```

**On drop:**

```
DROP EVENT: {
  draggedCardId: <Card2 id>,
  draggedCardLevel: 1,
  targetCardId: <ConditionGroup id>,
  isDirectTarget: true,  ← Should be TRUE
  ...
}
```

## Testing Checklist

- [ ] Build succeeds: `npm run build`
- [ ] App loads without errors
- [ ] Can add cards
- [ ] Can convert card to group (扩展)
- [ ] Single visual feedback appears when dragging above group
- [ ] Console shows only ONE HOVER UPDATE while dragging
- [ ] Card is placed at correct position after drop
- [ ] Can still drag cards into groups (below, not above)
- [ ] Can extract cards from groups (drag card from inside group to root level)
- [ ] Reordering cards at same level still works

## Expected Behavior After Fix

### Scenario 1: Drag above group (INSERT TOP)

- Only the group's drop handler fires
- Visual feedback shows only on the group
- Card is placed above the group

### Scenario 2: Drag below group (INSERT BELOW)

- Only the group's drop handler fires
- Card merges INTO the group

### Scenario 3: Reorder cards at same level

- Only the target card's handler fires
- Normal reordering behavior preserved

### Scenario 4: Extract card from group

- Level 2 card's handler fires when dragged to root
- Card is moved out of group to root level
- Group persists (or deletes if empty)

## If the Fix Doesn't Work

Check these things:

1. **React-DND version**: Must support `{ shallow: true }` option (react-dnd >= 11.1.0)

   ```bash
   npm list react-dnd
   ```

2. **Console logs**: Do you see `isShallowMatch: true` in HOVER UPDATE logs?

   - If `false`: The shallow option isn't working as expected
   - Check that the component is actually using the updated `useCardDrag` hook

3. **Multiple HOVER UPDATE entries**: If you see 2+ HOVER UPDATE logs for different target levels

   - This means nested handlers are still firing
   - Check that `shallow: true` was applied to both collect AND hover check

4. **Build cache**: Clear build cache and rebuild
   ```bash
   rm -rf node_modules/.cache
   npm start
   ```

## Technical Details

### Why `shallow: true` Works

- `monitor.isOver()` (without shallow) returns `true` if the item is over this drop target OR any nested drop target
- `monitor.isOver({ shallow: true })` returns `true` ONLY if the item is directly over this specific drop target
- In nested scenarios: When dragging above a group, only the group's handler gets `shallow: true`, not the nested card's handler
- This prevents nested handlers from responding to drops they shouldn't handle

### React-DND Drop Handler Execution

```
Drag operation starts
  ↓
Mouse moves over targets
  ↓
[Parent Group Handler] ← isOver: true, isOver({ shallow: true }): true ✓
[Nested Card Handler]  ← isOver: true, isOver({ shallow: true }): false ✗
  ↓
Only parent handler fires → Single visual feedback
```

## Commit Info

```
Fix double visual feedback with shallow drop target matching

- Use monitor.isOver({ shallow: true }) in drop handler collection
- Skip hover/drop processing for nested drop handlers
- Add comprehensive console logging
- Remove failed fix attempt
```

Commit: 277e1c8
