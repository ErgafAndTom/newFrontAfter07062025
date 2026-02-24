import React, { useEffect, useState, useRef } from "react";
import axios from "../../../../api/axiosInstance";
import { Spinner } from "react-bootstrap";
import "../../Poslugy.css";

const Materials2NoteFront = ({
  materialAndDrukFront,
  setMaterialAndDrukFront,
  count,
  setCount,
  prices,
  type,
  name,
  buttonsArr,
  buttonsArrDruk,
  buttonsArrColor,
  selectArr,
  typeUse,
  size,
}) => {
  const [paper, setPaper] = useState([]);
  const [error, setError] = useState(null);
  const [load, setLoad] = useState(true);

  const [lamination, setLamination] = useState([]);
  const [loadLamination, setLoadLamination] = useState(false);
  const [openPaper, setOpenPaper] = useState(false);
  const [openLam, setOpenLam] = useState(false);
  const dropdownPaperRef = useRef(null);
  const dropdownLamRef = useRef(null);

  const buttonsArrLamination = [
    { value: "з глянцевим ламінуванням", label: "Глянцеве" },
    { value: "з матовим ламінуванням", label: "Матове" },
    { value: "з ламінуванням Soft Touch", label: "Soft Touch" },
  ];

  // ========== HANDLERS ==========
  const handleSelectChange = (e) => {
    const sel = e.target.options[e.target.selectedIndex];
    setMaterialAndDrukFront((prev) => ({
      ...prev,
      material: e.target.value || "",
      materialId: sel.getAttribute("data-id") || "default",
    }));
  };

  const handleSelectTypeChange = (e) => {
    setMaterialAndDrukFront((prev) => ({ ...prev, materialTypeUse: e.target.value || "" }));
  };

  const handleSelectDrukSidesChange = (e) => {
    setMaterialAndDrukFront((prev) => ({ ...prev, drukSides: e.target.value || "" }));
  };

  const handleSelectDrukColorChange = (e) => {
    setMaterialAndDrukFront((prev) => ({ ...prev, drukColor: e.target.value || "" }));
  };

  const handleToggleAll = () => {
    setMaterialAndDrukFront((prev) => ({
      ...prev,
      materialAndDrukFront: prev.materialAndDrukFront === "Не потрібно" ? "2" : "Не потрібно",
    }));
  };

  const handleToggleLamination = () => {
    setMaterialAndDrukFront((prev) => ({
      ...prev,
      laminationType: prev.laminationType === "Не потрібно" ? "" : "Не потрібно",
    }));
  };

  const handleSelectLaminationTypeUseChange = (e) => {
    setMaterialAndDrukFront((prev) => ({ ...prev, laminationTypeUse: e.target.value || "" }));
  };

  // ========== EFFECTS ==========
  useEffect(() => {
    const data = {
      name: "MaterialsPrices",
      inPageCount: 999999,
      currentPage: 1,
      search: "",
      columnName: { column: "id", reverse: false },
      size: size,
      typeOfPosluga: "Note/Booklet",
      material: {
        type: materialAndDrukFront.materialType,
        typeUse: materialAndDrukFront.materialTypeUse,
      },
    };
    setLoad(true);
    setError(null);
    axios
      .post(`/materials/NotAll`, data)
      .then((response) => {
        const rows = (response.data.rows || []).filter(
          (r) => r.name !== "Офісний папір А4"
        );
        setPaper(rows);
        setLoad(false);
        if (rows[0]) {
          setMaterialAndDrukFront((prev) => ({
            ...prev,
            material: rows[0].name,
            materialId: rows[0].id,
          }));
        } else {
          setMaterialAndDrukFront((prev) => ({ ...prev, material: "Немає", materialId: 0 }));
        }
      })
      .catch((err) => {
        setLoad(false);
        setError(err.message);
        console.log(err.message);
      });
  }, [materialAndDrukFront.materialTypeUse, size]);

  useEffect(() => {
    if (materialAndDrukFront.laminationType === "Не потрібно") return;
    const data = {
      name: "MaterialsPrices",
      inPageCount: 999999,
      currentPage: 1,
      type: "SheetCut",
      search: "",
      columnName: { column: "id", reverse: false },
      size: size,
      material: { type: "Ламінування", material: materialAndDrukFront.laminationTypeUse },
    };
    setLoadLamination(true);
    setError(null);
    axios
      .post(`/materials/NotAll`, data)
      .then((response) => {
        setLamination(response.data.rows);
        setLoadLamination(false);
        if (response.data?.rows?.[0]) {
          setMaterialAndDrukFront((prev) => ({
            ...prev,
            laminationmaterial: response.data.rows[0].name,
            laminationmaterialId: response.data.rows[0].id,
          }));
        } else {
          setMaterialAndDrukFront((prev) => ({ ...prev, laminationmaterial: "Немає", laminationmaterialId: 0 }));
        }
      })
      .catch((err) => {
        setLoadLamination(false);
        setError(err.message);
        console.log(err.message);
      });
  }, [materialAndDrukFront.laminationType, materialAndDrukFront.laminationTypeUse, size]);

  // закриття dropdown при кліку за межами
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownPaperRef.current && !dropdownPaperRef.current.contains(e.target)) setOpenPaper(false);
      if (dropdownLamRef.current && !dropdownLamRef.current.contains(e.target)) setOpenLam(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const paperTitle = materialAndDrukFront.material && materialAndDrukFront.material !== "Немає"
    ? materialAndDrukFront.material
    : "Виберіть матеріал";

  const lamThickness = lamination.find((p) => p.name === materialAndDrukFront.laminationmaterial)?.thickness;
  const lamTitle = lamThickness ? `${lamThickness} мкм` : "Виберіть ламінацію";

  // ========== RENDER ==========
  const isOn = materialAndDrukFront.materialAndDrukFront !== "Не потрібно";
  const lamOn = materialAndDrukFront.laminationType !== "Не потрібно";

  return (
    <div className="sc-section sc-section-card" style={{ position: "relative", zIndex: 60, display: "flex", flexDirection: "column", gap: "0.8vh" }}>
      {/* === Головний toggle: Обкладинка / Друк inline === */}
      <div className="d-flex align-items-center">
        <label className="switch scale04ForButtonToggle">
          <input type="checkbox" checked={isOn} onChange={handleToggleAll} />
          <span className="switch-on"><span>Обкладинки</span></span>
          <span className="slider" />
          <span className="switch-off"><span>OFF</span></span>
        </label>
        {!isOn ? (
          <div className="sc-title" style={{ marginBottom: 0 }}>{name}</div>
        ) : (
          <div className="sc-row sc-pp-row" style={{ flex: 1, alignItems: "center" }}>
            <div style={{ display: "flex" }}>
              {buttonsArrColor.map((item, i) => {
                const isActive = item === materialAndDrukFront.drukColor;
                return (
                  <div
                    className={isActive ? "buttonsArtem buttonsArtemActive" : "buttonsArtem"}
                    key={item + i}
                    onClick={() => setMaterialAndDrukFront((prev) => ({ ...prev, drukColor: item }))}
                  >
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {item}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* === Розгорнутий контент (коли ON) === */}
      {isOn && (
        <>
          {/* Сторонність */}
          {materialAndDrukFront.drukColor !== "Не потрібно" && (
            <div style={{ display: "flex", width: "100%" }}>
              {buttonsArrDruk.map((item, i) => {
                const isActive = item === materialAndDrukFront.drukSides;
                return (
                  <div
                    className={isActive ? "buttonsArtem buttonsArtemActive" : "buttonsArtem"}
                    key={item + i}
                    style={{ flex: 1 }}
                    onClick={() => setMaterialAndDrukFront((prev) => ({ ...prev, drukSides: item }))}
                  >
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {item}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Матеріал — кнопки + dropdown в один рядок */}
          <div className="d-flex align-items-center" style={{ position: "relative" }}>
            {buttonsArr.map((item, i) => {
              const isActive = item === materialAndDrukFront.materialTypeUse;
              return (
                <div
                  className={isActive ? "buttonsArtem buttonsArtemActive" : "buttonsArtem"}
                  key={item + i}
                  onClick={() => setMaterialAndDrukFront((prev) => ({ ...prev, materialTypeUse: item }))}
                >
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item}
                  </div>
                </div>
              );
            })}
            <div
              className={`custom-select-container selectArtem selectArtemBefore${materialAndDrukFront.materialId && materialAndDrukFront.materialId !== 0 && materialAndDrukFront.materialId !== "0" ? " sc-has-value" : ""}`}
              ref={dropdownPaperRef}
              style={{ flex: 1, marginLeft: "0.5vw", position: "relative" }}
            >
              <div className="custom-select-header" onClick={() => setOpenPaper(!openPaper)}>
                {paperTitle}
                <span className="gsm-sub" style={{ marginRight: "0.8vw" }}>
                  {paper.find((p) => p.name === materialAndDrukFront.material)?.thickness && (
                    <sub>{paper.find((p) => p.name === materialAndDrukFront.material).thickness} г/м<sub>2</sub></sub>
                  )}
                </span>
              </div>
              {openPaper && (
                <div className="custom-select-dropdown">
                  {paper.map((item) => (
                    <div
                      key={item.id}
                      className={`custom-option ${String(item.id) === String(materialAndDrukFront.materialId) ? "active" : ""}`}
                      onClick={() => {
                        setMaterialAndDrukFront((prev) => ({ ...prev, material: item.name, materialId: item.id }));
                        setOpenPaper(false);
                      }}
                    >
                      <span className="name">{item.name}</span>
                      <span className="gsm-sub">
                        <sub>{item.thickness} г/м<sub>2</sub></sub>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {load && <Spinner animation="border" variant="danger" size="sm" style={{ marginLeft: "0.5vw" }} />}
            {error && <div style={{ color: "red", marginLeft: "0.5vw", fontSize: "0.8vw" }}>{error}</div>}
          </div>

          {/* Ламінація toggle */}
          <div className="d-flex align-items-center">
            <label className="switch scale04ForButtonToggle">
              <input type="checkbox" checked={lamOn} onChange={handleToggleLamination} />
              <span className="switch-on"><span>Ламінація</span></span>
              <span className="slider" />
              <span className="switch-off"><span>OFF</span></span>
            </label>
            {!lamOn && <div className="sc-title" style={{ marginBottom: 0 }}>Ламінація</div>}
            {lamOn && buttonsArrLamination.map((item, i) => {
              const isActive = item.value === materialAndDrukFront.laminationTypeUse;
              return (
                <div
                  className={isActive ? "buttonsArtem buttonsArtemActive" : "buttonsArtem"}
                  key={item.value + i}
                  onClick={() => setMaterialAndDrukFront((prev) => ({ ...prev, laminationTypeUse: item.value }))}
                >
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.label}
                  </div>
                </div>
              );
            })}
            {lamOn && (
              <div
                className={`custom-select-container selectArtem selectArtemBefore${materialAndDrukFront.laminationmaterialId && materialAndDrukFront.laminationmaterialId !== 0 && materialAndDrukFront.laminationmaterialId !== "0" ? " sc-has-value" : ""}`}
                ref={dropdownLamRef}
                style={{ marginLeft: "0.5vw", position: "relative" }}
              >
                <div className="custom-select-header" onClick={() => setOpenLam(!openLam)}>
                  {lamTitle}
                </div>
                {openLam && (
                  <div className="custom-select-dropdown">
                    {lamination.map((item) => (
                      <div
                        key={item.id}
                        className={`custom-option ${String(item.id) === String(materialAndDrukFront.laminationmaterialId) ? "active" : ""}`}
                        onClick={() => {
                          setMaterialAndDrukFront((prev) => ({ ...prev, laminationmaterial: item.name, laminationmaterialId: item.id }));
                          setOpenLam(false);
                        }}
                      >
                        <span className="name">{item.thickness} мкм</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {lamOn && loadLamination && <Spinner animation="border" variant="danger" size="sm" style={{ marginLeft: "0.5vw" }} />}
          </div>
        </>
      )}
    </div>
  );
};

export default Materials2NoteFront;
