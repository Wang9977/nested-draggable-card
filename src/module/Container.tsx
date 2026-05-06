import React from "react";
import Card from "./Card";
import { CardData } from "./ItemTypes";
import { DragItem, HoverItem } from "./types";

interface ContainerProps {
  level: number;
  pathPrefix: number[];
  maxLevel: number;
  newCards: CardData[];
  moveCard: (dragItem: DragItem, hoverItem: HoverItem) => void;
  deleteCard: (path: number[]) => void;
  convertToGroup: (path: number[]) => void;
  changeOperator: (path: number[]) => void;
  isReadOnly: boolean;
}

const Container: React.FC<ContainerProps> = ({
  level,
  pathPrefix,
  maxLevel,
  newCards,
  moveCard,
  deleteCard,
  convertToGroup,
  changeOperator,
  isReadOnly,
}) => (
  <div style={{ paddingLeft: level === 1 && newCards?.length > 1 ? 10 : 0 }}>
    {newCards?.map((card, i) => (
      <Card
        isReadOnly={isReadOnly}
        key={`${card.id}${i}`}
        data={card}
        level={level}
        path={[...pathPrefix, i]}
        maxLevel={maxLevel}
        idx={i}
        id={card.id}
        length={newCards?.length}
        moveCard={moveCard}
        deleteCard={deleteCard}
        convertToGroup={convertToGroup}
        changeOperator={changeOperator}
      />
    ))}
  </div>
);

export default Container;
