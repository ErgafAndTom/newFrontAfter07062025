import React from "react";

const DEFAULT_OPTIONS = [
  { value: "односторонній", label: "Односторонній" },
  { value: "двосторонній", label: "Двосторонній" },
];

const ScSides = ({ value, onChange, options }) => {
  const opts = options || DEFAULT_OPTIONS;
  return (
    <div className="sc-section sc-section-card">
      <div className="sc-sides">
        {opts.map((opt, i) => (
          <button
            key={opt.value}
            className={`sc-side-btn ${i === 0 ? "sc-side-left" : ""} ${i === opts.length - 1 ? "sc-side-right" : ""} ${value === opt.value ? "sc-side-active" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            <span className="sc-side-text">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
export default ScSides;
