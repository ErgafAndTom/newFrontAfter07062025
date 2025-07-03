import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/calc/Loader";
import './AddNewOrder.css'

// Створюємо глобальний об'єкт для зберігання подій
if (!window.orderEvents) {
    window.orderEvents = new EventTarget();
}

// Створюємо глобальну функцію для доступу ззовні
export const triggerNewOrder = () => {
    // Створюємо новий запит для створення замовлення
    axios.post(`/orders/create`)
        .then(response => {
            // Сповіщаємо всіх про створення замовлення
            const event = new CustomEvent('orderCreated', { detail: response.data });
            event.log = 'orderCreated';
            window.orderEvents.dispatchEvent(event);

            window.location.href = `/Orders/${response.data.id}`;
        })
        .catch(error => {
            console.log(error.message);
        });
};

function AddNewOrder({namem, data, setData, inPageCount, setInPageCount, currentPage, setCurrentPage, pageCount, setPageCount}) {
    // const [show, setShow] = useState(false);
    // const [filteredMetadata, setFilteredMetadata] = useState([]);
    // const [formValues, setFormValues] = useState(null);

    const navigate = useNavigate();

    // const handleClose = () => {
    //     setShow(false);
    // }

    // Ця функція точно така ж, як і triggerNewOrder, але для внутрішнього використання
    const handleShow = () => {
        triggerNewOrder(); // Використовуємо ту саму функцію
    };


    return (
        <>
            {/*<Button className="adminButtonAdd" variant="danger" onClick={handleShow}>*/}
            {/*    +*/}
            {/*</Button>*/}
            <div
              className={`buttonSkewedOrder`}
                onClick={handleShow}

                data-testid="new-order-button"
                id="new-order-button"
              style={{marginLeft:'0vw', alignItems:'center', justifyContent:'center'}}
            >
                Нове замовлення&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div>


        </>
    );
}

export default AddNewOrder;
