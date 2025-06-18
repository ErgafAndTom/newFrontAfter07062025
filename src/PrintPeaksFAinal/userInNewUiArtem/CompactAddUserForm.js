import React, { useState } from 'react';
import axios from '../../api/axiosInstance';
import { Form, Button, Row, Col, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { BsPerson, BsEnvelope, BsTelephone } from 'react-icons/bs';
import PropTypes from 'prop-types';

const CompactAddUserForm = ({ handleCloseAddUser }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    familyName: '',
    phoneNumber: '',
    email: '',
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

    axios.post('/user/create', user)
      .then(() => {
        setLoading(false);
        setSuccess(true);
        // Затримка перед закриттям для відображення повідомлення про успіх
        setTimeout(() => {
          handleCloseAddUser();
        }, 1500);
      })
      .catch(error => {
        setLoading(false);
        setError(error.response?.data?.message || 'Помилка при додаванні клієнта');
        console.error('Помилка додавання клієнта:', error);
      });
  };

  return (
    <div>
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          Клієнт успішно доданий!
        </Alert>
      )}

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Ім&apos;я <span className="text-danger"></span></Form.Label>
              <InputGroup>
                <InputGroup.Text><BsPerson /></InputGroup.Text>
                <Form.Control
                  required
                  type="text"
                  name="firstName"
                  value={user.firstName}
                  onChange={handleChange}
                  placeholder="Введіть ім&apos;я"
                />
                <Form.Control.Feedback type="invalid">
                  Введіть ім&apos;я клієнта`${'"ведіт"'}`
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Прізвище <span className="text-danger"></span></Form.Label>
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
                  Введіть прізвище клієнта
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
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
                  Введіть номер телефону
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
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
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
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

        <div className="d-flex justify-content-end">
          <Button variant="secondary" onClick={handleCloseAddUser} className="me-2">
            Скасувати
          </Button>
          <Button 
            variant="success" 
            type="submit"
            disabled={loading || success}
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
            ) : success ? (
              <>✓ Збережено</>
            ) : (
              <>Додати клієнта</>
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
};

CompactAddUserForm.propTypes = {
  handleCloseAddUser: PropTypes.func.isRequired
};

export default CompactAddUserForm;
