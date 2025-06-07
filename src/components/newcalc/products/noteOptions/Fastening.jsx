import React from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

const Fastening = ({fastening, setFastening, prices}) => {
    let handleSelectType = (e) => {
        if(e.target.value === "Скоба"){
            setFastening({
                type: e.target.value,
                material: "",
                side: fastening.side,
            })
        } else if(e.target.value === "Пружина"){
            setFastening({
                type: e.target.value,
                material: "пластик",
                side: fastening.side,
            })
        }
    }

    let handleSelectMaterial = (e) => {
        setFastening({
            type: fastening.type,
            material: e.target.value,
            side: fastening.side,
        })
    }

    let handleSelectSide = (e) => {
        setFastening({
            type: fastening.type,
            material: fastening.material,
            side: e.target.value,
        })
    }

    return (
        <>
            <Card className="colorCards">
                <Card.Body>
                    <Card.Title className="adminFont2 m-auto text-center">Сшивка</Card.Title>
                    <Card.Text className="adminFont p-2" style={{background: "#fff" , borderRadius: "0.4vw", marginTop: '1vw'  }}>
                        <InputGroup className="mb-3">
                            <Form.Select
                                onChange={handleSelectType}
                                className="adminFont"
                                value={fastening.type}
                            >
                                <option className="adminFont" value={"Скоба"}>Скоба</option>
                                <option className="adminFont" value={"Пружина"}>Пружина</option>
                                {/*<option className="adminFont" value={"Тверде"}>Тверде</option>*/}

                            </Form.Select>
                        </InputGroup>
                        {fastening.type === "Пружина" ? (
                            <div>
                                {/*<InputGroup className="mb-3">*/}
                                {/*    <Form.Select*/}
                                {/*        onChange={handleSelectMaterial}*/}
                                {/*        className="adminFont"*/}
                                {/*        value={fastening.material}*/}
                                {/*    >*/}
                                {/*        <option className="adminFont" value={"пластик"}>пластик</option>*/}
                                {/*        <option className="adminFont" value={"металл"}>металл</option>*/}
                                {/*    </Form.Select>*/}
                                {/*</InputGroup>*/}
                            </div>
                        ) : (
                            <div>

                            </div>
                        )}
                        <InputGroup className="mb-3">
                            <Form.Select
                                onChange={handleSelectSide}
                                className="adminFont"
                                value={fastening.side}
                            >
                                <option className="adminFont" value={"Альбомно"}>Альбомно</option>
                                <option className="adminFont" value={"Книжково"}>Книжково</option>
                            </Form.Select>
                        </InputGroup>
                    </Card.Text>
                </Card.Body>
            </Card>
        </>
    );
};

export default Fastening;