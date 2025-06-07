import React, {useEffect, useState} from 'react';
import Button from "react-bootstrap/Button";
import {Col, Modal, Row} from "react-bootstrap";
import Loader2 from "../calc/Loader2";
// import OpenAI from 'openai';
import axios from "axios";
import Gravity from "../Gravity";
import DocumentToIframe from "../DocumentToIframe";
import Image from "react-bootstrap/Image";
import whiteSVG from "../whiteSVG.svg";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Note from "../newcalc/products/Note";
import {Link} from "react-router-dom";
import BodymovinAnimation from "../calc/main/BodymovinAnimation";
import colorA from "../calc/main/colorprint/color_print.json";
import color from "../calc/main/colorprint/color_print_1.svg";
import Card from "react-bootstrap/Card";
import bigA from "../calc/main/BIGprint/big_print.json";
import big from "../calc/main/BIGprint/BIG_print_1.svg";
import photoA from "../calc/main/photoprint/photo_print.json";
import photo from "../calc/main/photoprint/photo_print_1.svg";
import post2 from "../newcalc/R.png";
import cup2 from "../newcalc/product-photo-1611880011919.png";
import {MDBContainer} from "mdb-react-ui-kit";
import SheetCut from "../newcalc/products/Wide";
import Photo from "../newcalc/products/Photo";
import Plotter from "../newcalc/products/Plotter";
import Wide from "../newcalc/products/Wide";

function GPTAneki({thisOrder, newThisOrder, selectedThings2, setNewThisOrder}) {
    // const [input, setInput] = useState('Напиши анек або жарт про printing servise українською мовою');
    const [productName, setProductName] = useState('');
    const [show, setShow] = useState(false);
    // const [load, setLoad] = useState(false);
    //
    // const handleInputChange = (event) => {
    //     setInput(event.target.value);
    // };
    //
    // console.log(selectedThings2);
    // console.log(setNewThisOrder);
    const handleClose = () => {
        setShow(false);
        setProductName("")
    }
    const handleShow = (event, productName) => {
        setShow(true);
        setProductName(productName)
    }

    return (
        <div>
            <MDBContainer fluid className="transformInCash">
                <Row xs={1} md={3} className="g-2">
                    <Col>
                        {/*<Link to="/Products/Sheetcut" className="colorBlack">*/}
                            <div
                                // onClick={handleShow}
                                onClick={(event) => handleShow(event, "SheetCut")}
                                // onClick={addDigital}
                                style={{opacity: "99%", zIndex: 2}}
                                className="cursorPointer gif digitalPrintContainer">
                                <BodymovinAnimation animationData={colorA} className="card-img-top anim"/>
                                <img src={color} className="card-img-top noanim" alt="..."/>
                            </div>
                            <Card style={{opacity: "1%", zIndex: 1}}>
                                <Card.Body>
                                    <Card.Title>Друк з порізкою</Card.Title>
                                    <Card.Text>
                                        Візитки, флаєри, листівки та інша односторінкова продукція з
                                        прямокутною
                                        порізкою. Доступні всі післядрукарські послуги крім плотерної
                                        порізки і                                        зшивання.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        {/*</Link>*/}
                    </Col>
                    <Col>
                        {/*<Link to="/Products/Wide" className="colorBlack">*/}
                            <div
                                // onClick={handleShow}
                                onClick={(event) => handleShow(event, "Wide")}
                                // onClick={addWide}
                                style={{opacity: "99%", zIndex: 2}}
                                className="cursorPointer gif widePrintContainer">
                                <BodymovinAnimation animationData={bigA} className="card-img-top anim"/>
                                <img src={big} className="card-img-top noanim" alt="..."/>
                            </div>
                            <Card style={{opacity: "1%", zIndex: 1}}>
                                <Card.Body>
                                    <Card.Title>Широкоформат</Card.Title>
                                    <Card.Text>
                                        Плакати, баннери та ін.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        {/*</Link>*/}
                    </Col>
                    <Col>
                        {/*<Link to="/Products/Photo" className="colorBlack">*/}
                            <div
                                // onClick={handleShow}
                                onClick={(event) => handleShow(event, "Photo")}
                                // onClick={addPhoto}
                                style={{opacity: "99%", zIndex: 2}}
                                className="cursorPointer gif photoPrintContainer">
                                <BodymovinAnimation animationData={photoA} className="card-img-top anim"/>
                                <img src={photo} className="card-img-top noanim" alt="..."/>
                            </div>
                            <Card style={{opacity: "1%", zIndex: 1}}>
                                <Card.Body>
                                    <Card.Title>Фото</Card.Title>
                                    <Card.Text>
                                        Фото на фотопринтері.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        {/*</Link>*/}
                    </Col>
                    <Col>
                        {/*<Link to="/Products/Note" className="colorBlack">*/}
                            <div
                                // onClick={handleShow}
                                onClick={(event) => handleShow(event, "Note")}
                                // onClick={addPost}
                                style={{opacity: "99%", zIndex: 2}}
                                className="cursorPointer gif postPrintContainer card-img-top-hover">
                                {/*<BodymovinAnimation animationData={postA} className="card-img-top anim"/>*/}
                                {/*<img src={post2} className="card-img-top noanim" alt="..."/>*/}
                                <img src={post2}
                                     style={{width: "15vw", margin: "auto"}}
                                     className="card-img-top" alt="..."/>
                            </div>
                            <Card style={{opacity: "1%", zIndex: 1}}>
                                <Card.Body>
                                    <Card.Title>Багатосторінкова продукція</Card.Title>
                                    <Card.Text>
                                        Блокноти / Буклети / Каталоги / Презентації / Комікси / Зіни.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        {/*</Link>*/}
                    </Col>
                    <Col>
                        {/*<Link to="/Products/Plotter" className="colorBlack">*/}
                            <div
                                // onClick={handleShow}
                                onClick={(event) => handleShow(event, "Plotter")}
                                // onClick={addCup}
                                style={{opacity: "99%", zIndex: 2}}
                                className="cursorPointer gif cupPrintContainer card-img-top-hover">
                                {/*<BodymovinAnimation animationData={cupA} className="card-img-top anim"/>*/}
                                <img src={cup2}
                                     style={{width: "15vw", margin: "auto"}}
                                     className="card-img-top" alt="..."/>
                            </div>
                            <Card style={{opacity: "1%", zIndex: 1}}>
                                <Card.Body>
                                    <Card.Title>Друк на чашках</Card.Title>
                                    <Card.Text>
                                        Чаю?
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        {/*</Link>*/}
                    </Col>
                    <Col>
                        {/*<Link to="/Products/Plotter" className="colorBlack">*/}
                            <Card style={{opacity: "1%", zIndex: 1}}>
                                <Card.Body>
                                    <Card.Title>Плоттер</Card.Title>
                                    <Card.Text>

                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        {/*</Link>*/}
                    </Col>
                </Row>
            </MDBContainer>
            {/*<Button variant="" size="sm" className="adminFontTable borderR0" onClick={handleShow}>*/}
            {/*    <Loader2/>*/}
            {/*</Button>*/}

            {show === true ? (
                <div>
                    <div style={{
                        height: '90vh',
                        zIndex: "999",
                        position: "fixed",
                        background: "#dcd9ce",
                        left: "5vw",
                        bottom: "5vh",
                        margin: "auto",
                        width: "90vw"
                    }} className="shadow-lg">
                        {/*<DocumentToIframe/>*/}
                        {productName === "SheetCut" && (
                            <SheetCut
                                productName={productName}
                                thisOrder={thisOrder} newThisOrder={newThisOrder}
                                selectedThings2={selectedThings2}
                                setNewThisOrder={setNewThisOrder}
                                setShow={setShow}
                            />
                        )}
                        {productName === "Wide" && (
                            <Wide
                                productName={productName}
                                thisOrder={thisOrder} newThisOrder={newThisOrder}
                                selectedThings2={selectedThings2}
                                setNewThisOrder={setNewThisOrder}
                                setShow={setShow}
                            />
                        )}
                        {productName === "Photo" && (
                            <Photo
                                productName={productName}
                                thisOrder={thisOrder} newThisOrder={newThisOrder}
                                selectedThings2={selectedThings2}
                                setNewThisOrder={setNewThisOrder}
                                setShow={setShow}
                            />
                        )}
                        {productName === "Plotter" && (
                            <Plotter
                                productName={productName}
                                thisOrder={thisOrder} newThisOrder={newThisOrder}
                                selectedThings2={selectedThings2}
                                setNewThisOrder={setNewThisOrder}
                                setShow={setShow}
                            />
                        )}
                        {productName === "Note" && (
                            <Note
                                productName={productName}
                                thisOrder={thisOrder} newThisOrder={newThisOrder}
                                selectedThings2={selectedThings2}
                                setNewThisOrder={setNewThisOrder}
                                setShow={setShow}
                            />
                        )}
                    </div>
                    <div style={{
                        width: "100vw",
                        zIndex: "1",
                        height: "100vh",
                        background: "black",
                        opacity: "20%",
                        position: "fixed",
                        left: "0",
                        bottom: "0"
                    }} onClick={handleClose}></div>
                </div>
            ) : (
                <div className="d-none"></div>
            )}
        </div>
    );
}

export default GPTAneki;