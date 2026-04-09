export interface CardData {
  id: string | number;
  name?: string;
  displayDef?: string;
  operator?: string;
  children?: CardData[];
  isGroup?: boolean;
  type?: number;
}

export interface DragItem {
  id: string | number;
  level: number;
  data: CardData;
  dragIndex: number;
  isGroup: boolean;
  ref: React.RefObject<HTMLDivElement> | null;
  dragBoundingRect: DOMRect | undefined;
  isUpDrag?: boolean;
}

export interface HoverItem {
  id: string | number;
  hoverIndex: number;
  isGroup: boolean;
  level: number;
}
