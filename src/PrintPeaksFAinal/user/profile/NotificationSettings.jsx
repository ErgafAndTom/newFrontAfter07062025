import React, { useState, useEffect, useCallback } from "react";
import axios from "../../../api/axiosInstance";

const METHOD_LABELS = {
  cash: "Готівка",
  terminal: "Картка (термінал)",
  link: "Посилання (Monobank)",
  invoice: "Рахунок",
  iban: "IBAN",
  expired: "Протерміновані",
};

const styles = {
  container: {
    padding: "1.5rem 2rem",
    borderTop: "1px solid #e0ddd4",
    marginTop: "1rem",
  },
  title: {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginBottom: "1rem",
    color: "#333",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.5rem 0.75rem",
    borderBottom: "1px solid #eceae3",
  },
  checkbox: {
    width: 18,
    height: 18,
    accentColor: "#0e935b",
    cursor: "pointer",
  },
  label: {
    fontSize: "0.9rem",
    color: "var(--admingrey, #666)",
    cursor: "pointer",
    userSelect: "none",
  },
  loading: {
    textAlign: "center",
    padding: "1rem",
    color: "#999",
    fontSize: "0.9rem",
  },
};

export default function NotificationSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/trello/notificationSettings");
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (method, currentEnabled) => {
    // Optimistic update
    setSettings((prev) =>
      prev.map((s) => (s.method === method ? { ...s, enabled: !currentEnabled } : s))
    );
    try {
      const { data } = await axios.put("/trello/notificationSettings", {
        method,
        enabled: !currentEnabled,
      });
      setSettings(data);
    } catch (err) {
      console.error('[NotificationSettings] toggle error:', err?.response?.status, err?.response?.data);
      load(); // revert on error
    }
  };

  if (loading && settings.length === 0) {
    return <div style={styles.loading}>Завантаження...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>Сповіщення</div>
      <div style={styles.list}>
        {settings.map((s) => {
          const isLocked = s.method === 'expired';
          return (
            <div key={s.method} style={{ ...styles.row, opacity: isLocked ? 0.5 : 1 }}>
              <input
                type="checkbox"
                style={{ ...styles.checkbox, cursor: isLocked ? 'not-allowed' : 'pointer' }}
                checked={isLocked ? true : s.enabled}
                onChange={() => !isLocked && handleToggle(s.method, s.enabled)}
                disabled={isLocked}
                id={`notif-${s.method}`}
              />
              <label
                htmlFor={`notif-${s.method}`}
                style={{ ...styles.label, cursor: isLocked ? 'not-allowed' : 'pointer' }}
              >
                {METHOD_LABELS[s.method] || s.method}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
