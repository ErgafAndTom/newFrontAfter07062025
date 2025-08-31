import React, {useEffect, useRef, useState} from "react";
import {errorDownloadImg, successDownloadImg} from "../../actions/fileAction";
import {MDBFile, MDBInput} from "mdb-react-ui-kit";
import {useSelector} from "react-redux";

export default function ImgViewer({url}){
    const ImggRef = useRef();
    const thisFile = useSelector(state => state.files.thisFile);
    useSelector(state => state.files.thisFile.url.url);
    useSelector(state => state.files.allFiles);
    const [imgRef, setImgRef] = useState();
    const [imgStyles, setImgStyles] = useState();

    useEffect(() => {
        const img = new Image();
        img.src = thisFile.url.url;
        img.onload = (event) => {
            let imgP = {
                width: event.target.naturalWidth,
                height: event.target.naturalHeight,
                src: event.target.src
            }
            // console.log(imgP);
            setImgRef(imgP)
            // ImggRef.current.src = imgP.src;

            //----------------------------------------------------------
            let imgWidth = imgP.width;
            let imgHeight = imgP.height;
            let imgCoef = imgHeight / imgWidth
            let x = thisFile.x;
            let y = thisFile.y;
            let coef = y / x
            if (imgCoef >= coef) {
                let newImgCoef = 100 * coef / imgCoef
                setImgStyles({
                    width: newImgCoef + "%"
                })
            } else {
                setImgStyles({
                    width: 100 + "%"
                })
            }
            if (coef < 1) {
                let newImgCoef = 100 * coef / imgCoef
                let coef1 = coef
                coef = x / y
                if (imgCoef >= coef1) {
                    setImgStyles({
                        width: newImgCoef * coef + "%"
                    })
                } else {
                    setImgStyles({
                        width: 100 / coef1 + "%"
                    })
                }
            }
            //-------------------------------------------------------

            // console.log("DownloadImgAction (after success");
        }
        img.onerror = (error) => {
            console.error(error);
        }

    }, [url]);


    //for render---------------------------------------------------------------------------------------------------------
    let list1Styles = {transform: "", opacity: "1",};
    let containerForImgInServerStyles = {transform: ""};

    let x = thisFile.x;
    let y = thisFile.y;
    let etalon = 30;
    let coef = y / x
    let width = etalon / coef;
    let etalonForRender = 30

    if (coef < 1) {
        coef = x / y
        width = etalon / coef;
        containerForImgInServerStyles = {
            transform: `rotate(-90deg)`
        }
        list1Styles = {
            transform: "rotate(90deg)"
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
    //---------------------------------------------------------------------------------------------------------

    return (
        <div className="fileViewContainer">
            <div className="listAndCard invisible m-auto">
                <div className="list m-auto visible cursorPointer" style={list1Styles}>
                    <div className="containerForImgInServer" style={containerForImgInServerStyles}>
                        <img src={ImggRef} alt="" className="imgInServer" style={imgStyles}
                             draggable="false"/>
                    </div>
                </div>
            </div>
            <div className="navContainer">
                <div id="navPanel" className="d-flex flex-column position-absolute navPanel">
                    <div id="navigation_controls"
                         className="input-group d-flex justify-content-center align-items-center">
                        <div className="input-group-text gray navDrag" id="navDrag">
                            <img src="" alt="d" className="mouseScroll"/>
                        </div>
                        <button id="page_count" className="input-group-text gray">{thisFile.countInFile}</button>
                        <button className="input-group-text gray">стр.</button>
                        <MDBInput className="input-group-text gray inputs inputFormat"
                                  label='' id='typeNumber'
                                  type='number' value={1}/>
                        <button className="input-group-text gray d-none"></button>
                        <button className="input-group-text gray d-none"></button>
                        <button className="btn btn-sm input-group-text gray m-2">
                            <MDBFile
                                label=''
                                id='oneFile'
                                className="btn btn-sm"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
