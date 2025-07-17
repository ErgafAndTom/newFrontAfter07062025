import {translateColumnName} from './translations';
import React, { useState } from 'react';
import axios from "../../api/axiosInstance";
import {Modal} from "react-bootstrap";
import TrashIcon from '../../artemm/public/Trash.png';
import {useNavigate} from "react-router-dom";


function ModalDeleteInStorage({tableName, data, setData, inPageCount, setInPageCount, currentPage, setCurrentPage, pageCount, setPageCount,  item, thisItemForModal}) {
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    const handleClose = () => {
        setShow(false);
    }
    const handleShow = () => {
        console.log(item);
        setShow(true);
    }

    let deleteThisRowF = (e) => {
        let data = {
            tableName: tableName,
            id: parseInt(e),
            inPageCount: inPageCount,
            currentPage: currentPage,
            search: "",
        }
        console.log(data);
        axios.post(`admin/deleteintable`, data)
            .then(response => {
                console.log(response.data);
                setData(response.data)
                setPageCount(Math.ceil(response.data.count / inPageCount))
                setShow(false);

            })
            .catch(error => {
                if(error.response.status === 403){
                    navigate('/login');
                }
                console.log(error.message);
            })
    }

    return (
        <>
            <button className="adminFontTable" onClick={handleShow}>
                <img src={TrashIcon} alt="TrashIcon" style={{ width: '0.65vw'}}/>

            </button>

            <Modal show={show} onHide={handleClose} >

                <Modal.Header className="borderRadius">Видалити {translateColumnName('type')}: {thisItemForModal.type}, {translateColumnName('name')}: {thisItemForModal.name}?</Modal.Header>
                {/*<Modal.Body>Видалити {item.type} {item.name}?</Modal.Body>*/}
                <Modal.Footer style={{ background: '#F2F0E7'}}>
                    <button className="hoverOrange" onClick={(e) => {deleteThisRowF(e)}}>
                        Так
                    </button>
                    <button className="hoverOrange" onClick={handleClose}>
                        Закрити
                    </button>

                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalDeleteInStorage;
