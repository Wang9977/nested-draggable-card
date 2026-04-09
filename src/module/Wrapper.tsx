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
      const isMovingToGroup =
        hoverItem.isGroup === true &&
        (targetHasChildren || hoverItem.level === 2);
      const isMovingFromGroup = dragItem.level === 2;
      const isSameLevelReordering =
        dragItem.level === hoverItem.level &&
        dragItem.level === 1 &&
        dragItem.id !== hoverItem.id;
      // detect when moving from group (level 2) to root level (level 1)
      const isMovingOutOfGroup = isMovingFromGroup && hoverItem.level === 1;

      // NEW: detect when moving level 1 item INTO a group (identified by hoverItem.level === 2 && hoverItem.isGroup === true)
      // This handles the case when dragging a level 1 card above a level 2 card inside a group
      const isMovingL1ToGroupViaL2 =
        dragItem.level === 1 &&
        hoverItem.level === 2 &&
        hoverItem.isGroup === true;

      // Debug logging
      console.log("MOVE_CARD_CALLED:", {
        draggedCardId: dragItem.id,
        draggedCardLevel: dragItem.level,
        targetCardId: hoverItem.id,
        targetCardLevel: hoverItem.level,
        targetCardIsGroup: hoverItem.isGroup,
        targetHasChildren,
        isMovingToGroup,
        isMovingFromGroup,
        isSameLevelReordering,
        isMovingOutOfGroup,
        isMovingL1ToGroupViaL2,
        reason: isMovingToGroup
          ? "Moving to group"
          : isMovingL1ToGroupViaL2
          ? "Moving L1 to group via L2"
          : isSameLevelReordering
          ? "Same level reordering"
          : isMovingOutOfGroup
          ? "Moving out of group"
          : "Default case",
      });

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
        // Manually remove from group's children to avoid deleteCard logic
        // that would delete empty groups

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

        if (groupIndex > -1 && cardIndexInGroup > -1) {
          // Remove from group's children
          let cardsTmp = update(cards, {
            [groupIndex]: {
              children: {
                $splice: [[cardIndexInGroup, 1]],
              },
            },
          });

          // Auto-delete empty condition groups (type === 4)
          const groupAfterExtraction = cardsTmp[groupIndex];
          if (
            groupAfterExtraction.type === 4 &&
            (!groupAfterExtraction.children ||
              groupAfterExtraction.children.length === 0)
          ) {
            // Remove the empty condition group
            cardsTmp = update(cardsTmp, {
              $splice: [[groupIndex, 1]],
            });
          }

          // Insert at hover position in root level
          const hoverIdx = cardsTmp.findIndex(
            (card) => card.id === hoverItem.id
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
          } else {
            // If hover item not found, just append
            res = [...cardsTmp, dragItem.data];
          }
        } else {
          res = cards;
        }
      } else if (isMovingL1ToGroupViaL2) {
        // NEW CASE: Moving a level 1 card INTO a group, positioned relative to a level 2 card
        // Find which group contains the target level 2 card
        let groupIndex = -1;
        let cardIndexInGroup = -1;

        cards.forEach((card, idx) => {
          const childIndex = card.children?.findIndex(
            (c) => c.id === hoverItem.id
          );
          if (childIndex !== undefined && childIndex > -1) {
            groupIndex = idx;
            cardIndexInGroup = childIndex;
          }
        });

        console.log("ACTION: Merging L1 into group via L2", {
          groupIndex,
          cardIndexInGroup,
          isUpDrag: dragItem.isUpDrag,
        });

        if (groupIndex > -1) {
          // Remove the dragged item from root level
          let cardsTmp = deleteCard(cards, dragItem);

          // Find the new group index after deletion
          let newGroupIndex = cardsTmp.findIndex(
            (c) => c.id === cards[groupIndex].id
          );

          if (newGroupIndex > -1) {
            // Insert into the group
            // If isUpDrag is true, insert BEFORE the target card
            // If isUpDrag is false, insert AFTER the target card
            const insertPosition = dragItem.isUpDrag
              ? cardIndexInGroup
              : cardIndexInGroup + 1;

            res = update(cardsTmp, {
              [newGroupIndex]: {
                children: {
                  $splice: [[insertPosition, 0, dragItem.data]],
                },
              },
            });
          } else {
            res = cardsTmp;
          }
        } else {
          res = cards;
        }
      } else {
        let cardsTmp = deleteCard(cards, dragItem);

        if (isMovingToGroup) {
          const targetIdx = cardsTmp.findIndex((c) => c.id === hoverItem.id);
          if (targetIdx > -1) {
            // Ensure the target has a children array
            if (!cardsTmp[targetIdx].children) {
              cardsTmp[targetIdx].children = [];
            }
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
