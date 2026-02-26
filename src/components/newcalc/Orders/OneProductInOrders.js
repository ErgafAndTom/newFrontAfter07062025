import React from "react";
import "./OneProductInOrders.css";

const toNumber = (value) => {
  const raw = String(value ?? "").replace(",", ".").trim();
  const numeric = Number.parseFloat(raw);
  return Number.isFinite(numeric) ? numeric : 0;
};

const fmt2 = (value) => {
  const n = toNumber(value);
  return n % 1 === 0 ? String(n) : n.toFixed(2);
};

function OneProductInOrders({ item }) {
  const units = Array.isArray(item?.OrderUnitUnits) ? item.OrderUnitUnits : [];

  const extractMaterialName = (text) => {
    if (!text) return "";
    
    // Спробуємо знайти назву в лапках (часто так позначається матеріал)
    const match = text.match(/'([^']+)'/) || text.match(/"([^"]+)"/);
    if (match && match[1]) return match[1];

    // Якщо лапок немає, просто прибираємо дублікати слів
    return text.split(/\s+/).filter((word, i, arr) => 
      i === 0 || word.toLowerCase() !== arr[i-1].toLowerCase()
    ).join(" ");
  };

  return (
    <div className="unit-list">
      {units.map((unit, idx) => {
        const hasDiscount = toNumber(unit?.priceForOneThis) !== toNumber(unit?.priceForOneThisDiscount);
        const unitPrice = hasDiscount ? unit?.priceForOneThisDiscount : unit?.priceForOneThis;
        const totalPrice = hasDiscount ? unit?.priceForAllThisDiscount : unit?.priceForAllThis;

        return (
          <div key={unit?.idKey ?? idx} className="unit-item">
            <div className="unit-title-row">
              <span className="unit-name-index">{idx + 1}.</span>
              <span className="unit-name-text">{extractMaterialName(unit?.name)}</span>
            </div>

            <div className={`unit-calc-row${hasDiscount ? " is-discount" : ""}`}>
              <span className="unit-val qty">
                {toNumber(unit?.newField5)}
                <span className="unit-sub">шт</span>
              </span>
              <span className="unit-sep">×</span>
              <span className="unit-val one">
                {fmt2(unitPrice)}
                <span className="unit-sub">грн</span>
              </span>
              <span className="unit-sep">=</span>
              <span className="unit-val unit-total">
                {fmt2(totalPrice)}
                <span className="unit-sub">грн</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OneProductInOrders;
