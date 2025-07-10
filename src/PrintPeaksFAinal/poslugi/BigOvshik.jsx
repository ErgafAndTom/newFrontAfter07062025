import {MDBContainer} from "mdb-react-ui-kit";
import {Row} from "react-bootstrap";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import axios from '../../api/axiosInstance';
import Loader from "../../components/calc/Loader";
import NewNoModalCornerRounding from "./newnomodals/NewNoModalBig";
import NewNoModalCute from "./newnomodals/NewNoModalCute";
import NewNoModalHoles from "./newnomodals/NewNoModalHoles";
import NewNoModalProkleka from "./newnomodals/NewNoModalProkleka";
import versantIcon from '../../components/newUIArtem/printers/binder.svg';
import {useNavigate} from "react-router-dom";

const BigOvshik = ({
                     thisOrder,
                     setThisOrder,
                     selectedThings2,
                     setSelectedThings2,
                     showBigOvshik,
                     setShowBigOvshik
                   }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(null);

  const [size, setSize] = useState({ x: 297, y: 420 });
  const [material, setMaterial] = useState({
    type: "Не потрібно", thickness: "Тонкі", material: "",
    materialId: "", typeUse: null
  });
  const [color, setColor] = useState({
    sides: "Не потрібно", one: "", two: "", allSidesColor: "CMYK"
  });
  const [big, setBig] = useState("Не потрібно");
  const [prokleka, setProkleka] = useState("Не потрібно");
  const [cute, setCute] = useState("Не потрібно");
  const [cuteLocal, setCuteLocal] = useState({
    leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: ""
  });
  const [holes, setHoles] = useState("Не потрібно");
  const [holesR, setHolesR] = useState("");
  const [design, setDesign] = useState("Не потрібно");
  const [count, setCount] = useState(1);
  const [pricesThis, setPricesThis] = useState({});

  const totalPriceFull = useMemo(() => (
    (Number(pricesThis?.big?.totalPrice) || 0) +
    (Number(pricesThis?.prokleka?.totalPrice) || 0) +
    (Number(pricesThis?.cute?.totalPrice) || 0) +
    (Number(pricesThis?.holes?.totalPrice) || 0) +
    (Number(pricesThis?.design?.totalPrice) || 0)
  ), [pricesThis]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      setShowBigOvshik(false);
    }, 300);
  }

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
      size, material, color,
      big, prokleka, cute, cuteLocal,
      holes, holesR, count, design
    };
    axios.post(`/calc/pricing`, dataToSend)
      .then(response => {
        const data = response.data.prices;
        setPricesThis({
          ...data,
          prokleka: (typeof data.prokleka === "string" || !data.prokleka)
            ? { pricePerUnit: 0, count: 0, totalPrice: 0 }
            : data.prokleka,
          design: data.design || { pricePerUnit: 0, totalPrice: 0 }
        });
      })

      .catch(error => {
        if (error.response.status === 403) navigate('/login');
        console.log(error.message);
      })
  }, [size, material, color, big, prokleka, cute, cuteLocal, holes, holesR, count]);

  useEffect(() => {
    setPricesThis(prev => ({
      ...prev,
      design: {
        pricePerUnit: design === "Не потрібно" ? 0 : parseFloat(design) || 0,
        totalPrice: design === "Не потрібно" ? 0 : parseFloat(design) || 0
      }
    }));
  }, [design]);


  return isVisible ? (
    <div>
      <div style={{
        width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)",
        opacity: isAnimating ? 1 : 0, transition: "opacity 0.3s", position: "fixed",
        zIndex: "99", left: 0, bottom: 0
      }} onClick={handleClose}></div>

      <div className="d-flex flex-column" style={{
        zIndex: "100", position: "fixed", background: "#dcd9ce",
        top: "50%", left: "50%",
        transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.8)",
        opacity: isAnimating ? 1 : 0,
        transition: "opacity 0.3s, transform 0.3s",
        borderRadius: "1vw", width: "95vw", height: "95vh"
      }}>
        <div className="d-flex">
          <div className="m-auto text-center fontProductName"></div>
          <div className="btn btn-close btn-lg" style={{ margin: "0.5vw" }} onClick={handleClose}></div>
        </div>

        <MDBContainer fluid style={{ width: '100%' }}>
          <Row xs={1} md={6}>
            <div className="d-flex flex-column">
              <div className="d-flex flex-row inputsArtemkilk allArtemElem" style={{
                marginLeft: "1.4vw", justifyContent: "left", marginTop: "1vw"
              }}>
                У кількості:
                <input type="number" value={count} min={1}
                       onChange={(e) => setCount(e.target.value)}
                       className="d-flex inputsArtemNumber inputsArtem"
                       style={{ marginLeft: "1vw", paddingLeft: "0.5vw" }}
                />
                <div className="inputsArtemx allArtemElem" style={{ marginTop: "-2vh" }}> шт</div>
              </div>

              <NewNoModalCornerRounding
                big={big}
                setBig={setBig}
                type={"SheetCut"}
                buttonsArr={[]}
                selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}

              />
              <NewNoModalProkleka
                prokleka={prokleka}
                setProkleka={setProkleka}
                type={"SheetCut"}
                buttonsArr={[]}
                selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
              />
              <NewNoModalCute cute={cute} setCute={setCute} cuteLocal={cuteLocal} setCuteLocal={setCuteLocal} type={"SheetCut"} selectArr={["3", "6", "8", "10", "13"]}/>
              <NewNoModalHoles holes={holes} setHoles={setHoles} holesR={holesR} setHolesR={setHolesR} type={"SheetCut"} selectArr={["", "3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]} />

              <div className="d-flex allArtemElem" style={{ alignItems: 'center' }}>
                <div className={`toggleContainer scale04ForButtonToggle ${design === "Не потрібно" ? 'disabledCont' : 'enabledCont'}`}
                     onClick={() => setDesign(design === "Не потрібно" ? "0" : "Не потрібно")}>
                  <div className={`toggle-button ${design === "Не потрібно" ? 'disabled' : 'enabledd'}`} />
                </div>
                <div className="d-flex flex-row align-items-center" style={{ marginLeft: '0.6vw' }}>
                  <span>Дизайн:</span>
                  <input type="number" min={0} value={design === "Не потрібно" ? "0" : design}
                         onChange={(e) => setDesign(e.target.value)}
                         style={{ width: '5vw', marginLeft: '0.5vw' }} className="inputsArtem" />
                  <div className="inputsArtemx" style={{ border: "transparent" }}> грн</div>
                </div>
              </div>
              {thisOrder && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2vh' }}>
                  <button className="adminButtonAdd" onClick={() => addNewOrderUnit()}>
                    Додати до замовлення
                  </button>
                </div>
              )}
            </div>

          </Row>


          <div className="d-flex justify-content-between pricesBlockContainer" style={{ height: "20vmin" }}>
            <div style={{ height: "19vmin" }}>
              <div className="fontInfoForPricing">
                Згинання: {(Number(pricesThis?.big?.pricePerUnit) || 0).toFixed(2)} грн
                * {(Number(pricesThis?.big?.count) || 0)} = {(Number(pricesThis?.big?.totalPrice) || 0).toFixed(2)} грн
              </div>
              <div className="fontInfoForPricing">
                Проклейка: {(Number(pricesThis?.prokleka?.pricePerUnit) || 0).toFixed(2)} грн
                * {(Number(pricesThis?.prokleka?.count) || 0)} = {(Number(pricesThis?.prokleka?.totalPrice) || 0).toFixed(2)} грн
              </div>
              <div className="fontInfoForPricing">
                Свердління: {(Number(pricesThis?.cute?.pricePerUnit) || 0).toFixed(2)} грн
                * {(Number(pricesThis?.cute?.count) || 0)} = {(Number(pricesThis?.cute?.totalPrice) || 0).toFixed(2)} грн
              </div>
              <div className="fontInfoForPricing">
                Скруглення: {(Number(pricesThis?.holes?.pricePerUnit) || 0).toFixed(2)} грн
                * {(Number(pricesThis?.holes?.count) || 0)} = {(Number(pricesThis?.holes?.totalPrice) || 0).toFixed(2)} грн
              </div>
              <div className="fontInfoForPricing">
                Дизайн: {(Number(pricesThis?.design?.pricePerUnit) || 0).toFixed(2)} грн
                = {(Number(pricesThis?.design?.totalPrice) || 0).toFixed(2)} грн
              </div>
              <div className="fontInfoForPricing1">
                Загалом: {totalPriceFull.toFixed(2)} грн
              </div>
            </div>
            <img src={versantIcon} style={{ height: "16vmin", marginLeft: "15vmin", marginRight: "2vmin" }} alt="printer"/>
          </div>
        </MDBContainer>
      </div>
    </div>
  ) : <Loader />;
}

export default BigOvshik;
