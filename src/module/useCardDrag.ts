import { useDrag, useDrop } from "react-dnd";
import { useState, useRef, RefObject } from "react";
import { ItemTypes, CardData } from "./ItemTypes";
import { DragItem, HoverItem } from "./types";

interface UseCardDragProps {
  id: string | number;
  level: number;
  idx: number;
  data: CardData;
  isReadOnly: boolean;
  onMove: (dragItem: DragItem, hoverItem: HoverItem) => void;
}

interface UseCardDragReturn {
  ref: RefObject<HTMLDivElement>;
  dragRef: any;
  previewRef: any;
  dropRef: any;
  isDragging: boolean;
  isInsertTop: boolean | null;
  isOver: boolean;
  canDrop: boolean;
  handlerId: string | symbol | null;
  isGroup: boolean;
}

export const useCardDrag = ({
  id,
  level,
  idx,
  data,
  isReadOnly,
  onMove,
}: UseCardDragProps): UseCardDragReturn => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInsertTop, setIsInsertTop] = useState<boolean | null>(null);

  const isGroup = !!data?.children?.length;

  const [{ isDragging }, drag, preview] = useDrag({
    type: isGroup ? ItemTypes.GROUP : ItemTypes.CARD,
    item: (): DragItem => ({
      id,
      level,
      data,
      dragIndex: idx,
      isGroup,
      ref,
      dragBoundingRect: ref?.current?.getBoundingClientRect(),
    }),
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [{ handlerId, isOver, canDrop: canDropState }, drop] = useDrop({
    accept: [ItemTypes.CARD, ItemTypes.GROUP],
    canDrop: (item: DragItem) => {
      // Allow groups to be reordered at level 1 (root level)
      if (item.isGroup && level === 1) {
        return true;
      }

      // Prevent dropping groups anywhere else (e.g., inside other groups)
      if (item.isGroup) return false;

      // Root level card can be dropped on:
      // 1. Other root level cards (same level reordering)
      // 2. Groups (merging)
      if (item.level === 1) {
        return true;
      }

      // Level 2 card (inside a group) can be dropped on:
      // 1. Root level cards (extracting)
      // 2. Same level items (reordering within group)
      if (item.level === 2) {
        return level === 1 || level === 2;
      }

      return false;
    },
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    hover: (item: DragItem, monitor) => {
      // Allow hover processing for groups at level 1
      if (item.isGroup && level !== 1) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      if (!hoverBoundingRect) return;

      const dragOffset = monitor.getDifferenceFromInitialOffset();
      if (!dragOffset) return;

      // CRITICAL: Only show hover feedback on appropriate targets:
      // - If dragging level 1 item to a group at level 1, only the group or internal cards should show
      // - If dragging level 1 item to level 2 cards, only level 2 cards should show
      // - This prevents double feedback when dragging into groups
      const targetChildren = data?.children;
      const targetHasChildren =
        Array.isArray(targetChildren) && targetChildren.length > 0;
      const targetIsGroup = isGroup || targetHasChildren;

      // When dragging level 1 item into a level 1 group, don't show feedback on the group itself
      // (Wait for feedback on internal cards instead)
      // Exception: If group is empty, show feedback on the group
      if (
        item.level === 1 &&
        level === 1 &&
        targetIsGroup &&
        targetHasChildren
      ) {
        // This is a group with children, skip hover feedback here
        // The children will show the feedback
        return;
      }

      const floatItemY = dragOffset.y + (item.dragBoundingRect?.top || 0);
      const hoverMiddleY =
        (hoverBoundingRect.top + hoverBoundingRect.bottom) / 2;
      const isInserTop = floatItemY < hoverMiddleY;

      setIsInsertTop(isInserTop);
      item.isUpDrag = isInserTop;
    },
    drop: (item: DragItem, monitor) => {
      // Handle group-to-group reordering at level 1
      if (item.isGroup && level === 1) {
        console.log("DROP EVENT: Group reordering at level 1", {
          draggedGroupId: item.id,
          targetGroupId: data.id,
          isUpDrag: item.isUpDrag,
        });

        // Use same reordering logic as cards
        onMove(item, {
          id: data.id,
          hoverIndex: idx,
          isGroup: true,
          level: 1,
        });
        return;
      }

      // Prevent dropping groups anywhere else
      if (item.isGroup) return;

      const targetChildren = data?.children;
      const targetHasChildren =
        Array.isArray(targetChildren) && targetChildren.length > 0;
      const targetIsGroup = isGroup || targetHasChildren;

      // Use the local isInsertTop state which is the most recent hover state
      // This ensures we have the correct direction even if drop fires at a different time
      const isUpDragValue = isInsertTop !== null ? isInsertTop : item.isUpDrag;

      // Update the item to ensure it has the correct isUpDrag value
      item.isUpDrag = isUpDragValue;

      console.log("DROP EVENT:", {
        draggedCardId: item.id,
        draggedCardLevel: item.level,
        targetCardId: data.id,
        targetData: data,
        targetIsGroup,
        targetHasChildren,
        isGroup,
        level,
        targetChildrenCount: targetChildren?.length || 0,
        isUpDragValue,
        idx,
        timestamp: new Date().toISOString(),
      });

      // When a level 1 item is dropped on/around a level 2 card,
      // we need to merge it into the parent group.
      // This handles both above and below cases.
      if (item.level === 1 && level === 2) {
        console.log(
          `[HANDLE DROP] Level 1 item on level 2 card - merge into parent group`
        );
        // Call moveCard to trigger the group merge logic
        // Pass the index of this card as hoverIndex, which will be used to find the position in the group
        onMove(item, {
          id: data.id,
          hoverIndex: idx, // Index of the target card in its parent group
          isGroup: true,
          level: 2,
        });
        return;
      }

      // CRITICAL: When a level 1 card is dropped on/around a level 1 group,
      // treat it as reordering (not merging). Both stay at level 1.
      if (item.level === 1 && level === 1 && targetIsGroup) {
        console.log(
          "ACTION: Level 1 card reordering with level 1 group (not merging)",
          {
            reason:
              "When dropping level 1 on level 1 group, reorder don't merge",
            draggedCardId: item.id,
            targetGroupId: data.id,
            isUpDragValue,
          }
        );
        onMove(item, {
          id: data.id,
          hoverIndex: idx,
          isGroup: false, // Keep it at level 1, don't merge
          level: 1,
        });
        return;
      }

      // Check if a level 2 card is being dragged OUT of this group
      // by checking if item.level === 2 and item is NOT moving to be inside a group
      const isDraggingOutOfGroup = item.level === 2 && !targetIsGroup;

      // NEW: Also check when level 2 item is dragged to below a group (at level 1)
      // This means extracting from parent group and placing below it
      const isDraggingOutOfGroupToLevel1Below =
        item.level === 2 && level === 1 && !isUpDragValue && isGroup;

      if (isDraggingOutOfGroup) {
        // Moving from inside group to root level
        console.log("ACTION: Extracting from group");
        onMove(item, {
          id: data.id,
          hoverIndex: idx,
          isGroup: false,
          level: 1,
        });
      } else if (isDraggingOutOfGroupToLevel1Below) {
        // Level 2 item dragged below a level 1 group (extracting and placing after group)
        console.log("ACTION: Extracting from group to below it");
        onMove(item, {
          id: data.id,
          hoverIndex: idx,
          isGroup: false,
          level: 1,
        });
      } else if (targetIsGroup && item.level === 1) {
        // Move INTO a group if:
        // 1. Target is a group
        // 2. The dragged item is level 1 (not already inside a group)
        // This allows merging cards into groups regardless of drop position
        console.log("ACTION: Merging into group", {
          reason: "targetIsGroup && item.level === 1",
          targetIsGroup,
          isUpDragValue,
          itemLevel: item.level,
        });
        onMove(item, {
          id: data.id,
          hoverIndex: isUpDragValue ? 0 : targetChildren?.length || 0,
          isGroup: true,
          level: 2,
        });
      } else {
        // Normal reordering at same level
        console.log("ACTION: Normal reordering", {
          reason: "Neither merge nor extract condition met",
          targetIsGroup,
          isUpDragValue,
          isDraggingOutOfGroup,
          itemLevel: item.level,
          targetLevel: item.level === 2 && !targetIsGroup ? 2 : 1,
        });
        const targetLevel = item.level === 2 && !targetIsGroup ? 2 : 1;
        onMove(item, {
          id: data.id,
          hoverIndex: idx,
          isGroup: targetIsGroup,
          level: targetLevel,
        });
      }
    },
  });

  return {
    ref,
    dragRef: !isReadOnly ? drag : null,
    previewRef: !isReadOnly ? preview : null,
    dropRef: !isReadOnly ? drop : null,
    isDragging,
    isInsertTop,
    isOver,
    canDrop: canDropState || false,
    handlerId,
    isGroup,
  };
};
