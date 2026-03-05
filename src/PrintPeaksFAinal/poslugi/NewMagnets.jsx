import React, { useEffect, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import { usePortalDropdown } from "./newnomodals/usePortalDropdown";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import { ScModal, ScSection, ScCountSize, ScPricing, ScAddButton } from "./shared";
import { useModalState, useModalPricing, useOrderUnitSave } from "./shared/hooks";
import "./Poslugy.css";

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

  // Dropdowns
  const [materials, setMaterials] = useState([]);
  const { open: sizeDropdownOpen, setOpen: setSizeDropdownOpen, style: dropStyleSize, toggle: toggleSize, triggerRef: sizeDropdownRef, portalRef: portalSizeRef } = usePortalDropdown();
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

  const { pricesThis } = useModalPricing("Magnets", calcData, showNewMagnets);

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
      setSizeDropdownOpen(false);
      return;
    }
    setIsCustomSize(false);
    setSize({ x: format.x, y: format.y });
    setSizeDropdownOpen(false);
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
  const selectedSizeFormat = SIZE_FORMATS.find((f) => !f.custom && f.x === size.x && f.y === size.y);
  const sizeTitle = isCustomSize ? "Задати свій розмір" : (selectedSizeFormat?.name || `${size.x} x ${size.y} мм`);
  const materialTitle = material?.material || "Виберіть матеріал";

  // ========== PRICING DATA ==========
  const totalM2 = pricesThis?.allTotalSizeInM2 || 0;

  const pricingLines = pricesThis
    ? [
        { label: "Матеріали", perUnit: pricesThis.pricePaperPerSheet, count: totalM2, total: (pricesThis.pricePaperPerSheet || 0) * totalM2 },
      ]
    : [];

  const pricingExtras = pricesThis
    ? [{ label: "За виріб", value: `${fmt2(pricesThis.priceForItemWithExtras || 0)} грн` }]
    : [];

  // ========== RENDER ==========
  return (
    <ScModal
      show={showNewMagnets}
      onClose={handleClose}
      modalStyle={{ width: "45vw" }}
      rightContent={
        <>
          <ScPricing
            lines={pricingLines}
            totalPrice={Number(pricesThis?.price) || 0}
            extras={pricingExtras}
            fmt={fmt2}
            countUnit="м2"
          />
          <ScAddButton onClick={handleSave} isEdit={isEdit} />
        </>
      }
      errorContent={
        error && (
          <div className="sc-error">
            {typeof error === "string" ? error : error?.response?.data?.error || "Помилка"}
          </div>
        )
      }
    >
      {/* 1. Кількість + Розмір */}
      <ScCountSize
        count={count}
        onCountChange={(v) => setCount(v)}
        sizeComponent={
          <div style={{ width: "100%" }}>
            <div
              className={`custom-select-container selectArtem selectArtemBefore${sizeTitle ? " sc-has-value" : ""}`}
              ref={sizeDropdownRef}
              style={{ zIndex: 10, width: "100%" }}
            >
              <div
                className="custom-select-header"
                onClick={toggleSize}
              >
                {sizeTitle}
              </div>
              {sizeDropdownOpen && ReactDOM.createPortal(
                <div className="custom-select-dropdown" ref={portalSizeRef} style={dropStyleSize}>
                  {SIZE_FORMATS.map((item) => (
                    <div
                      key={item.name}
                      className={`custom-option ${item.name === sizeTitle ? "active" : ""}`}
                      onClick={() => handleSizeSelect(item)}
                    >
                      <span className="name">{item.name}</span>
                    </div>
                  ))}
                </div>,
                document.body
              )}
            </div>
            {isCustomSize && (
              <div className="d-flex align-items-center justify-content-center" style={{ gap: "8px", marginTop: "8px" }}>
                <input
                  className="inputsArtem"
                  type="number"
                  min={1}
                  value={size.x}
                  onChange={(e) => handleCustomSizeChange("x", e.target.value)}
                />
                <span style={{ color: "var(--admingrey)", fontWeight: 600 }}>x</span>
                <input
                  className="inputsArtem"
                  type="number"
                  min={1}
                  value={size.y}
                  onChange={(e) => handleCustomSizeChange("y", e.target.value)}
                />
                <span className="inputsArtemx" style={{ border: "transparent" }}>мм</span>
              </div>
            )}
          </div>
        }
      />

      {/* 2. Матеріал */}
      <ScSection title="" style={{ position: "relative", zIndex: 5 }}>
        <div
          className={`custom-select-container selectArtem selectArtemBefore${material.materialId ? " sc-has-value" : ""}`}
          ref={materialDropdownRef}
          style={{ width: "100%" }}
        >
          <div
            className="custom-select-header"
            onClick={toggleMaterial}
          >
            {materialTitle}
          </div>
          {materialDropdownOpen && ReactDOM.createPortal(
            <div className="custom-select-dropdown" ref={portalMaterialRef} style={dropStyleMaterial}>
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
      </ScSection>

    </ScModal>
  );
};

export default NewMagnets;
