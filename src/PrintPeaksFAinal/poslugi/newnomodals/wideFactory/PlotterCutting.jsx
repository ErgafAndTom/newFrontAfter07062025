import React, {useEffect, useState} from "react";
import axios from '../../../../api/axiosInstance';
import {Navigate, useNavigate} from "react-router-dom";
import "../../Poslugy.css";

const PlotterCutting = ({plotterCutting, setPlotterCutting, plivkaOrPVH, prices, buttonsArr, selectArr, size, type}) => {
  const [thisLaminationSizes, setThisLaminationSizes] = useState([]);
  const [error, setError] = useState(null);
  const [load, setLoad] = useState(true);
  const navigate = useNavigate();

  let handleSelectChange = (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const selectedId = selectedOption.getAttribute('data-id') || 'default';
    setPlotterCutting({
      ...plotterCutting,
      materialId: selectedId,
      size: e.target.value
    })
  }

  let handleToggle = (e) => {
    if (plotterCutting.type === "Не потрібно") {
      setPlotterCutting({
        ...plotterCutting,
        type: "",
      })
    } else {
      setPlotterCutting({
        ...plotterCutting,
        type: "Не потрібно",
      })
    }
  }

  let handleClick = (e) => {
    // console.log(e);
    setPlotterCutting({
      ...plotterCutting,
      materialId: e,
    })
  }

  useEffect(() => {
    let data = {
      name: "MaterialsPrices",
      inPageCount: 999999,
      currentPage: 1,
      search: "",
      columnName: {
        column: "id",
        reverse: false
      },
      type: type,
      material: {
        type: plivkaOrPVH,
        material: plotterCutting.material,
        materialId: plotterCutting.materialId,
        thickness: plotterCutting.size,
        typeUse: "А3"
      },
      size: size,
    }
    setLoad(true)
    setError(null)
    axios.post(`/materials/NotAll`, data)
      .then(response => {
        // console.log(response.data);
        setLoad(false)
        setThisLaminationSizes(response.data.rows)
        // console.log(response.data.rows);
        if(response.data && response.data.rows && response.data.rows[0]){
          setPlotterCutting({
            ...plotterCutting,
            // material: response.data.rows[0].name,
            materialId: response.data.rows[0].id,
          })
        } else {
          setThisLaminationSizes([])
          setPlotterCutting({
            ...plotterCutting,
            materialId: 0,
          })
        }
      })
      .catch(error => {
        setLoad(false)
        setError(error.message)
        if(error?.response?.status === 403){
          navigate('/login');
        }
        setThisLaminationSizes([])
        console.log(error.message);
      })
  }, [plotterCutting.type, size]);

  const isOn = plotterCutting.type !== "Не потрібно";

  return (
    <div className="d-flex align-items-center">
      <label className="switch scale04ForButtonToggle">
        <input
          type="checkbox"
          checked={isOn}
          onChange={handleToggle}
        />
        <span className="switch-on"><span>Порізка</span></span>
        <span className="slider" />
        <span className="switch-off"><span>OFF</span></span>
      </label>
      {!isOn && (
        <div className="sc-title" style={{ marginBottom: 0 }}>Плоттерна порізка</div>
      )}
      {isOn && (
        <div style={{ display: "flex", alignItems: "center" }}>
          {thisLaminationSizes.map((item, index) => (
            <div
              className={item.id === plotterCutting.materialId ? "buttonsArtem buttonsArtemActive" : "buttonsArtem"}
              key={index}
              onClick={() => handleClick(item.id)}
            >
              <div style={{ whiteSpace: "nowrap" }}>{item.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
};

export default PlotterCutting;
