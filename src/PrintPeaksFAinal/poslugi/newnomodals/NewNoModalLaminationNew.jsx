import React, { useEffect, useState, useRef } from "react";
import axios from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "../Poslugy.css";


const LABELS = {
  "з глянцевим ламінуванням": "ГЛЯНЦЕВЕ",
  "З глянцевим ламінуванням": "ГЛЯНЦЕВЕ",
  "з матовим ламінуванням": "МАТОВЕ",
  "З матовим ламінуванням": "МАТОВЕ",
  "з ламінуванням Soft Touch": "SOFT TOUCH",
  "З ламінуванням Soft Touch": "SOFT TOUCH",
};

const NewNoModalLaminationNew = ({
                                   lamination,
                                   setLamination,
                                   buttonsArr,
                                   size,
                                   type,
                                   isVishichka,
                                   materials,
                                   selectArr,
                                   showSwitch = true,
                                   sizes,
                                   showOptions = true,
                                 }) => {
  const [thisLaminationSizes, setThisLaminationSizes] = useState([]);
  const [open, setOpen] = useState(false);
  const [dropdownWidth, setDropdownWidth] = useState("auto");

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const measureRef = useRef(null);

  const safeSelectArr = Array.isArray(selectArr) ? selectArr : [];
  const safeMaterials = Array.isArray(materials) ? materials : [];
  const safeSizes = Array.isArray(sizes) ? sizes : [];
  const safeButtonsArr = Array.isArray(buttonsArr) ? buttonsArr : [];
  const firstButton = safeButtonsArr[0] || "";

  const handleToggle = () => {
    if (!lamination.enabled) {
      setLamination({
        ...lamination,
        enabled: true,
        material: lamination.material || firstButton,
        type: lamination.type || firstButton,
      });
    } else {
      setLamination({
        ...lamination,
        enabled: false,
      });
    }
  };

  const handleSelectChange = (item) => {
    setLamination({
      ...lamination,
      size: item.thickness,
      materialId: item.id,
    });
    setOpen(false);
  };

  useEffect(() => {
    if (!lamination.material) return;

    axios.post("/materials/NotAll", {
      name: "MaterialsPrices",
      inPageCount: 999999,
      currentPage: 1,
      type,
      material: {
        type: "Ламінування",
        material: lamination.material,
        typeUse: "А3",
      },
      size,
    })
      .then(res => {
        setThisLaminationSizes(res?.data?.rows || []);
      })
      .catch(() => setThisLaminationSizes([]));
  }, [lamination.material, size?.x, size?.y]);

  // Автоширина dropdown
  useEffect(() => {
    if (!measureRef.current) return;
    const widths = Array.from(measureRef.current.children).map((el) =>
      el.getBoundingClientRect().width
    );
    if (widths.length > 0) {
      const maxWidth = Math.ceil(Math.max(...widths)) + 30;
      setDropdownWidth(`${maxWidth}px`);
    }
  }, [thisLaminationSizes]);

  // Клік поза dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedThickness = lamination.size
    ? `${lamination.size} мкм`
    : "-";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "nowrap",
      }}
    >
      {/* ===== SWITCH ===== */}
      {showSwitch && (
        <label className="switch scale04ForButtonToggle">
          <input
            type="checkbox"
            checked={!!lamination.enabled}
            onChange={handleToggle}
          />
          <span className="switch-on"><span>ON</span></span>
          <span className="slider" />
          <span className="switch-off"><span>OFF</span></span>
        </label>
      )}

      {/* ===== CONDITIONAL UI ===== */}
      {lamination.enabled && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          gap: "12px",
          marginTop:"1.5vh"
        }}>

          {/* Кнопки зліва */}
          {showOptions && (
            <div style={{
              display: "flex",
              position: "absolute",
              left: 0,

              alignItems: "center",
              gap: "0"
            }}>
              {safeButtonsArr.map((item, index) => {
                const isActive = lamination.material === item;
                const isFirst = index === 0;
                const isLast = index === safeButtonsArr.length - 1;
                return (
                  <button
                    key={item}
                    type="button"
                    className="lamination-button"
                    style={{
                      height:"3vh",
                      border: "none",
                      fontSize: "14px",
                      fontWeight: "450",
                      width:"6vw",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      padding: "12px 24px",
                      transition: "all 0.3s ease",
                      backgroundColor: isActive ? "#f5a623" : "rgba(224, 224, 224, 0.5)",
                      color: isActive ? "#FFFFFF" : "#666666",
                      position: "relative",
                      // Скруглення
                      borderTopLeftRadius: isFirst ? "1vh" : "0",
                      borderBottomLeftRadius: isFirst ? "1vh" : "0",
                      borderTopRightRadius: isLast ? "1vh" : "0",
                      borderBottomRightRadius: isLast ? "1vh" : "0",
                      // Прибираємо відстань між кнопками
                      marginLeft: isFirst ? "0" : "-25px",
                      // Діагональний зріз
                      clipPath: isFirst && !isLast
                        ? "polygon(0 0, 100% 0, calc(100% - 25px) 100%, 0 100%)"
                        : isLast && !isFirst
                          ? "polygon(25px 0, 100% 0, 100% 100%, 0 100%)"
                          : !isFirst && !isLast
                            ? "polygon(25px 0, 100% 0, calc(100% - 25px) 100%, 0 100%)"
                            : "none",
                    }}

                    onClick={() =>
                      setLamination((prev) => ({
                        ...prev,
                        enabled: true,
                        type: item,
                        material: item,
                        materialId: null,
                        size: "",
                      }))
                    }
                  >
                    {LABELS[item] || item}
                  </button>
                );
              })}
            </div>
          )}

          {/* Кастомний SELECT справа */}
          {showOptions && (
            <div
              className="custom-select-container selectArtem selectArtemBefore sc-has-value"

              ref={dropdownRef}
              style={{minWidth: dropdownWidth, position:"absolute", right:0}}
            >
              <div
                className="custom-select-header"
                onClick={() => setOpen(!open)}
              >
                {selectedThickness}
              </div>

              {open && (
                <div className="custom-select-dropdown" style={{minWidth: dropdownWidth}}>
                  {thisLaminationSizes.map((item) => (
                    <div
                      key={item.id}
                      className={`custom-option ${
                        String(item.id) === String(lamination.materialId) ? "active" : ""
                      }`}
                      onClick={() => handleSelectChange(item)}
                    >
                      <span className="name">{item.thickness} мкм</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Hidden measure */}
              <div
                ref={measureRef}
                style={{
                  position: "absolute",
                  visibility: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {thisLaminationSizes.map((item) => (
                  <div key={item.id} style={{fontSize: "15px", padding: "8px 12px"}}>
                    {item.thickness} мкм
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default NewNoModalLaminationNew;
