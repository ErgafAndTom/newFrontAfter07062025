import React, { useEffect, useState, useRef } from "react";
import axios from "../../../../api/axiosInstance";
import { Spinner } from "react-bootstrap";
import "../../Poslugy.css";

const Materials2NoteBack = ({
  materialAndDrukBack,
  setMaterialAndDrukBack,
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
    { value: "з ламінуванням SoftTouch", label: "SoftTouch" },
    { value: "з холодним матовим ламінуванням", label: "Холодне" },
  ];

  // ========== HANDLERS ==========
  const handleSelectChange = (e) => {
    const sel = e.target.options[e.target.selectedIndex];
    setMaterialAndDrukBack((prev) => ({
      ...prev,
      material: e.target.value || "",
      materialId: sel.getAttribute("data-id") || "default",
    }));
  };

  const handleSelectTypeChange = (e) => {
    setMaterialAndDrukBack((prev) => ({ ...prev, materialTypeUse: e.target.value || "" }));
  };

  const handleSelectDrukSidesChange = (e) => {
    setMaterialAndDrukBack((prev) => ({ ...prev, drukSides: e.target.value || "" }));
  };

  const handleSelectDrukColorChange = (e) => {
    setMaterialAndDrukBack((prev) => ({ ...prev, drukColor: e.target.value || "" }));
  };

  const handleToggleBlock = () => {
    setMaterialAndDrukBack((prev) => ({
      ...prev,
      materialAndDrukBack: prev.materialAndDrukBack === "Не потрібно" ? "2" : "Не потрібно",
    }));
  };

  const handleToggleLamination = () => {
    setMaterialAndDrukBack((prev) => ({
      ...prev,
      laminationType: prev.laminationType === "Не потрібно" ? "з глянцевим ламінуванням" : "Не потрібно",
    }));
  };

  const handleSelectLaminationTypeUseChange = (e) => {
    setMaterialAndDrukBack((prev) => ({ ...prev, laminationTypeUse: e.target.value || "" }));
  };

  const handleColorCountChange = (e) => {
    const value = Number(e.target.value);
    setMaterialAndDrukBack((prev) => ({
      ...prev,
      count: value % 2 !== 0 ? value + 1 : value,
    }));
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
        type: materialAndDrukBack.materialType,
        typeUse: materialAndDrukBack.materialTypeUse,
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
          setMaterialAndDrukBack((prev) => ({
            ...prev,
            material: rows[0].name,
            materialId: rows[0].id,
          }));
        } else {
          setMaterialAndDrukBack((prev) => ({ ...prev, material: "Немає", materialId: 0 }));
        }
      })
      .catch((err) => {
        setLoad(false);
        setError(err.message);
        console.log(err.message);
      });
  }, [materialAndDrukBack.materialTypeUse, size]);

  useEffect(() => {
    if (materialAndDrukBack.laminationType === "Не потрібно") return;
    const data = {
      name: "MaterialsPrices",
      inPageCount: 999999,
      currentPage: 1,
      type: "SheetCut",
      search: "",
      columnName: { column: "id", reverse: false },
      size: size,
      material: { type: "Ламінування", material: materialAndDrukBack.laminationTypeUse },
    };
    setLoadLamination(true);
    setError(null);
    axios
      .post(`/materials/NotAll`, data)
      .then((response) => {
        setLamination(response.data.rows);
        setLoadLamination(false);
        if (response.data?.rows?.[0]) {
          setMaterialAndDrukBack((prev) => ({
            ...prev,
            laminationmaterial: response.data.rows[0].name,
            laminationmaterialId: response.data.rows[0].id,
          }));
        } else {
          setMaterialAndDrukBack((prev) => ({ ...prev, laminationmaterial: "Немає", laminationmaterialId: 0 }));
        }
      })
      .catch((err) => {
        setLoadLamination(false);
        setError(err.message);
        console.log(err.message);
      });
  }, [materialAndDrukBack.laminationType, materialAndDrukBack.laminationTypeUse, size]);

  // закриття dropdown при кліку за межами
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownPaperRef.current && !dropdownPaperRef.current.contains(e.target)) setOpenPaper(false);
      if (dropdownLamRef.current && !dropdownLamRef.current.contains(e.target)) setOpenLam(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const paperTitle = materialAndDrukBack.material && materialAndDrukBack.material !== "Немає"
    ? materialAndDrukBack.material
    : "Виберіть матеріал";

  const lamThickness = lamination.find((p) => p.name === materialAndDrukBack.laminationmaterial)?.thickness;
  const lamTitle = lamThickness ? `${lamThickness} мкм` : "Виберіть ламінацію";

  // ========== RENDER ==========
  const isBlockOn = materialAndDrukBack.materialAndDrukBack !== "Не потрібно";
  const lamOn = materialAndDrukBack.laminationType !== "Не потрібно";

  return (
    <div className="sc-section sc-section-card" style={{ position: "relative", zIndex: 55, display: "flex", flexDirection: "column", gap: "0.8vh" }}>
      {/* === Блок: головний toggle + кількість + кольоровість === */}
      <div className="d-flex align-items-center">
        <label className="switch scale04ForButtonToggle">
          <input type="checkbox" checked={isBlockOn} onChange={handleToggleBlock} />
          <span className="switch-on"><span>Блок</span></span>
          <span className="slider" />
          <span className="switch-off"><span>OFF</span></span>
        </label>
        {!isBlockOn ? (
          <div className="sc-title" style={{ marginBottom: 0 }}>{name}</div>
        ) : (
          <>
            {buttonsArrColor.map((item, i) => {
              const isActive = item === materialAndDrukBack.drukColor;
              return (
                <div
                  className={isActive ? "buttonsArtem buttonsArtemActive" : "buttonsArtem"}
                  key={item + i}
                  onClick={() => setMaterialAndDrukBack((prev) => ({ ...prev, drukColor: item }))}
                >
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item}
                  </div>
                </div>
              );
            })}
            <input
              className="inputsArtem"
              type="number"
              value={materialAndDrukBack.count}
              onChange={handleColorCountChange}
              min={2}
              step={2}
              style={{ marginLeft: "1vw" }}
            />
            <div className="inputsArtemx" style={{ border: "transparent" }}>арк.</div>
          </>
        )}
      </div>

      {isBlockOn && (
        <>

          {/* === Сторонність === */}
          {materialAndDrukBack.drukColor !== "Не потрібно" && (
            <div style={{ display: "flex", width: "100%" }}>
              {buttonsArrDruk.map((item, i) => {
                const isActive = item === materialAndDrukBack.drukSides;
                return (
                  <div
                    className={isActive ? "buttonsArtem buttonsArtemActive" : "buttonsArtem"}
                    key={item + i}
                    style={{ flex: 1 }}
                    onClick={() => setMaterialAndDrukBack((prev) => ({ ...prev, drukSides: item }))}
                  >
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {item}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* === Матеріал — кнопки + dropdown в один рядок === */}
          <div className="d-flex align-items-center" style={{ position: "relative" }}>
            {buttonsArr.map((item, i) => {
              const isActive = item === materialAndDrukBack.materialTypeUse;
              return (
                <div
                  className={isActive ? "buttonsArtem buttonsArtemActive" : "buttonsArtem"}
                  key={item + i}
                  onClick={() => setMaterialAndDrukBack((prev) => ({ ...prev, materialTypeUse: item }))}
                >
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item}
                  </div>
                </div>
              );
            })}
            <div
              className={`custom-select-container selectArtem selectArtemBefore${materialAndDrukBack.materialId && materialAndDrukBack.materialId !== 0 && materialAndDrukBack.materialId !== "0" ? " sc-has-value" : ""}`}
              ref={dropdownPaperRef}
              style={{ flex: 1, marginLeft: "0.5vw", position: "relative" }}
            >
              <div className="custom-select-header" onClick={() => setOpenPaper(!openPaper)}>
                {paperTitle}
                <span className="gsm-sub" style={{ marginRight: "0.8vw" }}>
                  {paper.find((p) => p.name === materialAndDrukBack.material)?.thickness && (
                    <sub>{paper.find((p) => p.name === materialAndDrukBack.material).thickness} г/м<sub>2</sub></sub>
                  )}
                </span>
              </div>
              {openPaper && (
                <div className="custom-select-dropdown">
                  {paper.map((item) => (
                    <div
                      key={item.id}
                      className={`custom-option ${String(item.id) === String(materialAndDrukBack.materialId) ? "active" : ""}`}
                      onClick={() => {
                        setMaterialAndDrukBack((prev) => ({ ...prev, material: item.name, materialId: item.id }));
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

          {/* === Ламінація toggle === */}
          <div className="d-flex align-items-center">
            <label className="switch scale04ForButtonToggle">
              <input type="checkbox" checked={lamOn} onChange={handleToggleLamination} />
              <span className="switch-on"><span>Ламінація</span></span>
              <span className="slider" />
              <span className="switch-off"><span>OFF</span></span>
            </label>
            {!lamOn && <div className="sc-title" style={{ marginBottom: 0 }}>Ламінація</div>}
            {lamOn && buttonsArrLamination.map((item, i) => {
              const isActive = item.value === materialAndDrukBack.laminationTypeUse;
              return (
                <div
                  className={isActive ? "buttonsArtem buttonsArtemActive" : "buttonsArtem"}
                  key={item.value + i}
                  onClick={() => setMaterialAndDrukBack((prev) => ({ ...prev, laminationTypeUse: item.value }))}
                >
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.label}
                  </div>
                </div>
              );
            })}
            {lamOn && (
              <div
                className={`custom-select-container selectArtem selectArtemBefore${materialAndDrukBack.laminationmaterialId && materialAndDrukBack.laminationmaterialId !== 0 && materialAndDrukBack.laminationmaterialId !== "0" ? " sc-has-value" : ""}`}
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
                        className={`custom-option ${String(item.id) === String(materialAndDrukBack.laminationmaterialId) ? "active" : ""}`}
                        onClick={() => {
                          setMaterialAndDrukBack((prev) => ({ ...prev, laminationmaterial: item.name, laminationmaterialId: item.id }));
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

export default Materials2NoteBack;
