// Vishichka.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "../../api/axiosInstance";
import NewNoModalSize from "./newnomodals/NewNoModalSizeColor";
import Materials2 from "./newnomodals/Materials2";
import { useNavigate } from "react-router-dom";
import PlivkaMontajna from "./newnomodals/plivka/PlivkaMontajna";
import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import {columnTranslations as editingOrderUnit} from "../user/translations";

/* Будівельні блоки PRINT V2 — пропси ті самі, що були у Sc*-версій */
import ScSides from "./shared/V2Sides";
import ScToggleSection from "./shared/V2ToggleSection";
import ServiceSettingsModal from "./shared/ServiceSettingsModal";
import ImpositionPreview from "./shared/ImpositionPreview";
import useServiceTabs from "../../hooks/useServiceTabs";
import { getStoredAppTheme, onAppThemeChange } from "../../utils/appTheme";

import "./NewSheetCutV2.css";

/**
 * Мапа типів висічки (лейбл -> typeUse)
 */
const VISHICHKA_MAP = {
  SHEET_CUT: {
    label: "З плотерною надсічкою на надрукованих аркушах",
    typeUse: "sheet_cut",
  },
  STICKERPACK: {
    label: "З плотерною порізкою стікерпаків",
    typeUse: "stickerpack",
  },
  SINGLE_ITEMS: {
    label: "З плотерною порізкою окремими виробами",
    typeUse: "single_items",
  },
};
const isEdit = Boolean(editingOrderUnit?.id);

const DEFAULTS = {
  count: 1,
  size: { x: 310, y: 440 },

  // ✅ для нового замовлення: показує "Виберіть матеріал"
  material: {
    type: "Плівка",
    thickness: "Самоклеючі",
    material: "",
    materialId: 0,
    typeUse: "Самоклеючі",
    a: "",
  },

  color: {
    sides: "односторонній",
    one: "",
    two: "",
    allSidesColor: "CMYK",
  },

  lamination: {
    type: "Не потрібно",
    material: "З глянцевим ламінуванням",
    materialId: "",
    size: "",
    typeUse: "А3",
  },

  // ✅ для нового замовлення: дефолт як на твоєму скріні
  vishichka: {
    type: "vishichka",
    thickness: "Тонкі",
    material: VISHICHKA_MAP.SHEET_CUT.label,
    materialId: "", // підтягнемо з pricing.selectedVishichka.id
    typeUse: VISHICHKA_MAP.SHEET_CUT.typeUse,
  },

  plivkaMontajna: {
    type: "plivka",
    thickness: "Тонкі",
    material: "Немає Монтажної плівки",
    materialId: "0",
    typeUse: null,
  },

  big: "Не потрібно",
  cute: "Не потрібно",
  cuteLocal: {
    leftTop: false,
    rightTop: false,
    rightBottom: false,
    leftBottom: false,
    radius: "",
  },
  holes: "Не потрібно",
  holesR: "",
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

function normalizeVishichkaByLabel(v) {
  const label = (v?.material || "").trim();
  if (!label) return v;

  const found = Object.values(VISHICHKA_MAP).find((x) => x.label === label);
  if (!found) return v;

  return {
    ...v,
    type: v?.type || "vishichka",
    typeUse: found.typeUse,
  };
}

const Vishichka = ({
                     thisOrder,
                     newThisOrder,
                     setNewThisOrder,
                     selectedThings2,
                     setShowVishichka,
                     setThisOrder,
                     setSelectedThings2,
                     showVishichka,
                     editingOrderUnit,
                   }) => {
  const fmt2 = (v) =>
    new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(v));

  const navigate = useNavigate();

  const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.idKey);
  const skipInitialPricing = useRef(false);
  const options = useMemo(() => parseOptionsJson(editingOrderUnit), [editingOrderUnit]);

  const [error, setError] = useState(null);

  // ✅ prices має бути масивом (інакше десь падає .map)
  const [prices, setPrices] = useState([]);

  // state
  const [count, setCount] = useState(DEFAULTS.count);
  const [size, setSize] = useState(DEFAULTS.size);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [color, setColor] = useState(DEFAULTS.color);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);

  const [vishichka, setVishichka] = useState(normalizeVishichkaByLabel(DEFAULTS.vishichka));
  const [plivkaMontajna, setPlivkaMontajna] = useState(DEFAULTS.plivkaMontajna);

  const [big, setBig] = useState(DEFAULTS.big);
  const [cute, setCute] = useState(DEFAULTS.cute);
  const [cuteLocal, setCuteLocal] = useState(DEFAULTS.cuteLocal);
  const [holes, setHoles] = useState(DEFAULTS.holes);
  const [holesR, setHolesR] = useState(DEFAULTS.holesR);

  const [pricesThis, setPricesThis] = useState({
    priceDrukPerSheet: 0,
    pricePaperPerSheet: 0,
    priceVishichkaPerSheet: 0,
    pricePlivkaPerSheet: 0,
    priceLaminationPerSheet: 0,
    totalVishichkaPrice: 0,
    totalPlivkaPrice: 0,
    sheetCount: 0,
    sheetsPerUnit: 0,
    price: 0,
    priceForItemWithExtras: 0,
  });
  const [selectedService, setSelectedService] = useState("Наліпки");
  const [isEditServices, setIsEditServices] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // тема стежить за глобальною темою застосунку (перемикач у Nav)
  const [theme, setTheme] = useState(getStoredAppTheme);
  useEffect(() => onAppThemeChange(setTheme), []);
  const { services, addService, removeService, updateService, reorderServices, loading: servicesLoading } = useServiceTabs("Vishichka", [
    "Наліпки", "Стікери", "Стікерпак", "Стікерсет", "Бірки",
    "Листівки", "Коробочки", "Фішки", "Цінник", "Меню",
  ]);

  const DEFAULT_SIZES = [
    { label: "А6", x: 105, y: 148 }, { label: "A5", x: 148, y: 210 },
    { label: "A4", x: 210, y: 297 }, { label: "А3", x: 297, y: 420 },
    { label: "SR A3", x: 310, y: 440 }, { label: "90×50", x: 90, y: 50 },
    { label: "85×55", x: 85, y: 55 }, { label: "100×150", x: 100, y: 150 },
    { label: "50×50", x: 50, y: 50 }, { label: "100×100", x: 100, y: 100 },
  ];

  // Розміри з пресету поточної категорії (або дефолтні)
  const sizeButtons = useMemo(() => {
    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
    const sizes = svc?.presets?.sizes;
    if (Array.isArray(sizes) && sizes.length > 0) return sizes;
    return DEFAULT_SIZES;
  }, [services, selectedService]);

  const setVishichkaSafe = useCallback((nextOrUpdater) => {
    setVishichka((prev) => {
      const next = typeof nextOrUpdater === "function" ? nextOrUpdater(prev) : nextOrUpdater;
      const merged = { ...prev, ...(next || {}) };
      return normalizeVishichkaByLabel(merged);
    });
  }, []);

  const handleClose = () => {
    setShowVishichka(false);
  };

  const handleChangeCount = (v) => setCount(safeNum(v, 1));

  // Застосувати пресети при виборі категорії
  const handleServiceSelect = useCallback((name) => {
    setSelectedService(name);
    if (isEdit) return; // Не застосовуємо пресети при редагуванні
    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === name);
    const p = svc?.presets;
    if (!p) return;

    if (p.sizeX || p.sizeY) {
      setSize((prev) => ({
        x: p.sizeX ? Number(p.sizeX) : prev.x,
        y: p.sizeY ? Number(p.sizeY) : prev.y,
      }));
    }
    if (p.thickness) {
      const isSelf = p.thickness === "Самоклеючі";
      setMaterial((prev) => ({
        ...prev,
        type: isSelf ? "Плівка" : "Папір",
        thickness: p.thickness,
        typeUse: p.thickness,
        // Скидаємо вибір щоб Materials2 перезавантажив список
        material: "",
        materialId: 0,
        a: "",
        x: null,
        y: null,
      }));
    }
    // materialName застосовується через preferredMaterialName в Materials2
    if (p.sides) {
      setColor((prev) => ({ ...prev, sides: p.sides }));
    }
    if (p.vishichkaType) {
      const found = Object.values(VISHICHKA_MAP).find((v) => v.typeUse === p.vishichkaType);
      if (found) {
        setVishichkaSafe({
          type: "vishichka",
          thickness: vishichka.thickness,
          material: found.label,
          materialId: "",
          typeUse: found.typeUse,
        });
      }
    }
    if (p.plivka !== undefined) {
      if (p.plivka) {
        setPlivkaMontajna((prev) => ({
          ...prev,
          material: p.plivkaName || "З монтажною плівкою",
          typeUse: "з монтажною плівкою",
          materialId: p.plivkaName ? 0 : prev.materialId, // скидаємо ID щоб перезавантажити
        }));
      } else {
        setPlivkaMontajna(DEFAULTS.plivkaMontajna);
      }
    }
    if (p.lamination !== undefined) {
      if (p.lamination) {
        const lamType = p.laminationType || "з глянцевим ламінуванням";
        const isOn = p.laminationDefault !== false; // default true
        if (isOn) {
          setLamination({
            type: lamType,
            material: lamType,
            materialId: "",
            size: p.laminationThickness ? String(p.laminationThickness) : "",
            typeUse: "А3",
          });
        } else {
          setLamination(DEFAULTS.lamination); // OFF за замовчуванням, але секція видима
        }
      } else {
        setLamination(DEFAULTS.lamination);
      }
    }
  }, [services, isEdit, vishichka, setVishichkaSafe]);

  /**
   * ✅ ГОЛОВНЕ: кожен раз при відкритті модалки
   * - якщо New (не edit) -> повний reset до дефолтів
   * - якщо Edit -> підтягуємо з optionsJson
   */
  useEffect(() => {
    if (!showVishichka) return;

    setError(null);

    if (!isEdit) {
      setCount(DEFAULTS.count);
      setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setLamination(DEFAULTS.lamination);
      setVishichkaSafe(DEFAULTS.vishichka);
      setPlivkaMontajna(DEFAULTS.plivkaMontajna);
      setBig(DEFAULTS.big);
      setCute(DEFAULTS.cute);
      setCuteLocal(DEFAULTS.cuteLocal);
      setHoles(DEFAULTS.holes);
      setHolesR(DEFAULTS.holesR);
      setSelectedService("Наліпки");
      setPricesThis({
        priceDrukPerSheet: 0, pricePaperPerSheet: 0,
        priceVishichkaPerSheet: 0, pricePlivkaPerSheet: 0,
        priceLaminationPerSheet: 0, totalVishichkaPrice: 0,
        totalPlivkaPrice: 0, sheetCount: 0, sheetsPerUnit: 0,
        price: 0, priceForItemWithExtras: 0,
      });
      return;
    }

    // EDIT
    if (isEdit) skipInitialPricing.current = true;
    const opt = options || null;

    setCount(safeNum(opt?.count, safeNum(editingOrderUnit?.amount, DEFAULTS.count)) || DEFAULTS.count);

    setSize({
      x: safeNum(opt?.size?.x, safeNum(editingOrderUnit?.newField2, DEFAULTS.size.x)),
      y: safeNum(opt?.size?.y, safeNum(editingOrderUnit?.newField3, DEFAULTS.size.y)),
    });

    setMaterial({
      type: opt?.material?.type ?? DEFAULTS.material.type,
      thickness: opt?.material?.thickness ?? DEFAULTS.material.thickness,
      material: opt?.material?.material ?? DEFAULTS.material.material,
      materialId: opt?.material?.materialId ?? DEFAULTS.material.materialId,
      typeUse: opt?.material?.typeUse ?? DEFAULTS.material.typeUse,
      a: opt?.material?.a ?? DEFAULTS.material.a,
    });

    setColor({
      sides: opt?.color?.sides ?? DEFAULTS.color.sides,
      one: opt?.color?.one ?? DEFAULTS.color.one,
      two: opt?.color?.two ?? DEFAULTS.color.two,
      allSidesColor: opt?.color?.allSidesColor ?? DEFAULTS.color.allSidesColor,
    });

    setLamination({
      type: opt?.lamination?.type ?? DEFAULTS.lamination.type,
      material: opt?.lamination?.material ?? DEFAULTS.lamination.material,
      materialId: opt?.lamination?.materialId ?? DEFAULTS.lamination.materialId,
      size: opt?.lamination?.size ?? DEFAULTS.lamination.size,
      typeUse: opt?.lamination?.typeUse ?? DEFAULTS.lamination.typeUse,
    });

    setVishichkaSafe({
      type: opt?.vishichka?.type ?? DEFAULTS.vishichka.type,
      thickness: opt?.vishichka?.thickness ?? DEFAULTS.vishichka.thickness,
      material: opt?.vishichka?.material ?? DEFAULTS.vishichka.material,
      materialId: opt?.vishichka?.materialId ?? DEFAULTS.vishichka.materialId,
      typeUse: opt?.vishichka?.typeUse ?? DEFAULTS.vishichka.typeUse,
    });

    setPlivkaMontajna({
      type: opt?.plivkaMontajna?.type ?? DEFAULTS.plivkaMontajna.type,
      thickness: opt?.plivkaMontajna?.thickness ?? DEFAULTS.plivkaMontajna.thickness,
      material: opt?.plivkaMontajna?.material ?? DEFAULTS.plivkaMontajna.material,
      materialId: opt?.plivkaMontajna?.materialId ?? DEFAULTS.plivkaMontajna.materialId,
      typeUse: opt?.plivkaMontajna?.typeUse ?? DEFAULTS.plivkaMontajna.typeUse,
    });

    setBig(opt?.big ?? DEFAULTS.big);
    setCute(opt?.cute ?? DEFAULTS.cute);

    setCuteLocal({
      leftTop: opt?.cuteLocal?.leftTop ?? DEFAULTS.cuteLocal.leftTop,
      rightTop: opt?.cuteLocal?.rightTop ?? DEFAULTS.cuteLocal.rightTop,
      rightBottom: opt?.cuteLocal?.rightBottom ?? DEFAULTS.cuteLocal.rightBottom,
      leftBottom: opt?.cuteLocal?.leftBottom ?? DEFAULTS.cuteLocal.leftBottom,
      radius: opt?.cuteLocal?.radius ?? DEFAULTS.cuteLocal.radius,
    });

    setHoles(opt?.holes ?? DEFAULTS.holes);
    setHolesR(opt?.holesR ?? DEFAULTS.holesR);
    setPricesThis({
      priceDrukPerSheet: 0, pricePaperPerSheet: 0,
      priceVishichkaPerSheet: 0, pricePlivkaPerSheet: 0,
      priceLaminationPerSheet: 0, totalVishichkaPrice: 0,
      totalPlivkaPrice: 0, sheetCount: 0, sheetsPerUnit: 0,
      price: 0, priceForItemWithExtras: 0,
    });
  }, [showVishichka, isEdit, options, editingOrderUnit, setVishichkaSafe]);

  // CATALOG PRICES (для Materials2 / Size / інше)
  useEffect(() => {
    axios
      .get(`/getpricesNew`)
      .then((res) => {
        const data = res?.data;
        const arr = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
        setPrices(arr);
      })
      .catch((err) => {
        if (err?.response?.status === 403) navigate("/login");
        console.log(err?.message);
      });
  }, [navigate]);

  // PRICING
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

    if (!showVishichka) return;

    const dataToSend = {
      type: "Vishichka",
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
      vishichka,
      plivkaMontajna,
    };

    axios
      .post(`/calc/pricing`, dataToSend)
      .then((response) => {
        const p = response?.data?.prices ?? null;
        setPricesThis(p);

        // ✅ підтягнути materialId висічки з pricing, але без зациклення
        const selectedV = p?.selectedVishichka;

        if (selectedV?.id) {
          setVishichka((prev) => {
            const prevId = prev?.materialId ? String(prev.materialId) : "";
            const nextId = String(selectedV.id);

            const shouldSetId = !prevId || prevId === "0";
            const shouldSetLabel = !prev?.material;

            if (!shouldSetId && !shouldSetLabel) return prev;

            const next = {
              ...prev,
              materialId: shouldSetId ? selectedV.id : prev.materialId,
              // label не перетираємо, якщо вже є
              material: shouldSetLabel ? (selectedV.name || prev.material) : prev.material,
              type: prev?.type || selectedV.type || "vishichka",
              typeUse: prev?.typeUse || selectedV.typeUse || prev?.typeUse,
            };
            return normalizeVishichkaByLabel(next);
          });
        }
      })
      .catch((err) => {
        if (err?.response?.status === 403) navigate("/login");
        console.log(err?.message);
      });
  }, [
    showVishichka,
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
    vishichka,
    plivkaMontajna,
    navigate,
  ]);

  // SAVE
  const addNewOrderUnit = () => {
    const v = normalizeVishichkaByLabel(vishichka);

    if (!v?.material || !v?.typeUse) {
      setError({ response: { data: { error: "Оберіть тип плотерної порізки" } } });
      return;
    }

    if (!v?.materialId) {
      setError({
        response: {
          data: {
            error:
              "Не вдалося визначити ID висічки (materialId). Перемкніть тип висічки або оновіть сторінку.",
          },
        },
      });
      return;
    }

    const nameOrderUnit = selectedService ? `${selectedService.toLowerCase()} ` : "";

    const dataToSend = {
      orderId: thisOrder?.id,
      toCalc: {
        nameOrderUnit,
        serviceCategory: "Vishichka",
        serviceName: selectedService,
        type: "Vishichka",
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
        vishichka: v,
        plivkaMontajna,
      },
    };

    axios
      .post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then((response) => {
        setThisOrder(response.data);
        setSelectedThings2(response.data?.OrderUnits || []);
        setShowVishichka(false);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        if (err?.response?.status === 403) navigate("/login");
        console.log(err?.message);
      });
  };

  /* ===================== PRICING DATA ===================== */

  // Визначити чи поточна категорія ховає плівку/ламінацію
  const [hidePlivka, setHidePlivka] = useState(false);
  const [hideLamination, setHideLamination] = useState(false);

  useEffect(() => {
    if (servicesLoading) return; // чекаємо завантаження з API
    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
    const p = svc?.presets;
    const hp = p?.plivka === false;
    const hl = p?.lamination === false;
    console.log('[Vishichka] hide effect:', selectedService, 'presets:', JSON.stringify(p), 'hidePlivka:', hp, 'hideLam:', hl);
    setHidePlivka(hp);
    setHideLamination(hl);
  }, [services, selectedService, servicesLoading]);

  const sc = pricesThis?.sheetCount || 0;

  const pricingLines = [
    { label: "Друк", perUnit: pricesThis?.priceDrukPerSheet, count: sc, total: (pricesThis?.priceDrukPerSheet || 0) * sc },
    { label: "Матеріали", perUnit: pricesThis?.pricePaperPerSheet, count: sc, total: (pricesThis?.pricePaperPerSheet || 0) * sc },
    { label: "Висічка", perUnit: pricesThis?.priceVishichkaPerSheet, count: sc, total: pricesThis?.totalVishichkaPrice || 0 },
    { label: "Монтажка + вибірка", perUnit: pricesThis?.pricePlivkaPerSheet, count: sc, total: pricesThis?.totalPlivkaPrice || 0 },
    { label: "Ламінація", perUnit: pricesThis?.priceLaminationPerSheet, count: sc, total: (pricesThis?.priceLaminationPerSheet || 0) * sc },
  ];

  if (!showVishichka) return null;

  const headSpec = [
    `${size.x}×${size.y} мм`,
    material?.material || null,
    vishichka?.material || null,
    lamination.type !== "Не потрібно" ? "ламінування" : null,
  ].filter(Boolean).join(" · ");

  if (!showVishichka) return null;

  return (
    <>
      <div className="v2-overlay" onClick={handleClose} />
      <div className={`v2-modal v2-theme-${theme}`} onClick={(e) => e.stopPropagation()}>

        {/* ШАПКА */}
        <div className="v2-head">
          <div className="v2-head-main">
            <span className="v2-head-title">
              Висічка{selectedService ? ` · ${selectedService}` : ""}
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
              options={[
                { value: "односторонній", label: "Односторонній" },
                { value: "двосторонній", label: "Двосторонній" },
                { value: "Не потрібно", label: "Без друку" },
              ]}
            />

            {/* МАТЕРІАЛ */}
            <div className="v2-section" style={{ position: "relative", zIndex: 20 }}>
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
                  name="Чорно-білий друк на монохромному принтері:"
                  buttonsArr={["Тонкий", "Середній", "Цупкий", "Самоклеючі"]}
                  typeUse={null}
                  editingOrderUnit={editingOrderUnit}
                  autoSelectFirst={false}
                  dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                  preferredMaterialName={(() => {
                    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
                    return svc?.presets?.materialName || undefined;
                  })()}
                />
              </div>
            </div>

            {/* ПЛОТЕРНА ПОРІЗКА */}
            <div className="v2-section" style={{ position: "relative", zIndex: 10 }}>
              <span className="v2-label">Плотерна порізка</span>
              <div className="v2-sides" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {[
                  { key: "SHEET_CUT", label: "Висічка" },
                  { key: "STICKERPACK", label: "Стікерпак" },
                  { key: "SINGLE_ITEMS", label: "Порізка" },
                ].map((btn) => (
                  <button
                    key={btn.key}
                    className={`v2-side${vishichka.typeUse === VISHICHKA_MAP[btn.key].typeUse ? " active" : ""}`}
                    onClick={() =>
                      setVishichkaSafe({
                        ...vishichka,
                        material: VISHICHKA_MAP[btn.key].label,
                        typeUse: VISHICHKA_MAP[btn.key].typeUse,
                        type: "vishichka",
                        materialId: "",
                      })
                    }
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ПОСТОБРОБКА */}
            {(!hidePlivka || !hideLamination) && (
              <div className="v2-section">
                <span className="v2-label">Постобробка</span>
                <div className="v2-postpress">

                  {/* Монтажна плівка */}
                  {!hidePlivka && (
                    <div className="v2-toggle" style={{ position: "relative", zIndex: 40 }}>
                      <div className="v2-toggle-left">
                        {/* та сама обгортка, що й у постобробці цифрового друку —
                            саме на неї спираються стилі випадайок V2 */}
                        <div className="v2-toggle-content">
                        <PlivkaMontajna
                          size={size}
                          plivkaMontajna={plivkaMontajna}
                          setPlivkaMontajna={setPlivkaMontajna}
                          vishichka={vishichka}
                          setVishichka={setVishichkaSafe}
                          prices={prices}
                          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                          buttonsArr={[
                            VISHICHKA_MAP.SHEET_CUT.label,
                            VISHICHKA_MAP.STICKERPACK.label,
                            VISHICHKA_MAP.SINGLE_ITEMS.label,
                          ]}
                        />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ламінування */}
                  {!hideLamination && (
                    <ScToggleSection
                      label="Ламінування"
                      title="Ламінування"
                      isOn={lamination.type !== "Не потрібно"}
                      onToggle={() => {
                        if (lamination.type === "Не потрібно") {
                          const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
                          const presetLamType = svc?.presets?.laminationType || "з глянцевим ламінуванням";
                          const presetLamThick = svc?.presets?.laminationThickness ? String(svc.presets.laminationThickness) : "";
                          setLamination({
                            ...lamination,
                            type: presetLamType,
                            material: presetLamType,
                            materialId: "",
                            size: presetLamThick,
                            typeUse: "А3",
                          });
                        } else {
                          setLamination({
                            type: "Не потрібно",
                            material: "",
                            materialId: "",
                            size: "",
                            typeUse: "А3",
                          });
                        }
                      }}
                      style={{ position: "relative", zIndex: 30 }}
                    >
                      <NewNoModalLamination
                        lamination={lamination}
                        setLamination={setLamination}
                        prices={prices}
                        size={size}
                        type="SheetCut"
                        isVishichka={true}
                        dropdownClassName={`v2-dropdown v2-theme-${theme}`}
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
                    </ScToggleSection>
                  )}
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

            {/* Розкладка: висічку завжди розкладають на аркуші матеріалу,
                тож видно, скільки виробів лягає й чи не завеликий розмір */}
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
                {fmt2(pricesThis?.price || 0)} <span className="v2-total-unit">грн</span>
              </div>
              <div className="v2-total-sub">
                <span>За 1 виріб</span>
                <span>{fmt2(pricesThis?.priceForItemWithExtras || 0)} грн</span>
              </div>
              <div className="v2-total-sub">
                <span>На аркуші</span>
                <span>{pricesThis?.sheetsPerUnit || 0} шт</span>
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
        />
      </div>
    </>
  );
};

export default Vishichka;
