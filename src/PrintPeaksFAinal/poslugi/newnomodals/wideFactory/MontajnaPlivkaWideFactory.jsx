import React, {useEffect, useState} from "react";
import axios from '../../../../api/axiosInstance';
import {Navigate, useNavigate} from "react-router-dom";
import NewSheetCut from "../../NewSheetCut";

const MontajnaPlivkaWideFactory = ({
                                     montajnaPlivka,
                                     setMontajnaPlivka,
                                     plotterCutting,
                                     prices,
                                     buttonsArr,
                                     selectArr,
                                     size,
                                     type
                                   }) => {
  const [thisLaminationSizes, setThisLaminationSizes] = useState([]);
  const [error, setError] = useState(null);
  const [load, setLoad] = useState(true);
  const navigate = useNavigate();

  let handleSelectChange = (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const selectedId = selectedOption.getAttribute('data-id') || 'default';
    setMontajnaPlivka({
      ...montajnaPlivka,
      materialId: selectedId,
      size: e.target.value
    })
  }

  let handleToggle = (e) => {
    if (montajnaPlivka.type === "Не потрібно") {
      setMontajnaPlivka({
        ...montajnaPlivka,
        type: "",
      })
    } else {
      setMontajnaPlivka({
        ...montajnaPlivka,
        type: "Не потрібно",
      })
    }
  }

  let handleClick = (e) => {
    console.log(e);
    setMontajnaPlivka({
      ...montajnaPlivka,
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

  return (
    <div className="d-flex allArtemElem">
      {plotterCutting.type !== "Не потрібно" &&
        <div style={{display: 'flex', alignItems: 'center', marginTop: "1vw", marginLeft: "0vw"}}>
          <div
            className={`toggleContainer scale04ForButtonToggle ${montajnaPlivka.type === "Не потрібно" ? 'disabledCont' : 'enabledCont'}`}
            onClick={handleToggle}>
            <div className={`toggle-button ${montajnaPlivka.type === "Не потрібно" ? 'disabled' : 'enabledd'}`}>
            </div>
          </div>
          <div className="d-flex flex-column">
            <span style={{
              marginRight: '0.633vw', whiteSpace: "nowrap",
            }}>{"Монтажна плівка"}</span>
            {montajnaPlivka.type !== "Не потрібно" ? (
              <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center',}}>
                <div style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                  {buttonsArr.map((item, index) => (<button
                    className={item === montajnaPlivka.material ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}
                    key={index}
                    onClick={() => handleClick(item)}
                    // style={{
                    //     backgroundColor: item === lamination.material ? 'orange' : 'transparent',
                    //     border: item === lamination.material ? '0.13vw solid transparent' : '0.13vw solid transparent',
                    // }}
                  >
                    <div className="" style={{
                      fontSize: "var(--font-size-base)",
                      opacity: item === montajnaPlivka.material ? '100%' : '50%',
                      whiteSpace: "nowrap",
                      // width:"13vw"

                    }}>
                      {item}
                    </div>
                  </button>))}

                  {montajnaPlivka.material === "По периметру" &&
                    <div className="ArtemNewSelectContainer" style={{marginLeft: "1vw"}}>
                      <select
                        value={montajnaPlivka.size}
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
      }
    </div>
  )
};

export default MontajnaPlivkaWideFactory;
