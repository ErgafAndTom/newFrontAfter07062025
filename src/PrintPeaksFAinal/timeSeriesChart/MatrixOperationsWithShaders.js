// ========== Базові функції для матриць 4x4 ========== //
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

// ========== Шейдери ========== //
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
    console.error("Помилка компіляції шейдера:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// ========== Функція для генерації "горизонту" (базова площина) ========== //
function buildHorizon(subdiv = 10, size = 50, yLevel = -0.2) {
  const colorsArr = [
    [0.0, 0.6, 0.0],   // зелений
    [1.0, 1.0, 1.0],   // білий
    [0.6, 0.3, 0.0],   // коричневий
    [0.0, 0.0, 1.0]    // синій
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

      // Випадковий колір
      const color = colorsArr[Math.floor(Math.random() * colorsArr.length)];

      // Трикутник 1
      vertices.push(
        x1, yLevel, z1, color[0], color[1], color[2],
        x2, yLevel, z1, color[0], color[1], color[2],
        x2, yLevel, z2, color[0], color[1], color[2]
      );
      // Трикутник 2
      vertices.push(
        x1, yLevel, z1, color[0], color[1], color[2],
        x2, yLevel, z2, color[0], color[1], color[2],
        x1, yLevel, z2, color[0], color[1], color[2]
      );
    }
  }

  return new Float32Array(vertices);
}

// ========== Функція для формування даних лінії (time/value) ========== //
function buildLineData(data) {
  // Якщо масив порожній, повертаємо пустий Float32Array і попередження
  if (!data || data.length === 0) {
    console.warn("Попередження: передано порожній масив даних для лінії.");
    return new Float32Array([]);
  }

  // Отримуємо масиви часових позначок та значень
  const times = data.map(d => new Date(d.time).getTime());
  const values = data.map(d => d.value);

  let minTime = Math.min(...times);
  let maxTime = Math.max(...times);
  let minValue = Math.min(...values);
  let maxValue = Math.max(...values);

  // Уникнення поділу на нуль, якщо всі часи однакові
  if (minTime === maxTime) {
    maxTime = minTime + 1;
  }
  // Аналогічно для значень
  if (minValue === maxValue) {
    maxValue = minValue + 1;
  }

  // Створимо вершинний масив: x, y, z=0, колір (r,g,b)
  // Приклад: нормалізуємо час і значення у діапазон [0..1]
  const vertices = [];
  for (let i = 0; i < data.length; i++) {
    const normT = (times[i] - minTime) / (maxTime - minTime);
    const normV = (values[i] - minValue) / (maxValue - minValue);

    // x = normT * 2 - 1 (щоб йшло від -1 до +1)
    // y = normV * 2 - 1
    const xPos = normT * 2 - 1;
    const yPos = normV * 2 - 1;
    const zPos = 0.0;

    // Колір, наприклад, фіксований або за бажанням мінімальний/максимальний
    const r = 1.0;
    const g = 0.0;
    const b = 0.0;

    vertices.push(xPos, yPos, zPos, r, g, b);
  }

  // Повертаємо масив вершин у форматі Float32Array
  return new Float32Array(vertices);
}

// Нижче можна при необхідності додати будь-яку ініціалізацію WebGL:
// наприклад, створення контексту, прив’язку буфера та відмальовування.
