import React, {useEffect, useState} from "react";
import axios from '../../../../api/axiosInstance';
import {Navigate, useNavigate} from "react-router-dom";

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

  return (<div className="d-flex allArtemElem" >
    <div style={{display: 'flex', alignItems: 'center', marginTop: "1vw", marginLeft: "0vw"}}>
      <label className="switch scale04ForButtonToggle" >
        <input
          type="checkbox"
          checked={plotterCutting.type !== "Не потрібно"}
          onChange={handleToggle}
        />
        <span className="slider" />
      </label>
      <div className="d-flex flex-column">
            <span style={{
              marginRight: '0.633vw'
            }}>{"Плоттерна порізка:"}</span>
        {plotterCutting.type !== "Не потрібно" ? (
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center',}}>
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}>
              {thisLaminationSizes.map((item, index) => (<button
                className={item.id === plotterCutting.materialId ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}
                key={index}
                onClick={() => handleClick(item.id)}
                // style={{
                //     backgroundColor: item === lamination.material ? 'orange' : 'transparent',
                //     border: item === lamination.material ? '0.13vw solid transparent' : '0.13vw solid transparent',
                // }}
              >
                <div className="" style={{
                  fontSize: "var(--font-size-base)",
                  opacity: item.id === plotterCutting.materialId ? '100%' : '50%',
                  whiteSpace: "nowrap",
                  // width:"13vw"

                }} data-id={item.id}>
                  {item.name}
                </div>
              </button>))}

              {plotterCutting.material === "По периметру" &&
                <div className="ArtemNewSelectContainer" style={{marginLeft: "1vw"}}>
                  <select
                    value={plotterCutting.size}
                    onChange={(event) => handleSelectChange(event)}
                    className="selectArtem"
                  >
                    <option value={""}>{""}</option>
                    {thisLaminationSizes.map((item, iter2) => (
                      <option className="optionInSelectArtem" key={item.thickness}
                              value={item.thickness} data-id={item.id} tosend={item.thickness}>{item.thickness} мкм</option>))}
                      {/*<option className="optionInSelectArtem" key={item}*/}
                      {/*        value={item}>{item} мм</option>))}*/}
                  </select>
                </div>
              }
            </div>
          </div>) : (<div>

        </div>)}
      </div>
    </div>
  </div>)
};

export default PlotterCutting;
