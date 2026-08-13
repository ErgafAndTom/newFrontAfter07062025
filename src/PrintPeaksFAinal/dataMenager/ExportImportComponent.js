import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    const fileRef = useRef(null);

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
            if (data.warning) {
                setMsgErr(true);
                setMsg(`⚠ ${data.warning}`);
            } else if (note) {
                setMsg(note);
            }
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
                : `✓ ${data.filename} (${fmtSize(data.size)})${data.driveLink ? ' + Drive' : ''}`);
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
            setMsg(`✓ Тека «${data.folder.name}»`);
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
        setBusy(true);
        setMsgErr(false);
        setMsg('');
        try {
            const response = await axios.get('/db/export-data', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'database_backup.zip');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            setMsgErr(true);
            setMsg(`✗ Помилка експорту: ${e?.response?.data?.error || e.message}`);
        } finally {
            setBusy(false);
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        // Імпорт перезаписує рядки в усіх таблицях — питаємо перед стартом
        const go = window.confirm(
            `Імпортувати «${file.name}» у базу?\n\n` +
            'Дані з архіву перезапишуть наявні записи з тими самими id. ' +
            'Радимо спершу зробити бекап кнопкою «Зберегти зараз».'
        );
        if (!go) {
            if (fileRef.current) fileRef.current.value = '';
            return;
        }

        const formData = new FormData();
        formData.append('archive', file);
        setBusy(true);
        setMsgErr(false);
        setMsg('');
        try {
            const response = await axios.post('/db/import-data', formData);
            setMsg(typeof response.data === 'string' ? response.data : '✓ Дані імпортовано');
        } catch (e) {
            setMsgErr(true);
            setMsg(`✗ ${e?.response?.data?.error || e?.response?.data || e.message}`);
        } finally {
            setBusy(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const stateClass = state.lastStatus === 'error'
        ? 'pp-bk-state pp-bk-state--err'
        : (settings.enabled ? 'pp-bk-state pp-bk-state--on' : 'pp-bk-state');

    return (
        <div className="pp-bk">

            {/* ── Смуга 1: обмін даними ── */}
            <div className="pp-bk-bar">
                <span className="pp-bk-eyebrow">Обмін даними</span>

                <button className="ppButton ppButton--sm" onClick={handleExport} disabled={busy}>
                    <span>Експорт бази</span>
                </button>

                <label className="ppButton ppButton--sm pp-bk-file-pick pp-bk-btn-danger">
                    <span>Імпорт з архіву</span>
                    <input type="file" accept=".zip" ref={fileRef} onChange={handleImport} disabled={busy} />
                </label>

                <span className="pp-bk-div" />

                <span className="pp-bk-eyebrow">Автобекап</span>

                <label className="pp-bk-check">
                    <input
                        type="checkbox"
                        checked={!!settings.enabled}
                        onChange={handleToggle}
                        disabled={saving}
                    />
                    Щодня о
                </label>

                <input
                    type="time"
                    className="pp-bk-inp pp-bk-inp--time"
                    value={settings.time || '18:00'}
                    onChange={handleTimeChange}
                    disabled={saving}
                />

                <span className={stateClass}>
                    <span className="pp-bk-dot" />
                    {settings.enabled && status?.nextRun
                        ? <>Наступний <b className="pp-bk-strong">{fmtDate(status.nextRun)}</b></>
                        : <>Вимкнено</>}
                </span>

                {state.lastRun && (
                    <span className="pp-bk-cap" style={{ opacity: 0.7 }}>
                        Останній <b className="pp-bk-strong">{fmtDate(state.lastRun)}</b>
                    </span>
                )}

                <span className="pp-bk-spacer" />

                {msg && !msgErr && (
                    <span className="pp-bk-msg pp-bk-ok" title={msg}>{msg}</span>
                )}

                <button
                    className={`ppButton ppButton--sm ${showPanel ? 'active' : ''}`}
                    onClick={() => setShowPanel(v => !v)}
                    aria-pressed={showPanel}
                >
                    <span>Налаштування</span>
                </button>

                <button
                    className="ppButton ppButton--sm pp-bk-btn-go"
                    onClick={triggerBackup}
                    disabled={busy}
                >
                    <span>{busy ? 'Працюю…' : 'Зберегти зараз'}</span>
                </button>
            </div>

            {/* Помилки й попередження бувають довгі (напр. про Спільний диск) —
                показуємо їх банером, а не обрізаним рядком у смузі */}
            {msg && msgErr && (
                <div className="pp-bk-banner">
                    <span>{msg}</span>
                    <button className="pp-bk-banner-x" onClick={() => setMsg('')} title="Приховати">✕</button>
                </div>
            )}

            {/* ── Панель налаштувань ── */}
            {showPanel && (
                <div className="pp-bk-panel">

                    <div className="pp-bk-sect">
                        <span className="pp-bk-eyebrow pp-bk-eyebrow--full">Тека на сервері</span>

                        <div className="pp-bk-line">
                            <label className="pp-bk-field pp-bk-field--grow">
                                Шлях
                                <input
                                    className="pp-bk-inp pp-bk-inp--path"
                                    value={draft.localPath}
                                    placeholder={status?.defaultPath || 'data/BackupDB'}
                                    onChange={(e) => setDraft(d => ({ ...d, localPath: e.target.value }))}
                                />
                            </label>
                            <label className="pp-bk-field">
                                Тримати копій
                                <input
                                    type="number"
                                    min="0"
                                    className="pp-bk-inp pp-bk-inp--num"
                                    value={draft.keepLocal}
                                    onChange={(e) => setDraft(d => ({ ...d, keepLocal: e.target.value }))}
                                />
                            </label>
                        </div>

                        <span className="pp-bk-note">
                            Абсолютний (<code>E:\Backups</code>) або відносний до теки Backend
                            (<code>config/backups</code>). Зараз пишемо в <code>{status?.resolvedPath || '—'}</code>.
                            «Тримати копій» = 0 — старі архіви не видаляти.
                        </span>
                    </div>

                    <div className="pp-bk-sect">
                        <span className="pp-bk-eyebrow pp-bk-eyebrow--full">Google Drive</span>

                        <div className="pp-bk-line">
                            <label className="pp-bk-check">
                                <input
                                    type="checkbox"
                                    checked={!!draft.gdriveEnabled}
                                    onChange={(e) => setDraft(d => ({ ...d, gdriveEnabled: e.target.checked }))}
                                />
                                Дублювати копію
                            </label>

                            <label className="pp-bk-field pp-bk-field--grow">
                                ID теки
                                <input
                                    className="pp-bk-inp pp-bk-inp--id"
                                    value={draft.gdriveFolderId}
                                    placeholder="1AbC…xyz"
                                    onChange={(e) => setDraft(d => ({ ...d, gdriveFolderId: e.target.value }))}
                                />
                            </label>

                            <button
                                className="ppButton ppButton--sm"
                                onClick={checkDrive}
                                disabled={busy || !draft.gdriveFolderId}
                            >
                                <span>Перевірити</span>
                            </button>

                            <label className="pp-bk-field">
                                Тримати на Drive
                                <input
                                    type="number"
                                    min="0"
                                    className="pp-bk-inp pp-bk-inp--num"
                                    value={draft.keepDrive}
                                    onChange={(e) => setDraft(d => ({ ...d, keepDrive: e.target.value }))}
                                />
                            </label>
                        </div>

                        <span className="pp-bk-note">
                            ID теки — хвіст її адреси: drive.google.com/drive/folders/<b>ID</b>.
                            {status?.driveAccount
                                && <> Спершу відкрийте доступ «Редактор» для сервісного акаунта <b>{status.driveAccount}</b>.</>}
                            {' '}«Тримати на Drive» = 0 — на Drive нічого не видаляти.
                        </span>

                        {!status?.driveAccount && status?.driveDiagnostics && (
                            <span className="pp-bk-note pp-bk-err">
                                Сервісний ключ Google на сервері не читається, тож вивантаження
                                не працюватиме. Що бачить сервер: <code>{status.driveDiagnostics}</code>
                            </span>
                        )}
                    </div>

                    <div className="pp-bk-line">
                        <button
                            className="ppButton ppButton--sm pp-bk-btn-go"
                            onClick={handleSavePanel}
                            disabled={saving}
                        >
                            <span>{saving ? 'Зберігаю…' : 'Зберегти налаштування'}</span>
                        </button>
                        <button className="ppButton ppButton--sm" onClick={load} disabled={saving}>
                            <span>Оновити</span>
                        </button>
                        {state.lastStatus === 'error' && state.lastError && (
                            <span className="pp-bk-cap pp-bk-err">Остання помилка: {state.lastError}</span>
                        )}
                    </div>

                    {!!status?.files?.length && (
                        <div className="pp-bk-sect">
                            <span className="pp-bk-eyebrow pp-bk-eyebrow--full">
                                Збережені копії · {status.files.length}
                            </span>
                            <div className="pp-bk-files">
                                {status.files.map(f => (
                                    <div className="pp-bk-file" key={f.name}>
                                        <button
                                            className="pp-bk-file-name"
                                            onClick={() => downloadBackup(f.name)}
                                            title="Завантажити архів"
                                        >
                                            {f.name}
                                        </button>
                                        <span className="pp-bk-file-meta">{fmtSize(f.size)}</span>
                                        <span className="pp-bk-file-meta">{fmtDate(f.mtime)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExportImportComponent;
