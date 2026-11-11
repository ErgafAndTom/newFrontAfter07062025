import React, { useState, useEffect, useCallback } from "react";
import axios from "../../../api/axiosInstance";
import NotificationSettings from "./NotificationSettings";

const styles = {
  container: {
    padding: 0,
  },
  title: {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginBottom: "1rem",
    color: "var(--admingrey)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "1.5rem",
    fontSize: "0.85rem",
  },
  th: {
    textAlign: "left",
    padding: "0.5rem 0.75rem",
    borderBottom: "1px solid var(--pp-line-strong)",
    color: "color-mix(in srgb, var(--admingrey) 62%, transparent)",
    fontWeight: 500,
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  td: {
    padding: "0.5rem 0.75rem",
    borderBottom: "1px solid var(--pp-line-soft)",
    verticalAlign: "middle",
  },
  statusDot: (active) => ({
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: 0,
    backgroundColor: active ? "var(--admingreen)" : "var(--pp-line-strong)",
    marginRight: 6,
  }),
  errorText: {
    color: "var(--adminred)",
    fontSize: "0.75rem",
    maxWidth: 220,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  dateText: {
    color: "color-mix(in srgb, var(--admingrey) 62%, transparent)",
    fontSize: "0.78rem",
  },
  btn: {
    padding: "0.3rem 0.7rem",
    border: "1px solid var(--pp-line-strong)",
    borderRadius: 0,
    backgroundColor: "var(--adminfon)",
    color: "var(--admingrey)",
    cursor: "pointer",
    fontSize: "0.8rem",
    marginRight: 4,
    transition: "background-color 0.2s",
  },
  btnDanger: {
    padding: "0.3rem 0.7rem",
    border: "1px solid var(--adminred)",
    borderRadius: 0,
    backgroundColor: "transparent",
    color: "var(--adminred)",
    cursor: "pointer",
    fontSize: "0.8rem",
    transition: "background-color 0.2s",
  },
  btnPrimary: {
    padding: "0.45rem 1.2rem",
    border: "1px solid var(--admingreen)",
    borderRadius: 0,
    backgroundColor: "transparent",
    color: "var(--admingreen)",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 600,
    transition: "background-color 0.2s",
  },
  addForm: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "flex-end",
    flexWrap: "wrap",
    padding: "1rem",
    backgroundColor: "var(--adminfonelement)",
    borderRadius: 0,
    border: "1px solid var(--pp-line-strong)",
    marginBottom: "1rem",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  label: {
    fontSize: "0.72rem",
    color: "color-mix(in srgb, var(--admingrey) 62%, transparent)",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  input: {
    padding: "0.4rem 0.6rem",
    border: "1px solid var(--pp-line-strong)",
    borderRadius: 0,
    fontSize: "0.85rem",
    backgroundColor: "var(--adminfon)",
    color: "var(--admingrey)",
    outline: "none",
    transition: "border-color 0.2s",
  },
  message: (type) => ({
    padding: "0.5rem 1rem",
    marginBottom: "1rem",
    borderRadius: 0,
    fontSize: "0.85rem",
    backgroundColor: type === "error" ? "color-mix(in srgb, var(--adminred) 10%, transparent)" : "var(--adminlightgreen)",
    color: type === "error" ? "var(--adminred)" : "var(--admingreen)",
    border: `1px solid ${type === "error" ? "color-mix(in srgb, var(--adminred) 40%, transparent)" : "color-mix(in srgb, var(--admingreen) 40%, transparent)"}`,
  }),
  emptyState: {
    textAlign: "center",
    padding: "2rem",
    color: "color-mix(in srgb, var(--admingrey) 62%, transparent)",
    fontSize: "0.9rem",
  },
};

export default function PrivatBankAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'error'|'success', text }
  const [testing, setTesting] = useState(false);

  // form
  const [formName, setFormName] = useState("");
  const [formToken, setFormToken] = useState("");
  const [formIban, setFormIban] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/privat/accounts");
      setAccounts(data.accounts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const clearMsg = () => setTimeout(() => setMsg(null), 5000);

  // Перевірити токен
  const handleTest = async () => {
    if (!formToken.trim()) return;
    setTesting(true);
    setMsg(null);
    try {
      const { data } = await axios.post("/api/privat/accounts/test-token", { token: formToken.trim() });
      if (data.success) {
        setMsg({ type: "success", text: "Токен валідний! Сервер PrivatBank відповів SUCCESS." });
      } else {
        setMsg({ type: "error", text: data.error || "Невалідний токен" });
      }
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || err.message });
    } finally {
      setTesting(false);
      clearMsg();
    }
  };

  // Додати
  const handleAdd = async () => {
    if (!formName.trim() || !formToken.trim()) {
      setMsg({ type: "error", text: "Назва і токен обов'язкові" });
      clearMsg();
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const { data } = await axios.post("/api/privat/accounts", {
        name: formName.trim(),
        token: formToken.trim(),
        iban: formIban.trim() || undefined,
      });
      if (data.success) {
        setMsg({ type: "success", text: `Акаунт "${data.account.name}" додано` });
        setFormName("");
        setFormToken("");
        setFormIban("");
        setShowForm(false);
        load();
      } else {
        setMsg({ type: "error", text: data.error });
      }
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
      clearMsg();
    }
  };

  // Увімкнути/вимкнути
  const handleToggle = async (acc) => {
    try {
      await axios.patch(`/api/privat/accounts/${acc.id}`, { isActive: !acc.isActive });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || err.message });
      clearMsg();
    }
  };

  // Видалити
  const handleDelete = async (acc) => {
    if (!window.confirm(`Видалити акаунт "${acc.name}"?`)) return;
    try {
      await axios.delete(`/api/privat/accounts/${acc.id}`);
      setMsg({ type: "success", text: `Акаунт "${acc.name}" видалено` });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || err.message });
    }
    clearMsg();
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("uk-UA", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div style={styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={styles.title}>Акаунти PrivatBank (Автоклієнт)</div>
        <button className="adminButton" onClick={() => setShowForm(!showForm)}>
          <span>{showForm ? "Сховати" : "+ Додати акаунт"}</span>
        </button>
      </div>

      {msg && <div style={styles.message(msg.type)}>{msg.text}</div>}

      {showForm && (
        <div style={styles.addForm}>
          <div style={styles.fieldGroup}>
            <span style={styles.label}>Назва</span>
            <input
              style={{ ...styles.input, width: 160 }}
              placeholder="напр. Пилипенко"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div style={styles.fieldGroup}>
            <span style={styles.label}>API Токен</span>
            <input
              style={{ ...styles.input, width: 340 }}
              placeholder="Токен з Приват24 для бізнесу"
              value={formToken}
              onChange={(e) => setFormToken(e.target.value)}
            />
          </div>
          <div style={styles.fieldGroup}>
            <span style={styles.label}>IBAN (опціонально)</span>
            <input
              style={{ ...styles.input, width: 220 }}
              placeholder="UA..."
              value={formIban}
              onChange={(e) => setFormIban(e.target.value)}
            />
          </div>
          <button className="adminButton" onClick={handleTest} disabled={testing || !formToken.trim()}>
            <span>{testing ? "..." : "Перевірити"}</span>
          </button>
          <button className="adminButton" onClick={handleAdd} disabled={loading}>
            <span>Додати</span>
          </button>
        </div>
      )}

      {loading && accounts.length === 0 ? (
        <div style={styles.emptyState}>Завантаження...</div>
      ) : accounts.length === 0 ? (
        <div style={styles.emptyState}>
          Немає акаунтів. Токени беруться з .env (PRIVAT_TOKEN_*) як fallback.
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Статус</th>
              <th style={styles.th}>Назва</th>
              <th style={styles.th}>IBAN</th>
              <th style={styles.th}>Остання перевірка</th>
              <th style={styles.th}>Помилка</th>
              <th style={styles.th}>Дії</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => (
              <tr key={acc.id}>
                <td style={styles.td}>
                  <span style={styles.statusDot(acc.isActive)} />
                  {acc.isActive ? "Активний" : "Вимкнений"}
                </td>
                <td style={{ ...styles.td, fontWeight: 500 }}>{acc.name}</td>
                <td style={styles.td}>
                  <span style={styles.dateText}>{acc.iban || "—"}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.dateText}>{formatDate(acc.lastCheckAt)}</span>
                </td>
                <td style={styles.td}>
                  {acc.lastError ? (
                    <span style={styles.errorText} title={acc.lastError}>
                      {acc.lastError}
                    </span>
                  ) : (
                    <span style={{ color: "var(--admingreen)", fontSize: "0.78rem" }}>OK</span>
                  )}
                </td>
                <td style={styles.td}>
                  <button className="adminButton" onClick={() => handleToggle(acc)}>
                    <span>{acc.isActive ? "Вимкнути" : "Увімкнути"}</span>
                  </button>
                  <button className="adminButton" style={{ marginLeft: 4 }} onClick={() => handleDelete(acc)}>
                    <span>Видалити</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <NotificationSettings />
    </div>
  );
}
