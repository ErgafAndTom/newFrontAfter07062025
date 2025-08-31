import React, {useEffect, useState} from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import {Col, Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import {MDBContainer} from "mdb-react-ui-kit";

const Test2 = () => {
    const [data, setData] = useState([]);
    const [data1, setData1] = useState([]);
    const [show, setShow] = useState(false);
    const [forms, setForms] = useState([]);
    const [productName, setProductName] = useState("");
    const [x, setX] = useState("");
    const [y, setY] = useState("");
    const [canDo, setCanDo] = useState(false);
    const [load, setLoad] = useState(false);
    const [type, setType] = useState("");
    const [search, setSearch] = useState("");
    const handleClose = () => {
        setShow(false);
    }
    const handleShow = () => setShow(true);

    // Додати нову форму з двома текстовими полями та одним полем типу "checkbox"
    const addForm = () => {
        setForms([...forms, {
            attributeName: '',
            attributeValue: '',
        }]);
    };

    // Оновити значення текстових полів
    const handleTextChange = (formIndex, fieldName, event, isCheckbox, elemData) => {
        const updatedForms = [...forms];
        if (isCheckbox) {
            updatedForms[formIndex][fieldName] = !updatedForms[formIndex][fieldName]
        } else {
            updatedForms[formIndex][fieldName] = event.target.value;
        }
        // Update "idInStorageUnit" based on the "id" from the event.target
        if (fieldName === 'unitName') {
            updatedForms[formIndex]['idInStorageUnit'] = event.target.options[event.target.selectedIndex].getAttribute("idInStorage");
            updatedForms[formIndex]['xInStorage'] = event.target.options[event.target.selectedIndex].getAttribute("xInStorage");
            updatedForms[formIndex]['yInStorage'] = event.target.options[event.target.selectedIndex].getAttribute("yInStorage");
        }
        setForms(updatedForms);
    };

    // Delete form
    const deleteForm = (formIndex) => {
        const updatedForms = [...forms];
        updatedForms.splice(formIndex, 1);
        setForms(updatedForms);
    };

    // Оновити значення поля типу "checkbox"
    const handleCheckboxChange = (formIndex, event) => {
        const updatedForms = [...forms];
        updatedForms[formIndex].checkbox = event.target.checked;
        setForms(updatedForms);
    };

    // Відправити дані форми
    const handleSubmit = (event) => {
        event.preventDefault();
        let dataToSend = {
            crud: "create",
            data: forms,
        }
        // console.log(dataToSend);

        setLoad(true)
        axios.post(`/api/eav`, dataToSend)
            .then(response => {
                // console.log(response.data);
                setData([...data, response.data])
                setLoad(false)
                handleClose()
            })
            .catch(error => {
                console.log(error.message);
            })
    };

    useEffect(() => {
        let dataToSend = {
            crud: "readAll",
        }
        axios.post(`/api/eav`, dataToSend)
            .then(response => {
                // console.log(response.data);
                setData(response.data)
            })
            .catch(error => {
                console.log(error.message);
            })
    }, [search]);

    return (
        <div>
            <Form.Group className="d-flex">
                <Form.Label className="adminFont">AttributeName</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="S"
                    value={search}
                    className="adminFont"
                    onChange={(event) => setSearch(event.target.value)}
                />
            </Form.Group>
            <MDBContainer fluid className="">
                <Row xs={1} md={5} className="g-2">
                    {data.map((item, idx) => (
                        <Col key={item.Entity_ID}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>{item.Entity_ID}</Card.Title>
                                    <Card.Text>
                                        {Object.entries(item.attributeValues).map((item2, idx2) => (
                                            <div className="d-flex" key={item.Entity_ID+idx2}>
                                                <div className="m-1 adminFont">{idx2}</div>
                                                <div className="m-1 adminFont">{item2.attributeName}</div>
                                                <div className="m-1 adminFont"> = </div>
                                                <div className="m-1 adminFont">{item2.attributeValue}</div>
                                            </div>
                                        ))}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </MDBContainer>
            <Card onClick={handleShow} style={{width: '18rem'}}>
                <Card.Body>
                    <Card.Title className="adminFont">+</Card.Title>
                </Card.Body>
            </Card>

            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Новий Щось</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div>
                        <Form onSubmit={handleSubmit}>
                            {forms.map((form, formIndex) => (
                                <div key={formIndex} className="adminFont border-1 border-warning border p-2 m-2">
                                    {formIndex + 1}
                                    <Form.Group className="d-flex">
                                        <Form.Label className="adminFont">AttributeName</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="AttributeName"
                                            value={form.attributeName}
                                            className="adminFont"
                                            onChange={(event) => handleTextChange(formIndex, 'attributeName', event)}
                                        />
                                    </Form.Group>
                                    <Form.Group className="d-flex">
                                        <Form.Label className="adminFont">attributeValue</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="attributeValue"
                                            value={form.attributeValue}
                                            className="adminFont"
                                            onChange={(event) => handleTextChange(formIndex, 'attributeValue', event)}
                                        />
                                    </Form.Group>

                                    <div>
                                        <Button type="button" className="adminFont" variant="outline-danger"
                                                onClick={() => deleteForm(formIndex)}>X</Button>
                                    </div>
                                </div>
                            ))}
                        </Form>
                        <Button type="button" className="adminFont" variant="outline-success" onClick={addForm}>
                            +
                        </Button>
                    </div>
                    <div>
                        <Button type="submit" className="adminFont" variant="success"
                                onClick={(event) => handleSubmit(event)}>Ok</Button>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    );
};

export default Test2;
