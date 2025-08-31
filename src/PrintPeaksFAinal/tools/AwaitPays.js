import {MDBContainer} from "mdb-react-ui-kit";
import {Row} from "react-bootstrap";
import React, {useCallback, useEffect, useState} from "react";
import axios from '../../api/axiosInstance';
import Loader from "../../components/calc/Loader";
import {useNavigate} from "react-router-dom";

const AwaitPays = ({
                       thisOrder, showAwaitPays, setShowAwaitPays
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
      setShowAwaitPays(false);
    }, 300); // После завершения анимации скрываем модальное окно
  }
  const handleShow = useCallback((event) => {
    setShowAwaitPays(true);
  }, []);

  const addNewOrderUnit = e => {
    let dataToSend = {
      orderId: thisOrder.id,
    };
    axios.post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then(response => {
        // console.log(response.data);
      })
      .catch(error => {
        if (error.response.status === 403) {
          navigate('/login');
        }
        console.log(error.message);
        // setErr(error)
      });
  }

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

  useEffect(() => {
    if (showAwaitPays) {
      setIsVisible(true); // Сначала показываем модальное окно
      setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
    } else {
      setIsAnimating(false); // Начинаем анимацию закрытия
      setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
    }
  }, [showAwaitPays]);

  return (
    <>
      {isVisible === true ? (
        <div>
          <div
            style={{
              width: "100vw",
              zIndex: "99",
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
            zIndex: "100",
            position: "fixed",
            background: "#dcd9ce",
            top: "50%",
            left: "50%",
            transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.8)", // анимация масштаба
            opacity: isAnimating ? 1 : 0, // анимация прозрачности
            transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out", // плавная анимация
            borderRadius: "1vw",
            width: "95vw",
            height: "95vh",
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
            }}> У кількості:

            </div>
            <div className="d-flex flex-column" style={{marginLeft: "1vw", marginTop: "1vw"}}>
              <MDBContainer fluid style={{width: '100%'}}>
                <Row xs={1} md={6} className="">

                </Row>
              </MDBContainer>
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

export default AwaitPays;
