import React from "react";

const ScSection = ({ title, children, style, className = "", noCard = false }) => (
  <div className={`sc-section ${noCard ? "" : "sc-section-card"} ${className}`} style={style}>
    {title && <div className="sc-title">{title}</div>}
    <div className="sc-row">{children}</div>
  </div>
);
export default ScSection;
