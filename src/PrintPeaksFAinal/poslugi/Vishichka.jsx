// Vishichka.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "../../api/axiosInstance";
import NewNoModalSize from "./newnomodals/NewNoModalSizeColor";
import Materials2 from "./newnomodals/Materials2";
import { useNavigate } from "react-router-dom";
import VishichkaVibor from "./newnomodals/vishichka/VishichkaVibor";
import PlivkaMontajna from "./newnomodals/plivka/PlivkaMontajna";
import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import {columnTranslations as editingOrderUnit} from "../user/translations";

import "./Poslugy.css";

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
  const [services, setServices] = useState([
    "Наліпки", "Стікери", "Стікерпак", "Стікерсет", "Бірки",
    "Листівки", "Коробочки", "Фішки", "Цінник", "Меню",
  ]);

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

  if (!showVishichka) return null;

  return (
    <div className="sc-wrap">
      {/* ===== OVERLAY ===== */}
      <div className="bw-overlay" onClick={handleClose} />

      {/* ===== MODAL ===== */}
      <div className="sc-modal" style={{ minHeight: 'auto', height: 'auto' }} onClick={(e) => e.stopPropagation()}>

        {/* ===== BODY: left + right ===== */}
        <div className="sc-body">

          {/* ===== LEFT: scrollable options ===== */}
          <div className="sc-left-sections">

            {/* 1. Кількість + Розмір */}
            <div className="sc-section">
              <div className="sc-title">Кількість та розмір</div>
              <div className="sc-row d-flex flex-row align-items-center justify-content-between">
                <div className="d-flex flex-row" style={{ alignItems: "center", flexShrink: 0 }}>
                  <input
                    className="inputsArtem"
                    type="number"
                    value={count}
                    min={1}
                    onChange={(e) => handleChangeCount(e.target.value)}
                  />
                  <div className="inputsArtemx" style={{ border: "transparent" }}>шт</div>
                </div>
                <div style={{ marginLeft: "auto", paddingRight: 0 }}>
                  <NewNoModalSize
                    size={size}
                    setSize={setSize}
                    prices={prices}
                    type={"Vishichka"}
                    buttonsArr={[]}
                    color={color}
                    setColor={setColor}
                    count={count}
                    setCount={setCount}
                    defaultt={"А3 (297 х 420 мм)"}
                  />
                </div>
              </div>
            </div>

            {/* 2. Сторонність */}
            <div className="sc-section">
              <div className="sc-title">Сторонність</div>
              <div className="sc-sides">
                <button
                  className={`sc-side-btn sc-side-left ${color.sides === "односторонній" ? "sc-side-active" : ""}`}
                  onClick={() => setColor({ ...color, sides: "односторонній" })}
                >
                  <span className="sc-side-text">Односторонній</span>
                </button>
                <button
                  className={`sc-side-btn sc-side-right ${color.sides === "двосторонній" ? "sc-side-active" : ""}`}
                  onClick={() => setColor({ ...color, sides: "двосторонній" })}
                >
                  <span className="sc-side-text">Двосторонній</span>
                </button>
              </div>
            </div>

            {/* 3. Матеріал */}
            <div className="sc-section" style={{ position: "relative", zIndex: 60 }}>
              <div className="sc-title">Матеріал</div>
              <div className="sc-row">
                <Materials2
                  material={material}
                  setMaterial={setMaterial}
                  count={count}
                  setCount={setCount}
                  prices={prices}
                  size={size}
                  selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                  name={"Чорно-білий друк на монохромному принтері:"}
                  buttonsArr={["Тонкий", "Середній", "Цупкий", "Самоклеючі"]}
                  typeUse={null}
                  editingOrderUnit={editingOrderUnit}
                />
              </div>
            </div>

            {/* 3. Плотерна порізка */}
            <div className="sc-section" style={{ position: "relative", zIndex: 50 }}>
              <div className="sc-title">Плотерна порізка</div>
              <div className="sc-row d-flex flex-row">
                {[
                  { key: "SHEET_CUT", label: "Висічка" },
                  { key: "STICKERPACK", label: "Стікерпак" },
                  { key: "SINGLE_ITEMS", label: "Порізка" },
                ].map((btn) => (
                  <button
                    key={btn.key}
                    className={`buttonsArtem${vishichka.typeUse === VISHICHKA_MAP[btn.key].typeUse ? " buttonsArtemActive" : ""}`}
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
                    <div>{btn.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Монтажна плівка */}
            <div className="sc-section" style={{ position: "relative", zIndex: 40 }}>
              <div className="sc-title">Монтажна плівка</div>
              <div className="sc-row">
                <PlivkaMontajna
                  size={size}
                  plivkaMontajna={plivkaMontajna}
                  setPlivkaMontajna={setPlivkaMontajna}
                  vishichka={vishichka}
                  setVishichka={setVishichkaSafe}
                  prices={prices}
                  buttonsArr={[
                    VISHICHKA_MAP.SHEET_CUT.label,
                    VISHICHKA_MAP.STICKERPACK.label,
                    VISHICHKA_MAP.SINGLE_ITEMS.label,
                  ]}
                />
              </div>
            </div>

            {/* 5. Ламінування */}
            <div className="sc-section" style={{ position: "relative", zIndex: 30 }}>
              <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                <div className="sc-title" style={{ marginBottom: 0 }}>Ламінування</div>
                <label className="switch scale04ForButtonToggle" style={{ margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={lamination.type !== "Не потрібно"}
                    onChange={() => {
                      if (lamination.type === "Не потрібно") {
                        setLamination({ ...lamination, type: "з глянцевим ламінуванням", material: "з глянцевим ламінуванням", materialId: "", size: "", typeUse: "А3" });
                      } else {
                        setLamination({ type: "Не потрібно", material: "", materialId: "", size: "", typeUse: "А3" });
                      }
                    }}
                  />
                  <span className="switch-on"><span>ON</span></span>
                  <span className="slider" />
                  <span className="switch-off"><span>OFF</span></span>
                </label>
              </div>
              {lamination.type !== "Не потрібно" && (
                <div className="sc-row sc-lam-row">
                  <NewNoModalLamination
                    lamination={lamination}
                    setLamination={setLamination}
                    prices={prices}
                    size={size}
                    type={"SheetCut"}
                    isVishichka={true}
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
                      "з холодним матовим ламінуванням": "холодне матове",
                    }}
                  />
                </div>
              )}
            </div>

          </div>
          {/* END sc-left */}

          {/* ===== RIGHT: pricing ===== */}
          <div className="sc-right">
            {pricesThis && (
              <div className="sc-prices-grid">
                <div className="sc-price-label">Друк:</div>
                <div className="sc-price-line">
                  <span className="sc-val">{fmt2(pricesThis.priceDrukPerSheet)}</span>
                  <span className="sc-unit">грн</span>
                  <span className="sc-op">&times;</span>
                  <span className="sc-val">{pricesThis.sheetCount || 0}</span>
                  <span className="sc-unit">шт</span>
                  <span className="sc-op">=</span>
                  <span className="sc-total">{fmt2((pricesThis.priceDrukPerSheet || 0) * (pricesThis.sheetCount || 0))}</span>
                  <span className="sc-unit">грн</span>
                </div>

                <div className="sc-price-label">Матеріали:</div>
                <div className="sc-price-line">
                  <span className="sc-val">{fmt2(pricesThis.pricePaperPerSheet)}</span>
                  <span className="sc-unit">грн</span>
                  <span className="sc-op">&times;</span>
                  <span className="sc-val">{pricesThis.sheetCount || 0}</span>
                  <span className="sc-unit">шт</span>
                  <span className="sc-op">=</span>
                  <span className="sc-total">{fmt2((pricesThis.pricePaperPerSheet || 0) * (pricesThis.sheetCount || 0))}</span>
                  <span className="sc-unit">грн</span>
                </div>

                <div className="sc-price-label">Висічка:</div>
                <div className="sc-price-line">
                  <span className="sc-val">{fmt2(pricesThis.priceVishichkaPerSheet)}</span>
                  <span className="sc-unit">грн</span>
                  <span className="sc-op">&times;</span>
                  <span className="sc-val">{pricesThis.sheetCount || 0}</span>
                  <span className="sc-unit">шт</span>
                  <span className="sc-op">=</span>
                  <span className="sc-total">{fmt2(pricesThis.totalVishichkaPrice || 0)}</span>
                  <span className="sc-unit">грн</span>
                </div>

                <div className="sc-price-label">Монтажка + вибірка:</div>
                <div className="sc-price-line">
                  <span className="sc-val">{fmt2(pricesThis.pricePlivkaPerSheet)}</span>
                  <span className="sc-unit">грн</span>
                  <span className="sc-op">&times;</span>
                  <span className="sc-val">{pricesThis.sheetCount || 0}</span>
                  <span className="sc-unit">шт</span>
                  <span className="sc-op">=</span>
                  <span className="sc-total">{fmt2(pricesThis.totalPlivkaPrice || 0)}</span>
                  <span className="sc-unit">грн</span>
                </div>

                <div className="sc-price-label">Ламінація:</div>
                <div className="sc-price-line">
                  <span className="sc-val">{fmt2(pricesThis.priceLaminationPerSheet)}</span>
                  <span className="sc-unit">грн</span>
                  <span className="sc-op">&times;</span>
                  <span className="sc-val">{pricesThis.sheetCount || 0}</span>
                  <span className="sc-unit">шт</span>
                  <span className="sc-op">=</span>
                  <span className="sc-total">{fmt2((pricesThis.priceLaminationPerSheet || 0) * (pricesThis.sheetCount || 0))}</span>
                  <span className="sc-unit">грн</span>
                </div>

                <div className="sc-price-total">
                  {fmt2(pricesThis.price || 0)}
                  <span className="sc-unit">грн</span>
                </div>

                <div className="sc-price-unit">
                  За 1 виріб: {fmt2(pricesThis.priceForItemWithExtras || 0)} грн
                </div>

                <div className="sc-price-unit">
                  З одного аркуша: {pricesThis.sheetsPerUnit || 0} шт
                </div>

                <div className="sc-price-unit">
                  Аркушів: {pricesThis.sheetCount || 0} шт
                </div>
              </div>
            )}
          </div>
          {/* END sc-right */}

        </div>
        {/* END sc-body */}

        {/* ===== ERROR ===== */}
        {error && (
          <div className="sc-error">
            {error?.response?.data?.error || "Помилка"}
          </div>
        )}

        {/* ===== SERVICE TABS ===== */}
        <div className="sc-tabs">
          {services.map((service) => (
            <div
              key={service}
              style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
            >
              <button
                className={`btn ${selectedService === service ? "adminButtonAdd" : "adminButtonAdd-active"}`}
                style={{ fontSize: "clamp(0.7rem, 0.7vh, 2.5vh)", minWidth: "2vw", height: "2vh" }}
                onClick={() => setSelectedService(service)}
              >
                <span className="sc-tab-text">{service}</span>
              </button>

              {isEditServices && (
                <button
                  type="button"
                  onClick={() => {
                    if (services.length === 1) {
                      alert("Повинен бути хоча б один товар");
                      return;
                    }
                    if (!window.confirm(`Видалити "${service}"?`)) return;
                    setServices((prev) => prev.filter((s) => s !== service));
                    if (selectedService === service) {
                      setSelectedService(services[0] || "");
                    }
                  }}
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: "none",
                    background: "transparent",
                    color: "red",
                    lineHeight: "0px",
                    cursor: "pointer",
                  }}
                >
                  x
                </button>
              )}
            </div>
          ))}

          {isEditServices && (
            <button
              className="btn adminButtonAdd"
              style={{ fontSize: "clamp(0.7rem, 0.7vh, 2.5vh)", minWidth: "2vw", height: "2vh" }}
              onClick={() => {
                const name = prompt("Введіть назву товару");
                if (!name) return;
                const trimmed = name.trim();
                if (!trimmed) return;
                if (services.includes(trimmed)) {
                  alert("Така назва вже існує");
                  return;
                }
                setServices((prev) => [...prev, trimmed]);
                setSelectedService(trimmed);
              }}
            >
              ➕
            </button>
          )}

          <button
            className={`btn sc-settings-btn ${isEditServices ? "adminButtonAdd" : "adminButtonAdd-active"}`}
            style={{ fontSize: "clamp(0.7rem, 0.7vh, 2.5vh)", minWidth: "2vw", height: "2vh" }}
            onClick={() => setIsEditServices((v) => !v)}
            title={isEditServices ? "Завершити редагування" : "Налаштування назв товарів"}
          >
            {isEditServices ? "✔️" : "⚙️"}
          </button>
        </div>

        {/* ===== ACTION BUTTON ===== */}
        <div className="sc-action">
          <button className="adminButtonAdd" onClick={addNewOrderUnit}>
            {isEdit ? "Зберегти зміни" : "Додати до замовлення"}
          </button>
        </div>

      </div>
      {/* END sc-modal */}
    </div>
  );
};

export default Vishichka;
