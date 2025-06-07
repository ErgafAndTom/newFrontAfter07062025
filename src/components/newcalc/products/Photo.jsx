import {MDBContainer} from "mdb-react-ui-kit";
import {Col, Row} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import React, {useEffect, useState} from "react";
import axios from "axios";
import Loader from "../../calc/Loader";
import Form from "react-bootstrap/Form";

const Photo = ({thisOrder, newThisOrder, setNewThisOrder, selectedThings2, setShow}) => {
    // const [show, setShow] = useState(false);
    const [size, setSize] = useState({
        x: 297,
        y: 420
    });
    const [material, setMaterial] = useState({
        type: "",
        material: "10х15"
    });
    const [color, setColor] = useState({
        sides: "без друку",
        one: "",
        two: "",
        allSidesColor: "",
    });
    const [lamination, setLamination] = useState({
        type: "Не потрібно",
        material: "",
    });
    const [big, setBig] = useState("Не потрібно");
    const [cute, setCute] = useState("Не потрібно");
    const [holes, setHoles] = useState("Не потрібно");
    const [count, setCount] = useState(1);
    const [prices, setPrices] = useState(null);
    const [pricesThis, setPricesThis] = useState(null);

    const handleThingClickAndHide = e => {
        let newThisOrderToSend = thisOrder
        let thing = {
            name: "Фото",
            amount: count,
            newField2: size.x,
            newField3: size.y,
            priceForThis: pricesThis.price,
            priceForOneThis: pricesThis.price / count
        }
        newThisOrderToSend.orderunits = [...selectedThings2, {...thing, orderunitunits: []}]
        setNewThisOrder(newThisOrderToSend)
        setShow(false)
    }

    const handleSelectBig = e => {
        setBig(e.target.value);
    }
    const handleSelectCute = e => {
        setCute(e.target.value);
    }
    const handleSelectHoles = e => {
        setHoles(e.target.value);
    }
    const handleSelectPhoto = e => {
        setMaterial({
            type: "",
            material: e.target.value
        });
    }
    const handleCount = e => {
        if(parseInt(e.target.value) < 1){
            setCount(1);
        } else {
            setCount(parseInt(e.target.value));
        }
    }

    useEffect(() => {
        axios.get(`/getpricesNew`)
            .then(response => {
                console.log(response.data);
                setPrices(response.data)
            })
            .catch(error => {
                console.log(error.message);
            })
    }, []);

    useEffect(() => {
        let dataToSend = {
            type: "Photo",
            size: size,
            material: material,
            color: color,
            lamination: lamination,
            big: big,
            cute: cute,
            holes: holes,
            count: count,
        }
        axios.post(`/api/pricing`, dataToSend)
            .then(response => {
                console.log(response.data);
                setPricesThis(response.data)
            })
            .catch(error => {
                console.log(error.message);
            })
    }, [size, material, color, lamination, big, cute, holes, count]);

    if(prices){
        return (
            <div className="d-flex flex-column">
                <div>
                    <div className="adminFont m-auto text-center fontProductName">Фотографії</div>
                </div>
                <div className="d-flex flex-column">
                    <MDBContainer fluid style={{width: '95vw'}}>
                        <Row xs={1} md={6} className="">
                            <Col>
                                <Card className="colorCards">
                                    <Card.Body>
                                        <Card.Title className="adminFont2 m-auto text-center">Формат</Card.Title>
                                        <Card.Text className="adminFont" style={{background: "#fff" , borderRadius: "0.4vw", marginTop: '1vw'  }}>
                                            <Form.Select
                                                aria-label="Default select example"
                                                onChange={handleSelectPhoto}
                                                className="adminFont"
                                                value={material.material}
                                            >
                                                {prices[9].variants.map((item, iter) => (
                                                    <option
                                                        key={item[0]}
                                                        className="adminFont"
                                                        value={item[0]}
                                                    >
                                                        {item[0]}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col>
                                <Card className="colorCards">
                                    <Card.Body>
                                        <Card.Title className="adminFont2 m-auto text-center">Кількість</Card.Title>
                                        <Card.Text className="adminFont" style={{background: "#fff" , borderRadius: "0.4vw", marginTop: '1vw'  }}>
                                            <div className="adminFont">

                                            </div>
                                            <Form.Control
                                                type="number"
                                                value={count}
                                                min={1}
                                                // onChange={(event) => setCount(event.target.value)}
                                                onChange={handleCount}
                                            />
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </MDBContainer>
                    {null === pricesThis ? (
                        <div style={{width: '50vw'}}>

                        </div>
                    ) : (
                        <div style={{width: '95vw'}} className="m-auto">
                            <div className="adminFont fontInfoForPricing">
                                {pricesThis.onePhotoPrice}грн. * {pricesThis.skolko}шт.
                                = {pricesThis.price}грн. - Ціна за фото
                            </div>
                            <div className="adminFont fontInfoForPricing1">
                                Ціна за все {pricesThis.price}грн.
                            </div>


                            {/*<ChartComponent aapl={pricesThis}/>*/}
                            {/*<NewChartMy data={pricesThis}/>*/}
                            {/*<NewChartMy2 data={pricesThis}/>*/}
                            {/*<Gravity data={pricesThis}/>*/}
                        </div>
                    )}
                </div>
                {thisOrder && (
                    <div className="btn btn-light" onClick={handleThingClickAndHide}>
                        ДОДАТИ ДО ЗАМОВЛЕННЯ
                    </div>
                )}
            </div>
        )
    }

    return (
        <div>
            <Loader/>
        </div>
    )
};

export default Photo;