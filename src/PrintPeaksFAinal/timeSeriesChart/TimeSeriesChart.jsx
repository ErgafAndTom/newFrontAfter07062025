import React, { useEffect, useRef, useState } from "react";

const TimeSeriesChart = ({ data }) => {
    const canvasRef = useRef(null);
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [hoverX, setHoverX] = useState(null);
    const [hoverY, setHoverY] = useState(null);
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, value: "", time: "" });

    const statusColors = {
        "0": "#ffffff",
        "1": "#8b4513",
        "2": "#3c60a6",
        "3": "#f075aa",
        "4": "#008249"
    };
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const resolutionX = 5;
        const resolutionY = 10;
        const fontStyle = "inter";
        const fontSize = "0.8vh";

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const graphWidth = width - 2 * padding;
        const graphHeight = height - 2 * padding;

        const times = data.map((point) => new Date(point.time).getTime());
        const values = data.map((point) => point.value);

        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);

        const normalizeX = (time) => ((time - minTime) / (maxTime - minTime)) * graphWidth + padding;
        const normalizeY = (value) => height - padding - ((value - minValue) / (maxValue - minValue)) * graphHeight;

        // Draw grid
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 1;

        for (let i = 0; i <= resolutionX; i++) {
            const x = padding + (i / resolutionX) * graphWidth;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }

        for (let i = 0; i <= resolutionX; i++) {
            const y = height - padding - (i / resolutionX) * graphHeight;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Draw line chart
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 0.1;
        ctx.beginPath();
        ctx.moveTo(normalizeX(times[0]), normalizeY(values[0]));
        for (let i = 1; i < data.length; i++) {
            ctx.lineTo(normalizeX(times[i]), normalizeY(values[i]));
        }
        ctx.stroke();
        ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw points
        ctx.fillStyle = "#ff0000";
        data.forEach((point, i) => {
            ctx.beginPath();
            ctx.arc(normalizeX(times[i]), normalizeY(point.value), 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw x-axis labels
        ctx.fillStyle = "#000";
        ctx.font = "1vh inter";
        for (let i = 0; i <= resolutionX; i++) {
            const time = minTime + (i / resolutionX) * (maxTime - minTime);
            const date = new Date(time);
            let label = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            if(date.toLocaleDateString() === "Invalid Date")
                label = `∞`;
            ctx.fillText(label, padding + (i / resolutionX) * graphWidth - 10, height - 5);
            ctx.font = `${fontSize} ${fontStyle}`;
        }

        // Draw y-axis labels
        for (let i = 0; i <= resolutionX; i++) {
            const value = minValue + (i / resolutionX) * (maxValue - minValue);
            if(value.toFixed(2) === "NaN"){
                ctx.fillText("∞", resolutionX, height - padding - (i / resolutionX) * graphHeight + 3)
            } else {
                ctx.fillText(value.toFixed(2), resolutionX, height - padding - (i / resolutionX) * graphHeight + 3);
            }
        }

        // Draw vertical hover line
        if (hoverX !== null) {
            ctx.strokeStyle = "#888";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(hoverX, padding);
            ctx.lineTo(hoverX, height - padding);
            ctx.stroke();

            // Display time at bottom
            const timeAtX = minTime + ((hoverX - padding) / graphWidth) * (maxTime - minTime);
            const date = new Date(timeAtX);
            let label = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            if(date.toLocaleDateString() === "Invalid Date")
                label = `1 / ∞`;
            ctx.fillStyle = "#000";
            ctx.font = `${fontSize} ${fontStyle}`;
            ctx.fillText(label, hoverX - 40, height - 20);
        }

        // Draw horizontal hover line
        if (hoverX !== null && hoverY !== null) {
            ctx.strokeStyle = "#888";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding, hoverY);
            ctx.lineTo(width - padding, hoverY);
            ctx.stroke();

            // Display value at the left
            const valueAtY = minValue + ((height - padding - hoverY) / graphHeight) * (maxValue - minValue);
            ctx.fillStyle = "#000000";
            // ctx.fillText(valueAtY.toFixed(2), 5, hoverY + 5);
            if(valueAtY.toFixed(2) === "NaN"){
                ctx.fillText("1 / ∞",  5, hoverY + 5)
            } else {
                ctx.fillText(valueAtY.toFixed(2),  15, hoverY + 5);
            }

            ctx.font = `${fontSize} ${fontStyle}`;
        }

        ctx.fillStyle = "#ff0000";
        data.forEach((point, i) => {
            const x = normalizeX(times[i]);
            const y = normalizeY(point.value);
            ctx.fillStyle = statusColors[point.status] || "#000000";
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();

            // Ensure points remain above the hover line and show value on hover
            if (hoverX !== null && Math.abs(hoverX - x) < 5) {
                ctx.fillStyle = "#000";
                ctx.fillText(point.value.toFixed(2), x - 10, y - 10);
                ctx.fillStyle = "#ff0000";
                ctx.font = `${fontSize} ${fontStyle}`;
            }
        });
    }, [data, hoveredPoint, hoverX]);

    const handleMouseMove = (event) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;

        if (mouseX >= padding && mouseX <= width - padding) {
            setHoverX(mouseX);
        } else {
            setHoverX(null);
        }
        if (mouseY >= padding && mouseY <= height - padding) {
            setHoverY(mouseY);
        } else {
            setHoverY(null);
        }
    };

    return <canvas style={{margin: "0"}} ref={canvasRef} width={700} height={330} onMouseMove={handleMouseMove} />;
};

export default TimeSeriesChart;
