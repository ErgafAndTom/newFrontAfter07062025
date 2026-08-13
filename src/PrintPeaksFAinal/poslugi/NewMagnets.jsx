import React, { useEffect, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import { usePortalDropdown } from "./newnomodals/usePortalDropdown";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import { useModalState, useModalPricing, useOrderUnitSave } from "./shared/hooks";
import { getStoredAppTheme, onAppThemeChange } from "../../utils/appTheme";

/* Та сама розмітка й той самий CSS, що в еталонного цифрового друку
   (NewSheetCutV2) — вузький варіант, без стрічки виробів. */
import "./NewSheetCutV2.css";
import ExtraSheetsButton from "./shared/ExtraSheetsButton";

// ========== DEFAULTS ==========
const DEFAULTS = {
  size: { x: 105, y: 148 },
  material: {
    type: "Магніт",
    thickness: "",
    material: "",
    materialId: "",
  },
  color: {
    sides: "односторонній",
    one: "",
    two: "",
    allSidesColor: "CMYK",
  },
  count: 1,
};

const SIZE_FORMATS = [
  { name: "Задати свій розмір", custom: true },
  { name: "А7 (74 x 105 мм)", x: 74, y: 105 },
  { name: "А6 (105 x 148 мм)", x: 105, y: 148 },
  { name: "А5 (148 x 210 мм)", x: 148, y: 210 },
  { name: "А4 (210 x 297 мм)", x: 210, y: 297 },
  { name: "А3 (297 x 420 мм)", x: 297, y: 420 },
];

const fmt2 = (v) =>
  new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v));

const NewMagnets = ({
  thisOrder,
  setThisOrder,
  setSelectedThings2,
  showNewMagnets,
  setShowNewMagnets,
  editingOrderUnit,
  setEditingOrderUnit,
}) => {
  const navigate = useNavigate();

  // Modal state detection
  const { isEdit, options } = useModalState(editingOrderUnit, showNewMagnets);

  // ========== STATE ==========
  const [size, setSize] = useState(DEFAULTS.size);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [color, setColor] = useState(DEFAULTS.color);
  const [count, setCount] = useState(DEFAULTS.count);
  const [error, setError] = useState(null);

  // тема стежить за глобальною темою застосунку (перемикач у Nav)
  const [theme, setTheme] = useState(getStoredAppTheme);
  useEffect(() => onAppThemeChange(setTheme), []);

  // Dropdowns
  const [materials, setMaterials] = useState([]);
  const { open: materialDropdownOpen, setOpen: setMaterialDropdownOpen, style: dropStyleMaterial, toggle: toggleMaterial, triggerRef: materialDropdownRef, portalRef: portalMaterialRef } = usePortalDropdown();

  // Pricing hook
  const calcData = useMemo(
    () => ({
      size,
      material,
      color: { sides: "Не потрібно", one: "", two: "", allSidesColor: "CMYK" },
      lamination: { type: "Не потрібно", material: "" },
      big: "Не потрібно",
      cute: "Не потрібно",
      cuteLocal: { leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" },
      holes: "Не потрібно",
      holesR: "Не потрібно",
      count,
    }),
    [size, material, count]
  );

  const { pricesThis } = useModalPricing("Magnets", calcData, showNewMagnets, 300, editingOrderUnit);

  // Save hook
  const { saveOrderUnit } = useOrderUnitSave(
    thisOrder,
    setThisOrder,
    setSelectedThings2,
    () => setShowNewMagnets(false),
    setEditingOrderUnit
  );

  const handleClose = () => {
    if (setEditingOrderUnit) setEditingOrderUnit(null);
    setShowNewMagnets(false);
  };

  // ========== EFFECTS ==========

  useEffect(() => {
    if (!showNewMagnets) return;

    if (!isEdit) {
      setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setCount(DEFAULTS.count);
      setIsCustomSize(false);
      setError(null);
      return;
    }

    const opt = options || {};
    const safeNum = (v, fb) => { const n = Number(v); return Number.isFinite(n) ? n : fb; };

    setCount(safeNum(opt?.count, safeNum(editingOrderUnit?.amount, DEFAULTS.count)) || DEFAULTS.count);
    const nextSize = {
      x: safeNum(opt?.size?.x, DEFAULTS.size.x),
      y: safeNum(opt?.size?.y, DEFAULTS.size.y),
    };
    setSize(nextSize);
    setIsCustomSize(!SIZE_FORMATS.some((f) => !f.custom && f.x === nextSize.x && f.y === nextSize.y));
    setMaterial({
      type: opt?.material?.type ?? DEFAULTS.material.type,
      thickness: opt?.material?.thickness ?? DEFAULTS.material.thickness,
      material: opt?.material?.material ?? DEFAULTS.material.material,
      materialId: opt?.material?.materialId ?? DEFAULTS.material.materialId,
    });
    setColor(opt?.color ?? DEFAULTS.color);
    setError(null);
  }, [showNewMagnets, isEdit, options, editingOrderUnit]);

  // Fetch materials
  useEffect(() => {
    if (!showNewMagnets) return;

    axios
      .post(`/materials/NotAll`, {
        name: "MaterialsPrices",
        inPageCount: 999999,
        currentPage: 1,
        search: "",
        columnName: { column: "id", reverse: false },
        material,
        size,
      })
      .then((response) => {
        const rows = response.data.rows || [];
        setMaterials(rows);
        if (rows.length > 0 && !material.materialId) {
          setMaterial((prev) => ({
            ...prev,
            material: rows[0].name,
            materialId: rows[0].id,
          }));
        }
      })
      .catch((err) => {
        setMaterials([]);
        if (err?.response?.status === 403) navigate("/login");
      });
  }, [material?.type, size, showNewMagnets, navigate]);

  // ========== HANDLERS ==========

  const handleSizeSelect = (format) => {
    if (format.custom) {
      setIsCustomSize(true);
      return;
    }
    setIsCustomSize(false);
    setSize({ x: format.x, y: format.y });
  };

  const handleCustomSizeChange = (field, value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(1, Math.round(n));
    setSize((prev) => ({ ...prev, [field]: clamped }));
  };

  const handleMaterialSelect = (item) => {
    setMaterial((prev) => ({
      ...prev,
      material: item?.name || "",
      materialId: item?.id || 0,
    }));
    setMaterialDropdownOpen(false);
  };

  const handleSave = () => {
    saveOrderUnit(
      {
        nameOrderUnit: "Магнітах ",
        type: "Magnets",
        size,
        material,
        color: { sides: "Не потрібно", one: "", two: "", allSidesColor: "CMYK" },
        lamination: { type: "Не потрібно", material: "" },
        big: "Не потрібно",
        cute: "Не потрібно",
        cuteLocal: { leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" },
        holes: "Не потрібно",
        holesR: "Не потрібно",
        count,
      },
      editingOrderUnit,
      setError
    );
  };

  // ========== RENDER HELPERS ==========
  const materialTitle = material?.material || "Виберіть матеріал";

  // ========== PRICING DATA ==========
  const totalM2 = pricesThis?.allTotalSizeInM2 || 0;

  const pricingLines = pricesThis
    ? [
        { label: "Матеріали", perUnit: pricesThis.pricePaperPerSheet, count: totalM2, total: (pricesThis.pricePaperPerSheet || 0) * totalM2 },
      ]
    : [];


  // ========== RENDER ==========

  const totalPrice = Number(pricesThis?.price) || 0;

  const headSpec = [
    `${size.x}×${size.y} мм`,
    material?.material || null,
  ].filter(Boolean).join(" · ");

  /* Готові формати без службового пункту «Задати свій розмір» — власний
     розмір тепер живе окремою плиткою просто в сітці */
  const sizePresets = SIZE_FORMATS.filter((f) => !f.custom);

  if (!showNewMagnets) return null;

  return (
    <>
      <div className="v2-overlay" onClick={handleClose} />
      <div className={`v2-modal v2-modal-narrow v2-theme-${theme}`} onClick={(e) => e.stopPropagation()}>

        {/* ШАПКА */}
        <div className="v2-head">
          <div className="v2-head-main">
            <span className="v2-head-title">Магніти</span>
            <div className="v2-head-spec">{headSpec}</div>
          </div>
          <ExtraSheetsButton />
          <button className="v2-close-btn" onClick={handleClose} title="Закрити" aria-label="Закрити">
            &times;
          </button>
        </div>

        {/* ТІЛО — виробів тут немає, тож і лівої стрічки теж */}
        <div className="v2-body">
          <div className="v2-left">

            {/* РОЗМІР */}
            <div className="v2-section">
              <span className="v2-label">Розмір у міліметрах</span>
              <div className="v2-sizes">
                {sizePresets.map((f) => (
                  <button
                    key={f.name}
                    className={`v2-size${!isCustomSize && size.x === f.x && size.y === f.y ? " active" : ""}`}
                    onClick={() => handleSizeSelect(f)}
                  >
                    {f.name.split(" ")[0]}
                  </button>
                ))}
                <div className={`v2-size v2-size-custom${isCustomSize ? " active" : ""}`}>
                  <input
                    type="number"
                    min={1}
                    value={size.x}
                    onChange={(e) => { setIsCustomSize(true); handleCustomSizeChange("x", e.target.value); }}
                  />
                  <span>×</span>
                  <input
                    type="number"
                    min={1}
                    value={size.y}
                    onChange={(e) => { setIsCustomSize(true); handleCustomSizeChange("y", e.target.value); }}
                  />
                  <span>мм</span>
                </div>
              </div>
            </div>

            {/* МАТЕРІАЛ */}
            <div className="v2-section">
              <span className="v2-label">Матеріал</span>
              <div className="v2-material-wrap">
                <div
                  className={`custom-select-container selectArtem selectArtemBefore${material.materialId ? " sc-has-value" : ""}`}
                  ref={materialDropdownRef}
                  style={{ width: "100%" }}
                >
                  <div className="custom-select-header" onClick={toggleMaterial}>
                    {materialTitle}
                  </div>
                  {materialDropdownOpen && ReactDOM.createPortal(
                    <div
                      className={`custom-select-dropdown v2-dropdown v2-theme-${theme}`}
                      ref={portalMaterialRef}
                      style={dropStyleMaterial}
                    >
                      {materials.map((item) => (
                        <div
                          key={item.id}
                          className={`custom-option ${String(item.id) === String(material?.materialId) ? "active" : ""}`}
                          onClick={() => handleMaterialSelect(item)}
                        >
                          <span className="name">{item.name}</span>
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
                  onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
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
                          {fmt2(line.count)} м² × {fmt2(line.perUnit)} ={" "}
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
                <span>За виріб</span>
                <span>{fmt2(pricesThis?.priceForItemWithExtras || 0)} грн</span>
              </div>
              <div className="v2-total-sub">
                <span>Площа</span>
                <span>{fmt2(totalM2)} м²</span>
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

export default NewMagnets;
