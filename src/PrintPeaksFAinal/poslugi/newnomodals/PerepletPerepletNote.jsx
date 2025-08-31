import React, {useEffect, useState} from "react";
import axios from '../../../api/axiosInstance';
import {useNavigate} from "react-router-dom";
import skoba from './skoba.svg';
import plastick from './plastick.svg';
import metall from './metall.svg';
import diplom from './diplom.svg';
import './CornerRounding.css';
import './ArtemStyles.css';
import './PerepletSize';
import NewWide from "../newWide";



const PerepletPereplet = ({pereplet, setPereplet, prices, buttonsArr, selectArr, size, setCount, type, defaultt}) => {
    const [thisPerepletVariants, setThisPerepletVariants] = useState([]);
    const navigate = useNavigate();


    let handleClickSize = (e, e2) => {
        setPereplet({
            type: pereplet.type,
            material: pereplet.material,
            materialId: pereplet.materialId,
            size: e2,
            typeUse: e
        })
    }
    let handleClickType = (e) => {
        setPereplet({
            type: e,
            material: e.name,
            materialId: e.id,
            size: pereplet.size,
            typeUse: pereplet.typeUse
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
            material: {
                type: "Pereplet",
                material: pereplet.material,
                materialId: pereplet.materialId,
                thickness: pereplet.size,
                size: size,
            },
            size: size,
            pereplet: pereplet
        }
        axios.post(`/materials/NotAll`, data)
            .then(response => {
                setThisPerepletVariants(response.data.rows);
                // console.log(response.data.rows[2]);
                if (response.data.rows[2]) {
                    setPereplet({
                        ...pereplet,
                        material: response.data.rows[2].name,
                        materialId: response.data.rows[2].id
                    });
                }

            })
            .catch(error => {
                if (error.response.status === 403) {
                    navigate('/login');
                }
                console.log(error.message);
            })
    },
        [pereplet.size, pereplet.typeUse, size]);

    return (
        <div className="d-flex allArtemElem">


            <div style={{ marginTop: "1vw",marginLeft: "-2.1vw"}}>

                <div className="d-flex flex-column">

                    {pereplet.type !== "Не потрібно" ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: "column",
                            // justifyContent: 'center',
                            // alignItems: 'center',
                        }} className="m-0 p-0">
                            <div className="m-0 p-0" style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                // marginLeft: "2vw",
                            }}>


                            </div>
                            <div className="d-flex">
                                {thisPerepletVariants.map((item, index) => (<button
                                    className={item.id === pereplet.materialId ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}
                                    key={index}
                                    onClick={() => handleClickType(item)}
                                >
                                    <>
                                        {item.name === "На пружину".toLowerCase() &&
                                            <div className="d-flex flex-column align-content-center align-items-center" style={{
                                                height: "100%",
                                                opacity: item === pereplet.size ? '100%' : '90%',
                                                whiteSpace: "nowrap",
                                            }}>
                                                {item.name === "На скобу".toLowerCase() &&
                                                    <img src={skoba} alt="На скобу" style={{diheight: "5vw"}}/>
                                                }
                                                {item.name === "На пластик".toLowerCase() &&
                                                    <img src={plastick} alt="На пластик" style={{height: "5vw"}}/>
                                                }
                                                {item.name === "На пружину".toLowerCase() &&
                                                    <img src={metall} alt="На пружину" style={{height: "5vw"}}/>
                                                }

                                                {item.name}
                                            </div>
                                        }
                                        {item.name === "На пластик".toLowerCase() &&
                                            <div className="d-flex flex-column align-content-center align-items-center" style={{
                                                height: "100%",
                                                opacity: item === pereplet.size ? '100%' : '90%',
                                                whiteSpace: "nowrap",
                                            }}>
                                                {item.name === "На скобу".toLowerCase() &&
                                                    <img src={skoba} alt="На скобу" style={{diheight: "5vw"}}/>
                                                }
                                                {item.name === "На пластик".toLowerCase() &&
                                                    <img src={plastick} alt="На пластик" style={{height: "5vw"}}/>
                                                }
                                                {item.name === "На пружину".toLowerCase() &&
                                                    <img src={metall} alt="На пружину" style={{height: "5vw"}}/>
                                                }

                                                {item.name}
                                            </div>
                                        }
                                    </>
                                </button>))}

                            </div>

                        </div>) : (<div>

                    </div>)}
                </div>
            </div>
        </div>


    )
};

export default PerepletPereplet;
