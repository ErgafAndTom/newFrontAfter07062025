import React from 'react';
import PropTypes from 'prop-types';
import './InvoicePrint.css';

const InvoicePrint = ({ invoice, onClose }) => {
    return (
        <div className="a4-sheet">
            <div className="header">
                <div className="left">
                    <p>02000, Україна, м. Київ<br />
                        вул. Велика Васильківська, 24<br />
                        +38 067 750 96 76
                    </p>
                </div>
                <div className="right">
                    <p>printpeaks.com.ua<br /><strong>PRINT PEAKS</strong></p>
                </div>
            </div>

            <div className="section">
                <strong>Постачальник/Виконавець:</strong><br />
                ФОП {invoice?.supplierName}<br />
                ЄДРПОУ {invoice?.supplierCode}<br />
                {invoice?.supplierAddress}<br />
                Рахунок: {invoice?.supplierIBAN}<br />
                в {invoice?.supplierBank}<br />
                Тел.: {invoice?.supplierPhone}
            </div>

            <div className="section">
                <strong>Платник/Отримувач:</strong><br />
                ФОП {invoice?.buyerName}<br />
                ЄДРПОУ {invoice?.buyerCode}<br />
                ІПН (ЄДРПОУ): {invoice?.buyerTaxCode}<br />
                Рахунок: {invoice?.buyerIBAN}<br />
                Банк: {invoice?.buyerBank} МФО {invoice?.buyerMFO}
            </div>

            <div className="section invoice-title">
                <strong>Рахунок до оплати №{invoice?.invoiceNumber}</strong><br />
                від {invoice?.invoiceDate}
            </div>

            <table className="invoice-table">
                <thead>
                <tr>
                    <th>№</th>
                    <th>Найменування</th>
                    <th></th>
                    <th>К-ть</th>
                    <th>Ціна (грн)</th>
                    <th>Сума (грн)</th>
                </tr>
                </thead>
                <tbody>
                {invoice?.items?.map((item, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.unit}</td>
                        <td>{item.quantity}</td>
                        <td>{item.price.toFixed(2)}</td>
                        <td>{(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                ))}
                <tr className="total-row">
                    <td colSpan="5">Всього</td>
                    <td>{invoice?.grandTotal?.toFixed(2)} грн</td>
                </tr>
                </tbody>
            </table>

            <div className="section approval">
                Рахунок затверджено<br />
                {invoice?.approvalName}<br />
                __________________________________
            </div>
        </div>
    );
};

InvoicePrint.propTypes = {
    invoice: PropTypes.object,
    onClose: PropTypes.func
};

export default InvoicePrint;
