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
                if (error?.response?.status === 403) {
                    navigate('/login');
                }
                console.log(error.message);
            })
    },
        [pereplet.size, pereplet.typeUse, size]);

    const imageMap = {
        "на пластик": { src: plastick, alt: "На пластик" },
        "на пружину": { src: metall, alt: "На пружину" },
    };

    const displayVariants = thisPerepletVariants.filter(
        (item) => imageMap[item.name?.toLowerCase()]
    );

    return (
        <div className="d-flex allArtemElem">
            {pereplet.type !== "Не потрібно" && displayVariants.length > 0 && (
                <div className="d-flex">
                    {displayVariants.map((item, index) => {
                        const img = imageMap[item.name?.toLowerCase()];
                        return (
                            <button
                                className={item.id === pereplet.materialId ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}
                                key={index}
                                onClick={() => handleClickType(item)}
                                style={{ padding: "0.8vh 1vw" }}
                            >
                                <div className="d-flex flex-column align-items-center" style={{ whiteSpace: "nowrap" }}>
                                    <img src={img.src} alt={img.alt} style={{ height: "7vh", marginBottom: "0.4vh" }} />
                                    {item.name}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    )
};

export default PerepletPereplet;
