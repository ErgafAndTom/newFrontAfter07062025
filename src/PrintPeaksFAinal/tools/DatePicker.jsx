import React, { useState, useRef, useEffect } from 'react';
import { FiCalendar } from 'react-icons/fi';
import './DatePicker.css';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const MONTHS = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];

const dateToISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatDisplay = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
};

const DatePicker = ({ value, onChange, placeholder = 'дд.мм.рррр' }) => {
  const today = new Date();
  const todayISO = dateToISO(today);

  const getView = (iso) => {
    if (iso) {
      const d = new Date(iso + 'T00:00:00');
      return { year: d.getFullYear(), month: d.getMonth() };
    }
    return { year: today.getFullYear(), month: today.getMonth() };
  };

  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => getView(value));
  const wrapRef = useRef(null);

  useEffect(() => {
    if (value) setView(getView(value));
  }, [value]); // eslint-disable-line

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const prevMonth = () => setView(v =>
    v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }
  );
  const nextMonth = () => setView(v =>
    v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }
  );

  const getDays = () => {
    const { year, month } = view;
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const cells = [];

    for (let i = startOffset; i > 0; i--) {
      cells.push({ date: new Date(year, month - 1, daysInPrev - i + 1), other: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(year, month, d), other: false });
    }
    let nextDay = 1;
    while (cells.length < 42) {
      cells.push({ date: new Date(year, month + 1, nextDay++), other: true });
    }
    return cells;
  };

  return (
    <div className="dp-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`dp-trigger${value ? ' dp-trigger--active' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className="dp-text">
          {value ? formatDisplay(value) : <span className="dp-placeholder">{placeholder}</span>}
        </span>
        <FiCalendar className="dp-icon" size={11} />
      </button>

      {open && (
        <div className="dp-popup">
          <div className="dp-header">
            <span className="dp-month-label">{MONTHS[view.month]} {view.year} р.</span>
            <button type="button" className="dp-nav" onClick={prevMonth}>↑</button>
            <button type="button" className="dp-nav" onClick={nextMonth}>↓</button>
          </div>

          <div className="dp-grid">
            {WEEKDAYS.map(w => <div key={w} className="dp-wd">{w}</div>)}
            {getDays().map((cell, i) => {
              const iso = dateToISO(cell.date);
              return (
                <button
                  key={i}
                  type="button"
                  className={[
                    'dp-day',
                    cell.other ? 'dp-day--other' : '',
                    iso === value ? 'dp-day--selected' : '',
                    iso === todayISO && iso !== value ? 'dp-day--today' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => { onChange(iso); setOpen(false); }}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="dp-footer">
            <button type="button" className="dp-foot-btn" onClick={() => { onChange(''); setOpen(false); }}>
              Очистити
            </button>
            <button type="button" className="dp-foot-btn" onClick={() => { onChange(todayISO); setOpen(false); }}>
              Сьогодні
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
