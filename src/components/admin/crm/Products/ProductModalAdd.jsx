import React, { useState } from 'react';
import Card from "react-bootstrap/Card";
import Offcanvas from "react-bootstrap/Offcanvas";
import Form from "react-bootstrap/Form";
import {Button, Col, Modal} from "react-bootstrap";
import axios from "axios";
import SearchForm from "../SearchForm";
import CardProduct from "./CardProduct";

function ProductModalAdd({namem, data, setData, data1}) {
    const [show, setShow] = useState(false);
    const [forms, setForms] = useState([]);
    const [productName, setProductName] = useState("");
    const [x, setX] = useState("");
    const [y, setY] = useState("");
    const [canDo, setCanDo] = useState(false);
    const [load, setLoad] = useState(false);
    const [type, setType] = useState("");
    console.log(data1);
    const handleClose = () => {
        setShow(false);
    }
    const handleShow = () => setShow(true);

    // Додати нову форму з двома текстовими полями та одним полем типу "checkbox"
    const addForm = () => {
        setForms([...forms, { unitName: '', unitQuantity: '', idInStorageUnit: '', newField1: '', x: '', y: '', xInStorage: '', yInStorage: '' }]);
    };

    // Оновити значення текстових полів
    const handleTextChange = (formIndex, fieldName, event, isCheckbox, elemData) => {
        const updatedForms = [...forms];
        if(isCheckbox){
            updatedForms[formIndex][fieldName] = !updatedForms[formIndex][fieldName]
        } else {
            updatedForms[formIndex][fieldName] = event.target.value;
        }
        // Update "idInStorageUnit" based on the "id" from the event.target
        if(fieldName === 'unitName'){
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
            method: "addNew",
            productName: productName,
            newField1: canDo,
            x: x,
            y: y,
            productUnits: forms,
            type: type
        }
        console.log(dataToSend);

        setLoad(true)
        axios.post(`admin/api/products`, dataToSend)
            .then(response => {
                console.log(response.data);
                setData(response.data)
                setLoad(false)
                handleClose()
            })
            .catch(error => {
                console.log(error.message);
            })
    };

    return (
        <div>
            <Card onClick={handleShow} style={{ width: '18rem' }}>
                <Card.Body>
                    <Card.Title className="adminFont">+</Card.Title>
                </Card.Body>
            </Card>

            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Новий товар</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div>
                        <div className="d-flex">
                            <Form.Control
                                type="text"
                                placeholder="Назва товару"
                                value={productName}
                                className=""
                                onChange={(event) => setProductName(event.target.value)}
                            />
                            <Form.Control
                                type="number"
                                placeholder="x"
                                value={x}
                                className=""
                                onChange={(event) => setX(event.target.value)}
                            />
                            <Form.Control
                                type="number"
                                placeholder="y"
                                value={y}
                                className=""
                                onChange={(event) => setY(event.target.value)}
                            />
                            <Form.Check
                                type="checkbox"
                                checked={canDo}
                                className="adminFont"
                                onChange={(event) => setCanDo(!canDo)}
                            />
                            <Form.Control
                                type="text"
                                placeholder="type"
                                className="adminFont"
                                onChange={(event) => setType(event.target.value)}
                            />
                            <Form.Text className="adminFont text-muted">
                                Можливість на кассі щось змінити
                            </Form.Text>
                        </div>
                        <div>
                            Зіставні елементи:
                        </div>
                        <Form onSubmit={handleSubmit}>
                            {forms.map((form, formIndex) => (
                                <div key={formIndex} className="adminFont border-1 border-warning border p-2 m-2">
                                    {formIndex + 1}
                                    <Form.Group className="d-flex">
                                        <Form.Label className="adminFont">Кількість</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            min={1}
                                            value={form.unitQuantity}
                                            className="adminFont"
                                            onChange={(event) => handleTextChange(formIndex, 'unitQuantity', event)}
                                        />
                                    </Form.Group>
                                    <Form.Group className="d-flex">
                                        <Form.Label className="adminFont">Найменування хуйні:</Form.Label>
                                        <Form.Select
                                            value={form.unitName}
                                            className="adminFont"
                                            onChange={(event) => handleTextChange(formIndex, 'unitName', event)}
                                        >
                                            {data1.rows.map((item, idx) => (
                                                <option className="adminFont d-flex" idInStorage={item.id} xInStorage={item.x} yInStorage={item.y} key={item.id}>
                                                    {item.name}
                                                    {/*<span>*/}
                                                    {/*    {item.price1},{item.price2},{item.price3},{item.price4},{item.price5}*/}
                                                    {/*</span>*/}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {/*<Form.Text className="adminFont text-muted">*/}
                                        {/*    Тип матеріала/роботи що буде витрачено/зроблено при виготовленні*/}
                                        {/*</Form.Text>*/}
                                    </Form.Group>

                                    <div>
                                        <Button type="button" className="adminFont" variant="outline-danger"
                                                onClick={() => deleteForm(formIndex)}>Видалити</Button>
                                    </div>
                                </div>
                            ))}
                        </Form>
                        <Button type="button" className="adminFont" variant="outline-success" onClick={addForm}>
                            Додати елемент
                        </Button>
                    </div>
                    <div>
                        <Button type="submit" className="adminFont" variant="success" onClick={(event) => handleSubmit(event)}>Відправити</Button>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    );
}

export default ProductModalAdd;