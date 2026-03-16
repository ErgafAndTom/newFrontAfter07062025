/**
 * qzTrayService.js — друк етикеток НП через бекенд TCP socket
 * Принтер: EZPOS L4-W, IP: 192.168.0.47, порт: 9100
 *
 * Етикетка рендериться на HTML5 Canvas (підтримує кирилицю),
 * конвертується в 1-bit bitmap і відправляється на бекенд
 * POST /novaposhta/print-label, який обертає в TSPL BITMAP.
 */

import axios from '../../api/axiosInstance';

// ──── Налаштування ────

const LS_KEY = 'printpeaks_qztray_settings';

const DEFAULTS = {
  printerHost: '192.168.0.47',
  printerPort: 9100,
  labelWidth: 100, // мм
  labelHeight: 100, // мм
  gap: 3,
  speed: 4,
  density: 8,
  resolution: 6, // deviceScaleFactor для Puppeteer (1-8)
  sound: true, // звуковий сигнал принтера після друку
  offsetX: 0, // зсув зображення по X (мм)
  offsetY: 0, // зсув зображення по Y (мм)
  threshold: 128, // поріг чорного/білого (0-255), менше = темніше
};

export function getSettings() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULTS };
}

export function saveSettings(settings) {
  localStorage.setItem(LS_KEY, JSON.stringify(settings));
}

// ──── Стан з'єднання (сумісність з useQzTray) ────

export function isConnected() { return true; }
export async function connect() {}
export async function disconnect() {}
export async function listPrinters() {
  return ['EZPOS L4-W (TCP ' + getSettings().printerHost + ')'];
}

// ──── Canvas рендеринг етикетки ────

// 203dpi = 8 dots/mm → 100mm = 800 dots
const DPMM = 8;

/**
 * Рендерить етикетку НП на OffscreenCanvas і повертає 1-bit bitmap (Uint8Array).
 * Bitmap формат: MSB first, 1=чорний, 0=білий.
 */
export function renderLabelBitmap(data, settings) {
  const s = { ...getSettings(), ...settings };
  const W = s.labelWidth * DPMM;   // 800
  const H = s.labelHeight * DPMM;  // 800

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Білий фон
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  const pad = 16;
  const midX = Math.round(W / 2);

  // ═══ ШАПКА — чорний фон ═══
  const headerH = 80;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, headerH);

  // Білий текст на чорному фоні
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.fillText((data.cityArea || 'НОВА ПОШТА').toUpperCase(), 24, 32);

  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillText((data.cargoType || 'ПОСИЛКОВИЙ'), 24, 62);

  if (data.warehouseCode) {
    ctx.textAlign = 'right';
    ctx.fillText(data.warehouseCode, W - 16, 62);
    ctx.textAlign = 'left';
  }

  // ═══ ВІД / КОМУ — чорна смужка ═══
  let y = headerH + 4;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, y, W, 24);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText('ВІД: ' + (data.sendDate || ''), pad, y + 17);
  ctx.fillText('КОМУ:', midX + 8, y + 17);

  const senderBlockTop = y + 24;

  // ═══ ВІДПРАВНИК (ліва колонка) ═══
  ctx.fillStyle = '#000';
  y = senderBlockTop + 8;

  if (data.senderType) {
    ctx.font = '13px Arial, sans-serif';
    ctx.fillText(data.senderType, pad, y + 13);
    y += 22;
  }
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillText(trunc(data.senderName, 22), pad, y + 16);
  y += 24;
  ctx.font = '13px Arial, sans-serif';
  ctx.fillText(trunc(data.senderAddress, 28), pad, y + 13);
  y += 20;
  ctx.fillText(data.senderPhone || '', pad, y + 13);

  // ═══ ОТРИМУВАЧ (права колонка) ═══
  let ry = senderBlockTop + 8;

  if (data.recipientType) {
    ctx.font = '13px Arial, sans-serif';
    ctx.fillText(trunc(data.recipientType, 22), midX + 8, ry + 13);
    ry += 22;
  }
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillText(trunc(data.recipientName, 22), midX + 8, ry + 16);
  ry += 24;
  ctx.font = '13px Arial, sans-serif';
  ctx.fillText(trunc(data.recipientAddress, 28), midX + 8, ry + 13);
  ry += 20;
  ctx.fillText(data.recipientPhone || '', midX + 8, ry + 13);

  // Вертикальний роздільник
  const blockBottom = Math.max(y, ry) + 28;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(midX, senderBlockTop);
  ctx.lineTo(midX, blockBottom);
  ctx.stroke();

  // ═══ ВАРТІСТЬ ДОСТАВКИ ═══
  y = blockBottom;
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(W - pad, y);
  ctx.stroke();

  y += 6;
  const payer = data.payerType === 'Sender' ? 'відпр.' : 'одерж.';
  const payType = data.paymentType || 'безг-ка';
  const costStr = data.deliveryCost
    ? `Вартість дост.: ${data.deliveryCost} грн (${payer}, ${payType})`
    : '';
  if (costStr) {
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText(costStr, pad, y + 14);
  }

  y += 24;
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(W - pad, y);
  ctx.stroke();

  // ═══ ВАГА / ДВ / МІСЦЯ ═══
  y += 6;
  const weightY = y;
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText(data.weight || '0.00', pad + 8, y + 24);
  ctx.font = '10px Arial, sans-serif';
  ctx.fillText('(факт)', pad + 8, y + 40);

  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText('ДВ', pad + 140, y + 24);

  const seats = data.seatsAmount || '1';
  ctx.textAlign = 'center';
  ctx.fillText(seats, W - 80, y + 20);
  // Лінія
  ctx.beginPath();
  ctx.moveTo(W - 120, y + 28);
  ctx.lineTo(W - 40, y + 28);
  ctx.stroke();
  ctx.fillText(seats, W - 80, y + 46);
  ctx.textAlign = 'left';

  // Вертикальні розділювачі
  ctx.lineWidth = 2;
  [[pad + 128, weightY - 2, weightY + 56],
   [pad + 220, weightY - 2, weightY + 56],
   [W - 130, weightY - 2, weightY + 56]].forEach(([x, t, b]) => {
    ctx.beginPath();
    ctx.moveTo(x, t);
    ctx.lineTo(x, b);
    ctx.stroke();
  });

  y = weightY + 58;
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(W - pad, y);
  ctx.stroke();

  // ═══ НОМЕР ТТН ═══
  y += 10;
  const ttnFormatted = data.intDocNumber || '';
  ctx.font = 'bold 28px monospace';
  ctx.fillText(ttnFormatted, pad + 40, y + 28);

  // ═══ ШТРИХ-КОД (Code 128 як bitmap) ═══
  y += 44;
  const ttnClean = ttnFormatted.replace(/\s/g, '');
  if (ttnClean) {
    const barcodeH = Math.max(Math.round((H - y - 16) / 3), 50);
    drawCode128(ctx, ttnClean, pad, y, W - pad * 2, barcodeH);
  }

  // ═══ Конвертація в 1-bit bitmap ═══
  const imageData = ctx.getImageData(0, 0, W, H);
  const pixels = imageData.data; // RGBA
  const widthBytes = W / 8; // 100
  const bitmap = new Uint8Array(widthBytes * H);

  for (let row = 0; row < H; row++) {
    for (let byteIdx = 0; byteIdx < widthBytes; byteIdx++) {
      let byte = 0;
      for (let bit = 0; bit < 8; bit++) {
        const px = row * W + byteIdx * 8 + bit;
        const r = pixels[px * 4];
        const g = pixels[px * 4 + 1];
        const b = pixels[px * 4 + 2];
        const brightness = (r + g + b) / 3;
        if (brightness >= 128) {
          byte |= (0x80 >> bit); // MSB first, 1 = білий (не друкувати)
        }
      }
      bitmap[row * widthBytes + byteIdx] = byte;
    }
  }

  return { bitmap, width: W, height: H, widthBytes };
}

// ──── Code 128 barcode renderer ────

function drawCode128(ctx, text, x, y, maxWidth, height) {
  const encoded = encodeCode128(text);
  if (!encoded.length) return;

  const totalBars = encoded.reduce((s, v) => s + v, 0);
  const barW = Math.max(1, Math.floor(maxWidth / totalBars));

  ctx.fillStyle = '#000';
  let cx = x;
  for (let i = 0; i < encoded.length; i++) {
    const w = encoded[i] * barW;
    if (i % 2 === 0) { // парний = чорна смуга
      ctx.fillRect(cx, y, w, height);
    }
    cx += w;
  }
}

/** Мінімальний Code 128B encoder */
function encodeCode128(text) {
  // Code 128B pattern table (bar+space widths)
  const PATTERNS = [
    [2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],[1,2,1,3,2,2],
    [1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],[1,3,2,2,1,2],[2,2,1,2,1,3],
    [2,2,1,3,1,2],[2,3,1,2,1,2],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],
    [1,1,3,2,2,2],[1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],
    [2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,2],[3,1,2,1,3,1],[3,1,1,2,2,2],
    [3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],[3,2,2,1,1,2],[3,2,2,2,1,1],
    [2,1,2,1,2,3],[2,1,2,3,2,1],[2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],
    [1,3,1,3,2,1],[1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],
    [2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,2,1,3,3],[1,1,2,3,3,1],[1,3,2,1,3,1],
    [1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],[3,1,3,1,2,1],[2,1,1,3,3,1],
    [2,3,1,1,3,1],[2,1,3,1,1,3],[2,1,3,3,1,1],[2,1,3,1,3,1],[3,1,1,1,2,3],
    [3,1,1,3,2,1],[3,3,1,1,2,1],[3,1,2,1,1,3],[3,1,2,3,1,1],[3,3,2,1,1,1],
    [3,1,4,1,1,1],[2,2,1,4,1,1],[4,3,1,1,1,1],[1,1,1,2,2,4],[1,1,1,4,2,2],
    [1,2,1,1,2,4],[1,2,1,4,2,1],[1,4,1,1,2,2],[1,4,1,2,2,1],[1,1,2,2,1,4],
    [1,1,2,4,1,2],[1,2,2,1,1,4],[1,2,2,4,1,1],[1,4,2,1,1,2],[1,4,2,2,1,1],
    [2,4,1,2,1,1],[2,2,1,1,1,4],[4,1,3,1,1,1],[2,4,1,1,1,2],[1,3,4,1,1,1],
    [1,1,1,2,4,2],[1,2,1,1,4,2],[1,2,1,2,4,1],[1,1,4,2,1,2],[1,2,4,1,1,2],
    [1,2,4,2,1,1],[4,1,1,2,1,2],[4,2,1,1,1,2],[4,2,1,2,1,1],[2,1,2,1,4,1],
    [2,1,4,1,2,1],[4,1,2,1,2,1],[1,1,1,1,4,3],[1,1,1,3,4,1],[1,3,1,1,4,1],
    [1,1,4,1,1,3],[1,1,4,3,1,1],[4,1,1,1,1,3],[4,1,1,3,1,1],[1,1,3,1,4,1],
    [1,1,4,1,3,1],[3,1,1,1,4,1],[4,1,1,1,3,1],[2,1,1,4,1,2],[2,1,1,2,1,4],
    [2,1,1,2,3,2],[2,3,3,1,1,1],[2,1,1,1,3,2],
  ];
  const START_B = 104;
  const STOP = [2,3,3,1,1,1,2];

  const result = [];
  let checksum = START_B;
  result.push(...PATTERNS[START_B]);

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32;
    if (code < 0 || code > 95) continue;
    result.push(...PATTERNS[code]);
    checksum += code * (i + 1);
  }

  result.push(...PATTERNS[checksum % 103]);
  result.push(...STOP);

  return result;
}

function trunc(str, max) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '..' : str;
}

// ──── Друк через бекенд ────

/**
 * Друкує етикетку НП — рендерить на Canvas, відправляє bitmap на бекенд.
 */
export async function printNovaPoshtaLabel(labelData, settings) {
  const s = { ...getSettings(), ...settings };

  // Рендеримо етикетку в bitmap
  const { bitmap, width, height, widthBytes } = renderLabelBitmap(labelData, settings);

  // Конвертуємо bitmap в base64
  const bitmapBase64 = uint8ToBase64(bitmap);

  console.log(`[Print] Label rendered: ${width}×${height}, ${bitmap.length} bytes → sending to backend`);

  const response = await axios.post('/novaposhta/print-label', {
    bitmapBase64,
    width,
    height,
    widthBytes,
    host: s.printerHost,
    port: s.printerPort,
    gap: s.gap,
    speed: s.speed,
    density: s.density,
    labelWidth: s.labelWidth,
    labelHeight: s.labelHeight,
  });

  console.log('[Print] Backend response:', response.data);
  return response.data;
}

function uint8ToBase64(uint8) {
  let binary = '';
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}
