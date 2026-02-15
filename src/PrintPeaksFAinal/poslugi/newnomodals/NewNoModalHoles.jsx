import React, {useState, useEffect, useRef} from "react";
import holeIcon0 from "./iconbuttons/hole1.svg";
import holeIcon1 from "./iconbuttons/hole2.svg";
import holeIcon2 from "./iconbuttons/hole3.svg";
import holeIcon3 from "./iconbuttons/hole4.svg";

const iconArray = [
    holeIcon0,
    holeIcon1,
    holeIcon2,
    holeIcon3,
];

const NewNoModalHoles = ({holes, setHoles, holesR, setHolesR, prices, buttonsArr, selectArr}) => {
    const [openSize, setOpenSize] = useState(false);
    const sizeRef = useRef(null);

    let handleSelectChange = (val) => {
        setHolesR(val);
        setOpenSize(false);
    }

    let handleClick = (e) => {
        setHoles(e)
        setHolesR(holesR || "5 мм")
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sizeRef.current && !sizeRef.current.contains(event.target)) {
                setOpenSize(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const sizeTitle = holesR ? holesR : "Розмір";

  return (
    <div className="d-flex allArtemElem">
      <div className="sc-pp-wrap">
        <div className="PostpressNames">
          <span style={{  whiteSpace: "nowrap" }}>Cвердління отворів:</span>

          {holes !== "Не потрібно" && (
            <div className="sc-pp-wrap">
              <div
                className="custom-select-container selectArtem selectArtemBefore sc-has-value"
                ref={sizeRef}
              >
                <div
                  className="custom-select-header"
                  onClick={() => setOpenSize(!openSize)}
                >
                  {sizeTitle}
                </div>
                {openSize && (
                  <div className="custom-select-dropdown">
                    {(selectArr || []).filter(item => item !== "").map((item) => (
                      <div
                        key={item}
                        className={`custom-option ${String(item) === String(holesR) ? "active" : ""}`}
                        onClick={() => handleSelectChange(item)}
                      >
                        <span className="name">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {iconArray.map((item, index) => (
                <button
                  key={index}
                  className={`sc-pp-icon${holes === index + 1 ? " sc-pp-icon-active" : ""}`}
                  onClick={() => handleClick(index + 1)}
                >
                  <img alt="" src={iconArray[index]} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

};

export default NewNoModalHoles;