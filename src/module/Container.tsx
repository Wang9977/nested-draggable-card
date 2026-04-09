import React from "react";
import Card from "./Card";
import { CardData } from "./ItemTypes";
import { DragItem, HoverItem } from "./types";

interface ContainerProps {
  level: number;
  newCards: CardData[];
  moveCard: (dragItem: DragItem, hoverItem: HoverItem) => void;
  deleteCard: (data: CardData) => void;
  convertToGroup: (data: CardData) => void;
  changeOperator: (data: CardData, operator?: string) => void;
  isReadOnly: boolean;
}

const Container: React.FC<ContainerProps> = ({
  level,
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
