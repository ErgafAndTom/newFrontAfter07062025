import axios from '../../api/axiosInstance';
import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import Materials2 from "./newnomodals/Materials2";
import PerepletPereplet from "./newnomodals/PerepletPereplet";

/* Будівельні блоки PRINT V2 — пропси ті самі, що були у Sc*-версій */
import ScSides from "./shared/V2Sides";
import ScToggleSection from "./shared/V2ToggleSection";
import ServiceSettingsModal from "./shared/ServiceSettingsModal";
import useServiceTabs from "../../hooks/useServiceTabs";
import { getStoredAppTheme, onAppThemeChange } from "../../utils/appTheme";

import "./NewSheetCutV2.css";

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
  materialColor: {
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
  pereplet: {
    type: "твердим переплітом",
    material: "твердим переплітом",
    materialId: "",
    size: "<120",
    typeUse: "Брошурування до 120 аркушів",
  },
  count: 1,
  selectedService: "Дипломна робота",
};

function parseOptionsJson(orderUnit) {
  if (!orderUnit?.optionsJson) return null;
  try {
    return JSON.parse(orderUnit.optionsJson);
  } catch {
    return null;
  }
}

export default function NewDiplom({
  thisOrder,
  setThisOrder,
  setSelectedThings2,
  showNewDiplom,
  setShowNewDiplom,
  editingOrderUnit,
  setEditingOrderUnit,
}) {
  const fmt2 = (v) =>
    new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(v) || 0);

  const [count, setCount] = useState(1);
  const [selectedService, setSelectedService] = useState(DEFAULTS.selectedService);
  const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.idKey);
  const skipInitialPricing = useRef(false);
  const [size, setSize] = useState({ x: 210, y: 297 });

  const options = useMemo(
    () => parseOptionsJson(editingOrderUnit),
    [editingOrderUnit]
  );

  const [material, setMaterial] = useState(DEFAULTS.material);
  const [materialColor, setMaterialColor] = useState(DEFAULTS.materialColor);
  const [color, setColor] = useState(DEFAULTS.color);
  const [bwEnabled, setBwEnabled] = useState(true);
  const [colorEnabled, setColorEnabled] = useState(false);
  const [bwCount, setBwCount] = useState(1);
  const [colorCount, setColorCount] = useState(1);

  const [error, setError] = useState(null);
  const [pricesThis, setPricesThis] = useState({});
  const [pricesColor, setPricesColor] = useState({});

  const [lamination, setLamination] = useState(DEFAULTS.lamination);
  const [pereplet, setPereplet] = useState(DEFAULTS.pereplet);

  const [showSettings, setShowSettings] = useState(false);

  // тема стежить за глобальною темою застосунку (перемикач у Nav)
  const [theme, setTheme] = useState(getStoredAppTheme);
  useEffect(() => onAppThemeChange(setTheme), []);
  const { services, addService, removeService, updateService, reorderServices, loading: servicesLoading } = useServiceTabs("Diplom", [
    "Дипломна робота",
    "Курсова робота",
    "Дисертація",
    "Магістерська",
    "Реферат",
    "Звіт",
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
    if (p.PerepletDefault) {
      const presetType = p.PerepletType || "на скобу";
      const presetSize = p.PerepletSize || "<120";
      const presetTypeUse = presetSize === ">120" ? "Брошурування від 120 до 280 аркушів" : "Брошурування до 120 аркушів";
      setPereplet({
        type: presetType,
        material: presetType,
        materialId: "",
        size: presetSize,
        typeUse: presetTypeUse,
      });
    }
  }, [services, isEdit]);

  /* ===================== INIT MODAL (NEW/EDIT) ===================== */

  useEffect(() => {
    if (!showNewDiplom) return;
    if (isEdit) skipInitialPricing.current = true;

    if (!isEdit) {
      setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setLamination(DEFAULTS.lamination);
      setPereplet(DEFAULTS.pereplet);
      setCount(DEFAULTS.count);
      setSelectedService(DEFAULTS.selectedService);
      setError(null);
      return;
    }

    // EDIT
    const opt = options || {};
    const savedName = options?.nameOrderUnit || "";

    setCount(opt.count ?? editingOrderUnit?.amount ?? DEFAULTS.count);
    setSize({ x: opt?.size?.x ?? DEFAULT_SIZE.x, y: opt?.size?.y ?? DEFAULT_SIZE.y });
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
    setPereplet(opt?.pereplet ?? DEFAULTS.pereplet);

    const matched = services.find(
      (s) => (typeof s === 'string' ? s : s?.name)?.toLowerCase() === savedName.toLowerCase()
    );
    setSelectedService(matched ? (typeof matched === 'string' ? matched : matched.name) : (services[0] ? (typeof services[0] === 'string' ? services[0] : services[0].name) : ""));
    setError(null);
  }, [showNewDiplom, isEdit, options, editingOrderUnit]);

  /* ── оновлюємо typeUse ламінації при зміні розміру аркуша ── */
  useEffect(() => {
    if (lamination.type === "Не потрібно") return;
    const laminTypeUse = Math.max(size.x, size.y) <= 297 ? "А4" : "А3";
    if (lamination.typeUse !== laminTypeUse) {
      setLamination(prev => ({ ...prev, typeUse: laminTypeUse }));
    }
  }, [size.x, size.y]); // eslint-disable-line

  /* ── автоматично оновлюємо розмір перепліту залежно від загальної кількості аркушів ── */
  useEffect(() => {
    if (!pereplet.type || pereplet.type === "Не потрібно") return;
    const totalSheets = (bwEnabled ? bwCount : 0) + (colorEnabled ? colorCount : 0);
    const targetSize = totalSheets > 120 ? ">120" : "<120";
    const targetTypeUse = totalSheets > 120 ? "Брошурування від 120 до 280 аркушів" : "Брошурування до 120 аркушів";
    if (pereplet.size !== targetSize || pereplet.typeUse !== targetTypeUse) {
      setPereplet((prev) => ({ ...prev, size: targetSize, typeUse: targetTypeUse }));
    }
  }, [bwCount, colorCount, bwEnabled, colorEnabled, pereplet.type]); // eslint-disable-line

  /* ===================== SAVE ===================== */

  const addNewOrderUnit = async () => {
    if (!bwEnabled && !colorEnabled) {
      setError("Увімкніть хоча б один тип друку");
      return;
    }
    if (bwEnabled && !material?.materialId) {
      setError("Виберіть матеріал для ч/б друку");
      return;
    }
    if (colorEnabled && !materialColor?.materialId) {
      setError("Виберіть матеріал для кольорового друку");
      return;
    }

    const baseExtras = {
      big: "Не потрібно",
      cute: "Не потрібно",
      holes: "Не потрібно",
      prokleyka: "Не потрібно",
      lyuversy: "Не потрібно",
      design: "Не потрібно",
      porizka: false,
    };

    try {
      const dataToSend = {
        orderId: thisOrder?.id,
        ...(isEdit && (editingOrderUnit?.id || editingOrderUnit?.idKey)
          ? { orderUnitId: editingOrderUnit.id || editingOrderUnit.idKey }
          : {}),
        toCalc: {
          nameOrderUnit: selectedService || "",
          type: "Diplom",
          size,
          color,
          bwEnabled,
          colorEnabled,
          materialBw: material,
          materialColor,
          bwCount,
          colorCount,
          count,
          pereplet,
          ...baseExtras,
        },
      };
      const response = await axios.post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend);
      setThisOrder(response.data);
      setSelectedThings2(response.data.OrderUnits);
      setEditingOrderUnit(null);
      setShowNewDiplom(false);
      setError(null);
    } catch (err) {
      setError(err);
    }
  };

  /* ===================== PRICING ===================== */

  useEffect(() => {
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

    const baseExtras = {
      big: "Не потрібно",
      cute: "Не потрібно",
      holes: "Не потрібно",
      prokleyka: "Не потрібно",
      lyuversy: "Не потрібно",
      design: "Не потрібно",
      porizka: false,
    };

    // Один комбінований запит для типу Diplom
    const data = {
      type: "Diplom",
      size,
      color,
      bwEnabled,
      colorEnabled,
      materialBw: material,
      materialColor,
      bwCount,
      colorCount,
      count,
      pereplet,
      ...baseExtras,
    };
    axios.post(`/calc/pricing`, data)
      .then((response) => {
        setPricesThis(response.data.prices);
        setError(null);
      })
      .catch((err) => setError(err));
    setPricesColor({});
  }, [
    size,
    material,
    materialColor,
    color,
    lamination?.materialId,
    lamination?.type,
    pereplet?.materialId,
    pereplet?.type,
    bwEnabled,
    colorEnabled,
    bwCount,
    colorCount,
    count,
  ]);

  const handleSizeSelect = (format) => {
    setSize({ x: format.x, y: format.y });
  };

  /* ===================== PRICING DATA ===================== */

  const scBw = pricesThis.totalSheetsBw || 0;
  const scColor = pricesThis.totalSheetsColor || 0;

  const pricingLines = [];
  if (bwEnabled) {
    pricingLines.push(
      { label: "Друк ч/б", perUnit: pricesThis.priceBwPerSheet, count: scBw, total: pricesThis.priceDrukBw || 0 },
      { label: "Матеріали ч/б", perUnit: pricesThis.priceBwPaperPerSheet, count: scBw, total: pricesThis.priceMaterialBw || 0 },
    );
  }
  if (colorEnabled) {
    pricingLines.push(
      { label: "Друк кольор.", perUnit: pricesThis.priceColorPerSheet, count: scColor, total: pricesThis.priceDrukColor || 0 },
      { label: "Матеріали кольор.", perUnit: pricesThis.priceColorPaperPerSheet, count: scColor, total: pricesThis.priceMaterialColor || 0 },
    );
  }
  const totalSheets = (bwEnabled ? bwCount : 0) + (colorEnabled ? colorCount : 0);
  const perepletPriceUnit = pricesThis.pricePerepletPerUnit || 0;
  pricingLines.push(
    { label: "Перепліт", perUnit: perepletPriceUnit, count: count, total: perepletPriceUnit * count },
  );

  const totalCombined = parseFloat(pricesThis.price) || 0;

  const pricingExtras = [];

  const handleClose = () => {
    setEditingOrderUnit(null);
    setShowNewDiplom(false);
  };

  /* ===================== RENDER ===================== */

  const headSpec = [
    `${size.x}×${size.y} мм`,
    bwEnabled ? `ч/б ${bwCount} стор` : null,
    colorEnabled ? `колір ${colorCount} стор` : null,
    pereplet.type && pereplet.type !== "Не потрібно" ? pereplet.type : null,
  ].filter(Boolean).join(" · ");

  if (!showNewDiplom) return null;

  return (
    <>
      <div className="v2-overlay" onClick={handleClose} />
      <div className={`v2-modal v2-modal-mid v2-theme-${theme}`} onClick={(e) => e.stopPropagation()}>

        {/* ШАПКА */}
        <div className="v2-head">
          <div className="v2-head-main">
            <span className="v2-head-title">
              Дипломна робота{selectedService ? ` · ${selectedService}` : ""}
            </span>
            <div className="v2-head-spec">{headSpec}</div>
          </div>
          <button className="v2-close-btn" onClick={handleClose} title="Закрити" aria-label="Закрити">
            &times;
          </button>
        </div>

        {/* ТІЛО */}
        <div className="v2-body">

          {/* СТРІЧКА ВИРОБІВ */}
          <div className="v2-tabsrail">
            {services.map((service, idx) => {
              const name = typeof service === 'string' ? service : service?.name;
              const tabColor = typeof service === 'string' ? null : service?.color;
              const prevService = services[idx - 1];
              const prevColor = prevService ? (typeof prevService === 'string' ? null : prevService?.color) : null;
              const isNewGroup = idx > 0 && tabColor !== prevColor;
              return (
                <button
                  key={name}
                  className={`v2-tab${selectedService === name ? " active" : ""}${isNewGroup ? " v2-tab-group-start" : ""}`}
                  style={tabColor ? { "--tab-color": tabColor } : undefined}
                  onClick={() => handleServiceSelect(name)}
                >
                  {name}
                </button>
              );
            })}
            <button className="v2-settings-btn" onClick={() => setShowSettings(true)} title="Налаштування">
              ⚙
            </button>
          </div>

          <div className="v2-left">

            {/* РОЗМІР */}
            <div className="v2-section">
              <span className="v2-label">Розмір у міліметрах</span>
              <div className="v2-sizes">
                {sizeButtons.map((f) => (
                  <button
                    key={f.label}
                    className={`v2-size${size.x === f.x && size.y === f.y ? " active" : ""}`}
                    onClick={() => {
                      const fmt = SIZE_FORMATS.find((sf) => sf.x === f.x && sf.y === f.y);
                      if (fmt) handleSizeSelect(fmt);
                      else setSize({ x: f.x, y: f.y });
                    }}
                  >
                    {f.label}
                  </button>
                ))}
                <div className={`v2-size v2-size-custom${!sizeButtons.some((f) => size.x === f.x && size.y === f.y) ? " active" : ""}`}>
                  <input
                    type="number"
                    value={size.x}
                    min={10}
                    max={445}
                    onChange={(e) => setSize({ x: Number(e.target.value) || 0, y: size.y })}
                  />
                  <span>×</span>
                  <input
                    type="number"
                    value={size.y}
                    min={10}
                    max={445}
                    onChange={(e) => setSize({ x: size.x, y: Number(e.target.value) || 0 })}
                  />
                  <span>мм</span>
                </div>
              </div>
            </div>

            {/* СТОРОННІСТЬ */}
            <ScSides
              value={color.sides}
              onChange={(sides) => setColor({ ...color, sides })}
            />

            {/* СКЛАД РОБОТИ */}
            <div className="v2-section">
              <span className="v2-label">Склад роботи</span>
              <div className="v2-postpress">

                {/* Чорно-білий друк */}
                <ScToggleSection
                  label="Ч/Б друк"
                  title="Чорно-білий друк"
                  isOn={bwEnabled}
                  onToggle={() => setBwEnabled((v) => !v)}
                  style={{ position: "relative", zIndex: 60 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <input
                        className="inputsArtem"
                        type="number"
                        value={bwCount}
                        min={1}
                        onChange={(e) => setBwCount(Number(e.target.value) || 1)}
                        style={{ width: "4.4rem" }}
                      />
                      <span className="inputsArtemx">стор</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Materials2
                        material={material}
                        setMaterial={setMaterial}
                        count={bwCount}
                        setCount={setBwCount}
                        size={size}
                        name={"Чорно-білий друк:"}
                        buttonsArr={[]}
                        typeUse={null}
                        disabled={true}
                        dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                        preferredMaterialName={
                          size.x === 210 && size.y === 297 ? "Офісний папір А4"
                          : size.x === 297 && size.y === 420 ? "Офісний папір А3"
                          : null
                        }
                      />
                    </div>
                  </div>
                </ScToggleSection>

                {/* Кольоровий друк */}
                <ScToggleSection
                  label="Кольор. друк"
                  title="Кольоровий друк"
                  isOn={colorEnabled}
                  onToggle={() => setColorEnabled((v) => !v)}
                  style={{ position: "relative", zIndex: 55 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <input
                        className="inputsArtem"
                        type="number"
                        value={colorCount}
                        min={1}
                        onChange={(e) => setColorCount(Number(e.target.value) || 1)}
                        style={{ width: "4.4rem" }}
                      />
                      <span className="inputsArtemx">стор</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Materials2
                        material={materialColor}
                        setMaterial={setMaterialColor}
                        count={colorCount}
                        setCount={setColorCount}
                        size={size}
                        name={"Кольоровий друк:"}
                        buttonsArr={[]}
                        typeUse={null}
                        disabled={true}
                        dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                        preferredMaterialName={
                          size.x === 210 && size.y === 297 ? "Офісний папір А4"
                          : size.x === 297 && size.y === 420 ? "Офісний папір А3"
                          : null
                        }
                      />
                    </div>
                  </div>
                </ScToggleSection>

                {/* Перепліт */}
                <ScToggleSection
                  label="Перепліт"
                  title="Перепліт"
                  isOn={pereplet.type !== "Не потрібно" && pereplet.type !== ""}
                  onToggle={() => {
                    if (pereplet.type === "Не потрібно" || pereplet.type === "") {
                      const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
                      const presetType = svc?.presets?.PerepletType || "на скобу";
                      const presetSize = svc?.presets?.PerepletSize || "<120";
                      const presetTypeUse = presetSize === ">120" ? "Брошурування від 120 до 280 аркушів" : "Брошурування до 120 аркушів";
                      setPereplet({
                        type: presetType,
                        material: presetType,
                        materialId: "",
                        size: presetSize,
                        typeUse: presetTypeUse,
                      });
                    } else {
                      setPereplet({ type: "Не потрібно", material: "", materialId: "", size: "<120", typeUse: "Брошурування до 120 аркушів" });
                    }
                  }}
                  style={{ position: "relative", zIndex: 5 }}
                >
                  <PerepletPereplet
                    pereplet={pereplet}
                    setPereplet={setPereplet}
                    prices={[]}
                    size={size}
                    type={"SheetCut"}
                    dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                    buttonsArr={["Брошурування до 120 аркушів", "Брошурування від 120 до 280 аркушів"]}
                    defaultt={"А3 (297 х 420 мм)"}
                    hideSizeButtons={true}
                    allowedTypes={["на пружину", "на пластик", "твердим переплітом"]}
                  />
                </ScToggleSection>
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
                  onChange={(e) => setCount(Number(e.target.value) || 1)}
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
                          {line.count} × {fmt2(line.perUnit)} ={" "}
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
                {fmt2(totalCombined)} <span className="v2-total-unit">грн</span>
              </div>
              <div className="v2-total-sub">
                <span>За 1 виріб</span>
                <span>{count ? fmt2(totalCombined / count) : "0,00"} грн</span>
              </div>
            </div>

            <button className="v2-add-btn" onClick={addNewOrderUnit} disabled={!thisOrder?.id}>
              <span className="v2-add-btn-icon" aria-hidden="true">{isEdit ? "✓" : "+"}</span>
              <span className="v2-add-btn-label">
                {isEdit ? "Зберегти зміни" : "Додати в замовлення"}
              </span>
            </button>
          </div>
        </div>

        {/* ПОМИЛКА */}
        {(typeof error === "string" ? error : error?.response?.data?.error) && (
          <div className="v2-error">
            {typeof error === "string" ? error : error.response.data.error}
          </div>
        )}

        {/* НАЛАШТУВАННЯ ВИРОБІВ */}
        <ServiceSettingsModal
          variant="ssm-v2"
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
          extraToggles={[
            { key: "hidePereplet", label: "Перепліт", defaultKey: "PerepletDefault", params: [
              { key: "PerepletType", label: "Тип", options: ["на скобу","на євроскобу","на пластик","на пружину","твердим переплітом","на календар"] },
              { key: "PerepletSize", label: "Кількість", options: ["<120",">120"] }
            ]},
          ]}
        />
      </div>
    </>
  );
}
