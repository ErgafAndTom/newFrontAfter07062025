import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import ServiceSettingsModal from "./shared/ServiceSettingsModal";
import { useModalState, useModalPricing, useOrderUnitSave } from "./shared/hooks";
import useServiceTabs from "../../hooks/useServiceTabs";

import NewNoModalSizeNote from "./newnomodals/note/NewNoModalSizeNote";
import Materials2NoteFront from "./newnomodals/note/Materials2NoteFront";
import Materials2NoteBack from "./newnomodals/note/Material2NoteBack";
import PerepletPerepletBooklet from "./newnomodals/PerepletPerepletBooklet";
import { getStoredAppTheme, onAppThemeChange } from "../../utils/appTheme";

import "./NewSheetCutV2.css";


// ========== DEFAULTS ==========
const SERVICES_BOOKLET = ["Буклет", "Автореферат", "Конспект", "Звіт", "Журнал", "Зін", "Брошура", "Методичка"];

const DEFAULTS = {
  size: { x: 148, y: 210 },
  materialAndDrukBody: {
    materialType: "Папір", materialTypeUse: "Офісний",
    drukColor: "Не потрібно", drukSides: "односторонній", drukId: "Не потрібно",
    thickness: "", material: "", materialId: "",
    laminationType: "Не потрібно", laminationTypeUse: "", laminationmaterial: "", laminationmaterialId: "",
    typeUse: "",
  },
  materialAndDrukInBody: {
    ColorDrukMaterialType: "Не потрібно", BwDrukMaterialType: "Не потрібно", NonDrukMaterialType: "Не потрібно",
    ColorDrukMaterialTypeUse: "Офісний", BwDrukMaterialTypeUse: "Офісний", NonDrukMaterialTypeUse: "Офісний",
    ColorDrukLaminationType: "Не потрібно", BwDrukLaminationType: "Не потрібно", NonDrukLaminationType: "Не потрібно",
    ColorDrukLaminationTypeUse: "З глянцевим ламінуванням", BwDrukLaminationTypeUse: "З глянцевим ламінуванням", NonDrukLaminationTypeUse: "З глянцевим ламінуванням",
    ColorDrukLaminationMaterial: "Не потрібно", BwDrukLaminationMaterial: "Не потрібно", NonDrukLaminationMaterial: "Не потрібно",
    ColorDrukLaminationMaterialId: "", BwDrukLaminationMaterialId: "", NonDrukLaminationMaterialId: "",
    ColorDrukMaterial: "", BwDrukMaterial: "", NonDrukMaterial: "",
    ColorDrukMaterialId: "", BwDrukMaterialId: "", NonDrukMaterialId: "",
    typeUse: "",
    colorCount: 1, bwCount: 1, nonCount: 1,
  },
  materialAndDrukFront: {
    materialType: "Папір", materialTypeUse: "Цупкий",
    drukColor: "Кольоровий", drukSides: "односторонній", drukId: "Не потрібно",
    thickness: "", material: "", materialId: "",
    laminationType: "Не потрібно", laminationTypeUse: "З глянцевим ламінуванням",
    laminationmaterial: "", laminationmaterialId: "",
    typeUse: "",
    big: "Не потрібно",
    materialAndDrukFront: "Не потрібно",
  },
  materialAndDrukBack: {
    materialType: "Папір", materialTypeUse: "Офісний",
    drukColor: "Чорнобілий", drukSides: "двосторонній", drukId: "Не потрібно",
    thickness: "", material: "", materialId: "",
    laminationType: "Не потрібно", laminationTypeUse: "З глянцевим ламінуванням",
    laminationmaterial: "", laminationmaterialId: "",
    typeUse: "",
    count: 12,
  },
  material: { type: "Не потрібно", thickness: "", material: "", materialId: "", typeUse: "" },
  color: { sides: "Не потрібно", one: "", two: "", allSidesColor: "CMYK" },
  lamination: { type: "Не потрібно", material: "", materialId: "", size: "" },
  pereplet: { type: "", material: "", materialId: "", size: "<120", typeUse: "Брошурування до 120 аркушів" },
  count: 1,
  selectedService: "Буклет",
};

const fmt2 = (v) =>
  new Intl.NumberFormat("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v) || 0);

// ========== COMPONENT ==========
const NewBooklet = ({
  thisOrder,
  setThisOrder,
  setSelectedThings2,
  showNewBooklet,
  setShowNewBooklet,
  editingOrderUnit,
  setEditingOrderUnit,
}) => {
  const navigate = useNavigate();

  // Modal state detection
  const { isEdit, options } = useModalState(editingOrderUnit, showNewBooklet);

  // ========== STATE ==========
  const [size, setSize] = useState(DEFAULTS.size);
  const [materialAndDrukBody, setMaterialAndDrukBody] = useState(DEFAULTS.materialAndDrukBody);
  const [materialAndDrukInBody, setMaterialAndDrukInBody] = useState(DEFAULTS.materialAndDrukInBody);
  const [materialAndDrukFront, setMaterialAndDrukFront] = useState(DEFAULTS.materialAndDrukFront);
  const [materialAndDrukBack, setMaterialAndDrukBack] = useState(DEFAULTS.materialAndDrukBack);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [color, setColor] = useState(DEFAULTS.color);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);
  const [big, setBig] = useState("Не потрібно");
  const [cute, setCute] = useState("Не потрібно");
  const [porizka, setPorizka] = useState({ type: "Не потрібно" });
  const [cuteLocal, setCuteLocal] = useState({ leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" });
  const [holes, setHoles] = useState("Не потрібно");
  const [holesR, setHolesR] = useState("");
  const [count, setCount] = useState(DEFAULTS.count);
  const [pereplet, setPereplet] = useState(DEFAULTS.pereplet);
  const [selectedService, setSelectedService] = useState(DEFAULTS.selectedService);
  const { services, addService, removeService, updateService, reorderServices } = useServiceTabs("Booklet", SERVICES_BOOKLET);
  const [showSettings, setShowSettings] = useState(false);

  // тема стежить за глобальною темою застосунку (перемикач у Nav)
  const [theme, setTheme] = useState(getStoredAppTheme);
  useEffect(() => onAppThemeChange(setTheme), []);

  const DEFAULT_SIZES = [
    { label: "А5", x: 148, y: 210 }, { label: "A4", x: 210, y: 297 },
    { label: "А3", x: 297, y: 420 }, { label: "SR A3", x: 310, y: 440 },
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
    if (p.coverColor) {
      setMaterialAndDrukFront((prev) => ({ ...prev, drukColor: p.coverColor }));
    }
    if (p.coverSides) {
      setMaterialAndDrukFront((prev) => ({ ...prev, drukSides: p.coverSides }));
    }
    if (p.coverThickness) {
      setMaterialAndDrukFront((prev) => ({ ...prev, materialType: p.coverThickness === "Офісний" ? "Офісний" : "Папір", materialTypeUse: p.coverThickness, material: "", materialId: "" }));
    }
    if (p.blockColor) {
      setMaterialAndDrukBack((prev) => ({ ...prev, drukColor: p.blockColor }));
    }
    if (p.blockPages) {
      setMaterialAndDrukBack((prev) => ({ ...prev, count: Number(p.blockPages) }));
    }
    if (p.blockSides) {
      setMaterialAndDrukBack((prev) => ({ ...prev, drukSides: p.blockSides }));
    }
    if (p.blockThickness) {
      setMaterialAndDrukBack((prev) => ({ ...prev, materialType: p.blockThickness === "Офісний" ? "Офісний" : "Папір", materialTypeUse: p.blockThickness, material: "", materialId: "" }));
    }
    if (p.bindingType) {
      setPereplet((prev) => ({ ...prev, type: p.bindingType }));
    }
  }, [services, isEdit, size]);
  const [error, setError] = useState(null);

  // ========== PRICING HOOK ==========
  const coverIsOff = materialAndDrukFront.materialAndDrukFront === "Не потрібно";

  const calcData = useMemo(() => {
    const frontForCalc = coverIsOff ? {
      ...materialAndDrukFront,
      drukColor: "Не потрібно", materialId: "", material: "",
      laminationType: "Не потрібно", laminationmaterialId: "", laminationmaterial: "",
    } : materialAndDrukFront;
    const data = {
      newField6: "Booklet",
      size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count,
      pereplet, materialAndDrukFront: frontForCalc, materialAndDrukInBody, materialAndDrukBack,
    };
    if (porizka.type !== "Не потрібно") data.porizka = porizka;
    return data;
  }, [size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count, porizka, materialAndDrukFront, materialAndDrukInBody, materialAndDrukBack, pereplet, coverIsOff]);

  const { pricesThis } = useModalPricing("Note", calcData, showNewBooklet, 300, editingOrderUnit);

  // ========== SAVE HOOK ==========
  const { saveOrderUnit } = useOrderUnitSave(
    thisOrder, setThisOrder, setSelectedThings2,
    () => setShowNewBooklet(false),
    setEditingOrderUnit
  );

  const handleClose = () => {
    if (setEditingOrderUnit) setEditingOrderUnit(null);
    setShowNewBooklet(false);
  };

  // ========== EFFECTS ==========

  // Init / Edit mode
  useEffect(() => {
    if (!showNewBooklet) return;

    if (!isEdit) {
      setSize(DEFAULTS.size);
      setMaterialAndDrukBody(DEFAULTS.materialAndDrukBody);
      setMaterialAndDrukInBody(DEFAULTS.materialAndDrukInBody);
      setMaterialAndDrukFront(DEFAULTS.materialAndDrukFront);
      setMaterialAndDrukBack(DEFAULTS.materialAndDrukBack);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setLamination(DEFAULTS.lamination);
      setBig("Не потрібно");
      setCute("Не потрібно");
      setPorizka({ type: "Не потрібно" });
      setCuteLocal({ leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" });
      setHoles("Не потрібно");
      setHolesR("");
      setCount(DEFAULTS.count);
      setPereplet(DEFAULTS.pereplet);
      setSelectedService(DEFAULTS.selectedService);
      setError(null);
      return;
    }

    // EDIT mode
    const opt = options || {};
    const safeNum = (v, fb) => { const n = Number(v); return Number.isFinite(n) ? n : fb; };

    setCount(safeNum(opt?.count, safeNum(editingOrderUnit?.amount, DEFAULTS.count)) || DEFAULTS.count);
    if (opt?.size) setSize({ x: safeNum(opt.size.x, DEFAULTS.size.x), y: safeNum(opt.size.y, DEFAULTS.size.y) });
    if (opt?.materialAndDrukFront) setMaterialAndDrukFront(opt.materialAndDrukFront);
    if (opt?.materialAndDrukBack) setMaterialAndDrukBack(opt.materialAndDrukBack);
    if (opt?.materialAndDrukInBody) setMaterialAndDrukInBody(opt.materialAndDrukInBody);
    if (opt?.material) setMaterial(opt.material);
    if (opt?.color) setColor(opt.color);
    if (opt?.lamination) setLamination(opt.lamination);
    if (opt?.pereplet) setPereplet(opt.pereplet);
    if (opt?.big !== undefined) setBig(opt.big);
    if (opt?.cute !== undefined) setCute(opt.cute);
    if (opt?.cuteLocal) setCuteLocal(opt.cuteLocal);
    if (opt?.holes !== undefined) setHoles(opt.holes);
    if (opt?.holesR !== undefined) setHolesR(opt.holesR);
    if (opt?.porizka) setPorizka(opt.porizka);

    const svc = opt?.selectedService || editingOrderUnit?.newField1 || editingOrderUnit?.nameOrderUnit;
    if (svc) setSelectedService(svc.charAt(0).toUpperCase() + svc.slice(1).trim());

    setError(null);
  }, [showNewBooklet, isEdit, options, editingOrderUnit]);

  // Auto-calc pereplet size based on page count
  useEffect(() => {
    const allPapers = 2 + materialAndDrukBack.count;
    if (allPapers <= 120) {
      setPereplet((prev) => ({ ...prev, size: "<120", typeUse: "Брошурування до 120 аркушів" }));
    } else if (allPapers > 120 && allPapers <= 280) {
      setPereplet((prev) => ({ ...prev, size: ">120", typeUse: "Брошурування від 120 до 280 аркушів" }));
    } else {
      setPereplet((prev) => ({ ...prev, size: "", typeUse: "" }));
    }
  }, [materialAndDrukBack.count]);

  // ========== HANDLERS ==========

  const handleSave = () => {
    const frontForSave = coverIsOff ? {
      ...materialAndDrukFront,
      drukColor: "Не потрібно", materialId: "", material: "",
      laminationType: "Не потрібно", laminationmaterialId: "", laminationmaterial: "",
    } : materialAndDrukFront;
    const toCalcData = {
      nameOrderUnit: `${selectedService.toLowerCase() ? selectedService.toLowerCase() + " " : ""}`,
      serviceCategory: "Booklet",
      serviceName: selectedService,
      newField6: "Booklet",
      type: "Note",
      size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count,
      pereplet, materialAndDrukFront: frontForSave, materialAndDrukInBody, materialAndDrukBack,
    };
    if (porizka.type !== "Не потрібно") toCalcData.porizka = porizka;

    saveOrderUnit(toCalcData, editingOrderUnit, setError);
  };

  // ========== PRICING DATA ==========
  const sc = pricesThis?.sheetCount || 0;
  const scBack = pricesThis?.sheetCountBack || 0;


  const pricingLines = pricesThis
    ? [
        { label: "Обкладинка: Друк", perUnit: pricesThis.priceDrukFront, count: sc, total: (pricesThis.priceDrukFront || 0) * sc },
        { label: "Обкладинка: Матеріал", perUnit: pricesThis.priceMaterialFront, count: sc, total: (pricesThis.priceMaterialFront || 0) * sc },
        { label: "Обкладинка: Ламінація", perUnit: pricesThis.priceLaminationFront, count: sc, total: (pricesThis.priceLaminationFront || 0) * sc },
        { label: "Блок: Друк", perUnit: pricesThis.priceDrukBack, count: scBack, total: (pricesThis.priceDrukBack || 0) * scBack },
        { label: "Блок: Матеріал", perUnit: pricesThis.priceMaterialBack, count: scBack, total: (pricesThis.priceMaterialBack || 0) * scBack },
        { label: "Блок: Ламінація", perUnit: pricesThis.priceLaminationBack, count: scBack, total: (pricesThis.priceLaminationBack || 0) * scBack },
        { label: "Брошурування", perUnit: pricesThis.pricePerepletUnit, count, total: pricesThis.totalPerepletPrice || 0 },
      ]
    : [];

  const pricingExtras = pricesThis
    ? [
        { label: "За виріб", value: `${fmt2(pricesThis.priceForItemWithExtras)} грн` },
        { label: "Кратність", value: `${Math.floor((pricesThis.sheetsPerUnit || 0) / 2)} шт` },
        { label: "Сторінок блоку", value: `${materialAndDrukBack.count * 2} стор.` },
      ]
    : [];

  // ========== RENDER ==========

  const totalPrice = Number(pricesThis?.price) || 0;

  const headSpec = [
    `${size.x}×${size.y} мм`,
    materialAndDrukBack?.count ? `блок ${materialAndDrukBack.count * 2} стор.` : null,
    pereplet?.type && pereplet.type !== "Не потрібно" ? pereplet.type : null,
  ].filter(Boolean).join(" · ");

  if (!showNewBooklet) return null;

  return (
    <>
      <div className="v2-overlay" onClick={handleClose} />
      <div className={`v2-modal v2-theme-${theme}`} onClick={(e) => e.stopPropagation()}>

        {/* ШАПКА */}
        <div className="v2-head">
          <div className="v2-head-main">
            <span className="v2-head-title">
              Буклет{selectedService ? ` · ${selectedService}` : ""}
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

            {/* ОБКЛАДИНКА */}
            <div className="v2-section">
              <span className="v2-label">Обкладинка</span>
              <Materials2NoteFront
                materialAndDrukFront={materialAndDrukFront}
                setMaterialAndDrukFront={setMaterialAndDrukFront}
                count={count}
                setCount={setCount}
                prices={[]}
                size={size}
                selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                name={"Обкладинки:"}
                dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                buttonsArr={["Офісний", "Тонкий", "Середній", "Цупкий"]}
                buttonsArrDruk={["односторонній", "двосторонній"]}
                buttonsArrColor={["Не потрібно", "Чорнобілий", "Кольоровий"]}
                buttonsArrLamination={["З глянцевим ламінуванням", "З матовим ламінуванням", "З ламінуванням SoftTouch"]}
                typeUse={null}
                preferredMaterialName={(() => {
                  const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
                  return svc?.presets?.coverMaterial || undefined;
                })()}
              />
            </div>

            {/* БЛОК */}
            <div className="v2-section">
              <span className="v2-label">Блок</span>
              <Materials2NoteBack
                materialAndDrukBack={materialAndDrukBack}
                setMaterialAndDrukBack={setMaterialAndDrukBack}
                count={count}
                setCount={setCount}
                prices={[]}
                size={size}
                selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                name={"Чорно-білий друк на монохромному принтері:"}
                dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                buttonsArr={["Офісний", "Тонкий", "Середній", "Цупкий"]}
                buttonsArrDruk={["односторонній", "двосторонній"]}
                buttonsArrColor={["Не потрібно", "Чорнобілий", "Кольоровий"]}
                buttonsArrLamination={["з глянцевим ламінуванням", "з матовим ламінуванням", "з ламінуванням SoftTouch"]}
                typeUse={null}
                preferredMaterialName={(() => {
                  const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
                  return svc?.presets?.blockMaterial || undefined;
                })()}
              />
            </div>

            {/* БРОШУРУВАННЯ */}
            <div className="v2-section" style={{ position: "relative", zIndex: 50 }}>
              <span className="v2-label">Брошурування</span>
              <div className="v2-material-wrap">
                <PerepletPerepletBooklet
                  size={size}
                  pereplet={pereplet}
                  setPereplet={setPereplet}
                  prices={[]}
                  type={"SheetCut"}
                  dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                  buttonsArr={["Брошурування до 120 аркушів", "Брошурування від 120 до 280 аркушів"]}
                  defaultt={"А3 (297 х 420 мм)"}
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
                {fmt2(totalPrice)} <span className="v2-total-unit">грн</span>
              </div>
              <div className="v2-total-sub">
                <span>За виріб</span>
                <span>{fmt2(pricesThis?.priceForItemWithExtras || 0)} грн</span>
              </div>
              <div className="v2-total-sub">
                <span>Кратність</span>
                <span>{Math.floor((pricesThis?.sheetsPerUnit || 0) / 2)} шт</span>
              </div>
              <div className="v2-total-sub">
                <span>Сторінок блоку</span>
                <span>{(materialAndDrukBack?.count || 0) * 2} стор.</span>
              </div>
            </div>

            <button className="v2-add-btn" onClick={handleSave} disabled={!thisOrder?.id}>
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
            {typeof error === "string" ? error : error?.message || "Помилка"}
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
          hideLaminationOption
          hideMaterialOption
          customPresetSections={[
            { key: "coverColor", label: "Обкл. друк", options: [
              { value: "Не потрібно", label: "Ні" }, { value: "Чорнобілий", label: "ЧБ" }, { value: "Кольоровий", label: "Колір" }
            ]},
            { key: "coverSides", label: "Обкл. сторони", options: [
              { value: "односторонній", label: "Одност." }, { value: "двосторонній", label: "Двост." }
            ]},
            { key: "coverThickness", label: "Обкл. папір", options: ["Офісний", "Тонкий", "Середній", "Цупкий"] },
            { key: "coverMaterial", label: "Обкл. матеріал", type: "materialSelect", thicknessKey: "coverThickness" },
            { key: "blockColor", label: "Блок друк", options: [
              { value: "Не потрібно", label: "Ні" }, { value: "Чорнобілий", label: "ЧБ" }, { value: "Кольоровий", label: "Колір" }
            ]},
            { key: "blockPages", label: "Блок арк.", type: "number", placeholder: "50" },
            { key: "blockSides", label: "Блок сторони", options: [
              { value: "односторонній", label: "Одност." }, { value: "двосторонній", label: "Двост." }
            ]},
            { key: "blockThickness", label: "Блок папір", options: ["Офісний", "Тонкий", "Середній", "Цупкий"] },
            { key: "blockMaterial", label: "Блок матеріал", type: "materialSelect", thicknessKey: "blockThickness" },
            { key: "bindingType", label: "Переплет", options: [
              { value: "на скобу", label: "На скобу" }, { value: "на євроскобу", label: "На євроскобу" }
            ]},
          ]}
        />
      </div>
    </>
  );
};

export default NewBooklet;
