import React, { useState, useEffect, useRef } from 'react';
import axios from '../../../../api/axiosInstance';

const METHOD_LABELS = {
    cash: 'Готівка',
    terminal: 'Термінал',
    link: 'Посилання',
    iban: 'IBAN',
    cod: 'Налож. платіж',
    qr: 'QR',
    invoice: 'Рахунок',
    other: 'Інше',
};

const STATUS_LABELS = {
    CREATED: 'Створено',
    PAID: 'Оплачено',
    CANCELLED: 'Скасовано',
    EXPIRED: 'Прострочено',
};

const STATUS_COLORS = {
    CREATED: 'var(--adminblue, #3c60a6)',
    PAID: 'var(--admingreen, #0e935b)',
    CANCELLED: 'var(--adminred, #ee3c23)',
    EXPIRED: 'var(--adminorange, #f5a623)',
};

const ClientPaymentStats = ({ dateRange }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [paymentsData, setPaymentsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        timerRef.current = setTimeout(async () => {
            try {
                const { data } = await axios.post('/user/all', {
                    search: searchQuery,
                    inPageCount: 10,
                    currentPage: 1,
                    columnName: { column: 'id', reverse: true },
                });
                setSearchResults(data.rows || []);
            } catch (e) {
                console.warn('Client search error:', e.message);
            }
        }, 300);
        return () => clearTimeout(timerRef.current);
    }, [searchQuery]);

    useEffect(() => {
        if (!selectedClient) { setPaymentsData(null); return; }
        setLoading(true);
        setError(false);
        const body = { clientId: selectedClient.id };
        if (dateRange?.startDate && dateRange?.endDate) {
            body.start_date = dateRange.startDate;
            body.end_date = dateRange.endDate;
        }
        axios.post('/statistics/getClientPayments', body)
            .then(({ data }) => setPaymentsData(data))
            .catch(e => { console.error('Payment stats error:', e); setError(true); })
            .finally(() => setLoading(false));
    }, [selectedClient, dateRange]);

    const handleSelectClient = (user) => {
        setSelectedClient(user);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleClear = () => {
        setSelectedClient(null);
        setPaymentsData(null);
        setError(false);
        setSearchQuery('');
    };

    return (
        <div className="dsh-cps-wrap">
            <div className="dsh-cps-search-row">
                {selectedClient ? (
                    <div className="dsh-cps-selected">
                        <span className="dsh-cps-selected-name">
                            {selectedClient.lastName} {selectedClient.firstName}
                            <span className="dsh-cps-selected-id"> id:{selectedClient.id}</span>
                        </span>
                        <button className="dsh-cps-clear-btn" onClick={handleClear}>&times;</button>
                    </div>
                ) : (
                    <div className="dsh-cps-search-wrap">
                        <input
                            type="text"
                            className="dsh-cps-search-input"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Пошук клієнта: ім'я, прізвище, телефон..."
                        />
                        {searchResults.length > 0 && (
                            <div className="dsh-cps-dropdown">
                                {searchResults.map(u => (
                                    <div key={u.id}
                                         className="dsh-cps-dropdown-item"
                                         onClick={() => handleSelectClient(u)}>
                                        <span className="dsh-cps-dropdown-name">
                                            {u.lastName} {u.firstName}
                                        </span>
                                        <span className="dsh-cps-dropdown-phone">{u.phoneNumber || ''}</span>
                                        <span className="dsh-cps-dropdown-id">id:{u.id}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {!selectedClient && (
                <div className="dsh-empty-state">
                    <div className="dsh-empty-text">Оберіть клієнта для перегляду оплат</div>
                </div>
            )}

            {selectedClient && loading && (
                <div className="dsh-empty-state">
                    <div className="dsh-empty-text">Завантаження...</div>
                </div>
            )}

            {selectedClient && !loading && error && (
                <div className="dsh-empty-state">
                    <div className="dsh-empty-text">Помилка завантаження. Перевірте зʼєднання з сервером.</div>
                </div>
            )}

            {selectedClient && !loading && !error && paymentsData && (
                <>
                    <div className="dsh-cps-summary">
                        <div className="dsh-cps-summary-card">
                            <div className="dsh-cps-summary-label">Всього оплат</div>
                            <div className="dsh-cps-summary-value">{paymentsData.summary.totalCount}</div>
                        </div>
                        <div className="dsh-cps-summary-card">
                            <div className="dsh-cps-summary-label">Загальна сума</div>
                            <div className="dsh-cps-summary-value">
                                {paymentsData.summary.totalAmount.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} ₴
                            </div>
                        </div>
                        {Object.entries(paymentsData.summary.byMethod).map(([method, info]) => (
                            <div key={method} className="dsh-cps-summary-card">
                                <div className="dsh-cps-summary-label">{METHOD_LABELS[method] || method}</div>
                                <div className="dsh-cps-summary-value">
                                    {info.count} шт / {info.total.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} ₴
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="dsh-cps-table-wrap">
                        <div className="dsh-cps-table-header">
                            <span className="dsh-cps-col-id">Зам.</span>
                            <span className="dsh-cps-col-method">Метод</span>
                            <span className="dsh-cps-col-amount">Сума</span>
                            <span className="dsh-cps-col-paid">Оплачено</span>
                            <span className="dsh-cps-col-status">Статус</span>
                            <span className="dsh-cps-col-date">Дата</span>
                        </div>
                        <div className="dsh-cps-table-body">
                            {paymentsData.payments.length === 0 ? (
                                <div className="dsh-empty-state">
                                    <div className="dsh-empty-text">Немає оплат за обраний період</div>
                                </div>
                            ) : paymentsData.payments.map((p, i) => (
                                <div key={p.paymentId || i} className="dsh-cps-table-row">
                                    <span className="dsh-cps-col-id">#{p.orderId}</span>
                                    <span className="dsh-cps-col-method">{METHOD_LABELS[p.method] || p.method}</span>
                                    <span className="dsh-cps-col-amount">
                                        {p.amount.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} ₴
                                    </span>
                                    <span className="dsh-cps-col-paid"
                                          style={{ color: p.payStatus === 'pay' ? 'var(--admingreen, #0e935b)' : 'var(--adminred, #ee3c23)' }}>
                                        {p.payStatus === 'pay' ? 'Так' : 'Ні'}
                                    </span>
                                    <span className="dsh-cps-col-status"
                                          style={{ color: STATUS_COLORS[p.status] || 'inherit' }}>
                                        {STATUS_LABELS[p.status] || p.status}
                                    </span>
                                    <span className="dsh-cps-col-date">
                                        {new Date(p.createdAt).toLocaleDateString('uk-UA', {
                                            day: '2-digit', month: '2-digit', year: '2-digit'
                                        })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ClientPaymentStats;
