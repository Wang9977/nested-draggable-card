import React from "react";

interface LineProps {
  lineStyle?: React.CSSProperties;
}

const Line: React.FC<LineProps> = ({ lineStyle }) => {
  return (
    <div className="dragLine" style={lineStyle}>
      <div className="left"></div>
      <div className="center"></div>
      <div className="right"></div>
    </div>
  );
};

export default Line;
