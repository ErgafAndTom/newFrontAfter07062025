import React, {useEffect, useState} from 'react';
import axios from "../../api/axiosInstance";
import Loader from "../../components/calc/Loader";

const ActivatorCheckPaymentStatus = ({order}) => {
  const [thisOrder, setThisOrder] = useState(order);
  const [load, setLoad] = useState(order);
  const checkStatus = async () => {
    if (!order.Payment) {
      return
    }
    if (order.Payment.invoiceId) {
      setLoad(true);
      const invoiceId = order.Payment.invoiceId;
      try {
        const {data} = await axios.get("/api/payment/invoice-status", {
          params: {invoiceId},
        });
        setLoad(false);
        console.log(data);
        setThisOrder((prev) => ({
          ...prev,
          Payment: data,
        }));
      } catch (err) {
        console.error("Помилка перевірки статусу:", err);
      }
    } else {

    }
  };

  useEffect(() => {
    if (thisOrder.Payment?.status === "CREATED") {
      checkStatus();
    }
  }, []);

  return (
    <>
      {thisOrder.Payment?.status === 'FAILED' &&
      <button className={`adminButtonAddOrder nopay`} style={{}}>
        {"Помилка або відмова"}
      </button>
      }


      {thisOrder.Payment?.status === 'PAID' &&
        <>
          {thisOrder.Payment && thisOrder.Payment.method === 'terminal' && (
            <div className={`adminButtonAddOrder pay`} style={{}}>
              {"Оплата карткою"}
            </div>
          )}
          {thisOrder.Payment && thisOrder.Payment.method === 'link' && (
            <div className={`adminButtonAddOrder pay`} style={{}}>
              {"Оплата за посиланням"}
            </div>
          )}
          {thisOrder.Payment && thisOrder.Payment.method === 'cash' && (
            <div className={`adminButtonAddOrder pay`} style={{}}>
              {"Оплата готівкрю"}
            </div>
          )}
          {thisOrder.Payment && thisOrder.Payment.method === null && (
            <div className={`adminButtonAddOrder pay`} style={{}}>
              {"Оплата за посиланням"}
            </div>
          )}
        </>
      }
      {thisOrder.Payment?.status === 'CANCELLED' &&
        <button className={`adminButtonAddOrder cancel`} style={{}}>
          {"Відміна"}
        </button>
      }
      {thisOrder.Payment?.status === 'EXPIRED' &&
        <button className={`adminButtonAddOrder nopay`} style={{}}>
          {"Прострочено"}
        </button>
      }
      {thisOrder.Payment?.status === 'FAILED' &&
        <button className={`adminButtonAddOrder nopay`} style={{}}>
          {"Помилка або відмова"}
        </button>
      }

      {thisOrder.Payment === null &&
        <button className={`adminButtonAddOrder nopay`} style={{color:'#000000'}}>
          {"-"}
        </button>
      }
      {thisOrder.Payment?.status === null &&
        <button className={`adminButtonAddOrder nopay`} style={{color:'#000000'}}>
          {"-"}
        </button>
      }

      {thisOrder.Payment?.status === 'CREATED' &&
        <div className={`adminButtonAddOrder wait`} style={{}}>
          {"Очікування️"}
          <>
            {load &&
              <Loader/>
            }
          </>
        </div>
      }
    </>
  );
};

export default ActivatorCheckPaymentStatus;
