import React, {useEffect, useState} from 'react';
import axios from "./api/axiosInstance";
import {Spinner} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";

function PaymentCalculator({thisOrder, setThisOrder, selectedThings2, setSelectedThings2}) {
    const navigate = useNavigate();
    const [amount, setAmount] = useState(thisOrder.price);
    const [discount, setDiscount] = useState(thisOrder.prepayment);
  const currentUser = useSelector((state) => state.auth.user);
    const [total, setTotal] = useState(thisOrder.allPrice);
    const [error, setError] = useState(null);
    const [load, setLoad] = useState(false);

    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    const handleAmountChange = (value) => {
        const formattedValue = value.replace(/[^0-9]/g, '');
        const formattedWithCurrency = formattedValue ? formatNumber(formattedValue) + ' ' : '';
        setAmount(formattedWithCurrency);
        // calculateTotal(formattedValue, discount);
    };

    const handleDiscountChange = (value) => {
      if (currentUser?.role === "admin") {
        setDiscount(value);
        // calculateTotal(amount.replace(/[^0-9]/g, ''), value);
        let dataToSend = {
          newDiscound: value,
          orderId: thisOrder.id,
        }
        setError(null)
        setLoad(true)
        axios.put(`/orders/OneOrder/discount`, dataToSend)
          .then(response => {
            // console.log(response.data);
            setThisOrder({...thisOrder, prepayment: response.data.prepayment, allPrice: response.data.allPrice})
            // setThisOrder(response.data)
            setSelectedThings2(response.data.OrderUnits)
            // setSelectedThings2({...selectedThings2, prepayment: response.data.prepayment, allPrice: response.data.allPrice})
            setLoad(false)
          })
          .catch(error => {
            if (error.response.status === 403) {
              navigate('/login');
            }
            setError(error.message)
            setLoad(false)
            console.log(error.message);
          })
      }
    };

    useEffect(() => {
        setAmount(thisOrder.price)
        setDiscount(thisOrder.prepayment)
        setTotal(thisOrder.allPrice)
    }, [thisOrder.price, thisOrder.prepayment, thisOrder.allPrice]);

    return (
        <div style={{ width:"36vw"}}>
            <div style={{display: 'flex', alignItems: 'center', marginTop: '-1vh', width:"36vw"}}>
                <label style={{fontSize: '0.9vw', color: '#707070'}}>Загальна вартість:</label>
                <input
                    disabled
                    type="text"
                    value={`${amount} грн`}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    style={{
                        marginLeft: '0.5vw',
                        padding: '0.5vh',
                        fontSize: '0.9vw',
                        width: '28%',
                        backgroundColor: '#F2F0E7',
                        position: 'relative',
                        border: 'none',
                        borderRadius: '1vw',
                        zIndex: 0,
                        color: '#707070',
                        paddingLeft: '1vw',
                    }}
                />
            </div>

          <div
            className="position-absolute d-flex flex-row align-items-center"
            style={{ top: '6.5vh', right: "0.5vw", gap: '0.5vw',  }}
          >
            <label
              style={{ fontSize: '0.9vw', color: '#707070', whiteSpace: 'nowrap' }}
            >
              Знижка:
            </label>

            <div style={{ position: 'relative', width: '4vw'}}>
              <input
                type="text"
                value={discount}
                onChange={e => handleDiscountChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5vh 1vw',
                   // місце для "%"
                  fontSize: '0.9vw',
                  backgroundColor: '#F2F0E7',
                  border: 'none',
                  borderRadius: '1vw',
                  color: '#707070',
                }}
              />

            </div>

            {load && <Spinner animation="border" variant="danger" size="sm" />}
          </div>



          {error && (
                <div style={{color: 'red', fontSize: '1vw', marginTop: '0.5vh'}}>{error}</div>
            )}

            <div style={{display: 'flex', alignItems: 'center', marginTop: '0.5vh'}}>
                <label style={{fontSize: '0.9vw',  color: '#707070'}}>К оплаті буде:</label>
                <input
                    disabled
                    type="text"
                    value={`${total} грн`}
                    readOnly
                    style={{
                        padding: '0.5vh',
                        fontSize: '0.9vw',
                        width: '28%',
                        backgroundColor: '#F2F0E7',
                        position: 'relative',
                        border: 'none',
                        borderRadius: '1vw',
                        zIndex: 0,
                        color: 'black',
                        marginLeft: '2.15vw',
                        paddingLeft: '1vw',
                      fontWeight:"1000" ,
                    }}
                />
                {load && (
                    <Spinner animation="border" variant="danger" size="sm"/>
                )}
            </div>
        </div>
    );
}

export default PaymentCalculator;
