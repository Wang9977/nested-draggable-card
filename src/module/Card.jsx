
import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import PropTypes from 'prop-types';
import { ItemTypes, optTypeEnum } from './ItemTypes';
import Container from './Container';
import mudleStyle from './index.module.scss';
import { Line } from './Line';

const Card = ({
    data,
    level,
    idx,
    id,
    length,
    moveCard,
    delCard,
    changeToGroup,
    changeOpt,
    isReadOnly
}) => {
    const ref = useRef(null);
    let highLgt = {};

    const [isInsertTop, setIsInsertTop] = useState(null);

    const isGroup = !!data.children?.length;

    const [{ isDragging, dragBoundingRect }, drag, preview] = useDrag({
        type: isGroup ? ItemTypes.GROUP : ItemTypes.CARD,
        item: () => {
            return {
                id,
                level,
                data,
                dragIndex: idx,
                isGroup,
                ref,
                dragBoundingRect
            };
        },
        collect: monitor => {
            return {
                isDragging: !!monitor.isDragging(),
                offset: monitor.getInitialClientOffset(),
                dragBoundingRect: ref?.current?.getBoundingClientRect()
            };
        }
    });
    // 实现拖拽物放置的钩子
    const [{ handlerId, isOverDeep, canDrop, dragItem }, drop] = useDrop({
        accept: level > 1 ? ItemTypes.CARD : [ItemTypes.CARD, ItemTypes.GROUP], // 指定接收元素的类型，只有类型相同的元素才能进行drop操作
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
                // 是否放置在目标上
                isOverDeep: monitor.isOver({ shallow: true }),
                isOver: monitor.isOver(),
                // 是否开始拖拽
                canDrop: monitor.canDrop(),
                hoverId: data.id,
                dragItem: monitor.getItem()
            };
        },
        hover(item, monitor) {
            if (canDrop && isOverDeep) {
                // hover上的元素的 矩形
                const hoverBoundingRect = ref?.current?.getBoundingClientRect();

                const dragOffset = monitor.getDifferenceFromInitialOffset();

                const floatItemY = dragOffset.y + dragItem.dragBoundingRect.top;

                // 当悬浮卡片，超出hover元素顶部时，拖动元素插入hover元素上一个，否则拖动插入到hover元素下一个
                const isInserTop = floatItemY < hoverBoundingRect.top;
                setIsInsertTop(() => isInserTop);

                item.isUpDrag = isInserTop;
            }
        },

        drop(item) {
            if (canDrop && isOverDeep) {
                moveCard(item, {
                    ...data,
                    hoverIndex: idx,
                    isGroup,
                    level
                });
            }
        }
    });

    const opacity = isDragging ? 0 : 1;
    const display = isDragging ? 'none' : '';
    if (!isReadOnly) drop(ref);

    const renderCardNoGroup = () => {
        return (
            <div
                style={{ backgroundColor: level === 2 ? '#fff' : '#F7F7F7' }}
                className={mudleStyle.cardMain}
            >
                <div className={mudleStyle.cardMainHeader}>
                    <div className={mudleStyle.cardMainHeaderTitle}>
                        <div
                            className={mudleStyle.dragIcon}
                            style={!isReadOnly ? { cursor: 'move' } : {}}
                            ref={!isReadOnly ? drag : null}
                        ><button>拖拽</button></div>
                        {data?.name || ''}
                    </div>
                    <div className={mudleStyle.cardMainHeaderOpt}>
                        <div
                            
                            style={
                                level === 2 || data?.children?.length
                                    ? { display: 'none' }
                                    : { display: 'block' ,marginRight:5}
                            }
                            onClick={() => changeToGroup(data)}
                        >扩展</div>

                        <div
                            onClick={() => delCard(data)}
                        >删除</div>
                    </div>
                </div>
                <div className={mudleStyle.cardMainDes}>
                    {data.displayDef || ''}
                </div>
            </div>
        );
    };

    const renderCardIsGroup = newCard => {
        return (
            <div className={mudleStyle.cardMain}>
                <div className={mudleStyle.cardMainHeader}>
                    <div className={mudleStyle.cardMainHeaderTitle}>
                        <div
                            className={mudleStyle.dragIcon}
                            ref={!isReadOnly ? drag : null}
                            style={!isReadOnly ? { cursor: 'move' } : {}}
                        ><button>拖拽</button></div>
                        条件组
                    </div>
                    <div

                        onClick={() => delCard(data)}
                    >删除</div>
                </div>

                <Container
                    level={2}
                    key={newCard.id}
                    newCards={newCard}
                    moveCard={moveCard}
                    delCard={delCard}
                    changeToGroup={changeToGroup}
                    changeOpt={changeOpt}
                    isReadOnly={isReadOnly}
                />
            </div>
        );
    };

    highLgt =
        canDrop && isOverDeep
            ? {
                  border: '1px solid #3C88F0'
              }
            : {};

    return (
        <div
            ref={!isReadOnly ? ref : null}
            data-handler-id={handlerId}
            key={handlerId}
        >
            <div
                style={{
                    position: 'relative',
                    opacity
                }}
                key={data.id}
            >
              
                    <div
                        className={mudleStyle.opStyle}
                        onClick={() => changeOpt(data, data.operator)}
                        style={{
                            opacity: idx === 0 ? 0 : 1
                        }}
                    >
                        {data.operator}
                    </div>
                
                <div className={mudleStyle.main}>
                    <div className={mudleStyle.leftDiv}>
                        <div
                            style={{
                                borderLeft:
                                    idx === 0 ? '' : '1px solid #C4DBFA',
                                borderBottom:
                                    length <= 1 ? '' : '1px solid #C4DBFA',
                                height: '50%',
                                width: 15
                            }}
                        ></div>
                        <div
                            style={{
                                borderLeft:
                                    length - 1 === idx
                                        ? ''
                                        : '1px solid #C4DBFA',
                                height: '50%',
                                width: 15
                            }}
                        ></div>
                    </div>
                    <div style={{ width: '100%' }}>
                        <Line
                            lineStyle={{
                                marginBottom: 4,
                                opacity:
                                    isInsertTop && canDrop && isOverDeep ? 1 : 0
                            }}
                        />

                        <div
                            ref={!isReadOnly ? preview : null}
                            className={mudleStyle.rightDiv}
                            style={{
                                opacity,
                                display,
                                ...highLgt,
                                backgroundColor:
                                    level === 2 ? '#fff' : '#F7F7F7'
                            }}
                        >
                            {!isGroup
                                ? renderCardNoGroup()
                                : renderCardIsGroup(data.children)}
                        </div>

                        <Line
                            lineStyle={{
                                opacity:
                                    isInsertTop === false &&
                                    canDrop &&
                                    isOverDeep
                                        ? 1
                                        : 0
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

Card.propTypes = {
    data: PropTypes.object.isRequired,
    level: PropTypes.number,
    idx: PropTypes.number,
    id: PropTypes.any,
    length: PropTypes.number,
    moveCard: PropTypes.func.isRequired,
    delCard: PropTypes.func.isRequired,
    changeToGroup: PropTypes.func.isRequired,
    changeOpt: PropTypes.func.isRequired,
    isReadOnly: PropTypes.bool.isRequired
};

Card.defaultProps = {
    level: 1,
    id: '',
    idx: -1,
    length: 0
};

export default Card;
