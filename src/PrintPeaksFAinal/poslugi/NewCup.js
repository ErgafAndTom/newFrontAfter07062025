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

// ========== DEFAULTS ==========
const DEFAULTS = {
  material: {
    type: "Чашки",
    thickness: "Чашка",
    material: "",
    materialId: "",
    typeUse: "Офісний",
  },
  count: 1,
};

const fmt2 = (v) =>
  new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v));

const NewCup = ({
  thisOrder,
  setThisOrder,
  setSelectedThings2,
  showNewCup,
  setShowNewCup,
  editingOrderUnit,
  setEditingOrderUnit,
  onOpenMockup,
}) => {
  const navigate = useNavigate();

  // Modal state detection
  const { isEdit, options } = useModalState(editingOrderUnit, showNewCup);

  // ========== STATE ==========
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [count, setCount] = useState(DEFAULTS.count);
  const [error, setError] = useState(null);

  // тема стежить за глобальною темою застосунку (перемикач у Nav)
  const [theme, setTheme] = useState(getStoredAppTheme);
  useEffect(() => onAppThemeChange(setTheme), []);

  // Dropdown
  const [materials, setMaterials] = useState([]);
  const { open: materialDropdownOpen, setOpen: setMaterialDropdownOpen, style: dropStyle, toggle: toggleMaterial, triggerRef: materialDropdownRef, portalRef } = usePortalDropdown();

  // Pricing hook
  const calcData = useMemo(
    () => ({ size: { x: 0, y: 0 }, material, count }),
    [material, count]
  );

  const { pricesThis } = useModalPricing("Cup", calcData, showNewCup, 300, editingOrderUnit);

  // Save hook
  const { saveOrderUnit } = useOrderUnitSave(
    thisOrder,
    setThisOrder,
    setSelectedThings2,
    () => setShowNewCup(false),
    setEditingOrderUnit
  );

  const handleClose = () => {
    if (setEditingOrderUnit) setEditingOrderUnit(null);
    setShowNewCup(false);
  };

  // ========== EFFECTS ==========

  useEffect(() => {
    if (!showNewCup) return;

    if (!isEdit) {
      setMaterial(DEFAULTS.material);
      setCount(DEFAULTS.count);
      setError(null);
      return;
    }

    const opt = options || {};
    setCount(opt.count ?? editingOrderUnit?.amount ?? DEFAULTS.count);
    setMaterial({
      type: opt?.material?.type ?? DEFAULTS.material.type,
      thickness: opt?.material?.thickness ?? DEFAULTS.material.thickness,
      material: opt?.material?.material ?? DEFAULTS.material.material,
      materialId: opt?.material?.materialId ?? DEFAULTS.material.materialId,
      typeUse: opt?.material?.typeUse ?? DEFAULTS.material.typeUse,
    });
    setError(null);
  }, [showNewCup, isEdit, options, editingOrderUnit]);

  // Fetch materials
  useEffect(() => {
    if (!showNewCup) return;

    axios
      .post(`/materials/NotAll`, {
        name: "MaterialsPrices",
        inPageCount: 999999,
        currentPage: 1,
        search: "",
        columnName: { column: "id", reverse: false },
        size: { x: 0, y: 0 },
        material: { ...material, type: "Чашки" },
      })
      .then((response) => {
        const rows = response.data.rows || [];
        setMaterials(rows);
        if (!material.materialId && rows.length > 0) {
          const def = rows[0];
          setMaterial((prev) => ({
            ...prev,
            material: def.name,
            materialId: def.id,
          }));
        }
      })
      .catch((err) => {
        setMaterials([]);
        if (err?.response?.status === 403) navigate("/login");
      });
  }, [showNewCup, navigate]);

  // ========== HANDLERS ==========

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
        nameOrderUnit: "Кружка",
        type: "Cup",
        size: { x: 0, y: 0 },
        material,
        count,
        lamination: { type: "Не потрібно", material: "", materialId: "", size: "", typeUse: "" },
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
  const materialTitle = material?.material || "Виберіть чашку";

  // ========== PRICING DATA ==========
  const pricingLines = pricesThis
    ? [{
        label: "Друк",
        perUnit: pricesThis.priceForThisUnitOfCup || 0,
        count: pricesThis.skolko || 0,
        total: pricesThis.priceForAllUnitOfCup || 0,
      }]
    : [];

  // ========== RENDER ==========

  const totalPrice = Number(pricesThis?.price) || 0;
  const cupVolume = materials.find((m) => m.id === material.materialId)?.thickness || "";

  const headSpec = [
    material?.material || null,
    cupVolume ? `${cupVolume} мл` : null,
  ].filter(Boolean).join(" · ");

  if (!showNewCup) return null;

  return (
    <>
      <div className="v2-overlay" onClick={handleClose} />
      <div className={`v2-modal v2-modal-narrow v2-theme-${theme}`} onClick={(e) => e.stopPropagation()}>

        {/* ШАПКА */}
        <div className="v2-head">
          <div className="v2-head-main">
            <span className="v2-head-title">Чашки</span>
            <div className="v2-head-spec">{headSpec}</div>
          </div>
          <button className="v2-close-btn" onClick={handleClose} title="Закрити" aria-label="Закрити">
            &times;
          </button>
        </div>

        {/* ТІЛО — виробів тут немає, тож і лівої стрічки теж */}
        <div className="v2-body">
          <div className="v2-left">

            {/* ЧАШКА */}
            <div className="v2-section">
              <span className="v2-label">Чашка</span>
              <div className="v2-material-wrap">
                <div
                  className={`custom-select-container selectArtem selectArtemBefore${material.materialId ? " sc-has-value" : ""}`}
                  ref={materialDropdownRef}
                  style={{ width: "100%" }}
                >
                  <div className="custom-select-header" onClick={toggleMaterial}>
                    {materialTitle}
                    {material.material && (
                      <span className="gsm-sub" style={{ marginLeft: "0.5vw" }}>
                        <sub>{cupVolume} мл</sub>
                      </span>
                    )}
                  </div>
                  {materialDropdownOpen && ReactDOM.createPortal(
                    <div
                      className={`custom-select-dropdown v2-dropdown v2-theme-${theme}`}
                      ref={portalRef}
                      style={dropStyle}
                    >
                      {materials.map((item) => (
                        <div
                          key={item.id}
                          className={`custom-option ${String(item.id) === String(material?.materialId) ? "active" : ""}`}
                          onClick={() => handleMaterialSelect(item)}
                        >
                          <span className="name">{item.name}</span>
                          {item.thickness > 0 && (
                            <span className="gsm-sub">
                              <sub>{item.thickness} мл</sub>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>,
                    document.body
                  )}
                </div>
              </div>
            </div>

            {/* МАКЕТ */}
            {onOpenMockup && (
              <div className="v2-section">
                <span className="v2-label">Макет</span>
                <div className="v2-sides" style={{ gridTemplateColumns: "1fr" }}>
                  <button
                    type="button"
                    className="v2-side"
                    onClick={(e) => { e.stopPropagation(); onOpenMockup(); }}
                  >
                    Візуалізація
                  </button>
                </div>
              </div>
            )}
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
                          {line.count} шт × {fmt2(line.perUnit)} ={" "}
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
                <span>За 1 чашку</span>
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

export default NewCup;
