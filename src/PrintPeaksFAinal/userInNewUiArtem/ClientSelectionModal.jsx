import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './ClientSelectionModal.css';
import TelegramAvatar from '../../PrintPeaksFAinal/Messages/TelegramAvatar';
import {fetchUser} from "../../actions/authActions";
import ClientCabinet from "./ClientCabinet.jsx";
import AddUserWindow from "../user/AddUserWindow";

/* Форматування телефону: 380661111111 → +38 (066) 111-11-11 */
const formatPhone = (raw) => {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('38')) {
    return `+${digits.slice(0,2)} (${digits.slice(2,5)}) ${digits.slice(5,8)}-${digits.slice(8,10)}-${digits.slice(10,12)}`;
  }
  if (digits.length === 10) {
    return `+38 (0${digits.slice(1,3)}) ${digits.slice(3,6)}-${digits.slice(6,8)}-${digits.slice(8,10)}`;
  }
  return raw;
};

/* Нормалізатор — підтримує "10%", "10", 10 */
const norm = v => {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(String(v).replace('%', '').trim());
  return isNaN(n) ? 0 : n;
};

/* Головна функція */
export const getEffectiveDiscount = order => {
  if (!order) return 0;
  if (order.effectiveDiscount !== undefined && order.effectiveDiscount !== null)
    return norm(order.effectiveDiscount);
  const server  = norm(order.discount ?? order.prepayment);
  const client  = norm(order.client?.discount);
  const company = norm(order.client?.Company?.discount ?? order.client?.company?.discount);
  return Math.max(server, client, company);
};

const ClientSelectionModal = ({
                                showVisible,
                                handleClose,
                                fetchUsers,
                                users,
                                load,
                                loadingMore,
                                loadMoreUsers,
                                error,
                                handleSelectUser,
                                setModalVisible,
                                thisOrder,
                                setThisOrder,
                                setSearchQuery,
                                searchQuery, searchId, setSearchId,
                                modalVisible, handleCloseAddUser, handleUserAdded
                              }) => {
  const [expandedThingIndex, setExpandedThingIndex] = useState(null);
  const [thisUserIdToCabinet2, setThisUserIdToCabinet2] = useState(0);
  const [clientCabinetOpen2, setClientCabinetOpen2] = useState(false);
  const sentinelRef = useRef(null);
  const listRef = useRef(null);
  const hasMoreRef = useRef(false);
  const loadingMoreRef = useRef(false);

  const filteredUsers = users.rows || [];
  const hasMore = filteredUsers.length < (users.count || 0);
  hasMoreRef.current = hasMore;
  loadingMoreRef.current = loadingMore;

  // Scroll event fallback — завантаження наступної сторінки
  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;
    const onScroll = () => {
      if (!hasMoreRef.current || loadingMoreRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = listEl;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMoreUsers();
      }
    };
    listEl.addEventListener('scroll', onScroll);
    return () => listEl.removeEventListener('scroll', onScroll);
  }, [loadMoreUsers]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchChangeId = (e) => {
    setSearchId(e);
  };

  const setThisUserToCabinetFunc2 = (open, user, e) => {
    e.stopPropagation();
    setThisUserIdToCabinet2(user.id);
    setClientCabinetOpen2(open);
  };

  const handleChooseUser = (userId) => {
    handleSelectUser(userId);
    setModalVisible(false);
  };

  if (!showVisible) return null;

  return ReactDOM.createPortal(
    <>
      {/* Overlay */}
      <div className="csm-overlay" onClick={handleClose} />

      {/* Panel */}
      <div className="csm-panel">

        {/* Search bar — зверху */}
        <div className="csm-search">
          <button
            type="button"
            className={`adminButton csm-search-id-btn${searchId ? ' is-active' : ''}`}
            onClick={() => handleSearchChangeId(!searchId)}
          >
            <span>Пошук по ID</span>
          </button>
          <input
            type="text"
            className="csm-search-input"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={searchId ? "Пошук клієнта по ID..." : "Пошук клієнта по назві..."}
          />
          <button
            type="button"
            className="adminButton csm-create-btn"
            onClick={() => setModalVisible(true)}
          >
            <span className="csm-create-btn-text">Створити клієнта</span>
          </button>
        </div>

        {/* User list */}
        <div className="csm-list" ref={listRef}>
          {load && (
            <div className="csm-empty">Завантаження...</div>
          )}
          {!load && error && (
            <div className="csm-empty csm-empty--error">Помилка: {error?.message || error}</div>
          )}
          {!load && !error && filteredUsers.length === 0 && (
            <div className="csm-empty">Клієнтів не знайдено</div>
          )}
          {!load && !error && filteredUsers.map((user, index) => {
            const isExpanded = index === expandedThingIndex;
            const personalDiscount = norm(user?.discount ?? user?.prepayment);
            const companyDiscount = norm(user?.Company?.discount ?? user?.companyDiscount ?? user?.company?.discount);
            const effectiveDiscount = Math.max(personalDiscount, companyDiscount);
            const hasDiscount = effectiveDiscount > 0;

            return (
              <div
                key={user.id}
                className={`csm-user${isExpanded ? ' is-expanded' : ''}`}
                onClick={() => setExpandedThingIndex(isExpanded ? null : index)}
              >
                {/* Compact row — grid Telegram-style */}
                <div className="csm-user-row">
                  <span className="csm-user-id">{user.id}</span>
                  <div className="csm-user-avatar-wrap">
                    <TelegramAvatar link={user.telegram} size={52} square={true} />
                  </div>
                  <div className="csm-user-info">
                    <div className="csm-user-name">{user.lastName} {user.firstName}</div>
                    {(user.Company?.companyName || user.company) && (
                      <span className="csm-user-company">{user.Company?.companyName || user.company}</span>
                    )}
                  </div>
                  <span className="csm-user-discount">{hasDiscount && effectiveDiscount > 0 ? `${effectiveDiscount}%` : ''}</span>
                  <span className="csm-user-telegram">{user.telegram || ''}</span>
                  <span className="csm-user-phone">{formatPhone(user.phoneNumber)}</span>
                  <button
                    className="adminButton csm-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChooseUser(user.id);
                      handleClose();
                    }}
                  >
                    <span>Вибрати</span>
                  </button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="csm-user-details">
                    <div className="csm-user-details-grid">
                      <span className="csm-detail-label">ID:</span>
                      <span className="csm-detail-value">{user.id}</span>
                      <span className="csm-detail-label">Телефон:</span>
                      <span className="csm-detail-value">{user.phoneNumber || '—'}</span>
                      <span className="csm-detail-label">Email:</span>
                      <span className="csm-detail-value">{user.email || '—'}</span>
                      <span className="csm-detail-label">Компанія:</span>
                      <span className="csm-detail-value">{user.company || '—'}</span>
                      {hasDiscount && (
                        <>
                          <span className="csm-detail-label">Знижка:</span>
                          <span className="csm-detail-value">{effectiveDiscount}%</span>
                        </>
                      )}
                    </div>
                    <button
                      className="adminButton csm-action-btn csm-cabinet-side-btn"
                      onClick={(e) => setThisUserToCabinetFunc2(true, user, e)}
                    >
                      <span>Кабінет</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {/* Sentinel для infinite scroll */}
          <div ref={sentinelRef} style={{ height: 1 }} />
          {loadingMore && (
            <div className="csm-empty" style={{ opacity: 0.5 }}>Завантаження...</div>
          )}
        </div>

      </div>

      {modalVisible && (
        <AddUserWindow
          show={modalVisible}
          onHide={handleCloseAddUser}
          thisOrder={thisOrder}
          setThisOrder={setThisOrder}
          onUserAdded={() => {
            handleUserAdded();
          }}
        />
      )}

      {clientCabinetOpen2 && thisUserIdToCabinet2 && (
        <ClientCabinet
          userId={thisUserIdToCabinet2}
          onCreateOrder={() => {}}
          onOpenChat={() => {}}
          onOpenProfile={() => {}}
          onClose={() => setClientCabinetOpen2(false)}
        />
      )}
    </>,
    document.body
  );
};

export default ClientSelectionModal;
