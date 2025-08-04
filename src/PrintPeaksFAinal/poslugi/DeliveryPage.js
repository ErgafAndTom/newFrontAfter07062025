import { MDBContainer } from "mdb-react-ui-kit";
import { Row } from "react-bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import Loader from "../../components/calc/Loader";
import versantIcon from "../../components/newUIArtem/printers/delivery.png"; // додай свій ікон-ресурс
import { useNavigate } from "react-router-dom";

/**
 * Компонент оформлення та додавання доставки до замовлення
 * Повторює прийоми верстки та стилістику решти калькуляторів (ламінування тощо)
 */
const DeliveryPage = ({
                        thisOrder,
                        setThisOrder,
                        setSelectedThings2,
                        showDelivery,
                        setShowDelivery,
                      }) => {
  const navigate = useNavigate();

  /* === Локальний стан === */
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Форма доставки
  const [deliveryType, setDeliveryType] = useState("Нова Пошта");
  const [city, setCity] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [courierAddress, setCourierAddress] = useState("");
  const [cost, setCost] = useState(null);
  const [error, setError] = useState(null);

  /* === Закриття / відкриття модалки === */
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      setShowDelivery(false);
    }, 300);
  };

  const handleShow = useCallback(() => {
    setShowDelivery(true);
  }, []);

  /* === Розрахунок вартості доставки === */
  // useEffect(() => {
  //   if (!city) return; // бракує даних
  //
  //   const payload = {
  //     deliveryType,
  //     city,
  //     warehouse,
  //     courierAddress,
  //   };
  //
  //   axios
  //     .post("/calc/delivery", payload)
  //     .then((res) => {
  //       setCost(res.data.price);
  //       setError(null);
  //     })
  //     .catch((err) => {
  //       setError(err);
  //       if (err.response?.status === 403) navigate("/login");
  //     });
  // }, [deliveryType, city, warehouse, courierAddress]);

  /* === Ефект для плавного показу / приховання модалки === */
  useEffect(() => {
    if (showDelivery) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 100);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [showDelivery]);

  /* === Підтвердження та запис у замовлення === */
  const addDeliveryToOrder = () => {
    const dataToSend = {
      orderId: thisOrder.id,
      toCalc: {
        nameOrderUnit: "Доставка",
        type: "Delivery",
        deliveryType,
        city,
        warehouse,
        courierAddress,
        cost,

        size: { x: 0, y: 0 },
        material: {
          type: "Не потрібно"
        },
        color: {
          sides: "Не потрібно"
        },
        lamination: {
          type: "Не потрібно"
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
        holesR: "Не потрібно",
        count: city,
        price: warehouse
      },
    };

    axios
      .post("/orderUnits/OneOrder/OneOrderUnitInOrder", dataToSend)
      .then((response) => {
        setThisOrder(response.data);
        setSelectedThings2(response.data.OrderUnits);
        setShowDelivery(false);
      })
      .catch((err) => {
        if (err.response?.status === 403) navigate("/login");
        setError(err);
      });
  };

  /* === Рендер модального вікна === */
  if (!isVisible) return null;

  return (
    <>
      {/* Підкладка */}
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.5)",
          position: "fixed",
          left: 0,
          top: 0,
          opacity: isAnimating ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
          zIndex: 99,
        }}
        onClick={handleClose}
      />

      {/* Власне модалка */}
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
          transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
          borderRadius: "1vw",
          width: "95vw",
          height: "95vh",
        }}
      >
        {/* Заголовок + close */}
        <div className="d-flex">
          <div className="m-auto text-center fontProductName">Доставка</div>
          <div
            className="btn btn-close btn-lg"
            style={{ margin: "0.5vw" }}
            onClick={handleClose}
          />
        </div>

        {/* Форма */}
        <MDBContainer fluid>

            <div className="d-flex flex-column" style={{ marginLeft: "1.7vw", width:"10vw"}}>
              {/* Тип доставки */}

              {/*<div className="fontInfoForPricing">Тип доставки:*/}
              {/*<select*/}
              {/*  value={deliveryType}*/}
              {/*  onChange={(e) => setDeliveryType(e.target.value)}*/}
              {/*  className="inputsArtem"*/}
              {/*>*/}
              {/*  <option>Таксі </option>*/}
              {/*  <option>Кур'єр по Києву</option>*/}
              {/*  <option>Нова Пошта</option>*/}
              {/*</select>*/}
              {/*</div>*/}
              <>
                <div className={"d-flex flex-row align-items-center justify-content-start gap-3"}>
                  <label className="fontInfoForPricing">кількість</label>
                  <input
                    type="number"
                    min={1}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="inputsArtem"
                  />
                </div>
                <div className={"d-flex flex-row align-items-center justify-content-start gap-3"}>
                  <label className="fontInfoForPricing mt-2">ціна</label>
                  <input
                    type="number"
                    min={1}
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className="inputsArtem"
                  />
                </div>
              </>

              {/* Місто та склад / адреса */}

              {/*{deliveryType !== "Самовивіз" && (*/}

              {/*  <>*/}
              {/*    <div className={"d-flex flex-row align-items-center justify-content-start gap-3"}>*/}
              {/*      <label className="fontInfoForPricing">Місто:</label>*/}
              {/*      <input*/}
              {/*        type="number"*/}
              {/*        min={1}*/}
              {/*        value={city}*/}
              {/*        onChange={(e) => setCity(e.target.value)}*/}
              {/*        className="inputsArtem"*/}
              {/*      />*/}
              {/*    </div>*/}
              {/*    <div className={"d-flex flex-row align-items-center justify-content-start gap-3"}>*/}
              {/*      <label className="fontInfoForPricing mt-2">Відділення:</label>*/}
              {/*      <input*/}
              {/*        type="text"*/}
              {/*        value={warehouse}*/}
              {/*        onChange={(e) => setWarehouse(e.target.value)}*/}
              {/*        className="inputsArtem"*/}
              {/*      />*/}
              {/*    </div>*/}
              {/*  </>*/}

              {/*)}*/}


              {/*{deliveryType === "Нова Пошта" && (*/}
              {/*  <div className={"d-flex flex-row align-items-center justify-content-start gap-3"}>*/}
              {/*    <label className="fontInfoForPricing mt-2">Відділення:</label>*/}
              {/*    <input*/}
              {/*      type="text"*/}
              {/*      value={warehouse}*/}
              {/*      onChange={(e) => setWarehouse(e.target.value)}*/}
              {/*      className="inputsArtem"*/}
              {/*    />*/}
              {/*  </div>*/}
              {/*)}*/}

              {/*{deliveryType === "Кур'єр по Києву" && (*/}
              {/*  <>*/}
              {/*    <label className="fontInfoForPricing mt-2">Адреса доставки:</label>*/}
              {/*    <input*/}
              {/*      type="text"*/}
              {/*      value={courierAddress}*/}
              {/*      onChange={(e) => setCourierAddress(e.target.value)}*/}
              {/*      className="inputsArtem"*/}
              {/*    />*/}
              {/*  </>*/}
              {/*)}*/}
            </div>


          {/* Блок вартості + кнопка */}
          <div className="d-flex" style={{ marginLeft: "2.5vw"}}>
            <button className="adminButtonAdd" onClick={addDeliveryToOrder}
                    // disabled={!cost && deliveryType !== "Самовивіз"}
                    style={{background:"#fab416"}}>
              Додати до замовлення
            </button>
          </div>

          <div className="d-flex justify-content-between align-items-center pricesBlockContainer" style={{ height: "20vmin" }}>
            <div>
              {error && <div className="fontInfoForPricing">{error.message}</div>}
              {cost !== null && (
                <div className="fontInfoForPricing1">Вартість доставки: {cost} грн</div>
              )}
              {deliveryType === "Самовивіз" && (
                <div className="fontInfoForPricing1">Вартість: 0 грн</div>
              )}
            </div>
            <img className="lamination-img-icon" alt="delivery" src={versantIcon} />
          </div>
        </MDBContainer>
      </div>
    </>
  );
};

export default DeliveryPage;
