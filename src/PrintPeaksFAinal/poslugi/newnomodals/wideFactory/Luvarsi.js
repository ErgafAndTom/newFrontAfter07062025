import React, {useEffect, useState} from "react";
import axios from '../../../../api/axiosInstance';
import {Navigate, useNavigate} from "react-router-dom";
import "../../Poslugy.css";

const Luvarsi = ({luversi, setLuversi, prices, buttonsArr, selectArr, size, type}) => {
  const [thisLaminationSizes, setThisLaminationSizes] = useState([]);
  const [error, setError] = useState(null);
  const [load, setLoad] = useState(true);
  const navigate = useNavigate();

  let handleSelectChange = (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const selectedId = selectedOption.getAttribute('data-id') || 'default';
    setLuversi({
      ...luversi,
      size: e.target.value
    })
  }

  let handleToggle = (e) => {
    if (luversi.type === "Не потрібно") {
      setLuversi({
        ...luversi,
        type: "",
      })
    } else {
      setLuversi({
        ...luversi,
        type: "Не потрібно",
      })
    }
  }

  let handleClick = (e) => {
    // console.log(e);
    setLuversi({
      ...luversi,
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
  //       if(error?.response?.status === 403){
  //         navigate('/login');
  //       }
  //       setThisLaminationSizes([])
  //       console.log(error.message);
  //     })
  // }, [luversi.material, size]);

  const isOn = luversi.type !== "Не потрібно";

  return (
    <div className="d-flex align-items-center">
      <label className="switch scale04ForButtonToggle">
        <input type="checkbox" checked={isOn} onChange={handleToggle} />
        <span className="switch-on"><span>Люверси</span></span>
        <span className="slider" />
        <span className="switch-off"><span>OFF</span></span>
      </label>
      {!isOn && (
        <div className="sc-title" style={{ marginBottom: 0 }}>Люверси</div>
      )}
      {isOn && (
        <div style={{ display: "flex", alignItems: "center" }}>
          {buttonsArr.map((item, index) => (
            <div
              className={item === luversi.material ? "buttonsArtem buttonsArtemActive" : "buttonsArtem"}
              key={index}
              onClick={() => handleClick(item)}
            >
              <div style={{ whiteSpace: "nowrap" }}>{item}</div>
            </div>
          ))}
          {luversi.material === "По периметру" && (
            <div className="ArtemNewSelectContainer" style={{ marginLeft: "1vw" }}>
              <select
                value={luversi.size}
                onChange={(event) => handleSelectChange(event)}
                className="selectArtem"
              >
                {selectArr.map((item) => (
                  <option className="optionInSelectArtem" key={item} value={item}>
                    {item} мм
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )
};

export default Luvarsi;
