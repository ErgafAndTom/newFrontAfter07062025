import {Modal} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import React, {useState} from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

const ModalSize = ({size, setSize, type}) => {
    const [show, setShow] = useState(false);
    const [x, setX] = useState(size.x);
    const [y, setY] = useState(size.y);
    const [xVal, setXVal] = useState(false);
    const [yVal, setYVal] = useState(false);
    const [isCustom, setIsCustom] = useState(false);
    const [thisNameVal, setThisNameVal] = useState("А3 (297 х 420 мм)");

    //initial main -------------------------------------------------------------------------------------------
    let formats = [

    ]
    let invalid = ""
    let minXYValue = 1
    let maxXYValue = 445
    let xMaxValue = 310
    let yMaxValue = 440

    if(type === "Sheet"){
        formats = [
            {name:"A4 (210 x 297 мм)", x: 210, y: 297},
            {name:"А3 (297 х 420 мм)", x: 297, y: 420},
        ]
        minXYValue = 45
        maxXYValue = 445
        invalid = `Будь-ласка введіть розмір від ${minXYValue} до ${maxXYValue}.`
    } else if(type === "SheetCut"){
        formats = [
            {name:"Задати свій розмір", x: 1, y: 1},
            {name:"А6 (105 х 148 мм)", x: 105, y: 148},
            {name:"A5 (148 х 210 мм)", x: 148, y: 210},
            {name:"A4 (210 x 297 мм)", x: 210, y: 297},
            {name:"А3 (297 х 420 мм)", x: 297, y: 420},
            {name:"SR А3 (310 х 440 мм)", x: 310, y: 440},
            {name:"90х50 мм", x: 90, y: 50},
            {name:"85x55 мм", x: 85, y: 55},
            {name:"100х150 мм", x: 100, y: 150},
            {name:"200х100 мм", x: 200, y: 100},
            {name:"50х50 мм", x: 50, y: 50},
            {name:"60х60 мм", x: 60, y: 60},
            {name:"70х70 мм", x: 70, y: 70},
            {name:"80х80 мм", x: 80, y: 80},
            {name:"90х90 мм", x: 90, y: 90},
            {name:"100x100 мм", x: 100, y: 100},
            {name:"120х120 мм", x: 120, y: 120},
        ]
        minXYValue = 45
        maxXYValue = 445
        invalid = `Будь-ласка введіть розмір від ${minXYValue} до ${maxXYValue} (y до ${yMaxValue}).`
    } else if(type === "Note"){
        formats = [
            {name:"Задати свій розмір", x: 1, y: 1},
            {name:"А6 (105 х 148 мм)", x: 105, y: 148},
            {name:"A5 (148 х 210 мм)", x: 148, y: 210},
            {name:"A4 (210 x 297 мм)", x: 210, y: 297},
            {name:"А3 (297 х 420 мм)", x: 297, y: 420},
            {name:"90х50 мм", x: 90, y: 50},
            {name:"85x55 мм", x: 85, y: 55},
            {name:"90х55 мм", x: 90, y: 55},
            {name:"100х100 мм", x: 100, y: 100},
            {name:"100х150 мм", x: 100, y: 150},
            {name:"86х54 мм", x: 86, y: 54},
            {name:"200х100 мм", x: 200, y: 100},
            {name:"87х54 мм", x: 87, y: 54},
            {name:"200х200 мм", x: 200, y: 200},
            {name:"88х50 мм", x: 88, y: 50},
            {name:"85х54 мм", x: 85, y: 54},
        ]
        minXYValue = 45
        maxXYValue = 445
        invalid = `Будь-ласка введіть розмір від ${minXYValue} до ${maxXYValue}.`
    } else if(type === "Wide"){
        formats = [
            {name:"Задати свій розмір", x: 1, y: 1},
            {name:"A4 (210 x 297 мм)", x: 210, y: 297},
            {name:"А3 (297 х 420 мм)", x: 297, y: 420},
            { name: "A2 (420 x 594 мм)", x: 420, y: 594 },
            { name: "A1 (594 x 841 мм)", x: 594, y: 841 },
            { name: "A0 (841 x 1189 мм)", x: 841, y: 1189 },
        ]
        minXYValue = 45
        maxXYValue = 1000
        xMaxValue = 1000
        yMaxValue = 5000
        invalid = `Будь-ласка введіть розмір від ${minXYValue} до ${maxXYValue} (y до ${yMaxValue}).`
    } else if(type === "Plotter"){
        formats = [
            {name:"Задати свій розмір", x: 1, y: 1},
            {name:"А6 (105 х 148 мм)", x: 105, y: 148},
            {name:"A5 (148 х 210 мм)", x: 148, y: 210},
            {name:"A4 (210 x 297 мм)", x: 210, y: 297},
            {name:"А3 (297 х 420 мм)", x: 297, y: 420},
            {name:"SR А3 (310 х 440 мм)", x: 310, y: 440},
            {name:"90х50 мм", x: 90, y: 50},
            {name:"85x55 мм", x: 85, y: 55},
            {name:"100х150 мм", x: 100, y: 150},
            {name:"200х100 мм", x: 200, y: 100},
            {name:"50х50 мм", x: 50, y: 50},
            {name:"60х60 мм", x: 60, y: 60},
            {name:"70х70 мм", x: 70, y: 70},
            {name:"80х80 мм", x: 80, y: 80},
            {name:"90х90 мм", x: 90, y: 90},
            {name:"100x100 мм", x: 100, y: 100},
            {name:"120х120 мм", x: 120, y: 120},
        ]
        minXYValue = 20
        maxXYValue = 445
        xMaxValue = 445
        yMaxValue = 445
        invalid = `Будь-ласка введіть розмір від ${minXYValue} до ${maxXYValue} (y до ${yMaxValue}).`
    }
    //initial main and--------------------------------------------------------------------------------------------


    const handleClose = () => {
        setShow(false);
    }
    const handleShow = () => {
        setShow(true);
    }

    let setCustomValues = (e) => {
        let validX = true;
        let validY = true;
        setXVal(false)
        setYVal(false)
        if(x < minXYValue || x > xMaxValue){
            validX = false
            setXVal(true)
        }
        if(y < minXYValue || y > yMaxValue){
            validY = false
            setYVal(true)
        }
        if(validX && validY){
            setSize({
                x: x,
                y: y
            })
            setShow(false);
        }
    }

    const handleSelectOption = e => {
        if(e.target.value === "Задати свій розмір"){
            setThisNameVal(e.target.value)
            setIsCustom(true)
        } else {
            const selectedFormat = formats.find(format => format.name === e.target.value);
            if(selectedFormat){
                setX(selectedFormat.x);
                setY(selectedFormat.y);
                setThisNameVal(selectedFormat.name)
                setIsCustom(false)
            } else {
                setIsCustom(false)
                // setIsCustom(true)
            }
        }
    }

    return (
        <>
            <Card onClick={handleShow}
                  className="colorCards"
            >
                <Card.Body>
                    <Card.Title className="adminFont2 m-auto text-center">Розмір виробу</Card.Title>
                    <Card.Text className="adminFont p-2" style={{background: "#fff" , borderRadius: "0.4vw", marginTop: '1vw'  }}>
                        {size.x}x{size.y} мм
                    </Card.Text>
                </Card.Body>
            </Card>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Розмір</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Select
                        onChange={handleSelectOption}
                        className="mb-3"
                        value={thisNameVal}
                    >
                        {/*<option disabled selected>Оберіть значення</option>*/}
                        {/*<option>Задати свій розмір</option>*/}
                        {formats.map((item, iter) => (
                            <option
                                key={item.name}
                                value={item.name}
                            >
                                {item.name}
                            </option>
                        ))}
                    </Form.Select>

                    <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1">x</InputGroup.Text>
                        {isCustom === true ? (
                            <Form.Control
                                type="number"
                                value={x}
                                min={minXYValue}
                                max={xMaxValue}
                                onChange={(event) => setX(event.target.value)}
                                isInvalid={xVal}
                            />
                        ) : (
                            <Form.Control
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
                    </InputGroup>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1">y</InputGroup.Text>
                        {isCustom === true ? (
                            <Form.Control
                                type="number"
                                value={y}
                                min={minXYValue}
                                max={yMaxValue}
                                onChange={(event) => setY(event.target.value)}
                                isInvalid={yVal}
                            />
                        ) : (
                            <Form.Control
                                type="number"
                                value={y}
                                min={minXYValue}
                                max={yMaxValue}
                                disabled
                                // onChange={(event) => setY(event.target.value)}
                                isInvalid={yVal}
                            />
                        )}
                        <Form.Control.Feedback type="invalid">
                            {invalid}
                        </Form.Control.Feedback>
                    </InputGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Закрити
                    </Button>
                    <Button variant="success" onClick={setCustomValues}>
                        Застосувати
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ModalSize;