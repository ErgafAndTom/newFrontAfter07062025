import React, {useCallback, useEffect, useRef, useState} from 'react';
import * as pdfjsLib from 'pdfjs-dist/webpack';
// import pdfjsLib from "pdfjs-dist/build/pdf";
// import pdfjsWorker from "pdfjs-dist/build/pdf.worker";
import {useSelector} from "react-redux";
import {MDBInput} from "mdb-react-ui-kit";

export default function PdfViewer({url}){
    const thisFile = useSelector(state => state.files.thisFile);
    useSelector(state => state.files.thisFile.url.url);
    useSelector(state => state.files.allFiles);
    const canvasRef = useRef();
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    const [pdfRef, setPdfRef] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [canvasStyles, setCanvasStyles] = useState({
        width: 0 + "%"
    });

    const renderPage = useCallback((pageNum, pdf=pdfRef) => {
        pdf && pdf.getPage(pageNum).then(function(page) {
            const viewport = page.getViewport({scale: 1.5});
            // const viewport = page.getViewport();
            const canvas = canvasRef.current;
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            // let context = canvas.getContext('2d');

            //----------------------------------------------------------
            let imgWidth = viewport.width;
            let imgHeight = viewport.height;
            let imgCoef = imgHeight / imgWidth
            let x = thisFile.x;
            let y = thisFile.y;
            let coef = y / x
            if (imgCoef >= coef) {
                let newImgCoef = 100 * coef / imgCoef
                setCanvasStyles({
                    width: newImgCoef + "%"
                })
            } else {
                setCanvasStyles({
                    width: 100 + "%"
                })
            }
            if (coef < 1) {
                let newImgCoef = 100 * coef / imgCoef
                let coef1 = coef
                coef = x / y
                if (imgCoef >= coef1) {
                    setCanvasStyles({
                        width: newImgCoef * coef + "%"
                    })
                } else {
                    setCanvasStyles({
                        width: 100 / coef1 + "%"
                    })
                }
            }
            //-------------------------------------------------------
            const renderContext = {
                canvasContext: canvas.getContext('2d'),
                viewport: viewport
            };
            page.render(renderContext);
            console.log("renderPage func done");
        })
    }, [pdfRef, currentPage]);

    useEffect(() => {
        renderPage(currentPage, pdfRef);
        console.log("useEffect for render");
    }, [pdfRef, currentPage, thisFile.x, thisFile.y]);

    useEffect(() => {
        const loadingTask = pdfjsLib.getDocument(url);
        console.log("useEffect for load(before then)");
        loadingTask.promise.then(loadedPdf => {
            setPdfRef(loadedPdf);
            console.log("useEffect for load(at then)");
        }, function (reason) {
            console.error(reason);
        });
        console.log("useEffect for load(after then)");
    }, [url]);

    const setPage = (value) => {
        console.log(value);
        if(value > 0){
            if(value <= pdfRef.numPages){
                setCurrentPage(parseInt(value))
                // renderPage(currentPage, pdfRef);
            }
        }
    }

    const nextPage = () => pdfRef && currentPage < pdfRef.numPages && setCurrentPage(currentPage + 1);

    const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

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

    console.log(canvasStyles);

    return (
        <div className="fileViewContainer">
            <div className="listAndCard invisible m-auto">
                <div className="list m-auto visible cursorPointer" style={list1Styles}>
                    <div className="containerForImgInServer" style={containerForImgInServerStyles}>
                        <div className="imgInServer notMDr">
                            <div className="myPdfViewer">
                                <div className="theCanvas">
                                    <canvas className="pdfRenderer visible" ref={canvasRef} style={canvasStyles}></canvas>
                                </div>
                            </div>
                        </div>
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
                                  onChange={(e) => setPage(e.currentTarget.value)} label='' id='typeNumber'
                                  type='number' value={currentPage}/>
                        {/*<button className="btn btn-sm input-group-text gray m-2 invisible">*/}
                        {/*    Завантажити файл*/}
                        {/*</button>*/}
                    </div>
                </div>
            </div>
        </div>
    )
}