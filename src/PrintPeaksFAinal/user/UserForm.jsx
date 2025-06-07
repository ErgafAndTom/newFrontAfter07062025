import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/calc/Loader";

function UserForm({ data, setData, selectedUser, setSelectedUser, show, setShow }) {
    const [formValues, setFormValues] = useState(null);
    const [filteredMetadata, setFilteredMetadata] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (data && data.metadata) {
            const excludedFields = ["id", "createdAt", "updatedAt", "photo", "lastLoginAt", "password", "isActive"];
            const newMetadata = data.metadata.filter(t => !excludedFields.includes(t));
            setFilteredMetadata(newMetadata);

            const initialFormValues = newMetadata.reduce((acc, cur) => {
                acc[cur] = selectedUser ? selectedUser[cur] || "" : "";
                return acc;
            }, {});
            setFormValues(initialFormValues);
        }
    }, [data, selectedUser]);

    const handleClose = () => {
        setShow(false);
        setSelectedUser(null);
    };

    const saveUser = (event) => {
        event.preventDefault();

        const postData = {
            tableName: "Users",
            formValues
        };

        if (selectedUser) {
            axios.put(`/user/update/${selectedUser.id}`, postData)
                .then(response => {
                    setData(prevData => ({
                        ...prevData,
                        rows: prevData.rows.map(user => user.id === response.data.id ? response.data : user)
                    }));
                    handleClose();
                })
                .catch(error => console.log(error.message));
        } else {
            axios.post(`/user/create`, postData)
                .then(response => {
                    setData(prevData => ({
                        ...prevData,
                        count: prevData.count + 1,
                        rows: [...prevData.rows, response.data]
                    }));
                    handleClose();
                })
                .catch(error => console.log(error.message));
        }
    };

    const handleInputChange = (event, field) => {
        setFormValues(prev => ({ ...prev, [field]: event.target.value }));
    };

    if (formValues === null) {
        return <h1 className="d-flex justify-content-center align-items-center"><Loader /></h1>;
    }

    return (
        <>
            <Button className="adminButtonAdd" variant="danger" onClick={() => setShow(true)}>
                {selectedUser ? "Редагувати користувача" : "Додати користувача"}
            </Button>

            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{selectedUser ? "Редагування користувача" : "Додавання користувача"}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Form onSubmit={saveUser}>
                        {filteredMetadata.map((metaItem, iter) => (
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

export default UserForm;
