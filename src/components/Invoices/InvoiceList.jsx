import React, { useEffect, useState, useRef } from 'react';
import { Table, Button, Modal, Form, Spinner, ListGroup } from 'react-bootstrap';
import axios from "../../api/axiosInstance";
import { useNavigate } from 'react-router-dom';
import InvoiceFormItem from "./InvoiceFormItem";
import InvoicePrint from "./InvoicePrint";
import InvoicePrintModal from "./InvoicePrintModal";

const InvoiceList = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Стани для модальних вікон
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);

    // Стани для контрагентів
    const [contractors, setContractors] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [filteredBuyers, setFilteredBuyers] = useState([]);
    const [supplierSearch, setSupplierSearch] = useState('');
    const [buyerSearch, setBuyerSearch] = useState('');
    const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
    const [showBuyerDropdown, setShowBuyerDropdown] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState(null);
    // Форма для створення/редагування рахунку
    const [formData, setFormData] = useState({
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        supplierId: '',
        supplierName: '',
        buyerId: '',
        buyerName: '',
        totalSum: '',
        items: [
            // За замовчуванням додаємо один порожній елемент товару
            { id: 1, name: '', quantity: 1, price: 0, unit: 'шт.' }
        ]
    });

    // Стан для управління товарними позиціями
    const [itemCount, setItemCount] = useState(1);

    // Завантаження списку контрагентів при ініціалізації компонента
    useEffect(() => {
        const fetchContractors = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/contractors');
                setContractors(response.data);
                setFilteredSuppliers(response.data);
                setFilteredBuyers(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchContractors();
    }, []);

    // Функція для отримання відфільтрованих даних з сервера
    const fetchFilteredContractors = async (searchText, type) => {
        try {
            if (searchText.trim() === '') {
                if (type === 'supplier') {
                    setFilteredSuppliers(contractors);
                } else {
                    setFilteredBuyers(contractors);
                }
                return;
            }

            setLoading(true);
            const response = await axios.get(`/api/contractors/search?query=${encodeURIComponent(searchText)}`);

            if (type === 'supplier') {
                setFilteredSuppliers(response.data);
            } else {
                setFilteredBuyers(response.data);
            }
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Посилання для обробки кліків поза випадаючими списками
    const supplierRef = useRef(null);
    const buyerRef = useRef(null);

    // Обробник кліків поза випадаючими списками
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (supplierRef.current && !supplierRef.current.contains(event.target)) {
                setShowSupplierDropdown(false);
            }
            if (buyerRef.current && !buyerRef.current.contains(event.target)) {
                setShowBuyerDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Обробники введення тексту для пошуку контрагентів
    const handleSupplierSearchChange = (e) => {
        const value = e.target.value;
        setSupplierSearch(value);
        setShowSupplierDropdown(true);

        // Якщо рядок пошуку порожній, показуємо всіх контрагентів
        if (value.trim() === '') {
            setFilteredSuppliers(contractors);
        } else {
            // Інакше виконуємо пошук на сервері
            fetchFilteredContractors(value, 'supplier');
        }
    };

    const handleBuyerSearchChange = (e) => {
        const value = e.target.value;
        setBuyerSearch(value);
        setShowBuyerDropdown(true);

        // Якщо рядок пошуку порожній, показуємо всіх контрагентів
        if (value.trim() === '') {
            setFilteredBuyers(contractors);
        } else {
            // Інакше виконуємо пошук на сервері
            fetchFilteredContractors(value, 'buyer');
        }
    };

    // Обробники вибору контрагента зі списку
    const handleSelectSupplier = (contractor) => {
        setSupplierSearch(contractor.name);
        setFormData({
            ...formData,
            supplierId: contractor.id,
            supplierName: contractor.name
        });
        setShowSupplierDropdown(false);
    };

    const handleSelectBuyer = (contractor) => {
        setBuyerSearch(contractor.name);
        setFormData({
            ...formData,
            buyerId: contractor.id,
            buyerName: contractor.name
        });
        setShowBuyerDropdown(false);
    };

    const handlePrintInvoice = (invoice) => {
        setCurrentInvoice(invoice);
        setShowPrintModal(true);
    };

    // Поточний рахунок для операцій

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/invoices');
            setInvoices(response.data);
            setError(null);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    // Обробник для перегляду рахунку
    const handleViewInvoice = (invoice) => {
        setCurrentInvoice(invoice);
        setShowViewModal(true);
    };

    // Обробник для підготовки до редагування рахунку
    const handlePrepareEdit = (invoice) => {
        setCurrentInvoice(invoice);
        // Переконуємося, що у рахунку є масив товарів
        const invoiceItems = invoice.items && invoice.items.length > 0
            ? invoice.items
            : [{ id: 1, name: '', quantity: 1, price: 0, unit: 'шт.' }];

        // Встановлюємо лічильник елементів на основі найвищого ID
        const maxId = invoiceItems.reduce((max, item) => Math.max(max, item.id || 0), 0);
        setItemCount(maxId);

        setFormData({
            invoiceNumber: invoice.invoiceNumber,
            invoiceDate: invoice.invoiceDate,
            supplierId: invoice.supplierId,
            supplierName: invoice.supplierName,
            buyerId: invoice.buyerId,
            buyerName: invoice.buyerName,
            totalSum: invoice.totalSum,
            items: invoiceItems
        });
        setSupplierSearch(invoice.supplierName);
        setBuyerSearch(invoice.buyerName);
        setShowEditModal(true);
    };

    // Обробник для збереження редагованого рахунку
    const handleSaveEdit = async () => {
        try {
            setLoading(true);
            await axios.put(`/api/invoices/${currentInvoice.id}`, formData);
            setShowEditModal(false);
            fetchInvoices(); // Оновлюємо список після редагування
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Обробник для підготовки до видалення рахунку
    const handlePrepareDelete = (invoice) => {
        setCurrentInvoice(invoice);
        setShowDeleteModal(true);
    };

    // Обробник для видалення рахунку
    const handleConfirmDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/invoices/${currentInvoice.id}`);
            setShowDeleteModal(false);
            setInvoices(invoices.filter(invoice => invoice.id !== currentInvoice.id));
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Обробник для відкриття форми додавання нового рахунку
    const handleOpenAddModal = () => {
        // Скидаємо лічильник товарів
        setItemCount(1);

        setFormData({
            invoiceNumber: '',
            invoiceDate: new Date().toISOString().split('T')[0],
            supplierId: '',
            supplierName: '',
            buyerId: '',
            buyerName: '',
            totalSum: '0',
            items: [{ id: 1, name: '', quantity: 1, price: 0, unit: 'шт.' }]
        });
        setSupplierSearch('');
        setBuyerSearch('');
        setShowAddModal(true);
    };

    // Обробник для збереження нового рахунку
    const handleSaveNewInvoice = async () => {
        try {
            setLoading(true);
            const response = await axios.post('/api/invoices', formData);
            setInvoices([...invoices, response.data]);
            setShowAddModal(false);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Обробник для зміни полів форми
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Обробник для зміни полів товарів
    const handleItemChange = (e, index) => {
        const { name, value } = e.target;
        const updatedItems = [...formData.items];
        updatedItems[index] = {
            ...updatedItems[index],
            [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value
        };

        // Перерахунок загальної суми на основі товарних позицій
        const totalSum = updatedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        setFormData({
            ...formData,
            items: updatedItems,
            totalSum: totalSum.toFixed(2)
        });
    };

    // Додавання нової товарної позиції
    const handleAddItem = () => {
        setItemCount(itemCount + 1);
        setFormData({
            ...formData,
            items: [
                ...formData.items,
                { id: itemCount + 1, name: '', quantity: 1, price: 0, unit: 'шт.' }
            ]
        });
    };

    // Видалення товарної позиції
    const handleRemoveItem = (index) => {
        if (formData.items.length <= 1) {
            // Залишаємо хоча б один порожній елемент
            setFormData({
                ...formData,
                items: [{ id: 1, name: '', quantity: 1, price: 0, unit: 'шт.' }]
            });
            return;
        }

        const updatedItems = formData.items.filter((_, i) => i !== index);
        // Перерахунок загальної суми на основі товарних позицій
        const totalSum = updatedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        setFormData({
            ...formData,
            items: updatedItems,
            totalSum: totalSum.toFixed(2)
        });
    };

    // Функція для генерації документа накладної/акту
    const generateInvoiceDocument = async (invoice) => {
        try {
            setLoading(true);
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

            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center my-5">
            <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Завантаження...</span>
            </Spinner>
        </div>
    );

    if (error) return (
        <div className="alert alert-danger my-3" role="alert">
            <h4 className="alert-heading">Сталася помилка!</h4>
            <p>{error}</p>
            <hr />
            <Button variant="outline-danger" onClick={fetchInvoices}>
                Спробувати знову
            </Button>
        </div>
    );

    return (
        <div className="">


            {invoices.length === 0 ? (
                <div className="text-center p-5 bg-light rounded">
                    <p className="mb-3 text-muted">Немає рахунків для відображення</p>
                    <Button
                        variant="outline-primary"
                        onClick={handleOpenAddModal}
                    >
                        Створити перший рахунок
                    </Button>
                </div>
            ) : (
                <div className="table-responsive">
                    <Table striped bordered hover>
                        <thead className="table-light">
                        <tr>
                            <th>Номер рахунку</th>
                            <th>Дата</th>
                            <th>Постачальник</th>
                            <th>Покупець</th>
                            <th className="text-end">Сума</th>
                            <th className="text-center">Дії</th>
                        </tr>
                        </thead>
                        <tbody>
                        {invoices.map((invoice) => (
                            <tr key={invoice.id}>
                                <td>{invoice.invoiceNumber}</td>
                                <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                                <td>{invoice.supplierName}</td>
                                <td>{invoice.buyerName}</td>
                                <td className="text-end fw-bold">{parseFloat(invoice.totalSum).toLocaleString('uk-UA')} грн</td>
                                <td className="text-center">
                                    <Button
                                        variant="light"
                                        size="sm"
                                        className="p-1 border-0 me-1"
                                        style={{ width: '18px', height: '18px', backgroundColor: '#007bff', borderRadius: '50%' }}
                                        onClick={() => handleViewInvoice(invoice)}
                                        title="Переглянути"
                                    >
                                        <i className="bi bi-eye" style={{ fontSize: '10px', color: 'white' }}></i>
                                    </Button>

                                    <Button
                                        variant="light"
                                        size="sm"
                                        className="p-1 border-0 me-1"
                                        style={{ width: '18px', height: '18px', backgroundColor: '#0d6efd', borderRadius: '50%' }}
                                        onClick={() => handlePrintInvoice(invoice)}
                                        title="Друкувати"
                                    >
                                        <i className="bi bi-printer" style={{ fontSize: '10px', color: 'white' }}></i>
                                    </Button>

                                    <Button
                                        variant="light"
                                        size="sm"
                                        className="p-1 border-0 me-1"
                                        style={{ width: '18px', height: '18px', backgroundColor: '#198754', borderRadius: '50%' }}
                                        onClick={() => handlePrepareEdit(invoice)}
                                        title="Редагувати"
                                    >
                                        <i className="bi bi-pencil" style={{ fontSize: '10px', color: 'white' }}></i>
                                    </Button>

                                    <Button
                                        variant="light"
                                        size="sm"
                                        className="p-1 border-0"
                                        style={{ width: '18px', height: '18px', backgroundColor: '#dc3545', borderRadius: '50%' }}
                                        onClick={() => handlePrepareDelete(invoice)}
                                        title="Видалити"
                                    >
                                        <i className="bi bi-trash" style={{ fontSize: '10px', color: 'white' }}></i>
                                    </Button>

                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </div>
            )}
            {/* Кнопка додавання перенесена вгору сторінки */}

            {/* Модальне вікно для перегляду рахунку */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Перегляд рахунку</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentInvoice && (
                        <div>
                            <p><strong>Номер рахунку:</strong> {currentInvoice.invoiceNumber}</p>
                            <p><strong>Дата:</strong> {new Date(currentInvoice.invoiceDate).toLocaleDateString()}</p>
                            <p><strong>Постачальник:</strong> {currentInvoice.supplierName}</p>
                            <p><strong>Покупець:</strong> {currentInvoice.buyerName}</p>
                            <p><strong>Сума:</strong> {currentInvoice.totalSum} грн</p>

                            <h5 className="mt-3">Товари/Послуги:</h5>
                            <Table striped bordered hover size="sm">
                                <thead>
                                <tr>
                                    <th>Найменування</th>
                                    <th>Кількість</th>
                                    <th>Ціна</th>
                                    <th>Сума</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentInvoice.items && currentInvoice.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.price} грн</td>
                                        <td>{item.quantity * item.price} грн</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>

                            <Button
                                variant="primary"
                                onClick={() => generateInvoiceDocument(currentInvoice)}
                                className="mt-3"
                            >
                                Згенерувати документ
                            </Button>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                        Закрити
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Модальне вікно для редагування рахунку */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Редагування рахунку</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Номер рахунку</Form.Label>
                            <Form.Control
                                type="text"
                                name="invoiceNumber"
                                value={formData.invoiceNumber}
                                onChange={handleFormChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Дата</Form.Label>
                            <Form.Control
                                type="date"
                                name="invoiceDate"
                                value={formData.invoiceDate}
                                onChange={handleFormChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Постачальник</Form.Label>
                            <div ref={supplierRef} className="position-relative">
                                <Form.Control
                                    type="text"
                                    value={supplierSearch}
                                    onChange={handleSupplierSearchChange}
                                    onClick={() => setShowSupplierDropdown(true)}
                                    placeholder="Введіть назву постачальника або виберіть зі списку"
                                />
                                {showSupplierDropdown && (
                                    <ListGroup
                                        className="position-absolute w-100"
                                        style={{
                                            maxHeight: '300px',
                                            overflowY: 'auto',
                                            zIndex: 1000,
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {filteredSuppliers.length > 0 ? (
                                            filteredSuppliers.map(contractor => (
                                                <ListGroup.Item
                                                    key={contractor.id}
                                                    action
                                                    onClick={() => handleSelectSupplier(contractor)}
                                                    style={{ cursor: 'pointer', padding: '8px 12px' }}
                                                >
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{contractor.name}</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: '0.75rem', color: '#555' }}>
                                                        <div style={{ marginRight: '8px' }}>ID: {contractor.id}</div>
                                                        {contractor.edrpou && <div style={{ marginRight: '8px' }}>ЄДРПОУ: {contractor.edrpou}</div>}
                                                        {contractor.taxSystem && <div style={{ marginRight: '8px' }}>Система оподаткування: {contractor.taxSystem}</div>}
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: '0.75rem', color: '#555' }}>
                                                        {contractor.address && <div style={{ marginRight: '8px' }}>Адреса: {contractor.address}</div>}
                                                        {contractor.phone && <div style={{ marginRight: '8px' }}>Тел.: {contractor.phone}</div>}
                                                        {contractor.email && <div style={{ marginRight: '8px' }}>Email: {contractor.email}</div>}
                                                    </div>
                                                </ListGroup.Item>
                                            ))
                                        ) : (
                                            <ListGroup.Item>Немає результатів</ListGroup.Item>
                                        )}
                                    </ListGroup>
                                )}
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Покупець</Form.Label>
                            <div ref={buyerRef} className="position-relative">
                                <Form.Control
                                    type="text"
                                    value={buyerSearch}
                                    onChange={handleBuyerSearchChange}
                                    onClick={() => setShowBuyerDropdown(true)}
                                    placeholder="Введіть назву покупця або виберіть зі списку"
                                />
                                {showBuyerDropdown && (
                                    <ListGroup
                                        className="position-absolute w-100"
                                        style={{
                                            maxHeight: '300px',
                                            overflowY: 'auto',
                                            zIndex: 1000,
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {filteredBuyers.length > 0 ? (
                                            filteredBuyers.map(contractor => (
                                                <ListGroup.Item
                                                    key={contractor.id}
                                                    action
                                                    onClick={() => handleSelectBuyer(contractor)}
                                                    style={{ cursor: 'pointer', padding: '8px 12px' }}
                                                >
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{contractor.name}</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: '0.75rem', color: '#555' }}>
                                                        <div style={{ marginRight: '8px' }}>ID: {contractor.id}</div>
                                                        {contractor.edrpou && <div style={{ marginRight: '8px' }}>ЄДРПОУ: {contractor.edrpou}</div>}
                                                        {contractor.taxSystem && <div style={{ marginRight: '8px' }}>Система оподаткування: {contractor.taxSystem}</div>}
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: '0.75rem', color: '#555' }}>
                                                        {contractor.address && <div style={{ marginRight: '8px' }}>Адреса: {contractor.address}</div>}
                                                        {contractor.phone && <div style={{ marginRight: '8px' }}>Тел.: {contractor.phone}</div>}
                                                        {contractor.email && <div style={{ marginRight: '8px' }}>Email: {contractor.email}</div>}
                                                    </div>
                                                </ListGroup.Item>
                                            ))
                                        ) : (
                                            <ListGroup.Item>Немає результатів</ListGroup.Item>
                                        )}
                                    </ListGroup>
                                )}
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Сума</Form.Label>
                            <Form.Control
                                type="number"
                                name="totalSum"
                                value={formData.totalSum}
                                onChange={handleFormChange}
                                readOnly={formData.items && formData.items.length > 0}
                            />
                            {formData.items && formData.items.length > 0 && (
                                <Form.Text className="text-muted">
                                    Сума розраховується автоматично на основі товарів
                                </Form.Text>
                            )}
                        </Form.Group>

                        {/* Управління товарами/послугами */}
                        <h5 className="mt-4 mb-3">Товари/Послуги</h5>

                        {formData.items.map((item, index) => (
                            <InvoiceFormItem
                                key={index}
                                item={item}
                                index={index}
                                onItemChange={handleItemChange}
                                onRemoveItem={handleRemoveItem}
                            />
                        ))}

                        <div className="d-flex justify-content-center mb-3">
                            <Button
                                variant="outline-primary"
                                onClick={handleAddItem}
                            >
                                + Додати товар/послугу
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Скасувати
                    </Button>
                    <Button variant="primary" onClick={handleSaveEdit}>
                        Зберегти зміни
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Модальне вікно для видалення рахунку */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Підтвердження видалення</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentInvoice && (
                        <p>
                            Ви дійсно хочете видалити рахунок №{currentInvoice.invoiceNumber}
                            від {new Date(currentInvoice.invoiceDate).toLocaleDateString()} на суму {currentInvoice.totalSum} грн?
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Скасувати
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>
                        Видалити
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Модальне вікно для додавання нового рахунку */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Додати новий рахунок</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Номер рахунку</Form.Label>
                            <Form.Control
                                type="text"
                                name="invoiceNumber"
                                value={formData.invoiceNumber}
                                onChange={handleFormChange}
                                placeholder="Введіть номер рахунку"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Дата</Form.Label>
                            <Form.Control
                                type="date"
                                name="invoiceDate"
                                value={formData.invoiceDate}
                                onChange={handleFormChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Постачальник</Form.Label>
                            <div ref={supplierRef} className="position-relative">
                                <Form.Control
                                    type="text"
                                    value={supplierSearch}
                                    onChange={handleSupplierSearchChange}
                                    onClick={() => setShowSupplierDropdown(true)}
                                    placeholder="Введіть назву постачальника або виберіть зі списку"
                                />

                                {showSupplierDropdown && (
                                    <ListGroup
                                        className="position-absolute w-100"
                                        style={{
                                            maxHeight: '300px',
                                            overflowY: 'auto',
                                            zIndex: 1000,
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {filteredSuppliers.length > 0 ? (
                                            filteredSuppliers.map(contractor => (
                                                <ListGroup.Item
                                                    key={contractor.id}
                                                    action
                                                    onClick={() => handleSelectSupplier(contractor)}
                                                    style={{ cursor: 'pointer', padding: '8px 12px' }}
                                                >
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{contractor.name}</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: '0.75rem', color: '#555' }}>
                                                        <div style={{ marginRight: '8px' }}>ID: {contractor.id}</div>
                                                        {contractor.edrpou && <div style={{ marginRight: '8px' }}>ЄДРПОУ: {contractor.edrpou}</div>}
                                                        {contractor.taxSystem && <div style={{ marginRight: '8px' }}>Система оподаткування: {contractor.taxSystem}</div>}
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: '0.75rem', color: '#555' }}>
                                                        {contractor.address && <div style={{ marginRight: '8px' }}>Адреса: {contractor.address}</div>}
                                                        {contractor.phone && <div style={{ marginRight: '8px' }}>Тел.: {contractor.phone}</div>}
                                                        {contractor.email && <div style={{ marginRight: '8px' }}>Email: {contractor.email}</div>}
                                                    </div>
                                                </ListGroup.Item>
                                            ))
                                        ) : (
                                            <ListGroup.Item>Немає результатів</ListGroup.Item>
                                        )}
                                    </ListGroup>
                                )}
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Покупець</Form.Label>
                            <div ref={buyerRef} className="position-relative">
                                <Form.Control
                                    type="text"
                                    value={buyerSearch}
                                    onChange={handleBuyerSearchChange}
                                    onClick={() => setShowBuyerDropdown(true)}
                                    placeholder="Введіть назву покупця або виберіть зі списку"
                                />
                                {showBuyerDropdown && (
                                    <ListGroup
                                        className="position-absolute w-100"
                                        style={{
                                            maxHeight: '300px',
                                            overflowY: 'auto',
                                            zIndex: 1000,
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {filteredBuyers.length > 0 ? (
                                            filteredBuyers.map(contractor => (
                                                <ListGroup.Item
                                                    key={contractor.id}
                                                    action
                                                    onClick={() => handleSelectBuyer(contractor)}
                                                    style={{ cursor: 'pointer', padding: '8px 12px' }}
                                                >
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{contractor.name}</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: '0.75rem', color: '#555' }}>
                                                        <div style={{ marginRight: '8px' }}>ID: {contractor.id}</div>
                                                        {contractor.edrpou && <div style={{ marginRight: '8px' }}>ЄДРПОУ: {contractor.edrpou}</div>}
                                                        {contractor.taxSystem && <div style={{ marginRight: '8px' }}>Система оподаткування: {contractor.taxSystem}</div>}
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: '0.75rem', color: '#555' }}>
                                                        {contractor.address && <div style={{ marginRight: '8px' }}>Адреса: {contractor.address}</div>}
                                                        {contractor.phone && <div style={{ marginRight: '8px' }}>Тел.: {contractor.phone}</div>}
                                                        {contractor.email && <div style={{ marginRight: '8px' }}>Email: {contractor.email}</div>}
                                                    </div>
                                                </ListGroup.Item>
                                            ))
                                        ) : (
                                            <ListGroup.Item>Немає результатів</ListGroup.Item>
                                        )}
                                    </ListGroup>
                                )}
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Сума</Form.Label>
                            <Form.Control
                                type="number"
                                name="totalSum"
                                value={formData.totalSum}
                                onChange={handleFormChange}
                                placeholder="Введіть загальну суму"
                            />
                        </Form.Group>

                        {/* Тут можна додати управління товарами/послугами */}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                        Скасувати
                    </Button>
                    <Button variant="primary" onClick={handleSaveNewInvoice}>
                        Зберегти
                    </Button>
                </Modal.Footer>
            </Modal>
            <div className="d-flex justify-content-between align-items-center mb-3">

                <Button className="adminButtonAdd"
                        variant="danger"
                        onClick={handleOpenAddModal}
                >

                    Додати новий рахунок
                </Button>
            </div>
                            {/* Модальне вікно для друку рахунку */}
                            <InvoicePrintModal
                show={showPrintModal}
                onHide={() => setShowPrintModal(false)}
                invoice={currentInvoice}
                            />
        </div>
    );
};

export default InvoiceList;
