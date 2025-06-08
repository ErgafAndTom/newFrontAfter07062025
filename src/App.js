// import './bootstrap.css';
// import './bootstrap.css.map';
// import './App.css';
// import './Colors.css';
// import './StylesOld.css';
// import './index.css';
// import './global.css';
// import {Provider} from "react-redux";
// import store from "./stores/store";
// import {BrowserRouter as Router} from 'react-router-dom'
// import React, {useEffect} from "react";
// import AllWindow from "./components/AllWindow";
// // В App.tsx або іншому компоненті високого рівня
// import {Global, css} from '@emotion/react';
//
// const globalStyles = css`
//     @import url('https://use.typekit.net/iro7gjn.css');
// `;
//
// function App() {
//     useEffect(() => {
//         document.fonts.ready.then(() => {
//             if (document.fonts.check('1.3vh "Inter"')) {
//                 console.log('✅ Шрифт inter завантажено та готовий до використання!');
//             } else {
//                 console.warn('❌ Шрифт inter не завантажено або недоступний.');
//                 // Спробуємо примусово завантажити шрифти
//                 // Використовуємо відносні шляхи до шрифтів
//                 const regularFont = new FontFace('Inter', 'url(./fonts/Inter_18pt-Regular.ttf)', {weight: '400'});
//
//                 Promise.all([regularFont.load()])
//                     .then(loadedFonts => {
//                         loadedFonts.forEach(font => document.fonts.add(font));
//                         console.log('✅ Шрифти inter завантажено примусово!');
//                     })
//                     .catch(err => console.error('❌ Помилка при завантаженні шрифтів:', err));
//             }
//         });
//     }, []);
//     return (
//         <>
//             <Global styles={globalStyles}/>
//             <div>
//                 <Provider store={store}>
//                     <Router>
//                         <AllWindow/>
//                     </Router>
//                 </Provider>
//             </div>
//         </>
//     )
// }
//
// export default App;

import React, {useEffect, useState} from 'react';
import './App.css';

const GRAVITY = 0.2; // Зменшено силу гравітації
const HORIZONTAL_GRAVITY = GRAVITY * 0.1; // 10% від вертикальної гравітації
const BOUNCE_FACTOR = 0.2; // Збільшено м'якість у 5 разів
const OBJECT_SIZE = 150; // Збільшено розмір об'єктів у 3 рази
const NUM_OBJECTS = 50; // Кількість об'єктів

function App() {
    const [objects, setObjects] = useState(
        Array.from({length: NUM_OBJECTS}, (_, i) => ({
            id: i,
            x: Math.random() * window.innerWidth,
            y: Math.random() * 50,
            vx: 0,
            vy: 0,
            size: OBJECT_SIZE + Math.random() * 50, // Різні розміри об'єктів
            color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`, // Різнокольорові об'єкти
            bounceFactor: BOUNCE_FACTOR + Math.random() * 0.5 // Різна м'якість об'єктів
        }))
    );

    useEffect(() => {
        const interval = setInterval(updateObjects, 16);
        return () => clearInterval(interval);
    }, [objects]);

    const updateObjects = () => {
        let newObjects = objects.map(obj => {
            let newX = obj.x + obj.vx;
            let newY = obj.y + obj.vy;
            let newVX = obj.vx + HORIZONTAL_GRAVITY;
            let newVY = obj.vy + GRAVITY;

            if (newY > window.innerHeight - obj.size) {
                newY = window.innerHeight - obj.size;
                newVY = -obj.vy * obj.bounceFactor;
            }

            if (newX < 10) {
                newX = 10;
                newVX = -obj.vx * obj.bounceFactor;
            } else if (newX > window.innerWidth - obj.size - 2) {
                newX = window.innerWidth - obj.size - 2;
                newVX = -obj.vx * obj.bounceFactor;
            }

            return {...obj, x: newX, y: newY, vx: newVX, vy: newVY};
        });

        newObjects = checkCollisions(newObjects);
        setObjects(newObjects);
    };

    const checkCollisions = (objects) => {
        for (let i = 0; i < objects.length; i++) {
            for (let j = i + 1; j < objects.length; j++) {
                const obj1 = objects[i];
                const obj2 = objects[j];

                const dx = obj1.x - obj2.x;
                const dy = obj1.y - obj2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = (obj1.size + obj2.size) * 0.3;
                const maxDistance = (obj1.size + obj2.size) * 1;

                if (distance < maxDistance) {
                    const angle = Math.atan2(dy, dx);
                    const mass1 = obj1.size;
                    const mass2 = obj2.size;
                    const totalMass = mass1 + mass2;

                    // Calculate relative velocity
                    const relativeVX = obj1.vx - obj2.vx;
                    const relativeVY = obj1.vy - obj2.vy;
                    const relativeSpeed = Math.sqrt(relativeVX * relativeVX + relativeVY * relativeVY);

                    // Calculate force based on distance and relative speed
                    const forceFactor = Math.pow((maxDistance - distance) / (maxDistance - minDistance), 2);
                    const repulsionForce = forceFactor * relativeSpeed * 0.5;

                    if (distance < minDistance) {
                        // Elastic collision when objects are too close
                        const moveBack = (minDistance - distance) / 2;
                        const moveX = moveBack * Math.cos(angle);
                        const moveY = moveBack * Math.sin(angle);

                        const v1x = (obj1.vx * (mass1 - mass2) + 2 * mass2 * obj2.vx) / totalMass;
                        const v1y = (obj1.vy * (mass1 - mass2) + 2 * mass2 * obj2.vy) / totalMass;
                        const v2x = (obj2.vx * (mass2 - mass1) + 2 * mass1 * obj1.vx) / totalMass;
                        const v2y = (obj2.vy * (mass2 - mass1) + 2 * mass1 * obj1.vy) / totalMass;

                        objects[i] = {...obj1, x: obj1.x + moveX, y: obj1.y + moveY, vx: v1x, vy: v1y};
                        objects[j] = {...obj2, x: obj2.x - moveX, y: obj2.y - moveY, vx: v2x, vy: v2y};
                    } else {
                        const forceX = repulsionForce * Math.cos(angle);
                        const forceY = repulsionForce * Math.sin(angle);

                        objects[i] = {
                            ...obj1,
                            vx: obj1.vx + (forceX / mass1),
                            vy: obj1.vy + (forceY / mass1)
                        };
                        objects[j] = {
                            ...obj2,
                            vx: obj2.vx - (forceX / mass2),
                            vy: obj2.vy - (forceY / mass2)
                        };
                    }
                }
            }
        }
        return objects;
    };

    const applyRandomForce = () => {
        const randomIndex = Math.floor(Math.random() * NUM_OBJECTS);
        const randomDirection = Math.random() < 0.5 ? -1 : 1;
        const force = (window.innerWidth / 5) / 5; // Приблизно надала б швидкість єкрану на 5 секунд

        setObjects(prevObjects =>
            prevObjects.map((obj, index) => {
                if (index === randomIndex) {
                    return {...obj, vx: force * randomDirection};
                }
                return obj;
            })
        );
    };

    useEffect(() => {
        const interval = setInterval(applyRandomForce, 5000); // Застосовуємо випадкову силу кожні 5 секунд
        return () => clearInterval(interval);
    }, []);

    const createWall = (left, top, width, height) => (
        <div
            style={{
                position: 'absolute',
                left,
                top,
                width,
                height,
                backgroundColor: 'black'
            }}
        />
    );

    return (
        <div className="App">
            {objects.map(obj => (
                <div
                    key={obj.id}
                    style={{
                        position: 'absolute',
                        width: `${obj.size}px`,
                        height: `${obj.size}px`,
                        backgroundColor: obj.color,
                        borderRadius: '50%',
                        left: obj.x,
                        top: obj.y
                    }}
                />
            ))}
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    height: '2px',
                    backgroundColor: 'black'
                }}
            />
            {createWall(0, 0, '10px', window.innerHeight)} {/* Ліва стінка */}
            {createWall(window.innerWidth - 2, 0, '2px', window.innerHeight)} {/* Права стінка */}
        </div>
    );
}

export default App;
