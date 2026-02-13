import React, {useEffect, useState, useRef} from "react";
import Form from "react-bootstrap/Form";
import './CornerRounding.css';
import './ArtemStyles.css';
import handleChange from "./PerepletPereplet";

const ModalSize = ({size, setSize, type, buttonsArr, color, setColor, count, setCount, defaultt,}) => {
    const [x, setX] = useState(size.x);
    const [y, setY] = useState(size.y);
    const [xVal, setXVal] = useState(false);
    const [yVal, setYVal] = useState(false);
    const [isCustom, setIsCustom] = useState(false);
    const [thisNameVal, setThisNameVal] = useState(defaultt);
    const [openSize, setOpenSize] = useState(false);
    const sizeDropdownRef = useRef(null);

    //initial main -------------------------------------------------------------------------------------------
    let formats = []
    let invalid = ""
    let minXYValue = 1
    let maxXYValue = 445
    let xMaxValue = 310
    let yMaxValue = 440

    if (type === "Sheet") {
        formats = [
            {name: "A4 (210 x 297 мм)", x: 210, y: 297},
            {name: "А3 (297 х 420 мм)", x: 297, y: 420},
        ]
        minXYValue = 45
        maxXYValue = 445
        invalid = `Будь-ласка введіть розмір від ${minXYValue} до ${maxXYValue}.`
    } else if (type === "SheetCut") {
        formats = [
            {name: "Задати свій розмір", x: 1, y: 1},
            {name: "А6 (105 х 148 мм)", x: 105, y: 148},
            {name: "A5 (148 х 210 мм)", x: 148, y: 210},
            {name: "A4 (210 x 297 мм)", x: 210, y: 297},
            {name: "А3 (297 х 420 мм)", x: 297, y: 420},
            {name: "SR А3 (310 х 440 мм)", x: 310, y: 440},
            {name: "90х50 мм", x: 90, y: 50},
            {name: "85x55 мм", x: 85, y: 55},
            {name: "100х150 мм", x: 100, y: 150},
            {name: "200х100 мм", x: 200, y: 100},
            {name: "50х50 мм", x: 50, y: 50},
            {name: "60х60 мм", x: 60, y: 60},
            {name: "70х70 мм", x: 70, y: 70},
            {name: "80х80 мм", x: 80, y: 80},
            {name: "90х90 мм", x: 90, y: 90},
            {name: "100x100 мм", x: 100, y: 100},
            {name: "120х120 мм", x: 120, y: 120},
        ]
        minXYValue = 40
        maxXYValue = 440
        invalid = `Будь-ласка введіть розмір від ${minXYValue} до ${maxXYValue} (y до ${yMaxValue}).`
    }
    else if (type === "SheetSheet") {
      formats = [
        {name: "A4 (210 x 297 мм)", x: 210, y: 297},
        {name: "А3 (297 х 420 мм)", x: 297, y: 420},
        {name: "SRА3 (320 х 450 мм)", x: 310, y: 440},
        {name: "SRA3+ (330 х 488 мм)", x: 320, y: 478},
        {name: "SRA3 XLS (330 х 660 мм)", x: 330, y: 660},
      ]
      minXYValue = 45
      maxXYValue = 2000
      maxXYValue = 2000
      xMaxValue = 1000
      yMaxValue = 1000
      // invalid = `Будь-ласка введіть розмір від ${minXYValue} до ${maxXYValue} (y до ${yMaxValue}).`
    }
    else if (type === "SheetCutBW") {
        formats = [
            // {name: "А6 (105 х 148 мм)", x: 105, y: 148},
            // {name: "A5 (148 х 210 мм)", x: 148, y: 210},
            {name: "A4 (210 x 297 мм)", x: 210, y: 297},
            {name: "А3 (297 х 420 мм)", x: 297, y: 420},
        ]
        minXYValue = 45
        maxXYValue = 445
        invalid = `Будь-ласка введіть розмір від ${minXYValue} до ${maxXYValue} (y до ${yMaxValue}).`
    } else if (type === "Note") {
        formats = [
            {name: "Задати свій розмір", x: 1, y: 1},
            {name: "А6 (105 х 148 мм)", x: 105, y: 148},
            {name: "A5 (148 х 210 мм)", x: 148, y: 210},
            {name: "A4 (210 x 297 мм)", x: 210, y: 297},
            {name: "А3 (297 х 420 мм)", x: 297, y: 420},
            {name: "90х50 мм", x: 90, y: 50},
            {name: "85x55 мм", x: 85, y: 55},
            {name: "90х55 мм", x: 90, y: 55},
            {name: "100х100 мм", x: 100, y: 100},
            {name: "100х150 мм", x: 100, y: 150},
            {name: "86х54 мм", x: 86, y: 54},
            {name: "200х100 мм", x: 200, y: 100},
            {name: "87х54 мм", x: 87, y: 54},
            {name: "200х200 мм", x: 200, y: 200},
            {name: "88х50 мм", x: 88, y: 50},
            {name: "85х54 мм", x: 85, y: 54},
        ]
        minXYValue = 45
        maxXYValue = 445
        invalid = `Будь-ласка введіть розмір від ${minXYValue} до ${maxXYValue}.`
    } else if (type === "Wide") {
        formats = [
            {name: "Задати свій розмір", x: 1, y: 1},
            // {name: "A4 (210 x 297 мм)", x: 210, y: 297},
            // {name: "А3 (297 х 420 мм)", x: 297, y: 420},
            {name: "A2 (420 x 594 мм)", x: 420, y: 594},
            {name: "A1 (594 x 841 мм)", x: 594, y: 841},
            {name: "A0 (841 x 1189 мм)", x: 841, y: 1189},
        ]
        minXYValue = 45
        maxXYValue = 1000
        xMaxValue = 1000
        yMaxValue = 5000
        invalid = `Будь-ласка введіть розмір від ${minXYValue} до ${maxXYValue} (y до ${yMaxValue}).`
    } else if (type === "Magnets") {
        formats = [
            {name: "Задати свій розмір", x: 1, y: 1},
            // {name: "A4 (210 x 297 мм)", x: 210, y: 297},
            // {name: "А3 (297 х 420 мм)", x: 297, y: 420},
            {name: "A7 (75 x 105 мм)", x: 75, y: 105},
            {name: "А6 (105 x 145 мм)", x: 105, y: 145},
            {name: "100 х 150 мм", x: 100, y: 150},
            {name: "А5 (148 x 210 мм)", x: 148, y: 210},
            {name: "A4 (210 x 297 мм)", x: 210, y: 297},
            {name: "А3 (297 х 420 мм)", x: 297, y: 420},
        ]
        minXYValue = 50
        maxXYValue = 1000
        xMaxValue = 600
        yMaxValue = 1000
        invalid = `Максимальна ширина: ${xMaxValue} Максимальна довжина ${yMaxValue}`
    } else if (type === "WideFactory") {
      formats = [
        {name: "Задати свій розмір", x: 1, y: 1},
        // {name: "A4 (210 x 297 мм)", x: 210, y: 297},
        // {name: "А3 (297 х 420 мм)", x: 297, y: 420},
        {name: "A2 (420 x 594 мм)", x: 420, y: 594},
        {name: "A1 (594 x 841 мм)", x: 594, y: 841},
        {name: "A0 (841 x 1189 мм)", x: 841, y: 1189},
      ]
      minXYValue = 0
      maxXYValue = 10000
      xMaxValue = 10000
      yMaxValue = 10000
      invalid = `Будь-ласка введіть розмір від ${minXYValue} до ${maxXYValue} (y до ${yMaxValue}).`
    }
    else if (type === "Plotter") {
        formats = [
            {name: "Задати свій розмір", x: 1, y: 1},
            {name: "А6 (105 х 148 мм)", x: 105, y: 148},
            {name: "A5 (148 х 210 мм)", x: 148, y: 210},
            {name: "A4 (210 x 297 мм)", x: 210, y: 297},
            {name: "А3 (297 х 420 мм)", x: 297, y: 420},
            {name: "SR А3 (310 х 440 мм)", x: 310, y: 440},
            {name: "90х50 мм", x: 90, y: 50},
            {name: "85x55 мм", x: 85, y: 55},
            {name: "100х150 мм", x: 100, y: 150},
            {name: "200х100 мм", x: 200, y: 100},
            {name: "50х50 мм", x: 50, y: 50},
            {name: "60х60 мм", x: 60, y: 60},
            {name: "70х70 мм", x: 70, y: 70},
            {name: "80х80 мм", x: 80, y: 80},
            {name: "90х90 мм", x: 90, y: 90},
            {name: "100x100 мм", x: 100, y: 100},
            {name: "120х120 мм", x: 120, y: 120},
        ]
        minXYValue = 20
        maxXYValue = 445
        xMaxValue = 445
        yMaxValue = 445
        invalid = `Будь-ласка введіть розмір від ${minXYValue} до ${maxXYValue} (y до ${yMaxValue}).`
    } else if (type === "Vishichka") {
        formats = [
            {name: "Задати свій розмір", x: 1, y: 1},
            {name: "А6 (105 х 148 мм)", x: 105, y: 148},
            {name: "A5 (148 х 210 мм)", x: 148, y: 210},
            {name: "A4 (210 x 297 мм)", x: 210, y: 297},
            {name: "А3 (297 х 420 мм)", x: 297, y: 420},
            {name: "SR А3 (310 х 440 мм)", x: 310, y: 440},
            {name: "90х50 мм", x: 90, y: 50},
            {name: "85x55 мм", x: 85, y: 55},
            {name: "100х150 мм", x: 100, y: 150},
            {name: "200х100 мм", x: 200, y: 100},
            {name: "50х50 мм", x: 50, y: 50},
            {name: "60х60 мм", x: 60, y: 60},
            {name: "70х70 мм", x: 70, y: 70},
            {name: "80х80 мм", x: 80, y: 80},
            {name: "90х90 мм", x: 90, y: 90},
            {name: "100x100 мм", x: 100, y: 100},
            {name: "120х120 мм", x: 120, y: 120},
        ]
        minXYValue = 10
        maxXYValue = 445
        xMaxValue = 445
        yMaxValue = 445
        invalid = `Будь-ласка введіть розмір від ${minXYValue} до ${maxXYValue} (y до ${yMaxValue}).`
    }
    //initial main and--------------------------------------------------------------------------------------------
    let handleChange = (e) => {
        setCount(e)
    }

    const handleClose = () => {

    }
    const handleShow = () => {

    }

    useEffect((e) => {
        // console.log(size);
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
    }, [x, y]);

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
            setIsCustom(false)
        } else {
            setThisNameVal("Задати свій розмір");
            setIsCustom(true)
        }
    }, [size.x, size.y]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target)) {
                setOpenSize(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectItem = (item) => {
        if (item.name === "Задати свій розмір") {
            setThisNameVal(item.name);
            setIsCustom(true);
        } else {
            setX(item.x);
            setY(item.y);
            setThisNameVal(item.name);
            setSize({ x: item.x, y: item.y });
            setIsCustom(false);
        }
        setOpenSize(false);
    };

    return (
        <div className="d-flex allArtemElem"  >
            <div className="d-flex" >
                {isCustom === true ? (
                    <Form.Control
                        className="inputsArtem"
                        type="number"
                        value={x}
                        min={minXYValue}
                        max={xMaxValue}
                        onChange={(event) => setX(event.target.value)}
                        isInvalid={xVal}
                    />
                ) : (
                    <Form.Control
                        className="inputsArtem"
                        type="number"
                        value={x}
                        min={minXYValue}
                        max={xMaxValue}
                        disabled
                        // onChange={(event) => setX(event.target.value)}
                        isInvalid={xVal}
                    />
                )}
                <Form.Control.Feedback type="invalid">
                    {invalid}
                </Form.Control.Feedback>
            </div>
            <div className="inputsArtemx" style={{border:"transparent"}}>x</div>
            <div className="d-flex" >
                {isCustom === true ? (
                    <Form.Control
                        className="inputsArtem"
                        type="number"
                        value={y}
                        min={minXYValue}
                        max={yMaxValue}
                        onChange={(event) => setY(event.target.value)}
                        isInvalid={yVal}
                    />
                ) : (
                    <Form.Control
                        className="inputsArtem"
                        type="number"
                        value={y}
                        min={minXYValue}
                        max={yMaxValue}
                        disabled
                        // onChange={(event) => setY(event.target.value)}
                        isInvalid={yVal}
                    />
                )}<div className="inputsArtemx" style={{border:"transparent"}}> мм</div></div>
           <div className="FormControlFeedbackColor" style={{marginLeft: "2vw"}}>
               <Form.Control.Feedback type="invalid">
                   {invalid}
               </Form.Control.Feedback>
           </div>



            <div
                className="custom-select-container selectArtem selectArtemBefore ArtemNewSelectContainer"
                ref={sizeDropdownRef}
            >
                <div
                    className="custom-select-header"
                    onClick={() => setOpenSize(!openSize)}
                >
                    {thisNameVal}
                </div>

                {openSize && (
                    <div className="custom-select-dropdown">
                        {formats.map((item) => (
                            <div
                                key={item.name}
                                className={`custom-option ${item.name === thisNameVal ? "active" : ""}`}
                                onClick={() => handleSelectItem(item)}
                            >
                                <span className="name">{item.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: "2vw"}}>
                {buttonsArr.map((item, index) => (
                    <button
                        className={item === color.sides ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}
                        key={index}
                        onClick={() => handleClick(item)}
                         >
                        <div className="" style={{

                            opacity: item === color.sides ? '100%' : '60%',

                        }}>
                            {item}
                        </div>
                    </button>
                ))}
            </div>


        </div>

    )
};

export default ModalSize
