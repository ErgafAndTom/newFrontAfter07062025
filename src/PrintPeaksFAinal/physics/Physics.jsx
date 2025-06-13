// import React from 'react';
// // import './App.css';
// import {usePhysicsEngine} from './PhysicsEngine';
// import Arena from './Arena';
//
// const OBJECT_SIZE = 150;
// const NUM_OBJECTS = 50;
//
// const GRAVITY = 0.9;
// const HORIZONTAL_GRAVITY = GRAVITY * 0.1;
// const BOUNCE_FACTOR = 0.2;
//
// const HITBOX_SCALE = 0.8;
// const FORCE_START_DISTANCE = 0.8;
// const MAX_FORCE_DISTANCE = 1.0;
// const MAX_FORCE = 5.0;
// const FORCE_INCREASE_FACTOR = 2.0;
// const HITBOX_SIZE = 2;
//
// function Physics() {
//     const initialObjects = Array.from({length: NUM_OBJECTS}, (_, i) => ({
//         id: i,
//         x: Math.random() * window.innerWidth,
//         y: Math.random() * 50,
//         vx: 0,
//         vy: 0,
//         rotation: Math.random() * 360,
//         angularVelocity: 0,
//         size: OBJECT_SIZE + Math.random() * 50,
//         color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
//         bounceFactor: 0.2 + Math.random() * 0.5,
//         shape: ['circle', 'square', 'triangle', 'pentagon', 'hexagon'][Math.floor(Math.random() * 5)],
//         deformation: 0
//     }));
//
//     const objects = usePhysicsEngine(initialObjects, {
//         HORIZONTAL_GRAVITY,
//         GRAVITY,
//         BOUNCE_FACTOR,
//         HITBOX_SCALE,
//         FORCE_START_DISTANCE,
//         MAX_FORCE_DISTANCE,
//         MAX_FORCE,
//         FORCE_INCREASE_FACTOR,
//         HITBOX_SIZE,
//         NUM_OBJECTS
//     });
//
//     return <Arena objects={objects}
//                   HORIZONTAL_GRAVITY={HORIZONTAL_GRAVITY}
//                   BOUNCE_FACTOR={BOUNCE_FACTOR}
//                   HITBOX_SCALE={HITBOX_SCALE}
//                   FORCE_START_DISTANCE={FORCE_START_DISTANCE}
//                   MAX_FORCE_DISTANCE={MAX_FORCE_DISTANCE}
//                   MAX_FORCE={MAX_FORCE}
//                   FORCE_INCREASE_FACTOR={FORCE_INCREASE_FACTOR}
//                   HITBOX_SIZE={HITBOX_SIZE}
//
//     />;
// }
//
// export default Physics;


import React from 'react';
import ReactDOM from 'react-dom';
import Matter from 'matter-js';

// Створюємо контейнер для рендерингу
const containerStyle = {
    width: '800px',
    height: '600px',
    border: '1px solid black',
};

// Створюємо компонент PhysicsEngine
class PhysicsEngine extends React.Component {
    componentDidMount() {
        // Ініціалізуємо Matter.js
        const {Engine, Render, World, Bodies, Events} = Matter;

        // Створюємо engine та render
        const engine = Engine.create();
        const render = Render.create({
            element: this.refs.scene,
            engine: engine,
            options: {
                width: 800,
                height: 600,
                wireframes: false,
            },
        });

        // Створюємо стіни
        World.add(engine.world, [
            Bodies.rectangle(400, 0, 800, 50, {isStatic: true}),
            Bodies.rectangle(400, 600, 800, 50, {isStatic: true}),
            Bodies.rectangle(0, 300, 50, 600, {isStatic: true}),
            Bodies.rectangle(800, 300, 50, 600, {isStatic: true}),
        ]);

        // Створюємо динамічні об'єкти
        const ball = Bodies.circle(400, 100, 30, {density: 0.001, frictionAir: 0.05, restitution: 0.8});
        World.add(engine.world, ball);

        // Запускаємо рендеринг та симуляцію
        Render.run(render);
        Engine.run(engine);

        // Обробка події столкновення
        Events.on(engine, 'collisionStart', (event) => {
            const pairs = event.pairs;
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i];
                console.log('Collision detected between bodies:', pair.bodyA.id, pair.bodyB.id);
            }
        });
    }

    render() {
        return <div ref="scene" style={containerStyle}></div>;
    }
}

// Рендерим компонент
ReactDOM.render(<PhysicsEngine/>, document.getElementById('root'));