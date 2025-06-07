import React from "react";
import {Materials} from "./Materials";
import {Dop} from "./Dop";
import {useSelector} from "react-redux";

export const MaterialsAndDop = () => {
    const thisFile = useSelector(state => state.files.thisFile);
    if(thisFile.calc === "digital"){
        return (
            <div className="d-flex materialAndDopContainer">
                <Materials/>
                <Dop/>
            </div>
        )
    }
    return (
        <div className="d-flex materialAndDopContainer">
            <Materials/>
        </div>
    );
};