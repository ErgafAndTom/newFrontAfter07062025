import React, {useState} from 'react';
import axios from "../../../../api/axiosInstance";

const CATEGORY_COLORS = {
    'Матеріали': '#3c60a6',
    'Зарплата': '#0e935b',
    'Оренда': '#f5a623',
    'Логістика': '#6a5acd',
    'Обладнання': '#ee3c23',
    'Інше': '#999999',
};

const ExpensesCard = ({data, dateRange, onExpenseAdded}) => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({amount: '', description: '', category: 'Інше'});
    const [saving, setSaving] = useState(false);

    const handleAdd = async () => {
        if (!form.amount || parseFloat(form.amount) <= 0) return;
        setSaving(true);
        try {
            await axios.post('/expenses/create', {
                amount: parseFloat(form.amount),
                description: form.description,
                category: form.category,
                date: new Date().toISOString().slice(0, 10),
            });
            setForm({amount: '', description: '', category: 'Інше'});
            setShowForm(false);
            if (onExpenseAdded) onExpenseAdded();
        } catch (e) {
            console.error(e);
        }
        setSaving(false);
    };

    const total = data?.totalSum ?? 0;
    const count = data?.totalCount ?? 0;
    const categories = data?.byCategory ?? [];

    return (
        <div className="dsh-card" style={{overflow: 'hidden', padding: 0}}>
            {/* Header */}
            <div className="dsh-exp-header" style={{padding: '0.6rem 0.8rem 0'}}>
                <div className="dsh-card-title">Витрати</div>
                <button
                    className="dsh-exp-add-btn"
                    onClick={() => setShowForm(!showForm)}
                    title="Додати витрату"
                >
                    {showForm ? '✕' : '+'}
                </button>
            </div>

            {/* Total */}
            <div className="dsh-exp-total" style={{padding: '0.2rem 0.8rem 0.3rem'}}>
                <span className="dsh-exp-total-value">
                    {total.toLocaleString('uk-UA', {maximumFractionDigits: 0})} ₴
                </span>
                <span className="dsh-exp-total-count">{count} записів</span>
            </div>

            {/* Mini stacked bar */}
            {categories.length > 0 && total > 0 && (
                <div className="dsh-exp-minibar" style={{margin: '0 0.8rem 0.3rem'}}>
                    {categories.map((cat, i) => {
                        const pct = (cat.total / total) * 100;
                        const color = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS['Інше'];
                        return (
                            <div
                                key={i}
                                className="dsh-exp-minibar-seg"
                                style={{width: `${pct}%`, background: color}}
                                title={`${cat.category}: ${pct.toFixed(0)}%`}
                            />
                        );
                    })}
                </div>
            )}

            {/* Add form */}
            {showForm && (
                <div className="dsh-exp-form" style={{padding: '0.3rem 0.8rem'}}>
                    <input
                        type="number"
                        placeholder="Сума"
                        value={form.amount}
                        onChange={e => setForm({...form, amount: e.target.value})}
                        className="dsh-exp-input"
                    />
                    <input
                        type="text"
                        placeholder="Опис"
                        value={form.description}
                        onChange={e => setForm({...form, description: e.target.value})}
                        className="dsh-exp-input"
                    />
                    <select
                        value={form.category}
                        onChange={e => setForm({...form, category: e.target.value})}
                        className="dsh-exp-input"
                    >
                        {Object.keys(CATEGORY_COLORS).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button
                        className="dsh-exp-save-btn"
                        onClick={handleAdd}
                        disabled={saving}
                    >
                        {saving ? '...' : 'Додати'}
                    </button>
                </div>
            )}

            {/* Categories list */}
            <div className="dsh-exp-categories" style={{padding: '0 0.3rem'}}>
                {categories.length === 0 && (
                    <div style={{
                        color: 'var(--admingrey)',
                        opacity: 0.4,
                        padding: '0.4rem 0.5rem',
                        fontSize: '0.6vw'
                    }}>
                        Немає витрат за період
                    </div>
                )}
                {categories.map((cat, i) => {
                    const pct = total > 0 ? (cat.total / total) * 100 : 0;
                    const color = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS['Інше'];
                    return (
                        <div key={i} className="dsh-exp-cat-row">
                            <div className="dsh-exp-cat-bar"
                                 style={{width: `${pct}%`, background: color + '12'}}/>
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
