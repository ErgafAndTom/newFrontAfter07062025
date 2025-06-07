import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {MDBFile, MDBInput} from "mdb-react-ui-kit";
// import PdfViewer from "../../../../modules/pdf/PdfViewer";
import {DownloadImgAction} from "../../../../actions/fileAction";
import {Spinner} from "react-bootstrap";

export const View = () => {
    const thisFile = useSelector(state => state.files.thisFile);
    const thisFileUrl = useSelector(state => state.files.thisFile.url.url);
    useSelector(state => state.files.allFiles);
    const img = useSelector(state => state.files.img);
    const imgIsLoading = useSelector(state => state.files.imgIsLoading);
    const imgError = useSelector(state => state.files.imgError);
    const dispatch = useDispatch();


    useEffect(() => {
        dispatch(DownloadImgAction(thisFile))
    }, [thisFileUrl]);


    if(imgIsLoading){
        return (
            <Spinner animation="grow" />
        )
    }
    if(imgError){
        return (
            <div>{imgError}</div>
        )
    }

    // const setPage = (value) => {
    //
    // }

    const loadFile = (e) => {
        if(e.target.value){
            console.log(e.target.value);
        }
    }

    if(!thisFile.url.img){
        return (
            <PdfViewer url={thisFile.url.url}/>
        )
    }

    // if(thisFile.url.img){
    //     return (
    //         <ImgViewer url={thisFile.url.url}/>
    //     )
    // }

    if(img){
        let imgInServerStyles = {};
        let list1Styles = {transform: "", opacity: "1",};
        let containerForImgInServerStyles = {transform: ""};

        let imgWidth = img.width;
        let imgHeight = img.height;
        let src = img.src;
        if (thisFile.x > 0 && thisFile.y > 0) {
            console.log("render!!!");
            let x = thisFile.x;
            let y = thisFile.y;
            let etalon = 30;
            let coef = y / x
            let width = etalon / coef;
            let etalonForRender = 30

            let imgCoef = imgHeight / imgWidth
            imgInServerStyles = {}
            if (imgCoef >= coef) {
                let newImgCoef = 100 * coef / imgCoef
                imgInServerStyles = {
                    width: newImgCoef + "%"
                }
            } else {
                imgInServerStyles = {
                    width: 100 + "%"
                }
            }
            if (coef < 1) {
                let newImgCoef = 100 * coef / imgCoef
                let coef1 = coef
                coef = x / y
                width = etalon / coef;

                containerForImgInServerStyles = {
                    transform: `rotate(-90deg)`
                }
                list1Styles = {
                    transform: "rotate(90deg)"
                }
                if (imgCoef >= coef1) {
                    imgInServerStyles = {
                        width: newImgCoef * coef + "%"
                    }
                } else {
                    imgInServerStyles = {
                        width: 100 / coef1 + "%"
                    }
                }
            } else {
                containerForImgInServerStyles = {
                    transform: `rotate(0deg)`
                }
            }
            list1Styles.width = width + "vh";
            list1Styles.minWidth = width + "vh";
            list1Styles.height = etalonForRender + "vh";
            list1Styles.minHeight = etalonForRender + "vh";
            if (coef <= 1) {

            }
            if(thisFile.url.img){
                return (
                    <div className="fileViewContainer">
                        <div className="listAndCard invisible m-auto">
                            <div className="list m-auto visible cursorPointer" style={list1Styles}>
                                <div className="containerForImgInServer" style={containerForImgInServerStyles}>
                                    <img src={src} alt="" className="imgInServer" style={imgInServerStyles}
                                         draggable="false"/>
                                </div>
                            </div>
                        </div>
                        <div className="navContainer">
                            <div id="navPanel" className="d-flex flex-column position-absolute navPanel">
                                <div id="navigation_controls"
                                     className="input-group d-flex justify-content-center align-items-center">
                                    {/*<div className="input-group-text gray navDrag" id="navDrag">*/}
                                    {/*    <img src="" alt="d" className="mouseScroll"/>*/}
                                    {/*</div>*/}
                                    <button id="page_count" className="input-group-text gray">Загалом:</button>
                                    <button className="input-group-text gray">{thisFile.countInFile} стр.</button>
                                    <MDBInput className="input-group-text gray inputs inputFormat"
                                              label='' id='typeNumber'
                                              type='number' value={1}/>
                                    <button className="input-group-text gray">{imgWidth}</button>
                                    <button className="input-group-text gray">{imgHeight}</button>
                                    <button className="btn btn-sm input-group-text gray m-2">
                                        <MDBFile
                                            label=''
                                            id='oneFile'
                                            className=""
                                            onChange={loadFile}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            } else {
                return (
                    <>
                        1/1
                    </>
                )
            }
        }
    }

    return (
        <>0/0</>
    )
};