import React, { useState, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';

const EVENT_TYPE_LABELS = {
  api_request: 'REQ',
  api_response: 'RES',
  webhook_incoming: 'WH',
  status_change: 'STATUS',
  error: 'ERR',
};

const EVENT_COLORS = {
  api_request: 'var(--adminblue)',
  api_response: 'var(--admingreen)',
  webhook_incoming: 'var(--admincyan)',
  status_change: 'var(--adminorange)',
  error: 'var(--adminred)',
};

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
}

export default function UklonMiniLog({ orderId }) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/api/uklon/events', {
        params: { orderId, limit: 30 },
      });
      setEvents(data.items || []);
    } catch (err) {
      console.error('[UklonMiniLog] fetch error:', err);
    }
    setLoading(false);
  }, [orderId]);

  const handleToggle = () => {
    if (!open) fetchEvents();
    setOpen(!open);
  };

  if (!orderId) return null;

  return (
    <div style={{ margin: '0.5rem 0' }}>
      <button
        type="button"
        onClick={handleToggle}
        style={{
          background: open ? 'var(--admingreen)' : 'var(--adminfonelement)',
          color: open ? '#fff' : 'var(--admingrey)',
          border: 'none',
          padding: '4px 12px',
          cursor: 'pointer',
          fontSize: 'var(--font-size-xs, 11px)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          width: '100%',
        }}
      >
        {open ? 'Сховати лог подій' : 'Лог подій Uklon'}
        {events.length > 0 && open ? ` (${events.length})` : ''}
      </button>

      {open && (
        <div style={{ maxHeight: 300, overflow: 'auto', background: 'var(--adminfonelement)', padding: '4px' }}>
          {loading && <div style={{ textAlign: 'center', padding: 8, color: 'var(--admingrey)', fontSize: 12 }}>Завантаження...</div>}
          {!loading && events.length === 0 && <div style={{ textAlign: 'center', padding: 8, color: 'var(--admingrey)', fontSize: 12, opacity: 0.5 }}>Подій не знайдено</div>}
          {!loading && (() => {
            // Group by correlationId
            const groups = [];
            const corrMap = {};
            const sorted = [...events].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            for (const ev of sorted) {
              if (ev.correlationId) {
                if (corrMap[ev.correlationId] !== undefined) {
                  groups[corrMap[ev.correlationId]].children.push(ev);
                } else {
                  corrMap[ev.correlationId] = groups.length;
                  groups.push({ parent: ev, children: [] });
                }
              } else {
                groups.push({ parent: ev, children: [] });
              }
            }
            groups.reverse();

            return groups.map((g, gi) => {
              const p = g.parent;
              const isWH = p.eventType === 'webhook_incoming';
              const resp = g.children.find(c => c.eventType === 'api_response' || c.eventType === 'error');
              const statusCh = g.children.filter(c => c.eventType === 'status_change');
              const noResp = p.eventType === 'api_request' && !resp;
              return (
                <React.Fragment key={p.id}>
                  <div
                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 52px auto 35px 50px',
                      gap: '4px',
                      padding: '3px 4px',
                      fontSize: 11,
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      color: 'var(--admingrey)',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ opacity: 0.6 }}>{formatDate(p.createdAt)} {formatTime(p.createdAt)}</span>
                    <span style={{
                      background: isWH ? 'var(--admincyan)' : 'var(--adminblue)',
                      color: '#fff', padding: '0 4px', fontSize: 9, fontWeight: 700, textAlign: 'center',
                    }}>
                      {isWH ? 'WH' : 'API'}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.action}
                      {statusCh.length > 0 && (
                        <span style={{ marginLeft: 4 }}>
                          {statusCh[0].statusBefore || '?'}<span style={{ color: 'var(--adminorange)', margin: '0 2px' }}>&rarr;</span>{statusCh[0].statusAfter || '?'}
                        </span>
                      )}
                      {noResp && <span style={{ color: 'var(--adminred)', marginLeft: 4 }}>timeout?</span>}
                      {resp?.eventType === 'error' && <span style={{ color: 'var(--adminred)', marginLeft: 4 }}>ERR</span>}
                    </span>
                    <span style={{ color: resp?.httpStatus >= 400 ? 'var(--adminred)' : resp?.httpStatus ? 'var(--admingreen)' : 'transparent', fontWeight: 600 }}>
                      {resp?.httpStatus || ''}
                    </span>
                    <span style={{ fontSize: 10, opacity: 0.6 }}>
                      {resp?.duration ? `${resp.duration}ms` : ''}
                    </span>
                  </div>
                  {expandedId === p.id && (
                    <div style={{ padding: '4px 8px', background: '#fff', fontSize: 11, marginBottom: 2 }}>
                      {p.endpoint && <div style={{ opacity: 0.6 }}>{p.method} {p.endpoint}</div>}
                      {p.deliveryId && <div style={{ opacity: 0.6 }}>Delivery: {p.deliveryId}</div>}
                      {statusCh.map(sc => (
                        <div key={sc.id} style={{ color: 'var(--adminorange)' }}>
                          {sc.statusBefore || '—'} &rarr; {sc.statusAfter || '—'}
                          {sc.statusReason && <span style={{ marginLeft: 4 }}>({sc.statusReason})</span>}
                        </div>
                      ))}
                      {resp?.errorMessage && <div style={{ color: 'var(--adminred)' }}>{resp.errorMessage}</div>}
                      {p.requestBody && (
                        <details style={{ marginTop: 4 }}>
                          <summary style={{ cursor: 'pointer', opacity: 0.6 }}>Request</summary>
                          <pre style={{ fontSize: 10, maxHeight: 150, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            {typeof p.requestBody === 'string' ? (() => { try { return JSON.stringify(JSON.parse(p.requestBody), null, 2); } catch { return p.requestBody; } })() : JSON.stringify(p.requestBody, null, 2)}
                          </pre>
                        </details>
                      )}
                      {resp?.responseBody && (
                        <details style={{ marginTop: 4 }}>
                          <summary style={{ cursor: 'pointer', opacity: 0.6 }}>Response</summary>
                          <pre style={{ fontSize: 10, maxHeight: 150, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            {typeof resp.responseBody === 'string' ? (() => { try { return JSON.stringify(JSON.parse(resp.responseBody), null, 2); } catch { return resp.responseBody; } })() : JSON.stringify(resp.responseBody, null, 2)}
                          </pre>
                        </details>
                      )}
                      {p.ipAddress && <div style={{ opacity: 0.4, marginTop: 2 }}>IP: {p.ipAddress}</div>}
                    </div>
                  )}
                </React.Fragment>
              );
            });
          })()}
          {events.length > 0 && (
            <a
              href={`/uklon-log?orderId=${orderId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '6px',
                fontSize: 11,
                color: 'var(--adminblue)',
                textDecoration: 'underline',
              }}
            >
              Відкрити повний лог
            </a>
          )}
        </div>
      )}
    </div>
  );
}
