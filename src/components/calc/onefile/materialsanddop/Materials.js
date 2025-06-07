import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {updateFileAction} from "../../../../actions/fileAction";

export const Materials = () => {
    const prices = useSelector(state => state.prices.prices);
    const thisFile = useSelector(state => state.files.thisFile);
    useSelector(state => state.files.allFiles);
    const dispatch = useDispatch();
    let paperButtons = [];
    let toUseButtons = [];
    let destinyButtons = [];
    let destinyThisButtons = [];

    const updateThisFilePaper = (value) => {
        if(value === "Самоклеючі"){
            // dispatch(updateFileAction(thisFile, "paper", null, null, value, null, null))
            dispatch(updateFileAction(thisFile, "paper", "destiny", "format", value, "Біла самоклеюча плівка", "A3", "cuttingSamokleika", "з фігурною порізкою (порізка продукції на аркуші форматом А3)"))
        } else if(value === "Папір/Картон"){
            // dispatch(updateFileAction(thisFile, "paper", null, null, value, null, null))
            dispatch(updateFileAction(thisFile, "paper", "destiny", "format", value, null, "A4"))
        } else {
            dispatch(updateFileAction(thisFile, "paper", null, null, value, null, null))

        }
    }
    const updateThisFileToUse = (value) => {
        if(value === "Самоклеючі"){
            dispatch(updateFileAction(thisFile, "touse", "destiny", "destinyThis", value, "Біла самоклеюча плівка", null))
        } else {
            dispatch(updateFileAction(thisFile, "touse", "destiny", "destinyThis", value, null, null))
        }
    }
    const updateThisFileDestiny = (value) => {
        dispatch(updateFileAction(thisFile, "destiny", "destinyThis", null, value, null, null))
    }
    const updateThisFileDestinyThis = (value) => {
        dispatch(updateFileAction(thisFile, "destinyThis", null, null, value, null, null))
    }

    if(thisFile.calc === "digital"){
        paperButtons = []
        destinyButtons = []
        for (let i = 0; i < prices.length; i++){
            if(prices[i].name === "на чому друк") {
                paperButtons = prices[i].variants.filter(e => e[0][0] !== "!")
            }
            if(prices[i].name === thisFile.paper) {
                destinyButtons = prices[i].variants.filter(e => e[0][0] !== "!")
            }
        }
    }
    if(thisFile.calc === "wide"){
        toUseButtons = [];
        destinyButtons = [];
        destinyThisButtons = [];
        for (let i = 0; i < prices.length; i++){
            if(prices[i].name === "Використання") {
                toUseButtons = prices[i].variants.filter(e => e[0][0] !== "!")
            }
            if(prices[i].name === thisFile.touse) {
                destinyButtons = prices[i].variants.filter(e => e[0][0] !== "!")
            }
            if(prices[i].name === thisFile.destiny) {
                destinyThisButtons = prices[i].variants.filter(e => e[0][0] !== "!")
            }
        }
    }
    if(thisFile.calc === "cup"){
        destinyButtons = [];
        for (let i = 0; i < prices.length; i++){
            if(prices[i].name === "чашки") {
                destinyButtons = prices[i].variants.filter(e => e[0][0] !== "!")
            }
        }
    }
    if(thisFile.calc === "afterPrint"){
        destinyButtons = [];
        for (let i = 0; i < prices.length; i++){
            if(prices[i].name === "Післядрукарська обробка") {
                destinyButtons = prices[i].variants.filter(e => e[0][0] !== "!")
            }
        }
    }



    return (
        <div className="materialContainer">
            <div className="displayTitle">Матеріал</div>
            <div className="d-flex justify-content-around pt-1 materialsButtons" id="paperButtons">
                {paperButtons.map((item, index) => (
                    <button
                        value={item[0]}
                        className={thisFile.paper === item[0] ? 'btn btnm materialButtons fileActive' : 'btn btnm materialButtons'}
                        onClick={(e) => updateThisFilePaper(e.currentTarget.value)}
                        key={item[0]}>
                        {item[0]}
                    </button>
                ))}
            </div>
            <div className="d-flex justify-content-around pt-1 fontSize" id="toUseButtons">
                {toUseButtons.map((item, index) => (
                    <button
                        value={item[0]}
                        className={thisFile.touse === item[0] ? 'btn btnm fileActive' : 'btn btnm'}
                        onClick={(e) => updateThisFileToUse(e.currentTarget.value)}
                        key={item[0]}>
                        {item[0]}
                    </button>
                ))}
            </div>
            <div className="row row-cols-2 align-items-center pt-1 fontSize m-1" id="destinyButtons">
                {destinyButtons.map((item, index) => (
                    <button
                        value={item[0]}
                        className={thisFile.destiny === item[0] ? 'btn btnm destinyButtons fileActive' : 'btn btnm destinyButtons'}
                        onClick={(e) => updateThisFileDestiny(e.currentTarget.value)}
                        key={item[0]}>
                        {item[0]}
                    </button>
                ))}
            </div>
            <div className="row row-cols-2 align-items-center pt-1 fontSize m-1" id="destinyThisButtons">
                {destinyThisButtons.map((item, index) => (
                    <button
                        value={item[0]}
                        className={thisFile.destinyThis === item[0] ? 'btn btnm destinyButtons fileActive' : 'btn btnm destinyButtons'}
                        onClick={(e) => updateThisFileDestinyThis(e.currentTarget.value)}
                        key={item[0]}>
                        {item[0]}
                    </button>
                ))}
            </div>
        </div>
    );
};