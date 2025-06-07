import React, {useEffect, useState} from 'react';
import {Spinner} from "react-bootstrap";
import axios from "./api/axiosInstance";
import {useNavigate} from "react-router-dom";

const LoadingErrorComponent = () => {
    const [data, setData] = useState([]);
    const [load, setLoad] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    let func = (e) => {

    }
    useEffect(() => {
        let data = {
            name: "MaterialsPrices",
            inPageCount: 999999,
        }
        setLoad(true)
        setError(null)
        axios.post(`/materials/NotAll`, data)
            .then(response => {
                console.log(response.data);
                setData(response.data.rows)
                setLoad(false)
            })
            .catch(error => {
                setLoad(false)
                setError(error.message)
                if(error.response.status === 403){
                    navigate('/login');
                }
                console.log(error.message);
            })
    }, []);
    return (
        <div>
            {data.map((item, index) => (
                <div
                    className={item === "" ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}
                    key={index}
                    onClick={() => func(item)}
                    style={{
                        backgroundColor: item === "" ? 'orange' : 'transparent',
                        border: item === "" ? '0.13vw solid transparent' : '0.13vw solid transparent',
                    }}
                >
                    <div className="" style={{
                        height: "100%",
                        opacity: item === "" ? '100%' : '70%',
                        whiteSpace: "nowrap",
                    }}>
                        {item}
                    </div>
                </div>
            ))}
            {load && (
                <Spinner animation="border" variant="danger" size="sm" />
            )}
            {error && (
                <div>{error}</div>
            )}
        </div>
    )
};

export default LoadingErrorComponent;