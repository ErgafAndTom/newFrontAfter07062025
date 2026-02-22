import React from "react";

const ScToggleSection = ({ label, title, isOn, onToggle, children, style }) => (
  <div className="sc-section" style={style}>
    <div className="d-flex align-items-center">
      <label className="switch scale04ForButtonToggle">
        <input type="checkbox" checked={isOn} onChange={onToggle} />
        <span className="switch-on"><span>{label}</span></span>
        <span className="slider" />
        <span className="switch-off"><span>OFF</span></span>
      </label>
      {!isOn && (
        <div className="sc-title" style={{ marginBottom: 0 }}>{title}</div>
      )}
      {isOn && (
        <div className="sc-row sc-pp-row" style={{ flex: 1 }}>
          {children}
        </div>
      )}
    </div>
  </div>
);
export default ScToggleSection;
