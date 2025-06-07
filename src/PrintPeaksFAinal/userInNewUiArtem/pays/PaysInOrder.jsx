import "./styles.css"
import AddPaysInOrder from "./AddPayInOrder";
import ModalDeleteOrder from "../../Orders/ModalDeleteOrder";
import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Table, Spinner, Alert, Badge, Row, Col, InputGroup } from "react-bootstrap";
import { BsCashCoin, BsCreditCard, BsBank, BsCashStack, BsCurrencyExchange } from "react-icons/bs";

const PaymentMethodIcons = {
    "Готівка": <BsCashCoin className="me-2" />,
    "Картка": <BsCreditCard className="me-2" />,
    "Банківський переказ": <BsBank className="me-2" />,
    "Термінал": <BsCreditCard className="me-2" />,
    "Передоплата": <BsCashStack className="me-2" />,
    "Інше": <BsCurrencyExchange className="me-2" />
};

function PaysInOrder({ show, onHide, orderId, thisOrder, setThisOrder }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [orderInfo, setOrderInfo] = useState(null);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [currentPayment, setCurrentPayment] = useState(null);

    // Стан для нового платежу
    const [newPayment, setNewPayment] = useState({
        method: "Готівка",
        amount: "",
        comment: "",
        orderId: thisOrder.id
    });

    // Завантаження даних про замовлення та платежі
    // useEffect(() => {
    //     if (show && orderId) {
    //         fetchPayments();
    //         fetchOrderInfo();
    //     }
    // }, [show, thisOrder]);

    // Отримання інформації про замовлення
    const fetchOrderInfo = async () => {
        try {
            const response = await axios.get(`/orders/OneOrder/${thisOrder.id}`);
            setOrderInfo(response.data);
        } catch (error) {
            console.error("Помилка при отриманні замовлення:", error);
            if (error.response && error.response.status === 403) {
                navigate('/login');
            }
        }
    };

    // Отримання всіх платежів для замовлення
    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/orders/payments/${thisOrder.id}`);
            // Переконуємося, що payments завжди є масивом
            setPayments(Array.isArray(response.data) ? response.data : []);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Помилка при отриманні платежів:", error);
            if (error.response && error.response.status === 403) {
                navigate('/login');
            }
            setError("Не вдалося отримати список платежів");
        }
    };

    // Додавання нового платежу
    const handleAddPayment = async () => {
        // Валідація
        if (!newPayment.amount || isNaN(newPayment.amount) || newPayment.amount <= 0) {
            setError("Введіть коректну суму платежу");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await axios.post("/orders/payment", newPayment);
            setSuccess("Платіж успішно додано");
            // Скидання форми
            setNewPayment({
                method: "Готівка",
                amount: "",
                comment: "",
                orderId: orderId
            });
            setShowAddPayment(false);
            // Оновлення списку платежів
            fetchPayments();
            fetchOrderInfo();
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Помилка при додаванні платежу:", error);
            if (error.response && error.response.status === 403) {
                navigate('/login');
            }
            setError(error.response?.data?.message || "Помилка при додаванні платежу");
        }
    };

    // Видалення платежу
    const handleDeletePayment = async (paymentId) => {
        if (!window.confirm("Ви впевнені, що хочете видалити цей платіж?")) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await axios.delete(`/orders/payment/${paymentId}`);
            setSuccess("Платіж успішно видалено");
            // Оновлення списку платежів
            fetchPayments();
            fetchOrderInfo();
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Помилка при видаленні платежу:", error);
            if (error.response && error.response.status === 403) {
                navigate('/login');
            }
            setError(error.response?.data?.message || "Помилка при видаленні платежу");
        }
    };

    // Форматування дати
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Обчислення загальної суми платежів
    const calculateTotalPaid = () => {
        return Array.isArray(payments) ? payments.reduce((total, payment) => total + parseFloat(payment.amount), 0) : 0;
    };

    // Обчислення суми до сплати
    const calculateAmountDue = () => {
        if (!orderInfo) return 0;
        const totalOrder = parseFloat(orderInfo.totalCost) || 0;
        const totalPaid = calculateTotalPaid();
        return totalOrder - totalPaid;
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    Історія платежів
                    {orderInfo && (
                        <span className="ms-2 text-muted" style={{ fontSize: '0.8em' }}>
                            (Замовлення №{orderInfo.id})
                        </span>
                    )}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Інформація про замовлення */}
                {orderInfo && (
                    <div className="mb-4">
                        <Row className="mb-3">
                            <Col md={4}>
                                <div className="d-flex flex-column align-items-center bg-light p-3 rounded h-100">
                                    <h5 className="mb-2">Загальна сума замовлення</h5>
                                    <span className="fs-3 fw-bold text-primary">
                                        {orderInfo.totalCost ? `${orderInfo.totalCost} грн` : "0 грн"}
                                    </span>
                                </div>
                            </Col>

                            <Col md={4}>
                                <div className="d-flex flex-column align-items-center bg-light p-3 rounded h-100">
                                    <h5 className="mb-2">Сплачено</h5>
                                    <span className="fs-3 fw-bold text-success">
                                        {`${calculateTotalPaid().toFixed(2)} грн`}
                                    </span>
                                </div>
                            </Col>

                            <Col md={4}>
                                <div className="d-flex flex-column align-items-center bg-light p-3 rounded h-100">
                                    <h5 className="mb-2">Залишок до сплати</h5>
                                    <span className={`fs-3 fw-bold ${calculateAmountDue() <= 0 ? 'text-success' : 'text-danger'}`}>
                                        {`${Math.max(0, calculateAmountDue()).toFixed(2)} грн`}
                                    </span>
                                    {calculateAmountDue() <= 0 && (
                                        <Badge bg="success" pill className="mt-1">Повністю оплачено</Badge>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}

                {/* Повідомлення про помилку */}
                {error && (
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                )}

                {/* Повідомлення про успіх */}
                {success && (
                    <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
                        {success}
                    </Alert>
                )}

                {/* Кнопка додавання нового платежу */}
                <div className="mb-3">
                    <Button
                        variant="success"
                        onClick={() => setShowAddPayment(true)}
                        disabled={loading}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Додати новий платіж
                    </Button>
                </div>

                {/* Форма для додавання нового платежу */}
                {showAddPayment && (
                    <div className="border rounded p-3 mb-4 bg-light">
                        <h5 className="mb-3">Новий платіж</h5>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Спосіб оплати</Form.Label>
                                    <Form.Select
                                        value={newPayment.method}
                                        onChange={(e) => setNewPayment({...newPayment, method: e.target.value})}
                                    >
                                        <option value="Готівка">Готівка</option>
                                        <option value="Картка">Картка</option>
                                        <option value="Банківський переказ">Банківський переказ</option>
                                        <option value="Термінал">Термінал</option>
                                        <option value="Передоплата">Передоплата</option>
                                        <option value="Інше">Інше</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Сума (грн)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={newPayment.amount}
                                        onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                                        placeholder="Введіть суму"
                                        min="0"
                                        step="0.01"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Коментар</Form.Label>
                            <Form.Control
                                as="textarea"
                                value={newPayment.comment}
                                onChange={(e) => setNewPayment({...newPayment, comment: e.target.value})}
                                placeholder="Додаткова інформація про платіж"
                                rows={2}
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-end">
                            <Button
                                variant="secondary"
                                className="me-2"
                                onClick={() => setShowAddPayment(false)}
                            >
                                Скасувати
                            </Button>
                            <Button
                                variant="success"
                                onClick={handleAddPayment}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                        Зберігаємо...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check2-circle me-2"></i>
                                        Зберегти платіж
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Таблиця з історією платежів */}
                {loading && !showAddPayment ? (
                    <div className="text-center my-4">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : (
                    <div className="table-responsive">
                        {payments.length > 0 ? (
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th width="10%">#</th>
                                        <th width="20%">Дата</th>
                                        <th width="20%">Спосіб оплати</th>
                                        <th width="15%">Сума (грн)</th>
                                        <th width="25%">Коментар</th>
                                        <th width="10%">Дії</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(payments) && payments.map((payment, index) => (
                                        <tr key={payment.id}>
                                            <td>{index + 1}</td>
                                            <td>{formatDate(payment.createdAt)}</td>
                                            <td>
                                                {PaymentMethodIcons[payment.method]}
                                                {payment.method}
                                            </td>
                                            <td className="text-end fw-bold">{parseFloat(payment.amount).toFixed(2)}</td>
                                            <td>{payment.comment}</td>
                                            <td>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeletePayment(payment.id)}
                                                    title="Видалити платіж"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="table-light">
                                        <td colSpan="3" className="text-end fw-bold">Загалом:</td>
                                        <td className="text-end fw-bold">{calculateTotalPaid().toFixed(2)}</td>
                                        <td colSpan="2"></td>
                                    </tr>
                                </tbody>
                            </Table>
                        ) : (
                            <div className="text-center p-4 bg-light rounded">
                                <p className="mb-2">Історія платежів для цього замовлення порожня</p>
                                <Button
                                    variant="success"
                                    onClick={() => setShowAddPayment(true)}
                                >
                                    <i className="bi bi-plus-circle me-2"></i>
                                    Додати перший платіж
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Закрити
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default PaysInOrder;
