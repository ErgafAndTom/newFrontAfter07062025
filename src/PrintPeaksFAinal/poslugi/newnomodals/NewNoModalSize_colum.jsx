import React, { useEffect, useMemo, useState, useRef } from "react";
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
  const [open, setOpen] = useState(false);
  const [dropdownWidth, setDropdownWidth] = useState("auto");

  const dropdownRef = useRef(null);
  const measureRef = useRef(null);

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
  const handleFormatSelect = (format) => {
    setLocalX(format.x);
    setLocalY(format.y);
    setSize?.({ x: format.x, y: format.y });
    setOpen(false);
  };

  const handleSideClick = (side) => {
    setLocalSides(side);

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

  // Автоширина dropdown
  useEffect(() => {
    if (!measureRef.current) return;
    const widths = Array.from(measureRef.current.children).map((el) =>
      el.getBoundingClientRect().width
    );
    if (widths.length > 0) {
      const maxWidth = Math.ceil(Math.max(...widths)) + 30;
      setDropdownWidth(`${maxWidth}px`);
    }
  }, [formats]);

  // Клік поза dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedFormat = formats.find((f) => f.x === s.x && f.y === s.y);
  const title = selectedFormat?.name || defaultt;

  /* ================= RENDER ================= */
  return (
    <div className="d-flex flex-row justify-content-between align-items-center w-100 gap-3">

      {/* ===== BUTTONS SIDES (ЛІВА) ===== */}
      {showSides && buttonsArr.length > 0 && (
        <div style={{display: "flex"}}>
          {buttonsArr.map((item, index) => {
            const isActive = localSides === item;
            const isFirst = index === 0;
            const isLast = index === buttonsArr.length - 1;

            return (
              <div
                className={
                  isActive
                    ? "buttonsArtem buttonsArtemActive"
                    : "buttonsArtem"
                }
                key={index}
                style={{
                  backgroundColor: isActive ? "#f5a623" : "#D3D3D3",
                  color: isActive ? "#FFFFFF" : "#666666",
                  borderTopLeftRadius: isFirst ? "1vh" : "0",
                  borderBottomLeftRadius: isFirst ? "1vh" : "0",
                  borderTopRightRadius: isLast ? "1vh" : "0",
                  borderBottomRightRadius: isLast ? "1vh" : "0",
                }}
                onClick={() => handleSideClick(item)}
              >
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    color:"white",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== DROPDOWN SIZE (ПРАВА) ===== */}
      {showSize && (
        <div
          className="custom-select-container selectArtem selectArtemBefore"
          ref={dropdownRef}
          style={{minWidth: dropdownWidth}}
        >
          <div
            className="custom-select-header"
            onClick={() => setOpen(!open)}
          >
            {title}
          </div>

          {open && (
            <div className="custom-select-dropdown" style={{minWidth: dropdownWidth}}>
              {formats.map((item) => (
                <div
                  key={item.name}
                  className={`custom-option ${
                    item.name === title ? "active" : ""
                  }`}
                  onClick={() => handleFormatSelect(item)}
                >
                  <span className="name">{item.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* hidden measure */}
          <div
            ref={measureRef}
            style={{
              position: "absolute",
              visibility: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {formats.map((item) => (
              <div key={item.name} style={{fontSize: "15px", padding: "8px 12px"}}>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default NewNoModalSize_colum;
