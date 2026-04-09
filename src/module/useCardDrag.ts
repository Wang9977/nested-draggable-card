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
    drop: (item: DragItem) => {
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

      // Check if a level 2 card is being dragged OUT of this group
      // by checking if item.level === 2 and item is NOT moving to be inside a group
      const isDraggingOutOfGroup = item.level === 2 && !targetIsGroup;

      if (isDraggingOutOfGroup) {
        // Moving from inside group to root level
        onMove(item, {
          id: data.id,
          hoverIndex: idx,
          isGroup: false,
          level: 1,
        });
      } else if (targetIsGroup && targetHasChildren && !isUpDragValue) {
        // Only move INTO a group if dropping in the lower half (not at top edge)
        // This allows cards to be reordered at the same level by dropping at the top
        onMove(item, {
          id: data.id,
          hoverIndex: targetChildren.length,
          isGroup: true,
          level: 2,
        });
      } else {
        // Normal reordering at same level
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
