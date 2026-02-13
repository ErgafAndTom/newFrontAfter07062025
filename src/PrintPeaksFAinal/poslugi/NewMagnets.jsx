import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import ServiceModalWrapper from "./shared/ServiceModalWrapper";
import CountInput from "./shared/CountInput";
import { useModalState, useModalPricing, useOrderUnitSave } from "./shared/hooks";
import "./shared/ServiceModal.css";

// ========== DEFAULTS ==========
const DEFAULT_SIZE = { x: 100, y: 150 };

const DEFAULTS = {
  size: DEFAULT_SIZE,
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
  lamination: {
    type: "Не потрібно",
    material: "",
  },
  count: 1,
  cuteLocal: {
    leftTop: false,
    rightTop: false,
    rightBottom: false,
    leftBottom: false,
    radius: "",
  },
};

const SIZE_FORMATS = [
  { name: "Задати свій розмір", x: 0, y: 0 },
  { name: "100 x 150 мм", x: 100, y: 150 },
  { name: "90 x 50 мм", x: 90, y: 50 },
  { name: "85 x 55 мм", x: 85, y: 55 },
  { name: "A5 (148 x 210 мм)", x: 148, y: 210 },
  { name: "A4 (210 x 297 мм)", x: 210, y: 297 },
  { name: "A3 (297 x 420 мм)", x: 297, y: 420 },
];

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
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [color, setColor] = useState(DEFAULTS.color);
  const [count, setCount] = useState(DEFAULTS.count);
  const [error, setError] = useState(null);

  // Dropdowns
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [customSize, setCustomSize] = useState(false);
  const [localX, setLocalX] = useState(DEFAULT_SIZE.x);
  const [localY, setLocalY] = useState(DEFAULT_SIZE.y);

  const sizeDropdownRef = useRef(null);
  const materialDropdownRef = useRef(null);

  // Pricing hook
  const calcData = useMemo(
    () => ({
      size,
      material,
      color,
      lamination: DEFAULTS.lamination,
      big: "Не потрібно",
      cute: "Не потрібно",
      cuteLocal: DEFAULTS.cuteLocal,
      holes: "Не потрібно",
      holesR: "Не потрібно",
      count,
    }),
    [size, material, color, count]
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

  // ========== EFFECTS ==========

  // Initialize/reset state when modal opens
  useEffect(() => {
    if (!showNewMagnets) return;

    // NEW mode - set defaults
    if (!isEdit) {
      setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setCount(DEFAULTS.count);
      setLocalX(DEFAULTS.size.x);
      setLocalY(DEFAULTS.size.y);
      setCustomSize(false);
      setError(null);
      return;
    }

    // EDIT mode - load from options
    const opt = options || {};

    const safeNum = (v, fallback) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    };

    setCount(safeNum(opt?.count, safeNum(editingOrderUnit?.amount, DEFAULTS.count)) || DEFAULTS.count);

    setSize({
      x: safeNum(opt?.size?.x, DEFAULT_SIZE.x),
      y: safeNum(opt?.size?.y, DEFAULT_SIZE.y),
    });
    setLocalX(safeNum(opt?.size?.x, DEFAULT_SIZE.x));
    setLocalY(safeNum(opt?.size?.y, DEFAULT_SIZE.y));

    setMaterial({
      type: opt?.material?.type ?? DEFAULTS.material.type,
      thickness: opt?.material?.thickness ?? DEFAULTS.material.thickness,
      material: opt?.material?.material ?? DEFAULTS.material.material,
      materialId: opt?.material?.materialId ?? DEFAULTS.material.materialId,
    });

    setColor({
      sides: opt?.color?.sides ?? DEFAULTS.color.sides,
      one: opt?.color?.one ?? DEFAULTS.color.one,
      two: opt?.color?.two ?? DEFAULTS.color.two,
      allSidesColor: opt?.color?.allSidesColor ?? DEFAULTS.color.allSidesColor,
    });

    // Check if custom size
    const foundFormat = SIZE_FORMATS.find(
      (f) => f.x === safeNum(opt?.size?.x, DEFAULT_SIZE.x) && f.y === safeNum(opt?.size?.y, DEFAULT_SIZE.y) && f.x !== 0
    );
    setCustomSize(!foundFormat);

    setError(null);
  }, [showNewMagnets, isEdit, options, editingOrderUnit]);

  // Fetch materials
  useEffect(() => {
    if (!showNewMagnets) return;

    const data = {
      name: "MaterialsPrices",
      inPageCount: 999999,
      currentPage: 1,
      search: "",
      columnName: { column: "id", reverse: false },
      material,
      size,
    };

    axios
      .post(`/materials/NotAll`, data)
      .then((response) => {
        const rows = response.data.rows || [];
        setMaterials(rows);

        // Auto-select first material if none selected
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
        if (err?.response?.status === 403) {
          navigate("/login");
        }
      });
  }, [material?.type, size, showNewMagnets, navigate]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target)) {
        setSizeDropdownOpen(false);
      }
      if (materialDropdownRef.current && !materialDropdownRef.current.contains(event.target)) {
        setMaterialDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ========== HANDLERS ==========

  const handleSizeSelect = (format) => {
    if (format.name === "Задати свій розмір") {
      setCustomSize(true);
      setSizeDropdownOpen(false);
      return;
    }

    setSize({ x: format.x, y: format.y });
    setLocalX(format.x);
    setLocalY(format.y);
    setCustomSize(false);
    setSizeDropdownOpen(false);
  };

  const applyCustomSize = () => {
    setSize({ x: localX, y: localY });
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
    if (!material?.materialId) {
      setError("Виберіть будь ласка матеріал");
      return;
    }

    const toCalcData = {
      nameOrderUnit: "Магнітах ",
      type: "Magnets",
      size,
      material,
      color,
      lamination: DEFAULTS.lamination,
      big: "Не потрібно",
      cute: "Не потрібно",
      cuteLocal: DEFAULTS.cuteLocal,
      holes: "Не потрібно",
      holesR: "Не потрібно",
      count,
    };

    saveOrderUnit(toCalcData, editingOrderUnit, setError);
  };

  // ========== RENDER HELPERS ==========

  const selectedSizeFormat = SIZE_FORMATS.find((f) => f.x === size.x && f.y === size.y && f.x !== 0);
  const sizeTitle = customSize
    ? "Задати свій розмір"
    : selectedSizeFormat?.name || `${size.x} x ${size.y} мм`;
  const materialTitle = material?.material || "Виберіть матеріал";

  // Custom pricing summary for Magnets
  const MagnetsPrice = () => {
    if (!pricesThis) {
      return (
        <div className="bw-summary-title">
          <div className="bw-sticky">
            <div className="bwsubOP">Розрахунок завантажується...</div>
          </div>
        </div>
      );
    }

    return (
      <div className="bw-summary-title">
        <div className="bw-sticky">
          <div className="bwsubOP">Друк:</div>
          <div className="bw-calc-line">
            {parseFloat(pricesThis.priceDrukPerSheet || 0).toFixed(2)}
            <span className="bw-sub">грн</span>
            <span className="bw-op">×</span>
            {pricesThis.sheetCount || 0}
            <span className="bw-sub">м2</span>
            <span className="bw-op">=</span>
            {(parseFloat(pricesThis.priceDrukPerSheet || 0) * (pricesThis.sheetCount || 0)).toFixed(2)}
            <span className="bw-sub">грн</span>
          </div>

          <div className="bwsubOP">Матеріали:</div>
          <div className="bw-calc-line">
            {parseFloat(pricesThis.pricePaperPerSheet || 0).toFixed(2)}
            <span className="bw-sub">грн</span>
            <span className="bw-op">×</span>
            {pricesThis.sheetCount || 0}
            <span className="bw-sub">м2</span>
            <span className="bw-op">=</span>
            {(parseFloat(pricesThis.pricePaperPerSheet || 0) * (pricesThis.sheetCount || 0)).toFixed(2)}
            <span className="bw-sub">грн</span>
          </div>

          {pricesThis.porizka !== 0 && (
            <>
              <div className="bwsubOP">Порізка:</div>
              <div className="bw-calc-line">
                {parseFloat(pricesThis.porizka || 0).toFixed(2)}
                <span className="bw-sub">грн</span>
                <span className="bw-op">×</span>
                {pricesThis.sheetCount || 0}
                <span className="bw-sub">шт</span>
                <span className="bw-op">=</span>
                {(parseFloat(pricesThis.porizka || 0) * (pricesThis.sheetCount || 0)).toFixed(2)}
                <span className="bw-sub">грн</span>
              </div>
            </>
          )}

          <div
            className="bw-calc-total d-flex justify-content-center align-content-center"
            style={{ fontWeight: "500", color: "red" }}
          >
            {parseFloat(pricesThis.price || 0).toFixed(2)}
            <span className="bw-sub">грн</span>
          </div>

          {pricesThis.priceForItemWithExtras && (
            <div className="bw-calc-line" style={{ marginTop: "8px" }}>
              <span className="bwsubOP">За виріб:</span>
              {parseFloat(pricesThis.priceForItemWithExtras || 0).toFixed(2)}
              <span className="bw-sub">грн</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ========== LEFT CONTENT ==========
  const leftContent = (
    <>
      {/* Count */}
      <div className="bw-title">Кількість</div>
      <div className="bw-row">
        <CountInput count={count} setCount={setCount} />
      </div>

      {/* Size */}
      <div className="bw-title">Розмір</div>
      <div className="bw-row">
        <div className="d-flex flex-row justify-content-between align-items-center w-100 gap-2">
          {/* Custom size inputs */}
          {customSize && (
            <div className="d-flex align-items-center gap-1">
              <input
                className="inputsArtem"
                type="number"
                value={localX}
                min={10}
                max={1000}
                onChange={(e) => setLocalX(Number(e.target.value))}
                onBlur={applyCustomSize}
                style={{ width: "60px" }}
              />
              <span style={{ color: "#666" }}>x</span>
              <input
                className="inputsArtem"
                type="number"
                value={localY}
                min={10}
                max={1000}
                onChange={(e) => setLocalY(Number(e.target.value))}
                onBlur={applyCustomSize}
                style={{ width: "60px" }}
              />
              <span style={{ color: "#666", fontSize: "12px" }}>мм</span>
            </div>
          )}

          {/* Size Dropdown */}
          <div
            className="custom-select-container selectArtem selectArtemBefore"
            ref={sizeDropdownRef}
            style={{ zIndex: 10, flex: customSize ? "0 0 auto" : "1" }}
          >
            <div
              className="custom-select-header"
              onClick={() => setSizeDropdownOpen(!sizeDropdownOpen)}
            >
              {sizeTitle}
            </div>

            {sizeDropdownOpen && (
              <div className="custom-select-dropdown">
                {SIZE_FORMATS.map((item) => (
                  <div
                    key={item.name}
                    className={`custom-option ${item.name === sizeTitle ? "active" : ""}`}
                    onClick={() => handleSizeSelect(item)}
                  >
                    <span className="name">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Material */}
      <div className="bw-title">Матеріал</div>
      <div className="bw-row">
        <div
          className="custom-select-container selectArtem selectArtemBefore"
          ref={materialDropdownRef}
          style={{ width: "100%" }}
        >
          <div
            className="custom-select-header"
            onClick={() => setMaterialDropdownOpen(!materialDropdownOpen)}
          >
            {materialTitle}
          </div>

          {materialDropdownOpen && (
            <div className="custom-select-dropdown">
              {materials.map((item) => (
                <div
                  key={item.id}
                  className={`custom-option ${
                    String(item.id) === String(material?.materialId) ? "active" : ""
                  }`}
                  onClick={() => handleMaterialSelect(item)}
                >
                  <span className="name">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  // ========== RIGHT CONTENT ==========
  const rightContent = <MagnetsPrice />;

  // ========== BOTTOM CONTENT ==========
  const bottomContent = (
    <div className="bw-action">
      <button className="adminButtonAdd" variant="danger" onClick={handleSave}>
        {isEdit ? "Зберегти зміни" : "Додати до замовлення"}
      </button>
    </div>
  );

  // ========== RENDER ==========
  return (
    <ServiceModalWrapper
      show={showNewMagnets}
      onClose={() => setShowNewMagnets(false)}
      leftContent={leftContent}
      rightContent={rightContent}
      bottomContent={bottomContent}
      error={error}
      className="service-magnets"
      setEditingOrderUnit={setEditingOrderUnit}
    />
  );
};

export default NewMagnets;
