import React, { useEffect, useState } from "react";
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

  const buttonsArrLamination = [
    "з глянцевим ламінуванням",
    "з матовим ламінуванням",
    "з ламінуванням SoftTouch",
    "з холодним матовим ламінуванням",
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
        setPaper(response.data.rows);
        setLoad(false);
        if (response.data?.rows?.[0]) {
          setMaterialAndDrukBack((prev) => ({
            ...prev,
            material: response.data.rows[0].name,
            materialId: response.data.rows[0].id,
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

  // ========== RENDER ==========
  const lamOn = materialAndDrukBack.laminationType !== "Не потрібно";

  return (
    <div className="sc-section sc-section-card" style={{ position: "relative", zIndex: 55 }}>
      {/* === Блок: кількість аркушів === */}
      <div className="d-flex align-items-center">
        <span className="sc-title" style={{ marginBottom: 0, marginRight: "0.5vw", whiteSpace: "nowrap" }}>Блок</span>
        <input
          className="inputsArtem"
          type="number"
          value={materialAndDrukBack.count}
          onChange={handleColorCountChange}
          style={{ width: "4vw", fontSize: "0.8vw", padding: "0.3vw" }}
          min={2}
          step={2}
        />
        <span style={{ marginLeft: "0.3vw", opacity: 0.6, fontSize: "0.85vw", color: "var(--admingrey)" }}>арк.</span>
        <span style={{ marginLeft: "0.5vw", opacity: 0.4, fontSize: "0.75vw", color: "var(--admingrey)" }}>
          ({materialAndDrukBack.count * 2} стор.)
        </span>
      </div>

      {/* === Друк === */}
      <div className="d-flex align-items-center" style={{ marginTop: "0.8vh" }}>
        <span className="sc-title" style={{ marginBottom: 0, marginRight: "0.5vw", whiteSpace: "nowrap" }}>Друк</span>
        <select value={materialAndDrukBack.drukColor || ""} onChange={handleSelectDrukColorChange} className="selectArtem" style={{ marginRight: "0.5vw" }}>
          {buttonsArrColor.map((item, i) => (
            <option key={item + i} value={item}>{item}</option>
          ))}
        </select>
        {materialAndDrukBack.drukColor !== "Не потрібно" && (
          <select value={materialAndDrukBack.drukSides || ""} onChange={handleSelectDrukSidesChange} className="selectArtem">
            {buttonsArrDruk.map((item, i) => (
              <option key={item + i} value={item}>{item}</option>
            ))}
          </select>
        )}
      </div>

      {/* === Матеріал === */}
      <div className="d-flex align-items-center" style={{ marginTop: "0.8vh" }}>
        <span className="sc-title" style={{ marginBottom: 0, marginRight: "0.5vw", whiteSpace: "nowrap" }}>Матеріал</span>
        <select value={materialAndDrukBack.materialTypeUse || ""} onChange={handleSelectTypeChange} className="selectArtem" style={{ marginRight: "0.5vw" }}>
          {buttonsArr.map((item, i) => (
            <option key={item + i} value={item}>{item}</option>
          ))}
        </select>
        <select value={materialAndDrukBack.material || ""} onChange={handleSelectChange} className="selectArtem">
          {paper.map((item, i) => (
            <option key={item.name + i} value={item.name} data-id={item.id}>
              {item.name} {item.thickness} gsm
            </option>
          ))}
        </select>
        {load && <Spinner animation="border" variant="danger" size="sm" style={{ marginLeft: "0.5vw" }} />}
        {error && <div style={{ color: "red", marginLeft: "0.5vw", fontSize: "0.8vw" }}>{error}</div>}
      </div>

      {/* === Ламінація toggle === */}
      <div className="d-flex align-items-center" style={{ marginTop: "0.8vh" }}>
        <label className="switch scale04ForButtonToggle">
          <input type="checkbox" checked={lamOn} onChange={handleToggleLamination} />
          <span className="switch-on"><span>ON</span></span>
          <span className="slider" />
          <span className="switch-off"><span>OFF</span></span>
        </label>
        {!lamOn ? (
          <div className="sc-title" style={{ marginBottom: 0 }}>Ламінація</div>
        ) : (
          <div className="sc-row sc-pp-row" style={{ flex: 1, alignItems: "center" }}>
            <select value={materialAndDrukBack.laminationTypeUse || ""} onChange={handleSelectLaminationTypeUseChange} className="selectArtem" style={{ marginRight: "0.5vw" }}>
              {buttonsArrLamination.map((item, i) => (
                <option key={item + i} value={item}>{item}</option>
              ))}
            </select>
            <select
              value={materialAndDrukBack.laminationmaterial || ""}
              onChange={(e) => {
                const sel = e.target.options[e.target.selectedIndex];
                setMaterialAndDrukBack((prev) => ({
                  ...prev,
                  laminationmaterial: e.target.value || "",
                  laminationmaterialId: sel.getAttribute("data-id") || "default",
                }));
              }}
              className="selectArtem"
            >
              {lamination.map((item, i) => (
                <option key={item.name + i} value={item.thickness} data-id={item.id}>
                  {item.thickness} мл
                </option>
              ))}
            </select>
            {loadLamination && <Spinner animation="border" variant="danger" size="sm" style={{ marginLeft: "0.5vw" }} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Materials2NoteBack;
