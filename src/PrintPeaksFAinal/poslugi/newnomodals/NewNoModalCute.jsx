import React, {useEffect, useState, useRef} from "react";
import borderRadiusIcon0 from "../../public/borderradius.svg";
import borderRadiusIcon1 from "../../public/borderradius1.svg";
import borderRadiusIcon2 from "../../public/borderradius2.svg";
import borderRadiusIcon9 from "../../public/borderradius9.svg";
import "../Poslugy.css";

const iconArray = [
    borderRadiusIcon0,
    borderRadiusIcon9,
    borderRadiusIcon1,
    borderRadiusIcon2,
];

const NewNoModalCute = ({cute, setCute, cuteLocal, setCuteLocal, prices, buttonsArr, selectArr}) => {
    const [openRadius, setOpenRadius] = useState(false);
    const radiusRef = useRef(null);

    let handleSelectChange = (val) => {
        setCuteLocal({
            leftTop: true,
            rightTop: true,
            rightBottom: true,
            leftBottom: true,
            radius: val,
        });
        setOpenRadius(false);
    }

    let handleToggle = (e) => {
        if (cute === "Не потрібно") {
            setCute(4)
            setCuteLocal({
                leftTop: true,
                rightTop: true,
                rightBottom: true,
                leftBottom: true,
                radius: "6",
            })
        } else {
            setCute("Не потрібно")
            setCuteLocal({
                leftTop: false,
                rightTop: false,
                rightBottom: false,
                leftBottom: false,
                radius: cute.radius,
            })
        }
    }

    let handleClickLeftTop = (e) => {
        setCuteLocal({
            leftTop: !cuteLocal.leftTop,
            rightTop: cuteLocal.rightTop,
            rightBottom: cuteLocal.rightBottom,
            leftBottom: cuteLocal.leftBottom,
            radius: cute.radius,
        })
        if (cuteLocal.leftTop) {
            setCute(cute - 1)
        } else {
            setCute(cute + 1)
        }
    }
    let handleClickRightTop = (e) => {
        setCuteLocal({
            leftTop: cuteLocal.leftTop,
            rightTop: !cuteLocal.rightTop,
            rightBottom: cuteLocal.rightBottom,
            leftBottom: cuteLocal.leftBottom,
            radius: cute.radius,
        })
        if (cuteLocal.rightTop) {
            setCute(cute - 1)
        } else {
            setCute(cute + 1)
        }
    }
    let handleClickRightBottom = (e) => {
        setCuteLocal({
            leftTop: cuteLocal.leftTop,
            rightTop: cuteLocal.rightTop,
            rightBottom: !cuteLocal.rightBottom,
            leftBottom: cuteLocal.leftBottom,
            radius: cute.radius,
        })
        if (cuteLocal.rightBottom) {
            setCute(cute - 1)
        } else {
            setCute(cute + 1)
        }
    }
    let handleClickLeftBottom = (e) => {
        setCuteLocal({
            leftTop: cuteLocal.leftTop,
            rightTop: cuteLocal.rightTop,
            rightBottom: cuteLocal.rightBottom,
            leftBottom: !cuteLocal.leftBottom,
            radius: cute.radius,
        })
        if (cuteLocal.leftBottom) {
            setCute(cute - 1)
        } else {
            setCute(cute + 1)
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (radiusRef.current && !radiusRef.current.contains(event.target)) {
                setOpenRadius(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const radiusTitle = cuteLocal.radius ? `${cuteLocal.radius} мм` : "Радіус";

  return (
    <div className="d-flex allArtemElem">
      <div className="sc-pp-wrap">
        {/* NEW SWITCH */}
        <label className="switch scale04ForButtonToggle"  aria-label="Скруглення кутів">
          <input
            type="checkbox"
            checked={cute !== "Не потрібно"}
            onChange={handleToggle}
          />
          <span className="switch-on"><span>ON</span></span>
          <span className="slider" />
          <span className="switch-off"><span>OFF</span></span>
        </label>

        <div className="PostpressNames"  >
          <span style={{whiteSpace: "nowrap"}}>Скруглення кутів:</span>
          {cute !== "Не потрібно" ? (
            <div className="sc-pp-wrap">
              <div
                className="custom-select-container selectArtem selectArtemBefore sc-has-value"
                ref={radiusRef}
              >
                <div
                  className="custom-select-header"
                  onClick={() => setOpenRadius(!openRadius)}
                >
                  {radiusTitle}
                </div>
                {openRadius && (
                  <div className="custom-select-dropdown">
                    {(selectArr || []).map((item) => (
                      <div
                        key={item}
                        className={`custom-option ${String(item) === String(cuteLocal.radius) ? "active" : ""}`}
                        onClick={() => handleSelectChange(item)}
                      >
                        <span className="name">{item} мм</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className={`sc-pp-icon${cuteLocal.leftTop ? " sc-pp-icon-active" : ""}`}
                onClick={handleClickLeftTop}
              >
                <img alt="" src={borderRadiusIcon0} />
              </button>

              <button
                className={`sc-pp-icon${cuteLocal.rightTop ? " sc-pp-icon-active" : ""}`}
                onClick={handleClickRightTop}
              >
                <img alt="" src={borderRadiusIcon9} />
              </button>

              <button
                className={`sc-pp-icon${cuteLocal.rightBottom ? " sc-pp-icon-active" : ""}`}
                onClick={handleClickRightBottom}
              >
                <img alt="" src={borderRadiusIcon1} />
              </button>

              <button
                className={`sc-pp-icon${cuteLocal.leftBottom ? " sc-pp-icon-active" : ""}`}
                onClick={handleClickLeftBottom}
              >
                <img alt="" src={borderRadiusIcon2} />
              </button>
            </div>
          ) : <div />}
        </div>
      </div>
    </div>
  );

};

export default NewNoModalCute;
