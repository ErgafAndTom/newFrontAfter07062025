import React, { useEffect, useMemo, useState } from 'react';
import axios from './api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const normalizeDiscount = (value) => {
  const raw = String(value ?? '').replace(',', '.').trim();
  const numeric = Number.parseFloat(raw.replace('%', ''));
  if (!Number.isFinite(numeric)) return '';
  const safeValue = Math.max(0, numeric);
  if (safeValue === 0) return '';
  return `${safeValue}%`;
};

const normalizeDiscountForSave = (value) => {
  const raw = String(value ?? '').replace(',', '.').trim();
  const numeric = Number.parseFloat(raw.replace('%', ''));
  if (!Number.isFinite(numeric)) return '0%';
  const safeValue = Math.max(0, numeric);
  return `${safeValue}%`;
};

const PRESET_DISCOUNTS = [0, 5, 10, 15];
const MAX_DISCOUNT = 50;
const DISCOUNT_LIMIT_ERROR = 'Знижка не може перевищувати 50%';

const parseDiscountValue = (value) => {
  const raw = String(value ?? '').replace(',', '.').trim();
  const numeric = Number.parseFloat(raw.replace('%', ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

function DiscountCalculator({ thisOrder, setThisOrder, setSelectedThings2, setGlobalError }) {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const canEdit = useMemo(() => currentUser?.role === 'admin', [currentUser?.role]);

  const [inputValue, setInputValue] = useState(() => normalizeDiscount(thisOrder?.prepayment));
  const [isSaving, setIsSaving] = useState(false);

  const syncError = (message) => {
    if (typeof setGlobalError === 'function') setGlobalError(message);
  };

  useEffect(() => {
    setInputValue(normalizeDiscount(thisOrder?.prepayment));
  }, [thisOrder?.prepayment]);

  const saveDiscount = async (rawValue) => {
    const normalized = normalizeDiscountForSave(rawValue);
    const numeric = parseDiscountValue(normalized);
    setInputValue(normalizeDiscount(normalized));

    if (numeric > MAX_DISCOUNT) {
      syncError(DISCOUNT_LIMIT_ERROR);
      return;
    }

    if (!canEdit || !thisOrder?.id) {
      syncError(null);
      return;
    }

    if (normalized === normalizeDiscountForSave(thisOrder?.prepayment)) {
      syncError(null);
      return;
    }

    try {
      syncError(null);
      setIsSaving(true);

      const { data } = await axios.put('/orders/OneOrder/discount', {
        newDiscount: normalized,
        orderId: thisOrder.id,
      });

      setThisOrder(data);
      if (Array.isArray(data?.OrderUnits)) {
        setSelectedThings2(data.OrderUnits);
      }
    } catch (err) {
      if (err?.response?.status === 403) {
        navigate('/login');
        return;
      }
      syncError(err?.message || 'Помилка');
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = (percent) => {
    const numericPercent = Number(percent);
    if (!Number.isFinite(numericPercent)) return;
    const normalized = `${Math.max(0, numericPercent)}%`;
    setInputValue(normalizeDiscount(normalized));
    saveDiscount(normalized);
  };

  const handlePresetMouseDown = (event, percent) => {
    event.preventDefault();
    applyPreset(percent);
  };

  return (
    <div className="dc-shell">
      <div className="dc-envelope">
        <div className="dc-input-wrap">
          <span className={`dc-prefix${!canEdit ? ' is-readonly' : ''}`} aria-hidden="true">-</span>
          <input
            type="text"
            value={inputValue}
            className={`dc-input${!canEdit ? ' is-readonly' : ''}${isSaving ? ' is-saving' : ''}`}
            onChange={(e) => {
              const nextValue = e.target.value;
              setInputValue(nextValue);
              if (parseDiscountValue(nextValue) <= MAX_DISCOUNT) syncError(null);
            }}
            onBlur={() => saveDiscount(inputValue)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                saveDiscount(inputValue);
              }
            }}
            readOnly={!canEdit}
            aria-label="Відсоток знижки"
          />
        </div>
      </div>

      <div className="dc-presets" role="group" aria-label="Швидка знижка">
        {PRESET_DISCOUNTS.map((value) => (
          <button
            key={value}
            type="button"
            className={`dc-preset-btn${normalizeDiscountForSave(inputValue) === `${value}%` ? ' is-active' : ''}${!canEdit ? ' is-readonly' : ''}`}
            onMouseDown={(event) => handlePresetMouseDown(event, value)}
            disabled={!canEdit}
          >
            {value === 0 ? '0%' : `-${value}%`}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DiscountCalculator;
