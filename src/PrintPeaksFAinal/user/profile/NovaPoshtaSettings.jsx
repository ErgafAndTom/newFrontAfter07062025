import React, { useState, useCallback, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import { getSettings, saveSettings } from "../../barcode/qzTrayService";
import "./NovaPoshtaSettings.css";

const SPEED_OPTIONS = [
  { value: 1, label: "1 — Повільна" },
  { value: 2, label: "2 — Нормальна" },
  { value: 3, label: "3 — Середня" },
  { value: 4, label: "4 — Швидка" },
  { value: 5, label: "5 — Максимальна" },
];

const LABEL_SIZE_OPTIONS = [
  { w: 100, h: 100, label: "100 × 100 мм" },
  { w: 100, h: 150, label: "100 × 150 мм" },
];

const RESOLUTION_OPTIONS = [
  { value: 2, label: "2x — Швидка (низька якість)" },
  { value: 4, label: "4x — Збалансована" },
  { value: 6, label: "6x — Висока якість" },
  { value: 8, label: "8x — Максимальна (повільна)" },
];

export default function NovaPoshtaSettings() {
  const [settings, setSettings] = useState(getSettings);
  const [dirtyFields, setDirtyFields] = useState(new Set());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Завантажити налаштування з сервера
  useEffect(() => {
    import('../../../hooks/useUserSettings').then(({ loadSetting }) => {
      loadSetting('qztray_settings', getSettings()).then(val => setSettings(val));
    }).catch(() => {});
  }, []);

  // Printer connection test
  const [connTesting, setConnTesting] = useState(false);
  const [connResult, setConnResult] = useState(null);

  // API settings from backend .env (read-only display)
  const [apiInfo, setApiInfo] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  const update = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setDirtyFields(prev => new Set(prev).add(key));
  }, []);

  const saveField = useCallback((field) => {
    saveSettings(settings);
    setDirtyFields(prev => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, [settings]);

  const saveAll = useCallback(() => {
    saveSettings(settings);
    setDirtyFields(new Set());
  }, [settings]);

  const reset = useCallback(() => {
    const defaults = {
      printerHost: '192.168.0.47',
      printerPort: 9100,
      labelWidth: 100,
      labelHeight: 100,
      gap: 3,
      speed: 4,
      density: 8,
      resolution: 6,
      sound: true,
      offsetX: 0,
      offsetY: 0,
      threshold: 128,
    };
    setSettings(defaults);
    saveSettings(defaults);
    setDirtyFields(new Set());
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Тестовий друк — відправляємо TSPL команду самоперевірки
      const response = await axios.post('/novaposhta/print-raw', {
        tsplData: 'SIZE 100 mm, 100 mm\r\nGAP 3 mm, 0 mm\r\nCLS\r\nTEXT 50,50,"4",0,1,1,"EZPOS L4-W TEST OK"\r\nPRINT 1,1\r\n',
        host: settings.printerHost,
        port: settings.printerPort,
      });
      setTestResult({ ok: true, msg: 'Тестова наліпка надрукована' });
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setTestResult({ ok: false, msg });
    } finally {
      setTesting(false);
    }
  };

  const handleTestPrinterConnection = async () => {
    setConnTesting(true);
    setConnResult(null);
    try {
      await axios.post('/novaposhta/test-connection', {
        host: settings.printerHost,
        port: settings.printerPort,
      });
      setConnResult({ ok: true, msg: "З'єднання OK" });
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setConnResult({ ok: false, msg });
    } finally {
      setConnTesting(false);
    }
  };

  const handleCheckApi = async () => {
    setApiLoading(true);
    try {
      // Перевіряємо API через простий запит getCities
      const response = await axios.post('/novaposhta/api-proxy', {
        modelName: 'Address',
        calledMethod: 'getCities',
        methodProperties: { FindByString: 'Київ', Limit: '1' },
      });
      const data = response.data;
      if (data?.success) {
        setApiInfo({ ok: true, msg: `API працює (знайдено: ${data.data?.[0]?.Description || 'OK'})` });
      } else {
        setApiInfo({ ok: false, msg: data?.errors?.[0] || 'API повернув помилку' });
      }
    } catch (err) {
      setApiInfo({ ok: false, msg: err?.response?.data?.error || err.message });
    } finally {
      setApiLoading(false);
    }
  };

  const SaveBtn = ({ field }) =>
    dirtyFields.has(field) ? (
      <button className="nps-btn nps-btn--field-save" onClick={() => saveField(field)}>✓</button>
    ) : null;

  return (
    <div className="nps-wrap">
      {/* ── Заголовок ── */}
      <div className="nps-header">
        <span className="nps-title">Нова Пошта</span>
      </div>

      {/* ── API налаштування ── */}
      <div className="nps-section nps-section--full">
        <div className="nps-section-title">API Нової Пошти</div>
        <div className="nps-row">
          <label className="nps-label">Статус API</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {apiInfo ? (
              <span className="nps-value" style={{ color: apiInfo.ok ? 'var(--admingreen)' : 'var(--adminred)' }}>
                {apiInfo.msg}
              </span>
            ) : (
              <span className="nps-value">Не перевірено</span>
            )}
            <button
              className="nps-btn nps-btn--test"
              onClick={handleCheckApi}
              disabled={apiLoading}
              style={{ minWidth: 100 }}
            >
              {apiLoading ? 'Перевірка...' : 'Перевірити'}
            </button>
          </div>
        </div>
        <div className="nps-row">
          <label className="nps-label">API ключ</label>
          <span className="nps-value" style={{ fontSize: 'var(--font-size-xs, 12px)' }}>
            Налаштовується в .env (NOVAPOSHTA_API_KEY)
          </span>
        </div>
        <div className="nps-row">
          <label className="nps-label">API URL</label>
          <span className="nps-value" style={{ fontSize: 'var(--font-size-xs, 12px)' }}>
            Налаштовується в .env (NOVAPOSHTA_API_URL)
          </span>
        </div>
      </div>

      {/* ── Підключення принтера ── */}
      <div className="nps-section">
        <div className="nps-section-title">Підключення принтера</div>
        <div className="nps-row">
          <label className="nps-label">IP адреса</label>
          <input
            className="nps-input nps-input--wide"
            type="text"
            value={settings.printerHost}
            onChange={e => update('printerHost', e.target.value)}
            placeholder="192.168.0.47"
          />
          <SaveBtn field="printerHost" />
        </div>
        <div className="nps-row">
          <label className="nps-label">Порт</label>
          <input
            className="nps-input"
            type="number"
            min={1}
            max={65535}
            value={settings.printerPort}
            onChange={e => update('printerPort', Math.max(1, Math.min(65535, Number(e.target.value))))}
          />
          <SaveBtn field="printerPort" />
        </div>
        <div className="nps-row">
          <label className="nps-label">З'єднання</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {connResult && (
              <span className="nps-value" style={{ color: connResult.ok ? 'var(--admingreen)' : 'var(--adminred)' }}>
                {connResult.msg}
              </span>
            )}
            <button
              className="nps-btn nps-btn--test"
              onClick={handleTestPrinterConnection}
              disabled={connTesting}
              style={{ minWidth: 100 }}
            >
              {connTesting ? 'Перевірка...' : "Тест з'єднання"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Налаштування наліпки ── */}
      <div className="nps-section">
        <div className="nps-section-title">Наліпка</div>
        <div className="nps-row">
          <label className="nps-label">Розмір</label>
          <select
            className="nps-select"
            value={`${settings.labelWidth}x${settings.labelHeight}`}
            onChange={e => {
              const [w, h] = e.target.value.split('x').map(Number);
              setSettings(prev => ({ ...prev, labelWidth: w, labelHeight: h }));
              setDirtyFields(prev => new Set(prev).add('labelWidth'));
            }}
          >
            {LABEL_SIZE_OPTIONS.map(o => (
              <option key={`${o.w}x${o.h}`} value={`${o.w}x${o.h}`}>{o.label}</option>
            ))}
          </select>
          <SaveBtn field="labelWidth" />
        </div>
        <div className="nps-row">
          <label className="nps-label">Проміжок (gap)</label>
          <input
            className="nps-input"
            type="number"
            min={0}
            max={10}
            value={settings.gap}
            onChange={e => update('gap', Math.max(0, Math.min(10, Number(e.target.value))))}
          />
          <span className="nps-value">мм</span>
          <SaveBtn field="gap" />
        </div>
      </div>

      {/* ── Якість друку ── */}
      <div className="nps-section">
        <div className="nps-section-title">Якість друку</div>
        <div className="nps-row">
          <label className="nps-label">Швидкість</label>
          <select
            className="nps-select"
            value={settings.speed}
            onChange={e => update('speed', Number(e.target.value))}
          >
            {SPEED_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <SaveBtn field="speed" />
        </div>
        <div className="nps-row">
          <label className="nps-label">Щільність (density)</label>
          <div className="nps-density-control">
            <input
              className="nps-range"
              type="range"
              min={1}
              max={15}
              step={1}
              value={settings.density}
              onChange={e => update('density', Number(e.target.value))}
            />
            <span className="nps-density-value">{settings.density}</span>
          </div>
          <SaveBtn field="density" />
        </div>
        <div className="nps-row">
          <label className="nps-label">Роздільна здатність</label>
          <select
            className="nps-select"
            value={settings.resolution || 6}
            onChange={e => update('resolution', Number(e.target.value))}
          >
            {RESOLUTION_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <SaveBtn field="resolution" />
        </div>
      </div>

      {/* ── Позиціонування ── */}
      <div className="nps-section">
        <div className="nps-section-title">Позиціонування</div>
        <div className="nps-row">
          <label className="nps-label">Зсув X</label>
          <input
            className="nps-input"
            type="number"
            min={-20}
            max={20}
            value={settings.offsetX || 0}
            onChange={e => update('offsetX', Math.max(-20, Math.min(20, Number(e.target.value))))}
          />
          <span className="nps-value">мм</span>
          <SaveBtn field="offsetX" />
        </div>
        <div className="nps-row">
          <label className="nps-label">Зсув Y</label>
          <input
            className="nps-input"
            type="number"
            min={-20}
            max={20}
            value={settings.offsetY || 0}
            onChange={e => update('offsetY', Math.max(-20, Math.min(20, Number(e.target.value))))}
          />
          <span className="nps-value">мм</span>
          <SaveBtn field="offsetY" />
        </div>
        <div className="nps-row">
          <label className="nps-label">Поріг ч/б</label>
          <div className="nps-density-control">
            <input
              className="nps-range"
              type="range"
              min={64}
              max={192}
              step={1}
              value={settings.threshold || 128}
              onChange={e => update('threshold', Number(e.target.value))}
            />
            <span className="nps-density-value">{settings.threshold || 128}</span>
          </div>
          <SaveBtn field="threshold" />
        </div>
      </div>

      {/* ── Принтер ── */}
      <div className="nps-section">
        <div className="nps-section-title">Принтер</div>
        <div className="nps-row">
          <label className="nps-label">Звук</label>
          <button
            className={`nps-btn ${settings.sound !== false ? 'nps-btn--save' : 'nps-btn--reset'}`}
            style={{ minWidth: 80 }}
            onClick={() => update('sound', !(settings.sound !== false))}
          >
            {settings.sound !== false ? 'Увімк.' : 'Вимк.'}
          </button>
          <SaveBtn field="sound" />
        </div>
      </div>

      {/* ── Інформація ── */}
      <div className="nps-section">
        <div className="nps-section-title">Інформація</div>
        <div className="nps-row">
          <label className="nps-label">Принтер</label>
          <span className="nps-value">EZPOS L4-W (TSPL)</span>
        </div>
        <div className="nps-row">
          <label className="nps-label">Роздільна здатність</label>
          <span className="nps-value">203 dpi (8 точок/мм)</span>
        </div>
        <div className="nps-row">
          <label className="nps-label">Протокол</label>
          <span className="nps-value">TCP RAW Socket → TSPL BITMAP</span>
        </div>
        {testResult && (
          <div className="nps-row">
            <label className="nps-label">Тест</label>
            <span className="nps-value" style={{ color: testResult.ok ? 'var(--admingreen)' : 'var(--adminred)' }}>
              {testResult.msg}
            </span>
          </div>
        )}
      </div>

      {/* ── Кнопки ── */}
      <div className="nps-actions">
        {dirtyFields.size > 0 && (
          <button className="nps-btn nps-btn--save" onClick={saveAll}>
            ✓ Зберегти все
          </button>
        )}
        <button
          className="nps-btn nps-btn--test"
          onClick={handleTestConnection}
          disabled={testing}
        >
          {testing ? 'Друкую...' : 'Тест друку'}
        </button>
        <button className="nps-btn nps-btn--reset" onClick={reset}>
          Скинути все
        </button>
      </div>
    </div>
  );
}
