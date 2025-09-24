import React from "react";
import holeIcon0 from "./iconbuttons/hole1.svg";
import holeIcon1 from "./iconbuttons/hole2.svg";
import holeIcon2 from "./iconbuttons/hole3.svg";
import holeIcon3 from "./iconbuttons/hole4.svg";
import holeIcon4 from "./iconbuttons/hole5.svg";
import holeIcon5 from "./iconbuttons/hole6.svg";
import holeIcon6 from "./iconbuttons/hole7.svg";
import holeIcon7 from "./iconbuttons/hole8.svg";

const iconArray = [
    holeIcon0,
    holeIcon1,
    holeIcon2,
    holeIcon3,
    // holeIcon4,
    // holeIcon5,
    // holeIcon6,
    // holeIcon7,
];

const NewNoModalHoles = ({holes, setHoles, holesR, setHolesR, prices, buttonsArr, selectArr}) => {

    let handleSelectChange = (e) => {
        setHolesR(e.target.value)
    }

    let handleToggle = (e) => {
        if (holes === "Не потрібно") {
            setHoles(1)
            setHolesR("5 мм")
        } else {
            setHoles("Не потрібно")
            setHolesR("Не потрібно")
        }
    }

    let handleClick = (e) => {
        setHoles(e)
        setHolesR("5 мм")
    }

  return (
    <div className="d-flex allArtemElem">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* NEW SWITCH */}
        <label
          className="switch scale04ForButtonToggle"
          style={{ marginRight: '0.7vw', display: 'inline-flex', alignItems: 'center' }}
          aria-label="Свердління отворів"
        >
          <input
            type="checkbox"
            checked={holes !== "Не потрібно"}
            onChange={handleToggle}
          />
          <span className="slider" />
        </label>

        <div className="d-flex flex-column">
          <span style={{  whiteSpace: "nowrap" }}>Cвердління отворів:</span>

          {holes !== "Не потрібно" && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="ArtemNewSelectContainer">
                <select
                  className="selectArtem"
                  onChange={handleSelectChange}
                  value={holesR}
                >
                  {(selectArr || []).map((item) => (
                    <option className="optionInSelectArtem" key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginLeft: '2vw' }}>
                {iconArray.map((item, index) => (
                  <div
                    key={index}
                    className={holes === index + 1 ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}
                    onClick={() => handleClick(index + 1)}
                    style={{
                      padding: 0,
                      margin: '0.323vw',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      style={{ height: '3.173vw', opacity: holes === index + 1 ? '100%' : '90%' }}
                      alt=""
                      src={iconArray[index]}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

};

export default NewNoModalHoles;
