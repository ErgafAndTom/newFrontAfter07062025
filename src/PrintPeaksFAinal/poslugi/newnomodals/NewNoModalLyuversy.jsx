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
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* NEW SWITCH */}
        <label className="switch scale04ForButtonToggle" >
          <input
            type="checkbox"
            checked={lyuversy !== "Не потрібно"}
            onChange={handleToggle}
          />
          <span className="slider" />
        </label>

        <div className="PostpressNames">
          <span >Люверси:</span>

          {lyuversy !== "Не потрібно" && (
            <div
              className="ArtemNewSelectContainer"
              style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            >
              <select
                value={lyuversy}
                onChange={e => setLyuversy(e.target.value)}
                className="selectArtem"
              >
                {selectArr.map(item => (
                  <option key={item} value={item}>
                    {item}
                  </option>
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
