import React, { useState, useEffect, useCallback } from "react";
import axios from "../../../api/axiosInstance";
import { getStoredAppTheme, setAppTheme, onAppThemeChange } from "../../../utils/appTheme";
import "./DesignSettings.css";

/* Теми оформлення застосунку. Бежева нічого не перевизначає (дефолт),
   світла й темна вмикаються атрибутом data-theme на <html> — див.
   utils/appTheme.js і global.css. Зразок малюємо трьома смугами:
   фон / фон елементів / колір тексту. */
const APP_THEME_LIST = [
  { id: "beige", name: "Бежева", note: "Типова", swatch: ["#f7f5ee", "#f1eee7", "#666666"] },
  { id: "light", name: "Світла", note: "Монохром", swatch: ["#ffffff", "#f4f4f4", "#000000"] },
  { id: "dark",  name: "Темна",  note: "Ніч",      swatch: ["#1f1e1c", "#2b2925", "#e8e6e1"] },
];

const COLOR_VARS = [
  { key: "--admingreen", label: "Green (активний)", default: "#0e935b" },
  { key: "--admingrey", label: "Grey (текст)", default: "#666666" },
  { key: "--adminorange", label: "Orange (hover/border)", default: "#f5a623" },
  { key: "--adminblue", label: "Blue (input underline)", default: "#3c60a6" },
  { key: "--adminred", label: "Red (помилки)", default: "#ee3c23" },
  { key: "--adminrose", label: "Rose", default: "#ef7aaa" },
  { key: "--adminpurple", label: "Purple (повтор)", default: "#6a5acd" },
  { key: "--admincyan", label: "Cyan", default: "#00A8C6" },
  { key: "--admincoral", label: "Coral", default: "#ff7f50" },
  { key: "--adminfon", label: "Фон основний", default: "#f7f5ee" },
  { key: "--adminfonelement", label: "Фон елементів", default: "#f1eee7" },
  { key: "--adminlightgreen", label: "Light Green", default: "#e2f2eb" },
  { key: "--adminlightgrey", label: "Light Grey", default: "#666666" },
  { key: "--adminlightorange", label: "Light Orange", default: "#fef4e5" },
  { key: "--adminlightblue", label: "Light Blue", default: "#e8ecf4" },
  { key: "--adminlightrose", label: "Light Rose", default: "#fdeff5" },
  { key: "--adminlightred", label: "Light Red", default: "#fde8e5" },
  { key: "--adminlightpurple", label: "Light Purple", default: "#edebf9" },
  { key: "--adminlightcyan", label: "Light Cyan", default: "#e0f5f8" },
];

const SIZE_VARS = [
  { key: "--font-size-6xs", label: "6xs (7px)", default: "7px" },
  { key: "--font-size-5xs", label: "5xs (8px)", default: "8px" },
  { key: "--font-size-xs", label: "xs (12px)", default: "12px" },
  { key: "--fontcard", label: "card (12px)", default: "12px" },
  { key: "--font-size-smi-1", label: "smi-1 (12.1px)", default: "12.1px" },
  { key: "--font-size-sm-2", label: "sm-2 (13.2px)", default: "13.2px" },
  { key: "--font-size-status", label: "status (14px)", default: "14px" },
  { key: "--fontsmall", label: "small (16px)", default: "16px" },
  { key: "--font-size-mid", label: "mid (17px)", default: "17px" },
  { key: "--font-size-s", label: "s (19px)", default: "19px" },
  { key: "--font-size-xl", label: "xl (20px)", default: "20px" },
  { key: "--font-size-pay", label: "pay (21px)", default: "21px" },
  { key: "--font-size-3xl", label: "3xl (22px)", default: "22px" },
  { key: "--font-size-5xl", label: "5xl (24px)", default: "24px" },
  { key: "--font-size-6xl", label: "6xl (25px)", default: "25px" },
  { key: "--font-size-paybig", label: "paybig (26px)", default: "26px" },
  { key: "--font-size-26xl", label: "26xl (45px)", default: "45px" },
];

export function applyDesignSettings() {
  // CSS variables are now stored in global.css directly — nothing to apply at runtime
}

const FILE_SETTINGS_KEY = 'printpeaks_file_settings';
const FILE_DEFAULTS = { folderMode: 'local', networkPath: '//192.168.0.121/Client', networkUser: '', networkPass: '' };

function loadFileSettings() {
  try {
    const raw = localStorage.getItem(FILE_SETTINGS_KEY);
    if (raw) return { ...FILE_DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return FILE_DEFAULTS;
}

function saveFileSettings(s) {
  localStorage.setItem(FILE_SETTINGS_KEY, JSON.stringify(s));
  // Синхронізуємо з сервером (не блокуємо UI)
  import('../../../hooks/useUserSettings').then(({ saveSetting }) => {
    saveSetting('file_settings', s);
  }).catch(() => {});
}

export { loadFileSettings };

export default function DesignSettings() {
  const [settings, setSettings] = useState({});
  const [draft, setDraft] = useState({});
  const [loading, setLoading] = useState(true);
  const [fileSettings, setFileSettings] = useState(loadFileSettings);
  const [testStatus, setTestStatus] = useState(null); // null | 'loading' | 'ok' | 'error'
  const [testMessage, setTestMessage] = useState('');
  const [appTheme, setAppThemeState] = useState(getStoredAppTheme);

  // тему можна перемкнути й з дока — тримаємо вкладку в курсі
  useEffect(() => onAppThemeChange(setAppThemeState), []);

  useEffect(() => {
    axios.get('/api/design/settings')
      .then((res) => {
        setSettings(res.data);
        setDraft(res.data);
      })
      .catch((err) => console.error('Failed to load design settings:', err))
      .finally(() => setLoading(false));

    // Завантажити file_settings з сервера (якщо є)
    import('../../../hooks/useUserSettings').then(({ loadSetting }) => {
      loadSetting('file_settings', FILE_DEFAULTS).then(val => {
        setFileSettings(val);
      });
    }).catch(() => {});
  }, []);

  const getSaved = useCallback(
    (varDef) => varDef.key in settings ? settings[varDef.key] : varDef.default,
    [settings]
  );

  const getDraft = useCallback(
    (varDef) => varDef.key in draft ? draft[varDef.key] : varDef.default,
    [draft]
  );

  const isChanged = useCallback(
    (varDef) => getDraft(varDef) !== getSaved(varDef),
    [getDraft, getSaved]
  );

  const handleDraftChange = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    document.documentElement.style.setProperty(key, value);
  };

  const handleConfirm = async (varDef) => {
    const value = getDraft(varDef);
    try {
      await axios.put('/api/design/settings', { [varDef.key]: value });
      setSettings((prev) => ({ ...prev, [varDef.key]: value }));
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  const handleReset = async () => {
    const defaults = {};
    [...COLOR_VARS, ...SIZE_VARS].forEach((v) => {
      defaults[v.key] = v.default;
    });
    try {
      await axios.put('/api/design/settings', defaults);
      const root = document.documentElement;
      [...COLOR_VARS, ...SIZE_VARS].forEach((v) => {
        root.style.setProperty(v.key, v.default);
      });
      setSettings(defaults);
      setDraft(defaults);
    } catch (err) {
      console.error('Failed to reset:', err);
    }
  };

  if (loading) {
    return <div className="pp-loading">Завантаження…</div>;
  }

  return (
    <div className="ds-wrap">

      {/* ── Тема оформлення ── */}
      <div className="ds-section">
        <div className="ds-section-title">Тема оформлення</div>
        <div className="ds-hint">
          Тема задає базові кольори фону й тексту для всього застосунку.
          Значення нижче правлять палітру поверх обраної теми.
        </div>
        <div className="ds-themes">
          {APP_THEME_LIST.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`ds-theme${appTheme === t.id ? " is-active" : ""}`}
              onClick={() => setAppThemeState(setAppTheme(t.id))}
            >
              <span className="ds-theme-swatch">
                {t.swatch.map((c) => <i key={c} style={{ background: c }} />)}
              </span>
              <span className="ds-theme-meta">
                <span className="ds-theme-name">{t.name}</span>
                <span className="ds-theme-note">{t.note}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Кольори ── */}
      <div className="ds-section">
        <div className="ds-section-title">Кольори</div>
        <div className="ds-btn-row">
          <button className="ds-btn ds-btn--danger" onClick={handleReset}>
            Скинути все
          </button>
        </div>
        <div className="ds-grid">
          {COLOR_VARS.map((v) => (
            <div key={v.key} className={`ds-row${isChanged(v) ? " is-changed" : ""}`}>
              <input
                type="color"
                className="ds-color-input"
                value={getDraft(v)}
                onChange={(e) => handleDraftChange(v.key, e.target.value)}
              />
              <input
                type="text"
                className="ds-hex-input"
                value={getDraft(v)}
                onChange={(e) => handleDraftChange(v.key, e.target.value)}
              />
              <button
                className={`ds-save${isChanged(v) ? " is-visible" : ""}`}
                onClick={() => handleConfirm(v)}
                disabled={!isChanged(v)}
                title="Зберегти"
              >
                ✓
              </button>
              <span className="ds-row-meta">
                <span className="ds-label">{v.label}</span>
                <span className="ds-var">{v.key}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Розміри шрифтів ── */}
      <div className="ds-section">
        <div className="ds-section-title">Розміри шрифтів</div>
        <div className="ds-grid">
          {SIZE_VARS.map((v) => (
            <div key={v.key} className={`ds-row${isChanged(v) ? " is-changed" : ""}`}>
              <input
                type="text"
                className="ds-text-input"
                value={getDraft(v)}
                onChange={(e) => handleDraftChange(v.key, e.target.value)}
              />
              <button
                className={`ds-save${isChanged(v) ? " is-visible" : ""}`}
                onClick={() => handleConfirm(v)}
                disabled={!isChanged(v)}
                title="Зберегти"
              >
                ✓
              </button>
              <span className="ds-row-meta">
                <span className="ds-label">{v.label}</span>
                <span className="ds-var">{v.key}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Папка файлів ── */}
      <div className="ds-section">
        <div className="ds-section-title">Файли — відкриття папки</div>
        <div className="ds-form">
          <div className="ds-form-row">
            <span className="ds-form-label">Режим папки</span>
            <label className="ds-radio">
              <input
                type="radio"
                name="folderMode"
                value="local"
                checked={fileSettings.folderMode === "local"}
                onChange={() => {
                  const next = { ...fileSettings, folderMode: "local" };
                  setFileSettings(next);
                  saveFileSettings(next);
                }}
              />
              Локальна
            </label>
            <label className="ds-radio">
              <input
                type="radio"
                name="folderMode"
                value="network"
                checked={fileSettings.folderMode === "network"}
                onChange={() => {
                  const next = { ...fileSettings, folderMode: "network" };
                  setFileSettings(next);
                  saveFileSettings(next);
                }}
              />
              Мережа
            </label>
          </div>

          {fileSettings.folderMode === "network" && (
            <>
              <div className="ds-form-row">
                <span className="ds-form-label">Мережевий шлях</span>
                <input
                  type="text"
                  className="ds-text-input"
                  value={fileSettings.networkPath}
                  onChange={(e) => {
                    const next = { ...fileSettings, networkPath: e.target.value };
                    setFileSettings(next);
                    saveFileSettings(next);
                  }}
                  placeholder="//192.168.0.121/Client"
                />
              </div>
              <div className="ds-form-row">
                <span className="ds-form-label">Логін</span>
                <input
                  type="text"
                  className="ds-text-input"
                  value={fileSettings.networkUser || ""}
                  onChange={(e) => {
                    const next = { ...fileSettings, networkUser: e.target.value };
                    setFileSettings(next);
                    saveFileSettings(next);
                  }}
                  placeholder="username"
                />
              </div>
              <div className="ds-form-row">
                <span className="ds-form-label">Пароль</span>
                <input
                  type="password"
                  className="ds-text-input"
                  value={fileSettings.networkPass || ""}
                  onChange={(e) => {
                    const next = { ...fileSettings, networkPass: e.target.value };
                    setFileSettings(next);
                    saveFileSettings(next);
                  }}
                  placeholder="••••••"
                />
              </div>
              <div className="ds-form-row">
                <button
                  className="ds-btn"
                  disabled={testStatus === "loading"}
                  onClick={async () => {
                    setTestStatus("loading");
                    setTestMessage("");
                    try {
                      const res = await axios.post("/api/client-files/test-network", {
                        networkPath: fileSettings.networkPath,
                        networkUser: fileSettings.networkUser,
                        networkPass: fileSettings.networkPass,
                      });
                      setTestStatus("ok");
                      setTestMessage(res.data.message || "З’єднання успішне");
                    } catch (e) {
                      setTestStatus("error");
                      setTestMessage(e.response?.data?.error || "Помилка з’єднання");
                    }
                  }}
                >
                  {testStatus === "loading" ? "Перевірка…" : "Тест з’єднання"}
                </button>
                {testStatus === "ok" && <span className="ds-status ds-status--ok">{testMessage}</span>}
                {testStatus === "error" && <span className="ds-status ds-status--err">{testMessage}</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
