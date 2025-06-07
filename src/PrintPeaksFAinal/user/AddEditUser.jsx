import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import axios from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/calc/Loader';

function AddEditUser({ data, setData, selectedUser, setSelectedUser }) {
    const [show, setShow] = useState(false);
    const [filteredMetadata, setFilteredMetadata] = useState([]);
    const [formValues, setFormValues] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (data && data.metadata) {
            const excludedFields = ["id", "createdAt", "updatedAt", "photo"];
            const newMetadata = data.metadata.filter(t => !excludedFields.includes(t));
            setFilteredMetadata(newMetadata);

            const initialFormValues = newMetadata.reduce((acc, cur) => {
                acc[cur] = selectedUser ? selectedUser[cur] : "";
                return acc;
            }, {});
            setFormValues(initialFormValues);
        }
    }, [data, selectedUser]);

    const handleClose = () => {
        setShow(false);
        setSelectedUser(null);
    };

    const handleShow = () => {
        setShow(true);
    };

    const handleInputChange = (event, field) => {
        setFormValues(prev => ({ ...prev, [field]: event.target.value }));
    };

    const saveUser = (event) => {
        event.preventDefault();
        let postData = {
            tableName: "Users",
            formValues: formValues
        };

        const request = selectedUser
            ? axios.put(`/user/update/${selectedUser.id}`, postData)
            : axios.post(`/user/create`, postData);

        request
            .then(response => {
                if (selectedUser) {
                    setData(prevData => ({
                        ...prevData,
                        rows: prevData.rows.map(user => user.id === selectedUser.id ? response.data : user)
                    }));
                } else {
                    setData(prevData => ({
                        ...prevData,
                        rows: [...prevData.rows, response.data]
                    }));
                }
                handleClose();
            })
            .catch(error => {
                console.error(error.message);
            });
    };

    if (formValues === null) {
        return (
            <h1 className="d-flex justify-content-center align-items-center">
                <Loader />
            </h1>
        );
    }

    return (
        <>
            <Button className="adminButtonAdd" variant="danger" onClick={handleShow}>
                {selectedUser ? "Редагувати користувача" : "+ Додати користувача"}
            </Button>

            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{selectedUser ? "Редагувати користувача" : "Створити нового користувача"}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Form onSubmit={saveUser}>
                        {filteredMetadata.map(metaItem => (
                            <InputGroup className="mb-3" key={metaItem}>
                                <Form.Control
                                    placeholder={metaItem.comment || metaItem}
                                    aria-label={metaItem}
                                    value={formValues[metaItem]}
                                    onChange={(event) => handleInputChange(event, metaItem)}
                                />
                                <InputGroup.Text>{metaItem.comment || metaItem}</InputGroup.Text>
                            </InputGroup>
                        ))}
                        <Button variant="primary" type="submit">
                            {selectedUser ? "Зберегти зміни" : "Додати"}
                        </Button>
                    </Form>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

export default AddEditUser;
