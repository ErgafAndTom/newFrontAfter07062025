import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from "./api/axiosInstance";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import addNewOrder from "./PrintPeaksFAinal/Orders/AddNewOrder";

function DiscountCalculator({ thisOrder, setThisOrder, selectedThings2, setSelectedThings2 }) {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);

  function formatNumber(num) {
    const s = num == null ? '0' : String(num).replace(/\s+/g, '').replace(/,/g, '.');
    const n = Number(s);
    if (!Number.isFinite(n)) return '0.00';
    return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function parseNumber(v) {
    if (v == null) return 0;
    const s = String(v).replace(/\s+/g, '').replace(/,/g, '.');
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  const [amount, setAmount] = useState(() => formatNumber(thisOrder?.price ?? 0));
  const [discount, setDiscount] = useState('0%'); // рядок з %
  const [total, setTotal] = useState(thisOrder?.allPrice ?? thisOrder?.price ?? 0);
  const [error, setError] = useState(null);
  const [load, setLoad] = useState(false);

  const handleDiscountChange = async (value) => {
    if (currentUser?.role !== "admin") return;
    const dataToSend = {
      newDiscount: value,
      orderId: thisOrder.id,
    };
    console.log(dataToSend);
    try {
      setError(null);
      setLoad(true);
      const { data } = await axios.put(`/orders/OneOrder/discount`, dataToSend);
      console.log(data);
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

  // useEffect(() => {
  //   if (!thisOrder) return;
  //   setAmount(formatNumber(thisOrder?.price ?? 0));
  //   const eff = getEffectiveDiscount(thisOrder);
  //   setDiscount(`${eff}%`);
  //   setTotal(recalcTotal(thisOrder, eff));
  // }, [thisOrder, getEffectiveDiscount, recalcTotal]);

  return (
    <div className="d-flex flex-row" style={{ width: "36vw", whiteSpace: 'nowrap', }}>

      <div className="d-flex justify-content-end align-items-center flex-column " style={{position: 'absolute', top:"1vh", right:"0vh", }}>
        <div   style={{   marginRight:"1vw", color: "#008b50", fontWeight: 200, fontSize: 'clamp(1vh, 3vw, 2.5vh)', letterSpacing: '0.07em'}}>
          ЗНИЖКА:
        </div>
        <div>
          <input
            type="text"
            value={`${thisOrder.prepayment}`}
            onChange={e => handleDiscountChange(e.target.value)}
            disabled={currentUser?.role !== "admin"}
            style={{
              fontSize: 'clamp(1vh, 3vw, 2.5vh)',
              width: '4.5vw',
              padding: '0.1vh',
              position: 'relative',

              fontWeight: 600,
              color: '#008b50',
              backgroundColor: '#ebebe6',
              border: 'none',
              borderRadius: '10px',
              textAlign: 'center',
              marginRight:"1vw"
            }}/>
        </div>
      </div>


      {error && (
        <div style={{ color: 'red', fontSize: '1vw', marginTop: '-0.5vh' }}>{error}</div>
      )}


    </div>
  );
}

export default DiscountCalculator;
