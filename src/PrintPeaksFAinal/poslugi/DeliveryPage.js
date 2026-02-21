import React, { useState } from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import { ScModal, ScSection, ScPricing, ScAddButton } from "./shared";
import "./Poslugy.css";

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
  return (
    <ScModal
      show={showDelivery}
      onClose={handleClose}
      modalStyle={{ width: "35vw" }}
      rightContent={
        <>
          <ScPricing
            lines={pricingLines}
            totalPrice={total}
            fmt={fmt2}
          />
          <ScAddButton onClick={handleSave} />
        </>
      }
      errorContent={
        error && (
          <div className="sc-error">
            {error?.response?.data?.error || error?.message || "Помилка"}
          </div>
        )
      }
    >
      {/* 1. Кількість */}
      <ScSection title="">
        <div className="d-flex flex-row align-items-center">
          <input
            className="inputsArtem"
            type="number"
            min={1}
            value={count}
            onChange={(e) => setCount(Math.max(1, +e.target.value || 1))}
          />
          <div className="inputsArtemx">шт</div>
        </div>
      </ScSection>

      {/* 2. Ціна */}
      <ScSection title="">
        <div className="d-flex flex-row align-items-center">
          <input
            className="inputsArtem"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(+e.target.value || 0)}
          />
          <div className="inputsArtemx">грн</div>
        </div>
      </ScSection>

    </ScModal>
  );
};

export default DeliveryPage;
