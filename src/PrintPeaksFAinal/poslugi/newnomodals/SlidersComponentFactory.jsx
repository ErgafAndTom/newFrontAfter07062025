import React, {useEffect, useState} from 'react';
import './ArtemStyles.css';

function SliderComponent({size, setSize}) {
    const [x, setX] = useState(size.x);
    const [y, setY] = useState(size.y);
    const [background1, setBackground1] = useState({

    });
    const [background2, setBackground2] = useState({

    });

    const handleChange1 = (event) => {
      // console.log(event.target.value);
      setX(parseInt(event.target.value, 10));
    };

    const handleChange2 = (event) => {
      // console.log(event.target.value);
        setY(parseInt(event.target.value, 10));
    };

    const handleMouseUp1 = () => {
        setSize({
            x: x,
            y: size.y
        })
    };
    const handleMouseUp2 = () => {
        setSize({
            x: size.x,
            y: y
        })
    };
    useEffect(() => {
        setBackground1({
            background: `linear-gradient(to right, #ffa500 ${x / 10}%, #ccc ${x / 10}%)`
        })
        setBackground2({
            background: `linear-gradient(to right, #ffa500 ${y / 30}%, #ccc ${y / 30}%)`
        })
    }, [x, y]);

    useEffect(() => {
        setX(size.x)
        setY(size.y)
    }, [size]);

    return (
        // <div>
        //     <input
        //         type="range"
        //         min="0"
        //         max="100"
        //         value={value}
        //         onChange={handleChange}
        //     />
        //     <li>Значення: {value}</li>
        // </div>
        <div className="slider-container"
             style={{
                 marginTop: "2vw",
                 marginLeft: "0.2vw",
        }}
        >
            <div className="d-flex flex-column" style={{marginLeft: "2vw", width: "100%"}}>

                <span className="slider-label" style={{marginLeft: "40vw", width: "100%", opacity:"50%"}}>1600 мм</span>
                <input
                    type="range"
                    min={45}
                    max={1600}
                    value={x}
                    onChange={handleChange1}
                    onMouseUp={handleMouseUp1} // Встановлення остаточного значення при відпусканні миші
                    onTouchEnd={handleMouseUp1}
                    className="custom-slider"
                    style={background1}
                />

                <div className="d-flex align-content-between justify-content-between" style={{opacity:"50%"}}>
                    <span className="slider-label">{x} мм</span>
                </div>
            </div>

            <div className="d-flex flex-column" style={{marginLeft: "2vw", width: "100%"}}>
                <span className="slider-label" style={{marginLeft: "40vw", width: "100%", opacity:"50%"}}>5000 мм</span>
                <input
                    type="range"
                    min={45}
                    max={5000}
                    value={y}
                    onChange={handleChange2}
                    onMouseUp={handleMouseUp2} // Встановлення остаточного значення при відпусканні миші
                    onTouchEnd={handleMouseUp2}
                    className="custom-slider"
                    style={background2}
                />
                <div className="d-flex align-content-between justify-content-between" style={{opacity:"50%"}}>
                    <span className="slider-label">{y} мм</span>

                </div>
            </div>
        </div>
    );
}

export default SliderComponent;
