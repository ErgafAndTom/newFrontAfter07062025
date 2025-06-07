import React, {useEffect, useRef} from 'react';

const FallingCircle = () => {
    const position = useRef(0);
    const velocity = useRef(0);
    const direction = useRef(Math.random() > 0.5 ? 1 : -1); // random initial direction
    const acceleration = 5000;
    const friction = 0.97; // friction to slow circle down when it hits the ground
    let lastTime = useRef(Date.now());
    const isDirectionChanged = useRef(false);

    useEffect(() => {
        const animate = () => {
            const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
            const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            const elementHeight = document.getElementById('fallingCircle').offsetHeight;
            const elementWidth = document.getElementById('fallingCircle').offsetWidth;

            const currentTime = Date.now();
            const delta = (currentTime - lastTime.current) / 1000; // delta time in seconds
            let newVelocity = velocity.current + acceleration * delta;
            let newPosition = position.current + newVelocity * delta;

            if (newPosition + elementHeight > viewportHeight) {
                newPosition = viewportHeight - elementHeight;
                newVelocity *= friction; // reduce velocity due to friction
                if (!isDirectionChanged.current) {
                  direction.current = Math.random() > 0.5 ? 1 : -1; // change direction only when it hits the ground
                  isDirectionChanged.current = true;
                }
            }

            const leftPosition = parseInt(document.getElementById('fallingCircle').style.left, 10);
            let newLeftPosition = leftPosition + direction.current * 10; // move horizontally

            if(newLeftPosition < 0) newLeftPosition = 0; // Prevent going out of viewport
            if(newLeftPosition > viewportWidth - elementWidth) newLeftPosition = viewportWidth - elementWidth; // Prevent going out of viewport

            velocity.current = newVelocity;
            position.current = newPosition;
            document.getElementById('fallingCircle').style.top = `${newPosition}px`;
            document.getElementById('fallingCircle').style.left = `${newLeftPosition}px`;

            lastTime.current = currentTime;

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, []);

    return <div id="fallingCircle" style={{
            position: 'absolute',
            top: `${position.current}px`,
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: 'red',
        }}/>
};

export default FallingCircle;