
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "../../api/axiosInstance";
import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import NewNoModalCornerRounding from "./newnomodals/NewNoModalBig";
import NewNoModalCute from "./newnomodals/NewNoModalCute";
import NewNoModalHoles from "./newnomodals/NewNoModalHoles";
import Materials2 from "./newnomodals/Materials2";
import { useNavigate } from "react-router-dom";
import NewNoModalLyuversy from "./newnomodals/NewNoModalLyuversy";
import NewNoModalPorizka from "./newnomodals/NewNoModalPorizka";
import NewNoModalProkleyka from "./newnomodals/NewNoModalProkleyka";
import useServiceTabs from "../../hooks/useServiceTabs";
import ServiceSettingsModal from "./shared/ServiceSettingsModal";
import ImpositionPreview from "./shared/ImpositionPreview";
import { getStoredAppTheme, onAppThemeChange } from "../../utils/appTheme";

import "./NewSheetCutV2.css";

const emptyPrice = { pricePerUnit: 0, count: 0, totalPrice: 0 };
const normalize = (obj = {}) => ({
  pricePerUnit: Number(obj.pricePerUnit) || 0,
  count: Number(obj.count) || 0,
  totalPrice: Number(obj.totalPrice) || 0,
});

const DEFAULTS = {
  count: 1,
  size: { x: 310, y: 440 },
  material: {
    type: "Папір",
    thickness: "Цупкий",
    material: "",
    materialId: "0",
    typeUse: "Цупкий",
  },
  color: {
    sides: "односторонній",
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
  pereplet: {
    type: "",
    thickness: "Тонкі",
    material: "",
    materialId: "",
    size: "<120",
    typeUse: "Брошурування до 120 аркушів",
  },
  big: "Не потрібно",
  cute: "Не потрібно",
  porizka: { type: "Не потрібно" },
  cuteLocal: {
    leftTop: true,
    rightTop: true,
    rightBottom: true,
    leftBottom: true,
    radius: "6",
  },
  holes: "Не потрібно",
  holesR: "",
  prokleyka: "Не потрібно",
  lyuversy: "Не потрібно",
  design: "Не потрібно",
};

function safeNum(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function parseOptionsJson(editingOrderUnit) {
  if (!editingOrderUnit?.optionsJson) return null;
  try {
    return JSON.parse(editingOrderUnit.optionsJson);
  } catch (e) {
    console.error("Bad optionsJson", e);
    return null;
  }
}

const ToggleSwitch = ({ isOn, onToggle }) => (
  <button
    type="button"
    className={`v2-sw ${isOn ? "on" : "off"}`}
    onClick={onToggle}
    /* без цього клік мишею лишає кільце фокуса (як у «Порізка», що
       клікнули останньою) — preventDefault на mousedown прибирає фокус
       від миші, не займаючи Tab/Enter для клавіатури */
    onMouseDown={(e) => e.preventDefault()}
  />
);

const NewSheetCutV2 = ({
  thisOrder,
  newThisOrder,
  setNewThisOrder,
  selectedThings2,
  setShowNewSheetCutV2,
  setThisOrder,
  setSelectedThings2,
  showNewSheetCutV2,
  editingOrderUnit,
}) => {
  const fmt2 = (v) =>
    new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(v));

  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleClose = () => setShowNewSheetCutV2(false);

  const [size, setSize] = useState({ x: 310, y: 440 });
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [color, setColor] = useState(DEFAULTS.color);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);
  const [pereplet, setPereplet] = useState(DEFAULTS.pereplet);
  const [big, setBig] = useState("Не потрібно");
  const [cute, setCute] = useState("Не потрібно");
  const [porizka, setPorizka] = useState({ type: "Не потрібно" });
  const [cuteLocal, setCuteLocal] = useState(DEFAULTS.cuteLocal);
  const [holes, setHoles] = useState("Не потрібно");
  const [prokleyka, setProkleyka] = useState("Не потрібно");
  const [lyuversy, setLyuversy] = useState("Не потрібно");
  const [design, setDesign] = useState("Не потрібно");
  const [holesR, setHolesR] = useState("");
  const [count, setCount] = useState(1);
  const [prices, setPrices] = useState([]);

  const [pricesThis, setPricesThis] = useState({
    big: emptyPrice,
    prokleyka: emptyPrice,
    lyuversy: emptyPrice,
    cute: emptyPrice,
    holes: emptyPrice,
    design: { pricePerUnit: 0, totalPrice: 0 },
  });

  const [selectedService, setSelectedService] = useState("Зображення");
  const [showSettings, setShowSettings] = useState(false);

  // тема V2 більше не вибирається окремо — вона стежить за глобальною
  // темою застосунку (перемикач у Nav) через appTheme.js
  const [theme, setTheme] = useState(getStoredAppTheme);

  useEffect(() => onAppThemeChange(setTheme), []);
  const { services, addService, removeService, updateService, reorderServices, loading: servicesLoading } = useServiceTabs("SheetCut", [
    "Зображення", "Листівка", "Візитка", "Флаєр", "Буклет",
    "Брошура", "Картка", "Диплом", "Сертифікат", "Подяка",
    "Зін", "Презентація", "Бланк", "Афіша", "Календар",
    "Плакат", "Візуалізація", "Меню", "Документ", "Бейджі", "Холдер",
  ]);

  const DEFAULT_SIZES = [
    { label: "А6", x: 105, y: 148 }, { label: "A5", x: 148, y: 210 },
    { label: "A4", x: 210, y: 297 }, { label: "А3", x: 297, y: 420 },
    { label: "SR A3", x: 310, y: 440 }, { label: "90×50", x: 90, y: 50 },
    { label: "85×55", x: 85, y: 55 }, { label: "100×150", x: 100, y: 150 },
    { label: "200×100", x: 200, y: 100 }, { label: "50×50", x: 50, y: 50 },
    { label: "100×100", x: 100, y: 100 },
  ];

  const sizeButtons = useMemo(() => {
    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
    const sizes = svc?.presets?.sizes;
    if (Array.isArray(sizes) && sizes.length > 0) return sizes;
    return DEFAULT_SIZES;
  }, [services, selectedService]);

  const [hideLamination, setHideLamination] = useState(false);
  const [hideZgyn, setHideZgyn] = useState(false);
  const [hideSkrugl, setHideSkrugl] = useState(false);
  const [hideSverdl, setHideSverdl] = useState(false);
  const [hideProkl, setHideProkl] = useState(false);
  const [hideLyuv, setHideLyuv] = useState(false);
  const [hidePorizka, setHidePorizka] = useState(false);

  useEffect(() => {
    if (servicesLoading) return;
    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
    const p = svc?.presets;
    setHideLamination(p?.lamination === false);
    setHideZgyn(p?.hideZgyn === false);
    setHideSkrugl(p?.hideSkrugl === false);
    setHideSverdl(p?.hideSverdl === false);
    setHideProkl(p?.hideProkl === false);
    setHideLyuv(p?.hideLyuv === false);
    setHidePorizka(p?.hidePorizka === false);
  }, [services, selectedService, servicesLoading]);

  const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.idKey);

  // Один раз, коли таби завантажились — відкрити товар, позначений "за замовчуванням"
  const didAutoSelectDefault = useRef(false);
  useEffect(() => {
    if (servicesLoading || isEdit || didAutoSelectDefault.current) return;
    didAutoSelectDefault.current = true;
    const def = services.find((s) => typeof s === 'object' && s?.isDefault);
    if (def) setSelectedService(def.name);
  }, [services, servicesLoading, isEdit]);

  const handleServiceSelect = useCallback((name) => {
    setSelectedService(name);
    if (isEdit) return;
    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === name);
    const p = svc?.presets;
    if (!p) return;
    if (p.sizeX || p.sizeY) {
      setSize((prev) => ({
        x: p.sizeX ? Number(p.sizeX) : prev.x,
        y: p.sizeY ? Number(p.sizeY) : prev.y,
      }));
    }
    if (p.sides) setColor((prev) => ({ ...prev, sides: p.sides }));
    if (p.thickness) {
      const isSelf = p.thickness === "Самоклеючі";
      setMaterial((prev) => ({
        ...prev, type: isSelf ? "Плівка" : "Папір",
        thickness: p.thickness, typeUse: p.thickness,
        material: "", materialId: 0, a: "", x: null, y: null,
      }));
    }
    if (p.lamination !== undefined) {
      if (p.lamination) {
        const lamType = p.laminationType || "з глянцевим ламінуванням";
        const isOn = p.laminationDefault !== false;
        if (isOn) {
          setLamination({ type: lamType, material: lamType, materialId: "", size: p.laminationThickness ? String(p.laminationThickness) : "", typeUse: "А3" });
        } else {
          setLamination(DEFAULTS.lamination);
        }
      } else {
        setLamination(DEFAULTS.lamination);
      }
    }
    if (p.ZgynDefault) setBig(p.ZgynCount || "1");
    if (p.SkruglDefault) {
      const corners = p.SkruglCorners || { leftTop: true, rightTop: true, rightBottom: true, leftBottom: true };
      const cornerCount = ['leftTop','rightTop','rightBottom','leftBottom'].filter((k) => corners[k]).length;
      setCute(cornerCount || 4);
      setCuteLocal({
        leftTop: corners.leftTop ?? true, rightTop: corners.rightTop ?? true,
        rightBottom: corners.rightBottom ?? true, leftBottom: corners.leftBottom ?? true,
        radius: p.SkruglRadius || "6",
      });
    }
    if (p.SverdlDefault) { setHoles(Number(p.SverdlCount) || 1); setHolesR(p.SverdlSize || "5 мм"); }
    if (p.ProklDefault) setProkleyka(p.ProklCount || "1");
    if (p.LyuvDefault) setLyuversy(p.LyuvCount || "1");
    if (p.PorizkaDefault) setPorizka((prev) => ({ ...prev, type: "Потрібно" }));
  }, [services, isEdit]);

  const options = parseOptionsJson(editingOrderUnit);
  const skipInitialPricing = useRef(false);

  useEffect(() => {
    if (!showNewSheetCutV2) return;
    if (error) setError(null);
    if (isEdit) skipInitialPricing.current = true;
    if (!isEdit) {
      setCount(DEFAULTS.count); setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material); setColor(DEFAULTS.color);
      setLamination(DEFAULTS.lamination); setPereplet(DEFAULTS.pereplet);
      setBig(DEFAULTS.big); setCute(DEFAULTS.cute);
      setPorizka(DEFAULTS.porizka); setCuteLocal(DEFAULTS.cuteLocal);
      setHoles(DEFAULTS.holes); setHolesR(DEFAULTS.holesR);
      setProkleyka(DEFAULTS.prokleyka); setLyuversy(DEFAULTS.lyuversy);
      setDesign(DEFAULTS.design);
      return;
    }
    const opt = options || {};
    setCount(safeNum(opt?.count, safeNum(editingOrderUnit?.amount, DEFAULTS.count)));
    setSize({
      x: safeNum(opt?.size?.x, safeNum(editingOrderUnit?.newField2, DEFAULTS.size.x)),
      y: safeNum(opt?.size?.y, safeNum(editingOrderUnit?.newField3, DEFAULTS.size.y)),
    });
    setMaterial(opt?.material ?? DEFAULTS.material);
    setColor(opt?.color ?? DEFAULTS.color);
    setLamination(opt?.lamination ?? DEFAULTS.lamination);
    setPereplet(opt?.pereplet ?? DEFAULTS.pereplet);
    setBig(opt?.big ?? DEFAULTS.big);
    setCute(opt?.cute ?? DEFAULTS.cute);
    setPorizka(opt?.porizka ?? DEFAULTS.porizka);
    setCuteLocal(opt?.cuteLocal ?? DEFAULTS.cuteLocal);
    setHoles(opt?.holes ?? DEFAULTS.holes);
    setHolesR(opt?.holesR ?? DEFAULTS.holesR);
    setProkleyka(opt?.prokleyka ?? DEFAULTS.prokleyka);
    setLyuversy(opt?.lyuversy ?? DEFAULTS.lyuversy);
    setDesign(opt?.design ?? DEFAULTS.design);
  }, [showNewSheetCutV2, isEdit, editingOrderUnit?.id, editingOrderUnit?.idKey, editingOrderUnit?.optionsJson]);

  /* ===================== SAVE ===================== */

  const addNewOrderUnit = () => {
    const customOrderName = getSvcForPreset()?.orderName;
    const orderUnitName = customOrderName || selectedService;
    let dataToSend = {
      orderId: thisOrder.id,
      toCalc: {
        nameOrderUnit: `${orderUnitName.toLowerCase() ? orderUnitName.toLowerCase() + " " : ""}`,
        type: "SheetCut",
        size, material, color, lamination,
        big, cute, cuteLocal, prokleyka, lyuversy, design,
        holes, holesR, count, porizka,
      },
    };
    axios
      .post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then((response) => {
        setThisOrder(response.data);
        setSelectedThings2(response.data.OrderUnits);
        setShowNewSheetCutV2(false);
      })
      .catch((error) => {
        setError(error);
        if (error.response?.status === 403) navigate("/login");
      });
  };

  /* ===================== PRICING ===================== */

  useEffect(() => {
    setPricesThis((prev) => ({
      ...prev,
      design: {
        pricePerUnit: design === "Не потрібно" ? 0 : Number(design) || 0,
        totalPrice: design === "Не потрібно" ? 0 : Number(design) || 0,
      },
    }));
  }, [design]);

  useEffect(() => {
    if (lamination.type === "Не потрібно") return;
    const laminTypeUse = Math.max(size.x, size.y) <= 297 ? "А4" : "А3";
    if (lamination.typeUse !== laminTypeUse) {
      setLamination(prev => ({ ...prev, typeUse: laminTypeUse }));
    }
  }, [size.x, size.y]); // eslint-disable-line

  useEffect(() => {
    if (skipInitialPricing.current) {
      skipInitialPricing.current = false;
      if (editingOrderUnit) {
        const storedPrice = parseFloat(editingOrderUnit.priceForAllThis) || 0;
        const storedPerUnit = parseFloat(editingOrderUnit.priceForOneThis) || 0;
        const sc = Number(editingOrderUnit.newField5) || 1;
        setPricesThis((prev) => ({
          ...prev, price: storedPrice, sheetCount: sc,
          priceDrukPerSheet: storedPerUnit > 0 ? storedPerUnit : (storedPrice / sc),
          pricePaperPerSheet: 0, priceLaminationPerSheet: 0, porizka: 0,
        }));
      }
      return;
    }
    let dataToSend = {
      type: "SheetCut",
      size, material, color, lamination,
      big, cute, prokleyka, lyuversy, design,
      cuteLocal, holes, holesR, count, porizka,
    };
    axios
      .post("/calc/pricing", dataToSend)
      .then(({ data }) => {
        const p = data?.prices ?? {};
        setPricesThis((prev) => ({
          ...prev, ...p,
          big: normalize(p.big), prokleyka: normalize(p.prokleyka),
          lyuversy: normalize(p.lyuversy), cute: normalize(p.cute),
          holes: normalize(p.holes), design: prev.design,
        }));
      })
      .catch((err) => {
        if (err.response?.status === 403) navigate("/login");
      });
  }, [size, material, color, lamination.materialId, big, cute, cuteLocal, holes, holesR, count, porizka, lyuversy, prokleyka, design, navigate]);

  useEffect(() => {
    if (error) setError(null);
  }, [material]); // eslint-disable-line

  /* ===================== PRICING DATA ===================== */

  const sc = pricesThis.sheetCount || 0;

  const pricingLines = [
    { label: "Друк", qty: sc, unit: "арк", unitPrice: pricesThis.priceDrukPerSheet || 0, total: (pricesThis.priceDrukPerSheet || 0) * sc },
    { label: "Матеріали", qty: sc, unit: "арк", unitPrice: pricesThis.pricePaperPerSheet || 0, total: (pricesThis.pricePaperPerSheet || 0) * sc },
    { label: "Ламінація", qty: sc, unit: "арк", unitPrice: pricesThis.priceLaminationPerSheet || 0, total: (pricesThis.priceLaminationPerSheet || 0) * sc },
    { label: "Згинання", qty: pricesThis.big?.count || 0, unit: "шт", unitPrice: pricesThis.big?.pricePerUnit || 0, total: pricesThis.big?.totalPrice || 0 },
    { label: "Скруглення", qty: pricesThis.cute?.count || 0, unit: "шт", unitPrice: pricesThis.cute?.pricePerUnit || 0, total: pricesThis.cute?.totalPrice || 0 },
    { label: "Отвори", qty: pricesThis.holes?.count || 0, unit: "шт", unitPrice: pricesThis.holes?.pricePerUnit || 0, total: pricesThis.holes?.totalPrice || 0 },
    { label: "Проклейка", qty: pricesThis.prokleyka?.count || 0, unit: "шт", unitPrice: pricesThis.prokleyka?.pricePerUnit || 0, total: pricesThis.prokleyka?.totalPrice || 0 },
    { label: "Люверси", qty: pricesThis.lyuversy?.count || 0, unit: "шт", unitPrice: pricesThis.lyuversy?.pricePerUnit || 0, total: pricesThis.lyuversy?.totalPrice || 0 },
  ];

  if (pricesThis.porizka !== 0) {
    pricingLines.push({ label: "Порізка", total: pricesThis.porizka || 0 });
  }

  const totalPrice = pricesThis.price || 0;

  const sidesOptions = [
    { value: "односторонній", label: "Односторонній" },
    { value: "двосторонній", label: "Двосторонній" },
    { value: "Не потрібно", label: "Без друку" },
  ];

  const thicknessOptions = ["Офісний", "Тонкий", "Середній", "Цупкий", "Самоклеючі"];

  /* назви мусять точно збігатись із полем name матеріалів
     type: "Постпресс", typeUse: "Порізка" — за ним бекенд бере відсоток */
  const PORIZKA_SUBTYPES = ["ручна легка", "на гільйотині", "ручна середня"];

  const getSvcForPreset = () => services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);

  /* Матеріал за замовчуванням для категорії щільності. Під однією назвою на
     складі лежать різні грамажі, і без явної щільності береться перший за id
     (для «Середній» це 150 г/м²). Пресет товару має пріоритет над цим. */
  const DEFAULT_MATERIAL_BY_THICKNESS = {
    "Середній": { name: "Крейдований папір", thickness: "170" },
  };

  const thicknessDefault = DEFAULT_MATERIAL_BY_THICKNESS[material.thickness];
  const presetMaterialName = getSvcForPreset()?.presets?.materialName;
  const preferredMaterialName = presetMaterialName || thicknessDefault?.name;
  // грамаж застосовуємо, коли пресет не називає інший матеріал
  const preferredMaterialThickness =
    thicknessDefault && (!presetMaterialName || presetMaterialName === thicknessDefault.name)
      ? thicknessDefault.thickness
      : undefined;

  /* короткі назви операцій постобробки для рядка специфікації у шапці */
  const LAMINATION_SHORT = {
    "з глянцевим ламінуванням": "глянцеве",
    "з матовим ламінуванням": "матове",
    "з ламінуванням SoftTouch": "SoftTouch",
    "з холодним матовим ламінуванням": "холодне",
  };

  const finishing = [];
  if (lamination.type !== "Не потрібно") {
    const kind = LAMINATION_SHORT[lamination.type] || lamination.type;
    finishing.push(`Ламінування ${kind}${lamination.size ? ` ${lamination.size} мкм` : ""}`);
  }
  if (big !== "Не потрібно") finishing.push(`Згин ×${big}`);
  if (cute !== "Не потрібно") {
    finishing.push(`Скруглення${cuteLocal.radius ? ` R${cuteLocal.radius}` : ""}`);
  }
  if (holes !== "Не потрібно") {
    finishing.push(`Отвори ×${holes}${holesR ? ` ${holesR}` : ""}`);
  }
  if (prokleyka !== "Не потрібно") finishing.push(`Проклейка ×${prokleyka}`);
  if (lyuversy !== "Не потрібно") finishing.push(`Люверси ×${lyuversy}`);
  if (porizka.type !== "Не потрібно") {
    finishing.push(`Порізка${porizka.subtype ? ` ${porizka.subtype}` : ""}`);
  }

  /* ===================== RENDER ===================== */

  if (!showNewSheetCutV2) return null;

  return (
    <>
      <div className="v2-overlay" onClick={handleClose} />
      <div className={`v2-modal v2-theme-${theme}`} onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="v2-head">
          <div className="v2-head-main">
            <span className="v2-head-title">
              Цифровий друк{selectedService ? ` · ${selectedService}` : ""}
            </span>
            <div className="v2-head-spec">
              {size.x}×{size.y} мм ·{" "}
              {material.thickness || "—"} ·{" "}
              {sidesOptions.find((o) => o.value === color.sides)?.label || "—"}
              {material.material ? ` · ${material.material}` : ""}
              {finishing.map((f) => (
                <span className="v2-head-finish" key={f}>
                  {" · "}
                  {f}
                </span>
              ))}
            </div>
          </div>
          <button className="v2-close-btn" onClick={handleClose} title="Закрити" aria-label="Закрити">
            &times;
          </button>
          {/* ТИМЧАСОВО: діагностика різниці 27" vs 32" — прибрати після діагностики */}
          <span style={{ position: "fixed", top: 2, left: 2, zIndex: 99999, background: "#ff00ff", color: "#fff", fontSize: 12, padding: "2px 6px", whiteSpace: "pre" }}>
            {`inner:${window.innerWidth}x${window.innerHeight} dpr:${window.devicePixelRatio} screen:${window.screen.width}x${window.screen.height}`}
          </span>
        </div>

        {/* BODY */}
        <div className="v2-body">

          {/* СТРІЧКА ВИРОБІВ — колонка, вирівняна по висоті з правою
              панеллю наряду через align-items:stretch на .v2-body */}
          <div className="v2-tabsrail">
            {services.map((service, idx) => {
              const name = typeof service === 'string' ? service : service?.name;
              const color = typeof service === 'string' ? null : service?.color;
              const prevService = services[idx - 1];
              const prevColor = prevService ? (typeof prevService === 'string' ? null : prevService?.color) : null;
              const isNewGroup = idx > 0 && color !== prevColor;
              return (
                <button
                  key={name}
                  className={`v2-tab${selectedService === name ? " active" : ""}${isNewGroup ? " v2-tab-group-start" : ""}`}
                  style={color ? { "--tab-color": color } : undefined}
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

            {/* SIZES */}
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

            {/* SIDES */}
            <div className="v2-section">
              <span className="v2-label">Друк</span>
              <div className="v2-sides" style={{ gridTemplateColumns: `repeat(${sidesOptions.length}, 1fr)` }}>
                {sidesOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={`v2-side${color.sides === opt.value ? " active" : ""}`}
                    onClick={() => setColor({ ...color, sides: opt.value })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* THICKNESS */}
            <div className="v2-section">
              <span className="v2-label">Папір</span>
              <div className="v2-thick-btns" style={{ gridTemplateColumns: `repeat(${thicknessOptions.length}, 1fr)` }}>
                {thicknessOptions.map((t) => (
                  <button
                    key={t}
                    className={`v2-thick-btn${material.thickness === t ? " active" : ""}`}
                    onClick={() => {
                      const isSelf = t === "Самоклеючі";
                      setMaterial((prev) => ({
                        ...prev,
                        type: isSelf ? "Плівка" : "Папір",
                        thickness: t,
                        typeUse: t,
                        material: "",
                        materialId: 0,
                        a: "",
                        x: null,
                        y: null,
                      }));
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* MATERIAL */}
            <div className="v2-section">
              <span className="v2-label">Матеріал</span>
              <div className="v2-material-wrap">
              <Materials2
                material={material}
                setMaterial={setMaterial}
                setError={null}
                count={count}
                setCount={setCount}
                prices={prices}
                size={size}
                selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                name={"Кольоровий друк:"}
                buttonsArr={[]}
                typeUse={null}
                typeOfPosluga={"NewSheetCut"}
                autoSelectFirst={false}
                dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                sortOverride={{ column: "article", reverse: false }}
                preferredMaterialName={preferredMaterialName || undefined}
                preferredMaterialThickness={preferredMaterialThickness}
              />
              </div>
            </div>

            {/* POST-PROCESSING TOGGLES */}
            <div className="v2-section">
              <span className="v2-label">Постобробка</span>
              <div className="v2-postpress">

              {/* Ламінування */}
              {!hideLamination && (
                <div className="v2-toggle">
                  <div className="v2-toggle-left">
                    <ToggleSwitch
                      isOn={lamination.type !== "Не потрібно"}
                      onToggle={() => {
                        const laminTypeUse = (material.typeUse === "Офісний" && Math.max(size.x, size.y) <= 297) ? "А4" : "А3";
                        if (lamination.type === "Не потрібно") {
                          const svc = getSvcForPreset();
                          const presetLamType = svc?.presets?.laminationType || "з глянцевим ламінуванням";
                          const presetLamThick = svc?.presets?.laminationThickness ? String(svc.presets.laminationThickness) : "";
                          setLamination({ ...lamination, type: presetLamType, material: presetLamType, materialId: "", size: presetLamThick, typeUse: laminTypeUse });
                        } else {
                          setLamination({ type: "Не потрібно", material: "", materialId: "", size: "", typeUse: laminTypeUse });
                        }
                      }}
                    />
                    {lamination.type === "Не потрібно" ? (
                      <span className="v2-toggle-name">Ламінування</span>
                    ) : (
                      <div className="v2-toggle-content">
                        <NewNoModalLamination
                          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                          label="Ламінування:"
                          lamination={lamination}
                          setLamination={setLamination}
                          prices={prices}
                          size={size}
                          type={"SheetCut"}
                          paperTypeUse={material.typeUse}
                          presetLamType={getSvcForPreset()?.presets?.laminationType}
                          presetLamThickness={getSvcForPreset()?.presets?.laminationThickness}
                          buttonsArr={[
                            "з глянцевим ламінуванням", "з матовим ламінуванням",
                            "з ламінуванням SoftTouch", "з холодним матовим ламінуванням",
                          ]}
                          selectArr={["30", "70", "80", "100", "125", "250"]}
                          labelMap={{
                            "з глянцевим ламінуванням": "глянцеве",
                            "з матовим ламінуванням": "матове",
                            "з ламінуванням SoftTouch": "SoftTouch",
                            "з холодним матовим ламінуванням": "холодне",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Згинання */}
              {!hideZgyn && (
                <div className="v2-toggle">
                  <div className="v2-toggle-left">
                    <ToggleSwitch
                      isOn={big !== "Не потрібно"}
                      onToggle={() => big === "Не потрібно" ? setBig("1") : setBig("Не потрібно")}
                    />
                    {big === "Не потрібно" ? (
                      <span className="v2-toggle-name">Згинання</span>
                    ) : (
                      <div className="v2-toggle-content">
                        <NewNoModalCornerRounding
                          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                          big={big} setBig={setBig}
                          prices={prices} type={"SheetCut"}
                          buttonsArr={[]}
                          selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Скруглення */}
              {!hideSkrugl && (
                <div className="v2-toggle" style={{ position: "relative", zIndex: 40 }}>
                  <div className="v2-toggle-left">
                    <ToggleSwitch
                      isOn={cute !== "Не потрібно"}
                      onToggle={() => {
                        if (cute === "Не потрібно") {
                          setCute(4);
                          setCuteLocal({ leftTop: true, rightTop: true, rightBottom: true, leftBottom: true, radius: "6" });
                        } else {
                          setCute("Не потрібно");
                          setCuteLocal({ leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" });
                        }
                      }}
                    />
                    {cute === "Не потрібно" ? (
                      <span className="v2-toggle-name">Скруглення кутів</span>
                    ) : (
                      <div className="v2-toggle-content">
                        <NewNoModalCute
                          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                          cute={cute} setCute={setCute}
                          cuteLocal={cuteLocal} setCuteLocal={setCuteLocal}
                          prices={prices} type={"SheetCut"}
                          buttonsArr={[]} selectArr={["3", "6", "8", "10", "13"]}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Свердління */}
              {!hideSverdl && (
                <div className="v2-toggle" style={{ position: "relative", zIndex: 30 }}>
                  <div className="v2-toggle-left">
                    <ToggleSwitch
                      isOn={holes !== "Не потрібно"}
                      onToggle={() => {
                        if (holes === "Не потрібно") { setHoles(1); setHolesR("5 мм"); }
                        else { setHoles("Не потрібно"); setHolesR(""); }
                      }}
                    />
                    {holes === "Не потрібно" ? (
                      <span className="v2-toggle-name">Свердління отворів</span>
                    ) : (
                      <div className="v2-toggle-content">
                        <NewNoModalHoles
                          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                          holes={holes} setHoles={setHoles}
                          holesR={holesR} setHolesR={setHolesR}
                          prices={prices} type={"SheetCut"}
                          buttonsArr={[]}
                          selectArr={["", "3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Проклейка */}
              {!hideProkl && (
                <div className="v2-toggle" style={{ position: "relative", zIndex: 20 }}>
                  <div className="v2-toggle-left">
                    <ToggleSwitch
                      isOn={prokleyka !== "Не потрібно"}
                      onToggle={() => prokleyka === "Не потрібно" ? setProkleyka("1") : setProkleyka("Не потрібно")}
                    />
                    {prokleyka === "Не потрібно" ? (
                      <span className="v2-toggle-name">Проклейка</span>
                    ) : (
                      <div className="v2-toggle-content">
                        <NewNoModalProkleyka
                          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                          prokleyka={prokleyka} setProkleyka={setProkleyka}
                          prices={prices} type={"SheetCut"}
                          buttonsArr={[]}
                          selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Люверси */}
              {!hideLyuv && (
                <div className="v2-toggle" style={{ position: "relative", zIndex: 10 }}>
                  <div className="v2-toggle-left">
                    <ToggleSwitch
                      isOn={lyuversy !== "Не потрібно"}
                      onToggle={() => lyuversy === "Не потрібно" ? setLyuversy("1") : setLyuversy("Не потрібно")}
                    />
                    {lyuversy === "Не потрібно" ? (
                      <span className="v2-toggle-name">Люверси</span>
                    ) : (
                      <div className="v2-toggle-content">
                        <NewNoModalLyuversy
                          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                          lyuversy={lyuversy} setLyuversy={setLyuversy}
                          type={"SheetCut"} buttonsArr={[]}
                          selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Порізка */}
              {!hidePorizka && (
                <div className="v2-toggle">
                  <div className="v2-toggle-left">
                    <ToggleSwitch
                      isOn={porizka.type !== "Не потрібно"}
                      onToggle={() => {
                        if (porizka.type === "Не потрібно") {
                          setPorizka({ ...porizka, type: "Потрібно", subtype: porizka.subtype || PORIZKA_SUBTYPES[0] });
                        } else {
                          setPorizka({ type: "Не потрібно" });
                        }
                      }}
                    />
                    {porizka.type === "Не потрібно" ? (
                      <span className="v2-toggle-name">Порізка</span>
                    ) : (
                      <div className="v2-toggle-content">
                        <NewNoModalPorizka
                          porizka={porizka}
                          setPorizka={setPorizka}
                          selectArr={PORIZKA_SUBTYPES}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>

          {/* RIGHT — НАРЯД: розкладка + калькуляція */}
          <div className="v2-right">
            {/* наклад стоїть першим: від нього залежить і розкладка, і сума */}
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

            <div className="v2-imposition">
              <div className="v2-prices-title">Розкладка</div>
              <ImpositionPreview
                sheetX={material.x || 320}
                sheetY={material.y || 450}
                itemX={size.x}
                itemY={size.y}
              />
            </div>

            <div className="v2-prices-title">Калькуляція</div>
            <div className="v2-prices">
              {pricingLines.map((line, i) => {
                /* бекенд інколи повертає порізку не рівно нулем (напр. 0.001),
                   а "0,00 грн" все одно показуємо — тож і приглушення рядка
                   звіряємо з тим самим округленням, що й сам напис, а не з
                   сирим числом */
                const isZero = Math.round((line.total || 0) * 100) === 0;
                const hasBreakdown = !isZero && line.qty > 0 && line.unitPrice > 0;
                return (
                  <div
                    className={`v2-price-row${isZero ? " is-zero" : ""}`}
                    key={i}
                  >
                    <span>{line.label}</span>
                    <i className="v2-lead" />
                    <span className="v2-price-val">
                      {hasBreakdown && (
                        <span className="v2-price-calc">
                          {line.qty} {line.unit} × {fmt2(line.unitPrice)} ={" "}
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
                {fmt2(totalPrice)} <span className="v2-total-unit">грн</span>
              </div>
              <div className="v2-total-sub">
                <span>За 1 виріб</span>
                <span>{count ? fmt2(totalPrice / count) : "0,00"} грн</span>
              </div>
              <div className="v2-total-sub">
                <span>Використано аркушів</span>
                <span>{sc} шт</span>
              </div>
            </div>
            <button
              className="v2-add-btn"
              onClick={addNewOrderUnit}
              disabled={!thisOrder?.id}
            >
              <span className="v2-add-btn-icon" aria-hidden="true">
                {isEdit ? "✓" : "+"}
              </span>
              <span className="v2-add-btn-label">
                {isEdit ? "Зберегти зміни" : "Додати в замовлення"}
              </span>
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="v2-error">
            {error.response?.data?.error || "Помилка"}
          </div>
        )}

        {/* SETTINGS MODAL */}
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
          thicknessOptions={thicknessOptions}
          extraToggles={[
            { key: "hideZgyn", label: "Згинання", defaultKey: "ZgynDefault", params: [
              { key: "ZgynCount", label: "Кількість", options: ["1","2","3","4","5","6","7","8","9"] }
            ]},
            { key: "hideSkrugl", label: "Скруглення", defaultKey: "SkruglDefault", params: [
              { key: "SkruglRadius", label: "Радіус", options: ["3","6","8","10","13"] },
              { key: "SkruglCorners", label: "Кути", type: "corners" }
            ]},
            { key: "hideSverdl", label: "Свердління", defaultKey: "SverdlDefault", params: [
              { key: "SverdlCount", label: "Кількість", options: ["1","2","3","4","5","6","7","8","9"] },
              { key: "SverdlSize", label: "Розмір", options: ["3,5 мм","4 мм","5 мм","6 мм","8 мм"] }
            ]},
            { key: "hideProkl", label: "Проклейка", defaultKey: "ProklDefault", params: [
              { key: "ProklCount", label: "Кількість", options: ["1","2","3","4","5","6","7","8","9"] }
            ]},
            { key: "hideLyuv", label: "Люверси", defaultKey: "LyuvDefault", params: [
              { key: "LyuvCount", label: "Кількість", options: ["1","2","3","4","5","6","7","8","9"] }
            ]},
            { key: "hidePorizka", label: "Порізка", defaultKey: "PorizkaDefault" },
          ]}
        />
      </div>
    </>
  );
};

export default NewSheetCutV2;
