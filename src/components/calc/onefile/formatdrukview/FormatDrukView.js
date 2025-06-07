import React from "react";
import {Format} from "./Format";
import {Druk} from "./Druk";
// import {View} from "./View";
import {useSelector} from "react-redux";

export const FormatDrukView = () => {
    const thisFile = useSelector(state => state.files.thisFile);
    useSelector(state => state.files.allFiles);

    if(thisFile.calc === "digital"){
        return (
            <div className="d-flex formatAndDruk">
                <Format/>
                <Druk/>
                {/*<View/>*/}
            </div>
        );
    }
    if(thisFile.calc === "wide"){
        return (
            <div className="d-flex formatAndDruk">
                <Format/>
                {/*<View/>*/}
            </div>
        );
    }
};