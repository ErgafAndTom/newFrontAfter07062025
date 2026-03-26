import React, {useState, useRef, useEffect} from 'react';
import ReactDOM from 'react-dom';
import axios from "../../../../api/axiosInstance";
import '../../../../PrintPeaksFAinal/poslugi/shared/sc-base.css';

const CATEGORIES = ['Матеріали', 'Зарплата', 'Оренда', 'Логістика', 'Обладнання', 'Інше'];

const PAYMENT_METHODS = [
    {key: 'cash', label: 'Готівка'},
    {key: 'card', label: 'Картка'},
    {key: 'iban', label: 'IBAN'},
    {key: 'invoice', label: 'Рахунок'},
];

const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const AddExpenseButton = () => {
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({amount: '', description: '', category: '', date: new Date().toISOString().slice(0, 10), paymentMethod: 'invoice'});
    const [files, setFiles] = useState([]);
    const [saving, setSaving] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [errors, setErrors] = useState({});
    const [catOpen, setCatOpen] = useState(false);
    const [catDropStyle, setCatDropStyle] = useState({});
    const fileInputRef = useRef(null);
    const catRef = useRef(null);
    const catPortalRef = useRef(null);

    // Клік поза dropdown
    useEffect(() => {
        if (!catOpen) return;
        const handler = (e) => {
            if (catRef.current?.contains(e.target)) return;
            if (catPortalRef.current?.contains(e.target)) return;
            setCatOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [catOpen]);

    const validate = () => {
        const errs = {};
        if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Вкажіть суму';
        if (!form.category) errs.category = 'Оберіть категорію';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('amount', form.amount);
            formData.append('description', form.description);
            formData.append('category', form.category);
            formData.append('date', form.date);
            if (form.paymentMethod) formData.append('paymentMethod', form.paymentMethod);
            for (const file of files) {
                formData.append('files', file);
            }
            await axios.post('/expenses/create', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            });
            setForm({amount: '', description: '', category: '', date: new Date().toISOString().slice(0, 10), paymentMethod: 'invoice'});
            setFiles([]);
            setShowModal(false);
            window.dispatchEvent(new Event('expense-added'));
        } catch (e) {
            console.error(e);
        }
        setSaving(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') setShowModal(false);
    };

    const handleFiles = (newFiles) => {
        const arr = Array.from(newFiles);
        if (arr.length > 0) setFiles(prev => [...prev, ...arr]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    const handleClose = () => {
        setShowModal(false);
        setFiles([]);
        setForm({amount: '', description: '', category: '', date: new Date().toISOString().slice(0, 10), paymentMethod: 'invoice'});
    };

    return (
        <>
            <div
                className="buttonSkewedOrder"
                onClick={() => setShowModal(true)}
            >
                <span className="nav-btn-full">Нова витрата</span>
                <span className="nav-btn-short">+ витрата</span>
            </div>

            {showModal && (
                <div className="aeb-overlay" onClick={handleClose}>
                    <div className="aeb-modal" onClick={e => e.stopPropagation()}>
                        <div className="aeb-title">Нова витрата</div>

                        <div className="aeb-row aeb-row-main">
                            <div className="aeb-field" style={{flex: 1}}>
                                <label className="aeb-label">Сума (грн)</label>
                                <input
                                    type="number"
                                    className={`aeb-input aeb-input-big${errors.amount ? ' aeb-input-error' : ''}`}
                                    value={form.amount}
                                    onChange={e => { setForm({...form, amount: e.target.value}); setErrors(p => ({...p, amount: ''})); }}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                    placeholder="0"
                                />
                                {errors.amount && <span className="aeb-error">{errors.amount}</span>}
                            </div>
                            <div className="aeb-field aeb-cat-field" style={{flex: 1}}>
                                <label className="aeb-label">Категорія</label>
                                <div
                                    ref={catRef}
                                    className={`custom-select-container selectArtem selectArtemBefore${form.category ? ' sc-has-value' : ''}${errors.category ? ' aeb-cat-error' : ''}`}
                                    style={{width: '100%', minHeight: '2rem'}}
                                >
                                    {!form.category && (
                                        <div className="sc-hand">
                                            <div className="sc-hand-finger"/>
                                            <div className="sc-hand-finger"/>
                                            <div className="sc-hand-finger"/>
                                            <div className="sc-hand-finger"/>
                                            <div className="sc-hand-palm"/>
                                            <div className="sc-hand-thumb"/>
                                        </div>
                                    )}
                                    <div
                                        className="custom-select-header"
                                        onClick={() => {
                                            if (!catOpen && catRef.current) {
                                                const rect = catRef.current.getBoundingClientRect();
                                                setCatDropStyle({
                                                    position: 'fixed',
                                                    top: rect.bottom + 2,
                                                    left: rect.left,
                                                    width: rect.width,
                                                    zIndex: 99999,
                                                });
                                            }
                                            setCatOpen(!catOpen);
                                        }}
                                    >
                                        {form.category || '\u00A0'}
                                    </div>
                                    {catOpen && ReactDOM.createPortal(
                                        <div ref={catPortalRef} className="custom-select-dropdown" style={catDropStyle}>
                                            {CATEGORIES.map(cat => (
                                                <div
                                                    key={cat}
                                                    className={`custom-option${cat === form.category ? ' active' : ''}`}
                                                    onClick={() => {
                                                        setForm(f => ({...f, category: cat}));
                                                        setErrors(p => ({...p, category: ''}));
                                                        setCatOpen(false);
                                                    }}
                                                >
                                                    <span className="name">{cat}</span>
                                                </div>
                                            ))}
                                        </div>,
                                        document.body
                                    )}
                                </div>
                                {errors.category && <span className="aeb-error">{errors.category}</span>}
                            </div>
                        </div>

                        <div className="aeb-field">
                            <label className="aeb-label">Опис</label>
                            <input
                                type="text"
                                className="aeb-input"
                                value={form.description}
                                onChange={e => setForm({...form, description: e.target.value})}
                                onKeyDown={handleKeyDown}
                                placeholder=""
                            />
                        </div>

                        {/* Payment method buttons */}
                        <div className="aeb-field">
                            <label className="aeb-label">Спосіб оплати</label>
                            <div className="aeb-pay-methods">
                                {PAYMENT_METHODS.map(m => (
                                    <button
                                        key={m.key}
                                        type="button"
                                        className={`aeb-pay-btn${form.paymentMethod === m.key ? ' aeb-pay-btn-active' : ''}`}
                                        onClick={() => setForm({...form, paymentMethod: form.paymentMethod === m.key ? '' : m.key})}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="aeb-row">
                            <div className="aeb-field" style={{flex: 1}}>
                                <label className="aeb-label">Дата</label>
                                <input
                                    type="date"
                                    className="aeb-input"
                                    value={form.date}
                                    onChange={e => setForm({...form, date: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* File upload area */}
                        <div className="aeb-field">
                            <label className="aeb-label">Файли (чек, видаткова, тощо)</label>
                            <div
                                className={`aeb-dropzone${dragOver ? ' aeb-dropzone-active' : ''}`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{opacity: 0.4}}>
                                    <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2 12C2 7.286 2 4.929 3.464 3.464C4.93 2 7.286 2 12 2C16.714 2 19.071 2 20.535 3.464C22 4.93 22 7.286 22 12C22 16.714 22 19.071 20.535 20.535C19.072 22 16.714 22 12 22C7.286 22 4.929 22 3.464 20.535C2 19.072 2 16.714 2 12Z" stroke="currentColor" strokeWidth="1.5"/>
                                </svg>
                                <span>Перетягніть файли або натисніть для вибору</span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    style={{display: 'none'}}
                                    onChange={e => {
                                        const arr = Array.from(e.target.files || []);
                                        if (arr.length > 0) handleFiles(arr);
                                        e.target.value = '';
                                    }}
                                />
                            </div>
                        </div>

                        {/* File list */}
                        {files.length > 0 && (
                            <div className="aeb-file-list">
                                {files.map((file, i) => (
                                    <div key={i} className="aeb-file-item">
                                        <span className="aeb-file-name">{file.name}</span>
                                        <span className="aeb-file-size">{formatFileSize(file.size)}</span>
                                        <button className="aeb-file-remove" onClick={() => removeFile(i)}>✕</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="aeb-actions">
                            <button className="aeb-btn aeb-btn-cancel" onClick={handleClose}>
                                Скасувати
                            </button>
                            <button className="aeb-btn aeb-btn-save" onClick={handleSave} disabled={saving}>
                                {saving ? '...' : 'Додати'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddExpenseButton;
