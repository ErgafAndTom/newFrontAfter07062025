import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import ReactDOM from 'react-dom';
import axios from "../../../../api/axiosInstance";

const PALETTE = [
    '#3c60a6', // blue
    '#0e935b', // green
    '#f5a623', // orange
    '#ee3c23', // red
    '#6a5acd', // purple
    '#ff7f50', // coral
    '#00A8C6', // cyan
    '#ef7aaa', // rose
    '#1a8fc4', // light-blue
    '#a67c52', // brown
    '#7fb800', // lime
    '#d4af37', // gold
];
const FALLBACK_COLOR = '#999999';

const PAY_LABELS = {
    cash: 'Готівка',
    card: 'Картка',
    iban: 'IBAN',
    invoice: 'Рахунок',
};

const PAY_OPTIONS = [
    {key: 'cash', label: 'Готівка'},
    {key: 'card', label: 'Картка'},
    {key: 'iban', label: 'IBAN'},
    {key: 'invoice', label: 'Рахунок'},
    {key: '', label: '— не вказано —'},
];

const formatFileSize = (bytes) => {
    if (!bytes || bytes <= 0) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const ExpensesCard = ({data, dateRange, onExpenseAdded, fullWidth}) => {
    const [expenses, setExpenses] = useState([]);
    const [uploadingId, setUploadingId] = useState(null);
    // Редагування способу оплати: {id, style} відкритої випадайки
    const [payMenu, setPayMenu] = useState(null);
    const [savingPayId, setSavingPayId] = useState(null);
    const fileInputRef = useRef(null);
    const uploadExpenseRef = useRef(null);
    const payMenuRef = useRef(null);

    const total = data?.totalSum ?? 0;
    const count = data?.totalCount ?? 0;

    // Завантажити список витрат (для fullWidth)
    const fetchExpenses = useCallback(async () => {
        if (!fullWidth || !dateRange) return;
        try {
            const res = await axios.post('/expenses/list', {
                start_date: dateRange.startDate,
                end_date: dateRange.endDate,
            });
            setExpenses(res.data || []);
        } catch (e) {
            console.error(e);
        }
    }, [fullWidth, dateRange]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    // Оновити список після додавання витрати ззовні
    useEffect(() => {
        const handler = () => fetchExpenses();
        window.addEventListener('expense-added', handler);
        return () => window.removeEventListener('expense-added', handler);
    }, [fetchExpenses]);

    // Додати файл до існуючої витрати
    const handleAddFile = (expenseId) => {
        uploadExpenseRef.current = expenseId;
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        const expenseId = uploadExpenseRef.current;
        if (!files.length || !expenseId) return;
        e.target.value = '';

        setUploadingId(expenseId);
        try {
            const formData = new FormData();
            for (const file of files) {
                formData.append('files', file);
            }
            await axios.post(`/expenses/${expenseId}/files`, formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            });
            fetchExpenses();
        } catch (err) {
            console.error(err);
        }
        setUploadingId(null);
    };

    // ── Зміна способу оплати ──
    const openPayMenu = (e, expenseId) => {
        e.stopPropagation();
        if (payMenu?.id === expenseId) return setPayMenu(null);
        const rect = e.currentTarget.getBoundingClientRect();
        const vh = window.innerHeight;
        const width = Math.max(rect.width, 110);
        const menuHeight = PAY_OPTIONS.length * 28 + 8;
        const flipUp = vh - rect.bottom < menuHeight && rect.top > menuHeight;
        const style = {
            position: 'fixed',
            left: Math.min(rect.left, window.innerWidth - width - 8),
            width,
            zIndex: 100000,
        };
        if (flipUp) style.bottom = vh - rect.top + 2;
        else style.top = rect.bottom + 2;
        setPayMenu({id: expenseId, style});
    };

    const changePaymentMethod = async (expenseId, method) => {
        setPayMenu(null);
        const prev = expenses.find(x => x.id === expenseId)?.paymentMethod;
        if (prev === (method || null)) return;
        setSavingPayId(expenseId);
        // Оптимістичне оновлення
        setExpenses(list => list.map(x => x.id === expenseId ? {...x, paymentMethod: method || null} : x));
        try {
            await axios.patch(`/expenses/${expenseId}`, {paymentMethod: method});
            // Оновити агреговані дані дашборду (каса, статистика)
            window.dispatchEvent(new Event('expense-added'));
        } catch (err) {
            console.error('Помилка зміни способу оплати:', err);
            // Відкат
            setExpenses(list => list.map(x => x.id === expenseId ? {...x, paymentMethod: prev ?? null} : x));
        }
        setSavingPayId(null);
    };

    // Закрити випадайку при кліку поза нею / скролі / ресайзі
    useEffect(() => {
        if (!payMenu) return;
        const close = (e) => {
            if (e && e.type === 'mousedown' && payMenuRef.current?.contains(e.target)) return;
            setPayMenu(null);
        };
        document.addEventListener('mousedown', close);
        window.addEventListener('resize', close);
        window.addEventListener('scroll', close, true);
        return () => {
            document.removeEventListener('mousedown', close);
            window.removeEventListener('resize', close);
            window.removeEventListener('scroll', close, true);
        };
    }, [payMenu]);

    // Категорійний мініатюрний бар
    const categories = data?.byCategory ?? [];

    // Map: category name → unique palette color (assigned by sort order)
    const categoryColorMap = useMemo(() => {
        const sorted = [...categories].sort((a, b) => (b.total || 0) - (a.total || 0));
        const map = {};
        sorted.forEach((c, i) => {
            map[c.category || 'Інше'] = PALETTE[i % PALETTE.length];
        });
        return map;
    }, [categories]);
    const colorOf = (cat) => categoryColorMap[cat] || FALLBACK_COLOR;

    if (fullWidth) {
        return (
            <div className="dsh-exp-full">
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    style={{display: 'none'}}
                    onChange={handleFileUpload}
                />

                {/* Header row */}
                <div className="dsh-exp-full-header">
                    <div className="dsh-exp-full-left">
                        <div className="dsh-card-title">Витрати</div>
                        <span className="dsh-exp-total-count">{count} записів</span>
                    </div>
                    <div className="dsh-exp-full-total">
                        <span className="dsh-exp-total-value">
                            {total.toLocaleString('uk-UA', {maximumFractionDigits: 0})} ₴
                        </span>
                    </div>
                </div>

                {/* Category bar */}
                {categories.length > 0 && (
                    <div className="dsh-exp-catbar">
                        {categories.map((cat, i) => {
                            const pct = total > 0 ? (cat.total / total) * 100 : 0;
                            const color = colorOf(cat.category);
                            return (
                                <div
                                    key={i}
                                    className="dsh-exp-catbar-seg"
                                    style={{width: `${pct}%`, background: color}}
                                    title={`${cat.category}: ${cat.total.toLocaleString('uk-UA', {maximumFractionDigits: 0})} ₴ (${pct.toFixed(0)}%)`}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Category legend */}
                {categories.length > 0 && (
                    <div className="dsh-exp-legend">
                        {categories.map((cat, i) => {
                            const color = colorOf(cat.category);
                            return (
                                <span key={i} className="dsh-exp-legend-item">
                                    <span className="dsh-exp-legend-dot" style={{background: color}}/>
                                    <span>{cat.category}</span>
                                    <span className="dsh-exp-legend-sum">
                                        {cat.total.toLocaleString('uk-UA', {maximumFractionDigits: 0})} ₴
                                    </span>
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Expense list */}
                <div className="dsh-exp-list">
                    {expenses.length === 0 && (
                        <div className="dsh-exp-empty">Немає витрат за період</div>
                    )}
                    {expenses.map(exp => {
                        const color = colorOf(exp.category);
                        const expFiles = exp.files || [];
                        return (
                            <div key={exp.id} className="dsh-exp-item">
                                <span className="dsh-exp-item-dot" style={{background: color}}/>
                                <span className="dsh-exp-item-cat">{exp.category}</span>
                                <span className="dsh-exp-item-desc">{exp.description || '—'}</span>
                                <span
                                    className={`dsh-exp-item-pay dsh-exp-pay-edit${payMenu?.id === exp.id ? ' open' : ''}`}
                                    onClick={(e) => openPayMenu(e, exp.id)}
                                    title="Змінити спосіб оплати"
                                >
                                    {savingPayId === exp.id ? '...' : (PAY_LABELS[exp.paymentMethod] || '—')}
                                </span>
                                <span className="dsh-exp-item-date">
                                    {new Date(exp.date).toLocaleDateString('uk-UA')}
                                </span>
                                <span className="dsh-exp-item-sum">
                                    {parseFloat(exp.amount).toLocaleString('uk-UA', {maximumFractionDigits: 0})} ₴
                                </span>

                                {/* Files */}
                                <span className="dsh-exp-item-files">
                                    {expFiles.map((f, fi) => (
                                        <span
                                            key={fi}
                                            className="dsh-exp-file-link"
                                            style={{cursor: 'pointer'}}
                                            title={`${f.originalName} (${formatFileSize(f.size)})`}
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                try {
                                                    const resp = await axios.get(`/expenses/file/${f.fileName}`, {responseType: 'blob'});
                                                    const url = window.URL.createObjectURL(resp.data);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = f.originalName || f.fileName;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    a.remove();
                                                    window.URL.revokeObjectURL(url);
                                                } catch (err) {
                                                    console.error('Download error:', err);
                                                }
                                            }}
                                        >
                                            {f.originalName}
                                        </span>
                                    ))}
                                </span>

                                {/* Add receipt button */}
                                <button
                                    className={`dsh-exp-receipt-btn${expFiles.length > 0 ? ' has-files' : ''}`}
                                    onClick={() => handleAddFile(exp.id)}
                                    disabled={uploadingId === exp.id}
                                    title={expFiles.length > 0 ? 'Квітанція додана' : 'Додати квітанцію'}
                                >
                                    {uploadingId === exp.id ? '...' : expFiles.length > 0 ? '✓ квітанція' : '+ квітанція'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Випадайка вибору способу оплати */}
                {payMenu && ReactDOM.createPortal(
                    <div ref={payMenuRef} className="dsh-exp-pay-menu" style={payMenu.style}>
                        {PAY_OPTIONS.map(opt => {
                            const current = expenses.find(x => x.id === payMenu.id)?.paymentMethod || '';
                            return (
                                <div
                                    key={opt.key || 'none'}
                                    className={`dsh-exp-pay-option${current === opt.key ? ' active' : ''}`}
                                    onClick={() => changePaymentMethod(payMenu.id, opt.key)}
                                >
                                    {opt.label}
                                </div>
                            );
                        })}
                    </div>,
                    document.body
                )}
            </div>
        );
    }

    // Compact mode (not used currently but kept for compatibility)
    return (
        <div className="dsh-card" style={{overflow: 'hidden', padding: 0}}>
            <div className="dsh-exp-header" style={{padding: '0.6rem 0.8rem 0'}}>
                <div className="dsh-card-title">Витрати</div>
            </div>
            <div className="dsh-exp-total" style={{padding: '0.2rem 0.8rem 0.3rem'}}>
                <span className="dsh-exp-total-value">
                    {total.toLocaleString('uk-UA', {maximumFractionDigits: 0})} ₴
                </span>
                <span className="dsh-exp-total-count">{count} записів</span>
            </div>
            <div className="dsh-exp-categories" style={{padding: '0 0.3rem'}}>
                {categories.length === 0 && (
                    <div style={{color: 'var(--admingrey)', opacity: 0.4, padding: '0.4rem 0.5rem', fontSize: '0.6vw'}}>
                        Немає витрат за період
                    </div>
                )}
                {categories.map((cat, i) => {
                    const pct = total > 0 ? (cat.total / total) * 100 : 0;
                    const color = colorOf(cat.category);
                    return (
                        <div key={i} className="dsh-exp-cat-row">
                            <div className="dsh-exp-cat-bar" style={{width: `${pct}%`, background: color + '12'}}/>
                            <span className="dsh-exp-cat-dot" style={{background: color}}/>
                            <span className="dsh-exp-cat-name">{cat.category}</span>
                            <span className="dsh-exp-cat-sum">
                                {cat.total.toLocaleString('uk-UA', {maximumFractionDigits: 0})} ₴
                            </span>
                            <span className="dsh-exp-cat-pct">{pct.toFixed(0)}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ExpensesCard;
