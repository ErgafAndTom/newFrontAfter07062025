import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../api/axiosInstance';
import './ExportImportComponent.css';

// Розклад і теку зберігання тримає бекенд (AppSettings + services/backupService),
// тому бекап робиться навіть із закритим браузером і переживає ребілд фронта.

function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtSize(bytes) {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
    return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

const EMPTY_DRAFT = {
    time: '18:00',
    localPath: '',
    keepLocal: 14,
    gdriveEnabled: false,
    gdriveFolderId: '',
    keepDrive: 0,
};

const ExportImportComponent = () => {
    const [status, setStatus] = useState(null);
    const [draft, setDraft] = useState(EMPTY_DRAFT);
    const [showPanel, setShowPanel] = useState(false);
    const [saving, setSaving] = useState(false);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');
    const [msgErr, setMsgErr] = useState(false);

    const applyStatus = useCallback((data) => {
        setStatus(data);
        setDraft({ ...EMPTY_DRAFT, ...(data?.settings || {}) });
    }, []);

    const load = useCallback(async () => {
        try {
            const { data } = await axios.get('/db/backup-settings');
            applyStatus(data);
        } catch (e) {
            setMsgErr(true);
            setMsg(`Не вдалось прочитати налаштування: ${e?.response?.data?.error || e.message}`);
        }
    }, [applyStatus]);

    useEffect(() => { load(); }, [load]);

    // Підтягуємо «Наступний» без перезавантаження сторінки. Поля панелі при
    // цьому не чіпаємо — інакше фоновий тік затер би недописане налаштування.
    useEffect(() => {
        const t = setInterval(async () => {
            try {
                const { data } = await axios.get('/db/backup-settings');
                setStatus(data);
            } catch { /* тимчасова мережева похибка — спробуємо наступного разу */ }
        }, 120_000);
        return () => clearInterval(t);
    }, []);

    const settings = status?.settings || EMPTY_DRAFT;
    const state = status?.state || {};

    const savePatch = async (patch, note = '') => {
        setSaving(true);
        setMsgErr(false);
        setMsg('');
        try {
            const { data } = await axios.put('/db/backup-settings', patch);
            applyStatus(data);
            if (note) setMsg(note);
        } catch (e) {
            setMsgErr(true);
            setMsg(`✗ ${e?.response?.data?.error || e.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = (e) => savePatch({ enabled: e.target.checked });
    const handleTimeChange = (e) => savePatch({ time: e.target.value });

    // Час має власний інпут у верхньому рядку й зберігається одразу — тут його не чіпаємо
    const handleSavePanel = () => savePatch({
        localPath: draft.localPath,
        keepLocal: draft.keepLocal,
        gdriveEnabled: draft.gdriveEnabled,
        gdriveFolderId: draft.gdriveFolderId,
        keepDrive: draft.keepDrive,
    }, '✓ Налаштування збережено');

    const triggerBackup = async () => {
        if (busy) return;
        setBusy(true);
        setMsgErr(false);
        setMsg('');
        try {
            const { data } = await axios.post('/db/backup-db');
            if (data.status) applyStatus(data.status);
            setMsgErr(!!data.driveError);
            setMsg(data.driveError
                ? `✓ ${data.filename}, але Google Drive: ${data.driveError}`
                : `✓ ${data.filename} (${fmtSize(data.size)})${data.driveLink ? ' + Google Drive' : ''}`);
        } catch (e) {
            setMsgErr(true);
            setMsg(`✗ ${e?.response?.data?.error || e.message}`);
        } finally {
            setBusy(false);
        }
    };

    const checkDrive = async () => {
        setBusy(true);
        setMsgErr(false);
        setMsg('');
        try {
            const { data } = await axios.post('/db/backup-check-drive', { folderId: draft.gdriveFolderId });
            setMsg(`✓ Тека на Drive: «${data.folder.name}»`);
        } catch (e) {
            setMsgErr(true);
            setMsg(`✗ ${e?.response?.data?.error || e.message}`);
        } finally {
            setBusy(false);
        }
    };

    const downloadBackup = async (name) => {
        try {
            const res = await axios.get(`/db/backup-file/${encodeURIComponent(name)}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            setMsgErr(true);
            setMsg(`✗ ${e?.response?.data?.error || e.message}`);
        }
    };

    // ── Експорт / Імпорт ──
    const handleExport = async () => {
        try {
            const response = await axios.get('/db/export-data', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'database_backup.zip');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Помилка експорту', error);
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('archive', file);
        try {
            const response = await axios.post('/db/import-data', formData);
            alert(response.data);
        } catch (error) {
            console.error('Помилка імпорту', error);
        }
    };

    return (
        <div className="pp-bk">
            <div className="pp-bk-row">
                {/* ── Експорт / Імпорт ── */}
                <button className="pp-bk-btn" onClick={handleExport}>Експорт даних</button>
                <input type="file" onChange={handleImport} style={{ fontSize: '0.9vw', color: 'inherit' }} />

                <span className="pp-bk-sep">|</span>

                {/* ── Автобекап ── */}
                <label className="pp-bk-label">
                    <input
                        type="checkbox"
                        className="pp-bk-check"
                        checked={!!settings.enabled}
                        onChange={handleToggle}
                        disabled={saving}
                    />
                    Автобекап щодня о
                </label>

                <input
                    type="time"
                    className="pp-bk-time"
                    value={settings.time || '18:00'}
                    onChange={handleTimeChange}
                    disabled={saving}
                />

                {settings.enabled && status?.nextRun && (
                    <span className="pp-bk-next">Наступний: {fmtDate(status.nextRun)}</span>
                )}

                {state.lastRun && (
                    <span className="pp-bk-muted">
                        Останній: {fmtDate(state.lastRun)}
                        {state.lastStatus === 'error' ? ' ⚠' : ''}
                    </span>
                )}

                <button className="pp-bk-btn" onClick={() => setShowPanel(v => !v)}>
                    {showPanel ? '▲ Налаштування' : '⚙ Налаштування'}
                </button>

                <button
                    className="pp-bk-btn pp-bk-btn--primary"
                    onClick={triggerBackup}
                    disabled={busy}
                >
                    {busy ? '...' : '💾 Зберегти зараз'}
                </button>

                {msg && <span className={msgErr ? 'pp-bk-err' : 'pp-bk-ok'}>{msg}</span>}
            </div>

            {showPanel && (
                <div className="pp-bk-panel">
                    <span className="pp-bk-panel-title">Куди зберігати</span>

                    <div className="pp-bk-panel-row">
                        <label className="pp-bk-label" style={{ flex: 1 }}>
                            Тека на сервері:
                            <input
                                className="pp-bk-input"
                                value={draft.localPath}
                                placeholder={status?.defaultPath || 'data/BackupDB'}
                                onChange={(e) => setDraft(d => ({ ...d, localPath: e.target.value }))}
                            />
                        </label>
                        <label className="pp-bk-label">
                            Тримати копій:
                            <input
                                type="number"
                                min="0"
                                className="pp-bk-num"
                                value={draft.keepLocal}
                                onChange={(e) => setDraft(d => ({ ...d, keepLocal: e.target.value }))}
                            />
                        </label>
                    </div>

                    <span className="pp-bk-hint">
                        Шлях абсолютний (<code>E:\Backups</code>) або відносний до теки Backend
                        (<code>config/backups</code>). Зараз пишемо в: {status?.resolvedPath || '—'}.
                        «Тримати копій» = 0 — старі архіви не видаляти.
                    </span>

                    <span className="pp-bk-panel-title">Google Drive</span>

                    <div className="pp-bk-panel-row">
                        <label className="pp-bk-label">
                            <input
                                type="checkbox"
                                className="pp-bk-check"
                                checked={!!draft.gdriveEnabled}
                                onChange={(e) => setDraft(d => ({ ...d, gdriveEnabled: e.target.checked }))}
                            />
                            Дублювати копію на Google Drive
                        </label>
                        <label className="pp-bk-label" style={{ flex: 1 }}>
                            ID теки:
                            <input
                                className="pp-bk-input"
                                value={draft.gdriveFolderId}
                                placeholder="1AbC...xyz"
                                onChange={(e) => setDraft(d => ({ ...d, gdriveFolderId: e.target.value }))}
                            />
                        </label>
                        <button className="pp-bk-btn" onClick={checkDrive} disabled={busy || !draft.gdriveFolderId}>
                            Перевірити
                        </button>
                        <label className="pp-bk-label">
                            Тримати на Drive:
                            <input
                                type="number"
                                min="0"
                                className="pp-bk-num"
                                value={draft.keepDrive}
                                onChange={(e) => setDraft(d => ({ ...d, keepDrive: e.target.value }))}
                            />
                        </label>
                    </div>

                    <span className="pp-bk-hint">
                        ID теки — це хвіст її адреси: drive.google.com/drive/folders/<b>ID</b>.
                        {status?.driveAccount
                            ? <> Спершу відкрийте доступ «Редактор» для сервісного акаунта <b>{status.driveAccount}</b>.</>
                            : <> Сервісний ключ Google на сервері не налаштований — вивантаження на Drive не працюватиме.</>}
                        {' '}«Тримати на Drive» = 0 — на Drive нічого не видаляти.
                    </span>

                    <div className="pp-bk-panel-row">
                        <button className="pp-bk-btn pp-bk-btn--primary" onClick={handleSavePanel} disabled={saving}>
                            {saving ? '...' : 'Зберегти налаштування'}
                        </button>
                        <button className="pp-bk-btn" onClick={load} disabled={saving}>Оновити</button>
                        {state.lastStatus === 'error' && state.lastError && (
                            <span className="pp-bk-err">Остання помилка: {state.lastError}</span>
                        )}
                    </div>

                    {!!status?.files?.length && (
                        <>
                            <span className="pp-bk-panel-title">Збережені копії ({status.files.length})</span>
                            <div className="pp-bk-files">
                                {status.files.map(f => (
                                    <div className="pp-bk-file" key={f.name}>
                                        <button className="pp-bk-file-name" onClick={() => downloadBackup(f.name)}>
                                            {f.name}
                                        </button>
                                        <span>{fmtSize(f.size)}</span>
                                        <span>{fmtDate(f.mtime)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExportImportComponent;
