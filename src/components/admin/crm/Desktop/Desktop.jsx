import React, {useEffect, useState} from 'react';
import axios from "../../../../api/axiosInstance";
import {useNavigate} from "react-router-dom";
import Calendar from "../../../Calendar";
import Statistics from "../../../Statistics";

const Card = ({ title, content }) => {
    return (
        <div className="bg-white p-4 m-2 flex-grow-1" style={{ borderRadius: '10px',  }}>
            <div className="font-bold text-lg mb-2 adminFont">{title}</div>
            <p className="adminFont">{content}</p>
        </div>
    );
};

const Desktop = () => {

    const navigate = useNavigate();
    const [isFocused, setIsFocused] = useState(false);
    // useEffect(() => {
    //     let data = {
    //
    //     }
    //     axios.post(`/materials/NotAll`, data)
    //         .then(response => {
    //             // console.log(response.data);
    //
    //         })
    //         .catch(error => {
    //             if (error.response.status === 403) {
    //                 navigate('/login');
    //             }
    //             console.log(error.message);
    //         })
    // }, []);

    return (
        <div className="d-flex flex-column  p-2 mt-2  flex-grow-1 adminBackGround"
             style={{borderRadius: '1vw', background: '#F2F0E7'}}>
            <div className="d-flex mt-0">
                {/*<input*/}
                {/*    // type={"datetime-local"}*/}
                {/*    // value={"datetime-local"}*/}
                {/*    onFocus={() => setIsFocused(true)}*/}
                {/*    onBlur={(e) => setIsFocused(e.target.value !== '')}*/}
                {/*    style={{*/}
                {/*        padding: '0.5vh',*/}
                {/*        justifyContent: 'center',*/}
                {/*        display: 'flex',*/}
                {/*        alignItems: 'center',*/}
                {/*        fontSize: '0.7vw',*/}
                {/*        width: '52.5%',*/}
                {/*        backgroundColor: isFocused ? 'white' : '#F2F0E7',*/}
                {/*        // position: 'relative',*/}
                {/*        border: 'none',*/}
                {/*        borderRadius: '1vw',*/}
                {/*        zIndex: 0,*/}
                {/*        color: isFocused ? 'black' : '#707070',*/}
                {/*        paddingLeft: '1vw',*/}
                {/*        textAlign: 'center'*/}
                {/*    }}*/}
                {/*/>*/}
                <Calendar/>
                {/*<Card className="mt-0" title="Календар" content={*/}
                {/*    // <Calendar/>*/}
                {/*    ""*/}
                {/*}*/}
                {/*      style={{width: '140%', borderRadius: '10px'}}/>*/}
                {/*<Statistics/>*/}
                {/*<Card className="mt-0" style={{width: '100%', borderRadius: '10px'}}*/}
                {/*      title="список паперу який закінчується" content=""/>*/}
                {/*<Card className="mt-0" style={{width: '100%', borderRadius: '10px'}} title="Замовлення" content=""/>*/}

            </div>
            <div className="d-flex flex-grow-1">
                <Card title="КАРТКИ ТРЕЛО" content=""/>
                <Card title="Оплати" content=""/>
                <Card title="Документи" content=""/>
                {/* ... other cards */}
            </div>
            <div className="d-flex">
                <Card title="Статистика" content=""/>
            </div>
            <div className="d-flex">
                <Card title="Обладнання" content=""/>
            </div>
        </div>
    );
};

export default Desktop;