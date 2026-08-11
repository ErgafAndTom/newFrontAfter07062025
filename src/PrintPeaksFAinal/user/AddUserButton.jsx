import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import AddUserWindow from './AddUserWindow';
import './AddUserButton.css';

// hideTrigger — рендерити лише модалку, без власної кнопки. Використовує
// панель швидкого доступу (PPDock): вона малює свою плитку, а відкриває
// вікно глобальною подією 'pp-open-new-client'.
function AddUserButton({ fetchUsers, addOrdOrOnlyClient, thisOrder, setThisOrder, hideTrigger = false }) {
    const [showAddUser, setShowAddUser] = useState(false);

    // слухає лише інстанс дока — інакше на сторінці наряду, де кнопка вже
    // є, вікно відкрилося б двічі
    useEffect(() => {
        if (!hideTrigger) return undefined;
        const handler = () => setShowAddUser(true);
        window.addEventListener('pp-open-new-client', handler);
        return () => window.removeEventListener('pp-open-new-client', handler);
    }, [hideTrigger]);

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
        <>

              {/*{thisOrder && (*/}
              {/*  <button*/}
              {/*    className="adminButtonAdd " style={{marginLeft:"1vw"}}*/}
              {/*    onClick={handleAddUser}*/}
              {/*  >*/}
              {/*    Створити клієнта*/}
              {/*  </button>*/}
              {/*)}*/}
              {/*{!thisOrder && (*/}
              {/*  <button*/}
              {/*    // className="buttonSkewedOrderClient adminButtonAdd  "*/}
              {/*    className={`buttonSkewedOrderClient adminButtonAdd `}*/}
              {/*    onClick={handleAddUser}*/}
              {/*    style={{borderTopRightRadius:"0px", marginRight:"1vw", borderBottomLeftRadius:"0px", height:"4vh", width:"10vw", fontWeight:500, color:""}}*/}
              {/*  >*/}
              {/*    <div*/}

              {/*    >&nbsp;&nbsp;Створити клієнта</div>*/}
              {/*  </button>*/}
              {/*)}*/}


          {!hideTrigger && (
            <div
              className="buttonSkewedUser"
              onClick={handleAddUser}
            >
              <span className="nav-btn-full">Створити клієнта</span>
              <span className="nav-btn-short">+ клієнт</span>
            </div>
          )}
          <div style={{  }}>
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

        </>
    );
}

AddUserButton.propTypes = {
    fetchUsers: PropTypes.func
};

export default AddUserButton;
