import React from "react";
import "./sc-base.css";

const ScModal = ({ show, onClose, children, rightContent, tabsContent, errorContent, modalStyle }) => {
  if (!show) return null;
  return (
    <div className="sc-wrap">
      <div className="bw-overlay" onClick={onClose} />
      <div
        className="sc-modal"
        style={{ minHeight: "auto", height: "auto", ...modalStyle }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sc-body">
          <div className="sc-left-sections">{children}</div>
          <div className="sc-right">{rightContent}</div>
        </div>
        {errorContent}
        {tabsContent}
      </div>
    </div>
  );
};
export default ScModal;
