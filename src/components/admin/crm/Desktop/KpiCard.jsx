import React from 'react';

const KpiCard = ({ label, value, suffix = 'грн', change = null, color, subText }) => {
    const changeColor = change > 0 ? 'var(--admingreen, #0e935b)'
        : change < 0 ? 'var(--adminred, #ee3c23)'
            : 'var(--admingrey, #666666)';
    const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '';

    return (
        <div className="dsh-kpi-card">
            <div className="dsh-kpi-label">{label}</div>
            <div className="dsh-kpi-value" style={color ? { color } : undefined}>
                {typeof value === 'number'
                    ? value.toLocaleString('uk-UA', { maximumFractionDigits: 2 })
                    : value}
                {suffix && <span className="dsh-kpi-suffix"> {suffix}</span>}
            </div>
            {change !== null && change !== undefined && (
                <div className="dsh-kpi-change" style={{ color: changeColor }}>
                    {arrow} {Math.abs(change).toFixed(1)}% vs попередній період
                </div>
            )}
            {subText && <div className="dsh-kpi-sub">{subText}</div>}
        </div>
    );
};

export default KpiCard;
