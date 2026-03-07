import React, { useState, useEffect, useRef } from 'react';
import axios from '../../api/axiosInstance';

const LS_KEY = 'autoBackup_settings';

function getNextSaveDate(intervalHours) {
    const d = new Date();
    d.setHours(d.getHours() + intervalHours, 0, 0, 0);
    return d.toISOString();
}

function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const INTERVALS = [
    { label: '6 год',  hours: 6  },
    { label: '12 год', hours: 12 },
    { label: '24 год', hours: 24 },
    { label: '48 год', hours: 48 },
];

const ExportImportComponent = () => {
    // ── стан автозбереження ──
    const [autoEnabled, setAutoEnabled]   = useState(false);
    const [intervalH,   setIntervalH]     = useState(24);
    const [nextSave,    setNextSave]       = useState(null);
    const [lastSaved,   setLastSaved]      = useState(null);
    const [saving,      setSaving]         = useState(false);
    const [saveMsg,     setSaveMsg]        = useState('');
    const timerRef = useRef(null);

    // Завантаження із localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw) {
                const s = JSON.parse(raw);
                setAutoEnabled(s.enabled ?? false);
                setIntervalH(s.intervalH ?? 24);
                setNextSave(s.nextSave ?? null);
                setLastSaved(s.lastSaved ?? null);
            }
        } catch {}
    }, []);

    // Зберігати до localStorage при зміні
    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify({
            enabled: autoEnabled, intervalH, nextSave, lastSaved
        }));
    }, [autoEnabled, intervalH, nextSave, lastSaved]);

    // Таймер перевірки
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!autoEnabled || !nextSave) return;

        timerRef.current = setInterval(() => {
            if (new Date() >= new Date(nextSave)) {
                triggerBackup(true);
            }
        }, 60_000); // перевіряємо кожну хвилину

        return () => clearInterval(timerRef.current);
    }, [autoEnabled, nextSave]); // eslint-disable-line

    const triggerBackup = async (auto = false) => {
        if (saving) return;
        setSaving(true);
        setSaveMsg('');
        try {
            const res = await axios.post('/db/backup-db');
            const now = new Date().toISOString();
            setLastSaved(now);
            if (auto) {
                setNextSave(getNextSaveDate(intervalH));
            }
            setSaveMsg(`✓ ${res.data.filename}`);
        } catch (e) {
            setSaveMsg(`✗ ${e?.response?.data?.error || e.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = (e) => {
        const on = e.target.checked;
        setAutoEnabled(on);
        if (on) {
            setNextSave(getNextSaveDate(intervalH));
            setSaveMsg('');
        } else {
            setNextSave(null);
            setSaveMsg('');
        }
    };

    const handleIntervalChange = (h) => {
        setIntervalH(h);
        if (autoEnabled) setNextSave(getNextSaveDate(h));
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

    const btnStyle = {
        margin: 0, fontSize: '1vw', whiteSpace: 'nowrap', cursor: 'pointer',
        background: '#e0e0e0', border: '1px solid #999', padding: '1px 6px',
    };
    const labelStyle = {
        margin: 0, color: '#fff', fontSize: '1vw',
        display: 'flex', alignItems: 'center', gap: '0.3vw', whiteSpace: 'nowrap',
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: '0.8vw', padding: '2px 0.4vw' }}>

            {/* ── Експорт / Імпорт ── */}
            <button style={btnStyle} onClick={handleExport}>Експорт даних</button>
            <input type="file" onChange={handleImport} style={{ fontSize: '1vw', color: '#fff' }} />

            {/* ── Роздільник ── */}
            <span style={{ color: '#aaa', fontSize: '1vw' }}>|</span>

            {/* ── Автозбереження бази ── */}
            <label style={labelStyle}>
                <input
                    type="checkbox"
                    checked={autoEnabled}
                    onChange={handleToggle}
                    style={{ width: '0.9vw', height: '0.9vw', cursor: 'pointer' }}
                />
                Автозбереження бази
            </label>

            {/* Інтервал */}
            <label style={labelStyle}>
                Кожні:
                <select
                    value={intervalH}
                    onChange={(e) => handleIntervalChange(+e.target.value)}
                    style={{ fontSize: '1vw', padding: '0 2px', background: '#444', color: '#fff', border: '1px solid #777' }}
                >
                    {INTERVALS.map(({ label, hours }) => (
                        <option key={hours} value={hours}>{label}</option>
                    ))}
                </select>
            </label>

            {/* Наступне збереження */}
            {autoEnabled && nextSave && (
                <label style={{ ...labelStyle, color: '#7fffb0' }}>
                    Наступне: {fmtDate(nextSave)}
                </label>
            )}

            {/* Останнє збереження */}
            {lastSaved && (
                <label style={{ ...labelStyle, color: '#aaa', fontSize: '0.85vw' }}>
                    Останнє: {fmtDate(lastSaved)}
                </label>
            )}

            {/* Зберегти зараз */}
            <button
                style={{ ...btnStyle, background: saving ? '#888' : '#2a7', color: '#fff', border: 'none' }}
                onClick={() => triggerBackup(false)}
                disabled={saving}
            >
                {saving ? '...' : '💾 Зберегти зараз'}
            </button>

            {/* Повідомлення про результат */}
            {saveMsg && (
                <span style={{ fontSize: '0.85vw', color: saveMsg.startsWith('✓') ? '#7fffb0' : '#ff6b6b', whiteSpace: 'nowrap' }}>
                    {saveMsg}
                </span>
            )}
        </div>
    );
};

export default ExportImportComponent;
