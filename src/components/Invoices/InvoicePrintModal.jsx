import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import InvoicePrint from './InvoicePrint';
import axios from '../../api/axiosInstance'; // <-- ваш axios

/**
 * Інтеграція фронтенду: завантаження PDF через axiosInstance
 */
const InvoicePrintModal = ({ show, onHide, invoice }) => {
    const handleDownloadPdf = async () => {
        try {
            const response = await axios.post(`/api/invoices/${invoice.id}/document`, {}, {
                responseType: 'blob'
            });

            const contentDisposition = response.headers['content-disposition'];
            let fileName = 'invoice.docx'; // За замовчуванням
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1];
            }

            // Створюємо тимчасовий URL і клікаємо по ньому для завантаження
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (err) {

        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="xl"
            backdrop="static"
            keyboard={false}
            dialogClassName="invoice-print-modal"
            fullscreen="lg-down"
        >
            <Modal.Header closeButton>
                <Modal.Title>Друк рахунка-фактури</Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-0">
                {invoice && <InvoicePrint invoice={invoice} onClose={onHide} />}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Закрити
                </Button>
                <Button variant="primary" onClick={handleDownloadPdf}>
                    Завантажити PDF
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

InvoicePrintModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    invoice: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        invoiceNumber: PropTypes.string.isRequired,
    }).isRequired,
};

export default InvoicePrintModal;
