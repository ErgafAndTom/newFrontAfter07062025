import React, { useState, useRef, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import useMugScene from './useMugScene';
import './MugMockupModal.css';

const API = process.env.REACT_APP_API_URL || '';

// Standard sublimation mug handle/interior colors
const HANDLE_COLORS = [
    { id: 'white',      hex: '#f5f5f0', label: 'Білий' },
    { id: 'lightblue',  hex: '#11729a', label: 'Блакитний' },
    { id: 'darkred',    hex: '#591a2b', label: 'Бордо' },
    { id: 'cyan',       hex: '#41848b', label: 'Бірюзовий' },
    { id: 'yellow',     hex: '#e6be24', label: 'Жовтий' },
    { id: 'green',      hex: '#548446', label: 'Зелений' },
    { id: 'darkgreen',  hex: '#3f6e35', label: 'Темно-зелений' },
    { id: 'brown',      hex: '#6D4C41', label: 'Коричневий' },
    { id: 'orange',     hex: '#d55d31', label: 'Помаранчевий' },
    { id: 'pink',       hex: '#d88d91', label: 'Рожевий' },
    { id: 'lime',       hex: '#93aa4e', label: 'Салатовий' },
    { id: 'blue',       hex: '#526aa3', label: 'Синій' },
    { id: 'grey',       hex: '#7d7d7f', label: 'Сірий' },
    { id: 'navy',       hex: '#08185c', label: 'Темно-синій' },
    { id: 'red',        hex: '#c61c1c', label: 'Червоний' },
    { id: 'black',      hex: '#212121', label: 'Чорний' },
];

export default function MugMockupModal({ orderId, onClose }) {
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    const [textureFile, setTextureFile] = useState(null);
    const [texturePreview, setTexturePreview] = useState(null);
    const [settings, setSettings] = useState({ offsetX: 0, offsetY: 0, scale: 1, rotation: 0 });
    const [handleColor, setHandleColor] = useState('#f5f5f0');
    const [mockupId, setMockupId] = useState(null);
    const [shareToken, setShareToken] = useState(null);
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [existingMockups, setExistingMockups] = useState([]);

    const { updateTexture, updateSettings, updateHandleColor } = useMugScene(canvasRef, {
        textureUrl: texturePreview,
        textureSettings: settings,
        handleColor,
        interactive: true,
    });

    // Завантажити існуючі макети
    useEffect(() => {
        axiosInstance.get(`/api/mockup/${orderId}`)
            .then(r => {
                if (r.data.mockups?.length) {
                    setExistingMockups(r.data.mockups);
                    const last = r.data.mockups[0];
                    if (last.imageUrl) {
                        const url = `${API}/mockup-textures/${last.imageUrl}`;
                        setTexturePreview(url);
                        updateTexture(url);
                    }
                    if (last.textureSettings) setSettings(last.textureSettings);
                    setMockupId(last.id);
                    setShareToken(last.token);
                }
            })
            .catch(() => {});
    }, [orderId]);

    // Обробка вибору файлу
    const handleFileSelect = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setTextureFile(file);
        const url = URL.createObjectURL(file);
        setTexturePreview(url);
        updateTexture(url);
    }, [updateTexture]);

    // Зміна слайдерів
    const handleSettingChange = useCallback((key, value) => {
        setSettings(prev => {
            const next = { ...prev, [key]: parseFloat(value) };
            updateSettings(next);
            return next;
        });
    }, [updateSettings]);

    // Зберегти макет (upload + create)
    const handleSave = useCallback(async () => {
        if (!textureFile && !texturePreview) {
            setError('Завантажте зображення');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append('orderId', orderId);
            fd.append('textureSettings', JSON.stringify(settings));
            if (textureFile) fd.append('texture', textureFile);

            const res = await axiosInstance.post('/api/mockup/create', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const m = res.data.mockup;
            setMockupId(m.id);
            setShareToken(m.token);

            // Оновити текстуру якщо сервер повернув imageUrl
            if (m.imageUrl) {
                const url = `${API}/mockup-textures/${m.imageUrl}`;
                setTexturePreview(url);
                updateTexture(url);
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setSaving(false);
        }
    }, [orderId, settings, textureFile, texturePreview, updateTexture]);

    // Оновити налаштування на сервері
    const handleUpdateSettings = useCallback(async () => {
        if (!mockupId) return;
        try {
            await axiosInstance.put(`/api/mockup/${mockupId}/settings`, { textureSettings: settings });
        } catch (_) {}
    }, [mockupId, settings]);

    // Скопіювати посилання
    const shareLink = shareToken ? `${window.location.origin}/mockup/${shareToken}` : null;
    const handleCopy = useCallback(async () => {
        if (!shareLink) return;
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (_) {
            // fallback
            const ta = document.createElement('textarea');
            ta.value = shareLink;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [shareLink]);

    return (
        <div className="mmm-overlay" onClick={onClose}>
            <div className="mmm-modal" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="mmm-header">
                    <span className="mmm-title">МАКЕТ ЧАШКИ — Замовлення №{orderId}</span>
                    <button className="mmm-close" onClick={onClose}>✕</button>
                </div>

                <div className="mmm-body">
                    {/* Left — 3D canvas + color palette */}
                    <div className="mmm-canvas-area">
                        <div className="mmm-color-palette">
                            {HANDLE_COLORS.map(c => (
                                <button
                                    key={c.id}
                                    className={`mmm-color-dot${handleColor === c.hex ? ' mmm-color-active' : ''}`}
                                    style={{ background: c.hex }}
                                    title={c.label}
                                    onClick={() => {
                                        setHandleColor(c.hex);
                                        updateHandleColor(c.hex);
                                    }}
                                />
                            ))}
                        </div>
                        <div className="mmm-canvas-wrap" ref={canvasRef} />
                    </div>

                    {/* Right — controls */}
                    <div className="mmm-controls">
                        {/* Upload */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />
                        <button
                            className="mmm-btn mmm-btn-upload"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Завантажити фото
                        </button>

                        {/* Sliders */}
                        <div className="mmm-slider-group">
                            <label className="mmm-slider-label">
                                <span>Зсув X</span>
                                <input type="range" min="-1" max="1" step="0.01"
                                    value={settings.offsetX}
                                    onChange={e => handleSettingChange('offsetX', e.target.value)}
                                    onMouseUp={handleUpdateSettings}
                                />
                            </label>
                            <label className="mmm-slider-label">
                                <span>Зсув Y</span>
                                <input type="range" min="-1" max="1" step="0.01"
                                    value={settings.offsetY}
                                    onChange={e => handleSettingChange('offsetY', e.target.value)}
                                    onMouseUp={handleUpdateSettings}
                                />
                            </label>
                            <label className="mmm-slider-label">
                                <span>Масштаб</span>
                                <input type="range" min="0.2" max="3" step="0.05"
                                    value={settings.scale}
                                    onChange={e => handleSettingChange('scale', e.target.value)}
                                    onMouseUp={handleUpdateSettings}
                                />
                            </label>
                            <label className="mmm-slider-label">
                                <span>Поворот</span>
                                <input type="range" min="0" max={String(Math.PI * 2)} step="0.05"
                                    value={settings.rotation}
                                    onChange={e => handleSettingChange('rotation', e.target.value)}
                                    onMouseUp={handleUpdateSettings}
                                />
                            </label>
                        </div>

                        {/* Save / create link */}
                        {!shareToken && (
                            <button
                                className="mmm-btn mmm-btn-save"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Збереження...' : 'Створити посилання'}
                            </button>
                        )}

                        {/* Share link */}
                        {shareLink && (
                            <div className="mmm-share-block">
                                <div className="mmm-share-url">{shareLink}</div>
                                <button className="mmm-btn mmm-btn-copy" onClick={handleCopy}>
                                    {copied ? '✓ Скопійовано' : 'Скопіювати посилання'}
                                </button>
                            </div>
                        )}

                        {/* Status of existing mockups */}
                        {existingMockups.length > 0 && (
                            <div className="mmm-existing">
                                {existingMockups.map(m => (
                                    <div key={m.id} className={`mmm-existing-item mmm-status-${m.status}`}>
                                        #{m.id} — {m.status === 'confirmed' ? 'Підтверджено ✓' : m.status === 'rejected' ? 'Відхилено' : 'Очікує'}
                                    </div>
                                ))}
                            </div>
                        )}

                        {error && <div className="mmm-error">{error}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
