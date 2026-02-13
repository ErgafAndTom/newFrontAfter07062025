import React from "react";

/**
 * Count input component with BW styling
 *
 * @param {number} count - Current count value
 * @param {Function} setCount - Setter for count
 * @param {number} min - Minimum value (default: 1)
 * @param {string} unit - Unit label (default: "шт")
 * @param {string} className - Additional class names
 */
const CountInput = ({
  count,
  setCount,
  min = 1,
  unit = "шт",
  className = "",
}) => {
  const handleChange = (e) => {
    const value = Number(e.target.value);
    setCount(value < min ? min : value);
  };

  return (
    <div
      className={`d-flex flex-row inputsArtemkilk allArtemElem ${className}`}
      style={{
        border: "transparent",
        justifyContent: "left",
      }}
    >
      <input
        className="d-flex inputsArtemNumber inputsArtem custom-select-container"
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: "0.7vw",
        }}
        type="number"
        value={count}
        min={min}
        onChange={handleChange}
      />
      <div
        className="inputsArtemx allArtemElem"
        style={{ border: "transparent", color: "#949493" }}
      >
        {unit}
      </div>
    </div>
  );
};

export default CountInput;
