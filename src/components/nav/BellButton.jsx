// components/nav/BellButton.jsx
import React from 'react';
import './BellButton.css';
import {useSelector} from "react-redux"; // стилі окремо

const BellButton = ({ count, onClick }) => {
  const {
    lists,
    loading,
    saving,
    deleting,
    hoveredCard,
    dragData,
    openCardInfo: isCardInfoOpen,
    openCardData,
    showDeleteListModal: isDeleteListModalOpen,
    listToDelete,
    error
  } = useSelector((state) => state.trello);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`bell-button ${count > 0 ? 'pulse' : ''}`}
      aria-label={count > 0 ? `Сповіщення: ${count}` : 'Сповіщення'}
      title="Сповіщення"
    >
      <span className={`bell-symbol ${count > 0 ? 'shake' : ''}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </span>
      <span className="bell-count">{count}</span>
    </button>
  );
};

export default BellButton;
