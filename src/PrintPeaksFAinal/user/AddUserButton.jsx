import React, { useState } from 'react';
import AddUserWindow from './AddUserWindow';

const styles = {
    addButton: {
        display: 'flex',
        padding: '0.8vh 1.5vw',
        backgroundColor: '#f1c40f',
        borderRadius: '0.8vw',
        fontSize: '0.8vw',
        border: 'none',
        cursor: 'pointer',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
    },
    buttonContainer: {
        margin: '1vh 0',
        display: 'flex',
        justifyContent: 'flex-end',
    },
    buttonText: {
        marginLeft: '0.5vw',
    },
    userIcon: {
        fontSize: '1vw',
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
                    style={styles.addButton} 
                    onClick={handleAddUser}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5b70b'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1c40f'}
                >
                    <span style={styles.userIcon}>👤</span>
                    <span style={styles.buttonText}>Додати нового користувача</span>
                </button>
            </div>
            
            {showAddUser && (
                <AddUserWindow
                    show={showAddUser}
                    onHide={() => setShowAddUser(false)}
                    onUserAdded={(user) => {
                        handleUserAdded();
                    }}
                />
            )}
        </div>
    );
}

export default AddUserButton;
