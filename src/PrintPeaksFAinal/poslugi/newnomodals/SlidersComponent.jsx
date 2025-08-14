import React, { useEffect, useState } from 'react';
import './ArtemStyles.css';

const PRESETS = {
  Wide: {
    x: { min: 127,  max: 1000, step: 1, unit: 'мм' },
    y: { min: 127,  max: 4000, step: 1, unit: 'мм' },
  },
  Magnets: {
    x: { min: 50,  max: 600,  step: 1, unit: 'мм' },   // ← заміни під свої
    y: { min: 50,  max: 1000, step: 1, unit: 'мм' },   // ← заміни під свої
  },
  WideFactory: {
    x: { min: 100,  max: 1600, step: 1, unit: 'мм' },   // ← заміни під свої
    y: { min: 100,  max: 10000,step: 1, unit: 'мм' },   // ← заміни під свої
  },
};

function SliderComponent({ size, setSize, type = 'Wide' }) {
  const ranges = PRESETS[type] || PRESETS.Wide;

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  const [x, setX] = useState(clamp(size.x, ranges.x.min, ranges.x.max));
  const [y, setY] = useState(clamp(size.y, ranges.y.min, ranges.y.max));

  const [background1, setBackground1] = useState({});
  const [background2, setBackground2] = useState({});

  const handleChange1 = (e) => setX(parseInt(e.target.value, 10));
  const handleChange2 = (e) => setY(parseInt(e.target.value, 10));

  const commitX = () => {
    const val = clamp(x, ranges.x.min, ranges.x.max);
    setX(val);
    setSize({ x: val, y: size.y });
  };
  const commitY = () => {
    const val = clamp(y, ranges.y.min, ranges.y.max);
    setY(val);
    setSize({ x: size.x, y: val });
  };

  // оновлюємо заливку треку (0..100%) під активні діапазони
  useEffect(() => {
    const xPct = ((x - ranges.x.min) * 100) / (ranges.x.max - ranges.x.min);
    const yPct = ((y - ranges.y.min) * 100) / (ranges.y.max - ranges.y.min);

    setBackground1({
      background: `linear-gradient(to right, #ffa500 ${xPct}%, #ccc ${xPct}%)`,
    });
    setBackground2({
      background: `linear-gradient(to right, #ffa500 ${yPct}%, #ccc ${yPct}%)`,
    });
  }, [x, y, ranges]);

  // якщо зовнішній size або type змінюються — піджимаємо в межі пресету
  useEffect(() => {
    setX(clamp(size.x, ranges.x.min, ranges.x.max));
    setY(clamp(size.y, ranges.y.min, ranges.y.max));
  }, [size.x, size.y, type]);

  return (
    <div className="slider-container" style={{ marginTop: '2vw', marginLeft: '0.2vw' }}>
      <div className="d-flex flex-column" style={{ marginLeft: '2vw', width: '100%' }}>
        <span className="slider-label" style={{ marginLeft: '40vw', width: '100%', opacity: '50%' }}>
          {ranges.x.max} {ranges.x.unit}
        </span>
        <input
          type="range"
          min={ranges.x.min}
          max={ranges.x.max}
          step={ranges.x.step}
          value={x}
          onChange={handleChange1}
          onMouseUp={commitX}
          onTouchEnd={commitX}
          className="custom-slider"
          style={background1}
        />
        <div className="d-flex align-content-between justify-content-between" style={{ opacity: '50%' }}>
          <span className="slider-label">
            {x} {ranges.x.unit}
          </span>
        </div>
      </div>

      <div className="d-flex flex-column" style={{ marginLeft: '2vw', width: '100%' }}>
        <span className="slider-label" style={{ marginLeft: '40vw', width: '100%', opacity: '50%' }}>
          {ranges.y.max} {ranges.y.unit}
        </span>
        <input
          type="range"
          min={ranges.y.min}
          max={ranges.y.max}
          step={ranges.y.step}
          value={y}
          onChange={handleChange2}
          onMouseUp={commitY}
          onTouchEnd={commitY}
          className="custom-slider"
          style={background2}
        />
        <div className="d-flex align-content-between justify-content-between" style={{ opacity: '50%' }}>
          <span className="slider-label">
            {y} {ranges.y.unit}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SliderComponent;
