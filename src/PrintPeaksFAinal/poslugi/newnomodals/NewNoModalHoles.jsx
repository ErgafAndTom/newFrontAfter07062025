import React from "react";
import holeIcon0 from "./iconbuttons/hole1.svg";
import holeIcon1 from "./iconbuttons/hole2.svg";
import holeIcon2 from "./iconbuttons/hole3.svg";
import holeIcon3 from "./iconbuttons/hole4.svg";
import holeIcon4 from "./iconbuttons/hole5.svg";
import holeIcon5 from "./iconbuttons/hole6.svg";
import holeIcon6 from "./iconbuttons/hole7.svg";
import holeIcon7 from "./iconbuttons/hole8.svg";

const iconArray = [
    holeIcon0,
    holeIcon1,
    holeIcon2,
    holeIcon3,
    // holeIcon4,
    // holeIcon5,
    // holeIcon6,
    // holeIcon7,
];

const NewNoModalHoles = ({holes, setHoles, holesR, setHolesR, prices, buttonsArr, selectArr}) => {

    let handleSelectChange = (e) => {
        setHolesR(e.target.value)
    }

    let handleToggle = (e) => {
        if (holes === "Не потрібно") {
            setHoles(1)
            setHolesR("5 мм")
        } else {
            setHoles("Не потрібно")
            setHolesR("Не потрібно")
        }
    }

    let handleClick = (e) => {
        setHoles(e)
        setHolesR("5 мм")
    }

    return (
        <div className="d-flex flex-column allArtemElem">
            <div style={{display: 'flex', alignItems: 'center',  width: '15vm'}}>
                <div className={`toggleContainer scale04ForButtonToggle ${holes === "Не потрібно" ? 'disabledCont' : 'enabledCont'}`}
                     onClick={handleToggle}
                     >
                    <div className={`toggle-button ${holes === "Не потрібно" ? 'disabled' : 'enabledd'}`}>
                    </div>
                </div>
                <div className="d-flex flex-column">
                    <span style={{
                        width: "10vw",
                    }}>{"Cвердління отворів:"}</span>
                    {holes !== "Не потрібно" ? (
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center',width: '44vmin'}}>
                            <div className="ArtemNewSelectContainer">
                                <select
                                    className="selectArtem"
                                    onChange={(event) => handleSelectChange(event)}
                                    value={holesR}
                                    // style={{marginLeft: "2vw"}}
                                >
                                    {/*<option disabled selected>Оберіть значення</option>*/}
                                    {/*<option>Задати свій розмір</option>*/}
                                    {selectArr.map((item, iter) => (
                                        <option
                                            className="optionInSelectArtem"
                                            key={item}
                                            value={item}
                                        >
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: "2vw"}}>
                                {iconArray.map((item, index) => (
                                    <div
                                        key={index}
                                        className={holes === index + 1 ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}
                                        onClick={() => handleClick(index + 1)}
                                        style={{
                                            // backgroundColor: holes === index + 1 ? 'orange' : 'transparent',
                                            // border: holes === index ? '0.13vw solid black' : '0.13vw solid grey',
                                            // borderRadius: '0.627vw',
                                            // padding: '1.273vh 1.273vw',
                                            padding: '0 0',
                                            margin: '0.323vw',
                                            // width: '3.173vw',
                                            // height: '3.173vw',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            transition: "all 0.3s ease",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <img className="" style={{
                                            height: "3.173vw",
                                            opacity: holes === index + 1 ? '100%' : '90%',
                                        }} alt="" src={iconArray[index]}/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>

                        </div>
                    )}
                </div>

            </div>
        </div>
    )
};

export default NewNoModalHoles;