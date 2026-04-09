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
      // Prevent dropping groups
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
      if (item.isGroup) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      if (!hoverBoundingRect) return;

      const dragOffset = monitor.getDifferenceFromInitialOffset();
      if (!dragOffset) return;

      const floatItemY = dragOffset.y + (item.dragBoundingRect?.top || 0);
      const hoverMiddleY =
        (hoverBoundingRect.top + hoverBoundingRect.bottom) / 2;
      const isInserTop = floatItemY < hoverMiddleY;

      setIsInsertTop(isInserTop);
      item.isUpDrag = isInserTop;
    },
    drop: (item: DragItem, monitor) => {
      const targetChildren = data?.children;
      const targetHasChildren =
        Array.isArray(targetChildren) && targetChildren.length > 0;
      const targetIsGroup = isGroup || targetHasChildren;

      if (item.isGroup) return;

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

      // CRITICAL: When a level 1 item is dropped on a level 2 card (inside a group),
      // we should trigger a merge into the parent group, NOT reorder at level 2
      // This allows inserting level 1 items INSIDE groups, above existing nested cards
      if (item.level === 1 && level === 2 && isUpDragValue) {
        // Level 1 item dropped above a level 2 card
        // This should merge the item INTO the parent group, above this card
        console.log(
          "ACTION: Merging into parent group (level 1 on level 2 top)"
        );

        // Call with level 2 detail so parent can identify which card to insert before
        onMove(item, {
          id: data.id, // Reference the level 2 card being hovered
          hoverIndex: idx, // Position within the group
          isGroup: true, // Indicate this is going into a group
          level: 2, // Target is level 2 (inside group)
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
      } else if (targetIsGroup && !isUpDragValue && item.level === 1) {
        // Move INTO a group if:
        // 1. Target is a group
        // 2. Dropping in the lower half (not at top edge)
        // 3. The dragged item is level 1 (not already inside a group)
        // This allows merging cards into groups regardless of whether they already have children
        console.log("ACTION: Merging into group (revised)", {
          reason: "targetIsGroup && !isUpDragValue && item.level === 1",
          targetIsGroup,
          isUpDragValue,
          itemLevel: item.level,
        });
        onMove(item, {
          id: data.id,
          hoverIndex: targetChildren?.length || 0,
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
