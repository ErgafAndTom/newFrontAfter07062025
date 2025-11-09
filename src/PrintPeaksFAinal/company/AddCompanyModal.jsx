// /components/company/AddCompanyModal.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "../../api/axiosInstance";
import { Form, Button, Row, Col, InputGroup, Spinner, Alert } from "react-bootstrap";
import { BsBuilding, BsGeoAlt, BsTelephone, BsEnvelope, BsTelegram, BsPercent, Bs123, BsX } from "react-icons/bs";

// важливо: підключаємо ті самі стилі, що й у ClientSelectionModal
import "../userInNewUiArtem/ClientSelectionModal.css";

function AddCompanyModal({ user, showAddCompany, setShowAddCompany, onCompanyAdded }) {
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState(null);

  const [company, setCompany] = useState({
    companyName: "",
    address: "",
    phoneNumber: "",
    email: "",
    telegram: "",
    edrpou: "",
    discount: 0,
    notes: ""
  });

  const handleClose = () => setShowAddCompany(false);

  // формат телефону як у AddUserWindow
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^+\d]/g, "");
    if (!value.startsWith("+")) value = "+38" + value;
    const formattedValue = value
      .replace(/^(\+\d{2})/, "$1 ")
      .replace(/(\d{3})(\d)/, "$1 $2")
      .replace(/(\d{3}) (\d{3})(\d)/, "$1 $2-$3")
      .replace(/-(\d{2})(\d{1,2})/, "-$1-$2");
    setCompany((prev) => ({ ...prev, phoneNumber: formattedValue.trim() }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompany((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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
      const res = await axios.post("/api/company/create", company);
      onCompanyAdded && onCompanyAdded(res.data);
      setLoading(false);
      setShowAddCompany(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Помилка при додаванні компанії");
    }
  };

  if (!showAddCompany) return null;

  return (
    <>
      {/* overlay як у ClientSelectionModal */}
      <div
        className="modalOverlay"
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          left: "-31.5vw",
          top:"-2vh",
          width: "200vw",
          height: "200vh",
          backgroundColor: "rgba(15,15,15,0.45)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          zIndex: 30,
          transition: "opacity 200ms ease"
        }}
      />
      {/* контейнер того ж розміру й позиції */}
      <div className="modalContainer animate-slide-up" style={{
        bottom:"25%",
        left:"35%",
        zIndex: 30,
      }}>
        {/* header */}
        <div
          className="d-flex justify-content-between align-items-center"
          style={{ padding: "0rem 0rem", background: "#f2f0e7", borderRadius: "12px" }}
        >

          {/*<button*/}
          {/*  type="button"*/}
          {/*  aria-label="Закрити"*/}
          {/*  onClick={handleClose}*/}
          {/*  className="icon-btn icon-btn--outlined"*/}
          {/*  title="Закрити"*/}
          {/*  style={{ width: 36, height: 36 }}*/}
          {/*>*/}
          {/*  /!*<BsX />*!/*/}
          {/*</button>*/}
        </div>

        {/* body */}
        <div className="noScrollbar" style={{ background: "#f2f0e7" }}>
          {error && (
            <div style={{ padding: "0.8rem" }}>
              <Alert variant="danger" onClose={() => setError(null)} dismissible>
                {error}
              </Alert>
            </div>
          )}
          <BsBuilding
          style={{
            position: "absolute",
            top: "16.5vh",
            left: "8vw",
            transform: "translate(-50%, -50%)",
            fontSize: "15vw",       // великий розмір
            opacity:"0.1",
            pointerEvents: "none",  // щоб не заважала клікам
            zIndex: 0
          }}
          />
          <Form noValidate validated={validated} onSubmit={handleSubmit} style={{ padding: "0.8rem" }}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <InputGroup>
                    <InputGroup.Text><BsBuilding /></InputGroup.Text>
                    <Form.Control
                      required
                      type="text"
                      name="companyName"
                      value={company.companyName}
                      onChange={handleChange}
                      placeholder="Назва компанії"
                    />
                    <Form.Control.Feedback type="invalid">
                      Будь ласка, введіть назву компанії
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <InputGroup>
                    <InputGroup.Text><BsGeoAlt /></InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="address"
                      value={company.address}
                      onChange={handleChange}
                      placeholder="Адреса"
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <InputGroup>
                    <InputGroup.Text><BsTelephone /></InputGroup.Text>
                    <Form.Control
                      // required
                      type="tel"
                      name="phoneNumber"
                      value={company.phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="+38 XXX XXX-XX-XX"
                      maxLength={17}
                    />
                    <Form.Control.Feedback type="invalid">
                      Будь ласка, введіть номер телефону
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <InputGroup>
                    <InputGroup.Text><BsEnvelope /></InputGroup.Text>
                    <Form.Control
                      type="email"
                      name="email"
                      value={company.email}
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
                    <InputGroup.Text><BsTelegram /></InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="telegram"
                      value={company.telegram}
                      onChange={handleChange}
                      placeholder="@telegram"
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <InputGroup>
                    <InputGroup.Text><Bs123 /></InputGroup.Text>
                    <Form.Control
                      // required
                      type="text"
                      name="edrpou"
                      value={company.edrpou}
                      onChange={handleChange}
                      placeholder="ЄДРПОУ"
                      pattern="^\d{5,10}$"
                    />
                    <Form.Control.Feedback type="invalid">
                      Вкажіть ЄДРПОУ (5–10 цифр)
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <InputGroup>
                    <InputGroup.Text><BsPercent /></InputGroup.Text>
                    <Form.Control
                      required
                      type="number"
                      name="discount"
                      min="0"
                      max="50"
                      step="1"
                      value={company.discount}
                      onChange={handleChange}
                      placeholder="Знижка (%)"
                    />
                    <Form.Control.Feedback type="invalid">
                      Будь ласка, введіть знижку
                    </Form.Control.Feedback>
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
                    value={company.notes}
                    onChange={handleChange}
                    placeholder="Додаткова інформація про компанію"
                    style={{ height: "12vh" }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end" style={{ gap: "0.6rem" }}>
              {/*<Button*/}
              {/*  type="button"*/}
              {/*  variant="secondary"*/}
              {/*  className="adminButtonAdd"*/}
              {/*  onClick={handleClose}*/}
              {/*  disabled={loading}*/}
              {/*>*/}
              {/*  Закрити*/}
              {/*</Button>*/}

              <Button
                type="submit"
                variant="success"
                className="adminButtonAdd"
                style={{justifyContent:"center", width:"30vw"}}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Зберігаємо...
                  </>
                ) : (
                  <>Додати компанію</>
                )}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}

AddCompanyModal.propTypes = {
  user: PropTypes.any,
  showAddCompany: PropTypes.bool.isRequired,
  setShowAddCompany: PropTypes.func.isRequired,
  onCompanyAdded: PropTypes.func
};

export default AddCompanyModal;
