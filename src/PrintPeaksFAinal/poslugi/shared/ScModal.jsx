import React from "react";
import "./sc-base.css";

const ScModal = ({ show, onClose, children, rightContent, tabsContent, errorContent, modalStyle, leftStyle, rightStyle, modalClassName = "", bodyClassName = "" }) => {
  if (!show) return null;
  return (
    <div className="sc-wrap">
      <div className="bw-overlay" onClick={onClose} />
      <div
        className={`sc-modal${modalClassName ? ` ${modalClassName}` : ""}`}
        style={{ minHeight: "auto", height: "auto", ...modalStyle }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`sc-body${bodyClassName ? ` ${bodyClassName}` : ""}`}>
          <div className="sc-left-sections" style={leftStyle}>{children}</div>
          <div className="sc-right" style={rightStyle}>{rightContent}</div>
        </div>
        {errorContent}
        {tabsContent}
      </div>
    </div>
  );
};
export default ScModal;
