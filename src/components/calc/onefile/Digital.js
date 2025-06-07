import React from "react";
import {FormatDrukView} from "./formatdrukview/FormatDrukView";
import {MaterialsAndDop} from "./materialsanddop/MaterialsAndDop";

export const Digital = () => {
    return (
        <div>
            <FormatDrukView/>
            <MaterialsAndDop/>
        </div>
    )
}