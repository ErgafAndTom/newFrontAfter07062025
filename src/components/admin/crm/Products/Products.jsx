import CardProduct from "./CardProduct";
import React, {useEffect, useState} from "react";
import axios from "axios";
import Loader from "../../../calc/Loader";
import CrmHeader from "../CrmHeader";
import {MDBContainer} from "mdb-react-ui-kit";
import ProductModalAdd from "./ProductModalAdd";
import {Col, Row} from "react-bootstrap";
import Loader2 from "../../../calc/Loader2";


function Products({name}) {
    const [data, setData] = useState(null);
    const [data1, setData1] = useState(null);
    const [typeSelect, setTypeSelect] = useState("");


    useEffect(() => {
        let dataToSend = {
            method: "getAll",
            search: typeSelect
        }
        axios.post(`admin/api/products`, dataToSend)
            .then(response => {
                console.log(response.data);
                setData(response.data)
            })
            .catch(error => {
                console.log(error.message);
            })
    }, [typeSelect]);

    useEffect(() => {
        let data = {
            name: "Склад",
            inPageCount: 99999,
            currentPage: 1,
            search: ""
        }
        axios.post(`admin/gettable`, data)
            .then(response => {
                console.log(response.data);
                setData1(response.data)
            })
            .catch(error => {
                console.log(error.message);
            })
    }, [data]);

    if(data){
        return (
            <>
                <CrmHeader whoPick={name} data={data} typeSelect={typeSelect} setTypeSelect={setTypeSelect}/>
                <MDBContainer fluid className="">
                    <Row xs={1} md={4} className="g-4">
                        <ProductModalAdd
                            namem={name}
                            data={data}
                            data1={data1}
                            setData={setData}
                            className="adminFont"
                        />
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
            <Loader2/>
        </h1>
    );
}

export default Products;