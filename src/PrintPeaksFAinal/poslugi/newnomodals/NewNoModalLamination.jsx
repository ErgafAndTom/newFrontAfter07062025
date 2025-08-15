import React, {useEffect, useState} from "react";
import axios from '../../../api/axiosInstance';
import {Navigate, useNavigate} from "react-router-dom";
import "../../global.css"

const NewNoModalLamination = ({lamination, setLamination, prices, buttonsArr, selectArr, size, type, isVishichka}) => {
    const [thisLaminationSizes, setThisLaminationSizes] = useState([]);
    const [error, setError] = useState(null);
    const [load, setLoad] = useState(true);
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
        console.log(e);
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
        console.log(lamination);
        axios.post(`/materials/NotAll`, data)
            .then(response => {
                console.log(response.data);
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
                if(error.response.status === 403){
                    navigate('/login');
                }
                setThisLaminationSizes([])
                console.log(error.message);
            })
    }, [lamination.material, lamination.type, size]);

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
                                    width:"13vw"

                                }}>
                                    {item}
                                </div>
                            </button>))}
                            <div className="ArtemNewSelectContainer">
                                <select
                                    value={lamination.size}
                                    onChange={(event) => handleSelectChange(event)}
                                    className="selectArtem"
                                >
                                    <option value={""}>{""}</option>
                                    {thisLaminationSizes.map((item, iter2) => (
                                        <option className="optionInSelectArtem" key={item.thickness}
                                                value={item.thickness} data-id={item.id} tosend={item.thickness}>{item.thickness} мкм</option>))}
                                </select>
                            </div>
                        </div>
                    </div>) : (<div>

                </div>)}
            </div>
        </div>
    </div>)
};

export default NewNoModalLamination;
