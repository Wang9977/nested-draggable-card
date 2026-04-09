import update from "immutability-helper";
import { optTypeEnum, CardData } from "./ItemTypes";

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

export const deleteCard = (
  arr: CardData[],
  item: { id: string | number }
): CardData[] => {
  const outerIdx = arr.findIndex((card) => card.id === item.id);

  let res: CardData[] = [];
  if (outerIdx > -1) {
    res = update(arr, { $splice: [[outerIdx, 1]] });
  } else {
    const { outerIdx: outIdx, innerIdx: inIdx } = findArrayIndex(arr, item);
    if (outIdx < 0 || inIdx < 0) return arr;
    res = update(arr, {
      [outIdx]: {
        children: { $splice: [[inIdx, 1]] },
      },
    });
    if (res?.[outIdx]?.type === 4 && !res?.[outIdx]?.children?.length) {
      res = update(res, { $splice: [[outIdx, 1]] });
    }
  }
  return res;
};

export const initFirstCardOpt = (arr: CardData[]): CardData[] => {
  const res = arr.map((card, idx) => {
    const newCard = { ...card };
    if (idx === 0) {
      newCard.operator = "交";
    }
    if (newCard.children?.length) {
      newCard.children = newCard.children.map((child, cIdx) => ({
        ...child,
        operator: cIdx === 0 ? "交" : child.operator,
      }));
    }
    return newCard;
  });
  return res;
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
