import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from '../../api/axiosInstance';
import Materials2 from "./newnomodals/Materials2";
import SliderComponent from "./newnomodals/SlidersComponent";
import { useNavigate } from "react-router-dom";

import ServiceSettingsModal from "./shared/ServiceSettingsModal";
import useServiceTabs from "../../hooks/useServiceTabs";
import { getStoredAppTheme, onAppThemeChange } from "../../utils/appTheme";

import "./NewSheetCutV2.css";

const DEFAULTS = {
  size: { x: 420, y: 594 },
  material: { type: "Папір Широкоформат", thickness: "", material: "", materialId: "" },
  color: { sides: "односторонній", one: "", two: "", allSidesColor: "CMYK" },
  lamination: { type: "Не потрібно", material: "" },
  big: "Не потрібно",
  cute: "Не потрібно",
  cuteLocal: { leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" },
  holes: "Не потрібно",
  holesR: "Не потрібно",
  count: 1,
  selectedService: "Плакат",
};

const SERVICES = ["Плакат", "Креслення", "Фотографія", "Афіша", "Лекала", "Холст"];

const NewWide = ({
  thisOrder,
  setShowNewWide,
  showNewWide,
  setThisOrder,
  setSelectedThings2,
  editingOrderUnit,
  setEditingOrderUnit,
}) => {
  const navigate = useNavigate();

  const fmt2 = (v) =>
    new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(v) || 0);

  const isEdit = Boolean(editingOrderUnit && (editingOrderUnit.id || editingOrderUnit.ID || editingOrderUnit.idKey));
  const skipInitialPricing = useRef(false);

  const safeSetShowNewWide = useCallback((val) => {
    if (typeof setShowNewWide === "function") setShowNewWide(val);
  }, [setShowNewWide]);

  const safeSetEditingOrderUnit = useCallback((val) => {
    if (typeof setEditingOrderUnit === "function") setEditingOrderUnit(val);
  }, [setEditingOrderUnit]);

  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);

  const [size, setSize] = useState(DEFAULTS.size);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [color, setColor] = useState(DEFAULTS.color);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);
  const [big, setBig] = useState(DEFAULTS.big);
  const [cute, setCute] = useState(DEFAULTS.cute);
  const [cuteLocal, setCuteLocal] = useState(DEFAULTS.cuteLocal);
  const [holes, setHoles] = useState(DEFAULTS.holes);
  const [holesR, setHolesR] = useState(DEFAULTS.holesR);
  const [count, setCount] = useState(DEFAULTS.count);
  const [selectedService, setSelectedService] = useState(DEFAULTS.selectedService);
  const { services, addService, removeService, updateService, reorderServices } = useServiceTabs("Wide", SERVICES);
  const [showSettings, setShowSettings] = useState(false);

  // тема стежить за глобальною темою застосунку (перемикач у Nav)
  const [theme, setTheme] = useState(getStoredAppTheme);
  useEffect(() => onAppThemeChange(setTheme), []);

  const DEFAULT_SIZES = [
    { label: "A2", x: 420, y: 594 }, { label: "A1", x: 594, y: 841 },
    { label: "A0", x: 841, y: 1189 }, { label: "60×90", x: 600, y: 900 },
    { label: "70×100", x: 700, y: 1000 }, { label: "90×120", x: 900, y: 1200 },
  ];

  const sizeButtons = useMemo(() => {
    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
    const sizes = svc?.presets?.sizes;
    if (Array.isArray(sizes) && sizes.length > 0) return sizes;
    return DEFAULT_SIZES;
  }, [services, selectedService]);

  const handleServiceSelect = useCallback((name) => {
    setSelectedService(name);
    if (isEdit) return;
    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === name);
    const p = svc?.presets;
    if (!p) return;
    if (p.sizeX || p.sizeY) {
      setSize({ x: p.sizeX ? Number(p.sizeX) : size.x, y: p.sizeY ? Number(p.sizeY) : size.y });
    }
  }, [services, isEdit, size]);

  const [prices, setPrices] = useState(null);
  const [pricesThis, setPricesThis] = useState(null);

  const handleChangeCount = (val) => {
    const n = Number(val);
    if (Number.isFinite(n) && n > 0) setCount(n);
  };

  const handleClose = () => {
    safeSetShowNewWide(false);
    safeSetEditingOrderUnit(null);
  };

  // Завантаження прайсів
  useEffect(() => {
    axios.get(`/getpricesNew`)
      .then((response) => setPrices(response.data))
      .catch((e) => console.log(e?.message));
  }, []);

  // Гідрація стейтів (NEW vs EDIT)
  useEffect(() => {
    if (!showNewWide) return;

    if (!isEdit) {
      setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setLamination(DEFAULTS.lamination);
      setBig(DEFAULTS.big);
      setCute(DEFAULTS.cute);
      setCuteLocal(DEFAULTS.cuteLocal);
      setHoles(DEFAULTS.holes);
      setHolesR(DEFAULTS.holesR);
      setCount(DEFAULTS.count);
      setSelectedService(DEFAULTS.selectedService);
      setError(null);
      setPricesThis(null);
      return;
    }

    let opts = {};
    try {
      if (editingOrderUnit?.optionsJson) {
        opts = JSON.parse(editingOrderUnit.optionsJson) || {};
      }
    } catch (e) {
      opts = {};
    }

    const sizeFromFields = (editingOrderUnit?.newField2 && editingOrderUnit?.newField3)
      ? { x: Number(editingOrderUnit.newField2) || DEFAULTS.size.x, y: Number(editingOrderUnit.newField3) || DEFAULTS.size.y }
      : null;
    setSize(opts.size || sizeFromFields || editingOrderUnit?.size || DEFAULTS.size);
    setMaterial(opts.material || editingOrderUnit?.material || DEFAULTS.material);
    setColor(opts.color || DEFAULTS.color);
    setLamination(opts.lamination || DEFAULTS.lamination);
    setBig(opts.big ?? DEFAULTS.big);
    setCute(opts.cute ?? DEFAULTS.cute);
    setCuteLocal(opts.cuteLocal || DEFAULTS.cuteLocal);
    setHoles(opts.holes ?? DEFAULTS.holes);
    setHolesR(opts.holesR ?? DEFAULTS.holesR);

    const cnt =
      opts.count ??
      editingOrderUnit?.amount ??
      editingOrderUnit?.newField5 ?? editingOrderUnit?.newField2 ?? DEFAULTS.count;
    setCount(Number(cnt) > 0 ? Number(cnt) : DEFAULTS.count);
    if (isEdit) skipInitialPricing.current = true;

    const svc =
      opts.selectedService ||
      opts.newField1 ||
      editingOrderUnit?.newField1 ||
      DEFAULTS.selectedService;
    setSelectedService(svc);

    setError(null);
    setPricesThis(null);
  }, [showNewWide, isEdit, editingOrderUnit, safeSetEditingOrderUnit, safeSetShowNewWide]);

  // Pricing
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

    if (!showNewWide) return;

    const dataToSend = {
      type: "Wide",
      size,
      material,
      color,
      lamination,
      big,
      cute,
      cuteLocal,
      holes,
      holesR,
      count,
    };

    axios.post(`/calc/pricing`, dataToSend)
      .then((response) => {
        setPricesThis(response.data.prices);
        setError(null);
      })
      .catch((e) => {
        console.log(e?.message);
        setError(e);
      });
  }, [showNewWide, size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count]);

  const saveOrderUnit = () => {
    if (!thisOrder?.id) return;

    const toCalc = {
      nameOrderUnit: selectedService ? `${selectedService.toLowerCase()} ` : "",
      type: "Wide",
      size,
      material,
      color,
      lamination,
      big,
      cute,
      cuteLocal,
      holes,
      holesR,
      count,
      selectedService,
      newField1: selectedService,
    };

    const dataToSend = {
      orderId: thisOrder.id,
      ...(isEdit ? { orderUnitId: (editingOrderUnit.id || editingOrderUnit.ID || editingOrderUnit.idKey), idKey: editingOrderUnit.idKey } : {}),
      toCalc,
    };

    setLoad(true);
    axios.post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then((response) => {
        setThisOrder?.(response.data);
        setSelectedThings2?.(response.data.OrderUnits);
        safeSetShowNewWide(false);
        safeSetEditingOrderUnit(null);
      })
      .catch((e) => {
        setError(e);
        if (e?.response?.status === 403) navigate('/login');
        console.log(e?.message);
      })
      .finally(() => setLoad(false));
  };

  // ========== PRICING DATA ==========

  const sc = pricesThis?.sheetCount || 0;
  const pricingLines = [
    { label: "Друк", perUnit: pricesThis?.priceDrukPerSheet, count: sc, total: (parseFloat(pricesThis?.priceDrukPerSheet) || 0) * sc },
    { label: "Матеріали", perUnit: pricesThis?.pricePaperPerSheet, count: sc, total: (parseFloat(pricesThis?.pricePaperPerSheet) || 0) * sc },
  ];

  const pricingSimpleLines = pricesThis?.porizka && pricesThis.porizka !== 0
    ? [{ label: "Порізка", value: (parseFloat(pricesThis.porizka) || 0) * sc }]
    : [];

  // ========== RENDER ==========

  const headSpec = [
    `${size.x}×${size.y} мм`,
    material?.material || null,
  ].filter(Boolean).join(" · ");

  if (!showNewWide) return null;

  return (
    <>
      <div className="v2-overlay" onClick={handleClose} />
      <div className={`v2-modal v2-theme-${theme}`} onClick={(e) => e.stopPropagation()}>

        {/* ШАПКА */}
        <div className="v2-head">
          <div className="v2-head-main">
            <span className="v2-head-title">
              Широкоформатний фотодрук{selectedService ? ` · ${selectedService}` : ""}
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
                    onClick={() => setSize({ x: f.x, y: f.y })}
                  >
                    {f.label}
                  </button>
                ))}
                <div className={`v2-size v2-size-custom${!sizeButtons.some((f) => size.x === f.x && size.y === f.y) ? " active" : ""}`}>
                  <input
                    type="number"
                    value={size.x}
                    min={10}
                    onChange={(e) => setSize({ x: Number(e.target.value) || 0, y: size.y })}
                  />
                  <span>×</span>
                  <input
                    type="number"
                    value={size.y}
                    min={10}
                    onChange={(e) => setSize({ x: size.x, y: Number(e.target.value) || 0 })}
                  />
                  <span>мм</span>
                </div>
              </div>
            </div>

            {/* ПІДБІР РОЗМІРУ ПОВЗУНКАМИ */}
            <div className="v2-section">
              <span className="v2-label">Підбір розміру</span>
              <SliderComponent
                size={size}
                setSize={setSize}
                prices={prices}
                type={"Wide"}
                buttonsArr={["односторонній"]}
                color={color}
                setColor={setColor}
                count={count}
                setCount={setCount}
              />
            </div>

            {/* МАТЕРІАЛ */}
            <div className="v2-section" style={{ position: "relative", zIndex: 60 }}>
              <span className="v2-label">Матеріал</span>
              <div className="v2-material-wrap">
                <Materials2
                  material={material}
                  setMaterial={setMaterial}
                  count={count}
                  setCount={setCount}
                  prices={prices}
                  size={size}
                  selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                  name={"Широкоформатний фотодрук:"}
                  buttonsArr={[]}
                  dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                  preferredMaterialName={(() => {
                    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
                    return svc?.presets?.materialName || undefined;
                  })()}
                />
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
                          {fmt2(line.count)} м² × {fmt2(line.perUnit)} ={" "}
                        </span>
                      )}
                      {fmt2(line.total)} грн
                    </span>
                  </div>
                );
              })}
              {pricingSimpleLines.map((line, i) => (
                <div className="v2-price-row" key={`s${i}`}>
                  <span>{line.label}</span>
                  <i className="v2-lead" />
                  <span className="v2-price-val">{fmt2(line.value)} грн</span>
                </div>
              ))}
            </div>

            <div className="v2-total">
              <div className="v2-total-price">
                {fmt2(pricesThis?.price || 0)} <span className="v2-total-unit">грн</span>
              </div>
              <div className="v2-total-sub">
                <span>За виріб</span>
                <span>{fmt2(pricesThis?.priceForItemWithExtras || 0)} грн</span>
              </div>
            </div>

            <button className="v2-add-btn" onClick={saveOrderUnit} disabled={load || !thisOrder?.id}>
              <span className="v2-add-btn-icon" aria-hidden="true">{isEdit ? "✓" : "+"}</span>
              <span className="v2-add-btn-label">
                {isEdit ? "Зберегти зміни" : "Додати в замовлення"}
              </span>
            </button>
          </div>
        </div>

        {/* ПОМИЛКА */}
        {error && (
          <div className="v2-error">
            {error?.response?.data?.error || error?.message || "Помилка"}
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
        />
      </div>
    </>
  );
};

export default NewWide;
