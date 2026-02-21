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
    // console.log(e);
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
  //       if(error?.response?.status === 403){
  //         navigate('/login');
  //       }
  //       setThisLaminationSizes([])
  //       console.log(error.message);
  //     })
  // }, [luversi.material, size]);

  const isOn = montajnaPlivka.type !== "Не потрібно";

  if (plotterCutting.type === "Не потрібно") return null;

  return (
    <div className="d-flex align-items-center">
      <label className="switch scale04ForButtonToggle">
        <input type="checkbox" checked={isOn} onChange={handleToggle} />
        <span className="switch-on"><span>Плівка</span></span>
        <span className="slider" />
        <span className="switch-off"><span>OFF</span></span>
      </label>
      {!isOn && (
        <div className="sc-title" style={{ marginBottom: 0 }}>Монтажна плівка</div>
      )}
      {isOn && buttonsArr.length > 0 && (
        <div style={{ display: "flex", alignItems: "center" }}>
          {buttonsArr.map((item, index) => (
            <div
              className={item === montajnaPlivka.material ? "buttonsArtem buttonsArtemActive" : "buttonsArtem"}
              key={index}
              onClick={() => handleClick(item)}
            >
              <div style={{ whiteSpace: "nowrap" }}>{item}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
};

export default MontajnaPlivkaWideFactory;
