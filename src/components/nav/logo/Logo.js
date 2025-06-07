import React, {useState, useEffect, useRef} from "react";

// Цей компонент демонструє, як сила гравітації (gForce) впливає на кожен div.
// Ми також додаємо:
// 1) Неможливість "вилітати" за межі контейнера (бордера).
// 2) Ефект "м'якого матеріалу": при зіткненні з нижньою чи верхньою межею
//    елемент "деформується", але не руйнується (проста імітація пружного відскоку).
//
// Логіка:
//  - Кожен символ має позицію та швидкість.
//  - velocity += gForce * deltaTime
//  - position += velocity * deltaTime
//  - Якщо символ досягає межі (верх або низ контейнера), відбувається відскок.
//  - При зіткненні ми зменшуємо швидкість і додаємо легку "деформацію" через scale.

const Logo = () => {
    // Користувацьке прискорення gForce.
    const [gForce, setGForce] = useState(10);

    // Текст, який хочемо відобразити
    const text = "PRINT PEAKS";
    const characters = text.split("");

    // Кожен символ матиме:
    //   position: поточна вертикальна позиція
    //   velocity: поточна швидкість по вертикалі
    //   isColliding: показує, чи був зіткнений у цьому кадрі
    const [charStates, setCharStates] = useState(characters.map(() => ({
        position: 0,
        velocity: 0,
        isColliding: false
    })));

    // Зберігаємо попередній час кадру
    const previousTimestampRef = useRef(null);

    // Висота контейнера та приблизна висота кожного символу
    // (для демо використаємо фіксоване значення 20).
    const containerHeight = 200;
    const charHeight = 50;

    // Функція обробки введення gForce
    const handleChange = (event) => {
        const inputValue = parseFloat(event.target.value);
        if (!isNaN(inputValue)) {
            setGForce(inputValue);
        }
    };

    useEffect(() => {
        let animationFrameId;

        const animate = (timestamp) => {
            if (previousTimestampRef.current === null) {
                // Перший кадр
                previousTimestampRef.current = timestamp;
            }
            const deltaTime = (timestamp - previousTimestampRef.current) / 1000;
            previousTimestampRef.current = timestamp;

            setCharStates((prevStates) => {
                return prevStates.map((charState) => {
                    // Спочатку оновимо швидкість та позицію
                    let newVelocity = charState.velocity + gForce * deltaTime;
                    let newPosition = charState.position + newVelocity * deltaTime;
                    let isColliding = false;

                    // Перевірка зіткнення з "підлогою" (нижньою межею)
                    if (newPosition + charHeight > containerHeight) {
                        newPosition = containerHeight - charHeight;
                        newVelocity = -newVelocity * 0.7; // Відбиваємось із втратою швидкості
                        isColliding = true;
                    }

                    // Перевірка зіткнення з верхньою межею
                    if (newPosition < 0) {
                        newPosition = 0;
                        newVelocity = -newVelocity * 0.7;
                        isColliding = true;
                    }

                    return {
                        position: newPosition, velocity: newVelocity, isColliding,
                    };
                });
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        // Очищення анімації при демонтовані
        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [gForce]);


    // setCharStates((prevStates) => {
    //     return prevStates.map((charState) => {
    //         // Спочатку оновимо швидкість та позицію
    //         let newVelocity = charState.velocity + gForce * 2;
    //         let newPosition = charState.position + newVelocity * 2;

    //         let isColliding = false;
    //         let deformation = 1; // Коэффициент деформации для эффекта мягкости
    //
    //         // Перевірка зіткнення з "підлогою" (нижньою межею)
    //         if (newPosition + charHeight > containerHeight) {
    //             newPosition = containerHeight - charHeight;
    //             newVelocity = -newVelocity * 0.7; // Відбиваємось із втратою швидкості
    //             isColliding = true;
    //             deformation = 0.8; // Добавляем мягкость при столкновении с "підлогою"
    //         }
    //
    //         // Перевірка зіткнення з верхньою межею
    //         if (newPosition < 0) {
    //             newPosition = 0;
    //             newVelocity = -newVelocity * 0.7;
    //             isColliding = true;
    //             deformation = 0.8; // Добавляем мягкость при столкновении с "стелею"
    //         }
    //
    //         return {
    //             position: newPosition,
    //             velocity: newVelocity,
    //             isColliding,
    //             deformation,
    //         };
    //     });
    // });

    // return (
    //     <div>
    //         Анекдот про Штірліца: Штірліц зайшов у темну кімнату. Світло ввімкнулося автоматично. "Все ясно", - подумав
    //         Штірліц.
    //     </div>
    // );

    return (<div style={{margin: "20px", fontFamily: "sans-serif"}}>
            <label style={{display: "block", marginBottom: "10px"}}>
                Введіть gForce (прискорення):
                <input
                    type=""
                    step="0.1"
                    onChange={handleChange}
                    defaultValue={10}
                    style={{marginLeft: "10px"}}
                />
            </label>

            <div
                className="logo-container"
                style={{
                    position: "relative", height: `${containerHeight}px`, border: "1px solid #ccc", overflow: "hidden",
                }}
            >
                {characters.map((char, index) => {
                    const {position, isColliding} = charStates[index];

                    // При зіткненні трохи "стискаємо" символ по вертикалі, імітуючи м'якість.
                    // Якщо немає зіткнення, повертаємо нормальний scale.
                    const transformScale = isColliding ? "scale(1.1, 0.9)" : "scale(1, 1)";

                    return (<div
                            className="character-container"
                            key={index}
                            style={{
                                position: "absolute",
                                left: `${index * 20}px`,
                                top: `${position}px`,
                                transition: "top 0s", // вимикаємо згладжування у css, все робимо в rAF
                                transform: transformScale,
                                transformOrigin: "center bottom", // точка деформації
                            }}
                        >
              <span className="character" style={{display: "inline-block"}}>
                {char}
              </span>
                            <div className="line"></div>
                        </div>);
                })}
            </div>
        </div>
    );
};

export default Logo;
