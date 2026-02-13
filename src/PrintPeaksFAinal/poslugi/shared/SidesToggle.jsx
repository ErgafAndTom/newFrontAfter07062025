import React from "react";

/**
 * Sides toggle component (односторонній/двосторонній)
 *
 * @param {Object} color - Color state object with sides property
 * @param {Function} setColor - Setter for color state
 * @param {string} leftLabel - Label for left button (default: "Односторонній")
 * @param {string} rightLabel - Label for right button (default: "Двосторонній")
 * @param {string} leftValue - Value for left button (default: "односторонній")
 * @param {string} rightValue - Value for right button (default: "двосторонній")
 */
const SidesToggle = ({
  color,
  setColor,
  leftLabel = "Односторонній",
  rightLabel = "Двосторонній",
  leftValue = "односторонній",
  rightValue = "двосторонній",
}) => {
  return (
    <div className="bw-sides-container">
      <button
        className={`bw-side-btn bw-side-left ${
          color.sides === leftValue ? "bw-side-active" : ""
        }`}
        onClick={() => setColor({ ...color, sides: leftValue })}
        style={{ zIndex: 10 }}
      >
        {leftLabel}
      </button>

      <button
        className={`bw-side-btn bw-side-right ${
          color.sides === rightValue ? "bw-side-active" : ""
        }`}
        onClick={() => setColor({ ...color, sides: rightValue })}
      >
        {rightLabel}
      </button>
    </div>
  );
};

export default SidesToggle;
