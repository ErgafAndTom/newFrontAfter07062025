import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import { ScModal, ScSection, ScCountSize, ScPricing, ScAddButton } from "./shared";
import { useModalState, useModalPricing, useOrderUnitSave } from "./shared/hooks";
import "./Poslugy.css";

// ========== DEFAULTS ==========
const DEFAULTS = {
  size: { x: 210, y: 297 },
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

  // Lamination sizes from API
  const [thisLaminationSizes, setThisLaminationSizes] = useState([]);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [thicknessDropdownOpen, setThicknessDropdownOpen] = useState(false);

  const sizeDropdownRef = useRef(null);
  const thicknessDropdownRef = useRef(null);

  // Pricing hook
  const calcData = useMemo(
    () => ({ size, lamination, count }),
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
    setLamination((prev) => ({ ...prev, materialId: "", size: "" }));
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
    saveOrderUnit(
      {
        nameOrderUnit: "Ламінація",
        type: "Laminator",
        size,
        lamination,
        count,
      },
      editingOrderUnit,
      setError
    );
  };

  // ========== RENDER HELPERS ==========
  const selectedSizeFormat = SIZE_FORMATS.find((f) => f.x === size.x && f.y === size.y);
  const sizeTitle = selectedSizeFormat?.name || `${size.x} x ${size.y} мм`;
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
  return (
    <ScModal
      show={showLaminator}
      onClose={handleClose}
      modalStyle={{ width: "40vw" }}
      rightContent={
        <>
          <ScPricing
            lines={pricingLines}
            totalPrice={Number(pricesThis?.price) || 0}
            fmt={fmt2}
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
        }
      />

      {/* 2. Тип ламінації */}
      <ScSection title="">
        <div style={{ display: "flex", alignItems: "center" }}>
          {LAMINATION_BUTTONS.map((item) => (
            <div
              key={item}
              className={lamination.material === item ? "buttonsArtem buttonsArtemActive" : "buttonsArtem"}
              onClick={() => handleLaminationTypeClick(item)}
            >
              <div style={{ whiteSpace: "nowrap" }}>{LABELS[item] || item}</div>
            </div>
          ))}
        </div>
      </ScSection>

      {/* 3. Товщина плівки */}
      <ScSection title="">
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
                  className={`custom-option ${String(item.id) === String(lamination.materialId) ? "active" : ""}`}
                  onClick={() => handleThicknessSelect(item)}
                >
                  <span className="name">{item.thickness} мкм</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScSection>

    </ScModal>
  );
};

export default Laminator;
