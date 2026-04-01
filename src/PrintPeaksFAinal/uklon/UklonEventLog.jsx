import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './UklonEventLog.css';

/* ── helpers ── */

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function httpClass(status) {
  if (!status) return '';
  if (status >= 200 && status < 300) return 'uel-http-ok';
  if (status >= 400) return 'uel-http-err';
  return 'uel-http-warn';
}

function durationClass(ms) {
  if (!ms) return 'uel-duration';
  if (ms < 500) return 'uel-duration uel-duration-fast';
  if (ms < 2000) return 'uel-duration uel-duration-mid';
  return 'uel-duration uel-duration-slow';
}

function tryParseJson(str) {
  if (!str) return null;
  if (typeof str === 'object') return str;
  try { return JSON.parse(str); } catch { return str; }
}

/** Human-readable error type from HTTP status */
function errorTypeLabel(httpStatus, errorMessage) {
  if (!httpStatus && errorMessage) {
    const msg = (errorMessage || '').toLowerCase();
    if (msg.includes('timeout') || msg.includes('econnaborted')) return 'Timeout';
    if (msg.includes('econnrefused') || msg.includes('network')) return 'Network Error';
    return 'Error';
  }
  if (httpStatus === 400) return 'Bad Request';
  if (httpStatus === 401) return 'Auth Error';
  if (httpStatus === 403) return 'Forbidden';
  if (httpStatus === 404) return 'Not Found';
  if (httpStatus === 409) return 'Conflict';
  if (httpStatus === 422) return 'Validation';
  if (httpStatus === 429) return 'Rate Limit';
  if (httpStatus >= 500) return 'Server Error';
  return `Error ${httpStatus || ''}`;
}

function JsonBlock({ title, data }) {
  const parsed = tryParseJson(data);
  if (!parsed) return null;
  return (
    <div className="uel-json-block">
      <h4>{title}</h4>
      <pre className="uel-json-pre">{typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2)}</pre>
    </div>
  );
}

/* ── main component ── */

export default function UklonEventLog({ initialOrderId }) {
  const [tab, setTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  // Filters
  const [filterOrderId, setFilterOrderId] = useState(initialOrderId || '');
  const [filterUserId, setFilterUserId] = useState('');
  const [filterServer, setFilterServer] = useState('');
  const [filterEventType, setFilterEventType] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  useEffect(() => {
    if (!initialOrderId) {
      const params = new URLSearchParams(window.location.search);
      const oid = params.get('orderId');
      if (oid) setFilterOrderId(oid);
    }
  }, [initialOrderId]);

  const fetchEvents = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 50 };
      if (filterOrderId) params.orderId = filterOrderId;
      if (filterUserId) params.userId = filterUserId;
      if (filterServer) params.serverUrl = filterServer;
      if (filterEventType) params.eventType = filterEventType;
      if (filterAction) params.action = filterAction;
      if (filterDateFrom) params.dateFrom = filterDateFrom;
      if (filterDateTo) params.dateTo = filterDateTo;

      const { data } = await axiosInstance.get('/api/uklon/events', { params });
      setEvents(data.items || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('[UklonEventLog] fetch error:', err);
      setEvents([]);
    }
    setLoading(false);
  }, [filterOrderId, filterUserId, filterServer, filterEventType, filterAction, filterDateFrom, filterDateTo]);

  const fetchStats = useCallback(async (groupBy) => {
    setLoading(true);
    try {
      const params = { groupBy };
      if (filterDateFrom) params.dateFrom = filterDateFrom;
      if (filterDateTo) params.dateTo = filterDateTo;
      const { data } = await axiosInstance.get('/api/uklon/events/stats', { params });
      setStats(data.items || []);
    } catch (err) {
      console.error('[UklonEventLog] stats error:', err);
      setStats([]);
    }
    setLoading(false);
  }, [filterDateFrom, filterDateTo]);

  useEffect(() => {
    if (tab === 'events') fetchEvents(1);
    else if (tab === 'users') fetchStats('user');
    else if (tab === 'orders') fetchStats('order');
    else if (tab === 'servers') fetchStats('server');
  }, [tab, fetchEvents, fetchStats]);

  const handleFilter = () => {
    setPage(1);
    if (tab === 'events') fetchEvents(1);
    else if (tab === 'users') fetchStats('user');
    else if (tab === 'orders') fetchStats('order');
    else if (tab === 'servers') fetchStats('server');
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchEvents(newPage);
  };

  const userName = (row) => {
    const u = row.initiator;
    if (!u) return row.userId ? `#${row.userId}` : '—';
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || `#${u.id}`;
  };

  /** Extract children from backend-grouped data or fallback to empty */
  const getChildren = (ev) => ev.children || [];

  return (
    <div className="uel-wrap">
      <div className="uel-header">
        <h2>Uklon Event Log</h2>
        <span style={{ opacity: 0.5 }}>Total: {total}</span>
      </div>

      {/* Tabs */}
      <div className="uel-tabs">
        <button className={`uel-tab ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>Всі події</button>
        <button className={`uel-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>По юзерах</button>
        <button className={`uel-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>По замовленнях</button>
        <button className={`uel-tab ${tab === 'servers' ? 'active' : ''}`} onClick={() => setTab('servers')}>По серверах</button>
      </div>

      {/* Filters */}
      {tab === 'events' && (
        <div className="uel-filters">
          <div className="uel-filter-group">
            <label>Order ID</label>
            <input type="text" value={filterOrderId} onChange={e => setFilterOrderId(e.target.value)} placeholder="123" />
          </div>
          <div className="uel-filter-group">
            <label>User ID</label>
            <input type="text" value={filterUserId} onChange={e => setFilterUserId(e.target.value)} placeholder="1" />
          </div>
          <div className="uel-filter-group">
            <label>Server</label>
            <input type="text" value={filterServer} onChange={e => setFilterServer(e.target.value)} placeholder="staging" />
          </div>
          <div className="uel-filter-group">
            <label>Тип</label>
            <select value={filterEventType} onChange={e => setFilterEventType(e.target.value)}>
              <option value="">Всі</option>
              <option value="api_request">API Request</option>
              <option value="api_response">API Response</option>
              <option value="webhook_incoming">Webhook</option>
              <option value="status_change">Status Change</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="uel-filter-group">
            <label>Дія</label>
            <select value={filterAction} onChange={e => setFilterAction(e.target.value)}>
              <option value="">Всі</option>
              <option value="create">Create</option>
              <option value="estimate">Estimate</option>
              <option value="cancel">Cancel</option>
              <option value="return">Return</option>
              <option value="auth">Auth</option>
              <option value="webhook_order">Webhook Order</option>
              <option value="webhook_driver">Webhook Driver</option>
              <option value="get_status">Get Status</option>
              <option value="balance">Balance</option>
              <option value="receipt">Receipt</option>
            </select>
          </div>
          <div className="uel-filter-group">
            <label>Від</label>
            <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
          </div>
          <div className="uel-filter-group">
            <label>До</label>
            <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
          </div>
          <button className="uel-filter-btn" onClick={handleFilter}>Фільтр</button>
        </div>
      )}

      {tab !== 'events' && (
        <div className="uel-filters">
          <div className="uel-filter-group">
            <label>Від</label>
            <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
          </div>
          <div className="uel-filter-group">
            <label>До</label>
            <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
          </div>
          <button className="uel-filter-btn" onClick={handleFilter}>Фільтр</button>
        </div>
      )}

      {loading && <div className="uel-loading">Завантаження...</div>}

      {/* ══════ Events table ══════ */}
      {!loading && tab === 'events' && (
        <>
          {events.length === 0 ? (
            <div className="uel-empty">Подій не знайдено</div>
          ) : (
            <table className="uel-table">
              <thead>
                <tr>
                  <th>Час</th>
                  <th>Юзер</th>
                  <th>Order</th>
                  <th>Джерело</th>
                  <th>Дія</th>
                  <th>Результат</th>
                  <th>HTTP</th>
                  <th>Час (ms)</th>
                  <th>Сервер</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => {
                  const children = getChildren(ev);
                  const isWebhook = ev.eventType === 'webhook_incoming' || (ev.action && ev.action.startsWith('webhook_'));

                  // Find response & error among children
                  const responseChild = children.find(c => c.eventType === 'api_response');
                  const errorChild = children.find(c => c.eventType === 'error');
                  const statusChildren = children.filter(c => c.eventType === 'status_change');

                  // Result for main row
                  const resultChild = responseChild || errorChild;
                  const hasError = !!errorChild;
                  const hasResponse = !!responseChild;
                  const noResponse = ev.eventType === 'api_request' && !resultChild;

                  // HTTP status & duration from response/error child
                  const displayHttpStatus = resultChild?.httpStatus || ev.httpStatus;
                  const displayDuration = resultChild?.duration || ev.duration;

                  return (
                    <React.Fragment key={ev.id}>
                      {/* ── Main row ── */}
                      <tr
                        className="uel-row-clickable"
                        onClick={() => setExpandedId(expandedId === ev.id ? null : ev.id)}
                      >
                        <td>{formatDate(ev.createdAt)}</td>
                        <td>{userName(ev)}</td>
                        <td>{ev.orderId || '—'}</td>
                        <td>
                          <span className={`uel-badge ${isWebhook ? 'uel-badge-cyan' : 'uel-badge-blue'}`}>
                            {isWebhook ? 'Webhook Uklon' : 'Запит ERP'}
                          </span>
                        </td>
                        <td>
                          <strong>{ev.action}</strong>
                          {ev.endpoint && <span style={{ opacity: 0.4, marginLeft: 4, fontSize: 11 }}>{ev.method} {ev.endpoint}</span>}
                        </td>
                        <td>
                          {/* Status change arrow (if any) */}
                          {statusChildren.length > 0 && (
                            <span style={{ marginRight: 6 }}>
                              {statusChildren[0].statusBefore || '—'}
                              <span className="uel-status-arrow">&rarr;</span>
                              <strong>{statusChildren[0].statusAfter || '—'}</strong>
                            </span>
                          )}
                          {/* Response result */}
                          {hasResponse && !hasError && <span className="uel-badge uel-badge-green">OK</span>}
                          {hasResponse && hasError && (
                            <>
                              <span className="uel-badge uel-badge-green" style={{ marginRight: 4 }}>OK</span>
                              <span className="uel-badge uel-badge-red">{errorTypeLabel(errorChild.httpStatus, errorChild.errorMessage)}</span>
                            </>
                          )}
                          {!hasResponse && hasError && (
                            <span className="uel-badge uel-badge-red" title={errorChild.errorMessage || ''}>
                              {errorTypeLabel(errorChild.httpStatus, errorChild.errorMessage)}
                              {errorChild.httpStatus ? ` ${errorChild.httpStatus}` : ''}
                            </span>
                          )}
                          {noResponse && <span className="uel-badge uel-badge-red">Timeout</span>}
                          {!resultChild && !noResponse && statusChildren.length === 0 && '—'}
                        </td>
                        <td>
                          {displayHttpStatus
                            ? <span className={httpClass(displayHttpStatus)}>{displayHttpStatus}</span>
                            : '—'}
                        </td>
                        <td>
                          {displayDuration
                            ? <span className={durationClass(displayDuration)}>{displayDuration}ms</span>
                            : '—'}
                        </td>
                        <td style={{ fontSize: '11px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ev.serverUrl ? ev.serverUrl.replace('https://', '').replace('http://', '') : '—'}
                        </td>
                      </tr>

                      {/* ── Expanded detail ── */}
                      {expandedId === ev.id && (
                        <tr className="uel-expanded">
                          <td colSpan={9}>
                            {/* REQUEST */}
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--adminblue)', marginBottom: 4 }}>
                                {isWebhook ? 'Webhook incoming' : 'Request'}
                                {ev.endpoint && <span style={{ fontWeight: 400, marginLeft: 8 }}>{ev.method} {ev.serverUrl}{ev.endpoint}</span>}
                                {ev.ipAddress && <span style={{ fontWeight: 400, marginLeft: 8, opacity: 0.5 }}>IP: {ev.ipAddress}</span>}
                              </div>
                              <div className="uel-json-wrap">
                                {ev.requestBody
                                  ? <JsonBlock title={isWebhook ? 'Webhook Body' : 'Request Body'} data={ev.requestBody} />
                                  : !isWebhook && <div style={{ fontSize: 12, opacity: 0.4, padding: '4px 0' }}>Без тіла запиту (GET)</div>
                                }
                              </div>
                            </div>

                            {/* API RESPONSE (if exists) */}
                            {responseChild && (
                              <div style={{ marginBottom: 8, borderTop: '1px dashed var(--adminfonelement)', paddingTop: 8 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--admingreen)', marginBottom: 4 }}>
                                  Response
                                  <span style={{ fontWeight: 400, marginLeft: 8 }}>
                                    HTTP {responseChild.httpStatus} | {responseChild.duration}ms
                                  </span>
                                </div>
                                <div className="uel-json-wrap">
                                  <JsonBlock title="Response Body" data={responseChild.responseBody} />
                                </div>
                              </div>
                            )}

                            {/* ERROR (if exists — can be alongside response or standalone) */}
                            {errorChild && (
                              <div style={{ marginBottom: 8, borderTop: '1px dashed var(--adminfonelement)', paddingTop: 8 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--adminred)', marginBottom: 4 }}>
                                  Error — {errorTypeLabel(errorChild.httpStatus, errorChild.errorMessage)}
                                  <span style={{ fontWeight: 400, marginLeft: 8 }}>
                                    {errorChild.httpStatus ? `HTTP ${errorChild.httpStatus}` : ''} {errorChild.duration ? `| ${errorChild.duration}ms` : ''}
                                  </span>
                                </div>
                                <div className="uel-json-wrap">
                                  <JsonBlock title="Error Response Body" data={errorChild.responseBody} />
                                  {errorChild.errorMessage && (
                                    <div className="uel-json-block">
                                      <h4>Error Message</h4>
                                      <pre className="uel-json-pre" style={{ color: 'var(--adminred)' }}>{errorChild.errorMessage}</pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* NO RESPONSE */}
                            {noResponse && (
                              <div style={{ marginBottom: 8, borderTop: '1px dashed var(--adminfonelement)', paddingTop: 8 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--adminred)' }}>
                                  Відповідь не отримана (timeout або помилка мережі)
                                </div>
                              </div>
                            )}

                            {/* STATUS CHANGES */}
                            {statusChildren.map(sc => (
                              <div key={sc.id} style={{ borderTop: '1px dashed var(--adminfonelement)', paddingTop: 6, marginTop: 6 }}>
                                <span className="uel-badge uel-badge-orange" style={{ marginRight: 8 }}>Status Change</span>
                                {sc.statusBefore || '—'}
                                <span className="uel-status-arrow">&rarr;</span>
                                <strong>{sc.statusAfter || '—'}</strong>
                                {sc.statusReason && <span style={{ marginLeft: 8, fontSize: 11 }}>Причина: <strong>{sc.statusReason}</strong></span>}
                                {sc.responseBody && (
                                  <div className="uel-json-wrap" style={{ marginTop: 4 }}>
                                    <JsonBlock title="Response Body" data={sc.responseBody} />
                                  </div>
                                )}
                              </div>
                            ))}

                            {/* META */}
                            {ev.deliveryId && <div style={{ padding: '4px 0', fontSize: 11, opacity: 0.5, marginTop: 4 }}>Delivery ID: {ev.deliveryId}</div>}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="uel-pagination">
              <button disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>Назад</button>
              <span className="uel-page-info">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)}>Далі</button>
            </div>
          )}
        </>
      )}

      {/* Stats: By Users */}
      {!loading && tab === 'users' && (
        <div className="uel-stats-grid">
          {stats.length === 0 && <div className="uel-empty">Немає даних</div>}
          {stats.map((s, i) => {
            const u = s.initiator;
            const name = u ? ([u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || `#${u.id}`) : (s.userId ? `User #${s.userId}` : 'Webhook (no user)');
            return (
              <div key={i} className="uel-stat-card" onClick={() => { setFilterUserId(s.userId || ''); setTab('events'); }}>
                <div className="uel-stat-card-header">
                  <span className="uel-stat-card-title">{name}</span>
                  <span className="uel-stat-card-count">{s.dataValues?.eventCount || s.eventCount}</span>
                </div>
                <div className="uel-stat-card-sub">
                  {formatDate(s.dataValues?.firstEvent || s.firstEvent)} — {formatDate(s.dataValues?.lastEvent || s.lastEvent)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats: By Orders */}
      {!loading && tab === 'orders' && (
        <div className="uel-stats-grid">
          {stats.length === 0 && <div className="uel-empty">Немає даних</div>}
          {stats.map((s, i) => (
            <div key={i} className="uel-stat-card" onClick={() => { setFilterOrderId(s.orderId || ''); setTab('events'); }}>
              <div className="uel-stat-card-header">
                <span className="uel-stat-card-title">Order #{s.orderId}</span>
                <span className="uel-stat-card-count">{s.eventCount}</span>
              </div>
              <div className="uel-stat-card-sub">
                {s.deliveryId ? `Delivery: ${s.deliveryId.substring(0, 12)}...` : ''}
              </div>
              <div className="uel-stat-card-sub">
                {formatDate(s.firstEvent)} — {formatDate(s.lastEvent)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats: By Servers */}
      {!loading && tab === 'servers' && (
        <div className="uel-stats-grid">
          {stats.length === 0 && <div className="uel-empty">Немає даних</div>}
          {stats.map((s, i) => (
            <div key={i} className="uel-stat-card" onClick={() => { setFilterServer(s.serverUrl || ''); setTab('events'); }}>
              <div className="uel-stat-card-header">
                <span className="uel-stat-card-title" style={{ fontSize: 13 }}>
                  {(s.serverUrl || '').replace('https://', '').replace('http://', '')}
                </span>
                <span className="uel-stat-card-count">{s.eventCount}</span>
              </div>
              <div className="uel-stat-card-sub">
                Avg: {s.avgDuration ? `${Math.round(s.avgDuration)}ms` : '—'}
              </div>
              <div className="uel-stat-card-sub">
                {formatDate(s.firstEvent)} — {formatDate(s.lastEvent)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
