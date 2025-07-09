import React, {useEffect, useState} from "react";
import axios from '../../../../api/axiosInstance';
import {Navigate, useNavigate} from "react-router-dom";

const LaminationWideFactory = ({lamination, setLamination, prices, buttonsArr, selectArr, size, type}) => {
  const [thisLaminationSizes, setThisLaminationSizes] = useState([]);
  const [error, setError] = useState(null);
  const [load, setLoad] = useState(true);
  const navigate = useNavigate();

  let handleSelectChange = (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const selectedId = selectedOption.getAttribute('data-id') || 'default';
    setLamination({
      ...lamination,
      materialId: selectedId,
      size: e.target.value
    })
  }

  let handleToggle = (e) => {
    if (lamination.type === "Не потрібно") {
      setLamination({
        ...lamination,
        type: "",
      })
    } else {
      setLamination({
        ...lamination,
        type: "Не потрібно",
      })
    }
  }

  let handleClick = (e) => {
    console.log(e);
    setLamination({
      ...lamination,
      material: e,
    })
  }

  // useEffect(() => {
  //   let data = {
  //     name: "MaterialsPrices",
  //     inPageCount: 999999,
  //     currentPage: 1,
  //     search: "",
  //     columnName: {
  //       column: "id",
  //       reverse: false
  //     },
  //     type: type,
  //     material: {
  //       type: "Люверси FactoryWide",
  //       material: luversi.material,
  //       materialId: luversi.materialId,
  //       thickness: luversi.size,
  //       typeUse: "А3"
  //     },
  //     size: size,
  //   }
  //   setLoad(true)
  //   setError(null)
  //   console.log(luversi);
  //   axios.post(`/materials/NotAll`, data)
  //     .then(response => {
  //       console.log(response.data);
  //       setLoad(false)
  //       setThisLaminationSizes(response.data.rows)
  //       if(response.data && response.data.rows && response.data.rows[0]){
  //         setLuversi({
  //           ...luversi,
  //           // material: response.data.rows[0].name,
  //           materialId: response.data.rows[0].id,
  //           size: `${response.data.rows[0].thickness}`
  //         })
  //       } else {
  //         setThisLaminationSizes([])
  //         setLuversi({
  //           ...luversi,
  //           materialId: 0,
  //         })
  //       }
  //     })
  //     .catch(error => {
  //       setLoad(false)
  //       setError(error.message)
  //       if(error.response.status === 403){
  //         navigate('/login');
  //       }
  //       setThisLaminationSizes([])
  //       console.log(error.message);
  //     })
  // }, [luversi.material, size]);

  return (<div className="d-flex allArtemElem" >
    <div style={{display: 'flex', alignItems: 'center', marginTop: "1vw", marginLeft: "0vw"}}>
      <div className={`toggleContainer scale04ForButtonToggle ${lamination.type === "Не потрібно" ? 'disabledCont' : 'enabledCont'}`}
           onClick={handleToggle}>
        <div className={`toggle-button ${lamination.type === "Не потрібно" ? 'disabled' : 'enabledd'}`}>
        </div>
      </div>
      <div className="d-flex flex-column">
            <span style={{
              marginRight: '0.633vw'
            }}>{"Ламінація:"}</span>
        {lamination.type !== "Не потрібно" ? (
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center',}}>
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}>
              {buttonsArr.map((item, index) => (<button
                className={item === lamination.material ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}
                key={index}
                onClick={() => handleClick(item)}
                // style={{
                //     backgroundColor: item === lamination.material ? 'orange' : 'transparent',
                //     border: item === lamination.material ? '0.13vw solid transparent' : '0.13vw solid transparent',
                // }}
              >
                <div className="" style={{
                  fontSize: "var(--font-size-base)",
                  opacity: item === lamination.material ? '100%' : '50%',
                  whiteSpace: "nowrap",
                  // width:"13vw"

                }}>
                  {item}
                </div>
              </button>))}

              {lamination.material === "По периметру" &&
                <div className="ArtemNewSelectContainer" style={{marginLeft: "1vw"}}>
                  <select
                    value={lamination.size}
                    onChange={(event) => handleSelectChange(event)}
                    className="selectArtem"
                  >
                    <option value={""}>{""}</option>
                    {selectArr.map((item, iter2) => (
                      // <option className="optionInSelectArtem" key={item.thickness}
                      //         value={item.thickness} data-id={item.id} tosend={item.thickness}>{item.thickness} мкм</option>))}
                      <option className="optionInSelectArtem" key={item}
                              value={item}>{item} мм</option>))}
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

export default LaminationWideFactory;
