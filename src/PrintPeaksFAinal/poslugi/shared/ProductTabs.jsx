import React, { useState } from "react";

/**
 * Product tabs component for service name selection
 *
 * @param {string[]} services - Array of service names
 * @param {Function} setServices - Setter for services array
 * @param {string} selectedService - Currently selected service
 * @param {Function} setSelectedService - Setter for selected service
 * @param {boolean} allowEdit - Whether to show edit controls (default: true)
 */
const ProductTabs = ({
  services,
  setServices,
  selectedService,
  setSelectedService,
  allowEdit = true,
}) => {
  const [isEditServices, setIsEditServices] = useState(false);

  const handleDelete = (service) => {
    if (services.length === 1) {
      alert("Повинен бути хоча б один товар");
      return;
    }

    if (!window.confirm(`Видалити "${service}"?`)) return;

    setServices((prev) => prev.filter((s) => s !== service));

    if (selectedService === service) {
      setSelectedService(services[0] || "");
    }
  };

  const handleAdd = () => {
    const name = prompt("Введіть назву товару");
    if (!name) return;

    const trimmed = name.trim();
    if (!trimmed) return;

    if (services.includes(trimmed)) {
      alert("Така назва вже існує");
      return;
    }

    setServices((prev) => [...prev, trimmed]);
    setSelectedService(trimmed);
  };

  return (
    <div className="bw-product-tabs">
      {services.map((service) => (
        <div
          key={service}
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <button
            className={`btn ${
              selectedService === service
                ? "adminButtonAdd"
                : "adminButtonAdd-active"
            }`}
            style={{
              fontSize: "clamp(0.7rem, 0.7vh, 2.5vh)",
              minWidth: "2vw",
              height: "2vh",
            }}
            onClick={() => setSelectedService(service)}
          >
            {service}
          </button>

          {/* Delete button */}
          {isEditServices && (
            <button
              type="button"
              onClick={() => handleDelete(service)}
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                border: "none",
                background: "transparent",
                color: "red",
                lineHeight: "0px",
                cursor: "pointer",
              }}
            >
              x
            </button>
          )}
        </div>
      ))}

      {/* Add button */}
      {allowEdit && isEditServices && (
        <button className="btn adminButtonAdd" onClick={handleAdd}>
          <div className="bw-text-gray">+</div>
        </button>
      )}

      {/* Settings toggle button */}
      {allowEdit && (
        <button
          className={`btn ${
            isEditServices ? "adminButtonAdd" : "adminButtonAdd-active"
          }`}
          onClick={() => setIsEditServices((v) => !v)}
          title={
            isEditServices
              ? "Завершити редагування"
              : "Налаштування назв товарів"
          }
        >
          <div className="bw-text-gray">{isEditServices ? "v" : "*"}</div>
        </button>
      )}
    </div>
  );
};

export default ProductTabs;
