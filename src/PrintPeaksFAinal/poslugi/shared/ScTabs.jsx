import React from "react";

// service може бути рядком або об'єктом {id, name, color, presets}
const getServiceName = (s) => (typeof s === 'string' ? s : s?.name || '');
const getServiceKey = (s) => (typeof s === 'string' ? s : s?.id ?? s?.name);
const getServiceColor = (s) => (typeof s === 'string' ? null : s?.color || null);

const ScTabs = ({
  services,
  selectedService,
  onSelect,
  isEditServices,
  setIsEditServices,
  onAddService,
  onRemoveService,
  onSettingsClick,
  settingsButton,
}) => (
  <div className="sc-tabs">
    {services.map((service) => {
      const name = getServiceName(service);
      const key = getServiceKey(service);
      const color = getServiceColor(service);
      const isActive = selectedService === name;

      // Стиль кнопки з кастомним кольором (через CSS variables щоб перекрити !important)
      const btnStyle = {
        fontSize: "clamp(0.7rem, 0.7vh, 2.5vh)",
        minWidth: "2vw",
        height: "2vh",
      };
      if (color) {
        btnStyle["--sc-tab-color"] = color;
        btnStyle["--sc-tab-bg"] = `${color}18`;
      }

      return (
        <div
          key={key}
          style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
        >
          <button
            className={`btn ${isActive ? "adminButtonAdd" : "adminButtonAdd-active"}`}
            style={btnStyle}
            onClick={() => onSelect(name)}
          >
            <span className="sc-tab-text">{name}</span>
          </button>

          {isEditServices && (
            <button
              type="button"
              onClick={() => {
                if (services.length === 1) {
                  alert("Повинен бути хоча б один товар");
                  return;
                }
                if (!window.confirm(`Видалити "${name}"?`)) return;
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
      );
    })}

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
        onClick={() => {
          if (onSettingsClick) {
            onSettingsClick();
          } else {
            setIsEditServices((v) => !v);
          }
        }}
        title={isEditServices ? "Завершити редагування" : "Налаштування назв товарів"}
      >
        <span className="sc-tab-text">{isEditServices ? "\u2714\uFE0F" : "\u2699\uFE0F"}</span>
      </button>
    )}
  </div>
);
export default ScTabs;
