import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import './ModalDeleteOrderUnit.css';

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

    return ReactDOM.createPortal(
        <>
            <div
                className={`mdu-overlay${isAnimating ? ' is-in' : ''}`}
                onClick={handleClose}
            />

            <div
                className={`mdu-panel${isAnimating ? ' is-in' : ''}`}
                role="dialog"
                aria-label="Видалити позицію"
            >
                <div className="mdu-head">
                    <div className="mdu-title">Видалити позицію?</div>
                    <div className="mdu-subject">{OrderUnit?.name}</div>
                </div>

                {error && (
                    <div className="mdu-err" role="alert">
                        {error?.message}
                        {error?.response?.data?.error ? ` — ${error.response.data.error}` : ''}
                    </div>
                )}

                <div className="mdu-actions">
                    <button type="button" className="mdu-btn" onClick={handleClose}>
                        <span>Скасувати</span>
                    </button>

                    <button
                        type="button"
                        className="mdu-btn mdu-btn--danger"
                        onClick={deleteThis}
                        disabled={load}
                    >
                        {load ? (
                            <>
                                <span className="mdu-spinner" />
                                <span>Видалення…</span>
                            </>
                        ) : (
                            <span>Видалити</span>
                        )}
                    </button>
                </div>
            </div>
        </>,
        document.body
    );
}

export default ModalDeleteOrderUnit;
