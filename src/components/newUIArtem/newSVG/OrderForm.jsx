import React, { useState } from 'react';

const OrderForm = ({thisOrder}) => {
    const [totalAmount, setTotalAmount] = useState(parseInt(thisOrder.price));
    const [discount, setDiscount] = useState('10%');
    const [finalAmount, setFinalAmount] = useState(parseInt(thisOrder.allPrice));
    const [prepayment, setPrepayment] = useState(parseInt(thisOrder.prepayment));
    const [amountToPay, setAmountToPay] = useState(270);

    const handleInputChange = (setter) => (event) => {
        setter(event.target.value);
    };

    const handlePaymentClick = () => {
        alert('Оплатити замовлення');
    };

    const handleWorkClick = () => {
        alert('Взяти в роботу');
    };

    const handleDepositClick = () => {
        alert('Внести');
    };

    return (
        <svg viewBox="0 0 662 169" style={{width: "32vw", height: "20vh"}}>
            <g transform="translate(392.5 133.656)">
                <g transform="translate(-34)" onClick={handlePaymentClick} style={{ cursor: 'pointer' }}>
                    <rect width="177" height="17" rx="4" fill="#74c686"/>
                    <text transform="translate(89 13)" fontSize="14" fontFamily="inter, inter">
                        <tspan x="-84.665" y="0">Оплатити замовлення</tspan>
                    </text>
                </g>
            </g>
            <text transform="translate(11 11.828)" fill="#212529" fontSize="16" fontFamily="inter, inter">
                <tspan x="0" y="15">Сума всього замовлення:</tspan>
            </text>
            <text transform="translate(11 41.828)" fill="#212529" fontSize="16" fontFamily="inter, inter">
                <tspan x="0" y="15">Знижка</tspan>
            </text>
            <text transform="translate(11 71.828)" fill="#212529" fontSize="16" fontFamily="inter, inter">
                <tspan x="0" y="15">Загальна сума</tspan>
            </text>
            <text transform="translate(11 130.172)" fill="#212529" fontSize="16" fontFamily="inter, inter">
                <tspan x="0" y="15">К оплаті</tspan>
            </text>
            <text transform="translate(317.5 11)" fill="#212529" fontSize="16" fontFamily="inter, inter">
                <tspan x="0" y="15">грн</tspan>
            </text>
            <text transform="translate(317.5 41)" fill="#212529" fontSize="16" fontFamily="inter, inter">
                <tspan x="0" y="15">грн/відсоток</tspan>
            </text>
            <text transform="translate(317.5 131.578)" fill="#212529" fontSize="16" fontFamily="inter, inter">
                <tspan x="0" y="15">грн</tspan>
            </text>
            <g transform="translate(238 11)" fill="#e4e2da" stroke="#d3d3d3" strokeWidth="1">
                <foreignObject width="73" height="21">
                    <input
                        type="number"
                        value={totalAmount}
                        onChange={handleInputChange(setTotalAmount)}
                        style={{ width: '100%', height: '100%', border: 'solid 0.1vh gray',borderRadius: "0.5vh", background: 'transparent', textAlign: 'center' }}
                    />
                </foreignObject>
            </g>
            <g transform="translate(238 41)" fill="#e4e2da" stroke="#d3d3d3" strokeWidth="1">
                <foreignObject width="73" height="21">
                    <input
                        type="number"
                        value={discount}
                        onChange={handleInputChange(setDiscount)}
                        style={{ width: '100%', height: '100%', border: 'solid 0.1vh gray',borderRadius: "0.5vh", background: 'transparent', textAlign: 'center' }}
                    />
                </foreignObject>
            </g>
            <g transform="translate(238 71)" fill="#e4e2da" stroke="#d3d3d3" strokeWidth="1">
                <foreignObject width="73" height="21">
                    <input
                        type="number"
                        value={finalAmount}
                        onChange={handleInputChange(setFinalAmount)}
                        style={{ width: '100%', height: '100%', border: 'solid 0.1vh gray',borderRadius: "0.5vh", background: 'transparent', textAlign: 'center' }}
                    />
                </foreignObject>
            </g>
            <g transform="translate(238 131.578)" fill="#e4e2da" stroke="#d3d3d3" strokeWidth="1">
                <foreignObject width="73" height="21">
                    <input
                        type="number"
                        value={amountToPay}
                        onChange={handleInputChange(setAmountToPay)}
                        style={{ width: '100%', height: '100%', border: 'solid 0.1vh gray',borderRadius: "0.5vh", background: 'transparent', textAlign: 'center' }}
                    />
                </foreignObject>
            </g>
            <g onClick={handleWorkClick} style={{cursor: 'pointer'}}>
                <rect width="146" height="47" rx="12" transform="translate(514 12)" fill="#fc0"
                      />
                <text transform="translate(588 39)" fontSize="11"
                      fontWeight="700">
                    <tspan x="-46.75" y="0">Взяти в роботу</tspan>
                </text>
            </g>
            <text transform="translate(11.5 100.598)" fill="#212529" fontSize="16"
                  >
                <tspan x="0" y="15">Предоплата</tspan>
            </text>
            <text transform="translate(318 100.598)" fill="#212529" fontSize="16"
                  >
            <tspan x="0" y="15">грн</tspan>
            </text>
            <g transform="translate(238.5 100.598)" fill="#e4e2da" stroke="#d3d3d3" strokeWidth="1">
                <foreignObject width="73" height="21">
                    <input
                        type="number"
                        value={prepayment}
                        onChange={handleInputChange(setPrepayment)}
                        style={{ width: '100%', height: '100%', border: 'solid 0.1vh gray',borderRadius: "0.5vh", background: 'transparent', textAlign: 'center' }}
                    />
                </foreignObject>
            </g>
            <g transform="translate(358 99.676)" onClick={handleDepositClick} style={{ cursor: 'pointer' }}>
                <rect width="168" height="25" rx="4" fill="#74c686"/>
                <text transform="translate(85 17)" fontSize="14" fontFamily="inter, inter">
                    <tspan x="-27.237" y="0">Внести</tspan>
                </text>
            </g>
        </svg>
    );
};

export default OrderForm;
