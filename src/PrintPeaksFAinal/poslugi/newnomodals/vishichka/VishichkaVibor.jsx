import React, {useEffect, useState} from "react";
import axios from '../../../../api/axiosInstance';
import {useNavigate} from "react-router-dom";
import nashichka from './nashichka.svg';
import porizka from './porizka.svg';
import porizkaOkremimi from './porizkaOkremimi.svg';
import './VishichkaVibor.css';


const iconArray = [
    nashichka,
    porizka,
    porizkaOkremimi,
];

const VishichkaVibor = ({vishichka, setVishichka, prices, buttonsArr, selectArr, size}) => {
    const [thisVishichka, setThisVishichka] = useState([]);
    const navigate = useNavigate();


    let handleClickType = (e) => {
        setVishichka({
            type: vishichka.type,
            material: e.name,
            materialId: e.id,
            size: vishichka.size
        })
    }

    useEffect(() => {
        let data = {
            name: "MaterialsPrices",
            inPageCount: 999999,
            currentPage: 1,
            search: "",
            columnName: {
                column: "id",
                reverse: false
            },
            material: {type: "Vishichka"},
        }
        axios.post(`/materials/NotAll`, data)
            .then(response => {
                // console.log(response.data);
                setThisVishichka(response.data.rows)
                if(response.data && response.data.rows && response.data.rows[0]){
                    setVishichka({
                        ...vishichka,
                        material: response.data.rows[0].name,
                        materialId: response.data.rows[0].id,
                    })
                }
            })
            .catch(error => {
                if (error.response.status === 403) {
                    navigate('/login');
                }
                console.log(error.message);
            })
    }, []);

    return (
        <div className="d-flex allArtemElem" style={{marginTop:"2vh", justifyContent: 'center'}} >
            <div >

                <div className="d-flex flex-column">

                    {vishichka.type !== "Не потрібно" ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: "column",
                            // justifyContent: 'center',
                            // alignItems: 'center',
                        }} >

                            <div className="d-flex  ">
                                {thisVishichka.map((item, index) => (
                                    <button
                                        key={item.id}
                                        className={item.id === vishichka.materialId ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem buttonsArtemNotActive'}
                                        onClick={() => handleClickType(item)}
                                    >
                                        <div className="d-flex flex-column" style={{
                                            // width: "10vw",
                                            height: "100%",
                                            opacity: item.id === vishichka.materialId ? '100%' : '50%',
                                            whiteSpace: "nowrap",
                                            borderRadius:"1vw"
                                        }}>
                                            <img src={iconArray[index]}  style={{height: "9vw", marginBottom: "1vw", borderRadius: "1vw"}}/>
                                            {item.name}
                                        </div>
                                    </button>
                                ))}

                            </div>
                        </div>) : (<div>

                    </div>)}
                </div>
            </div>
        </div>
    )
};

export default VishichkaVibor;
