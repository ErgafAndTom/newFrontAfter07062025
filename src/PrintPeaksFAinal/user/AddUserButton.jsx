import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AddUserWindow from './AddUserWindow';
import './AddUserButton.css';

const styles = {
    addButton: {
        display: 'flex',
        padding: '0 15px',

marginTop: '-0.4vh',
        background: '#3C60A6',
        borderRadius: '0.5vw',
        fontSize: '0.7vw',
        height: '3.5vh',
        border: 'none',
        cursor: 'pointer',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'background-color 0.3s ease',
    },
    navButton: { // Додатковий стиль для кнопок у навігаційній панелі
        height: '4vh',
        padding: '0 15px',
        fontSize: '0.7vw',
        background: '#3C60A6',
        borderRadius: '0vh 1vh 1vh 0vh ',
        border: 'none',
        whiteSpace: 'nowrap',
        alignItems: 'center',
        flexShrink: 0
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
    buttonText: {
        marginLeft: '0.5vw',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '0.7vw',
    },
    userIcon: {
        fontSize: '0.9vw',
    }
};

function AddUserButton({ fetchUsers }) {
    const [showAddUser, setShowAddUser] = useState(false);

    const handleAddUser = () => {
        setShowAddUser(true);
    };

    const handleUserAdded = () => {
        setShowAddUser(false);
        if (fetchUsers) {
            fetchUsers(); // Оновлюємо список після додавання
        }
    };

    return (
        <div>
            <div>
                <button
                    className="buttonSkewedUser storeButton"
                    onClick={handleAddUser}
               >

                    <span style={{alignItems: 'center', justifyContent: 'center', fontSize: '0.7vw'}}

                    >&nbsp;&nbsp;Створити клієнта</span>
                </button>
            </div>

            {showAddUser && (
                <AddUserWindow
                    show={showAddUser}
                    onHide={() => setShowAddUser(false)}
                    onUserAdded={() => {
                        handleUserAdded();
                    }}
                />
            )}
        </div>
    );
}

AddUserButton.propTypes = {
    fetchUsers: PropTypes.func
};

export default AddUserButton;
