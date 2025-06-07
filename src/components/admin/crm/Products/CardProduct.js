import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import React, {useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import axios from "axios";
import {Modal} from "react-bootstrap";
import InputGroup from 'react-bootstrap/InputGroup';

function CardProduct({name, data, setData, item}) {
    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false);
    }
    const handleShow = () => {
        console.log(item);
        setShow(true);
    }
    const handleSubmit = (event) => {
        let dataToSend = {
            method: "deleteOne",
            id: item.id
        }
        axios.post(`admin/api/products`, dataToSend)
            .then(response => {
                console.log(response.data);
                setData(response.data)
            })
            .catch(error => {
                console.log(error.message);
            })
    };

    // console.log(item);
    return (
        <Card>
            <Card.Body>
                <Card.Title className="adminFont">{item.name}</Card.Title>
                <Card.Text className="adminFont">
                    <div className="d-flex">
                        <Form.Group className="d-flex">
                            <Button variant="outline-dark" disabled className="adminFont">x</Button>
                            <Form.Control
                                type="text"
                                placeholder="x"
                                value={item.newField2}
                                className="adminFontTable"
                                disabled
                            />
                        </Form.Group>
                        <Form.Group className="d-flex">
                            <Button variant="outline-dark" disabled className="adminFont">y</Button>
                            <Form.Control
                                type="text"
                                placeholder="y"
                                value={item.newField3}
                                className="adminFontTable"
                                disabled
                            />
                        </Form.Group>
                        <Form.Group className="d-flex">
                            <Form.Label className="adminFont">Змінне?</Form.Label>
                            {item.newField1 === "1" ? (
                                <Form.Check
                                    type="checkbox"
                                    checked={true}
                                    disabled
                                />
                            ) : (
                                <Form.Check
                                    type="checkbox"
                                    checked={false}
                                    disabled
                                />
                                )}
                            {/*<Form.Text className="adminFont text-muted">*/}
                            {/*    Можливість на кассі щось змінити*/}
                            {/*</Form.Text>*/}
                        </Form.Group>
                    </div>
                    Складається з:
                    {item.productunits.map((unitItem, iter) => (
                        <div key={unitItem.id} className="d-flex adminFontTable border-1">
                            <InputGroup className="adminFontTable">
                                {/*<InputGroup.Text className="adminFontTable">{iter+1}</InputGroup.Text>*/}

                                <div className="d-flex">
                                    <Form.Group className="d-flex">
                                        <Button variant="outline-dark" disabled className="adminFont">Назва</Button>
                                        <Form.Control
                                            type="text"
                                            placeholder="Назва у товарі"
                                            value={unitItem.name}
                                            className="adminFontTable"
                                            disabled
                                        />
                                    </Form.Group>
                                    <Form.Group className="d-flex">
                                        <Button variant="outline-dark" disabled className="adminFont">quantity</Button>
                                        <Form.Control
                                            type="text"
                                            placeholder="Тип"
                                            value={unitItem.quantity}
                                            className="adminFontTable"
                                            disabled
                                        />
                                    </Form.Group>
                                    {/*<Form.Group className="d-flex">*/}
                                    {/*    <Button variant="outline-warning" className="adminFont">x</Button>*/}
                                    {/*    <Form.Control*/}
                                    {/*        type="text"*/}
                                    {/*        placeholder="x"*/}
                                    {/*        value={unitItem.newField2}*/}
                                    {/*        className="adminFontTable"*/}
                                    {/*        disabled*/}
                                    {/*    />*/}
                                    {/*</Form.Group>*/}
                                    {/*<Form.Group className="d-flex">*/}
                                    {/*    <Button variant="outline-warning" className="adminFont">y</Button>*/}
                                    {/*    <Form.Control*/}
                                    {/*        type="text"*/}
                                    {/*        placeholder="y"*/}
                                    {/*        value={unitItem.newField3}*/}
                                    {/*        className="adminFontTable"*/}
                                    {/*        disabled*/}
                                    {/*    />*/}
                                    {/*</Form.Group>*/}
                                </div>
                            </InputGroup>
                        </div>
                    ))}
                </Card.Text>
                <Button variant="danger" onClick={handleShow}  className="adminFont">Видалити</Button>
            </Card.Body>


            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Видалення</Modal.Title>
                </Modal.Header>
                <Modal.Body>Видалити {item.name}?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Закрити
                    </Button>
                    <Button variant="danger" toclick={item.id} onClick={(event) => handleSubmit(event)}>
                        Видалити
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
}

export default CardProduct;