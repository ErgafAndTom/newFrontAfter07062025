import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

function ModalDeleteOrderUnit({ showDeleteOrderUnitModal, setShowDeleteOrderUnitModal, OrderUnit, setSelectedThings2, setThisOrder }) {
    const [load, setLoad] = useState(false);
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [error, setError] = useState(null);

    const handleClose = () => {
        setShowDeleteOrderUnitModal(false);
    };

    const deleteThis = () => {
        const idKey = OrderUnit.idKey;
        setLoad(true);
        setError(null);
        axios.delete(`/orderUnits/OneOrder/OneOrderUnitInOrder/${idKey}`)
            .then(response => {
                if (response.status === 200) {
                    setSelectedThings2(prev => prev.filter(u => u.idKey !== idKey));
                    setThisOrder(response.data);
                    setLoad(false);
                    setShowDeleteOrderUnitModal(false);
                }
            })
            .catch(err => {
                setLoad(false);
                setError(err);
                if (err.response?.status === 403) navigate('/login');
            });
    };

    useEffect(() => {
        if (showDeleteOrderUnitModal) {
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 30);
        } else {
            setIsAnimating(false);
            setTimeout(() => setIsVisible(false), 280);
        }
    }, [showDeleteOrderUnitModal]);

    if (!isVisible) return null;

    return (
        <>
            <style>{`
                @keyframes mdu-spin {
                    to { transform: rotate(360deg); }
                }
                .mdu-btn {
                    position: relative;
                    isolation: isolate;
                    padding: 0.45rem 1.4rem;
                    border: 2px solid var(--adminblue, #3c60a6);
                    border-radius: 0;
                    background: transparent;
                    color: var(--adminblue, #3c60a6);
                    font-size: var(--fontsmall, 15px);
                    font-weight: 400;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.4rem;
                    box-sizing: border-box;
                    transition: color 0.3s;
                }
                /* ::before — закриває все крім нижньої полоски (ліво, право, верх) */
                .mdu-btn::before {
                    content: "";
                    position: absolute;
                    top: -2px; left: -2px;
                    width: calc(100% + 4px);
                    height: calc(100% - 2px);
                    background: var(--adminfonelement, #f2f0e9);
                    transition: height 0.25s ease-out, transform 0.25s ease-out;
                    z-index: -2;
                }
                /* ::after — закриває верхню половину щоб залишити тільки нижній відрізок */
                .mdu-btn::after {
                    content: "";
                    position: absolute;
                    top: -2px; left: -2px;
                    width: calc(100% + 4px);
                    height: 55%;
                    background: var(--adminfonelement, #f2f0e9);
                    transition: transform 0.25s ease-out 0.15s;
                    z-index: -1;
                }
                /* hover: спочатку ::after зникає (зверху), потім ::before їде вниз */
                .mdu-btn:not(:disabled):hover::before {
                    height: 0;
                    transform: translateY(4px);
                    transition: height 0.25s ease-out 0.1s, transform 0.25s ease-out 0.1s;
                }
                .mdu-btn:not(:disabled):hover::after {
                    transform: scaleY(0);
                    transform-origin: top;
                    transition: transform 0.2s ease-out;
                }

                .mdu-btn--danger {
                    border-color: var(--adminred, #ee3c23);
                    color: var(--adminred, #ee3c23);
                }
                .mdu-btn--danger:not(:disabled):hover {
                    color: var(--adminred, #ee3c23);
                }
                .mdu-btn:disabled {
                    opacity: 0.55;
                    cursor: not-allowed;
                }
            `}</style>

            {/* Overlay */}
            <div
                onClick={handleClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(15, 15, 15, 0.45)',
                    backdropFilter: 'blur(2px)',
                    WebkitBackdropFilter: 'blur(2px)',
                    zIndex: 9999,
                    opacity: isAnimating ? 1 : 0,
                    transition: 'opacity 220ms ease',
                }}
            />

            {/* Dialog */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: isAnimating
                        ? 'translate(-50%, -50%) scale(1)'
                        : 'translate(-50%, -44%) scale(0.92)',
                    opacity: isAnimating ? 1 : 0,
                    transition: 'opacity 260ms ease, transform 260ms ease',
                    zIndex: 10000,
                    width: 'clamp(280px, 36vw, 560px)',
                    background: 'var(--adminfonelement, #f2f0e9)',
                    borderRadius: 0,
                    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.2rem 1.4rem 0.9rem',
                    borderBottom: '1px solid rgba(0,0,0,0.07)',
                }}>
                    <div style={{
                        fontSize: 'var(--font-size-s, 17px)',
                        fontWeight: 400,
                        color: 'var(--admingrey, #666666)',
                        lineHeight: 1.45,
                    }}>
                        Видалити позицію?
                    </div>
                    <div style={{
                        marginTop: '0.35rem',
                        fontSize: 'var(--fontsmall, 15px)',
                        fontWeight: 400,
                        color: 'var(--admingrey, #666666)',
                        opacity: 0.7,
                        lineHeight: 1.4,
                        wordBreak: 'break-word',
                    }}>
                        {OrderUnit?.name}
                    </div>
                </div>

                {/* Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '0',
                    padding: '0.9rem 1.4rem',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                }}>
                    {error && (
                        <div style={{
                            flex: 1,
                            fontSize: 'var(--fontcard, 12px)',
                            color: 'var(--adminred, #ee3c23)',
                            lineHeight: 1.3,
                            marginRight: '0.8rem',
                        }}>
                            {error?.message}{error?.response?.data?.error ? ` — ${error.response.data.error}` : ''}
                        </div>
                    )}

                    <button className="mdu-btn" onClick={handleClose} style={{ marginRight: '0.6rem' }}>
                        Скасувати
                    </button>

                    <button className="mdu-btn mdu-btn--danger" onClick={deleteThis} disabled={load}>
                        {load
                            ? <><span style={{
                                width: '0.8em', height: '0.8em',
                                border: '2px solid rgba(238,60,35,0.3)',
                                borderTopColor: 'var(--adminred,#ee3c23)',
                                borderRadius: '50%',
                                display: 'inline-block',
                                animation: 'mdu-spin 0.7s linear infinite',
                              }} />Видалення…</>
                            : 'Видалити'
                        }
                    </button>
                </div>
            </div>
        </>
    );
}

export default ModalDeleteOrderUnit;
