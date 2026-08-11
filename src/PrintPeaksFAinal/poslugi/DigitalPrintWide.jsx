import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import NewNoModalCornerRounding from "./newnomodals/NewNoModalBig";
import Materials2 from "./newnomodals/Materials2";
import NewNoModalProkleyka from "./newnomodals/NewNoModalProkleyka";
import NewNoModalPorizka from "./newnomodals/NewNoModalPorizka";

import useServiceTabs from "../../hooks/useServiceTabs";
/* Рядок постобробки PRINT V2 — пропси ті самі, що були у ScToggleSection */
import ScToggleSection from "./shared/V2ToggleSection";
import ServiceSettingsModal from "./shared/ServiceSettingsModal";
import { getStoredAppTheme, onAppThemeChange } from "../../utils/appTheme";

import "./NewSheetCutV2.css";

/* ===================== CONSTANTS ===================== */

const FIXED_SIZE = { x: 330, y: 660 };
const TYPE_KEY = "DigitalPrintWide";

const emptyPrice = { pricePerUnit: 0, count: 0, totalPrice: 0 };
const normalize = (obj = {}) => ({
  pricePerUnit: Number(obj.pricePerUnit) || 0,
  count: Number(obj.count) || 0,
  totalPrice: Number(obj.totalPrice) || 0,
});

const DEFAULTS = {
  count: 1,
  size: { ...FIXED_SIZE },
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
  big: "Не потрібно",
  porizka: { type: "Не потрібно" },
  prokleyka: "Не потрібно",
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

/* ===================== COMPONENT ===================== */

const DigitalPrintWide = ({
  thisOrder,
  setShowDigitalPrintWide,
  setThisOrder,
  setSelectedThings2,
  showDigitalPrintWide,
  editingOrderUnit,
}) => {
  const fmt2 = (v) =>
    new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(v) || 0);

  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const handleClose = () => {
    setShowDigitalPrintWide(false);
  };

  /* ====== STATE ====== */

  // Розмір зафіксовано — 330x660
  const [size] = useState(FIXED_SIZE);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [color, setColor] = useState(DEFAULTS.color);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);
  const [big, setBig] = useState(DEFAULTS.big);
  const [porizka, setPorizka] = useState(DEFAULTS.porizka);
  const [prokleyka, setProkleyka] = useState(DEFAULTS.prokleyka);
  const [count, setCount] = useState(DEFAULTS.count);
  const [prices] = useState([]);

  const [pricesThis, setPricesThis] = useState({
    big: emptyPrice,
    prokleyka: emptyPrice,
  });

  const [selectedService, setSelectedService] = useState("Обгортка");
  const [showSettings, setShowSettings] = useState(false);

  const PORIZKA_SUBTYPES = ["ручна легка", "на гільйотині", "ручна середня"];
  const THICKNESS_OPTIONS = ["Тонкий", "Середній", "Цупкий", "Самоклеючі"];

  // тема стежить за глобальною темою застосунку (перемикач у Nav)
  const [theme, setTheme] = useState(getStoredAppTheme);
  useEffect(() => onAppThemeChange(setTheme), []);
  const { services, addService, removeService, updateService, reorderServices, loading: servicesLoading } = useServiceTabs(
    "DigitalPrintWide",
    ["Обгортка", "Етикетка", "Меню", "Рукав"]
  );

  const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.idKey);
  const skipInitialPricing = useRef(false);

  // Застосувати пресети при виборі категорії
  const handleServiceSelect = useCallback((name) => {
    setSelectedService(name);
    if (isEdit) return;
    const svc = services.find((s) => (typeof s === "string" ? s : s?.name) === name);
    const p = svc?.presets;
    if (!p) return;

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
          setLamination({
            type: lamType,
            material: lamType,
            materialId: "",
            size: p.laminationThickness ? String(p.laminationThickness) : "",
            typeUse: "А3_force",
          });
        } else {
          setLamination(DEFAULTS.lamination);
        }
      } else {
        setLamination(DEFAULTS.lamination);
      }
    }
    if (p.ZgynDefault) setBig(p.ZgynCount || "1");
    if (p.ProklDefault) setProkleyka(p.ProklCount || "1");
    if (p.PorizkaDefault) setPorizka((prev) => ({ ...prev, type: "Потрібно" }));
  }, [services, isEdit]);

  /* ===================== INIT MODAL (NEW/EDIT) ===================== */

  const options = parseOptionsJson(editingOrderUnit);

  useEffect(() => {
    if (!showDigitalPrintWide) return;
    if (error) setError(null);
    if (isEdit) skipInitialPricing.current = true;

    if (!isEdit) {
      setCount(DEFAULTS.count);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setLamination(DEFAULTS.lamination);
      setBig(DEFAULTS.big);
      setPorizka(DEFAULTS.porizka);
      setProkleyka(DEFAULTS.prokleyka);
      return;
    }

    const opt = options || {};
    setCount(safeNum(opt?.count, safeNum(editingOrderUnit?.amount, DEFAULTS.count)));
    setMaterial(opt?.material ?? DEFAULTS.material);
    setColor(opt?.color ?? DEFAULTS.color);
    setLamination(opt?.lamination ?? DEFAULTS.lamination);
    setBig(opt?.big ?? DEFAULTS.big);
    setPorizka(opt?.porizka ?? DEFAULTS.porizka);
    setProkleyka(opt?.prokleyka ?? DEFAULTS.prokleyka);
  }, [
    showDigitalPrintWide,
    isEdit,
    editingOrderUnit?.id,
    editingOrderUnit?.idKey,
    editingOrderUnit?.optionsJson,
  ]);

  /* ===================== SAVE ===================== */

  const addNewOrderUnit = () => {
    const dataToSend = {
      orderId: thisOrder.id,
      ...(isEdit ? { orderUnitId: editingOrderUnit?.id || editingOrderUnit?.idKey, idKey: editingOrderUnit?.id || editingOrderUnit?.idKey } : {}),
      toCalc: {
        nameOrderUnit: `${selectedService ? selectedService.toLowerCase() + " " : ""}`,
        type: TYPE_KEY,
        newField6: TYPE_KEY,
        size,
        material,
        color,
        lamination,
        big,
        cute: "Не потрібно",
        cuteLocal: { leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" },
        prokleyka,
        lyuversy: "Не потрібно",
        design: "Не потрібно",
        holes: "Не потрібно",
        holesR: "",
        count,
        porizka,
        selectedService,
        newField1: selectedService,
      },
    };

    axios
      .post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then((response) => {
        setThisOrder?.(response.data);
        setSelectedThings2?.(response.data.OrderUnits);
        setShowDigitalPrintWide(false);
      })
      .catch((err) => {
        setError(err);
        if (err.response?.status === 403) navigate("/login");
        console.log(err.response);
      });
  };

  /* ===================== PRICING ===================== */

  useEffect(() => {
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
          priceDrukPerSheet: storedPerUnit > 0 ? storedPerUnit : storedPrice / sc,
          pricePaperPerSheet: 0,
          priceLaminationPerSheet: 0,
          porizka: 0,
        }));
      }
      return;
    }

    const dataToSend = {
      type: TYPE_KEY,
      size,
      material,
      color,
      lamination,
      big,
      cute: "Не потрібно",
      prokleyka,
      lyuversy: "Не потрібно",
      design: "Не потрібно",
      cuteLocal: { leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" },
      holes: "Не потрібно",
      holesR: "",
      count,
      porizka,
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
        }));
      })
      .catch((err) => {
        if (err.response?.status === 403) navigate("/login");
        console.log(err.message);
      });
  }, [
    material,
    color,
    lamination.materialId,
    big,
    count,
    porizka,
    prokleyka,
    navigate,
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
    { label: "Проклейка", perUnit: pricesThis.prokleyka?.pricePerUnit, count: pricesThis.prokleyka?.count, total: pricesThis.prokleyka?.totalPrice },
  ];

  const pricingSimpleLines = pricesThis.porizka !== 0
    ? [{ label: "Порізка", value: pricesThis.porizka }]
    : [];


  /* ===================== RENDER ===================== */

  const headSpec = [
    `${FIXED_SIZE.x}×${FIXED_SIZE.y} мм`,
    material?.material || null,
    lamination.type !== "Не потрібно" ? "ламінування" : null,
  ].filter(Boolean).join(" · ");

  if (!showDigitalPrintWide) return null;

  return (
    <>
      <div className="v2-overlay" onClick={handleClose} />
      <div className={`v2-modal v2-theme-${theme}`} onClick={(e) => e.stopPropagation()}>

        {/* ШАПКА */}
        <div className="v2-head">
          <div className="v2-head-main">
            <span className="v2-head-title">
              Цифровий друк широкий{selectedService ? ` · ${selectedService}` : ""}
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
              const name = typeof service === "string" ? service : service?.name;
              const tabColor = typeof service === "string" ? null : service?.color;
              const prevService = services[idx - 1];
              const prevColor = prevService ? (typeof prevService === "string" ? null : prevService?.color) : null;
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

            {/* РОЗМІР — формат фіксований, тож це не вибір, а факт */}
            <div className="v2-section">
              <span className="v2-label">Формат</span>
              <div className="v2-sides" style={{ gridTemplateColumns: "1fr" }}>
                <button className="v2-side active" disabled>
                  {FIXED_SIZE.x}×{FIXED_SIZE.y} мм — фіксований
                </button>
              </div>
            </div>

            {/* ДРУК */}
            <div className="v2-section">
              <span className="v2-label">Друк</span>
              <div className="v2-sides" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {[
                  { value: "односторонній", label: "Односторонній" },
                  { value: "двосторонній", label: "Двосторонній" },
                  { value: "Не потрібно", label: "Без друку" },
                ].map((opt) => (
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

            {/* ПАПІР — товщина окремою смугою плиток, як у цифровому друку;
                тоді список матеріалів стоїть на всю ширину під нею */}
            <div className="v2-section">
              <span className="v2-label">Папір</span>
              <div className="v2-thick-btns" style={{ gridTemplateColumns: `repeat(${THICKNESS_OPTIONS.length}, 1fr)` }}>
                {THICKNESS_OPTIONS.map((t) => (
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
                      }));
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* МАТЕРІАЛ */}
            <div className="v2-section" style={{ position: "relative", zIndex: 30 }}>
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
                  name={"Цифровий друк широкий:"}
                  buttonsArr={[]}
                  typeUse={null}
                  typeOfPosluga={"DigitalPrintWide"}
                  autoSelectFirst={true}
                  dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                  preferredMaterialName={(() => {
                    const svc = services.find((s) => (typeof s === "string" ? s : s?.name) === selectedService);
                    return svc?.presets?.materialName || undefined;
                  })()}
                />
              </div>
            </div>

            {/* ПОСТОБРОБКА */}
            <div className="v2-section">
              <span className="v2-label">Постобробка</span>
              <div className="v2-postpress">

                {/* Ламінування */}
                <ScToggleSection
                  label="Ламінування"
                  title="Ламінування"
                  isOn={lamination.type !== "Не потрібно"}
                  onToggle={() => {
                    if (lamination.type === "Не потрібно") {
                      const svc = services.find((s) => (typeof s === "string" ? s : s?.name) === selectedService);
                      const presetLamType = svc?.presets?.laminationType || "з глянцевим ламінуванням";
                      const presetLamThick = svc?.presets?.laminationThickness ? String(svc.presets.laminationThickness) : "";
                      setLamination({
                        ...lamination,
                        type: presetLamType,
                        material: presetLamType,
                        materialId: "",
                        size: presetLamThick,
                        typeUse: "А3_force",
                      });
                    } else {
                      setLamination({ type: "Не потрібно", material: "", materialId: "", size: "", typeUse: "А3_force" });
                    }
                  }}
                >
                  <NewNoModalLamination
                    lamination={lamination}
                    setLamination={setLamination}
                    prices={prices}
                    size={size}
                    type={"DigitalPrintWide"}
                    typeOfPosluga={"DigitalPrintWide"}
                    paperTypeUse={"А3_force"}
                    dropdownClassName={`v2-dropdown v2-theme-${theme}`}
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
                </ScToggleSection>

                {/* Згинання */}
                <ScToggleSection
                  label="Згинання"
                  title="Згинання"
                  isOn={big !== "Не потрібно"}
                  onToggle={() => (big === "Не потрібно" ? setBig("1") : setBig("Не потрібно"))}
                  style={{ position: "relative", zIndex: 25 }}
                >
                  <NewNoModalCornerRounding
                    big={big}
                    setBig={setBig}
                    prices={prices}
                    type={"DigitalPrintWide"}
                    buttonsArr={[]}
                    dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                    selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                  />
                </ScToggleSection>

                {/* Проклейка */}
                <ScToggleSection
                  label="Проклейка"
                  title="Проклейка"
                  isOn={prokleyka !== "Не потрібно"}
                  onToggle={() => (prokleyka === "Не потрібно" ? setProkleyka("1") : setProkleyka("Не потрібно"))}
                  style={{ position: "relative", zIndex: 20 }}
                >
                  <NewNoModalProkleyka
                    prokleyka={prokleyka}
                    setProkleyka={setProkleyka}
                    prices={prices}
                    type={"DigitalPrintWide"}
                    buttonsArr={[]}
                    dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                    selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                  />
                </ScToggleSection>

                {/* Порізка */}
                <ScToggleSection
                  label="Порізка"
                  title="Порізка"
                  isOn={porizka.type !== "Не потрібно"}
                  onToggle={() => {
                    if (porizka.type === "Не потрібно") {
                      setPorizka({ ...porizka, type: "Потрібно", subtype: porizka.subtype || PORIZKA_SUBTYPES[0] });
                    } else {
                      setPorizka({ type: "Не потрібно" });
                    }
                  }}
                >
                  <NewNoModalPorizka
                    porizka={porizka}
                    setPorizka={setPorizka}
                    selectArr={PORIZKA_SUBTYPES}
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
                          {line.count} арк × {fmt2(line.perUnit)} ={" "}
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
                {fmt2(pricesThis.price || 0)} <span className="v2-total-unit">грн</span>
              </div>
              <div className="v2-total-sub">
                <span>За 1 виріб</span>
                <span>{count ? fmt2(pricesThis.price / count) : "0,00"} грн</span>
              </div>
              <div className="v2-total-sub">
                <span>Аркушів</span>
                <span>{sc} шт</span>
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
        {error && (
          <div className="v2-error">
            {error.response?.data?.error || "Помилка"}
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
            const sId = typeof service === "string" ? null : service?.id;
            const sName = typeof service === "string" ? service : service?.name;
            if (sId) await removeService(sId);
            if (selectedService === sName) {
              const first = services.find((s) => (typeof s === "string" ? s : s?.name) !== sName);
              setSelectedService(first ? (typeof first === "string" ? first : first.name) : "");
            }
          }}
          onUpdateService={updateService}
          onReorderServices={reorderServices}
          defaultSizes={[{ label: "330×660", x: 330, y: 660 }]}
          thicknessOptions={["Тонкий", "Середній", "Цупкий", "Самоклеючі"]}
          extraToggles={[
            { key: "hideZgyn", label: "Згинання", defaultKey: "ZgynDefault", params: [
              { key: "ZgynCount", label: "Кількість", options: ["1","2","3","4","5","6","7","8","9"] }
            ]},
            { key: "hideProkl", label: "Проклейка", defaultKey: "ProklDefault", params: [
              { key: "ProklCount", label: "Кількість", options: ["1","2","3","4","5","6","7","8","9"] }
            ]},
            { key: "hidePorizka", label: "Порізка", defaultKey: "PorizkaDefault" },
          ]}
        />
      </div>
    </>
  );
};

export default DigitalPrintWide;
