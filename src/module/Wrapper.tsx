import React, { useRef, useCallback } from "react";
import update from "immutability-helper";
import Container from "./Container";
import { deleteCard, initFirstCardOpt } from "./utils";
import { CardData } from "./ItemTypes";
import { DragItem, HoverItem } from "./types";

interface WrapperProps {
  cards: CardData[];
  setCards: React.Dispatch<React.SetStateAction<CardData[]>>;
  isReadOnly: boolean;
}

const OPERATORS = {
  INTERSECT: "交",
  UNION: "并",
  DIFFERENCE: "差",
};

const Wrapper: React.FC<WrapperProps> = ({ cards, setCards, isReadOnly }) => {
  const groupId = useRef(1);

  const moveCard = useCallback(
    (
      dragItem: DragItem,
      hoverItem: HoverItem & { id: string | number; level?: number }
    ) => {
      let res: CardData[] = [];

      const targetCard = cards.find((c) => c.id === hoverItem.id);
      const targetHasChildren = !!(targetCard as any)?.children?.length;
      const isMovingToGroup = targetHasChildren;
      const isMovingFromGroup = dragItem.level === 2;
      const isSameLevelReordering =
        dragItem.level === hoverItem.level &&
        dragItem.level === 1 &&
        dragItem.id !== hoverItem.id;
      // New: detect when moving from group (level 2) to root level (level 1)
      const isMovingOutOfGroup = isMovingFromGroup && hoverItem.level === 1;

      // For same-level reordering, we need to handle it differently to avoid deletion
      if (isSameLevelReordering) {
        const dragIdx = cards.findIndex((c) => c.id === dragItem.id);
        const hoverIdx = cards.findIndex((c) => c.id === hoverItem.id);

        if (dragIdx > -1 && hoverIdx > -1) {
          // Remove the dragged item
          const cardsWithoutDrag = update(cards, { $splice: [[dragIdx, 1]] });
          // Insert at new position
          const insertIdx =
            dragIdx < hoverIdx
              ? dragItem.isUpDrag
                ? hoverIdx - 1
                : hoverIdx
              : dragItem.isUpDrag
              ? hoverIdx
              : hoverIdx + 1;
          res = update(cardsWithoutDrag, {
            $splice: [[insertIdx, 0, dragItem.data]],
          });
        } else {
          res = cards;
        }
      } else if (isMovingOutOfGroup) {
        // Moving from group (level 2) to root level (level 1)
        // Need to manually remove from group without deleting the group itself

        console.log("[EXTRACT_FROM_GROUP] Starting extraction");
        console.log("[EXTRACT_FROM_GROUP] dragItem:", dragItem);
        console.log("[EXTRACT_FROM_GROUP] hoverItem:", hoverItem);
        console.log("[EXTRACT_FROM_GROUP] Current cards:", cards);

        // Find which group contains this card
        let groupIndex = -1;
        let cardIndexInGroup = -1;

        cards.forEach((card, idx) => {
          const childIndex = card.children?.findIndex(
            (c) => c.id === dragItem.id
          );
          if (childIndex !== undefined && childIndex > -1) {
            groupIndex = idx;
            cardIndexInGroup = childIndex;
          }
        });

        console.log(
          "[EXTRACT_FROM_GROUP] Found at groupIndex:",
          groupIndex,
          "cardIndexInGroup:",
          cardIndexInGroup
        );

        if (groupIndex > -1 && cardIndexInGroup > -1) {
          // Remove from group's children
          let cardsTmp = update(cards, {
            [groupIndex]: {
              children: {
                $splice: [[cardIndexInGroup, 1]],
              },
            },
          });

          console.log(
            "[EXTRACT_FROM_GROUP] After removing from group:",
            cardsTmp
          );

          // Insert at hover position in root level
          const hoverIdx = cardsTmp.findIndex(
            (card) => card.id === hoverItem.id
          );
          console.log(
            "[EXTRACT_FROM_GROUP] hoverIdx in root:",
            hoverIdx,
            "hoverItem.id:",
            hoverItem.id
          );

          if (hoverIdx > -1) {
            res = update(cardsTmp, {
              $splice: [
                [
                  dragItem?.isUpDrag ? hoverIdx : hoverIdx + 1,
                  0,
                  dragItem.data,
                ],
              ],
            });
            console.log("[EXTRACT_FROM_GROUP] After inserting at root:", res);
          } else {
            // If hover item not found, just append
            res = [...cardsTmp, dragItem.data];
            console.log("[EXTRACT_FROM_GROUP] Appended to root:", res);
          }
        } else {
          res = cards;
          console.log(
            "[EXTRACT_FROM_GROUP] Not found in groups, keeping cards as is"
          );
        }
      } else {
        let cardsTmp = deleteCard(cards, dragItem);

        if (isMovingToGroup) {
          const targetIdx = cardsTmp.findIndex((c) => c.id === hoverItem.id);
          if (targetIdx > -1 && cardsTmp[targetIdx]?.children) {
            res = update(cardsTmp, {
              [targetIdx]: {
                children: {
                  $push: [dragItem.data],
                },
              },
            });
          } else {
            res = cardsTmp;
          }
        } else if (isMovingFromGroup) {
          res = [...cardsTmp, dragItem.data];
        } else {
          const idx = cardsTmp.findIndex((card) => card.id === hoverItem.id);
          res = update(cardsTmp, {
            $splice: [[dragItem?.isUpDrag ? idx : idx + 1, 0, dragItem.data]],
          });
        }
      }

      const finalRes = initFirstCardOpt(res);
      setCards(finalRes);
    },
    [cards, setCards]
  );

  const deleteCardHandler = useCallback(
    (item: CardData) => {
      const finalRes = deleteCard(cards, item);
      setCards(initFirstCardOpt(finalRes));
    },
    [cards, setCards]
  );

  const convertToGroup = useCallback(
    (item: CardData) => {
      const newCards = cards.map((card) => {
        if (card.id === item.id) {
          return {
            children: [item],
            operator: OPERATORS.INTERSECT,
            id: `group${groupId.current}`,
            isGroup: true,
            type: 4,
          };
        }
        return card;
      });
      groupId.current += 1;
      setCards(newCards);
    },
    [cards, setCards]
  );

  const changeOperator = useCallback(
    (item: CardData) => {
      const nextOperator =
        item.operator === OPERATORS.INTERSECT
          ? OPERATORS.UNION
          : item.operator === OPERATORS.UNION
          ? OPERATORS.DIFFERENCE
          : OPERATORS.INTERSECT;

      const newCards = cards.map((card) => {
        if (card?.id === item.id) {
          return { ...card, operator: nextOperator };
        }
        const children = card.children?.map((child) => {
          if (child?.id === item.id) {
            return { ...child, operator: nextOperator };
          }
          return child;
        });
        return { ...card, children };
      });
      setCards(newCards);
    },
    [cards, setCards]
  );

  return (
    <div>
      <Container
        isReadOnly={isReadOnly}
        level={1}
        newCards={cards}
        moveCard={moveCard}
        deleteCard={deleteCardHandler}
        convertToGroup={convertToGroup}
        changeOperator={changeOperator}
      />
    </div>
  );
};

export default Wrapper;
