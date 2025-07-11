import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

const Porizka = ({porizka, setPorizka, prices, buttonsArr, selectArr}) => {
    const [thisLaminationSizes, setThisLaminationSizes] = useState([]);
    const navigate = useNavigate();

    let handleSelectChange = (e) => {
        setPorizka({
            ...porizka,
            size: e.target.value
        })
    }

    let handleToggle = (e) => {
        if (porizka.type === "Не потрібно") {
            setPorizka({
                type: "Потрібно",
                material: "",
                materialId: "",
                size: ""
            })
        } else {
            setPorizka({
                type: "Не потрібно",
                material: "",
                materialId: "",
                size: ""
            })
        }
    }

    let handleClick = (e) => {
        // if(e !== "З ламінуванням Soft Touch"){
        //     setThisLaminationSizes(["30", "80", "100", "125", "250"])
        // } else {
        //     setThisLaminationSizes(["30", "80"])
        // }
        setPorizka({
            ...porizka,
            type: e,
            material: e,
            materialId: e,
        })
    }

    return (<div className="d-flex allArtemElem">
        <div style={{display: 'flex', alignItems: 'center',}}>
            <div
                className={`toggleContainer scale04ForButtonToggle ${porizka.type === "Не потрібно" ? 'disabledCont' : 'enabledCont'}`}
                onClick={handleToggle}>
                <div className={`toggle-button ${porizka.type === "Не потрібно" ? 'disabled' : 'enabledd'}`}>
                </div>
            </div>
            <div className="d-flex flex-row">
            <span className={"d-flex flex-row" } style={{
                 marginRight: '0.633vw', width: '20vw',
            }}>{"Порiзка (+10% к вартості):"}</span>
                {/*{photo.type !== "Не потрібно" ? (*/}
                {/*    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center',}}>*/}
                {/*        <div style={{*/}
                {/*            display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: "2vw"*/}
                {/*        }}>*/}
                {/*            {buttonsArr.map((item, index) => (<button*/}
                {/*                className={item === photo.material ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}*/}
                {/*                key={index}*/}
                {/*                onClick={() => handleClick(item)}*/}
                {/*                // style={{*/}
                {/*                //     backgroundColor: item === lamination.material ? 'orange' : 'transparent',*/}
                {/*                //     border: item === lamination.material ? '0.13vw solid transparent' : '0.13vw solid transparent',*/}
                {/*                // }}*/}
                {/*            >*/}
                {/*                <div className="" style={{*/}
                {/*                    height: "100%",*/}
                {/*                    opacity: item === photo.material ? '100%' : '90%',*/}
                {/*                    whiteSpace: "nowrap",*/}
                {/*                }}>*/}
                {/*                    {item}*/}
                {/*                </div>*/}
                {/*            </button>))}*/}
                {/*            <div className="ArtemNewSelectContainer">*/}
                {/*                <select*/}
                {/*                    value={photo.size}*/}
                {/*                    onChange={(event) => handleSelectChange(event)}*/}
                {/*                    className="selectArtem"*/}
                {/*                >*/}
                {/*                    <option value={""}>{""}</option>*/}
                {/*                    {thisLaminationSizes.map((item, iter2) => (*/}
                {/*                        <option className="optionInSelectArtem" key={item.thickness}*/}
                {/*                                value={item.thickness}>{item.thickness} мкм</option>))}*/}
                {/*                </select>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    </div>) : (<div>*/}

                {/*</div>)}*/}
            </div>
        </div>
    </div>)
};

export default Porizka;
