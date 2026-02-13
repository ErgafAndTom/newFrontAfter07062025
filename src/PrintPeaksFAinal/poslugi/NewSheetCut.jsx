import React, { useEffect, useState } from "react";
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


import "./NewSheetCut.css";

const emptyPrice = { pricePerUnit: 0, count: 0, totalPrice: 0 };
const normalize = (obj = {}) => ({
  pricePerUnit: Number(obj.pricePerUnit) || 0,
  count: Number(obj.count) || 0,
  totalPrice: Number(obj.totalPrice) || 0,
});

/* ===================== ✅ ДОДАНО: DEFAULTS + HELPERS (як у Vishichka) ===================== */

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

                       // ✅ ДОДАТИ ЦЕЙ PROP З БАТЬКІВСЬКОГО КОМПОНЕНТА (як у Vishichka)
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

  let handleChange = (e) => {
    setCount(e);
  };

  /* ====== STATE ====== */

  const [size, setSize] = useState({
    x: 310,
    y: 440,
  });

  const [material, setMaterial] = useState({
    type: "Папір",
    thickness: "Цупкий",
    material: "",
    materialId: "0",
    typeUse: "Цупкий",
  });

  const [color, setColor] = useState({
    sides: "односторонній",
    one: "",
    two: "",
    allSidesColor: "CMYK",
  });

  const [lamination, setLamination] = useState({
    type: "Не потрібно",
    material: "",
    materialId: "",
    size: "",
  });

  const [pereplet, setPereplet] = useState({
    type: "",
    thickness: "Тонкі",
    material: "",
    materialId: "",
    size: "<120",
    typeUse: "Брошурування до 120 аркушів",
  });

  const [big, setBig] = useState("Не потрібно");
  const [cute, setCute] = useState("Не потрібно");
  const [porizka, setPorizka] = useState({ type: "Не потрібно" });

  const [cuteLocal, setCuteLocal] = useState({
    leftTop: true,
    rightTop: true,
    rightBottom: true,
    leftBottom: true,
    radius: "6",
  });

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
  const [services, setServices] = useState([
    "Зображення", "Листівка", "Візитка", "Флаєр", "Буклет",
    "Брошура", "Картка", "Диплом", "Сертифікат", "Подяка",
    "Зін", "Презентація", "Бланк", "Афіша", "Календар",
    "Плакат", "Візуалізація", "Меню", "Документ", "Бейджі", "Холдер",
  ]);

  /* ===================== ✅ ДОДАНО: INIT MODAL (NEW/EDIT) як у Vishichka ===================== */

  const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.idKey);
  const options = parseOptionsJson(editingOrderUnit);

  useEffect(() => {
    if (!showNewSheetCut) return;

    // прибрати помилку при відкритті
    if (error) setError(null);

    // NEW
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

    // EDIT
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
    // важливо: якщо міняється unit — при наступному відкритті підтягне інші значення
    editingOrderUnit?.id,
    editingOrderUnit?.idKey,
    editingOrderUnit?.optionsJson,
  ]);

  /* ===================== SAVE ===================== */

  const addNewOrderUnit = (e) => {
    let dataToSend = {
      orderId: thisOrder.id,
      toCalc: {
        nameOrderUnit: `${selectedService.toLowerCase() ? selectedService.toLowerCase() + " " : ""}`,
        type: "SheetCut",
        size: size,
        material: material,
        color: color,
        lamination: lamination,
        big: big,
        cute: cute,
        cuteLocal: cuteLocal,
        prokleyka: prokleyka,
        lyuversy: lyuversy,
        design,
        holes: holes,
        holesR: holesR,
        count: count,
        porizka: porizka,
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
        if (error.response?.status === 403) {
          navigate("/login");
        }
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

  useEffect(() => {
    let dataToSend = {
      type: "SheetCut",
      size: size,
      material: material,
      color: color,
      lamination: lamination,
      big: big,
      cute: cute,
      prokleyka: prokleyka,
      lyuversy: lyuversy,
      design: design,
      cuteLocal: cuteLocal,
      holes: holes,
      holesR: holesR,
      count: count,
      porizka: porizka,
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
    size,
    material,
    color,
    lamination.materialId,
    big,
    cute,
    cuteLocal,
    holes,
    holesR,
    count,
    porizka,
    lyuversy,
    prokleyka,
    design,
    navigate,
  ]);
  useEffect(() => {
    if (error) setError(null);
  }, [material]);


  /* ===================== RENDER ===================== */

  if (!showNewSheetCut) return null;

  return (
    <div className="sc-wrap">
      {/* ===== OVERLAY ===== */}
      <div className="bw-overlay" onClick={handleClose} />

      {/* ===== MODAL ===== */}
      <div className="sc-modal" style={{
        minHeight: 'auto',
        height: 'auto',
      }} onClick={(e) => e.stopPropagation()}>

        {/* ===== BODY: left + right ===== */}
        <div className="sc-body" >

          {/* ===== LEFT: scrollable options ===== */}
          <div className="sc-left-sections">

          {/* 1. Кількість + Розмір (одна строка) */}
            <div className="sc-section">
            <div className="sc-title">Кількість та розмір</div>
            <div className="sc-row d-flex flex-row align-items-center justify-content-between" style={{}}>
            <div className="d-flex flex-row" style={{ alignItems: "center", flexShrink: 0, }}>
                <input
                  className="inputsArtem"
                  type="number"
                  value={count}
                  min={1}
                  onChange={(event) => handleChange(event.target.value)}
                />
                <div className="inputsArtemx" style={{ border: "transparent" }}>шт</div>
              </div>

              <div style={{ marginLeft: "auto", paddingRight: 0 }}>
                <NewNoModalSize
                  size={size}
                  setSize={setSize}
                  prices={prices}
                  type={"SheetCut"}
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

            {/* 2. Сторонність (окрема строка) */}
            <div className="sc-section">
            <div className="sc-title">Сторонність</div>
            <div className="sc-sides">
              <button
                className={`sc-side-btn sc-side-left ${color.sides === "односторонній" ? "sc-side-active" : ""}`}
                onClick={() => setColor({ ...color, sides: "односторонній" })}
              >
                Односторонній
              </button>
              <button
                className={`sc-side-btn sc-side-right ${color.sides === "двосторонній" ? "sc-side-active" : ""}`}
                onClick={() => setColor({ ...color, sides: "двосторонній" })}
              >
                Двосторонній
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
              />
            </div>
            </div>

            {/* 4. Ламінація */}
            <div className="sc-section">
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
                <span className="slider" />
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

            {/* 5. Згинання */}
            <div className="sc-section" style={{ position: "relative", zIndex: 50 }}>
            <div className="d-flex align-items-center" style={{ gap: "8px" }}>
              <div className="sc-title" style={{ marginBottom: 0 }}>Згинання</div>
              <label className="switch scale04ForButtonToggle" style={{ margin: 0 }}>
                <input type="checkbox" checked={big !== "Не потрібно"} onChange={() => {
                  if (big === "Не потрібно") setBig("1");
                  else setBig("Не потрібно");
                }} />
                <span className="slider" />
              </label>
            </div>
            {big !== "Не потрібно" && (
              <div className="sc-row sc-pp-row">
                <NewNoModalCornerRounding
                  big={big}
                  setBig={setBig}
                  prices={prices}
                  type={"SheetCut"}
                  buttonsArr={[]}
                  selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                />
              </div>
            )}
            </div>

            {/* 6. Скруглення кутів */}
            <div className="sc-section" style={{ position: "relative", zIndex: 40 }}>
            <div className="d-flex align-items-center" style={{ gap: "8px" }}>
              <div className="sc-title" style={{ marginBottom: 0 }}>Скруглення кутів</div>
              <label className="switch scale04ForButtonToggle" style={{ margin: 0 }}>
                <input type="checkbox" checked={cute !== "Не потрібно"} onChange={() => {
                  if (cute === "Не потрібно") {
                    setCute(4);
                    setCuteLocal({ leftTop: true, rightTop: true, rightBottom: true, leftBottom: true, radius: "6" });
                  } else {
                    setCute("Не потрібно");
                    setCuteLocal({ leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" });
                  }
                }} />
                <span className="slider" />
              </label>
            </div>
            {cute !== "Не потрібно" && (
              <div className="sc-row sc-pp-row">
                <NewNoModalCute
                  cute={cute}
                  setCute={setCute}
                  cuteLocal={cuteLocal}
                  setCuteLocal={setCuteLocal}
                  prices={prices}
                  type={"SheetCut"}
                  buttonsArr={[]}
                  selectArr={["3", "6", "8", "10", "13"]}
                />
              </div>
            )}
            </div>

            {/* 7. Свердління отворів */}
            <div className="sc-section" style={{ position: "relative", zIndex: 30 }}>
            <div className="d-flex align-items-center" style={{ gap: "8px" }}>
              <div className="sc-title" style={{ marginBottom: 0 }}>Свердління отворів</div>
              <label className="switch scale04ForButtonToggle" style={{ margin: 0 }}>
                <input type="checkbox" checked={holes !== "Не потрібно"} onChange={() => {
                  if (holes === "Не потрібно") { setHoles(1); setHolesR("5 мм"); }
                  else { setHoles("Не потрібно"); setHolesR(""); }
                }} />
                <span className="slider" />
              </label>
            </div>
            {holes !== "Не потрібно" && (
              <div className="sc-row sc-pp-row">
                <NewNoModalHoles
                  holes={holes}
                  setHoles={setHoles}
                  holesR={holesR}
                  setHolesR={setHolesR}
                  prices={prices}
                  type={"SheetCut"}
                  buttonsArr={[]}
                  selectArr={["", "3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                />
              </div>
            )}
            </div>

            {/* 8. Проклейка */}
            <div className="sc-section" style={{ position: "relative", zIndex: 20 }}>
            <div className="d-flex align-items-center" style={{ gap: "8px" }}>
              <div className="sc-title" style={{ marginBottom: 0 }}>Проклейка</div>
              <label className="switch scale04ForButtonToggle" style={{ margin: 0 }}>
                <input type="checkbox" checked={prokleyka !== "Не потрібно"} onChange={() => {
                  if (prokleyka === "Не потрібно") setProkleyka("1");
                  else setProkleyka("Не потрібно");
                }} />
                <span className="slider" />
              </label>
            </div>
            {prokleyka !== "Не потрібно" && (
              <div className="sc-row sc-pp-row">
                <NewNoModalProkleyka
                  prokleyka={prokleyka}
                  setProkleyka={setProkleyka}
                  prices={prices}
                  type={"SheetCut"}
                  buttonsArr={[]}
                  selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                />
              </div>
            )}
            </div>

            {/* 9. Люверси */}
            <div className="sc-section" style={{ position: "relative", zIndex: 10 }}>
            <div className="d-flex align-items-center" style={{ gap: "8px" }}>
              <div className="sc-title" style={{ marginBottom: 0 }}>Люверси</div>
              <label className="switch scale04ForButtonToggle" style={{ margin: 0 }}>
                <input type="checkbox" checked={lyuversy !== "Не потрібно"} onChange={() => {
                  if (lyuversy === "Не потрібно") setLyuversy("1");
                  else setLyuversy("Не потрібно");
                }} />
                <span className="slider" />
              </label>
            </div>
            {lyuversy !== "Не потрібно" && (
              <div className="sc-row sc-pp-row">
                <NewNoModalLyuversy
                  lyuversy={lyuversy}
                  setLyuversy={setLyuversy}
                  type={"SheetCut"}
                  buttonsArr={[]}
                  selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                />
              </div>
            )}
            </div>

            {/* 10. Порізка */}
            <div className="sc-section">
            <div className="d-flex align-items-center" style={{ gap: "8px" }}>
              <div className="sc-title" style={{ marginBottom: 0 }}>Порізка</div>
              <label className="switch scale04ForButtonToggle" style={{ margin: 0 }}>
                <input type="checkbox" checked={porizka.type !== "Не потрібно"} onChange={() => {
                  if (porizka.type === "Не потрібно") setPorizka({ ...porizka, type: "Потрібно" });
                  else setPorizka({ type: "Не потрібно" });
                }} />
                <span className="slider" />
              </label>
            </div>
            {porizka.type !== "Не потрібно" && (
              <div className="sc-row sc-pp-row">
                <Porizka
                  porizka={porizka}
                  setPorizka={setPorizka}
                  prices={prices}
                  type={"SheetCut"}
                />
              </div>
            )}
            </div>

          </div>
          {/* END sc-left */}

          {/* ===== RIGHT: pricing ===== */}
          <div className="sc-right">
            {pricesThis && (
              <>
                <div className="sc-price-label">Друк:</div>
                <div className="sc-price-line">
                  {fmt2(pricesThis.priceDrukPerSheet)}
                  <span className="sc-price-sub">грн</span>
                  <span className="sc-price-op">&times;</span>
                  {pricesThis.sheetCount || 0}
                  <span className="sc-price-sub">шт</span>
                  <span className="sc-price-op">=</span>
                  {fmt2((pricesThis.priceDrukPerSheet || 0) * (pricesThis.sheetCount || 0))}
                  <span className="sc-price-sub">грн</span>
                </div>

                <div className="sc-price-label">Матеріали:</div>
                <div className="sc-price-line">
                  {fmt2(pricesThis.pricePaperPerSheet)}
                  <span className="sc-price-sub">грн</span>
                  <span className="sc-price-op">&times;</span>
                  {pricesThis.sheetCount || 0}
                  <span className="sc-price-sub">шт</span>
                  <span className="sc-price-op">=</span>
                  {fmt2((pricesThis.pricePaperPerSheet || 0) * (pricesThis.sheetCount || 0))}
                  <span className="sc-price-sub">грн</span>
                </div>

                <div className="sc-price-label">Ламінація:</div>
                <div className="sc-price-line">
                  {fmt2(pricesThis.priceLaminationPerSheet)}
                  <span className="sc-price-sub">грн</span>
                  <span className="sc-price-op">&times;</span>
                  {pricesThis.sheetCount || 0}
                  <span className="sc-price-sub">шт</span>
                  <span className="sc-price-op">=</span>
                  {fmt2((pricesThis.priceLaminationPerSheet || 0) * (pricesThis.sheetCount || 0))}
                  <span className="sc-price-sub">грн</span>
                </div>

                <div className="sc-price-label">Згинання:</div>
                <div className="sc-price-line">
                  {pricesThis.big?.pricePerUnit || 0}
                  <span className="sc-price-sub">грн</span>
                  <span className="sc-price-op">&times;</span>
                  {pricesThis.big?.count || 0}
                  <span className="sc-price-sub">шт</span>
                  <span className="sc-price-op">=</span>
                  {pricesThis.big?.totalPrice || 0}
                  <span className="sc-price-sub">грн</span>
                </div>

                <div className="sc-price-label">Скруглення:</div>
                <div className="sc-price-line">
                  {pricesThis.cute?.pricePerUnit || 0}
                  <span className="sc-price-sub">грн</span>
                  <span className="sc-price-op">&times;</span>
                  {pricesThis.cute?.count || 0}
                  <span className="sc-price-sub">шт</span>
                  <span className="sc-price-op">=</span>
                  {pricesThis.cute?.totalPrice || 0}
                  <span className="sc-price-sub">грн</span>
                </div>

                <div className="sc-price-label">Отвори:</div>
                <div className="sc-price-line">
                  {pricesThis.holes?.pricePerUnit || 0}
                  <span className="sc-price-sub">грн</span>
                  <span className="sc-price-op">&times;</span>
                  {pricesThis.holes?.count || 0}
                  <span className="sc-price-sub">шт</span>
                  <span className="sc-price-op">=</span>
                  {pricesThis.holes?.totalPrice || 0}
                  <span className="sc-price-sub">грн</span>
                </div>

                <div className="sc-price-label">Проклейка:</div>
                <div className="sc-price-line">
                  {pricesThis.prokleyka?.pricePerUnit || 0}
                  <span className="sc-price-sub">грн</span>
                  <span className="sc-price-op">&times;</span>
                  {pricesThis.prokleyka?.count || 0}
                  <span className="sc-price-sub">шт</span>
                  <span className="sc-price-op">=</span>
                  {pricesThis.prokleyka?.totalPrice || 0}
                  <span className="sc-price-sub">грн</span>
                </div>

                <div className="sc-price-label">Люверси:</div>
                <div className="sc-price-line">
                  {pricesThis.lyuversy?.pricePerUnit || 0}
                  <span className="sc-price-sub">грн</span>
                  <span className="sc-price-op">&times;</span>
                  {pricesThis.lyuversy?.count || 0}
                  <span className="sc-price-sub">шт</span>
                  <span className="sc-price-op">=</span>
                  {pricesThis.lyuversy?.totalPrice || 0}
                  <span className="sc-price-sub">грн</span>
                </div>

                {pricesThis.porizka !== 0 && (
                  <>
                    <div className="sc-price-label">Порізка:</div>
                    <div className="sc-price-line">
                      {pricesThis.porizka || 0}
                      <span className="sc-price-sub">грн</span>
                    </div>
                  </>
                )}

                <div className="sc-price-total">
                  {pricesThis.price || 0}
                  <span className="sc-price-sub">грн</span>
                </div>

                <div className="sc-price-unit">
                  За 1 виріб: {count ? (pricesThis.price / count).toFixed(2) : 0} грн
                </div>

                <div className="sc-price-unit">
                  На одному аркуші: {calcItemsPerSheet(material.x || 320, material.y || 450, size.x, size.y)} шт
                </div>
              </>
            )}
          </div>
          {/* END sc-right */}

        </div>
        {/* END sc-body */}

        {/* ===== ERROR ===== */}
        {error && (
          <div className="sc-error">
            {error.response?.data?.error || "Помилка"}
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
                {service}
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
            className={`btn ${isEditServices ? "adminButtonAdd" : "adminButtonAdd-active"}`}
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

export default NewSheetCut;
