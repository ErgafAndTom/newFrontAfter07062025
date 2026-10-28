// components/nav/BellButton.jsx
import React from 'react';
import './BellButton.css';

const BellButton = ({ count, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`bell-button ${count > 0 ? 'pulse' : ''}`}
      aria-label={count > 0 ? `Сповіщення: ${count}` : 'Сповіщення'}
      title="Сповіщення"
    >
      <span className={`bell-symbol ${count > 0 ? 'shake' : ''}`}>
        <span className="bell-hryvnia" aria-hidden="true">₴</span>
      </span>
      <span className="bell-count">{count}</span>
    </button>
  );
};

export default BellButton;
