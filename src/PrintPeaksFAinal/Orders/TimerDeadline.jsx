import React, { useState, useEffect } from 'react';
import {Spinner} from "react-bootstrap";

const TimerDeadline = ({deadline, thisOrder}) => {
    // Заданная метка времени
    const [targetDate, setTargetDate] = useState(new Date(thisOrder.deadline));
    const [nowDate, setNowDate] = useState(new Date());
    const [timeLeft, setTimeLeft] = useState({days: undefined});
    const [timeLife, setTimeLife] = useState({days: undefined});
    // console.log(targetDate);
    const calculateTimeLeft = () => {
        const now = new Date();
        setNowDate(now)
        const difference = targetDate - now;

        let timeLeft = {};

        if (difference > 0) {
            // Время до наступления даты
            timeLeft = {
                status: 'До кінця дедлайну',
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            // Время, прошедшее после даты
            const elapsed = now - targetDate;
            timeLeft = {
                status: 'З моменту дедлайна пройшло',
                days: Math.floor(elapsed / (1000 * 60 * 60 * 24)),
                hours: Math.floor((elapsed / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((elapsed / 1000 / 60) % 60),
                seconds: Math.floor((elapsed / 1000) % 60),
            };
        }

        return timeLeft;
    };

    const calculateTimeLife = () => {
        const now = new Date();
        const difference = now - new Date(thisOrder.createdAt);

        let timeLeft = {};

        timeLeft = {
            status: 'Час виконання замовлення: ',
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };

        return timeLeft;
    };

    // useEffect(() => {
    //     // console.log(targetDate);
    //     setTargetDate(new Date(deadline))
    // }, [deadline]);

    useEffect(() => {
        // Обновление каждую секунду
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
            setTimeLife(calculateTimeLife());
        }, 1000);

        // Очистка интервала при размонтировании компонента
        return () => clearInterval(timer);
    }, []);

    const timerComponents = [];
    const lifeComponents = [];

    if (timeLeft.days !== undefined) {
        timerComponents.push(
            <span key="days">{timeLeft.days} дн </span>,
            <span key="hours">{timeLeft.hours} год </span>,
            <span key="minutes">{timeLeft.minutes} хв </span>,
            <span key="seconds">{timeLeft.seconds} сек</span>
        );
    }
    if (timeLife.days !== undefined) {
        lifeComponents.push(
            <span key="days">{timeLife.days} дн </span>,
            <span key="hours">{timeLife.hours} год </span>,
            <span key="minutes">{timeLife.minutes} хв </span>,
            <span key="seconds">{timeLife.seconds} сек</span>
        );
    }

    return (
        <div style={{marginTop: '0.3h', fontSize: '0.7vw', color: '#707070'}}>
            {deadline !== null && (
                <div>
                    {/*{timeLeft.status && <div>{timeLeft.status}:</div>}*/}
                    <div>{timerComponents.length ? <div><span style={{color: "red"}}>{timeLeft.status}</span> {timerComponents}</div> : <span>Дедлайн!</span>}</div>
                </div>
            )}
            <div className={"d-flex justify-content-between"}>
                <div style={{marginTop: "-0.5vh"}}>
                    <div>Час виготовлення замовлення: {lifeComponents.length ? lifeComponents : <span><Spinner animation="border" variant="danger" size="sm" /></span>}</div>
                </div>

            </div>
            {/*<div style={{marginTop: "0.3vh"}}>{`${nowDate.toLocaleDateString()} ${nowDate.toLocaleTimeString()} - Поточний час`}</div>*/}
        </div>
    );
};

export default TimerDeadline;