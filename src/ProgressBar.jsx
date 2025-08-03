import React, {useState, useEffect} from 'react';
import rozrahuvImage from './rozrahuv.png';
// import './progressbar_styles.css';
import DiscountCalculator from './DiscountCalculator';
import axios from "./api/axiosInstance";
import ClientChangerUIArtem from "./PrintPeaksFAinal/userInNewUiArtem/ClientChangerUIArtem";
import TimerDeadline from "./PrintPeaksFAinal/Orders/TimerDeadline";
import PopupLeftNotification from "./components/nav/PopupLeftNotification";
import {useSelector} from "react-redux";


const stages = [
    {id: 1, label: 'Сектор 1', color: '#FFC107'},
    {id: 2, label: 'Сектор 2', color: '#F2F0E7'},
    {id: 3, label: 'Сектор 3', color: '#F2F0E7'},
    {id: 4, label: 'Сектор 4', color: '#F2F0E7'},
    {id: 5, label: 'Сектор 5', color: '#F2F0E7'},
    {id: 6, label: 'Сектор 6', color: '#F2F0E7'}
];


const ProgressBar = ({
                         thisOrder,
                         setThisOrder,
                         setNewThisOrder,
                         handleThisOrderChange,
                         selectedThings2,
                         setSelectedThings2
                     }) => {
    const [isVisible, setIsVisible] = useState(true);
  const currentUser = useSelector((state) => state.auth.user);
    const [currentStage, setCurrentStage] = useState(thisOrder?.status ? parseInt(thisOrder.status) : 0);
    const [isPaid, setIsPaid] = useState(false);
    const [isCancelled, setIsCancelled] = useState(false);
    const [paymentDate, setPaymentDate] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [error, setError] = useState(null);
    const [load, setLoad] = useState(false);
    const [elapsedTime, setElapsedTime] = useState({days: 0, hours: 0, minutes: 0, seconds: 0});
    const [remainingTime, setRemainingTime] = useState(null);
    const [amount, setAmount] = useState(0);
    const [discount, setDiscount] = useState('');
    const [total, setTotal] = useState(0);
    const [discountType, setDiscountType] = useState('%');
    const [deadline, setDeadline] = useState(null);
    const [isFocused, setIsFocused] = useState(false);
    const [showPlaceholder, setShowPlaceholder] = useState(true);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [manufacturingStartTime, setManufacturingStartTime] = useState(null);
    const [finalManufacturingTime, setFinalManufacturingTime] = useState(null);
  const getBackgroundColorByStatus = (status) => {
    switch (status) {
      case '0': return 'rgba(251, 250, 246, 0.5)';
      case '1': return 'rgba(255,217,174,0.8)';
      case '2': return 'rgba(211, 189, 167, 0.5)';
      case '3': return 'rgba(187, 197, 211, 0.5)';
      case '4': return 'rgba(241, 203, 212, 0.5)';
      case '5': return 'rgba(169, 207, 183, 0.5)';
      case 'Відміна': return 'rgba(238, 60, 35, 0.5)';
      default: return 'rgba(251, 250, 246, 0.5)';
    }
  };

    const formats = [
        "Д|",
        "Де|",
        "Дед|",
        "Дедл|",
        "Дедла|",
        "Дедлай|",
        "Дедлайн|",
        "Дедлайн |",
        "Дедлайн н|",
        "Дедлайн на|",
        "Дедлайн на |",
        "Дедлайн на з|",
        "Дедлайн на за|",
        "Дедлайн на зам|",
        "Дедлайн на замо|",
        "Дедлайн на замов|",
        "Дедлайн на замовл|",
        "Дедлайн на замовле|",
        "Дедлайн на замовлен|",
        "Дедлайн на замовленн|",
        "Дедлайн на замовлення|",
        "                     "
    ];
    const minDateTime = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}T${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
    // const getCurrentDateTimeLocal = () => {
    //     const now = new Date();
    //     const year = now.getFullYear();
    //     const month = String(now.getMonth() + 1).padStart(2, '0');
    //     const day = String(now.getDate()).padStart(2, '0');
    //     const hours = String(now.getHours()).padStart(2, '0');
    //     const minutes = String(now.getMinutes()).padStart(2, '0');
    //
    //     return `${year}-${month}-${day}T${hours}:${minutes}`;
    // };


    const AnimatedPlaceholderInput = ({onChange}) => {
        useEffect(() => {
            if (!isFocused) {
                const interval = setInterval(() => {
                    setPlaceholderIndex((prevIndex) => (prevIndex + 1) % formats.length);
                }, 100); // Інтервал переходу між форматами

                return () => clearInterval(interval);
            }
        }, [isFocused]);

        return (
            <div style={{display: 'flex', alignItems: 'center',  position: 'relative'}}>
                <input
                    type={isFocused ? "datetime-local" : formats[placeholderIndex]}
                    value={isFocused ? "datetime-local" : formats[placeholderIndex]}
                    onChange={(e) => onChange(new Date(e.target.value))}
                    onFocus={() => setIsFocused(true)}
                    onBlur={(e) => setIsFocused(e.target.value !== '')}
                    style={{
                        padding: '0.5vh',
                        justifyContent: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.7vw',
                        width: '100%',
                        backgroundColor: isFocused ? 'white' : '#F2F0E7',
                        // position: 'relative',
                        border: 'none',
                        borderRadius: '1vw',
                        zIndex: 0,
                        color: isFocused ? 'black' : '#707070',
                        paddingLeft: '1vw',
                        textAlign: 'center'
                    }}
                    min={minDateTime}
                />
            </div>
        );
    };

    const formatTimeDisplay = (time) => {
        if (!time) return '';
        const {days, hours, minutes, seconds} = time;
        return `Час виготовлення замовлення: ${days}д ${hours}год ${minutes}хв ${seconds}сек`;
    };

    useEffect(() => {
        let timer;
        if (manufacturingStartTime && currentStage >= 1 && currentStage <= 3) {
            timer = setInterval(() => {
                const now = new Date();
                const diff = now - new Date(manufacturingStartTime);

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                setElapsedTime({days, hours, minutes, seconds});
            }, 1000);
        }
        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [manufacturingStartTime, currentStage]);

    useEffect(() => {
        console.log(isCancelled);
    }, [isCancelled]);

    useEffect(() => {
        let timer;
        if (deadline && currentStage < 4) {
            timer = setInterval(() => {
                const now = new Date();
                const diff = deadline - now;
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                const seconds = Math.floor((diff / 1000) % 60);
                setRemainingTime({days, hours, minutes, seconds});
            }, 1000);
        } else {
            setRemainingTime(null);
        }
        return () => clearInterval(timer);
    }, [deadline, currentStage]);

    useEffect(() => {
        if (!thisOrder) return;

        if (thisOrder.payStatus === "pay") {
            setIsPaid(true);
        } else {
            setIsPaid(false);
            setPaymentDate(new Date());
        }
        setDeadline(thisOrder.deadline);
        setCurrentStage(thisOrder.status ? parseInt(thisOrder.status) : 0);
    }, [thisOrder?.payStatus, thisOrder?.status, thisOrder?.deadline]);


    const handleStageChange = (stage) => {
        if (stage === 'pay') {
            setIsPaid(true);
            setPaymentDate(new Date());
            return;
        }

        if (stage === 'cancel') {
            setIsCancelled(true);
            setCurrentStage(-1);
            return;
        }

        if (stage === 1) {
            setStartTime(new Date());
        }

        setCurrentStage(stage);
    };

    const handleStageChangeServer = (stage) => {
        if (!thisOrder?.id) return;

        let dataToSend = {
            newStatus: stage,
            thisOrderId: thisOrder.id,
        }

        // Додаємо час виготовлення до даних
        if (stage === 1) {
            dataToSend.manufacturingStartTime = new Date().toISOString();
        }

        if (stage === 3) {
            const finalTime = {
                days: elapsedTime.days,
                hours: elapsedTime.hours,
                minutes: elapsedTime.minutes,
                seconds: elapsedTime.seconds
            };
            dataToSend.finalManufacturingTime = finalTime;
            dataToSend.totalManufacturingTimeInSeconds =
                (finalTime.days * 24 * 60 * 60) +
                (finalTime.hours * 60 * 60) +
                (finalTime.minutes * 60) +
                finalTime.seconds;
        }

        axios.put(`/orders/OneOrder/statusUpdate`, dataToSend)
            .then(response => {
                console.log(response.data);
                if (stage === 'pay') {
                    setThisOrder(prevState => ({

                        payStatus: "pay",
                      OrderId: thisOrder.id
                    }));
                    setIsPaid(true);
                } else {
                    setThisOrder(prevState => ({
                        ...prevState,
                        status: response.data.status,
                        manufacturingStartTime: stage === 1 ? dataToSend.manufacturingStartTime : prevState.manufacturingStartTime,
                        finalManufacturingTime: stage === 3 ? dataToSend.finalManufacturingTime : prevState.finalManufacturingTime
                    }));

                    if (stage === 1) {
                        const currentTime = new Date().toISOString();
                        setManufacturingStartTime(currentTime);
                    }
                    if (stage === 3) {
                        setFinalManufacturingTime({...elapsedTime});
                        setManufacturingStartTime(null); // Зупиняємо таймер
                    }
                }
            })
            .catch(error => {
                if (error.response?.status === 403) {
                    // navigate('/login');
                }
                console.log(error.message);
            });
    };

    const handleDeadlineChangeServer = (deadlineNew) => {
        let dataToSend = {
            deadlineNew: deadlineNew,
            thisOrderId: thisOrder.id,
        }
        // setLoad(true)
        axios.put(`/orders/OneOrder/deadlineUpdate`, dataToSend)
            .then(response => {
                console.log(response.data);
                setThisOrder({...thisOrder, deadline: response.data.deadline})
                // setLoad(false)
                // setThisOrder(response.data)
                // handleClose()
            })
            .catch(error => {
                if (error.response.status === 403) {
                    // navigate('/login');
                }
                // setError(error)
                // setLoad(false)
                console.log(error.message);
            })
        // console.log(deadlineNew);
        // setDeadline(deadlineNew);
    };


    const getSegmentColor = (id) => {
        if (isCancelled) return '#ee3c23';
        if (id === stages[4].id && thisOrder.payStatus === "pay") return '#008249';
        if (currentStage === 1 && [1, 2].includes(id)) return '#8B4513';
        if (currentStage === 2 && [1, 2, 3].includes(id)) return '#3C60A6';
        if (currentStage === 3 && [1, 2, 3, 4].includes(id)) return '#F075AA';
        if (currentStage === 4 && [1, 2, 3, 4, 5, 6].includes(id)) return '#008249';
        if (currentStage === 0 && id === 0) return '#FFC107';
        return '#F2F0E7';
    };

    const formatDate = (date) => {
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };


        return new Intl.DateTimeFormat('uk-UA', options).format(date);
    };

    const buttonStyles = {
        base: {
            padding: '1vh',
            borderRadius: '1vw',
            border: 'none',
            cursor: 'pointer',
            width: '11vw',
            height: '3vh',
            fontSize: '1vh',
            display: 'flex', // Використовуємо flex для центрованого контенту
            justifyContent: 'center', // Горизонтальне центрування тексту
            alignItems: 'center', // Вертикальне центрування тексту
            marginLeft: 'auto'
        },
        takeWork: {
            backgroundColor: '#FFC107',
            color: 'black',
            border: 'none',
            cursor: 'pointer',
            width: '11vw',
            height: '3vh',
            fontFamily: 'inter, sans-serif',
            fontSize: '0.7vw',
            display: 'flex', // Використовуємо flex для центрованого контенту
            justifyContent: 'center', // Горизонтальне центрування тексту
            alignItems: 'center', // Вертикальне центрування тексту
            marginLeft: 'auto'
        },
        postpress: {
            backgroundColor: '#8B4513',
            color: 'white',
            cursor: 'pointer',
            width: '11vw',
            height: '3vh',
            fontFamily: 'inter, sans-serif',
            justifyContent: 'center', // Горизонтальне центрування тексту

        },
        done: {
            backgroundColor: '#3C60A6',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            width: '11vw',
            height: '3vh',
            fontFamily: 'inter, sans-serif',
            fontSize: '0.7vw',
            display: 'flex', // Використовуємо flex для центрованого контенту
            justifyContent: 'center', // Горизонтальне центрування тексту
            alignItems: 'center', // Вертикальне центрування тексту
            marginLeft: 'auto'
        },
        handover: {
            backgroundColor: '#F075AA',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            width: '11vw',
            height: '3vh',
            fontFamily: 'inter, sans-serif',
            fontSize: '0.7vw',
            display: 'flex', // Використовуємо flex для центрованого контенту
            justifyContent: 'center', // Горизонтальне центрування тексту
            alignItems: 'center', // Вертикальне центрування тексту
            marginLeft: 'auto'
        },
        pay: {
            backgroundColor: '#008249',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            width: '11vw',
            height: '3vh',
            fontFamily: 'inter, sans-serif',
            fontSize: '0.7vw',
            display: 'flex', // Використовуємо flex для центрованого контенту
            justifyContent: 'center', // Горизонтальне центрування тексту
            alignItems: 'center', // Вертикальне центрування тексту
            marginLeft: 'auto'

        },
        cancel: {
            backgroundColor: 'transparent',
            fontSize: '1.2vw',
            position: 'absolute',
            top: '0vh',
            right: '-0.1vw',
            cursor: 'pointer',
            transform: 'scale(0.5)',
            border: 'none'
        }
    };

    return (

        <div style={{  marginTop: "-0.8vh",
          backgroundColor: getBackgroundColorByStatus(thisOrder?.status),
          position: "fixed",
          right: "1vw",
          bottom: "1vh",
          width: "36.5vw",
          padding:"1.5vh",
          height:"15vh",
          borderRadius: '1vh'}}>

            <button onClick={() => handleStageChange('cancel')} style={buttonStyles.cancel}>

            </button>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1vh'}}>
                <div
                    style={{
                        fontSize: '2.3vh',
                        color: isCancelled ? '#ee3c23' : '#000000'
                    }}
                >
                    {isCancelled
                        ? 'Скасоване замовлення'
                        : currentStage === 0
                            ? 'Оформлення замовлення'
                            : currentStage === 1
                                ? 'Замовлення друкується'
                                : currentStage === 2
                                    ? 'Замовлення у постпресі'
                                    : currentStage === 3
                                        ? 'Готове замовлення'
                                        : 'Віддали замовлення'}
                </div>
                <div style={{display: 'flex',}}>
                    {thisOrder?.status && parseInt(thisOrder.status) === 0 && (
                        <button
                            className="adminButtonAdd"
                            onClick={() => handleStageChangeServer(1)}
                            style={{
                                position: 'absolute',
                                top: '1vh',
                                right: '0.5vw',
                            }}
                        >
                            Взяти в роботу
                        </button>
                    )}
                    {thisOrder?.status && parseInt(thisOrder.status) === 1 && (
                        <button
                            className="adminButtonAdd"
                            onClick={() => handleStageChangeServer(2)}
                            style={{
                                position: 'absolute',
                                top: '1vh',
                                right: '0.5vw',
                                backgroundColor: '#8B4513',
                            }}
                        >
                            Відправити на постпрес
                        </button>
                    )}
                    {thisOrder?.status && parseInt(thisOrder.status) === 2 && (
                        <button
                            className="adminButtonAdd"
                            onClick={() => handleStageChangeServer(3)}
                            style={{
                                position: 'absolute',
                                top: '1vh',
                                right: '0.5vw',
                                backgroundColor: '#3C60A6',
                            }}
                        >
                            Виконане
                        </button>
                    )}
                    {thisOrder?.status && parseInt(thisOrder.status) === 3 && (
                        <button
                            className="adminButtonAdd"
                            onClick={() => handleStageChangeServer(4)}
                            style={{
                                position: 'absolute',
                                top: '1vh',
                                right: '0.5vw',
                                backgroundColor: '#F075AA',
                            }}
                        >
                            Віддати
                        </button>
                    )}
                </div>
            </div>
            <div style={{display: 'flex', gap: '0.5vw', marginBottom: '2vh'}}>
                {stages.map((segment) => (
                    <div
                        key={segment.id}
                        style={{
                            flex: 1,
                            height: '1vh',
                            backgroundColor: getSegmentColor(segment.id),
                            borderRadius: '1vw'
                        }}
                    ></div>
                ))}
            </div>

            <div style={{marginBottom: '0.5vh'}}>
                <DiscountCalculator thisOrder={thisOrder} setThisOrder={setThisOrder} selectedThings2={selectedThings2}
                                    setSelectedThings2={setSelectedThings2}/>
            </div>
          <div style={{ position: 'absolute', right: '0.5vw', bottom: '0.5vh'}}>
            {deadline === null && (
                <div >
                    <AnimatedPlaceholderInput onChange={handleDeadlineChangeServer}/>
                </div>
            )}
            {deadline && (
                <div>
                    <div className="d-flex align-items-center"
                         style={{marginTop: '0.5vh', fontSize: '0.7vw', color: '#707070', marginBottom: '0.5vh'}}>
                        {/*Обраний дедлайн: {deadline.toString()} &*/}
                        {`Обраний дедлайн: ${new Date(deadline).toLocaleDateString()} ${new Date(deadline).toLocaleTimeString()}`}

                        {currentStage === 0 && (
                            <div style={{marginLeft: "0.5vw"}} onClick={() => handleDeadlineChangeServer(null)}>❌</div>
                        )}
                        {/*Обраний дедлайн: {deadline.toLocaleString('uk-UA', {*/}
                        {/*day: '2-digit',*/}
                        {/*month: 'long',*/}
                        {/*year: 'numeric',*/}
                        {/*hour: '2-digit',*/}
                        {/*minute: '2-digit',*/}
                        {/*})}*/}
                    </div>
                </div>

            )}
          </div>
            {/* <TimerDeadline deadline={deadline} thisOrder={thisOrder} /> */}

            {/*{!isPaid && (*/}
            {/*  <>*/}
            {/*    {currentUser?.role === "admin" &&*/}
            {/*      <div style={{*/}
            {/*        justifyContent: 'flex-end',*/}
            {/*        alignItems: 'flex-end', marginTop: '-10vh',*/}
            {/*      }}>*/}
            {/*        <button*/}
            {/*          onClick={() => handleStageChangeServer('pay')}*/}
            {/*          className="adminButtonAdd"*/}
            {/*          style={{*/}
            {/*            background: "#008249",*/}
            {/*            position: 'absolute',*/}
            {/*            right: '0.5vw',*/}
            {/*            top: '8.3vh',*/}
            {/*          }}*/}
            {/*        >*/}
            {/*          Оплатити*/}
            {/*        </button>*/}
            {/*      </div>*/}
            {/*    }*/}
            {/*  </>*/}
            {/*)}*/}

            {/*{isPaid && (*/}
            {/*    <div style={{*/}

            {/*        justifyContent: 'flex-end',*/}
            {/*        alignItems: 'flex-end',*/}

            {/*    }}>*/}

            {/*        <div style={{*/}
            {/*            // position: 'relative',*/}
            {/*            width: '45%',*/}
            {/*            transform: 'rotate(-30deg)'*/}
            {/*        }}>*/}
            {/*            <img*/}
            {/*                src={rozrahuvImage}*/}
            {/*                alt="Розрахувались"*/}
            {/*                style={{width: '100%', height: 'auto', marginTop: "8vh", marginLeft: "19vw"}}*/}
            {/*            />*/}
            {/*            {paymentDate && (*/}
            {/*                <div style={{*/}
            {/*                    position: 'absolute',*/}
            {/*                    top: '11.1vh',*/}
            {/*                    // marginBottom: "19vw",*/}
            {/*                    right: '-13vw',*/}
            {/*                    fontSize: '0.5vw',*/}
            {/*                    color: '#008249'*/}
            {/*                }}>*/}
            {/*                    {formatDate(paymentDate)}*/}

            {/*                </div>*/}
            {/*            )}*/}
            {/*        </div>*/}

            {/*    </div>*/}
            {/*)}*/}

            {(currentStage >= 1 && currentStage <= 3 ? elapsedTime : finalManufacturingTime) && (
                <div style={{
                    fontSize: '1.1vh',
                    color: '#707070',
                    marginBottom: '1vh',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    top: '14vh',
                    opacity: '0.5'
                }}>
                    {currentStage === 3 ? "Фінальний час виготовлення: " : "Час виготовлення замовлення: "}
                    <span style={{
                        fontWeight: 'bold',
                        marginLeft: '0.35vw'
                    }}>{currentStage <= 3 ? elapsedTime.days : finalManufacturingTime.days}</span>
                    <span style={{fontWeight: 'bold', marginRight: '0.35vw'}}>д</span>
                    <span
                        style={{fontWeight: 'bold'}}>{currentStage <= 3 ? elapsedTime.hours : finalManufacturingTime.hours}</span>
                    <span style={{fontWeight: 'bold', marginRight: '0.35vw'}}>год</span>
                    <span
                        style={{fontWeight: 'bold'}}>{currentStage <= 3 ? elapsedTime.minutes : finalManufacturingTime.minutes}</span>
                    <span style={{fontWeight: 'bold', marginRight: '0.35vw'}}>хв</span>
                    <span
                        style={{fontWeight: 'bold'}}>{currentStage <= 3 ? elapsedTime.seconds : finalManufacturingTime.seconds}</span>
                    <span style={{fontWeight: 'bold'}}>сек</span>
                </div>
            )}
        </div>
    );
};

export default ProgressBar;
