import axios from '../../api/axiosInstance';
import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import Materials2 from "./newnomodals/Materials2";

import ServiceSettingsModal from "./shared/ServiceSettingsModal";
import V2ToggleSwitch from "./shared/V2ToggleSwitch";
import useServiceTabs from "../../hooks/useServiceTabs";
import { getStoredAppTheme, onAppThemeChange } from "../../utils/appTheme";

/* Модалка живе в тій самій розмітці й тому самому CSS, що й еталонний
   цифровий друк (NewSheetCutV2): шапка з наряд-специфікацією, ліва
   стрічка виробів, центральна колонка параметрів і права панель наряду. */
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

  const [lamination, setLamination] = useState(DEFAULTS.lamination);

  const [showSettings, setShowSettings] = useState(false);

  // тема стежить за глобальною темою застосунку (перемикач у Nav)
  const [theme, setTheme] = useState(getStoredAppTheme);
  useEffect(() => onAppThemeChange(setTheme), []);

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
        serviceCategory: "SheetCutBw",
        serviceName: selectedService,
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


  /* ===================== PRICING DATA ===================== */

  const sc = pricesThis.sheetCount || 0;

  const pricingLines = [
    { label: "Друк", perUnit: pricesThis.priceDrukPerSheet, count: sc, total: (pricesThis.priceDrukPerSheet || 0) * sc },
    { label: "Матеріали", perUnit: pricesThis.pricePaperPerSheet, count: sc, total: (pricesThis.pricePaperPerSheet || 0) * sc },
    { label: "Ламінація", perUnit: pricesThis.priceLaminationPerSheet, count: sc, total: (pricesThis.priceLaminationPerSheet || 0) * sc },
  ];


  const handleClose = () => {
    setEditingOrderUnit(null);
    setShowNewSheetCutBW(false);
  };

  /* ===================== RENDER ===================== */

  /* Сторонність: у монохромному друку «без друку» не буває —
     аркуш або друкується з одного боку, або з обох */
  const sidesOptions = [
    { value: "односторонній", label: "Односторонній" },
    { value: "двосторонній", label: "Двосторонній" },
  ];

  const totalPrice = pricesThis.price || 0;

  /* Рядок під заголовком — коротка специфікація наряду */
  const headSpec = [
    `${size.x}×${size.y} мм`,
    sidesOptions.find((o) => o.value === color.sides)?.label,
    material.material || null,
    lamination.type !== "Не потрібно" ? "ламінування" : null,
  ].filter(Boolean).join(" · ");

  if (!showNewSheetCutBW) return null;

  return (
    <>
      <div className="v2-overlay" onClick={handleClose} />
      <div className={`v2-modal v2-theme-${theme}`} onClick={(e) => e.stopPropagation()}>

        {/* ШАПКА */}
        <div className="v2-head">
          <div className="v2-head-main">
            <span className="v2-head-title">
              Чорно-білий друк{selectedService ? ` · ${selectedService}` : ""}
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

            {/* ДРУК */}
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

            {/* МАТЕРІАЛ — папір обирається автоматично за розміром,
                селект лишається заблокованим, як і було */}
            <div className="v2-section">
              <span className="v2-label">Матеріал</span>
              <div className="v2-material-wrap">
                <Materials2
                  material={material}
                  setMaterial={setMaterial}
                  count={count}
                  setCount={setCount}
                  size={size}
                  name={"Чорно-білий друк на монохромному принтері:"}
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

            {/* ПОСТОБРОБКА */}
            {!hideLamination && (
              <div className="v2-section">
                <span className="v2-label">Постобробка</span>
                <div className="v2-postpress">
                  <div className="v2-toggle">
                    <div className="v2-toggle-left">
                      <V2ToggleSwitch
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
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
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

            {/* розкладки тут немає навмисно: у монохромному друку виріб
                завжди дорівнює аркушу (А4/А3), розкласти його на аркуші
                нічим — на відміну від цифрового друку */}

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
          extraToggles={[]}
        />
      </div>
    </>
  );
}
