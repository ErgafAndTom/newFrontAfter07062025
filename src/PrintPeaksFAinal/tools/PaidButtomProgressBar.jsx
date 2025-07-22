import React from "react";
import "./PaidButtomProgressBar.css";
const PaymentMethodsPanel = ({ onSelect }) => {
  const methods = [
    { key: "cash", label: "Готівка" },
    { key: "terminal", label: "Термінал" },
    { key: "online", label: "Інтернет(mono)" },
    { key: "invoices", label: "Рахунки" },
  ];

  return (
    <div
      style={{
        height: "12vh",
        width: "36.5vw",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 0.3vw",
        background: "#fbfaf6",
        borderRadius: "0.5rem",
      }}
    >
      {methods.map(({ key, label }) => (
        <button
          className={"PayButtons"}
          key={key}
          onClick={() => onSelect && onSelect(key)}
          style={{

          }}
          // onMouseEnter={e => {
          //   e.currentTarget.style.background = "#a4f3cb";
          //   e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
          // }}

        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default PaymentMethodsPanel;
