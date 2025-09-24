import React, {useEffect, useState} from "react";
import borderRadiusIcon0 from "../../public/borderradius.svg";
import borderRadiusIcon1 from "../../public/borderradius1.svg";
import borderRadiusIcon2 from "../../public/borderradius2.svg";
import borderRadiusIcon9 from "../../public/borderradius9.svg";

const iconArray = [
    borderRadiusIcon0,
    borderRadiusIcon9,
    borderRadiusIcon1,
    borderRadiusIcon2,
];

const NewNoModalCute = ({cute, setCute, cuteLocal, setCuteLocal, prices, buttonsArr, selectArr}) => {

    let handleSelectChange = (e) => {
        setCuteLocal({
            leftTop: true,
            rightTop: true,
            rightBottom: true,
            leftBottom: true,
            radius: e,
        })
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

  return (
    <div className="d-flex allArtemElem">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* NEW SWITCH */}
        <label className="switch scale04ForButtonToggle"  aria-label="Скруглення кутів">
          <input
            type="checkbox"
            checked={cute !== "Не потрібно"}
            onChange={handleToggle}
          />
          <span className="slider" />
        </label>

        <div className="d-flex flex-column align-items-center"  >
          <span style={{whiteSpace: "nowrap", marginLeft:"0.7vw"}}>Скруглення кутів:</span>
          {cute !== "Не потрібно" ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="ArtemNewSelectContainer">
                <select
                  value={cuteLocal.radius}
                  onChange={handleSelectChange}
                  className="selectArtem"
                >
                  <option value="">{""}</option>
                  {(selectArr || []).map((item) => (
                    <option key={item} value={item}>{item} мм</option>
                  ))}
                </select>
              </div>

              <button
                className="buttonsArtem"
                onClick={handleClickLeftTop}
                style={{
                  backgroundColor: cuteLocal.leftTop ? 'orange' : '#FBFAF6',
                  border: '0.13vw solid transparent',
                  borderRadius: '0.627vw',
                  padding: '1.273vh 1.273vw',
                  margin: '0.323vw',
                  width: '3.173vw',
                  height: '3.173vw',
                  marginLeft: '2.5vw',
                }}
              >
                <img style={{ height: '100%', opacity: cuteLocal.leftTop ? '100%' : '90%' }} alt="" src={borderRadiusIcon0} />
              </button>

              <button
                className="buttonsArtem"
                onClick={handleClickRightTop}
                style={{
                  backgroundColor: cuteLocal.rightTop ? 'orange' : '#FBFAF6',
                  border: '0.13vw solid transparent',
                  borderRadius: '0.627vw',
                  padding: '1.273vh 1.273vw',
                  margin: '0.323vw',
                  width: '3.173vw',
                  height: '3.173vw',
                }}
              >
                <img style={{ height: '100%', opacity: cuteLocal.rightTop ? '100%' : '70%' }} alt="" src={borderRadiusIcon9} />
              </button>

              <button
                className="buttonsArtem"
                onClick={handleClickRightBottom}
                style={{
                  backgroundColor: cuteLocal.rightBottom ? 'orange' : '#FBFAF6',
                  border: '0.13vw solid transparent',
                  borderRadius: '0.627vw',
                  padding: '1.273vh 1.273vw',
                  margin: '0.323vw',
                  width: '3.173vw',
                  height: '3.173vw',
                }}
              >
                <img style={{ height: '100%', opacity: cuteLocal.rightBottom ? '100%' : '70%' }} alt="" src={borderRadiusIcon1} />
              </button>

              <button
                className="buttonsArtem"
                onClick={handleClickLeftBottom}
                style={{
                  backgroundColor: cuteLocal.leftBottom ? 'orange' : '#FBFAF6',
                  border: '0.13vw solid transparent',
                  borderRadius: '0.627vw',
                  padding: '1.273vh 1.273vw',
                  margin: '0.323vw',
                  width: '3.173vw',
                  height: '3.173vw',
                }}
              >
                <img style={{ height: '100%', opacity: cuteLocal.leftBottom ? '100%' : '70%' }} alt="" src={borderRadiusIcon2} />
              </button>
            </div>
          ) : <div />}
        </div>
      </div>
    </div>
  );

};

export default NewNoModalCute;
