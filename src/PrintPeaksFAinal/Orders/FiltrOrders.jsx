import React from "react";
import "./FiltrOrders.css";
import DatePicker from "../tools/DatePicker";

const FiltrOrders = ({
  startDate, setStartDate, endDate, setEndDate,
  statuses, setStatuses,
  payments, setPayments,
  paymentsType, setPaymentsType,
}) => {

  const STATUS_ITEMS = [
    ["status0", "Оформлення", "s0"],
    ["status1", "Друкується", "s1"],
    ["status2", "Постпресс",  "s2"],
    ["status3", "Готове",     "s3"],
    ["status4", "Віддали",    "s4"],
    ["status5", "Видалено",   "s5"],
  ];

  const PAYMENT_ITEMS = [
    ["payment0", "Очікування",        "p-orange"],
    ["payment1", "Оплачено",          "p-green"],
    ["payment2", "Просрочено",        "p-red"],
    ["payment3", "Відміна",           "p-grey"],
  ];

  const PAY_TYPE_ITEMS = [
    ["payment2", "Готівка",           "p-green"],
    ["payment1", "Оплата карткою",    "p-blue"],
    ["payment0", "Інтернет-посилання","p-orange"],
    ["payment3", "Рахунок",           "p-grey"],
  ];

  return (
    <div className="flt-bar">

      {/* ── Конверт 1: Дати ── */}
      <div className="flt-group">
        <DatePicker value={startDate} onChange={setStartDate} />
        <span className="flt-arrow">→</span>
        <DatePicker value={endDate} onChange={setEndDate} />
      </div>

      <div className="flt-divider" />

      {/* ── Конверт 2: Статуси замовлення ── */}
      <div className="flt-group">
        {STATUS_ITEMS.map(([key, label, tone]) => (
          <button
            key={key}
            className={`flt-btn flt-btn--status flt-status--${tone}${statuses[key] ? ' flt-btn--on' : ' flt-btn--off'}`}
            onClick={() => setStatuses({ ...statuses, [key]: !statuses[key] })}
          >
            {label}
          </button>
        ))}
      </div>

      {payments && (
        <>
          <div className="flt-divider" />
          {/* ── Конверт 3: Статус оплати ── */}
          <div className="flt-group">
            {PAYMENT_ITEMS.map(([key, label, tone]) => (
              <button
                key={key}
                className={`flt-btn flt-btn--status flt-pay--${tone}${payments[key] ? ' flt-btn--on' : ' flt-btn--off'}`}
                onClick={() => setPayments({ ...payments, [key]: !payments[key] })}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {paymentsType && (
        <>
          <div className="flt-divider" />
          {/* ── Конверт 4: Тип оплати ── */}
          <div className="flt-group">
            {PAY_TYPE_ITEMS.map(([key, label, tone]) => (
              <button
                key={key}
                className={`flt-btn flt-btn--status flt-pay--${tone}${paymentsType[key] ? ' flt-btn--on' : ' flt-btn--off'}`}
                onClick={() => setPaymentsType({ ...paymentsType, [key]: !paymentsType[key] })}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FiltrOrders;
