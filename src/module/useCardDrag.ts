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
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
    hover: (item: DragItem, monitor) => {
      if (item.isGroup) return;

      // Only process hover if this is a shallow (direct) match, not from nested children
      const isShallowMatch = monitor.isOver({ shallow: true });
      if (!isShallowMatch) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      if (!hoverBoundingRect) return;

      const dragOffset = monitor.getDifferenceFromInitialOffset();
      if (!dragOffset) return;

      const floatItemY = dragOffset.y + (item.dragBoundingRect?.top || 0);
      const hoverMiddleY =
        (hoverBoundingRect.top + hoverBoundingRect.bottom) / 2;
      const isInserTop = floatItemY < hoverMiddleY;

      console.log("HOVER UPDATE:", {
        itemId: item.id,
        itemLevel: item.level,
        targetId: data.id,
        targetLevel: level,
        isGroup,
        isInserTop,
        isShallowMatch,
        timestamp: new Date().toISOString(),
      });

      setIsInsertTop(isInserTop);
      item.isUpDrag = isInserTop;
    },
    drop: (item: DragItem, monitor) => {
      // Only process drop if this is a shallow (direct) match, not from nested children
      if (!monitor.isOver({ shallow: true })) return;

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

      // Debug logs
      console.log("DROP EVENT:", {
        draggedCardId: item.id,
        draggedCardLevel: item.level,
        targetCardId: data.id,
        targetData: data,
        targetIsGroup,
        targetHasChildren,
        isGroup,
        targetChildrenCount: targetChildren?.length || 0,
        isUpDragValue,
        idx,
        timestamp: new Date().toISOString(),
        isDirectTarget: monitor.isOver({ shallow: true }),
      });

      // Check if a level 2 card is being dragged OUT of this group
      // by checking if item.level === 2 and item is NOT moving to be inside a group
      const isDraggingOutOfGroup = item.level === 2 && !targetIsGroup;

      if (isDraggingOutOfGroup) {
        // Moving from inside group to root level
        console.log("ACTION: Extracting from group");
        onMove(item, {
          id: data.id,
          hoverIndex: idx,
          isGroup: false,
          level: 1,
        });
      } else if (targetIsGroup && !isUpDragValue) {
        // Move INTO a group if dropping in the lower half (not at top edge)
        // This allows merging cards into groups regardless of whether they already have children
        console.log("ACTION: Merging into group (revised)", {
          reason: "targetIsGroup && !isUpDragValue",
          targetIsGroup,
          isUpDragValue,
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
