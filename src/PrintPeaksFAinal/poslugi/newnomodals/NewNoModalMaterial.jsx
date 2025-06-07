import React from "react";
import Form from "react-bootstrap/Form";
import Materials2 from "./Materials2";

const NewNoModalMaterial = ({material, setMaterial, count, setCount, prices, type, name, buttonsArr, selectArr}) => {

    let handleSelectChange = (e) => {
        setMaterial({
            type: material.type,
            material: e.target.value,
        })
    }

    let handleChange = (e) => {
        setCount(e)
    }

    return (
        <div className="d-flex allArtemElem">
            <div className="ArtemNewSelectContainer" style={{display: 'flex', alignItems: 'center',}}>
                {/*<span style={{*/}
                {/*    fontSize: '1.273vw',*/}
                {/*    marginRight: '0.633vw',*/}
                {/*    fontFamily: "inter",

*/}
                {/*    fontWeight: "bold",*/}
                {/*    whiteSpace: "nowrap",*/}
                {/*}}>{name}</span>*/}
                {/*<Form.Control*/}
                {/*    className="inputsArtem"*/}
                {/*    style={{*/}
                {/*        marginLeft: "1vw"*/}
                {/*    }}*/}
                {/*    type="number"*/}
                {/*    value={count}*/}
                {/*    min={1}*/}
                {/*    onChange={(event) => handleChange(event.target.value)}*/}
                {/*/>*/}
                <select
                    name="materialSelect"
                    value={material.material}
                    onChange={(event) => handleSelectChange(event)}
                    className="selectArtem"
                    style={{
                        marginLeft: "1vw"
                    }}
                >
                    {prices[1].variants.map((item, iter) => (
                        <option
                            key={item[0]}
                            className={"optionInSelectArtem"}
                            value={item[0]}
                        >
                            {item[0]}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
};

export default NewNoModalMaterial;