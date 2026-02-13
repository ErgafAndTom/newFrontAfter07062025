import React, {useState, useEffect, useRef} from "react";

const NewNoModalBig = ({big, setBig, prices, buttonsArr, selectArr}) => {
    const [openBig, setOpenBig] = useState(false);
    const bigRef = useRef(null);

    let handleSelectChange = (val) => {
        setBig(val);
        setOpenBig(false);
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bigRef.current && !bigRef.current.contains(event.target)) {
                setOpenBig(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const bigTitle = big && big !== "Не потрібно" ? `${big} згин.` : "Кількість";

  return (
    <div className="d-flex allArtemElem">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="PostpressNames">
          <span style={{}}>Згинання:</span>

          {big !== "Не потрібно" ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div
                className="custom-select-container selectArtem selectArtemBefore"
                ref={bigRef}
              >
                <div
                  className="custom-select-header"
                  onClick={() => setOpenBig(!openBig)}
                >
                  {bigTitle}
                </div>
                {openBig && (
                  <div className="custom-select-dropdown">
                    {(selectArr || []).filter(item => item !== "").map((item) => (
                      <div
                        key={item}
                        className={`custom-option ${String(item) === String(big) ? "active" : ""}`}
                        onClick={() => handleSelectChange(item)}
                      >
                        <span className="name">{item} згин.</span>
                      </div>
                    ))}
                  </div>
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