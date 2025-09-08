import React, { useState } from 'react';
import './ClientSelectionModal.css';
import TelegramAvatar from '../../PrintPeaksFAinal/Messages/TelegramAvatar';
import {fetchUser} from "../../actions/authActions";
import AddUserButton from "../user/AddUserButton";
import { FiUser } from "react-icons/fi";
import ClientCabinet from "./ClientCabinet.jsx";

const ClientSelectionModal = ({
                                showVisible,
                                handleClose,
                                fetchUsers,
                                users,
                                load,
                                error,
                                handleSelectUser,
                                setModalVisible,
                                thisOrder,
                                setThisOrder,
                                setSearchQuery,
                                searchQuery, searchId, setSearchId
                              }) => {
  const [expandedThingIndex, setExpandedThingIndex] = useState(null);

  const [isClosing, setIsClosing] = useState(false); // ✅ тут
  const [thisUserIdToCabinet2, setThisUserIdToCabinet2] = useState(0);
  const [clientCabinetOpen2, setClientCabinetOpen2] = useState(false);

  const filteredUsers = users.rows || []
  // const filteredUsers = users.rows?.filter(u => u.firstName || u.lastName) || [];

  // const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    // console.log(e.target.value);
    setSearchQuery(e.target.value);
  };

  const handleSearchChangeId = (e) => {
    // console.log(e);
    setSearchId(e);
  };

  const setThisUserToCabinetFunc2 = (open, user, e) => {
    e.stopPropagation();
    setThisUserIdToCabinet2(user.id)
    setClientCabinetOpen2(open)
  };

  const handleChooseUser = (userId) => {
    handleSelectUser(userId);
    setModalVisible(false);
  };
  if (!showVisible) return null;
  return (
    <>
      <div className="modalOverlay " onClick={handleClose}
           style={{
             position: 'fixed',
             inset: 0,
             width: '100vw',
             height: '100vh',
             backgroundColor: 'rgba(15, 15, 15, 0.45)',
             backdropFilter: 'blur(2px)',
             WebkitBackdropFilter: 'blur(2px)',
             zIndex: 99,
             // opacity: isAnimating ? 1 : 0,
             transition: 'opacity 200ms ease',
           }}
      />
      <div className="modalContainer animate-slide-up" >
        <div className="noScrollbar">
          {!load && !error && filteredUsers.length > 0 && (
            <>
              <ul className="userList">
                {filteredUsers.map((user, index) => {
                  const isExpanded = index === expandedThingIndex;
                  return (

                    <li
                      key={user.id}
                      className={`userListItem ${isExpanded ? 'expanded' : 'compact'}`}
                      onClick={() => setExpandedThingIndex(isExpanded ? null : index)}
                    >

                      {!isExpanded ? (
                        <>

                          <div>
                            <div className="userName">
                              {user.lastName} {user.firstName} 🤖:{user.id}
                            </div>
                            <div className="discount">
                              Знижка: {user.discount != null ? `${user.discount}` : '—'}
                            </div>
                          </div>

                          <span className="labelTelegram d-flex flex-row justify-content-start align-items-center gap-2">

                             <button
                               className="clientCabinetButton client-cabinet-icon"
                               onClick={(e) => setThisUserToCabinetFunc2(true, user, e)}
                             >
                             <FiUser />
                            </button>
                            {user.telegram && (
                              <TelegramAvatar link={user.telegram} size={50} />
                            )}


                            </span>
                        </>
                      ) : (
                        <>
                          <div className="d-flex flex-row">
                            <div>
                              <div className="userName">
                                {user.lastName} {user.firstName} <small>🤖:{user.id}</small>
                              </div>
                              <div className="userDetail">Телефон: {user.phoneNumber || '—'}</div>
                              <div className="userDetail">Email: {user.email || '—'}</div>
                              <div className="userDetail">Signal: {user.signal || '—'}</div>
                              <div className="userDetail">Компанія: {user.company || '—'}</div>
                              <div className="userBarcode">Штрих-код: {user.barcode || '—'}</div>
                              <div className="discount">
                                Знижка: {user.discount != null ? `${user.discount}` : '—'}
                              </div>
                            </div>

                            <div className="userCard">
                              <div className="userTelegramIcon">
                                {user.telegram && (
                                  <div className="labelTelegram">
                                    <TelegramAvatar link={user.telegram} size={50} />
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="buttonRow">
                              <button
                                className="adminButtonAdd"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChooseUser(user.id);
                                  handleClose()

                                }}
                              >
                                Вибрати
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        <div className="searchSection d-flex flex-row justify-content-start align-items-center">
          <label style={{ cursor: "pointer", fontSize: "1.7rem" }}>
            <input
              type="checkbox"
              checked={searchId}
              onChange={(e) => handleSearchChangeId(e.target.checked)}
              style={{ display: "none" }} // ховаємо стандартний чекбокс
            />
            <div
              style={{
                opacity: searchId ? 1 : 0.2, // прозорий якщо не натиснутий
                transition: "opacity 0.4s",
                height: "35px",
                lineHeight: "35px",
              }}
            >    🤖      </div>
          </label>
          <input
            type="text"
            className="searchInput"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Пошук клієнта..."
          />

          {/*<button className="adminButtonAdd" onClick={fetchUsers}>*/}
          {/*  Пошук*/}
          {/*</button>*/}
          <AddUserButton
            fetchUsers={fetchUsers}
            thisOrder={thisOrder}
            setThisOrder={setThisOrder}
          />
          {/*<AddUserButton fetchUsers={() => dispatch(fetchUser())} thisOrder={thisOrder} setThisOrder={setThisOrder} />*/}
        </div>
      </div>
      {clientCabinetOpen2 && thisUserIdToCabinet2 && (
        <ClientCabinet
          userId={thisUserIdToCabinet2}
          onCreateOrder={()=>{}}
          onOpenChat={()=>{}}
          onOpenProfile={()=>{}}
          onClose={()=>setClientCabinetOpen2(false)}
        />
      )}
    </>
  );
};

export default ClientSelectionModal;
