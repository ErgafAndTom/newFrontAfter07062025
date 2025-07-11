import React, { useEffect, useMemo, useState } from "react";
import { MDBContainer } from "mdb-react-ui-kit";
import { Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import NewNoModalLyuversy  from "./newnomodals/NewNoModalLyuversy";
import Loader from "../../components/calc/Loader";
import NewNoModalCornerRounding from "./newnomodals/NewNoModalBig";
import NewNoModalCute from "./newnomodals/NewNoModalCute";
import NewNoModalHoles from "./newnomodals/NewNoModalHoles";
import NewNoModalProkleyka from "./newnomodals/NewNoModalProkleyka";

import versantIcon from "../../components/newUIArtem/printers/binder.svg";

const emptyPrice = { pricePerUnit: 0, count: 0, totalPrice: 0 };

const normalize = (obj = {}) => ({
  pricePerUnit: Number(obj.pricePerUnit) || 0,
  count:        Number(obj.count)        || 0,
  totalPrice:   Number(obj.totalPrice)   || 0
});

const fmt2 = v =>
  new Intl.NumberFormat("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Number(v));

const BigOvshik = ({
                     thisOrder,
                     showBigOvshik,
                     setShowBigOvshik
                   }) => {
  const navigate = useNavigate();

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [size] = useState({ x: 297, y: 420 });
  const [material] = useState({
    type: "Не потрібно",
    thickness: "Тонкі",
    material: "",
    materialId: "",
    typeUse: null
  });
  const [color] = useState({
    sides: "Не потрібно",
    one: "",
    two: "",
    allSidesColor: "CMYK"
  });

  const [big, setBig] = useState("Не потрібно");
  const [prokleyka, setProkleyka] = useState("Не потрібно");
  const [lyuversy,  setLyuversy]  = useState("Не потрібно");
  const [cute, setCute] = useState("Не потрібно");
  const [cuteLocal, setCuteLocal] = useState({
    leftTop: false,
    rightTop: false,
    rightBottom: false,
    leftBottom: false,
    radius: ""
  });
  const [holes, setHoles] = useState("Не потрібно");
  const [holesR, setHolesR] = useState("");
  const [design, setDesign] = useState("Не потрібно");
  const [count, setCount] = useState(1);

  const [pricesThis, setPricesThis] = useState({
    big: emptyPrice,
    prokleyka: emptyPrice,
    lyuversy:  emptyPrice,
    cute: emptyPrice,
    holes: emptyPrice,
    design: { pricePerUnit: 0, totalPrice: 0 }
  });

  const totalPriceFull = useMemo(
    () =>
      pricesThis.big.totalPrice +
      pricesThis.prokleyka.totalPrice +
      pricesThis.lyuversy.totalPrice +
      pricesThis.cute.totalPrice +
      pricesThis.holes.totalPrice +
      pricesThis.design.totalPrice,
    [pricesThis]
  );

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

  useEffect(() => {
    const dataToSend = {
      type: "BigOvshik",
      size,
      material,
      color,
      big,
      prokleyka,
      lyuversy,
      cute,
      cuteLocal,
      holes,
      holesR,
      count,
      design
    };

    axios.post("/calc/pricing", dataToSend)
      .then(({ data }) => {
          const p = data?.prices ?? {};
          setPricesThis(prev => ({
              big:       normalize(p.big),
              prokleyka: normalize(p.prokleyka),
              lyuversy:  normalize(p.lyuversy),
              cute:      normalize(p.cute),
              holes:     normalize(p.holes),
              design:    prev.design
          }));
        })
      .catch(err => {
        if (err.response?.status === 403) navigate("/login");
        console.log(err.message);
      });
  }, [big, prokleyka, cute, cuteLocal, holes, holesR, count, design, lyuversy, navigate]);

  useEffect(() => {
    setPricesThis(prev => ({
      ...prev,
      design: {
        pricePerUnit: design === "Не потрібно" ? 0 : Number(design) || 0,
        totalPrice:   design === "Не потрібно" ? 0 : Number(design) || 0
      }
    }));
  }, [design]);

  const addNewOrderUnit = () => {
    // TODO: реалізація додавання позиції у замовлення
  };

  if (!isVisible) return <Loader />;

  return (
    <div>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.5)",
          opacity: isAnimating ? 1 : 0,
          transition: "opacity 0.3s",
          position: "fixed",
          zIndex: 99,
          left: 0,
          bottom: 0
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
          height: "95vh"
        }}
      >
        <div className="d-flex">
          <div className="m-auto fontProductName" />
          <div className="btn btn-close btn-lg" style={{ margin: "0.5vw" }} onClick={handleClose} />
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
                  onChange={e => setCount(Number(e.target.value))}
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
                selectArr={["", "1","2","3","4","5","6","7","8","9"]}
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

              <div className="d-flex allArtemElem" style={{ alignItems: "center" }}>
                <div
                  className={`toggleContainer scale04ForButtonToggle ${
                    design === "Не потрібно" ? "disabledCont" : "enabledCont"
                  }`}
                  onClick={() =>
                    setDesign(design === "Не потрібно" ? "0" : "Не потрібно")
                  }
                >
                  <div className={`toggle-button ${design === "Не потрібно" ? "disabled" : "enabledd"}`} />
                </div>

                  <div className="d-flex flex-row align-items-center" style={{  }}>
                    <span>Дизайн:</span>
                    {design !== "Не потрібно" && (
                      <div className={'d-flex'}>
                    <input
                      type="number"
                      min={0}
                      value={design}
                      onChange={e => setDesign(e.target.value)}
                      style={{ width:"5vw", marginLeft:"0.5vw" }}
                      className="inputsArtem"
                    />
                      <div className="inputsArtemx" style={{ border:"transparent" }}>грн</div>
                      </div>
                    )}




                  </div>

              </div>

              {thisOrder && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "2vh" }}>
                  <button className="adminButtonAdd" onClick={addNewOrderUnit}>
                    Додати до замовлення
                  </button>
                </div>
              )}
            </div>
          </Row>

          <div className="d-flex justify-content-between pricesBlockContainer" style={{ height: "20vmin" }}>
            <div style={{ height: "19vmin" }}>
              <div className="fontInfoForPricing">
                Згинання: {fmt2(pricesThis.big.pricePerUnit)} грн * {pricesThis.big.count} = {fmt2(pricesThis.big.totalPrice)} грн
              </div>
              <div className="fontInfoForPricing">
                Проклейка: {fmt2(pricesThis.prokleyka.pricePerUnit)} грн * {pricesThis.prokleyka.count} = {fmt2(pricesThis.prokleyka.totalPrice)} грн
              </div>
              <div className="fontInfoForPricing">
                Люверси: {fmt2(pricesThis.lyuversy.pricePerUnit)} грн * {pricesThis.lyuversy.count} = {fmt2(pricesThis.lyuversy.totalPrice)} грн
              </div>
              <div className="fontInfoForPricing">
                Скруглення: {fmt2(pricesThis.cute.pricePerUnit)} грн * {pricesThis.cute.count} = {fmt2(pricesThis.cute.totalPrice)} грн
              </div>
              <div className="fontInfoForPricing">
                Свердління: {fmt2(pricesThis.holes.pricePerUnit)} грн * {pricesThis.holes.count} = {fmt2(pricesThis.holes.totalPrice)} грн
              </div>
              <div className="fontInfoForPricing">
                Дизайн: {fmt2(pricesThis.design.pricePerUnit)} грн = {fmt2(pricesThis.design.totalPrice)} грн
              </div>
              <div className="fontInfoForPricing1">Загалом: {fmt2(totalPriceFull)} грн</div>
            </div>

            <img
              src={versantIcon}
              style={{ height: "16vmin", marginLeft: "15vmin", marginRight: "2vmin" }}
              alt="printer"
            />
          </div>
        </MDBContainer>
      </div>
    </div>
  );
};

export default BigOvshik;
