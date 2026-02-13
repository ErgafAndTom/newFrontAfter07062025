import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import ServiceModalWrapper from "./shared/ServiceModalWrapper";
import PricingSummary from "./shared/PricingSummary";
import CountInput from "./shared/CountInput";
import { useModalState, useModalPricing, useOrderUnitSave } from "./shared/hooks";
import "./shared/ServiceModal.css";

// ========== DEFAULTS ==========
const DEFAULT_SIZE = { x: 210, y: 297 };

const DEFAULTS = {
  size: DEFAULT_SIZE,
  material: {
    type: "Не потрібно",
    thickness: "Тонкі",
    material: "",
    materialId: "",
    typeUse: null,
  },
  color: {
    sides: "Не потрібно",
    one: "",
    two: "",
    allSidesColor: "CMYK",
  },
  lamination: {
    type: "з глянцевим ламінуванням",
    material: "з глянцевим ламінуванням",
    materialId: "",
    size: "",
    typeUse: "А3",
  },
  count: 1,
};

const SIZE_FORMATS = [
  { name: "A5 (148 x 210 мм)", x: 148, y: 210 },
  { name: "A4 (210 x 297 мм)", x: 210, y: 297 },
  { name: "A3 (297 x 420 мм)", x: 297, y: 420 },
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
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);
  const [count, setCount] = useState(DEFAULTS.count);
  const [error, setError] = useState(null);

  // Lamination sizes from API
  const [thisLaminationSizes, setThisLaminationSizes] = useState([]);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [thicknessDropdownOpen, setThicknessDropdownOpen] = useState(false);

  const sizeDropdownRef = useRef(null);
  const thicknessDropdownRef = useRef(null);

  // Pricing hook
  const calcData = useMemo(
    () => ({
      size,
      material: DEFAULTS.material,
      color: DEFAULTS.color,
      lamination,
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
    }),
    [size, lamination, count]
  );

  const { pricesThis } = useModalPricing("Laminator", calcData, showLaminator);

  // Save hook
  const { saveOrderUnit } = useOrderUnitSave(
    thisOrder,
    setThisOrder,
    setSelectedThings2,
    () => setShowLaminator(false),
    setEditingOrderUnit
  );

  // ========== EFFECTS ==========

  // Initialize/reset state when modal opens
  useEffect(() => {
    if (!showLaminator) return;

    // NEW mode - set defaults
    if (!isEdit) {
      setSize(DEFAULTS.size);
      setLamination(DEFAULTS.lamination);
      setCount(DEFAULTS.count);
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

    setLamination({
      type: opt?.lamination?.type ?? DEFAULTS.lamination.type,
      material: opt?.lamination?.material ?? DEFAULTS.lamination.material,
      materialId: opt?.lamination?.materialId ?? "",
      size: opt?.lamination?.size ?? "",
      typeUse: opt?.lamination?.typeUse ?? "А3",
    });

    setError(null);
  }, [showLaminator, isEdit, options, editingOrderUnit]);

  // Fetch lamination sizes when material changes
  useEffect(() => {
    if (!lamination.material || !showLaminator) return;

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
        typeUse: "А3",
      },
      size,
    };

    axios
      .post(`/materials/NotAll`, data)
      .then((response) => {
        const rows = response.data.rows || [];
        setThisLaminationSizes(rows);

        // Auto-select first thickness if none selected
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
        if (err?.response?.status === 403) {
          navigate("/login");
        }
      });
  }, [lamination.material, lamination.type, size, showLaminator, navigate]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target)) {
        setSizeDropdownOpen(false);
      }
      if (thicknessDropdownRef.current && !thicknessDropdownRef.current.contains(event.target)) {
        setThicknessDropdownOpen(false);
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
    const toCalcData = {
      nameOrderUnit: "Ламінація",
      type: "Laminator",
      size,
      material: DEFAULTS.material,
      color: DEFAULTS.color,
      lamination,
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
    };

    saveOrderUnit(toCalcData, editingOrderUnit, setError);
  };

  // ========== RENDER HELPERS ==========

  const selectedSizeFormat = SIZE_FORMATS.find((f) => f.x === size.x && f.y === size.y);
  const sizeTitle = selectedSizeFormat?.name || `${size.x} x ${size.y} мм`;
  const thicknessTitle = lamination.size ? `${lamination.size} мкм` : "-";

  // ========== LEFT CONTENT ==========
  const leftContent = (
    <>
      {/* Count & Size */}
      <div className="bw-title">Кількість та розмір</div>
      <div className="bw-row">
        <div className="d-flex flex-row justify-content-between align-items-center">
          {/* Count */}
          <CountInput count={count} setCount={setCount} />

          {/* Size Dropdown */}
          <div
            className="custom-select-container selectArtem selectArtemBefore"
            ref={sizeDropdownRef}
            style={{ zIndex: 10 }}
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

      {/* Lamination Type */}
      <div className="bw-title">Тип ламінації</div>
      <div className="bw-row">
        <div
          style={{
            display: "flex",
            position: "relative",
            alignItems: "center",
            gap: "0",
            width: "100%",
          }}
        >
          {LAMINATION_BUTTONS.map((item, index) => {
            const isActive = lamination.material === item;
            const isFirst = index === 0;
            const isLast = index === LAMINATION_BUTTONS.length - 1;
            return (
              <button
                key={item}
                type="button"
                className="lamination-button"
                style={{
                  height: "3vh",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "450",
                  flex: 1,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  padding: "12px 8px",
                  transition: "all 0.3s ease",
                  backgroundColor: isActive ? "#f5a623" : "rgba(224, 224, 224, 0.5)",
                  color: isActive ? "#FFFFFF" : "#666666",
                  position: "relative",
                  borderTopLeftRadius: isFirst ? "1vh" : "0",
                  borderBottomLeftRadius: isFirst ? "1vh" : "0",
                  borderTopRightRadius: isLast ? "1vh" : "0",
                  borderBottomRightRadius: isLast ? "1vh" : "0",
                  marginLeft: isFirst ? "0" : "-25px",
                  clipPath:
                    isFirst && !isLast
                      ? "polygon(0 0, 100% 0, calc(100% - 25px) 100%, 0 100%)"
                      : isLast && !isFirst
                      ? "polygon(25px 0, 100% 0, 100% 100%, 0 100%)"
                      : !isFirst && !isLast
                      ? "polygon(25px 0, 100% 0, calc(100% - 25px) 100%, 0 100%)"
                      : "none",
                }}
                onClick={() => handleLaminationTypeClick(item)}
              >
                {LABELS[item] || item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lamination Thickness */}
      <div className="bw-title">Товщина плівки</div>
      <div className="bw-row">
        <div
          className="custom-select-container selectArtem selectArtemBefore"
          ref={thicknessDropdownRef}
          style={{ width: "100%" }}
        >
          <div
            className="custom-select-header"
            onClick={() => setThicknessDropdownOpen(!thicknessDropdownOpen)}
          >
            {thicknessTitle}
          </div>

          {thicknessDropdownOpen && (
            <div className="custom-select-dropdown">
              {thisLaminationSizes.map((item) => (
                <div
                  key={item.id}
                  className={`custom-option ${
                    String(item.id) === String(lamination.materialId) ? "active" : ""
                  }`}
                  onClick={() => handleThicknessSelect(item)}
                >
                  <span className="name">{item.thickness} мкм</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  // ========== RIGHT CONTENT ==========
  const rightContent = <PricingSummary pricesThis={pricesThis} type="Laminator" />;

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
      show={showLaminator}
      onClose={() => setShowLaminator(false)}
      leftContent={leftContent}
      rightContent={rightContent}
      bottomContent={bottomContent}
      error={error}
      className="service-laminator"
      setEditingOrderUnit={setEditingOrderUnit}
    />
  );
};

export default Laminator;
