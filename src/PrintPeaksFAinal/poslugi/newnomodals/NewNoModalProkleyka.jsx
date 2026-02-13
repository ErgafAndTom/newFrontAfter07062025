import React, {useState, useEffect, useRef} from "react";

const NewNoModalProkleyka = ({prokleyka, setProkleyka, selectArr}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const handleSelectChange = (val) => {
        setProkleyka(val);
        setOpen(false);
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const title = prokleyka && prokleyka !== "Не потрібно" ? `${prokleyka} стор.` : "Кількість";

  return (
    <div className="d-flex allArtemElem">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="PostpressNames" >
          <span >Проклейка:</span>

          {prokleyka !== "Не потрібно" && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div
                className="custom-select-container selectArtem selectArtemBefore"
                ref={ref}
              >
                <div
                  className="custom-select-header"
                  onClick={() => setOpen(!open)}
                >
                  {title}
                </div>
                {open && (
                  <div className="custom-select-dropdown">
                    {(selectArr || []).filter(item => item !== "").map((item) => (
                      <div
                        key={item}
                        className={`custom-option ${String(item) === String(prokleyka) ? "active" : ""}`}
                        onClick={() => handleSelectChange(item)}
                      >
                        <span className="name">{item} стор.</span>
                      </div>
                    ))}
                  </div>
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