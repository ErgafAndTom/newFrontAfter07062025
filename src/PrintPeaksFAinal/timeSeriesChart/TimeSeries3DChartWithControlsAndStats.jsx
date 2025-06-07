import React, { useRef, useEffect, useState } from "react";

// ========== Базовые функции для матриц 4x4 ========== //
function createIdentityMatrix() {
    return [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1];
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
        1, 0, 0, 0,
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

// ========== Шейдеры ========== //
const vertexShaderSource = `
  attribute vec3 aPosition;
  uniform mat4 uMVPMatrix;
  void main() {
    gl_Position = uMVPMatrix * vec4(aPosition, 1.0);
    gl_PointSize = 8.0;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform vec4 uColor;
  void main() {
    gl_FragColor = uColor;
  }
`;

function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Ошибка шейдера:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// ========== Сам компонент ========== //
const TimeSeries3DChartWithControlsAndStats = ({ data }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef(null);


    // Позиция "камеры" (или сцены) и углы вращения
    const posRef = useRef({ x: 0, y: 0, z: -2 }); // изначально слегка отдалено
    const rotRef = useRef({ x: 0, y: 0, z: 0 });

    // Для отображения текущих значений в интерфейсе (слева снизу, справа снизу)
    // Мы будем обновлять это раз в ~200 мс
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
    const [device, setDevice] = useState("");
    let getWebGLDevice = (e) => {
        const canvas = document.querySelector("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

        if (!gl) {
            return "WebGL not supported";
        }

        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");

        if (debugInfo) {
            const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            setDevice(`vendor: ${vendor} - renderer: ${renderer}`)
            // return `${vendor} - ${renderer}`;

        }

        return "Unknown WebGL Device";
    }

    // const device = getWebGLDevice();
    // console.log("Device:", device);

    // Для подсчёта FPS
    const frameCountRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const fpsIntervalRef = useRef(null);

    useEffect(() => {
        // Инициируем WebGL
        const canvas = canvasRef.current;
        const gl = canvas.getContext("webgl");
        if (!gl) {
            console.error("WebGL не поддерживается этим браузером.");
            return;
        }

        // Компилируем шейдеры
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

        // Защита от ситуации, когда все time или value одинаковые
        const times = data.map((d) => new Date(d.time).getTime());
        const values = data.map((d) => d.value);

        let minTime = Math.min(...times);
        let maxTime = Math.max(...times);
        let minValue = Math.min(...values);
        let maxValue = Math.max(...values);

        if (minTime === maxTime) maxTime = minTime + 1;
        if (minValue === maxValue) maxValue = minValue + 1;

        // Массив вершин
        const vertices = [];
        data.forEach((d) => {
            const t = new Date(d.time).getTime();
            const xN = (t - minTime) / (maxTime - minTime) - 0.5;
            const yN = (d.value - minValue) / (maxValue - minValue) - 0.5;
            const zN = 0.0;
            vertices.push(xN, yN, zN);
        });

        // Создаём буфер и передаём координаты
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        const aPositionLocation = gl.getAttribLocation(program, "aPosition");
        gl.enableVertexAttribArray(aPositionLocation);
        gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0);

        const uMVPMatrixLocation = gl.getUniformLocation(program, "uMVPMatrix");
        const uColorLocation = gl.getUniformLocation(program, "uColor");
        gl.uniform4f(uColorLocation, 1.0, 0.0, 0.0, 1.0); // красный цвет

        // Настраиваем viewport и включаем Z-тест
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.enable(gl.DEPTH_TEST);

        // Матрица проекции (perspective)
        const aspect = canvas.width / canvas.height;
        const projectionMatrix = createPerspectiveMatrix(45, aspect, 0.1, 100.0);

        // Функция отрисовки
        function render() {
            frameCountRef.current += 1; // увеличиваем счётчик кадров

            // Очищаем
            gl.clearColor(0.3, 0.4, 0.99, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Создаём матрицу модели-вида
            let modelView = createIdentityMatrix();
            // Сдвигаем по осям (из posRef)
            modelView = multiplyMatrix(modelView, createTranslationMatrix(posRef.current.x, posRef.current.y, posRef.current.z));
            // Повороты вокруг X, Y, Z
            modelView = multiplyMatrix(modelView, createRotationXMatrix(rotRef.current.x));
            modelView = multiplyMatrix(modelView, createRotationYMatrix(rotRef.current.y));
            modelView = multiplyMatrix(modelView, createRotationZMatrix(rotRef.current.z));

            // Итоговая матрица (MVP)
            const mvpMatrix = multiplyMatrix(projectionMatrix, modelView);
            gl.uniformMatrix4fv(uMVPMatrixLocation, false, new Float32Array(mvpMatrix));

            // Отрисовка линией
            gl.drawArrays(gl.LINE_STRIP, 0, data.length);
            // gl.drawArrays(gl.POINTS, 0, data.length); // можно раскомментировать

            requestRef.current = requestAnimationFrame(render);
        }

        render();

        // Запускаем интервал для обновления FPS и прочих метрик раз в 200 мс
        fpsIntervalRef.current = setInterval(() => {
            const now = performance.now();
            const delta = now - lastTimeRef.current; // миллисекунды c прошлого замера

            // FPS = количество кадров / (секунды, прошедшие с прошлого замера)
            const fps = Math.round((frameCountRef.current / (delta / 1000)) * 10) / 10;

            // Обнуляем счётчик и переставляем "точку отсчёта"
            frameCountRef.current = 0;
            lastTimeRef.current = now;

            // Проверяем память (не во всех браузерах доступно performance.memory)
            let memUsage = "N/A";
            if (performance && performance.memory) {
                const used = performance.memory.usedJSHeapSize / (1024 * 1024);
                memUsage = used.toFixed(2) + " MB";
            }

            setStats({
                fps: fps,
                mem: memUsage,
                device: navigator.userAgent || "Unknown Device",
                posX: posRef.current.x.toFixed(2),
                posY: posRef.current.y.toFixed(2),
                posZ: posRef.current.z.toFixed(2),
                rotX: rotRef.current.x.toFixed(2),
                rotY: rotRef.current.y.toFixed(2),
                rotZ: rotRef.current.z.toFixed(2)
            });
        }, 200);

        // При размонтировании — останавливаем всё
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            if (fpsIntervalRef.current) {
                clearInterval(fpsIntervalRef.current);
            }
        };
    }, [data]);

    // ========== Функции для управления движением и вращением ========== //
    const moveForward = () => { posRef.current.z -= 0.1; };
    const moveBackward = () => { posRef.current.z += 0.1; };
    const moveLeft = () => { posRef.current.x -= 0.1; };
    const moveRight = () => { posRef.current.x += 0.1; };

    const rotateXPlus = () => { rotRef.current.x += 0.1; };
    const rotateXMinus = () => { rotRef.current.x -= 0.1; };
    const rotateYPlus = () => { rotRef.current.y += 0.1; };
    const rotateYMinus = () => { rotRef.current.y -= 0.1; };
    const rotateZPlus = () => { rotRef.current.z += 0.1; };
    const rotateZMinus = () => { rotRef.current.z -= 0.1; };

    // Стили для панелей управления
    const controlPanelStyle = {
        position: "absolute",
        padding: "5px",
        background: "rgba(255,255,255,0.8)",
        border: "1px solid #ccc",
        borderRadius: "5px"
    };

    const leftPanelStyle = {
        ...controlPanelStyle,
        top: 10,
        left: 10
    };

    const rightPanelStyle = {
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
                style={{ border: "1px solid black"}}
            />

            {/* Панель управления перемещением (слева сверху) */}
            <div style={leftPanelStyle}>
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

            {/* Панель управления вращением (справа сверху) */}
            <div style={rightPanelStyle}>
                {/* Вращение по оси X */}
                <div>
                    <button style={buttonStyle} onClick={rotateXPlus}>X+</button>
                    <button style={buttonStyle} onClick={rotateXMinus}>X-</button>
                </div>
                {/* Вращение по оси Y */}
                <div>
                    <button style={buttonStyle} onClick={rotateYPlus}>Y+</button>
                    <button style={buttonStyle} onClick={rotateYMinus}>Y-</button>
                </div>
                {/* Вращение по оси Z */}
                <div>
                    <button style={buttonStyle} onClick={rotateZPlus}>Z+</button>
                    <button style={buttonStyle} onClick={rotateZMinus}>Z-</button>
                </div>
            </div>

            {/* Снизу слева: координаты и углы */}
            <div style={bottomLeftPanelStyle}>
                <div>Position: x = {stats.posX}, y = {stats.posY}, z = {stats.posZ}</div>
                <div>Rotation: x = {stats.rotX}, y = {stats.rotY}, z = {stats.rotZ}</div>
            </div>

            {/* Снизу справа: FPS, память, устройство */}
            <div style={bottomRightPanelStyle}>
                <div>FPS: {stats.fps}</div>
                <div>Memory: {stats.mem}</div>
            </div>
            <div style={{top: -40, left: 10, position: "absolute", zIndex: 0}}>
                <div>Device: {device}</div>
                <button onClick={getWebGLDevice}></button>
            </div>
        </div>
    );
};

export default TimeSeries3DChartWithControlsAndStats;
