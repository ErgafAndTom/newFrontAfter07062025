/**
 * niimbotPrintService.js — друк етикеток через TCP термопринтер
 * Принтер: Wi-Fi термопринтер, IP: 192.168.0.150, порт: 9100
 *
 * Етикетка рендериться на HTML5 Canvas,
 * конвертується в 1-bit bitmap і відправляється на бекенд
 * POST /novaposhta/print-label, який обертає в TSPL BITMAP.
 */

import axios from '../../api/axiosInstance';

// ──── Налаштування ────

const LS_KEY = 'printpeaks_barcode_printer_settings';

const DEFAULTS = {
  printerHost: '192.168.0.150',
  printerPort: 9100,
  labelWidth: 50,   // мм
  labelHeight: 30,  // мм
  gap: 3,
  speed: 4,
  density: 8,
  offsetX: 0,
  offsetY: 0,
  threshold: 128,
  marginLeft: 20,
  marginRight: 20,
  marginTop: 8,
  marginBottom: 8,
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
  import('../../hooks/useUserSettings').then(({ saveSetting }) => {
    saveSetting('barcode_printer_settings', settings);
  }).catch(() => {});
}

// ──── Сумісність з існуючими import-ами ────

export function isConnected() { return true; }
export async function connect() {}
export function disconnect() {}
export function hasSavedDevice() { return false; }
export function getBatteryLevel() { return null; }

const statusListeners = new Set();
export function onStatusChange(cb) {
  statusListeners.add(cb);
  return () => statusListeners.delete(cb);
}

// ──── Label canvas generation ────

const DPI = 203;
const PX_PER_MM = DPI / 25.4;

function getLabelDimensions() {
  const s = getSettings();
  return {
    w: Math.round(s.labelWidth * PX_PER_MM),  // 50mm → ~400px
    h: Math.round(s.labelHeight * PX_PER_MM), // 30mm → ~240px
  };
}

// PrintPeaks logo SVG paths
const LOGO_PATHS = [
  'M9.81146 108.438L9.81146 87.5472C9.81146 87.3029 9.90085 87.0671 10.0627 86.8843L44.6864 47.7786C45.2965 47.0894 46.4351 47.521 46.4351 48.4415L46.4351 70.2286C46.4351 70.4768 46.3428 70.7162 46.1761 70.9001L11.5525 109.109C10.9382 109.787 9.81146 109.353 9.81146 108.438Z',
  'M75.125 67.75V48.6875H97.8125C101.5 48.6875 103.188 49 104.688 49.625C108.312 51.0625 111 54.0625 111 58.25C111 62.5625 108.188 65.4375 104.688 66.875C103.125 67.5 101.438 67.75 97.875 67.75H75.125ZM75.125 121V84.9375H100.312C107.938 84.9375 113.125 83.4375 117.375 80.75C124.75 76.125 129.438 68.0625 129.438 58.25C129.438 48.0625 124.75 40.125 117.5 35.625C113.188 32.875 107.938 31.4375 100.312 31.4375H56.4375V121H75.125ZM152.975 121V84.8125H169.85L191.037 121H212.537L189.787 82.9375L190.6 82.625C195.35 81 199.537 78.125 202.662 73.5625C205.6 69.3125 207.225 64.0625 207.225 58.25C207.225 48 202.537 40.0625 195.287 35.625C190.975 32.875 185.725 31.4375 178.1 31.4375H134.287V121H152.975ZM152.975 67.6875V48.6875H175.6C179.287 48.6875 180.975 48.9375 182.475 49.625C186.1 51.0625 188.787 54.0625 188.787 58.25C188.787 62.5 185.975 65.375 182.475 66.8125C180.912 67.5 179.225 67.6875 175.662 67.6875H152.975ZM216.012 121H234.762V31.375H216.012V121ZM263.925 121V64.3125L317.113 121H327.3V31.375H308.613V88.125L255.425 31.375H245.238V121H263.925ZM333.212 31.375V48.6875H362.65V121H381.4V48.6875H410.9V31.375H333.212Z',
  'M27.125 156.75V137.688H49.8125C53.5 137.688 55.1875 138 56.6875 138.625C60.3125 140.062 63 143.062 63 147.25C63 151.562 60.1875 154.438 56.6875 155.875C55.125 156.5 53.4375 156.75 49.875 156.75H27.125ZM27.125 210V173.938H52.3125C59.9375 173.938 65.125 172.438 69.375 169.75C76.75 165.125 81.4375 157.062 81.4375 147.25C81.4375 137.062 76.75 129.125 69.5 124.625C65.1875 121.875 59.9375 120.438 52.3125 120.438H8.4375V210H27.125ZM86.2875 120.375V210H149.35V192.75H105.037V169.438H138.85V152.375H105.037V137.625H149.35V120.375H86.2875ZM218.7 210H238.137L202.637 120.438H184.137L148.575 210H168.012L173.512 195.062H213.075L218.7 210ZM193.387 142.25L206.637 178.125H179.95L193.387 142.25ZM285.488 120.375L258.988 151.062V120.375H240.238V210H258.988V176L267.425 166.625L295.738 210H317.925L279.925 152.688L309.05 120.375H285.488ZM312.4 194.5C324.837 205.625 338.65 210 350.587 210C369.837 210 384.775 198.375 384.775 182.562C384.775 162.25 366.525 157.188 351.462 154.688C338.775 152.562 331.4 150.875 331.4 145C331.4 139.625 338.337 137.25 344.9 137.25C352.962 137.25 361.65 140.25 367.587 145.25L378.212 131.938C368.275 124.125 356.462 120.312 345.15 120.312C324.712 120.312 313.275 132 313.275 146.688C313.275 161.062 325.275 167.312 340.275 170.438C353.462 173.188 366.4 174.25 366.4 182.625C366.4 189.5 357.9 192.625 350.275 192.625C340.462 192.625 331.087 187.875 323.65 181.062L312.4 194.5Z',
];
const LOGO_VIEWBOX = { w: 415, h: 234 };

function drawLogo(ctx, x, y, targetH) {
  const scale = targetH / LOGO_VIEWBOX.h;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#000';
  for (const d of LOGO_PATHS) {
    ctx.fill(new Path2D(d));
  }
  ctx.restore();
}

/**
 * Малює наліпку замовлення, клієнта або матеріалу.
 * Layout: barcode top, info left-aligned below, logo right-bottom.
 */
export function createLabelCanvas(type, data) {
  const s = getSettings();
  const dim = getLabelDimensions();
  const canvas = document.createElement('canvas');
  canvas.width = dim.w;
  canvas.height = dim.h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Білий фон
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const ml = s.marginLeft;
  const mr = s.marginRight;
  const mt = s.marginTop;
  const mb = s.marginBottom;

  // Логотип — правий нижній кут (~60px висота)
  const logoH = 60;
  const logoW = logoH * (LOGO_VIEWBOX.w / LOGO_VIEWBOX.h);
  const logoX = canvas.width - mr - logoW;
  const logoY = dim.h - mb - logoH;
  drawLogo(ctx, logoX, logoY, logoH);

  // Зона контенту
  const contentW = canvas.width - ml - mr;
  const leftX = ml;

  ctx.fillStyle = '#000';

  if (type === 'order') {
    const orderId = data?.id || '?';
    const barcodeValue = `ORD${orderId}`;
    const totalPrice = data?.allPrice ?? data?.totalPrice ?? '';
    const clientId = data?.client?.id || data?.clientId || '';
    const clientName = getClientName(data);

    // Barcode
    const barY = mt;
    const barH = Math.round((dim.h - mt - mb) * 0.42);
    const barCenterX = leftX + contentW / 2;
    drawCode128Bars(ctx, barcodeValue, barCenterX, barY, contentW, barH);

    // Ім'я клієнта — перший рядок під штрих-кодом
    const infoY = barY + barH + 6;
    ctx.textBaseline = 'top';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'left';
    const clientLine = clientName || (clientId ? `ID:${clientId}` : '');
    ctx.fillText(clientLine, leftX, infoY);

    // Номер замовлення + ціна — другий рядок
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'left';
    const orderLabel = `\u2116${orderId}`;
    ctx.fillText(orderLabel, leftX, infoY + 34);

    if (totalPrice) {
      const numW = ctx.measureText(orderLabel + '  ').width;
      ctx.fillText(`${totalPrice} грн`, leftX + numW, infoY + 34);
    }

    // ОПЛАЧЕНО — третій рядок
    const isPaid = data?.Payment?.status === 'PAID'
      || data?.paid === true
      || data?.paymentStatus === 'paid';
    if (isPaid) {
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('ОПЛАЧЕНО', leftX, infoY + 34 + 42);
    }

  } else if (type === 'material') {
    const matId = data?.id || '?';
    const barcodeValue = `MAT${matId}`;
    const matName = data?.name || `Матеріал #${matId}`;

    const barY = mt;
    const barH = Math.round((dim.h - mt - mb) * 0.45);
    const barCenterX = leftX + contentW / 2;
    drawCode128Bars(ctx, barcodeValue, barCenterX, barY, contentW, barH);

    const infoY = barY + barH + 6;
    ctx.textBaseline = 'top';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(matName, leftX, infoY);
    ctx.font = 'bold 36px monospace';
    ctx.fillText(`ID:${matId}`, leftX, infoY + 34);

  } else {
    // Client label
    const clientId = data?.id || '?';
    const barcodeValue = `CLN${clientId}`;
    const clientName = [data?.firstName, data?.lastName].filter(Boolean).join(' ') || `Client #${clientId}`;

    const barY = mt;
    const barH = Math.round((dim.h - mt - mb) * 0.45);
    const barCenterX = leftX + contentW / 2;
    drawCode128Bars(ctx, barcodeValue, barCenterX, barY, contentW, barH);

    const infoY = barY + barH + 6;
    ctx.textBaseline = 'top';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(clientName, leftX, infoY);
    ctx.font = 'bold 36px monospace';
    ctx.fillText(`ID:${clientId}`, leftX, infoY + 34);
  }

  return canvas;
}

function getClientName(data) {
  const c = data?.client;
  if (c) return [c.firstName, c.lastName].filter(Boolean).join(' ') || `Client #${c.id}`;
  return '';
}

// ──── Code128B barcode encoding ────

function encodeCode128B(value) {
  const CODE128B_START = 104;
  const CODE128_STOP = 106;

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
    [2,1,1,2,3,2],[2,3,3,1,1,1,2],
  ];

  const codes = [];
  let checksum = CODE128B_START;
  codes.push(CODE128B_START);

  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i) - 32;
    codes.push(code);
    checksum += code * (i + 1);
  }

  codes.push(checksum % 103);
  codes.push(CODE128_STOP);

  const bars = [];
  for (const code of codes) {
    const pattern = PATTERNS[code];
    if (pattern) {
      for (const w of pattern) bars.push(w);
    }
  }

  return bars;
}

function drawCode128Bars(ctx, value, centerX, y, maxWidth, barHeight) {
  const bars = encodeCode128B(value);
  const totalModules = bars.reduce((s, w) => s + w, 0);
  const moduleWidth = (maxWidth * 0.95) / totalModules;
  const totalBarWidth = totalModules * moduleWidth;
  let x = centerX - totalBarWidth / 2;
  let isBlack = true;

  for (const w of bars) {
    if (isBlack) {
      ctx.fillRect(x, y, w * moduleWidth, barHeight);
    }
    x += w * moduleWidth;
    isBlack = !isBlack;
  }
}

// ──── Конвертація canvas → 1-bit bitmap ────

function canvasToBitmap(canvas) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, W, H);
  const pixels = imageData.data;
  const s = getSettings();
  const threshold = s.threshold || 128;

  // widthBytes має бути кратним 8 бітам
  const widthBytes = Math.ceil(W / 8);
  const bitmap = new Uint8Array(widthBytes * H);

  for (let row = 0; row < H; row++) {
    for (let byteIdx = 0; byteIdx < widthBytes; byteIdx++) {
      let byte = 0;
      for (let bit = 0; bit < 8; bit++) {
        const px = byteIdx * 8 + bit;
        if (px >= W) break;
        const idx = (row * W + px) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const brightness = (r + g + b) / 3;
        if (brightness >= threshold) {
          byte |= (0x80 >> bit); // MSB first, 1 = білий
        }
      }
      bitmap[row * widthBytes + byteIdx] = byte;
    }
  }

  return { bitmap, width: W, height: H, widthBytes };
}

function uint8ToBase64(uint8) {
  let binary = '';
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

// ──── Друк через бекенд TCP ────

let printLock = false;
let lastPrintTime = 0;
const MIN_PRINT_INTERVAL = 3000; // 3с мінімум між друками

export async function printLabel(type, data) {
  const now = Date.now();
  if (printLock || (now - lastPrintTime < MIN_PRINT_INTERVAL)) {
    return;
  }
  printLock = true;
  lastPrintTime = now;

  try {
    await document.fonts.ready;

    const canvas = createLabelCanvas(type, data);

    // Перевіряємо що canvas не пустий
    const imgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let blackPx = 0;
    for (let i = 0; i < imgData.length; i += 4) {
      if (imgData[i] < 128) blackPx++;
    }
    if (blackPx === 0) {
      throw new Error('Canvas порожній — нічого друкувати');
    }

    // Конвертуємо в bitmap і відправляємо на бекенд
    const { bitmap, width, height, widthBytes } = canvasToBitmap(canvas);
    const bitmapBase64 = uint8ToBase64(bitmap);
    const s = getSettings();

    console.log(`[BarcodePrint] Label ${width}×${height}, ${bitmap.length} bytes → ${s.printerHost}:${s.printerPort}`);

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

    console.log('[BarcodePrint] OK:', response.data);
    return response.data;
  } finally {
    printLock = false;
  }
}

/**
 * Тест з'єднання з принтером (TCP ping)
 */
export async function testConnection() {
  const s = getSettings();
  return axios.post('/novaposhta/test-connection', {
    host: s.printerHost,
    port: s.printerPort,
  });
}

/**
 * Тест друку — друкує маленьку тестову наліпку
 */
export async function testPrint() {
  const s = getSettings();
  return axios.post('/novaposhta/print-raw', {
    tsplData: `SIZE ${s.labelWidth} mm, ${s.labelHeight} mm\r\nGAP ${s.gap} mm, 0 mm\r\nSPEED ${s.speed}\r\nDENSITY ${s.density}\r\nCLS\r\nTEXT 30,30,"3",0,1,1,"BARCODE TEST OK"\r\nTEXT 30,70,"2",0,1,1,"${s.labelWidth}x${s.labelHeight}mm"\r\nPRINT 1,1\r\n`,
    host: s.printerHost,
    port: s.printerPort,
  });
}

export function applyPrinterSettings() {}

export default {
  connect,
  disconnect,
  isConnected,
  hasSavedDevice,
  onStatusChange,
  printLabel,
  createLabelCanvas,
  applyPrinterSettings,
  getSettings,
  saveSettings,
  testConnection,
  testPrint,
};
