import React, {useEffect, useState} from "react";
import '../CornerRounding.css';
import '../ArtemStyles.css';

const NewNoModalSizeCup = ({size, setSize, type, buttonsArr, color, setColor, count, setCount, defaultt,}) => {
    const [x, setX] = useState(size.x);
    const [y, setY] = useState(size.y);
    const [xVal, setXVal] = useState(false);
    const [yVal, setYVal] = useState(false);
    const [isCustom, setIsCustom] = useState(false);
    const [thisNameVal, setThisNameVal] = useState(defaultt);

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
        minXYValue = 45
        maxXYValue = 445
        invalid = `Будь-ласка введіть розмір від ${minXYValue} до ${maxXYValue} (y до ${yMaxValue}).`
    } else if (type === "SheetCutBW") {
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
    } else if (type === "Plotter") {
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

    return (
        <div className="d-flex allArtemElem">


        </div>
    )
};

export default NewNoModalSizeCup;
