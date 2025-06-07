import React, {useEffect, useState} from "react";

const NewNoModalProkleka = ({prokleka, setProkleka, prices, buttonsArr, selectArr}) => {

    let handleSelectChange = (e) => {
        // Перетворюємо значення на число, якщо це можливо
        const value = e.target.value;
        if (value !== "" && !isNaN(value)) {
            setProkleka(Number(value));
        } else {
            setProkleka(value);
        }
    }

    let handleToggle = (e) => {
        if (prokleka === "Не потрібно") {
            setProkleka(1)
        } else {
            setProkleka("Не потрібно")
        }
    }

    return (
        <div className="d-flex allArtemElem">
            <div style={{display: 'flex', alignItems: 'center',}}>
                <div
                    className={`toggleContainer scale04ForButtonToggle ${prokleka === "Не потрібно" ? 'disabledCont' : 'enabledCont'}`}
                    onClick={handleToggle}
                >
                    <div className={`toggle-button ${prokleka === "Не потрібно" ? 'disabled' : 'enabledd'}`}>
                    </div>
                </div>
                <div className="d-flex flex-column">
                    <span style={{
                        marginRight: '0.633vw',
                    }}>{"Проклейка:"}</span>
                    {prokleka !== "Не потрібно" ? (
                        <div className="ArtemNewSelectContainer"
                             style={{display: 'flex', justifyContent: 'center', alignItems: 'center',}}>
                            <select
                                value={prokleka}
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

export default NewNoModalProkleka;
