/* eslint-disable react/prop-types */
import React from "react";

const NewNoModalLyuversy = ({ lyuversy, setLyuversy, selectArr = [] }) => {
  const firstOption = selectArr.find(Boolean) || "1";

  const handleToggle = () =>
    lyuversy === "Не потрібно"
      ? setLyuversy(firstOption)
      : setLyuversy("Не потрібно");

  return (
    <div className="d-flex allArtemElem">
      <div style={{ display:"flex", alignItems:"center" }}>
        <div
          className={`toggleContainer scale04ForButtonToggle ${
            lyuversy === "Не потрібно" ? "disabledCont" : "enabledCont"
          }`}
          role="button" tabIndex={0}
          onClick={handleToggle}
        >
          <div className={`toggle-button ${lyuversy === "Не потрібно" ? "disabled" : "enabledd"}`}/>
        </div>

        <div className="d-flex flex-column">
          <span style={{ marginRight:"0.633vw" }}>Люверси:</span>

          {lyuversy !== "Не потрібно" && (
            <div className="ArtemNewSelectContainer" style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
              <select
                value={lyuversy}
                onChange={e => setLyuversy(e.target.value)}
                className="selectArtem"
              >
                {selectArr.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewNoModalLyuversy;
