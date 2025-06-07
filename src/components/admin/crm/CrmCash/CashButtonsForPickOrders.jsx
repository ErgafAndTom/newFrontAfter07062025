import React from "react";

const CashButtonsForPickOrders = ({item, thisOrder}) => {
    const style = {
        color:
            item.status === 'створено' ? '#000000' :
                item.status === 'В роботі' ? '#00ffe7' :
                    item.status === 'Зроблено' ? '#ffffff' :
                        item.status === 'Відвантажено' ? '#ffea00' :
                            item.status === 'Відміна' ? '#72ff00' :
                                '#ffffff',
        backgroundColor:
            item.status === 'створено' ? 'rgba(255,255,255,0)' :
                item.status === 'В роботі' ? '#f8b316' :
                    item.status === 'Зроблено' ? '#008148' :
                        item.status === 'Відвантажено' ? '#3c5fa5' :
                            item.status === 'Відміна' ? '#ee74a9' :
                                '#ec3c23',
    };

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