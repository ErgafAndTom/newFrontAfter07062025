import React from 'react';
import './Orders.css';
import OneProductInOrders from '../../components/newcalc/Orders/OneProductInOrders';

export default function OrderModal({
                                       selectedThings2,
                                       handleThingClickDelete2,
                                       onClose,
                                       thisOrder          // прокидываем сюда текущий заказ
                                   }) {
    return (
        <>
            <div className="modal-overlay" onClick={onClose}/>

            {/*<div className="modal-container" onClick={e => e.stopPropagation()}>*/}
            {/*    <button className="modal-close" onClick={onClose}>✕</button>*/}

            {/*    <div className="order-list">*/}
            {/*        {selectedThings2 && selectedThings2.length > 0 ? (*/}
            {/*            selectedThings2.map((thing, idx) => (*/}
            {/*                <div key={idx} className="order-item">*/}
            {/*                    /!* кнопка удаления самого блока *!/*/}


            {/*                    /!* сюда рендерим наш компонент *!/*/}
            {/*                    <OneProductInOrders*/}
            {/*                        item={thing}*/}
            {/*                        thisOrder={thisOrder}*/}
            {/*                    />*/}
            {/*                </div>*/}
            {/*            ))*/}
            {/*        ) : (*/}
            {/*            <div className="empty">Немає елементів</div>*/}
            {/*        )}*/}
            {/*    </div>*/}
            {/*</div>*/}
        </>
    );
}
