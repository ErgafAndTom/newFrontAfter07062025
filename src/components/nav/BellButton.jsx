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
      onClick={onClick}
      className={`bell-button ${count > 0 ? 'pulse' : ''}`}
    >
      <span className={`bell-symbol ${count > 0 ? 'shake' : ''}`}
      >🕭</span>
      {lists?.[0]?.Cards?.length}
    </button>
  );
};

export default BellButton;
