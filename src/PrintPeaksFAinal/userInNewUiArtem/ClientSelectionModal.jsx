import React, { useState } from 'react';
import './ClientSelectionModal.css';
import TelegramAvatar from '../../PrintPeaksFAinal/Messages/TelegramAvatar';
import {fetchUser} from "../../actions/authActions";
import AddUserButton from "../user/AddUserButton";

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
                              }) => {
  const [expandedThingIndex, setExpandedThingIndex] = useState(null);

  const [isClosing, setIsClosing] = useState(false); // ✅ тут

  const filteredUsers = users.rows?.filter(u => u.firstName || u.lastName) || [];

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleChooseUser = (userId) => {
    handleSelectUser(userId);
    setModalVisible(false);
  };
  if (!showVisible) return null;
  return (
    <>
      <div className="modalOverlay " onClick={handleClose} />
      <div className="modalContainer animate-slide-up">
        <div className="noScrollbar">
          {!load && !error && filteredUsers.length > 0 && (
            <>
              <div className="searchSection">
                <input
                  type="text"
                  className="searchInput"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Пошук клієнта..."
                />
                <button className="adminButtonAdd" onClick={fetchUsers}>
                  Пошук
                </button>
                <AddUserButton fetchUsers={() => dispatch(fetchUser())} thisOrder={thisOrder} setThisOrder={setThisOrder} />
              </div>

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
                              {user.lastName} {user.firstName}
                            </div>
                            <div className="discount">
                              Знижка: {user.discount != null ? `${user.discount}%` : '—'}
                            </div>
                          </div>
                          {user.telegram && (
                            <span className="labelTelegram">
                              <TelegramAvatar link={user.telegram} size={50} />
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="d-flex flex-row">
                            <div>
                              <div className="userName">
                                {user.lastName} {user.firstName} <small>№{user.id}</small>
                              </div>
                              <div className="userDetail">Телефон: {user.phoneNumber || '—'}</div>
                              <div className="userDetail">Email: {user.email || '—'}</div>
                              <div className="userDetail">Signal: {user.signal || '—'}</div>
                              <div className="userDetail">Компанія: {user.company || '—'}</div>
                              <div className="userBarcode">Штрих-код: {user.barcode || '—'}</div>
                              <div className="discount">
                                Знижка: {user.discount != null ? `${user.discount}%` : '—'}
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
      </div>
    </>
  );
};

export default ClientSelectionModal;
