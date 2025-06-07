import React from "react";
import './btn.css';
import {useDispatch, useSelector} from "react-redux";
import {deleteFileAction, pickFile} from "../../../actions/fileAction";

const FileContainer = ({name, keyprop, type, id, active}) => {
    const thisFile = useSelector((state) => state.files.thisFile);
    const dispatch = useDispatch();

    const deleteThisFile = (event) => {
        if(event.target.classNameList.contains("btn-close")){
            dispatch(deleteFileAction(keyprop))
        }
    }

    let className1 = "btn btnm btn-sm"
    if(thisFile){
        if(thisFile.id === keyprop){
            className1 = "btn btn-sm btnm fileActive"
        }
    }
    let className2 = "btn btn-close"
    if(thisFile){
        if(thisFile.id === keyprop){
            className2 = "btn btn-close btn-close-white"
        }
    }
    const pickThisFile = (event) => {
        if(!event.target.classNameList.contains("btn-close")){
            dispatch(pickFile(keyprop))
        }
    }

    return (
        <div onClick={pickThisFile} className={className1}>
            {name}
            <button className={className2} onClick={deleteThisFile}></button>
        </div>
    );
};

export default FileContainer;