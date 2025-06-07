import React from "react";
import "./Dop.css";
import hole1 from "./dopoptions/holes/1hole.svg";
import hole2 from "./dopoptions/holes/2hole.svg";
import hole3 from "./dopoptions/holes/3hole.svg";
import big1 from "./dopoptions/big/1big.svg";
import big2 from "./dopoptions/big/2big.svg";
import big3 from "./dopoptions/big/3big.svg";
import skoba from "./dopoptions/binding/skoba.svg";
import metall from "./dopoptions/binding/metall.svg";
import plastic from "./dopoptions/binding/plastic.svg";
import {Accordion} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {updateFileAction} from "../../../../actions/fileAction";

export const Dop = () => {
    const thisFile = useSelector(state => state.files.thisFile);
    const prices = useSelector(state => state.prices.prices);
    useSelector(state => state.files.allFiles);
    const dispatch = useDispatch();

    let laminationButtons = [];
    let roundCornerButtons = [];
    let cuttingSamokleika = [];
    if(thisFile.calc === "digital"){
        laminationButtons = []
        roundCornerButtons = []
        cuttingSamokleika = []
        for (let i = 0; i < prices.length; i++){
            if(prices[i].name === "ламінуванння") {
                laminationButtons = prices[i].variants.filter(e => e[0][0] !== "!")
            }
            if(prices[i].name === "кути") {
                roundCornerButtons = prices[i].variants.filter(e => e[0][0] !== "!")
            }
            if(prices[i].name === "Порізка самоклейки") {
                cuttingSamokleika = prices[i].variants.filter(e => e[0][0] !== "!")
            }
        }
    }

    if(thisFile.lamination === null || thisFile.lamination === undefined){
        thisFile.lamination = "без ламінації"
    }
    if(thisFile.binding === null || thisFile.binding === undefined){
        thisFile.binding = "без брушурування"
    }
    if(thisFile.big === null || thisFile.big === undefined){
        thisFile.big = "без згинання"
    }
    if(thisFile.holes === null || thisFile.holes === undefined){
        thisFile.holes = "без дірок"
    }
    if(thisFile.roundCorner === null || thisFile.roundCorner === undefined){
        thisFile.roundCorner = "без обрізки кутів"
    }
    if(thisFile.cuttingSamokleika === null || thisFile.cuttingSamokleika === undefined){
        thisFile.cuttingSamokleika = "без порізки"
    }

    const updateThisFileLamination = (value) => {
        dispatch(updateFileAction(thisFile, "lamination", null, null, value, null, null))
    }
    const updateThisFilecuttingSamokleika = (value) => {
        dispatch(updateFileAction(thisFile, "cuttingSamokleika", null, null, value, null, null))
    }
    const updateThisFileRoundCorner = (value) => {
        dispatch(updateFileAction(thisFile, "roundCorner", null, null, value, null, null))
    }
    const updateThisFileBinding = (value) => {
        if(thisFile.binding === value){
            dispatch(updateFileAction(thisFile, "binding", null, null, null, null, null))
        } else {
            dispatch(updateFileAction(thisFile, "binding", null, null, value, null, null))
        }
    }
    const updateThisFileBig = (value) => {
        if(thisFile.big === value){
            dispatch(updateFileAction(thisFile, "big", null, null, null, null, null))
        } else {
            dispatch(updateFileAction(thisFile, "big", null, null, value, null, null))
        }    }
    const updateThisFileHoles = (value) => {
        if(thisFile.holes === value){
            dispatch(updateFileAction(thisFile, "holes", null, null, null, null, null))
        } else {
            dispatch(updateFileAction(thisFile, "holes", null, null, value, null, null))
        }    }

    if(thisFile.paper === "Самоклеючі"){
        return (
            <div className="dopOptionsContainer">
                <div className="displayTitle invisible">Додаткові опції</div>
                <Accordion className="">
                    <Accordion className="" eventkey="0">
                        <Accordion.Button className="btn btnm moreOptions dopOptionsContainer">Додаткові опції</Accordion.Button>
                        <Accordion.Body>

                            <Accordion className="">
                                <Accordion className="" eventkey="1">
                                    <Accordion.Button className="btn btnm moreOptionsIn">Порізка: {thisFile.cuttingSamokleika}</Accordion.Button>
                                    <Accordion.Body>
                                        {cuttingSamokleika.map((item) => (
                                            <button
                                                value={item[0]}
                                                className={thisFile.cuttingSamokleika === item[0] ? 'btn btnm fileActive' : 'btn btnm'}
                                                onClick={(e) => updateThisFilecuttingSamokleika(e.currentTarget.value)}
                                                key={item[0]}>
                                                {item[0]}
                                            </button>
                                        ))}
                                    </Accordion.Body>
                                </Accordion>
                            </Accordion>

                        </Accordion.Body>
                    </Accordion>
                </Accordion>
            </div>
        );
    }

    return (
        <div className="dopOptionsContainer">
            <div className="displayTitle invisible">Додаткові опції</div>
            <Accordion className="">
                <Accordion className="" eventkey="0">
                    <Accordion.Button className="btn btnm moreOptions dopOptionsContainer">Додаткові опції</Accordion.Button>
                    <Accordion.Body>

                        <Accordion className="">
                            <Accordion className="" eventkey="1">
                                <Accordion.Button className="btn btnm moreOptionsIn">Заламінувати: {thisFile.lamination}</Accordion.Button>
                                <Accordion.Body className="InAccordion">
                                    {laminationButtons.map((item) => (
                                        <button
                                            value={item[0]}
                                            className={thisFile.lamination === item[0] ? 'btn btnm fileActive' : 'btn btnm'}
                                            onClick={(e) => updateThisFileLamination(e.currentTarget.value)}
                                            key={item[0]}>
                                            {item[0]}
                                        </button>
                                    ))}
                                </Accordion.Body>
                            </Accordion>
                            <Accordion className="" eventkey="2">
                                <Accordion.Button className="btn btnm moreOptionsIn">Брошурування: {thisFile.binding}</Accordion.Button>
                                <Accordion.Body>
                                    <div id="bindingButtons" className="d-flex justify-content-around">
                                        <div
                                            onClick={(e) => updateThisFileBinding("на скобу")}
                                            className={thisFile.binding === "на скобу" ? 'iconButton activeChose' : 'iconButton'} key="на скобу">
                                            <img className="iconButtonSvg"
                                                 src={skoba} alt=""/>
                                            <div className="iconButtonText">скоба</div>
                                        </div>
                                        <div
                                            onClick={(e) => updateThisFileBinding("на металеву")}
                                            className={thisFile.binding === "на металеву" ? 'iconButton activeChose' : 'iconButton'} key="на металеву">
                                            <img className="iconButtonSvg"
                                                 src={metall} alt=""/>
                                                <div className="iconButtonText">метал</div>
                                        </div>
                                        <div
                                            onClick={(e) => updateThisFileBinding("на пластикову")}
                                            className={thisFile.binding === "на пластикову" ? 'iconButton activeChose' : 'iconButton'} key="на пластикову">
                                            <img className="iconButtonSvg"
                                                 src={plastic} alt=""/>
                                                <div className="iconButtonText">пластик</div>
                                        </div>
                                    </div>
                                </Accordion.Body>
                            </Accordion>
                            <Accordion className="" eventkey="3">
                                <Accordion.Button className="btn btnm moreOptionsIn">Зігнути: {thisFile.big}</Accordion.Button>
                                <Accordion.Body>
                                    <div id="bigButtons" className="d-flex justify-content-around">
                                        <div
                                            onClick={(e) => updateThisFileBig("згинання навпіл")}
                                            className={thisFile.big === "згинання навпіл" ? 'iconButton activeChose' : 'iconButton'} key="згинання навпіл">
                                            <img className="iconButtonSvg"
                                                 src={big1} alt=""/>
                                                <div className="iconButtonText">згинання навпіл</div>
                                        </div>
                                        <div
                                            onClick={(e) => updateThisFileBig("2 згиби")}
                                            className={thisFile.big === "2 згиби" ? 'iconButton activeChose' : 'iconButton'} key="2 згиби">
                                            <img className="iconButtonSvg"
                                                 src={big2} alt=""/>
                                                <div className="iconButtonText">2 згиби</div>
                                        </div>
                                        <div
                                            onClick={(e) => updateThisFileBig("3 згиби")}
                                            className={thisFile.big === "3 згиби" ? 'iconButton activeChose' : 'iconButton'} key="3 згиби">
                                            <img className="iconButtonSvg"
                                                 src={big3} alt=""/>
                                                <div className="iconButtonText">3 згиби</div>
                                        </div>
                                    </div>
                                </Accordion.Body>
                            </Accordion>
                            <Accordion className="" eventkey="4">
                                <Accordion.Button className="btn btnm moreOptionsIn">Дірки: {thisFile.holes}</Accordion.Button>
                                <Accordion.Body>
                                    <div id="holesButtons" className="d-flex justify-content-around">
                                        <div
                                            onClick={(e) => updateThisFileHoles("1 отвір 5 мм")}
                                            className={thisFile.holes === "1 отвір 5 мм" ? 'iconButton activeChose' : 'iconButton'} key="1 отвір 5 мм">
                                            <img className="iconButtonSvg"
                                                 src={hole1} alt=""/>
                                                <div className="iconButtonText">1 отвір 5 мм</div>
                                        </div>
                                        <div
                                            onClick={(e) => updateThisFileHoles("2 отвіра 5 мм")}
                                            className={thisFile.holes === "2 отвіра 5 мм" ? 'iconButton activeChose' : 'iconButton'} key="2 отвіра 5 мм">
                                            <img className="iconButtonSvg"
                                                 src={hole2} alt=""/>
                                                <div className="iconButtonText">2 отвіра 5 мм</div>
                                        </div>
                                        <div
                                            onClick={(e) => updateThisFileHoles("3 отвіра 5 мм")}
                                            className={thisFile.holes === "3 отвіра 5 мм" ? 'iconButton activeChose' : 'iconButton'} key="3 отвіра 5 мм">
                                            <img className="iconButtonSvg"
                                                 src={hole3} alt=""/>
                                                <div className="iconButtonText">3 отвіра 5 мм</div>
                                        </div>
                                    </div>
                                </Accordion.Body>
                            </Accordion>
                            <Accordion className="" eventkey="5">
                                <Accordion.Button className="btn btnm moreOptionsIn">Обрізка/скруглення кутів: {thisFile.roundCorner}</Accordion.Button>
                                <Accordion.Body>
                                    {roundCornerButtons.map((item) => (
                                        <button
                                            value={item[0]}
                                            className={thisFile.roundCorner === item[0] ? 'btn btnm fileActive' : 'btn btnm'}
                                            onClick={(e) => updateThisFileRoundCorner(e.currentTarget.value)}
                                            key={item[0]}>
                                            {item[0]}
                                        </button>
                                    ))}
                                </Accordion.Body>
                            </Accordion>
                        </Accordion>

                    </Accordion.Body>
                </Accordion>
            </Accordion>
        </div>
    );
};