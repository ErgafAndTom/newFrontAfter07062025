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
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="PostpressNames">
          <span style={{  whiteSpace: "nowrap" }}>Cвердління отворів:</span>

          {holes !== "Не потрібно" && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                className="custom-select-container selectArtem selectArtemBefore"
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

              <div style={{ display: 'flex', alignItems: 'center', marginLeft: '1vw' }}>
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
                      height: '3.2vh',
                    }}
                  >
                    <img
                      style={{ height: '100%', opacity: holes === index + 1 ? '100%' : '90%' }}
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