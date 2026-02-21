import React, {useEffect, useState} from "react";
import axios from '../../../api/axiosInstance';
import {useNavigate} from "react-router-dom";
import skoba from './skoba.svg';
import plastick from './plastick.svg';
import metall from './metall.svg';
import diplom from './diplom.svg';
import imgg101 from "../../evroscoba.png";
import kalendarbinder from './kalendarbinder.png';
import './CornerRounding.css';
import './ArtemStyles.css';
import './PerepletSize';


const PEREPLET_ORDER = ["на скобу", "на євроскобу", "на пластик", "на пружину", "твердим переплітом", "на календар"];

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
                // console.log(response.data);
                setThisPerepletVariants(response.data.rows)
                if (response.data.rows[2]) {
                    setPereplet({
                        ...pereplet,
                        material: response.data.rows[2].name,
                        materialId: response.data.rows[2].id,
                    })
                }
            })
            .catch(error => {
                if (error?.response?.status === 403) {
                    navigate('/login');
                }
                console.log(error.message);
            })
    }, [pereplet.size, pereplet.typeUse, size]);

    return (
        <div className="d-flex allArtemElem">

            <div style={{width: "100%"}}>

                <div className="d-flex flex-column">

                    {pereplet.type !== "Не потрібно" ? (
                        <div style={{ display: 'flex', flexDirection: "column", gap: "0.5vw" }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <button
                                    className={"Брошурування до 120 аркушів" === pereplet.typeUse ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}
                                    onClick={() => handleClickSize("Брошурування до 120 аркушів", "<120")}
                                >
                                    <div style={{ whiteSpace: "nowrap" }}>Брошурування до 120 аркушів</div>
                                </button>
                                <button
                                    className={"Брошурування від 120 до 280 аркушів" === pereplet.typeUse ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}
                                    onClick={() => handleClickSize("Брошурування від 120 до 280 аркушів", ">120")}
                                >
                                    <div style={{ whiteSpace: "nowrap" }}>Брошурування від 120 до 280 аркушів</div>
                                </button>
                            </div>
                            <div className="d-flex" style={{ flexWrap: "wrap" }}>
                                {[...thisPerepletVariants].sort((a, b) => {
                                    const ia = PEREPLET_ORDER.indexOf(a.name);
                                    const ib = PEREPLET_ORDER.indexOf(b.name);
                                    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
                                }).map((item, index) => (<button
                                    className={item.id === pereplet.materialId ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}
                                    key={index}
                                    onClick={() => handleClickType(item)}
                                >
                                    <div className="d-flex flex-column align-content-center align-items-center" style={{
                                        height: "100%",
                                    }}>
                                        {item.name === "на скобу" &&
                                            <img src={skoba} alt="на скобу" style={{height: "2.5vw"}}/>
                                        }
                                        {item.name === "на пластик" &&
                                            <img src={plastick} alt="на пластик" style={{height: "2.5vw"}}/>
                                        }
                                        {item.name === "на пружину" &&
                                            <img src={metall} alt="на пружину" style={{height: "2.5vw"}}/>
                                        }
                                        {item.name === "твердим переплітом" &&
                                            <img src={diplom} alt="твердим переплітом" style={{height: "2.5vw"}}/>
                                        }
                                        {item.name === "на євроскобу" &&
                                            <img src={imgg101} alt="на євроскобу" style={{height: "2.5vw"}}/>
                                        }
                                        {item.name === "на календар" &&
                                            <img src={kalendarbinder} alt="на календар" style={{height: "2.5vw"}}/>
                                        }
                                    </div>
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
