import React, { useState, useEffect, useCallback } from "react";

// -------------------------------------------------------
// MOCK ДАННЫЕ
// -------------------------------------------------------
const MOCK_ACCOUNTS = [
  {
    id: 1,
    username: "artem",
    displayName: "Artem",
    avatarColor: "#3b82f6",
    password: "1234"
  },
  {
    id: 2,
    username: "designer",
    displayName: "Designer",
    avatarColor: "#10b981",
    password: "0000"
  },
  {
    id: 3,
    username: "print",
    displayName: "PrintPeaks",
    avatarColor: "#f59e0b",
    password: "9999"
  }
];

const MOCK_CONTACT = {
  id: 999,
  displayName: "Mock Bot",
  username: "bot",
  avatarColor: "#22c55e"
};

// начальные сообщения
const INITIAL_MESSAGES = [
  {
    id: 1,
    fromId: MOCK_CONTACT.id,
    text: "Привет! Выбери mock-аккаунт и начнём 😉",
    createdAt: new Date().toISOString()
  }
];

// формат времени
const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// -------------------------------------------------------
// ОСНОВНОЙ КОМПОНЕНТ
// -------------------------------------------------------
const MockTelegramFull = () => {
  const [stage, setStage] = useState("select"); // select → login → chat
  const [selectedUser, setSelectedUser] = useState(null);
  const [authorizedUser, setAuthorizedUser] = useState(null);

  const [passwordInput, setPasswordInput] = useState("");

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // -------------------------------------------------------
  // MOCK отправка
  // -------------------------------------------------------
  const mockSend = (msg) =>
    new Promise((res) => setTimeout(() => res(true), 400));

  const mockReply = (text) =>
    new Promise((res) =>
      setTimeout(() => {
        res(
          text.toLowerCase().includes("привет")
            ? "О, привет! 🙌"
            : `Интересно... ты написал: «${text}»`
        );
      }, 600)
    );

  // -------------------------------------------------------
  // LOGIN
  // -------------------------------------------------------
  const handleLogin = (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (passwordInput === selectedUser.password) {
      setAuthorizedUser(selectedUser);
      setStage("chat");
    } else {
      alert("Неправильный mock-пароль");
    }
  };

  // -------------------------------------------------------
  // ОТПРАВКА СООБЩЕНИЯ
  // -------------------------------------------------------
  const handleSend = useCallback(
    async (e) => {
      e.preventDefault();
      if (!input.trim() || sending) return;

      const msg = {
        id: Date.now(),
        fromId: authorizedUser.id,
        text: input.trim(),
        createdAt: new Date().toISOString(),
        status: "sending"
      };

      setMessages((p) => [...p, msg]);
      setInput("");
      setSending(true);

      try {
        await mockSend(msg);

        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: "sent" } : m))
        );

        const reply = await mockReply(msg.text);

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            fromId: MOCK_CONTACT.id,
            text: reply,
            createdAt: new Date().toISOString(),
            status: "sent"
          }
        ]);
      } finally {
        setSending(false);
      }
    },
    [input, sending, authorizedUser]
  );

  // автоскролл
  useEffect(() => {
    const c = document.querySelector(".tg-msgs");
    if (c) c.scrollTop = c.scrollHeight;
  }, [messages]);

  // -------------------------------------------------------
  // UI СТАДИИ: ВЫБОР АККАУНТА
  // -------------------------------------------------------
  if (stage === "select") {
    return (
      <div style={container}>
        <h2 style={{ textAlign: "center" }}>Выберите mock-аккаунт</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
          {MOCK_ACCOUNTS.map((acc) => (
            <div
              key={acc.id}
              style={accountItem}
              onClick={() => {
                setSelectedUser(acc);
                setStage("login");
              }}
            >
              <div style={{ ...avatar, background: acc.avatarColor }}>
                {acc.displayName[0]}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{acc.displayName}</div>
                <div style={{ opacity: 0.6, fontSize: 13 }}>@{acc.username}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // UI СТАДИИ: ЛОГИН
  // -------------------------------------------------------
  if (stage === "login") {
    return (
      <div style={container}>
        <h2 style={{ textAlign: "center" }}>Вход в {selectedUser.displayName}</h2>

        <form onSubmit={handleLogin} style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            placeholder="mock-пароль"
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            style={inputStyle}
          />

          <button style={btnPrimary}>Войти</button>
          <button style={btnSecondary} onClick={() => setStage("select")}>Назад</button>
        </form>
      </div>
    );
  }

  // -------------------------------------------------------
  // UI СТАДИИ: ЧАТ
  // -------------------------------------------------------
  return (
    <div style={chatWrapper}>
      {/* HEADER */}
      <div style={chatHeader}>
        <div style={{ ...avatar, background: MOCK_CONTACT.avatarColor, width: 40, height: 40 }}>
          {MOCK_CONTACT.displayName[0]}
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>{MOCK_CONTACT.displayName}</div>
          <div style={{ opacity: 0.6, fontSize: 12 }}>online</div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="tg-msgs" style={chatMessages}>
        {messages.map((m) => {
          const me = m.fromId === authorizedUser.id;
          const avatarUser = m.fromId === MOCK_CONTACT.id ? MOCK_CONTACT : authorizedUser;

          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: me ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: 6
              }}
            >
              {!me && (
                <div
                  style={{
                    ...avatar,
                    background: avatarUser.avatarColor,
                    width: 28,
                    height: 28
                  }}
                >
                  {avatarUser.displayName[0]}
                </div>
              )}

              <div
                style={{
                  maxWidth: "70%",
                  padding: "6px 10px",
                  borderRadius: 12,
                  background: me ? "#10b981" : "#1f2937",
                  borderBottomRightRadius: me ? 4 : 12,
                  borderBottomLeftRadius: me ? 12 : 4,
                }}
              >
                <div>{m.text}</div>
                <div style={{ marginTop: 3, fontSize: 11, textAlign: "right", opacity: 0.7 }}>
                  {formatTime(m.createdAt)}{" "}
                  {me && (m.status === "sending" ? "…" : "✓")}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT */}
      <form onSubmit={handleSend} style={chatInputRow}>
        <input
          style={chatInput}
          placeholder="Написать..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button disabled={!input.trim() || sending} style={chatSendBtn}>
          ➤
        </button>
      </form>
    </div>
  );
};

export default MockTelegramFull;

// -------------------------------------------------------
// СТИЛИ
// -------------------------------------------------------
const container = {
  width: 360,
  padding: 20,
  background: "#0f172a",
  color: "#fff",
  borderRadius: 12,
  border: "1px solid #1e293b",
  fontFamily: "system-ui",
};

const accountItem = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  padding: 12,
  background: "#1f2937",
  borderRadius: 10,
  cursor: "pointer"
};

const avatar = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: 600,
  color: "#fff"
};

const inputStyle = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#1e293b",
  color: "#fff",
  fontSize: 15
};

const btnPrimary = {
  padding: "10px 14px",
  borderRadius: 8,
  background: "#10b981",
  border: "none",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer"
};

const btnSecondary = {
  padding: "10px 14px",
  borderRadius: 8,
  background: "#334155",
  border: "none",
  color: "#fff",
  cursor: "pointer"
};

const chatWrapper = {
  width: 360,
  height: 600,
  display: "flex",
  flexDirection: "column",
  background: "#0f172a",
  color: "#fff",
  borderRadius: 12,
  border: "1px solid #1e293b",
  overflow: "hidden",
  fontFamily: "system-ui"
};

const chatHeader = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "10px 14px",
  background: "#111827",
  borderBottom: "1px solid #1f2937"
};

const chatMessages = {
  flex: 1,
  padding: "10px 12px",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 6
};

const chatInputRow = {
  display: "flex",
  padding: 8,
  gap: 6,
  borderTop: "1px solid #1f2937",
  background: "#020617"
};

const chatInput = {
  flex: 1,
  padding: "10px 14px",
  borderRadius: 20,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#fff",
  outline: "none"
};

const chatSendBtn = {
  width: 44,
  borderRadius: "50%",
  background: "#10b981",
  border: "none",
  color: "#fff",
  fontSize: 18,
  cursor: "pointer"
};
