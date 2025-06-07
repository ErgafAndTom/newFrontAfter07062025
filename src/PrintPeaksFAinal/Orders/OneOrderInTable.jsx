import React, {useState} from 'react';

function OneOrderInTable({item}) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSubOrders = () => {
        setIsOpen(!isOpen);
    };
    return (
        <>
            <tr>
                <td className="center-text">665432</td>
                <td className="center-text">
                    <button className="toggle-btn" onClick={toggleSubOrders}>{isOpen ? 'Згорнути' : 'Розгорнути'}</button>
                </td>
                <td className="center-text">891-12b</td>
                <td className="center-text">Склад</td>
                <td className="center-text">Клієнт А</td>
                <td className="center-text">Друк плакатів</td>
                <td className="center-text">A3</td>
                <td className="center-text">100 шт</td>
                <td className="center-text">1200 грн</td>
                <td className="center-text">Оплачено</td>
                <td className="center-text">01.10.2024</td>
                <td className="center-text">05.10.2024</td>
                <td className="center-text">Іванов І.</td>
                <td className="center-text">
                    <button className="invoice-btn">Зробити рахунок</button>
                </td>
                <td className="center-text">
                    <button className="delete-btn">Видалити</button>
                </td>
            </tr>
            <tr>
                <td colSpan="14">
                    <div style={{ display: isOpen ? 'flex' : 'none' }} className="order-details">
                        <div className="sub-order">
                            <li><strong>№ субзамовлення:</strong> 122332</li>
                            <li><strong>Поточний статус:</strong> Склад (Іванов І.І.)</li>
                            <li><strong>Тип продукції:</strong> Плакати</li>
                            <li><strong>Найменування:</strong> Друк кольорових плакатів</li>
                            <li><strong>Кількість:</strong> 50 шт</li>
                            <li><strong>Ціна за одиницю:</strong> 12 грн</li>
                            <li><strong>Вартість:</strong> 600 грн</li>
                            <li>Використано аркушів: формат SRA3, 20 шт</li>
                            <li>Кількість виробів на аркуші:</li>
                        </div>

                        <div className="sub-order">
                            <li><strong>№ субзамовлення:</strong> 122333</li>
                            <li><strong>Поточний статус:</strong> Склад (Іванов І.І.)</li>
                            <li><strong>Тип продукції:</strong> Плакати</li>
                            <li><strong>Найменування:</strong> Друк кольорових плакатів на крейдованому папері паперфі
                                пап
                            </li>
                            <li><strong>Кількість:</strong> 50 шт</li>
                            <li><strong>Ціна за одиницю:</strong> 12 грн</li>
                            <li><strong>Вартість:</strong> 600 грн</li>
                            <li>Використано аркушів: формат SRA3, 20 шт </li>
                            <li>Кількість виробів на аркуші:600 грн</li>
                        </div>
                        <div className="sub-order">
                            <li><strong>№ субзамовлення:</strong> 122334</li>
                            <li><strong>Поточний статус:</strong> Склад (Іванов І.І.)</li>
                            <li><strong>Тип продукції:</strong> Плакати</li>
                            <li><strong>Найменування:</strong> Друк чорно-білих плакатів</li>
                            <li><strong>Кількість:</strong> 100 шт</li>
                            <li><strong>Ціна за одиницю:</strong> 10 грн</li>
                            <li><strong>Вартість:</strong> 1000 грн</li>
                            <li>Використано аркушів: формат SRA3, 20 шт </li>
                            <li>Кількість виробів на аркуші: 600 грн</li>
                        </div>
                        <div className="sub-order">
                            <li><strong>№ субзамовлення:</strong> 122335</li>
                            <li><strong>Поточний статус:</strong> Виробництво (Петров П.П.)</li>
                            <li><strong>Тип продукції:</strong> Листівки</li>
                            <li><strong>Найменування:</strong> Друк рекламних листівок</li>
                            <li><strong>Кількість:</strong> 200 шт</li>
                            <li><strong>Ціна за одиницю:</strong> 5 грн</li>
                            <li><strong>Вартість:</strong> 1000 грн</li>
                            <li>Використано аркушів: формат SRA3, 20 шт </li>
                            <li>Кількість виробів на аркуші:600 грн</li>
                        </div>
                    </div>
                </td>
            </tr>
        </>
    );
}

export default OneOrderInTable;