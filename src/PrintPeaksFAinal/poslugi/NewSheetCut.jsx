
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "../../api/axiosInstance";
import NewNoModalSize from "./newnomodals/NewNoModalSizeColor";
import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import NewNoModalCornerRounding from "./newnomodals/NewNoModalBig";
import NewNoModalCute from "./newnomodals/NewNoModalCute";
import NewNoModalHoles from "./newnomodals/NewNoModalHoles";
import Materials2 from "./newnomodals/Materials2";
import { useNavigate } from "react-router-dom";
import NewNoModalLyuversy from "./newnomodals/NewNoModalLyuversy";
import Porizka from "./newnomodals/Porizka";
import NewNoModalProkleyka from "./newnomodals/NewNoModalProkleyka";

import ScModal from "./shared/ScModal";
import useServiceTabs from "../../hooks/useServiceTabs";
import ScCountSize from "./shared/ScCountSize";
import ScSides from "./shared/ScSides";
import ScSection from "./shared/ScSection";
import ScToggleSection from "./shared/ScToggleSection";
import ScPricing from "./shared/ScPricing";
import ScAddButton from "./shared/ScAddButton";
import ScTabs from "./shared/ScTabs";
import ServiceSettingsModal from "./shared/ServiceSettingsModal";

import "./Poslugy.css";
import "./shared/sc-base.css";

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

function calcItemsPerSheet(sheetX, sheetY, itemX, itemY) {
  const sx = Number(sheetX) || 0;
  const sy = Number(sheetY) || 0;
  const ix = Number(itemX) || 0;
  const iy = Number(itemY) || 0;
  if (!sx || !sy || !ix || !iy) return 0;
  const normal = Math.floor(sx / ix) * Math.floor(sy / iy);
  const rotated = Math.floor(sx / iy) * Math.floor(sy / ix);
  return Math.max(normal, rotated);
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

/* ===================== COMPONENT ===================== */

const NewSheetCut = ({
                       thisOrder,
                       newThisOrder,
                       setNewThisOrder,
                       selectedThings2,
                       setShowNewSheetCut,
                       setThisOrder,
                       setSelectedThings2,
                       showNewSheetCut,
                       editingOrderUnit,
                     }) => {
  const fmt2 = (v) =>
    new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(v));

  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const handleClose = () => {
    setShowNewSheetCut(false);
  };

  /* ====== STATE ====== */

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
  const [isEditServices, setIsEditServices] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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

  // Розміри з пресету поточної категорії (або дефолтні)
  const sizeButtons = useMemo(() => {
    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
    const sizes = svc?.presets?.sizes;
    if (Array.isArray(sizes) && sizes.length > 0) return sizes;
    return DEFAULT_SIZES;
  }, [services, selectedService]);

  // Hide/show секцій з пресету
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

  // Застосувати пресети при виборі категорії
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
    if (p.sides) {
      setColor((prev) => ({ ...prev, sides: p.sides }));
    }
    if (p.thickness) {
      const isSelf = p.thickness === "Самоклеючі";
      setMaterial((prev) => ({
        ...prev,
        type: isSelf ? "Плівка" : "Папір",
        thickness: p.thickness,
        typeUse: p.thickness,
        material: "",
        materialId: 0,
        a: "",
        x: null,
        y: null,
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
    // Постпринти: застосовуємо за замовчуванням якщо <key>Default = true
    if (p.ZgynDefault) {
      setBig(p.ZgynCount || "1");
    }
    if (p.SkruglDefault) {
      const corners = p.SkruglCorners || { leftTop: true, rightTop: true, rightBottom: true, leftBottom: true };
      const cornerCount = ['leftTop','rightTop','rightBottom','leftBottom'].filter((k) => corners[k]).length;
      setCute(cornerCount || 4);
      setCuteLocal({
        leftTop: corners.leftTop ?? true,
        rightTop: corners.rightTop ?? true,
        rightBottom: corners.rightBottom ?? true,
        leftBottom: corners.leftBottom ?? true,
        radius: p.SkruglRadius || "6",
      });
    }
    if (p.SverdlDefault) {
      setHoles(Number(p.SverdlCount) || 1);
      setHolesR(p.SverdlSize || "5 мм");
    }
    if (p.ProklDefault) {
      setProkleyka(p.ProklCount || "1");
    }
    if (p.LyuvDefault) {
      setLyuversy(p.LyuvCount || "1");
    }
    if (p.PorizkaDefault) {
      setPorizka((prev) => ({ ...prev, type: "Потрібно" }));
    }
  }, [services, isEdit]);

  /* ===================== INIT MODAL (NEW/EDIT) ===================== */

  const options = parseOptionsJson(editingOrderUnit);
  const skipInitialPricing = useRef(false);

  useEffect(() => {
    if (!showNewSheetCut) return;
    if (error) setError(null);
    if (isEdit) skipInitialPricing.current = true;

    if (!isEdit) {
      setCount(DEFAULTS.count);
      setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setLamination(DEFAULTS.lamination);
      setPereplet(DEFAULTS.pereplet);
      setBig(DEFAULTS.big);
      setCute(DEFAULTS.cute);
      setPorizka(DEFAULTS.porizka);
      setCuteLocal(DEFAULTS.cuteLocal);
      setHoles(DEFAULTS.holes);
      setHolesR(DEFAULTS.holesR);
      setProkleyka(DEFAULTS.prokleyka);
      setLyuversy(DEFAULTS.lyuversy);
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
  }, [
    showNewSheetCut,
    isEdit,
    editingOrderUnit?.id,
    editingOrderUnit?.idKey,
    editingOrderUnit?.optionsJson,
  ]);

  /* ===================== SAVE ===================== */

  const addNewOrderUnit = () => {
    let dataToSend = {
      orderId: thisOrder.id,
      toCalc: {
        nameOrderUnit: `${selectedService.toLowerCase() ? selectedService.toLowerCase() + " " : ""}`,
        serviceCategory: "SheetCut",
        serviceName: selectedService,
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
        setShowNewSheetCut(false);
      })
      .catch((error) => {
        setError(error);
        if (error.response?.status === 403) navigate("/login");
        console.log(error.response);
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

  /* ── оновлюємо typeUse ламінації при зміні розміру аркуша ── */
  useEffect(() => {
    if (lamination.type === "Не потрібно") return;
    const laminTypeUse = Math.max(size.x, size.y) <= 297 ? "А4" : "А3";
    if (lamination.typeUse !== laminTypeUse) {
      setLamination(prev => ({ ...prev, typeUse: laminTypeUse }));
    }
  }, [size.x, size.y]); // eslint-disable-line

  useEffect(() => {
    // В edit-mode пропускаємо перший виклик pricing — показуємо збережені ціни
    if (skipInitialPricing.current) {
      skipInitialPricing.current = false;
      if (editingOrderUnit) {
        const storedPrice = parseFloat(editingOrderUnit.priceForAllThis) || 0;
        const storedPerUnit = parseFloat(editingOrderUnit.priceForOneThis) || 0;
        const sc = Number(editingOrderUnit.newField5) || 1;
        setPricesThis((prev) => ({
          ...prev,
          price: storedPrice,
          sheetCount: sc,
          priceDrukPerSheet: storedPerUnit > 0 ? storedPerUnit : (storedPrice / sc),
          pricePaperPerSheet: 0,
          priceLaminationPerSheet: 0,
          porizka: 0,
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
          ...prev,
          ...p,
          big: normalize(p.big),
          prokleyka: normalize(p.prokleyka),
          lyuversy: normalize(p.lyuversy),
          cute: normalize(p.cute),
          holes: normalize(p.holes),
          design: prev.design,
        }));
      })
      .catch((err) => {
        if (err.response?.status === 403) navigate("/login");
        console.log(err.message);
      });
  }, [
    size, material, color, lamination.materialId,
    big, cute, cuteLocal, holes, holesR,
    count, porizka, lyuversy, prokleyka, design, navigate,
  ]);

  useEffect(() => {
    if (error) setError(null);
  }, [material]);

  /* ===================== PRICING DATA ===================== */

  const sc = pricesThis.sheetCount || 0;

  const pricingLines = [
    { label: "Друк", perUnit: pricesThis.priceDrukPerSheet, count: sc, total: (pricesThis.priceDrukPerSheet || 0) * sc },
    { label: "Матеріали", perUnit: pricesThis.pricePaperPerSheet, count: sc, total: (pricesThis.pricePaperPerSheet || 0) * sc },
    { label: "Ламінація", perUnit: pricesThis.priceLaminationPerSheet, count: sc, total: (pricesThis.priceLaminationPerSheet || 0) * sc },
    { label: "Згинання", perUnit: pricesThis.big?.pricePerUnit, count: pricesThis.big?.count, total: pricesThis.big?.totalPrice },
    { label: "Скруглення", perUnit: pricesThis.cute?.pricePerUnit, count: pricesThis.cute?.count, total: pricesThis.cute?.totalPrice },
    { label: "Отвори", perUnit: pricesThis.holes?.pricePerUnit, count: pricesThis.holes?.count, total: pricesThis.holes?.totalPrice },
    { label: "Проклейка", perUnit: pricesThis.prokleyka?.pricePerUnit, count: pricesThis.prokleyka?.count, total: pricesThis.prokleyka?.totalPrice },
    { label: "Люверси", perUnit: pricesThis.lyuversy?.pricePerUnit, count: pricesThis.lyuversy?.count, total: pricesThis.lyuversy?.totalPrice },
  ];

  const pricingSimpleLines = pricesThis.porizka !== 0
    ? [{ label: "Порізка", value: pricesThis.porizka }]
    : [];

  const pricingExtras = [
    { label: "За 1 виріб", value: `${count ? fmt2(pricesThis.price / count) : "0,00"} грн` },
    { label: "На одному аркуші", value: `${calcItemsPerSheet(material.x || 320, material.y || 450, size.x, size.y)} шт` },
    { label: "Аркушів", value: `${sc} шт` },
  ];

  /* ===================== RENDER ===================== */

  return (
    <ScModal
      show={showNewSheetCut}
      onClose={handleClose}
      rightContent={
        <>
          {pricesThis && (
            <ScPricing
              lines={pricingLines}
              simpleLines={pricingSimpleLines}
              totalPrice={pricesThis.price || 0}
              extras={pricingExtras}
              fmt={fmt2}
            />
          )}
          <ScAddButton onClick={addNewOrderUnit} isEdit={isEdit} />
        </>
      }
      errorContent={
        error && (
          <div className="sc-error">
            {error.response?.data?.error || "Помилка"}
          </div>
        )
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
            thicknessOptions={["Офісний", "Тонкий", "Середній", "Цупкий", "Самоклеючі"]}
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
          {/* Розміри — під табами */}
          <div className="sc-section sc-section-card" style={{ margin: "0 2rem" }}>
            <div className="sc-sides sc-size-row">
              {sizeButtons.map((f) => (
                <button
                  key={f.label}
                  className={`sc-side-btn${size.x === f.x && size.y === f.y ? " sc-side-active" : ""}`}
                  onClick={() => setSize({ x: f.x, y: f.y })}
                >
                  <span className="sc-side-text">{f.label}</span>
                </button>
              ))}
              <button
                className={`sc-side-btn${
                  !sizeButtons.some((f) => size.x === f.x && size.y === f.y) ? " sc-side-active" : ""
                }`}
                onClick={() => {}}
              >
                <span className="sc-side-text">Свій розмір</span>
              </button>
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
        options={[
          { value: "односторонній", label: "Односторонній" },
          { value: "двосторонній", label: "Двосторонній" },
          { value: "Не потрібно", label: "Без друку" },
        ]}
      />

      {/* 3. Матеріал */}
      <ScSection style={{ position: "relative", zIndex: 20 }}>
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
          buttonsArr={["Офісний", "Тонкий", "Середній", "Цупкий", "Самоклеючі"]}
          typeUse={null}
          typeOfPosluga={"NewSheetCut"}
          autoSelectFirst={false}
          preferredMaterialName={(() => {
            const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
            return svc?.presets?.materialName || undefined;
          })()}
        />
      </ScSection>

      {/* 4. Ламінація */}
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
      >
        <NewNoModalLamination
          lamination={lamination}
          setLamination={setLamination}
          prices={prices}
          size={size}
          type={"SheetCut"}
          paperTypeUse={material.typeUse}
          presetLamType={services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService)?.presets?.laminationType}
          presetLamThickness={services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService)?.presets?.laminationThickness}
          buttonsArr={[
            "з глянцевим ламінуванням",
            "з матовим ламінуванням",
            "з ламінуванням SoftTouch",
            "з холодним матовим ламінуванням",
          ]}
          selectArr={["30", "70", "80", "100", "125", "250"]}
          labelMap={{
            "з глянцевим ламінуванням": "глянцеве",
            "з матовим ламінуванням": "матове",
            "з ламінуванням SoftTouch": "SoftTouch",
            "з холодним матовим ламінуванням": "холодне",
          }}
        />
      </ScToggleSection>}

      {/* 5. Згинання */}
      {!hideZgyn && <ScToggleSection
        label="Згинання"
        title="Згинання"
        isOn={big !== "Не потрібно"}
        onToggle={() => big === "Не потрібно" ? setBig("1") : setBig("Не потрібно")}
        style={{ position: "relative", zIndex: 50 }}
      >
        <NewNoModalCornerRounding
          big={big} setBig={setBig}
          prices={prices} type={"SheetCut"}
          buttonsArr={[]}
          selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
        />
      </ScToggleSection>}

      {/* 6. Скруглення кутів */}
      {!hideSkrugl && <ScToggleSection
        label="Скруглення"
        title="Скруглення кутів"
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
        style={{ position: "relative", zIndex: 40 }}
      >
        <NewNoModalCute
          cute={cute} setCute={setCute}
          cuteLocal={cuteLocal} setCuteLocal={setCuteLocal}
          prices={prices} type={"SheetCut"}
          buttonsArr={[]}
          selectArr={["3", "6", "8", "10", "13"]}
        />
      </ScToggleSection>}

      {/* 7. Свердління отворів */}
      {!hideSverdl && <ScToggleSection
        label="Свердління"
        title="Свердління отворів"
        isOn={holes !== "Не потрібно"}
        onToggle={() => {
          if (holes === "Не потрібно") { setHoles(1); setHolesR("5 мм"); }
          else { setHoles("Не потрібно"); setHolesR(""); }
        }}
        style={{ position: "relative", zIndex: 30 }}
      >
        <NewNoModalHoles
          holes={holes} setHoles={setHoles}
          holesR={holesR} setHolesR={setHolesR}
          prices={prices} type={"SheetCut"}
          buttonsArr={[]}
          selectArr={["", "3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
        />
      </ScToggleSection>}

      {/* 8. Проклейка */}
      {!hideProkl && <ScToggleSection
        label="Проклейка"
        title="Проклейка"
        isOn={prokleyka !== "Не потрібно"}
        onToggle={() => prokleyka === "Не потрібно" ? setProkleyka("1") : setProkleyka("Не потрібно")}
        style={{ position: "relative", zIndex: 20 }}
      >
        <NewNoModalProkleyka
          prokleyka={prokleyka} setProkleyka={setProkleyka}
          prices={prices} type={"SheetCut"}
          buttonsArr={[]}
          selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
        />
      </ScToggleSection>}

      {/* 9. Люверси */}
      {!hideLyuv && <ScToggleSection
        label="Люверси"
        title="Люверси"
        isOn={lyuversy !== "Не потрібно"}
        onToggle={() => lyuversy === "Не потрібно" ? setLyuversy("1") : setLyuversy("Не потрібно")}
        style={{ position: "relative", zIndex: 10 }}
      >
        <NewNoModalLyuversy
          lyuversy={lyuversy} setLyuversy={setLyuversy}
          type={"SheetCut"} buttonsArr={[]}
          selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
        />
      </ScToggleSection>}

      {/* 10. Порізка */}
      {!hidePorizka && <ScToggleSection
        label="Порізка"
        title="Порізка"
        isOn={porizka.type !== "Не потрібно"}
        onToggle={() => {
          if (porizka.type === "Не потрібно") setPorizka({ ...porizka, type: "Потрібно" });
          else setPorizka({ type: "Не потрібно" });
        }}
      >
        <Porizka
          porizka={porizka} setPorizka={setPorizka}
          prices={prices} type={"SheetCut"}
        />
      </ScToggleSection>}

    </ScModal>
  );
};

export default NewSheetCut;
