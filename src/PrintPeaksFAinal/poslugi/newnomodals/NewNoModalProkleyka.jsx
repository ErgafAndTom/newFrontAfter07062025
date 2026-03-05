import React from "react";
import ReactDOM from "react-dom";
import { usePortalDropdown } from "./usePortalDropdown";

const NewNoModalProkleyka = ({prokleyka, setProkleyka, selectArr}) => {
    const { open, setOpen, style: dropStyle, toggle, triggerRef: ref, portalRef } = usePortalDropdown();

    const handleSelectChange = (val) => {
        setProkleyka(val);
        setOpen(false);
    }

    const title = prokleyka && prokleyka !== "Не потрібно" ? `${prokleyka} стор.` : "Кількість";

  return (
    <div className="d-flex allArtemElem">
      <div className="sc-pp-wrap">
        <div className="PostpressNames" >
          <span >Проклейка:</span>

          {prokleyka !== "Не потрібно" && (
            <div className="sc-pp-wrap">
              <div
                className="custom-select-container selectArtem selectArtemBefore sc-has-value"
                ref={ref}
              >
                <div
                  className="custom-select-header"
                  onClick={toggle}
                >
                  {title}
                </div>
                {open && ReactDOM.createPortal(
                  <div className="custom-select-dropdown" ref={portalRef} style={dropStyle}>
                    {(selectArr || []).filter(item => item !== "").map((item) => (
                      <div
                        key={item}
                        className={`custom-option ${String(item) === String(prokleyka) ? "active" : ""}`}
                        onClick={() => handleSelectChange(item)}
                      >
                        <span className="name">{item} стор.</span>
                      </div>
                    ))}
                  </div>,
                  document.body
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

};

export default NewNoModalProkleyka;