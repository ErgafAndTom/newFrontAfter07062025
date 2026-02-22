import React from "react";

const ScTabs = ({
  services,
  selectedService,
  onSelect,
  isEditServices,
  setIsEditServices,
  onAddService,
  onRemoveService,
  settingsButton,
}) => (
  <div className="sc-tabs">
    {services.map((service) => (
      <div
        key={service}
        style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      >
        <button
          className={`btn ${selectedService === service ? "adminButtonAdd" : "adminButtonAdd-active"}`}
          style={{ fontSize: "clamp(0.7rem, 0.7vh, 2.5vh)", minWidth: "2vw", height: "2vh" }}
          onClick={() => onSelect(service)}
        >
          <span className="sc-tab-text">{service}</span>
        </button>

        {isEditServices && (
          <button
            type="button"
            onClick={() => {
              if (services.length === 1) {
                alert("Повинен бути хоча б один товар");
                return;
              }
              if (!window.confirm(`Видалити "${service}"?`)) return;
              onRemoveService(service);
            }}
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

    {isEditServices && (
      <button
        className="btn adminButtonAdd"
        style={{ fontSize: "clamp(0.7rem, 0.7vh, 2.5vh)", minWidth: "2vw", height: "2vh" }}
        onClick={() => {
          if (onAddService) onAddService();
        }}
      >
        +
      </button>
    )}

    {settingsButton !== undefined ? (
      settingsButton
    ) : (
      <button
        className={`btn ${isEditServices ? "adminButtonAdd" : "adminButtonAdd-active"}`}
        style={{ fontSize: "clamp(0.7rem, 0.7vh, 2.5vh)", minWidth: "2vw", height: "2vh" }}
        onClick={() => setIsEditServices((v) => !v)}
        title={isEditServices ? "Завершити редагування" : "Налаштування назв товарів"}
      >
        <span className="sc-tab-text">{isEditServices ? "\u2714\uFE0F" : "\u2699\uFE0F"}</span>
      </button>
    )}
  </div>
);
export default ScTabs;
