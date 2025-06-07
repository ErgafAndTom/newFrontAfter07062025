import React from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

const IndoorUnit = ({indoorUnit, setIndoorUnit, prices}) => {
    let handleSelectType = (e) => {
        let numberToSet = parseInt(e.target.value);
        if(numberToSet < 1){
            numberToSet = 1
        } else if(numberToSet > 300){
            numberToSet = 300
        }
        setIndoorUnit({
            type: numberToSet,
            material: indoorUnit.material,
            color: indoorUnit.color,
            lamination: indoorUnit.lamination,
            sides: indoorUnit.sides
        })
    }

    let handleSelectMaterial = (e) => {
        setIndoorUnit({
            type: indoorUnit.type,
            material: e.target.value,
            color: indoorUnit.color,
            lamination: indoorUnit.lamination,
            sides: indoorUnit.sides
        })
    }

    let handleSelectColor = (e) => {
        setIndoorUnit({
            type: indoorUnit.type,
            material: indoorUnit.material,
            color: e.target.value,
            lamination: indoorUnit.lamination,
            sides: indoorUnit.sides
        })
    }

    let handleSelectLamination = (e) => {
        setIndoorUnit({
            type: indoorUnit.type,
            material: indoorUnit.material,
            color: indoorUnit.color,
            lamination: e.target.value,
            sides: indoorUnit.sides
        })
    }

    let handleSelectSides = (e) => {
        setIndoorUnit({
            type: indoorUnit.type,
            material: indoorUnit.material,
            color: indoorUnit.color,
            lamination: indoorUnit.lamination,
            sides: e.target.value
        })
    }

    return (
        <>
            <Card className="colorCards">
                <Card.Body>
                    <Card.Title className="adminFont2 m-auto text-center">Внутрішній блок</Card.Title>
                    <Card.Text className="adminFont p-2" style={{background: "#fff" , borderRadius: "0.4vw", marginTop: '1vw'  }}>
                        <InputGroup className="mb-3">
                            <Form.Control
                                className="adminFont"
                                type="number"
                                value={indoorUnit.type}
                                min={1}
                                max={300}
                                // onChange={(event) => handleSelectType(event.target.value)}
                                onChange={handleSelectType}
                            />
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <Form.Select
                                aria-label=""
                                onChange={handleSelectMaterial}
                                className="adminFont"
                                value={indoorUnit.material}
                            >
                                <option className="adminFont" value={""} disabled selected>Матеріал</option>
                                {prices[1].variants.map((item, iter) => (
                                    <option
                                        key={`indoorunitmat${item[0]}`}
                                        className="adminFont"
                                        value={item[0]}
                                    >
                                        {item[0]}
                                    </option>
                                ))}
                            </Form.Select>
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <Form.Select
                                aria-label=""
                                onChange={handleSelectColor}
                                className="adminFont"
                                value={indoorUnit.color}
                            >
                                <option className="adminFont" value={"Без друку"}>Без друку</option>
                                <option className="adminFont" value={"Чорно-білий"}>Чорно-білий</option>
                                <option className="adminFont" value={"CMYK"}>CMYK</option>
                            </Form.Select>
                        </InputGroup>
                        {indoorUnit.color === "Без друку" ? (
                            <div>

                            </div>
                        ) : (
                            <div>
                                <InputGroup className="mb-3">
                                    <Form.Select
                                        aria-label=""
                                        onChange={handleSelectSides}
                                        className="adminFont"
                                        value={indoorUnit.sides}
                                    >
                                        {/*<option className="adminFont" value={""} disabled selected>Верх лист</option>*/}
                                        <option className="adminFont" value={"1"}>Односторонній друк</option>
                                        <option className="adminFont" value={"2"}>Двосторонній друк</option>

                                    </Form.Select>
                                </InputGroup>
                            </div>
                        )}
                        <InputGroup className="mb-3">
                            <Form.Select
                                onChange={handleSelectLamination}
                                className="adminFont"
                                value={indoorUnit.lamination}
                            >
                                <option className="adminFont" value={"Не потрібно"}>Не потрібно</option>
                                <option className="adminFont" value={"З глянцевим ламінуванням"}>З глянцевим ламінуванням</option>
                                <option className="adminFont" value={"З матовим ламінуванням"}>З матовим ламінуванням</option>
                                <option className="adminFont" value={"З ламінуванням Soft Touch"}>З ламінуванням Soft Touch</option>
                            </Form.Select>
                        </InputGroup>
                    </Card.Text>
                </Card.Body>
            </Card>
        </>
    );
};

export default IndoorUnit;