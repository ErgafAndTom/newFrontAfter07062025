import React, { useState, useEffect } from 'react';
import { invoiceService } from '../api/invoiceService';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency } from '../utils/numberUtils';
import './InvoiceList.css';

export const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            const data = await invoiceService.getAll();
            console.log(data);
            setInvoices(data);
            setLoading(false);
        } catch (err) {
            setError('Помилка при завантаженні рахунків');
            setLoading(false);
        }
    };

    const handleGenerateDocx = async (id) => {
        try {
            const blob = await invoiceService.generateDocx(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice_${id}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Помилка при генерації документа');
        }
    };

    if (loading) return <div className="loading">Завантаження...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="invoice-list">
            <h2>Рахунки</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>Номер</th>
                        <th>Дата</th>
                        <th>Контрагент</th>
                        <th>Сума</th>
                        <th>Статус</th>
                        <th>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(invoice => (
                        <tr key={invoice.id}>
                            <td>{invoice.invoiceNumber}</td>
                            <td>{formatDate(invoice.invoiceDate)}</td>
                            <td>{invoice.contractor?.name}</td>
                            <td>{formatCurrency(invoice.totalSum)}</td>
                            <td>
                                <span className={`status-badge ${invoice.details?.paymentStatus}`}>
                                    {invoice.details?.paymentStatus}
                                </span>
                            </td>
                            <td>
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleGenerateDocx(invoice.id)}
                                >
                                    Скачати
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}; 