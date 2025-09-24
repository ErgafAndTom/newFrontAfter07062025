import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from "./api/axiosInstance";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

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

  const norm = useCallback((v) => {
    if (v == null) return 0;
    const s = String(v).trim();
    const n = parseFloat(s.endsWith('%') ? s.slice(0, -1) : s);
    return Number.isFinite(n) ? n : 0;
  }, []);

  const getEffectiveDiscount = useCallback((order) => {
    if (!order) return 0;
    const serverRaw = order.effectiveDiscount ?? order.discount ?? order.prepayment;
    const serverNum = norm(serverRaw);

    const clientNum = norm(order.client?.discount);
    const compNum = norm(order.client?.Company?.discount ?? order.client?.company?.discount);

    if (serverNum > 0) {
      if ((order.client && (order.client.Company || order.client.company)) && compNum > clientNum) {
        return Math.max(serverNum, compNum, clientNum);
      }
      return serverNum;
    }

    return Math.max(clientNum, compNum, 0);
  }, [norm]);

  const recalcTotal = useCallback((order, overrideEff) => {
    const eff = typeof overrideEff === 'number' ? overrideEff : getEffectiveDiscount(order);
    const basePrice = parseNumber(order?.price ?? order?.allPrice ?? 0);
    const totalNum = Math.round((basePrice * (1 - eff / 100)) * 100) / 100;
    return totalNum;
  }, [getEffectiveDiscount]);

  const effectiveDiscountNum = useMemo(() => getEffectiveDiscount(thisOrder), [thisOrder, getEffectiveDiscount]);

  const handleAmountChange = (value) => {
    const numeric = String(value).replace(/[^0-9.]/g, '');
    const formatted = numeric ? formatNumber(numeric) : '0.00';
    setAmount(formatted);
  };

  const sanitizePercentInput = (value) => {
    if (!value) return '0%';
    const numeric = String(value).replace(/[^\d.]/g, '');
    const n = norm(numeric);
    return `${n}%`;
  };

  const handleDiscountChange = async (value) => {
    if (currentUser?.role !== "admin") return;
    const sanitized = sanitizePercentInput(value);
    setDiscount(sanitized);

    const n = norm(sanitized);
    const dataToSend = {
      newDiscound: `${n}%`,
      newDiscount: `${n}%`,
      orderId: thisOrder.id,
    };

    try {
      setError(null);
      setLoad(true);
      const { data } = await axios.put(`/orders/OneOrder/discount`, dataToSend);

      const merged = {
        ...thisOrder,
        ...data,
        OrderUnits: data.OrderUnits ?? thisOrder.OrderUnits,
        client: data.client ?? thisOrder.client, // если сервер вернул client
      };

      setThisOrder(nextOrder);
      setSelectedThings2(nextOrder.OrderUnits ?? selectedThings2);

      const eff = (data.effectiveDiscount ?? data.discount ?? data.prepayment) != null
        ? // если сервер прислал какое-то значение — нормализуем его числом
        getEffectiveDiscount(merged)
        : getEffectiveDiscount(merged);
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

  useEffect(() => {
    if (!thisOrder) return;
    setAmount(formatNumber(thisOrder?.price ?? 0));
    const eff = getEffectiveDiscount(thisOrder);
    setDiscount(`${eff}%`);
    setTotal(recalcTotal(thisOrder, eff));
  }, [thisOrder, getEffectiveDiscount, recalcTotal]);

  return (
    <div className="d-flex flex-row" style={{ width: "36vw", whiteSpace: 'nowrap', }}>
      <div style={{ display: 'flex', alignItems: 'center',  justifyContent:"start", width: "36vw", gap: '0.5rem' }}>
        <label style={{ fontSize: '2vh',  fontWeight: 500, alignItems: 'center', color: '#707070' }}>Вартість:</label>
        <input
          disabled
          className="d-flex align-items-end justify-content-start "
          type="text"
          value={`${amount}  `}
          onChange={(e) => handleAmountChange(e.target.value)}
          style={{
            fontSize: '2vh',
            width: '8vw',
            fontWeight: 600,
            backgroundColor: '#F2F0E7',
            position: 'relative',
            border: 'none',
            textAlign: 'center',
            borderRadius: '10px',
            color: '#707070',
            justifyContent:"start",
            alignItems:"start",
            marginTop: '1vh',

          }}
        />
      </div>

      <div>

        <label  className=" d-flex  justify-content-center align-items-center " style={{ fontSize: '1.5vh',  marginRight:"1vw", color: '#008b50', fontWeight: 600,}}>
          ЗНИЖКА:
        </label>
        <div >

          <input
            type="text"
            value={discount}
            className=" d-flex  justify-content-center align-items-center "
            onChange={e => handleDiscountChange(e.target.value)}
            disabled={currentUser?.role !== "admin"}
            style={{
              width: '5vw',
              padding: '0.1vh',
              position: 'relative',
              fontSize: '2vh',
              fontWeight: 700,
              color: '#008b50',
              backgroundColor: '#F2F0E7',
              border: 'none',
              borderRadius: '10px',
              textAlign: 'center',
              marginRight:"1vw"
            }}
          />
        </div>


      </div>

      {error && (
        <div style={{ color: 'red', fontSize: '1vw', marginTop: '-0.5vh' }}>{error}</div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5vh' }}>
        <label style={{ fontSize: '2vh', color: '#fe3547', fontWeight: 700, marginLeft:"0.52vw"}}> Загалом:</label>
        <input
          disabled
          type="text"
          value={`${formatNumber(total)}`}
          readOnly
          style={{
            // padding: '0.5vh',
            justifyContent: "center",
            padding: '0.5vh ',
            fontSize: '2vh',
            fontWeight: 700,
            backgroundColor: '#F2F0E7',
            border: 'none',
            borderRadius: '10px',
            width:"8vw",
            color:"#e01426",
            textAlign: 'center',




          }}
        />
        {/*{load && (*/}
        {/*  <Spinner animation="border" variant="danger" size="sm" />*/}
        {/*)}*/}
      </div>
    </div>
  );
}

export default DiscountCalculator;
