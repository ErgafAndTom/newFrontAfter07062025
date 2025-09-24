import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DiscountCalculator from './DiscountCalculator';
import axios from './api/axiosInstance';
import { useSelector } from 'react-redux';

const UI = {
  fontFamily:
    'Montserrat Alternates, Roboto, Ubuntu, Cantarell, "Noto Sans", "Helvetica Neue", Arial, sans-serif',
  fs: { xs: '0.75rem', sm: '0.85rem', md: '0.95rem', lg: '1.05rem', xl: '1.35rem' },
  color: {
    bg: '#FFFFFF',
    panel: '#F8F7F4',
    panelAccent: '#F1EFE7',
    text: '#111827',
    textMuted: '#6B7280',
    textSubtle: '#9CA3AF',
    track: '#E5E7EB',
    warn: '#FBBF24',
    brown: '#8B4513',
    blue: '#3C60A6',
    pink: '#F075AA',
    green: '#008249',
    danger: '#EE3C23',
    border: '#E2E8F0',
    shadow: '0 20px 60px rgba(17, 24, 39, 0.12)',
    gradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(249, 247, 240, 0.9) 100%)',
  },
  radius: { md: '18px', lg: '24px', full: '999px' },
  space: { xs: '0.35rem', sm: '0.6rem', md: '0.9rem', lg: '1.2rem', xl: '1.6rem' },
};

const STAGES = [
  { id: 0, title: 'Оформлення', subtitle: 'Замовлення створене', color: UI.color.warn },
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

const getStageTitle = (stage) => {
  if (stage == null) return 'Статус невідомий';
  const value = Number(stage);
  if (Number.isNaN(value)) return 'Статус невідомий';
  switch (value) {
    case -1:
      return 'Скасоване замовлення';
    case 0:
      return 'Оформлення замовлення';
    case 1:
      return 'Замовлення друкується';
    case 2:
      return 'Замовлення у постпресі';
    case 3:
      return 'Готове замовлення';
    default:
      return 'Замовлення передано клієнту';
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
  const currentUser = useSelector((state) => state.auth.user);

  const [currentStage, setCurrentStage] = useState(thisOrder?.status ? parseInt(thisOrder.status, 10) : 0);
  const [isPaid, setIsPaid] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [error, setError] = useState(null);
  const [elapsedTime, setElapsedTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [manufacturingStartTime, setManufacturingStartTime] = useState(null);
  const [finalManufacturingTime, setFinalManufacturingTime] = useState(null);

  const norm = useCallback((value) => {
    if (value == null) return 0;
    const stringified = String(value).trim();
    const numeric = parseFloat(stringified.endsWith('%') ? stringified.slice(0, -1) : stringified);
    return Number.isFinite(numeric) ? numeric : 0;
  }, []);

  const getEffectiveDiscount = useCallback(
    (order) => {
      if (!order) return 0;
      const fromApi = norm(order.effectiveDiscount ?? order.discount ?? order.prepayment);
      const clientDiscount = norm(order?.client?.discount);
      const companyDiscount = norm(
        order?.client?.Company?.discount ??
        order?.client?.company?.discount ??
        order?.Company?.discount ??
        order?.company?.discount,
      );
      return Math.max(fromApi, clientDiscount, companyDiscount);
    },
    [norm],
  );

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
        title: 'Скасоване замовлення',
        subtitle: 'Замовлення було скасоване',
        accent: UI.color.danger,
      };
    }
    const normalized = Math.min(Math.max(currentStage, 0), STAGES.length - 1);
    const stage = STAGES[normalized];
    return {
      title: getStageTitle(currentStage),
      subtitle: stage?.subtitle ?? 'Статус уточнюється',
      accent: stage?.color ?? UI.color.text,
    };
  }, [currentStage, isCancelled]);

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

  return (
    <div
      style={{

        background: UI.color.gradient,
        width: '36.5vw',
        height: '17vh',
        padding: "0.4vw",
        borderRadius: "12px",
        boxShadow: UI.color.shadow,
        position: 'fixed',
        right: '1vw',
        bottom: '0.1vw',


      }}>
      <div
        style={{
          fontSize: "1.3vw",
          fontWeight: 500,
          whiteSpace: 'nowrap',
          color: currentStageDescriptor.accent,
          transition: 'color 0.3s ease',
        }}
      >
        {currentStageDescriptor.title} #{thisOrder?.id ?? '-'}
      </div>
      <div style={{ display: 'flex', gap: UI.space.sm, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <div
          style={{
            padding: `${UI.space.xs} ${UI.space.md}`,
            borderRadius: UI.radius.full,
            background: paymentState.bg,
            color: paymentState.color,
            fontWeight: 600,
            fontSize: UI.fs.sm,
          }}
        >
          {paymentState.label}
        </div>

        <div style={{ display: 'flex',  justifyContent: 'flex-end', alignItems: 'start', justifyItems:"start", marginTop:"-2.5vh" }}>
          {actionConfig && (
            <button
              type="button"
              className=" "
              onClick={() => handleStageUpdate(actionConfig.next)}
              style={{
                padding: `${UI.space.sm} ${UI.space.lg}`,
                borderRadius: "12px",
                border: 'none',
                background: actionConfig.bg,
                color: "#6a6a66",
                whiteSpace: 'nowrap',
                fontSize: "1.9vh" ,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform = 'translateY(-2px)';
                event.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.14)';
                event.currentTarget.style.color = '#f7f5ee';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = 'translateY(0)';
                event.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                event.currentTarget.style.color = 'fdfbf9';
              }}
            >
              {actionConfig.label}
            </button>
          )}
        </div>
      </div>

      <div>

          <div style={{ display: 'flex',alignItems: 'center', width: '100%', margin:"0.6vw" }}>
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
                    gap: UI.space.sm,
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
                      justifyContent: 'center',
                    }}
                  />
                  {!isLast && (
                    <div
                      style={{
                        flex: 1,
                        height: '7px',
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
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: UI.fs.xs, color: UI.color.textSubtle }}>
            {STAGES.map((stage) => {
              const isActive = currentStage === stage.id && !isCancelled;
              const isCompleted = currentStage > stage.id && !isCancelled;
              return (
                <div
                  key={stage.id}
                  style={{
                    marginTop:"-0.8vh",
                    width:"28vw",

                    // textAlign: 'center',
                    // fontWeight: isActive ? 600 : 500,
                    color: isActive || isCompleted ? UI.color.text : UI.color.textSubtle,
                    // transition: 'color 0.3s ease, font-weight 0.3s ease',
                  }}
                >
                  {stage.title}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: UI.color.textSubtle, fontSize: UI.fs.xs }}>


          </div>




          {/*<div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'baseline', gap:"1vh" }}>*/}
          {/*  */}
          {/*  <div style={{ fontSize: UI.fs.xl, fontWeight: 500 }}>{formatCurrency(thisOrder?.price)}</div>*/}
          {/*  <div style={{ fontSize: UI.fs.xl, color: UI.color.textMuted }}>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div style={{ display: 'flex', flexDirection: 'column', gap: UI.space.xs, fontSize: UI.fs.xs, color: UI.color.textMuted }}>*/}
          {/*  {thisOrder?.client?.name && (*/}
          {/*    <div>*/}
          {/*      Клієнт: <span style={{ color: UI.color.text }}>{thisOrder.client.name}</span>*/}
          {/*    </div>*/}
          {/*  )}*/}
          {/*  {thisOrder?.deadline && (*/}
          {/*    <div>*/}
          {/*      Дедлайн: <span style={{ color: UI.color.text }}>{new Date(thisOrder.deadline).toLocaleString('uk-UA')}</span>*/}
          {/*    </div>*/}
          {/*  )}*/}
          {/*</div>*/}

          <DiscountCalculator
            thisOrder={orderWithEffectiveDiscount}
            setThisOrder={setThisOrder}
            selectedThings2={selectedThings2}
            setSelectedThings2={setSelectedThings2}
          />

      </div>

      {/*<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: UI.fs.xl }}>*/}
      {/*  <div style={{ color: UI.color.textMuted }}>*/}
      {/*    {isCancelled*/}
      {/*      ? 'Замовлення скасоване'*/}
      {/*      : currentStage >= 1 && currentStage <= 3*/}
      {/*        ? `Час виготовлення: ${elapsedTime.days}д ${elapsedTime.hours}год ${elapsedTime.minutes}хв`*/}
      {/*        : finalManufacturingTime*/}
      {/*          ? `Фінальний час: ${finalManufacturingTime.days}д ${finalManufacturingTime.hours}год ${finalManufacturingTime.minutes ?? 0}хв`*/}
      {/*          : ''}*/}
      {/*  </div>*/}
      {/*  {error && (*/}
      {/*    <div style={{ color: UI.color.danger, fontSize: UI.fs.sm }}>{error?.message ?? 'Сталася помилка'}</div>*/}
      {/*  )}*/}
      {/*</div>*/}
    </div>
  );
};

export default ProgressBar;
