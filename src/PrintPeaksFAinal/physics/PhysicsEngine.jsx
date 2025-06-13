// import {useEffect, useState} from 'react';
//
//
// const ROTATIONAL_FORCE_COEFFICIENT = 0.3;
// const LINEAR_FORCE_COEFFICIENT = 1 - ROTATIONAL_FORCE_COEFFICIENT;
//
// export const usePhysicsEngine = (initialObjects, {
//     HORIZONTAL_GRAVITY,
//     BOUNCE_FACTOR,
//     HITBOX_SCALE,
//     FORCE_START_DISTANCE,
//     MAX_FORCE_DISTANCE,
//     MAX_FORCE,
//     FORCE_INCREASE_FACTOR,
//     HITBOX_SIZE,
//     GRAVITY,
//     NUM_OBJECTS
// }) => {
//     const [objects, setObjects] = useState(initialObjects);
//
//     useEffect(() => {
//         const interval = setInterval(updateObjects, 16);
//         return () => clearInterval(interval);
//     }, [objects]);
//
//     const updateObjects = () => {
//         let newObjects = objects.map(obj => {
//             let newX = obj.x + obj.vx;
//             let newY = obj.y + obj.vy;
//             let newVX = obj.vx + HORIZONTAL_GRAVITY;
//             let newVY = obj.vy + GRAVITY * 0.5;
//
//             if (newY > window.innerHeight - obj.size) {
//                 newY = window.innerHeight - obj.size;
//                 newVY = -obj.vy * obj.bounceFactor;
//             }
//
//             if (newX < 10) {
//                 newX = 10;
//                 newVX = -obj.vx * obj.bounceFactor;
//             } else if (newX > window.innerWidth - obj.size - 2) {
//                 newX = window.innerWidth - obj.size - 2;
//                 newVX = -obj.vx * obj.bounceFactor;
//             }
//
//             return {...obj, x: newX, y: newY, vx: newVX, vy: newVY};
//         });
//
//         newObjects = checkCollisions(newObjects);
//         setObjects(newObjects);
//     };
//
//     const checkCollisions = (objects) => {
//         for (let i = 0; i < objects.length; i++) {
//             for (let j = i + 1; j < objects.length; j++) {
//                 const obj1 = objects[i];
//                 const obj2 = objects[j];
//
//                 const dx = obj1.x - obj2.x;
//                 const dy = obj1.y - obj2.y;
//                 const distance = Math.sqrt(dx * dx + dy * dy);
//                 const minDistance = (obj1.size + obj2.size) * FORCE_START_DISTANCE;
//                 const maxDistance = (obj1.size + obj2.size) * HITBOX_SCALE;
//
//                 if (distance < maxDistance) {
//                     const angle = Math.atan2(dy, dx);
//                     const mass1 = obj1.size;
//                     const mass2 = obj2.size;
//                     const totalMass = mass1 + mass2;
//
//                     const shapeFactors = {
//                         circle: 1.0,
//                         square: 1.2,
//                         triangle: 1.4,
//                         pentagon: 1.3,
//                         hexagon: 1.25
//                     };
//
//                     const shapeFactor = (shapeFactors[obj1.shape] + shapeFactors[obj2.shape]) / 2;
//                     const relativeVX = obj1.vx - obj2.vx;
//                     const relativeVY = obj1.vy - obj2.vy;
//                     const relativeSpeed = Math.sqrt(relativeVX * relativeVX + relativeVY * relativeVY);
//                     const penetration = Math.max(0, 1 - (distance / minDistance));
//                     const forceFactor = Math.pow((maxDistance - distance) / (maxDistance - minDistance), 2) * shapeFactor;
//                     const repulsionForce = forceFactor * relativeSpeed * FORCE_INCREASE_FACTOR;
//
//                     if (distance < minDistance) {
//                         const moveBack = (minDistance - distance) / 2;
//                         const moveX = moveBack * Math.cos(angle);
//                         const moveY = moveBack * Math.sin(angle);
//
//                         const v1x = (obj1.vx * (mass1 - mass2) + 2 * mass2 * obj2.vx) / totalMass;
//                         const v1y = (obj1.vy * (mass1 - mass2) + 2 * mass2 * obj2.vy) / totalMass;
//                         const v2x = (obj2.vx * (mass2 - mass1) + 2 * mass1 * obj1.vx) / totalMass;
//                         const v2y = (obj2.vy * (mass2 - mass1) + 2 * mass1 * obj1.vy) / totalMass;
//
//                         objects[i] = {...obj1, x: obj1.x + moveX, y: obj1.y + moveY, vx: v1x, vy: v1y};
//                         objects[j] = {...obj2, x: obj2.x - moveX, y: obj2.y - moveY, vx: v2x, vy: v2y};
//                     } else {
//                         const forceX = repulsionForce * Math.cos(angle);
//                         const forceY = repulsionForce * Math.sin(angle);
//
//                         objects[i] = {
//                             ...obj1,
//                             vx: obj1.vx + (forceX / mass1),
//                             vy: obj1.vy + (forceY / mass1)
//                         };
//                         objects[j] = {
//                             ...obj2,
//                             vx: obj2.vx - (forceX / mass2),
//                             vy: obj2.vy - (forceY / mass2)
//                         };
//                     }
//
//                     const angleBetweenCenters = Math.atan2(dy, dx);
//                     const angleBetweenVelocities = Math.atan2(relativeVY, relativeVX);
//                     const angleDifference = Math.abs(angleBetweenCenters - angleBetweenVelocities);
//
//                     const linearForceComponent = repulsionForce * LINEAR_FORCE_COEFFICIENT;
//                     const rotationalForceComponent = repulsionForce * ROTATIONAL_FORCE_COEFFICIENT;
//
//                     objects[i] = {
//                         ...obj1,
//                         vx: obj1.vx + (linearForceComponent * Math.cos(angle)),
//                         vy: obj1.vy + (linearForceComponent * Math.sin(angle)),
//                         angularVelocity: obj1.angularVelocity + rotationalForceComponent
//                     };
//                     objects[j] = {
//                         ...obj2,
//                         vx: obj2.vx - (linearForceComponent * Math.cos(angle)),
//                         vy: obj2.vy - (linearForceComponent * Math.sin(angle)),
//                         angularVelocity: obj2.angularVelocity - rotationalForceComponent
//                     };
//                 }
//             }
//         }
//         return objects;
//     };
//
//     const applyRandomForce = () => {
//         const randomIndex = Math.floor(Math.random() * NUM_OBJECTS);
//         const randomDirection = Math.random() < 0.5 ? -1 : 1;
//         const force = (window.innerWidth / 5) / 5;
//
//         setObjects(prevObjects =>
//             prevObjects.map((obj, index) => {
//                 if (index === randomIndex) {
//                     return {...obj, vx: force * randomDirection};
//                 }
//                 return obj;
//             })
//         );
//     };
//
//     useEffect(() => {
//         const interval = setInterval(applyRandomForce, 5000);
//         return () => clearInterval(interval);
//     }, []);
//
//     return objects;
// };

import {useEffect, useState} from 'react';

// Основні параметри
const GRAVITY = 0.2; // Зменшено силу гравітації
const HORIZONTAL_GRAVITY = GRAVITY * 0.1; // 10% від вертикальної гравітації
const BOUNCE_FACTOR = 0.2; // Збільшено м'якість у 5 разів

// Параметри хітбоксів та сил
const HITBOX_SCALE = 0.8;
const FORCE_START_DISTANCE = 0.8;
const MAX_FORCE_DISTANCE = 1.0;
const MAX_FORCE = 5.0;
const FORCE_INCREASE_FACTOR = 2.0;

// Коефіцієнти залежності вращальної сили від кута
const ROTATIONAL_FORCE_COEFFICIENT = 0.3;
const LINEAR_FORCE_COEFFICIENT = 1 - ROTATIONAL_FORCE_COEFFICIENT;

export const usePhysicsEngine = (initialObjects, {
    HORIZONTAL_GRAVITY,
    BOUNCE_FACTOR,
    HITBOX_SCALE,
    FORCE_START_DISTANCE,
    MAX_FORCE_DISTANCE,
    MAX_FORCE,
    FORCE_INCREASE_FACTOR,
    HITBOX_SIZE,
    GRAVITY,
    NUM_OBJECTS
}) => {
    const [objects, setObjects] = useState(initialObjects);

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
                const minDistance = (obj1.size + obj2.size) * FORCE_START_DISTANCE;
                const maxDistance = (obj1.size + obj2.size) * HITBOX_SCALE;

                if (distance < maxDistance) {
                    const angle = Math.atan2(dy, dx);
                    const mass1 = obj1.size;
                    const mass2 = obj2.size;
                    const totalMass = mass1 + mass2;

                    const shapeFactors = {
                        circle: 1.0,
                        square: 1.2,
                        triangle: 1.4,
                        pentagon: 1.3,
                        hexagon: 1.25
                    };

                    const shapeFactor = (shapeFactors[obj1.shape] + shapeFactors[obj2.shape]) / 2;
                    const relativeVX = obj1.vx - obj2.vx;
                    const relativeVY = obj1.vy - obj2.vy;
                    const relativeSpeed = Math.sqrt(relativeVX * relativeVX + relativeVY * relativeVY);
                    const penetration = Math.max(0, 1 - (distance / minDistance));
                    const forceFactor = Math.pow((maxDistance - distance) / (maxDistance - minDistance), 2) * shapeFactor;
                    const repulsionForce = forceFactor * relativeSpeed * FORCE_INCREASE_FACTOR;

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

                    // Calculate rotational force
                    const angleBetweenCenters = Math.atan2(dy, dx);
                    const angleBetweenVelocities = Math.atan2(relativeVY, relativeVX);
                    const angleDifference = Math.abs(angleBetweenCenters - angleBetweenVelocities);

                    const linearForceComponent = repulsionForce * LINEAR_FORCE_COEFFICIENT;
                    const rotationalForceComponent = repulsionForce * ROTATIONAL_FORCE_COEFFICIENT;

                    objects[i] = {
                        ...obj1,
                        vx: obj1.vx + (linearForceComponent * Math.cos(angle)),
                        vy: obj1.vy + (linearForceComponent * Math.sin(angle)),
                        angularVelocity: obj1.angularVelocity + rotationalForceComponent
                    };
                    objects[j] = {
                        ...obj2,
                        vx: obj2.vx - (linearForceComponent * Math.cos(angle)),
                        vy: obj2.vy - (linearForceComponent * Math.sin(angle)),
                        angularVelocity: obj2.angularVelocity - rotationalForceComponent
                    };
                }
            }
        }
        return objects;
    };

    const applyRandomForce = () => {
        const randomIndex = Math.floor(Math.random() * objects.length);
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

    return objects;
};