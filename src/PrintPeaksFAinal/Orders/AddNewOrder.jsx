import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/calc/Loader";

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

    // useEffect(() => {
    //     if (data && data.metadata) {
    //         // Исключаем ненужные поля
    //         const excludedFields = ["id", "createdAt", "updatedAt", "photo"];
    //         const newMetadata = data.metadata.filter(t => !excludedFields.includes(t.field));
    //         setFilteredMetadata(newMetadata);
    //
    //         // Инициализируем formValues как объект с пустыми строками
    //         const initialFormValues = newMetadata.reduce((acc, cur) => {
    //             acc[cur.field] = "";
    //             return acc;
    //         }, {});
    //         setFormValues(initialFormValues);
    //     }
    // }, [data]);

    // const saveAll = (event) => {
    //     event.preventDefault(); // Предотвращаем стандартное поведение формы
    //
    //     let forData = formValues;
    //     let postData = {
    //         tableName: namem,
    //         inPageCount: inPageCount,
    //         currentPage: currentPage,
    //         formValues: forData
    //     }
    //     console.log(postData);
    //     axios.post(`/orders/create`, postData)
    //         .then(response => {
    //             console.log(response.data);
    //             setData(response.data);
    //             setPageCount(Math.ceil(response.data.count / inPageCount));
    //             handleClose(); // Закрываем Offcanvas после успешного сохранения
    //         })
    //         .catch(error => {
    //             console.log(error.message);
    //         })
    // }

    // // Обработка изменений в полях формы
    // const handleInputChange = (event, field) => {
    //     setFormValues(prev => ({ ...prev, [field]: event.target.value }));
    // }

    // Если formValues ещё не инициализированы, показываем загрузчик
    // if (formValues === null) {
    //     return (
    //         <h1 className="d-flex justify-content-center align-items-center">
    //             <Loader />
    //         </h1>
    //     )
    // }

    return (
        <>
            {/*<Button className="adminButtonAdd" variant="danger" onClick={handleShow}>*/}
            {/*    +*/}
            {/*</Button>*/}
            <div
                className="adminButtonAdd"
                onClick={handleShow}
                style={{
                    height: '4vh',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 15px',
                    fontSize: '0.8vw',
                    marginTop: '-3.8vh',
                    whiteSpace: 'nowrap',
                    borderRadius: '1vh 0vh 0vh 1vh',
                    background: '#FAB416',
                }} 
                data-testid="new-order-button"
                id="new-order-button"
            >
                Нове замовлення
            </div>

            {/*<Offcanvas show={show} onHide={handleClose}>*/}
            {/*    <Offcanvas.Header closeButton>*/}
            {/*        <Offcanvas.Title>Створити новий замовлення</Offcanvas.Title>*/}
            {/*    </Offcanvas.Header>*/}
            {/*    <Offcanvas.Body>*/}
            {/*        <Form onSubmit={saveAll}>*/}
            {/*            {filteredMetadata.map((metaItem, iter) => (*/}
            {/*                <InputGroup className="mb-3" key={metaItem.field}>*/}
            {/*                    <Form.Control*/}
            {/*                        placeholder={metaItem.comment || metaItem.field}*/}
            {/*                        aria-label={metaItem.field}*/}
            {/*                        aria-describedby="basic-addon1"*/}
            {/*                        value={formValues[metaItem.field]}*/}
            {/*                        onChange={(event) => handleInputChange(event, metaItem.field)}*/}
            {/*                    />*/}
            {/*                    <InputGroup.Text id="basic-addon1">*/}
            {/*                        {metaItem.comment || metaItem.field}*/}
            {/*                    </InputGroup.Text>*/}
            {/*                </InputGroup>*/}
            {/*            ))}*/}
            {/*            <Button variant="primary" type="submit">*/}
            {/*                Додати*/}
            {/*            </Button>*/}
            {/*        </Form>*/}
            {/*    </Offcanvas.Body>*/}
            {/*</Offcanvas>*/}
        </>
    );
}

export default AddNewOrder;
