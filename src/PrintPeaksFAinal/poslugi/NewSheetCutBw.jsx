import axios from '../../api/axiosInstance';
import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import Materials2 from "./newnomodals/Materials2";

import ScModal from "./shared/ScModal";
import ScCountSize from "./shared/ScCountSize";
import ScSides from "./shared/ScSides";
import ScSection from "./shared/ScSection";
import ScToggleSection from "./shared/ScToggleSection";
import ScPricing from "./shared/ScPricing";
import ScAddButton from "./shared/ScAddButton";
import ScTabs from "./shared/ScTabs";
import ServiceSettingsModal from "./shared/ServiceSettingsModal";
import useServiceTabs from "../../hooks/useServiceTabs";

import "./Poslugy.css";
import "./shared/sc-base.css";

const DEFAULT_SIZE = { x: 210, y: 297 };

const SIZE_FORMATS = [
  { name: "A4 (210 x 297 мм)", x: 210, y: 297 },
  { name: "A3 (297 x 420 мм)", x: 297, y: 420 },
];

const DEFAULTS = {
  size: DEFAULT_SIZE,
  material: {
    type: "Папір",
    thickness: "Офісний",
    material: "",
    materialId: "",
    typeUse: "Офісний",
  },
  color: {
    sides: "односторонній",
    one: "",
    two: "",
    allSidesColor: "Чорно-білий",
  },
  lamination: {
    type: "Не потрібно",
    material: "",
    materialId: "",
    size: "",
  },
  count: 1,
  selectedService: "Документ",
};

function parseOptionsJson(orderUnit) {
  if (!orderUnit?.optionsJson) return null;
  try {
    return JSON.parse(orderUnit.optionsJson);
  } catch {
    return null;
  }
}

export default function NewSheetCutBW({
  thisOrder,
  newThisOrder,
  selectedThings2,
  setNewThisOrder,
  setThisOrder,
  setSelectedThings2,
  showNewSheetCutBW,
  setShowNewSheetCutBW,
  editingOrderUnit,
  setEditingOrderUnit,
}) {
  const fmt2 = (v) =>
    new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(v) || 0);

  const [count, setCount] = useState(1);
  const [selectedService, setSelectedService] = useState("Документ");
  const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.idKey);
  const skipInitialPricing = useRef(false);
  const [size, setSize] = useState({ x: 210, y: 297 });
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const sizeDropdownRef = useRef(null);

  const options = useMemo(
    () => parseOptionsJson(editingOrderUnit),
    [editingOrderUnit]
  );

  const [material, setMaterial] = useState(DEFAULTS.material);

  const [color, setColor] = useState(DEFAULTS.color);

  const [error, setError] = useState(null);
  const [pricesThis, setPricesThis] = useState({});
  const [isEditServices, setIsEditServices] = useState(false);

  const [lamination, setLamination] = useState(DEFAULTS.lamination);

  const [showSettings, setShowSettings] = useState(false);
  const { services, addService, removeService, updateService, reorderServices, loading: servicesLoading } = useServiceTabs("SheetCutBw", [
    "Документ",
    "Договір",
    "Дипломна робота",
    "Курсова робота",
    "Реферат",
    "Креслення",
    "Аналізи",
    "Квиток",
  ]);

  const DEFAULT_SIZES = [
    { label: "A4", x: 210, y: 297 },
    { label: "А3", x: 297, y: 420 },
  ];

  const sizeButtons = useMemo(() => {
    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
    const sizes = svc?.presets?.sizes;
    if (Array.isArray(sizes) && sizes.length > 0) return sizes;
    return DEFAULT_SIZES;
  }, [services, selectedService]);

  // Hide/show ламінації
  const [hideLamination, setHideLamination] = useState(false);
  useEffect(() => {
    if (servicesLoading) return;
    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
    const p = svc?.presets;
    setHideLamination(p?.lamination === false);
  }, [services, selectedService, servicesLoading]);

  // Застосувати пресети
  const handleServiceSelect = useCallback((name) => {
    setSelectedService(name);
    if (isEdit) return;
    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === name);
    const p = svc?.presets;
    if (!p) return;

    if (p.sizeX || p.sizeY) {
      setSize({ x: p.sizeX ? Number(p.sizeX) : size.x, y: p.sizeY ? Number(p.sizeY) : size.y });
    }
    if (p.sides) {
      setColor((prev) => ({ ...prev, sides: p.sides }));
    }
    if (p.lamination !== undefined && p.lamination) {
      const lamType = p.laminationType || "з глянцевим ламінуванням";
      const isOn = p.laminationDefault !== false;
      if (isOn) {
        setLamination({ type: lamType, material: lamType, materialId: "", size: p.laminationThickness ? String(p.laminationThickness) : "", typeUse: "А3" });
      } else {
        setLamination(DEFAULTS.lamination);
      }
    }
  }, [services, isEdit]);

  /* ===================== INIT MODAL (NEW/EDIT) ===================== */

  useEffect(() => {
    if (!showNewSheetCutBW) return;
    if (isEdit) skipInitialPricing.current = true;

    if (!isEdit) {
      setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setLamination(DEFAULTS.lamination);
      setCount(DEFAULTS.count);
      setSelectedService(DEFAULTS.selectedService);
      setError(null);
      return;
    }

    // EDIT
    const opt = options || {};
    const savedName = options?.nameOrderUnit || "";

    setCount(opt.count ?? editingOrderUnit?.amount ?? DEFAULTS.count);

    setSize({
      x: opt?.size?.x ?? DEFAULT_SIZE.x,
      y: opt?.size?.y ?? DEFAULT_SIZE.y,
    });

    setMaterial({
      type: opt?.material?.type ?? DEFAULTS.material.type,
      thickness: opt?.material?.thickness ?? DEFAULTS.material.thickness,
      material: opt?.material?.material ?? "",
      materialId: opt?.material?.materialId ?? "",
      typeUse: opt?.material?.typeUse ?? DEFAULTS.material.typeUse,
    });

    setColor({
      sides: opt?.color?.sides ?? DEFAULTS.color.sides,
      one: opt?.color?.one ?? "",
      two: opt?.color?.two ?? "",
      allSidesColor: opt?.color?.allSidesColor ?? DEFAULTS.color.allSidesColor,
    });

    setLamination(opt?.lamination ?? DEFAULTS.lamination);

    const matched = services.find(
      (s) => (typeof s === 'string' ? s : s?.name)?.toLowerCase() === savedName.toLowerCase()
    );
    const matchedName = matched ? (typeof matched === 'string' ? matched : matched.name) : null;
    const firstName = services[0] ? (typeof services[0] === 'string' ? services[0] : services[0].name) : "";
    setSelectedService(matchedName || firstName);
    setError(null);
  }, [showNewSheetCutBW, isEdit, options, editingOrderUnit]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target)) {
        setSizeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── оновлюємо typeUse ламінації при зміні розміру аркуша ── */
  useEffect(() => {
    if (lamination.type === "Не потрібно") return;
    const laminTypeUse = Math.max(size.x, size.y) <= 297 ? "А4" : "А3";
    if (lamination.typeUse !== laminTypeUse) {
      setLamination(prev => ({ ...prev, typeUse: laminTypeUse }));
    }
  }, [size.x, size.y]); // eslint-disable-line

  /* ===================== SAVE ===================== */

  const addNewOrderUnit = () => {
    if (!material?.materialId) {
      setError("Виберіть будь ласка матеріал");
      return;
    }

    let dataToSend = {
      orderId: thisOrder?.id,
      ...(isEdit && (editingOrderUnit?.id || editingOrderUnit?.idKey)
        ? { orderUnitId: editingOrderUnit.id || editingOrderUnit.idKey }
        : {}),
      toCalc: {
        nameOrderUnit: selectedService || "",
        type: "SheetCutBW",
        size,
        material,
        color,
        lamination,
        count,
        big: "Не потрібно",
        cute: "Не потрібно",
        holes: "Не потрібно",
        prokleyka: "Не потрібно",
        lyuversy: "Не потрібно",
        design: "Не потрібно",
        porizka: false,
      },
    };

    axios
      .post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then((response) => {
        setThisOrder(response.data);
        setSelectedThings2(response.data.OrderUnits);
        setEditingOrderUnit(null);
        setShowNewSheetCutBW(false);
        setError(null);
      })
      .catch((err) => {
        setError(err);
      });
  };

  /* ===================== PRICING ===================== */

  useEffect(() => {
    // В edit-mode пропускаємо перший виклик pricing — показуємо збережені ціни
    if (skipInitialPricing.current) {
      skipInitialPricing.current = false;
      if (editingOrderUnit) {
        const storedPrice = parseFloat(editingOrderUnit.priceForAllThis) || 0;
        const storedPerUnit = parseFloat(editingOrderUnit.priceForOneThis) || 0;
        setPricesThis((prev) => ({
          ...prev,
          price: storedPrice,
          priceForOneThis: storedPerUnit,
        }));
      }
      return;
    }

    if (!size) return;

    const dataToSend = {
      type: "SheetCutBW",
      size,
      material,
      color,
      lamination,
      count,
      big: "Не потрібно",
      cute: "Не потрібно",
      holes: "Не потрібно",
      prokleyka: "Не потрібно",
      lyuversy: "Не потрібно",
      design: "Не потрібно",
      porizka: false,
    };

    axios
      .post(`/calc/pricing`, dataToSend)
      .then((response) => {
        setPricesThis(response.data.prices);
        setError(null);
      })
      .catch((err) => {
        setError(err);
      });
  }, [
    size,
    material,
    color,
    lamination?.materialId,
    lamination?.type,
    count,
  ]);

  const handleSizeSelect = (format) => {
    setSize({ x: format.x, y: format.y });
    setSizeDropdownOpen(false);
  };

  const selectedSizeFormat = SIZE_FORMATS.find((f) => f.x === size.x && f.y === size.y);
  const sizeTitle = selectedSizeFormat?.name || `${size.x} x ${size.y} мм`;

  /* ===================== PRICING DATA ===================== */

  const sc = pricesThis.sheetCount || 0;

  const pricingLines = [
    { label: "Друк", perUnit: pricesThis.priceDrukPerSheet, count: sc, total: (pricesThis.priceDrukPerSheet || 0) * sc },
    { label: "Матеріали", perUnit: pricesThis.pricePaperPerSheet, count: sc, total: (pricesThis.pricePaperPerSheet || 0) * sc },
    { label: "Ламінація", perUnit: pricesThis.priceLaminationPerSheet, count: sc, total: (pricesThis.priceLaminationPerSheet || 0) * sc },
  ];

  const pricingExtras = [];

  const handleClose = () => {
    setEditingOrderUnit(null);
    setShowNewSheetCutBW(false);
  };

  /* ===================== RENDER ===================== */

  return (
    <ScModal
      show={showNewSheetCutBW}
      onClose={handleClose}
      modalStyle={{ width: "40.25vw" }}
      modalClassName="sc-modal-bw"
      leftStyle={{ flex: 1.2 }}
      rightStyle={{ width: "12.9vw", minWidth: "144px", maxWidth: "240px" }}
      rightContent={
        <>
          {pricesThis && (
            <ScPricing
              lines={pricingLines}
              totalPrice={pricesThis.price || 0}
              extras={pricingExtras}
              fmt={fmt2}
            />
          )}
          <ScAddButton onClick={addNewOrderUnit} isEdit={isEdit} className="sc-add-btn--bw-compact" />
        </>
      }
      errorContent={
        typeof error === "string" ? (
          <div className="sc-error">{error}</div>
        ) : error?.response?.data?.error ? (
          <div className="sc-error">{error.response.data.error}</div>
        ) : null
      }
      tabsContent={
        <>
          <div className="sc-tabs-count-row">
            <div className="sc-count-inline">
              <input
                className="inputsArtem"
                type="number"
                value={count}
                min={1}
                onChange={(e) => setCount(Number(e.target.value) || 1)}
                style={{ width: "4.4rem", textAlign: "center" }}
              />
              <span className="inputsArtemx" style={{ border: "transparent" }}>шт</span>
            </div>
            <ScTabs
              services={services}
              selectedService={selectedService}
              onSelect={handleServiceSelect}
              isEditServices={false}
              setIsEditServices={() => {}}
              onSettingsClick={() => setShowSettings(true)}
            />
          </div>
          <ServiceSettingsModal
            show={showSettings}
            onClose={() => setShowSettings(false)}
            services={services}
            onAddService={async (name) => {
              const added = await addService(name);
              if (added) setSelectedService(added.name);
            }}
            onRemoveService={async (service) => {
              const sId = typeof service === 'string' ? null : service?.id;
              const sName = typeof service === 'string' ? service : service?.name;
              if (sId) await removeService(sId);
              if (selectedService === sName) {
                const first = services.find((s) => (typeof s === 'string' ? s : s?.name) !== sName);
                setSelectedService(first ? (typeof first === 'string' ? first : first.name) : "");
              }
            }}
            onUpdateService={updateService}
            onReorderServices={reorderServices}
            defaultSizes={DEFAULT_SIZES}
            thicknessOptions={["Офісний"]}
            extraToggles={[]}
          />
          {/* Розміри — під табами */}
          <div className="sc-section sc-section-card" style={{ margin: "0 2rem" }}>
            <div className="sc-sides sc-size-row">
              {sizeButtons.map((f) => (
                <button
                  key={f.label}
                  className={`sc-side-btn${size.x === f.x && size.y === f.y ? " sc-side-active" : ""}`}
                  onClick={() => {
                    const fmt = SIZE_FORMATS.find((sf) => sf.x === f.x && sf.y === f.y);
                    if (fmt) handleSizeSelect(fmt);
                    else setSize({ x: f.x, y: f.y });
                  }}
                >
                  <span className="sc-side-text">{f.label}</span>
                </button>
              ))}
              <div className="sc-size-inline-inputs">
                <input
                  className="inputsArtem"
                  type="number"
                  value={size.x}
                  min={10}
                  max={445}
                  onChange={(e) => setSize({ x: Number(e.target.value) || 0, y: size.y })}
                />
                <span className="sc-size-x">x</span>
                <input
                  className="inputsArtem"
                  type="number"
                  value={size.y}
                  min={10}
                  max={445}
                  onChange={(e) => setSize({ x: size.x, y: Number(e.target.value) || 0 })}
                />
                <span className="sc-size-mm">мм</span>
              </div>
            </div>
          </div>
        </>
      }
    >

      {/* 2. Сторонність */}
      <ScSides
        value={color.sides}
        onChange={(sides) => setColor({ ...color, sides })}
      />

      {/* 3. Матеріал (кнопка "Офісний" прихована, селект заблокований — папір обирається автоматично по розміру) */}
      <ScSection className="sc-bw-material-card" style={{ position: "relative", zIndex: 60 }}>
        <Materials2
          material={material}
          setMaterial={setMaterial}
          count={count}
          setCount={setCount}
          size={size}
          name={"Чорно-білий друк на монохромному принтері:"}
          buttonsArr={[/* "Офісний" — приховано */]}
          typeUse={null}
          disabled={true}
          preferredMaterialName={
            size.x === 210 && size.y === 297 ? "Офісний папір А4"
            : size.x === 297 && size.y === 420 ? "Офісний папір А3"
            : null
          }
        />
      </ScSection>

      {/* 4. Ламінування */}
      {!hideLamination && <ScToggleSection
        label="Ламінування"
        title="Ламінування"
        isOn={lamination.type !== "Не потрібно"}
        onToggle={() => {
          const laminTypeUse = (material.typeUse === "Офісний" && Math.max(size.x, size.y) <= 297) ? "А4" : "А3";
          if (lamination.type === "Не потрібно") {
            const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
            const presetLamType = svc?.presets?.laminationType || "з глянцевим ламінуванням";
            const presetLamThick = svc?.presets?.laminationThickness ? String(svc.presets.laminationThickness) : "";
            setLamination({ ...lamination, type: presetLamType, material: presetLamType, materialId: "", size: presetLamThick, typeUse: laminTypeUse });
          } else {
            setLamination({ type: "Не потрібно", material: "", materialId: "", size: "", typeUse: laminTypeUse });
          }
        }}
        style={{ position: "relative", zIndex: 40 }}
      >
        <NewNoModalLamination
          lamination={lamination}
          setLamination={setLamination}
          prices={[]}
          size={size}
          type={"SheetCut"}
          paperTypeUse={material.typeUse}
          presetLamType={services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService)?.presets?.laminationType}
          presetLamThickness={services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService)?.presets?.laminationThickness}
          buttonsArr={[
            "з глянцевим ламінуванням",
            "з матовим ламінуванням",
            "з ламінуванням SoftTouch",
          ]}
          selectArr={["30", "70", "80", "100", "125", "250"]}
          labelMap={{
            "з глянцевим ламінуванням": "глянцеве",
            "з матовим ламінуванням": "матове",
            "з ламінуванням SoftTouch": "SoftTouch",
          }}
        />
      </ScToggleSection>}
    </ScModal>
  );
}
