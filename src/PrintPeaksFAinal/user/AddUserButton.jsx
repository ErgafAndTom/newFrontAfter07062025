import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AddUserWindow from './AddUserWindow';

const styles = {
    addButton: {
        display: 'flex',
        padding: '0 15px',
        marginTop: '-3.5vh',
        background: '#3C60A6',
        borderRadius: '0.5vw',
        fontSize: '0.8vw',
        height: '4vh',
        border: 'none',
        cursor: 'pointer',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'background-color 0.3s ease',
    },
    navButton: { // Додатковий стиль для кнопок у навігаційній панелі
        height: '4vh',
        padding: '0 15px',
        fontSize: '0.8vw',
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
        fontSize: '0.8vw',
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
            <div style={styles.buttonContainer}>
                <button
                    className="adminButtonAdd"
                    style={{  ...styles.navButton, backgroundColor: '#3C60A6', marginTop: '-3.8vh', marginRight: '0.5vw'}}
                    onClick={handleAddUser}

                >

                    <span style={{alignItems: 'center', justifyContent: 'center', fontSize: '0.8vw'}}

                    >Створити клієнта</span>
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
