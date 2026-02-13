import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import ServiceModalWrapper from "./shared/ServiceModalWrapper";
import PricingSummary from "./shared/PricingSummary";
import CountInput from "./shared/CountInput";
import { useModalState, useModalPricing, useOrderUnitSave } from "./shared/hooks";
import "./shared/ServiceModal.css";

// ========== DEFAULTS ==========
const DEFAULT_SIZE = { x: 0, y: 0 };

const DEFAULTS = {
  size: DEFAULT_SIZE,
  material: {
    type: "Не потрібно",
    thickness: "Чашка",
    material: "",
    materialId: "",
    typeUse: "Офісний",
  },
  color: {
    sides: "Не потрібно",
    one: "",
    two: "",
    allSidesColor: "CMYK",
  },
  lamination: {
    type: "Не потрібно",
    material: "",
    materialId: "",
    size: "",
  },
  count: 1,
  porizka: { type: "Не потрібно" },
};

const SIZE_FORMATS = [
  { name: "A5 (148 x 210 мм)", x: 148, y: 210 },
  { name: "A4 (210 x 297 мм)", x: 210, y: 297 },
  { name: "A3 (297 x 420 мм)", x: 297, y: 420 },
];

const NewScans = ({
  thisOrder,
  setThisOrder,
  setSelectedThings2,
  showNewScans,
  setShowNewScans,
  editingOrderUnit,
  setEditingOrderUnit,
}) => {
  const navigate = useNavigate();

  // Modal state detection
  const { isEdit, options } = useModalState(editingOrderUnit, showNewScans);

  // ========== STATE ==========
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [count, setCount] = useState(DEFAULTS.count);
  const [porizka, setPorizka] = useState(DEFAULTS.porizka);
  const [error, setError] = useState(null);

  // Dropdown
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false);
  const [materials, setMaterials] = useState([]);

  const sizeDropdownRef = useRef(null);
  const materialDropdownRef = useRef(null);

  // Pricing hook
  const calcData = useMemo(
    () => ({
      size,
      material,
      color: DEFAULTS.color,
      lamination: DEFAULTS.lamination,
      big: "Не потрібно",
      cute: "Не потрібно",
      cuteLocal: {
        leftTop: false,
        rightTop: false,
        rightBottom: false,
        leftBottom: false,
        radius: "",
      },
      holes: "Не потрібно",
      holesR: "",
      count,
      porizka,
    }),
    [size, material, count, porizka]
  );

  const { pricesThis } = useModalPricing("Scans", calcData, showNewScans);

  // Save hook
  const { saveOrderUnit } = useOrderUnitSave(
    thisOrder,
    setThisOrder,
    setSelectedThings2,
    () => setShowNewScans(false),
    setEditingOrderUnit
  );

  // ========== EFFECTS ==========

  // Initialize/reset state when modal opens
  useEffect(() => {
    if (!showNewScans) return;

    // NEW mode - set defaults
    if (!isEdit) {
      setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material);
      setCount(DEFAULTS.count);
      setPorizka(DEFAULTS.porizka);
      setError(null);
      return;
    }

    // EDIT mode - load from options
    const opt = options || {};
    setCount(opt.count ?? editingOrderUnit?.amount ?? DEFAULTS.count);

    setSize({
      x: opt?.size?.x ?? DEFAULT_SIZE.x,
      y: opt?.size?.y ?? DEFAULT_SIZE.y,
    });

    setMaterial({
      type: opt?.material?.type ?? DEFAULTS.material.type,
      thickness: opt?.material?.thickness ?? DEFAULTS.material.thickness,
      material: opt?.material?.material ?? DEFAULTS.material.material,
      materialId: opt?.material?.materialId ?? DEFAULTS.material.materialId,
      typeUse: opt?.material?.typeUse ?? DEFAULTS.material.typeUse,
    });

    setPorizka(opt?.porizka ?? DEFAULTS.porizka);

    setError(null);
  }, [showNewScans, isEdit, options, editingOrderUnit]);

  // Fetch materials
  useEffect(() => {
    if (!showNewScans) return;

    const data = {
      name: "MaterialsPrices",
      inPageCount: 999999,
      currentPage: 1,
      search: "",
      columnName: { column: "id", reverse: false },
      typeOfPosluga: "Scans",
      size,
      material,
    };

    axios
      .post(`/materials/NotAll`, data)
      .then((response) => {
        setMaterials(response.data.rows || []);
      })
      .catch((err) => {
        setMaterials([]);
        if (err?.response?.status === 403) {
          navigate("/login");
        }
      });
  }, [material?.thickness, material?.type, size, showNewScans, navigate]);

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
    setSize({ x: format.x, y: format.y });
    setSizeDropdownOpen(false);
  };

  const handleMaterialSelect = (item) => {
    setMaterial((prev) => ({
      ...prev,
      material: item?.name || "",
      materialId: item?.id || 0,
      a: item?.thickness || "",
      x: item?.x || "",
      y: item?.y || "",
    }));
    setMaterialDropdownOpen(false);
  };

  const handleSave = () => {
    const toCalcData = {
      nameOrderUnit: "Кружка",
      type: "Scans",
      size,
      material,
      color: DEFAULTS.color,
      lamination: DEFAULTS.lamination,
      big: "Не потрібно",
      cute: "Не потрібно",
      cuteLocal: {
        leftTop: false,
        rightTop: false,
        rightBottom: false,
        leftBottom: false,
        radius: "",
      },
      holes: "Не потрібно",
      holesR: "",
      count,
      porizka,
    };

    saveOrderUnit(toCalcData, editingOrderUnit, setError);
  };

  // ========== RENDER HELPERS ==========

  const selectedSizeFormat = SIZE_FORMATS.find((f) => f.x === size.x && f.y === size.y);
  const sizeTitle = selectedSizeFormat?.name || (size.x && size.y ? `${size.x} x ${size.y} мм` : "Оберіть розмір");
  const materialTitle = material?.material || "Виберіть матеріал";

  // Custom pricing summary for Scans
  const ScansPrice = () => {
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
            {(pricesThis.priceForThisUnitOfCup || 0).toFixed(2)}
            <span className="bw-sub">грн</span>
            <span className="bw-op">×</span>
            {pricesThis.skolko || 0}
            <span className="bw-sub">шт</span>
            <span className="bw-op">=</span>
            {(pricesThis.priceForAllUnitOfCup || 0).toFixed(2)}
            <span className="bw-sub">грн</span>
          </div>

          <div
            className="bw-calc-total d-flex justify-content-center align-content-center"
            style={{ fontWeight: "500", color: "red" }}
          >
            {pricesThis.price || 0}
            <span className="bw-sub">грн</span>
          </div>
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
        <div
          className="custom-select-container selectArtem selectArtemBefore"
          ref={sizeDropdownRef}
          style={{ width: "100%", zIndex: 10 }}
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
            {material.x && material.y && (
              <span className="gsm-sub" style={{ marginLeft: "0.5vw" }}>
                <sub>{material.x}x{material.y}</sub>
              </span>
            )}
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
                  <span className="gsm-sub">
                    <sub style={{ marginRight: "0.8vw" }}>
                      {item.x && item.y && (
                        <sub>{item.x}x{item.y}</sub>
                      )}
                    </sub>
                    <sub>
                      {item.thickness} г/м<sub>2</sub>
                    </sub>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  // ========== RIGHT CONTENT ==========
  const rightContent = <ScansPrice />;

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
      show={showNewScans}
      onClose={() => setShowNewScans(false)}
      leftContent={leftContent}
      rightContent={rightContent}
      bottomContent={bottomContent}
      error={error}
      className="service-scans"
      setEditingOrderUnit={setEditingOrderUnit}
    />
  );
};

export default NewScans;
