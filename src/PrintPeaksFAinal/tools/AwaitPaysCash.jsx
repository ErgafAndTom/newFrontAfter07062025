import {MDBContainer} from "mdb-react-ui-kit";
import {Row} from "react-bootstrap";
import React, {useCallback, useEffect, useState} from "react";
import axios from '../../api/axiosInstance';
import Loader from "../../components/calc/Loader";
import {useNavigate} from "react-router-dom";

const AwaitPaysCash = ({
                     thisOrder, setThisOrder, showAwaitCashPays, setShowAwaitCashPays, setOplata, oplata
                   }) => {
  const [load, setLoad] = useState(false);
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(null);
  const handleClose = () => {
    setIsAnimating(false); // Начинаем анимацию закрытия
    setTimeout(() => {
      setIsVisible(false)
      setShowAwaitCashPays(false);
    }, 300); // После завершения анимации скрываем модальное окно
  }
  const handleShow = useCallback((event) => {
    setShowAwaitCashPays(true);
  }, []);

  // const addNewOrderUnit = e => {
  //   let dataToSend = {
  //     orderId: thisOrder.id,
  //   };
  //   axios.post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
  //     .then(response => {
  //       // console.log(response.data);
  //     })
  //     .catch(error => {
  //       if (error.response.status === 403) {
  //         navigate('/login');
  //       }
  //       console.log(error.message);
  //       // setErr(error)
  //     });
  // }

  // useEffect(() => {
  //   let dataToSend = {
  //     type: "PerepletMet",
  //   }
  //   axios.post(`/calc/pricing`, dataToSend)
  //     .then(response => {
  //       console.log(response.data);
  //       setPricesThis(response.data.prices)
  //       setError(null)
  //     })
  //     .catch(error => {
  //       setError(error)
  //       if (error.response.status === 403) {
  //         navigate('/login');
  //       }
  //       console.log(error.message);
  //     })
  // }, []);

  const handleOk = async () => {
    // try {
    //   setOplata(true);
    //   const response = await axios.post("/api/payment/create-invoice-cash", { // 👈 змінив шлях
    //     orderId: thisOrder.id,
    //     amount: Math.round(thisOrder.allPrice * 100),
    //     currency: 980,
    //     // terminalId: "PQ012563",
    //   });
    //   console.log(response.data);
    //   if (response.data) {
    //     setOplata(false);
    //     setThisOrder((prev) => ({
    //       ...prev,
    //       Payment: response.data,
    //     }));
    //   }
    //   if (data?.payment) {
    //     setThisOrder((prev) => ({ ...prev, Payment: data.payment }));
    //   }
    // } catch (err) {
    //   console.error("Помилка оплати через POS:", err);
    // }
  };

  useEffect(() => {
    if (showAwaitCashPays) {
      setIsVisible(true); // Сначала показываем модальное окно
      setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
    } else {
      setIsAnimating(false); // Начинаем анимацию закрытия
      setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
    }
  }, [showAwaitCashPays]);

  return (
    <>
      {isVisible === true ? (
        <div>
          <div
            style={{
              width: "100vw",
              zIndex: "999",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.5)",
              opacity: isAnimating ? 1 : 0, // для анимации прозрачности
              transition: "opacity 0.3s ease-in-out", // плавная анимация
              position: "fixed",
              left: "0",
              bottom: "0"
            }}
            onClick={handleClose}
          ></div>
          <div className="d-flex flex-column" style={{
            zIndex: "1000",
            position: "fixed",
            background: "#dcd9ce",
            top: "70%",
            left: "50%",
            transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.8)", // анимация масштаба
            opacity: isAnimating ? 1 : 0, // анимация прозрачности
            transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out", // плавная анимация
            borderRadius: "1vw",
            width: "30vw",
            height: "30vh",
            // padding: "20px"
          }}>
            <div className="d-flex">
              <div className="m-auto text-center fontProductName">
                {/*Перепліт*/}
              </div>
              <div
                className="btn btn-close btn-lg"
                style={{
                  margin: "0.5vw",
                }}
                onClick={handleClose}
              >
              </div>

            </div>
            <div className="d-flex flex-row inputsArtemkilk allArtemElem" style={{
              marginLeft: "1.7vw",
              border: "transparent",
              justifyContent: "left",
              marginTop: "1vw"
            }}> *працюєш з кешем*

            </div>
            <div className="d-flex flex-column" style={{marginLeft: "1vw", marginTop: "1vw"}}>
              <MDBContainer fluid style={{width: '100%'}}>
                <Row xs={1} md={6} className="">

                </Row>
              </MDBContainer>
            </div>

            <div>
              <button
                className="PayButtons adminButtonAdd adminTextBigPay cash"
                onClick={() => handleOk()}
              >
                Ок
              </button>

              <button
                className="PayButtons adminButtonAdd adminTextBigPay cash"
                onClick={() => handleClose()}
              >
                Відміна
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{display: "none"}}
        ></div>
      )}
    </>
  )

  return (
    <div>
      <Loader/>
    </div>
  )
};

export default AwaitPaysCash;
