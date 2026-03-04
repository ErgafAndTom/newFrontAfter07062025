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
  const rawUnits = Array.isArray(item?.OrderUnitUnits) ? item.OrderUnitUnits : [];
  const seenNames = new Set();
  const units = rawUnits.filter(unit => {
    const key = (unit?.name || '').trim().toLowerCase();
    if (seenNames.has(key)) return false;
    seenNames.add(key);
    return true;
  });

  const extractMaterialName = (text, unit) => {
    if (!text) return "";
    const isPaper = /папір|paper|крейд|матов|глянц|фото|ламін/i.test(unit?.type || '') ||
                    /папір|paper|крейд|матов|глянц|фото|ламін/i.test(unit?.typeUse || '') ||
                    /папір|крейд|матов|глянц|фото/i.test(text);

    // Спробуємо знайти назву в лапках (часто так позначається матеріал)
    const match = text.match(/'([^']+)'/) || text.match(/"([^"]+)"/);
    if (match && match[1]) return match[1];

    // Прибираємо технічні суфікси (CMYK, RGB, тощо)
    let result = text.replace(/\b(CMYK|RGB|PANTONE|UV)\b/gi, '').trim();

    // Додаємо одиниці виміру в кінці якщо їх немає
    if (/ламін/i.test(result)) {
      // Ламінація: товщину беремо з назви батьківського замовлення
      const parentName = item?.name || '';
      const mkmMatch = parentName.match(/(\d+)\s*мкм/i);
      if (mkmMatch) result = `${result} ${mkmMatch[1]} мкм`;
    } else if (isPaper) {
      // Папір: число в кінці → г/м²
      result = result.replace(/(\d+(?:-\d+)?)\s*$/, '$1 г/м²');
    }

    // Прибираємо дублікати слів (підряд і через дефіс-словосполучення)
    // Спочатку — підряд ідентичні слова
    result = result.split(/\s+/).filter((word, i, arr) =>
      i === 0 || word.toLowerCase() !== arr[i - 1].toLowerCase()
    ).join(" ");

    // Потім — якщо хвіст рядка вже зустрічається раніше, відрізаємо його
    const words = result.split(/\s+/);
    for (let len = Math.floor(words.length / 2); len >= 1; len--) {
      const tail = words.slice(-len).join(" ").toLowerCase();
      const bodyWithoutTail = words.slice(0, -len).join(" ").toLowerCase();
      if (bodyWithoutTail.includes(tail)) {
        result = words.slice(0, -len).join(" ").trim();
        break;
      }
    }

    // Прибираємо зайву пунктуацію в кінці
    return result.replace(/[,;]+$/, '').trim();
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
              <span className="unit-name-text">{extractMaterialName(unit?.name, unit)}</span>
            </div>
            <div className="unit-calc-row">
              <span className="unit-val qty">
                {toNumber(unit?.newField5)}<span className="unit-sub">шт</span>
              </span>
              <span className="unit-sep">×</span>
              <span className="unit-val one">
                {fmt2(unitPrice)}<span className="unit-sub">грн</span>
              </span>
              <span className="unit-sep">=</span>
              <span className={`unit-val unit-total${hasDiscount ? ' is-discount' : ''}`}>
                {fmt2(totalPrice)}<span className="unit-sub">грн</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OneProductInOrders;
