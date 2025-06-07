
import React from 'react';
import { Form, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Компонент для відображення елемента товару/послуги в формі рахунку
 */
const InvoiceFormItem = ({ item, index, onItemChange, onRemoveItem }) => {
    // Обробник змін в полях товару
    const handleChange = (e) => {
        onItemChange(e, index);
    };

    return (
        <div className="mb-3 p-3 border rounded">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="m-0">Позиція #{index + 1}</h6>
                <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => onRemoveItem(index)}
                >
                    Видалити
                </Button>
            </div>
            
            <Form.Group className="mb-2">
                <Form.Label>Найменування</Form.Label>
                <Form.Control
                    type="text"
                    name="name"
                    value={item.name}
                    onChange={handleChange}
                    placeholder="Введіть найменування товару або послуги"
                />
            </Form.Group>
            
            <div className="row">
                <div className="col-md-4">
                    <Form.Group className="mb-2">
                        <Form.Label>Кількість</Form.Label>
                        <Form.Control
                            type="number"
                            name="quantity"
                            value={item.quantity}
                            onChange={handleChange}
                            min="0.01"
                            step="0.01"
                        />
                    </Form.Group>
                </div>
                
                <div className="col-md-4">
                    <Form.Group className="mb-2">
                        <Form.Label>Одиниця виміру</Form.Label>
                        <Form.Select
                            name="unit"
                            value={item.unit}
                            onChange={handleChange}
                        >
                            <option value="шт.">шт.</option>
                            <option value="кг">кг</option>
                            <option value="м">м</option>
                            <option value="л">л</option>
                            <option value="уп.">уп.</option>
                            <option value="посл.">посл.</option>
                        </Form.Select>
                    </Form.Group>
                </div>
                
                <div className="col-md-4">
                    <Form.Group className="mb-2">
                        <Form.Label>Ціна</Form.Label>
                        <Form.Control
                            type="number"
                            name="price"
                            value={item.price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                        />
                    </Form.Group>
                </div>
            </div>
            
            <div className="d-flex justify-content-end">
                <div className="text-end mt-2">
                    <strong>Сума: {(item.quantity * item.price).toFixed(2)} грн</strong>
                </div>
            </div>
        </div>
    );
};

InvoiceFormItem.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        quantity: PropTypes.number,
        price: PropTypes.number,
        unit: PropTypes.string
    }).isRequired,
    index: PropTypes.number.isRequired,
    onItemChange: PropTypes.func.isRequired,
    onRemoveItem: PropTypes.func.isRequired
};

export default InvoiceFormItem;