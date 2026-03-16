/**
 * barcodeScannerService.js — Web Bluetooth підключення до BLE сканера штрих-кодів
 * (Netum C70 та аналогічні). Архітектура — singleton + pub/sub,
 * ідентична niimbotPrintService.js.
 */

// BLE Service UUIDs (різні виробники використовують різні)
const SCANNER_SERVICE_UUIDS = [
  '0000fff0-0000-1000-8000-00805f9b34fb',        // FFF0 (найпоширеніший)
  '0000ffe0-0000-1000-8000-00805f9b34fb',        // FFE0
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',        // Nordic UART / Telit SPP
];

// Notify Characteristic UUIDs (для отримання даних від сканера)
const SCANNER_CHAR_UUIDS = [
  '0000fff1-0000-1000-8000-00805f9b34fb',        // FFF1
  '0000ffe1-0000-1000-8000-00805f9b34fb',        // FFE1
  '49535343-1e4d-4bd9-ba61-23c647249616',        // Nordic UART RX
];

const DEVICE_ID_KEY = 'printpeaks_scanner_deviceId';

// Singleton state
let gattServer = null;
let characteristic = null;
let connected = false;
let reconnectAttempts = 0;
let watchingDevice = null;
let reconnectTimer = null;
let scanBuffer = '';  // Буфер для фрагментованих BLE пакетів

// --- Connection ---

/**
 * Знаходить notify characteristic у BLE сервісі сканера.
 */
async function findNotifyCharacteristic(server) {
  for (const svcUuid of SCANNER_SERVICE_UUIDS) {
    let service;
    try {
      service = await server.getPrimaryService(svcUuid);
    } catch { continue; }

    // Спочатку шукаємо серед відомих UUID-ів
    for (const charUuid of SCANNER_CHAR_UUIDS) {
      try {
        const ch = await service.getCharacteristic(charUuid);
        if (ch.properties.notify || ch.properties.indicate) {
          console.log('[Scanner] Found characteristic', charUuid, 'in service', svcUuid);
          return ch;
        }
      } catch { /* ігноруємо — пробуємо наступний */ }
    }

    // Fallback — шукаємо будь-яку notify-характеристику
    try {
      const chars = await service.getCharacteristics();
      for (const ch of chars) {
        if (ch.properties.notify || ch.properties.indicate) {
          console.log('[Scanner] Found notify characteristic (fallback)', ch.uuid, 'in service', svcUuid);
          return ch;
        }
      }
    } catch { /* ігноруємо */ }
  }
  return null;
}

/**
 * Обробник даних від сканера через BLE notification.
 */
function onDataReceived(event) {
  const raw = new TextDecoder().decode(event.target.value);
  scanBuffer += raw;

  // Сканер може відправляти дані частинами — чекаємо на \r\n або \n як завершення
  const endIdx = scanBuffer.indexOf('\n');
  if (endIdx === -1 && scanBuffer.indexOf('\r') === -1) {
    // Ще не прийшов термінатор — але якщо буфер > 100 символів, відправляємо
    if (scanBuffer.length > 100) {
      const barcode = scanBuffer.trim();
      scanBuffer = '';
      if (barcode) notifyScan(barcode);
    }
    return;
  }

  const barcode = scanBuffer.replace(/[\r\n]+$/, '').trim();
  scanBuffer = '';
  if (barcode) {
    console.log('[Scanner] Scanned:', barcode);
    notifyScan(barcode);
  }
}

/**
 * Підключається до BLE пристрою напряму (без picker).
 * Використовується для auto-reconnect і reconnect після розриву.
 */
async function connectToDevice(device) {
  const disconnectListener = () => {
    console.log('[Scanner] Disconnected — scheduling auto-reconnect...');
    connected = false;
    gattServer = null;
    characteristic = null;
    notifyStatus();
    device.removeEventListener('gattserverdisconnected', disconnectListener);
    scheduleReconnect(device);
  };
  device.addEventListener('gattserverdisconnected', disconnectListener);

  const server = await device.gatt.connect();
  const ch = await findNotifyCharacteristic(server);
  if (!ch) {
    server.disconnect();
    throw new Error('No suitable BLE notify characteristic found');
  }

  ch.addEventListener('characteristicvaluechanged', onDataReceived);
  await ch.startNotifications();

  gattServer = server;
  characteristic = ch;
  connected = true;
  reconnectAttempts = 0;
  scanBuffer = '';
  console.log('[Scanner] Connected to', device.name);
  notifyStatus();
}

/**
 * Планує повторну спробу підключення з backoff.
 */
function scheduleReconnect(device) {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (reconnectAttempts >= 10) {
    console.warn('[Scanner] Max reconnect attempts reached. Use manual connect.');
    return;
  }

  const delays = [2000, 3000, 5000, 8000, 10000];
  const delay = delays[Math.min(reconnectAttempts, delays.length - 1)];
  reconnectAttempts++;

  console.log(`[Scanner] Reconnect attempt ${reconnectAttempts} in ${delay / 1000}s...`);
  reconnectTimer = setTimeout(async () => {
    try {
      await connectToDevice(device);
    } catch (e) {
      console.warn('[Scanner] Reconnect failed:', e.message);
      scheduleReconnect(device);
    }
  }, delay);
}

/**
 * Спроба тихого перепідключення до раніше спареного пристрою.
 */
async function tryAutoReconnect() {
  if (!navigator.bluetooth?.getDevices) return false;

  const savedId = localStorage.getItem(DEVICE_ID_KEY);
  if (!savedId) return false;

  try {
    const devices = await navigator.bluetooth.getDevices();
    const device = devices.find(d => d.id === savedId);
    if (!device) return false;

    // Пряме підключення
    if (device.gatt) {
      try {
        await connectToDevice(device);
        return true;
      } catch (e) {
        console.log('[Scanner] Direct reconnect failed, trying watchAdvertisements...', e.message);
      }
    }

    // Fallback — watchAdvertisements
    if (typeof device.watchAdvertisements === 'function' && !watchingDevice) {
      watchingDevice = device;
      device.addEventListener('advertisementreceived', async () => {
        if (connected) return;
        console.log('[Scanner] Advertisement received — connecting...');
        try { await connectToDevice(device); } catch { /* retry via schedule */ }
      });
      await device.watchAdvertisements();
    }

    return false;
  } catch (e) {
    console.warn('[Scanner] Auto-reconnect setup failed:', e.message);
    gattServer = null;
    characteristic = null;
    connected = false;
    return false;
  }
}

// --- Public API ---

export async function connect() {
  if (connected && gattServer) return true;

  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }

  // Спершу тихе перепідключення
  if (await tryAutoReconnect()) return true;

  // Picker — acceptAllDevices бо сканери часто не рекламують стандартні Service UUID
  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: SCANNER_SERVICE_UUIDS,
    });

    await connectToDevice(device);

    // Зберігаємо device ID
    localStorage.setItem(DEVICE_ID_KEY, device.id);

    // watchAdvertisements для майбутніх сесій
    if (typeof device.watchAdvertisements === 'function') {
      watchingDevice = device;
      device.addEventListener('advertisementreceived', async () => {
        if (connected) return;
        try { await connectToDevice(device); } catch { /* retry via schedule */ }
      });
      device.watchAdvertisements().catch(() => {});
    }

    return true;
  } catch (e) {
    console.error('[Scanner] Connect error:', e);
    connected = false;
    throw e;
  }
}

export function disconnect() {
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  reconnectAttempts = 10;

  if (watchingDevice) {
    try { watchingDevice.forget(); } catch {}
    watchingDevice = null;
  }

  if (characteristic) {
    try { characteristic.removeEventListener('characteristicvaluechanged', onDataReceived); } catch {}
    characteristic = null;
  }

  if (gattServer) {
    try { gattServer.disconnect(); } catch {}
    connected = false;
    gattServer = null;
  }

  localStorage.removeItem(DEVICE_ID_KEY);
  notifyStatus();
}

export function isConnected() { return connected; }

export function hasSavedDevice() {
  return !!localStorage.getItem(DEVICE_ID_KEY) && !!navigator.bluetooth?.getDevices;
}

// --- Status listeners (для UI) ---
const statusListeners = new Set();

export function onStatusChange(cb) {
  statusListeners.add(cb);
  return () => statusListeners.delete(cb);
}

function notifyStatus() {
  const s = connected;
  statusListeners.forEach(cb => { try { cb(s); } catch {} });
}

// --- Scan listeners (для отриманих штрих-кодів) ---
const scanListeners = new Set();

export function onScan(cb) {
  scanListeners.add(cb);
  return () => scanListeners.delete(cb);
}

function notifyScan(barcode) {
  scanListeners.forEach(cb => { try { cb(barcode); } catch {} });
}

// --- Periodic auto-reconnect після завантаження сторінки ---
let autoReconnectInterval = null;
let autoReconnectCount = 0;
const AUTO_RECONNECT_MAX = 20;
const AUTO_RECONNECT_DELAY = 3000;

function startPeriodicReconnect() {
  if (autoReconnectInterval) return;
  autoReconnectCount = 0;

  setTimeout(() => {
    if (connected || autoReconnectInterval) return;
    tryAutoReconnect().then(ok => {
      if (ok) { notifyStatus(); return; }
      runPeriodicInterval();
    }).catch(() => runPeriodicInterval());
  }, 1000);
}

function runPeriodicInterval() {
  if (autoReconnectInterval || connected) return;
  autoReconnectInterval = setInterval(async () => {
    if (connected) {
      clearInterval(autoReconnectInterval);
      autoReconnectInterval = null;
      return;
    }
    autoReconnectCount++;
    if (autoReconnectCount > AUTO_RECONNECT_MAX) {
      console.log('[Scanner] Periodic auto-reconnect stopped after', AUTO_RECONNECT_MAX, 'attempts');
      clearInterval(autoReconnectInterval);
      autoReconnectInterval = null;
      return;
    }
    try {
      const ok = await tryAutoReconnect();
      if (ok) {
        console.log('[Scanner] Periodic auto-reconnect succeeded on attempt', autoReconnectCount);
        notifyStatus();
        clearInterval(autoReconnectInterval);
        autoReconnectInterval = null;
      }
    } catch {}
  }, AUTO_RECONNECT_DELAY);
}

// Auto-reconnect при завантаженні модуля
if (hasSavedDevice()) {
  tryAutoReconnect().then(ok => {
    if (ok) notifyStatus();
    else startPeriodicReconnect();
  }).catch(() => startPeriodicReconnect());
}
