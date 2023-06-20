import React, { useRef } from 'react';
import update from 'immutability-helper';
import PropTypes from 'prop-types';
import Container from './Container';
import { delFun, findArrayIndex, initFirstCardOpt, delCardItem } from './utils.js';

export const Wrapper = ({ cards, setCards, delItem, isReadOnly }) => {
    const groupId = useRef(1);

    const moveCard = (dragItem, hoverItem) => {
        let hoverOutIdx = -1;
        let cardsTmp = [];
        // 删除的逻辑
        cardsTmp = delFun(cards, dragItem);

        // 添加逻辑
        // isUpDrag true 拖动元素放在hover元素上方

        let res = [];
        if (hoverItem.level === 1) {
            // 卡片拖到目标为外层元素
            hoverOutIdx = cardsTmp.findIndex(card => card.id === hoverItem.id);
            res = update(cardsTmp, {
                $splice: [
                    [
                        dragItem?.isUpDrag ? hoverOutIdx : hoverOutIdx + 1,
                        0,
                        dragItem.data
                    ]
                ]
            });
        } else {
            // 卡片拖到目标为内层元素
            hoverOutIdx = -1;
            const idxObj = findArrayIndex(cardsTmp, hoverItem);
            hoverOutIdx = idxObj.OutIdx;
            const hoverInnerIdx = idxObj.InnerIdx;
            if (cardsTmp[hoverOutIdx]?.children) {
                res = update(cardsTmp, {
                    [hoverOutIdx]: {
                        children: {
                            $splice: [
                                [
                                    dragItem?.isUpDrag
                                        ? hoverInnerIdx
                                        : hoverInnerIdx + 1,
                                    0,
                                    dragItem.data
                                ]
                            ]
                        }
                    }
                });
            }
        }

        // 将列表(条件组)第一个卡片操作运算符置为‘且’
        const finalRes = initFirstCardOpt(res);

        setCards(finalRes);
    };

    const delCard = item => {
        const finalRes = delCardItem(cards, item);
        setCards(finalRes); // 删除右侧逻辑区域

       
    };

    const changeToGroup = item => {
        const cardsTmp = cards.map(card => {
            if (card.id === item.id) {
                console.log(11);
                return {
                    children: [item],
                    operator: '交',
                    id: `group${groupId.current}`,
                    isGroup: true,
                    type: 4
                };
            } else return card;
        });
        groupId.current += 1;
        setCards(cardsTmp);
    };
    const changeOpt = (item, newOpt) => {
        newOpt = item.operator==='交'?'并':(item.operator==='并'?'差':'交')
        const res = cards.map(card => {
            if (card?.id === item.id) {
                return {
                    ...card,
                    operator: newOpt
                };
            } else {
                const children = card.children?.map(c => {
                    if (c?.id === item.id) {
                        return {
                            ...c,
                            operator: newOpt
                        };
                    } else {
                        return c;
                    }
                });
                return {
                    ...card,
                    children
                };
            }
        });
        setCards(res);
    };

    return (
        <div>
            <Container
                isReadOnly={isReadOnly}
                level={1}
                newCards={cards}
                moveCard={(dragItem, hoverItem) => {
                    moveCard(dragItem, hoverItem);
                }}
                delCard={item => {
                    delCard(item);
                }}
                changeToGroup={item => changeToGroup(item)}
                changeOpt={changeOpt}
            />
        </div>
    );
};

Wrapper.propTypes = {
    cards: PropTypes.array.isRequired,
    setCards: PropTypes.func,
    delItem: PropTypes.func,
    isReadOnly: PropTypes.bool.isRequired
};
Wrapper.defaultProps = {
    setCards: () => {},
    delItem: () => {}
};
