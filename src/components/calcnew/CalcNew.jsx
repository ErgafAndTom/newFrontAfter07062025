import React, {useEffect, useState} from "react";
import axios from "axios";
import {MDBContainer} from "mdb-react-ui-kit";
import {Col, Row} from "react-bootstrap";
import CrmHeader from "../admin/crm/CrmHeader";
import Loader from "../calc/Loader";
import CardProduct from "../admin/crm/Products/CardProduct";


function CalcNew({name}) {
    const [data, setData] = useState(null);


    useEffect(() => {
        let dataToSend = {
            method: "getAll"
        }
        axios.post(`admin/api/products`, dataToSend)
            .then(response => {
                // console.log(response.data);
                setData(response.data)
            })
            .catch(error => {
                console.log(error.message);
            })
    }, []);

    if(data){
        return (
            <>
                {/*<CrmHeader whoPick={name} data={data}/>*/}
                <MDBContainer fluid className="">
                    <Row xs={1} md={4} className="g-4">
                        {data.rows.map((item, idx) => (
                            <Col key={idx}>
                                <CardProduct key={item.id} name={name} data={data} setData={setData} item={item}/>
                            </Col>
                        ))}
                    </Row>
                    {/*{data.rows.map((item) => (*/}
                    {/*"proxy": "http://127.0.0.1:3000",*/}
                    {/*    <CardProduct key={item.id} name={name} data={data} setData={setData} item={item}/>*/}
                    {/*))}*/}
                </MDBContainer>
            </>
        )
    }
    return (
        <h1 className="">
            <CrmHeader whoPick={name} data={{count: "(Завантаження)"}}/>
            <Loader/>
        </h1>
    );
}

export default CalcNew;
