import { MDBContainer } from "mdb-react-ui-kit";
import { Row } from "react-bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import Loader from "../../components/calc/Loader";
import NewNoModalSize from "./newnomodals/NewNoModalSizeColor";
import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import NewNoModalCornerRounding from "./newnomodals/NewNoModalBig";
import NewNoModalCute from "./newnomodals/NewNoModalCute";
import NewNoModalHoles from "./newnomodals/NewNoModalHoles";
import versantIcon from "../public/versant80@2x.png";
import Materials2 from "./newnomodals/Materials2";
import { useNavigate } from "react-router-dom";
import NewNoModalLyuversy from "./newnomodals/NewNoModalLyuversy";
import Porizka from "./newnomodals/Porizka";

import "./isoButtons.css";
import IsoButtons from "./IsoButtons";

import NewNoModalProkleyka from "./newnomodals/NewNoModalProkleyka";

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
    leftTop: false,
    rightTop: false,
    rightBottom: false,
    leftBottom: false,
    radius: "",
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

  const [load, setLoad] = useState(false);
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [error, setError] = useState(null);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      setShowNewSheetCut(false);
    }, 300);
  };

  const handleShow = useCallback(() => {
    setShowNewSheetCut(true);
  }, [setShowNewSheetCut]);

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
    leftTop: false,
    rightTop: false,
    rightBottom: false,
    leftBottom: false,
    radius: "",
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
    console.log('=== FRONTEND DEBUG ===');
    console.log('Current size:', size);
    console.log('Current material:', material);
    console.log('=====================');
  }, [size, material]);
  useEffect(() => {
    if (error) setError(null);
  }, [material]);

  /* ===================== MODAL ANIMATION ===================== */

  useEffect(() => {
    if (showNewSheetCut) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 100);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [showNewSheetCut]);

  /* ===================== RENDER ===================== */

  return (
    <>
      {isVisible === true ? (
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
          ></div>

          <div
            className="d-flex flex-column"
            style={{
              zIndex: "100",
              position: "fixed",
              background: "#dcd9ce",
              top: "50%",
              left: "50%",
              transform: isAnimating
                ? "translate(-50%, -50%) scale(1)"
                : "translate(-50%, -50%) scale(0.8)",
              opacity: isAnimating ? 1 : 0,
              transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
              borderRadius: "9px",
              width: "95vw",
              height: "95vh",
            }}
          >
            <div className="d-flex">
              <div className="m-auto text-center fontProductName">
                <div className="d-flex flex-wrap justify-content-center fontInfoForPricingsmall">
                  {[
                    "Зображення",
                    "Листівка",
                    "Візитка",
                    "Флаєр",
                    "Буклет",
                    "Брошура",
                    "Картка",
                    "Диплом",
                    "Сертифікат",
                    "Подяка",
                    "Зін",
                    "Презентація",
                    "Бланк",
                    "Афіша",
                    "Календар",
                    "Плакат",
                    "Візуалізація",
                    "Меню",
                    "Документ",
                    "Бейджі",
                    "Холдер",
                  ].map((service, index) => (
                    <button
                      key={index}
                      className={`btn ${
                        selectedService === service ? "adminButtonAdd" : "adminButtonAdd-primary"
                      } m-1`}
                      style={{ minWidth: "4vw" }}
                      onClick={() => setSelectedService(service)}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="btn btn-close"
                style={{
                  margin: "0.5vw",
                }}
                onClick={handleClose}
              ></div>
            </div>

            <div className="d-flex flex-column">
              <div
                className="d-flex flex-row inputsArtemkilk "
                style={{
                  marginLeft: "1.4vw",
                  border: "transparent",
                  justifyContent: "left",
                  marginTop: "1vw",
                }}
              >
                {" "}
                У кількості:
                <input
                  className="d-flex inputsArtem"
                  style={{
                    marginLeft: "1vw",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingLeft: "0.5vw",
                  }}
                  type="number"
                  value={count}
                  min={1}
                  onChange={(event) => handleChange(event.target.value)}
                />
                <div className="inputsArtemx allArtemElem" style={{ border: "transparent", marginTop: "-2vh" }}>
                  {" "}
                  шт
                </div>
              </div>

              <div style={{ position: "absolute", top: "3vh", right: "3.2vw", height: "20vw" }}>
                <IsoButtons size={size} setSize={setSize} sizeOfPaper={{
                  x: Number(material.x),
                  y: Number(material.y),
                }} material={material} />
              </div>

              <MDBContainer fluid style={{ width: "100%", marginLeft: "-1vw", marginTop: "2vh" }}>
                <Row xs={1} md={6} className="">
                  <div className="d-flex flex-column">
                    <NewNoModalSize
                      size={size}
                      setSize={setSize}
                      prices={prices}
                      type={"SheetCut"}
                      buttonsArr={["односторонній", "двосторонній"]}
                      color={color}
                      setColor={setColor}
                      count={count}
                      setCount={setCount}
                      defaultt={"А3 (297 х 420 мм)"}
                    />

                    <Materials2
                      material={material}
                      setMaterial={setMaterial}
                      setError={null}
                      count={count}
                      setCount={setCount}
                      prices={prices}
                      size={size}
                      selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                      name={"Чорно-білий друк на монохромному принтері:"}
                      buttonsArr={["Офісний", "Тонкий", "Середній", "Цупкий", "Самоклеючі"]}
                      typeUse={null}
                      typeOfPosluga={"NewSheetCut"}
                    />

                    {error && (
                      <div
                        style={{
                          transition: "all 0.3s ease",
                          color: "#d00416",
                          width: "40vw",
                          display: "flex",
                          justifyContent: "start",
                          alignItems: "center",
                          fontWeight: "700",
                          border: "none",
                          borderRadius: "10px",
                          paddingLeft: "2vw",
                          backgroundColor: "transparent",
                          textAlign: "center",
                          cursor: "pointer",
                          animation: "blink 1s linear infinite",
                        }}
                      >
                        {error.response?.data?.error || "Помилка"}
                        <style>
                          {`
                            @keyframes blink {
                              0%, 50%, 100% { opacity: 1; }
                              25%, 75% { opacity: 0; }
                            }
                          `}
                        </style>
                      </div>
                    )}

                    <NewNoModalLamination
                      className="d-flex justify-content-start align-items-center"
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
                    />

                    <NewNoModalCornerRounding
                      className="d-flex justify-content-start align-items-center"
                      big={big}
                      setBig={setBig}
                      prices={prices}
                      type={"SheetCut"}
                      buttonsArr={[]}
                      selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                    />

                    <NewNoModalCute
                      className="d-flex justify-content-start align-items-center"
                      cute={cute}
                      setCute={setCute}
                      cuteLocal={cuteLocal}
                      setCuteLocal={setCuteLocal}
                      prices={prices}
                      type={"SheetCut"}
                      buttonsArr={[]}
                      selectArr={["3", "6", "8", "10", "13"]}
                    />

                    <NewNoModalHoles
                      className="d-flex justify-content-start align-items-center"
                      holes={holes}
                      setHoles={setHoles}
                      holesR={holesR}
                      setHolesR={setHolesR}
                      prices={prices}
                      type={"SheetCut"}
                      buttonsArr={[]}
                      selectArr={["", "3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                    />

                    <NewNoModalProkleyka
                      className="d-flex justify-content-start align-items-center"
                      prokleyka={prokleyka}
                      setProkleyka={setProkleyka}
                      prices={prices}
                      type={"SheetCut"}
                      buttonsArr={[]}
                      selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                    />

                    <NewNoModalLyuversy
                      className="d-flex justify-content-start align-items-center"
                      lyuversy={lyuversy}
                      setLyuversy={setLyuversy}
                      type={"SheetCut"}
                      buttonsArr={[]}
                      selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                    />

                    <Porizka
                      className="d-flex justify-content-start align-items-center"
                      porizka={porizka}
                      setPorizka={setPorizka}
                      prices={prices}
                      type={"SheetCut"}
                    />
                  </div>
                </Row>

                <div className="d-flex">
                  {thisOrder && (
                    <div
                      className="d-flex align-content-between justify-content-between"
                      style={{
                        width: "90vw",
                        marginLeft: "2.5vw",
                        fontWeight: "500",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "3vw",
                      }}
                    >
                      <button className="adminButtonAdd" variant="danger" onClick={addNewOrderUnit}>
                        {isEdit ? "Зберегти зміни" : "Додати до замовлення"}
                      </button>
                    </div>
                  )}
                </div>

                {null === pricesThis ? (
                  <div style={{ width: "50vw" }}></div>
                ) : (
                  <div className="d-flex justify-content-between pricesBlockContainer">
                    <div className="">
                      <div className="fontInfoForPricing">
                        Друк: {fmt2(pricesThis.priceDrukPerSheet)} грн&nbsp;* {pricesThis.sheetCount} шт&nbsp;=&nbsp;
                        {fmt2(pricesThis.priceDrukPerSheet * pricesThis.sheetCount)} грн
                      </div>

                      <div className="fontInfoForPricing">
                        Матеріали: {fmt2(pricesThis.pricePaperPerSheet)} грн&nbsp;* {pricesThis.sheetCount} шт&nbsp;=&nbsp;
                        {fmt2(pricesThis.pricePaperPerSheet * pricesThis.sheetCount)} грн
                      </div>

                      <div className="fontInfoForPricing">
                        Ламінація: {fmt2(pricesThis.priceLaminationPerSheet)} грн&nbsp;* {pricesThis.sheetCount} шт&nbsp;=&nbsp;
                        {fmt2(pricesThis.priceLaminationPerSheet * pricesThis.sheetCount)} грн
                      </div>

                      <div className="fontInfoForPricing">
                        Згинання: {pricesThis.big.pricePerUnit} грн * {pricesThis.big.count} шт = {pricesThis.big.totalPrice} грн
                      </div>

                      <div className="fontInfoForPricing">
                        Скруглення кутів: {pricesThis.cute.pricePerUnit} грн * {pricesThis.cute.count} шт = {pricesThis.cute.totalPrice} грн
                      </div>

                      <div className="fontInfoForPricing">
                        Свердління отворів: {pricesThis.holes.pricePerUnit} грн * {pricesThis.holes.count} шт = {pricesThis.holes.totalPrice} грн
                      </div>

                      <div className="fontInfoForPricing">
                        Проклейка: {pricesThis.prokleyka.pricePerUnit} грн * {pricesThis.prokleyka.count} шт = {pricesThis.prokleyka.totalPrice} грн
                      </div>

                      <div className="fontInfoForPricing">
                        Люверси: {pricesThis.lyuversy.pricePerUnit} грн * {pricesThis.lyuversy.count} шт = {pricesThis.lyuversy.totalPrice} грн
                      </div>

                      {pricesThis.porizka !== 0 && (
                        <div className="fontInfoForPricing">Порізка: {pricesThis.porizka} грн</div>
                      )}

                      <div className="fontInfoForPricing1" style={{ marginTop: "0.5vw", color: "#d5091b" }}>
                        Загалом =: {(parseFloat(pricesThis.price / count).toFixed(2) * count).toFixed(2)} грн
                      </div>

                      <div className="fontInfoForPricing">
                        - З одного аркуша можна виробити: {pricesThis.sheetsPerUnit} шт
                      </div>

                      <div className="fontInfoForPricing">
                        - Використано аркушів(А3/SrA3/SrA3+): {pricesThis.sheetCount} шт
                      </div>

                      <div
                        style={{
                          position: "absolute",
                          bottom: "1vh",
                          right: "0.5vw",
                          textAlign: "right",
                          opacity: "0.5",
                          fontSize: "0.7vh",
                        }}
                      >
                        <div className="fontInfoForPricing" style={{ fontSize: "0.8vw" }}>
                          Вартість аркуша з постпресс обробкою : &nbsp;{fmt2(pricesThis.priceForSheetWithExtras)} грн
                        </div>

                        <div className="fontInfoForPricing" style={{ fontSize: "0.8vw" }}>
                          Вартість аркуша (лише матеріал та друк): &nbsp;{fmt2(pricesThis.priceForSheetMaterialPrint)} грн
                        </div>
                      </div>

                      <div className="fontInfoForPricing1">За 1 виріб: {(pricesThis.price / count).toFixed(2)} грн</div>
                    </div>

                    <img className="versant80-img-icon" alt="sssss" src={versantIcon} />
                  </div>
                )}
              </MDBContainer>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "none" }}></div>
      )}
    </>
  );

  // (твій старий return нижче був недосяжним — залишати не потрібно)
};

export default NewSheetCut;
