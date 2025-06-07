import React from "react";
import {Materials} from "./materialsanddop/Materials";
import ThreeScene from "../../../modules/three/ThreeScene";

export const Cup = () => {
    return (
        <div style={{display: 'flex'}}>
            <Materials/>
            {/*<CupDraggable/>*/}
            <ThreeScene />
        </div>
    )
}