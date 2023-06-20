import PropTypes from 'prop-types';
import mudleStyle from './index.module.scss';

export const Line = ({ lineStyle }) => {
    return (
        <div className={mudleStyle.dragLine} style={lineStyle}>
            <div className={mudleStyle.left}></div>
            <div className={mudleStyle.center}></div>
            <div className={mudleStyle.right}></div>
        </div>
    );
};
Line.propTypes = {
    lineStyle: PropTypes.object.isRequired
};
