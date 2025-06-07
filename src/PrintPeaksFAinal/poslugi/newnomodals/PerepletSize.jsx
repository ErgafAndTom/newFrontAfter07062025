import React, {useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import './CornerRounding.css';
import './ArtemStyles.css';

const PerepletSize = ({size, setSize, type, buttonsArr, color, setColor, count, setCount, defaultt,}) => {
    const [x, setX] = useState(size.x);
    const [y, setY] = useState(size.y);
    const [xVal, setXVal] = useState(false);
    const [yVal, setYVal] = useState(false);
    const [isCustom, setIsCustom] = useState(false);
    const [thisNameVal, setThisNameVal] = useState(defaultt);

    //initial main -------------------------------------------------------------------------------------------
    let formats = [
        {name: "A5 (148 х 210 мм)", x: 148, y: 210},
        {name: "A4 (210 x 297 мм)", x: 210, y: 297},
        {name: "А3 (297 х 420 мм)", x: 297, y: 420},
    ]
    let invalid = ""
    let minXYValue = 1
    let maxXYValue = 445
    let xMaxValue = 310
    let yMaxValue = 440

    //initial main and--------------------------------------------------------------------------------------------


      let setCustomValues = (e) => {
        let validX = true;
        let validY = true;
        setXVal(false)
        setYVal(false)
        if (x < minXYValue || x > xMaxValue) {
            validX = false
            setXVal(true)
        }
        if (y < minXYValue || y > yMaxValue) {
            validY = false
            setYVal(true)
        }
        if (validX && validY) {
            setSize({
                x: x,
                y: y
            })
            // setShow(false);
        }
    }

    const handleSelectOption = e => {
        if (e.target.value === "Задати свій розмір") {
            setThisNameVal(e.target.value)
            setIsCustom(true)
        } else {
            const selectedFormat = formats.find(format => format.name === e.target.value);
            if (selectedFormat) {
                setX(selectedFormat.x);
                setY(selectedFormat.y);
                setThisNameVal(selectedFormat.name)
                setSize({
                    x: selectedFormat.x,
                    y: selectedFormat.y
                })
                setIsCustom(false)
            } else {
                setIsCustom(false)
                // setIsCustom(true)
            }
        }
    }

    let handleClick = (e) => {
        setColor({
            sides: e,
            one: "",
            two: "",
            allSidesColor: "CMYK",
        })
    }

    useEffect(() => {
        setX(size.x)
        setY(size.y)
        const selectedFormat = formats.find(format => format.x === size.x && format.y === size.y);
        if (selectedFormat) {
            setThisNameVal(selectedFormat.name);
        } else {
            setThisNameVal("Задати свій розмір");
        }
    }, [size]);

    return (


        <div className="d-flex allArtemElem" style={{  marginLeft: "0vw"}}>
                <select
                    className="selectArtem"
                    onChange={handleSelectOption}
                    value={thisNameVal}
                    // style={{marginLeft: "2vw"}}
                >
                    {/*<option disabled selected>Оберіть значення</option>*/}
                    {/*<option>Задати свій розмір</option>*/}
                    {formats.map((item, iter) => (
                        <option
                            className="optionInSelectArtem"
                            key={item.name}
                            value={item.name}
                        >
                            {item.name}
                        </option>
                    ))}
                </select>
            </div>




    )
};

export default PerepletSize
