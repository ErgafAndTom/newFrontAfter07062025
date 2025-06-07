import React, { useState } from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Modal, Form, Button, Row, Col, InputGroup, Spinner, Alert } from "react-bootstrap";
import { BsPerson, BsEnvelope, BsTelephone, BsTelegram, BsGeoAlt } from "react-icons/bs";

function AddUserWindow({ show, onHide, onUserAdded }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validated, setValidated] = useState(false);
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        familyName: '',
        phoneNumber: '',
        email: '',
        telegramlogin: '',
        address: '',
        notes: '',
        discount: 0
    });

    // Форматування телефону при введенні
    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/[^+\d]/g, '');
        
        if (!value.startsWith('+')) {
            value = '+38' + value;
        }
        
        // Форматуємо номер телефону
        const formattedValue = value
            .replace(/^(\+\d{2})/, '$1 ')
            .replace(/(\d{3})(\d)/, '$1 $2')
            .replace(/(\d{3}) (\d{3})(\d)/, '$1 $2-$3')
            .replace(/-(\d{2})(\d{1,2})/, '-$1-$2');
            
        setUser({ ...user, phoneNumber: formattedValue.trim() });
    };

    // Обробка зміни полів форми
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    // Обробка відправки форми
    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        
        // Валідація форми
        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return;
        }
        
        setLoading(true);
        setError(null);
        console.log(user);

        axios.post('/user/create', user)
            .then(response => {
                setLoading(false);
                if (onUserAdded) {
                    onUserAdded(response.data);
                }
                onHide();
            })
            .catch(error => {
                setLoading(false);
                if (error.response && error.response.status === 403) {
                    navigate('/login');
                }
                setError(error.response?.data?.message || 'Помилка при додаванні клієнта');
                console.error('Помилка додавання клієнта:', error);
            });
    };

    return (
        <Modal 
            show={show} 
            onHide={onHide}
            size="lg"
            centered
            backdrop="static"
        >
            <Modal.Header closeButton>
                <Modal.Title>Додавання нового клієнта</Modal.Title>
            </Modal.Header>
            
            <Modal.Body>
                {error && (
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                )}
                
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Ім'я <span className="text-danger">*</span></Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><BsPerson /></InputGroup.Text>
                                    <Form.Control
                                        required
                                        type="text"
                                        name="firstName"
                                        value={user.firstName}
                                        onChange={handleChange}
                                        placeholder="Введіть ім'я"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Будь ласка, введіть ім'я клієнта
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                                <Form.Label>По батькові</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><BsPerson /></InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="lastName"
                                        value={user.lastName}
                                        onChange={handleChange}
                                        placeholder="Введіть по батькові"
                                    />
                                </InputGroup>
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                                <Form.Label>Прізвище <span className="text-danger">*</span></Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><BsPerson /></InputGroup.Text>
                                    <Form.Control
                                        required
                                        type="text"
                                        name="familyName"
                                        value={user.familyName}
                                        onChange={handleChange}
                                        placeholder="Введіть прізвище"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Будь ласка, введіть прізвище клієнта
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Номер телефону <span className="text-danger">*</span></Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><BsTelephone /></InputGroup.Text>
                                    <Form.Control
                                        required
                                        type="tel"
                                        name="phoneNumber"
                                        value={user.phoneNumber}
                                        onChange={handlePhoneChange}
                                        placeholder="+38 XXX XXX-XX-XX"
                                        maxLength="17"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Будь ласка, введіть номер телефону
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><BsEnvelope /></InputGroup.Text>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={user.email}
                                        onChange={handleChange}
                                        placeholder="email@example.com"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Будь ласка, введіть коректний email
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                                <Form.Label>Telegram</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><BsTelegram /></InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="telegramlogin"
                                        value={user.telegramlogin}
                                        onChange={handleChange}
                                        placeholder="username (без @)"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Адреса</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><BsGeoAlt /></InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        value={user.address}
                                        onChange={handleChange}
                                        placeholder="Введіть адресу"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>Примітки</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="notes"
                                    value={user.notes}
                                    onChange={handleChange}
                                    placeholder="Додаткова інформація про клієнта"
                                    style={{ height: '80px' }}
                                />
                            </Form.Group>
                        </Col>
                        
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Знижка (%)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="discount"
                                    value={user.discount}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Скасувати
                </Button>
                <Button 
                    variant="success" 
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            Зберігаємо...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-plus-circle me-1"></i>
                            Додати клієнта
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddUserWindow;
