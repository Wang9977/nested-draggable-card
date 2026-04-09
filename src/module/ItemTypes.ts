export enum ItemTypes {
  CARD = "card",
  GROUP = "group",
}

export interface CardData {
  id: string | number;
  name?: string;
  displayDef?: string;
  operator?: string;
  children?: CardData[];
  isGroup?: boolean;
  type?: number;
}

export interface OptType {
  type: number;
  name: string;
  calcType: string;
}

export const optTypeEnum: Record<string, OptType> = {
  交: { type: 1, name: "交", calcType: "AND" },
  并: { type: 1, name: "并", calcType: "OR" },
  差: { type: 1, name: "差", calcType: "NOT" },
};
