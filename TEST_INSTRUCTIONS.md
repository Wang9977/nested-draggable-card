# Manual Testing Instructions

## Setup
1. Open http://localhost:5173 in a browser
2. Browser DevTools should be open to monitor console for any errors

## Test Scenario 1: Add Initial Cards
1. Click "添加卡片" button 4 times to create 4 cards
   - Expected: You should have Card 1, Card 2, Card 3, Card 4 at the root level

## Test Scenario 2: Convert a Card to a Group
1. Hover over Card 2, click the "扩展" (expand) button
   - Expected: Card 2 becomes a group (显示 "条件组" as title) and moves from list to have a nested structure
   - Card 2 is now inside the group as the only child

## Test Scenario 3: Card ↔ Group Swap (Main Fix #1)
**Setup**: Card 1, Group(containing Card 2), Card 3, Card 4

1. Drag Card 1 down and position it **above** the Group
   - Expected visual: Red line appears above the Group
   - Expected result: When you release, Card 1 and Group should **swap positions**
   - After drop: Group, Card 1, Card 3, Card 4

2. Now drag Card 1 down and position it **below** the Group  
   - Expected visual: Red line appears below the Group
   - Expected result: When you release, Card 1 should move below the Group
   - After drop: Group, Card 3, Card 4, Card 1

## Test Scenario 4: Drag Card Out of Group (Main Fix #2)
**Setup**: Group(containing Card 2), Card 3, Card 4

1. Open the Group to see Card 2 inside it
2. Drag Card 2 **out of the group** and drop it **above** Card 3 (at root level)
   - Expected visual: Red line above Card 3 while dragging
   - Expected result: Card 2 should **move out of the group** to the root level
   - After drop: Group (now empty), Card 2, Card 3, Card 4
   - Expected: If the group becomes empty after Card 2 is removed, it might be deleted (depending on business logic)

## Test Scenario 5: Drag Card Into Group (if implemented)
**Setup**: Card 1, Group (with children), Card 3

1. Try dragging Card 1 down and dropping it **in the center/body** of the Group card
   - Note: Depending on the intended UX, this may not be supported
   - If it is supported: Card 1 should be added as a child of the Group

## Verification
- ✅ All drag-and-drop operations complete without errors
- ✅ Visual feedback (red lines) appears correctly
- ✅ Cards/groups move to their expected positions after drop
- ✅ No console errors related to drag-and-drop
- ✅ The "交/并/差" operators display correctly
- ✅ Deleting cards works as expected

