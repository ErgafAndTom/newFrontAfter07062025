import React, {useEffect} from "react";
import "./Files.css"
import FilesContainer from "./FilesContainer";
import OneFileInterface from "../onefile/OneFileInterface";
import {fetchAllFiles} from "../../../actions/allFilesAction";
import {useDispatch} from "react-redux";

const Files = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchAllFiles())
    }, [])

    return (
        <div>
            <FilesContainer/>
            <OneFileInterface/>
        </div>
    );
};

export default Files;