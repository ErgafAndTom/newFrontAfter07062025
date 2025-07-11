import React from "react";

const NewNoModalProkleyka = ({prokleyka, setProkleyka, selectArr}) => {

  const handleSelectChange = (e) => {
    setProkleyka(e.target.value);
  }

  const handleToggle = () => {
    if (prokleyka === "Не потрібно") {
      setProkleyka("1");
    } else {
      setProkleyka("Не потрібно");
    }
  }

  return (
    <div className="d-flex allArtemElem">
      <div style={{display: 'flex', alignItems: 'center'}}>
        <div
          className={`toggleContainer scale04ForButtonToggle ${prokleyka === "Не потрібно" ? 'disabledCont' : 'enabledCont'}`}
          onClick={handleToggle}
        >
          <div className={`toggle-button ${prokleyka === "Не потрібно" ? 'disabled' : 'enabledd'}`}></div>
        </div>
        <div className="d-flex flex-column">
          <span style={{marginRight: '0.633vw'}}>{"Проклейка:"}</span>
          {prokleyka !== "Не потрібно" && (
            <div className="ArtemNewSelectContainer" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <select
                value={prokleyka}
                onChange={handleSelectChange}
                className="selectArtem"

              >
                {(selectArr || []).map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
};

export default NewNoModalProkleyka;
