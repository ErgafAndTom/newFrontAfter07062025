import axios from '../../api/axiosInstance';
import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import Materials2 from "./newnomodals/Materials2";

/* Будівельні блоки PRINT V2 — пропси ті самі, що були у Sc*-версій */
import ScSides from "./shared/V2Sides";
import ScToggleSection from "./shared/V2ToggleSection";
import ServiceSettingsModal from "./shared/ServiceSettingsModal";
import useServiceTabs from "../../hooks/useServiceTabs";
import { getStoredAppTheme, onAppThemeChange } from "../../utils/appTheme";

import "./NewSheetCutV2.css";

const DEFAULT_SIZE = { x: 297, y: 420 };

const SIZE_FORMATS = [
  { name: "A4 (210 x 297 мм)", x: 210, y: 297 },
  { name: "A3 (297 x 420 мм)", x: 297, y: 420 },
];

const DEFAULTS = {
  size: DEFAULT_SIZE,
  materialColor: {
    type: "Папір",
    thickness: "Цупкий",
    material: "",
    materialId: "",
    typeUse: "Цупкий",
  },
  color: {
    sides: "односторонній",
    one: "",
    two: "",
    allSidesColor: "Кольоровий",
  },
  count: 1,
  colorCount: 1,
  selectedService: "Папка",
};

function parseOptionsJson(orderUnit) {
  if (!orderUnit?.optionsJson) return null;
  try {
    return JSON.parse(orderUnit.optionsJson);
  } catch {
    return null;
  }
}

export default function NewFolder({
  thisOrder,
  setThisOrder,
  setSelectedThings2,
  showNewFolder,
  setShowNewFolder,
  editingOrderUnit,
  setEditingOrderUnit,
}) {
  const fmt2 = (v) =>
    new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(v) || 0);

  const [count, setCount] = useState(DEFAULTS.count);
  const [selectedService, setSelectedService] = useState(DEFAULTS.selectedService);
  const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.idKey);
  const skipInitialPricing = useRef(false);
  const [size, setSize] = useState(DEFAULTS.size);

  const options = useMemo(
    () => parseOptionsJson(editingOrderUnit),
    [editingOrderUnit]
  );

  const [materialColor, setMaterialColor] = useState(DEFAULTS.materialColor);
  const [color, setColor] = useState(DEFAULTS.color);
  const [colorCount, setColorCount] = useState(DEFAULTS.colorCount);

  const [prokleykaKisheni, setProkleykaKisheni] = useState({
    type: "prokleyka",
    material: "Проклейка кишені",
    materialId: "",
    typeUse: "Проклейка кишені",
    enabled: true,
  });

  const [error, setError] = useState(null);
  const [pricesThis, setPricesThis] = useState({});

  const [showSettings, setShowSettings] = useState(false);

  // тема стежить за глобальною темою застосунку (перемикач у Nav)
  const [theme, setTheme] = useState(getStoredAppTheme);
  useEffect(() => onAppThemeChange(setTheme), []);
  const { services, addService, removeService, updateService, reorderServices, loading: servicesLoading } = useServiceTabs("Folder", [
    "Папка",
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

  // Застосувати пресети при виборі сервісу
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
    if (p.materialName !== undefined) {
      setMaterialColor((prev) => ({ ...prev, material: "", materialId: "" }));
    }
  }, [services, isEdit]);

  /* ===================== INIT MODAL (NEW/EDIT) ===================== */
  useEffect(() => {
    if (!showNewFolder) return;
    if (isEdit) skipInitialPricing.current = true;

    if (!isEdit) {
      setSize(DEFAULTS.size);
      setMaterialColor(DEFAULTS.materialColor);
      setColor(DEFAULTS.color);
      setCount(DEFAULTS.count);
      setColorCount(DEFAULTS.colorCount);
      setProkleykaKisheni({ type: "prokleyka", material: "Проклейка кишені", materialId: "", typeUse: "Проклейка кишені", enabled: true });
      setSelectedService(DEFAULTS.selectedService);
      setError(null);
      return;
    }

    // EDIT
    const opt = options || {};
    const savedName = options?.nameOrderUnit || "";

    setCount(opt.count ?? editingOrderUnit?.amount ?? DEFAULTS.count);
    setColorCount(opt.colorCount ?? DEFAULTS.colorCount);
    setSize({ x: opt?.size?.x ?? DEFAULT_SIZE.x, y: opt?.size?.y ?? DEFAULT_SIZE.y });
    setMaterialColor({
      type: opt?.materialColor?.type ?? DEFAULTS.materialColor.type,
      thickness: opt?.materialColor?.thickness ?? DEFAULTS.materialColor.thickness,
      material: opt?.materialColor?.material ?? "",
      materialId: opt?.materialColor?.materialId ?? "",
      typeUse: opt?.materialColor?.typeUse ?? DEFAULTS.materialColor.typeUse,
    });
    setColor({
      sides: opt?.color?.sides ?? DEFAULTS.color.sides,
      one: opt?.color?.one ?? "",
      two: opt?.color?.two ?? "",
      allSidesColor: opt?.color?.allSidesColor ?? DEFAULTS.color.allSidesColor,
    });
    setProkleykaKisheni({
      type: "prokleyka",
      material: opt?.prokleykaKisheni?.material ?? "Проклейка кишені",
      materialId: opt?.prokleykaKisheni?.materialId ?? "",
      typeUse: "Проклейка кишені",
      enabled: opt?.prokleykaKisheni !== "Не потрібно",
    });

    const matched = services.find(
      (s) => (typeof s === 'string' ? s : s?.name)?.toLowerCase() === savedName.toLowerCase()
    );
    setSelectedService(matched ? (typeof matched === 'string' ? matched : matched.name) : (services[0] ? (typeof services[0] === 'string' ? services[0] : services[0].name) : ""));
    setError(null);
  }, [showNewFolder, isEdit, options, editingOrderUnit]);

  /* ===================== SAVE ===================== */
  const addNewOrderUnit = async () => {
    if (!materialColor?.materialId) {
      setError("Виберіть матеріал (крейдований папір)");
      return;
    }

    const baseExtras = {
      big: "2",
      cute: "Не потрібно",
      holes: "Не потрібно",
      prokleykaKisheni: prokleykaKisheni.enabled ? prokleykaKisheni : "Не потрібно",
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
          nameOrderUnit: selectedService || "Папка",
          serviceCategory: "Folder",
          serviceName: selectedService,
          type: "Folder",
          size,
          color,
          materialColor,
          colorCount,
          count,
          ...baseExtras,
        },
      };
      const response = await axios.post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend);
      setThisOrder(response.data);
      setSelectedThings2(response.data.OrderUnits);
      setEditingOrderUnit(null);
      setShowNewFolder(false);
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
      big: "2",
      cute: "Не потрібно",
      holes: "Не потрібно",
      prokleykaKisheni: prokleykaKisheni.enabled ? prokleykaKisheni : "Не потрібно",
      lyuversy: "Не потрібно",
      design: "Не потрібно",
      porizka: false,
    };

    const data = {
      type: "Folder",
      size,
      color,
      materialColor,
      colorCount,
      count,
      ...baseExtras,
    };
    axios.post(`/calc/pricing`, data)
      .then((response) => {
        const p = response.data.prices;
        setPricesThis(p);
        setError(null);
        const selectedP = p?.selectedProkleyka;
        if (selectedP?.id) {
          setProkleykaKisheni((prev) => {
            const prevId = prev?.materialId ? String(prev.materialId) : "";
            if (prevId && prevId !== "0") return prev;
            return { ...prev, materialId: selectedP.id };
          });
        }
      })
      .catch((err) => setError(err));
  }, [
    size,
    materialColor,
    color,
    colorCount,
    count,
    prokleykaKisheni.enabled,
  ]);

  const handleSizeSelect = (format) => {
    setSize({ x: format.x, y: format.y });
  };

  /* ===================== PRICING DATA ===================== */
  const scColor = pricesThis.totalSheetsColor || 0;

  const pricingLines = [];
  pricingLines.push(
    { label: "Друк кольор.", perUnit: pricesThis.priceColorPerSheet, count: scColor, total: pricesThis.priceDrukColor || 0 },
    { label: "Матеріали", perUnit: pricesThis.priceColorPaperPerSheet, count: scColor, total: pricesThis.priceMaterialColor || 0 },
  );
  if (pricesThis.big?.totalPrice > 0) {
    pricingLines.push(
      { label: "Бігування (2 біги)", perUnit: pricesThis.big.pricePerUnit, count: count, total: pricesThis.big.totalPrice || 0 },
    );
  }
  if (prokleykaKisheni.enabled && pricesThis.prokleyka) {
    pricingLines.push(
      { label: "Проклейка кишені", perUnit: pricesThis.prokleyka.pricePerUnit, count: count, total: parseFloat(pricesThis.prokleyka.totalPrice) || 0 },
    );
  }

  const totalCombined = parseFloat(pricesThis.price) || 0;
  const pricingExtras = [];

  const handleClose = () => {
    setEditingOrderUnit(null);
    setShowNewFolder(false);
  };

  /* ===================== RENDER ===================== */

  const headSpec = [
    `${size.x}×${size.y} мм`,
    materialColor?.material || null,
    prokleykaKisheni.enabled ? "проклейка кишені" : null,
  ].filter(Boolean).join(" · ");

  if (!showNewFolder) return null;

  return (
    <>
      <div className="v2-overlay" onClick={handleClose} />
      <div className={`v2-modal v2-modal-mid v2-theme-${theme}`} onClick={(e) => e.stopPropagation()}>

        {/* ШАПКА */}
        <div className="v2-head">
          <div className="v2-head-main">
            <span className="v2-head-title">
              Папка{selectedService ? ` · ${selectedService}` : ""}
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

            {/* ДРУК І МАТЕРІАЛ — у папки друк завжди кольоровий,
                тож це не перемикач, а звичайна секція */}
            <div className="v2-section">
              <span className="v2-label">Кольоровий друк</span>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
                <div className="v2-material-wrap" style={{ flex: 1 }}>
                  <Materials2
                    material={materialColor}
                    setMaterial={setMaterialColor}
                    count={colorCount}
                    setCount={setColorCount}
                    size={size}
                    name={"Кольоровий друк:"}
                    buttonsArr={[]}
                    typeUse={null}
                    disabled={false}
                    dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                    preferredMaterialName={(() => {
                      const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
                      return svc?.presets?.materialName || "Крейдований";
                    })()}
                  />
                </div>
              </div>
            </div>

            {/* ПОСТОБРОБКА */}
            <div className="v2-section">
              <span className="v2-label">Постобробка</span>
              <div className="v2-postpress">
                <ScToggleSection
                  label="Проклейка кишені"
                  title="Проклейка кишені"
                  isOn={prokleykaKisheni.enabled}
                  onToggle={() => setProkleykaKisheni((prev) => ({ ...prev, enabled: !prev.enabled }))}
                  style={{ position: "relative", zIndex: 5 }}
                >
                  <span className="v2-toggle-name">Проклейка кишені для готової папки</span>
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
          thicknessOptions={["Цупкий"]}
          hideLaminationOption={true}
          extraToggles={[]}
        />
      </div>
    </>
  );
}
