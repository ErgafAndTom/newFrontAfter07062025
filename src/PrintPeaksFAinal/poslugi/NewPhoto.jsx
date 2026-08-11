import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import ServiceSettingsModal from "./shared/ServiceSettingsModal";
import V2ToggleSwitch from "./shared/V2ToggleSwitch";
import useServiceTabs from "../../hooks/useServiceTabs";
import { useModalState, useModalPricing, useOrderUnitSave } from "./shared/hooks";
import { getStoredAppTheme, onAppThemeChange } from "../../utils/appTheme";

/* Та сама розмітка й той самий CSS, що в еталонного цифрового друку
   (NewSheetCutV2): шапка, ліва стрічка виробів, права панель наряду. */
import "./NewSheetCutV2.css";

// ========== DEFAULTS ==========
const DEFAULT_SIZE = { x: 100, y: 150 };

const DEFAULTS = {
  size: DEFAULT_SIZE,
  material: {
    type: "Фотопапір",
    thickness: "",
    material: "",
    materialId: "",
    typeUse: "А3",
  },
  photo: {
    type: "Не потрібно",
    thickness: "Тонкий",
    material: "",
    materialId: "",
    typeUse: "Тонкий",
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
    size: "",
  },
  count: 1,
  selectedService: "Фото",
};

const SIZE_FORMATS = [
  { name: "100 x 150 мм", x: 100, y: 150 },
  { name: "130 x 180 мм", x: 130, y: 180 },
  { name: "Polaroid (72 x 86 мм)", x: 72, y: 86 },
  { name: "A5 (148 x 210 мм)", x: 148, y: 210 },
  { name: "A4 (210 x 297 мм)", x: 210, y: 297 },
  { name: "A3 (297 x 420 мм)", x: 297, y: 420 },
];

const SERVICES = ["Фото", "Диплом", "Сертифікат", "Подяка", "Візуалізація", "Графік"];

const SERVICE_ALIASES = {
  "Диплома": "Диплом",
  "Сертифіката": "Сертифікат",
  "Подяки": "Подяка",
  "Візуалізації": "Візуалізація",
  "Графіки": "Графік",
};

const normalizeService = (v) => {
  if (!v) return DEFAULTS.selectedService;
  return SERVICE_ALIASES[v] || v;
};

const NewPhoto = ({
  thisOrder,
  setThisOrder,
  setSelectedThings2,
  showNewPhoto,
  setShowNewPhoto,
  editingOrderUnit,
  setEditingOrderUnit,
}) => {
  const navigate = useNavigate();

  const fmt2 = (v) =>
    new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(v) || 0);

  // Modal state detection
  const { isEdit, options } = useModalState(editingOrderUnit, showNewPhoto);

  // ========== STATE ==========
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [photo, setPhoto] = useState(DEFAULTS.photo);
  const [color, setColor] = useState(DEFAULTS.color);
  const [count, setCount] = useState(DEFAULTS.count);
  const [selectedService, setSelectedService] = useState(DEFAULTS.selectedService);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);
  const { services, addService, removeService, updateService, reorderServices, loading: servicesLoading } = useServiceTabs("Photo", SERVICES);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // тема стежить за глобальною темою застосунку (перемикач у Nav)
  const [theme, setTheme] = useState(getStoredAppTheme);
  useEffect(() => onAppThemeChange(setTheme), []);

  const handleClose = () => {
    if (setEditingOrderUnit) setEditingOrderUnit(null);
    setShowNewPhoto(false);
  };

  const [hideLamination, setHideLamination] = useState(false);
  useEffect(() => {
    if (servicesLoading) return;
    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
    const p = svc?.presets;
    setHideLamination(p?.lamination === false);
  }, [services, selectedService, servicesLoading]);

  const DEFAULT_SIZES = [
    { label: "10×15", x: 100, y: 150 }, { label: "13×18", x: 130, y: 180 },
    { label: "15×20", x: 150, y: 200 }, { label: "20×30", x: 200, y: 300 },
    { label: "A4", x: 210, y: 297 }, { label: "A3", x: 297, y: 420 },
  ];

  const sizeButtons = useMemo(() => {
    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
    const sizes = svc?.presets?.sizes;
    if (Array.isArray(sizes) && sizes.length > 0) return sizes;
    return DEFAULT_SIZES;
  }, [services, selectedService]);

  // Dropdowns
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [customSize, setCustomSize] = useState(false);
  const [localX, setLocalX] = useState(DEFAULT_SIZE.x);
  const [localY, setLocalY] = useState(DEFAULT_SIZE.y);
  const materialsReqRef = useRef(0);

  const handleServiceSelect = useCallback((name) => {
    setSelectedService(name);
    if (isEdit) return;
    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === name);
    const p = svc?.presets;
    if (!p) return;

    if (p.sizeX || p.sizeY) {
      setSize({ x: p.sizeX ? Number(p.sizeX) : size.x, y: p.sizeY ? Number(p.sizeY) : size.y });
      setLocalX(p.sizeX ? Number(p.sizeX) : localX);
      setLocalY(p.sizeY ? Number(p.sizeY) : localY);
    }
    if (p.sides) {
      setColor((prev) => ({ ...prev, sides: p.sides }));
    }
    if (p.lamination !== undefined && p.lamination) {
      const lamType = p.laminationType || "з глянцевим ламінуванням";
      const isOn = p.laminationDefault !== false;
      if (isOn) {
        setLamination({ type: lamType, material: lamType, materialId: "", size: p.laminationThickness ? String(p.laminationThickness) : "" });
      } else {
        setLamination(DEFAULTS.lamination);
      }
    }
  }, [services, isEdit, size, localX, localY]);

  const materialDropdownRef = useRef(null);
  const materialDropdownListRef = useRef(null);

  const getDropdownStyle = useCallback((ref) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return {};
    const margin = 12;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = vh - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const flipUp = spaceBelow < 200 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, flipUp ? spaceAbove : spaceBelow);

    const base = {
      position: "fixed",
      left: rect.left + "px",
      width: rect.width + "px",
      zIndex: 99999,
      maxHeight,
      overflowY: "auto",
    };
    if (flipUp) {
      base.bottom = (vh - rect.top + 2) + "px";
    } else {
      base.top = (rect.bottom + 2) + "px";
    }
    return base;
  }, []);

  // Pricing hook
  const calcData = useMemo(
    () => ({
      selectedService: normalizeService(selectedService),
      size,
      material,
      color: { ...color, sides: "Не потрібно" },
      lamination,
      big: "Не потрібно",
      cute: "Не потрібно",
      cuteLocal: {
        leftTop: false,
        rightTop: false,
        rightBottom: false,
        leftBottom: false,
      },
      holes: "Не потрібно",
      count,
      photo: {
        ...photo,
        service: normalizeService(selectedService),
      },
    }),
    [selectedService, size, material, color, lamination, count, photo]
  );

  const { pricesThis } = useModalPricing("Photo", calcData, showNewPhoto, 300, editingOrderUnit);

  // Save hook
  const { saveOrderUnit } = useOrderUnitSave(
    thisOrder,
    setThisOrder,
    setSelectedThings2,
    () => setShowNewPhoto(false),
    setEditingOrderUnit
  );

  // ========== EFFECTS ==========

  // Initialize/reset state when modal opens
  useEffect(() => {
    if (!showNewPhoto) return;

    // NEW mode - set defaults
    if (!isEdit) {
      setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material);
      setPhoto(DEFAULTS.photo);
      setColor(DEFAULTS.color);
      setCount(DEFAULTS.count);
      setSelectedService(DEFAULTS.selectedService);
      setLocalX(DEFAULTS.size.x);
      setLocalY(DEFAULTS.size.y);
      setCustomSize(false);
      setError(null);
      return;
    }

    // EDIT mode - load from options
    const opt = options || {};

    const safeNum = (v, fallback) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    };

    setCount(safeNum(opt?.count, safeNum(editingOrderUnit?.amount, DEFAULTS.count)) || DEFAULTS.count);

    setSize({
      x: safeNum(opt?.size?.x, DEFAULT_SIZE.x),
      y: safeNum(opt?.size?.y, DEFAULT_SIZE.y),
    });
    setLocalX(safeNum(opt?.size?.x, DEFAULT_SIZE.x));
    setLocalY(safeNum(opt?.size?.y, DEFAULT_SIZE.y));

    setMaterial({
      type: opt?.material?.type ?? DEFAULTS.material.type,
      thickness: opt?.material?.thickness ?? DEFAULTS.material.thickness,
      material: opt?.material?.material ?? DEFAULTS.material.material,
      materialId: opt?.material?.materialId ?? DEFAULTS.material.materialId,
      typeUse: opt?.material?.typeUse ?? DEFAULTS.material.typeUse,
    });

    setPhoto({
      type: opt?.photo?.type ?? DEFAULTS.photo.type,
      thickness: opt?.photo?.thickness ?? DEFAULTS.photo.thickness,
      material: opt?.photo?.material ?? DEFAULTS.photo.material,
      materialId: opt?.photo?.materialId ?? DEFAULTS.photo.materialId,
      typeUse: opt?.photo?.typeUse ?? DEFAULTS.photo.typeUse,
    });

    setColor({
      sides: opt?.color?.sides ?? DEFAULTS.color.sides,
      one: opt?.color?.one ?? DEFAULTS.color.one,
      two: opt?.color?.two ?? DEFAULTS.color.two,
      allSidesColor: opt?.color?.allSidesColor ?? DEFAULTS.color.allSidesColor,
    });

    // Service tabs
    const serviceFromOptions = opt?.selectedService || opt?.photo?.service;
    const serviceFallback = editingOrderUnit?.newField1 || editingOrderUnit?.nameOrderUnit;
    setSelectedService(normalizeService(serviceFromOptions || serviceFallback || DEFAULTS.selectedService));

    // Check if custom size
    const foundFormat = SIZE_FORMATS.find(
      (f) => f.x === safeNum(opt?.size?.x, DEFAULT_SIZE.x) && f.y === safeNum(opt?.size?.y, DEFAULT_SIZE.y)
    );
    setCustomSize(!foundFormat);

    setError(null);
  }, [showNewPhoto, isEdit, options, editingOrderUnit]);

  // Fetch materials
  useEffect(() => {
    if (!showNewPhoto) return;

    const data = {
      name: "MaterialsPrices",
      inPageCount: 999999,
      currentPage: 1,
      search: "",
      columnName: { column: "id", reverse: false },
      material,
      size,
    };

    // Відкидаємо відповіді застарілих запитів: при відкритті в режимі редагування
    // цей ефект спершу спрацьовує зі старим size (DEFAULT_SIZE), бо setSize з ефекту
    // ініціалізації застосується лише на наступному рендері. Без цієї перевірки
    // відповідь на 10×15 перезаписувала збережений матеріал.
    const reqId = ++materialsReqRef.current;

    axios
      .post(`/materials/NotAll`, data)
      .then((response) => {
        if (reqId !== materialsReqRef.current) return;
        const rows = response.data.rows || [];
        setMaterials(rows);

        // Auto-select first material if none selected or current not in results
        const currentExists = rows.some((r) => String(r.id) === String(material.materialId));
        if (rows.length > 0 && (!material.materialId || !currentExists)) {
          setMaterial((prev) => ({
            ...prev,
            material: rows[0].name,
            materialId: rows[0].id,
          }));
        }
      })
      .catch((err) => {
        if (reqId !== materialsReqRef.current) return;
        setMaterials([]);
        if (err?.response?.status === 403) {
          navigate("/login");
        }
      });
  }, [size, showNewPhoto, navigate]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        materialDropdownRef.current && !materialDropdownRef.current.contains(event.target) &&
        (!materialDropdownListRef.current || !materialDropdownListRef.current.contains(event.target))
      ) {
        setMaterialDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ========== HANDLERS ==========
  const applyCustomSize = () => {
    setSize({ x: localX, y: localY });
  };

  const handleMaterialSelect = (item) => {
    setMaterial((prev) => ({
      ...prev,
      material: item?.name || "",
      materialId: item?.id || 0,
    }));
    setMaterialDropdownOpen(false);
  };

  const handleSave = () => {
    const toCalcData = {
      nameOrderUnit: `${selectedService.toLowerCase() || ""} `,
      type: "Photo",
      selectedService: normalizeService(selectedService),
      newField1: normalizeService(selectedService),
      size,
      material: { ...material, type: "Не потрібно" },
      color: { ...color, sides: "Не потрібно" },
      lamination: DEFAULTS.lamination,
      big: "Не потрібно",
      cute: "Не потрібно",
      cuteLocal: {
        leftTop: false,
        rightTop: false,
        rightBottom: false,
        leftBottom: false,
      },
      holes: "Не потрібно",
      holesR: "",
      count,
      photo: {
        ...photo,
        service: normalizeService(selectedService),
      },
    };

    saveOrderUnit(toCalcData, editingOrderUnit, setError);
  };

  // ========== RENDER HELPERS ==========

  const materialTitle = material?.material || "Виберіть матеріал";

  // ========== PRICING DATA ==========

  const sk = pricesThis?.skolko || 0;
  const pricingLines = [
    { label: "Матеріали", perUnit: pricesThis?.priceForThisUnitOfPapper, count: sk, total: (pricesThis?.priceForThisUnitOfPapper || 0) * sk },
    { label: "Друк", perUnit: pricesThis?.priceForDrukThisUnit, count: sk, total: (pricesThis?.priceForDrukThisUnit || 0) * sk },
    { label: "Ламінація", perUnit: pricesThis?.priceLaminationPerSheet, count: sk, total: (pricesThis?.priceLaminationPerSheet || 0) * sk },
  ];

  // ========== RENDER ==========

  const totalPrice = pricesThis?.price || 0;

  const headSpec = [
    `${size.x}×${size.y} мм`,
    material?.material || null,
    lamination.type !== "Не потрібно" ? "ламінування" : null,
  ].filter(Boolean).join(" · ");

  if (!showNewPhoto) return null;

  return (
    <>
      <div className="v2-overlay" onClick={handleClose} />
      <div className={`v2-modal v2-modal-mid v2-theme-${theme}`} onClick={(e) => e.stopPropagation()}>

        {/* ШАПКА */}
        <div className="v2-head">
          <div className="v2-head-main">
            <span className="v2-head-title">
              Фотодрук{selectedService ? ` · ${selectedService}` : ""}
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
                    className={`v2-size${!customSize && size.x === f.x && size.y === f.y ? " active" : ""}`}
                    onClick={() => { setSize({ x: f.x, y: f.y }); setLocalX(f.x); setLocalY(f.y); setCustomSize(false); }}
                  >
                    {f.label}
                  </button>
                ))}
                <div className={`v2-size v2-size-custom${customSize || !sizeButtons.some((f) => size.x === f.x && size.y === f.y) ? " active" : ""}`}>
                  <input
                    type="number"
                    value={localX}
                    min={45}
                    max={310}
                    onChange={(e) => { setLocalX(Number(e.target.value)); setCustomSize(true); }}
                    onBlur={applyCustomSize}
                  />
                  <span>×</span>
                  <input
                    type="number"
                    value={localY}
                    min={45}
                    max={440}
                    onChange={(e) => { setLocalY(Number(e.target.value)); setCustomSize(true); }}
                    onBlur={applyCustomSize}
                  />
                  <span>мм</span>
                </div>
              </div>
            </div>

            {/* МАТЕРІАЛ */}
            <div className="v2-section">
              <span className="v2-label">Фотопапір</span>
              <div className="v2-material-wrap">
                <div
                  className="custom-select-container selectArtem selectArtemBefore sc-has-value"
                  ref={materialDropdownRef}
                  style={{ width: "100%" }}
                >
                  <div
                    className="custom-select-header"
                    onClick={() => setMaterialDropdownOpen(!materialDropdownOpen)}
                  >
                    {materialTitle}
                  </div>

                  {materialDropdownOpen && createPortal(
                    <div
                      className={`custom-select-dropdown v2-dropdown v2-theme-${theme}`}
                      ref={materialDropdownListRef}
                      style={getDropdownStyle(materialDropdownRef)}
                    >
                      {materials.map((item) => (
                        <div
                          key={item.id}
                          className={`custom-option ${String(item.id) === String(material?.materialId) ? "active" : ""}`}
                          onClick={() => handleMaterialSelect(item)}
                        >
                          <span className="name">{item.name}</span>
                          <span className="gsm-sub">
                            <sub>{item.thickness} gsm</sub>
                          </span>
                        </div>
                      ))}
                    </div>,
                    document.body
                  )}
                </div>
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
                          const maxDim = Math.max(size.x, size.y);
                          const laminTypeUse = maxDim <= 210 ? "А5" : maxDim <= 297 ? "А4" : "А3";
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
                            type="SheetCut"
                            paperTypeUse={(() => { const m = Math.max(size.x, size.y); return m <= 210 ? "А5_force" : m <= 297 ? "А4_force" : "А3_force"; })()}
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
                <span>За 1 фото</span>
                <span>{count ? fmt2(totalPrice / count) : "0,00"} грн</span>
              </div>
              <div className="v2-total-sub">
                <span>Використано аркушів</span>
                <span>{sk} шт</span>
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
            {typeof error === "string" ? error : "Помилка"}
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
          hideSidesOption
          thicknessOptions={[]}
        />
      </div>
    </>
  );
};

export default NewPhoto;
