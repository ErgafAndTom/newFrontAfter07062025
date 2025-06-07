import React, { useState, useEffect } from 'react';
import {Form, Button, Card, Spinner} from 'react-bootstrap';
import PropTypes from 'prop-types';
import InvoiceFormItem from './InvoiceFormItem';

/**
 * Компонент форми для створення/редагування рахунку
 */
const InvoiceForm = ({ 
    formData, 
    setFormData, 
    onSubmit, 
    contractors, 
    supplierSearch, 
    setSupplierSearch,
    buyerSearch,
    setBuyerSearch,
    filteredSuppliers,
    filteredBuyers,
    showSupplierDropdown,
    setShowSupplierDropdown,
    showBuyerDropdown,
    setShowBuyerDropdown,
    handleSelectSupplier,
    handleSelectBuyer,
    isSubmitting
}) => {
    // Розрахунок загальної суми
    const totalSum = formData.items.reduce((sum, item) => {
        return sum + (item.quantity * item.price || 0);
    }, 0);

    // Обробник зміни значень форми
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Обробник зміни в товарах/послугах
    const handleItemChange = (e, index) => {
        const { name, value } = e.target;
        const updatedItems = [...formData.items];
        
        updatedItems[index] = {
            ...updatedItems[index],
            [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value
        };
        
        setFormData({ ...formData, items: updatedItems });
    };

    // Функція для додавання нового товару
    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [
                ...formData.items,
                { id: formData.items.length + 1, name: '', quantity: 1, price: 0, unit: 'шт.' }
            ]
        });
    };

    // Функція для видалення товару
    const handleRemoveItem = (index) => {
        // Перевіряємо, чи це не останній елемент
        if (formData.items.length <= 1) {
            return;
        }
        
        const updatedItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: updatedItems });
    };

    return (
        <Form onSubmit={onSubmit}>
            <div className="row mb-3">
                <div className="col-md-6">
                    <Form.Group className="mb-3">
                        <Form.Label>Номер рахунку</Form.Label>
                        <Form.Control
                            type="text"
                            name="invoiceNumber"
                            value={formData.invoiceNumber}
                            onChange={handleChange}
                            placeholder="Введіть номер рахунку"
                            required
                        />
                    </Form.Group>
                </div>
                <div className="col-md-6">
                    <Form.Group className="mb-3">
                        <Form.Label>Дата рахунку</Form.Label>
                        <Form.Control
                            type="date"
                            name="invoiceDate"
                            value={formData.invoiceDate}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-6">
                    <Card className="mb-3">
                        <Card.Header className="bg-light">Постачальник</Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3 position-relative">
                                <Form.Label>Пошук постачальника</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={supplierSearch}
                                    onChange={(e) => {
                                        setSupplierSearch(e.target.value);
                                        setShowSupplierDropdown(true);
                                    }}
                                    placeholder="Введіть назву постачальника"
                                    autoComplete="off"
                                />
                                {showSupplierDropdown && filteredSuppliers.length > 0 && (
                                    <div className="dropdown-menu show w-100">
                                        {filteredSuppliers.map((supplier) => (
                                            <button
                                                key={supplier.id}
                                                type="button"
                                                className="dropdown-item"
                                                onClick={() => handleSelectSupplier(supplier)}
                                            >
                                                {supplier.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Назва постачальника</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="supplierName"
                                    value={formData.supplierName}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </div>

                <div className="col-md-6">
                    <Card className="mb-3">
                        <Card.Header className="bg-light">Покупець</Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3 position-relative">
                                <Form.Label>Пошук покупця</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={buyerSearch}
                                    onChange={(e) => {
                                        setBuyerSearch(e.target.value);
                                        setShowBuyerDropdown(true);
                                    }}
                                    placeholder="Введіть назву покупця"
                                    autoComplete="off"
                                />
                                {showBuyerDropdown && filteredBuyers.length > 0 && (
                                    <div className="dropdown-menu show w-100">
                                        {filteredBuyers.map((buyer) => (
                                            <button
                                                key={buyer.id}
                                                type="button"
                                                className="dropdown-item"
                                                onClick={() => handleSelectBuyer(buyer)}
                                            >
                                                {buyer.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Назва покупця</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="buyerName"
                                    value={formData.buyerName}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <Card className="mb-4">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Товари та послуги</h5>
                    <Button variant="success" size="sm" onClick={handleAddItem}>
                        <i className="bi bi-plus-circle me-1"></i> Додати товар
                    </Button>
                </Card.Header>
                <Card.Body>
                    {formData.items.map((item, index) => (
                        <InvoiceFormItem 
                            key={index}
                            item={item}
                            index={index}
                            onItemChange={handleItemChange}
                            onRemoveItem={handleRemoveItem}
                        />
                    ))}
                </Card.Body>
                <Card.Footer className="bg-light">
                    <div className="d-flex justify-content-end">
                        <div className="h5">
                            Загальна сума: <strong>{totalSum.toFixed(2)} грн</strong>
                        </div>
                    </div>
                </Card.Footer>
            </Card>

            <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" className="me-2" />
                            Збереження...
                        </>
                    ) : (
                        'Зберегти рахунок'
                    )}
                </Button>
            </div>
        </Form>
    );
};

InvoiceForm.propTypes = {
    formData: PropTypes.object.isRequired,
    setFormData: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    contractors: PropTypes.array.isRequired,
    supplierSearch: PropTypes.string.isRequired,
    setSupplierSearch: PropTypes.func.isRequired,
    buyerSearch: PropTypes.string.isRequired,
    setBuyerSearch: PropTypes.func.isRequired,
    filteredSuppliers: PropTypes.array.isRequired,
    filteredBuyers: PropTypes.array.isRequired,
    showSupplierDropdown: PropTypes.bool.isRequired,
    setShowSupplierDropdown: PropTypes.func.isRequired,
    showBuyerDropdown: PropTypes.bool.isRequired,
    setShowBuyerDropdown: PropTypes.func.isRequired,
    handleSelectSupplier: PropTypes.func.isRequired,
    handleSelectBuyer: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool
};

InvoiceForm.defaultProps = {
    isSubmitting: false
};

export default InvoiceForm;
