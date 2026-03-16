import React, { useCallback, useEffect, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import axios from "../../api/axiosInstance";
import { Spinner } from "react-bootstrap";
import { FiChevronDown, FiChevronUp, FiChevronsUp } from "react-icons/fi";
import "../userInNewUiArtem/ClientFilesPanel.css";
import "./CompanyOrdersPanel.css";

const CompanyOrdersPanel = ({ companyId, companyName = "", onClose, onOpenOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDesc, setSortDesc] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!companyId) return;
    try {
      setError(null);
      setLoading(true);
      const res = await axios.get(`/api/company/${companyId}/orders`);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.message || "Помилка отримання замовлень");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const getClientName = (o) => {
    const c = o.client;
    if (!c) return "—";
    const parts = [c.firstName, c.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : (c.username || `#${c.id}`);
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "2-digit" });
  };

  const fmtMoney = (v) => {
    const n = Number(v) || 0;
    return n.toLocaleString("uk-UA", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const toggleSort = (col) => {
    if (sortColumn === col) setSortDesc(prev => !prev);
    else { setSortColumn(col); setSortDesc(true); }
  };

  const sortedOrders = useMemo(() => {
    if (!sortColumn) return orders;
    return [...orders].sort((a, b) => {
      let cmp = 0;
      if (sortColumn === "id") cmp = (a.id || 0) - (b.id || 0);
      else if (sortColumn === "client") cmp = getClientName(a).localeCompare(getClientName(b), "uk");
      else if (sortColumn === "date") cmp = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      else if (sortColumn === "total") cmp = (Number(a.totalPrice) || 0) - (Number(b.totalPrice) || 0);
      else if (sortColumn === "status") cmp = (a.status || "").localeCompare(b.status || "", "uk");
      return sortDesc ? -cmp : cmp;
    });
  }, [orders, sortColumn, sortDesc]);

  const SortArrow = ({ col }) => {
    if (sortColumn !== col) return <FiChevronsUp size={11} style={{ opacity: 0.3, marginLeft: 4 }}/>;
    return sortDesc
      ? <FiChevronDown size={11} style={{ color: "var(--adminorange, #f5a623)", marginLeft: 4 }}/>
      : <FiChevronUp size={11} style={{ color: "var(--adminorange, #f5a623)", marginLeft: 4 }}/>;
  };

  return ReactDOM.createPortal(
    <div className="cfp-overlay" onClick={onClose}>
      <div className="cfp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cfp-header">
          <span style={{ fontSize: "var(--font-size-xs, 15px)", color: "var(--admingrey)", textTransform: "uppercase" }}>
            Замовлення компанії — {companyName}
          </span>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 20 }}>
            <Spinner animation="grow" variant="dark" size="sm"/>
          </div>
        )}
        {error && <div className="alert alert-danger" style={{ margin: "0 16px" }}>{error}</div>}

        <div className="cfp-list-header cop-grid">
          <div className="cfp-sort-col" onClick={() => toggleSort("id")}>ID<SortArrow col="id"/></div>
          <div className="cfp-sort-col" onClick={() => toggleSort("client")}>Клієнт<SortArrow col="client"/></div>
          <div className="cfp-sort-col" onClick={() => toggleSort("date")}>Дата<SortArrow col="date"/></div>
          <div className="cfp-sort-col" onClick={() => toggleSort("total")}>Сума<SortArrow col="total"/></div>
          <div className="cfp-sort-col" onClick={() => toggleSort("status")}>Статус<SortArrow col="status"/></div>
        </div>

        <div className="cfp-list">
          {!loading && orders.length === 0 && (
            <div className="cfp-empty">Замовлень поки немає</div>
          )}

          {sortedOrders.map(o => (
            <div
              key={o.id}
              className="cfp-file-row cop-grid cop-order-row"
              onClick={() => onOpenOrder?.(o.id)}
            >
              <div className="cop-cell cop-cell--id">{o.id}</div>
              <div className="cop-cell cop-cell--client">{getClientName(o)}</div>
              <div className="cop-cell">{formatDate(o.createdAt)}</div>
              <div className="cop-cell cop-cell--total">{fmtMoney(o.totalPrice)} грн</div>
              <div className="cop-cell cop-cell--status">{o.status || "—"}</div>
            </div>
          ))}
        </div>

        <div className="cfp-statusbar">
          Замовлення компанії — {companyName}
          {orders.length > 0 && ` (${orders.length})`}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CompanyOrdersPanel;
