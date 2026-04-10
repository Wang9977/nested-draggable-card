import React, { useRef, useMemo } from "react";
import { Button, Card as AntdCard, Popconfirm, Tag } from "antd";
import {
  HolderOutlined,
  ExpandOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import Container from "./Container";
import { useCardDrag } from "./useCardDrag";
import { CardData } from "./ItemTypes";
import { DragItem, HoverItem } from "./types";
import { theme } from "../styles/tokens";
import { animations } from "../styles/responsive";

const { Meta } = AntdCard;

// Styled Components
const OpStyle = styled(Tag)`
  position: absolute;
  left: -10px;
  top: -10px;
  z-index: 10;
`;

const Main = styled.div`
  display: flex;
`;

const LeftDiv = styled.div`
  width: 15px;
`;

const RightDiv = styled.div`
  flex: 1;
  margin-bottom: ${theme.spacing.sm};
  position: relative;

  .ant-card {
    border-radius: ${theme.borderRadius.lg};
  }

  .ant-card-head {
    border-bottom: none;
    min-height: auto;
    padding: ${theme.spacing.md} ${theme.spacing.lg};
  }

  .ant-card-body {
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.fontSize.xs};
  }
`;

const CardMain = styled(AntdCard)`
  && {
    .ant-card-head {
      border-bottom: none;
      min-height: auto;
      padding: ${theme.spacing.md} ${theme.spacing.lg};
    }

    .ant-card-body {
      padding: ${theme.spacing.md} ${theme.spacing.lg};
      color: ${theme.colors.text.secondary};
      font-size: ${theme.typography.fontSize.xs};
    }
  }
`;

const CardMainHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardMainHeaderTitle = styled.div`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
`;

const DragIcon = styled.div`
  margin-right: ${theme.spacing.md};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.base};
  cursor: move;
  transition: ${theme.transitions.color};

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const CardMainHeaderOpt = styled.div`
  display: flex;
  align-items: center;
`;

const CardMainDes = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.xs};
`;

const ShadowZone = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: ${theme.zIndex.drag};
`;

const ShadowContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: ${theme.colors.dragFeedbackBg};
  border: 2px dashed ${theme.colors.dragFeedbackBorder};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: inset 0 0 0 1px rgba(22, 119, 255, 0.2);
`;

const CardWrapper = styled.div`
  position: relative;
  margin-bottom: ${theme.spacing.md};
  ${animations.fadeIn}

  &:hover {
    .dragIcon {
      color: ${theme.colors.primary};
    }
  }
`;

interface CardProps {
  data: CardData;
  level: number;
  idx: number;
  id: string | number;
  length: number;
  moveCard: (dragItem: DragItem, hoverItem: HoverItem) => void;
  deleteCard: (data: CardData) => void;
  convertToGroup: (data: CardData) => void;
  changeOperator: (data: CardData, operator?: string) => void;
  isReadOnly: boolean;
}

const Card: React.FC<CardProps> = ({
  data,
  level,
  idx,
  id,
  length,
  moveCard,
  deleteCard,
  convertToGroup,
  changeOperator,
  isReadOnly,
}) => {
  const {
    ref,
    dragRef,
    previewRef,
    dropRef,
    isDragging,
    isInsertTop,
    isOver,
    canDrop: canDropState,
    handlerId,
    isGroup,
  } = useCardDrag({
    id,
    level,
    idx,
    data,
    isReadOnly,
    onMove: moveCard,
  });

  const cardHeightRef = useRef<HTMLDivElement>(null);
  const cardHeight = useMemo(() => {
    // 获取卡片的实际高度，默认为 100px
    return cardHeightRef.current?.offsetHeight || 100;
  }, [isGroup, data, isDragging]);

  const highlightStyle = isOver ? { border: "1px solid #3C88F0" } : {};

  const handleDelete = () => deleteCard(data);
  const handleConvertToGroup = () => convertToGroup(data);
  const handleChangeOperator = () => changeOperator(data, data.operator);

  const renderCardNoGroup = () => (
    <CardMain
      style={{ backgroundColor: level === 2 ? "#fff" : "#F7F7F7" }}
      title={
        <CardMainHeader>
          <CardMainHeaderTitle>
            <DragIcon
              style={!isReadOnly ? { cursor: "move" } : {}}
              ref={dragRef}
            >
              <HolderOutlined />
            </DragIcon>
            {data?.name || ""}
          </CardMainHeaderTitle>
          <CardMainHeaderOpt>
            {level !== 2 && !data?.children?.length && (
              <Button
                type="text"
                size="small"
                icon={<ExpandOutlined />}
                onClick={handleConvertToGroup}
              >
                扩展
              </Button>
            )}
            <Popconfirm
              title="确定删除此卡片?"
              onConfirm={handleDelete}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </CardMainHeaderOpt>
        </CardMainHeader>
      }
    >
      <CardMainDes>{data.displayDef || ""}</CardMainDes>
    </CardMain>
  );

  const renderCardIsGroup = () => (
    <CardMain
      title={
        <CardMainHeader>
          <CardMainHeaderTitle>
            <DragIcon
              ref={dragRef}
              style={!isReadOnly ? { cursor: "move" } : {}}
            >
              <HolderOutlined />
            </DragIcon>
            条件组
          </CardMainHeaderTitle>
          <Popconfirm
            title="确定删除此条件组?"
            onConfirm={handleDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </CardMainHeader>
      }
    >
      <Container
        level={2}
        newCards={data.children || []}
        moveCard={moveCard}
        deleteCard={deleteCard}
        convertToGroup={convertToGroup}
        changeOperator={changeOperator}
        isReadOnly={isReadOnly}
      />
    </CardMain>
  );

  return (
    <CardWrapper>
      <div ref={dropRef} data-handler-id={handlerId as string}>
        <div
          ref={ref}
          style={{
            position: "relative",
            opacity: isDragging ? 0 : 1,
          }}
        >
          <OpStyle
            onClick={handleChangeOperator}
            style={{ opacity: idx === 0 ? 0 : 1, cursor: "pointer" }}
            color="blue"
          >
            {data.operator}
          </OpStyle>
          <Main>
            <LeftDiv>
              <div
                style={{
                  borderLeft: idx === 0 ? "" : "1px solid #C4DBFA",
                  borderBottom: length <= 1 ? "" : "1px solid #C4DBFA",
                  height: "50%",
                  width: 15,
                }}
              />
              <div
                style={{
                  borderLeft: length - 1 === idx ? "" : "1px solid #C4DBFA",
                  height: "50%",
                  width: 15,
                }}
              />
            </LeftDiv>
            <div style={{ width: "100%", position: "relative" }}>
              {isInsertTop && isOver && (
                <ShadowZone
                  style={{
                    top: "-12px",
                    transform: "translateY(-50%)",
                    height: `${cardHeight}px`,
                  }}
                  title={`Feedback: Card ${id} (level ${level})`}
                >
                  <ShadowContent />
                </ShadowZone>
              )}
              <RightDiv
                ref={previewRef}
                style={{
                  opacity: isDragging ? 0 : 1,
                  display: isDragging ? "none" : "",
                  ...highlightStyle,
                  backgroundColor: level === 2 ? "#fff" : "#F7F7F7",
                }}
              >
                <div ref={cardHeightRef}>
                  {isGroup ? renderCardIsGroup() : renderCardNoGroup()}
                </div>
              </RightDiv>
              {isInsertTop === false && isOver && (
                <ShadowZone
                  style={{
                    bottom: "-12px",
                    transform: "translateY(50%)",
                    height: `${cardHeight}px`,
                  }}
                >
                  <ShadowContent />
                </ShadowZone>
              )}
            </div>
          </Main>
        </div>
      </div>
    </CardWrapper>
  );
};

export default Card;
