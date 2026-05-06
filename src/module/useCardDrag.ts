import { useDrag, useDrop } from "react-dnd";
import { useState, useRef, RefObject } from "react";
import { ItemTypes, CardData } from "./ItemTypes";
import { DragItem, HoverItem } from "./types";

interface UseCardDragProps {
  id: string | number;
  level: number;
  path: number[];
  idx: number;
  data: CardData;
  isReadOnly: boolean;
  maxLevel: number;
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
  path,
  idx,
  data,
  isReadOnly,
  maxLevel,
  onMove,
}: UseCardDragProps): UseCardDragReturn => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInsertTop, setIsInsertTop] = useState<boolean | null>(null);

  const isGroup = !!data?.children?.length;
  const parentPath = path.slice(0, -1);

  const [{ isDragging }, drag, preview] = useDrag({
    type: isGroup ? ItemTypes.GROUP : ItemTypes.CARD,
    item: (): DragItem => ({
      id,
      level,
      path,
      parentPath,
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

  const [{ handlerId, isOverCurrent, canDrop: canDropState }, drop] = useDrop({
    accept: [ItemTypes.CARD, ItemTypes.GROUP],
    canDrop: (item: DragItem) => {
      if (item.id === id) return false;

      if (item.isGroup) {
        if (item.level === level) {
          return true;
        }

        if (item.level > level) {
          return true;
        }

        return false;
      }

      if (item.level === level) {
        return true;
      }

      if (item.level > level) {
        return true;
      }

      if (item.level < level) {
        return item.level < maxLevel;
      }

      return false;
    },
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
      isOverCurrent: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
    hover: (item: DragItem, monitor) => {
      if (!monitor.canDrop()) return;
      if (!monitor.isOver({ shallow: true })) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      if (!hoverBoundingRect) return;

      const dragOffset = monitor.getDifferenceFromInitialOffset();
      if (!dragOffset) return;

      const floatItemY = dragOffset.y + (item.dragBoundingRect?.top || 0);
      const hoverMiddleY =
        (hoverBoundingRect.top + hoverBoundingRect.bottom) / 2;
      const nextIsInsertTop = floatItemY < hoverMiddleY;

      setIsInsertTop(nextIsInsertTop);
      item.isUpDrag = nextIsInsertTop;
    },
    drop: (item, monitor) => {
      if (!monitor.canDrop()) return;
      if (!monitor.isOver({ shallow: true })) return;

      item.isUpDrag = isInsertTop !== null ? isInsertTop : item.isUpDrag;

      onMove(item, {
        id: data.id,
        path,
        parentPath,
        hoverIndex: idx,
        isGroup,
        level,
      });
    },
  });

  return {
    ref,
    dragRef: !isReadOnly ? drag : null,
    previewRef: !isReadOnly ? preview : null,
    dropRef: !isReadOnly ? drop : null,
    isDragging,
    isInsertTop,
    isOver: isOverCurrent,
    canDrop: canDropState || false,
    handlerId,
    isGroup,
  };
};
