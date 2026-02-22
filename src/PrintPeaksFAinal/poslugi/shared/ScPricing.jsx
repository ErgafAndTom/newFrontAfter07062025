import React from "react";

const fmtUA = (v) =>
  new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v) || 0);

const ScPricing = ({ lines = [], simpleLines = [], totalPrice = 0, extras = [], fmt, countUnit = "шт" }) => {
  const f = fmt || fmtUA;
  return (
    <div className="sc-prices-grid">
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          <div className="sc-price-label">{line.label}:</div>
          <div className="sc-price-line">
            <span className="sc-val">{f(line.perUnit)}</span>
            <span className="sc-unit">грн</span>
            <span className="sc-op">&times;</span>
            <span className="sc-val">{line.count || 0}</span>
            <span className="sc-unit">{countUnit}</span>
            <span className="sc-op">=</span>
            <span className="sc-total">{f(line.total)}</span>
            <span className="sc-unit">грн</span>
          </div>
        </React.Fragment>
      ))}
      {simpleLines.map((line, i) => (
        <React.Fragment key={`s${i}`}>
          <div className="sc-price-label">{line.label}:</div>
          <div className="sc-price-line">
            <span className="sc-val"></span>
            <span className="sc-unit"></span>
            <span className="sc-op"></span>
            <span className="sc-val"></span>
            <span className="sc-unit"></span>
            <span className="sc-op"></span>
            <span className="sc-total">{f(line.value)}</span>
            <span className="sc-unit">грн</span>
          </div>
        </React.Fragment>
      ))}
      <div className="sc-price-total">
        {f(totalPrice)}
        <span className="sc-unit">грн</span>
      </div>
      {extras.map((e, i) => (
        <div className="sc-price-unit" key={i}>{e.label}: {e.value}</div>
      ))}
    </div>
  );
};
export default ScPricing;
