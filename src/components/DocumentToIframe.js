import React from 'react';

const PdfViewer = () => {
    // const pdfFile = `${process.env.PUBLIC_URL}/Рахунок №450 (2).pdf`; // Шлях до PDF-файлу у папці public
    const pdfFile = `${process.env.PUBLIC_URL}`; // Шлях до PDF-файлу у папці public

    return (
        <iframe src={pdfFile} width="100%" height="100%" title="PDF Viewer"></iframe>
    );
}

export default PdfViewer;