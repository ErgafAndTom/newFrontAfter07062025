import React, { useEffect, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import { usePortalDropdown } from "./newnomodals/usePortalDropdown";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import { ScModal, ScSection, ScPricing, ScAddButton } from "./shared";
import { useModalState, useModalPricing, useOrderUnitSave } from "./shared/hooks";
import "./Poslugy.css";

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

  // Dropdown
  const [materials, setMaterials] = useState([]);
  const { open: materialDropdownOpen, setOpen: setMaterialDropdownOpen, style: dropStyle, toggle: toggleMaterial, triggerRef: materialDropdownRef, portalRef } = usePortalDropdown();

  // Pricing hook
  const calcData = useMemo(
    () => ({ size: { x: 0, y: 0 }, material, count }),
    [material, count]
  );

  const { pricesThis } = useModalPricing("Cup", calcData, showNewCup);

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
  return (
    <ScModal
      show={showNewCup}
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
      {/* 1. Кількість + Макет */}
      <ScSection title="">
        <div className="d-flex flex-row align-items-center" style={{ justifyContent: 'space-between' }}>
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
          {onOpenMockup && (
            <button
              type="button"
              className="nui-client-rect-btn"
              style={{ padding: '0.3rem 1rem', fontSize: 'var(--font-size-s, 14px)', color: 'var(--adminorange, #f5a623)', border: '2px solid var(--adminorange, #f5a623)', background: 'transparent', fontWeight: 400, position: 'relative' }}
              onClick={(e) => { e.stopPropagation(); onOpenMockup(); }}
            >
              <div style={{zIndex: 10}}>ВІЗУАЛІЗАЦІЯ</div>
            </button>
          )}
        </div>
      </ScSection>

      {/* 2. Чашка */}
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
            {material.material && (
              <span className="gsm-sub" style={{ marginLeft: "0.5vw" }}>
                <sub>{materials.find(m => m.id === material.materialId)?.thickness || ""} мл</sub>
              </span>
            )}
          </div>
          {materialDropdownOpen && ReactDOM.createPortal(
            <div className="custom-select-dropdown" ref={portalRef} style={dropStyle}>
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
      </ScSection>

    </ScModal>
  );
};

export default NewCup;
