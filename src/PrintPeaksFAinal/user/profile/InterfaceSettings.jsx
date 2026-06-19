import React, { useState, useEffect } from "react";

const STORAGE_KEY = "printpeaks_material_sort";

const SORT_OPTIONS = [
  { column: "id",        label: "ID (порядок створення)" },
  { column: "article",   label: "Артикул" },
  { column: "name",      label: "Назва" },
  { column: "createdAt", label: "Дата створення" },
];

const DEFAULT_SORT = { column: "id", reverse: false };

function readSort() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SORT };
    const parsed = JSON.parse(raw);
    return {
      column: SORT_OPTIONS.some((o) => o.column === parsed?.column) ? parsed.column : "id",
      reverse: !!parsed?.reverse,
    };
  } catch (e) {
    return { ...DEFAULT_SORT };
  }
}

export default function InterfaceSettings() {
  const [sort, setSort] = useState(readSort);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sort));
  }, [sort]);

  const handleColumn = (column) => setSort((prev) => ({ ...prev, column }));
  const toggleDirection = () => setSort((prev) => ({ ...prev, reverse: !prev.reverse }));
  const reset = () => setSort({ ...DEFAULT_SORT });

  return (
    <div style={styles.wrap}>
      <h3 style={styles.title}>Сортування матеріалів у списках калькуляторів</h3>
      <p style={styles.hint}>
        Налаштування застосовується до всіх дропдаунів вибору матеріалу (Black &amp; White,
        Digital Print, Photo, Wide Photo тощо). Зміни набувають чинності одразу при наступному
        відкритті калькулятора.
      </p>

      <div style={styles.row}>
        <span style={styles.label}>Сортувати за:</span>
        <div style={styles.btnGroup}>
          {SORT_OPTIONS.map((opt) => {
            const active = sort.column === opt.column;
            return (
              <button
                key={opt.column}
                type="button"
                onClick={() => handleColumn(opt.column)}
                style={{ ...styles.btn, ...(active ? styles.btnActive : {}) }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={styles.row}>
        <span style={styles.label}>Напрямок:</span>
        <div style={styles.btnGroup}>
          <button
            type="button"
            onClick={() => setSort((p) => ({ ...p, reverse: false }))}
            style={{ ...styles.btn, ...(!sort.reverse ? styles.btnActive : {}) }}
          >
            ↑ За зростанням (ASC)
          </button>
          <button
            type="button"
            onClick={() => setSort((p) => ({ ...p, reverse: true }))}
            style={{ ...styles.btn, ...(sort.reverse ? styles.btnActive : {}) }}
          >
            ↓ За спаданням (DESC)
          </button>
        </div>
      </div>

      <div style={styles.row}>
        <button type="button" onClick={reset} style={styles.resetBtn}>
          Скинути до дефолту (ID ↑)
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    padding: "1.5rem",
    background: "var(--adminfon)",
    color: "var(--admingrey)",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  title: {
    margin: 0,
    fontSize: "var(--font-size-s)",
    color: "var(--admingrey)",
    fontWeight: 600,
  },
  hint: {
    margin: 0,
    fontSize: "var(--font-size-mid)",
    color: "var(--admingrey)",
    opacity: 0.8,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  label: {
    fontSize: "var(--font-size-mid)",
    minWidth: "10rem",
  },
  btnGroup: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  btn: {
    padding: "0.5rem 1rem",
    background: "var(--adminfonelement)",
    color: "var(--admingrey)",
    border: "1px solid var(--adminorange)",
    cursor: "pointer",
    fontSize: "var(--font-size-mid)",
    transition: "all 0.15s",
  },
  btnActive: {
    background: "var(--adminlightgreen)",
    borderColor: "var(--admingreen)",
    color: "var(--admingreen)",
    fontWeight: 600,
  },
  resetBtn: {
    padding: "0.5rem 1rem",
    background: "transparent",
    color: "var(--adminred)",
    border: "1px solid var(--adminred)",
    cursor: "pointer",
    fontSize: "var(--font-size-mid)",
  },
};
