import React, { useState, useCallback, useEffect } from "react";
import { getSettings, saveSettings, testConnection, testPrint } from "../../barcode/niimbotPrintService";
import {
  isConnected as scannerIsConnected,
  connect as scannerConnect,
  disconnect as scannerDisconnect,
  onStatusChange as scannerOnStatusChange,
} from "../../barcode/barcodeScannerService";

const LS_KEY = "printpeaks_barcode_printer_settings";

const DEFAULTS = {
  printerHost: "192.168.0.150",
  printerPort: 9100,
  labelWidth: 50,
  labelHeight: 30,
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

const SPEED_OPTIONS = [
  { value: 1, label: "1 — Повільна" },
  { value: 2, label: "2 — Нормальна" },
  { value: 3, label: "3 — Середня" },
  { value: 4, label: "4 — Швидка" },
  { value: 5, label: "5 — Максимальна" },
];

const LABEL_SIZE_OPTIONS = [
  { w: 50, h: 30, label: "50 x 30 мм" },
  { w: 40, h: 30, label: "40 x 30 мм" },
  { w: 58, h: 40, label: "58 x 40 мм" },
  { w: 100, h: 100, label: "100 x 100 мм" },
];

export default function NiimbotSettings() {
  const [settings, setSettings] = useState(getSettings);
  const [dirtyFields, setDirtyFields] = useState(new Set());

  // Connection test
  const [connTesting, setConnTesting] = useState(false);
  const [connResult, setConnResult] = useState(null);

  // Print test
  const [printing, setPrinting] = useState(false);
  const [printResult, setPrintResult] = useState(null);

  // Scanner state
  const [scanConnected, setScanConnected] = useState(scannerIsConnected());
  const [scanConnecting, setScanConnecting] = useState(false);

  // Load settings from server
  useEffect(() => {
    import("../../../hooks/useUserSettings").then(({ loadSetting }) => {
      loadSetting("barcode_printer_settings", DEFAULTS).then((val) =>
        setSettings(val)
      );
    }).catch(() => {});
  }, []);

  // Scanner status listener
  useEffect(() => {
    return scannerOnStatusChange((isConn) => setScanConnected(isConn));
  }, []);

  const update = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setDirtyFields((prev) => new Set(prev).add(key));
  }, []);

  const saveField = useCallback(
    (field) => {
      saveSettings(settings);
      setDirtyFields((prev) => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    },
    [settings]
  );

  const saveAll = useCallback(() => {
    saveSettings(settings);
    setDirtyFields(new Set());
  }, [settings]);

  const reset = useCallback(() => {
    setSettings({ ...DEFAULTS });
    saveSettings(DEFAULTS);
    setDirtyFields(new Set());
  }, []);

  const handleTestConnection = async () => {
    setConnTesting(true);
    setConnResult(null);
    try {
      // Save current settings first
      saveSettings(settings);
      setDirtyFields(new Set());
      await testConnection();
      setConnResult({ ok: true, msg: "З'єднання OK" });
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setConnResult({ ok: false, msg });
    } finally {
      setConnTesting(false);
    }
  };

  const handleTestPrint = async () => {
    setPrinting(true);
    setPrintResult(null);
    try {
      saveSettings(settings);
      setDirtyFields(new Set());
      await testPrint();
      setPrintResult({ ok: true, msg: "Тестова наліпка надрукована" });
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setPrintResult({ ok: false, msg });
    } finally {
      setPrinting(false);
    }
  };

  const SaveBtn = ({ field }) =>
    dirtyFields.has(field) ? (
      <button
        className="nbs-btn nbs-btn--save"
        onClick={() => saveField(field)}
      >
        ✓
      </button>
    ) : null;

  const isDirty = dirtyFields.size > 0;

  return (
    <div className="nbs-wrap">
      {/* ── Заголовок ── */}
      <div className="nbs-header">
        <span className="nbs-title">Принтер етикеток (TCP)</span>
        <div className="nbs-status">
          <span
            className={`nbs-dot ${
              connResult?.ok ? "nbs-dot--on" : ""
            }`}
          />
          <span className="nbs-status-text">
            {connResult
              ? connResult.ok
                ? "Підключено"
                : "Помилка"
              : "Не перевірено"}
          </span>
        </div>
      </div>

      {/* ── Мережа ── */}
      <div className="nbs-section">
        <div className="nbs-section-title">Мережа</div>
        <div className="nbs-row">
          <label className="nbs-label">IP адреса</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              className="nbs-input"
              type="text"
              value={settings.printerHost}
              onChange={(e) => update("printerHost", e.target.value)}
              placeholder="192.168.0.150"
              style={{ width: "140px" }}
            />
            <SaveBtn field="printerHost" />
          </div>
        </div>

        <div className="nbs-row">
          <label className="nbs-label">Порт</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              className="nbs-input"
              type="number"
              value={settings.printerPort}
              onChange={(e) =>
                update("printerPort", Math.max(1, Number(e.target.value)))
              }
              style={{ width: "80px" }}
            />
            <SaveBtn field="printerPort" />
          </div>
        </div>

        <div className="nbs-row">
          <label className="nbs-label">Статус</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {connResult && (
              <span
                style={{
                  color: connResult.ok
                    ? "var(--admingreen)"
                    : "var(--adminred)",
                }}
              >
                {connResult.msg}
              </span>
            )}
            <button
              className="nbs-btn nbs-btn--connect"
              onClick={handleTestConnection}
              disabled={connTesting}
              style={{ minWidth: 120 }}
            >
              {connTesting ? "Перевірка..." : "Тест з'єднання"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Розмір наліпки ── */}
      <div className="nbs-section">
        <div className="nbs-section-title">Наліпка</div>
        <div className="nbs-row">
          <label className="nbs-label">Розмір</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <select
              className="nbs-select"
              value={`${settings.labelWidth}x${settings.labelHeight}`}
              onChange={(e) => {
                const opt = LABEL_SIZE_OPTIONS.find(
                  (o) => `${o.w}x${o.h}` === e.target.value
                );
                if (opt) {
                  update("labelWidth", opt.w);
                  update("labelHeight", opt.h);
                }
              }}
            >
              {LABEL_SIZE_OPTIONS.map((o) => (
                <option key={`${o.w}x${o.h}`} value={`${o.w}x${o.h}`}>
                  {o.label}
                </option>
              ))}
            </select>
            <SaveBtn field="labelWidth" />
          </div>
        </div>

        <div className="nbs-row">
          <label className="nbs-label">Проміжок (gap)</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              className="nbs-input"
              type="number"
              min={0}
              max={10}
              value={settings.gap}
              onChange={(e) =>
                update(
                  "gap",
                  Math.max(0, Math.min(10, Number(e.target.value)))
                )
              }
              style={{ width: "60px" }}
            />
            <span className="nbs-label" style={{ minWidth: 'auto' }}>мм</span>
            <SaveBtn field="gap" />
          </div>
        </div>
      </div>

      {/* ── Якість друку ── */}
      <div className="nbs-section">
        <div className="nbs-section-title">Якість друку</div>
        <div className="nbs-row">
          <label className="nbs-label">Швидкість</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <select
              className="nbs-select"
              value={settings.speed}
              onChange={(e) => update("speed", Number(e.target.value))}
            >
              {SPEED_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <SaveBtn field="speed" />
          </div>
        </div>

        <div className="nbs-row">
          <label className="nbs-label">Density (1-15)</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              className="nbs-input"
              type="number"
              min={1}
              max={15}
              value={settings.density}
              onChange={(e) =>
                update(
                  "density",
                  Math.max(1, Math.min(15, Number(e.target.value)))
                )
              }
              style={{ width: "60px" }}
            />
            <SaveBtn field="density" />
          </div>
        </div>

        <div className="nbs-row">
          <label className="nbs-label">Поріг Ч/Б (threshold)</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              className="nbs-input"
              type="range"
              min={50}
              max={200}
              step={1}
              value={settings.threshold}
              onChange={(e) => update("threshold", Number(e.target.value))}
              style={{ width: "120px" }}
            />
            <span className="nbs-label" style={{ minWidth: 'auto' }}>{settings.threshold}</span>
            <SaveBtn field="threshold" />
          </div>
        </div>
      </div>

      {/* ── Зсув ── */}
      <div className="nbs-section">
        <div className="nbs-section-title">Зсув зображення (мм)</div>
        <div className="nbs-margins-grid">
          {[
            { key: "offsetX", label: "По X" },
            { key: "offsetY", label: "По Y" },
          ].map((m) => (
            <div className="nbs-margin-item" key={m.key}>
              <label className="nbs-label">{m.label}</label>
              <input
                className="nbs-input"
                type="number"
                min={-20}
                max={20}
                value={settings[m.key]}
                onChange={(e) =>
                  update(
                    m.key,
                    Math.max(-20, Math.min(20, Number(e.target.value)))
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Поля наліпки ── */}
      <div className="nbs-section">
        <div className="nbs-section-title">Поля наліпки (px)</div>
        <div className="nbs-margins-grid">
          {[
            { key: "marginTop", label: "Верх" },
            { key: "marginBottom", label: "Низ" },
            { key: "marginLeft", label: "Ліво" },
            { key: "marginRight", label: "Право" },
          ].map((m) => (
            <div className="nbs-margin-item" key={m.key}>
              <label className="nbs-label">{m.label}</label>
              <input
                className="nbs-input"
                type="number"
                min={0}
                max={80}
                value={settings[m.key]}
                onChange={(e) =>
                  update(
                    m.key,
                    Math.max(0, Math.min(80, Number(e.target.value)))
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Дії ── */}
      <div className="nbs-actions">
        {isDirty && (
          <button className="nbs-btn nbs-btn--save" onClick={saveAll}>
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

      {printResult && (
        <div
          className="nbs-section"
          style={{
            color: printResult.ok
              ? "var(--admingreen)"
              : "var(--adminred)",
          }}
        >
          {printResult.msg}
        </div>
      )}

      {/* ── Сканер штрих-кодів ── */}
      <div className="nbs-header" style={{ marginTop: "2rem" }}>
        <span className="nbs-title">Сканер штрих-кодів (BLE)</span>
        <div className="nbs-status">
          <span
            className={`nbs-dot ${scanConnected ? "nbs-dot--on" : ""}`}
          />
          <span className="nbs-status-text">
            {scanConnected ? "Підключено" : "Не підключено"}
          </span>
          {scanConnected ? (
            <button
              className="nbs-btn nbs-btn--disconnect"
              onClick={() => {
                scannerDisconnect();
                setScanConnected(false);
              }}
            >
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
          <span className="nbs-value">
            ORD{"{id}"} — замовлення, CLN{"{id}"} — клієнт
          </span>
        </div>
        <div className="nbs-row">
          <label className="nbs-label">Підключення принтера</label>
          <span className="nbs-value">
            TCP/IP (Wi-Fi) — {settings.printerHost}:{settings.printerPort}
          </span>
        </div>
        <div className="nbs-row">
          <label className="nbs-label">USB-сканери</label>
          <span className="nbs-value">
            Працюють автоматично (емуляція клавіатури)
          </span>
        </div>
      </div>
    </div>
  );
}
