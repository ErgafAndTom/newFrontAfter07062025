import React, { useEffect, useMemo, useState } from "react";
import './CornerRounding.css';
import './ArtemStyles.css';
/* ================= SAFE HELPERS ================= */
const safeSize = (s) => ({
  x: Number(s?.x) || 210,
  y: Number(s?.y) || 297,
});

const safeColor = (c) => ({
  sides: c?.sides || "односторонній",
  one: c?.one || "",
  two: c?.two || "",
  allSidesColor: c?.allSidesColor || "Чорно-білий",
});

const safeCount = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 1;
};

/* ================= COMPONENT ================= */
const NewNoModalSize_colum = ({
                                size,
                                setSize,
                                type,
                                buttonsArr = [],
                                color,
                                setColor,
                                count,
                                setCount,

                                /* UI FLAGS */
                                showSize = true,
                                showSides = true,

                                defaultt = "A4 (210 × 297 мм)",
                              }) => {
  const s = useMemo(() => safeSize(size), [size]);
  const c = useMemo(() => safeColor(color), [color]);
  const cnt = safeCount(count);
  const [localSides, setLocalSides] = useState(c.sides);

  const [localX, setLocalX] = useState(s.x);
  const [localY, setLocalY] = useState(s.y);

  /* ================= FORMAT LIST ================= */
  const formats = useMemo(() => {
    if (type === "SheetCutBW") {
      return [
        { name: "A4 (210 × 297 мм)", x: 210, y: 297 },
        { name: "A3 (297 × 420 мм)", x: 297, y: 420 },
      ];
    }
    return [{ name: defaultt, x: s.x, y: s.y }];
  }, [type, defaultt, s.x, s.y]);

  /* ================= APPLY SIZE ================= */
  useEffect(() => {
    setSize?.({ x: localX, y: localY });
  }, [localX, localY]);

  /* ================= HANDLERS ================= */
  const handleFormatSelect = (e) => {
    const f = formats.find((i) => i.name === e.target.value);
    if (f) {
      setLocalX(f.x);
      setLocalY(f.y);
      setSize?.({ x: f.x, y: f.y });
    }
  };

  const handleSideClick = (side) => {
    setLocalSides(side);

    // ❗ КРИТИЧНО: передаємо вгору ПОВНИЙ color
    if (setColor) {
      setColor(prev => ({
        ...prev,
        sides: side,
      }));
    }
  };



  useEffect(() => {
    if (color?.sides) {
      setLocalSides(color.sides);
    }
  }, [color?.sides]);

  /* ================= RENDER ================= */
  return (
    <div className="ppBwSizeBlock">
      {/* ===== SIZE ===== */}
      {showSize && (
        <div className="ppBwSizeRow">


          <select
            className="custom-select-container selectArtem selectArtemBefore"
            value={formats.find((f) => f.x === s.x && f.y === s.y)?.name || defaultt}
            onChange={handleFormatSelect}
          >
            {formats.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
                {/*({f.x}мм{f.y}мм)*/}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ===== SIDES ===== */}
      {showSides && buttonsArr.length > 0 && (
        <div className="ppBwSidesRow">


          <div className="d-flex flex-row justify-content-center align-items-center">
            {buttonsArr.map((b) => (
              <button
                key={b}
                className={
                  localSides === b
                    ? "buttonsArtem buttonsArtemActive"
                    : "buttonsArtem"
                }
                onClick={() => handleSideClick(b)}
              >
                {b}
              </button>

            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewNoModalSize_colum;
