import React, { useEffect, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import { usePortalDropdown } from "./newnomodals/usePortalDropdown";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import { useModalState, useModalPricing, useOrderUnitSave } from "./shared/hooks";
import { getStoredAppTheme, onAppThemeChange } from "../../utils/appTheme";

/* Та сама розмітка й той самий CSS, що в еталонного цифрового друку
   (NewSheetCutV2) — без лівої стрічки виробів, бо в ламінації їх немає. */
import "./NewSheetCutV2.css";
import ExtraSheetsButton from "./shared/ExtraSheetsButton";

// ========== DEFAULTS ==========
const DEFAULTS = {
  size: { x: 210, y: 297 },
  lamination: {
    type: "з глянцевим ламінуванням",
    material: "з глянцевим ламінуванням",
    materialId: "",
    size: "",
    typeUse: "А4",
  },
  count: 1,
};

const SIZE_FORMATS = [
  { name: "A5 (148 x 210 мм)", x: 148, y: 210 },
  { name: "A4 (210 x 297 мм)", x: 210, y: 297 },
  { name: "SRA3 (315 x 445 мм)", x: 315, y: 445 },
];

const LAMINATION_BUTTONS = [
  "з глянцевим ламінуванням",
  "з матовим ламінуванням",
  "з ламінуванням SoftTouch",
  "з холодним матовим ламінуванням",
];

const LABELS = {
  "з глянцевим ламінуванням": "ГЛЯНЦЕВЕ",
  "з матовим ламінуванням": "МАТОВЕ",
  "з ламінуванням SoftTouch": "SOFT TOUCH",
  "з холодним матовим ламінуванням": "ХОЛОДНЕ",
};

const fmt2 = (v) =>
  new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v));

const Laminator = ({
  thisOrder,
  setThisOrder,
  setSelectedThings2,
  showLaminator,
  setShowLaminator,
  editingOrderUnit,
  setEditingOrderUnit,
}) => {
  const navigate = useNavigate();

  // Modal state detection
  const { isEdit, options } = useModalState(editingOrderUnit, showLaminator);

  // ========== STATE ==========
  const [size, setSize] = useState(DEFAULTS.size);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);
  const [count, setCount] = useState(DEFAULTS.count);
  const [error, setError] = useState(null);

  // тема стежить за глобальною темою застосунку (перемикач у Nav)
  const [theme, setTheme] = useState(getStoredAppTheme);
  useEffect(() => onAppThemeChange(setTheme), []);

  // Lamination sizes from API
  const [thisLaminationSizes, setThisLaminationSizes] = useState([]);
  const { open: thicknessDropdownOpen, setOpen: setThicknessDropdownOpen, style: dropStyleThickness, toggle: toggleThickness, triggerRef: thicknessDropdownRef, portalRef: portalThicknessRef } = usePortalDropdown();

  // Pricing hook
  const calcData = useMemo(
    () => ({ size, lamination, count }),
    [size, lamination, count]
  );

  const { pricesThis } = useModalPricing("Laminator", calcData, showLaminator, 300, editingOrderUnit);

  // Save hook
  const { saveOrderUnit } = useOrderUnitSave(
    thisOrder,
    setThisOrder,
    setSelectedThings2,
    () => setShowLaminator(false),
    setEditingOrderUnit
  );

  const handleClose = () => {
    if (setEditingOrderUnit) setEditingOrderUnit(null);
    setShowLaminator(false);
  };

  // ========== EFFECTS ==========

  // Initialize/reset state when modal opens
  useEffect(() => {
    if (!showLaminator) return;

    if (!isEdit) {
      setSize(DEFAULTS.size);
      setLamination(DEFAULTS.lamination);
      setCount(DEFAULTS.count);
      setError(null);
      return;
    }

    const opt = options || {};
    setCount(opt.count ?? editingOrderUnit?.amount ?? DEFAULTS.count);
    setSize({
      x: opt?.size?.x ?? DEFAULTS.size.x,
      y: opt?.size?.y ?? DEFAULTS.size.y,
    });
    setLamination({
      type: opt?.lamination?.type ?? DEFAULTS.lamination.type,
      material: opt?.lamination?.material ?? DEFAULTS.lamination.material,
      materialId: opt?.lamination?.materialId ?? "",
      size: opt?.lamination?.size ?? "",
      typeUse: opt?.lamination?.typeUse ?? (Math.max(opt?.size?.x || DEFAULTS.size.x, opt?.size?.y || DEFAULTS.size.y) <= 297 ? "А4" : "А3"),
    });
    setError(null);
  }, [showLaminator, isEdit, options, editingOrderUnit]);

  // Fetch lamination sizes when material changes
  useEffect(() => {
    if (!lamination.material || !showLaminator) return;

    const laminTypeUse = Math.max(size?.x || 0, size?.y || 0) <= 297 ? "А4" : "А3";
    const data = {
      name: "MaterialsPrices",
      inPageCount: 999999,
      currentPage: 1,
      search: "",
      columnName: { column: "id", reverse: false },
      type: "Lamination",
      material: {
        type: "Ламінування",
        material: lamination.material,
        materialId: lamination.materialId,
        thickness: lamination.size,
        typeUse: laminTypeUse,
      },
      size,
    };

    axios
      .post(`/materials/NotAll`, data)
      .then((response) => {
        const rows = response.data.rows || [];
        setThisLaminationSizes(rows);

        if (rows.length > 0 && !lamination.materialId) {
          setLamination((prev) => ({
            ...prev,
            materialId: rows[0].id,
            size: `${rows[0].thickness}`,
          }));
        }
      })
      .catch((err) => {
        setThisLaminationSizes([]);
        if (err?.response?.status === 403) navigate("/login");
      });
  }, [lamination.material, lamination.type, size, showLaminator, navigate]);

  // ========== HANDLERS ==========

  const handleSizeSelect = (format) => {
    setSize({ x: format.x, y: format.y });
    setLamination((prev) => ({ ...prev, materialId: "", size: "" }));
  };

  const handleLaminationTypeClick = (material) => {
    setLamination((prev) => ({
      ...prev,
      material,
      type: material,
      materialId: "",
      size: "",
    }));
  };

  const handleThicknessSelect = (item) => {
    setLamination((prev) => ({
      ...prev,
      materialId: item.id,
      size: `${item.thickness}`,
    }));
    setThicknessDropdownOpen(false);
  };

  const handleSave = () => {
    saveOrderUnit(
      {
        nameOrderUnit: "Ламінація",
        type: "Laminator",
        size,
        lamination,
        count,
        material: { type: "Не потрібно", thickness: "", material: "", materialId: "", typeUse: "" },
        color: { sides: "Не потрібно", one: "", two: "", allSidesColor: "" },
        big: "Не потрібно",
        cute: "Не потрібно",
        cuteLocal: { leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" },
        holes: "Не потрібно",
        holesR: "",
        prokleyka: "Не потрібно",
        lyuversy: "Не потрібно",
        design: "Не потрібно",
      },
      editingOrderUnit,
      setError
    );
  };

  // ========== RENDER HELPERS ==========
  const thicknessTitle = lamination.size ? `${lamination.size} мкм` : "-";

  // ========== PRICING DATA ==========
  const pricingLines = pricesThis
    ? [{
        label: "Ламінація",
        perUnit: pricesThis.priceForThisUnitOfLamination || 0,
        count: pricesThis.skolko || 0,
        total: pricesThis.priceForThisAllUnitsOfLamination || 0,
      }]
    : [];

  // ========== RENDER ==========

  const totalPrice = Number(pricesThis?.price) || 0;

  const headSpec = [
    `${size.x}×${size.y} мм`,
    LABELS[lamination.material] ? LABELS[lamination.material].toLowerCase() : lamination.material,
    lamination.size ? `${lamination.size} мкм` : null,
  ].filter(Boolean).join(" · ");

  /* Власний розмір скидає підібрану плівку так само, як і готовий формат:
     товщини залежать від розміру аркуша */
  const setCustomSize = (next) => {
    setSize(next);
    setLamination((prev) => ({ ...prev, materialId: "", size: "" }));
  };

  if (!showLaminator) return null;

  return (
    <>
      <div className="v2-overlay" onClick={handleClose} />
      <div className={`v2-modal v2-modal-narrow v2-theme-${theme}`} onClick={(e) => e.stopPropagation()}>

        {/* ШАПКА */}
        <div className="v2-head">
          <div className="v2-head-main">
            <span className="v2-head-title">Ламінація</span>
            <div className="v2-head-spec">{headSpec}</div>
          </div>
          <ExtraSheetsButton />
          <button className="v2-close-btn" onClick={handleClose} title="Закрити" aria-label="Закрити">
            &times;
          </button>
        </div>

        {/* ТІЛО — без лівої стрічки виробів: у ламінації немає виробів,
            є лише формат, тип плівки й товщина */}
        <div className="v2-body">
          <div className="v2-left">

            {/* РОЗМІР */}
            <div className="v2-section">
              <span className="v2-label">Розмір у міліметрах</span>
              <div className="v2-sizes">
                {SIZE_FORMATS.map((f) => (
                  <button
                    key={f.name}
                    className={`v2-size${size.x === f.x && size.y === f.y ? " active" : ""}`}
                    onClick={() => handleSizeSelect(f)}
                  >
                    {f.name.split(" ")[0]}
                  </button>
                ))}
                <div className={`v2-size v2-size-custom${!SIZE_FORMATS.some((f) => size.x === f.x && size.y === f.y) ? " active" : ""}`}>
                  <input
                    type="number"
                    value={size.x}
                    min={10}
                    max={445}
                    onChange={(e) => setCustomSize({ x: Number(e.target.value) || 0, y: size.y })}
                  />
                  <span>×</span>
                  <input
                    type="number"
                    value={size.y}
                    min={10}
                    max={445}
                    onChange={(e) => setCustomSize({ x: size.x, y: Number(e.target.value) || 0 })}
                  />
                  <span>мм</span>
                </div>
              </div>
            </div>

            {/* ТИП ПЛІВКИ */}
            <div className="v2-section">
              <span className="v2-label">Плівка</span>
              <div className="v2-thick-btns" style={{ gridTemplateColumns: `repeat(${LAMINATION_BUTTONS.length}, 1fr)` }}>
                {LAMINATION_BUTTONS.map((item) => (
                  <button
                    key={item}
                    className={`v2-thick-btn${lamination.material === item ? " active" : ""}`}
                    onClick={() => handleLaminationTypeClick(item)}
                  >
                    {LABELS[item] || item}
                  </button>
                ))}
              </div>
            </div>

            {/* ТОВЩИНА */}
            <div className="v2-section">
              <span className="v2-label">Товщина</span>
              <div className="v2-material-wrap">
                <div
                  className={`custom-select-container selectArtem selectArtemBefore${lamination.size ? " sc-has-value" : ""}`}
                  ref={thicknessDropdownRef}
                  style={{ width: "100%" }}
                >
                  <div className="custom-select-header" onClick={toggleThickness}>
                    {thicknessTitle}
                  </div>
                  {thicknessDropdownOpen && ReactDOM.createPortal(
                    <div
                      className={`custom-select-dropdown v2-dropdown v2-theme-${theme}`}
                      ref={portalThicknessRef}
                      style={dropStyleThickness}
                    >
                      {thisLaminationSizes.map((item) => (
                        <div
                          key={item.id}
                          className={`custom-option ${String(item.id) === String(lamination.materialId) ? "active" : ""}`}
                          onClick={() => handleThicknessSelect(item)}
                        >
                          <span className="name">{item.thickness} мкм</span>
                        </div>
                      ))}
                    </div>,
                    document.body
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ПРАВОРУЧ — НАРЯД */}
          <div className="v2-right">
            <div className="v2-run">
              <span className="v2-run-label">Наклад, шт</span>
              <div className="v2-count-row">
                <button className="v2-count-btn" onClick={() => setCount(Math.max(1, count - 1))}>−</button>
                <input
                  className="v2-count-val"
                  type="number"
                  value={count}
                  min={1}
                  onChange={(e) => setCount(Number(e.target.value) || 1)}
                />
                <button className="v2-count-btn" onClick={() => setCount(count + 1)}>+</button>
              </div>
            </div>

            <div className="v2-prices-title">Калькуляція</div>
            <div className="v2-prices">
              {pricingLines.map((line, i) => {
                const isZero = Math.round((line.total || 0) * 100) === 0;
                const hasBreakdown = !isZero && line.count > 0 && line.perUnit > 0;
                return (
                  <div className={`v2-price-row${isZero ? " is-zero" : ""}`} key={i}>
                    <span>{line.label}</span>
                    <i className="v2-lead" />
                    <span className="v2-price-val">
                      {hasBreakdown && (
                        <span className="v2-price-calc">
                          {line.count} арк × {fmt2(line.perUnit)} ={" "}
                        </span>
                      )}
                      {fmt2(line.total)} грн
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="v2-total">
              <div className="v2-total-price">
                {fmt2(totalPrice)} <span className="v2-total-unit">грн</span>
              </div>
              <div className="v2-total-sub">
                <span>За 1 виріб</span>
                <span>{count ? fmt2(totalPrice / count) : "0,00"} грн</span>
              </div>
            </div>

            <button className="v2-add-btn" onClick={handleSave} disabled={!thisOrder?.id}>
              <span className="v2-add-btn-icon" aria-hidden="true">{isEdit ? "✓" : "+"}</span>
              <span className="v2-add-btn-label">
                {isEdit ? "Зберегти зміни" : "Додати в замовлення"}
              </span>
            </button>
          </div>
        </div>

        {/* ПОМИЛКА */}
        {error && (
          <div className="v2-error">
            {typeof error === "string" ? error : error?.response?.data?.error || "Помилка"}
          </div>
        )}
      </div>
    </>
  );
};

export default Laminator;
