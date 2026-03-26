import React, {useEffect, useState} from 'react';
import axios from "../../../../api/axiosInstance";
const STATUS_LABELS = {
    '0': 'Чернетка',
    '1': 'Нове',
    '2': 'В роботі',
    '3': 'Готове',
    '4': 'Видане',
};

const FILTER_TITLES = {
    all: 'Усі замовлення',
    paid: 'Оплачені замовлення',
    debt: 'Замовлення з боргом',
};

const OrdersListModal = ({filter, dateRange, onClose}) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!dateRange) return;
        setLoading(true);
        axios.post('/statistics/getOrdersList', {
            start_date: dateRange.startDate,
            end_date: dateRange.endDate,
            filter,
        })
            .then(res => setOrders(res.data))
            .catch(err => console.error('Error fetching orders list:', err))
            .finally(() => setLoading(false));
    }, [filter, dateRange]);

    const totalSum = orders.reduce((s, o) => s + o.allPrice, 0);

    return (
        <div className="dsh-olm-overlay" onClick={onClose}>
            <div className="dsh-olm-modal" onClick={e => e.stopPropagation()}>
                <div className="dsh-olm-header">
                    <span className="dsh-olm-title">{FILTER_TITLES[filter] || 'Замовлення'}</span>
                    <span className="dsh-olm-count">{orders.length} шт — {totalSum.toLocaleString('uk-UA', {maximumFractionDigits: 0})} грн</span>
                    <button className="dsh-olm-close" onClick={onClose}>✕</button>
                </div>

                <div className="dsh-olm-table-header">
                    <span className="dsh-olm-col-id">ID</span>
                    <span className="dsh-olm-col-date">Дата</span>
                    <span className="dsh-olm-col-client">Клієнт</span>
                    <span className="dsh-olm-col-phone">Телефон</span>
                    <span className="dsh-olm-col-sum">Сума</span>
                    <span className="dsh-olm-col-status">Статус</span>
                    <span className="dsh-olm-col-pay">Оплата</span>
                </div>

                <div className="dsh-olm-body">
                    {loading ? (
                        <div className="dsh-olm-loading">Завантаження...</div>
                    ) : orders.length === 0 ? (
                        <div className="dsh-olm-loading">Немає замовлень</div>
                    ) : (
                        orders.map(o => (
                            <div
                                key={o.id}
                                className="dsh-olm-row"
                                onClick={() => {
                                    const w = window.open(`/Orders/${o.id}`, '_blank');
                                    if (w) { w.blur(); window.focus(); }
                                }}
                            >
                                <span className="dsh-olm-col-id">{o.id}</span>
                                <span className="dsh-olm-col-date">
                                    {new Date(o.createdAt).toLocaleDateString('uk-UA')}
                                </span>
                                <span className="dsh-olm-col-client">{o.clientName}</span>
                                <span className="dsh-olm-col-phone">{o.clientPhone}</span>
                                <span className="dsh-olm-col-sum">
                                    {o.allPrice.toLocaleString('uk-UA', {maximumFractionDigits: 0})} ₴
                                </span>
                                <span className="dsh-olm-col-status">{STATUS_LABELS[String(o.status)] || o.status}</span>
                                <span className="dsh-olm-col-pay" style={{
                                    color: o.isPaid ? 'var(--admingreen)' : 'var(--adminred)'
                                }}>
                                    {o.isPaid ? 'Оплачено' : 'Борг'}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrdersListModal;
