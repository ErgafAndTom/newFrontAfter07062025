import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import { useModalState, useOrderUnitSave } from "./shared/hooks";
import { getStoredAppTheme, onAppThemeChange } from "../../utils/appTheme";

/* Та сама розмітка й той самий CSS, що в еталонного цифрового друку
   (NewSheetCutV2) — вузький варіант, без стрічки виробів. */
import "./NewSheetCutV2.css";

import PerepletPereplet from "./newnomodals/PerepletPereplet";

const fmt2 = (v) =>
  new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v));

const SIZE_FORMATS = [
  { name: "A5 (148 x 210 мм)", x: 148, y: 210 },
  { name: "A4 (210 x 297 мм)", x: 210, y: 297 },
  { name: "A3 (297 x 420 мм)", x: 297, y: 420 },
];

const PerepletMet = ({
  thisOrder,
  setThisOrder,
  setSelectedThings2,
  setShowPerepletMet,
  showPerepletMet,
  editingOrderUnit,
  setEditingOrderUnit,
}) => {
  const navigate = useNavigate();
  const { isEdit, options } = useModalState(editingOrderUnit, showPerepletMet);
  const skipInitialPricing = useRef(false);

  // ========== STATE ==========
  const [size, setSize] = useState({ x: 210, y: 297 });
  const [material, setMaterial] = useState({ type: "Не потрібно", thickness: "Тонкі", material: "", materialId: "", typeUse: null });
  const [pereplet, setPereplet] = useState({ type: "", thickness: "Тонкі", material: "", materialId: "", size: "<120", typeUse: "Брошурування до 120 аркушів" });
  const [color, setColor] = useState({ sides: "Не потрібно", one: "", two: "", allSidesColor: "CMYK" });
  const [lamination, setLamination] = useState({ type: "Не потрібно", material: "", materialId: "", size: "" });
  const [big, setBig] = useState("Не потрібно");
  const [cute, setCute] = useState("Не потрібно");
  const [cuteLocal, setCuteLocal] = useState({ leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" });
  const [holes, setHoles] = useState("Не потрібно");
  const [holesR, setHolesR] = useState("");
  const [count, setCount] = useState(1);
  const [prices] = useState([]);
  const [pricesThis, setPricesThis] = useState(null);
  const [error, setError] = useState(null);

  // тема стежить за глобальною темою застосунку (перемикач у Nav)
  const [theme, setTheme] = useState(getStoredAppTheme);
  useEffect(() => onAppThemeChange(setTheme), []);

  // Save hook
  const { saveOrderUnit } = useOrderUnitSave(
    thisOrder,
    setThisOrder,
    setSelectedThings2,
    () => setShowPerepletMet(false),
    setEditingOrderUnit
  );

  const handleClose = () => {
    if (setEditingOrderUnit) setEditingOrderUnit(null);
    setShowPerepletMet(false);
  };

  // ========== RESET / HYDRATE ==========
  const resetDefaults = useCallback(() => {
    setSize({ x: 210, y: 297 });
    setMaterial({ type: "Не потрібно", thickness: "Тонкі", material: "", materialId: "", typeUse: null });
    setPereplet({ type: "", thickness: "Тонкі", material: "", materialId: "", size: "<120", typeUse: "Брошурування до 120 аркушів" });
    setColor({ sides: "Не потрібно", one: "", two: "", allSidesColor: "CMYK" });
    setLamination({ type: "Не потрібно", material: "", materialId: "", size: "" });
    setBig("Не потрібно");
    setCute("Не потрібно");
    setCuteLocal({ leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" });
    setHoles("Не потрібно");
    setHolesR("");
    setCount(1);
    setError(null);
  }, []);

  useEffect(() => {
    if (!showPerepletMet) return;
    if (!isEdit) { resetDefaults(); return; }
    if (isEdit) skipInitialPricing.current = true;

    const opt = options || {};
    if (opt.size) setSize(opt.size);
    if (opt.material) setMaterial(opt.material);
    if (opt.pereplet) setPereplet(opt.pereplet);
    if (opt.color) setColor(opt.color);
    if (opt.lamination) setLamination(opt.lamination);
    if (opt.big !== undefined) setBig(opt.big);
    if (opt.cute !== undefined) setCute(opt.cute);
    if (opt.cuteLocal) setCuteLocal(opt.cuteLocal);
    if (opt.holes !== undefined) setHoles(opt.holes);
    if (opt.holesR !== undefined) setHolesR(opt.holesR);
    setCount(Number(opt.count ?? editingOrderUnit?.amount ?? 1) || 1);
    setError(null);
  }, [showPerepletMet, isEdit, options, editingOrderUnit, resetDefaults]);

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

    if (!showPerepletMet) return;
    axios
      .post("/calc/pricing", {
        type: "PerepletMet", size, material, color, lamination,
        big, cute, cuteLocal, holes, holesR, count, pereplet,
      })
      .then(({ data }) => { setPricesThis(data.prices); setError(null); })
      .catch((err) => {
        setError(err);
        if (err?.response?.status === 403) navigate("/login");
      });
  }, [showPerepletMet, size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count, pereplet, navigate]);

  // ========== SAVE ==========
  const handleSave = () => {
    if (!thisOrder?.id) return;
    const opt = options || {};

    saveOrderUnit({
      nameOrderUnit: opt?.nameOrderUnit || "Брошурування",
      type: "PerepletMet",
      size, material, color, lamination,
      big, cute, cuteLocal, holes, holesR, count, pereplet,
    }, editingOrderUnit, setError);
  };

  const handleSizeSelect = (format) => {
    setSize({ x: format.x, y: format.y });
  };


  // ========== PRICING DATA ==========
  const perepletLabel = pereplet.material
    ? `Прошивка ${pereplet.material}`
    : "Прошивка";
  const pricingLines = pricesThis
    ? [{ label: perepletLabel, perUnit: pricesThis.priceForOneOfPereplet || 0, count, total: pricesThis.price || 0 }]
    : [];

  // ========== RENDER ==========

  const totalPrice = pricesThis?.price || 0;

  const headSpec = [
    `${size.x}×${size.y} мм`,
    pereplet.material || null,
    pereplet.typeUse || null,
  ].filter(Boolean).join(" · ");

  if (!showPerepletMet) return null;

  return (
    <>
      <div className="v2-overlay" onClick={handleClose} />
      <div className={`v2-modal v2-modal-narrow v2-theme-${theme}`} onClick={(e) => e.stopPropagation()}>

        {/* ШАПКА */}
        <div className="v2-head">
          <div className="v2-head-main">
            <span className="v2-head-title">Брошурування</span>
            <div className="v2-head-spec">{headSpec}</div>
          </div>
          <button className="v2-close-btn" onClick={handleClose} title="Закрити" aria-label="Закрити">
            &times;
          </button>
        </div>

        {/* ТІЛО — виробів тут немає, тож і лівої стрічки теж */}
        <div className="v2-body">
          <div className="v2-left">

            {/* РОЗМІР */}
            <div className="v2-section">
              <span className="v2-label">Розмір у міліметрах</span>
              <div className="v2-sizes">
                {SIZE_FORMATS.map((f) => (
                  <button
                    key={f.name}
                    className={`v2-size${size.x === f.x && size.y === f.y ? " active" : ""}`}
                    onClick={() => handleSizeSelect(f)}
                  >
                    {f.name.split(" ")[0]}
                  </button>
                ))}
                <div className={`v2-size v2-size-custom${!SIZE_FORMATS.some((f) => size.x === f.x && size.y === f.y) ? " active" : ""}`}>
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

            {/* ПРУЖИНА ТА ОБСЯГ */}
            <div className="v2-section">
              <span className="v2-label">Пружина</span>
              <div className="v2-material-wrap">
                <PerepletPereplet
                  size={size}
                  pereplet={pereplet}
                  setPereplet={setPereplet}
                  prices={prices}
                  type="SheetCut"
                  dropdownClassName={`v2-dropdown v2-theme-${theme}`}
                  buttonsArr={["Брошурування до 120 аркушів", "Брошурування від 120 до 280 аркушів"]}
                  defaultt="А3 (297 х 420 мм)"
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
                  onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
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
                          {line.count} шт × {fmt2(line.perUnit)} ={" "}
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
            {error?.response?.data?.error || error?.message || "Помилка"}
          </div>
        )}
      </div>
    </>
  );
};

export default PerepletMet;
