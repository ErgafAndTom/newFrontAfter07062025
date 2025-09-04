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
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* NEW SWITCH */}
        <label className="switch scale04ForButtonToggle" style={{ marginRight: '0.633vw' }}>
          <input
            type="checkbox"
            checked={big !== "Не потрібно"}
            onChange={handleToggle}
          />
          <span className="slider" />
        </label>

        <div className="d-flex flex-column">
          <span style={{ marginRight: '0.633vw' }}>Згинання:</span>

          {big !== "Не потрібно" ? (
            <div className="ArtemNewSelectContainer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <select
                value={big}
                onChange={(event) => handleSelectChange(event)}
                className="selectArtem"
              >
                {(selectArr || []).map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );

};

export default NewNoModalBig;
