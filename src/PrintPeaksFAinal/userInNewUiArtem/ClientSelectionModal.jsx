import React, { useState, useEffect, useRef } from 'react';
import './ClientSelectionModal.css';
import TelegramAvatar from '../../PrintPeaksFAinal/Messages/TelegramAvatar';
import {fetchUser} from "../../actions/authActions";
import ClientCabinet from "./ClientCabinet.jsx";
import CompactAddUserForm from "./CompactAddUserForm";

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

  const filteredUsers = users.rows || [];
  const hasMore = filteredUsers.length < (users.count || 0);

  // IntersectionObserver — коли sentinel видно, завантажуємо наступну сторінку
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !loadingMore) loadMoreUsers(); },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMoreUsers]);

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

  return (
    <>
      {/* Overlay */}
      <div className="csm-overlay" onClick={handleClose} />

      {/* Panel */}
      <div className="csm-panel">

        {/* User list */}
        <div className="csm-list">
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
                {/* Compact row */}
                <div className="csm-user-row">
                  <span className="csm-user-id-col">{user.id}</span>
                  <div className="csm-user-avatar-wrap">
                    <TelegramAvatar link={user.telegram} size={60} square={true} />
                  </div>
                  <div className="csm-user-info">
                    <div className="csm-user-name">{user.lastName} {user.firstName}</div>
                    {(user.Company?.companyName || user.company) && (
                      <span className="csm-user-company">{user.Company?.companyName || user.company}</span>
                    )}
                    {hasDiscount && effectiveDiscount > 0 && (
                      <span className="csm-user-discount">Знижка: {effectiveDiscount}%</span>
                    )}
                  </div>
                  <div className="csm-user-actions">
                    <button
                      className="csm-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChooseUser(user.id);
                        handleClose();
                      }}
                    >
                      <span className="csm-action-btn-text">Вибрати</span>
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="csm-user-details">
                    <div className="csm-user-details-grid">
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
                      className="csm-action-btn csm-cabinet-side-btn"
                      onClick={(e) => setThisUserToCabinetFunc2(true, user, e)}
                    >
                      <span className="csm-action-btn-text">Кабінет</span>
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

        {/* Search bar — знизу */}
        <div className="csm-search">
          <label className="csm-search-id-toggle" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={searchId}
              onChange={(e) => handleSearchChangeId(e.target.checked)}
              style={{ display: "none" }}
            />
            <span className={`csm-search-id-label${searchId ? ' is-active' : ''}`}>Пошук по ID</span>
          </label>
          <input
            type="text"
            className="csm-search-input"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={searchId ? "Пошук клієнта по ID..." : "Пошук клієнта по назві..."}
          />
          <button
            type="button"
            className="csm-create-btn"
            onClick={() => setModalVisible(true)}
          >
            <span className="csm-create-btn-text">CREATE CLIENT</span>
          </button>

        </div>
      </div>

      {modalVisible && (
        <>
          <div className="csm-add-overlay" onClick={handleCloseAddUser} />
          <div className="csm-add-panel" role="dialog" aria-modal="true">
            <div className="csm-add-header">
              <span className="csm-add-title">CREATE CLIENT</span>
              <button type="button" className="csm-add-close" onClick={handleCloseAddUser}>X</button>
            </div>
            <div className="csm-add-body">
              <CompactAddUserForm
                handleCloseAddUser={handleCloseAddUser}
                onUserAdded={handleUserAdded}
              />
            </div>
          </div>
        </>
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
    </>
  );
};

export default ClientSelectionModal;
