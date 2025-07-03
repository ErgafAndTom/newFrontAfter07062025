import React from 'react';
import {translateColumnName} from './translations';
import PropTypes from 'prop-types';

const OneUnitInTable = ({itemData, tablPosition, item, metaItem, handleItemClickRed}) => {
    // Функція для визначення ширини стовпця - має бути ідентичним в усіх таблицях
    const getColumnWidth = (columnName) => {
        switch (columnName) {
            // Спільні колонки
            case 'id':
                return '2vw';
            case 'createdAt':
                return '7vw';
            case 'updatedAt':
                return '7vw';

            // Колонки користувачів
            case 'username':
                return '6vw';
            case 'firstName':
                return '6vw';
            case 'lastName':
                return '6vw';
            case 'familyName':
                return '6vw';
            case 'email':
                return '6vw';
            case 'company':
                return '8vw';
            case 'phoneNumber':
                return '8vw';
            case 'address':
                return '10vw';
            case 'role':
                return '4vw';
            case 'password':
                return '5vw';
            case 'lastLoginAt':
                return '2.8vw';
            case 'discount':
                return '3.2vw';

            // За замовчуванням
            default:
                return '3.955vw';
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
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        borderBottom: "0.1vw solid #eaeaea",
        padding: "0.1vw 0.2vw"
    };

    if (tablPosition === "id") {
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>{itemData}</div>
        );
    }

    if (tablPosition === "password") {
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>********</div>
        );
    }

    if (tablPosition === "createdAt" || tablPosition === "updatedAt") {
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>
                {itemData ? `${new Date(itemData).toLocaleDateString()} ${new Date(itemData).toLocaleTimeString()}` : '-'}
            </div>
        );
    }

    // Додаємо стилі для редагованих клітинок
    const editableCellStyle = {
        ...cellStyle,
        cursor: 'pointer',
        transition: 'background-color 0.2s ease'
    };

    // Спеціальне форматування для ролей
    if (tablPosition === "role") {
        return (
            <div
                className="CustomOrderTable-cell CustomOrderTable-cellCan"
                style={{
                    ...editableCellStyle,
                    backgroundColor: itemData === 'admin' ? '#ffe9e9' :
                        itemData === 'manager' ? '#e9f8ff' :
                            itemData === 'operator' ? '#f2ffe9' : '#FBFAF6'

                }}
                onClick={(e) => handleItemClickRed(item, e, metaItem)}
            >
                <div className="CustomOrderTable-cell1">
                    {itemData}
                </div>
            </div>
        );
    }

    return (
        <div
            className="CustomOrderTable-cell CustomOrderTable-cellCan"
            style={editableCellStyle}
            onClick={(e) => handleItemClickRed(item, e, metaItem)}
        >
            <div className="CustomOrderTable-cell1">
                {itemData}
            </div>
        </div>
    );
};

OneUnitInTable.propTypes = {
    itemData: PropTypes.any,
    tablPosition: PropTypes.string,
    item: PropTypes.object,
    metaItem: PropTypes.string,
    handleItemClickRed: PropTypes.func
};

export default OneUnitInTable;
