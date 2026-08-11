import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import { getStoredAppTheme, onAppThemeChange } from "../../utils/appTheme";

import "./NewSheetCutV2.css";

const fmt2 = (v) =>
  new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v));

const DeliveryPage = ({
  thisOrder,
  setThisOrder,
  setSelectedThings2,
  showDelivery,
  setShowDelivery,
}) => {
  const navigate = useNavigate();

  // ========== STATE ==========
  const [deliveryType] = useState("Нова Пошта");
  const [count, setCount] = useState(1);
  const [price, setPrice] = useState(50);
  const [courierAddress] = useState(1);
  const [cost] = useState(null);
  const [error, setError] = useState(null);

  // тема стежить за глобальною темою застосунку (перемикач у Nav)
  const [theme, setTheme] = useState(getStoredAppTheme);
  useEffect(() => onAppThemeChange(setTheme), []);

  const handleClose = () => setShowDelivery(false);

  // ========== SAVE ==========
  const handleSave = () => {
    if (!thisOrder?.id) return;

    const dataToSend = {
      orderId: thisOrder.id,
      toCalc: {
        nameOrderUnit: "Доставка",
        type: "Delivery",
        deliveryType,
        city: count,
        warehouse: price,
        courierAddress,
        cost,
        size: { x: 0, y: 0 },
        material: { type: "Не потрібно" },
        color: { sides: "Не потрібно" },
        lamination: { type: "Не потрібно" },
        big: "Не потрібно",
        cute: "Не потрібно",
        cuteLocal: { leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" },
        holes: "Не потрібно",
        holesR: "Не потрібно",
        count,
        price,
      },
    };

    axios
      .post("/orderUnits/OneOrder/OneOrderUnitInOrder", dataToSend)
      .then((response) => {
        setThisOrder(response.data);
        setSelectedThings2(response.data.OrderUnits);
        setShowDelivery(false);
      })
      .catch((err) => {
        if (err?.response?.status === 403) navigate("/login");
        setError(err);
      });
  };

  // ========== PRICING DATA ==========
  const total = (Number(price) || 0) * (Number(count) || 0);
  const pricingLines = [
    { label: "Доставка", perUnit: Number(price) || 0, count: Number(count) || 0, total },
  ];

  // ========== RENDER ==========

  if (!showDelivery) return null;

  return (
    <>
      <div className="v2-overlay" onClick={handleClose} />
      <div className={`v2-modal v2-modal-narrow v2-theme-${theme}`} onClick={(e) => e.stopPropagation()}>

        {/* ШАПКА */}
        <div className="v2-head">
          <div className="v2-head-main">
            <span className="v2-head-title">Доставка</span>
          </div>
          <button className="v2-close-btn" onClick={handleClose} title="Закрити" aria-label="Закрити">
            &times;
          </button>
        </div>

        {/* ТІЛО */}
        <div className="v2-body">
          <div className="v2-left">
            <div className="v2-section">
              <span className="v2-label">Вартість доставки</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <input
                  className="inputsArtem"
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(+e.target.value || 0)}
                  style={{ width: "8rem" }}
                />
                <span className="v2-unit-note">грн</span>
              </div>
            </div>
          </div>

          {/* ПРАВОРУЧ — НАРЯД */}
          <div className="v2-right">
            <div className="v2-run">
              <span className="v2-run-label">Кількість, шт</span>
              <div className="v2-count-row">
                <button className="v2-count-btn" onClick={() => setCount(Math.max(1, count - 1))}>−</button>
                <input
                  className="v2-count-val"
                  type="number"
                  value={count}
                  min={1}
                  onChange={(e) => setCount(Math.max(1, +e.target.value || 1))}
                />
                <button className="v2-count-btn" onClick={() => setCount(count + 1)}>+</button>
              </div>
            </div>

            <div className="v2-prices-title">Калькуляція</div>
            <div className="v2-prices">
              {pricingLines.map((line, i) => {
                const isZero = Math.round((line.total || 0) * 100) === 0;
                const hasBreakdown = !isZero && line.count > 0 && line.perUnit > 0;
                return (
                  <div className={`v2-price-row${isZero ? " is-zero" : ""}`} key={i}>
                    <span>{line.label}</span>
                    <i className="v2-lead" />
                    <span className="v2-price-val">
                      {hasBreakdown && (
                        <span className="v2-price-calc">
                          {line.count} шт × {fmt2(line.perUnit)} ={" "}
                        </span>
                      )}
                      {fmt2(line.total)} грн
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="v2-total">
              <div className="v2-total-price">
                {fmt2(total)} <span className="v2-total-unit">грн</span>
              </div>
            </div>

            <button className="v2-add-btn" onClick={handleSave} disabled={!thisOrder?.id}>
              <span className="v2-add-btn-icon" aria-hidden="true">+</span>
              <span className="v2-add-btn-label">Додати в замовлення</span>
            </button>
          </div>
        </div>

        {/* ПОМИЛКА */}
        {error && (
          <div className="v2-error">
            {error?.response?.data?.error || error?.message || "Помилка"}
          </div>
        )}
      </div>
    </>
  );
};

export default DeliveryPage;
