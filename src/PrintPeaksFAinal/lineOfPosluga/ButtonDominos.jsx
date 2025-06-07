import React, {useState} from 'react';

// SVG для одной кости домино с точным расположением точек
// const DominoTile = ({ dots, highlighted, selectedIndex, index }) => {
//     const dotPositions = {
//         0: [],
//         1: [[2, 2]],
//         2: [[1, 1], [3, 3]],
//         3: [[1, 1], [2, 2], [3, 3]],
//         4: [[1, 1], [1, 3], [3, 1], [3, 3]],
//         5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
//         6: [[1, 1], [1, 3], [2, 1], [2, 3], [3, 1], [3, 3]]
//     };
//
//     const renderDots = (positions) => {
//         return positions.map(([cx, cy], i) => (
//             <circle key={i} cx={cx * 15} cy={cy * 15} r="3" fill="black" />
//         ));
//     };
//
//     return (
//         <svg width="40" height="110" viewBox="0 0 40 110" style={{
//             border: '1px solid black',
//             margin: '5px',
//             // backgroundColor: highlighted ? 'yellow' : 'white',
//             backgroundColor: selectedIndex === index ? 'orange' : 'transparent',
//             transform: "scaleY(0.6)"
//         }}>
//             <rect width="40" height="110" rx="2" ry="2" fill="transparent" stroke="black" />
//             {/*<line x1="0" y1="40" x2="40" y2="40" stroke="black" />*/}
//             {renderDots(dotPositions[dots[0]])}
//             {renderDots(dotPositions[dots[1]].map(([cx, cy]) => [cx, cy + 4]))}
//         </svg>
//     );
// };

// Компонент для отображения ряда домино костей
const DominoRow = () => {
    const tiles = [
        { dots: [0, 1], highlighted: true },
        { dots: [1, 1], highlighted: false },
        { dots: [1, 2], highlighted: false },
        { dots: [2, 2], highlighted: false },
        { dots: [2, 3], highlighted: false },
        { dots: [3, 3], highlighted: false },
        { dots: [3, 4], highlighted: false },
        { dots: [4, 4], highlighted: false }
    ];
    const dotPositions = {
        0: [],
        1: [[2, 2]],
        2: [[1, 1], [3, 3]],
        3: [[1, 1], [2, 2], [3, 3]],
        4: [[1, 1], [1, 3], [3, 1], [3, 3]],
        5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
        6: [[1, 1], [1, 3], [2, 1], [2, 3], [3, 1], [3, 3]]
    };

    const renderDots = (positions) => {
        return positions.map(([cx, cy], i) => (
            <circle key={i} cx={cx * 15} cy={cy * 12} r="3" fill="black" />
        ));
    };
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleToggle = (index) => {
        setSelectedIndex(index);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            {tiles.map((tile, index) => (
                // <DominoTile onClick={() => handleToggle(index)} key={index} selectedIndex={selectedIndex} dots={tile.dots} highlighted={tile.highlighted} />


                <svg key={index} onClick={() => handleToggle(index)} width="40" height="100" viewBox="0 0 40 100" style={{
                    border: selectedIndex === index ? '0.1vw solid black' : '0.1vw solid grey',
                    borderRadius: '0.627vw',
                    // padding: '0.8vh 1.273vw',
                    margin: '0.323vw',
                    // backgroundColor: highlighted ? 'yellow' : 'white',
                    backgroundColor: selectedIndex === index ? 'orange' : 'transparent',
                    transition: "all 0.3s ease",
                    // transform: "scaleX(1.2) scaleY(0.6)"
                }}>
                    <rect width="40" height="100" rx="2" ry="2" fill="transparent" stroke="black"/>
                    {/*<line x1="0" y1="40" x2="40" y2="40" stroke="black" />*/}
                    {renderDots(dotPositions[tile.dots[0]])}
                    {renderDots(dotPositions[tile.dots[1]].map(([cx, cy]) => [cx, cy + 4]))}
                </svg>

            ))}
        </div>
    );
};

export default DominoRow;

