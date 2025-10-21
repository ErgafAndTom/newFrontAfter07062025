import React, { useEffect, useRef, useState } from 'react';
import axios from "./api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function DiscountCalculator({ thisOrder, setThisOrder, selectedThings2, setSelectedThings2 }) {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const inputRef = useRef(null);

  const [amount, setAmount] = useState(thisOrder?.price ?? 0);
  const [discount, setDiscount] = useState('0%');
  const [total, setTotal] = useState(thisOrder?.allPrice);
  const [error, setError] = useState(null);
  const [load, setLoad] = useState(false);

  const handleDiscountChange = async (value) => {
    if (currentUser?.role !== "admin") return;
    const dataToSend = {
      newDiscount: value,
      orderId: thisOrder.id,
    };
    try {
      setError(null);
      setLoad(true);
      const { data } = await axios.put(`/orders/OneOrder/discount`, dataToSend);
      setThisOrder(data);
      setSelectedThings2(data.OrderUnits);
    } catch (err) {
      if (err?.response?.status === 403) {
        navigate('/login');
        return;
      }
      setError(err.message || 'Помилка');
    } finally {
      setLoad(false);
    }
  };

  // 🔧 Гарантированно удаляем disabled, если кто-то его добавил
  // useEffect(() => {
  //   const el = inputRef.current;
  //   if (el && el.hasAttribute('disabled')) {
  //     el.removeAttribute('disabled');
  //   }
  // });

  return (
    <div
      className="d-flex justify-content-end align-items-end flex-column"
      style={{ width: "100%", whiteSpace: 'nowrap', paddingTop:"1vh",  }}
    >
      <div
        className="d-flex justify-content-end align-items-end flex-column"
        // style={{ position: 'absolute', top: "1vh", right: "3vh" }}
      >
        <div
          style={{
            marginRight: "1vw",
            color: "#008b50",
            fontWeight: 400,
            fontSize: 'clamp(1vh, 3vw, 2.5vh)',
            // marginTop: "-2vh",
            // letterSpacing: '0.07em'
          }}
        >
         ДИСКОНТ:
        </div>

        <div>
          <input
            type="text"
            value={`${thisOrder.prepayment}`}
            className="d-flex inputsArtemNumber inputsArtem "
            onChange={e => handleDiscountChange(e.target.value)}
            style={{
              fontSize: 'clamp(1vh, 3vw, 2.5vh)',
              width: '6.2vw',
              padding: '0.1vh',
              position: 'relative',
              marginTop: "1.7vh",
              cursor: currentUser?.role === "admin" || "operator" || "user" ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              color: '#008b50',
              backgroundColor: '#ebebe6',
              border: 'none',
              borderRadius: '10px',
              textAlign: 'center',
              marginRight: "1vw",
              // visibility: 'hidden',
            }}
          />

          {/*<input*/}
          {/*  type="text"*/}
          {/*  value={`${thisOrder.prepayment}`}*/}
          {/*  className="d-flex inputsArtemNumber inputsArtem "*/}
          {/*  onChange={e => handleDiscountChange(e.target.value)}*/}
          {/*  style={{*/}
          {/*    fontSize: 'clamp(1vh, 3vw, 2.5vh)',*/}
          {/*    width: '4.5vw',*/}
          {/*    top: "-2vh",*/}
          {/*    padding: '0.1vh',*/}
          {/*    position: 'relative',*/}
          {/*    cursor: currentUser?.role === "admin" ? 'pointer' : 'not-allowed',*/}
          {/*    fontWeight: 600,*/}
          {/*    color: '#008b50',*/}
          {/*    backgroundColor: '#ebebe6',*/}
          {/*    border: 'none',*/}
          {/*    borderRadius: '10px',*/}
          {/*    textAlign: 'center',*/}
          {/*    marginRight: "1vw",*/}
          {/*  }}*/}
          {/*/>*/}
        </div>
      </div>

      {error && (
        <div style={{ color: 'red', fontSize: '1vw', marginTop: '-0.5vh' }}>{error}</div>
      )}
    </div>
  );
}

export default DiscountCalculator;
