import React, {useState, useEffect, useRef, useCallback} from 'react';
import axios from "../../../../api/axiosInstance";

const CATEGORY_COLORS = {
    'Матеріали': '#3c60a6',
    'Зарплата': '#0e935b',
    'Оренда': '#f5a623',
    'Логістика': '#6a5acd',
    'Обладнання': '#ee3c23',
    'Інше': '#999999',
};

const PAY_LABELS = {
    cash: 'Готівка',
    card: 'Картка',
    iban: 'IBAN',
    invoice: 'Рахунок',
};

const formatFileSize = (bytes) => {
    if (!bytes || bytes <= 0) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const ExpensesCard = ({data, dateRange, onExpenseAdded, fullWidth}) => {
    const [expenses, setExpenses] = useState([]);
    const [uploadingId, setUploadingId] = useState(null);
    const fileInputRef = useRef(null);
    const uploadExpenseRef = useRef(null);

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

    // Категорійний мініатюрний бар
    const categories = data?.byCategory ?? [];

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
                            const color = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS['Інше'];
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
                            const color = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS['Інше'];
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
                        const color = CATEGORY_COLORS[exp.category] || CATEGORY_COLORS['Інше'];
                        const expFiles = exp.files || [];
                        return (
                            <div key={exp.id} className="dsh-exp-item">
                                <span className="dsh-exp-item-dot" style={{background: color}}/>
                                <span className="dsh-exp-item-cat">{exp.category}</span>
                                <span className="dsh-exp-item-desc">{exp.description || '—'}</span>
                                <span className="dsh-exp-item-pay">{PAY_LABELS[exp.paymentMethod] || '—'}</span>
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
                                    className="dsh-exp-receipt-btn"
                                    onClick={() => handleAddFile(exp.id)}
                                    disabled={uploadingId === exp.id}
                                    title="Додати квітанцію"
                                >
                                    {uploadingId === exp.id ? '...' : '+ квітанція'}
                                </button>
                            </div>
                        );
                    })}
                </div>
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
                    const color = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS['Інше'];
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
