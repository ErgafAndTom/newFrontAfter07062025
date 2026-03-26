import React, { useEffect, useState, useRef, useCallback } from 'react';
import './StorageTable.css';
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/calc/Loader";
import ModalDeleteOrder from "../Orders/ModalDeleteOrder";
import Pagination from "../tools/Pagination";
import { useDispatch, useSelector } from "react-redux";
import { searchChange } from "../../actions/searchAction";
import { translateColumnName } from "./translations";
import { Copy, Trash2, Settings } from "lucide-react";
import Barcode from "react-barcode";
import { printLabel } from "../barcode/niimbotPrintService";
import MaterialSettingsModal from "./MaterialSettingsModal";

/* Колонки в порядку відображення (settings — між y та created) */
const COLUMNS = [
  'article', 'name', 'type', 'typeUse', 'description',
  'amount', 'quantity', 'unit', 'thickness', 'cost',
  'price1', 'price2', 'price3', 'price4', 'price5',
  'x', 'y', 'settings', 'created', 'createdAt', 'updatedAt'
];

const NON_EDITABLE = new Set(['article', 'createdAt', 'updatedAt', 'created', 'settings']);
const PRICE_COLS   = new Set(['cost', 'price1', 'price2', 'price3', 'price4', 'price5']);
const DATE_COLS    = new Set(['createdAt', 'updatedAt']);
const AMOUNT_COLS  = new Set(['amount', 'quantity']);

/* ── Компонент редагованої клітинки ── */
const EditableCell = ({ value, field, itemId, onSave, className, cellIndex }) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value ?? '');
  const [saving, setSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef(null);
  const cellRef = useRef(null);
  const tabTargetRef = useRef(null); // зберігаємо напрямок Tab до unmount input

  useEffect(() => {
    setEditValue(value ?? '');
    setHasError(false);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const doSave = useCallback(async (newVal) => {
    const trimmed = newVal === '' ? '0' : newVal;
    if (String(trimmed) === String(value ?? '')) return;
    setSaving(true);
    setHasError(false);
    try {
      await onSave(itemId, field, trimmed);
    } catch {
      setHasError(true);
      setEditValue(value ?? '');
    } finally {
      setSaving(false);
    }
  }, [value, itemId, field, onSave]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = editValue;
      setEditing(false);
      doSave(val);
    }
    if (e.key === 'Escape') {
      setEditValue(value ?? '');
      setEditing(false);
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      const val = editValue;
      const reverse = e.shiftKey;
      // Знаходимо наступну клітинку ДО збереження (поки input ще в DOM)
      const allCells = Array.from(document.querySelectorAll('[data-cell-index]'));
      const myIdx = allCells.findIndex(el => el.dataset.cellIndex === String(cellIndex));
      const nextIdx = reverse ? myIdx - 1 : myIdx + 1;
      const nextCell = allCells[nextIdx];
      setEditing(false);
      doSave(val);
      if (nextCell) {
        setTimeout(() => nextCell.click(), 20);
      }
    }
  };

  if (editing) {
    return (
      <div className={`stg-cell stg-cell--editing ${className || ''}`} data-cell-index={cellIndex}>
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => {
            const val = editValue;
            setEditing(false);
            doSave(val);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  }

  return (
    <div
      ref={cellRef}
      data-cell-index={cellIndex}
      className={`stg-cell stg-cell--editable ${className || ''} ${saving ? 'stg-cell--saving' : ''} ${hasError ? 'stg-cell--error' : ''}`}
      onClick={() => setEditing(true)}
      title={String(value ?? '')}
    >
      {value ?? '—'}
    </div>
  );
};

/* ── Основний компонент ── */
const CustomStorageTable = ({ name }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [thisItemForDelete, setThisItemForDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(500);
  const [sortColumn, setSortColumn] = useState('name');
  const [sortReverse, setSortReverse] = useState(false);
  const [settingsMaterial, setSettingsMaterial] = useState(null);
  const [activeType, setActiveType] = useState(null); // null = всі

  const dispatch = useDispatch();
  const search = useSelector((state) => state.search.search);
  const navigate = useNavigate();

  useEffect(() => { dispatch(searchChange('')); }, []); // eslint-disable-line

  /* ── Слухач сканера штрих-коду MAT{id} ── */
  useEffect(() => {
    const handler = (e) => {
      const materialId = e.detail?.materialId;
      if (!materialId || !data) return;
      const found = data.rows.find(r => r.id === materialId);
      if (found) {
        setSettingsMaterial(found);
      } else {
        // Матеріал не на поточній сторінці — все одно відкриваємо з мінімальними даними
        setSettingsMaterial({ id: materialId });
      }
    };
    window.addEventListener('open-material-settings', handler);
    return () => window.removeEventListener('open-material-settings', handler);
  }, [data]);

  /* ── Завантаження даних ── */
  const fetchData = useCallback(() => {
    setLoading(true);
    axios.post('/materials/All', {
      inPageCount: limit,
      currentPage,
      search,
      columnName: { column: sortColumn, reverse: sortReverse },
    })
      .then(res => {
        setData(res.data);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        if (err.response?.status === 403) navigate('/login');
        setError(err.message);
        setLoading(false);
      });
  }, [limit, currentPage, search, sortColumn, sortReverse, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* Рефреш після видалення */
  useEffect(() => {
    if (!showDeleteModal && data) fetchData();
  }, [showDeleteModal]); // eslint-disable-line

  /* ── Сортування ── */
  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortReverse(prev => !prev);
    } else {
      setSortColumn(col);
      setSortReverse(false);
    }
    setCurrentPage(1);
  };

  const SortArrow = ({ col }) => (
    <span className={`stg-sort-icon${sortColumn === col ? ' stg-sort-icon--active' : ''}`}>
      {sortColumn === col ? (sortReverse ? ' ↓' : ' ↑') : ' ↕'}
    </span>
  );

  /* ── Збереження однієї клітинки (Excel-like) ── */
  const handleCellSave = useCallback(async (itemId, field, newValue) => {
    // Оптимістичне оновлення
    setData(prev => {
      if (!prev) return prev;
      const newRows = prev.rows.map(row =>
        row.id === itemId ? { ...row, [field]: newValue } : row
      );
      return { ...prev, rows: newRows };
    });

    await axios.put('/materials/OnlyOneField', {
      tableName: name,
      id: itemId,
      tablePosition: field,
      input: newValue,
      search: search || '',
      inPageCount: limit,
      currentPage,
      columnName: { column: sortColumn, reverse: sortReverse },
    });
  }, [name, search, limit, currentPage, sortColumn, sortReverse]);

  /* ── Копіювання ── */
  const handleCopy = (item) => {
    axios.put('/materials/copy', {
      id: item.id,
      inPageCount: limit,
      currentPage,
      search: search || '',
      columnName: { column: sortColumn, reverse: sortReverse },
    })
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        if (err.response?.status === 403) navigate('/login');
        setError(err.message);
      });
  };

  /* ── Додавання нового матеріалу ── */
  const handleAdd = () => {
    axios.post('/materials/', {
      inPageCount: limit,
      currentPage,
    })
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        console.log(err.message);
      });
  };

  /* ── Видалення ── */
  const handleDelete = (item) => {
    setThisItemForDelete(item);
    setShowDeleteModal(true);
  };

  /* ── Форматування дати ── */
  const formatDate = (val) => {
    if (!val) return '—';
    const d = new Date(val);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  };

  /* Кількість редагованих колонок на рядок (для cellIndex) */
  const EDITABLE_COLS = COLUMNS.filter(c => !NON_EDITABLE.has(c));
  const COLS_PER_ROW = EDITABLE_COLS.length;

  /* Унікальні типи для вкладок */
  const types = React.useMemo(() => {
    if (!data?.rows) return [];
    const set = new Set();
    data.rows.forEach(r => {
      const t = r.type;
      if (t && t !== '0' && t !== '—') set.add(t);
    });
    return [...set].sort();
  }, [data]);

  /* Фільтровані та відсортовані рядки */
  const filteredRows = React.useMemo(() => {
    if (!data?.rows) return [];
    let rows = activeType ? data.rows.filter(r => r.type === activeType) : [...data.rows];

    // Багаторівневе сортування за замовчуванням: назва → використання → цупкість
    if (sortColumn === 'name') {
      const dir = sortReverse ? -1 : 1;
      rows.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        if (nameA !== nameB) return nameA < nameB ? -dir : dir;

        const useA = (a.typeUse || '').toLowerCase();
        const useB = (b.typeUse || '').toLowerCase();
        if (useA !== useB) return useA < useB ? -dir : dir;

        const thA = parseFloat(a.thickness) || 0;
        const thB = parseFloat(b.thickness) || 0;
        return (thA - thB) * dir;
      });
    }

    return rows;
  }, [data, activeType, sortColumn, sortReverse]);

  /* ── Рендер клітинки ── */
  const renderCell = (item, col, rowIndex) => {
    // Дати — лише відображення
    if (DATE_COLS.has(col)) {
      return (
        <div className="stg-cell stg-cell--center stg-cell--date" title={formatDate(item[col])}>
          {formatDate(item[col])}
        </div>
      );
    }

    // Штрих-код (article) — відображення barcode, клік друкує наліпку
    if (col === 'article') {
      const barcodeVal = `MAT${item.id}`;
      return (
        <div
          className="stg-cell stg-cell--center stg-cell--barcode"
          onClick={(e) => {
            e.stopPropagation();
            printLabel('material', item).catch(err => console.error('Print error:', err));
          }}
          title={`Друк ${barcodeVal}`}
          style={{ cursor: 'pointer', overflow: 'hidden' }}
        >
          <Barcode
            value={barcodeVal}
            width={1}
            height={20}
            background="transparent"
            fontSize={0}
            displayValue={false}
            margin={0}
          />
        </div>
      );
    }

    // created — кнопки copy/del
    if (col === 'created') {
      return null; // рендеримо окремо
    }

    // settings — кнопка налаштувань
    if (col === 'settings') {
      return null; // рендеримо окремо
    }

    // Цінові та кількісні класи
    let extraClass = '';
    if (PRICE_COLS.has(col)) extraClass = 'stg-cell--price stg-cell--center';
    else if (AMOUNT_COLS.has(col)) {
      extraClass = 'stg-cell--amount stg-cell--center';
      if (parseFloat(item[col]) < 0) extraClass += ' stg-cell--negative';
    }
    else if (['x', 'y'].includes(col)) extraClass = 'stg-cell--center';

    // cellIndex — унікальний індекс для Tab-навігації
    const colIdx = EDITABLE_COLS.indexOf(col);
    const cellIndex = rowIndex * COLS_PER_ROW + colIdx;

    return (
      <EditableCell
        value={item[col]}
        field={col}
        itemId={item.id}
        onSave={handleCellSave}
        className={extraClass}
        cellIndex={cellIndex}
      />
    );
  };

  if (error && !data) {
    return <div style={{ color: 'var(--adminred)', padding: '1rem' }}>{error}</div>;
  }

  if (!data) {
    return <div className="stg-loader"><Loader /></div>;
  }

  const totalPages = Math.ceil((data.count || 0) / limit);

  return (
    <div className="stg-wrap">
      {/* Вкладки типів */}
      {types.length > 0 && (
        <div className="stg-tabs">
          <div
            className={`stg-tab ${!activeType ? 'stg-tab--active' : ''}`}
            onClick={() => { setActiveType(null); setCurrentPage(1); }}
          >
            Всі ({data.rows.length})
          </div>
          {types.map(t => {
            const count = data.rows.filter(r => r.type === t).length;
            return (
              <div
                key={t}
                className={`stg-tab ${activeType === t ? 'stg-tab--active' : ''}`}
                onClick={() => { setActiveType(t); setCurrentPage(1); }}
              >
                {t} ({count})
              </div>
            );
          })}
        </div>
      )}

      <div className="stg-table-container">
        <div className="stg-table-inner">
          {/* Шапка */}
          <div className="stg-tbl-head">
            {COLUMNS.map(col => {
              if (col === 'created') {
                return (
                  <React.Fragment key="actions-head">
                    <div className="stg-cell stg-cell--head" key="copy-head">copy</div>
                    <div className="stg-cell stg-cell--head" key="del-head">del</div>
                  </React.Fragment>
                );
              }
              if (col === 'settings') {
                return <div key="settings-head" className="stg-cell stg-cell--head"><Settings size={13} /></div>;
              }
              return (
                <div
                  key={col}
                  className="stg-cell stg-cell--head"
                  onClick={() => !DATE_COLS.has(col) && handleSort(col)}
                >
                  {translateColumnName(col)}
                  {!DATE_COLS.has(col) && <SortArrow col={col} />}
                </div>
              );
            })}
          </div>

          {/* Рядки */}
          {loading && <div className="stg-loader"><Loader /></div>}

          {!loading && filteredRows.map((item, rowIndex) => (
            <div key={item.id} className="stg-tbl-row">
              {COLUMNS.map(col => {
                if (col === 'settings') {
                  return (
                    <div className="stg-cell stg-cell--center" key={`${item.id}-settings`}>
                      <button
                        className="stg-action-btn"
                        onClick={() => setSettingsMaterial(item)}
                        title="Налаштування"
                        tabIndex={-1}
                      >
                        <Settings size={13} />
                      </button>
                    </div>
                  );
                }
                if (col === 'created') {
                  return (
                    <React.Fragment key={`${item.id}-actions`}>
                      <div className="stg-cell stg-cell--center" key={`${item.id}-copy`}>
                        <button
                          className="stg-action-btn"
                          onClick={() => handleCopy(item)}
                          title="Копіювати"
                          tabIndex={-1}
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                      <div className="stg-cell stg-cell--center" key={`${item.id}-del`}>
                        <button
                          className="stg-action-btn stg-action-btn--del"
                          onClick={() => handleDelete(item)}
                          title="Видалити"
                          tabIndex={-1}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </React.Fragment>
                  );
                }
                return (
                  <React.Fragment key={`${item.id}-${col}`}>
                    {renderCell(item, col, rowIndex)}
                  </React.Fragment>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Футер */}
      <div className="stg-footer">
        <div>
          {data.count > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onLimitChange={setLimit}
              limit={limit}
            />
          )}
        </div>
      </div>

      {/* Модалка видалення */}
      <ModalDeleteOrder
        thisOrderForDelete={thisItemForDelete}
        showDeleteOrderModal={showDeleteModal}
        setThisOrderForDelete={setThisItemForDelete}
        setShowDeleteOrderModal={setShowDeleteModal}
        setData={setData}
        inPageCount={limit}
        setInPageCount={setLimit}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageCount={totalPages}
        setPageCount={() => {}}
        data={data}
        url="/materials"
        title={`Видалити матеріал ${thisItemForDelete?.name || ''}?`}
        subLabel=""
        showTotal={false}
      />

      {/* Модалка налаштувань матеріалу */}
      {settingsMaterial && (
        <MaterialSettingsModal
          material={settingsMaterial}
          onClose={() => setSettingsMaterial(null)}
          onMaterialUpdate={(updated) => {
            // Оновити рядок в таблиці
            setData(prev => {
              if (!prev) return prev;
              const newRows = prev.rows.map(row =>
                row.id === updated.id ? { ...row, ...updated } : row
              );
              return { ...prev, rows: newRows };
            });
            setSettingsMaterial(updated);
          }}
        />
      )}
    </div>
  );
};

export default CustomStorageTable;
