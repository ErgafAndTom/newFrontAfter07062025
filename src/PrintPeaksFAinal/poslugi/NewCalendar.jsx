// NewCalendar.jsx — модалка-калькулятор календарів
// 5 типів: Кишеньковий | Будиночок | Настільний | Перекидний | Квартальний
// Спільне між типами — лише поле "кількість". Все інше — індивідуально.
//
// Бекенд: type="Calendar", subtype визначає підтип (pocket/house/desktop/wall/quarterly)

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";

/* Будівельні блоки PRINT V2 з тими самими пропсами, що були у Sc*-версій —
   тому всі п'ять підтипів календаря переїхали на стиль еталона без правок
   у їхніх рендерах. */
import ScSection from "./shared/V2Section";
import ScToggleSection from "./shared/V2ToggleSection";
import ScSides from "./shared/V2Sides";
import { getStoredAppTheme, onAppThemeChange } from "../../utils/appTheme";

import Materials2 from "./newnomodals/Materials2";
import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import NewNoModalCute from "./newnomodals/NewNoModalCute";
import NewNoModalBig from "./newnomodals/NewNoModalBig";
import NewNoModalLyuversy from "./newnomodals/NewNoModalLyuversy";
import NewNoModalProkleyka from "./newnomodals/NewNoModalProkleyka";

import "./NewSheetCutV2.css";

/* ============================================================
   ТИПИ КАЛЕНДАРІВ
   ============================================================ */
const CAL_TYPES = [
  { key: "pocket",    label: "Кишеньковий" },
  { key: "house",     label: "Будиночок" },
  { key: "desktop",   label: "Настільний" },
  { key: "wall",      label: "Перекидний" },
  { key: "quarterly", label: "Квартальний" },
];

/* ============================================================
   РОЗМІРИ ПО ТИПАХ
   ============================================================ */
const SIZE_PRESETS = {
  pocket: [
    { label: "100×70", x: 100, y: 70 },
    { label: "90×55",  x: 90,  y: 55 },
    { label: "100×150", x: 100, y: 150 },
  ],
  house: [
    { label: "EURO 100×200", x: 200, y: 100 },
    { label: "210×150", x: 210, y: 150 },
    { label: "150×100", x: 150, y: 100 },
  ],
  desktop: [
    { label: "EURO 100×200", x: 200, y: 100 },
    { label: "210×150", x: 210, y: 150 },
    { label: "A6 (105×148)", x: 148, y: 105 },
  ],
  wall: [
    { label: "A5", x: 148, y: 210 },
    { label: "A4", x: 210, y: 297 },
    { label: "A3", x: 297, y: 420 },
  ],
  quarterly: [
    { label: "Mini 297×220", x: 297, y: 220 },
    { label: "Midi 297×300", x: 297, y: 300 },
    { label: "Maxi 297×430", x: 297, y: 430 },
  ],
};

/* ============================================================
   ДЕФОЛТНІ КОЛЬОРИ ПРУЖИНИ
   ============================================================ */
const DEFAULT_SPRING_COLORS = ["біла", "металік", "чорна", "синя", "червона", "зелена"];

/* ============================================================
   DEFAULTS — для кожного типу
   ============================================================ */
const baseMaterial = {
  type: "Папір",
  thickness: "Цупкий",
  material: "",
  materialId: 0,
  typeUse: "Цупкий",
};
const baseColor = { sides: "двосторонній", one: "", two: "", allSidesColor: "CMYK" };
const baseLam = { type: "Не потрібно", material: "", materialId: "", size: "", typeUse: "" };
const baseCute = { leftTop: true, rightTop: true, rightBottom: true, leftBottom: true, radius: "6" };

const DEFAULTS = {
  count: 50,
  // POCKET
  pocket: {
    size: { x: 100, y: 70 },
    material: { ...baseMaterial },
    color: { ...baseColor },
    lamination: { ...baseLam },
    cute: "Не потрібно",
    cuteLocal: { ...baseCute },
  },
  // HOUSE — папір з бігуванням, без блоку
  house: {
    size: { x: 200, y: 100 },
    material: { ...baseMaterial, thickness: "Цупкий", typeUse: "Цупкий" },
    color: { ...baseColor, sides: "односторонній" },
    lamination: { ...baseLam },
    big: "4",        // 4 згини за замовчуванням
    prokleyka: "1",  // проклейка 1 шт за замовчуванням
  },
  // DESKTOP — основа (як будиночок) + блок з місяцями + пружина
  // Один розмір для обох частин.
  desktop: {
    size: { x: 200, y: 100 },
    baseMaterial: { ...baseMaterial, thickness: "Цупкий", typeUse: "Цупкий" },
    baseColor: { ...baseColor, sides: "односторонній" },
    baseLam: { ...baseLam },
    blockMaterial: { ...baseMaterial, thickness: "Середній", typeUse: "Середній" },
    blockColor: { ...baseColor, sides: "односторонній" },
    blockSheets: 12,
    pereplet: { type: "на пружину", color: "біла" },
  },
  // WALL — обкладинка + блок 12 + пружина. Один розмір для обкладинки і блоку.
  wall: {
    size: { x: 210, y: 297 },
    coverMaterial: { ...baseMaterial, thickness: "Цупкий", typeUse: "Цупкий" },
    coverColor: { ...baseColor, sides: "односторонній" },
    coverLam: { ...baseLam },
    blockMaterial: { ...baseMaterial, thickness: "Середній", typeUse: "Середній" },
    blockColor: { ...baseColor, sides: "односторонній" },
    blockSheets: 12,
    pereplet: { type: "на пружину", color: "біла" },
  },
  // QUARTERLY — шапка A4 + (0/1/3 рекл. поля) + сітка (стандартна або індивідуальна)
  // + кріплення (люверс|пружина) + опц. бігунок
  quarterly: {
    size: { x: 210, y: 297 }, // фіксовано A4
    headerMaterial: { ...baseMaterial, thickness: "Цупкий", typeUse: "Цупкий" },
    headerLam: { ...baseLam },
    adFieldsCount: 3,                // 0 (без), 1 або 3
    gridKind: "standard",            // standard | individual
    gridMaterial: { ...baseMaterial, thickness: "Тонкий", typeUse: "Тонкий" },
    gridSheetsPerCopy: 36,           // 12 місяців × 3 квартали
    perepletKind: "lyuvers",         // дефолт — люверс
    springColor: "біла",
    lyuversCount: "1",
    bigunok: true,                   // дефолт — увімкнений
  },
};

/* ============================================================
   helpers
   ============================================================ */
const fmt2 = (v) =>
  new Intl.NumberFormat("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Number(v) || 0);

const safeNum = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function parseOptionsJson(orderUnit) {
  if (!orderUnit?.optionsJson) return null;
  try { return JSON.parse(orderUnit.optionsJson); } catch { return null; }
}

/* ============================================================
   КОМПОНЕНТ
   ============================================================ */
const NewCalendar = ({
  thisOrder,
  setThisOrder,
  setSelectedThings2,
  showNewCalendar,
  setShowNewCalendar,
  editingOrderUnit,
  setEditingOrderUnit,
}) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  /* ====== STATE ====== */
  const [calType, setCalType] = useState("pocket");
  const [count, setCount] = useState(DEFAULTS.count);

  // тема стежить за глобальною темою застосунку (перемикач у Nav)
  const [theme, setTheme] = useState(getStoredAppTheme);
  useEffect(() => onAppThemeChange(setTheme), []);

  // POCKET
  const [pSize, setPSize] = useState(DEFAULTS.pocket.size);
  const [pMaterial, setPMaterial] = useState(DEFAULTS.pocket.material);
  const [pColor, setPColor] = useState(DEFAULTS.pocket.color);
  const [pLam, setPLam] = useState(DEFAULTS.pocket.lamination);
  const [pCute, setPCute] = useState(DEFAULTS.pocket.cute);
  const [pCuteLocal, setPCuteLocal] = useState(DEFAULTS.pocket.cuteLocal);

  // HOUSE
  const [hSize, setHSize] = useState(DEFAULTS.house.size);
  const [hMaterial, setHMaterial] = useState(DEFAULTS.house.material);
  const [hColor, setHColor] = useState(DEFAULTS.house.color);
  const [hLam, setHLam] = useState(DEFAULTS.house.lamination);
  const [hBig, setHBig] = useState(DEFAULTS.house.big);
  const [hProkleyka, setHProkleyka] = useState(DEFAULTS.house.prokleyka);

  // DESKTOP (один розмір для основи і блоку)
  const [dSize, setDSize] = useState(DEFAULTS.desktop.size);
  const [dBaseMaterial, setDBaseMaterial] = useState(DEFAULTS.desktop.baseMaterial);
  const [dBaseColor, setDBaseColor] = useState(DEFAULTS.desktop.baseColor);
  const [dBaseLam, setDBaseLam] = useState(DEFAULTS.desktop.baseLam);
  const [dBlockMaterial, setDBlockMaterial] = useState(DEFAULTS.desktop.blockMaterial);
  const [dBlockColor, setDBlockColor] = useState(DEFAULTS.desktop.blockColor);
  const [dBlockSheets, setDBlockSheets] = useState(DEFAULTS.desktop.blockSheets);
  const [dPereplet, setDPereplet] = useState(DEFAULTS.desktop.pereplet);

  // WALL (один розмір)
  const [wSize, setWSize] = useState(DEFAULTS.wall.size);
  const [wCoverMaterial, setWCoverMaterial] = useState(DEFAULTS.wall.coverMaterial);
  const [wCoverColor, setWCoverColor] = useState(DEFAULTS.wall.coverColor);
  const [wCoverLam, setWCoverLam] = useState(DEFAULTS.wall.coverLam);
  const [wBlockMaterial, setWBlockMaterial] = useState(DEFAULTS.wall.blockMaterial);
  const [wBlockColor, setWBlockColor] = useState(DEFAULTS.wall.blockColor);
  const [wBlockSheets, setWBlockSheets] = useState(DEFAULTS.wall.blockSheets);
  const [wPereplet, setWPereplet] = useState(DEFAULTS.wall.pereplet);

  // QUARTERLY
  const [qSize, setQSize] = useState(DEFAULTS.quarterly.size);
  const [qHeaderMaterial, setQHeaderMaterial] = useState(DEFAULTS.quarterly.headerMaterial);
  const [qHeaderLam, setQHeaderLam] = useState(DEFAULTS.quarterly.headerLam);
  const [qAdFields, setQAdFields] = useState(DEFAULTS.quarterly.adFieldsCount);
  const [qGridKind, setQGridKind] = useState(DEFAULTS.quarterly.gridKind);
  const [qGridMaterial, setQGridMaterial] = useState(DEFAULTS.quarterly.gridMaterial);
  const [qGridSheetsPerCopy, setQGridSheetsPerCopy] = useState(DEFAULTS.quarterly.gridSheetsPerCopy);
  const [qPerepletKind, setQPerepletKind] = useState(DEFAULTS.quarterly.perepletKind);
  const [qSpringColor, setQSpringColor] = useState(DEFAULTS.quarterly.springColor);
  const [qLyuversCount, setQLyuversCount] = useState(DEFAULTS.quarterly.lyuversCount);
  const [qBigunok, setQBigunok] = useState(DEFAULTS.quarterly.bigunok);

  /* Скільки аркушів друкувати на копію індивідуальної сітки — рахується
     від кількості рекламних полів: одне вікно = 12 місяців в один ряд,
     три вікна = 36 аркушів (12 міс. × 3 квартали). Ставимо при кожній
     зміні кількості полів; вручну число все одно можна перебити. */
  useEffect(() => {
    setQGridSheetsPerCopy(qAdFields === 3 ? 36 : 12);
  }, [qAdFields]);

  // Кольори пружини (розширюваний список)
  const [springColors, setSpringColors] = useState(DEFAULT_SPRING_COLORS);
  const [newSpringColor, setNewSpringColor] = useState("");

  // Pricing
  const [pricesThis, setPricesThis] = useState({ price: 0, lines: [] });
  const skipInitialPricing = useRef(false);

  const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.idKey);

  /* ====== INIT (NEW / EDIT) ====== */
  useEffect(() => {
    if (!showNewCalendar) return;
    if (error) setError(null);
    if (isEdit) skipInitialPricing.current = true;

    if (!isEdit) {
      // reset to defaults
      setCalType("pocket");
      setCount(DEFAULTS.count);
      // pocket
      setPSize(DEFAULTS.pocket.size); setPMaterial(DEFAULTS.pocket.material);
      setPColor(DEFAULTS.pocket.color); setPLam(DEFAULTS.pocket.lamination);
      setPCute(DEFAULTS.pocket.cute); setPCuteLocal(DEFAULTS.pocket.cuteLocal);
      // house
      setHSize(DEFAULTS.house.size); setHMaterial(DEFAULTS.house.material);
      setHColor(DEFAULTS.house.color); setHLam(DEFAULTS.house.lamination);
      setHBig(DEFAULTS.house.big); setHProkleyka(DEFAULTS.house.prokleyka);
      // desktop
      setDSize(DEFAULTS.desktop.size); setDBaseMaterial(DEFAULTS.desktop.baseMaterial);
      setDBaseColor(DEFAULTS.desktop.baseColor); setDBaseLam(DEFAULTS.desktop.baseLam);
      setDBlockMaterial(DEFAULTS.desktop.blockMaterial);
      setDBlockColor(DEFAULTS.desktop.blockColor); setDBlockSheets(DEFAULTS.desktop.blockSheets);
      setDPereplet(DEFAULTS.desktop.pereplet);
      // wall
      setWSize(DEFAULTS.wall.size); setWCoverMaterial(DEFAULTS.wall.coverMaterial);
      setWCoverColor(DEFAULTS.wall.coverColor); setWCoverLam(DEFAULTS.wall.coverLam);
      setWBlockMaterial(DEFAULTS.wall.blockMaterial);
      setWBlockColor(DEFAULTS.wall.blockColor); setWBlockSheets(DEFAULTS.wall.blockSheets);
      setWPereplet(DEFAULTS.wall.pereplet);
      // quarterly
      setQSize(DEFAULTS.quarterly.size);
      setQHeaderMaterial(DEFAULTS.quarterly.headerMaterial);
      setQHeaderLam(DEFAULTS.quarterly.headerLam); setQAdFields(DEFAULTS.quarterly.adFieldsCount);
      setQGridKind(DEFAULTS.quarterly.gridKind); setQGridMaterial(DEFAULTS.quarterly.gridMaterial);
      setQGridSheetsPerCopy(DEFAULTS.quarterly.gridSheetsPerCopy);
      setQPerepletKind(DEFAULTS.quarterly.perepletKind); setQSpringColor(DEFAULTS.quarterly.springColor);
      setQLyuversCount(DEFAULTS.quarterly.lyuversCount); setQBigunok(DEFAULTS.quarterly.bigunok);
      return;
    }

    // EDIT
    const opt = parseOptionsJson(editingOrderUnit) || {};
    setCalType(opt.calType || "pocket");
    setCount(safeNum(opt.count, safeNum(editingOrderUnit?.amount, DEFAULTS.count)));

    if (opt.pocket) {
      setPSize(opt.pocket.size || DEFAULTS.pocket.size);
      setPMaterial(opt.pocket.material || DEFAULTS.pocket.material);
      setPColor(opt.pocket.color || DEFAULTS.pocket.color);
      setPLam(opt.pocket.lamination || DEFAULTS.pocket.lamination);
      setPCute(opt.pocket.cute ?? DEFAULTS.pocket.cute);
      setPCuteLocal(opt.pocket.cuteLocal || DEFAULTS.pocket.cuteLocal);
    }
    if (opt.house) {
      setHSize(opt.house.size || DEFAULTS.house.size);
      setHMaterial(opt.house.material || DEFAULTS.house.material);
      setHColor(opt.house.color || DEFAULTS.house.color);
      setHLam(opt.house.lamination || DEFAULTS.house.lamination);
      setHBig(opt.house.big ?? DEFAULTS.house.big);
      setHProkleyka(opt.house.prokleyka ?? DEFAULTS.house.prokleyka);
    }
    if (opt.desktop) {
      setDSize(opt.desktop.size || DEFAULTS.desktop.size);
      setDBaseMaterial(opt.desktop.baseMaterial || DEFAULTS.desktop.baseMaterial);
      setDBaseColor(opt.desktop.baseColor || DEFAULTS.desktop.baseColor);
      setDBaseLam(opt.desktop.baseLam || DEFAULTS.desktop.baseLam);
      setDBlockMaterial(opt.desktop.blockMaterial || DEFAULTS.desktop.blockMaterial);
      setDBlockColor(opt.desktop.blockColor || DEFAULTS.desktop.blockColor);
      setDBlockSheets(safeNum(opt.desktop.blockSheets, DEFAULTS.desktop.blockSheets));
      setDPereplet(opt.desktop.pereplet || DEFAULTS.desktop.pereplet);
    }
    if (opt.wall) {
      setWSize(opt.wall.size || opt.wall.coverSize || DEFAULTS.wall.size);
      setWCoverMaterial(opt.wall.coverMaterial || DEFAULTS.wall.coverMaterial);
      setWCoverColor(opt.wall.coverColor || DEFAULTS.wall.coverColor);
      setWCoverLam(opt.wall.coverLam || DEFAULTS.wall.coverLam);
      setWBlockMaterial(opt.wall.blockMaterial || DEFAULTS.wall.blockMaterial);
      setWBlockColor(opt.wall.blockColor || DEFAULTS.wall.blockColor);
      setWBlockSheets(safeNum(opt.wall.blockSheets, DEFAULTS.wall.blockSheets));
      setWPereplet(opt.wall.pereplet || DEFAULTS.wall.pereplet);
    }
    if (opt.quarterly) {
      setQSize(opt.quarterly.size || opt.quarterly.headerSize || DEFAULTS.quarterly.size);
      setQHeaderMaterial(opt.quarterly.headerMaterial || DEFAULTS.quarterly.headerMaterial);
      setQHeaderLam(opt.quarterly.headerLam || DEFAULTS.quarterly.headerLam);
      setQAdFields(safeNum(opt.quarterly.adFieldsCount, DEFAULTS.quarterly.adFieldsCount));
      setQGridKind(opt.quarterly.gridKind || DEFAULTS.quarterly.gridKind);
      setQGridMaterial(opt.quarterly.gridMaterial || DEFAULTS.quarterly.gridMaterial);
      setQGridSheetsPerCopy(safeNum(opt.quarterly.gridSheetsPerCopy, DEFAULTS.quarterly.gridSheetsPerCopy));
      setQPerepletKind(opt.quarterly.perepletKind || DEFAULTS.quarterly.perepletKind);
      setQSpringColor(opt.quarterly.springColor || DEFAULTS.quarterly.springColor);
      setQLyuversCount(opt.quarterly.lyuversCount ?? DEFAULTS.quarterly.lyuversCount);
      setQBigunok(Boolean(opt.quarterly.bigunok));
    }
    if (Array.isArray(opt.springColors) && opt.springColors.length) {
      setSpringColors(opt.springColors);
    }
  }, [showNewCalendar, isEdit, editingOrderUnit?.id, editingOrderUnit?.idKey, editingOrderUnit?.optionsJson]);

  /* ====== ЗБИРАЄМО payload для бекенду / збереження ====== */
  const buildToCalc = useCallback(() => {
    const payload = {
      type: "Calendar",
      calType,
      count,
      pocket: {
        size: pSize, material: pMaterial, color: pColor,
        lamination: pLam, cute: pCute, cuteLocal: pCuteLocal,
      },
      house: {
        size: hSize, material: hMaterial, color: hColor,
        lamination: hLam, big: hBig, prokleyka: hProkleyka,
      },
      desktop: {
        size: dSize, baseMaterial: dBaseMaterial, baseColor: dBaseColor, baseLam: dBaseLam,
        blockMaterial: dBlockMaterial, blockColor: dBlockColor,
        blockSheets: dBlockSheets, pereplet: dPereplet,
      },
      wall: {
        size: wSize, coverMaterial: wCoverMaterial, coverColor: wCoverColor, coverLam: wCoverLam,
        blockMaterial: wBlockMaterial, blockColor: wBlockColor,
        blockSheets: wBlockSheets, pereplet: wPereplet,
      },
      quarterly: {
        size: qSize,
        headerMaterial: qHeaderMaterial, headerLam: qHeaderLam,
        adFieldsCount: qAdFields,
        gridKind: qGridKind, gridMaterial: qGridMaterial, gridSheetsPerCopy: qGridSheetsPerCopy,
        perepletKind: qPerepletKind, springColor: qSpringColor,
        lyuversCount: qLyuversCount, bigunok: qBigunok,
      },
      springColors,
    };
    return payload;
  }, [
    calType, count,
    pSize, pMaterial, pColor, pLam, pCute, pCuteLocal,
    hSize, hMaterial, hColor, hLam, hBig,
    hProkleyka,
    dSize, dBaseMaterial, dBaseColor, dBaseLam, dBlockMaterial, dBlockColor, dBlockSheets, dPereplet,
    wSize, wCoverMaterial, wCoverColor, wCoverLam, wBlockMaterial, wBlockColor, wBlockSheets, wPereplet,
    qSize, qHeaderMaterial, qHeaderLam, qAdFields,
    qGridKind, qGridMaterial, qGridSheetsPerCopy, qPerepletKind, qSpringColor, qLyuversCount, qBigunok,
    springColors,
  ]);

  /* ====== PRICING ====== */
  useEffect(() => {
    if (!showNewCalendar) return;
    if (skipInitialPricing.current) {
      skipInitialPricing.current = false;
      if (editingOrderUnit) {
        const stored = parseFloat(editingOrderUnit.priceForAllThis) || 0;
        setPricesThis({ price: stored, lines: [] });
      }
      return;
    }
    const dataToSend = buildToCalc();
    axios.post("/calc/pricing", dataToSend)
      .then(({ data }) => {
        const p = data?.prices ?? {};
        setPricesThis({
          price: Number(p.price) || 0,
          lines: Array.isArray(p.lines) ? p.lines : [],
          ...p,
        });
      })
      .catch((err) => {
        if (err.response?.status === 403) navigate("/login");
        console.log("[Calendar pricing]", err.message);
      });
  }, [buildToCalc, showNewCalendar, navigate, editingOrderUnit]);

  /* ====== SAVE ====== */
  const addNewOrderUnit = () => {
    const calLabel = CAL_TYPES.find((t) => t.key === calType)?.label || "календар";
    const dataToSend = {
      orderId: thisOrder.id,
      toCalc: {
        ...buildToCalc(),
        nameOrderUnit: `${calLabel.toLowerCase()} календар `,
      },
    };
    axios.post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then((response) => {
        setThisOrder(response.data);
        setSelectedThings2(response.data.OrderUnits);
        setShowNewCalendar(false);
      })
      .catch((err) => {
        setError(err);
        if (err.response?.status === 403) navigate("/login");
      });
  };

  const handleClose = () => setShowNewCalendar(false);

  const handleAddSpringColor = () => {
    const trimmed = newSpringColor.trim();
    if (!trimmed || springColors.includes(trimmed)) { setNewSpringColor(""); return; }
    setSpringColors((prev) => [...prev, trimmed]);
    setNewSpringColor("");
  };

  /* ============================================================
     RENDER — РОЗМІРИ
     ============================================================ */
  const renderSizeRow = (presets, size, setSize) => (
    <div className="v2-section">
      <span className="v2-label">Розмір у міліметрах</span>
      <div className="v2-sizes">
        {presets.map((f) => (
          <button
            key={f.label}
            className={`v2-size${size.x === f.x && size.y === f.y ? " active" : ""}`}
            onClick={() => setSize({ x: f.x, y: f.y })}
          >
            {f.label}
          </button>
        ))}
        <div className={`v2-size v2-size-custom${!presets.some((f) => size.x === f.x && size.y === f.y) ? " active" : ""}`}>
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
  );


  /* ============================================================
     БЛОК "ПРУЖИНА" з кольорами (спільний для desktop/wall/quarterly)
     ============================================================ */
  const handleRemoveSpringColor = (colorToRemove, selectedColor, onSelect) => {
    if (springColors.length <= 1) return; // не дозволяємо видалити останній
    const next = springColors.filter((c) => c !== colorToRemove);
    setSpringColors(next);
    if (selectedColor === colorToRemove) {
      onSelect(next[0]);
    }
  };

  const renderSpringColors = (selectedColor, onSelect) => (
    <div className="d-flex" style={{ flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
      {springColors.map((c) => {
        const isActive = selectedColor === c;
        return (
          <div key={c} style={{ position: "relative", display: "inline-block" }}>
            <button
              className={`buttonsArtem${isActive ? " buttonsArtemActive" : ""}`}
              onClick={() => onSelect(c)}
              style={{ minWidth: "5rem", paddingRight: "1.5rem" }}
            >
              <div>{c}</div>
            </button>
            {springColors.length > 1 && (
              <span
                onClick={(e) => { e.stopPropagation(); handleRemoveSpringColor(c, selectedColor, onSelect); }}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "0.35rem",
                  transform: "translateY(-50%)",
                  width: "1rem",
                  height: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: isActive ? "#fff" : "var(--adminred, #ee3c23)",
                  fontSize: "1rem",
                  lineHeight: 1,
                  fontWeight: 700,
                  userSelect: "none",
                }}
                title={`видалити "${c}"`}
              >
                ×
              </span>
            )}
          </div>
        );
      })}
      <input
        className="inputsArtem"
        placeholder="новий колір"
        value={newSpringColor}
        onChange={(e) => setNewSpringColor(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleAddSpringColor(); }}
        style={{ width: "8rem" }}
      />
      <button className="buttonsArtem" onClick={handleAddSpringColor}>
        <div>+ додати</div>
      </button>
    </div>
  );

  /* ============================================================
     RENDER — POCKET
     ============================================================ */
  const renderPocket = () => (
    <>
      {renderSizeRow(SIZE_PRESETS.pocket, pSize, setPSize)}

      <ScSides
        value={pColor.sides}
        onChange={(sides) => setPColor({ ...pColor, sides })}
        options={[
          { value: "односторонній", label: "Односторонній" },
          { value: "двосторонній", label: "Двосторонній" },
        ]}
      />

      <ScSection style={{ position: "relative", zIndex: 30 }}>
        <Materials2
          material={pMaterial}
          setMaterial={setPMaterial}
          size={pSize}
          name={"Кольоровий друк:"}
          buttonsArr={["Тонкий", "Середній", "Цупкий"]}
          typeOfPosluga={"NewCalendarPocket"}
          autoSelectFirst={false}
          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
          preferredMaterialName={"Крейдований папір 315x445 350gsm"}
        />
      </ScSection>

      <ScToggleSection
        label="Ламінування"
        title="Ламінування"
        isOn={pLam.type !== "Не потрібно"}
        onToggle={() => {
          if (pLam.type === "Не потрібно") {
            setPLam({ type: "з глянцевим ламінуванням", material: "з глянцевим ламінуванням", materialId: "", size: "30", typeUse: "А4" });
          } else {
            setPLam({ type: "Не потрібно", material: "", materialId: "", size: "", typeUse: "" });
          }
        }}
      >
        <NewNoModalLamination
          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
          lamination={pLam}
          setLamination={setPLam}
          size={pSize}
          type={"Calendar"}
          paperTypeUse={pMaterial.typeUse}
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
      </ScToggleSection>

      <ScToggleSection
        label="Скруглення"
        title="Скруглення кутів"
        isOn={pCute !== "Не потрібно"}
        onToggle={() => {
          if (pCute === "Не потрібно") {
            setPCute(4);
            setPCuteLocal({ leftTop: true, rightTop: true, rightBottom: true, leftBottom: true, radius: "6" });
          } else {
            setPCute("Не потрібно");
            setPCuteLocal({ leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" });
          }
        }}
        style={{ position: "relative", zIndex: 20 }}
      >
        <NewNoModalCute
          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
          cute={pCute} setCute={setPCute}
          cuteLocal={pCuteLocal} setCuteLocal={setPCuteLocal}
          type={"Calendar"}
          buttonsArr={[]}
          selectArr={["3", "6", "8", "10", "13"]}
        />
      </ScToggleSection>
    </>
  );

  /* ============================================================
     RENDER — HOUSE (Будиночок)
     ============================================================ */
  const renderHouse = () => (
    <>
      {renderSizeRow(SIZE_PRESETS.house, hSize, setHSize)}

      <ScSides
        value={hColor.sides}
        onChange={(sides) => setHColor({ ...hColor, sides })}
        options={[
          { value: "односторонній", label: "Односторонній" },
          { value: "двосторонній", label: "Двосторонній" },
        ]}
      />

      <ScSection style={{ position: "relative", zIndex: 30 }}>
        <Materials2
          material={hMaterial}
          setMaterial={setHMaterial}
          size={hSize}
          name={"Картон основи:"}
          buttonsArr={["Цупкий"]}
          typeOfPosluga={"NewCalendarHouse"}
          autoSelectFirst={false}
          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
          preferredMaterialName={"Крейдований папір 315x445 350gsm"}
        />
      </ScSection>

      <ScToggleSection
        label="Ламінування"
        title="Ламінування основи"
        isOn={hLam.type !== "Не потрібно"}
        onToggle={() => {
          if (hLam.type === "Не потрібно") {
            setHLam({ type: "з глянцевим ламінуванням", material: "з глянцевим ламінуванням", materialId: "", size: "30", typeUse: "А4" });
          } else {
            setHLam({ type: "Не потрібно", material: "", materialId: "", size: "", typeUse: "" });
          }
        }}
      >
        <NewNoModalLamination
          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
          lamination={hLam} setLamination={setHLam}
          size={hSize} type={"Calendar"}
          paperTypeUse={hMaterial.typeUse}
          buttonsArr={["з глянцевим ламінуванням", "з матовим ламінуванням"]}
          selectArr={["30", "70", "80", "100", "125", "250"]}
          labelMap={{ "з глянцевим ламінуванням": "глянцеве", "з матовим ламінуванням": "матове" }}
        />
      </ScToggleSection>

      <ScToggleSection
        label="Бігування"
        title="Лінії бігування"
        isOn={hBig !== "Не потрібно"}
        onToggle={() => setHBig(hBig === "Не потрібно" ? "4" : "Не потрібно")}
        style={{ position: "relative", zIndex: 20 }}
      >
        <NewNoModalBig
          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
          big={hBig} setBig={setHBig}
          type={"Calendar"} buttonsArr={[]}
          selectArr={["", "1", "2", "3", "4", "5", "6"]}
        />
      </ScToggleSection>

      <ScToggleSection
        label="Проклейка"
        title="Проклейка"
        isOn={hProkleyka !== "Не потрібно"}
        onToggle={() => setHProkleyka(hProkleyka === "Не потрібно" ? "1" : "Не потрібно")}
        style={{ position: "relative", zIndex: 15 }}
      >
        <NewNoModalProkleyka
          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
          prokleyka={hProkleyka} setProkleyka={setHProkleyka}
          type={"Calendar"} buttonsArr={[]}
          selectArr={["", "1", "2", "3"]}
        />
      </ScToggleSection>
    </>
  );

  /* ============================================================
     RENDER — DESKTOP (Настільний)
     ============================================================ */
  const renderDesktop = () => (
    <>
      {/* Спільний розмір для основи і блоку */}
      {renderSizeRow(SIZE_PRESETS.desktop, dSize, setDSize)}

      <div className="sc-title">Основа (як будиночок)</div>

      <ScSides
        value={dBaseColor.sides}
        onChange={(sides) => setDBaseColor({ ...dBaseColor, sides })}
        options={[
          { value: "односторонній", label: "Односторонній" },
          { value: "двосторонній", label: "Двосторонній" },
        ]}
      />

      <ScSection style={{ position: "relative", zIndex: 50 }}>
        <Materials2
          material={dBaseMaterial} setMaterial={setDBaseMaterial}
          size={dSize}
          name={"Картон основи:"}
          buttonsArr={["Цупкий"]}
          typeOfPosluga={"NewCalendarDesktopBase"}
          autoSelectFirst={false}
          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
          preferredMaterialName={"Крейдований папір 315x445 350gsm"}
        />
      </ScSection>

      <ScToggleSection
        label="Ламінування основи"
        title="Ламінування основи"
        isOn={dBaseLam.type !== "Не потрібно"}
        onToggle={() => {
          if (dBaseLam.type === "Не потрібно") {
            setDBaseLam({ type: "з глянцевим ламінуванням", material: "з глянцевим ламінуванням", materialId: "", size: "30", typeUse: "А4" });
          } else {
            setDBaseLam({ type: "Не потрібно", material: "", materialId: "", size: "", typeUse: "" });
          }
        }}
      >
        <NewNoModalLamination
          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
          lamination={dBaseLam} setLamination={setDBaseLam}
          size={dSize} type={"Calendar"}
          paperTypeUse={dBaseMaterial.typeUse}
          buttonsArr={["з глянцевим ламінуванням", "з матовим ламінуванням"]}
          selectArr={["30", "70", "80", "100", "125", "250"]}
          labelMap={{ "з глянцевим ламінуванням": "глянцеве", "з матовим ламінуванням": "матове" }}
        />
      </ScToggleSection>

      <div className="sc-title">Блок з місяцями</div>

      <ScSection>
        <div className="d-flex align-items-center" style={{ gap: "0.6rem" }}>
          <span className="sc-title">Кількість аркушів:</span>
          <input
            className="inputsArtem"
            type="number"
            min={1}
            value={dBlockSheets}
            onChange={(e) => setDBlockSheets(Number(e.target.value) || 1)}
            style={{ width: "5rem", textAlign: "center" }}
          />
          <span style={{ color: "var(--admingrey)" }}>(зазвичай 12)</span>
        </div>
      </ScSection>

      <ScSides
        value={dBlockColor.sides}
        onChange={(sides) => setDBlockColor({ ...dBlockColor, sides })}
        options={[
          { value: "односторонній", label: "Односторонній" },
          { value: "двосторонній", label: "Двосторонній" },
        ]}
      />

      <ScSection style={{ position: "relative", zIndex: 30 }}>
        <Materials2
          material={dBlockMaterial} setMaterial={setDBlockMaterial}
          size={dSize}
          name={"Папір блоку:"}
          buttonsArr={["Офісний", "Тонкий", "Середній"]}
          typeOfPosluga={"NewCalendarDesktopBlock"}
          autoSelectFirst={false}
          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
          preferredMaterialName={"Крейдований папір 315x445 170gsm"}
        />
      </ScSection>

      <ScSection>
        <div className="sc-title">Прошивка пружиною (колір):</div>
        {renderSpringColors(dPereplet.color, (c) => setDPereplet({ ...dPereplet, color: c }))}
      </ScSection>
    </>
  );

  /* ============================================================
     RENDER — WALL (Перекидний)
     ============================================================ */
  const renderWall = () => (
    <>
      {/* Спільний розмір для обкладинки і блоку */}
      {renderSizeRow(SIZE_PRESETS.wall, wSize, setWSize)}

      <div className="sc-title">Обкладинка</div>

      <ScSides
        value={wCoverColor.sides}
        onChange={(sides) => setWCoverColor({ ...wCoverColor, sides })}
        options={[
          { value: "односторонній", label: "Односторонній" },
          { value: "двосторонній", label: "Двосторонній" },
        ]}
      />

      <ScSection style={{ position: "relative", zIndex: 50 }}>
        <Materials2
          material={wCoverMaterial} setMaterial={setWCoverMaterial}
          size={wSize}
          name={"Картон обкладинки:"}
          buttonsArr={["Цупкий"]}
          typeOfPosluga={"NewCalendarWallCover"}
          autoSelectFirst={false}
          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
          preferredMaterialName={"Крейдований папір 315x445 350gsm"}
        />
      </ScSection>

      <ScToggleSection
        label="Ламінування обкладинки"
        title="Ламінування обкладинки"
        isOn={wCoverLam.type !== "Не потрібно"}
        onToggle={() => {
          if (wCoverLam.type === "Не потрібно") {
            setWCoverLam({ type: "з глянцевим ламінуванням", material: "з глянцевим ламінуванням", materialId: "", size: "30", typeUse: "А3" });
          } else {
            setWCoverLam({ type: "Не потрібно", material: "", materialId: "", size: "", typeUse: "" });
          }
        }}
      >
        <NewNoModalLamination
          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
          lamination={wCoverLam} setLamination={setWCoverLam}
          size={wSize} type={"Calendar"}
          paperTypeUse={wCoverMaterial.typeUse}
          buttonsArr={["з глянцевим ламінуванням", "з матовим ламінуванням"]}
          selectArr={["30", "70", "80", "100", "125", "250"]}
          labelMap={{ "з глянцевим ламінуванням": "глянцеве", "з матовим ламінуванням": "матове" }}
        />
      </ScToggleSection>

      <div className="sc-title">Блок з місяцями</div>

      <ScSection>
        <div className="d-flex align-items-center" style={{ gap: "0.6rem" }}>
          <span className="sc-title">Кількість аркушів:</span>
          <input
            className="inputsArtem"
            type="number"
            min={1}
            value={wBlockSheets}
            onChange={(e) => setWBlockSheets(Number(e.target.value) || 1)}
            style={{ width: "5rem", textAlign: "center" }}
          />
          <span style={{ color: "var(--admingrey)" }}>(стандарт 12)</span>
        </div>
      </ScSection>

      <ScSides
        value={wBlockColor.sides}
        onChange={(sides) => setWBlockColor({ ...wBlockColor, sides })}
        options={[
          { value: "односторонній", label: "Односторонній" },
          { value: "двосторонній", label: "Двосторонній" },
        ]}
      />

      <ScSection style={{ position: "relative", zIndex: 30 }}>
        <Materials2
          material={wBlockMaterial} setMaterial={setWBlockMaterial}
          size={wSize}
          name={"Папір блоку:"}
          buttonsArr={["Тонкий", "Середній", "Цупкий"]}
          typeOfPosluga={"NewCalendarWallBlock"}
          autoSelectFirst={false}
          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
          preferredMaterialName={"Крейдований папір 315x445 170gsm"}
        />
      </ScSection>

      <ScSection>
        <div className="sc-title">Прошивка пружиною (колір):</div>
        {renderSpringColors(wPereplet.color, (c) => setWPereplet({ ...wPereplet, color: c }))}
      </ScSection>
    </>
  );

  /* ============================================================
     RENDER — QUARTERLY (Квартальний)
     ============================================================ */
  const renderQuarterly = () => (
    <>
      {/* Розмір — фіксований A4 */}
      <div className="sc-section sc-section-card">
        <div className="sc-sides">
          <button
            className="sc-side-btn sc-side-active"
            onClick={() => setQSize({ x: 210, y: 297 })}
          >
            <span className="sc-side-text">A4 (210×297)</span>
          </button>
        </div>
      </div>

      <div className="sc-title">Шапка</div>

      <ScSection style={{ position: "relative", zIndex: 50 }}>
        <Materials2
          material={qHeaderMaterial} setMaterial={setQHeaderMaterial}
          size={qSize}
          name={"Картон шапки:"}
          buttonsArr={[]}
          typeOfPosluga={"NewCalendarQuarterlyHeader"}
          autoSelectFirst={false}
          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
          preferredMaterialName={"Крейдований папір 315x445 350gsm"}
        />
      </ScSection>

      <ScToggleSection
        label="Ламінування шапки"
        title="Ламінування шапки"
        isOn={qHeaderLam.type !== "Не потрібно"}
        onToggle={() => {
          if (qHeaderLam.type === "Не потрібно") {
            setQHeaderLam({ type: "з глянцевим ламінуванням", material: "з глянцевим ламінуванням", materialId: "", size: "30", typeUse: "А3" });
          } else {
            setQHeaderLam({ type: "Не потрібно", material: "", materialId: "", size: "", typeUse: "" });
          }
        }}
      >
        <NewNoModalLamination
          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
          lamination={qHeaderLam} setLamination={setQHeaderLam}
          size={qSize} type={"Calendar"}
          paperTypeUse={qHeaderMaterial.typeUse}
          buttonsArr={["з глянцевим ламінуванням", "з матовим ламінуванням"]}
          selectArr={["30", "70", "80", "100", "125", "250"]}
          labelMap={{ "з глянцевим ламінуванням": "глянцеве", "з матовим ламінуванням": "матове" }}
        />
      </ScToggleSection>

      <ScSection>
        <div className="sc-title">Кількість рекламних полів:</div>
        <div className="sc-sides" style={{ gap: "0.4rem" }}>
          {[
            { v: 0, label: "Без поля" },
            { v: 1, label: "1 поле" },
            { v: 3, label: "3 поля" },
          ].map(({ v, label }) => (
            <button
              key={v}
              className={`sc-side-btn${qAdFields === v ? " sc-side-active" : ""}`}
              onClick={() => setQAdFields(v)}
              style={{ flex: 0, minWidth: "6rem" }}
            >
              <span className="sc-side-text">{label}</span>
            </button>
          ))}
        </div>
      </ScSection>

      <div className="sc-title">Сітка</div>
      <div className="sc-section sc-section-card">
        <div className="sc-sides">
          <button
            className={`sc-side-btn${qGridKind === "standard" ? " sc-side-active" : ""}`}
            onClick={() => setQGridKind("standard")}
          >
            <span className="sc-side-text">Стандартна</span>
          </button>
          <button
            className={`sc-side-btn${qGridKind === "individual" ? " sc-side-active" : ""}`}
            onClick={() => setQGridKind("individual")}
          >
            <span className="sc-side-text">Індивідуальна</span>
          </button>
        </div>
      </div>

      {qGridKind === "individual" && (
        <>
          <ScSection style={{ position: "relative", zIndex: 30 }}>
            <Materials2
              material={qGridMaterial} setMaterial={setQGridMaterial}
              size={qSize}
              name={"Папір сітки:"}
              buttonsArr={["Тонкий", "Середній", "Цупкий"]}
              typeOfPosluga={"NewCalendarQuarterlyGrid"}
              autoSelectFirst={false}
              dropdownClassName={`v2-dropdown v2-theme-${theme}`}
              preferredMaterialName={"Крейдований папір 315x445 130gsm"}
            />
          </ScSection>
          <ScSection>
            <div className="d-flex align-items-center" style={{ gap: "0.6rem" }}>
              <span className="sc-title">Аркушів на копію:</span>
              <input
                className="inputsArtem"
                type="number"
                min={1}
                value={qGridSheetsPerCopy}
                onChange={(e) => setQGridSheetsPerCopy(Number(e.target.value) || 1)}
                style={{ width: "5rem", textAlign: "center" }}
              />
              <span style={{ color: "var(--admingrey)" }}>
                {qAdFields === 3 ? "(36 = 12 міс. × 3 квартали)" : "(12 = 12 міс. в одне вікно)"}
              </span>
            </div>
          </ScSection>
        </>
      )}

      <div className="sc-title">Кріплення</div>
      <div className="sc-section sc-section-card">
        <div className="sc-sides">
          <button
            className={`sc-side-btn${qPerepletKind === "lyuvers" ? " sc-side-active" : ""}`}
            onClick={() => setQPerepletKind("lyuvers")}
          >
            <span className="sc-side-text">Люверс</span>
          </button>
          <button
            className={`sc-side-btn${qPerepletKind === "spring" ? " sc-side-active" : ""}`}
            onClick={() => setQPerepletKind("spring")}
          >
            <span className="sc-side-text">Пружина</span>
          </button>
        </div>
      </div>

      {qPerepletKind === "spring" && (
        <ScSection>
          <div className="sc-title">Колір пружини:</div>
          {renderSpringColors(qSpringColor, setQSpringColor)}
        </ScSection>
      )}

      {qPerepletKind === "lyuvers" && (
        <ScSection>
          <NewNoModalLyuversy
          dropdownClassName={`v2-dropdown v2-theme-${theme}`}
            lyuversy={qLyuversCount} setLyuversy={setQLyuversCount}
            type={"Calendar"} buttonsArr={[]}
            selectArr={["", "1", "2", "3", "4"]}
          />
        </ScSection>
      )}

      <ScToggleSection
        label="Бігунок"
        title="Бігунок (індикатор дати)"
        isOn={qBigunok}
        onToggle={() => setQBigunok((v) => !v)}
      >
        <span style={{ color: "var(--admingrey)" }}>включений</span>
      </ScToggleSection>
    </>
  );

  /* ============================================================
     PRICING LINES (зправа)
     ============================================================ */
  const pricingLines = useMemo(() => {
    if (Array.isArray(pricesThis.lines) && pricesThis.lines.length) {
      return pricesThis.lines.map((l) => ({
        label: l.label, perUnit: l.perUnit, count: l.count, total: l.total,
      }));
    }
    return [];
  }, [pricesThis]);

  /* ============================================================
     RENDER
     ============================================================ */

  const totalPrice = pricesThis.price || 0;
  const calTypeLabel = CAL_TYPES.find((t) => t.key === calType)?.label || "";

  /* розмір показуємо того підтипу, який зараз відкритий — у кожного
     календаря свій набір станів */
  const activeSize = { pocket: pSize, house: hSize, desktop: dSize, wall: wSize, quarterly: qSize }[calType];
  const headSpec = activeSize ? `${activeSize.x}×${activeSize.y} мм` : "";

  if (!showNewCalendar) return null;

  return (
    <>
      <div className="v2-overlay" onClick={handleClose} />
      <div className={`v2-modal v2-theme-${theme}`} onClick={(e) => e.stopPropagation()}>

        {/* ШАПКА */}
        <div className="v2-head">
          <div className="v2-head-main">
            <span className="v2-head-title">
              Календар{calTypeLabel ? ` · ${calTypeLabel}` : ""}
            </span>
            <div className="v2-head-spec">{headSpec}</div>
          </div>
          <button className="v2-close-btn" onClick={handleClose} title="Закрити" aria-label="Закрити">
            &times;
          </button>
        </div>

        {/* ТІЛО */}
        <div className="v2-body">

          {/* СТРІЧКА ТИПІВ КАЛЕНДАРЯ */}
          <div className="v2-tabsrail">
            {CAL_TYPES.map((t) => (
              <button
                key={t.key}
                className={`v2-tab${calType === t.key ? " active" : ""}`}
                onClick={() => setCalType(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="v2-left">
            {calType === "pocket"    && renderPocket()}
            {calType === "house"     && renderHouse()}
            {calType === "desktop"   && renderDesktop()}
            {calType === "wall"      && renderWall()}
            {calType === "quarterly" && renderQuarterly()}
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
                <span>За 1 виріб</span>
                <span>{count ? fmt2(totalPrice / count) : "0,00"} грн</span>
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
          <div className="v2-error">{error.response?.data?.error || "Помилка"}</div>
        )}
      </div>
    </>
  );
};

export default NewCalendar;
