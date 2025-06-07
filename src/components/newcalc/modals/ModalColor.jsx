import {Modal} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import React, {useEffect, useState} from "react";
import Button from "react-bootstrap/Button";

const ModalColor = ({color, setColor}) => {
    const [show, setShow] = useState(false);
    const [col1, setCol1] = useState("без друку");
    const [col2, setCol2] = useState({
        one: "",
        two: ""
    });
    const [col3, setCol3] = useState({
        allSidesColor: "",
    });
    const [colorVal, setColorVal] = useState(false);


    const handleClose = () => {
        setShow(false);
    }
    const handleShow = () => {
        setShow(true);
    }

    let handleClick1 = (e) => {
        setCol1(e.target.getAttribute("toClick"))
    }

    let handleClick2 = (e) => {
        setCol3({
            allSidesColor: e.target.getAttribute("toClick"),
        })
        setColorVal(false)
    }

    // let handleClick3 = (e) => {
    //     setCol2({
    //         one: col2.one,
    //         two: e.target.getAttribute("toClick")
    //     })
    // }

    let save = (e) => {
        if(col1 !== "без друку"){
            if(col3.allSidesColor === ""){
                setColorVal(true)
            } else {
                setColorVal(false)
                setColor({
                    sides: col1,
                    one: col2.one,
                    two: col2.two,
                    allSidesColor: col3.allSidesColor,
                })
                setShow(false);
            }
        } else {
            setColorVal(false)
            setColor({
                sides: col1,
                one: col2.one,
                two: col2.two,
                allSidesColor: col3.allSidesColor,
            })
            setShow(false);
        }
    }

    useEffect(() => {
        if(col1 === "без друку"){
            setCol3({
                allSidesColor: ""
            })
        }
    }, [col1])

    return (
        <>
            <Card onClick={handleShow}>
                <Card.Body>
                    <Card.Title className="adminFont">Кольоровість друку</Card.Title>
                    <Card.Text className="adminFont">
                        {color.sides} {color.allSidesColor}
                    </Card.Text>
                </Card.Body>
            </Card>

            <Modal show={show} onHide={handleClose} dialogclassName="modal-60w">
                <Modal.Header closeButton>
                    <Modal.Title>Кольоровість друку</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex">
                    <div style={{width: '24.5vw', height: '30vh', overflow: 'auto', border: '1px solid #ccc'}} >
                        {/* Много элементов */}
                        <div style={{padding: '10px'}}>
                            <div
                                toclick="односторонній"
                                className={"односторонній" === col1 ? 'bg-info' : ''}
                                onClick={handleClick1}
                            >
                                односторонній
                            </div>
                            <div
                                toclick="двосторонній"
                                className={"двосторонній" === col1 ? 'bg-info' : ''}
                                onClick={handleClick1}
                            >
                                двосторонній
                            </div>
                            <div
                                toclick="без друку"
                                className={"без друку" === col1 ? 'bg-info' : ''}
                                onClick={handleClick1}
                            >
                                без друку
                            </div>
                        </div>
                    </div>
                    {col1 === "односторонній" &&
                        <div style={{width: '24.5vw', height: '30vh', overflow: 'auto', border: '1px solid #ccc'}}
                             className={colorVal === true ? 'm-3 border-danger' : 'm-3'}
                        >
                            {/* Много элементов */}
                            <div style={{padding: '10px'}}>
                                <div
                                    toclick="Чорно-білий"
                                    className={"Чорно-білий" === col3.allSidesColor ? 'bg-info' : ''}
                                    onClick={handleClick2}
                                >
                                    Чорно-білий
                                </div>
                                <div
                                    toclick="CMYK"
                                    className={"CMYK" === col3.allSidesColor ? 'bg-info' : ''}
                                    onClick={handleClick2}
                                >
                                    CMYK
                                </div>
                            </div>
                        </div>
                    }
                    {col1 === "двосторонній" &&
                        <div className="d-flex">
                            <div style={{width: '24.5vw', height: '30vh', overflow: 'auto', border: '1px solid #ccc'}}
                                 className={colorVal === true ? 'm-3 border-danger' : 'm-3'}
                            >
                                <div style={{padding: '10px'}}>
                                    <div
                                        toclick="Чорно-білий"
                                        className={"Чорно-білий" === col3.allSidesColor ? 'bg-info' : ''}
                                        onClick={handleClick2}
                                    >
                                        Чорно-білий
                                    </div>
                                    <div
                                        toclick="CMYK"
                                        className={"CMYK" === col3.allSidesColor ? 'bg-info' : ''}
                                        onClick={handleClick2}
                                    >
                                        CMYK
                                    </div>
                                </div>
                            </div>

                            {/*<div style={{width: '24.5vw', height: '30vh', overflow: 'auto', border: '1px solid #ccc'}} className="m-3">*/}
                            {/*    <div style={{padding: '10px'}}>*/}
                            {/*        <div*/}
                            {/*            toclick="Чорно-білий"*/}
                            {/*            className={"Чорно-білий" === col2.two ? 'bg-info' : ''}*/}
                            {/*            onClick={handleClick3}*/}
                            {/*        >*/}
                            {/*            Чорно-білий*/}
                            {/*        </div>*/}
                            {/*        <div*/}
                            {/*            toclick="CMYK"*/}
                            {/*            className={"CMYK" === col2.two ? 'bg-info' : ''}*/}
                            {/*            onClick={handleClick3}*/}
                            {/*        >*/}
                            {/*            CMYK*/}
                            {/*        </div>*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                        </div>
                    }
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

export default ModalColor;