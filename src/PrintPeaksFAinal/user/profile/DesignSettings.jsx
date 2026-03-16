import React, { useState, useEffect, useCallback } from "react";
import axios from "../../../api/axiosInstance";

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

const styles = {
  container: { padding: "1.5rem 2rem" },
  section: { marginBottom: "2rem" },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginBottom: "1rem",
    color: "#333",
    borderBottom: "1px solid #e0ddd4",
    paddingBottom: "0.5rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "0.75rem",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.4rem 0",
  },
  colorInput: {
    width: 32,
    height: 32,
    border: "1px solid #d4d1c8",
    borderRadius: 4,
    padding: 0,
    cursor: "pointer",
    flexShrink: 0,
  },
  hexInput: {
    width: 72,
    padding: "0.25rem 0.4rem",
    border: "1px solid #d4d1c8",
    borderRadius: 4,
    fontSize: "0.75rem",
    fontFamily: "monospace",
    backgroundColor: "#fff",
    flexShrink: 0,
  },
  textInput: {
    width: 80,
    padding: "0.3rem 0.5rem",
    border: "1px solid #d4d1c8",
    borderRadius: 4,
    fontSize: "0.8rem",
    backgroundColor: "#fff",
  },
  label: {
    fontSize: "0.8rem",
    color: "var(--admingrey, #666)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  varName: {
    fontSize: "0.7rem",
    color: "#aaa",
    fontFamily: "monospace",
  },
  btnRow: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
  },
};

const FILE_SETTINGS_KEY = 'printpeaks_file_settings';

function loadFileSettings() {
  try {
    const raw = localStorage.getItem(FILE_SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { folderMode: 'local', networkPath: '//192.168.0.121/Client', networkUser: '', networkPass: '' };
}

function saveFileSettings(s) {
  localStorage.setItem(FILE_SETTINGS_KEY, JSON.stringify(s));
}

export { loadFileSettings };

export default function DesignSettings() {
  const [settings, setSettings] = useState({});
  const [draft, setDraft] = useState({});
  const [loading, setLoading] = useState(true);
  const [fileSettings, setFileSettings] = useState(loadFileSettings);
  const [testStatus, setTestStatus] = useState(null); // null | 'loading' | 'ok' | 'error'
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    axios.get('/api/design/settings')
      .then((res) => {
        setSettings(res.data);
        setDraft(res.data);
      })
      .catch((err) => console.error('Failed to load design settings:', err))
      .finally(() => setLoading(false));
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

  if (loading) return <div style={{ padding: '2rem', color: 'var(--admingrey)' }}>Завантаження...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.btnRow}>
        <button className="adminButton" onClick={handleReset}>
          <span>Скинути все</span>
        </button>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Кольори</div>
        <div style={styles.grid}>
          {COLOR_VARS.map((v) => (
            <div key={v.key} style={styles.row}>
              <input
                type="color"
                style={styles.colorInput}
                value={getDraft(v)}
                onChange={(e) => handleDraftChange(v.key, e.target.value)}
              />
              <input
                type="text"
                style={styles.hexInput}
                value={getDraft(v)}
                onChange={(e) => handleDraftChange(v.key, e.target.value)}
              />
              <button
                className={`pp-field-save${isChanged(v) ? ' pp-field-save--visible' : ''}`}
                onClick={() => handleConfirm(v)}
                disabled={!isChanged(v)}
              >
                ✓
              </button>
              <div>
                <div style={styles.label}>{v.label}</div>
                <div style={styles.varName}>{v.key}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Розміри шрифтів</div>
        <div style={styles.grid}>
          {SIZE_VARS.map((v) => (
            <div key={v.key} style={styles.row}>
              <input
                type="text"
                style={styles.textInput}
                value={getDraft(v)}
                onChange={(e) => handleDraftChange(v.key, e.target.value)}
              />
              <button
                className={`pp-field-save${isChanged(v) ? ' pp-field-save--visible' : ''}`}
                onClick={() => handleConfirm(v)}
                disabled={!isChanged(v)}
              >
                ✓
              </button>
              <div>
                <div style={styles.label}>{v.label}</div>
                <div style={styles.varName}>{v.key}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Файли — відкриття папки</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: 500 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ ...styles.label, minWidth: 120 }}>Режим папки:</span>
            <label style={{ ...styles.label, display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
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
            <label style={{ ...styles.label, display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ ...styles.label, minWidth: 120 }}>Мережевий шлях:</span>
                <input
                  type="text"
                  style={{ ...styles.textInput, flex: 1 }}
                  value={fileSettings.networkPath}
                  onChange={(e) => {
                    const next = { ...fileSettings, networkPath: e.target.value };
                    setFileSettings(next);
                    saveFileSettings(next);
                  }}
                  placeholder="//192.168.0.121/Client"
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ ...styles.label, minWidth: 120 }}>Логін:</span>
                <input
                  type="text"
                  style={{ ...styles.textInput, flex: 1 }}
                  value={fileSettings.networkUser || ''}
                  onChange={(e) => {
                    const next = { ...fileSettings, networkUser: e.target.value };
                    setFileSettings(next);
                    saveFileSettings(next);
                  }}
                  placeholder="username"
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ ...styles.label, minWidth: 120 }}>Пароль:</span>
                <input
                  type="password"
                  style={{ ...styles.textInput, flex: 1 }}
                  value={fileSettings.networkPass || ''}
                  onChange={(e) => {
                    const next = { ...fileSettings, networkPass: e.target.value };
                    setFileSettings(next);
                    saveFileSettings(next);
                  }}
                  placeholder="••••••"
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button
                  className="adminButton"
                  disabled={testStatus === 'loading'}
                  onClick={async () => {
                    setTestStatus('loading');
                    setTestMessage('');
                    try {
                      const res = await axios.post('/api/client-files/test-network', {
                        networkPath: fileSettings.networkPath,
                        networkUser: fileSettings.networkUser,
                        networkPass: fileSettings.networkPass,
                      });
                      setTestStatus('ok');
                      setTestMessage(res.data.message || "З'єднання успішне");
                    } catch (e) {
                      setTestStatus('error');
                      setTestMessage(e.response?.data?.error || "Помилка з'єднання");
                    }
                  }}
                >
                  <span>{testStatus === 'loading' ? 'Перевірка...' : "Тест з'єднання"}</span>
                </button>
                {testStatus === 'ok' && (
                  <span style={{ color: 'var(--admingreen)', fontSize: '0.85rem' }}>{testMessage}</span>
                )}
                {testStatus === 'error' && (
                  <span style={{ color: 'var(--adminred)', fontSize: '0.85rem' }}>{testMessage}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
