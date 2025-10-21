import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DiscountCalculator from './DiscountCalculator';
import axios from './api/axiosInstance';
import { useSelector } from 'react-redux';
import "./progressbar_styles.css"
import {useNavigate} from "react-router-dom";

function formatNumber(num) {
  const s = num == null ? '0' : String(num).replace(/\s+/g, '').replace(/,/g, '.');
  const n = Number(s);
  if (!Number.isFinite(n)) return '0.00';
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
const UI = {
  fs: { xs: '0.75rem', sm: '0.85rem', md: '0.95rem', lg: '1.05rem', xl: '1.35rem' },
  color: {
    bg: '#f7f5ee',
    panel: '#F8F7F4',
    panelAccent: '#F1EFE7',
    text: '#111827',
    textMuted: '#6B7280',
    textSubtle: '#9CA3AF',
    track: '#E5E7EB',
    warn: '#62625d',
    brown: '#fdb40e',
    blue: '#3c60a6',
    pink: '#ef77a8',
    green: '#008f53',
    danger: '#db0f21',
    border: '#E2E8F0',
    shadow: '0 20px 60px rgba(17, 24, 39, 0.12)',
    gradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(249, 247, 240, 0.9) 100%)',
  },
  radius: { md: '18px', lg: '24px', full: '999px' },
  space: { xs: '0.35rem', sm: '0.6rem', md: '0.9rem', lg: '1.2rem', xl: '1.6rem' },
};

const STAGES = [
  { id: 0, title: '_          ', subtitle: 'Замовлення створене', color: UI.color.warn },
  { id: 1, title: 'Друк', subtitle: 'Виріб друкується', color: UI.color.brown },
  { id: 2, title: 'Постпрес', subtitle: 'Постобробка', color: UI.color.blue },
  { id: 3, title: 'Готово', subtitle: 'Виріб готовий', color: UI.color.pink },
  { id: 4, title: 'Передача', subtitle: 'Очікує видачі', color: UI.color.green },
  { id: 5, title: 'Завершено', subtitle: 'Замовлення передано', color: UI.color.green },
];

const PAYMENT_STATUS = {
  pay: { label: 'Оплачено', color: UI.color.green, bg: 'rgba(0, 130, 73, 0.12)' },
  pending: { label: 'Очікує оплату', color: UI.color.warn, bg: 'rgba(251, 191, 36, 0.14)' },
};

const getStageTitle = (stage, orderId) => {
  if (stage == null) return 'Статус невідомий';
  const value = Number(stage);
  if (Number.isNaN(value)) return 'Статус невідомий';
  switch (value) {
    case -1:
      return `Скасоване замовлення №${orderId ?? '—'}`;
    case 0:
      return `Оформлення замовлення №${orderId ?? '—'}`;
    case 1:
      return `Замовлення №${orderId ?? '—'} друкується`;
    case 2:
      return `Замовлення №${orderId ?? '—'} у постпресі`;
    case 3:
      return `Готове замовлення №${orderId ?? '—'}`;
    default:
      return `Замовлення №${orderId ?? '—'} віддали`;
  }
};


const ProgressBar = ({
                       thisOrder,
                       setThisOrder,
                       setNewThisOrder,
                       handleThisOrderChange,
                       selectedThings2,
                       setSelectedThings2,
                     }) => {

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



    // Оновлюємо total одразу тут (якщо треба, бо знизу useEffect теж є)



  // const handleDiscountChange = async (value) => {
  //   if (currentUser?.role !== "admin") return;
  //   const dataToSend = {
  //     newDiscount: value,
  //     orderId: thisOrder.id,
  //   };
  //
  //   try {
  //     setError(null);
  //     setLoad(true);
  //     const { data } = await axios.put(`/orders/OneOrder/discount`, dataToSend);
  //
  //     setThisOrder(data);
  //     setSelectedThings2(data.OrderUnits);
  //
  //
  //   } catch (err) {
  //     if (err?.response?.status === 403) {
  //       navigate('/login');
  //       return;
  //     }
  //     setError(err.message || 'Помилка');
  //   } finally {
  //     setLoad(false);
  //   }
  // };

  const [currentStage, setCurrentStage] = useState(thisOrder?.status ? parseInt(thisOrder.status, 10) : 0);
  const [isPaid, setIsPaid] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  const [elapsedTime, setElapsedTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [manufacturingStartTime, setManufacturingStartTime] = useState(null);
  const [finalManufacturingTime, setFinalManufacturingTime] = useState(null);
  const [amount, setAmount] = useState(() => formatNumber(thisOrder?.price ?? 0));







  const effectiveDiscountNum = useMemo(() => getEffectiveDiscount(thisOrder), [getEffectiveDiscount, thisOrder]);

  const orderWithEffectiveDiscount = useMemo(() => {
    if (!thisOrder) return thisOrder;
    const effectiveDiscount = getEffectiveDiscount(thisOrder);
    return {
      ...thisOrder,
      effectiveDiscount,
      discount: thisOrder.discount ?? effectiveDiscount,
      prepayment: typeof thisOrder.prepayment === 'string' ? thisOrder.prepayment : `${effectiveDiscount}%`,
    };
  }, [getEffectiveDiscount, thisOrder]);

  useEffect(() => {
    if (!thisOrder) return;
    const statusValue = thisOrder.status ? parseInt(thisOrder.status, 10) : 0;
    setCurrentStage(Number.isFinite(statusValue) ? statusValue : 0);
    const paid = thisOrder.payStatus === 'pay';
    setIsPaid(paid);
    setIsCancelled(thisOrder.status === 'Відміна' || statusValue === -1);
    if (thisOrder.manufacturingStartTime) {
      setManufacturingStartTime(thisOrder.manufacturingStartTime);
    }
    if (thisOrder.finalManufacturingTime) {
      setFinalManufacturingTime(thisOrder.finalManufacturingTime);
    }
  }, [thisOrder]);

  useEffect(() => {
    let timer;
    if (manufacturingStartTime && currentStage >= 1 && currentStage <= 3 && !isCancelled) {
      timer = setInterval(() => {
        const now = Date.now();
        const diff = now - new Date(manufacturingStartTime).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setElapsedTime({ days, hours, minutes, seconds });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentStage, isCancelled, manufacturingStartTime]);

  const getSegmentColor = (stageId) => {
    if (isCancelled) return UI.color.danger;
    if (stageId < 0) return UI.color.track;
    const paletteColor = STAGES[stageId]?.color ?? UI.color.track;
    const isCompleted = currentStage > stageId;
    const isActive = currentStage === stageId;
    if (isPaid && stageId === STAGES.length - 1) return UI.color.green;
    if (currentStage >= STAGES.length && stageId === STAGES.length - 1) return UI.color.green;
    if (isCompleted) return paletteColor;
    if (isActive) return paletteColor;
    return UI.color.track;
  };

  const currentStageDescriptor = useMemo(() => {
    if (isCancelled) {
      return {
        title: `Скасоване замовлення №${thisOrder?.id ?? '—'}`,
        subtitle: 'Замовлення було скасоване',
        accent: UI.color.danger,
      };
    }
    const normalized = Math.min(Math.max(currentStage, 0), STAGES.length - 1);
    const stage = STAGES[normalized];
    return {
      title: getStageTitle(currentStage, thisOrder?.id),
      subtitle: stage?.subtitle ?? 'Статус уточнюється',
      accent: stage?.color ?? UI.color.text,
    };
  }, [currentStage, isCancelled, thisOrder?.id ]);

  const paymentState = isPaid ? PAYMENT_STATUS.pay : PAYMENT_STATUS.pending;

  const formatCurrency = useCallback((value) => {
    if (value == null || value === '') return '-';
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return `${value}`;
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 2,
    }).format(numericValue);
  }, []);

  const stageProgressLabel = isCancelled
    ? '—'
    : `${Math.min(Math.max(currentStage, 0), STAGES.length - 1) + 1}/${STAGES.length}`;

  const actionConfig = useMemo(() => {
    const config = {
      0: { label: 'Взяти в роботу', next: 1, bg: UI.color.warn, color: UI.color.text },
      1: { label: 'На постпрес', next: 2, bg: UI.color.brown, color: '#FFFFFF' },
      2: { label: 'Виконано', next: 3, bg: UI.color.blue, color: '#FFFFFF' },
      3: { label: 'Віддати', next: 4, bg: UI.color.pink, color: '#FFFFFF' },
    };
    if (isCancelled) return null;
    const key = Number.isFinite(currentStage) ? currentStage : 0;
    return config[key] ?? null;
  }, [currentStage, isCancelled]);

  const handleStageUpdate = (newStatus) => {
    if (!thisOrder?.id) return;
    const payload = {
      newStatus,
      thisOrderId: thisOrder.id,
    };

    if (newStatus === 1 && !thisOrder?.manufacturingStartTime) {
      const start = new Date().toISOString();
      payload.manufacturingStartTime = start;
    }

    if (newStatus === 3) {
      const totalSeconds =
        elapsedTime.days * 24 * 60 * 60 +
        elapsedTime.hours * 60 * 60 +
        elapsedTime.minutes * 60 +
        elapsedTime.seconds;
      payload.finalManufacturingTime = { ...elapsedTime };
      payload.totalManufacturingTimeInSeconds = totalSeconds;
    }

    axios
      .put('/orders/OneOrder/statusUpdate', payload)
      .then((response) => {
        setThisOrder((prev) => ({
          ...prev,
          status: response.data.status,
          manufacturingStartTime: payload.manufacturingStartTime ?? prev?.manufacturingStartTime,
          finalManufacturingTime: payload.finalManufacturingTime ?? prev?.finalManufacturingTime,
        }));
        if (payload.manufacturingStartTime) {
          setManufacturingStartTime(payload.manufacturingStartTime);
        }
        if (payload.finalManufacturingTime) {
          setFinalManufacturingTime(payload.finalManufacturingTime);
          setManufacturingStartTime(null);
        }
        setError(null);
      })
      .catch((err) => {
        setError(err);
      });
  };
  // useEffect(() => {
  //   if (!thisOrder) return;
  //   const eff = getEffectiveDiscount(thisOrder);
  //   setDiscount(`${eff}%`);
  //   setAmount(formatNumber(thisOrder.price ?? 0));
  //   const totalAfter = recalcTotal(thisOrder, eff);
  //   setTotal(totalAfter);
  // }, [thisOrder]);


return (

  <div
      style={{
        background: "#f7f5ee",
        width: '36.5vw',
        height: '17vh',
        padding: "0vw",
        borderRadius: "12px",
        boxShadow: "0 5px 5px 3px rgba(0, 0, 0, 0.15)",
        position: 'fixed',
        right: '1vw',
        bottom: '0.1vw',

      }}>

      <div
        style={{
          position: 'absolute',
          bottom: '0.7vh',
          left:"6.5rem",
          textTransform: 'uppercase',
          width: '100%',     // ширина 30vw
          height: '3vh',     // висота 2vh
          maxHeight: '4vh',
          fontWeight: 400,
          color: currentStageDescriptor.accent,
          transition: 'color 0.3s ease',
          textAlign: 'start',
          /* підбір шрифту */
          fontSize: 'clamp(1vh, 3vw, 2.5vh)',
          // letterSpacing:"0.25em",
          lineHeight: '3vh',     // щоб текст ставав рівно в блок
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          boxSizing: 'border-box',
        }}

      >

        {currentStageDescriptor.title}

      </div>
    <div style={{position:"absolute", right:"0", top:"0"}}>
    <DiscountCalculator
      thisOrder={thisOrder}
      setThisOrder={setThisOrder}
      selectedThings2={selectedThings2}
      setSelectedThings2={setSelectedThings2}
    />
    </div>

    <div className="d-flex justify-content-center flex-column" style={{position: 'absolute',  paddingTop:"1vh", fontSize: 'clamp(1vh, 3vw, 2.5vh)', gap:"1vh", left: '6.5rem' }}>
      {/* ВАРТІСТЬ */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'normal',
          wordBreak: 'break-word',

        }}>
        <label style={{
          fontWeight: 400,
          color: currentStageDescriptor.accent,
          width: "10vw",
          height: "3vh",
          opacity:"0.5",
          alignItems: "start",
          fontSize: 'clamp(1vh, 3vw, 2.5vh)',
          // letterSpacing: '0.07em'
        }}>
          ВАРТІСТЬ:
        </label>
        <div
          style={{
            fontSize: 'clamp(1vh, 3vw, 2.5vh)',
            width: '10vw',
            fontWeight: 400,
            opacity:"0.5",
            backgroundColor: '#ebebe6',
            border: 'none',
            textAlign: 'center',
            borderRadius: '10px',
            color: currentStageDescriptor.accent,
            padding: '0.4vh',
            // letterSpacing: '0.05em'
          }}
        >
          {thisOrder.price} <span style={{ fontSize: '0.8rem', color: currentStageDescriptor.accent, fontWeight: 400, }}>грн</span>
        </div>
      </div>

      {/* ДО СПЛАТИ */}
      <div
        style={{
          display: 'flex',              // ← виправлення
          alignItems: 'center',         // ← виправлення
          whiteSpace: 'normal',
          wordBreak: 'break-word',

        }}
      >
        <label style={{
          fontWeight: 400,
          color: '#707070',
          width:"10vw",
          fontSize: 'clamp(1vh, 3vw, 2.5vh)',

          // letterSpacing: '0.07em'
        }}>
          ДО СПЛАТИ:
        </label>
        <div
          style={{
            fontSize: 'clamp(1vh, 3vw, 2.5vh)',
            width: '10vw',
            fontWeight: 500,
            backgroundColor: '#ebebe6',
            border: 'none',
            textAlign: 'center',
            borderRadius: '10px',
            color: '#707070',
            padding: '0.4vh',
            // letterSpacing: '0.05em'
          }}
        >
          {thisOrder.allPrice} <span style={{ fontSize: '0.8rem', color: '#707070', fontWeight: 400, }}>грн</span>
        </div>
      </div>


  </div>
      <div style={{ display: 'flex', gap: UI.space.sm, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex',  justifyContent: 'flex-end', alignItems: 'start', justifyItems:"start",  }}>
          {actionConfig && (
            <button
              type="button"
              className=" buttonProgressWork"
              onClick={() => handleStageUpdate(actionConfig.next)}
              style={{
                background: actionConfig.bg,
              }}>
              <div className="buttonProgressWorkName"> {actionConfig.label}</div>
            </button>
          )}
        </div>
      </div>

      <div>

          <div style={{ display: 'flex',   width: '100%', position: 'absolute', bottom: '4.5vh', left: '6.5rem' }}>
            {STAGES.map((stage, index) => {
              const isLast = index === STAGES.length - 1;
              const isCompleted = currentStage > stage.id && !isCancelled;
              const isActive = currentStage === stage.id && !isCancelled;
              const indicatorColor = getSegmentColor(stage.id);

              return (

                <div
                  key={stage.id}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: UI.space.xs,

                  }}
                >
                  <div
                    style={{
                      height: '14px',
                      width: '14px',
                      borderRadius: UI.radius.full,
                      background: isCancelled ? UI.color.danger : indicatorColor,
                      border: `3px solid ${isActive ? indicatorColor : 'transparent'}`,
                      boxShadow: isActive ? `0 0 0 6px rgba(60, 96, 166, 0.12)` : 'none',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'start',
                      justifyContent: 'flex-end'

                    }}
                  />
                  {!isLast && (
                    <div
                      style={{
                        flex: 1,
                        height: '3px',
                        borderRadius: UI.radius.full,
                        background: isCompleted ? indicatorColor : UI.color.track,
                        transition: 'background 0.3s ease',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        <div

        >

          <div style={{ display: 'flex', justifyContent: 'end', color: UI.color.textSubtle, fontSize: UI.fs.xs }}>
          </div>


        </div>



      </div>


    </div>
  );
};

export default ProgressBar;
