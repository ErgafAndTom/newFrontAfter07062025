import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/calc/Loader";

function AddNewOrder({namem, data, setData, inPageCount, setInPageCount, currentPage, setCurrentPage, pageCount, setPageCount}) {
    // const [show, setShow] = useState(false);
    // const [filteredMetadata, setFilteredMetadata] = useState([]);
    // const [formValues, setFormValues] = useState(null);

    const navigate = useNavigate();

    // const handleClose = () => {
    //     setShow(false);
    // }

    const handleShow = () => {
        // let forData = formValues
        // let postData = {
        //     tableName: namem,
        //     inPageCount: inPageCount,
        //     currentPage: currentPage,
        //     formValues: forData
        // }
        // console.log(postData);
        axios.post(`/orders/create`,
            // postData
        )
            .then(response => {
                // console.log(response.data);
                navigate(`/Orders/${response.data.id}`, { replace: true });
                // setData(prevData => ({
                //     ...prevData,
                //     count: prevData.count + 1, // Увеличиваем общий счетчик заказов
                //     rows: [...prevData.rows, response.data] // Добавляем новый заказ в массив rows
                // }));
                // setPageCount(Math.ceil(response.data.count / inPageCount));
                // handleClose(); // Закрываем Offcanvas после успешного сохранения
            })
            .catch(error => {
                console.log(error.message);
            })
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
            <div className="adminButtonAdd" onClick={handleShow} style={{marginTop: "-2.2vmin"}} >
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
