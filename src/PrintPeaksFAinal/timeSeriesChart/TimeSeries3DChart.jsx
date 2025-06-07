import React, { useRef, useEffect } from "react";

// Функции для работы с матрицами (4x4). Минимальный набор.
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
        a, 0, c, 0,
        0, b, d, 0,
        0, 0, e, f,
        0, 0, -1, 0
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

function createRotationYMatrix(angleRad) {
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    return [
        cos,  0, sin, 0,
        0,    1, 0,   0,
        -sin, 0, cos, 0,
        0,    0, 0,   1
    ];
}

const vertexShaderSource = `
  attribute vec3 aPosition;
  uniform mat4 uMVPMatrix;
  void main() {
    gl_Position = uMVPMatrix * vec4(aPosition, 1.0);
    // Размер точки, если будем рисовать POINTS
    gl_PointSize = 6.0;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform vec4 uColor;
  void main() {
    // Для POINTS фрагмент можно закрашивать сплошным цветом
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

const TimeSeries3DChart = ({ data }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const angleRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas.getContext("webgl");
        if (!gl) {
            console.error("WebGL не поддерживается данным браузером.");
            return;
        }

        // Шейдерная программа
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

        // Вычисляем min/max по времени и по значению
        const times = data.map((d) => new Date(d.time).getTime());
        const values = data.map((d) => d.value);
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);

        // Подготовим массив координат (x,y,z) (здесь z=0, чтобы сделать плоскость, но с возможностью вращения)
        const vertices = [];
        data.forEach((d) => {
            const t = new Date(d.time).getTime();
            const xN = (t - minTime) / (maxTime - minTime) - 0.5; // от -0.5 до 0.5
            const yN = (d.value - minValue) / (maxValue - minValue) - 0.5; // от -0.5 до 0.5
            const zN = 0.0; // можно усложнить при желании
            vertices.push(xN, yN, zN);
        });

        // Создадим буфер вершин
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Получаем локации атрибутов/юниформ
        const aPositionLocation = gl.getAttribLocation(program, "aPosition");
        gl.enableVertexAttribArray(aPositionLocation);
        gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0);

        const uMVPMatrixLocation = gl.getUniformLocation(program, "uMVPMatrix");
        const uColorLocation = gl.getUniformLocation(program, "uColor");

        // Устанавливаем цвет (RGBA)
        // Можно динамически менять цвет в зависимости от статуса, здесь фиксированно
        gl.uniform4f(uColorLocation, 1.0, 0.0, 0.0, 1.0);

        // Настраиваем область рисования
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.enable(gl.DEPTH_TEST);

        // Базовая матрица проекции
        const aspect = canvas.width / canvas.height;
        const projectionMatrix = createPerspectiveMatrix(45, aspect, 0.1, 10.0);

        function render() {
            angleRef.current += 0.01; // угол вращения
            // Очищаем экран
            gl.clearColor(0.95, 0.95, 0.95, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Матрица преобразований (камера немного сдвинута назад и вращается)
            let modelView = createIdentityMatrix();
            // Сдвигаем сцену "назад" (вглубь)
            modelView = multiplyMatrix(modelView, createTranslationMatrix(0, 0, -1.5));
            // Вращаем вокруг Y
            modelView = multiplyMatrix(modelView, createRotationYMatrix(angleRef.current));

            // Итоговая MVP (Model-View-Projection)
            const mvpMatrix = multiplyMatrix(projectionMatrix, modelView);

            // Передаём в шейдер
            gl.uniformMatrix4fv(uMVPMatrixLocation, false, new Float32Array(mvpMatrix));

            // Рисуем как линию (GL.LINE_STRIP) или точки (GL.POINTS)
            // Попробуйте gl.LINE_STRIP, тогда график будет одной линией
            // Или gl.POINTS, чтобы увидеть набор точек
            gl.drawArrays(gl.LINE_STRIP, 0, data.length);

            requestRef.current = requestAnimationFrame(render);
        }

        render();

        // При размонтировании — останавливаем
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };

    }, [data]);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{ border: "1px solid black" }}
        />
    );
};

export default TimeSeries3DChart;
