import React, { useState, useEffect } from 'react';

const AnimatedComponent = () => {
    const [position, setPosition] = useState(0);
    const [velocity, setVelocity] = useState(0);
    const acceleration = 0.5;

    useEffect(() => {
        const handleAnimation = () => {
            setVelocity((prevVelocity) => prevVelocity + acceleration);
            setPosition((prevPosition) => prevPosition + velocity);
        };

        // Якщо позиція менше за 500px, продовжуємо анімацію
        if (position < 500) {
            const animationFrame = requestAnimationFrame(handleAnimation);
            return () => cancelAnimationFrame(animationFrame);
        }
    }, [position, velocity]);

    return (
        <div
            style={{
                transform: `translateY(${position}px)`,
                transition: 'transform 0.1s linear',
            }}
        >
            Анімований елемент
        </div>
    );
};

export default AnimatedComponent;
