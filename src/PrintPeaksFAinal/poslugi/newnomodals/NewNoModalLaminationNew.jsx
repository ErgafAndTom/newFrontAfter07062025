import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";


const LABELS = {
  "з глянцевим ламінуванням": "Глянцеве",
  "З глянцевим ламінуванням": "Глянцеве",
  "з матовим ламінуванням": "Матове",
  "З матовим ламінуванням": "Матове",
  "З ламінуванням Soft Touch": "Soft Velvet",
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
                                   showSwitch = true, sizes,
                                   showOptions = true, // ⬅️ НОВЕ

                                 }) => {
  const [thisLaminationSizes, setThisLaminationSizes] = useState([]);
  const navigate = useNavigate();
  const safeSelectArr = Array.isArray(selectArr) ? selectArr : [];
  const safeMaterials = Array.isArray(materials) ? materials : [];
  const safeSizes = Array.isArray(sizes) ? sizes : [];
  const safeButtonsArr = Array.isArray(buttonsArr) ? buttonsArr : [];
  const firstButton = safeButtonsArr[0] || "";

  const handleToggle = () => {
    setLamination({
      ...lamination,
      type: lamination.type === "Не потрібно" ? firstButton : "Не потрібно",
      material: lamination.type === "Не потрібно" ? firstButton : "",
      materialId: null,
      size: "",
    });
  };



  const handleMaterialClick = (material) => {
    setLamination(prev => ({
      ...prev,
      enabled: true,
      type: material,
      material,
      materialId: null,
      size: "",
    }));
  };


  const handleSelectChange = (e) => {
    const opt = e.target.options[e.target.selectedIndex];
    setLamination({
      ...lamination,
      size: e.target.value,
      materialId: opt.getAttribute("data-id"),
    });
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



  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
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
            onChange={() => {
              setLamination((prev) => {
                if (prev.enabled) {
                  return {
                    enabled: false,
                    type: "",
                    material: "",
                    materialId: null,
                    size: "",
                  };
                }

                const first = safeButtonsArr[0] || "";

                return {
                  ...prev,
                  enabled: true,
                  type: first,
                  material: first,
                  materialId: null,
                  size: "",
                };
              });
            }}
          />
          <span className="slider" />
        </label>
      )}

      {/* ===== CONDITIONAL UI ===== */}
      {lamination.enabled && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          gap: "12px"
        }}>

          {/* Кнопки зліва */}
          {showOptions && (
            <div style={{display: "flex", gap: "8px"}}>
              {safeButtonsArr.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    lamination.material === item
                      ? "buttonsArtem buttonsArtemActive"
                      : "buttonsArtem"
                  }
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
              ))}
            </div>
          )}

          {/* Селект справа */}
          {showOptions && (
            <select
              className="selectArtem custom-select-container selectArtemBefore"
              value={lamination.size}
              onChange={handleSelectChange}
              style={{minWidth: "180px"}}
            >
              <option value="" disabled>
                Вибір ламінації
              </option>

              {thisLaminationSizes.map(item => (
                <option key={item.id} value={item.thickness} data-id={item.id}>
                  {item.thickness} мкм
                </option>
              ))}
            </select>
          )}

        </div>
      )}

    </div>
  );


};

export default NewNoModalLaminationNew;
