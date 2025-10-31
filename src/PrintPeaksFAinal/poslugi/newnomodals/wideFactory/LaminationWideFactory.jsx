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
    // console.log(e);
    setLamination({
      ...lamination,
      materialId: e,
    })
  }

  useEffect(() => {
    if (lamination.type !== "Не потрібно") {
      const data = {
        name: "MaterialsPrices",
        inPageCount: 999999,
        currentPage: 1,
        search: "",
        columnName: { column: "id", reverse: false },
        type: type,
        material: {
          type: "Ламінація FactoryWide",
          material: lamination.material,
          materialId: lamination.materialId,
          thickness: lamination.size,
          typeUse: ""
        },
        size,
      };

      setLoad(true);
      setError(null);

      axios.post(`/materials/NotAll`, data)
        .then(response => {
          setLoad(false);
          const rows = response.data?.rows || [];
          setThisLaminationSizes(rows);

          if (rows.length > 0) {
            const first = rows[0];
            setLamination(prev => ({
              ...prev,
              material: first.name,
              materialId: Number(first.id) || 0, // 👈 ключова правка
              size: String(first.thickness || "")
            }));
          } else {
            setLamination(prev => ({
              ...prev,
              material: "",
              materialId: 0
            }));
          }
        })
        .catch(error => {
          setLoad(false);
          setError(error.message);
          if (error.response?.status === 403) navigate('/login');
          console.error("Error loading lamination materials:", error.message);
          setThisLaminationSizes([]);
        });
    }
  }, [lamination.type, size]);


  return (<div className="d-flex allArtemElem">
    <div style={{display: 'flex', alignItems: 'center', marginTop: "1vw", marginLeft: "0vw"}}>
      <label className="switch scale04ForButtonToggle" >
        <input
          type="checkbox"
          checked={lamination.type !== "Не потрібно"}
          onChange={handleToggle}
        />
        <span className="slider" />
      </label>
      <div className="d-flex flex-column">
            <span style={{
              marginRight: '0.633vw'
            }}>{"Ламінація:"}</span>
        {lamination.type !== "Не потрібно" ? (
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center',}}>
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}>
              {thisLaminationSizes.map((item, index) => (<button
                className={item.id === lamination.materialId ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}
                key={index}
                onClick={() => handleClick(item.id)}
                // style={{
                //     backgroundColor: item === lamination.material ? 'orange' : 'transparent',
                //     border: item === lamination.material ? '0.13vw solid transparent' : '0.13vw solid transparent',
                // }}
              >
                <div className="" style={{
                  fontSize: "var(--font-size-base)",
                  opacity: item.id === lamination.materialId ? '100%' : '50%',
                  whiteSpace: "nowrap",
                  // width:"13vw"
                }} data-id={item.id}
                >
                  {item.name}
                </div>
              </button>))}

              {/*{lamination.material === "По периметру" &&*/}
              {/*  <div className="ArtemNewSelectContainer" style={{marginLeft: "1vw"}}>*/}
              {/*    <select*/}
              {/*      value={lamination.size}*/}
              {/*      onChange={(event) => handleSelectChange(event)}*/}
              {/*      className="selectArtem"*/}
              {/*    >*/}
              {/*      <option value={""}>{""}</option>*/}
              {/*      {selectArr.map((item, iter2) => (*/}
              {/*        // <option className="optionInSelectArtem" key={item.thickness}*/}
              {/*        //         value={item.thickness} data-id={item.id} tosend={item.thickness}>{item.thickness} мкм</option>))}*/}
              {/*        <option className="optionInSelectArtem" key={item}*/}
              {/*                value={item}>{item} мм</option>))}*/}
              {/*    </select>*/}
              {/*  </div>*/}
              {/*}*/}
            </div>
          </div>) : (<div>

        </div>)}
      </div>
    </div>


    <>

    </>
  </div>)
};

export default LaminationWideFactory;
