import React, { useRef, useMemo } from "react";
import { Button, Card as AntdCard, Popconfirm, Tag } from "antd";
import {
  HolderOutlined,
  ExpandOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Container from "./Container";
import moduleStyle from "./index.module.scss";
import { useCardDrag } from "./useCardDrag";
import { CardData } from "./ItemTypes";
import { DragItem, HoverItem } from "./types";

const { Meta } = AntdCard;

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
    <AntdCard
      style={{ backgroundColor: level === 2 ? "#fff" : "#F7F7F7" }}
      className={moduleStyle.cardMain}
      title={
        <div className={moduleStyle.cardMainHeader}>
          <div className={moduleStyle.cardMainHeaderTitle}>
            <div
              className={moduleStyle.dragIcon}
              style={!isReadOnly ? { cursor: "move" } : {}}
              ref={dragRef}
            >
              <HolderOutlined />
            </div>
            {data?.name || ""}
          </div>
          <div className={moduleStyle.cardMainHeaderOpt}>
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
          </div>
        </div>
      }
    >
      <div className={moduleStyle.cardMainDes}>{data.displayDef || ""}</div>
    </AntdCard>
  );

  const renderCardIsGroup = () => (
    <AntdCard
      className={moduleStyle.cardMain}
      title={
        <div className={moduleStyle.cardMainHeader}>
          <div className={moduleStyle.cardMainHeaderTitle}>
            <div
              className={moduleStyle.dragIcon}
              ref={dragRef}
              style={!isReadOnly ? { cursor: "move" } : {}}
            >
              <HolderOutlined />
            </div>
            条件组
          </div>
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
        </div>
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
    </AntdCard>
  );

  return (
    <div ref={dropRef} data-handler-id={handlerId as string}>
      <div
        ref={ref}
        style={{
          position: "relative",
          opacity: isDragging ? 0 : 1,
        }}
      >
        <Tag
          className={moduleStyle.opStyle}
          onClick={handleChangeOperator}
          style={{ opacity: idx === 0 ? 0 : 1, cursor: "pointer" }}
          color="blue"
        >
          {data.operator}
        </Tag>
        <div className={moduleStyle.main}>
          <div className={moduleStyle.leftDiv}>
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
          </div>
          <div style={{ width: "100%", position: "relative" }}>
            {isInsertTop && isOver && (
              <div
                className={moduleStyle.shadowZone}
                style={{
                  top: "-12px",
                  transform: "translateY(-50%)",
                  height: `${cardHeight}px`,
                }}
                title={`Feedback: Card ${id} (level ${level})`}
              >
                <div className={moduleStyle.shadowContent} />
              </div>
            )}
            <div
              ref={previewRef}
              className={moduleStyle.rightDiv}
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
            </div>
            {isInsertTop === false && isOver && (
              <div
                className={moduleStyle.shadowZone}
                style={{
                  bottom: "-12px",
                  transform: "translateY(50%)",
                  height: `${cardHeight}px`,
                }}
              >
                <div className={moduleStyle.shadowContent} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
