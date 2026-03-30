import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import NovaPoshtaThermalButton from '../novaPoshta/NovaPoshtaThermalButton';
import './LogisticsTable.css';

const STATUS_COLORS = {
    '1': 'var(--adminorange)',
    '2': 'var(--adminorange)',
    '3': 'var(--adminorange)',
    '4': 'var(--adminblue)',
    '5': 'var(--adminblue)',
    '6': 'var(--adminblue)',
    '7': 'var(--admingreen)',
    '7.1': 'var(--admingreen)',
    '8': 'var(--admingreen)',
    '9': 'var(--admingreen)',
    '10': 'var(--adminred)',
    '11': 'var(--adminred)',
    '14': 'var(--adminpurple)',
    '101': 'var(--admingrey)',
    '102': 'var(--adminorange)',
    '103': 'var(--adminblue)',
    '104': 'var(--adminblue)',
    '106': 'var(--adminblue)',
    '108': 'var(--adminred)',
};

const UKLON_STATUS_MAP = {
    placed: { label: 'Розміщено', color: 'var(--adminorange)' },
    waiting_for_processing: { label: 'Очікує обробки', color: 'var(--adminorange)' },
    processing: { label: 'Пошук водія', color: 'var(--adminorange)' },
    accepted: { label: 'Водій їде', color: 'var(--adminblue)' },
    arrived: { label: 'Водій прибув', color: 'var(--adminblue)' },
    running: { label: 'Доставка', color: 'var(--adminpurple)' },
    returning: { label: 'Повертається', color: 'var(--adminorange)' },
    completed: { label: 'Доставлено', color: 'var(--admingreen)' },
    delivered: { label: 'Доставлено', color: 'var(--admingreen)' },
    suspended: { label: 'Призупинено', color: 'var(--adminorange)' },
    canceled: { label: 'Скасовано', color: 'var(--adminred)' },
    cancelled: { label: 'Скасовано', color: 'var(--adminred)' },
    failed: { label: 'Помилка', color: 'var(--adminred)' },
};

const LogisticsTable = () => {
    const [activeTab, setActiveTab] = useState('np'); // 'np' | 'uklon'
    const [waybills, setWaybills] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [trackingData, setTrackingData] = useState({});
    const [trackingLoading, setTrackingLoading] = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const limit = 50;
    const autoTracked = useRef(false);

    // Uklon state
    const [uklonOrders, setUklonOrders] = useState([]);
    const [uklonLoading, setUklonLoading] = useState(false);

    const fetchUklonOrders = useCallback(async () => {
        setUklonLoading(true);
        try {
            const res = await axios.get('/api/uklon/orders/history');
            setUklonOrders(res.data?.items || []);
        } catch (err) {
            console.error('[Uklon] Failed to fetch orders:', err);
        }
        setUklonLoading(false);
    }, []);

    useEffect(() => {
        if (activeTab === 'uklon') fetchUklonOrders();
    }, [activeTab, fetchUklonOrders]);

    const fetchWaybills = useCallback(async () => {
        setLoading(true);
        autoTracked.current = false;
        try {
            const res = await axios.get(`/novaposhta/waybills?page=${page}&limit=${limit}`);
            setWaybills(res.data.data || []);
            setTotal(res.data.total || 0);
        } catch (err) {
            console.error('Failed to fetch waybills:', err);
        }
        setLoading(false);
    }, [page]);

    useEffect(() => { fetchWaybills(); }, [fetchWaybills]);

    const trackWaybill = async (intDocNumber) => {
        if (trackingLoading[intDocNumber]) return;
        setTrackingLoading(p => ({ ...p, [intDocNumber]: true }));
        try {
            const res = await axios.post('/novaposhta/track', { intDocNumber });
            if (res.data?.success && res.data.data?.[0]) {
                setTrackingData(p => ({ ...p, [intDocNumber]: res.data.data[0] }));
            }
        } catch (err) {
            console.error('Track error:', err);
        }
        setTrackingLoading(p => ({ ...p, [intDocNumber]: false }));
    };

    const trackAll = async () => {
        for (const w of waybills) {
            if (w.intDocNumber && !trackingData[w.intDocNumber]) {
                await trackWaybill(w.intDocNumber);
            }
        }
    };

    // Автоматичний трекінг при завантаженні
    useEffect(() => {
        if (!loading && waybills.length > 0 && !autoTracked.current) {
            autoTracked.current = true;
            trackAll();
        }
    }, [loading, waybills]); // eslint-disable-line

    const downloadTTN = (ref, intDocNumber) => {
        axios.get(`/novaposhta/print/${ref}`, { responseType: 'blob' })
            .then(res => {
                const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                const a = document.createElement('a');
                a.href = url;
                a.download = `TTN_${intDocNumber}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(err => console.error('[NP] TTN download error:', err));
    };

    const downloadSticker = (ref, intDocNumber) => {
        axios.get(`/novaposhta/print-sticker/${ref}`, { responseType: 'blob' })
            .then(res => {
                const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                const a = document.createElement('a');
                a.href = url;
                a.download = `Sticker_${intDocNumber}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(err => console.error('[NP] Sticker download error:', err));
    };

    const importFromNP = async () => {
        if (importing) return;
        setImporting(true);
        setImportResult(null);
        try {
            const res = await axios.post('/novaposhta/import-all', {});
            setImportResult(res.data);
            if (res.data.imported > 0) fetchWaybills();
        } catch (err) {
            console.error('Import error:', err);
            setImportResult({ message: 'Помилка імпорту: ' + (err.response?.data?.error || err.message) });
        }
        setImporting(false);
        setTimeout(() => setImportResult(null), 8000);
    };

    const deleteWaybill = async (id) => {
        try {
            await axios.delete(`/novaposhta/waybills/${id}`);
            setDeleteConfirm(null);
            fetchWaybills();
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const totalPages = Math.ceil(total / limit);

    const formatDate = (d) => {
        if (!d) return '—';
        // Handle both ISO and DD.MM.YYYY formats
        if (/^\d{2}\.\d{2}\.\d{4}/.test(d)) return d;
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatMoney = (val) => {
        if (!val && val !== 0) return '—';
        const num = parseFloat(val);
        if (isNaN(num)) return val;
        return num.toFixed(2);
    };

    const renderUklonTable = () => (
        <div className="log-uklon">
            <div className="log-header">
                <div className="log-actions">
                    <button className="log-track-all-btn" onClick={fetchUklonOrders} disabled={uklonLoading}>
                        {uklonLoading ? 'Завантаження...' : 'Оновити'}
                    </button>
                    <span className="log-total">Всього: {uklonOrders.length}</span>
                </div>
            </div>
            <div className="log-table-head">
                <span className="log-col">№ Зам.</span>
                <span className="log-col">Дата</span>
                <span className="log-col">Вартість</span>
                <span className="log-col">Платник</span>
                <span className="log-col">Відправник</span>
                <span className="log-col">Отримувач</span>
                <span className="log-col">Адреса</span>
                <span className="log-col">Статус</span>
                <span className="log-col">Чек</span>
                <span className="log-col">Дії</span>
            </div>
            {uklonLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--admingrey)' }}>Завантаження...</div>
            ) : uklonOrders.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--admingrey)' }}>Немає доставок Uklon</div>
            ) : uklonOrders.map(o => {
                const st = UKLON_STATUS_MAP[o.status] || { label: o.status || '?', color: 'var(--admingrey)' };
                const created = o.createdAt ? new Date(o.createdAt).toLocaleDateString('uk-UA') : '—';
                const cost = o.cost?.total || o.cost?.recommended;
                const costStr = cost ? `${cost} грн` : '—';
                const payer = o.payerType === 'receiver' ? 'Отримувач' : 'Відправник';
                const senderName = o.pickup?.contact_name || o.pickup?.name || 'Print Peaks';
                const receiverName = o.dropoffs?.[0]?.contact_name || '—';
                const receiverPhone = o.dropoffs?.[0]?.contact_phone || '';
                const clientName = o.client?.name || '';
                const clientPhone = o.client?.phone || '';
                const dropAddr = o.dropoffs?.[0]?.address || '—';
                const isActive = !['canceled', 'cancelled', 'delivered', 'completed', 'failed'].includes(o.status);
                return (
                    <div className="log-row" key={o.orderId || o.deliveryId}>
                        <span className="log-col">
                            {o.orderId ? (
                                <Link to={`/orders/${o.orderId}`} style={{ color: 'var(--admingreen)' }}>
                                    #{o.orderId}
                                </Link>
                            ) : '—'}
                        </span>
                        <span className="log-col">{created}</span>
                        <span className="log-col" style={{ color: 'var(--admingreen)', fontWeight: 600 }}>{costStr}</span>
                        <span className="log-col" style={{ color: o.payerType === 'receiver' ? 'var(--adminorange)' : 'var(--admingrey)' }}>
                            {payer}
                        </span>
                        <span className="log-col" title={senderName}>{senderName}</span>
                        <span className="log-col" title={`${receiverName !== '—' ? receiverName : clientName} ${receiverPhone || clientPhone}`}>
                            <div>{receiverName !== '—' ? receiverName : clientName || '—'}</div>
                            {(receiverPhone || clientPhone) && <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{receiverPhone || clientPhone}</div>}
                        </span>
                        <span className="log-col" style={{ fontSize: '0.75rem' }} title={dropAddr}>
                            {dropAddr.length > 25 ? dropAddr.substring(0, 25) + '...' : dropAddr}
                        </span>
                        <span className="log-col">
                            <span className="log-status-badge" style={{ color: st.color, borderColor: st.color }}>
                                {st.label}
                            </span>
                        </span>
                        <span className="log-col" style={{ textAlign: 'center' }}>
                            {o.orderId && (
                                <button
                                    className="log-action-btn"
                                    onClick={() => {
                                        window.open(`/api/uklon/receipt/${o.orderId}`, '_blank');
                                    }}
                                    title="Завантажити чек PDF"
                                    style={{ fontSize: '1rem' }}
                                >📄</button>
                            )}
                        </span>
                        <span className="log-col log-col-docs">
                            {o.deliveryId && isActive && (
                                <button
                                    className="log-action-btn"
                                    onClick={() => {
                                        axios.put(`/api/uklon/order/${o.deliveryId}/cancel`, { reason: 1 })
                                            .then(() => fetchUklonOrders())
                                            .catch(err => alert('Помилка: ' + (err.response?.data?.error || err.message)));
                                    }}
                                    title="Скасувати"
                                >✕</button>
                            )}
                            {o.deliveryId && (
                                <button
                                    className="log-action-btn"
                                    onClick={() => {
                                        const url = `${window.location.origin}/track/uklon/${o.deliveryId}`;
                                        navigator.clipboard.writeText(url);
                                    }}
                                    title="Копіювати tracking link"
                                >🔗</button>
                            )}
                        </span>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="log-wrap">
            {/* Вкладки */}
            <div className="log-tabs">
                <button
                    className={`log-tab ${activeTab === 'np' ? 'log-tab--active' : ''}`}
                    onClick={() => setActiveTab('np')}
                >
                    НОВА ПОШТА
                </button>
                <button
                    className={`log-tab ${activeTab === 'uklon' ? 'log-tab--active' : ''}`}
                    onClick={() => setActiveTab('uklon')}
                >
                    UKLON
                </button>
            </div>

            {activeTab === 'uklon' ? renderUklonTable() : (
            <>
            <div className="log-header">
                <div className="log-actions">
                    <button className="log-track-all-btn" onClick={importFromNP} disabled={importing}>
                        {importing ? 'Імпорт...' : 'Імпорт з НП'}
                    </button>
                    <button className="log-track-all-btn" onClick={trackAll}>
                        Оновити статуси
                    </button>
                    <span className="log-total">Всього: {total}</span>
                    {importResult && (
                        <span className="log-total" style={{ color: importResult.imported > 0 ? 'var(--admingreen)' : 'var(--admingrey)' }}>
                            {importResult.message}
                        </span>
                    )}
                </div>
            </div>

            <div className="log-table-head">
                <span className="log-col">№ ТТН</span>
                <span className="log-col">Замовлення</span>
                <span className="log-col">Дата створення</span>
                <span className="log-col">Плановий час доставки</span>
                <span className="log-col">Вартість доставки</span>
                <span className="log-col">Платник</span>
                <span className="log-col">НП</span>
                <span className="log-col">Вага</span>
                <span className="log-col">К-ть місць</span>
                <span className="log-col">Відправник</span>
                <span className="log-col">Отримувач</span>
                <span className="log-col">Статус</span>
                <span className="log-col">Документи</span>
                <span className="log-col">Дії</span>
            </div>

            {loading ? (
                <div className="log-loading">Завантаження...</div>
            ) : waybills.length === 0 ? (
                <div className="log-empty">Немає відправлень</div>
            ) : (
                waybills.map(w => {
                    const track = trackingData[w.intDocNumber];
                    const statusColor = track ? (STATUS_COLORS[track.StatusCode] || 'var(--admingrey)') : 'var(--admingrey)';
                    const raw = w.raw || {};

                    // Client name from Order->client association
                    const userName = w.Order?.client
                        ? `${w.Order.client.lastName || ''} ${w.Order.client.firstName || ''}`.trim()
                        : '—';

                    // Пріоритет: збережене ПІБ в Waybill → ПІБ з track enrichment → tracking counterparty → raw → клієнт
                    const senderName = w.senderName || track?._senderName || track?.CounterpartySenderDescription || raw.ContactSender || raw.SenderDescription || '—';
                    const recipientName = w.recipientName || track?._recipientName || track?.CounterpartyRecipientDescription || raw.ContactRecipient || raw.RecipientDescription || userName;
                    const weight = track?.DocumentWeight || raw.Weight || raw.DocumentWeight || '—';
                    const seats = track?.SeatsAmount || raw.SeatsAmount || '1';

                    return (
                        <div key={w.id} className="log-row">
                            <span className="log-col log-col-ttn">
                                {w.ref ? (
                                    <span className="log-ttn-link" onClick={() => downloadTTN(w.ref, w.intDocNumber)} title="Завантажити ТТН (PDF)">
                                        {w.intDocNumber || '—'}
                                    </span>
                                ) : (w.intDocNumber || '—')}
                            </span>
                            <span className="log-col">
                                {w.orderId ? (
                                    <Link to={`/Orders/${w.orderId}`} className="log-order-link">
                                        №{w.orderId}
                                    </Link>
                                ) : '—'}
                            </span>
                            <span className="log-col">{formatDate(raw.DateTime || raw.DateCreated || w.createdAt)}</span>
                            <span className="log-col">{formatDate(w.estimatedDeliveryDate)}</span>
                            <span className="log-col">
                                {w.costOnSite ? `${formatMoney(w.costOnSite)} ₴` : '—'}
                            </span>
                            <span className="log-col">
                                {(() => {
                                    const payer = track?.PayerType || raw.PayerType || raw.PayerTypeDescription || '';
                                    if (payer === 'Sender' || payer === 'Відправник') return 'Відпр.';
                                    if (payer === 'Recipient' || payer === 'Одержувач') return 'Отрим.';
                                    if (payer === 'ThirdPerson' || payer === 'Третя особа') return 'Третя';
                                    return payer || '—';
                                })()}
                            </span>
                            <span className="log-col">
                                {(() => {
                                    const codSum = track?.RedeliverySum || raw.BackwardDeliveryMoney || '';
                                    return codSum && parseFloat(codSum) > 0
                                        ? <span style={{ color: 'var(--adminorange)' }}>{formatMoney(codSum)} ₴</span>
                                        : '—';
                                })()}
                            </span>
                            <span className="log-col">{weight} кг</span>
                            <span className="log-col">{seats}</span>
                            <span className="log-col">{senderName}</span>
                            <span className="log-col">{recipientName}</span>
                            <span className="log-col">
                                {track ? (
                                    <span className="log-status-badge" style={{ color: statusColor, borderColor: statusColor }}>
                                        {track.Status}
                                    </span>
                                ) : (trackingLoading[w.intDocNumber] ? '...' : '—')}
                            </span>
                            <span className="log-col log-col-docs">
                                {w.ref && (
                                    <>
                                        <button
                                            className="log-action-btn"
                                            onClick={() => downloadSticker(w.ref, w.intDocNumber)}
                                            title="Завантажити наліпку (PDF)"
                                        >Наліпка</button>
                                        <NovaPoshtaThermalButton
                                            waybillRef={w.ref}
                                            intDocNumber={w.intDocNumber}
                                            className="log-action-btn log-print-btn"
                                        />
                                    </>
                                )}
                            </span>
                            <span className="log-col log-col-actions">
                                <button
                                    className="log-action-btn"
                                    onClick={() => trackWaybill(w.intDocNumber)}
                                    disabled={trackingLoading[w.intDocNumber]}
                                    title="Трекінг"
                                >
                                    {trackingLoading[w.intDocNumber] ? '...' : '🔍'}
                                </button>
                                {deleteConfirm === w.id ? (
                                    <>
                                        <button
                                            className="log-action-btn log-delete-confirm"
                                            onClick={() => deleteWaybill(w.id)}
                                            title="Підтвердити видалення"
                                        >✓</button>
                                        <button
                                            className="log-action-btn"
                                            onClick={() => setDeleteConfirm(null)}
                                            title="Скасувати"
                                        >✕</button>
                                    </>
                                ) : (
                                    <button
                                        className="log-action-btn log-delete-btn"
                                        onClick={() => setDeleteConfirm(w.id)}
                                        title="Видалити"
                                    >🗑</button>
                                )}
                            </span>
                        </div>
                    );
                })
            )}

            {totalPages > 1 && (
                <div className="log-pagination">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>←</button>
                    <span>{page} / {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>→</button>
                </div>
            )}
            </>
            )}
        </div>
    );
};

export default LogisticsTable;
