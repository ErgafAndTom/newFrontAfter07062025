import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import axios from "../../api/axiosInstance";
import "./SearchOrderDropdown.css";

const STATUS_MAP = {
  '-1': { label: 'Скасоване',  color: 'var(--adminred)' },
  '0':  { label: 'Обробка',    color: 'var(--adminorange)' },
  '1':  { label: 'Друк',       color: 'var(--adminblue)' },
  '2':  { label: 'Постпрес',   color: 'var(--adminpurple)' },
  '3':  { label: 'Готово',     color: 'var(--admingreen)' },
  '4':  { label: 'Отримано',   color: 'var(--admingreen)' },
  '5':  { label: 'Видалено',   color: 'var(--admingrey)' },
};

export default function SearchOrderDropdown() {
  const search = useSelector((state) => state.search.search);
  const currentUser = useSelector((state) => state.auth.user);
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const wrapRef = useRef(null);
  const timerRef = useRef(null);

  // Only active on Home and Orders pages
  const isActivePage = location.pathname === '/' || location.pathname === '/Desktop' || location.pathname.startsWith('/Orders');

  // Close on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setVisible(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Debounced search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!search || !search.trim() || !isActivePage || !currentUser) {
      setResults([]);
      setVisible(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url = (currentUser.role === 'admin' || currentUser.role === 'operator' || currentUser.role === 'manager')
          ? '/orders/all'
          : '/orders/my';

        const res = await axios.post(url, {
          search: search.trim(),
          currentPage: 1,
          inPageCount: 10,
          columnName: { column: 'id', reverse: true },
        });

        const orders = res.data?.rows || res.data?.orders || res.data?.data || [];
        setResults(Array.isArray(orders) ? orders : []);
        setVisible(orders.length > 0);
      } catch (err) {
        console.error('Search orders error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [search, isActivePage, currentUser]);

  const handleClick = useCallback((orderId) => {
    window.open(`/Orders/${orderId}`, '_blank');
    setVisible(false);
  }, []);

  if (!isActivePage || !visible || (!loading && results.length === 0)) {
    return null;
  }

  return (
    <div className="sod-wrap" ref={wrapRef}>
      {loading ? (
        <div className="sod-loading">Пошук...</div>
      ) : results.length === 0 ? (
        <div className="sod-empty">Нічого не знайдено</div>
      ) : (
        results.map((order) => {
          const st = STATUS_MAP[String(order.status)] || STATUS_MAP['0'];
          const clientName = order.client
            ? `${order.client.lastName || ''} ${order.client.firstName || ''}`.trim()
            : '—';
          const price = order.allPrice != null ? `${parseFloat(order.allPrice).toFixed(0)} грн` : '—';

          return (
            <div key={order.id} className="sod-item" onClick={() => handleClick(order.id)}>
              <span className="sod-id">#{order.id}</span>
              <span className="sod-client">{clientName}</span>
              <span className="sod-price">{price}</span>
              <span className="sod-status" style={{ color: st.color, borderColor: st.color }}>
                {st.label}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}
