import React, { useEffect, useState, useRef } from "react";
import axios from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import {Spinner} from "react-bootstrap";

// ── Стилі ───────────────────────────────────────────────────────────
const S = {
  overlay: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(15,15,15,0.45)',
    backdropFilter: 'blur(2px)',
    zIndex: 10500,
    transition: 'opacity 0.22s ease-out',
  },
  panel: {
    position: 'fixed',
    left: '50%', top: '50%',
    backgroundColor: 'var(--adminfon, #f7f5ee)',
    color: 'var(--admingrey, #666666)',
    width: 'min(96vw, 480px)',
    borderRadius: 0,
    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 10501,
    transition: 'opacity 0.22s ease-out, transform 0.22s ease-out',
    cursor: 'auto',
  },
  header: {
    display: 'flex', alignItems: 'center',
    padding: '0.6rem 1.2rem',
    borderBottom: '1px solid rgba(0,0,0,0.07)',
    background: 'var(--adminfon, #f7f5ee)',
    flexShrink: 0,
  },
  headerTitle: {
    flex: 1,
    fontSize: 'var(--font-size-paybig)',
    fontWeight: 400,
    color: 'var(--admingrey, #666666)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  closeBtn: {
    background: 'transparent', border: 0, padding: 0,
    fontSize: '21px', color: 'var(--admingrey, #666666)',
    cursor: 'pointer', lineHeight: 1,
  },
  body: {
    padding: '1rem 1.2rem',
    overflowY: 'auto',
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.6rem',
    gap: '1rem',
  },
  label: {
    minWidth: '160px',
    fontSize: 'var(--fontsmall, 13px)',
    fontWeight: 400,
    color: 'var(--admingrey, #666666)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(0,0,0,0.2)',
    borderRadius: 0,
    padding: '0.35rem 0',
    fontSize: 'var(--fontsmall, 13px)',
    fontWeight: 400,
    color: 'var(--admingrey, #666666)',
    outline: 'none',
    width: '100%',
  },
  textarea: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(0,0,0,0.2)',
    borderRadius: 0,
    padding: '0.35rem 0',
    fontSize: 'var(--fontsmall, 13px)',
    fontWeight: 400,
    color: 'var(--admingrey, #666666)',
    outline: 'none',
    width: '100%',
    resize: 'vertical',
    minHeight: '60px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '0.8rem 1.2rem',
    borderTop: '1px solid rgba(0,0,0,0.07)',
    gap: '0.5rem',
  },
};

function AddPaysInOrder({ showAddPay, setShowAddPay, data, setData, showAddPayView, setShowAddPayView, showAddPayWriteId, setShowAddPayWriteId, thisOrder, setThisOrder, initialData }) {
    const [load, setLoad] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [isAnimating, setIsAnimating] = useState(false);
    const dropdownRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState(() =>
        (initialData && showAddPayWriteId)
            ? { taxSystem: "ФОП", ...initialData }
            : { taxSystem: "ФОП" }
    );

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => setShowAddPay(false), 280);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? "true" : "false") : value,
        }));
    };

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();
        setLoad(true);
        axios.post(`/api/contractorsN/updateContractor`, { formData, contractorId: showAddPayWriteId })
            .then(response => {
                setData(prev => prev.map(o => o.id === response.data.id ? response.data : o));
                setError(null);
                setLoad(false);
                setShowAddPay(false);
            })
            .catch(err => {
                if (err.response?.status === 403) navigate('/login');
                setError(err.message);
                setLoad(false);
            });
    };

    const handleSubmitAdd = async (e) => {
        e.preventDefault();
        setLoad(true);
        axios.post(`/api/contractorsN/addContractor`, { formData, clientId: thisOrder.clientId })
            .then(response => {
                setData(prev => [...prev, response.data]);
                setError(null);
                setLoad(false);
                setShowAddPay(false);
            })
            .catch(err => {
                if (err.response?.status === 403) navigate('/login');
                setError(err.message);
                setLoad(false);
            });
    };

    useEffect(() => {
        if (showAddPay) setTimeout(() => setIsAnimating(true), 20);
        else setIsAnimating(false);
    }, [showAddPay]);

    const panelStyle = {
        ...S.panel,
        opacity: isAnimating ? 1 : 0,
        transform: isAnimating ? 'translate(-50%, -50%)' : 'translate(-50%, -52%)',
    };

    return (
        <>
            {/* Overlay */}
            <div style={{ ...S.overlay, opacity: isAnimating ? 1 : 0 }} onClick={handleClose} />

            {/* Panel */}
            <div style={panelStyle}>

                {/* Header */}
                <div style={S.header}>
                    <span style={S.headerTitle}>
                        {showAddPayView ? '' : ''}
                    </span>
                    <button style={S.closeBtn} onClick={handleClose}>✕</button>
                </div>

                {/* Body */}
                <div style={S.body}>
                    {load ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                            <Spinner animation="border" variant="dark" />
                        </div>
                    ) : (
                        <form onSubmit={e => e.preventDefault()}>

                            <div style={S.fieldRow}>
                                <span style={S.label}>Контрагент</span>
                                <input required value={formData.name || ''} name="name" type="text"
                                    placeholder="Назва ФОП / компанії / організації"
                                    className="pay-input" style={S.input} onChange={handleChange} />
                            </div>

                            {/* Система оподаткування + ПДВ */}
                            <div style={{ ...S.fieldRow, alignItems: 'center' }}>
                                <span style={S.label}>Система оподат.</span>
                                <div ref={dropdownRef} style={{ flex: 1, position: 'relative' }}>
                                    <div
                                        onClick={() => setOpen(!open)}
                                        style={{
                                            ...S.input,
                                            cursor: 'pointer',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        }}
                                    >
                                        <span>{formData.taxSystem || 'Оберіть'}</span>
                                        <span style={{ color: 'var(--adminorange, #f5a623)', fontSize: '18px' }}>▾</span>
                                    </div>
                                    {open && (
                                        <div style={{
                                            position: 'absolute', top: '100%', left: 0, right: 0,
                                            background: 'var(--adminfonelement, #f2f0e9)',
                                            border: '1px solid rgba(0,0,0,0.1)',
                                            zIndex: 10,
                                        }}>
                                            {['ФОП', 'ТОВ', 'Неприбуткова організація'].map(opt => (
                                                <div key={opt}
                                                    onClick={() => { setFormData(p => ({ ...p, taxSystem: opt })); setOpen(false); }}
                                                    style={{
                                                        padding: '0.4rem 0.8rem',
                                                        fontSize: 'var(--fontsmall, 13px)',
                                                        fontWeight: 400,
                                                        color: 'var(--admingrey, #666)',
                                                        cursor: 'pointer',
                                                        background: formData.taxSystem === opt ? 'var(--adminlightgreen, #e2f2eb)' : 'transparent',
                                                    }}
                                                >{opt}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <label htmlFor="pdv-checkbox" style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    cursor: 'pointer', marginLeft: '1.5rem',
                                    fontSize: 'var(--fontsmall, 13px)', fontWeight: 400,
                                    color: 'var(--admingrey, #666666)',
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                }}>
                                    <input type="checkbox" name="pdv" id="pdv-checkbox"
                                        checked={formData.pdv === 'true' || formData.pdv === true}
                                        onChange={handleChange}
                                        style={{
                                            width: '16px', height: '16px',
                                            accentColor: 'var(--admingreen, #0e935b)',
                                            cursor: 'pointer', flexShrink: 0,
                                        }} />
                                    ПДВ
                                </label>
                            </div>

                            {[
                                { label: 'Адреса',   name: 'address',  placeholder: 'Адреса ФОП / компанії' },
                                { label: 'Банк',     name: 'bankName', placeholder: 'Банк контрагента' },
                                { label: 'IBAN',     name: 'iban',     placeholder: 'UA 123456789 123456789123456' },
                                { label: 'ЄДРПОУ',  name: 'edrpou',   placeholder: '123456789' },
                                { label: 'E-mail',   name: 'email',    placeholder: 'example@mail.com', type: 'email' },
                                { label: 'Телефон',  name: 'phone',    placeholder: '+380 111 111 111' },
                            ].map(f => (
                                <div key={f.name} style={S.fieldRow}>
                                    <span style={S.label}>{f.label}</span>
                                    <input value={formData[f.name] || ''} name={f.name} type={f.type || 'text'}
                                        placeholder={f.placeholder} className="pay-input" style={S.input} onChange={handleChange} />
                                </div>
                            ))}

                            <div style={S.fieldRow}>
                                <span style={S.label}>Коментар</span>
                                <textarea name="comment" placeholder="Залиште коментар"
                                    value={formData.comment || ''}
                                    onChange={handleChange} className="pay-input" style={S.textarea} />
                            </div>

                            {error && (
                                <div style={{ color: 'var(--adminred, #ee3c23)', fontSize: '13px', marginBottom: '0.5rem' }}>
                                    {error}
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Footer */}
                {!load && (
                    <div style={S.footer}>
                        {showAddPayView
                            ? <button className="pays-tbl-btn" style={{ fontSize: 'var(--font-size-s)' }} onClick={handleSubmitUpdate}>Редагувати</button>
                            : <button className="pays-tbl-btn pays-tbl-btn--green" style={{ fontSize: 'var(--font-size-s)' }} onClick={handleSubmitAdd}>Додати</button>
                        }
                    </div>
                )}
            </div>
        </>
    );
}

export default AddPaysInOrder;
