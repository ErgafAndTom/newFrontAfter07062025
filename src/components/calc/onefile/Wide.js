import {MaterialsAndDop} from "./materialsanddop/MaterialsAndDop";
import React from "react";
import {FormatDrukView} from "./formatdrukview/FormatDrukView";

export const Wide = () => {
    return (
        <div>
            <FormatDrukView/>
            <MaterialsAndDop/>
        </div>
    )
}