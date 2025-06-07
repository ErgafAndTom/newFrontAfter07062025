import React from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

const BackCover = ({backCover, setBackCover, prices}) => {
    let handleSelectType = (e) => {
        setBackCover({
            type: e.target.value,
            material: backCover.material,
            color: backCover.color,
            lamination: backCover.lamination,
            sides: backCover.sides
        })
    }

    let handleSelectMaterial = (e) => {
        setBackCover({
            type: backCover.type,
            material: e.target.value,
            color: backCover.color,
            lamination: backCover.lamination,
            sides: backCover.sides
        })
    }

    let handleSelectColor = (e) => {
        setBackCover({
            type: backCover.type,
            material: backCover.material,
            color: e.target.value,
            lamination: backCover.lamination,
            sides: backCover.sides
        })
    }

    let handleSelectLamination = (e) => {
        setBackCover({
            type: backCover.type,
            material: backCover.material,
            color: backCover.color,
            lamination: e.target.value,
            sides: backCover.sides
        })
    }

    let handleSelectSides = (e) => {
        setBackCover({
            type: backCover.type,
            material: backCover.material,
            color: backCover.color,
            lamination: backCover.lamination,
            sides: e.target.value
        })
    }

    return (
        <>
            <Card className="colorCards">
                <Card.Body>
                    <Card.Title className="adminFont2 m-auto text-center">Підкладка</Card.Title>
                    <Card.Text className="adminFont p-2" style={{background: "#fff" , borderRadius: "0.4vw", marginTop: '1vw'  }}>
                        <InputGroup className="mb-3">
                            <Form.Select
                                onChange={handleSelectType}
                                className="adminFont"
                                value={backCover.type}
                            >
                                {/*<option className="adminFont" value={""} disabled selected>Верх лист</option>*/}
                                <option className="adminFont" value={"Без"}>Без підкладки</option>
                                <option className="adminFont" value={"2 стр (1 аркуш)"}>З підкладкою</option>

                            </Form.Select>
                        </InputGroup>
                        {backCover.type === "Без" ? (
                            <div>

                            </div>
                        ) : (
                            <div>
                                <InputGroup className="mb-3">
                                    <Form.Select
                                        onChange={handleSelectMaterial}
                                        className="adminFont"
                                        value={backCover.material}
                                    >
                                        <option className="adminFont" value={""} disabled selected>Матеріал</option>
                                        {prices[1].variants.map((item, iter) => (
                                            <option
                                                key={`backcovermat${item[0]}`}
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
                                        onChange={handleSelectColor}
                                        className="adminFont"
                                        value={backCover.color}
                                    >
                                        <option className="adminFont" value={"Без друку"}>Без друку</option>
                                        <option className="adminFont" value={"Чорно-білий"}>Чорно-білий</option>
                                        <option className="adminFont" value={"CMYK"}>CMYK</option>
                                    </Form.Select>
                                </InputGroup>
                                {backCover.color === "Без друку" ? (
                                    <div>

                                    </div>
                                ) : (
                                    <div>
                                        <InputGroup className="mb-3">
                                            <Form.Select
                                                aria-label=""
                                                onChange={handleSelectSides}
                                                className="adminFont"
                                                value={backCover.sides}
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
                                        value={backCover.lamination}
                                    >
                                        <option className="adminFont" value={"Не потрібно"}>Не потрібно</option>
                                        <option className="adminFont" value={"З глянцевим ламінуванням"}>З глянцевим ламінуванням</option>
                                        <option className="adminFont" value={"З матовим ламінуванням"}>З матовим ламінуванням</option>
                                        <option className="adminFont" value={"З ламінуванням Soft Touch"}>З ламінуванням Soft Touch</option>
                                    </Form.Select>
                                </InputGroup>
                            </div>
                        )}
                    </Card.Text>
                </Card.Body>
            </Card>
        </>
    );
};

export default BackCover;