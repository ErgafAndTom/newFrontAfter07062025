import React from 'react';

const OneItemInTable = ({itemData, tablPosition, item, metaItem, handleItemClickRed, handleItemClickCopy, handleItemClickDelete2}) => {
    // Функція для визначення ширини стовпця - має бути ідентичним в CustomStorageTable.jsx
    const getColumnWidth = (columnName) => {
        switch (columnName) {
            // Спільні колонки
            case 'id':
                return '2vw';
            case 'name':
                return '14vw'; // Фіксована ширина для name в пікселях
            case 'type':
                return '7vw';  // Фіксована ширина для type в пікселях
            case 'typeUse':
                return '7vw'; // Фіксована ширина для typeUse в пікселях
            case 'createdAt':
                return '6vw';
            case 'price4':
                return '3.6vw';
            case 'amount':
                return '3.35vw';
            case 'updatedAt':
                return '6vw';
            default:
                return '3.54vw';     // Фіксована ширина для інших колонок в пікселях
        }
    };

    // Базові стилі для клітинки
    const cellStyle = {
        // border: "0.05vw solid #FBFAF6",
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

    // Перевірка чи це цінова колонка
    const isPriceColumn = (columnName) => {
        return [
            'price1',
            'price2',
            'price3',
            'price4',
            'price5'
        ].includes(columnName);
    };

    if (tablPosition === "id") {
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>{itemData}</div>
        );
    }

    if (tablPosition === "created") {
        return (
          <>
            <div className="CustomOrderTable-cell btn-black" style={{...cellStyle, width: "1.8vw", minWidth: "1.8vw"}} onClick={(e) => {
              handleItemClickCopy(item, e, metaItem)
            }}>{"copy"}</div>

            <div className="CustomOrderTable-cell btnm btn-danger" style={{...cellStyle, width: "1.6vw", minWidth: "1.6vw"}} onClick={(e) => {
              handleItemClickDelete2(item, e)
            }}>{"del"}</div>
          </>
        );
    }

    if (tablPosition === "password") {
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>•••••••</div>
        );
    }

    if (tablPosition === "createdAt" || tablPosition === "updatedAt") {
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>
                {itemData ? `${new Date(itemData).toLocaleDateString()} ${new Date(itemData).toLocaleTimeString()}` : '-'}
            </div>
        );
    }

    if (tablPosition === "photo") {
        return (
            <div className="CustomOrderTable-cell" style={cellStyle}>{itemData}</div>
        );
    }

    // Додаємо стилі для редагованих клітинок
    const editableCellStyle = {
        ...cellStyle,
        cursor: 'pointer',
        transition: 'background-color 0.2s ease'
    };

    // Спеціальне форматування для типу
    if (tablPosition === "type") {
        return (
            <div
                className="CustomOrderTable-cell CustomOrderTable-cellCan"
                style={{
                    ...editableCellStyle,
                    backgroundColor: itemData === 'папір' ? '#f2ffe9' :
                        itemData === 'фарба' ? '#e9f8ff' : '#FBFAF6'
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
            <div
                className={`CustomOrderTable-cell1 ${isPriceColumn(metaItem) ? "price-cell" : ""}`}
                style={{
                    color: isPriceColumn(metaItem) ? "#008249" : undefined,
                    fontWeight: isPriceColumn(metaItem) ? "600" : undefined
                }}
            >
                {itemData}
            </div>
        </div>
    );
};

export default OneItemInTable;
