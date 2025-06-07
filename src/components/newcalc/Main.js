import React, {useEffect, useState} from "react";
import {Accordion, Col, Row} from "react-bootstrap";
import {MDBContainer} from "mdb-react-ui-kit";
import Card from "react-bootstrap/Card";
import {Link} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import BodymovinAnimation from "../calc/main/BodymovinAnimation";
import bigA from "../calc/main/BIGprint/big_print.json";
import big from "../calc/main/BIGprint/BIG_print_1.svg";
import colorA from "../calc/main/colorprint/color_print.json";
import color from "../calc/main/colorprint/color_print_1.svg";
import photoA from "../calc/main/photoprint/photo_print.json";
import photo from "../calc/main/photoprint/photo_print_1.svg";
import postA from "../calc/main/postpress/post_press.json";
import post from "../calc/main/postpress/post_press_1.svg";
import post2 from "./R.png";
import cupA from "../calc/main/cupprint/cup_print.json";
import cup from "../calc/main/cupprint/cup_print_1.svg";
import cup2 from "./product-photo-1611880011919.png";

const Main = () => {
    const dispatch = useDispatch();
    const prices2 = useSelector(state => state.prices.prices2);

    return (
        <>
            <div className="d-flex">
                <MDBContainer fluid className="">
                    <Row xs={1} md={3} className="g-2">
                        {/*<Col>*/}
                        {/*    <Link to="/Products/Sheet" className="colorBlack">*/}
                        {/*        <Card>*/}
                        {/*            <Card.Body>*/}
                        {/*                <Card.Title>Друк аркушів</Card.Title>*/}
                        {/*                <Card.Text>*/}
                        {/*                    Відвантаження в друкованих аркушах без порізки. (наявні листи) А4, А3. З-поміж післядрукарських послуг доступна тільки ламінація.*/}
                        {/*                </Card.Text>*/}
                        {/*            </Card.Body>*/}
                        {/*        </Card>*/}
                        {/*    </Link>*/}
                        {/*</Col>*/}
                        <Col>
                            <Link to="/Products/Sheetcut" className="colorBlack">
                                <div
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
                                            Візитки, флаєри, листівки та інша односторінкова продукція з прямокутною
                                            порізкою. Доступні всі післядрукарські послуги крім плотерної порізки і
                                            зшивання.
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                        {/*<Col>*/}
                        {/*    <Link to="/Products/Sticker" className="colorBlack">*/}
                        {/*        <Card>*/}
                        {/*            <Card.Body>*/}
                        {/*                <Card.Title>Фігурні вироби</Card.Title>*/}
                        {/*                <Card.Text>*/}
                        {/*                    Наклейки*/}
                        {/*                </Card.Text>*/}
                        {/*            </Card.Body>*/}
                        {/*        </Card>*/}
                        {/*    </Link>*/}
                        {/*</Col>*/}
                        <Col>
                            <Link to="/Products/Wide" className="colorBlack">
                                <div
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
                            </Link>
                        </Col>
                        <Col>
                            <Link to="/Products/Photo" className="colorBlack">
                                <div
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
                            </Link>
                        </Col>
                        <Col>
                            <Link to="/Products/Note" className="colorBlack">
                                <div
                                    // onClick={addPost}
                                    style={{opacity: "99%", zIndex: 2}}
                                    className="cursorPointer gif postPrintContainer card-img-top-hover">
                                    {/*<BodymovinAnimation animationData={postA} className="card-img-top anim"/>*/}
                                    {/*<img src={post2} className="card-img-top noanim" alt="..."/>*/}
                                    <img src={post2}
                                         // style={{width: "15vw", margin: "auto"}}
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
                            </Link>
                        </Col>
                        <Col>
                            <Link to="/Products/Plotter" className="colorBlack">
                                <div
                                    // onClick={addCup}
                                    style={{opacity: "99%", zIndex: 2}}
                                    className="cursorPointer gif cupPrintContainer card-img-top-hover">
                                    {/*<BodymovinAnimation animationData={cupA} className="card-img-top anim"/>*/}
                                    <img src={cup2}
                                         // style={{width: "15vw", margin: "auto"}}
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
                            </Link>
                        </Col>
                        <Col>
                            <Link to="/Products/Plotter" className="colorBlack">
                                <Card style={{opacity: "1%", zIndex: 1}}>
                                    <Card.Body>
                                        <Card.Title>Плоттер</Card.Title>
                                        <Card.Text>


                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                    </Row>
                </MDBContainer>

                {/*<View/>*/}
            </div>
        </>
    )
};

export default Main;