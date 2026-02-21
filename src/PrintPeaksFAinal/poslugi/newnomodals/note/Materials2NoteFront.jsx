import React, { useEffect, useState } from "react";
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

  const buttonsArrLamination = [
    "з глянцевим ламінуванням",
    "з матовим ламінуванням",
    "з ламінуванням Soft Touch",
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
        setPaper(response.data.rows);
        setLoad(false);
        if (response.data?.rows?.[0]) {
          setMaterialAndDrukFront((prev) => ({
            ...prev,
            material: response.data.rows[0].name,
            materialId: response.data.rows[0].id,
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

  // ========== RENDER ==========
  const isOn = materialAndDrukFront.materialAndDrukFront !== "Не потрібно";
  const lamOn = materialAndDrukFront.laminationType !== "Не потрібно";

  return (
    <div className="sc-section sc-section-card" style={{ position: "relative", zIndex: 60 }}>
      {/* === Головний toggle: Обкладинка / Друк inline === */}
      <div className="d-flex align-items-center">
        <label className="switch scale04ForButtonToggle">
          <input type="checkbox" checked={isOn} onChange={handleToggleAll} />
          <span className="switch-on"><span>ON</span></span>
          <span className="slider" />
          <span className="switch-off"><span>OFF</span></span>
        </label>
        {!isOn ? (
          <div className="sc-title" style={{ marginBottom: 0 }}>{name}</div>
        ) : (
          <div className="sc-row sc-pp-row" style={{ flex: 1, alignItems: "center" }}>
            <span className="sc-title" style={{ marginBottom: 0, marginRight: "0.5vw", whiteSpace: "nowrap" }}>Друк</span>
            <select value={materialAndDrukFront.drukColor || ""} onChange={handleSelectDrukColorChange} className="selectArtem">
              {buttonsArrColor.map((item, i) => (
                <option key={item + i} value={item}>{item}</option>
              ))}
            </select>
            {materialAndDrukFront.drukColor !== "Не потрібно" && (
              <select value={materialAndDrukFront.drukSides || ""} onChange={handleSelectDrukSidesChange} className="selectArtem" style={{ marginLeft: "0.5vw" }}>
                {buttonsArrDruk.map((item, i) => (
                  <option key={item + i} value={item}>{item}</option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* === Розгорнутий контент (коли ON) === */}
      {isOn && (
        <>
          {/* Матеріал */}
          <div className="d-flex align-items-center" style={{ marginTop: "0.8vh" }}>
            <span className="sc-title" style={{ marginBottom: 0, marginRight: "0.5vw", whiteSpace: "nowrap" }}>Матеріал</span>
            <select value={materialAndDrukFront.materialTypeUse || ""} onChange={handleSelectTypeChange} className="selectArtem">
              {buttonsArr.map((item, i) => (
                <option key={item + i} value={item}>{item}</option>
              ))}
            </select>
            <select value={materialAndDrukFront.material || ""} onChange={handleSelectChange} className="selectArtem" style={{ marginLeft: "0.5vw" }}>
              {paper.map((item, i) => (
                <option key={item.name + i} value={item.name} data-id={item.id}>
                  {item.name} {item.thickness} gsm
                </option>
              ))}
            </select>
            {load && <Spinner animation="border" variant="danger" size="sm" style={{ marginLeft: "0.5vw" }} />}
            {error && <div style={{ color: "red", marginLeft: "0.5vw", fontSize: "0.8vw" }}>{error}</div>}
          </div>

          {/* Ламінація toggle */}
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
                <select value={materialAndDrukFront.laminationTypeUse || ""} onChange={handleSelectLaminationTypeUseChange} className="selectArtem">
                  {buttonsArrLamination.map((item, i) => (
                    <option key={item + i} value={item}>{item}</option>
                  ))}
                </select>
                <select
                  value={materialAndDrukFront.laminationmaterial || ""}
                  onChange={(e) => {
                    const sel = e.target.options[e.target.selectedIndex];
                    setMaterialAndDrukFront((prev) => ({
                      ...prev,
                      laminationmaterial: e.target.value || "",
                      laminationmaterialId: sel.getAttribute("data-id") || "default",
                    }));
                  }}
                  className="selectArtem"
                  style={{ marginLeft: "0.5vw" }}
                >
                  {lamination.map((item, i) => (
                    <option key={item.name + i} value={item.thickness} data-id={item.id}>
                      {item.thickness} gsm
                    </option>
                  ))}
                </select>
                {loadLamination && <Spinner animation="border" variant="danger" size="sm" style={{ marginLeft: "0.5vw" }} />}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Materials2NoteFront;
