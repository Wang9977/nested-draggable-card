import update from 'immutability-helper';
import { optTypeEnum } from './ItemTypes';

export const findArrayIndex = (arr, item) => {
    let OutIdx = -1;
    let InnerIdx = -1;
    arr.forEach((card, i) => {
        const idx = card?.children?.findIndex(c => c.id === item.id);
        if (idx > -1) {
            OutIdx = i;
            InnerIdx = idx;
        }
    });
    return { OutIdx, InnerIdx };
};

export const delFun = (arr, item) => {
    const outIdx = arr.findIndex(card => card.id === item.id);

    let res = [];
    if (outIdx > -1) {
        res = update(arr, {
            $splice: [[outIdx, 1]]
        });
    } else {
        // 删除内层元素
        const { OutIdx, InnerIdx } = findArrayIndex(arr, item);
        if (OutIdx < 0 || InnerIdx < 0) return arr;
        res = update(arr, {
            [OutIdx]: {
                children: {
                    $splice: [[InnerIdx, 1]]
                }
            }
        });
        if (res?.[OutIdx]?.type === 4 && !res?.[OutIdx]?.children.length) {
            res = update(res, {
                $splice: [[OutIdx, 1]]
            });
        }
    }

    return res;
};

export const initFirstCardOpt = arr => {
    // 将列表(条件组)第一个卡片操作运算符置为‘且’
    const res = [...arr];
    res.forEach((card, idx) => {
        if (idx === 0) {
            card.operator = '交';
        }
        if (card.children?.length) {
            card.children[0].operator = '交';
        }
    });
    return res;
};

export const delCardItem = (cards, item) => {
    const res = delFun(cards, item);
    const finalRes = initFirstCardOpt(res);
    return finalRes;
};

export const formatCardsToEnd = cards => {
    const result = [];
    cards.forEach((card, index) => {
        if (card.type === 2) {
            result.push(card);
            if (index + 1 < cards.length) {
                result.push(optTypeEnum[cards?.[index + 1].operator]);
            }
        } else if (card.type === 4) {
            const children = [];
            card.children?.forEach((c, i) => {
                if (c.type === 2) {
                    children.push(c);

                    if (i + 1 < card.children.length) {
                        children.push(
                            optTypeEnum[card.children[i + 1].operator]
                        );
                    }
                }
            });
            result.push({ type: card.type, children: [...children] });
            if (index + 1 < cards.length) {
                result.push(optTypeEnum[cards?.[index + 1].operator]);
            }
        }
    });
    return result;
};
