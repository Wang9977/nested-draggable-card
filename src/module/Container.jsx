
import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';

const Container = ({
    level,
    newCards,
    moveCard,
    delCard,
    changeToGroup,
    changeOpt,
    isReadOnly
}) => {
    return (
        <div
            style={{
                paddingLeft: level === 1 && newCards?.length > 1 ? 10 : 0
            }}
        >
            {newCards?.map((card, i) => {
                return (
                    <Card
                        isReadOnly={isReadOnly}
                        key={`${card.id}${i}`}
                        data={card}
                        level={level}
                        idx={i}
                        id={card.id}
                        length={newCards?.length}
                        moveCard={(dragItem, hoverItem) => {
                            moveCard(dragItem, hoverItem);
                        }}
                        delCard={item => {
                            delCard(item);
                        }}
                        changeToGroup={item => changeToGroup(item)}
                        changeOpt={changeOpt}
                    />
                );
            })}
        </div>
    );
};
Container.propTypes = {
    level: PropTypes.number,
    newCards: PropTypes.array.isRequired,
    isReadOnly: PropTypes.bool.isRequired,
    moveCard: PropTypes.func.isRequired,
    delCard: PropTypes.func.isRequired,
    changeToGroup: PropTypes.func.isRequired,
    changeOpt: PropTypes.func.isRequired
};

Container.defaultProps = {
    level: 1
};

export default Container;
