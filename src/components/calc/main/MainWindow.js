import React from "react";
import "./MainWindow.css"
import {useDispatch} from "react-redux";
import ChooseService from "./ChooseService";

const MainWindow = () => {
    useDispatch();

    return (
        <div>
            <ChooseService/>
        </div>
    );
};

export default MainWindow;