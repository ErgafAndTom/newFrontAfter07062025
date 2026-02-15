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


import "./Poslugy.css";

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
          <div className="sc-left-sections" >

          {/* 1. Кількість + Розмір (одна строка) */}
            <div className="sc-section sc-section-card">
            <div className="sc-row d-flex flex-row align-items-center justify-content-between" >
            <div className="d-flex flex-row" style={{ alignItems: "center"}}>
                <input
                  className="inputsArtem"
                  type="number"
                  value={count}
                  min={1}
                  onChange={(event) => handleChange(event.target.value)}
                />
                <div className="inputsArtemx" style={{ border: "transparent" }}>шт</div>
              </div>

              <div >
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
            <div className="sc-section sc-section-card">
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
            <div className="sc-section sc-section-card" style={{ position: "relative", zIndex: 60 }}>
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
            <div className="d-flex align-items-center" >
              <label className="switch scale04ForButtonToggle" >
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
                <span className="switch-on"><span>Ламінування</span></span>
                <span className="slider" />
                <span className="switch-off"><span>OFF</span></span>
              </label>
              {lamination.type === "Не потрібно" && (
                <div className="sc-title" style={{ marginBottom: 0 }}>Ламінування</div>
              )}
              {lamination.type !== "Не потрібно" && (
                <div className="sc-row sc-lam-row" >
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
            </div>

            {/* 5. Згинання */}
            <div className="sc-section" style={{ position: "relative", zIndex: 50 }}>
            <div className="d-flex align-items-center">
              <label className="switch scale04ForButtonToggle">
                <input type="checkbox" checked={big !== "Не потрібно"} onChange={() => {
                  if (big === "Не потрібно") setBig("1");
                  else setBig("Не потрібно");
                }} />
                <span className="switch-on"><span>Згинання</span></span>
                <span className="slider" />
                <span className="switch-off"><span>OFF</span></span>
              </label>
              {big === "Не потрібно" && (
                <div className="sc-title" style={{ marginBottom: 0 }}>Згинання</div>
              )}
              {big !== "Не потрібно" && (
                <div className="sc-row sc-pp-row" style={{ flex: 1 }}>
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
            </div>

            {/* 6. Скруглення кутів */}
            <div className="sc-section" style={{ position: "relative", zIndex: 40 }}>
            <div className="d-flex align-items-center">
              <label className="switch scale04ForButtonToggle">
                <input type="checkbox" checked={cute !== "Не потрібно"} onChange={() => {
                  if (cute === "Не потрібно") {
                    setCute(4);
                    setCuteLocal({ leftTop: true, rightTop: true, rightBottom: true, leftBottom: true, radius: "6" });
                  } else {
                    setCute("Не потрібно");
                    setCuteLocal({ leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" });
                  }
                }} />
                <span className="switch-on"><span>Скруглення</span></span>
                <span className="slider" />
                <span className="switch-off"><span>OFF</span></span>
              </label>
              {cute === "Не потрібно" && (
                <div className="sc-title" style={{ marginBottom: 0 }}>Скруглення кутів</div>
              )}
              {cute !== "Не потрібно" && (
                <div className="sc-row sc-pp-row" style={{ flex: 1 }}>
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
            </div>

            {/* 7. Свердління отворів */}
            <div className="sc-section" style={{ position: "relative", zIndex: 30 }}>
            <div className="d-flex align-items-center">
              <label className="switch scale04ForButtonToggle">
                <input type="checkbox" checked={holes !== "Не потрібно"} onChange={() => {
                  if (holes === "Не потрібно") { setHoles(1); setHolesR("5 мм"); }
                  else { setHoles("Не потрібно"); setHolesR(""); }
                }} />
                <span className="switch-on"><span>Свердління</span></span>
                <span className="slider" />
                <span className="switch-off"><span>OFF</span></span>
              </label>
              {holes === "Не потрібно" && (
                <div className="sc-title" style={{ marginBottom: 0 }}>Свердління отворів</div>
              )}
              {holes !== "Не потрібно" && (
                <div className="sc-row sc-pp-row" style={{ flex: 1 }}>
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
            </div>

            {/* 8. Проклейка */}
            <div className="sc-section" style={{ position: "relative", zIndex: 20 }}>
            <div className="d-flex align-items-center">
              <label className="switch scale04ForButtonToggle">
                <input type="checkbox" checked={prokleyka !== "Не потрібно"} onChange={() => {
                  if (prokleyka === "Не потрібно") setProkleyka("1");
                  else setProkleyka("Не потрібно");
                }} />
                <span className="switch-on"><span>Проклейка</span></span>
                <span className="slider" />
                <span className="switch-off"><span>OFF</span></span>
              </label>
              {prokleyka === "Не потрібно" && (
                <div className="sc-title" style={{ marginBottom: 0 }}>Проклейка</div>
              )}
              {prokleyka !== "Не потрібно" && (
                <div className="sc-row sc-pp-row" style={{ flex: 1 }}>
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
            </div>

            {/* 9. Люверси */}
            <div className="sc-section" style={{ position: "relative", zIndex: 10 }}>
            <div className="d-flex align-items-center">
              <label className="switch scale04ForButtonToggle">
                <input type="checkbox" checked={lyuversy !== "Не потрібно"} onChange={() => {
                  if (lyuversy === "Не потрібно") setLyuversy("1");
                  else setLyuversy("Не потрібно");
                }} />
                <span className="switch-on"><span>Люверси</span></span>
                <span className="slider" />
                <span className="switch-off"><span>OFF</span></span>
              </label>
              {lyuversy === "Не потрібно" && (
                <div className="sc-title" style={{ marginBottom: 0 }}>Люверси</div>
              )}
              {lyuversy !== "Не потрібно" && (
                <div className="sc-row sc-pp-row" style={{ flex: 1 }}>
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
            </div>

            {/* 10. Порізка */}
            <div className="sc-section">
            <div className="d-flex align-items-center">
              <label className="switch scale04ForButtonToggle">
                <input type="checkbox" checked={porizka.type !== "Не потрібно"} onChange={() => {
                  if (porizka.type === "Не потрібно") setPorizka({ ...porizka, type: "Потрібно" });
                  else setPorizka({ type: "Не потрібно" });
                }} />
                <span className="switch-on"><span>Порізка</span></span>
                <span className="slider" />
                <span className="switch-off"><span>OFF</span></span>
              </label>
              {porizka.type === "Не потрібно" && (
                <div className="sc-title" style={{ marginBottom: 0 }}>Порізка</div>
              )}
              {porizka.type !== "Не потрібно" && (
                <div className="sc-row sc-pp-row" style={{ flex: 1 }}>
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

                <div className="sc-price-label">Згинання:</div>
                <div className="sc-price-line">
                  <span className="sc-val">{fmt2(pricesThis.big?.pricePerUnit || 0)}</span>
                  <span className="sc-unit">грн</span>
                  <span className="sc-op">&times;</span>
                  <span className="sc-val">{pricesThis.big?.count || 0}</span>
                  <span className="sc-unit">шт</span>
                  <span className="sc-op">=</span>
                  <span className="sc-total">{fmt2(pricesThis.big?.totalPrice || 0)}</span>
                  <span className="sc-unit">грн</span>
                </div>

                <div className="sc-price-label">Скруглення:</div>
                <div className="sc-price-line">
                  <span className="sc-val">{fmt2(pricesThis.cute?.pricePerUnit || 0)}</span>
                  <span className="sc-unit">грн</span>
                  <span className="sc-op">&times;</span>
                  <span className="sc-val">{pricesThis.cute?.count || 0}</span>
                  <span className="sc-unit">шт</span>
                  <span className="sc-op">=</span>
                  <span className="sc-total">{fmt2(pricesThis.cute?.totalPrice || 0)}</span>
                  <span className="sc-unit">грн</span>
                </div>

                <div className="sc-price-label">Отвори:</div>
                <div className="sc-price-line">
                  <span className="sc-val">{fmt2(pricesThis.holes?.pricePerUnit || 0)}</span>
                  <span className="sc-unit">грн</span>
                  <span className="sc-op">&times;</span>
                  <span className="sc-val">{pricesThis.holes?.count || 0}</span>
                  <span className="sc-unit">шт</span>
                  <span className="sc-op">=</span>
                  <span className="sc-total">{fmt2(pricesThis.holes?.totalPrice || 0)}</span>
                  <span className="sc-unit">грн</span>
                </div>

                <div className="sc-price-label">Проклейка:</div>
                <div className="sc-price-line">
                  <span className="sc-val">{fmt2(pricesThis.prokleyka?.pricePerUnit || 0)}</span>
                  <span className="sc-unit">грн</span>
                  <span className="sc-op">&times;</span>
                  <span className="sc-val">{pricesThis.prokleyka?.count || 0}</span>
                  <span className="sc-unit">шт</span>
                  <span className="sc-op">=</span>
                  <span className="sc-total">{fmt2(pricesThis.prokleyka?.totalPrice || 0)}</span>
                  <span className="sc-unit">грн</span>
                </div>

                <div className="sc-price-label">Люверси:</div>
                <div className="sc-price-line">
                  <span className="sc-val">{fmt2(pricesThis.lyuversy?.pricePerUnit || 0)}</span>
                  <span className="sc-unit">грн</span>
                  <span className="sc-op">&times;</span>
                  <span className="sc-val">{pricesThis.lyuversy?.count || 0}</span>
                  <span className="sc-unit">шт</span>
                  <span className="sc-op">=</span>
                  <span className="sc-total">{fmt2(pricesThis.lyuversy?.totalPrice || 0)}</span>
                  <span className="sc-unit">грн</span>
                </div>

                {pricesThis.porizka !== 0 && (
                  <>
                    <div className="sc-price-label">Порізка:</div>
                    <div className="sc-price-line-simple">
                      <span>{fmt2(pricesThis.porizka || 0)}</span>
                      <span className="sc-unit">грн</span>
                    </div>
                  </>
                )}

                <div className="sc-price-total">
                  {fmt2(pricesThis.price || 0)}
                  <span className="sc-unit">грн</span>
                </div>

                <div className="sc-price-unit">
                  За 1 виріб: {count ? fmt2(pricesThis.price / count) : "0,00"} грн
                </div>

                <div className="sc-price-unit">
                  На одному аркуші: {calcItemsPerSheet(material.x || 320, material.y || 450, size.x, size.y)} шт
                </div>
              </div>
            )}

            {/* ===== ACTION BUTTON ===== */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "2vh" }}>
              <button className="sc-add-btn" onClick={addNewOrderUnit} type="button">
                <div className="sc-add-btn__outline" />
                <div className="sc-add-btn__icon">
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.2199 21.63C13.0399 21.63 11.3699 20.8 10.0499 16.83L9.32988 14.67L7.16988 13.95C3.20988 12.63 2.37988 10.96 2.37988 9.78001C2.37988 8.61001 3.20988 6.93001 7.16988 5.60001L15.6599 2.77001C17.7799 2.06001 19.5499 2.27001 20.6399 3.35001C21.7299 4.43001 21.9399 6.21001 21.2299 8.33001L18.3999 16.82C17.0699 20.8 15.3999 21.63 14.2199 21.63ZM7.63988 7.03001C4.85988 7.96001 3.86988 9.06001 3.86988 9.78001C3.86988 10.5 4.85988 11.6 7.63988 12.52L10.1599 13.36C10.3799 13.43 10.5599 13.61 10.6299 13.83L11.4699 16.35C12.3899 19.13 13.4999 20.12 14.2199 20.12C14.9399 20.12 16.0399 19.13 16.9699 16.35L19.7999 7.86001C20.3099 6.32001 20.2199 5.06001 19.5699 4.41001C18.9199 3.76001 17.6599 3.68001 16.1299 4.19001L7.63988 7.03001Z" fill="currentColor" />
                    <path d="M10.11 14.4C9.92005 14.4 9.73005 14.33 9.58005 14.18C9.29005 13.89 9.29005 13.41 9.58005 13.12L13.16 9.53C13.45 9.24 13.93 9.24 14.22 9.53C14.51 9.82 14.51 10.3 14.22 10.59L10.64 14.18C10.5 14.33 10.3 14.4 10.11 14.4Z" fill="currentColor" />
                  </svg>
                </div>
                <p className="sc-add-btn__text">
                  {(isEdit ? "Зберегти зміни" : "Додати до замовлення").split("").map((char, i) => (
                    <span key={i} style={{ "--i": i }}>{char === " " ? "\u00A0" : char}</span>
                  ))}
                </p>
              </button>
            </div>
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
            className={`btn ${isEditServices ? "adminButtonAdd" : "adminButtonAdd-active"}`}
            style={{ fontSize: "clamp(0.7rem, 0.7vh, 2.5vh)", minWidth: "2vw", height: "2vh" }}
            onClick={() => setIsEditServices((v) => !v)}
            title={isEditServices ? "Завершити редагування" : "Налаштування назв товарів"}
          >
            <span className="sc-tab-text">{isEditServices ? "✔️" : "⚙️"}</span>
          </button>
        </div>

        {/* action button moved to sc-right */}

      </div>
      {/* END sc-modal */}
    </div>
  );
};

export default NewSheetCut;
