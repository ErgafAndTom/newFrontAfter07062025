import React from "react";

const ScCountSize = ({ count, onCountChange, sizeComponent }) => (
  <div className="sc-count-size-row">
    <div className="sc-section sc-section-card" style={{ flex: 1 }}>
      <div className="sc-row">
        {sizeComponent}
      </div>
    </div>
    <div className="sc-section sc-section-card">
      <div className="sc-row d-flex flex-row align-items-center">
        <input
          className="inputsArtem"
          type="number"
          value={count}
          min={1}
          onChange={(e) => onCountChange(e.target.value)}
        />
        <div className="inputsArtemx" style={{ border: "transparent" }}>шт</div>
      </div>
    </div>
  </div>
);
export default ScCountSize;
