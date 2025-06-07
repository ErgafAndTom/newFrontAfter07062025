import {Modal} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import React, {useState} from "react";
import Button from "react-bootstrap/Button";

const ModalMaterial = ({material, setMaterial, prices}) => {
    const [show, setShow] = useState(false);
    const [mat1, setMat1] = useState(material.type);
    const [mat2, setMat2] = useState(material.material);

    // console.log(prices[0]);
    const handleClose = () => {
        setShow(false);
    }
    const handleShow = () => {
        setShow(true);
    }

    let handleClick = (e) => {
        setMat1(e.target.getAttribute("toClick"))
    }

    let handleClick2 = (e) => {
        setMat2(e.target.getAttribute("toClick"))
    }

    let save = (e) => {
        setMaterial({
            type: mat1,
            material: mat2
        })
        setShow(false);
    }

    return (
        <>
            <Card onClick={handleShow}>
                <Card.Body>
                    <Card.Title className="adminFont">Тип матеріалу</Card.Title>
                    <Card.Text className="adminFont">
                        {material.type} {material.material}
                    </Card.Text>
                </Card.Body>
            </Card>

            <Modal show={show} dialogclassName="modal-60w"
                    onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Тип матеріалу</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex">
                    {/*<div style={{width: '24.5vw', height: '30vh', overflow: 'auto', border: '1px solid #ccc'}} className="m-3">*/}
                    {/*    <div style={{padding: '10px'}}>*/}
                    {/*        {materialsTypesData.map((item, iter) => (*/}
                    {/*            <div*/}
                    {/*                key={item}*/}
                    {/*                toclick={item}*/}
                    {/*                className={item.toString() === mat1 ? 'bg-info' : ''}*/}
                    {/*                onClick={handleClick}*/}
                    {/*            >*/}
                    {/*                {item}*/}
                    {/*            </div>*/}
                    {/*        ))}*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    <div style={{width: '24.5vw', height: '30vh', overflow: 'auto', border: '1px solid #ccc'}} className="m-3">
                        <div style={{padding: '10px'}}>
                            {prices[1].variants.map((item, iter) => (
                                <div
                                    key={item[0]}
                                    toclick={item[0]}
                                    className={item[0].toString() === mat2 ? 'bg-info' : ''}
                                    onClick={handleClick2}
                                >
                                    {item[0]}
                                </div>
                            ))}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Закрити
                    </Button>
                    <Button variant="success" onClick={save}>
                        Застосувати
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ModalMaterial;