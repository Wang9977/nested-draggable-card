import React, { useRef, useCallback } from "react";
import { message } from "antd";
import styled from "styled-components";
import Container from "./Container";
import {
  CardPath,
  getNodeAtPath,
  getSubtreeHeight,
  initFirstCardOpt,
  insertNodeAtPath,
  removeNodeAtPath,
  updateNodeAtPath,
} from "./utils";
import { CardData } from "./ItemTypes";
import { DragItem, HoverItem } from "./types";

const WrapperContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

interface WrapperProps {
  cards: CardData[];
  setCards: React.Dispatch<React.SetStateAction<CardData[]>>;
  isReadOnly: boolean;
  maxLevel?: number;
}

const OPERATORS = {
  INTERSECT: "交",
  UNION: "并",
  DIFFERENCE: "差",
};

const adjustPathAfterRemoval = (
  targetPath: CardPath,
  removedPath: CardPath
): CardPath => {
  if (!targetPath.length || !removedPath.length) return targetPath;

  const depth = removedPath.length - 1;
  if (depth >= targetPath.length) return targetPath;

  const sharesParent = removedPath
    .slice(0, depth)
    .every((segment, idx) => targetPath[idx] === segment);

  if (!sharesParent) return targetPath;

  if (removedPath[depth] >= targetPath[depth]) {
    return targetPath;
  }

  const nextPath = [...targetPath];
  nextPath[depth] -= 1;
  return nextPath;
};

const getNextOperator = (operator?: string) =>
  operator === OPERATORS.INTERSECT
    ? OPERATORS.UNION
    : operator === OPERATORS.UNION
    ? OPERATORS.DIFFERENCE
    : OPERATORS.INTERSECT;

const Wrapper: React.FC<WrapperProps> = ({
  cards,
  setCards,
  isReadOnly,
  maxLevel = 3,
}) => {
  const groupId = useRef(1);

  const moveCard = useCallback(
    (dragItem: DragItem, hoverItem: HoverItem) => {
      if (dragItem.id === hoverItem.id) return;

      const isSameLevelMove = dragItem.level === hoverItem.level;
      const isMoveIntoDeeperLevel = dragItem.level + 1 === hoverItem.level;
      const isMoveToAncestorLevel = dragItem.level > hoverItem.level;
      const isGroupNesting =
        dragItem.isGroup &&
        hoverItem.isGroup &&
        isSameLevelMove &&
        !dragItem.isUpDrag;

      if (
        !isSameLevelMove &&
        !isMoveIntoDeeperLevel &&
        !isMoveToAncestorLevel &&
        !isGroupNesting
      ) {
        return;
      }

      if (isGroupNesting) {
        const deepestLevelAfterMove =
          hoverItem.level + getSubtreeHeight(dragItem.data);
        if (deepestLevelAfterMove > maxLevel) {
          message.warning(`超过设置的最大层级 ${maxLevel}，拖拽失败`);
          return;
        }
      }

      const { cards: cardsWithoutDrag, removed } = removeNodeAtPath(
        cards,
        dragItem.path
      );

      if (!removed) return;

      const adjustedHoverPath = adjustPathAfterRemoval(hoverItem.path, dragItem.path);
      const adjustedParentPath = adjustPathAfterRemoval(
        hoverItem.parentPath,
        dragItem.path
      );
      const nextCards = isGroupNesting
        ? updateNodeAtPath(cardsWithoutDrag, adjustedHoverPath, (card) => ({
            ...card,
            children: [...(card.children || []), removed],
          }))
        : insertNodeAtPath(
            cardsWithoutDrag,
            adjustedParentPath,
            dragItem.isUpDrag
              ? adjustedHoverPath[adjustedHoverPath.length - 1]
              : adjustedHoverPath[adjustedHoverPath.length - 1] + 1,
            removed
          );

      setCards(initFirstCardOpt(nextCards));
    },
    [cards, maxLevel, setCards]
  );

  const deleteCardHandler = useCallback(
    (path: number[]) => {
      const finalRes = removeNodeAtPath(cards, path).cards;
      setCards(initFirstCardOpt(finalRes));
    },
    [cards, setCards]
  );

  const convertToGroup = useCallback(
    (path: number[]) => {
      if (!getNodeAtPath(cards, path)) return;

      const newCards = updateNodeAtPath(cards, path, (card) => ({
        children: [card],
        operator: OPERATORS.INTERSECT,
        id: `group${groupId.current}`,
        isGroup: true,
        type: 4,
      }));

      groupId.current += 1;
      setCards(initFirstCardOpt(newCards));
    },
    [cards, setCards]
  );

  const changeOperator = useCallback(
    (path: number[]) => {
      const newCards = updateNodeAtPath(cards, path, (card) => ({
        ...card,
        operator: getNextOperator(card.operator),
      }));

      setCards(newCards);
    },
    [cards, setCards]
  );

  return (
    <WrapperContainer>
      <Container
        isReadOnly={isReadOnly}
        level={1}
        pathPrefix={[]}
        maxLevel={maxLevel}
        newCards={cards}
        moveCard={moveCard}
        deleteCard={deleteCardHandler}
        convertToGroup={convertToGroup}
        changeOperator={changeOperator}
      />
    </WrapperContainer>
  );
};

export default Wrapper;
