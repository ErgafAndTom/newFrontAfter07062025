import React, {useEffect, useState, useRef} from "react";
import Form from "react-bootstrap/Form";
import './CornerRounding.css';
import './ArtemStyles.css';
import handleChange from "./PerepletPereplet";

const ModalSize = ({size, setSize, type, buttonsArr, color, setColor, count, setCount, defaultt, showSize = true, showSides = true}) => {

  const [x, setX] = useState(size.x);
  const [y, setY] = useState(size.y);
  const [xVal, setXVal] = useState(false);
  const [yVal, setYVal] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [thisNameVal, setThisNameVal] = useState(defaultt);
  const [open, setOpen] = useState(false);
  const [dropdownWidth, setDropdownWidth] = useState("auto");

  const dropdownRef = useRef(null);
  const measureRef = useRef(null);

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

  useEffect(() => {
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
    }
  }, [x, y]);

  const handleSelectOption = (selectedFormat) => {
    if (selectedFormat.name === "Задати свій розмір") {
      setThisNameVal(selectedFormat.name)
      setIsCustom(true)
    } else {
      setX(selectedFormat.x);
      setY(selectedFormat.y);
      setThisNameVal(selectedFormat.name)
      setSize({
        x: selectedFormat.x,
        y: selectedFormat.y
      })
      setIsCustom(false)
    }
    setOpen(false);
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

  // Автоширина dropdown
  useEffect(() => {
    if (!measureRef.current) return;
    const widths = Array.from(measureRef.current.children).map((el) =>
      el.getBoundingClientRect().width
    );
    if (widths.length > 0) {
      const maxWidth = Math.ceil(Math.max(...widths)) + 30;
      setDropdownWidth(`${maxWidth}px`);
    }
  }, [formats]);

  // Клік поза dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="d-flex flex-row justify-content-between align-items-center w-100" style={{marginTop: "1vw", marginLeft: "1.5vw", gap: "3"}}>

      <Form.Control.Feedback type="invalid">
        {invalid}
      </Form.Control.Feedback>

      {/* Кнопки */}
      {showSides && buttonsArr.length > 0 && (
        <div style={{display: "flex", gap: "0"}}>
          {buttonsArr.map((item, index) => {
            const isActive = item === color.sides;
            const isFirst = index === 0;
            const isLast = index === buttonsArr.length - 1;

            return (
              <button
                key={item}
                className={
                  isActive
                    ? "buttonsArtem buttonsArtemActive"
                    : "buttonsArtem"
                }
                style={{
                  backgroundColor: isActive ? "#f5a623" : "#D3D3D3",
                  color: isActive ? "#FFFFFF" : "#666666",
                  borderTopLeftRadius: isFirst ? "1vh" : "0",
                  borderBottomLeftRadius: isFirst ? "1vh" : "0",
                  borderTopRightRadius: isLast ? "1vh" : "0",
                  borderBottomRightRadius: isLast ? "1vh" : "0",
                }}
                onClick={() => handleClick(item)}
              >
                {item}
              </button>
            );
          })}
        </div>
      )}

      {/* Кастомний SELECT */}
      {showSize && (
        <div
          className="custom-select-container selectArtem selectArtemBefore"

          ref={dropdownRef}
          style={{minWidth: dropdownWidth}}
        >
          <div
            className="custom-select-header"
            onClick={() => setOpen(!open)}
          >
            {thisNameVal}
          </div>

          {open && (
            <div className="custom-select-dropdown" style={{minWidth: dropdownWidth}}>
              {formats.map((item) => (
                <div
                  key={item.name}
                  className={`custom-option ${
                    item.name === thisNameVal ? "active" : ""
                  }`}
                  onClick={() => handleSelectOption(item)}
                >
                  <span className="name">{item.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Hidden measure */}
          <div
            ref={measureRef}
            style={{
              position: "absolute",
              visibility: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {formats.map((item) => (
              <div key={item.name} style={{fontSize: "15px", padding: "8px 12px"}}>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
};

export default ModalSize
