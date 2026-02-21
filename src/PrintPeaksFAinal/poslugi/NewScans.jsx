import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import { ScModal, ScSection, ScPricing, ScAddButton } from "./shared";
import { useModalState, useModalPricing, useOrderUnitSave } from "./shared/hooks";
import "./Poslugy.css";

// ========== DEFAULTS ==========
const DEFAULTS = {
  material: {
    type: "Scans",
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
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [count, setCount] = useState(DEFAULTS.count);
  const [error, setError] = useState(null);

  // Dropdown
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false);
  const [materials, setMaterials] = useState([]);

  const materialDropdownRef = useRef(null);

  // Pricing hook
  const calcData = useMemo(
    () => ({ size: { x: material.x || 0, y: material.y || 0 }, material, count }),
    [material, count]
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

  const handleClose = () => {
    if (setEditingOrderUnit) setEditingOrderUnit(null);
    setShowNewScans(false);
  };

  // ========== EFFECTS ==========

  useEffect(() => {
    if (!showNewScans) return;

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
      x: opt?.material?.x || "",
      y: opt?.material?.y || "",
    });
    setError(null);
  }, [showNewScans, isEdit, options, editingOrderUnit]);

  // Fetch materials
  useEffect(() => {
    if (!showNewScans) return;

    axios
      .post(`/materials/NotAll`, {
        name: "MaterialsPrices",
        inPageCount: 999999,
        currentPage: 1,
        search: "",
        columnName: { column: "id", reverse: false },
        typeOfPosluga: "Scans",
        size: { x: material.x || 0, y: material.y || 0 },
        material,
      })
      .then((response) => {
        const rows = response.data.rows || [];
        setMaterials(rows);
        if (!material.materialId && rows.length > 0) {
          const def = rows.find((r) => r.name === "Документ А4") || rows[0];
          setMaterial((prev) => ({
            ...prev,
            material: def.name,
            materialId: def.id,
            x: def.x || "",
            y: def.y || "",
          }));
        }
      })
      .catch((err) => {
        setMaterials([]);
        if (err?.response?.status === 403) navigate("/login");
      });
  }, [material?.thickness, material?.type, showNewScans, navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (materialDropdownRef.current && !materialDropdownRef.current.contains(event.target)) {
        setMaterialDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ========== HANDLERS ==========

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
    saveOrderUnit(
      {
        nameOrderUnit: "Сканування",
        type: "Scans",
        size: { x: material.x || 0, y: material.y || 0 },
        material,
        count,
      },
      editingOrderUnit,
      setError
    );
  };

  // ========== RENDER HELPERS ==========
  const materialTitle = material?.material || "Виберіть сканування";

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
  return (
    <ScModal
      show={showNewScans}
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
      {/* 1. Кількість */}
      <ScSection title="">
        <div className="d-flex flex-row align-items-center">
          <input
            className="inputsArtem"
            type="number"
            min={1}
            value={count}
            onChange={(e) => setCount(Math.max(1, +e.target.value || 1))}
          />
          <div className="inputsArtemx">шт</div>
        </div>
      </ScSection>

      {/* 2. Матеріал */}
      <ScSection title="" style={{ position: "relative", zIndex: 5 }}>
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
                  className={`custom-option ${String(item.id) === String(material?.materialId) ? "active" : ""}`}
                  onClick={() => handleMaterialSelect(item)}
                >
                  <span className="name">{item.name}</span>
                  <span className="gsm-sub">
                    <sub style={{ marginRight: "0.8vw" }}>
                      {item.x && item.y && <sub>{item.x}x{item.y}</sub>}
                    </sub>
                    <sub>{item.thickness} г/м<sub>2</sub></sub>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScSection>

    </ScModal>
  );
};

export default NewScans;
