import React, { useEffect, useMemo, useState, useCallback } from "react";
import { MDBContainer } from "mdb-react-ui-kit";
import { Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";

import NewNoModalLyuversy from "./newnomodals/NewNoModalLyuversy";
import Loader from "../../components/calc/Loader";
import NewNoModalCornerRounding from "./newnomodals/NewNoModalBig";
import NewNoModalCute from "./newnomodals/NewNoModalCute";
import NewNoModalHoles from "./newnomodals/NewNoModalHoles";
import NewNoModalProkleyka from "./newnomodals/NewNoModalProkleyka";
import versantIcon from "../../components/newUIArtem/printers/binder.svg";

const emptyPrice = { pricePerUnit: 0, count: 0, totalPrice: 0 };

const normalize = (obj = {}) => ({
  pricePerUnit: Number(obj.pricePerUnit) || 0,
  count: Number(obj.count) || 0,
  totalPrice: Number(obj.totalPrice) || 0,
});

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

const DEFAULTS = {
  // базові поля (те що бек очікує в pricing)
  size: { x: 297, y: 420 },
  material: { type: "Не потрібно", material: "", materialId: "", size: "" },
  color: { sides: "Не потрібно", one: "", two: "", allSidesColor: "CMYK" },

  count: 1,

  big: "Не потрібно",
  prokleyka: "Не потрібно",
  lyuversy: "Не потрібно",
  cute: "Не потрібно",
  holes: "Не потрібно",
  holesR: "",

  cuteLocal: {
    leftTop: false,
    rightTop: false,
    rightBottom: false,
    leftBottom: false,
    radius: "",
  },

  // design: "Не потрібно" або число як string ("0","150"...)
  design: "Не потрібно",

  // lamination в цьому модалі використовується лише для розрахунку (з бекенду)
  lamination: { type: "Не потрібно", material: "", materialId: "", size: "" },
};

const BigOvshik = ({
                     thisOrder,
                     setThisOrder,
                     showBigOvshik,
                     setSelectedThings2,
                     setShowBigOvshik,

                     // ✅ ДОДАЙ ЦЕ (як у Vishichka)
                     editingOrderUnit,
                   }) => {
  const navigate = useNavigate();

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(null);

  const options = useMemo(() => parseOptionsJson(editingOrderUnit), [editingOrderUnit]);
  const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.optionsJson);

  const fmt2 = (v) =>
    new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(v));

  // ---------- керовані стейти (з дефолтів або з options) ----------
  const [size, setSize] = useState(DEFAULTS.size);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [color, setColor] = useState(DEFAULTS.color);

  const [count, setCount] = useState(DEFAULTS.count);

  const [big, setBig] = useState(DEFAULTS.big);
  const [prokleyka, setProkleyka] = useState(DEFAULTS.prokleyka);
  const [lyuversy, setLyuversy] = useState(DEFAULTS.lyuversy);
  const [cute, setCute] = useState(DEFAULTS.cute);

  const [cuteLocal, setCuteLocal] = useState(DEFAULTS.cuteLocal);

  const [holes, setHoles] = useState(DEFAULTS.holes);
  const [holesR, setHolesR] = useState(DEFAULTS.holesR);

  const [design, setDesign] = useState(DEFAULTS.design);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);

  // Прайс-об’єкт з бекенду
  const [pricesThis, setPricesThis] = useState({
    big: emptyPrice,
    prokleyka: emptyPrice,
    lamination: emptyPrice,
    lyuversy: emptyPrice,
    cute: emptyPrice,
    holes: emptyPrice,

    // ці два ключі ти використовуєш для ламінування
    priceLaminationPerSheet: 0,
    sheetCount: 0,

    design: { pricePerUnit: 0, totalPrice: 0 },
  });

  // ---------- ініціалізація (NEW vs EDIT) ----------
  const resetToDefaults = useCallback(() => {
    setSize(DEFAULTS.size);
    setMaterial(DEFAULTS.material);
    setColor(DEFAULTS.color);

    setCount(DEFAULTS.count);

    setBig(DEFAULTS.big);
    setProkleyka(DEFAULTS.prokleyka);
    setLyuversy(DEFAULTS.lyuversy);
    setCute(DEFAULTS.cute);

    setCuteLocal(DEFAULTS.cuteLocal);

    setHoles(DEFAULTS.holes);
    setHolesR(DEFAULTS.holesR);

    setDesign(DEFAULTS.design);
    setLamination(DEFAULTS.lamination);

    setError(null);
  }, []);

  const hydrateFromEditUnit = useCallback(() => {
    // якщо немає optionsJson — просто дефолти
    if (!options) {
      resetToDefaults();
      // але можна підтягнути count з amount, якщо є
      if (editingOrderUnit?.amount) setCount(safeNum(editingOrderUnit.amount, 1));
      return;
    }

    // беремо значення з optionsJson, а що нема — з дефолтів
    setSize(options?.size ?? DEFAULTS.size);
    setMaterial(options?.material ?? DEFAULTS.material);
    setColor(options?.color ?? DEFAULTS.color);

    setCount(
      safeNum(options?.count, NaN) ||
      (editingOrderUnit?.amount ? safeNum(editingOrderUnit.amount, 1) : DEFAULTS.count)
    );

    setBig(options?.big ?? DEFAULTS.big);
    setProkleyka(options?.prokleyka ?? DEFAULTS.prokleyka);
    setLyuversy(options?.lyuversy ?? DEFAULTS.lyuversy);
    setCute(options?.cute ?? DEFAULTS.cute);

    setCuteLocal(options?.cuteLocal ?? DEFAULTS.cuteLocal);

    setHoles(options?.holes ?? DEFAULTS.holes);
    setHolesR(options?.holesR ?? DEFAULTS.holesR);

    setDesign(options?.design ?? DEFAULTS.design);
    setLamination(options?.lamination ?? DEFAULTS.lamination);

    setError(null);
  }, [options, editingOrderUnit, resetToDefaults]);

  // Ключова логіка: коли відкрили модалку — ставимо NEW або EDIT стани
  useEffect(() => {
    if (!showBigOvshik) return;
    if (isEdit) hydrateFromEditUnit();
    else resetToDefaults();
  }, [showBigOvshik, isEdit, hydrateFromEditUnit, resetToDefaults]);

  // ---------- анімація модалки ----------
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      setShowBigOvshik(false);
    }, 300);
  };

  useEffect(() => {
    if (showBigOvshik) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 100);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [showBigOvshik]);

  // ---------- design → pricesThis.design ----------
  useEffect(() => {
    const v = design === "Не потрібно" ? 0 : Number(design) || 0;
    setPricesThis((prev) => ({
      ...prev,
      design: {
        pricePerUnit: v,
        totalPrice: v,
      },
    }));
  }, [design]);

  // ---------- PRICING ----------
  useEffect(() => {
    const dataToSend = {
      type: "BigOvshik",
      size,
      material,
      color,
      big,
      lamination,
      prokleyka,
      lyuversy,
      cute,
      cuteLocal,
      holes,
      holesR,
      count,
      design,
    };

    axios
      .post("/calc/pricing", dataToSend)
      .then(({ data }) => {
        const p = data?.prices ?? {};

        setPricesThis((prev) => ({
          ...prev,
          big: normalize(p.big),
          prokleyka: normalize(p.prokleyka),
          lamination: normalize(p.lamination),
          lyuversy: normalize(p.lyuversy),
          cute: normalize(p.cute),
          holes: normalize(p.holes),

          priceLaminationPerSheet: Number(p.priceLaminationPerSheet) || 0,
          sheetCount: Number(p.sheetCount) || 0,

          // design тримаємо локально (не перетираємо)
          design: prev.design,
        }));
      })
      .catch((err) => {
        if (err?.response?.status === 403) navigate("/login");
        console.log(err?.message);
      });
  }, [
    size,
    material,
    color,
    big,
    lamination,
    prokleyka,
    lyuversy,
    cute,
    cuteLocal,
    holes,
    holesR,
    count,
    design,
    navigate,
  ]);

  // ---------- TOTAL ----------
  const totalPriceFull = useMemo(() => {
    const laminationCost =
      pricesThis.priceLaminationPerSheet && pricesThis.sheetCount
        ? pricesThis.priceLaminationPerSheet * pricesThis.sheetCount
        : pricesThis.lamination.totalPrice;

    return (
      laminationCost +
      pricesThis.big.totalPrice +
      pricesThis.prokleyka.totalPrice +
      pricesThis.lyuversy.totalPrice +
      pricesThis.cute.totalPrice +
      pricesThis.holes.totalPrice +
      pricesThis.design.totalPrice
    );
  }, [pricesThis]);

  // ---------- SAVE ----------
  const addNewOrderUnit = () => {
    if (!thisOrder?.id) return;

    const nameOrderUnit =
      [
        design !== "Не потрібно" ? "Дизайн" : null,
        prokleyka !== "Не потрібно" ? "Проклейка" : null,
        lyuversy !== "Не потрібно" ? "Люверси" : null,
        big !== "Не потрібно" ? "Згинання" : null,
        cute !== "Не потрібно" ? "Скруглення" : null,
        holes !== "Не потрібно" ? "Свердління" : null,
      ]
        .filter(Boolean)
        .join(", ") || "Постпресс";

    const dataToSend = {
      orderId: thisOrder.id,
      toCalc: {
        nameOrderUnit,
        type: "BigOvshik",

        size,
        material,
        color,
        lamination,

        big,
        prokleyka,
        lyuversy,

        cute,
        cuteLocal,

        holes,
        holesR,

        design,
        count,

        window: "наліпки",
      },
    };

    axios
      .post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then((response) => {
        setThisOrder(response.data);
        setSelectedThings2(response.data.OrderUnits);
        setShowBigOvshik(false);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        if (err?.response?.status === 403) navigate("/login");
        console.log(err?.response || err?.message);
      });
  };

  if (!isVisible) return <Loader />;

  return (
    <div>
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 15, 15, 0.45)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          zIndex: 99,
          opacity: isAnimating ? 1 : 0,
          transition: "opacity 200ms ease",
        }}
        onClick={handleClose}
      />

      <div
        className="d-flex flex-column"
        style={{
          zIndex: 100,
          position: "fixed",
          background: "#dcd9ce",
          top: "50%",
          left: "50%",
          transform: isAnimating
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.8)",
          opacity: isAnimating ? 1 : 0,
          transition: "opacity 0.3s, transform 0.3s",
          borderRadius: "1vw",
          width: "95vw",
          height: "95vh",
        }}
      >
        <div className="d-flex">
          <div className="m-auto fontProductName" />
          <div
            className="btn btn-close btn-lg"
            style={{ margin: "0.5vw" }}
            onClick={handleClose}
          />
        </div>

        <MDBContainer fluid>
          <Row xs={1} md={6}>
            <div className="d-flex flex-column">
              <div
                className="d-flex flex-row inputsArtemkilk allArtemElem"
                style={{ marginLeft: "7vw", marginTop: "0vw" }}
              >
                У кількості:
                <input
                  type="number"
                  value={count}
                  min={1}
                  onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
                  className="d-flex inputsArtemNumber inputsArtem"
                  style={{ marginLeft: "1vw", paddingLeft: "0.5vw" }}
                />
                <div className="inputsArtemx allArtemElem" style={{ marginTop: "-2vh" }}>
                  шт
                </div>
              </div>

              <NewNoModalCornerRounding
                big={big}
                setBig={setBig}
                type="SheetCut"
                buttonsArr={[]}
                selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
              />

              <NewNoModalProkleyka
                prokleyka={prokleyka}
                setProkleyka={setProkleyka}
                type="SheetCut"
                buttonsArr={[]}
                selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
              />

              <NewNoModalLyuversy
                lyuversy={lyuversy}
                setLyuversy={setLyuversy}
                type="SheetCut"
                buttonsArr={[]}
                selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
              />

              <NewNoModalCute
                cute={cute}
                setCute={setCute}
                cuteLocal={cuteLocal}
                setCuteLocal={setCuteLocal}
                type="SheetCut"
                selectArr={["3", "6", "8", "10", "13"]}
              />

              <NewNoModalHoles
                holes={holes}
                setHoles={setHoles}
                holesR={holesR}
                setHolesR={setHolesR}
                type="SheetCut"
                selectArr={["", "3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
              />

              <div className="">
                <div className="d-flex flex-row allArtemElem">
                  <label className="switch scale04ForButtonToggle" aria-label="Дизайн">
                    <input
                      type="checkbox"
                      checked={design !== "Не потрібно"}
                      onChange={() =>
                        setDesign(design === "Не потрібно" ? "0" : "Не потрібно")
                      }
                    />
                    <span className="slider" />
                  </label>

                  <div className="PostpressNames">
                    Дизайн:
                    {design !== "Не потрібно" && (
                      <div className="d-flex align-items-center">
                        <input
                          type="number"
                          min={0}
                          value={design}
                          onChange={(e) => setDesign(e.target.value)}
                          className="d-flex inputsArtemNumber inputsArtem"
                        />
                        <span className="inputsArtemx allArtemElem">грн</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {thisOrder && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "2vh" }}>
                  <button className="adminButtonAdd" onClick={addNewOrderUnit}>
                    Додати до замовлення
                  </button>
                </div>
              )}

              {error?.response?.data?.error && (
                <div style={{ color: "red", marginTop: "1vh", textAlign: "center" }}>
                  {error.response.data.error}
                </div>
              )}
            </div>
          </Row>

          <div className="d-flex justify-content-between pricesBlockContainer" style={{ height: "20vmin" }}>
            <div style={{ height: "19vmin" }}>
              <div className="fontInfoForPricing">
                Ламінація: {fmt2(pricesThis.priceLaminationPerSheet)} грн * {pricesThis.sheetCount} шт ={" "}
                {fmt2(pricesThis.priceLaminationPerSheet * pricesThis.sheetCount)} грн
              </div>

              <div className="fontInfoForPricing">
                Згинання: {fmt2(pricesThis.big.pricePerUnit)} грн * {pricesThis.big.count} ={" "}
                {fmt2(pricesThis.big.totalPrice)} грн
              </div>

              <div className="fontInfoForPricing">
                Проклейка: {fmt2(pricesThis.prokleyka.pricePerUnit)} грн * {pricesThis.prokleyka.count} ={" "}
                {fmt2(pricesThis.prokleyka.totalPrice)} грн
              </div>

              <div className="fontInfoForPricing">
                Люверси: {fmt2(pricesThis.lyuversy.pricePerUnit)} грн * {pricesThis.lyuversy.count} ={" "}
                {fmt2(pricesThis.lyuversy.totalPrice)} грн
              </div>

              <div className="fontInfoForPricing">
                Скруглення: {fmt2(pricesThis.cute.pricePerUnit)} грн * {pricesThis.cute.count} ={" "}
                {fmt2(pricesThis.cute.totalPrice)} грн
              </div>

              <div className="fontInfoForPricing">
                Свердління: {fmt2(pricesThis.holes.pricePerUnit)} грн * {pricesThis.holes.count} ={" "}
                {fmt2(pricesThis.holes.totalPrice)} грн
              </div>

              <div className="fontInfoForPricing">
                Дизайн: {fmt2(pricesThis.design.pricePerUnit)} грн = {fmt2(pricesThis.design.totalPrice)} грн
              </div>

              <div className="fontInfoForPricing1">Загалом: {fmt2(totalPriceFull)} грн</div>
            </div>

            <img
              src={versantIcon}
              style={{ height: "16vmin", marginLeft: "15vmin", marginRight: "2vmin" }}
              alt="binder"
            />
          </div>
        </MDBContainer>
      </div>
    </div>
  );
};

export default BigOvshik;
