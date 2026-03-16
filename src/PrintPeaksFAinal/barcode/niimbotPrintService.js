/**
 * niimbotPrintService.js — Web Bluetooth друк на Niimbot B21S
 * v8 — auto-reconnect, blank-first-print fix, mutex
 */

import {
  NiimbotBluetoothClient,
  ImageEncoder,
  PacketGenerator,
  findPrintTask,
} from '@mmote/niimbluelib';

// Singleton client
let client = null;
let connected = false;

const LS_KEY = 'printpeaks_niimbot_settings';
const DEVICE_ID_KEY = 'printpeaks_niimbot_deviceId';

function getSettings() {
  const defaults = {
    density: 5,
    temperature: 5,
    labelType: 1,
    copies: 1,
    speed: 2,
    autoShutdown: 15,
    sound: true,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 8,
    marginBottom: 8,
  };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaults;
}

// --- Connection ---

let reconnectAttempts = 0;
let watchingDevice = null; // BluetoothDevice що моніториться через watchAdvertisements
let reconnectTimer = null;

/**
 * Підключається до BLE пристрою напряму (без picker).
 * Використовується для auto-reconnect і reconnect після розриву.
 */
async function connectToDevice(device) {
  client = new NiimbotBluetoothClient();

  const disconnectListener = () => {
    console.log('[Niimbot] Disconnected — scheduling auto-reconnect...');
    connected = false;
    client = null;
    notifyStatus();
    device.removeEventListener('gattserverdisconnected', disconnectListener);
    // Запускаємо авто-перепідключення
    scheduleReconnect(device);
  };
  device.addEventListener('gattserverdisconnected', disconnectListener);

  const gattServer = await device.gatt.connect();
  const channel = await client.findSuitableBluetoothCharacteristic(gattServer);
  if (!channel) {
    gattServer.disconnect();
    throw new Error('No suitable BLE characteristic found');
  }

  channel.addEventListener('characteristicvaluechanged', (event) => {
    client.processRawPacket(event.target.value);
  });
  await channel.startNotifications();

  client.gattServer = gattServer;
  client.channel = channel;

  // Рукостискання + інфо про принтер
  await client.initialNegotiate();
  await client.fetchPrinterInfo();

  connected = true;
  reconnectAttempts = 0;
  console.log('[Niimbot] Connected to', device.name, '| battery:', BATTERY_MAP[client.info?.charge] ?? '?', '%');
  notifyStatus();

  // Застосовуємо налаштування
  await applyPrinterSettings();
}

/**
 * Планує повторну спробу підключення з backoff.
 */
function scheduleReconnect(device) {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (reconnectAttempts >= 10) {
    console.warn('[Niimbot] Max reconnect attempts reached. Use manual connect.');
    return;
  }

  // Backoff: 2s, 3s, 5s, 8s, 10s, 10s...
  const delays = [2000, 3000, 5000, 8000, 10000];
  const delay = delays[Math.min(reconnectAttempts, delays.length - 1)];
  reconnectAttempts++;

  console.log(`[Niimbot] Reconnect attempt ${reconnectAttempts} in ${delay / 1000}s...`);
  reconnectTimer = setTimeout(async () => {
    try {
      await connectToDevice(device);
    } catch (e) {
      console.warn('[Niimbot] Reconnect failed:', e.message);
      scheduleReconnect(device);
    }
  }, delay);
}

/**
 * Спроба тихого перепідключення до раніше спареного пристрою
 * (без picker-а, через getDevices + watchAdvertisements API).
 */
async function tryAutoReconnect() {
  console.log('[Niimbot] tryAutoReconnect — start');
  if (!navigator.bluetooth?.getDevices) {
    console.log('[Niimbot] getDevices API not available');
    return false;
  }

  const savedId = localStorage.getItem(DEVICE_ID_KEY);
  if (!savedId) {
    console.log('[Niimbot] No saved device ID in localStorage');
    return false;
  }
  console.log('[Niimbot] Saved device ID:', savedId);

  try {
    const devices = await navigator.bluetooth.getDevices();
    console.log('[Niimbot] getDevices returned', devices.length, 'devices');
    const device = devices.find(d => d.id === savedId);
    if (!device) {
      console.log('[Niimbot] Saved device not found in getDevices list');
      return false;
    }
    console.log('[Niimbot] Found device:', device.name, 'gatt:', !!device.gatt);

    // Спершу пробуємо пряме підключення (якщо пристрій вже в зоні)
    if (device.gatt) {
      try {
        await connectToDevice(device);
        return true;
      } catch (e) {
        console.log('[Niimbot] Direct reconnect failed, trying watchAdvertisements...', e.message);
      }
    }

    // Якщо пряме не спрацювало — підписуємось на рекламні пакети
    if (typeof device.watchAdvertisements === 'function' && !watchingDevice) {
      watchingDevice = device;
      device.addEventListener('advertisementreceived', async () => {
        if (connected) return; // Вже підключені
        console.log('[Niimbot] Advertisement received — connecting...');
        try {
          await connectToDevice(device);
        } catch (e) {
          console.warn('[Niimbot] Connect after advertisement failed:', e.message);
        }
      });
      await device.watchAdvertisements();
      console.log('[Niimbot] Watching for printer advertisements...');
    }

    return false;
  } catch (e) {
    console.warn('[Niimbot] Auto-reconnect setup failed:', e.message);
    client = null;
    connected = false;
    return false;
  }
}

export async function connect() {
  if (connected && client) return true;

  // Зупиняємо авто-реконнект якщо працює
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }

  // Спершу пробуємо тихе перепідключення
  if (await tryAutoReconnect()) return true;

  // Fallback — показуємо picker
  client = new NiimbotBluetoothClient();

  try {
    await client.connect();
    connected = true;
    notifyStatus();

    // Зберігаємо device ID для майбутнього auto-reconnect
    try {
      const gatt = client.gattServer;
      if (gatt?.device?.id) {
        localStorage.setItem(DEVICE_ID_KEY, gatt.device.id);

        // Підписуємось на disconnect для авто-реконнекту
        const device = gatt.device;
        const disconnectListener = () => {
          console.log('[Niimbot] Disconnected (picker) — scheduling auto-reconnect...');
          connected = false;
          client = null;
          notifyStatus();
          device.removeEventListener('gattserverdisconnected', disconnectListener);
          scheduleReconnect(device);
        };
        device.addEventListener('gattserverdisconnected', disconnectListener);

        // Запускаємо watchAdvertisements для майбутніх сесій
        if (typeof device.watchAdvertisements === 'function') {
          watchingDevice = device;
          device.addEventListener('advertisementreceived', async () => {
            if (connected) return;
            console.log('[Niimbot] Advertisement received — reconnecting...');
            try { await connectToDevice(device); } catch { /* retry via schedule */ }
          });
          device.watchAdvertisements().catch(() => {});
        }
      }
    } catch { /* ignore */ }

    // Застосовуємо налаштування принтера
    await applyPrinterSettings();

    return true;
  } catch (e) {
    console.error('Niimbot connect error:', e);
    connected = false;
    throw e;
  }
}

export function disconnect() {
  // Зупиняємо авто-реконнект
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  reconnectAttempts = 10; // Блокуємо подальші спроби

  if (watchingDevice) {
    try { watchingDevice.forget(); } catch { /* ignore */ }
    watchingDevice = null;
  }

  if (client) {
    try { client.disconnect(); } catch { /* ignore */ }
    connected = false;
    client = null;
  }

  localStorage.removeItem(DEVICE_ID_KEY);
  notifyStatus();
}

export function isConnected() {
  return connected;
}

/** Чи є збережений пристрій І чи доступний auto-reconnect API */
export function hasSavedDevice() {
  return !!localStorage.getItem(DEVICE_ID_KEY) && !!navigator.bluetooth?.getDevices;
}

/**
 * Надсилає налаштування принтера (autoShutdown, sound) після підключення.
 */
async function applyPrinterSettings() {
  if (!client || !connected) return;
  try {
    const s = getSettings();
    const cmds = [];
    if (typeof PacketGenerator.setAutoShutDownTime === 'function') {
      cmds.push(PacketGenerator.setAutoShutDownTime(s.autoShutdown));
    }
    if (typeof PacketGenerator.setSoundSettings === 'function') {
      cmds.push(PacketGenerator.setSoundSettings(1, s.sound ? 1 : 0));
    }
    if (cmds.length > 0) {
      await client.abstraction.sendAll(cmds);
      console.log('[Niimbot] Applied settings: shutdown=' + s.autoShutdown + 'min, sound=' + s.sound);
    }
  } catch (e) {
    console.warn('[Niimbot] Failed to apply printer settings:', e.message);
  }
}

// --- Battery ---

// BatteryChargeLevel enum: 0=0%, 1=25%, 2=50%, 3=75%, 4=100%
const BATTERY_MAP = { 0: 0, 1: 25, 2: 50, 3: 75, 4: 100 };

/**
 * Повертає рівень заряду батареї принтера у відсотках (0, 25, 50, 75, 100).
 * Повертає null якщо принтер не підключений або дані недоступні.
 */
export function getBatteryLevel() {
  if (!connected || client?.info?.charge == null) return null;
  return BATTERY_MAP[client.info.charge] ?? null;
}

// --- Status listeners (для UI-компонентів) ---
const statusListeners = new Set();

export function onStatusChange(cb) {
  statusListeners.add(cb);
  return () => statusListeners.delete(cb);
}

function notifyStatus() {
  const s = connected;
  statusListeners.forEach(cb => { try { cb(s); } catch {} });
}

// --- Periodic auto-reconnect після завантаження сторінки ---
let autoReconnectInterval = null;
let autoReconnectCount = 0;
const AUTO_RECONNECT_MAX = 20;     // максимум спроб
const AUTO_RECONNECT_DELAY = 3000; // кожні 3с

function startPeriodicReconnect() {
  if (autoReconnectInterval) return;
  autoReconnectCount = 0;

  // Перша спроба через 1с, далі кожні 3с
  setTimeout(() => {
    if (connected || autoReconnectInterval) return;
    tryAutoReconnect().then(ok => {
      if (ok) { notifyStatus(); return; }
      // Не вдалося — стартуємо інтервал
      runPeriodicInterval();
    }).catch(() => runPeriodicInterval());
  }, 1000);
}

function runPeriodicInterval() {
  if (autoReconnectInterval || connected) return;
  autoReconnectInterval = setInterval(async () => {
    if (connected) {
      // Вже підключені — зупиняємо
      clearInterval(autoReconnectInterval);
      autoReconnectInterval = null;
      return;
    }
    autoReconnectCount++;
    if (autoReconnectCount > AUTO_RECONNECT_MAX) {
      console.log('[Niimbot] Periodic auto-reconnect stopped after', AUTO_RECONNECT_MAX, 'attempts');
      clearInterval(autoReconnectInterval);
      autoReconnectInterval = null;
      return;
    }
    try {
      const ok = await tryAutoReconnect();
      if (ok) {
        console.log('[Niimbot] Periodic auto-reconnect succeeded on attempt', autoReconnectCount);
        notifyStatus();
        clearInterval(autoReconnectInterval);
        autoReconnectInterval = null;
      }
    } catch {}
  }, AUTO_RECONNECT_DELAY);
}

// Спроба auto-reconnect при завантаженні модуля
tryAutoReconnect().then(ok => {
  if (ok) {
    notifyStatus();
  } else {
    // Не вдалося одразу — запускаємо періодичні спроби
    startPeriodicReconnect();
  }
}).catch(() => {
  startPeriodicReconnect();
});

// --- Label canvas generation ---

const DPI = 203;
const PX_PER_MM = DPI / 25.4;
const LABEL_W_PX = 384; // printhead pixels (~48mm)
const LABEL_H_PX = Math.round(30 * PX_PER_MM); // ~240px (~30mm)

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
 * Малює наліпку замовлення або клієнта.
 * Layout: barcode top, info left-aligned below, logo right-bottom.
 */
export function createLabelCanvas(type, data) {
  const s = getSettings();
  const canvas = document.createElement('canvas');
  canvas.width = LABEL_W_PX;
  canvas.height = LABEL_H_PX;
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
  const logoW = logoH * (LOGO_VIEWBOX.w / LOGO_VIEWBOX.h); // ~106px
  const logoX = canvas.width - mr - logoW;
  const logoY = LABEL_H_PX - mb - logoH;
  drawLogo(ctx, logoX, logoY, logoH);

  // Зона контенту — вся ширина (штрих-код), текст зліва
  const contentW = canvas.width - ml - mr;
  const leftX = ml;

  ctx.fillStyle = '#000';

  if (type === 'order') {
    const orderId = data?.id || '?';
    const barcodeValue = `ORD${orderId}`;
    const totalPrice = data?.allPrice ?? data?.totalPrice ?? '';
    const clientId = data?.client?.id || data?.clientId || '';
    const clientName = getClientName(data);

    // Barcode — верхня частина (без тексту під ним)
    const barY = mt;
    const barH = Math.round((LABEL_H_PX - mt - s.marginBottom) * 0.42);
    const barCenterX = leftX + contentW / 2;
    drawCode128Bars(ctx, barcodeValue, barCenterX, barY, contentW, barH);

    // Info під штрих-кодом — великий шрифт, вирівняно зліва
    const infoY = barY + barH + 6;
    ctx.textBaseline = 'top';

    // Номер замовлення
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'left';
    const orderLabel = `\u2116${orderId}`;
    ctx.fillText(orderLabel, leftX, infoY);

    // Ціна
    if (totalPrice) {
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'left';
      const numW = ctx.measureText(orderLabel + '  ').width;
      ctx.fillText(`${totalPrice} грн`, leftX + numW, infoY);
    }

    // Клієнт
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'left';
    const clientLine = clientId ? `ID:${clientId} ${clientName}` : clientName;
    ctx.fillText(clientLine, leftX, infoY + 42);

    // ОПЛАЧЕНО — під клієнтом (3-й рядок тексту)
    const isPaid = data?.Payment?.status === 'PAID'
      || data?.paid === true
      || data?.paymentStatus === 'paid';
    if (isPaid) {
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('ОПЛАЧЕНО', leftX, infoY + 42 + 34);
    }

  } else {
    // Client label
    const clientId = data?.id || '?';
    const barcodeValue = `CLN${clientId}`;
    const clientName = [data?.firstName, data?.lastName].filter(Boolean).join(' ') || `Client #${clientId}`;

    // Barcode
    const barY = mt;
    const barH = Math.round((LABEL_H_PX - mt - s.marginBottom) * 0.45);
    const barCenterX = leftX + contentW / 2;
    drawCode128Bars(ctx, barcodeValue, barCenterX, barY, contentW, barH);

    // Client info — великий шрифт
    const infoY = barY + barH + 6;
    ctx.textBaseline = 'top';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`ID:${clientId}`, leftX, infoY);

    ctx.font = 'bold 28px monospace';
    ctx.fillText(clientName, leftX, infoY + 42);
  }

  return canvas;
}

function getClientName(data) {
  const c = data?.client;
  if (c) return [c.firstName, c.lastName].filter(Boolean).join(' ') || `Client #${c.id}`;
  return '';
}

/**
 * Code128B barcode encoding.
 * Returns array of bar widths (alternating black/white starting with black).
 */
function encodeCode128B(value) {
  const CODE128B_START = 104;
  const CODE128_STOP = 106;

  // Code128 patterns: each symbol = 6 bars (3 black + 3 white), total width 11 modules
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

  // Start code B
  codes.push(CODE128B_START);

  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i) - 32;
    codes.push(code);
    checksum += code * (i + 1);
  }

  // Checksum
  codes.push(checksum % 103);
  // Stop
  codes.push(CODE128_STOP);

  // Convert codes to bar widths
  const bars = [];
  for (const code of codes) {
    const pattern = PATTERNS[code];
    if (pattern) {
      for (const w of pattern) bars.push(w);
    }
  }

  return bars;
}

/**
 * Малює Code128 штрих-код на canvas.
 */
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

// --- Printing ---

export async function printCanvas(canvas, copies = 1) {
  if (!client || !connected) {
    throw new Error('Принтер не підключений.');
  }

  const s = getSettings();
  const encoded = ImageEncoder.encodeCanvas(canvas, 'top');

  console.log('[Niimbot] encoded rows:', encoded.rows, 'cols:', encoded.cols);

  const abstraction = client.abstraction;

  // 1. Init — setDensity, setLabelType, printStart2b(1) з явним totalPages=1
  await abstraction.sendAll([
    PacketGenerator.setDensity(s.temperature || s.density),
    PacketGenerator.setLabelType(s.labelType),
    PacketGenerator.printStart2b(1), // явно: друкуємо рівно 1 сторінку
  ]);
  console.log('[Niimbot] printInit done (printStart2b totalPages=1)');

  // 2. Page data — printClear, pageStart, pageSize, quantity=1, imageData, pageEnd
  await abstraction.sendAll([
    PacketGenerator.printClear(),
    PacketGenerator.pageStart(),
    PacketGenerator.setPageSize4b(encoded.rows, encoded.cols),
    PacketGenerator.setPrintQuantity(1),
    ...PacketGenerator.writeImageData(encoded, { printheadPixels: 384 }),
    PacketGenerator.pageEnd(),
  ]);
  console.log('[Niimbot] printPage done, waiting for printer...');

  // 3. Чекаємо щоб принтер фізично закінчив, потім одноразовий printEnd
  await new Promise(r => setTimeout(r, 1500));
  const printEndResult = await abstraction.printEnd().catch(() => false);
  console.log('[Niimbot] printEnd result:', printEndResult);

  console.log('[Niimbot] print done — 1 label');
}

// Mutex — запобігає подвійному друку при швидких кліках
let printLock = false;
let lastPrintTime = 0;
const MIN_PRINT_INTERVAL = 5000; // 5с мінімум між друками

export async function printLabel(type, data, copies = 1) {
  const now = Date.now();
  if (printLock || (now - lastPrintTime < MIN_PRINT_INTERVAL)) {
    console.warn('[Niimbot] printLabel skipped — lock:', printLock, 'cooldown:', now - lastPrintTime, 'ms');
    return;
  }
  printLock = true;
  lastPrintTime = now;

  try {
    console.log('[Niimbot] printLabel v8, type:', type);

    const wasDisconnected = !connected;
    if (wasDisconnected) await connect();

    // Після нового підключення даємо принтеру час стабілізуватись
    if (wasDisconnected) {
      await new Promise(r => setTimeout(r, 2000));
    }

    // Чекаємо завантаження шрифтів
    await document.fonts.ready;

    const canvas = createLabelCanvas(type, data);

    // Перевіряємо що canvas не пустий
    const imgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let blackPx = 0;
    for (let i = 0; i < imgData.length; i += 4) {
      if (imgData[i] < 128) blackPx++;
    }
    console.log('[Niimbot] canvas blackPx:', blackPx, '/', canvas.width * canvas.height);
    // DEBUG: вивести canvas як картинку в консоль
    console.log('[Niimbot] canvas preview:', canvas.toDataURL('image/png'));

    if (blackPx === 0) {
      throw new Error('Canvas порожній — нічого друкувати');
    }

    await printCanvas(canvas, 1);
  } finally {
    printLock = false;
  }
}

export { applyPrinterSettings };

export default {
  connect,
  disconnect,
  isConnected,
  hasSavedDevice,
  onStatusChange,
  printLabel,
  printCanvas,
  createLabelCanvas,
  applyPrinterSettings,
};
