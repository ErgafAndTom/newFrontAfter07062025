import React, {useEffect, useState} from "react";
import axios from '../../../../api/axiosInstance';
import {Navigate, useNavigate} from "react-router-dom";

const LaminationNote = ({materialAndDruk, setMaterialAndDruk, prices, buttonsArr, selectArr, size}) => {
    const [thisLaminationSizes, setThisLaminationSizes] = useState([]);
    const [error, setError] = useState(null);
    const [load, setLoad] = useState(true);
    const navigate = useNavigate();

    let handleSelectChange = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const selectedId = selectedOption.getAttribute('data-id') || 'default';
        setMaterialAndDruk({
            ...materialAndDruk,
            laminationmaterialId: selectedId,
            laminationTypeUse: e.target.value
        })
    }

    let handleToggle = (e) => {
        if (materialAndDruk.laminationType === "Не потрібно") {
            setMaterialAndDruk({
                ...materialAndDruk,
                laminationType: "З глянцевим ламінуванням",
                laminationmaterial: "З глянцевим ламінуванням",
                laminationmaterialId: "",
                // size: "",
                laminationTypeUse: "А3",
            })
        } else {
            setMaterialAndDruk({
                laminationType: "Не потрібно",
                laminationmaterial: "",
                laminationmaterialId: "",
                // size: "",
                laminationTypeUse: "А3",
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
        setMaterialAndDruk({
            ...materialAndDruk,
            laminationmaterial: e,
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
            material: {
                ...materialAndDruk,
                type: "Ламінування",
                material: materialAndDruk.laminationType,
                thickness: materialAndDruk.laminationTypeUse,
                typeUse: "А3"
            },
            size: size,
        }
        setLoad(true)
        setError(null)
        // console.log(materialAndDruk);
        axios.post(`/materials/NotAll`, data)
            .then(response => {
                // console.log(response.data);
                setLoad(false)
                setThisLaminationSizes(response.data.rows)
                if(response.data && response.data.rows && response.data.rows[0]){
                    setMaterialAndDruk({
                        ...materialAndDruk,
                        // material: response.data.rows[0].name,
                        laminationmaterialId: response.data.rows[0].id,
                        // size: `${response.data.rows[0].thickness}`
                    })
                } else {
                    setThisLaminationSizes([])
                    setMaterialAndDruk({
                        ...materialAndDruk,
                        laminationmaterialId: 0,
                    })
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
    }, [materialAndDruk.laminationType, size]);

    return (<div className="d-flex allArtemElem">
        <div style={{display: 'flex', alignItems: 'center',}}>
            <div className={`toggleContainer ${materialAndDruk.laminationType === "Не потрібно" ? 'disabledCont' : 'enabledCont'}`}
                 onClick={handleToggle}
                 style={{transform: "scale(0.6)"}}>
                <div className={`toggle-button ${materialAndDruk.laminationType === "Не потрібно" ? 'disabled' : 'enabledd'}`}>
                </div>
            </div>
            <div className="d-flex flex-column">
            <span style={{
                fontSize: '1.273vw', marginRight: '0',

 fontWeight: "bold"
            }}>{"Ламінація:"}</span>
                {materialAndDruk.laminationType !== "Не потрібно" ? (
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center',}}>
                        <div style={{
                            display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: "2vw"
                        }}>
                            {buttonsArr.map((item, index) => (<button
                                className={item === materialAndDruk.laminationmaterial ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}
                                key={index}
                                onClick={() => handleClick(item)}
                                // style={{
                                //     backgroundColor: item === lamination.material ? 'orange' : 'transparent',
                                //     border: item === lamination.material ? '0.13vw solid transparent' : '0.13vw solid transparent',
                                // }}
                            >
                                <div className="" style={{
                                    height: "100%",
                                    opacity: item === materialAndDruk.laminationmaterial ? '100%' : '90%',
                                    whiteSpace: "nowrap",
                                }}>
                                    {item}
                                </div>
                            </button>))}
                            <div className="ArtemNewSelectContainer">
                                <select
                                    value={materialAndDruk.laminationTypeUse}
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

export default LaminationNote;
