import React, {useEffect, useState} from "react";
import axios from '../../../../api/axiosInstance';
import {Navigate, useNavigate} from "react-router-dom";

const MaterialsInPhoto = ({material, setMaterial, count, setCount, prices, type, name, buttonsArr, selectArr, typeUse, size}) => {
    const [paper, setPaper] = useState([]);
    const navigate = useNavigate();
    let handleSelectChange = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const selectedId = selectedOption.getAttribute('data-id') || 'default';
        const selectedValue = e.target.value || '';

        setMaterial((prevMaterial) => ({
            ...prevMaterial,
            material: selectedValue,
            materialId: selectedId,
        }));

        // setMaterial({
        //     type: material.type,
        //     thickness: material.thickness,
        //     material: e.target.value,
        //     materialId: e.target.getAttribute("idcustom"),
        // })
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
            material: material,
            size: size
        }
        axios.post(`/materials/NotAll`, data)
            .then(response => {
                // console.log(response.data);
                setPaper(response.data.rows)
                if(response.data && response.data.rows && response.data.rows[0]){
                    setMaterial({
                        ...material,
                        material: response.data.rows[0].name,
                        materialId: response.data.rows[0].id,
                    })
                } else {
                    setMaterial({
                        ...material,
                        material: "Немає",
                        materialId: 0,
                    })
                }



                // setMaterial({
                //     ...material,
                //     material: `${response.data.rows[0].name}`,
                //     materialId: response.data.rows[0].id,
                // })
            })
            .catch(error => {
                if(error?.response?.status === 403){
                    navigate('/login');
                }
                console.log(error.message);
            })
    }, [size]);

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
    //         material: material,
    //         size: size
    //     }
    //     axios.post(`/materials/NotAll`, data)
    //         .then(response => {
    //             console.log(response.data);
    //             setPaper(response.data.rows)
    //         })
    //         .catch(error => {
    //             if(error?.response?.status === 403){
    //                 navigate('/login');
    //             }
    //             console.log(error.message);
    //         })
    // }, [material]);

    return (
        <div className="d-flex allArtemElem" style={{marginLeft: "0vw", marginTop: "2vh"}}>
            {/*<UserProfileForm/>*/}
            <div style={{alignItems: 'center',}}>
                {/*<span style={{*/}
                {/*    fontSize: '1.273vw',*/}
                {/*    marginRight: '0.633vw',*/}
                {/*     ,

*/}
                {/*    fontWeight: "bold",*/}
                {/*    whiteSpace: "nowrap",*/}
                {/*}}>{name}</span>*/}
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    {/*{buttonsArr.map((item, index) => (*/}
                    {/*    <div*/}
                    {/*        className={item === material.thickness ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}*/}
                    {/*        key={index}*/}
                    {/*        onClick={() => handleClick(item)}*/}
                    {/*        // style={{*/}
                    {/*        //     backgroundColor: item === material.thickness ? 'orange' : 'transparent',*/}
                    {/*        //     border: item === material.thickness ? '0.13vw solid transparent' : '0.13vw solid transparent',*/}
                    {/*        // }}*/}
                    {/*    >*/}
                    {/*        <div className="" style={{*/}
                    {/*            height: "100%",*/}
                    {/*            opacity: item === material.thickness ? '100%' : '70%',*/}
                    {/*            whiteSpace: "nowrap",*/}
                    {/*        }}>*/}
                    {/*            {item}*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*))}*/}
                </div>
                <div className="ArtemNewSelectContainer">
                    <select
                        name="materialSelect"
                        value={material.material || ""}
                        onChange={(event) => handleSelectChange(event)}
                        className="selectArtem"
                        style={{
                            marginLeft: "1vw"
                        }}
                    >
                        <option
                            key="default"
                            className={"optionInSelectArtem"}
                            value=""
                            data-id="default"
                        >
                            <>{"Виберіть"}</>
                        </option>
                        {paper.map((item, iter) => (
                            <option
                                key={item.name + iter}
                                className={"optionInSelectArtem"}
                                value={item.name}
                                data-id={item.id}
                            >
                                {/*<>{"id:"}</>*/}
                                {/*<>{item.id}</>*/}
                                {/*<>{" "}</>*/}
                                <>{item.name}</>
                                <>{" "}</>
                                <>{item.thickness} gsm</>
                                {/*<>{"id:"}</>*/}
                                {/*<>{item.typeUse}</>*/}
                                {/*<>{" "}</>*/}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
};

export default MaterialsInPhoto;
