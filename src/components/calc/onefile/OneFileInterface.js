import React from "react";
import {useSelector} from "react-redux";
import {Digital} from "./Digital";
import {Wide} from "./Wide";
import {Photo} from "./Photo";
import {Cup} from "./Cup";
import {AfterPrint} from "./AfterPrint";
import {CountPromoPrice} from "./CountPromoPrice";

const OneFileInterface = () => {
    const thisFile = useSelector(state => state.files.thisFile);
    if(thisFile) {
        if(thisFile.calc === "digital"){
            return (
                <div>
                    <div className="optionsContainer">
                        <Digital/>
                        <CountPromoPrice/>
                    </div>
                </div>
            )
        } else if(thisFile.calc === "wide"){
            return (
                <div>
                    <div className="optionsContainer">
                        <Wide/>
                        <CountPromoPrice/>
                    </div>
                </div>
            )
        } else if(thisFile.calc === "photo"){
            return (
                <div>
                    <div className="optionsContainer">
                        <Photo/>
                        <CountPromoPrice/>
                    </div>
                </div>
            )
        } else if(thisFile.calc === "cup"){
            return (
                <div>
                    <div className="optionsContainer">
                        <Cup/>
                        <CountPromoPrice/>
                    </div>
                </div>
            )
        } else if(thisFile.calc === "afterPrint"){
            return (
                <div>
                    <div className="optionsContainer">
                        <AfterPrint/>
                        <CountPromoPrice/>
                    </div>
                </div>
            )
        }
    }

    return (
        <div>
            <div className="m-2">
                nothing...
            </div>
        </div>
    );
};

export default OneFileInterface;