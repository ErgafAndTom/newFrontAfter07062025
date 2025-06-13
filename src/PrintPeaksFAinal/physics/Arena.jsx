// import React from 'react';
//
// const HITBOX_SIZE = 2;
//
// const createWall = (left, top, width, height) => (
//     <div
//         style={{
//             position: 'absolute',
//             left,
//             top,
//             width,
//             height,
//             backgroundColor: 'black'
//         }}
//     />
// );
//
// export const Arena = ({
//                           objects,
//                           BOUNCE_FACTOR,
//                           FORCE_INCREASE_FACTOR,
//                           HITBOX_SCALE,
//                           MAX_FORCE,
//                           HORIZONTAL_GRAVITY,
//                           MAX_FORCE_DISTANCE,
//                           FORCE_START_DISTANCE
//                       }) => {
//     return (
//         <div className="App">
//             {objects.map(obj => (
//                 <>
//                     <div
//                         key={obj.id}
//                         style={{
//                             position: 'absolute',
//                             width: `${obj.size * (1 + obj.deformation)}px`,
//                             height: `${obj.size * (1 - obj.deformation * 0.5)}px`,
//                             backgroundColor: obj.color,
//                             borderRadius: obj.shape === 'circle' ? '50%' : 0,
//                             clipPath: obj.shape === 'triangle' ? 'polygon(50% 0%, 100% 100%, 0% 100%)' :
//                                 obj.shape === 'pentagon' ? 'polygon(50% 0%, 92% 38%, 100% 76%, 40% 80%, 0% 76%, 8% 38%)' :
//                                     obj.shape === 'hexagon' ? 'polygon(50% 0%, 100% 25%, 92% 75%, 50% 100%, 8% 75%, 0% 25%)' : '',
//                             left: obj.x,
//                             top: obj.y,
//                             transform: `rotate(${obj.rotation}deg)`,
//                             transition: 'transform 0.1s ease-out'
//                         }}
//                     />
//                     {Array.from({length: obj.shape === 'circle' ? 36 : 5}, (_, i) => {
//                         const angle = (i / (obj.shape === 'circle' ? 36 : 5)) * Math.PI * 2;
//                         const x = obj.x + (obj.size * HITBOX_SCALE * Math.cos(angle));
//                         const y = obj.y + (obj.size * HITBOX_SCALE * Math.sin(angle));
//                         return (
//                             <div
//                                 key={i}
//                                 style={{
//                                     position: 'absolute',
//                                     width: `${HITBOX_SIZE}px`,
//                                     height: `${HITBOX_SIZE}px`,
//                                     backgroundColor: obj.color,
//                                     borderRadius: '50%',
//                                     left: x,
//                                     top: y,
//                                     transform: `rotate(${obj.rotation}deg)`,
//                                     transition: 'transform 0.1s ease-out'
//                                 }}
//                             />
//                         );
//                     })}
//                 </>
//             ))}
//             <div
//                 style={{
//                     position: 'absolute',
//                     bottom: 0,
//                     width: '100%',
//                     height: '2px',
//                     backgroundColor: 'black'
//                 }}
//             />
//             {createWall(0, 0, '10px', window.innerHeight)} {/* Ліва стінка */}
//             {createWall(window.innerWidth - 2, 0, '2px', window.innerHeight)} {/* Права стінка */}
//         </div>
//     );
// };


import React from 'react';

const HITBOX_SIZE = 2; // Розмір хітбоксів у пікселях

const Arena = ({
                   objects, BOUNCE_FACTOR,
                   FORCE_INCREASE_FACTOR,
                   HITBOX_SCALE,
                   MAX_FORCE,
                   HORIZONTAL_GRAVITY,
                   MAX_FORCE_DISTANCE,
                   FORCE_START_DISTANCE
               }) => {
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
                <>
                    <div
                        key={obj.id}
                        style={{
                            position: 'absolute',
                            width: `${obj.size * (1 + obj.deformation)}px`,
                            height: `${obj.size * (1 - obj.deformation * 0.5)}px`,
                            backgroundColor: obj.color,
                            borderRadius: obj.shape === 'circle' ? '50%' : 0,
                            clipPath: obj.shape === 'triangle' ? 'polygon(50% 0%, 100% 100%, 0% 100%)' :
                                obj.shape === 'pentagon' ? 'polygon(50% 0%, 92% 38%, 100% 76%, 40% 80%, 0% 76%, 8% 38%)' :
                                    obj.shape === 'hexagon' ? 'polygon(50% 0%, 100% 25%, 92% 75%, 50% 100%, 8% 75%, 0% 25%)' : '',
                            left: obj.x,
                            top: obj.y,
                            transform: `rotate(${obj.rotation}deg)`,
                            transition: 'transform 0.1s ease-out'
                        }}
                    />
                    {/* Хітбокси */}
                    {Array.from({length: obj.shape === 'circle' ? 36 : 5}, (_, i) => {
                        const angle = (i / (obj.shape === 'circle' ? 36 : 5)) * Math.PI * 2;
                        const x = obj.x + (obj.size * HITBOX_SCALE * Math.cos(angle));
                        const y = obj.y + (obj.size * HITBOX_SCALE * Math.sin(angle));
                        return (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    width: `${HITBOX_SIZE}px`,
                                    height: `${HITBOX_SIZE}px`,
                                    backgroundColor: obj.color,
                                    borderRadius: '50%',
                                    left: x,
                                    top: y,
                                    transform: `rotate(${obj.rotation}deg)`,
                                    transition: 'transform 0.1s ease-out'
                                }}
                            />
                        );
                    })}
                </>
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
};

export default Arena;