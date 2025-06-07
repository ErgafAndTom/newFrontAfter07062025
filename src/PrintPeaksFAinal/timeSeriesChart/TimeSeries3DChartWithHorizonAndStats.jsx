// index.js
import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";

// ========== Базовые функции для матриц 4x4 ==========
function createIdentityMatrix() {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
}

function createPerspectiveMatrix(fov, aspect, near, far) {
    const top = near * Math.tan((fov * Math.PI) / 360);
    const bottom = -top;
    const right = top * aspect;
    const left = -right;

    const a = (2 * near) / (right - left);
    const b = (2 * near) / (top - bottom);
    const c = (right + left) / (right - left);
    const d = (top + bottom) / (top - bottom);
    const e = -(far + near) / (far - near);
    const f = -(2 * far * near) / (far - near);

    return [
        a,  0,  c,  0,
        0,  b,  d,  0,
        0,  0,  e,  f,
        0,  0, -1,  0
    ];
}

function multiplyMatrix(m1, m2) {
    const out = new Array(16).fill(0);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let sum = 0;
            for (let k = 0; k < 4; k++) {
                sum += m1[i * 4 + k] * m2[k * 4 + j];
            }
            out[i * 4 + j] = sum;
        }
    }
    return out;
}

function createTranslationMatrix(tx, ty, tz) {
    const m = createIdentityMatrix();
    m[12] = tx;
    m[13] = ty;
    m[14] = tz;
    return m;
}

function createRotationXMatrix(angleRad) {
    const c = Math.cos(angleRad);
    const s = Math.sin(angleRad);
    return [
        1, 0,  0, 0,
        0, c, -s, 0,
        0, s,  c, 0,
        0, 0,  0, 1
    ];
}

function createRotationYMatrix(angleRad) {
    const c = Math.cos(angleRad);
    const s = Math.sin(angleRad);
    return [
        c,  0, s, 0,
        0,  1, 0, 0,
        -s, 0, c, 0,
        0,  0, 0, 1
    ];
}

function createRotationZMatrix(angleRad) {
    const c = Math.cos(angleRad);
    const s = Math.sin(angleRad);
    return [
        c, -s, 0, 0,
        s,  c, 0, 0,
        0,  0, 1, 0,
        0,  0, 0, 1
    ];
}

// ========== Шейдеры ==========
const vertexShaderSource = `
  attribute vec3 aPosition;
  attribute vec3 aColor;
  uniform mat4 uMVPMatrix;
  varying vec3 vColor;

  void main() {
    gl_Position = uMVPMatrix * vec4(aPosition, 1.0);
    gl_PointSize = 8.0;
    vColor = aColor;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  varying vec3 vColor;

  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Ошибка компиляции шейдера:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// ========== Функция для генерации "горизонта" (базовая площина) ==========
function buildHorizon(subdiv = 10, size = 50, yLevel = -0.2) {
    const colorsArr = [
        [0.0, 0.6, 0.0],   // зеленый
        [1.0, 1.0, 1.0],   // белый
        [0.6, 0.3, 0.0],   // коричневый
        [0.0, 0.0, 1.0]    // синий
    ];

    const vertices = [];
    const half = size / 2;
    const step = size / subdiv;

    for (let row = 0; row < subdiv; row++) {
        for (let col = 0; col < subdiv; col++) {
            const x1 = -half + col * step;
            const z1 = -half + row * step;
            const x2 = x1 + step;
            const z2 = z1 + step;

            // Случайный цвет
            const color = colorsArr[Math.floor(Math.random() * colorsArr.length)];

            // Треугольник 1
            vertices.push(
                x1, yLevel, z1, color[0], color[1], color[2],
                x2, yLevel, z1, color[0], color[1], color[2],
                x2, yLevel, z2, color[0], color[1], color[2]
            );
            // Треугольник 2
            vertices.push(
                x1, yLevel, z1, color[0], color[1], color[2],
                x2, yLevel, z2, color[0], color[1], color[2],
                x1, yLevel, z2, color[0], color[1], color[2]
            );
        }
    }

    return new Float32Array(vertices);
}

// ========== Функция для формирования данных линии ==========
function buildLineData(data) {
    if (!data || data.length === 0) {
        console.warn("Предупреждение: передан пустой массив данных для линии.");
        return new Float32Array([]);
    }

    const times = data.map(d => new Date(d.time).getTime());
    const values = data.map(d => d.value);

    let minTime = Math.min(...times);
    let maxTime = Math.max(...times);
    let minValue = Math.min(...values);
    let maxValue = Math.max(...values);

    if (minTime === maxTime) {
        maxTime = minTime + 1;
    }
    if (minValue === maxValue) {
        maxValue = minValue + 1;
    }

    const vertices = [];
    for (let i = 0; i < data.length; i++) {
        const normT = (times[i] - minTime) / (maxTime - minTime);
        const normV = (values[i] - minValue) / (maxValue - minValue);

        // Приводим координаты к диапазону [-1, 1]
        const xPos = normT * 2 - 1;
        const yPos = normV * 2 - 1;
        const zPos = 0.0;

        // Фиксированный красный цвет для линии
        const r = 1.0;
        const g = 0.0;
        const b = 0.0;

        vertices.push(xPos, yPos, zPos, r, g, b);
    }

    return new Float32Array(vertices);
}

// ========== Компонент TimeSeries3DChartWithHorizonAndStats ==========
const TimeSeries3DChartWithHorizonAndStats = ({ data }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef(null);

    // Позиция и повороты камеры
    const posRef = useRef({ x: 0, y: 0, z: -2 });
    const rotRef = useRef({ x: 0, y: 0, z: 0 });

    // Статистика для отображения
    const [stats, setStats] = useState({
        fps: 0,
        mem: "N/A",
        device: navigator.userAgent || "Unknown device",
        posX: 0,
        posY: 0,
        posZ: -2,
        rotX: 0,
        rotY: 0,
        rotZ: 0
    });

    // Рефы для подсчёта кадров
    const frameCountRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const fpsIntervalRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas.getContext("webgl");
        if (!gl) {
            console.error("WebGL не поддерживается этим браузером.");
            return;
        }

        // Компиляция шейдеров и создание программы
        const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Ошибка линковки шейдерной программы:", gl.getProgramInfoLog(program));
            return;
        }
        gl.useProgram(program);

        // ===== Подготовка вершинных данных для горизонта =====
        const horizonData = buildHorizon(10, 10, -0.7);
        const horizonBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, horizonBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, horizonData, gl.STATIC_DRAW);
        const horizonVertexCount = horizonData.length / 6;

        // ===== Подготовка данных для линии =====
        const lineData = buildLineData(data);
        const lineBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, lineData, gl.STATIC_DRAW);
        const lineVertexCount = lineData.length / 6;

        // Получаем локации атрибутов и uniform-переменной
        const aPositionLocation = gl.getAttribLocation(program, "aPosition");
        const aColorLocation = gl.getAttribLocation(program, "aColor");
        const uMVPMatrixLocation = gl.getUniformLocation(program, "uMVPMatrix");

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.enable(gl.DEPTH_TEST);

        // Устанавливаем цвет фона (голубое небо)
        gl.clearColor(0.5, 0.8, 1.0, 1.0);

        const aspect = canvas.width / canvas.height;
        const projectionMatrix = createPerspectiveMatrix(45, aspect, 0.1, 100.0);

        function render() {
            frameCountRef.current += 1;

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Матрица модели-вида: смещение и повороты
            let modelView = createIdentityMatrix();
            modelView = multiplyMatrix(modelView, createTranslationMatrix(posRef.current.x, posRef.current.y, posRef.current.z));
            modelView = multiplyMatrix(modelView, createRotationXMatrix(rotRef.current.x));
            modelView = multiplyMatrix(modelView, createRotationYMatrix(rotRef.current.y));
            modelView = multiplyMatrix(modelView, createRotationZMatrix(rotRef.current.z));

            const mvpMatrix = multiplyMatrix(projectionMatrix, modelView);
            gl.uniformMatrix4fv(uMVPMatrixLocation, false, new Float32Array(mvpMatrix));

            // Рисуем горизонт (треугольники)
            gl.bindBuffer(gl.ARRAY_BUFFER, horizonBuffer);
            gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 6 * 4, 0);
            gl.enableVertexAttribArray(aPositionLocation);
            gl.vertexAttribPointer(aColorLocation, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
            gl.enableVertexAttribArray(aColorLocation);
            gl.drawArrays(gl.TRIANGLES, 0, horizonVertexCount);

            // Рисуем линию (LINE_STRIP)
            gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
            gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 6 * 4, 0);
            gl.enableVertexAttribArray(aPositionLocation);
            gl.vertexAttribPointer(aColorLocation, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
            gl.enableVertexAttribArray(aColorLocation);
            gl.drawArrays(gl.LINE_STRIP, 0, lineVertexCount);

            requestRef.current = requestAnimationFrame(render);
        }

        render();

        // Интервал для обновления статистики (FPS, память)
        fpsIntervalRef.current = setInterval(() => {
            const now = performance.now();
            const delta = now - lastTimeRef.current;
            const fps = Math.round((frameCountRef.current / (delta / 1000)) * 10) / 10;
            frameCountRef.current = 0;
            lastTimeRef.current = now;

            let memUsage = "N/A";
            if (performance && performance.memory) {
                const used = performance.memory.usedJSHeapSize / (1024 * 1024);
                memUsage = used.toFixed(2) + " MB";
            }

            setStats({
                fps: fps,
                mem: memUsage,
                device: navigator.userAgent || "Unknown device",
                posX: posRef.current.x.toFixed(2),
                posY: posRef.current.y.toFixed(2),
                posZ: posRef.current.z.toFixed(2),
                rotX: rotRef.current.x.toFixed(2),
                rotY: rotRef.current.y.toFixed(2),
                rotZ: rotRef.current.z.toFixed(2)
            });
        }, 200);

        // Очистка интервалов и анимации при размонтировании
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            if (fpsIntervalRef.current) {
                clearInterval(fpsIntervalRef.current);
            }
        };
    }, [data]);

    // Функции управления положением и поворотами
    const moveForward = () => { posRef.current.z -= 0.1; };
    const moveBackward = () => { posRef.current.z += 0.1; };
    const moveLeft = () => { posRef.current.x -= 0.1; };
    const moveRight = () => { posRef.current.x += 0.1; };

    const rotateXPlus = () => { rotRef.current.x += 0.1; };
    const rotateXMinus = () => { rotRef.current.x -= 0.5; };
    const rotateYPlus = () => { rotRef.current.y += 0.1; };
    const rotateYMinus = () => { rotRef.current.y -= 0.1; };
    const rotateZPlus = () => { rotRef.current.z += 0.1; };
    const rotateZMinus = () => { rotRef.current.z -= 0.1; };

    // Стили для панелей управления и статистики
    const controlPanelStyle = {
        position: "absolute",
        padding: "5px",
        background: "rgba(255,255,255,0.8)",
        border: "1px solid #ccc",
        borderRadius: "5px"
    };

    const leftTopPanelStyle = {
        ...controlPanelStyle,
        top: 10,
        left: 10
    };

    const rightTopPanelStyle = {
        ...controlPanelStyle,
        top: 10,
        right: 10
    };

    const bottomLeftPanelStyle = {
        ...controlPanelStyle,
        bottom: 10,
        left: 10
    };

    const bottomRightPanelStyle = {
        ...controlPanelStyle,
        bottom: 10,
        right: 10
    };

    const buttonStyle = {
        margin: "5px",
        padding: "8px",
        cursor: "pointer",
        fontSize: "16px"
    };

    return (
        <div style={{ position: "relative", width: "fit-content" }}>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                style={{ border: "1px solid black" }}
            />

            {/* Панель управления движением (слева сверху) */}
            <div style={leftTopPanelStyle}>
                <div>
                    <button style={buttonStyle} onClick={moveForward}>↑</button>
                </div>
                <div>
                    <button style={buttonStyle} onClick={moveLeft}>←</button>
                    <button style={buttonStyle} onClick={moveRight}>→</button>
                </div>
                <div>
                    <button style={buttonStyle} onClick={moveBackward}>↓</button>
                </div>
            </div>

            {/* Панель управления поворотами (справа сверху) */}
            <div style={rightTopPanelStyle}>
                <div>
                    <button style={buttonStyle} onClick={rotateXPlus}>X+</button>
                    <button style={buttonStyle} onClick={rotateXMinus}>X-</button>
                </div>
                <div>
                    <button style={buttonStyle} onClick={rotateYPlus}>Y+</button>
                    <button style={buttonStyle} onClick={rotateYMinus}>Y-</button>
                </div>
                <div>
                    <button style={buttonStyle} onClick={rotateZPlus}>Z+</button>
                    <button style={buttonStyle} onClick={rotateZMinus}>Z-</button>
                </div>
            </div>

            {/* Отображение координат и углов (слева снизу) */}
            <div style={bottomLeftPanelStyle}>
                <div>Position: x={stats.posX}, y={stats.posY}, z={stats.posZ}</div>
                <div>Rotation: x={stats.rotX}, y={stats.rotY}, z={stats.rotZ}</div>
            </div>

            {/* Отображение FPS, памяти и устройства (справа снизу) */}
            <div style={bottomRightPanelStyle}>
                <div>FPS: {stats.fps}</div>
                <div>Memory: {stats.mem}</div>
            </div>
        </div>
    );
};

// ========== Пример тестовых данных ==========
const sampleData = [
    { time: "2025-02-11T00:00:00Z", value: 10 },
    { time: "2025-02-11T01:00:00Z", value: 20 },
    { time: "2025-02-11T02:00:00Z", value: 15 },
    { time: "2025-02-11T03:00:00Z", value: 25 },
    { time: "2025-02-11T04:00:00Z", value: 5 },
    { time: "2025-02-11T05:00:00Z", value: 18 },
    { time: "2025-02-11T06:00:00Z", value: 22 }
];

// ========== Рендер компонента в корневой элемент ==========
ReactDOM.render(
    <TimeSeries3DChartWithHorizonAndStats data={sampleData} />,
    document.getElementById("root")
);
