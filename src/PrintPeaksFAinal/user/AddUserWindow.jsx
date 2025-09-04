import React, {useState} from "react";
import PropTypes from "prop-types";
import axios from "../../api/axiosInstance";
import {useNavigate} from "react-router-dom";
import {Modal, Form, Button, Row, Col, InputGroup, Spinner, Alert} from "react-bootstrap";
import {BsPerson, BsEnvelope, BsTelephone, BsTelegram, BsGeoAlt, BsPercent} from "react-icons/bs";
import dropDownList from "../tools/DropDownList";
import DropDownList from "../tools/DropDownList";
import NewPhoto from "../poslugi/NewPhoto";
import PaysInOrderRestoredForAdmin from "../userInNewUiArtem/pays/PaysInOrderRestoredForAdmin";
import {useSelector} from "react-redux";
import AddCompanyModal from "../company/AddCompanyModal";

function AddUserWindow({show, onHide, onUserAdded, addOrdOrOnlyClient, thisOrder, setThisOrder}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [validated, setValidated] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const userr = useSelector(state => state.auth.user);
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    familyName: '',
    phoneNumber: '',
    email: '',
    companyId: '',
    companyName: '',
    telegram: '',
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

    setUser({...user, phoneNumber: formattedValue.trim()});
  };

  // Обробка зміни полів форми
  const handleChange = (e) => {
    const {name, value} = e.target;
    setUser({...user, [name]: value});
  };

  const handleAddCompany = () => {
    setShowAddCompany(true);
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
    // console.log(user);
    let url = '/orders/createUserAndOrder'
    if (thisOrder === null || thisOrder === undefined || thisOrder.id === null || thisOrder.id === undefined || thisOrder.id === 0) {
      axios.post(url, user)
        .then(response => {
          // console.log(response.data);
          setLoading(false);
          if (onUserAdded) {
            onUserAdded(response.data);
          }
          navigate(`/Orders/${response.data.id}`);
          document.location(`/Orders/${response.data.id}`);
          onHide();
        })
        .catch(error => {
          setLoading(false);
          if (error.response && error.response.status === 403) {
            navigate('/login');

          }
          setError(error.response?.data?.message || 'Помилка при додаванні клієнта');
          // console.error('Помилка додавання клієнта:', error);
        });
    } else {
      url = '/orders/createUserAndUpdateOrder'
      let dataToSend = {
        user: user,
        orderId: thisOrder.id
      }
      axios.post(url, dataToSend)
        .then(response => {
          // console.log(response.data);
          setLoading(false);
          setThisOrder(response.data)
          onHide();
        })
        .catch(error => {
          setLoading(false);
          if (error.response && error.response.status === 403) {
            navigate('/login');

          }
          setError(error.response?.data?.message || 'Помилка при додаванні клієнта');
          // console.error('Помилка додавання клієнта:', error);
        });
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      // size="lg"
      // centered
      // backdrop="static"

    >
      <Modal.Header closeButton
                    style={{background: '#f2f0e7'}}
      >
        <Modal.Title>Додавання нового клієнта</Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{background: '#f2f0e7'}}
      >
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">

                <InputGroup>
                  <InputGroup.Text><BsPerson/></InputGroup.Text>
                  <Form.Control

                    type="text"
                    name="firstName"
                    value={user.firstName}
                    onChange={handleChange}
                    placeholder="Ім&apos;я"
                  />
                  <Form.Control.Feedback type="invalid">
                    Будь ласка, введіть ім&apos;я клієнта
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">

                <InputGroup>
                  <InputGroup.Text><BsPerson/></InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={user.lastName}
                    onChange={handleChange}
                    placeholder="По-батькові"
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">

                <InputGroup>
                  <InputGroup.Text><BsPerson/></InputGroup.Text>
                  <Form.Control
                    required
                    type="text"
                    name="familyName"
                    value={user.familyName}
                    onChange={handleChange}
                    placeholder="Прізвище"
                  />
                  <Form.Control.Feedback type="invalid">
                    Будь ласка, введіть прізвище клієнта
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">

                <InputGroup>
                  <InputGroup.Text><BsPercent/></InputGroup.Text>
                  <Form.Control
                    required
                    type="number"
                    name="discount"
                    min="0"
                    max="50"
                    step="1"
                    value={user.discount}
                    onChange={handleChange}
                    placeholder="Знижка (%)"
                  />
                  <Form.Control.Feedback type="invalid">
                    Будь ласка, введіть знижку клієнта
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              <div><DropDownList
                formData={user}
                setFormData={setUser}
                user={user}
                // thisOrder={thisOrder}
                // setThisOrder={setThisOrder}
                data={data}
                setData={setData}
              />
                <button
                  className="adminButtonAdd " style={{marginLeft:"1vw", height:"2rem"}}
                  onClick={handleAddCompany}
                >
                  Створити клієнта
                </button>
              </div>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">

                <InputGroup>
                  <InputGroup.Text><BsTelephone/></InputGroup.Text>
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

                <InputGroup>
                  <InputGroup.Text><BsGeoAlt/></InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="address"
                    value={user.address || ''}
                    onChange={handleChange}
                    placeholder="Введіть адресу"
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">

                <InputGroup>
                  <InputGroup.Text><BsEnvelope/></InputGroup.Text>
                  <Form.Control
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    placeholder="E-mail"
                  />
                  <Form.Control.Feedback type="invalid">
                    Будь ласка, введіть коректний email
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>


              <Form.Group className="mb-3">

                <InputGroup>
                  <InputGroup.Text><BsTelegram/></InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="telegram"
                    value={user.telegramlogin}
                    onChange={handleChange}
                    placeholder="@telegram"
                  />
                </InputGroup>
              </Form.Group>
              <Form.Group className="mb-3">

                {/*<InputGroup>*/}
                {/*  <InputGroup.Text><BsGeoAlt/></InputGroup.Text>*/}
                {/*  <Form.Control*/}
                {/*    type="text"*/}
                {/*    name="company"*/}
                {/*    value={user.company || ''}*/}
                {/*    onChange={handleChange}*/}
                {/*    placeholder="Назва компанії"*/}
                {/*  />*/}
                {/*</InputGroup>*/}

              </Form.Group>

            </Col>
          </Row>


          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">

                <Form.Control
                  as="textarea"
                  name="notes"
                  value={user.notes}
                  onChange={handleChange}
                  placeholder="Додаткова інформація про клієнта"
                  style={{height: '10vh', width: '31vw'}}
                />
              </Form.Group>

            </Col>

          </Row>
          <Modal.Footer>

            <Button
              variant="success"
              onClick={handleSubmit}
              className="adminButtonAdd"
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
                  <i className="bi adbi-plus-circle me-1"></i>
                  Додати клієнта
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
      {showAddCompany &&
        <AddCompanyModal user={userr} setShowAddCompany={setShowAddCompany} showAddCompany={showAddCompany} />
      }
    </Modal>
  );
}

AddUserWindow.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onUserAdded: PropTypes.func.isRequired
};

export default AddUserWindow;
