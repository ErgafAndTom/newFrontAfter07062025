import React, { useEffect, useState, useCallback } from 'react';
import './MaterialSettingsModal.css';
import axios from '../../api/axiosInstance';
import { X } from 'lucide-react';
import Barcode from 'react-barcode';
import { translateColumnName } from './translations';

const ALL_FIELDS = [
  'name', 'type', 'typeUse',
  'unit', 'thickness', 'x', 'y',
  'cost',
  'price1', 'price2', 'price3', 'price4', 'price5',
  'description',
];

const MaterialSettingsModal = ({ material, onClose, onMaterialUpdate }) => {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fields, setFields] = useState({});
  const [savingField, setSavingField] = useState(null);

  // Ініціалізація полів
  useEffect(() => {
    if (material) {
      const init = {};
      ALL_FIELDS.forEach(f => { init[f] = material[f] ?? ''; });
      setFields(init);
    }
  }, [material]);

  // Завантажити історію приходу
  const loadHistory = useCallback(() => {
    if (!material) return;
    setLoadingHistory(true);
    axios.get(`/materials/incoming/${material.id}`)
      .then(res => { setHistory(res.data); setLoadingHistory(false); })
      .catch(() => setLoadingHistory(false));
  }, [material]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // Додати прихід
  const handleAddIncoming = async () => {
    if (!qty || Number(qty) <= 0) return;
    setSubmitting(true);
    try {
      const res = await axios.post('/materials/incoming', {
        materialId: material.id,
        quantity: Number(qty),
        note,
      });
      setHistory(res.data.history);
      onMaterialUpdate(res.data.material);
      setQty('');
      setNote('');
    } catch (err) {
      console.log(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Зберегти окреме поле
  const handleFieldSave = async (field, value) => {
    if (String(value) === String(material[field] ?? '')) return;
    setSavingField(field);
    try {
      await axios.put('/materials/OnlyOneField', {
        tableName: 'Склад',
        id: material.id,
        tablePosition: field,
        input: value === '' ? '0' : value,
        search: '',
        inPageCount: 500,
        currentPage: 1,
        columnName: { column: 'id', reverse: false },
      });
      onMaterialUpdate({ ...material, [field]: value });
    } catch (err) {
      console.log(err.message);
    } finally {
      setSavingField(null);
    }
  };

  const formatDate = (val) => {
    if (!val) return '';
    const d = new Date(val);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  };

  if (!material) return null;

  return (
    <div className="msm-overlay" onClick={onClose}>
      <div className="msm-modal" onClick={e => e.stopPropagation()}>
        {/* Шапка */}
        <div className="msm-header">
          <div className="msm-header-left">
            <span className="msm-title">
              {material.name}
            </span>
            <div className="msm-barcode" title={`MAT${material.id}`}>
              <Barcode
                value={`MAT${material.id}`}
                width={1.2}
                height={28}
                background="transparent"
                fontSize={0}
                displayValue={false}
                margin={0}
              />
            </div>
          </div>
          <button className="msm-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Тіло */}
        <div className="msm-body">
          {/* Залишок + Історія приходу */}
          <div className="msm-section">
            <div className="msm-stock-row">
              Наявність: <strong style={{ color: (material.amount ?? 0) < 0 ? 'var(--adminred)' : 'var(--admingreen)' }}>{material.amount ?? 0}</strong>
              {' / '}Резерв: <strong>{material.quantity ?? 0}</strong>
              {' / '}Загальна: <strong style={{ color: (material.amountAll ?? 0) < 0 ? 'var(--adminred)' : undefined }}>{material.amountAll ?? 0}</strong>
            </div>

            {loadingHistory ? (
              <div className="msm-history-empty">Завантаження...</div>
            ) : history.length === 0 ? (
              <div className="msm-history-empty">Немає записів приходу</div>
            ) : (
              <div className="msm-history-list">
                {history.map(h => (
                  <div key={h.id} className="msm-history-item">
                    <span className="msm-history-qty">+{h.quantity} шт</span>
                    <span className="msm-history-note" title={h.note}>
                      {h.note || '—'}
                      {h.userName && <span className="msm-history-user"> ({h.userName})</span>}
                    </span>
                    <span className="msm-history-date">{formatDate(h.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Рядок приходу: кількість, ціна закупки, примітка */}
          <div className="msm-section">
            <div className="msm-row msm-row--incoming">
              <div className="msm-settings-field msm-field--narrow">
                <span className="msm-label">Кількість</span>
                <input
                  className="msm-input"
                  type="number"
                  min="1"
                  value={qty}
                  onChange={e => setQty(e.target.value)}
                  placeholder="0"
                  onKeyDown={e => e.key === 'Enter' && handleAddIncoming()}
                />
              </div>
              <div className="msm-settings-field msm-field--narrow">
                <span className="msm-label">{translateColumnName('cost')}</span>
                <input
                  className="msm-input"
                  type="text"
                  value={fields.cost ?? ''}
                  onChange={e => setFields(prev => ({ ...prev, cost: e.target.value }))}
                  onBlur={() => handleFieldSave('cost', fields.cost)}
                  onKeyDown={e => e.key === 'Enter' && handleFieldSave('cost', fields.cost)}
                  style={{ opacity: savingField === 'cost' ? 0.5 : 1 }}
                />
              </div>
              <div className="msm-settings-field msm-field--with-btn">
                <span className="msm-label">Примітка</span>
                <div className="msm-input-btn-row">
                  <input
                    className="msm-input msm-input--note"
                    type="text"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Постачальник"
                    onKeyDown={e => e.key === 'Enter' && handleAddIncoming()}
                  />
                  <button
                    className="msm-submit-btn"
                    onClick={handleAddIncoming}
                    disabled={submitting || !qty || Number(qty) <= 0}
                  >
                    {submitting ? '...' : 'Додати'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Секція: Налаштування */}
          <div className="msm-section">
            <div className="msm-section-title">Налаштування матеріалу</div>

            {/* Рядок 1: назва, тип, використання */}
            <div className="msm-row msm-row--3">
              {['name', 'type', 'typeUse'].map(f => (
                <div key={f} className="msm-settings-field">
                  <span className="msm-label">{translateColumnName(f)}</span>
                  <input
                    className="msm-input"
                    type="text"
                    value={fields[f] ?? ''}
                    onChange={e => setFields(prev => ({ ...prev, [f]: e.target.value }))}
                    onBlur={() => handleFieldSave(f, fields[f])}
                    onKeyDown={e => e.key === 'Enter' && handleFieldSave(f, fields[f])}
                    style={{ opacity: savingField === f ? 0.5 : 1 }}
                  />
                </div>
              ))}
            </div>

            {/* Рядок 2: о/в, цупкість, ширина, висота */}
            <div className="msm-row msm-row--4">
              {['unit', 'thickness', 'x', 'y'].map(f => (
                <div key={f} className="msm-settings-field">
                  <span className="msm-label">{translateColumnName(f)}</span>
                  <input
                    className="msm-input"
                    type="text"
                    value={fields[f] ?? ''}
                    onChange={e => setFields(prev => ({ ...prev, [f]: e.target.value }))}
                    onBlur={() => handleFieldSave(f, fields[f])}
                    onKeyDown={e => e.key === 'Enter' && handleFieldSave(f, fields[f])}
                    style={{ opacity: savingField === f ? 0.5 : 1 }}
                  />
                </div>
              ))}
            </div>

            {/* Рядок 3: ціни */}
            <div className="msm-row msm-row--5">
              {['price1', 'price2', 'price3', 'price4', 'price5'].map(f => (
                <div key={f} className="msm-settings-field">
                  <span className="msm-label">{translateColumnName(f)}</span>
                  <input
                    className="msm-input"
                    type="text"
                    value={fields[f] ?? ''}
                    onChange={e => setFields(prev => ({ ...prev, [f]: e.target.value }))}
                    onBlur={() => handleFieldSave(f, fields[f])}
                    onKeyDown={e => e.key === 'Enter' && handleFieldSave(f, fields[f])}
                    style={{ opacity: savingField === f ? 0.5 : 1 }}
                  />
                </div>
              ))}
            </div>

            {/* Опис — внизу */}
            <div className="msm-row msm-row--1">
              <div className="msm-settings-field">
                <span className="msm-label">{translateColumnName('description')}</span>
                <input
                  className="msm-input"
                  type="text"
                  value={fields.description ?? ''}
                  onChange={e => setFields(prev => ({ ...prev, description: e.target.value }))}
                  onBlur={() => handleFieldSave('description', fields.description)}
                  onKeyDown={e => e.key === 'Enter' && handleFieldSave('description', fields.description)}
                  style={{ opacity: savingField === 'description' ? 0.5 : 1 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialSettingsModal;
