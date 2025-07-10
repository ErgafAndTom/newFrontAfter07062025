import React from "react";

const NewNoModalDesign = ({
    design,
    setDesign,
    prices,
    type,
}) => {
    return (
        <div className="d-flex allArtemElem">
            <div style={{display: 'flex', alignItems: 'center'}}>
                <div
                    className={`toggleContainer scale04ForButtonToggle ${design === "Не потрібно" ? 'disabledCont' : 'enabledCont'}`}
                    onClick={() => {
                        if (design === "Не потрібно") {
                            // Встановлюємо початкове значення при активації
                            setDesign("0");
                        } else {
                            // Деактивуємо дизайн
                            setDesign("Не потрібно");
                        }
                    }}
                >
                    <div className={`toggle-button ${design === "Не потрібно" ? 'disabled' : 'enabledd'}`}>
                    </div>
                </div>
                <div className="d-flex flex-row justify-content-between align-items-center">
                    <span style={{marginRight: '0.633vw'}}>Дизайн:</span>
                    {design !== "Не потрібно" ? (
                        <div className="d-flex" style={{marginTop: '0.5vh'}}>
                            <input
                                className="inputsArtem"
                                type="number"
                                value={design === "Не потрібно" ? "0" : design}
                                min={0}
                                onChange={(event) => setDesign(event.target.value !== "" ? event.target.value : "0")}
                                placeholder="Введіть ціну"
                                style={{width: '5vw'}}
                            />
                            <div className="inputsArtemx" style={{border:"transparent"}}> грн</div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default NewNoModalDesign;
