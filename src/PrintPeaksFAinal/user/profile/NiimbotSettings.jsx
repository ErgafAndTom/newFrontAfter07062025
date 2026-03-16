import React, { useState, useEffect, useCallback } from "react";
import { isConnected, connect, disconnect, printLabel, applyPrinterSettings } from "../../barcode/niimbotPrintService";
import {
  isConnected as scannerIsConnected,
  connect as scannerConnect,
  disconnect as scannerDisconnect,
  onStatusChange as scannerOnStatusChange,
} from "../../barcode/barcodeScannerService";

const LS_KEY = "printpeaks_niimbot_settings";

const DEFAULTS = {
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

const DENSITY_OPTIONS = [
  { value: 1, label: "1 — Мінімальна" },
  { value: 2, label: "2 — Легка" },
  { value: 3, label: "3 — Середня" },
  { value: 4, label: "4 — Підвищена" },
  { value: 5, label: "5 — Максимальна" },
];

const TEMP_MIN = 1;
const TEMP_MAX = 5;

const LABEL_TYPE_OPTIONS = [
  { value: 1, label: "З проміжками (die-cut)" },
  { value: 2, label: "Чорна мітка" },
  { value: 5, label: "Прозорі" },
];

const SPEED_OPTIONS = [
  { value: 1, label: "1 — Повільна" },
  { value: 2, label: "2 — Нормальна" },
  { value: 3, label: "3 — Швидка" },
];

const SHUTDOWN_OPTIONS = [
  { value: 0, label: "Вимкнено" },
  { value: 5, label: "5 хвилин" },
  { value: 10, label: "10 хвилин" },
  { value: 15, label: "15 хвилин" },
  { value: 30, label: "30 хвилин" },
  { value: 60, label: "60 хвилин" },
];

export function getNiimbotSettings() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULTS };
}

export default function NiimbotSettings() {
  const [settings, setSettings] = useState(getNiimbotSettings);
  const [dirty, setDirty] = useState(false);
  const [btConnected, setBtConnected] = useState(isConnected());
  const [connecting, setConnecting] = useState(false);
  const [printing, setPrinting] = useState(false);

  // Scanner state
  const [scanConnected, setScanConnected] = useState(scannerIsConnected());
  const [scanConnecting, setScanConnecting] = useState(false);

  // Poll Niimbot connection status
  useEffect(() => {
    const iv = setInterval(() => setBtConnected(isConnected()), 1000);
    return () => clearInterval(iv);
  }, []);

  // Scanner status listener
  useEffect(() => {
    return scannerOnStatusChange((isConn) => setScanConnected(isConn));
  }, []);

  const update = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  const save = useCallback(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(settings));
    setDirty(false);
    // Застосовуємо налаштування принтера якщо підключений
    if (isConnected()) {
      applyPrinterSettings().catch(() => {});
    }
  }, [settings]);

  const reset = useCallback(() => {
    setSettings({ ...DEFAULTS });
    localStorage.removeItem(LS_KEY);
    setDirty(false);
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connect();
      setBtConnected(true);
    } catch (e) {
      console.error("Niimbot connect error:", e);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setBtConnected(false);
  };

  const handleTestPrint = async () => {
    setPrinting(true);
    try {
      // Зберігаємо поточні налаштування перед друком
      localStorage.setItem(LS_KEY, JSON.stringify(settings));
      setDirty(false);
      await printLabel('order', {
        id: 12345,
        allPrice: '999.00',
        client: { id: 1, firstName: 'Тест', lastName: 'Друку' },
      });
    } catch (e) {
      console.error('Test print error:', e);
      alert('Помилка друку: ' + e.message);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="nbs-wrap">
      <div className="nbs-header">
        <span className="nbs-title">Niimbot B21S</span>
        <div className="nbs-status">
          <span className={`nbs-dot ${btConnected ? "nbs-dot--on" : ""}`} />
          <span className="nbs-status-text">
            {btConnected ? "Підключено" : "Не підключено"}
          </span>
          {btConnected ? (
            <button className="nbs-btn nbs-btn--disconnect" onClick={handleDisconnect}>
              Відключити
            </button>
          ) : (
            <button
              className="nbs-btn nbs-btn--connect"
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? "Підключення..." : "Підключити"}
            </button>
          )}
        </div>
      </div>

      <div className="nbs-section">
        <div className="nbs-section-title">Якість друку</div>
        <div className="nbs-row">
          <label className="nbs-label">Цупкість (density)</label>
          <select
            className="nbs-select"
            value={settings.density}
            onChange={e => update("density", Number(e.target.value))}
          >
            {DENSITY_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="nbs-row">
          <label className="nbs-label">Температура друку</label>
          <div className="nbs-temp-control">
            <input
              className="nbs-range"
              type="range"
              min={TEMP_MIN}
              max={TEMP_MAX}
              step={1}
              value={settings.temperature}
              onChange={e => update("temperature", Number(e.target.value))}
            />
            <span className="nbs-temp-value">{settings.temperature}</span>
          </div>
        </div>

        <div className="nbs-row">
          <label className="nbs-label">Тип наліпки</label>
          <select
            className="nbs-select"
            value={settings.labelType}
            onChange={e => update("labelType", Number(e.target.value))}
          >
            {LABEL_TYPE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="nbs-section">
        <div className="nbs-section-title">Швидкість та копії</div>
        <div className="nbs-row">
          <label className="nbs-label">Копій за друк</label>
          <input
            className="nbs-input"
            type="number"
            min={1}
            max={10}
            value={settings.copies}
            onChange={e => update("copies", Math.max(1, Math.min(10, Number(e.target.value))))}
          />
        </div>

        <div className="nbs-row">
          <label className="nbs-label">Швидкість друку</label>
          <select
            className="nbs-select"
            value={settings.speed}
            onChange={e => update("speed", Number(e.target.value))}
          >
            {SPEED_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="nbs-section">
        <div className="nbs-section-title">Принтер</div>
        <div className="nbs-row">
          <label className="nbs-label">Авто-вимкнення</label>
          <select
            className="nbs-select"
            value={settings.autoShutdown}
            onChange={e => update("autoShutdown", Number(e.target.value))}
          >
            {SHUTDOWN_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="nbs-row">
          <label className="nbs-label">Звук</label>
          <button
            className={`nbs-btn ${settings.sound ? "nbs-btn--connect" : "nbs-btn--disconnect"}`}
            style={{ minWidth: 80 }}
            onClick={() => update("sound", !settings.sound)}
          >
            {settings.sound ? "Увімк." : "Вимк."}
          </button>
        </div>
      </div>

      <div className="nbs-section">
        <div className="nbs-section-title">Поля наліпки (px)</div>
        <div className="nbs-margins-grid">
          {[
            { key: "marginTop", label: "Верх" },
            { key: "marginBottom", label: "Низ" },
            { key: "marginLeft", label: "Ліво" },
            { key: "marginRight", label: "Право" },
          ].map(m => (
            <div className="nbs-margin-item" key={m.key}>
              <label className="nbs-label">{m.label}</label>
              <input
                className="nbs-input"
                type="number"
                min={0}
                max={80}
                value={settings[m.key]}
                onChange={e => update(m.key, Math.max(0, Math.min(80, Number(e.target.value))))}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="nbs-actions">
        {dirty && (
          <button className="nbs-btn nbs-btn--save" onClick={save}>
            ✓
          </button>
        )}
        <button
          className="nbs-btn nbs-btn--test"
          onClick={handleTestPrint}
          disabled={printing}
        >
          {printing ? "Друкую..." : "Тест друку"}
        </button>
        <button className="nbs-btn nbs-btn--reset" onClick={reset}>
          Скинути все
        </button>
      </div>

      {/* ── Сканер штрих-кодів ── */}
      <div className="nbs-header" style={{ marginTop: '2rem' }}>
        <span className="nbs-title">Сканер штрих-кодів (BLE)</span>
        <div className="nbs-status">
          <span className={`nbs-dot ${scanConnected ? "nbs-dot--on" : ""}`} />
          <span className="nbs-status-text">
            {scanConnected ? "Підключено" : "Не підключено"}
          </span>
          {scanConnected ? (
            <button className="nbs-btn nbs-btn--disconnect" onClick={() => { scannerDisconnect(); setScanConnected(false); }}>
              Відключити
            </button>
          ) : (
            <button
              className="nbs-btn nbs-btn--connect"
              onClick={async () => {
                setScanConnecting(true);
                try {
                  await scannerConnect();
                  setScanConnected(true);
                } catch (e) {
                  console.error("Scanner connect error:", e);
                } finally {
                  setScanConnecting(false);
                }
              }}
              disabled={scanConnecting}
            >
              {scanConnecting ? "Підключення..." : "Підключити"}
            </button>
          )}
        </div>
      </div>

      <div className="nbs-section">
        <div className="nbs-section-title">Інформація</div>
        <div className="nbs-row">
          <label className="nbs-label">Підтримувані формати</label>
          <span className="nbs-value">ORD{"{id}"} → замовлення, CLN{"{id}"} → клієнт</span>
        </div>
        <div className="nbs-row">
          <label className="nbs-label">Підключення</label>
          <span className="nbs-value">Bluetooth Low Energy (Web Bluetooth API)</span>
        </div>
        <div className="nbs-row">
          <label className="nbs-label">USB-сканери</label>
          <span className="nbs-value">Працюють автоматично (емуляція клавіатури)</span>
        </div>
      </div>
    </div>
  );
}
