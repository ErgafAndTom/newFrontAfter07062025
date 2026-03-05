import React, {useState} from "react";
import ReactDOM from "react-dom";
import { usePortalDropdown } from "./usePortalDropdown";

const NewNoModalBig = ({big, setBig, prices, buttonsArr, selectArr}) => {
    const { open: openBig, setOpen: setOpenBig, style: dropStyle, toggle, triggerRef: bigRef, portalRef } = usePortalDropdown();

    let handleSelectChange = (val) => {
        setBig(val);
        setOpenBig(false);
    }

    const bigTitle = big && big !== "Не потрібно" ? `${big} згин.` : "Кількість";

  return (
    <div className="d-flex allArtemElem">
      <div className="sc-pp-wrap">
        <div className="PostpressNames">
          <span style={{}}>Згинання:</span>

          {big !== "Не потрібно" ? (
            <div className="sc-pp-wrap">
              <div
                className="custom-select-container selectArtem selectArtemBefore sc-has-value"
                ref={bigRef}
              >
                <div
                  className="custom-select-header"
                  onClick={toggle}
                >
                  {bigTitle}
                </div>
                {openBig && ReactDOM.createPortal(
                  <div className="custom-select-dropdown" ref={portalRef} style={dropStyle}>
                    {(selectArr || []).filter(item => item !== "").map((item) => (
                      <div
                        key={item}
                        className={`custom-option ${String(item) === String(big) ? "active" : ""}`}
                        onClick={() => handleSelectChange(item)}
                      >
                        <span className="name">{item} згин.</span>
                      </div>
                    ))}
                  </div>,
                  document.body
                )}
              </div>
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