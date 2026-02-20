import React, { useEffect, useState } from 'react';
import './ArtemStyles.css';

const PRESETS = {
  Wide: {
    x: { min: 127,  max: 1000, step: 1, unit: 'мм' },
    y: { min: 127,  max: 4000, step: 1, unit: 'мм' },
  },
  Magnets: {
    x: { min: 50,  max: 600,  step: 1, unit: 'мм' },
    y: { min: 50,  max: 1000, step: 1, unit: 'мм' },
  },
  WideFactory: {
    x: { min: 100,  max: 1600, step: 1, unit: 'мм' },
    y: { min: 100,  max: 10000,step: 1, unit: 'мм' },
  },
};

function SliderComponent({ size, setSize, type = 'Wide' }) {
  const ranges = PRESETS[type] || PRESETS.Wide;

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  const [x, setX] = useState(clamp(size.x, ranges.x.min, ranges.x.max));
  const [y, setY] = useState(clamp(size.y, ranges.y.min, ranges.y.max));

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

  const xPct = ((x - ranges.x.min) * 100) / (ranges.x.max - ranges.x.min);
  const yPct = ((y - ranges.y.min) * 100) / (ranges.y.max - ranges.y.min);

  useEffect(() => {
    setX(clamp(size.x, ranges.x.min, ranges.x.max));
    setY(clamp(size.y, ranges.y.min, ranges.y.max));
  }, [size.x, size.y, type]);

  return (
    <div className="sc-sliders">
      <div className="sc-slider-row">
        <span className="sc-slider-max">ШИРИНА</span>
        <input
          type="range"
          min={ranges.x.min}
          max={ranges.x.max}
          step={ranges.x.step}
          value={x}
          onChange={handleChange1}
          onMouseUp={commitX}
          onTouchEnd={commitX}
          className="sc-slider"
          style={{
            background: `linear-gradient(to right, var(--adminblue) ${xPct}%, var(--adminfonelement) ${xPct}%)`,
          }}
        />
        <div className="sc-slider-labels">
          <span className="sc-slider-max">{ranges.x.max} {ranges.x.unit}</span>
        </div>
      </div>

      <div className="sc-slider-row">
        <span className="sc-slider-max">ВИСОТА</span>
        <input
          type="range"
          min={ranges.y.min}
          max={ranges.y.max}
          step={ranges.y.step}
          value={y}
          onChange={handleChange2}
          onMouseUp={commitY}
          onTouchEnd={commitY}
          className="sc-slider"
          style={{
            background: `linear-gradient(to right, var(--adminblue) ${yPct}%, var(--adminfonelement) ${yPct}%)`,
          }}
        />
        <div className="sc-slider-labels">
          <span className="sc-slider-max">{ranges.y.max} {ranges.y.unit}</span>
        </div>
      </div>
    </div>
  );
}

export default SliderComponent;
