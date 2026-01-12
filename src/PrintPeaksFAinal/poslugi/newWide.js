import { MDBContainer } from "mdb-react-ui-kit";
import { Row } from "react-bootstrap";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from '../../api/axiosInstance';
import './newnomodals/ArtemStyles.css';
import versantIcon from "../public/wided@2x.png";
import NewNoModalSize from "./newnomodals/NewNoModalSizeColor";
import Materials2 from "./newnomodals/Materials2";
import SliderComponent from "./newnomodals/SlidersComponent";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/calc/Loader";

const DEFAULTS = {
  size: { x: 420, y: 594 },
  material: { type: "Папір Широкоформат", thickness: "", material: "", materialId: "" },
  color: { sides: "односторонній", one: "", two: "", allSidesColor: "CMYK" },
  lamination: { type: "Не потрібно", material: "" },
  big: "Не потрібно",
  cute: "Не потрібно",
  cuteLocal: { leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" },
  holes: "Не потрібно",
  holesR: "Не потрібно",
  count: 1,
  selectedService: "Плакат",
};

const NewWide = ({
  thisOrder,
  setShowNewWide,
  showNewWide,
  setThisOrder,
  setSelectedThings2,
  // для режиму редагування (як у Vishichka)
  editingOrderUnit,
  setEditingOrderUnit,
}) => {
  const navigate = useNavigate();

  const isEdit = Boolean(editingOrderUnit && (editingOrderUnit.id || editingOrderUnit.ID || editingOrderUnit.idKey));
// safe setters (щоб не ловити "... is not a function")
  const safeSetShowNewWide = useCallback((val) => {
    if (typeof setShowNewWide === "function") setShowNewWide(val);
  }, [setShowNewWide]);

  const safeSetEditingOrderUnit = useCallback((val) => {
    if (typeof setEditingOrderUnit === "function") setEditingOrderUnit(val);
  }, [setEditingOrderUnit]);

  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [size, setSize] = useState(DEFAULTS.size);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [color, setColor] = useState(DEFAULTS.color);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);
  const [big, setBig] = useState(DEFAULTS.big);
  const [cute, setCute] = useState(DEFAULTS.cute);
  const [cuteLocal, setCuteLocal] = useState(DEFAULTS.cuteLocal);
  const [holes, setHoles] = useState(DEFAULTS.holes);
  const [holesR, setHolesR] = useState(DEFAULTS.holesR);
  const [count, setCount] = useState(DEFAULTS.count);
  const [selectedService, setSelectedService] = useState(DEFAULTS.selectedService);

  const [prices, setPrices] = useState(null);
  const [pricesThis, setPricesThis] = useState(null);

  const handleChangeCount = (val) => {
    const n = Number(val);
    if (Number.isFinite(n) && n > 0) setCount(n);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      safeSetShowNewWide(false);
      // важливо: після закриття скинути editing, щоб наступне відкриття було NEW
      safeSetEditingOrderUnit(null);
    }, 300);
  };

  // Завантаження прайсів (як і в інших модалках)
  useEffect(() => {
    axios.get(`/getpricesNew`)
      .then((response) => setPrices(response.data))
      .catch((e) => console.log(e?.message));
  }, []);

  // Показ/анімація модалки + гідрація стейтів (NEW vs EDIT)
  useEffect(() => {
    if (!showNewWide) {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
      return;
    }

    // open
    setIsVisible(true);
    setTimeout(() => setIsAnimating(true), 100);

    // hydrate like Vishichka:
    // - NEW: reset defaults
    // - EDIT: load from optionsJson (fallbacks)
    if (!isEdit) {
      setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setLamination(DEFAULTS.lamination);
      setBig(DEFAULTS.big);
      setCute(DEFAULTS.cute);
      setCuteLocal(DEFAULTS.cuteLocal);
      setHoles(DEFAULTS.holes);
      setHolesR(DEFAULTS.holesR);
      setCount(DEFAULTS.count);
      setSelectedService(DEFAULTS.selectedService);
      setError(null);
      setPricesThis(null);
      return;
    }

    let opts = {};
    try {
      if (editingOrderUnit?.optionsJson) {
        opts = JSON.parse(editingOrderUnit.optionsJson) || {};
      }
    } catch (e) {
      opts = {};
    }

    const sizeFromFields = (editingOrderUnit?.newField2 && editingOrderUnit?.newField3)
      ? { x: Number(editingOrderUnit.newField2) || DEFAULTS.size.x, y: Number(editingOrderUnit.newField3) || DEFAULTS.size.y }
      : null;
    setSize(opts.size || sizeFromFields || editingOrderUnit?.size || DEFAULTS.size);
    setMaterial(opts.material || editingOrderUnit?.material || DEFAULTS.material);
    setColor(opts.color || DEFAULTS.color);
    setLamination(opts.lamination || DEFAULTS.lamination);
    setBig(opts.big ?? DEFAULTS.big);
    setCute(opts.cute ?? DEFAULTS.cute);
    setCuteLocal(opts.cuteLocal || DEFAULTS.cuteLocal);
    setHoles(opts.holes ?? DEFAULTS.holes);
    setHolesR(opts.holesR ?? DEFAULTS.holesR);

    const cnt =
      opts.count ??
      editingOrderUnit?.amount ??
      editingOrderUnit?.newField5 ?? editingOrderUnit?.newField2 ?? DEFAULTS.count;
    setCount(Number(cnt) > 0 ? Number(cnt) : DEFAULTS.count);

    const svc =
      opts.selectedService ||
      opts.newField1 ||
      editingOrderUnit?.newField1 ||
      DEFAULTS.selectedService;
    setSelectedService(svc);

    setError(null);
    setPricesThis(null);
  }, [showNewWide, isEdit, editingOrderUnit, safeSetEditingOrderUnit, safeSetShowNewWide]);

  // Pricing (не стріляємо, якщо модалка закрита)
  useEffect(() => {
    if (!showNewWide) return;

    const dataToSend = {
      type: "Wide",
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
    };

    axios.post(`/calc/pricing`, dataToSend)
      .then((response) => {
        setPricesThis(response.data.prices);
        setError(null);
      })
      .catch((e) => {
        console.log(e?.message);
        setError(e);
      });
  }, [showNewWide, size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count]);

  const saveOrderUnit = () => {
    if (!thisOrder?.id) return;

    const toCalc = {
      nameOrderUnit: selectedService ? `${selectedService.toLowerCase()} ` : "",
      type: "Wide",
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
      selectedService,
      newField1: selectedService,
    };

    const dataToSend = {
      orderId: thisOrder.id,
      ...(isEdit ? { orderUnitId: (editingOrderUnit.id || editingOrderUnit.ID || editingOrderUnit.idKey), idKey: editingOrderUnit.idKey } : {}),
      toCalc,
    };

    setLoad(true);
    axios.post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then((response) => {
        setThisOrder?.(response.data);
        setSelectedThings2?.(response.data.OrderUnits);
        safeSetShowNewWide(false);
        safeSetEditingOrderUnit(null);
      })
      .catch((e) => {
        setError(e);
        if (e?.response?.status === 403) navigate('/login');
        console.log(e?.message);
      })
      .finally(() => setLoad(false));
  };

  if (!isVisible) return <div style={{ display: "none" }} />;

  return (
    <>
      <div>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 15, 15, 0.45)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            zIndex: 99,
            opacity: isAnimating ? 1 : 0,
            transition: 'opacity 200ms ease'
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
            transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.8)",
            opacity: isAnimating ? 1 : 0,
            transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
            borderRadius: "1vw",
            width: "95vw",
            height: "95vh",
          }}
        >
          <div className="d-flex">
            <div className="m-auto text-center fontProductName">
              <div className="d-flex flex-wrap justify-content-center">
                {["Плакат", "Креслення", "Фотографія", "Афіша", "Лекала", "Холст"].map((service, index) => (
                  <button
                    key={index}
                    className={`btn ${selectedService === service ? 'adminButtonAdd' : 'adminButtonAdd-primary'} m-1`}
                    style={{ minWidth: "5vw" }}
                    onClick={() => setSelectedService(service)}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="btn btn-close btn-lg"
              style={{ margin: "0.5vw" }}
              onClick={handleClose}
            />
          </div>

          <div className="d-flex flex-column" style={{ marginLeft: '-1vw' }}>
            <div
              className="d-flex flex-row inputsArtemkilk allArtemElem"
              style={{
                marginLeft: "2.5vw",
                border: "transparent",
                justifyContent: "left",
                marginTop: "1vw"
              }}
            >
              У кількості:
              <input
                className="d-flex inputsArtemNumber inputsArtem"
                style={{
                  marginLeft: "1vw",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingLeft: "0.5vw",
                }}
                type="number"
                value={count}
                min={1}
                onChange={(event) => handleChangeCount(event.target.value)}
              />
              <div className="inputsArtemx allArtemElem" style={{ border: "transparent", marginTop: "-2vh" }}>
                шт
              </div>
            </div>

            <MDBContainer fluid style={{ width: '100%', marginTop: '1vw' }}>
              <Row xs={1} md={6} className="d-flex">
                <div className="d-flex flex-column">
                  <NewNoModalSize
                    size={size}
                    setSize={setSize}
                    prices={prices}
                    type={"Wide"}
                    buttonsArr={["односторонній"]}
                    color={color}
                    setColor={setColor}
                    count={count}
                    setCount={setCount}
                  />
                  <SliderComponent
                    size={size}
                    setSize={setSize}
                    prices={prices}
                    type={"Wide"}
                    buttonsArr={["односторонній"]}
                    color={color}
                    setColor={setColor}
                    count={count}
                    setCount={setCount}
                  />
                  <Materials2
                    material={material}
                    setMaterial={setMaterial}
                    count={count}
                    setCount={setCount}
                    prices={prices}
                    size={size}
                    selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                    name={"Широкоформатний фотодрук:"}
                    buttonsArr={[]}
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
                      fontWeight: "bold",
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: "all 0.3s ease",
                      height: '5vw',
                    }}
                  >
                    <button className="adminButtonAdd" variant="danger" onClick={saveOrderUnit} disabled={load}>
                      {isEdit ? "Зберегти зміни" : "Додати до замовлення"}
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div style={{
                  transition: "all 0.3s ease",
                  color: "red",
                  width: "20vw",
                  marginLeft: "2.5vw",
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '3vw',
                  marginTop: "1vh",
                  marginBottom: "1vh",
                  border: "1px solid red",
                  borderRadius: "10px",
                  padding: "10px",
                  backgroundColor: "rgba(255, 0, 0, 0.2)",
                  fontSize: "1.5vw",
                  fontWeight: "bold",
                  textAlign: "center",
                  cursor: "pointer",
                }}>
                  {error?.response?.data?.error || error?.message || "Error"}
                </div>
              )}

              {pricesThis !== null && pricesThis !== undefined && (
                <div className="d-flex justify-content-between pricesBlockContainer" style={{ height: '20vmin' }}>
                  <div style={{ height: '19vmin' }}>
                    <div className="fontInfoForPricing">
                      Друк: {parseFloat(pricesThis.priceDrukPerSheet).toFixed(2)} грн * {pricesThis.sheetCount} м2
                      = {(parseFloat(pricesThis.priceDrukPerSheet) * pricesThis.sheetCount).toFixed(2)} грн
                    </div>

                    <div className="fontInfoForPricing">
                      Матеріали: {parseFloat(pricesThis.pricePaperPerSheet).toFixed(2)} грн * {pricesThis.sheetCount} м2
                      = {(parseFloat(pricesThis.pricePaperPerSheet) * pricesThis.sheetCount).toFixed(2)} грн
                    </div>

                    {pricesThis.porizka !== 0 && (
                      <div className="fontInfoForPricing">
                        Порізка: {parseFloat(pricesThis.porizka).toFixed(2)} грн * {pricesThis.sheetCount} шт
                        = {(parseFloat(pricesThis.porizka) * pricesThis.sheetCount).toFixed(2)} грн
                      </div>
                    )}

                    <div className="fontInfoForPricing1">
                      Загалом: {parseFloat(pricesThis.price).toFixed(2)} грн
                    </div>

                    <div className="fontInfoForPricing1">
                      Ціна за виріб: {parseFloat(pricesThis.priceForItemWithExtras).toFixed(2)} грн
                    </div>
                  </div>

                  <img
                    className="versant80-img-icon"
                    alt="wide"
                    src={versantIcon}
                    style={{ height: "17vmin", marginRight: "2vmin" }}
                  />
                </div>
              )}
            </MDBContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewWide;
