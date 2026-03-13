import React, {useEffect, useRef, useState} from 'react';

/* ── Animated counter hook ── */
const useAnimatedValue = (target, duration = 600) => {
    const [display, setDisplay] = useState(0);
    const rafRef = useRef(null);
    const startRef = useRef({time: null, value: 0});

    useEffect(() => {
        const startVal = startRef.current.value;
        startRef.current.time = performance.now();

        const animate = (now) => {
            const elapsed = now - startRef.current.time;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startVal + (target - startVal) * eased;
            setDisplay(current);
            startRef.current.value = current;
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [target, duration]);

    return display;
};

/* ── Mini sparkline SVG ── */
const MiniSparkline = ({data, color = '#0e935b'}) => {
    if (!data || data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 120;
    const h = 36;
    const step = w / (data.length - 1);

    const points = data.map((v, i) =>
        `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`
    ).join(' ');

    // Area fill path
    const areaPath = `M0,${h} ` +
        data.map((v, i) =>
            `L${i * step},${h - ((v - min) / range) * (h - 4) - 2}`
        ).join(' ') +
        ` L${w},${h} Z`;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"
             style={{width: '100%', height: '100%'}}>
            <path d={areaPath} fill={color} opacity="0.3"/>
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
};

const KpiCard = ({label, value, suffix = 'грн', change = null, color, subText, sparkData, sparkColor}) => {
    const animatedValue = useAnimatedValue(typeof value === 'number' ? value : 0);
    const changeColor = change > 0 ? 'var(--admingreen, #0e935b)'
        : change < 0 ? 'var(--adminred, #ee3c23)'
            : 'var(--admingrey, #666666)';
    const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '';
    const trendClass = change > 0 ? 'trend-up' : change < 0 ? 'trend-down' : 'trend-flat';

    const displayValue = typeof value === 'number'
        ? animatedValue.toLocaleString('uk-UA', {maximumFractionDigits: suffix === '%' ? 1 : 0})
        : value;

    return (
        <div className={`dsh-kpi-card ${trendClass}`}>
            <div className="dsh-kpi-label">{label}</div>
            <div className="dsh-kpi-value-row">
                <span className="dsh-kpi-value" style={color ? {color} : undefined}>
                    {displayValue}
                </span>
                {suffix && <span className="dsh-kpi-suffix">{suffix}</span>}
            </div>
            {change !== null && change !== undefined && (
                <div className="dsh-kpi-change" style={{color: changeColor}}>
                    {arrow} {Math.abs(change).toFixed(1)}% vs попередній
                </div>
            )}
            {subText && <div className="dsh-kpi-sub">{subText}</div>}
            {sparkData && sparkData.length >= 2 && (
                <div className="dsh-kpi-spark">
                    <MiniSparkline data={sparkData} color={sparkColor || '#0e935b'}/>
                </div>
            )}
        </div>
    );
};

export default KpiCard;
