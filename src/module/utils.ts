import update from "immutability-helper";
import { optTypeEnum, CardData } from "./ItemTypes";

export type CardPath = number[];

const ROOT_OPERATOR = "交";

const isEmptyGroup = (card?: CardData) =>
  !!card && card.type === 4 && (!card.children || card.children.length === 0);

const cleanEmptyGroups = (cards: CardData[]): CardData[] =>
  cards.reduce<CardData[]>((result, card) => {
    const nextChildren = card.children ? cleanEmptyGroups(card.children) : undefined;
    const nextCard = nextChildren ? { ...card, children: nextChildren } : card;

    if (!isEmptyGroup(nextCard)) {
      result.push(nextCard);
    }

    return result;
  }, []);

export const isSamePath = (pathA: CardPath, pathB: CardPath): boolean =>
  pathA.length === pathB.length && pathA.every((segment, idx) => segment === pathB[idx]);

export const getNodeAtPath = (
  cards: CardData[],
  path: CardPath
): CardData | null => {
  let currentList = cards;
  let currentNode: CardData | null = null;

  for (const index of path) {
    currentNode = currentList[index] || null;
    if (!currentNode) return null;
    currentList = currentNode.children || [];
  }

  return currentNode;
};

export const updateNodeAtPath = (
  cards: CardData[],
  path: CardPath,
  updater: (card: CardData) => CardData
): CardData[] => {
  if (!path.length) return cards;

  const [index, ...rest] = path;
  return cards.map((card, idx) => {
    if (idx !== index) return card;
    if (!rest.length) return updater(card);

    return {
      ...card,
      children: updateNodeAtPath(card.children || [], rest, updater),
    };
  });
};

export const updateListAtPath = (
  cards: CardData[],
  path: CardPath,
  updater: (list: CardData[]) => CardData[]
): CardData[] => {
  if (!path.length) {
    return updater(cards);
  }

  const [index, ...rest] = path;
  return cards.map((card, idx) => {
    if (idx !== index) return card;

    return {
      ...card,
      children: updateListAtPath(card.children || [], rest, updater),
    };
  });
};

export const removeNodeAtPath = (
  cards: CardData[],
  path: CardPath
): { cards: CardData[]; removed: CardData | null } => {
  if (!path.length) {
    return { cards, removed: null };
  }

  const [index, ...rest] = path;

  if (!rest.length) {
    const removed = cards[index] || null;
    return {
      cards: cleanEmptyGroups(update(cards, { $splice: [[index, 1]] })),
      removed,
    };
  }

  const current = cards[index];
  if (!current?.children) {
    return { cards, removed: null };
  }

  const next = removeNodeAtPath(current.children, rest);
  const updatedCards = cards.map((card, idx) =>
    idx === index ? { ...card, children: next.cards } : card
  );

  return { cards: cleanEmptyGroups(updatedCards), removed: next.removed };
};

export const insertNodeAtPath = (
  cards: CardData[],
  parentPath: CardPath,
  index: number,
  item: CardData
): CardData[] =>
  updateListAtPath(cards, parentPath, (list) => {
    const nextList = [...list];
    nextList.splice(index, 0, item);
    return nextList;
  });

export const getSubtreeHeight = (card: CardData): number => {
  if (!card.children?.length) {
    return 1;
  }

  return (
    1 +
    Math.max(...card.children.map((child) => getSubtreeHeight(child)))
  );
};

export const findArrayIndex = (
  arr: CardData[],
  item: { id: string | number }
) => {
  let outerIdx = -1;
  let innerIdx = -1;
  arr.forEach((card, i) => {
    const idx = card?.children?.findIndex((c) => c.id === item.id);
    if (idx !== undefined && idx > -1) {
      outerIdx = i;
      innerIdx = idx;
    }
  });
  return { outerIdx, innerIdx };
};

export const findPathById = (
  cards: CardData[],
  id: string | number,
  currentPath: CardPath = []
): CardPath | null => {
  for (let index = 0; index < cards.length; index += 1) {
    const card = cards[index];
    const path = [...currentPath, index];
    if (card.id === id) {
      return path;
    }
    if (card.children?.length) {
      const nestedPath = findPathById(card.children, id, path);
      if (nestedPath) {
        return nestedPath;
      }
    }
  }

  return null;
};

export const deleteCard = (
  arr: CardData[],
  item: { id: string | number }
): CardData[] => {
  const path = findPathById(arr, item.id);
  if (!path) return arr;

  return removeNodeAtPath(arr, path).cards;
};

export const initFirstCardOpt = (arr: CardData[]): CardData[] => {
  return arr.map((card, idx) => ({
    ...card,
    operator: idx === 0 ? ROOT_OPERATOR : card.operator,
    children: card.children?.length ? initFirstCardOpt(card.children) : card.children,
  }));
};

export const deleteCardItem = (
  cards: CardData[],
  item: { id: string | number }
): CardData[] => {
  const res = deleteCard(cards, item);
  return initFirstCardOpt(res);
};

export const formatCardsToEnd = (cards: CardData[]) => {
  const result: CardData[] = [];
  cards.forEach((card, index) => {
    if (card.type === 2) {
      result.push(card);
      if (index + 1 < cards.length) {
        result.push(
          optTypeEnum[cards[index + 1].operator || "交"] as unknown as CardData
        );
      }
    } else if (card.type === 4) {
      const children: CardData[] = [];
      card.children?.forEach((c, i) => {
        if (c.type === 2) {
          children.push(c);
          if (i + 1 < card.children!.length) {
            children.push(
              optTypeEnum[
                card.children![i + 1].operator || "交"
              ] as unknown as CardData
            );
          }
        }
      });
      result.push({ ...card, children } as CardData);
      if (index + 1 < cards.length) {
        result.push(
          optTypeEnum[cards[index + 1].operator || "交"] as unknown as CardData
        );
      }
    }
  });
  return result;
};
