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
              {thisOrder && (
                <button
                  className="adminButtonAdd " style={{marginLeft:"1vw"}}
                  onClick={handleAddUser}
                >
                  Створити клієнта
                </button>
              )}
              {!thisOrder && (
                <button
                  className="adminButtonAdd buttonSkewedOrderClient"
                  onClick={handleAddUser}
                  style={{borderTopRightRadius:"0px", marginRight:"1vw", borderBottomLeftRadius:"0px", height:"4vh", width:"10vw", fontWeight:700}}
                >
                  <div

                  >&nbsp;&nbsp;Створити клієнта</div>
                </button>
              )}

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
