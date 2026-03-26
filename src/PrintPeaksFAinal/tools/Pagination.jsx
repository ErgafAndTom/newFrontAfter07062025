import React, { useRef, useEffect } from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange, onLimitChange, handleAddCompany, sethandleAddCompany, limit }) => {
  const listWrapperRef = useRef(null);
  const activeItemRef = useRef(null);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);


  // При смене currentPage — прокручиваем активный элемент в центр (только горизонтально, без скролла страницы)
  useEffect(() => {
    if (activeItemRef.current && listWrapperRef.current) {
      const wrapper = listWrapperRef.current;
      const item = activeItemRef.current;
      const itemLeft = item.offsetLeft - wrapper.offsetLeft;
      const scrollTarget = itemLeft - wrapper.clientWidth / 2 + item.clientWidth / 2;
      wrapper.scrollTo({ left: scrollTarget, behavior: 'smooth' });
    }
  }, [currentPage]);

  return (
    <div className="pagination-wrapper">
      {onLimitChange && (
        <div className="pagination-limit">
          <select value={limit} onChange={e => onLimitChange(Number(e.target.value))}>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
            <option value={500}>500</option>
          </select>
        </div>
      )}
      <button
        className="page-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← Попередня
      </button>

      <div className="pagination-list-wrapper" ref={listWrapperRef}>
        <ul className="pagination-list">
          {pages.map(p => (
            <li
              key={p}
              ref={p === currentPage ? activeItemRef : null}
              className={`page-item${p === currentPage ? ' active' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </li>
          ))}
        </ul>
      </div>

      <button
        className="page-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Наступна →
      </button>


    </div>
  );
};

export default Pagination;
