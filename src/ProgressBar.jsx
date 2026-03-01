import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DiscountCalculator from './DiscountCalculator';
import axios from './api/axiosInstance';
import { useSelector } from 'react-redux';
import PaidButtomProgressBar from './PrintPeaksFAinal/tools/PaidButtomProgressBar';
import PaysInOrderRestored_OrdersLike from './PrintPeaksFAinal/userInNewUiArtem/pays/PaysInOrderRestored_OrdersLike';
import "./progressbar_styles.css"

function formatNumber(num) {
  const s = num == null ? '0' : String(num).replace(/\s+/g, '').replace(/,/g, '.');
  const n = Number(s);
  if (!Number.isFinite(n)) return '0.00';
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function formatCompactNumber(num) {
  const full = formatNumber(num);
  return full
    .replace(/\.0+$/, '')
    .replace(/(\.\d*[1-9])0+$/, '$1');
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
    warn: '#666666',
    brown: '#f5a623',
    blue: '#3c60a6',
    pink: '#ef7aaa',
    green: '#0e935b',
    danger: '#db0f21',
    border: '#E2E8F0',
    shadow: '0 20px 60px rgba(17, 24, 39, 0.12)',
    gradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(249, 247, 240, 0.9) 100%)',
  },
  radius: { md: '18px', lg: '24px', full: '999px' },
  space: { xs: '0.35rem', sm: '0.6rem', md: '0.9rem', lg: '1.2rem', xl: '1.6rem' },
};

/* Іконки статусів — currentColor, 1em×1em */
const IcoObrobka = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="8" cy="8" r="6"/>
    <path d="M8 5v3l2 2"/>
  </svg>
);
const IcoDruk = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="2" width="10" height="4"/>
    <rect x="3" y="9" width="10" height="5"/>
    <path d="M3 6h10v6H3z" strokeWidth="0" fill="none"/>
    <path d="M1 6h14v5H1z"/>
    <circle cx="12" cy="8.5" r="0.8" fill="currentColor" stroke="none"/>
  </svg>
);
const IcoPostpres = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 4 c1-2 3-2 5 0 s4 2 5 0"/>
    <path d="M3 8 c1-2 3-2 5 0 s4 2 5 0"/>
    <path d="M3 12c1-2 3-2 5 0s4 2 5 0"/>
  </svg>
);
const IcoGotovo = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="8" cy="8" r="6"/>
    <path d="M5 8.5l2 2 4-4"/>
  </svg>
);
const IcoOtrymano = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 2v8M5 7l3 3 3-3"/>
    <path d="M3 12h10"/>
  </svg>
);
const IcoOplata = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="8" cy="8" r="6"/>
    <path d="M8 4.5v7M6 6c0-.8.9-1.5 2-1.5s2 .7 2 1.5-1 1.3-2 1.5-2 .8-2 1.5.9 1.5 2 1.5 2-.7 2-1.5"/>
  </svg>
);

const STAGE_ICONS = [IcoObrobka, IcoDruk, IcoPostpres, IcoGotovo, IcoOtrymano, IcoOplata];

const STAGES = [
  { id: 0, title: 'Обробка', subtitle: 'Нове замовлення', color: UI.color.warn },
  { id: 1, title: 'Друк', subtitle: 'Виріб друкується', color: UI.color.brown },
  { id: 2, title: 'Постпрес', subtitle: 'Постобробка', color: UI.color.blue },
  { id: 3, title: 'Готово', subtitle: 'Виріб готовий', color: UI.color.pink },
  { id: 4, title: 'Отримано', subtitle: 'Очікує видачі', color: UI.color.green },
  { id: 5, title: 'Оплата', subtitle: 'Замовлення оплачено', color: UI.color.green },
];

const STAGE_TONES = ['warn', 'brown', 'blue', 'pink', 'purple', 'green'];
const ACTION_LABELS_BY_STAGE = {
  0: 'Обробка',
  1: 'Друк',
  2: 'Постпрес',
  3: 'Готово',
  4: 'Отримано',
  5: 'Оплата',
};
const ACTION_HOVER_LABELS_BY_STAGE = {
  0: 'На друк',
  1: 'На постпрес',
  2: 'Завершити',
  3: 'Віддати',
};

const EMPTY_ORDER_LIST_ERROR = 'Список замовлень порожній';

const resolveDeadlineValue = (order) => {
  if (!order) return null;
  if (order.deadline) return order.deadline;
  if (typeof order.finalManufacturingTime === 'string') return order.finalManufacturingTime;
  return null;
};

const
  ProgressBar = ({
                       thisOrder,
                       setThisOrder,
                       selectedThings2,
                       setSelectedThings2,
                       externalError = null,
                       showActionRail = true,
                       showFinance = true,
                       showActionButton = true,
                       showTrack = true,
                       compactActionButton = false,
                       showError = true,
                       onDiscountError = null,
                       }) => {


  const currentUser = useSelector((state) => state.auth.user);
  const deadlineInputRef = useRef(null);
  const canEditDeadline = currentUser?.role === 'admin';
  const [error, setError] = useState(null);
  const [discountError, setDiscountError] = useState(null);
  const [activeError, setActiveError] = useState(null);

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

  const [currentStage, setCurrentStage] = useState(thisOrder?.status ? parseInt(thisOrder.status, 10) : 0);
  const [isPaid, setIsPaid] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  const [elapsedTime, setElapsedTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [manufacturingStartTime, setManufacturingStartTime] = useState(null);
  const [deadlineAt, setDeadlineAt] = useState(resolveDeadlineValue(thisOrder));
  const [deadlineCountdown, setDeadlineCountdown] = useState('');
  const [showPays, setShowPays] = useState(false);
  const [isActionHovered, setIsActionHovered] = useState(false);







  const selectedDiscountNum = useMemo(() => {
    const rawSelected = thisOrder?.prepayment ?? thisOrder?.discount ?? thisOrder?.effectiveDiscount ?? 0;
    return norm(rawSelected);
  }, [norm, thisOrder?.prepayment, thisOrder?.discount, thisOrder?.effectiveDiscount]);
  const isDiscountApplied = selectedDiscountNum > 0;

  useEffect(() => {
    if (!thisOrder) return;
    const statusValue = thisOrder.status ? parseInt(thisOrder.status, 10) : 0;
    setCurrentStage(Number.isFinite(statusValue) ? statusValue : 0);

    const paymentStatus = String(thisOrder?.Payment?.status || '').toUpperCase();
    const paidByMainPayment = ['PAID', 'SUCCESS', 'COMPLETED', 'DONE'].includes(paymentStatus);

    const paidByPaymentsList = Array.isArray(thisOrder?.Paymentts)
      ? thisOrder.Paymentts.some((item) => {
          const s = String(item?.status || item?.payStatus || '').toUpperCase();
          return (
            ['PAID', 'SUCCESS', 'COMPLETED', 'DONE'].includes(s) ||
            item?.isPaid === true ||
            item?.paid === true ||
            Boolean(item?.checkboxReceiptId) ||
            Boolean(item?.receiptId)
          );
        })
      : false;

    const paid = thisOrder?.payStatus === 'pay' || paidByMainPayment || paidByPaymentsList;
    setIsPaid(Boolean(paid));

    setIsCancelled(thisOrder.status === 'Відміна' || statusValue === -1);
    if (thisOrder.manufacturingStartTime) {
      setManufacturingStartTime(thisOrder.manufacturingStartTime);
    }
    setDeadlineAt(resolveDeadlineValue(thisOrder));
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

  useEffect(() => {
    if (!deadlineAt) {
      setDeadlineCountdown('');
      return undefined;
    }

    const formatDuration = (ms) => {
      const totalSeconds = Math.floor(Math.abs(ms) / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const chunks = [];
      if (days > 0) chunks.push(`${days}д`);
      chunks.push(`${hours.toString().padStart(2, '0')}г`);
      chunks.push(`${minutes.toString().padStart(2, '0')}хв`);
      chunks.push(`${seconds.toString().padStart(2, '0')}с`);
      return chunks.join(' ');
    };

    const tick = () => {
      const diff = new Date(deadlineAt).getTime() - Date.now();
      if (Number.isNaN(diff)) {
        setDeadlineCountdown('—');
        return;
      }
      if (diff >= 0) {
        setDeadlineCountdown(formatDuration(diff));
      } else {
        setDeadlineCountdown(`Не встигли на: ${formatDuration(diff)}`);
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [deadlineAt]);

  const normalizedCurrentStage = Math.min(Math.max(currentStage, 0), STAGES.length - 1);
  const currentStageTone = STAGE_TONES[normalizedCurrentStage] || 'warn';

  const getSegmentTone = (stageId) => {
    if (isCancelled) return 'danger';
    if (stageId < 0) return 'track';

    if (isPaid) {
      if (stageId === STAGES.length - 1) return 'green';
      if (stageId <= normalizedCurrentStage) return STAGE_TONES[stageId] || 'warn';
      return 'grey';
    }

    if (normalizedCurrentStage === STAGES.length - 1) {
      if (stageId === STAGES.length - 1) return 'green';
      return STAGE_TONES[stageId] || 'track';
    }

    if (stageId <= normalizedCurrentStage) return currentStageTone;
    return 'track';
  };

  const renderDeadlineCountdown = useCallback((value) => {
    if (!value) return '—';
    const overduePrefix = 'Прострочено: ';
    const isOverdueText = value.startsWith(overduePrefix);
    const body = isOverdueText ? value.slice(overduePrefix.length) : value;

    const tokens = body.split(' ');
    const unitsToSubscript = new Set(['д', 'г', 'хв', 'с']);

    return (
      <>
        {isOverdueText && <span className="pb-deadline-token pb-deadline-prefix">{overduePrefix}</span>}
        {tokens.map((token, index) => {
          const match = token.match(/^(\d+)(д|г|хв|с)$/);
          if (!match) return <span className="pb-deadline-token" key={`${token}-${index}`}>{token}</span>;

          const [, amount, unit] = match;
          if (unitsToSubscript.has(unit)) {
            return (
              <span className="pb-deadline-token" key={`${token}-${index}`}>
                {amount}
                <span className="pb-deadline-unit-sub">{unit}</span>
              </span>
            );
          }

          return <span className="pb-deadline-token" key={`${token}-${index}`}>{`${amount}${unit}`}</span>;
        })}
      </>
    );
  }, []);

  const completedStageCount = isCancelled
    ? 0
    : Math.min(
        STAGES.length,
        normalizedCurrentStage + 1 + (isPaid && normalizedCurrentStage < STAGES.length - 1 ? 1 : 0)
      );

  const isFullyCompleted = !isCancelled && completedStageCount >= STAGES.length;
  const actionPlaceholderLabel = isFullyCompleted ? 'Завершено' : '—';

  const deadlineExactLabel = useMemo(() => {
    if (!deadlineAt) return '';
    const date = new Date(deadlineAt);
    if (!Number.isFinite(date.getTime())) return '';
    return date.toLocaleString('uk-UA');
  }, [deadlineAt]);

  const openDeadlinePicker = () => {
    if (!canEditDeadline) return;
    if (deadlineInputRef.current?.showPicker) {
      deadlineInputRef.current.showPicker();
      return;
    }
    deadlineInputRef.current?.click();
  };

  const handleDeadlineInputChange = async (event) => {
    const value = event.target.value;
    if (!value) return;

    const selectedDate = new Date(value);
    if (!Number.isFinite(selectedDate.getTime())) return;

    const isoDeadline = selectedDate.toISOString();
    const startedAt = thisOrder?.manufacturingStartTime || new Date().toISOString();

    const optimisticOrderPatch = {
      deadline: isoDeadline,
      manufacturingStartTime: startedAt,
    };

    setDeadlineAt(isoDeadline);
    setThisOrder((prev) => (prev ? { ...prev, ...optimisticOrderPatch } : prev));

    if (!canEditDeadline || !thisOrder?.id) return;

    try {
      const { data: deadlineData } = await axios.put('/orders/OneOrder/deadlineUpdate', {
        thisOrderId: thisOrder.id,
        deadlineNew: isoDeadline,
      });

      const persistedDeadline = deadlineData?.deadline || isoDeadline;
      setDeadlineAt(persistedDeadline);
      setThisOrder((prev) => (prev
        ? {
            ...prev,
            ...optimisticOrderPatch,
            deadline: persistedDeadline,
          }
        : prev));
      handleStageError(null);
    } catch (err) {
      handleStageError(err?.response?.data?.error || err?.message || 'Помилка збереження дедлайну');
    }
  };

  const actionConfig = useMemo(() => {
    const config = {
      0: { next: 1 },
      1: { next: 2 },
      2: { next: 3 },
      3: { next: 4 },
    };
    if (isCancelled) return null;
    const key = Number.isFinite(currentStage) ? currentStage : 0;
    return config[key] ?? null;
  }, [currentStage, isCancelled]);

  const actionTone = useMemo(() => {
    if (isCancelled) return 'danger';
    return currentStageTone;
  }, [isCancelled, currentStageTone]);

  const actionButtonBaseLabel = ACTION_LABELS_BY_STAGE[normalizedCurrentStage] || 'Взяти в роботу';
  const actionButtonHoverLabel = useMemo(() => {
    if (!actionConfig || !Number.isFinite(actionConfig.next)) return actionButtonBaseLabel;
    return ACTION_HOVER_LABELS_BY_STAGE[normalizedCurrentStage]
      || ACTION_LABELS_BY_STAGE[actionConfig.next]
      || STAGES[actionConfig.next]?.title
      || actionButtonBaseLabel;
  }, [actionConfig, actionButtonBaseLabel, normalizedCurrentStage]);

  const isAwaitingPaymentState = !isCancelled && !isPaid && normalizedCurrentStage >= 4;

  const handleStageError = useCallback((nextError) => {
    setError(nextError);
    if (nextError) {
      setActiveError(nextError);
      return;
    }
    setActiveError(externalError || discountError || null);
  }, [externalError, discountError]);

  const handleDiscountError = useCallback((nextError) => {
    setDiscountError(nextError);
    if (typeof onDiscountError === 'function') onDiscountError(nextError);
    if (nextError) {
      setActiveError(nextError);
      return;
    }
    setActiveError(externalError || error || null);
  }, [externalError, error, onDiscountError]);

  useEffect(() => {
    if (externalError) {
      setActiveError(externalError);
      return;
    }
    if (error) {
      setActiveError(error);
      return;
    }
    if (discountError) {
      setActiveError(discountError);
      return;
    }
    setActiveError(null);
  }, [externalError, error, discountError]);

  const actionHoverTone = useMemo(() => {
    if (isCancelled) return 'danger';
    switch (Number(currentStage)) {
      case 0:
        return 'brown';
      case 1:
        return 'blue';
      case 2:
        return 'pink';
      case 3:
        return 'purple';
      default:
        return 'warn';
    }
  }, [currentStage, isCancelled]);

  const hasOrderItems = (Array.isArray(selectedThings2) && selectedThings2.length > 0)
    || (Array.isArray(thisOrder?.OrderUnits) && thisOrder.OrderUnits.length > 0);

  useEffect(() => {
    if (hasOrderItems && error === EMPTY_ORDER_LIST_ERROR) {
      handleStageError(null);
    }
  }, [hasOrderItems, error]);

  const handleStageUpdate = (newStatus) => {
    if (!thisOrder?.id) return;
    if (Number(newStatus) === 1 && !hasOrderItems) {
      handleStageError(EMPTY_ORDER_LIST_ERROR);
      return;
    }

    const numericNext = Number(newStatus);
    if (Number.isFinite(numericNext)) {
      setCurrentStage(numericNext);
      setIsCancelled(numericNext === -1);
    }

    const payload = {
      newStatus,
      thisOrderId: thisOrder.id,
    };

    if (newStatus === 1) {
      payload.manufacturingStartTime = thisOrder?.manufacturingStartTime || new Date().toISOString();
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
        const nextOrder = response?.data?.order ?? response?.data;

        if (nextOrder && typeof nextOrder === 'object') {
          setThisOrder(nextOrder);
          if (Array.isArray(nextOrder.OrderUnits)) {
            setSelectedThings2(nextOrder.OrderUnits);
          }

          const statusValue = parseInt(nextOrder.status, 10);
          if (Number.isFinite(statusValue)) {
            setCurrentStage(statusValue);
            setIsCancelled(statusValue === -1);
          }

          if (nextOrder.manufacturingStartTime) {
            setManufacturingStartTime(nextOrder.manufacturingStartTime);
          }
        }

        handleStageError(null);
      })
      .catch((err) => {
        handleStageError(err);
      });
  };
return (
  <div className={`nui-progressbar pb-shell tone-${actionTone} hover-tone-${actionHoverTone}${showActionRail && !showFinance ? ' pb-shell--action-only' : ''}${!showActionRail && showFinance ? ' pb-shell--finance-only' : ''}${compactActionButton ? ' pb-shell--compact-action' : ''}`}>
    {showActionRail && (
    <div className="pb-action-rail">
      {showActionButton && (
      <div className="pb-action-row">
        {actionConfig ? (
          <button
            type="button"
            className="pb-action-btn"
            onClick={() => handleStageUpdate(actionConfig.next)}
            onMouseEnter={() => setIsActionHovered(true)}
            onMouseLeave={() => setIsActionHovered(false)}
            onFocus={() => setIsActionHovered(true)}
            onBlur={() => setIsActionHovered(false)}
          >
            <div className="pb-action-label">{isActionHovered ? actionButtonHoverLabel : actionButtonBaseLabel}</div>
          </button>
        ) : (
          <button
            type="button"
            className={`pb-action-btn pb-action-btn--locked${isFullyCompleted ? ' is-complete' : ''}${isAwaitingPaymentState ? ' is-awaiting-payment' : ''}`}
            disabled
          >
            <div className="pb-action-label">{isAwaitingPaymentState ? ACTION_LABELS_BY_STAGE[4] : actionPlaceholderLabel}</div>
          </button>
        )}
      </div>
      )}

      {showTrack && (
      <div className="pb-track-row">
        {STAGES.map((stage) => {
          const isPaymentStage = stage.id === STAGES.length - 1;
          const isCompleted = isCancelled
            ? false
            : (isPaid
                ? (stage.id <= normalizedCurrentStage || isPaymentStage)
                : stage.id < normalizedCurrentStage);
          const isActive = isCancelled
            ? false
            : (isPaid ? isPaymentStage : stage.id === normalizedCurrentStage);
          const indicatorTone = getSegmentTone(stage.id);

          const Icon = STAGE_ICONS[stage.id];
          return (
            <div
              key={stage.id}
              className={`pb-step-card tone-${indicatorTone}${isActive ? ' is-active' : ''}${isCompleted ? ' is-completed' : ''}`}
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              {stage.id !== STAGES.length - 1 && (
                <span className="pb-step-num">Крок {stage.id + 1}</span>
              )}
              <span className="pb-step-meta" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.3rem' }}>
                <span className="pb-step-ico" style={{ display: 'inline-flex', alignItems: 'center', fontSize: 'inherit', lineHeight: 1, color: 'var(--admingrey)' }}>
                  <Icon />
                </span>
                <span className="pb-step-label">{stage.title}</span>
              </span>
            </div>
          );
        })}
      </div>
      )}
    </div>
    )}

    {showFinance && (
    <div className="pb-finance-wrapper">
      <div className="pb-top-row">
        {!isPaid && (
          <div className={`pb-payment-wrap${thisOrder?.Payment?.status === "CREATED" ? " pb-payment-wrap--await" : ""}`}>
            <PaidButtomProgressBar
              thisOrder={thisOrder}
              setShowPays={setShowPays}
              setThisOrder={setThisOrder}
            />
          </div>
        )}

        <div className="pb-finance-row">
          <div className="pb-metrics">
            <div className="pb-metric pb-metric--cost">
              <span className="pb-metric-label">ВАРТІСТЬ:</span>
              <span className="pb-metric-inline pb-metric-inline--cost">
                <span className="pb-cost-value-main">{formatCompactNumber(thisOrder?.price ?? 0)}</span>{' '}
                <small className="pb-metric-currency">грн</small>
              </span>
            </div>


            {!isPaid && thisOrder?.Payment?.status !== "CREATED" && (
              <div className="pb-discount-wrap">
                <DiscountCalculator
                  thisOrder={thisOrder}
                  setThisOrder={setThisOrder}
                  selectedThings2={selectedThings2}
                  setSelectedThings2={setSelectedThings2}
                  setGlobalError={handleDiscountError}
                />
              </div>
            )}


            <div className={`pb-metric pb-metric--due${isDiscountApplied ? ' is-discounted' : ''}`}>
              <span className="pb-metric-label">ДО СПЛАТИ:</span>
              <span className="pb-metric-inline pb-metric-inline--due">
                <span className="pb-metric-value-main">{formatCompactNumber(thisOrder?.allPrice ?? 0)}</span>{' '}
                <small className="pb-metric-currency">грн</small>
              </span>
            </div>
          </div>
        </div>
      </div>

      {isPaid && (
        <div className="pb-payment-wrap pb-payment-wrap--under-metrics">
          <PaidButtomProgressBar
            thisOrder={thisOrder}
            setShowPays={setShowPays}
            setThisOrder={setThisOrder}
          />
        </div>
      )}



      {showPays && (
        <PaysInOrderRestored_OrdersLike
          showPays={showPays}
          setShowPays={setShowPays}
          thisOrder={thisOrder}
          setThisOrder={setThisOrder}
        />
      )}
    </div>
    )}

      {showError && activeError && (
        <div className="pb-error">
          {typeof activeError === 'string' ? activeError : activeError?.response?.data?.error || activeError?.message || 'Помилка'}
        </div>
      )}

  </div>
);


};

export default ProgressBar;
