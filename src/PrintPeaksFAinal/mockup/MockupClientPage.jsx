import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import useMugScene from './useMugScene';
import './MockupClientPage.css';

const API = process.env.REACT_APP_API_URL || '';

export default function MockupClientPage() {
    const { token } = useParams();
    const canvasRef = useRef(null);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [animating, setAnimating] = useState(false);

    const textureUrl = data?.imageUrl ? `${API}/mockup-textures/${data.imageUrl}` : null;

    const { updateTexture, updateSettings } = useMugScene(canvasRef, {
        interactive: true,
    });

    // Завантажити текстуру коли дані з API приходять
    useEffect(() => {
        if (textureUrl) {
            updateTexture(textureUrl);
        }
    }, [textureUrl, updateTexture]);

    useEffect(() => {
        if (data?.textureSettings) {
            updateSettings(data.textureSettings);
        }
    }, [data?.textureSettings, updateSettings]);

    // Завантажити дані макету (без JWT — публічний)
    useEffect(() => {
        axios.get(`${API}/api/mockup/public/${token}`)
            .then(r => {
                setData(r.data);
                if (r.data.status === 'confirmed') setConfirmed(true);
            })
            .catch(err => {
                const msg = err.response?.data?.error || 'Макет не знайдено';
                setError(msg);
            })
            .finally(() => setLoading(false));
    }, [token]);

    // Підтвердження
    const handleConfirm = async () => {
        setConfirming(true);
        try {
            const res = await axios.post(`${API}/api/mockup/public/${token}/confirm`);
            if (res.data.success) {
                setConfirmed(true);
                setAnimating(true);
                setTimeout(() => setAnimating(false), 2500);
            }
        } catch (err) {
            const msg = err.response?.data?.error || 'Помилка підтвердження';
            setError(msg);
        } finally {
            setConfirming(false);
        }
    };

    const isExpired = data?.status === 'expired';
    const showError = error && !data;

    return (
        <div className="mcp-page">
            <img src="/logo1.svg" alt="PrintPeaks" className="mcp-logo" />

            {loading && <div className="mcp-loader">Завантаження...</div>}

            {showError && <div className="mcp-error">{error}</div>}

            {isExpired && <div className="mcp-expired">Посилання закінчилось</div>}

            {data && !isExpired && (
                <div className="mcp-order-number">Замовлення №{data.orderId}</div>
            )}

            {/* 3D Canvas — завжди в DOM щоб useMugScene міг ініціалізувати сцену */}
            <div
                className={`mcp-canvas-wrap ${animating ? 'mcp-fly-animation' : ''}`}
                ref={canvasRef}
                style={(loading || isExpired || showError) ? { position: 'absolute', left: '-9999px' } : undefined}
            />

            {confirmed && !animating && (
                <div className="mcp-confirmed-msg">
                    <div className="mcp-check-icon">✓</div>
                    <div className="mcp-confirmed-text">Макет відправлено на друк!</div>
                    <div className="mcp-confirmed-sub">Дякуємо за підтвердження</div>
                </div>
            )}

            {confirmed && animating && (
                <div className="mcp-confirmed-msg mcp-animating">
                    <div className="mcp-printer-icon">🖨</div>
                </div>
            )}

            {data && !isExpired && !confirmed && (
                <button
                    className="mcp-confirm-btn"
                    onClick={handleConfirm}
                    disabled={confirming}
                >
                    {confirming ? 'Підтвердження...' : 'ПІДТВЕРДИТИ МАКЕТ'}
                </button>
            )}

            {error && data && <div className="mcp-error">{error}</div>}
        </div>
    );
}
