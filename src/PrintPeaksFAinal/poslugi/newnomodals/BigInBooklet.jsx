import React, {useEffect, useState} from "react";


const BigInBooklet = ({selectArr, materialAndDrukFront, setMaterialAndDrukFront}) => {

    let handleSelectChange = (e) => {
        setMaterialAndDrukFront({
            ...materialAndDrukFront,
            big: e.target.value,
        })
    }

    let handleToggle = (e) => {
        if (materialAndDrukFront.big === "Не потрібно") {
            setMaterialAndDrukFront({
                ...materialAndDrukFront,
                big: "2",
            })
        } else {
            setMaterialAndDrukFront({
                ...materialAndDrukFront,
                big: "Не потрібно",
            })
        }
    }

    return (
        <div className="d-flex allArtemElem">
            <div style={{display: 'flex', alignItems: 'center', marginLeft: "-1vw"}}>

                <div
                    className={`toggleContainer scale04ForButtonToggle ${materialAndDrukFront.big === "Не потрібно" ? 'disabledCont' : 'enabledCont'}`}
                    onClick={handleToggle}
                >
                    <div
                        className={`toggle-button ${materialAndDrukFront.big === "Не потрібно" ? 'disabled' : 'enabledd'}`}>
                    </div>
                </div>
                <span>{"Згинання:"}</span>
                <div className="d-flex flex-column">

                    {materialAndDrukFront.big !== "Не потрібно" ? (
                        <div className="ArtemNewSelectContainer"
                             style={{display: 'flex', justifyContent: 'center', alignItems: 'center',}}>
                            <select
                                value={materialAndDrukFront.big}
                                onChange={(event) => handleSelectChange(event)}
                                className="selectArtem"
                            >
                                {selectArr.map((item, iter2) => (
                                    <option key={item} value={item}>{item} </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    )
};

export default BigInBooklet;
