import {Modal} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import React, {useEffect, useState} from "react";
import Button from "react-bootstrap/Button";

const ModalNotes = ({notes, setNotes, prices, size}) => {
    const [show, setShow] = useState(false);
    const [mat1, setMat1] = useState("Книжна");
    const [mat2, setMat2] = useState("");
    const [mat3, setMat3] = useState("Скоба");
    const [mat4, setMat4] = useState("");
    const [laminationForChoose, setLaminationForChoose] = useState([]);


    const handleClose = () => {
        setShow(false);
    }
    const handleShow = () => {
        setShow(true);
    }

    let handleClick = (e) => {
        // console.log(e);
        setMat1(e.target.getAttribute("toClick"))
    }

    let handleClick3 = (e) => {
        setMat3(e.target.getAttribute("toClick"))
    }

    let handleClick4 = (e) => {
        setMat4(e.target.getAttribute("toClick"))
    }

    let save = (e) => {
        setNotes([mat1, mat3, ""])
        setShow(false);
    }

    useEffect(() => {
        // let lamForChoose = prices[3].variants.map((item, iter) => {
        //     if (item) {
        //         return item
        //     }
        // })
        // setLaminationForChoose(lamForChoose)
    }, [size]);

    return (
        <>
            <Card onClick={handleShow}>
                <Card.Body>
                    <Card.Title className="adminFont">Переплетnb</Card.Title>
                    <Card.Text className="adminFont">
                        {notes[0]} {notes[1]} {notes[2]} {notes[3]} {notes[4]} {notes[5]}
                    </Card.Text>
                </Card.Body>
            </Card>

            <Modal show={show} onHide={handleClose} dialogclassName="modal-90w">
                <Modal.Header closeButton>
                    <Modal.Title>Переплет</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex">
                    <div style={{width: '20.5vw', height: '30vh', overflow: 'auto', border: '1px solid #ccc'}}>
                        {/* Много элементов */}
                        <div style={{padding: '10px'}}>
                            <div
                                toclick={"Альбомна"}
                                className={"Альбомна" === mat1 ? 'bg-info' : ''}
                                onClick={handleClick}
                            >
                                {"Альбомна"}
                            </div>
                            <div
                                toclick={"Книжна"}
                                className={"Книжна" === mat1 ? 'bg-info' : ''}
                                onClick={handleClick}
                            >
                                {"Книжна"}
                            </div>
                        </div>
                    </div>

                    <div style={{width: '20.5vw', height: '30vh', overflow: 'auto', border: '1px solid #ccc'}}>
                        <div style={{padding: '10px'}}>
                            <div
                                toclick={"Пружина"}
                                className={"Пружина" === mat4 ? 'bg-info' : ''}
                                onClick={handleClick4}
                            >
                                {"Пружина"}
                            </div>
                            <div
                                toclick={"Скоба"}
                                className={"Скоба" === mat4 ? 'bg-info' : ''}
                                onClick={handleClick4}
                            >
                                {"Скоба"}
                            </div>
                        </div>
                    </div>

                    <div style={{width: '20.5vw', height: '30vh', overflow: 'auto', border: '1px solid #ccc'}}>
                        {/* Много элементов */}
                        <div style={{padding: '10px'}}>
                            {/*{prices[3].variants.map((item, iter) => (*/}
                            {/*    <div*/}
                            {/*        key={item}*/}
                            {/*        toclick={item}*/}
                            {/*        className={item.toString() === mat3 ? 'bg-info' : ''}*/}
                            {/*        onClick={handleClick3}*/}
                            {/*    >*/}
                            {/*        {item}*/}
                            {/*    </div>*/}
                            {/*))}*/}
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

export default ModalNotes;
