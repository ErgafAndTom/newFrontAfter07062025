// import "AddUserWindow.css"
import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import axios from "../../api/axiosInstance";
import {useNavigate} from "react-router-dom";
import {Form, Button, Row, Col, InputGroup, Spinner, Alert} from "react-bootstrap";
import {BsPerson, BsEnvelope, BsTelephone, BsTelegram, BsGeoAlt, BsPercent, BsX} from "react-icons/bs";
import DropDownList from "../tools/DropDownList";
import {useSelector} from "react-redux";
import AddCompanyModal from "../company/AddCompanyModal";

// ключ: используем те же стили и геометрию, что у ClientSelectionModal
import "../userInNewUiArtem/ClientSelectionModal.css";

function AddUserWindow({show, onHide, onUserAdded, addOrdOrOnlyClient, thisOrder, setThisOrder, presetCompany }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [validated, setValidated] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const userr = useSelector(state => state.auth.user);

  const [user, setUser] = useState({
    firstName:'', lastName:'', familyName:'', phoneNumber:'', email:'',
    companyId: presetCompany?.id || '', companyName: presetCompany?.name || '',
    telegram:'', address:'', notes:'', discount: 0
  });
  useEffect(()=>{
    if (presetCompany?.id) {
      setUser(prev=>({ ...prev, companyId: presetCompany.id, companyName: presetCompany.name }));
    }
  }, [presetCompany]);

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^+\d]/g, '');
    if (!value.startsWith('+')) value = '+38' + value;
    const formattedValue = value
      .replace(/^(\+\d{2})/, '$1 ')
      .replace(/(\d{3})(\d)/, '$1 $2')
      .replace(/(\d{3}) (\d{3})(\d)/, '$1 $2-$3')
      .replace(/-(\d{2})(\d{1,2})/, '-$1-$2');
    setUser(prev => ({...prev, phoneNumber: formattedValue.trim()}));
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
    setUser(prev => ({...prev, [name]: value}));
  };

  const handleAddCompany = (e) => {
    e.preventDefault();
    setShowAddCompany(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    setError(null);

    let url = '/orders/createUserAndOrder';
    if (!thisOrder || !thisOrder.id) {
      console.log(user);
      axios.post(url, user)
        .then(response => {
          setLoading(false);
          onUserAdded && onUserAdded(response.data);
          navigate(`/Orders/${response.data.id}`);
          onHide();
        })
        .catch(error => {
          setLoading(false);
          if (error.response && error.response.status === 403) navigate('/login');
          setError(error.response?.data?.message || 'Помилка при додаванні клієнта');
        });
    } else {
      url = '/orders/createUserAndUpdateOrder';
      const dataToSend = { user, orderId: thisOrder.id };
      axios.post(url, dataToSend)
        .then(response => {
          setLoading(false);
          setThisOrder && setThisOrder(response.data);
          onHide();
        })
        .catch(error => {
          setLoading(false);
          if (error.response && error.response.status === 403) navigate('/login');
          setError(error.response?.data?.message || 'Помилка при додаванні клієнта');
        });
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Оверлей как у ClientSelectionModal */}
      <div
        className="modalOverlay"
        onClick={onHide}
        style={{
          position: 'fixed',
          inset: 0,
          width: '200vw',
          height: '200vh',
          left: "-31.5vw",
          top:"-2vh",
          backgroundColor: 'rgba(15,15,15,0.45)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          zIndex: 99,
          transition: 'opacity 200ms ease'
        }}
      />
      {/* Контейнер в том же месте и размере */}
      <div className="modalContainer animate-slide-up" style={{
        bottom:"25%",
        left:"35%",
        borderRadius: '12px',
      }}>
        {/* Заголовок */}


        {/* Тіло з тими ж кольорами і прокруткою */}
        <div className="noScrollbar" style={{background:'#f2f0e7'}}>
          {error && (
            <div style={{padding: '0.8rem'}}>
              <Alert variant="danger" onClose={() => setError(null)} dismissible>
                {error}
              </Alert>
            </div>
          )}
<div
  style={{
  position: "absolute",
  top: "20vh",
  left: "15vw",
  transform: "translate(-50%, -50%)",
  fontSize: "20vw",       // великий розмір
  opacity:"0.08",
  pointerEvents: "none",  // щоб не заважала клікам
  zIndex: 0
}}>🤖
</div>
          <Form noValidate validated={validated} onSubmit={handleSubmit} style={{padding: '0.8rem'}}>
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
                      placeholder="Імʼя"
                    />
                    <Form.Control.Feedback type="invalid">
                      Будь ласка, введіть імʼя клієнта
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
                      // required
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
                      // required
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

                <div>Місце роботи</div>
                {presetCompany?.id ? (
                  <div className="d-flex align-items-center" style={{gap:"0.5rem"}}>
                    <span className="badge bg-success">Компанія: {presetCompany.name} (id: {presetCompany.id})</span>
                  </div>
                ) : (
                  <div>
                    <DropDownList
                    formData={user}
                    setFormData={setUser}
                    user={user}
                    data={data}
                    setData={setData}
                  />
                    <div className="d-flex flex-row align-items-center" style={{width:"30vw"}}>
                      <div>Якщо у списку немає компанії, то можна ось тут</div>
                      <button
                        type="button"
                        className="adminButtonAdd"
                        style={{marginLeft:"0.3vw"}}
                        onClick={handleAddCompany}
                      >
                        Додати компанію
                      </button>
                    </div>
                  </div>
                )}
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <InputGroup>
                    <InputGroup.Text><BsTelephone/></InputGroup.Text>
                    <Form.Control
                      // required
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
                      value={user.telegram || ''}
                      onChange={handleChange}
                      placeholder="@telegram"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    name="notes"
                    value={user.notes}
                    onChange={handleChange}
                    placeholder="Додаткова інформація про клієнта"
                    style={{height: '12vh', width: '100%'}}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end" style={{gap:'0.6rem'}}>
              {/*<Button*/}
              {/*  type="button"*/}
              {/*  variant="secondary"*/}
              {/*  className="adminButtonAdd"*/}
              {/*  onClick={onHide}*/}
              {/*  disabled={loading}*/}
              {/*>*/}
              {/*  Закрити*/}
              {/*</Button>*/}
              <Button
                type="submit"
                variant="success"
                className="adminButtonAdd d-flex justify-content-center align-items-center"
                style={{justifyContent:"center", width:"30vw"}}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Зберігаємо...
                  </>
                ) : (
                  <>Додати клієнта</>
                )}
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {showAddCompany &&
        <AddCompanyModal
          user={userr}
          setShowAddCompany={setShowAddCompany}
          showAddCompany={showAddCompany}
        />
      }
    </>
  );
}

AddUserWindow.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onUserAdded: PropTypes.func,
  addOrdOrOnlyClient: PropTypes.any,
  thisOrder: PropTypes.any,
  setThisOrder: PropTypes.func
};

export default AddUserWindow;
