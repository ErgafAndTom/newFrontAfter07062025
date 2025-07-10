import React, {useEffect, useState} from "react";

const NewNoModalBig = ({big, setBig, prices, buttonsArr, selectArr}) => {

    let handleSelectChange = (e) => {
        setBig(e.target.value)
    }

    let handleToggle = (e) => {
        if (big === "Не потрібно") {
            setBig("1")
        } else {
            setBig("Не потрібно")
        }
    }

    return (
        <div className="d-flex allArtemElem">
            <div style={{display: 'flex', alignItems: 'center',}}>
                <div
                    className={`toggleContainer scale04ForButtonToggle ${big === "Не потрібно" ? 'disabledCont' : 'enabledCont'}`}
                    onClick={handleToggle}
                >
                    <div className={`toggle-button ${big === "Не потрібно" ? 'disabled' : 'enabledd'}`}>
                    </div>
                </div>
                <div className="d-flex flex-column">
                    <span style={{

                        marginRight: '0.633vw',

                    }}>{"Згинання:"}</span>
                    {big !== "Не потрібно" ? (
                        <div className="ArtemNewSelectContainer"
                             style={{display: 'flex', justifyContent: 'center', alignItems: 'center',}}>
                            <select
                                value={big}
                                onChange={(event) => handleSelectChange(event)}
                                className="selectArtem"
                            >
                              {(selectArr || []).map((item, iter) => (
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

export default NewNoModalBig;
