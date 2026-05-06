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
  gap: ${theme.spacing.xs};
`;

const CardMainDes = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.xs};
`;

const DeleteButton = styled(Button)`
  && {
    color: ${theme.colors.text.secondary};

    &:hover,
    &:focus {
      color: #b45a5a;
      background: rgba(180, 90, 90, 0.08);
    }
  }
`;

const InsertionLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 5px;
  background: ${theme.colors.primary};
  pointer-events: none;
  z-index: ${theme.zIndex.drag};
  border-radius: 2.5px;
  animation: insertionPulse 1.5s ease-in-out infinite;

  @keyframes insertionPulse {
    0% {
      transform: scaleY(0.8);
      opacity: 0.7;
    }
    50% {
      transform: scaleY(1.2);
      opacity: 1;
    }
    100% {
      transform: scaleY(0.8);
      opacity: 0.7;
    }
  }
`;

const EndDot = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background: ${theme.colors.primary};
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  z-index: ${theme.zIndex.drag};

  &.left {
    left: -4px;
  }

  &.right {
    right: -4px;
  }
`;

const InsertionLineWrapper = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 5px;
  pointer-events: none;
  z-index: ${theme.zIndex.drag};
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
  path: number[];
  maxLevel: number;
  idx: number;
  id: string | number;
  length: number;
  moveCard: (dragItem: DragItem, hoverItem: HoverItem) => void;
  deleteCard: (path: number[]) => void;
  convertToGroup: (path: number[]) => void;
  changeOperator: (path: number[]) => void;
  isReadOnly: boolean;
}

const Card: React.FC<CardProps> = ({
  data,
  level,
  path,
  maxLevel,
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
    path,
    idx,
    data,
    isReadOnly,
    maxLevel,
    onMove: moveCard,
  });

  const cardHeightRef = useRef<HTMLDivElement>(null);
  const cardHeight = useMemo(() => {
    // 获取卡片的实际高度，默认为 100px
    return cardHeightRef.current?.offsetHeight || 100;
  }, [isGroup, data, isDragging]);

  const highlightStyle = isOver ? { border: "1px solid #3C88F0" } : {};
  const canExpand = level < maxLevel && !data?.children?.length;

  const handleDelete = () => deleteCard(path);
  const handleConvertToGroup = () => convertToGroup(path);
  const handleChangeOperator = () => changeOperator(path);

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
            {canExpand && (
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
              <DeleteButton type="text" size="small" icon={<DeleteOutlined />}>
                删除
              </DeleteButton>
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
            <DeleteButton type="text" size="small" icon={<DeleteOutlined />}>
              删除
            </DeleteButton>
          </Popconfirm>
        </CardMainHeader>
      }
    >
      <Container
        level={level + 1}
        pathPrefix={path}
        maxLevel={maxLevel}
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
              {isInsertTop && isOver && canDropState && (
                <InsertionLineWrapper
                  style={{ top: 0, transform: "translateY(-50%)" }}
                >
                  <InsertionLine />
                  <EndDot className="left" />
                  <EndDot className="right" />
                </InsertionLineWrapper>
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
              {isInsertTop === false && isOver && canDropState && (
                <InsertionLineWrapper
                  style={{ bottom: 0, transform: "translateY(50%)" }}
                >
                  <InsertionLine />
                  <EndDot className="left" />
                  <EndDot className="right" />
                </InsertionLineWrapper>
              )}
            </div>
          </Main>
        </div>
      </div>
    </CardWrapper>
  );
};

export default Card;
