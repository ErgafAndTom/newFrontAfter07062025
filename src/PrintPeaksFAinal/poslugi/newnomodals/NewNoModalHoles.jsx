import React, {useState} from "react";
import ReactDOM from "react-dom";
import { usePortalDropdown } from "./usePortalDropdown";
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
    const { open: openSize, setOpen: setOpenSize, style: dropStyle, toggle, triggerRef: sizeRef, portalRef } = usePortalDropdown();

    let handleSelectChange = (val) => {
        setHolesR(val);
        setOpenSize(false);
    }

    let handleClick = (e) => {
        setHoles(e)
        setHolesR(holesR || "5 мм")
    }

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
                  onClick={toggle}
                >
                  {sizeTitle}
                </div>
                {openSize && ReactDOM.createPortal(
                  <div className="custom-select-dropdown" ref={portalRef} style={dropStyle}>
                    {(selectArr || []).filter(item => item !== "").map((item) => (
                      <div
                        key={item}
                        className={`custom-option ${String(item) === String(holesR) ? "active" : ""}`}
                        onClick={() => handleSelectChange(item)}
                      >
                        <span className="name">{item}</span>
                      </div>
                    ))}
                  </div>,
                  document.body
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