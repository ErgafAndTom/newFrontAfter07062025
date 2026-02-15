import React, {useEffect, useState, useRef} from "react";
import axios from '../../../api/axiosInstance';
import {Navigate, useNavigate} from "react-router-dom";
import "../Poslugy.css";


const NewNoModalLamination = ({lamination, setLamination, prices, buttonsArr, selectArr, size, type, isVishichka, labelMap}) => {
    const [thisLaminationSizes, setThisLaminationSizes] = useState([]);
    const [error, setError] = useState(null);
    const [load, setLoad] = useState(true);
    const [openThickness, setOpenThickness] = useState(false);
    const thicknessRef = useRef(null);
    const navigate = useNavigate();

    let handleSelectChange = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const selectedId = selectedOption.getAttribute('data-id') || 'default';
        setLamination({
            type: lamination.type,
            material: lamination.material,
            materialId: selectedId,
            size: e.target.value
        })
    }

    let handleToggle = (e) => {
        if (lamination.type === "Не потрібно") {
            setLamination({
                ...lamination,
                type: "з глянцевим ламінуванням",
                material: "з глянцевим ламінуванням",
                materialId: "",
                size: "",
                typeUse: "А3",
            })
        } else {
            setLamination({
                type: "Не потрібно",
                material: "",
                materialId: "",
                size: "",
                typeUse: "А3",
            })
        }
    }

    let handleClick = (e) => {
        // if(e !== "З ламінуванням Soft Touch"){
        //     setThisLaminationSizes(["30", "80", "100", "125", "250"])
        // } else {
        //     setThisLaminationSizes(["30", "80"])
        // }
        // console.log(e);
        setLamination({
            ...lamination,
            material: e,
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
                type: "Ламінування",
                material: lamination.material,
                materialId: lamination.materialId,
                thickness: lamination.size,
                typeUse: "А3"
            },
            size: size,
        }
        setLoad(true)
        setError(null)
        // console.log(lamination);
        axios.post(`/materials/NotAll`, data)
            .then(response => {
                // console.log(response.data);
                setLoad(false)
                // const filtered = response.data.rows?.filter(u => u.thickness === "250");
              if(isVishichka){
                const filteredData = response.data.rows?.filter(u => u.thickness < 249);
                setThisLaminationSizes(filteredData)
                if(response.data && response.data.rows && response.data.rows[0]){
                  setLamination({
                    ...lamination,
                    // material: response.data.rows[0].name,
                    materialId: filteredData[0].id,
                    size: `${filteredData[0].thickness}`
                  })
                } else {
                  setThisLaminationSizes([])
                  setLamination({
                    ...lamination,
                    materialId: 0,
                  })
                }
              } else {
                setThisLaminationSizes(response.data.rows)
                if(response.data && response.data.rows && response.data.rows[0]){
                  setLamination({
                    ...lamination,
                    // material: response.data.rows[0].name,
                    materialId: response.data.rows[0].id,
                    size: `${response.data.rows[0].thickness}`
                  })
                } else {
                  setThisLaminationSizes([])
                  setLamination({
                    ...lamination,
                    materialId: 0,
                  })
                }
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
    }, [lamination.material, lamination.type, size]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (thicknessRef.current && !thicknessRef.current.contains(event.target)) {
                setOpenThickness(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectItem = (item) => {
        setLamination({
            type: lamination.type,
            material: lamination.material,
            materialId: item.id,
            size: `${item.thickness}`
        });
        setOpenThickness(false);
    };

    const thicknessTitle = lamination.size ? `${lamination.size} мкм` : "Виберіть товщину";

  return (
    <div className="d-flex allArtemElem">
      <div className="sc-pp-wrap">
        {/* NEW SWITCH */}
        <label className="switch scale04ForButtonToggle" >
          <input
            type="checkbox"
            checked={lamination.type !== "Не потрібно"}
            onChange={handleToggle}
          />
          <span className="switch-on"><span>ON</span></span>
          <span className="slider" />
          <span className="switch-off"><span>OFF</span></span>
        </label>

        <div className="PostpressNames">
          <span style={{  }}>Ламінація:</span>

          {lamination.type !== "Не потрібно" ? (
            <div className="sc-pp-wrap">
              <div className="sc-pp-wrap">
                {buttonsArr.map((item, index) => (
                  <button
                    className={item === lamination.material ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}
                    key={index}
                    onClick={() => handleClick(item)}
                  >
                    <div>
                      {labelMap?.[item] || item}
                    </div>
                  </button>
                ))}

                <div
                  className="custom-select-container selectArtem selectArtemBefore sc-has-value"
                  ref={thicknessRef}
                  style={{ marginLeft: "1vw" }}
                >
                  <div
                    className="custom-select-header"
                    onClick={() => setOpenThickness(!openThickness)}
                  >
                    {thicknessTitle}
                  </div>
                  {openThickness && (
                    <div className="custom-select-dropdown">
                      {thisLaminationSizes.map((item) => (
                        <div
                          key={item.thickness}
                          className={`custom-option ${String(item.thickness) === String(lamination.size) ? "active" : ""}`}
                          onClick={() => handleSelectItem(item)}
                        >
                          <span className="name">{item.thickness} мкм</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );

};

export default NewNoModalLamination;
