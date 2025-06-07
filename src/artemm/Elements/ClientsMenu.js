import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { Modal, Button, Table } from 'react-bootstrap'; // Виправлено імпорти
// import './ClientsMenu.css';
import barcode from '../public/mask-group-10.svg';
import profile from '../public/mask-group-11@2x.png';
import signal from './img/303c7b213ec59d3734dfbbd2249f4a7a.png';
import viber from './img/pngwing.com.png';
import watsap from './img/WhatsApp_icon.png';
import telegram from './img/Telegram-icon-on-transparent-background-PNG.png';
import FilesButton from './img/files-icon.png';
import addclienticons from './img/Path 13360.png';
import ChangeClienticons from './img/Group 1476.png';

const ClientsMenu = ({ user = {} }) => {
    const [users, setUsers] = useState(null);
    const [showUserList, setShowUserList] = useState(false);

    const phoneNumber = user.phoneNumber || '+38 065 666 66 66';
    const telegramlogin = user.telegram || '@aiatomas';
    const username = user.username || 'Пилипенко Артем Юрьевич';

    // useEffect(() => {
    //     if (showUserList) {
    //         axios.get('/api/users')
    //             .then(response => {
    //                 setUsers(response.data);
    //             })
    //             .catch(error => {
    //                 console.error('Error fetching users:', error);
    //             });
    //     }
    // }, [showUserList]);
    useEffect(() => {
        let data = {
            name: "",
            inPageCount: 500,
            currentPage: 1,
            search: "",
            columnName: "id",
        }
        axios.get(`/user/all`, data)
            .then(response => {
                console.log(response.data.rows);
                setUsers(response.data.rows)
                // setPageCount(Math.ceil(response.data.result.count / inPageCount))
            })
            .catch(error => {
                // if(error.response.status === 403){
                //     navigate('/login');
                // }
                console.log(error.message);
            })
    }, [showUserList]);

    const openMessenger = (messenger) => {
        let url = '';
        const phoneNum = phoneNumber.replace(/\s+/g, '');
        switch (messenger) {
            case 'signal':
                url = `signal://${phoneNum}`;
                break;
            case 'viber':
                url = `viber://chat?number=${phoneNum}`;
                break;
            case 'whatsapp':
                url = `https://wa.me/${phoneNum}`;
                break;
            case 'telegram':
                url = `https://t.me/${telegramlogin}`;
                break;
            default:
                break;
        }
        window.open(url, '_blank');
    };

    const printBarcode = () => {
        // Логіка друку штрих-коду
    };

    const openUserSettings = () => {
        // Логіка відкриття налаштувань користувача
    };

    const toggleUserList = () => {
        setShowUserList(!showUserList);
    };

    const selectUser = (user) => {
        setShowUserList(false);
        console.log('Вибраний користувач:', user);  // Наприклад, тут ви можете оновити стан поточного користувача.
    };

    if (users) {
        return (
            <div className="clientsproject">
                <button className="ChangeClient" onClick={toggleUserList}>
                    <img src={ChangeClienticons} alt="ChangeClient" className="ChangeClient-icons"/>
                </button>
                <Modal show={showUserList} onHide={toggleUserList}>
                    <Modal.Header closeButton>
                        <Modal.Title>Список користувачів</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>Фото</th>
                                <th>Логін</th>
                                <th>Ім'я</th>
                                <th>Телефон</th>
                                <th>Telegram</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((user) => (
                                <tr key={user.id} onClick={() => selectUser(user)}>
                                    <td>
                                        <img src={user.photoLink} alt="Фото" className="user-photo"/>
                                    </td>
                                    <td>{user.username}</td>
                                    <td>{user.firstName}</td>
                                    <td>{user.phoneNumber}</td>
                                    <td>{user.telegram}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={toggleUserList}>
                            Закрити
                        </Button>
                    </Modal.Footer>
                </Modal>
                <div className="ClientsMenu">
                    <div className="d-flex">
                        <div className="left-section">

                            <img src={barcode} alt="Штрих-код" className="barcode" onClick={printBarcode}/>
                            <img src={profile} alt="Профіль" className="profile-photo" onClick={openUserSettings}/>
                        </div>
                        <div className="middle-section">
                            <div className="username">{username}</div>
                            <div className="contact-number">
                                {phoneNumber}
                                <div className="messenger-icons">
                                    <img src={signal} alt="Signal" onClick={() => openMessenger('signal')}/>
                                    <img src={viber} alt="Viber" onClick={() => openMessenger('viber')}/>
                                    <img src={watsap} alt="WhatsApp" onClick={() => openMessenger('whatsapp')}/>
                                </div>
                            </div>
                            <div className="nickname">
                                <img src={telegram} alt="Telegram" className="telegram-icons"
                                     onClick={() => openMessenger('telegram')}/>
                                {telegramlogin}
                            </div>
                        </div>
                        <div className="right-section" style={{justifyContent: 'flex-end'}}>
                            <button className="files-button">
                                <img src={FilesButton} alt="FilesButton" className="FilesButton-icons"
                                     onClick={() => window.open('https://drive.google.com', '_blank')}/>
                            </button>
                            <button className="discount-button">
                                <div className="discountwords">-15%</div>
                            </button>
                            <button className="addclient">
                                <img src={addclienticons} alt="addclients" className="addclient-icons"
                                     onClick={() => window.open('https://drive.google.com', '_blank')}/>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
};

export default ClientsMenu;