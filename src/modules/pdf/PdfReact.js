import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import {DownloadImgAction} from "../../actions/fileAction";
import {useDispatch, useSelector} from "react-redux";

export function PdfReact({url}) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    return (
        <div>
            <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={pageNumber} />
            </Document>
            <li>
                Page {pageNumber} of {numPages}
            </li>
        </div>
    );
}