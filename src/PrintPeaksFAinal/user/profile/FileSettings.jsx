import React, { useState, useEffect, useCallback } from "react";
import axios from "../../../api/axiosInstance";
import { FiCheck, FiPlus, FiX, FiPlay, FiSearch, FiWifi, FiUpload } from "react-icons/fi";
import { Spinner } from "react-bootstrap";
import "./FileSettings.css";

const formatBytes = (bytes) => {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("uk-UA", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export default function FileSettings() {
  const [settings, setSettings] = useState({});
  const [draft, setDraft] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [diskInfo, setDiskInfo] = useState([]);
  const [backupStatus, setBackupStatus] = useState({});
  const [backupRunning, setBackupRunning] = useState(null);
  const [extraPaths, setExtraPaths] = useState([]);
  const [extraDraft, setExtraDraft] = useState([]);
  const [detectedDisks, setDetectedDisks] = useState([]);
  const [platform, setPlatform] = useState("");
  const [detectLoading, setDetectLoading] = useState(false);
  const [networkTesting, setNetworkTesting] = useState(false);
  const [networkTestResult, setNetworkTestResult] = useState(null);
  const [gdriveTesting, setGdriveTesting] = useState(false);
  const [gdriveTestResult, setGdriveTestResult] = useState(null);

  // ─── Fetch settings ───────────────────────
  const fetchSettings = useCallback(async () => {
    try {
      setError(null);
      const [settingsRes, diskRes, statusRes] = await Promise.all([
        axios.get("/api/file-settings"),
        axios.get("/api/file-settings/disk-info"),
        axios.get("/api/file-settings/backup/status"),
      ]);
      setSettings(settingsRes.data);
      setDraft(settingsRes.data);
      setDiskInfo(Array.isArray(diskRes.data) ? diskRes.data : []);
      setBackupStatus(statusRes.data || {});

      // Parse extra paths
      const extra = (settingsRes.data.FILE_STORAGE_EXTRA_PATHS || "")
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      setExtraPaths(extra);
      setExtraDraft(extra);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // ─── Field change/save ────────────────────
  const isChanged = (key) => (draft[key] || "") !== (settings[key] || "");

  const handleDraft = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirm = async (key) => {
    try {
      setError(null);
      const res = await axios.put("/api/file-settings", { [key]: draft[key] });
      setSettings(res.data);
      setDraft(res.data);
      if (key === "FILE_STORAGE_ROOT" || key === "FILE_STORAGE_EXTRA_PATHS") {
        const diskRes = await axios.get("/api/file-settings/disk-info");
        setDiskInfo(diskRes.data);
      }
    } catch (e) {
      setError(e.response?.data?.error || "Помилка збереження");
    }
  };

  // ─── Toggle storage destination ───────────
  const toggleStorage = async (key) => {
    const newVal = draft[key] === "true" ? "false" : "true";
    handleDraft(key, newVal);
    try {
      const res = await axios.put("/api/file-settings", { [key]: newVal });
      setSettings(res.data);
      setDraft(res.data);
    } catch (e) {
      setError(e.response?.data?.error || "Помилка збереження");
    }
  };

  // ─── Extra paths management ───────────────
  const addExtraPath = () => {
    setExtraDraft((prev) => [...prev, ""]);
  };

  const removeExtraPath = (idx) => {
    const updated = extraDraft.filter((_, i) => i !== idx);
    setExtraDraft(updated);
    saveExtraPaths(updated);
  };

  const updateExtraPath = (idx, value) => {
    setExtraDraft((prev) => prev.map((p, i) => (i === idx ? value : p)));
  };

  const saveExtraPaths = async (paths) => {
    const value = (paths || extraDraft).filter(Boolean).join(",");
    try {
      setError(null);
      const res = await axios.put("/api/file-settings", { FILE_STORAGE_EXTRA_PATHS: value });
      setSettings(res.data);
      setDraft(res.data);
      const extra = (res.data.FILE_STORAGE_EXTRA_PATHS || "").split(",").map((p) => p.trim()).filter(Boolean);
      setExtraPaths(extra);
      setExtraDraft(extra);
      const diskRes = await axios.get("/api/file-settings/disk-info");
      setDiskInfo(diskRes.data);
    } catch (e) {
      setError(e.response?.data?.error || "Помилка збереження");
    }
  };

  const isExtraChanged = (idx) => (extraDraft[idx] || "") !== (extraPaths[idx] || "");

  // ─── Detect disks ──────────────────────────
  const detectDisks = async () => {
    setDetectLoading(true);
    try {
      const res = await axios.get("/api/file-settings/detect-disks");
      setDetectedDisks(res.data.disks || []);
      setPlatform(res.data.platform || "");
    } catch (e) {
      setError(e.response?.data?.error || "Помилка сканування дисків");
    } finally {
      setDetectLoading(false);
    }
  };

  const isDiskActive = (diskPath) => {
    const mainPath = draft.FILE_STORAGE_ROOT || "";
    if (diskPath === mainPath || mainPath.startsWith(diskPath)) return true;
    return extraDraft.some((p) => p === diskPath || p.startsWith(diskPath));
  };

  const toggleDetectedDisk = async (diskPath) => {
    if (isDiskActive(diskPath)) {
      const updated = extraDraft.filter((p) => p !== diskPath && !p.startsWith(diskPath));
      setExtraDraft(updated);
      await saveExtraPaths(updated);
    } else {
      const updated = [...extraDraft, diskPath];
      setExtraDraft(updated);
      await saveExtraPaths(updated);
    }
  };

  const platformLabel = platform === "darwin" ? "macOS" : platform === "win32" ? "Windows" : platform || "—";

  // ─── Network test ─────────────────────────
  const testNetwork = async () => {
    setNetworkTesting(true);
    setNetworkTestResult(null);
    try {
      const res = await axios.post("/api/file-settings/test-network", {
        path: draft.STORAGE_NETWORK_PATH || "",
        user: draft.STORAGE_NETWORK_USER || "",
        password: draft.STORAGE_NETWORK_PASS || "",
      });
      setNetworkTestResult(res.data);
    } catch (e) {
      setNetworkTestResult({ success: false, error: e.response?.data?.error || e.message });
    } finally {
      setNetworkTesting(false);
    }
  };

  // ─── Google Drive test ────────────────────
  const testGdrive = async () => {
    setGdriveTesting(true);
    setGdriveTestResult(null);
    try {
      const res = await axios.post("/api/file-settings/test-gdrive");
      setGdriveTestResult(res.data);
    } catch (e) {
      setGdriveTestResult({ success: false, error: e.response?.data?.error || e.message });
    } finally {
      setGdriveTesting(false);
    }
  };

  // ─── Schedule ─────────────────────────────
  const handleSchedule = async (value) => {
    handleDraft("BACKUP_SCHEDULE", value);
    try {
      const res = await axios.put("/api/file-settings", { BACKUP_SCHEDULE: value });
      setSettings(res.data);
      setDraft(res.data);
    } catch (e) {
      setError(e.response?.data?.error || "Помилка збереження");
    }
  };

  // ─── Backup ───────────────────────────────
  const runBackup = async (type) => {
    setBackupRunning(type);
    setError(null);
    try {
      await axios.post(`/api/file-settings/backup/${type}`);
      const statusRes = await axios.get("/api/file-settings/backup/status");
      setBackupStatus(statusRes.data || {});
    } catch (e) {
      setError(e.response?.data?.error || `Помилка бекапу: ${type}`);
    } finally {
      setBackupRunning(null);
    }
  };

  const [restoreRunning, setRestoreRunning] = useState(null);
  const [restoreResult, setRestoreResult] = useState(null);
  const restoreInputRef = React.useRef(null);
  const restoreTypeRef = React.useRef(null);

  const triggerRestoreUpload = (type) => {
    restoreTypeRef.current = type;
    if (restoreInputRef.current) {
      restoreInputRef.current.value = "";
      restoreInputRef.current.click();
    }
  };

  const handleRestoreFile = async (e) => {
    const file = e.target.files?.[0];
    const type = restoreTypeRef.current;
    if (!file || !type) return;

    if (!file.name.endsWith(".zip")) {
      setError("Файл повинен бути .zip архівом");
      return;
    }

    const labels = { database: "базу", settings: "налаштування", files: "файли" };
    if (!window.confirm(`Імпортувати ${labels[type] || type} з "${file.name}"?\n\nЦе замінить поточні дані!`)) return;

    setRestoreRunning(type);
    setError(null);
    setRestoreResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`/api/file-settings/restore/${type}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000, // 5 хв для великих файлів
      });
      setRestoreResult(res.data);

      // Оновити статус бекапу
      const statusRes = await axios.get("/api/file-settings/backup/status");
      setBackupStatus(statusRes.data || {});
    } catch (e) {
      setError(e.response?.data?.error || `Помилка імпорту: ${type}`);
    } finally {
      setRestoreRunning(null);
    }
  };

  // ─── Disk info helpers ────────────────────
  const getDiskInfo = (idx) => diskInfo[idx] || null;

  const diskLevel = (info) => {
    if (!info || !info.size) return "warn";
    const freeGB = info.free / (1024 * 1024 * 1024);
    if (freeGB < 1) return "danger";
    if (freeGB < 10) return "warn";
    return "ok";
  };

  const backupAge = (status) => {
    if (!status?.date) return "never";
    const days = (Date.now() - new Date(status.date).getTime()) / (1000 * 60 * 60 * 24);
    if (days > 7) return "warn";
    return "ok";
  };

  if (loading) {
    return (
      <div className="fs-loading">
        <Spinner animation="grow" variant="dark" size="sm" />
      </div>
    );
  }

  const localEnabled = draft.STORAGE_LOCAL_ENABLED !== "false"; // default true
  const networkEnabled = draft.STORAGE_NETWORK_ENABLED === "true";
  const gdriveEnabled = draft.STORAGE_GDRIVE_ENABLED === "true" || draft.GOOGLE_DRIVE_ENABLED === "true";
  const schedule = draft.BACKUP_SCHEDULE || "manual";

  return (
    <div className="fs-container">
      {error && <div className="fs-error">{error}</div>}

      {/* ═══ Секція 1: Місця збереження (3 колонки) ═══ */}
      <div className="fs-section">
        <div className="fs-section-title">Місця збереження</div>

        <div className="fs-storage-row">
          {/* ── Колонка 1: Локально ── */}
          <div className="fs-storage-dest">
            <div className="fs-storage-header" onClick={() => toggleStorage("STORAGE_LOCAL_ENABLED")}>
              <div className={`fs-toggle-mini${localEnabled ? " fs-toggle-mini--on" : ""}`}>
                <div className="fs-toggle-mini-knob" />
              </div>
              <span className="fs-storage-name">Локально</span>
              <span className="fs-storage-priority">пріоритет 1</span>
            </div>
            {localEnabled && (
              <div className="fs-storage-body">
                <div className="fs-field-row">
                  <div className="fs-field-label">Основний шлях</div>
                  <input
                    className="fs-field-input"
                    value={draft.FILE_STORAGE_ROOT || ""}
                    onChange={(e) => handleDraft("FILE_STORAGE_ROOT", e.target.value)}
                  />
                  <button
                    className={`fs-field-save${isChanged("FILE_STORAGE_ROOT") ? " fs-field-save--visible" : ""}`}
                    onClick={() => handleConfirm("FILE_STORAGE_ROOT")}
                  >
                    <FiCheck size={16} />
                  </button>
                </div>
                {getDiskInfo(0) && (
                  <div className="fs-disk-info">
                    <div className="fs-disk-bar-wrap">
                      <div
                        className={`fs-disk-bar fs-disk-bar--${diskLevel(getDiskInfo(0))}`}
                        style={{ width: `${((getDiskInfo(0).used / getDiskInfo(0).size) * 100) || 0}%` }}
                      />
                    </div>
                    <span className={`fs-disk-text fs-disk-text--${diskLevel(getDiskInfo(0))}`}>
                      {formatBytes(getDiskInfo(0).free)} вільно з {formatBytes(getDiskInfo(0).size)}
                    </span>
                  </div>
                )}

                {/* ── Визначені диски (Windows) ── */}
                <div className="fs-storage-sub-title">
                  Визначені диски
                  <span className="fs-os-badge">Windows</span>
                </div>
                <button className="fs-detect-btn" onClick={detectDisks} disabled={detectLoading}>
                  {detectLoading ? (
                    <><Spinner animation="border" size="sm" /> Сканування...</>
                  ) : (
                    <><FiSearch size={14} /> Сканувати диски</>
                  )}
                </button>
                {detectedDisks.length > 0 && (
                  <div className="fs-detected-list">
                    {detectedDisks.map((disk) => {
                      const active = isDiskActive(disk.path);
                      const mainPath = draft.FILE_STORAGE_ROOT || "";
                      const isMain = disk.path === mainPath || mainPath.startsWith(disk.path);
                      return (
                        <label key={disk.path} className={`fs-detected-row${active ? " fs-detected-row--active" : ""}`}>
                          <input
                            type="checkbox"
                            className="fs-detected-check"
                            checked={active}
                            disabled={isMain}
                            onChange={() => toggleDetectedDisk(disk.path)}
                          />
                          <span className="fs-detected-name">{disk.name}</span>
                          <span className="fs-detected-path">{disk.path}</span>
                          <span className={`fs-detected-free fs-disk-text--${
                            disk.free / (1024*1024*1024) < 1 ? "danger" : disk.free / (1024*1024*1024) < 10 ? "warn" : "ok"
                          }`}>
                            {formatBytes(disk.free)} вільно
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* ── Додаткові диски (macOS) ── */}
                <div className="fs-storage-sub-title">
                  Додаткові диски
                  <span className="fs-os-badge">macOS</span>
                </div>
                {extraDraft.map((p, idx) => {
                  const di = getDiskInfo(idx + 1);
                  return (
                    <div key={idx}>
                      <div className="fs-extra-row">
                        <div className="fs-field-label">Диск {idx + 2}</div>
                        <input
                          className="fs-field-input"
                          value={p}
                          onChange={(e) => updateExtraPath(idx, e.target.value)}
                          placeholder="/Volumes/SSD2/clients"
                        />
                        <button
                          className={`fs-field-save${isExtraChanged(idx) ? " fs-field-save--visible" : ""}`}
                          onClick={() => saveExtraPaths()}
                        >
                          <FiCheck size={16} />
                        </button>
                        <button className="fs-remove-btn" onClick={() => removeExtraPath(idx)}>
                          <FiX size={14} />
                        </button>
                      </div>
                      {di && (
                        <div className="fs-disk-info">
                          <div className="fs-disk-bar-wrap">
                            <div
                              className={`fs-disk-bar fs-disk-bar--${diskLevel(di)}`}
                              style={{ width: `${((di.used / di.size) * 100) || 0}%` }}
                            />
                          </div>
                          <span className={`fs-disk-text fs-disk-text--${diskLevel(di)}`}>
                            {formatBytes(di.free)} вільно з {formatBytes(di.size)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button className="fs-add-btn" onClick={addExtraPath}>
                  <FiPlus size={14} /> Додати диск
                </button>
              </div>
            )}
          </div>

          {/* ── Колонка 2: Локальна мережа ── */}
          <div className="fs-storage-dest">
            <div className="fs-storage-header" onClick={() => toggleStorage("STORAGE_NETWORK_ENABLED")}>
              <div className={`fs-toggle-mini${networkEnabled ? " fs-toggle-mini--on" : ""}`}>
                <div className="fs-toggle-mini-knob" />
              </div>
              <span className="fs-storage-name">Локальна мережа</span>
              <span className="fs-storage-priority">пріоритет 2</span>
            </div>
            {networkEnabled && (
              <div className="fs-storage-body">
                <div className="fs-field-row">
                  <div className="fs-field-label">Шлях</div>
                  <input
                    className="fs-field-input"
                    value={draft.STORAGE_NETWORK_PATH || ""}
                    onChange={(e) => handleDraft("STORAGE_NETWORK_PATH", e.target.value)}
                    placeholder="\\\\server\\share\\clients"
                  />
                  <button
                    className={`fs-field-save${isChanged("STORAGE_NETWORK_PATH") ? " fs-field-save--visible" : ""}`}
                    onClick={() => handleConfirm("STORAGE_NETWORK_PATH")}
                  >
                    <FiCheck size={16} />
                  </button>
                </div>
                <div className="fs-field-row">
                  <div className="fs-field-label">Логін</div>
                  <input
                    className="fs-field-input"
                    value={draft.STORAGE_NETWORK_USER || ""}
                    onChange={(e) => handleDraft("STORAGE_NETWORK_USER", e.target.value)}
                    placeholder="username"
                  />
                  <button
                    className={`fs-field-save${isChanged("STORAGE_NETWORK_USER") ? " fs-field-save--visible" : ""}`}
                    onClick={() => handleConfirm("STORAGE_NETWORK_USER")}
                  >
                    <FiCheck size={16} />
                  </button>
                </div>
                <div className="fs-field-row">
                  <div className="fs-field-label">Пароль</div>
                  <input
                    className="fs-field-input"
                    type="password"
                    value={draft.STORAGE_NETWORK_PASS || ""}
                    onChange={(e) => handleDraft("STORAGE_NETWORK_PASS", e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    className={`fs-field-save${isChanged("STORAGE_NETWORK_PASS") ? " fs-field-save--visible" : ""}`}
                    onClick={() => handleConfirm("STORAGE_NETWORK_PASS")}
                  >
                    <FiCheck size={16} />
                  </button>
                </div>
                <div className="fs-network-test-row">
                  <button
                    className="fs-detect-btn"
                    onClick={testNetwork}
                    disabled={networkTesting || !draft.STORAGE_NETWORK_PATH}
                  >
                    {networkTesting ? (
                      <><Spinner animation="border" size="sm" /> Перевірка...</>
                    ) : (
                      <><FiWifi size={14} /> Тест з'єднання</>
                    )}
                  </button>
                  {networkTestResult && (
                    <span className={`fs-network-result fs-network-result--${networkTestResult.success ? "ok" : "fail"}`}>
                      <span className="fs-network-dot" />
                      {networkTestResult.success
                        ? `Підключено — ${formatBytes(networkTestResult.free)} вільно`
                        : networkTestResult.error || "Помилка з'єднання"
                      }
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Колонка 3: Google Drive ── */}
          <div className="fs-storage-dest">
            <div className="fs-storage-header" onClick={() => {
              const newVal = gdriveEnabled ? "false" : "true";
              handleDraft("STORAGE_GDRIVE_ENABLED", newVal);
              handleDraft("GOOGLE_DRIVE_ENABLED", newVal);
              axios.put("/api/file-settings", {
                STORAGE_GDRIVE_ENABLED: newVal,
                GOOGLE_DRIVE_ENABLED: newVal,
              }).then(res => {
                setSettings(res.data);
                setDraft(res.data);
              }).catch(e => setError(e.response?.data?.error || "Помилка збереження"));
            }}>
              <div className={`fs-toggle-mini${gdriveEnabled ? " fs-toggle-mini--on" : ""}`}>
                <div className="fs-toggle-mini-knob" />
              </div>
              <span className="fs-storage-name">Google Drive</span>
              <span className="fs-storage-priority">пріоритет 3</span>
            </div>
            {gdriveEnabled && (
              <div className="fs-storage-body">
                <div className="fs-field-row">
                  <div className="fs-field-label">Root Folder ID</div>
                  <input
                    className="fs-field-input"
                    value={draft.GOOGLE_DRIVE_CLIENTS_ROOT_ID || ""}
                    onChange={(e) => handleDraft("GOOGLE_DRIVE_CLIENTS_ROOT_ID", e.target.value)}
                  />
                  <button
                    className={`fs-field-save${isChanged("GOOGLE_DRIVE_CLIENTS_ROOT_ID") ? " fs-field-save--visible" : ""}`}
                    onClick={() => handleConfirm("GOOGLE_DRIVE_CLIENTS_ROOT_ID")}
                  >
                    <FiCheck size={16} />
                  </button>
                </div>
                <div className="fs-field-row">
                  <div className="fs-field-label">Credentials</div>
                  <input
                    className="fs-field-input"
                    value={draft.GOOGLE_APPLICATION_CREDENTIALS || ""}
                    readOnly
                  />
                  <div style={{ width: 28 }} />
                </div>
                <div className="fs-field-row">
                  <div className="fs-field-label">Share with</div>
                  <input
                    className="fs-field-input"
                    value={draft.GOOGLE_DRIVE_SHARE_WITH || ""}
                    onChange={(e) => handleDraft("GOOGLE_DRIVE_SHARE_WITH", e.target.value)}
                  />
                  <button
                    className={`fs-field-save${isChanged("GOOGLE_DRIVE_SHARE_WITH") ? " fs-field-save--visible" : ""}`}
                    onClick={() => handleConfirm("GOOGLE_DRIVE_SHARE_WITH")}
                  >
                    <FiCheck size={16} />
                  </button>
                </div>
                <div className="fs-network-test-row">
                  <button
                    className="fs-detect-btn"
                    onClick={testGdrive}
                    disabled={gdriveTesting}
                  >
                    {gdriveTesting ? (
                      <><Spinner animation="border" size="sm" /> Перевірка...</>
                    ) : (
                      <><FiWifi size={14} /> Тест з'єднання</>
                    )}
                  </button>
                  {gdriveTestResult && (
                    <span className={`fs-network-result fs-network-result--${gdriveTestResult.success ? "ok" : "fail"}`}>
                      <span className="fs-network-dot" />
                      {gdriveTestResult.success
                        ? `Підключено — ${gdriveTestResult.filesCount} папок`
                        : gdriveTestResult.error || "Помилка з'єднання"
                      }
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Секція 2: Локальний бекап ═══ */}
      <div className="fs-section">
        <div className="fs-section-title">Локальний бекап</div>
        <div className="fs-field-row">
          <div className="fs-field-label">Шлях бекапів</div>
          <input
            className="fs-field-input"
            value={draft.BACKUP_PATH || ""}
            onChange={(e) => handleDraft("BACKUP_PATH", e.target.value)}
            placeholder="./data/backups"
          />
          <button
            className={`fs-field-save${isChanged("BACKUP_PATH") ? " fs-field-save--visible" : ""}`}
            onClick={() => handleConfirm("BACKUP_PATH")}
          >
            <FiCheck size={16} />
          </button>
        </div>

        {/* Schedule */}
        <div className="fs-schedule-row">
          {[
            { value: "daily", label: "Щоденно" },
            { value: "weekly", label: "Щотижня" },
            { value: "manual", label: "Вручну" },
          ].map((opt) => (
            <label key={opt.value} className="fs-schedule-option" onClick={() => handleSchedule(opt.value)}>
              <div className={`fs-schedule-radio${schedule === opt.value ? " fs-schedule-radio--active" : ""}`}>
                {schedule === opt.value && <div className="fs-schedule-dot" />}
              </div>
              {opt.label}
            </label>
          ))}
        </div>

        {/* Backup cards */}
        <div className="fs-backup-grid">
          {[
            { type: "database", title: "Бекап бази", desc: "Sequelize → .zip (JSON)" },
            { type: "settings", title: "Бекап налаштувань", desc: ".env + global.css + config/" },
            { type: "files", title: "Бекап файлів", desc: "clientFiles → .zip" },
          ].map(({ type, title, desc }) => {
            const status = backupStatus[type];
            const age = backupAge(status);
            const isRunning = backupRunning === type;
            return (
              <div key={type} className="fs-backup-card">
                <div className="fs-backup-card-title">{title}</div>
                <div className="fs-backup-status">
                  <div className={`fs-backup-indicator fs-backup-indicator--${age}`} />
                  {status?.date ? (
                    <span>{formatDate(status.date)} — {formatBytes(status.size)}</span>
                  ) : (
                    <span>Ще не створено</span>
                  )}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--admingrey)", marginBottom: "0.5rem", opacity: 0.7 }}>
                  {desc}
                </div>
                <button
                  className="fs-backup-run-btn"
                  onClick={() => runBackup(type)}
                  disabled={isRunning || backupRunning !== null || restoreRunning !== null}
                >
                  {isRunning ? (
                    <><Spinner animation="border" size="sm" /> Виконується...</>
                  ) : (
                    <><FiPlay size={12} /> Запустити</>
                  )}
                </button>
                <button
                  className="fs-backup-run-btn fs-backup-import-btn"
                  onClick={() => triggerRestoreUpload(type)}
                  disabled={backupRunning !== null || restoreRunning !== null}
                >
                  {restoreRunning === type ? (
                    <><Spinner animation="border" size="sm" /> Відновлення...</>
                  ) : (
                    <><FiUpload size={12} /> Імпортувати</>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Hidden file input для імпорту */}
        <input
          ref={restoreInputRef}
          type="file"
          accept=".zip"
          style={{ display: "none" }}
          onChange={handleRestoreFile}
        />

        {/* Результат імпорту */}
        {restoreResult && (
          <div className="fs-restore-result">
            <div className="fs-restore-result-title">Результат імпорту:</div>
            {restoreResult.imported && restoreResult.imported.map((r, i) => (
              <div key={i} className="fs-restore-result-line">{r}</div>
            ))}
            {restoreResult.restored && restoreResult.restored.map((r, i) => (
              <div key={i} className="fs-restore-result-line">{r}</div>
            ))}
            {restoreResult.message && (
              <div className="fs-restore-result-line">{restoreResult.message}</div>
            )}
            {restoreResult.errors?.length > 0 && restoreResult.errors.map((r, i) => (
              <div key={i} className="fs-restore-result-line" style={{ color: "var(--adminred)" }}>{r}</div>
            ))}
            <button
              className="fs-backup-run-btn"
              style={{ marginTop: "0.5rem", maxWidth: 150 }}
              onClick={() => setRestoreResult(null)}
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
