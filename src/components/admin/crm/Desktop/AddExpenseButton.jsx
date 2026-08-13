import React, {useState, useRef, useEffect} from 'react';
import ReactDOM from 'react-dom';
import axios from "../../../../api/axiosInstance";
import '../../../../PrintPeaksFAinal/poslugi/shared/sc-base.css';

const CATEGORIES = ['Матеріали', 'Розхідники', 'Зарплата', 'Оренда', 'Логістика', 'Обладнання', 'Підписки', 'Ремонт', 'Постачальники', 'Особисті', 'Податки', 'Інше'];

// Категорії, де можна прив'язати витрату до принтера/розхідника — оновлює
// закупівельну ціну й перераховує собівартість кліку/м²
const PRINTER_CATEGORIES = ['Розхідники', 'Ремонт'];

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

// hideTrigger — рендерити лише модалку, без власної кнопки. Використовує
// панель швидкого доступу (PPDock): вона малює свою плитку, а відкриває
// модалку глобальною подією 'pp-open-expense'.
const AddExpenseButton = ({hideTrigger = false} = {}) => {
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

    // Прив'язка витрати до замовлення — робить її прямою і включає в маржу цього замовлення
    const [orderQuery, setOrderQuery] = useState('');
    const [orderResults, setOrderResults] = useState([]);
    const [linkedOrder, setLinkedOrder] = useState(null);

    // Принтери/розхідники: категорія «Розхідники»/«Ремонт» → закупівля оновлює
    // ціну консюмабла і собівартість кліку/м² перераховується сама
    const [printers, setPrinters] = useState([]);
    const [printersLoading, setPrintersLoading] = useState(false);
    const [selectedPrinterId, setSelectedPrinterId] = useState('');
    const [selectedConsumableId, setSelectedConsumableId] = useState(null);
    // Закупівля зазвичай містить кілька позицій одразу (чотири тонери, чотири
    // барабани) — тримаємо кошик {consumableId: {price, qty}}, щоб не пробивати
    // кожну окремою витратою
    const [consumableCart, setConsumableCart] = useState({});
    // Спільний розхідник стоїть у кількох машинах — при заміні треба зафіксувати
    // показники всіх, бо ресурс з'їдається їхнім сумарним пробігом.
    // {printerId: 'значення'}
    const [meterByPrinter, setMeterByPrinter] = useState({});
    const [poolPrinters, setPoolPrinters] = useState([]);
    // {printerId: {loading, source: 'printer'|'db', error}} — звідки взявся показник
    const [meterStatus, setMeterStatus] = useState({});
    const [meterReading, setMeterReading] = useState('');

    // Відкриття ззовні (плитка «Нова витрата» в панелі швидкого доступу).
    // Слухає лише інстанс дока — інакше там, де кнопка вже є на сторінці,
    // модалка відкрилася б двічі.
    useEffect(() => {
        if (!hideTrigger) return undefined;
        const handler = () => setShowModal(true);
        window.addEventListener('pp-open-expense', handler);
        return () => window.removeEventListener('pp-open-expense', handler);
    }, [hideTrigger]);

    useEffect(() => {
        const q = orderQuery.trim();
        if (!q) { setOrderResults([]); return; }
        const timer = setTimeout(() => {
            axios.get(`/api/roi/searchOrders?q=${encodeURIComponent(q)}`)
                .then(({data}) => setOrderResults(Array.isArray(data) ? data : []))
                .catch(e => console.warn('Order search error:', e.message));
        }, 300);
        return () => clearTimeout(timer);
    }, [orderQuery]);
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

    // Завантажити принтери при виборі категорії «Розхідники»/«Ремонт»
    useEffect(() => {
        if (!PRINTER_CATEGORIES.includes(form.category)) return;
        if (printers.length > 0) return;
        setPrintersLoading(true);
        axios.get('/api/roi/printers')
            .then(r => setPrinters(r.data || []))
            .catch(() => {})
            .finally(() => setPrintersLoading(false));
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

    // Сума витрати = сума обраних позицій: пробиваючи чотири тонери одним
    // документом, оператор не має складати їх у голові
    useEffect(() => {
        const items = Object.values(consumableCart);
        if (!items.length) return;
        const total = items.reduce((s, v) => {
            const price = parseFloat(String(v.price || 0).replace(',', '.')) || 0;
            const qty = parseFloat(String(v.qty || 1).replace(',', '.')) || 1;
            return s + price * qty;
        }, 0);
        if (total > 0) setForm(f => ({...f, amount: String(Math.round(total * 100) / 100)}));
    }, [consumableCart]);

    // Які машини ділять розхідники з обраною — їхні лічильники теж треба вписати.
    // Рахуємо з уже завантаженого списку принтерів: спільна позиція має той самий
    // id у consumables обох машин, тож окремий запит на сервер не потрібен.
    useEffect(() => {
        if (!selectedPrinterId) { setPoolPrinters([]); return; }
        const selfId = parseInt(selectedPrinterId, 10);
        const self = printers.find(p => p.id === selfId);
        if (!self) { setPoolPrinters([]); return; }

        const ownIds = new Set((self.consumables || []).map(c => c.id));
        const list = [
            {id: self.id, name: self.name, currentCounter: self.currentCounter},
            ...printers
                .filter(p => p.id !== selfId && (p.consumables || []).some(c => ownIds.has(c.id)))
                .map(p => ({id: p.id, name: p.name, currentCounter: p.currentCounter})),
        ];

        setPoolPrinters(list);
        setMeterByPrinter(prev => {
            const next = {...prev};
            for (const p of list) if (next[p.id] === undefined) next[p.id] = '';
            return next;
        });
    }, [selectedPrinterId, printers]);

    // Показники підтягуються самі, щойно визначився пул машин. Якщо машина не
    // відповідає — лишаємо останнє відоме з бази й показуємо причину, щоб
    // витрату все одно можна було зберегти.
    useEffect(() => {
        if (!poolPrinters.length) return;
        let alive = true;

        poolPrinters.forEach(p => {
            setMeterStatus(prev => ({...prev, [p.id]: {loading: true}}));
            axios.get(`/api/roi/printers/${p.id}/counter-read`)
                .then(({data}) => {
                    if (!alive) return;
                    setMeterByPrinter(prev => ({...prev, [p.id]: String(data.counter ?? '')}));
                    setMeterStatus(prev => ({
                        ...prev,
                        [p.id]: {loading: false, source: data.source, error: data.error},
                    }));
                })
                .catch(e => {
                    if (!alive) return;
                    setMeterByPrinter(prev => ({
                        ...prev,
                        [p.id]: prev[p.id] || String(p.currentCounter || ''),
                    }));
                    setMeterStatus(prev => ({
                        ...prev,
                        [p.id]: {loading: false, source: 'db', error: e.response?.data?.error || e.message},
                    }));
                });
        });

        return () => { alive = false; };
    }, [poolPrinters]);

    const resetPrinterPick = () => {
        setSelectedPrinterId(''); setSelectedConsumableId(null); setMeterReading('');
        setConsumableCart({}); setMeterByPrinter({}); setPoolPrinters([]); setMeterStatus({});
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
            if (PRINTER_CATEGORIES.includes(form.category)) {
                if (selectedPrinterId) formData.append('printerId', selectedPrinterId);
                const cartItems = Object.entries(consumableCart)
                    .filter(([, v]) => v && v.price !== '' && Number(v.price) > 0)
                    .map(([consumableId, v]) => ({
                        consumableId: parseInt(consumableId, 10),
                        price: parseFloat(String(v.price).replace(',', '.')),
                        qty: parseFloat(String(v.qty || 1).replace(',', '.')) || 1,
                    }));
                if (cartItems.length) {
                    formData.append('consumableItems', JSON.stringify(cartItems));
                    formData.append('consumableId', cartItems[0].consumableId);
                } else if (selectedConsumableId) {
                    formData.append('consumableId', selectedConsumableId);
                }
                const readings = Object.entries(meterByPrinter)
                    .filter(([, v]) => String(v).trim() !== '')
                    .map(([printerId, counter]) => ({
                        printerId: parseInt(printerId, 10),
                        counter: parseInt(counter, 10),
                    }))
                    .filter(r => Number.isFinite(r.counter));
                if (readings.length) {
                    formData.append('meterReadings', JSON.stringify(readings));
                    formData.append('meterReading', readings[0].counter);
                } else if (meterReading) {
                    formData.append('meterReading', meterReading);
                }
            }
            if (linkedOrder) formData.append('orderId', linkedOrder.id);
            for (const file of files) formData.append('files', file);
            await axios.post('/expenses/create', formData, {headers: {'Content-Type': 'multipart/form-data'}});
            setForm({amount: '', description: '', category: '', date: new Date().toISOString().slice(0, 10), paymentMethod: 'invoice'});
            setFiles([]);
            resetMat();
            resetPrinterPick();
            setLinkedOrder(null);
            setOrderQuery('');
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
        resetPrinterPick();
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

    // Модал "Новий розхідник"
    const [showNewConsumable, setShowNewConsumable] = useState(false);
    const [newConsumable, setNewConsumable] = useState({name: '', category: 'consumable', wearBasis: 'page', resourceQty: '', unit: 'шт.', currentPrice: ''});
    const [creatingConsumable, setCreatingConsumable] = useState(false);

    const handleCreateConsumable = async () => {
        if (!newConsumable.name.trim() || !selectedPrinterId) return;
        setCreatingConsumable(true);
        try {
            const res = await axios.post(`/api/roi/printers/${selectedPrinterId}/consumables`, newConsumable);
            const created = res.data;
            if (created) {
                setPrinters(prev => prev.map(p => p.id === parseInt(selectedPrinterId, 10)
                    ? {...p, consumables: [...(p.consumables || []), created]}
                    : p));
                setSelectedConsumableId(created.id);
                setForm(f => ({...f, description: f.description || created.name}));
            }
            setShowNewConsumable(false);
            setNewConsumable({name: '', category: 'consumable', wearBasis: 'page', resourceQty: '', unit: 'шт.', currentPrice: ''});
        } catch (e) {
            console.error(e);
        }
        setCreatingConsumable(false);
    };

    return (
        <>
            {!hideTrigger && (
                <div className="buttonSkewedOrder" onClick={() => setShowModal(true)}>
                    <span className="nav-btn-full">Нова витрата</span>
                    <span className="nav-btn-short">+ витрата</span>
                </div>
            )}

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
                                                        if (!PRINTER_CATEGORIES.includes(cat)) resetPrinterPick();
                                                        // «Розхідники» й «Ремонт» показують різні списки —
                                                        // старий вибір після перемикання вже нерелевантний
                                                        else { setConsumableCart({}); setSelectedConsumableId(null); }
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

                        {/* Розхідники/ремонт: принтер + розхідник + лічильник */}
                        {PRINTER_CATEGORIES.includes(form.category) && (
                            <>
                                <div className="aeb-row aeb-row-material">
                                    <div className="aeb-field" style={{flex: 1}}>
                                        <label className="aeb-label">Принтер</label>
                                        <select
                                            className="aeb-input aeb-select"
                                            value={selectedPrinterId}
                                            onChange={e => { setSelectedPrinterId(e.target.value); setSelectedConsumableId(null); }}
                                        >
                                            <option value="">— Без прив'язки —</option>
                                            {printers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {selectedPrinterId && (() => {
                                    const printer = printers.find(p => p.id === parseInt(selectedPrinterId, 10));
                                    // Категорія витрати визначає, що показувати: «Ремонт» — вузли
                                    // й запчастини конкретної машини, «Розхідники» — спільну купу
                                    // тонерів і барабанів
                                    const wantCategory = form.category === 'Ремонт' ? 'part' : 'consumable';
                                    const consumables = (printer?.consumables || [])
                                        .filter(c => c.active && (c.category || 'consumable') === wantCategory);
                                    return (
                                        <>
                                            <div className="aeb-mat-list">
                                                {printersLoading ? (
                                                    <div className="aeb-mat-empty">Завантаження...</div>
                                                ) : consumables.length === 0 ? (
                                                    <div className="aeb-mat-empty">
                                                        {wantCategory === 'part'
                                                            ? 'У цієї машини ще нема запчастин'
                                                            : 'У цієї машини ще нема розхідників'}
                                                    </div>
                                                ) : (
                                                    consumables.map(c => {
                                                        const picked = !!consumableCart[c.id];
                                                        return (
                                                        <div
                                                            key={c.id}
                                                            className={`aeb-mat-row aeb-mat-row-multi${picked ? ' aeb-mat-row-picked' : ''}`}
                                                            onClick={() => {
                                                                setSelectedConsumableId(c.id);
                                                                setConsumableCart(cart => {
                                                                    const next = {...cart};
                                                                    if (next[c.id]) delete next[c.id];
                                                                    else next[c.id] = {price: String(c.currentPrice || ''), qty: '1'};
                                                                    return next;
                                                                });
                                                            }}
                                                        >
                                                            <span className="aeb-mat-name">
                                                                <input type="checkbox" readOnly checked={picked}/>
                                                                <span>{c.name}</span>
                                                            </span>
                                                            {picked ? (
                                                                <span className="aeb-mat-meta aeb-mat-inputs" onClick={e => e.stopPropagation()}>
                                                                    <input
                                                                        type="number"
                                                                        className="aeb-input aeb-mat-price"
                                                                        placeholder="ціна"
                                                                        value={consumableCart[c.id].price}
                                                                        onChange={e => setConsumableCart(cart => ({
                                                                            ...cart,
                                                                            [c.id]: {...cart[c.id], price: e.target.value},
                                                                        }))}
                                                                    />
                                                                    <input
                                                                        type="number"
                                                                        className="aeb-input aeb-mat-qty"
                                                                        placeholder="к-сть"
                                                                        value={consumableCart[c.id].qty}
                                                                        onChange={e => setConsumableCart(cart => ({
                                                                            ...cart,
                                                                            [c.id]: {...cart[c.id], qty: e.target.value},
                                                                        }))}
                                                                    />
                                                                </span>
                                                            ) : (
                                                                <span className="aeb-mat-meta">{c.currentPrice} ₴ · {c.unit}</span>
                                                            )}
                                                        </div>
                                                        );
                                                    })
                                                )}
                                            </div>

                                            <div className="aeb-row aeb-row-material aeb-meters-row">
                                                <div className="aeb-field" style={{flex: 1}}>
                                                    <label className="aeb-label">
                                                        {poolPrinters.length > 1
                                                            ? 'Лічильники машин (на момент заміни)'
                                                            : 'Лічильник (на момент)'}
                                                    </label>
                                                    {poolPrinters.length > 1 && (
                                                        <div className="aeb-meters-hint">
                                                            Ці машини беруть розхідники зі спільної купи — ресурс
                                                            з'їдається їхнім сумарним пробігом, тому вписуйте обидва
                                                            показники.
                                                        </div>
                                                    )}
                                                    <div className="aeb-meters">
                                                        {(poolPrinters.length ? poolPrinters : []).map(p => (
                                                            <div className="aeb-meter" key={p.id}>
                                                                <span className="aeb-meter-name">
                                                                    {p.name}
                                                                    {meterStatus[p.id]?.loading && (
                                                                        <span className="aeb-meter-note">зчитую…</span>
                                                                    )}
                                                                    {meterStatus[p.id]?.error && (
                                                                        <span className="aeb-meter-note aeb-meter-err"
                                                                              title={meterStatus[p.id].error}>
                                                                            помилка зв'язку з принтером — показник з бази
                                                                        </span>
                                                                    )}
                                                                    {meterStatus[p.id]?.source === 'printer' && (
                                                                        <span className="aeb-meter-note aeb-meter-ok">
                                                                            з принтера
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                <input
                                                                    type="number"
                                                                    className="aeb-input aeb-meter-input"
                                                                    value={meterByPrinter[p.id] ?? ''}
                                                                    onChange={e => setMeterByPrinter(prev => ({
                                                                        ...prev, [p.id]: e.target.value,
                                                                    }))}
                                                                    onKeyDown={handleKeyDown}
                                                                    placeholder={p.currentCounter ? String(p.currentCounter) : 'напр. 128400'}
                                                                />
                                                            </div>
                                                        ))}
                                                        {!poolPrinters.length && (
                                                            <input
                                                                type="number"
                                                                className="aeb-input"
                                                                value={meterReading}
                                                                onChange={e => setMeterReading(e.target.value)}
                                                                onKeyDown={handleKeyDown}
                                                                placeholder="напр. 128400"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="aeb-btn aeb-btn-save"
                                                    style={{whiteSpace: 'nowrap', padding: '0.4rem 1rem', fontSize: 'var(--font-size-s, 0.85rem)'}}
                                                    onClick={() => {
                                                        setNewConsumable(n => ({...n, category: wantCategory}));
                                                        setShowNewConsumable(true);
                                                    }}
                                                >
                                                    {wantCategory === 'part' ? '+ Нова запчастина' : '+ Новий розхідник'}
                                                </button>
                                            </div>
                                        </>
                                    );
                                })()}
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
                            <div className="aeb-field" style={{flex: 1}}>
                                <label className="aeb-label">
                                    Замовлення <span className="aeb-label-hint">— пряма витрата</span>
                                </label>
                                {linkedOrder ? (
                                    <div className="aeb-order-picked">
                                        <span className="aeb-order-num">№{linkedOrder.id}</span>
                                        <span className="aeb-order-name">
                                            {linkedOrder.client
                                                ? `${linkedOrder.client.firstName || ''} ${linkedOrder.client.lastName || ''}`.trim()
                                                : ''}
                                        </span>
                                        <button
                                            type="button"
                                            className="aeb-order-clear"
                                            onClick={() => { setLinkedOrder(null); setOrderQuery(''); }}
                                            title="Відв'язати"
                                        >×</button>
                                    </div>
                                ) : (
                                    <div className="aeb-order-search">
                                        <input
                                            className="aeb-input"
                                            placeholder="номер замовлення…"
                                            value={orderQuery}
                                            onChange={e => setOrderQuery(e.target.value)}
                                        />
                                        {orderResults.length > 0 && (
                                            <div className="aeb-order-drop">
                                                {orderResults.map(o => (
                                                    <div
                                                        key={o.id}
                                                        className="aeb-order-opt"
                                                        onClick={() => { setLinkedOrder(o); setOrderResults([]); }}
                                                    >
                                                        <span className="aeb-order-num">№{o.id}</span>
                                                        <span className="aeb-order-name">
                                                            {o.client
                                                                ? `${o.client.firstName || ''} ${o.client.lastName || ''}`.trim()
                                                                : ''}
                                                        </span>
                                                        <span className="aeb-order-sum">{o.allPrice} ₴</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
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

            {/* Модал: Новий розхідник */}
            {showNewConsumable && ReactDOM.createPortal(
                <div className="aeb-overlay" style={{zIndex: 100000}} onClick={() => setShowNewConsumable(false)}>
                    <div className="aeb-modal aeb-newmat-modal" onClick={e => e.stopPropagation()}>
                        <div className="aeb-title">Новий розхідник</div>

                        <div className="aeb-row">
                            <div className="aeb-field" style={{flex: 1}}>
                                <label className="aeb-label">Назва</label>
                                <input className="aeb-input" value={newConsumable.name}
                                       onChange={e => setNewConsumable(p => ({...p, name: e.target.value}))}
                                       placeholder="Тонер чорний" autoFocus/>
                            </div>
                        </div>

                        <div className="aeb-row">
                            <div className="aeb-field" style={{flex: 1}}>
                                <label className="aeb-label">Основа зносу</label>
                                <select className="aeb-input aeb-select" value={newConsumable.wearBasis}
                                        onChange={e => setNewConsumable(p => ({...p, wearBasis: e.target.value}))}>
                                    <option value="coverage">за покриттям (тонер)</option>
                                    <option value="page">за відбитками (барабан/ремонт)</option>
                                    <option value="ml">за мілілітрами (чорнило)</option>
                                </select>
                            </div>
                            <div className="aeb-field" style={{flex: 1}}>
                                <label className="aeb-label">Ресурс</label>
                                <input type="number" className="aeb-input" value={newConsumable.resourceQty}
                                       onChange={e => setNewConsumable(p => ({...p, resourceQty: e.target.value}))} placeholder="30000"/>
                            </div>
                            <div className="aeb-field" style={{flex: 1}}>
                                <label className="aeb-label">Ціна закупки</label>
                                <input type="number" className="aeb-input" value={newConsumable.currentPrice}
                                       onChange={e => setNewConsumable(p => ({...p, currentPrice: e.target.value}))} placeholder="0"/>
                            </div>
                        </div>

                        <div className="aeb-actions">
                            <button className="aeb-btn aeb-btn-cancel" onClick={() => setShowNewConsumable(false)}>Скасувати</button>
                            <button className="aeb-btn aeb-btn-save" onClick={handleCreateConsumable} disabled={creatingConsumable || !newConsumable.name.trim()}>
                                {creatingConsumable ? '...' : 'Зберегти'}
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
