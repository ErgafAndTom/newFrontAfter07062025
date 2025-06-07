import React from 'react';
import { translateColumnName } from './translations';
import StatusBar from "./StatusBar";
import {Link} from "react-router-dom";

const OrderOneUnitInTable = ({itemData, tablPosition, item, metaItem, handleItemClickRed, toggleOrder}) => {
    // Функція для визначення ширини стовпця
    const getColumnWidth = (columnName) => {
        switch(columnName) {
            case 'id': return '2vw';
            case 'expanded': return '3vw';
            case 'barcode': return '4vw';
            case 'status': return '5vw';
            case 'userPhoto': return '3vw';
            case 'userName': return '6vw';
            case 'phoneNumber': return '5vw';
            case 'telegram': return '4vw';
            case 'price': return '3vw';
            case 'payStatus': return '4vw';
            case 'createdAt': return '7vw';
            case 'updatedAt': return '7vw';
            case 'responsible': return '5vw';
            case 'action': return '12vw';
            
            // За замовчуванням
            default: return '3.966vw';
        }
    };
    
    // Базові стилі для клітинки
    const cellStyle = {
        width: getColumnWidth(metaItem),
        minWidth: getColumnWidth(metaItem),
        maxWidth: getColumnWidth(metaItem),
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        height: "auto",
        minHeight: "2vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.7rem",
        boxSizing: "border-box",
        textAlign: "center",
        background: "#FBFAF6",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
    };

    // Спеціальні обробники для різних типів даних
    if (tablPosition === "id") {
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>{itemData}</div>
        );
    }
    
    if (tablPosition === "expanded") {
        const isExpanded = itemData;
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>
                <button
                    className="CustomOrderTable-toggle-btn"
                    onClick={() => toggleOrder(item.id)}
                >
                    {isExpanded ? 'Згорнути' : 'Розгорнути'}
                </button>
            </div>
        );
    }
    
    if (tablPosition === "barcode") {
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>{itemData || '—'}</div>
        );
    }
    
    if (tablPosition === "status") {
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>
                <div className="" style={{background: "transparent"}}>
                    <StatusBar item={item} />
                </div>
            </div>
        );
    }
    
    if (tablPosition === "userPhoto") {
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>
                {itemData ? (
                    <img
                        src={itemData}
                        alt="Фото замовлення"
                        className="CustomOrderTable-photo"
                    />
                ) : (
                    'Фото'
                )}
            </div>
        );
    }
    
    if (tablPosition === "userName") {
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>{itemData}</div>
        );
    }
    
    if (tablPosition === "phoneNumber") {
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>{itemData}</div>
        );
    }
    
    if (tablPosition === "telegram") {
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>
                {itemData ? (
                    <a
                        href={itemData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="CustomOrderTable-telegram-link"
                    >
                        {itemData.username}
                    </a>
                ) : (
                    '—'
                )}
            </div>
        );
    }
    
    if (tablPosition === "price") {
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>{itemData} грн</div>
        );
    }
    
    if (tablPosition === "payStatus") {
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>
                <div
                    className={`CustomOrderTable-pay-btn ${
                        itemData === 'Оплачено'
                            ? 'CustomOrderTable-pay-paid'
                            : 'CustomOrderTable-pay-pending'
                    }`}
                >
                    {itemData || 'Не оплачено'}
                </div>
            </div>
        );
    }
    
    if (tablPosition === "createdAt" || tablPosition === "updatedAt") {
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>
                {itemData ? `${new Date(itemData).toLocaleDateString()} ${new Date(itemData).toLocaleTimeString()}` : '—'}
            </div>
        );
    }
    
    if (tablPosition === "responsible") {
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>{itemData}</div>
        );
    }
    
    if (tablPosition === "action") {
        return (
            <div className="CustomOrderTable-cell" style={{...cellStyle, display: 'flex', justifyContent: 'space-around'}}>
                <Link to={`/Orders/${item.id}`}>
                    <button className="CustomOrderTable-kassa-btn">До каси</button>
                </Link>
                <button className="CustomOrderTable-invoice-btn">+</button>
                <button
                    className="CustomOrderTable-delete-btn"
                    onClick={(e) => handleItemClickRed(item, e)}
                >-</button>
            </div>
        );
    }

    // Для всіх інших полів - просто повертаємо значення
    return (
        <div className="CustomOrderTable-cell" style={cellStyle}>
            <div className="CustomOrderTable-cell1">
                {itemData !== undefined && itemData !== null ? itemData.toString() : '—'}
            </div>
        </div>
    );
};

export default OrderOneUnitInTable;
