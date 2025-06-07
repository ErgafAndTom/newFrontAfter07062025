import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import counterpartyApi from '../../api/counterpartyApi';
import {
    Container, Row, Col, Card, Button, Modal, Form,
    ListGroup, Badge, Spinner, Alert, InputGroup
} from 'react-bootstrap';
import {BsBuilding, BsPerson, BsSearch, BsPencil, BsTrash, BsPlus} from 'react-icons/bs';
import AddPaysInOrder from "../../PrintPeaksFAinal/userInNewUiArtem/pays/AddPayInOrder";

const Counterparty = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const [counterparties, setCounterparties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentCounterparty, setCurrentCounterparty] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');


    const [showAddPay, setShowAddPay] = useState(false);
    const [showAddPayView, setShowAddPayView] = useState(false);
    const [showAddPayWriteId, setShowAddPayWriteId] = useState(false);
    const [load, setLoad] = useState(false);
    const [data, setData] = useState(null);
    // const [formData, setFormData] = useState({
    //     name: '',
    //     address: '',
    //     bankName: '',
    //     iban: '',
    //     edrpou: '',
    //     email: '',
    //     phone: '',
    //     taxSystem: '',
    //     comment: '',
    // });


    const [formData, setFormData] = useState({
        name: '',
        type: 'legal', // legal or individual
        code: '', // ЄДРПОУ or ІПН
        address: '',
        contactPerson: {
            name: '',
            position: '',
            phone: '',
            email: ''
        },
        bankDetails: {
            bankName: '',
            mfo: '',
            account: ''
        },
        notes: ''
    });
    const [validated, setValidated] = useState(false);

    const [inPageCount, setInPageCount] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(null);
    const [typeSelect, setTypeSelect] = useState("");
    const [thisColumn, setThisColumn] = useState({
        column: "id",
        reverse: false
    });

    // Завантаження контрагентів користувача
    useEffect(() => {
        if (user && user.id) {
            fetchCounterparties();
        }
    }, [user, searchTerm]);

    const fetchCounterparties = async () => {
        setLoading(true);
        setError(null);
        let getData = {
            inPageCount: inPageCount,
            currentPage: currentPage,
            search: searchTerm,
            columnName: thisColumn,
        }
        try {
            const response = await counterpartyApi.getCounterparties(user.id, getData);
            console.log(response.data.rows);
            setCounterparties(response.data.rows || []);
            setLoading(false);
        } catch (err) {
            setError('Помилка при завантаженні контрагентів: ' + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    // Фільтрація контрагентів за пошуковим запитом
    // const filteredCounterparties = counterparties.filter(cp =>
    //   cp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //   cp.code.includes(searchTerm) ||
    //   cp.contactPerson.name.toLowerCase().includes(searchTerm.toLowerCase())
    // );
    const filteredCounterparties = counterparties


    // Обробники форми
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData({
                ...formData,
                [parent]: {
                    ...formData[parent],
                    [child]: value
                }
            });
        } else {
            setFormData({...formData, [name]: value});
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'legal',
            code: '',
            address: '',
            contactPerson: {
                name: '',
                position: '',
                phone: '',
                email: ''
            },
            bankDetails: {
                bankName: '',
                mfo: '',
                account: ''
            },
            notes: ''
        });
        setValidated(false);
    };

    // Додавання нового контрагента
    const handleAddCounterparty = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await counterpartyApi.addCounterparty(user.id, formData);
            setCounterparties([...counterparties, response.data]);
            setShowAddModal(false);
            resetForm();
            setLoading(false);
        } catch (err) {
            setError('Помилка при додаванні контрагента: ' + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    // Редагування контрагента
    const handleEditCounterparty = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await counterpartyApi.updateCounterparty(user.id, currentCounterparty.id, formData);
            setCounterparties(counterparties.map(cp => cp.id === currentCounterparty.id ? response.data : cp));
            setShowEditModal(false);
            resetForm();
            setLoading(false);
        } catch (err) {
            setError('Помилка при редагуванні контрагента: ' + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    // Видалення контрагента
    const handleDeleteCounterparty = async () => {
        setLoading(true);
        setError(null);

        try {
            await counterpartyApi.deleteCounterparty(user.id, currentCounterparty.id);
            setCounterparties(counterparties.filter(cp => cp.id !== currentCounterparty.id));
            setShowDeleteModal(false);
            setLoading(false);
        } catch (err) {
            setError('Помилка при видаленні контрагента: ' + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    // Відкриття модального вікна для редагування
    const openEditModal = (counterparty) => {
        setCurrentCounterparty(counterparty);
        setFormData({
            name: counterparty.name,
            type: counterparty.type,
            code: counterparty.code,
            address: counterparty.address,
            contactPerson: {...counterparty.contactPerson},
            bankDetails: {...counterparty.bankDetails},
            notes: counterparty.notes
        });
        setShowEditModal(true);
    };

    // Відкриття модального вікна для видалення
    const openDeleteModal = (counterparty) => {
        setCurrentCounterparty(counterparty);
        setShowDeleteModal(true);
    };

    // Форма для додавання/редагування контрагента
    const counterpartyForm = (handleSubmit) => (
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Назва/ПІБ <span className="text-danger">*</span></Form.Label>
                        <InputGroup>
                            <InputGroup.Text>
                                {formData.type === 'legal' ? <BsBuilding/> : <BsPerson/>}
                            </InputGroup.Text>
                            <Form.Control
                                required
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Введіть назву або ПІБ"
                            />
                            <Form.Control.Feedback type="invalid">
                                Будь ласка, введіть назву контрагента
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Тип контрагента <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                            required
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                        >
                            <option value="legal">Юридична особа</option>
                            <option value="individual">Фізична особа-підприємець</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>
                            {formData.type === 'legal' ? 'ЄДРПОУ' : 'ІПН'} <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            required
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            placeholder={formData.type === 'legal' ? 'Введіть ЄДРПОУ' : 'Введіть ІПН'}
                        />
                        <Form.Control.Feedback type="invalid">
                            Будь ласка, введіть {formData.type === 'legal' ? 'ЄДРПОУ' : 'ІПН'}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Адреса</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Введіть адресу"
                            rows={2}
                        />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Card className="mb-3">
                        <Card.Header>Контактна особа</Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-2">
                                <Form.Label>ПІБ</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="contactPerson.name"
                                    value={formData.contactPerson.name}
                                    onChange={handleInputChange}
                                    placeholder="Введіть ПІБ контактної особи"
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Посада</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="contactPerson.position"
                                    value={formData.contactPerson.position}
                                    onChange={handleInputChange}
                                    placeholder="Введіть посаду"
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Телефон</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="contactPerson.phone"
                                    value={formData.contactPerson.phone}
                                    onChange={handleInputChange}
                                    placeholder="+38 XXX XXX-XX-XX"
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="contactPerson.email"
                                    value={formData.contactPerson.email}
                                    onChange={handleInputChange}
                                    placeholder="email@example.com"
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={12}>
                    <Card className="mb-3">
                        <Card.Header>Банківські реквізити</Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Назва банку</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="bankDetails.bankName"
                                            value={formData.bankDetails.bankName}
                                            onChange={handleInputChange}
                                            placeholder="Введіть назву банку"
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>МФО</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="bankDetails.mfo"
                                            value={formData.bankDetails.mfo}
                                            onChange={handleInputChange}
                                            placeholder="Введіть МФО"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-2">
                                <Form.Label>Розрахунковий рахунок</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="bankDetails.account"
                                    value={formData.bankDetails.account}
                                    onChange={handleInputChange}
                                    placeholder="Введіть розрахунковий рахунок"
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>Примітки</Form.Label>
                <Form.Control
                    as="textarea"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Додаткова інформація про контрагента"
                    rows={2}
                />
            </Form.Group>
        </Form>
    );

    return (
        <div className="mt-4">
            <h2 className="mb-4">Мої контрагенти</h2>

            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            <Row className="mb-3">
                <Col md={6}>
                    <InputGroup>
                        <InputGroup.Text><BsSearch/></InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Пошук за назвою, кодом або контактною особою"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={6} className="text-end">
                    <Button
                        variant="primary"
                        onClick={() => {
                            resetForm();
                            setShowAddModal(true);
                        }}
                    >
                        <BsPlus className="me-1"/> Додати контрагента
                    </Button>
                </Col>
            </Row>

            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="primary"/>
                    <p className="mt-2">Завантаження контрагентів...</p>
                </div>
            ) : filteredCounterparties.length === 0 ? (
                <Card className="text-center p-5">
                    <Card.Body>
                        <Card.Title>Контрагентів не знайдено</Card.Title>
                        <Card.Text>
                            {searchTerm ?
                                'За вашим запитом не знайдено жодного контрагента. Спробуйте змінити параметри пошуку.' :
                                'У вас ще немає доданих контрагентів. Натисніть кнопку "Додати контрагента", щоб створити першого.'}
                        </Card.Text>
                        <Button
                            variant="primary"
                            onClick={() => {
                                resetForm();
                                setShowAddModal(true);
                            }}
                        >
                            <BsPlus className="me-1"/> Додати контрагента
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <ListGroup>
                    {filteredCounterparties.map((counterparty) => (
                        <ListGroup.Item key={counterparty.id} className="mb-2">
                            <Row>
                                <Col md={8}>
                                    <h5>
                                        {counterparty.name}
                                        <Badge
                                            bg={counterparty.type === 'legal' ? 'primary' : 'info'}
                                            className="ms-2"
                                        >
                                            {counterparty.type === 'legal' ? 'Юридична особа' : 'ФОП'}
                                        </Badge>
                                    </h5>
                                    <p className="mb-1">
                                        <strong>{counterparty.type === 'legal' ? 'ЄДРПОУ: ' : 'ІПН: '}</strong>
                                        {counterparty.code}
                                    </p>
                                    {counterparty.address && (
                                        <p className="mb-1"><strong>Адреса:</strong> {counterparty.address}</p>
                                    )}
                                    {/*{counterparty.contactPerson.name && (*/}
                                    {/*  <p className="mb-1">*/}
                                    {/*    <strong>Контактна особа:</strong> {counterparty.contactPerson.name}*/}
                                    {/*    {counterparty.contactPerson.position && `, ${counterparty.contactPerson.position}`}*/}
                                    {/*    {counterparty.contactPerson.phone && `, ${counterparty.contactPerson.phone}`}*/}
                                    {/*  </p>*/}
                                    {/*)}*/}
                                    {/*{counterparty.bankDetails.bankName && (*/}
                                    {/*  <p className="mb-1">*/}
                                    {/*    <strong>Банк:</strong> {counterparty.bankDetails.bankName}*/}
                                    {/*    {counterparty.bankDetails.mfo && `, МФО: ${counterparty.bankDetails.mfo}`}*/}
                                    {/*  </p>*/}
                                    {/*)}*/}
                                    {/*{counterparty.bankDetails.account && (*/}
                                    {/*  <p className="mb-1"><strong>Р/р:</strong> {counterparty.bankDetails.account}</p>*/}
                                    {/*)}*/}
                                </Col>
                                <Col md={4} className="text-end">
                                    <Button
                                        variant="outline-primary"
                                        className="me-2"
                                        onClick={() => openEditModal(counterparty)}
                                    >
                                        <BsPencil/> Редагувати
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        onClick={() => openDeleteModal(counterparty)}
                                    >
                                        <BsTrash/> Видалити
                                    </Button>
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            {/* Модальне вікно для додавання контрагента */}
            <Modal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Додавання нового контрагента</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {counterpartyForm(handleAddCounterparty)}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                        Скасувати
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleAddCounterparty}
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
                                Збереження...
                            </>
                        ) : (
                            <>Додати контрагента</>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Модальне вікно для редагування контрагента */}
            <Modal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Редагування контрагента</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {counterpartyForm(handleEditCounterparty)}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Скасувати
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleEditCounterparty}
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
                                Збереження...
                            </>
                        ) : (
                            <>Зберегти зміни</>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Модальне вікно для видалення контрагента */}
            <Modal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Видалення контрагента</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Ви дійсно хочете видалити контрагента "{currentCounterparty?.name}"?</p>
                    <p className="text-danger">Ця дія незворотна.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Скасувати
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDeleteCounterparty}
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
                                Видалення...
                            </>
                        ) : (
                            <>Видалити</>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
            {/*{showAddPay &&*/}
            {/*    <div style={{}} className="">*/}
            {/*        <AddPaysInOrder*/}
            {/*            showAddPay={showAddPay}*/}
            {/*            setShowAddPay={setShowAddPay}*/}
            {/*            formData={formData}*/}
            {/*            setFormData={setFormData}*/}
            {/*            thisOrder={thisOrder}*/}
            {/*            setThisOrder={setThisOrder}*/}
            {/*            data={data}*/}
            {/*            setData={setData}*/}
            {/*            showAddPayView={showAddPayView}*/}
            {/*            setShowAddPayView={setShowAddPayView}*/}
            {/*            showAddPayWriteId={showAddPayWriteId}*/}
            {/*            setShowAddPayWriteId={setShowAddPayWriteId}*/}
            {/*        />*/}
            {/*    </div>*/}
            {/*}*/}

        </div>
    );
};

export default Counterparty;
