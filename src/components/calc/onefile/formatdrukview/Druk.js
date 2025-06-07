import React from "react";
import {Button} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {updateFileAction} from "../../../../actions/fileAction";

export const Druk = () => {
    const thisFile = useSelector(state => state.files.thisFile);
    useSelector(state => state.files.allFiles);
    const dispatch = useDispatch();

    let color = [
        { name: "Чорно-білий", value: "bw" },
        { name: "Кольоровий", value: "colors" },
    ];
    let sides = [
        { name: "Односторонній", value: "one" },
        { name: "Двосторонній", value: "two" },
    ];

    const setColor = (value) => {
        dispatch(updateFileAction(thisFile, "color", null, null, value, null, null))
    }
    const setSides = (value) => {
        dispatch(updateFileAction(thisFile, "sides", null, null, value, null, null))
    }

    return (
        <div  className="drukContainer">
            <div className="displayTitle">Друк</div>
            <div className="d-flex justify-content-center">
                {color.map((button) => (
                    <Button
                        key={button.value}
                        id={button.value}
                        value={button.value}
                        variant={'outline-light'}
                        className={thisFile.color === button.value ? 'btnm druk fileActive' : 'btnm druk'}
                        onClick={(e) => setColor(e.currentTarget.value)}
                    >
                        {button.name}
                    </Button>
                ))}
            </div>
            <div className="d-flex justify-content-center pt-1">
                {sides.map((button) => (
                    <Button
                        key={button.value}
                        id={button.value}
                        value={button.value}
                        variant={'outline-light'}
                        className={thisFile.sides === button.value ? 'btnm druk fileActive' : 'btnm druk'}
                        onClick={(e) => setSides(e.currentTarget.value)}
                    >
                        {button.name}
                    </Button>
                ))}
            </div>
        </div>
    );
};