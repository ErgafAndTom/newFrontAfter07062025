import React, {useEffect, useState} from "react";
import axios from '../../../../api/axiosInstance';
import {useNavigate} from "react-router-dom";

const PhotoPosluga = ({photo, setPhoto, prices, buttonsArr, selectArr}) => {
    const [thisLaminationSizes, setThisLaminationSizes] = useState([]);
    const navigate = useNavigate();

    let handleSelectChange = (e) => {
        setPhoto({
            type: photo.type,
            material: photo.material,
            materialId: photo.materialId,
            size: e.target.value
        })
    }

    let handleToggle = (e) => {
        if (photo.type === "Не потрібно") {
            setPhoto({
                type: "Потрібно",
                material: "",
                materialId: "",
                size: ""
            })
        } else {
            setPhoto({
                type: "Не потрібно",
                material: "",
                materialId: "",
                size: ""
            })
        }
    }

    let handleClick = (e) => {
        // if(e !== "З ламінуванням Soft Touch"){
        //     setThisLaminationSizes(["30", "80", "100", "125", "250"])
        // } else {
        //     setThisLaminationSizes(["30", "80"])
        // }
        setPhoto({
            type: e,
            material: e,
            materialId: e,
            size: photo.size
        })
    }

    // useEffect(() => {
    //     let data = {
    //         name: "MaterialsPrices",
    //         inPageCount: 999999,
    //         currentPage: 1,
    //         search: "",
    //         columnName: {
    //             column: "id",
    //             reverse: false
    //         },
    //         material: {
    //             type: "Ламінування",
    //             material: lamination.material,
    //             materialId: lamination.materialId,
    //             thickness: lamination.size,
    //         }
    //     }
    //     axios.post(`/materials/NotAll`, data)
    //         .then(response => {
    //             console.log(response.data);
    //             setThisLaminationSizes(response.data.rows)
    //         })
    //         .catch(error => {
    //             if(error.response.status === 403){
    //                 navigate('/login');
    //             }
    //             console.log(error.message);
    //         })
    // }, [lamination]);

    return (<div className="d-flex allArtemElem">
        <div style={{display: 'flex', alignItems: 'center',}}>
            <div className={`toggleContainer ${photo.type === "Не потрібно" ? 'disabledCont' : 'enabledCont'}`}
                 onClick={handleToggle}
                 style={{transform: "scale(0.6)"}}>
                <div className={`toggle-button ${photo.type === "Не потрібно" ? 'disabled' : 'enabledd'}`}>
                </div>
            </div>
            <div className="d-flex flex-column">
            <span style={{
                fontSize: '1.273vw', marginRight: '0.633vw', fontFamily: "inter",
 fontWeight: "bold"
            }}>{"Фото на документи:"}</span>
                {/*{photo.type !== "Не потрібно" ? (*/}
                {/*    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center',}}>*/}
                {/*        <div style={{*/}
                {/*            display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: "2vw"*/}
                {/*        }}>*/}
                {/*            {buttonsArr.map((item, index) => (<button*/}
                {/*                className={item === photo.material ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}*/}
                {/*                key={index}*/}
                {/*                onClick={() => handleClick(item)}*/}
                {/*                // style={{*/}
                {/*                //     backgroundColor: item === lamination.material ? 'orange' : 'transparent',*/}
                {/*                //     border: item === lamination.material ? '0.13vw solid transparent' : '0.13vw solid transparent',*/}
                {/*                // }}*/}
                {/*            >*/}
                {/*                <div className="" style={{*/}
                {/*                    height: "100%",*/}
                {/*                    opacity: item === photo.material ? '100%' : '90%',*/}
                {/*                    whiteSpace: "nowrap",*/}
                {/*                }}>*/}
                {/*                    {item}*/}
                {/*                </div>*/}
                {/*            </button>))}*/}
                {/*            <div className="ArtemNewSelectContainer">*/}
                {/*                <select*/}
                {/*                    value={photo.size}*/}
                {/*                    onChange={(event) => handleSelectChange(event)}*/}
                {/*                    className="selectArtem"*/}
                {/*                >*/}
                {/*                    <option value={""}>{""}</option>*/}
                {/*                    {thisLaminationSizes.map((item, iter2) => (*/}
                {/*                        <option className="optionInSelectArtem" key={item.thickness}*/}
                {/*                                value={item.thickness}>{item.thickness} мкм</option>))}*/}
                {/*                </select>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    </div>) : (<div>*/}

                {/*</div>)}*/}
            </div>
        </div>
    </div>)
};

export default PhotoPosluga;
