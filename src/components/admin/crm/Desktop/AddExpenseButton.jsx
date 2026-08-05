import React, {useState, useRef, useEffect} from 'react';
import ReactDOM from 'react-dom';
import axios from "../../../../api/axiosInstance";
import '../../../../PrintPeaksFAinal/poslugi/shared/sc-base.css';

const CATEGORIES = ['Матеріали', 'Розхідники', 'Зарплата', 'Оренда', 'Логістика', 'Обладнання', 'Підписки', 'Ремонт', 'Постачальники', 'Особисті', 'Податки', 'Інше'];

const PAYMENT_METHODS = [
    {key: 'cash', label: 'Готівка'},
    {key: 'card', label: 'Картка'},
    {key: 'iban', label: 'IBAN'},
    {key: 'invoice', label: 'Рахунок'},
];

const TYPE_USE_MAP = {
    'Папір': ['Офісний', 'Тонкий', 'Середній', 'Цупкий'],
    'Плівка': ['Самоклеючі'],
    'Плівка ламінування': ['А4', 'А3', 'А5'],
    'Монтажна FactoryWide': ['Монтажна плівка широкоформат'],
    'Монтажна плівка цифра': ['Монтажна плівка цифра'],
    'Папір Широкоформат': ['PaperWide'],
    'Перепліт': ['А5', 'А4', 'А3'],
    'Постпресс': ['Свердління отворів', 'Висічка', 'Згинання', 'Люверси', 'Проклейка', 'Скруглення кутів'],
    'Сканування': ['400 dpi', '9600 dpi', '1000 dpi'],
    'Фотопапір': ['100 х 150 мм', '130 x 180 мм', 'Polaroid', 'А2', 'А3', 'А4', 'А5'],
    'Чашки': ['330', '250', '500', '0'],
    'Друк': ['Кольоровий', 'Чорнобілий', 'Широкоформат'],
    'Ламінування': ['А4', 'А3'],
};

// Типи, де одиниця виміру за замовчуванням — м²
const M2_TYPES = [
    'Баннер FactoryWide', 'Екосольвентний друк', 'Ламінація FactoryWide',
    'Магніт', 'Монтажна FactoryWide', 'ПВХ FactoryWide', 'Папір FactoryWide',
    'Папір Широкоформат', 'Плотер ПВХ FactoryWide', 'Плотер плівка FactoryWide',
    'Плівка FactoryWide', 'УФ друк',
];

const PRICE_LABELS = [
    {key: 'price1', label: '1-10 шт\n1-2 м²'},
    {key: 'price2', label: '11-50 шт\n3-5 м²'},
    {key: 'price3', label: '51-100 шт\n6-10 м²'},
    {key: 'price4', label: '101-500 шт\n11-20 м²'},
    {key: 'price5', label: '501+ шт\n21+ м²'},
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

    // Матеріали: назва, кількість, список
    const [materialName, setMaterialName] = useState('');
    const [materialId, setMaterialId] = useState(null);
    const [materialQty, setMaterialQty] = useState('');
    const [materialUnit, setMaterialUnit] = useState('шт.');
    const [allMaterials, setAllMaterials] = useState([]);
    const [matsLoading, setMatsLoading] = useState(false);
    const matNameRef = useRef(null);

    const isNewMaterial = !!materialName && !allMaterials.some(
        m => m.name.toLowerCase() === materialName.toLowerCase()
    );
    const filteredMaterials = allMaterials.filter(m =>
        !materialName || m.name.toLowerCase().includes(materialName.toLowerCase())
    );

    // Завантажити всі матеріали при виборі категорії
    useEffect(() => {
        if (form.category !== 'Матеріали') return;
        if (allMaterials.length > 0) return;
        setMatsLoading(true);
        axios.post('/materials/searchByName', {query: '', limit: 500})
            .then(r => setAllMaterials(r.data || []))
            .catch(() => {})
            .finally(() => setMatsLoading(false));
    }, [form.category]);

    // Клік поза dropdown категорій
    useEffect(() => {
        if (!catOpen) return;
        const handler = (e) => {
            if (!catRef.current?.contains(e.target) && !catPortalRef.current?.contains(e.target)) setCatOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [catOpen]);

    const resetMat = () => {
        setMaterialName(''); setMaterialId(null);
        setMaterialQty(''); setMaterialUnit('шт.');
    };

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
            if (form.category === 'Матеріали') {
                if (materialName) formData.append('materialName', materialName);
                if (materialId) formData.append('materialId', materialId);
                if (materialQty) formData.append('materialQty', materialQty);
                if (materialUnit) formData.append('materialUnit', materialUnit);
            }
            for (const file of files) formData.append('files', file);
            await axios.post('/expenses/create', formData, {headers: {'Content-Type': 'multipart/form-data'}});
            setForm({amount: '', description: '', category: '', date: new Date().toISOString().slice(0, 10), paymentMethod: 'invoice'});
            setFiles([]);
            resetMat();
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
    const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

    const handleDrop = (e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files); };
    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = () => setDragOver(false);

    const handleClose = () => {
        setShowModal(false);
        setFiles([]);
        setForm({amount: '', description: '', category: '', date: new Date().toISOString().slice(0, 10), paymentMethod: 'invoice'});
        resetMat();
    };

    // Вибір матеріалу зі списку → підтягнути unit
    const selectMaterial = (m) => {
        setMaterialName(m.name);
        setMaterialId(m.id);
        setMaterialUnit(m.unit || 'шт.');
        setForm(f => ({...f, description: f.description || m.name}));
    };

    // Модал "Новий матеріал"
    const [showNewMat, setShowNewMat] = useState(false);
    const [newMat, setNewMat] = useState({name: '', type: '', typeUse: '', unit: 'Шт', thickness: '', cost: '', price1: '', price2: '', price3: '', price4: '', price5: '', x: '315', y: '440'});
    const [allTypes, setAllTypes] = useState([]);
    const [creatingMat, setCreatingMat] = useState(false);

    useEffect(() => {
        if (showNewMat && allTypes.length === 0) {
            axios.get('/materials/types').then(r => setAllTypes(r.data || [])).catch(() => {});
        }
    }, [showNewMat]);

    const handleCreateMaterial = async () => {
        if (!newMat.name.trim()) return;
        setCreatingMat(true);
        try {
            const res = await axios.post('/materials', {
                name: newMat.name.trim(),
                type: newMat.type || undefined,
                typeUse: newMat.typeUse || undefined,
                unit: newMat.unit || 'Шт',
                thickness: newMat.thickness || undefined,
                cost: newMat.cost || undefined,
                price1: newMat.price1 || undefined,
                price2: newMat.price2 || undefined,
                price3: newMat.price3 || undefined,
                price4: newMat.price4 || undefined,
                price5: newMat.price5 || undefined,
                x: newMat.x ? parseInt(newMat.x) : 297,
                y: newMat.y ? parseInt(newMat.y) : 420,
            });
            const created = res.data?.material;
            if (created) {
                setMaterialName(created.name);
                setMaterialId(created.id);
                setMaterialUnit(created.unit || 'шт.');
                setAllMaterials(prev => [created, ...prev]);
                setForm(f => ({...f, description: f.description || created.name}));
            }
            setShowNewMat(false);
            setNewMat({name: '', type: '', typeUse: '', unit: 'Шт', thickness: '', cost: '', price1: '', price2: '', price3: '', price4: '', price5: '', x: '315', y: '440'});
        } catch (e) {
            console.error(e);
        }
        setCreatingMat(false);
    };

    return (
        <>
            <div className="buttonSkewedOrder" onClick={() => setShowModal(true)}>
                <span className="nav-btn-full">Нова витрата</span>
                <span className="nav-btn-short">+ витрата</span>
            </div>

            {showModal && (
                <div className="aeb-overlay">
                    <div
                        className="aeb-modal"
                        onClick={e => e.stopPropagation()}
                        onScroll={() => catOpen && setCatOpen(false)}
                    >
                        <div className="aeb-title">
                            Нова витрата
                            <button className="aeb-close-btn" onClick={handleClose} aria-label="Закрити">&#x2715;</button>
                        </div>

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
                                            <div className="sc-hand-finger"/><div className="sc-hand-finger"/>
                                            <div className="sc-hand-finger"/><div className="sc-hand-finger"/>
                                            <div className="sc-hand-palm"/><div className="sc-hand-thumb"/>
                                        </div>
                                    )}
                                    <div
                                        className="custom-select-header"
                                        onClick={() => {
                                            if (!catOpen && catRef.current) {
                                                const rect = catRef.current.getBoundingClientRect();
                                                const vh = window.innerHeight;
                                                const margin = 12;
                                                const spaceBelow = vh - rect.bottom - margin;
                                                const spaceAbove = rect.top - margin;
                                                const flipUp = spaceBelow < 200 && spaceAbove > spaceBelow;
                                                const maxHeight = Math.max(120, flipUp ? spaceAbove : spaceBelow);
                                                const s = {position: 'fixed', left: rect.left, width: rect.width, maxHeight, overflowY: 'auto', zIndex: 99999};
                                                if (flipUp) { s.bottom = vh - rect.top + 2; } else { s.top = rect.bottom + 2; }
                                                setCatDropStyle(s);
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
                                                        if (cat !== 'Матеріали') resetMat();
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

                        {/* Матеріали: пошук + список */}
                        {form.category === 'Матеріали' && (
                            <>
                                <div className="aeb-row aeb-row-material">
                                    <div className="aeb-field" style={{flex: 1}}>
                                        <label className="aeb-label">
                                            Назва матеріалу
                                            {isNewMaterial && (
                                                <span style={{color: 'var(--adminorange, #f5a623)', marginLeft: '0.5rem', fontSize: '0.7rem'}}>
                                                    (нова позиція)
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            ref={matNameRef}
                                            type="text"
                                            className="aeb-input"
                                            value={materialName}
                                            onChange={e => { setMaterialName(e.target.value); setMaterialId(null); }}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Пошук матеріалу..."
                                        />
                                    </div>
                                </div>

                                {/* Постійний список матеріалів */}
                                <div className="aeb-mat-list">
                                    {matsLoading ? (
                                        <div className="aeb-mat-empty">Завантаження...</div>
                                    ) : filteredMaterials.length === 0 ? (
                                        <div className="aeb-mat-empty">
                                            {materialName ? 'Нічого не знайдено' : 'Немає матеріалів'}
                                        </div>
                                    ) : (
                                        filteredMaterials.map(m => (
                                            <div
                                                key={m.id}
                                                className={`aeb-mat-row${m.id === materialId ? ' aeb-mat-row-active' : ''}`}
                                                onClick={() => selectMaterial(m)}
                                            >
                                                <span className="aeb-mat-name">{m.name}</span>
                                                <span className="aeb-mat-meta">
                                                    {m.x && m.y ? `${m.x}×${m.y} · ` : ''}
                                                    {m.thickness ? `${m.thickness} · ` : ''}
                                                    {m.amountAll ?? 0} {m.unit}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Кількість + Од. виміру */}
                                <div className="aeb-row aeb-row-material">
                                    <div className="aeb-field" style={{flex: 1}}>
                                        <label className="aeb-label">Кількість</label>
                                        <input
                                            type="number"
                                            className="aeb-input"
                                            value={materialQty}
                                            onChange={e => setMaterialQty(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="0"
                                            min="0"
                                            step="any"
                                        />
                                    </div>
                                    <div className="aeb-field" style={{flex: '0 0 5rem'}}>
                                        <label className="aeb-label">Од.</label>
                                        <input
                                            type="text"
                                            className="aeb-input"
                                            value={materialUnit}
                                            readOnly
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="aeb-btn aeb-btn-save"
                                        style={{alignSelf: 'flex-end', whiteSpace: 'nowrap', padding: '0.4rem 1rem', fontSize: 'var(--font-size-s, 0.85rem)'}}
                                        onClick={() => setShowNewMat(true)}
                                    >
                                        + Новий матеріал
                                    </button>
                                </div>
                            </>
                        )}

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
                                <input ref={fileInputRef} type="file" multiple style={{display: 'none'}} onChange={e => { const arr = Array.from(e.target.files || []); if (arr.length > 0) handleFiles(arr); e.target.value = ''; }}/>
                            </div>
                        </div>

                        {files.length > 0 && (
                            <div className="aeb-file-list">
                                {files.map((file, i) => (
                                    <div key={i} className="aeb-file-item">
                                        <span className="aeb-file-name">{file.name}</span>
                                        <span className="aeb-file-size">{formatFileSize(file.size)}</span>
                                        <button className="aeb-file-remove" onClick={() => removeFile(i)}>&#x2715;</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="aeb-actions">
                            <button className="aeb-btn aeb-btn-cancel" onClick={handleClose}>Скасувати</button>
                            <button className="aeb-btn aeb-btn-save" onClick={handleSave} disabled={saving}>{saving ? '...' : 'Додати'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модал: Новий матеріал */}
            {showNewMat && ReactDOM.createPortal(
                <div className="aeb-overlay" style={{zIndex: 100000}} onClick={() => setShowNewMat(false)}>
                    <div className="aeb-modal aeb-newmat-modal" onClick={e => e.stopPropagation()}>
                        <div className="aeb-title">Новий матеріал</div>

                        <div className="aeb-row">
                            <div className="aeb-field" style={{flex: 1}}>
                                <label className="aeb-label">Назва</label>
                                <input className="aeb-input" value={newMat.name} onChange={e => setNewMat(p => ({...p, name: e.target.value}))} placeholder="Назва матеріалу" autoFocus />
                            </div>
                        </div>

                        <div className="aeb-row">
                            <div className="aeb-field" style={{flex: 1}}>
                                <label className="aeb-label">Тип</label>
                                <select className="aeb-input aeb-select" value={newMat.type} onChange={e => { const t = e.target.value; setNewMat(p => ({...p, type: t, typeUse: '', unit: M2_TYPES.includes(t) ? 'м²' : 'Шт'})); }}>
                                    <option value="">— Оберіть тип —</option>
                                    {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="aeb-field" style={{flex: 1}}>
                                <label className="aeb-label">Використання</label>
                                <select className="aeb-input aeb-select" value={newMat.typeUse} onChange={e => setNewMat(p => ({...p, typeUse: e.target.value}))} disabled={!TYPE_USE_MAP[newMat.type]}>
                                    <option value="">— Оберіть —</option>
                                    {(TYPE_USE_MAP[newMat.type] || []).map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="aeb-row">
                            <div className="aeb-field" style={{flex: 1}}>
                                <label className="aeb-label">О/В (од. виміру)</label>
                                <input className="aeb-input" value={newMat.unit} onChange={e => setNewMat(p => ({...p, unit: e.target.value}))} />
                            </div>
                            <div className="aeb-field" style={{flex: 1}}>
                                <label className="aeb-label">Цупкість</label>
                                <input className="aeb-input" value={newMat.thickness} onChange={e => setNewMat(p => ({...p, thickness: e.target.value}))} placeholder="130" />
                            </div>
                            <div className="aeb-field" style={{flex: 1}}>
                                <label className="aeb-label">Ціна закупки</label>
                                <input type="number" className="aeb-input" value={newMat.cost} onChange={e => setNewMat(p => ({...p, cost: e.target.value}))} placeholder="0" />
                            </div>
                        </div>

                        <div className="aeb-row">
                            <div className="aeb-field" style={{flex: 1}}>
                                <label className="aeb-label">Ширина (мм)</label>
                                <input type="number" className="aeb-input" value={newMat.x} onChange={e => setNewMat(p => ({...p, x: e.target.value}))} />
                            </div>
                            <div className="aeb-field" style={{flex: 1}}>
                                <label className="aeb-label">Висота (мм)</label>
                                <input type="number" className="aeb-input" value={newMat.y} onChange={e => setNewMat(p => ({...p, y: e.target.value}))} />
                            </div>
                        </div>

                        <label className="aeb-label" style={{marginTop: '0.5rem'}}>Ціни продажу</label>
                        <div className="aeb-row aeb-row-prices">
                            {PRICE_LABELS.map(p => (
                                <div className="aeb-field aeb-price-field" key={p.key}>
                                    <label className="aeb-label aeb-label-small">{p.label}</label>
                                    <input type="number" className="aeb-input" value={newMat[p.key]} onChange={e => setNewMat(prev => ({...prev, [p.key]: e.target.value}))} placeholder="0" />
                                </div>
                            ))}
                        </div>

                        <div className="aeb-actions">
                            <button className="aeb-btn aeb-btn-cancel" onClick={() => setShowNewMat(false)}>Скасувати</button>
                            <button className="aeb-btn aeb-btn-save" onClick={handleCreateMaterial} disabled={creatingMat || !newMat.name.trim()}>
                                {creatingMat ? '...' : 'Зберегти'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default AddExpenseButton;
