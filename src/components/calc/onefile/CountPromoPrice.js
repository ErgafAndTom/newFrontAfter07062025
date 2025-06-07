import React, {useState} from "react";
import {MDBInput} from "mdb-react-ui-kit";
import {useDispatch, useSelector} from "react-redux";
import {updateFileAction} from "../../../actions/fileAction";

export const CountPromoPrice = () => {
    const thisFile = useSelector(state => state.files.thisFile);
    useSelector(state => state.files.allFiles);
    const dispatch = useDispatch();
    const [button, setButton] = useState(false);

    const setCountValue = (value) => {
        if(!isNaN(parseInt(value))){
            dispatch(updateFileAction(thisFile, "count", null, null, value, null, null))
        }
    }
    const onButton = () => {
        setButton(!button)
    }

    let sss = 0
    let listType = ""
    let dNone = "d-none"
    if(thisFile.calc === "digital"){
        dNone = ""
        if(thisFile.format !== "A4"){
            let xx1 = 310 / thisFile.x
            let yy1 = 440 / thisFile.y
            let gg1 = Math.floor(xx1)*Math.floor(yy1)
            xx1 = 440 / thisFile.x
            yy1 = 310 / thisFile.y
            let gg2 = Math.floor(xx1)*Math.floor(yy1)
            let forR = 0
            if(gg1 > gg2){
                forR = gg1
            } else {
                forR = gg2
            }
            sss = Math.ceil(thisFile.count*thisFile.countInFile / forR)
            listType = "A3"
        } else {
            sss = thisFile.count*thisFile.countInFile
            listType = "A4"
        }
    }
    if(button){
        return (
            <div className="d-flex">
                <div>
                    <div className="displayTitle">Кількість</div>
                    <MDBInput
                        className="input-group-text gray inputs inputCount"
                        onChange={(e) => setCountValue(e.currentTarget.value)}
                        label=''
                        id='typeNumber'
                        type='number'
                        min={1}
                        value={thisFile.count}
                    />
                </div>
                <div onClick={onButton}>&lt;</div>
                <div>
                    <div className="displayTitle">Аркущів у файлі</div>
                    <MDBInput
                        className="input-group-text gray inputs inputCount notDisablad"
                        label=''
                        id='typeNumber'
                        type='number'
                        disabled={true}
                        value={thisFile.countInFile}
                    />
                </div>
                <div className={dNone}>
                    <div className="displayTitle">Затрачено буде: {listType}</div>
                    <MDBInput
                        className="input-group-text gray inputs inputCount notDisablad"
                        label=''
                        id='typeNumber'
                        type='number'
                        disabled={true}
                        value={sss}
                    />
                </div>
                <div>
                    <div className="displayTitle">Готових аркушів</div>
                    <MDBInput
                        className="input-group-text gray inputs inputCount notDisablad"
                        label=''
                        id='typeNumber'
                        type='number'
                        disabled={true}
                        value={thisFile.countInFile*thisFile.count}
                    />
                </div>
                <div>
                    <div className="displayTitle">Ціна в грн.</div>
                    <MDBInput
                        className="input-group-text gray inputs inputCount notDisablad"
                        label=''
                        id='typeNumber'
                        type='number'
                        disabled={true}
                        value={thisFile.price}
                    />
                </div>
            </div>
        )
    }
    return (
        <div className="d-flex">
            <div>
                <div className="displayTitle">Кількість</div>
                <MDBInput
                    className="input-group-text gray inputs inputCount"
                    onChange={(e) => setCountValue(e.currentTarget.value)}
                    label=''
                    id='typeNumber'
                    type='number'
                    // step="1" min="1" max="100"
                    min={1}
                    value={thisFile.count}
                />
            </div>
            <div onClick={onButton}>></div>
            <div>
                <div className="displayTitle">Ціна в грн.</div>
                <MDBInput
                    className="input-group-text gray inputs inputCount notDisablad"
                    label=''
                    id='typeNumber'
                    type='number'
                    // step="1" min="0" max="200"
                    disabled={true}
                    value={thisFile.price}
                />
            </div>
        </div>
    )
}