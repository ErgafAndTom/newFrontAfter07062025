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
            <div style={{display: 'flex', alignItems: 'center',}}>
                <div
                    className={`toggleContainer scale04ForButtonToggle ${cute === "Не потрібно" ? 'disabledCont' : 'enabledCont'}`}
                    onClick={handleToggle}
                >
                    <div className={`toggle-button ${cute === "Не потрібно" ? 'disabled' : 'enabledd'}`}>
                    </div>
                </div>

                <div className="d-flex flex-column">
                    <span style={{
                        width: "10vw",
                        marginRight: '0.633vw',

                    }}>{"Скруглення кутів:"}</span>
                    {cute !== "Не потрібно" ? (
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center',}}>
                            <div className="ArtemNewSelectContainer">
                                <select
                                    value={cuteLocal.radius}
                                    onChange={(event) => handleSelectChange(event)}
                                    className="selectArtem"
                                >
                                    <option value={""}>{""}</option>
                                    {selectArr.map((item, iter2) => (
                                        <option key={item} value={item}>{item} мм</option>))}
                                </select>
                            </div>
                            <button
                                className="buttonsArtem"
                                onClick={() => handleClickLeftTop()}
                                style={{
                                    backgroundColor: cuteLocal.leftTop === true ? 'orange' : '#FBFAF6',
                                    border: cuteLocal.leftTop === true ? '0.13vw solid transparent' : '0.13vw solid transparent',
                                    borderRadius: '0.627vw',
                                    padding: '1.273vh 1.273vw',
                                    margin: '0.323vw',
                                    width: '3.173vw',
                                    height: '3.173vw',
                                    marginLeft: '2.5vw',
                                }}
                            >
                                <img className="" style={{
                                    height: "100%",
                                    opacity: cuteLocal.leftTop === true ? '100%' : '90%',
                                }} alt="" src={borderRadiusIcon0}/>
                            </button>
                            <button
                                className="buttonsArtem"
                                onClick={() => handleClickRightTop()}
                                style={{
                                    backgroundColor: cuteLocal.rightTop === true ? 'orange' : '#FBFAF6',
                                    border: cuteLocal.rightTop === true ? '0.13vw solid transparent' : '0.13vw solid transparent',
                                    borderRadius: '0.627vw',
                                    padding: '1.273vh 1.273vw',
                                    margin: '0.323vw',
                                    width: '3.173vw',
                                    height: '3.173vw',
                                }}
                            >
                                <img className="" style={{
                                    height: "100%",
                                    opacity: cuteLocal.rightTop === true ? '100%' : '70%',
                                }} alt="" src={borderRadiusIcon9}/>
                            </button>
                            <button
                                className="buttonsArtem"
                                onClick={() => handleClickRightBottom()}
                                style={{
                                    backgroundColor: cuteLocal.rightBottom === true ? 'orange' : '#FBFAF6',
                                    border: cuteLocal.rightBottom === true ? '0.13vw solid transparent' : '0.13vw solid transparent',
                                    borderRadius: '0.627vw',
                                    padding: '1.273vh 1.273vw',
                                    margin: '0.323vw',
                                    width: '3.173vw',
                                    height: '3.173vw',
                                }}
                            >
                                <img className="" style={{
                                    height: "100%",
                                    opacity: cuteLocal.rightBottom === true ? '100%' : '70%',
                                }} alt="" src={borderRadiusIcon1}/>
                            </button>
                            <button
                                className="buttonsArtem"
                                onClick={() => handleClickLeftBottom()}
                                style={{
                                    backgroundColor: cuteLocal.leftBottom === true ? 'orange' : '#FBFAF6',
                                    border: cuteLocal.leftBottom === true ? '0.13vw solid transparent' : '0.13vw solid transparent',
                                    borderRadius: '0.627vw',
                                    padding: '1.273vh 1.273vw',
                                    margin: '0.323vw',
                                    width: '3.173vw',
                                    height: '3.173vw',
                                }}
                            >
                                <img className="" style={{
                                    height: "100%",
                                    opacity: cuteLocal.leftBottom === true ? '100%' : '70%',
                                }} alt="" src={borderRadiusIcon2}/>
                            </button>
                        </div>
                    ) : (
                        <div>

                        </div>
                    )}
                </div>

                {cute !== "Не потрібно" ? (
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center',}}>

                    </div>
                ) : (
                    <div>

                    </div>
                )}
            </div>
        </div>
    )
};

export default NewNoModalCute;