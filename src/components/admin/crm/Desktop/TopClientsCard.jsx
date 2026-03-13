import React from 'react';

const TopClientsCard = ({data}) => {
    if (!data || data.length === 0) {
        return (
            <div className="dsh-card" style={{overflow: 'hidden'}}>
                <div className="dsh-card-title">Топ клієнти</div>
                <div className="dsh-empty-state">
                    <div className="dsh-empty-text">Немає даних</div>
                </div>
            </div>
        );
    }

    const maxOrders = Math.max(...data.map(d => d.ordersCount));

    return (
        <div className="dsh-card" style={{overflow: 'hidden', padding: 0}}>
            <div className="dsh-card-title" style={{padding: '0.6rem 0.8rem 0.3rem'}}>Топ клієнти</div>
            <div className="dsh-clients-list">
                {data.map((client, i) => {
                    const barWidth = maxOrders > 0 ? (client.ordersCount / maxOrders) * 100 : 0;
                    return (
                        <div key={client.clientId || i} className="dsh-client-row">
                            <div className="dsh-client-bar" style={{width: `${barWidth}%`}}/>
                            <span className="dsh-client-rank">{i + 1}</span>
                            <span className="dsh-client-name">{client.name}</span>
                            <span className="dsh-client-count">{client.ordersCount}</span>
                            <span className="dsh-client-sum">
                                {client.totalSum.toLocaleString('uk-UA', {maximumFractionDigits: 0})} ₴
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TopClientsCard;
