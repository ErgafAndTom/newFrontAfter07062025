import React from "react";

const CashButtonsForPickOrders = ({item, thisOrder}) => {
    const s = String(item.status);
    const STATUS_COLORS = {
        '0':  { color: '#000000', bg: 'rgba(255,255,255,0)' },
        '1':  { color: '#ffffff', bg: '#f5a623' },
        '2':  { color: '#ffffff', bg: '#3c60a6' },
        '3':  { color: '#ffffff', bg: '#0e935b' },
        '4':  { color: '#ffffff', bg: '#6a5acd' },
        '-1': { color: '#ffffff', bg: '#ee3c23' },
    };
    const c = STATUS_COLORS[s] || { color: '#ffffff', bg: '#ec3c23' };
    const style = { color: c.color, backgroundColor: c.bg };

    return (
        <div
            className={item.id === thisOrder.id ? 'm-1 adminFontTable btn hoverBlack shadowActElem w-100' : 'm-1 adminFont btn hoverBlack w-100'}
            style={style}
        >
            {item.id}
        </div>
    );
};

export default CashButtonsForPickOrders;