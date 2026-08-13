import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "../../api/axiosInstance";
import Materials2 from "./newnomodals/Materials2";
import SliderComponent from "./newnomodals/SlidersComponent";
import { useNavigate } from "react-router-dom";
import Luvarsi from "./newnomodals/wideFactory/Luvarsi";
import PlotterCutting from "./newnomodals/wideFactory/PlotterCutting";
import MontajnaPlivkaWideFactory from "./newnomodals/wideFactory/MontajnaPlivkaWideFactory";
import LaminationWideFactory from "./newnomodals/wideFactory/LaminationWideFactory";
import ServiceSettingsModal from "./shared/ServiceSettingsModal";
import V2ToggleSwitch from "./shared/V2ToggleSwitch";
import useServiceTabs from "../../hooks/useServiceTabs";
import { getStoredAppTheme, onAppThemeChange } from "../../utils/appTheme";

/* Та сама розмітка й той самий CSS, що в еталонного цифрового друку
   (NewSheetCutV2): шапка зі специфікацією, ліва стрічка виробів,
   центральна колонка параметрів, права панель наряду. */
import "./NewSheetCutV2.css";

// ========== CONSTANTS ==========

const CATEGORY_DEFAULT_MATERIAL = {
  "Баннер FactoryWide": { material: "Банер литий", materialId: 406, a: "510" },
  "Плівка FactoryWide": { material: "Біла плівка Oracal Orajet 3640", materialId: 402, a: "90" },
  "Папір FactoryWide": { material: "City-light ", materialId: 397, a: "150" },
  "ПВХ FactoryWide": { material: "ПВХ", materialId: 408, a: "3" },
};

const DEFAULTS = {
  size: { x: 420, y: 594 },
  material: { type: "Баннер FactoryWide", thickness: "", material: "Банер литий", materialId: 406, a: "510" },
  color: { sides: "односторонній", one: "", two: "", allSidesColor: "CMYK" },
  lamination: { type: "Не потрібно", material: "", materialId: "" },
  big: "Не потрібно",
  cute: "Не потрібно",
  cuteLocal: { leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" },
  luversi: { type: "Не потрібно", thickness: "", material: "", materialId: "", size: 100 },
  plotterCutting: { type: "Не потрібно", thickness: "", material: "", materialId: "", size: 100 },
  montajnaPlivka: { type: "Не потрібно", thickness: "", material: "", materialId: "", size: 100 },
  holes: "Не потрібно",
  holesR: "Не потрібно",
  count: 1,
  selectedDruk: "Екосольвентний друк",
  selectedService: "Баннер",
  selectWideFactory: "Баннер FactoryWide",
};

const DRUK_OPTIONS = ["Екосольвентний друк", "УФ друк"];

const CATEGORY_SERVICES = {
  "Баннер FactoryWide": ["Баннер"],
  "Плівка FactoryWide": ["Наліпки", "Стікера", "Графік роботи"],
  "Папір FactoryWide": ["Афіша", "Плакат", "Реклама"],
  "ПВХ FactoryWide": ["Таблички"],
};

const CATEGORIES = [
  "Плівка FactoryWide",
  "Баннер FactoryWide",
  "Папір FactoryWide",
  "ПВХ FactoryWide",
];

// ========== COMPONENT ==========

const WideFactory = ({
  thisOrder,
  setShowWideFactory,
  showWideFactory,
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

  const editId = editingOrderUnit?.id ?? editingOrderUnit?.ID ?? editingOrderUnit?.idKey ?? null;
  const isEdit = Boolean(editId);
  const skipInitialPricing = useRef(false);

  const safeSetShowWideFactory = useCallback((val) => {
    if (typeof setShowWideFactory === "function") setShowWideFactory(val);
  }, [setShowWideFactory]);

  const safeSetEditingOrderUnit = useCallback((val) => {
    if (typeof setEditingOrderUnit === "function") setEditingOrderUnit(val);
  }, [setEditingOrderUnit]);

  // ========== STATE ==========

  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);

  const [selectWideFactory, setSelectWideFactory] = useState(DEFAULTS.selectWideFactory);
  const { services, addService, removeService, updateService, reorderServices } = useServiceTabs("WideFactory", [
    "Баннер", "Наліпки", "Стікера", "Графік роботи",
    "Афіша", "Плакат", "Реклама", "Таблички",
  ]);
  const [selectedDruk, setSelectedDruk] = useState(DEFAULTS.selectedDruk);
  const [showSettings, setShowSettings] = useState(false);

  // тема стежить за глобальною темою застосунку (перемикач у Nav)
  const [theme, setTheme] = useState(getStoredAppTheme);
  useEffect(() => onAppThemeChange(setTheme), []);


  const DEFAULT_SIZES = [
    { label: "A2", x: 420, y: 594 }, { label: "A1", x: 594, y: 841 },
    { label: "A0", x: 841, y: 1189 }, { label: "60×90", x: 600, y: 900 },
    { label: "100×150", x: 1000, y: 1500 }, { label: "200×300", x: 2000, y: 3000 },
  ];

  const [size, setSize] = useState(DEFAULTS.size);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [color, setColor] = useState(DEFAULTS.color);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);
  const [big, setBig] = useState(DEFAULTS.big);
  const [cute, setCute] = useState(DEFAULTS.cute);
  const [cuteLocal, setCuteLocal] = useState(DEFAULTS.cuteLocal);
  const [luversi, setLuversi] = useState(DEFAULTS.luversi);
  const [plotterCutting, setPlotterCutting] = useState(DEFAULTS.plotterCutting);
  const [montajnaPlivka, setMontajnaPlivka] = useState(DEFAULTS.montajnaPlivka);
  const [holes, setHoles] = useState(DEFAULTS.holes);
  const [holesR, setHolesR] = useState(DEFAULTS.holesR);
  const [count, setCount] = useState(DEFAULTS.count);
  const [selectedService, setSelectedService] = useState(DEFAULTS.selectedService);

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
    if (p.materialCategory) {
      setSelectWideFactory(p.materialCategory);
      const defMat = CATEGORY_DEFAULT_MATERIAL[p.materialCategory];
      if (defMat) {
        setMaterial((prev) => ({ ...prev, type: p.materialCategory, material: defMat.material, materialId: defMat.materialId, a: defMat.a }));
      }
    }
  }, [services, isEdit, size]);

  const [prices, setPrices] = useState(null);
  const [pricesThis, setPricesThis] = useState(null);

  // ========== HANDLERS ==========

  const handleChangeCount = (val) => {
    const n = Number(val);
    if (Number.isFinite(n) && n > 0) setCount(n);
  };

  const handleClose = () => {
    safeSetShowWideFactory(false);
    safeSetEditingOrderUnit(null);
  };

  const handleClickWideFactory = (e) => {
    const def = CATEGORY_DEFAULT_MATERIAL[e] || {};
    setMaterial((prev) => ({
      ...prev,
      type: e,
      material: def.material || "",
      materialId: def.materialId || "",
      a: def.a || "",
    }));
    setSelectWideFactory(e);
  };

  // Sync selectedService when services change
  useEffect(() => {
    if (!services || services.length === 0) return;
    const names = services.map((s) => (typeof s === 'string' ? s : s?.name)).filter(Boolean);
    setSelectedService((prev) => (prev && names.includes(prev)) ? prev : names[0]);
  }, [services]);

  // ========== HYDRATION (NEW vs EDIT) ==========

  const safeParseOptions = (raw) => {
    if (!raw) return null;
    if (typeof raw === "object") return raw;
    try { return JSON.parse(raw); } catch (e) { return null; }
  };

  useEffect(() => {
    if (!showWideFactory) return;

    if (!isEdit) {
      setSelectWideFactory(DEFAULTS.selectWideFactory);
      setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setLamination(DEFAULTS.lamination);
      setBig(DEFAULTS.big);
      setCute(DEFAULTS.cute);
      setCuteLocal(DEFAULTS.cuteLocal);
      setLuversi(DEFAULTS.luversi);
      setPlotterCutting(DEFAULTS.plotterCutting);
      setMontajnaPlivka(DEFAULTS.montajnaPlivka);
      setHoles(DEFAULTS.holes);
      setHolesR(DEFAULTS.holesR);
      setCount(DEFAULTS.count);
      setSelectedDruk(DEFAULTS.selectedDruk);
      setSelectedService(DEFAULTS.selectedService);
      setError(null);
      setPricesThis(null);
      return;
    }

    const opts = safeParseOptions(editingOrderUnit?.optionsJson) || {};
    const factoryType = opts?.material?.type || editingOrderUnit?.type || DEFAULTS.selectWideFactory;
    const newServices = CATEGORY_SERVICES[factoryType] || CATEGORY_SERVICES[DEFAULTS.selectWideFactory];

    setSelectWideFactory(factoryType);

    if (opts.size?.x && opts.size?.y) setSize(opts.size);
    else if (editingOrderUnit?.newField2 && editingOrderUnit?.newField3) {
      setSize({ x: Number(editingOrderUnit.newField2), y: Number(editingOrderUnit.newField3) });
    }

    if (opts.material) setMaterial(opts.material);
    if (opts.color) setColor(opts.color);
    if (opts.lamination) setLamination(opts.lamination);
    if (opts.big) setBig(opts.big);
    if (opts.cute) setCute(opts.cute);
    if (opts.cuteLocal) setCuteLocal(opts.cuteLocal);
    if (opts.holes) setHoles(opts.holes);
    if (opts.holesR) setHolesR(opts.holesR);

    if (typeof opts.count !== "undefined") setCount(Number(opts.count) || 1);
    else if (editingOrderUnit?.amount) setCount(Number(editingOrderUnit.amount) || 1);
    else if (editingOrderUnit?.newField5) setCount(Number(editingOrderUnit.newField5) || 1);

    if (opts.selectedDruk) setSelectedDruk(opts.selectedDruk);
    if (opts.luversi) setLuversi(opts.luversi);
    if (opts.plotterCutting) setPlotterCutting(opts.plotterCutting);
    if (opts.montajnaPlivka) setMontajnaPlivka(opts.montajnaPlivka);

    const svcRaw = opts.selectedService || opts.newField1 || editingOrderUnit?.newField1 || newServices[0];
    const svc = typeof svcRaw === 'string' ? svcRaw : (svcRaw?.name || newServices[0]);
    setSelectedService(svc);

    if (isEdit) skipInitialPricing.current = true;
    setError(null);
    setPricesThis(null);
  }, [showWideFactory, isEdit, editId]);

  // ========== PRICING ==========

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

    if (!showWideFactory) return;

    const dataToSend = {
      type: "WideFactory",
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
      selectedDruk,
      luversi,
      plotterCutting,
      montajnaPlivka,
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
  }, [showWideFactory, size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count, selectedDruk, luversi, plotterCutting, montajnaPlivka]);

  // ========== SAVE ==========

  const saveOrderUnit = () => {
    if (!thisOrder?.id) return;

    const toCalc = {
      nameOrderUnit: selectedService ? `${selectedService.toLowerCase()} ` : "",
      serviceCategory: "WideFactory",
      serviceName: selectedService,
      type: "WideFactory",
      newField6: "WideFactory",
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
      selectedDruk,
      luversi,
      plotterCutting,
      montajnaPlivka,
    };

    const dataToSend = {
      orderId: thisOrder.id,
      ...(isEdit ? { orderUnitId: editId, idKey: editId } : {}),
      toCalc,
    };

    setLoad(true);
    axios.post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then((response) => {
        setThisOrder?.(response.data);
        setSelectedThings2?.(response.data.OrderUnits);
        safeSetShowWideFactory(false);
        safeSetEditingOrderUnit(null);
      })
      .catch((e) => {
        setError(e);
        if (e?.response?.status === 403) navigate("/login");
        console.log(e?.message);
      })
      .finally(() => setLoad(false));
  };

  // ========== PRICING DATA ==========

  const sc = pricesThis?.sheetCount || 0;
  const totalM2 = pricesThis?.totalSizeInM2One || 0;

  const pricingLines = [
    { label: "Друк", perUnit: pricesThis?.priceDrukPerSheet, count: totalM2, total: parseFloat(pricesThis?.oneItemWideDrukPrice) || 0 },
    { label: "Матеріали", perUnit: pricesThis?.pricePaperPerSheet, count: totalM2, total: parseFloat(pricesThis?.oneItemWideMaterialPrice) || 0 },
  ];

  const pricingSimpleLines = [];
  if (pricesThis?.porizka && pricesThis.porizka !== 0) {
    pricingSimpleLines.push({ label: "Порізка", value: (parseFloat(pricesThis.porizka) || 0) * sc });
  }
  if (lamination.type !== "Не потрібно" && pricesThis?.totalWideLaminationPrice) {
    pricingSimpleLines.push({ label: "Ламінація", value: parseFloat(pricesThis.totalWideLaminationPrice) || 0 });
  }
  if (plotterCutting.type !== "Не потрібно" && pricesThis?.totalWidePlotterCuttingPrice) {
    pricingSimpleLines.push({ label: "Плоттерна порізка", value: parseFloat(pricesThis.totalWidePlotterCuttingPrice) || 0 });
  }
  if (montajnaPlivka.type !== "Не потрібно" && pricesThis?.totalWideMontajnaPlivkaPrice) {
    pricingSimpleLines.push({ label: "Монтажна плівка", value: parseFloat(pricesThis.totalWideMontajnaPlivkaPrice) || 0 });
  }
  if (luversi.type !== "Не потрібно" && pricesThis?.totalOneItemWideLuversiPrice) {
    pricingSimpleLines.push({ label: "Люверси", value: parseFloat(pricesThis.totalOneItemWideLuversiPrice) || 0 });
  }


  // ========== RENDER ==========

  const totalPrice = pricesThis?.price || 0;

  /* Рядок під заголовком — коротка специфікація наряду */
  const headSpec = [
    `${size.x}×${size.y} мм`,
    selectedDruk,
    material.material || null,
    lamination.type !== "Не потрібно" ? "ламінація" : null,
    plotterCutting.type !== "Не потрібно" ? "плоттерна порізка" : null,
    luversi.type !== "Не потрібно" ? "люверси" : null,
  ].filter(Boolean).join(" · ");

  /* Постобробка залежить від категорії матеріалу й типу друку — сюди
     потрапляє лише те, що доступне для поточного вибору */
  const postpress = [];
  if (selectWideFactory === "Баннер FactoryWide") {
    postpress.push({
      key: "luversi",
      name: "Люверси",
      isOn: luversi.type !== "Не потрібно",
      toggle: () => setLuversi({ ...luversi, type: luversi.type === "Не потрібно" ? "" : "Не потрібно" }),
      content: (
        <Luvarsi
          luversi={luversi}
          setLuversi={setLuversi}
          selectArr={[100, 200, 300, 400, 500]}
          type={"Luversi"}
          buttonsArr={['По кутам (на "павук")', "По периметру"]}
        />
      ),
    });
  }

  if (selectWideFactory === "Плівка FactoryWide" || (selectWideFactory === "Папір FactoryWide" && selectedDruk === "Екосольвентний друк")) {
    if (selectedDruk === "Екосольвентний друк") {
      postpress.push({
        key: "lamination",
        name: "Ламінація",
        isOn: lamination.type !== "Не потрібно",
        toggle: () => setLamination({ ...lamination, type: lamination.type === "Не потрібно" ? "" : "Не потрібно" }),
        content: (
          <LaminationWideFactory
            lamination={lamination}
            setLamination={setLamination}
            selectArr={[100, 200, 300, 400, 500]}
            type={"LaminationWideFactory"}
            buttonsArr={selectWideFactory === "Плівка FactoryWide"
              ? ["з глянцевим ламінуванням", "з матовим ламінуванням"]
              : ["Глянцева", "Матова"]}
          />
        ),
      });
    }
  }

  if (selectWideFactory === "Плівка FactoryWide" || selectWideFactory === "ПВХ FactoryWide") {
    postpress.push({
      key: "plotter",
      name: "Плоттерна порізка",
      isOn: plotterCutting.type !== "Не потрібно",
      toggle: () => setPlotterCutting({ ...plotterCutting, type: plotterCutting.type === "Не потрібно" ? "" : "Не потрібно" }),
      content: (
        <PlotterCutting
          plotterCutting={plotterCutting}
          setPlotterCutting={setPlotterCutting}
          plivkaOrPVH={selectWideFactory === "Плівка FactoryWide" ? "Плотер плівка FactoryWide" : "Плотер ПВХ FactoryWide"}
          selectArr={[100, 200, 300, 400, 500]}
          type={"PlotterCuttingWideFactory"}
          buttonsArr={["Простая", "Середня", "Складна"]}
        />
      ),
    });
  }

  if (selectWideFactory === "Плівка FactoryWide") {
    postpress.push({
      key: "montajna",
      name: "Монтажна плівка",
      isOn: montajnaPlivka.type !== "Не потрібно",
      toggle: () => setMontajnaPlivka({ ...montajnaPlivka, type: montajnaPlivka.type === "Не потрібно" ? "" : "Не потрібно" }),
      content: (
        <MontajnaPlivkaWideFactory
          montajnaPlivka={montajnaPlivka}
          plotterCutting={plotterCutting}
          setMontajnaPlivka={setMontajnaPlivka}
          selectArr={[100, 200, 300, 400, 500]}
          type={"MontajnaPlivkaWideFactory"}
          buttonsArr={[]}
        />
      ),
    });
  }

  if (!showWideFactory) return null;

  return (
    <>
      <div className="v2-overlay" onClick={handleClose} />
      <div className={`v2-modal v2-theme-${theme}`} onClick={(e) => e.stopPropagation()}>

        {/* ШАПКА */}
        <div className="v2-head">
          <div className="v2-head-main">
            <span className="v2-head-title">
              Широкоформат{selectedService ? ` · ${selectedService}` : ""}
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

            {/* ТИП ДРУКУ */}
            <div className="v2-section">
              <span className="v2-label">Друк</span>
              <div className="v2-sides" style={{ gridTemplateColumns: `repeat(${DRUK_OPTIONS.length}, 1fr)` }}>
                {DRUK_OPTIONS.map((druk) => (
                  <button
                    key={druk}
                    className={`v2-side${selectedDruk === druk ? " active" : ""}`}
                    onClick={() => setSelectedDruk(druk)}
                  >
                    {druk}
                  </button>
                ))}
              </div>
            </div>

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

            {/* ПОВЗУНКИ РОЗМІРУ — широкоформат правлять «на око», тож
                повзунок лишається поруч із точними полями */}
            <div className="v2-section">
              <span className="v2-label">Підбір розміру</span>
              <SliderComponent size={size} setSize={setSize} type="WideFactory" />
            </div>

            {/* МАТЕРІАЛ: спершу категорія, потім конкретний матеріал */}
            <div className="v2-section">
              <span className="v2-label">Матеріал</span>
              <div className="v2-thick-btns" style={{ gridTemplateColumns: `repeat(${CATEGORIES.length}, 1fr)` }}>
                {CATEGORIES.map((val) => (
                  <button
                    key={val}
                    className={`v2-thick-btn${selectWideFactory === val ? " active" : ""}`}
                    onClick={() => handleClickWideFactory(val)}
                  >
                    {val.split(" ")[0]}
                  </button>
                ))}
              </div>
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

            {/* ПОСТОБРОБКА */}
            {postpress.length > 0 && (
              <div className="v2-section">
                <span className="v2-label">Постобробка</span>
                <div className="v2-postpress">
                  {postpress.map((op) => (
                    <div className="v2-toggle" key={op.key}>
                      <div className="v2-toggle-left">
                        <V2ToggleSwitch isOn={op.isOn} onToggle={op.toggle} />
                        {op.isOn ? (
                          <div className="v2-toggle-content">{op.content}</div>
                        ) : (
                          <span className="v2-toggle-name">{op.name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ПРАВОРУЧ — НАРЯД */}
          <div className="v2-right">
            <div className="v2-run">
              <span className="v2-run-label">Наклад, шт</span>
              <div className="v2-count-row">
                <button className="v2-count-btn" onClick={() => handleChangeCount(Math.max(1, count - 1))}>−</button>
                <input
                  className="v2-count-val"
                  type="number"
                  value={count}
                  min={1}
                  onChange={(e) => handleChangeCount(e.target.value)}
                />
                <button className="v2-count-btn" onClick={() => handleChangeCount(count + 1)}>+</button>
              </div>
            </div>

            {/* розкладки немає: широкоформат друкується з рулону, площею,
                а не аркушами — замість неї показуємо метраж */}
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
                {fmt2(totalPrice)} <span className="v2-total-unit">грн</span>
              </div>
              <div className="v2-total-sub">
                <span>За виріб</span>
                <span>{fmt2(pricesThis?.priceForItemWithExtras || 0)} грн</span>
              </div>
              <div className="v2-total-sub">
                <span>Площа виробу</span>
                <span>{fmt2(totalM2)} м²</span>
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
          extraToggles={[]}
          thicknessOptions={[]}
          hideSidesOption
          materialType={selectWideFactory}
          materialCategories={[
            { label: "Плівка", value: "Плівка FactoryWide" },
            { label: "Баннер", value: "Баннер FactoryWide" },
            { label: "Папір", value: "Папір FactoryWide" },
            { label: "ПВХ", value: "ПВХ FactoryWide" },
          ]}
        />
      </div>
    </>
  );
};

export default WideFactory;
