import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import NpCabinet from './npCabinet/NpCabinet';
import './LogisticsTable.css';

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

            {activeTab === 'uklon' ? renderUklonTable() : <NpCabinet />}
        </div>
    );
};

export default LogisticsTable;
