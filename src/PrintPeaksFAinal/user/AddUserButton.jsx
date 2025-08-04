import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AddUserWindow from './AddUserWindow';
import './AddUserButton.css';

function AddUserButton({ fetchUsers, addOrdOrOnlyClient, thisOrder, setThisOrder }) {
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

                    >&nbsp;&nbsp;&nbsp;Створити клієнта</span>
                </button>
            </div>

            {showAddUser && (
                <AddUserWindow
                    show={showAddUser}
                    onHide={() => setShowAddUser(false)}
                    addOrdOrOnlyClient={addOrdOrOnlyClient}
                    thisOrder={thisOrder}
                    setThisOrder={setThisOrder}
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
