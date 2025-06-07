import React from 'react';
import { Modal, Button, Table, Card, Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';

// Компонент для відображення деталей рахунку
const InvoiceDetailsModal = ({ show, onHide, invoice }) => {
    if (!invoice) return null;

    // Розрахунок загальної суми (на випадок, якщо вона не була збережена)
    const calculateTotal = () => {
        if (!invoice.items || invoice.items.length === 0) {
            return parseFloat(invoice.totalSum || 0);
        }
        return invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    };

    const totalSum = calculateTotal();

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Деталі рахунку</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                        <h4>Рахунок № {invoice.invoiceNumber}</h4>
                        <p className="text-muted">від {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                    </div>
                    <Badge bg="success" className="p-2 fs-6">
                        {totalSum.toLocaleString('uk-UA')} грн
                    </Badge>
                </div>

                <div className="row mb-4">
                    <div className="col-md-6">
                        <Card className="h-100">
                            <Card.Header className="bg-light">Постачальник</Card.Header>
                            <Card.Body>
                                <Card.Title>{invoice.supplierName}</Card.Title>
                                {invoice.supplierDetails && (
                                    <Card.Text>
                                        {invoice.supplierDetails}
                                    </Card.Text>
                                )}
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-md-6">
                        <Card className="h-100">
                            <Card.Header className="bg-light">Покупець</Card.Header>
                            <Card.Body>
                                <Card.Title>{invoice.buyerName}</Card.Title>
                                {invoice.buyerDetails && (
                                    <Card.Text>
                                        {invoice.buyerDetails}
                                    </Card.Text>
                                )}
                            </Card.Body>
                        </Card>
                    </div>
                </div>

                <h5 className="mb-3">Товари та послуги:</h5>
                
                {invoice.items && invoice.items.length > 0 ? (
                    <Table striped bordered responsive>
                        <thead className="table-light">
                            <tr>
                                <th width="5%">#</th>
                                <th width="40%">Найменування</th>
                                <th width="10%" className="text-center">Кількість</th>
                                <th width="10%" className="text-center">Од. виміру</th>
                                <th width="15%" className="text-end">Ціна</th>
                                <th width="20%" className="text-end">Сума</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.name}</td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-center">{item.unit}</td>
                                    <td className="text-end">{parseFloat(item.price).toLocaleString('uk-UA')}</td>
                                    <td className="text-end fw-bold">
                                        {(item.quantity * item.price).toLocaleString('uk-UA')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="table-light">
                            <tr>
                                <td colSpan="5" className="text-end fw-bold">Загальна сума:</td>
                                <td className="text-end fw-bold fs-5">{totalSum.toLocaleString('uk-UA')} грн</td>
                            </tr>
                        </tfoot>
                    </Table>
                ) : (
                    <div className="alert alert-info">
                        Деталі товарів/послуг відсутні в цьому рахунку
                    </div>
                )}
                
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Закрити
                </Button>
                <Button variant="primary" onClick={() => window.print()}>
                    <i className="bi bi-printer me-1"></i> Роздрукувати
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

InvoiceDetailsModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    invoice: PropTypes.object
};

export default InvoiceDetailsModal;
