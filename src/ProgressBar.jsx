import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DiscountCalculator from './DiscountCalculator';
import axios from './api/axiosInstance';
import { useSelector } from 'react-redux';
import "./progressbar_styles.css"

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

const STAGES = [
  { id: 0, title: '_          ', subtitle: 'Нове замовлення', color: UI.color.warn },
  { id: 1, title: 'Друк', subtitle: 'Виріб друкується', color: UI.color.brown },
  { id: 2, title: 'Постпрес', subtitle: 'Постобробка', color: UI.color.blue },
  { id: 3, title: 'Готово', subtitle: 'Виріб готовий', color: UI.color.pink },
  { id: 4, title: 'Отримано', subtitle: 'Очікує видачі', color: UI.color.green },
  { id: 5, title: 'Оплата', subtitle: 'Замовлення оплачено', color: UI.color.green },
];

const STAGE_TONES = ['warn', 'brown', 'blue', 'pink', 'green', 'green'];

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







  const effectiveDiscountNum = useMemo(() => getEffectiveDiscount(thisOrder), [getEffectiveDiscount, thisOrder]);
  const isDiscountApplied = effectiveDiscountNum > 0;

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
      const isPaymentStage = stageId === STAGES.length - 1;
      if (stageId <= normalizedCurrentStage || isPaymentStage) return currentStageTone;
      return 'grey';
    }

    const paletteTone = STAGE_TONES[stageId] || 'track';
    const isCompleted = normalizedCurrentStage > stageId;
    const isActive = normalizedCurrentStage === stageId;

    if (isCompleted) return paletteTone;
    if (isActive) return paletteTone;
    return 'track';
  };

  const renderDeadlineCountdown = useCallback((value) => {
    if (!value) return '—';
    const overduePrefix = 'Прострочено: ';
    const isOverdueText = value.startsWith(overduePrefix);
    const body = isOverdueText ? value.slice(overduePrefix.length) : value;

    const tokens = body.split(' ');
    const unitsToSubscript = new Set(['г', 'хв', 'с']);

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

  const stageProgressLabel = isCancelled
    ? '—'
    : `${completedStageCount}/${STAGES.length}`;

  const isFullyCompleted = !isCancelled && completedStageCount >= STAGES.length;
  const actionPlaceholderLabel = isFullyCompleted ? 'Замовлення завершено' : '—';

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
      0: { label: 'Взяти в роботу', next: 1 },
      1: { label: 'На постпрес', next: 2 },
      2: { label: 'Виконано', next: 3 },
      3: { label: 'Віддати', next: 4 },
    };
    if (isCancelled) return null;
    const key = Number.isFinite(currentStage) ? currentStage : 0;
    return config[key] ?? null;
  }, [currentStage, isCancelled]);

  const actionTone = isCancelled ? 'danger' : currentStageTone;

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
    if (nextError) {
      setActiveError(nextError);
      return;
    }
    setActiveError(externalError || error || null);
  }, [externalError, error]);

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
        return 'green';
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
  <div className={`nui-progressbar pb-shell tone-${actionTone} hover-tone-${actionHoverTone}`}>
    <div className="pb-action-rail">
      <div className="pb-action-row">
        {actionConfig ? (
          <button
            type="button"
            className="pb-action-btn"
            onClick={() => handleStageUpdate(actionConfig.next)}
          >
            <span className="pb-action-label">{actionConfig.label}</span>
          </button>
        ) : (
          <div className={`pb-action-placeholder${isFullyCompleted ? ' is-complete' : ''}`}>{actionPlaceholderLabel}</div>
        )}
      </div>

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
          const stageLabel = stage.id === 0 ? 'Обробка' : stage.title;

          return (
            <div
              key={stage.id}
              className={`pb-stage-pill tone-${indicatorTone}${isActive ? ' is-active' : ''}${isCompleted ? ' is-completed' : ''}`}
            >
              <span className="pb-stage-dot" />
              <span className="pb-stage-name">{stageLabel}</span>
            </div>
          );
        })}
        <span className="pb-track-progress-badge">{stageProgressLabel}</span>
      </div>
    </div>

    <div className="pb-main">
      <div className="pb-top-row">
        <div className="pb-metrics">
          <div className="pb-metric pb-metric--cost">
            <span className="pb-metric-label">ВАРТІСТЬ</span>
            <span className="pb-metric-value">
              {formatNumber(thisOrder?.price ?? 0)} <small>грн</small>
            </span>
          </div>
          <div className={`pb-metric pb-metric--due${isDiscountApplied ? ' is-discounted' : ''}`}>
            <span className="pb-metric-label">ДО СПЛАТИ</span>
            <span className="pb-metric-value pb-metric-value--strong">
              {formatNumber(thisOrder?.allPrice ?? 0)} <small>грн</small>
            </span>
          </div>
        </div>

        <div className="pb-discount-wrap">
          <DiscountCalculator
            thisOrder={thisOrder}
            setThisOrder={setThisOrder}
            selectedThings2={selectedThings2}
            setSelectedThings2={setSelectedThings2}
            setGlobalError={handleDiscountError}
          />
        </div>

        <div className="pb-deadline-wrap">
          <button
            type="button"
            className={`dc-deadline-btn pb-deadline-btn${deadlineAt ? ' is-transparent' : ''}${!canEditDeadline ? ' is-readonly' : ''}`}
            onClick={openDeadlinePicker}
            disabled={!canEditDeadline}
          >
            <span className="pb-deadline-btn-label">{deadlineAt ? "ЗАЛИШИЛОСЬ" : "ДЕДЛАЙН"}</span>
          </button>

          {deadlineAt && (
            <div className={`pb-deadline-under${deadlineCountdown.startsWith('Прострочено') || deadlineCountdown.startsWith('Не встигли') ? ' is-overdue' : ''}`} title={deadlineExactLabel || undefined}>
              <span className="pb-deadline-under-label">ЗАЛИШИЛОСЬ:</span>
              <span className="pb-deadline-under-counter">{renderDeadlineCountdown(deadlineCountdown)}</span>
            </div>
          )}

          <input
            ref={deadlineInputRef}
            type="datetime-local"
            className="dc-deadline-input"
            onChange={handleDeadlineInputChange}
          />
        </div>
      </div>

      {activeError && (
        <div className="pb-error">
          {typeof activeError === 'string' ? activeError : activeError?.response?.data?.error || activeError?.message || 'Помилка'}
        </div>
      )}
    </div>
  </div>
);


};

export default ProgressBar;
