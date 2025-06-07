import React from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

const TopCover = ({topCover, setTopCover, prices}) => {
    let handleSelectType = (e) => {
        setTopCover({
            type: e.target.value,
            material: topCover.material,
            color: topCover.color,
            lamination: topCover.lamination,
            sides: topCover.sides
        })
    }

    let handleSelectMaterial = (e) => {
        setTopCover({
            type: topCover.type,
            material: e.target.value,
            color: topCover.color,
            lamination: topCover.lamination,
            sides: topCover.sides
        })
    }

    let handleSelectColor = (e) => {
        setTopCover({
            type: topCover.type,
            material: topCover.material,
            color: e.target.value,
            lamination: topCover.lamination,
            sides: topCover.sides
        })
    }

    let handleSelectLamination = (e) => {
        setTopCover({
            type: topCover.type,
            material: topCover.material,
            color: topCover.color,
            lamination: e.target.value,
            sides: topCover.sides
        })
    }

    let handleSelectSides = (e) => {
        setTopCover({
            type: topCover.type,
            material: topCover.material,
            color: topCover.color,
            lamination: topCover.lamination,
            sides: e.target.value
        })
    }

    return (
        <>
            <Card className="colorCards">
                <Card.Body>
                    <Card.Title className="adminFont2 m-auto text-center">Обкладинка</Card.Title>
                    <Card.Text className="adminFont p-2" style={{background: "#fff" , borderRadius: "0.4vw", marginTop: '1vw'  }}>
                        <InputGroup className="mb-3">
                            <Form.Select
                                aria-label=""
                                onChange={handleSelectType}
                                className="adminFont"
                                value={topCover.type}
                            >
                                {/*<option className="adminFont" value={""} disabled selected>Верх лист</option>*/}
                                <option className="adminFont" value={"Без"}>Без обкладинки</option>
                                <option className="adminFont" value={"2 стр (1 аркуш)"}>З обкладинкою</option>

                            </Form.Select>
                        </InputGroup>
                        {topCover.type === "Без" ? (
                            <div>

                            </div>
                        ) : (
                            <div>
                                <InputGroup className="mb-3">
                                    <Form.Select
                                        aria-label=""
                                        onChange={handleSelectMaterial}
                                        className="adminFont"
                                        value={topCover.material}
                                    >
                                        <option className="adminFont" value={""} disabled selected>Матеріал</option>
                                        {prices[1].variants.map((item, iter) => (
                                            <option
                                                key={`topcovermat${item[0]}`}
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
                                        value={topCover.color}
                                    >
                                        <option className="adminFont" value={"Без друку"}>Без друку</option>
                                        <option className="adminFont" value={"Чорно-білий"}>Чорно-білий</option>
                                        <option className="adminFont" value={"CMYK"}>CMYK</option>
                                    </Form.Select>
                                </InputGroup>
                                {topCover.color === "Без друку" ? (
                                    <div>

                                    </div>
                                ) : (
                                    <div>
                                        <InputGroup className="mb-3">
                                            <Form.Select
                                                aria-label=""
                                                onChange={handleSelectSides}
                                                className="adminFont"
                                                value={topCover.sides}
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
                                        value={topCover.lamination}
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

export default TopCover;