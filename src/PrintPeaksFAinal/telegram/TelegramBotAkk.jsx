import React, { useState, useEffect, useRef } from "react";

const API = "/api/telegramAkk";

export default function TelegramBotAkk() {
  const [authState, setAuthState] = useState("phone"); // phone → code → password → ready
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messageInput, setMessageInput] = useState("");

  const [status, setStatus] = useState("green");
  const [errorCount, setErrorCount] = useState(0);
  const [lastErrorType, setLastErrorType] = useState(null);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // LOGIN STEP: sendCode
  const sendPhone = async () => {
    const res = await fetch(API + "/login/sendCode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });
    const j = await res.json();
    if (j.ok) setAuthState("code");
    else alert(j.error);
  };

  // LOGIN STEP: enterCode
  const sendCodeVerify = async () => {
    const res = await fetch(API + "/login/enterCode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const j = await res.json();

    if (j.ok) {
      setAuthState("ready");
      loadInitial();
    } else if (j.error === "PASSWORD_NEEDED") {
      setAuthState("password");
    } else alert(j.error);
  };

  // LOGIN STEP: password
  const sendPassword = async () => {
    const res = await fetch(API + "/login/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const j = await res.json();
    if (j.ok) {
      setAuthState("ready");
      loadInitial();
    } else alert(j.error);
  };

  // INIT
  const loadInitial = async () => {
    const res = await fetch(API + "/init");
    const json = await res.json();
    if (json.chats) setChats(json.chats);
  };

  useEffect(() => {
    if (authState !== "ready") return;
    let mounted = true;

    async function poll() {
      while (mounted) {
        try {
          const res = await fetch(API + "/updates");
          if (!res.ok) throw { response: { status: res.status } };

          setStatus("green");
          setErrorCount(0);
          setLastErrorType(null);

          const json = await res.json();

          if (json.updates?.length > 0) {
            json.updates.forEach((u) => {
              setChats((prev) => {
                let existing = prev.find((x) => x.chatId === u.chatId);

                const newMsg = {
                  text: u.text,
                  mediaType: u.mediaType,
                  mediaUrl: u.mediaUrl,
                  sender: u.sender,
                  timestamp: u.timestamp
                };

                if (!existing) {
                  return [
                    ...prev,
                    {
                      username: u.username,
                      chatId: u.chatId,
                      messages: [newMsg]
                    }
                  ];
                }

                return prev.map((c) =>
                  c.chatId === u.chatId
                    ? { ...c, messages: [...c.messages, newMsg] }
                    : c
                );
              });
              scrollToBottom();
            });
          }
        } catch (err) {
          const type = detectErrorType(err);

          setErrorCount((prev) => {
            const next = prev + 1;

            if (next === 1) setStatus("yellow");
            else if (next <= 10) setStatus("red");
            else setStatus("gray");

            return next;
          });

          setLastErrorType(type);
        }

        await new Promise((r) => setTimeout(r, 10));
      }
    }

    poll();
    return () => (mounted = false);
  }, [authState]);

  const detectErrorType = (error) => {
    if (error.name === "AbortError") return "timeout";
    if (error.response?.status >= 500) return "5xx";
    if (error.response?.status >= 400) return "4xx";
    if (error.request) return "network";
    return "other";
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!currentChatId || !messageInput.trim()) return;

    const msg = {
      sender: "me",
      text: messageInput,
      timestamp: Date.now(),
      mediaType: "text",
      mediaUrl: null
    };

    setChats((prev) =>
      prev.map((c) =>
        c.chatId === currentChatId
          ? { ...c, messages: [...c.messages, msg] }
          : c
      )
    );

    scrollToBottom();

    await fetch(API + "/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: currentChatId,
        text: messageInput
      })
    });

    setMessageInput("");
  };

  // RENDER AUTH STATES
  if (authState === "phone") {
    return (
      <div>
        <h2>Вход по номеру</h2>
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+380…" />
        <button onClick={sendPhone}>Отправить код</button>
      </div>
    );
  }

  if (authState === "code") {
    return (
      <div>
        <h2>Введите код</h2>
        <input value={code} onChange={e=>setCode(e.target.value)} />
        <button onClick={sendCodeVerify}>Войти</button>
      </div>
    );
  }

  if (authState === "password") {
    return (
      <div>
        <h2>Введите пароль 2FA</h2>
        <input value={password} onChange={e=>setPassword(e.target.value)} />
        <button onClick={sendPassword}>Войти</button>
      </div>
    );
  }

  // FULL CHAT UI
  return (
    <div style={{ display: "flex", height: "90vh" }}>
      {/* LEFT */}
      <div style={{ width: 260, borderRight: "1px solid #ddd", overflowY: "auto" }}>
        {chats.map((c) => (
          <div
            key={c.chatId}
            onClick={() => setCurrentChatId(c.chatId)}
            style={{
              padding: 12,
              borderBottom: "1px solid #eee",
              cursor: "pointer",
              background: c.chatId === currentChatId ? "#e5eefc" : "white"
            }}
          >
            <b>{c.username}</b>
            <br />
            <small>{c.messages[c.messages.length - 1]?.text}</small>
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {chats
            .find((c) => c.chatId === currentChatId)
            ?.messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 12, textAlign: m.sender === "me" ? "right" : "left" }}>
                <div
                  style={{
                    display: "inline-block",
                    padding: 10,
                    background: m.sender === "me" ? "#d9fdd3" : "white",
                    borderRadius: 8
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} style={{ padding: 10, borderTop: "1px solid #ddd", display: "flex" }}>
          <input
            style={{ flex: 1 }}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <button>Отправить</button>
        </form>
      </div>
    </div>
  );
}


/* =========================== STYLES =========================== */
const styles = {
  app: {
    display: "flex",
    height: "93vh",
    fontFamily: "Segoe UI, sans-serif",
    background: "#F4F7FA"
  },

  leftPanel: {
    width: "20vw",
    minWidth: "240px",
    borderRight: "0.15vh solid #D6DEE5",
    display: "flex",
    flexDirection: "column",
    background: "#FFFFFF"
  },

  leftHeader: {
    display: "flex",
    alignItems: "center",
    padding: "1.2vh 1.4vw",
    borderBottom: "0.15vh solid #D6DEE5",
    gap: "1vw"
  },
  botAvatar: {
    width: "3vw",
    height: "3vw",
    minWidth: "34px",
    minHeight: "34px",
    borderRadius: "50%",
    background: "#4C8BF5",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    fontSize: "clamp(12px, 1vw, 20px)"
  },
  botMeta: { flex: 1 },
  botName: {
    fontWeight: 600,
    fontSize: "clamp(12px, 1vw, 18px)"
  },
  botUsername: {
    fontSize: "clamp(10px, 0.8vw, 16px)",
    color: "#7A8B9A"
  },
  statusDot: {
    width: "0.9vw",
    height: "0.9vw",
    minWidth: "10px",
    minHeight: "10px",
    borderRadius: "50%"
  },

  searchWrap: {
    padding: "1.2vh 1.4vw"
  },
  searchInput: {
    width: "100%",
    padding: "1.2vh 1vw",
    borderRadius: "1vh",
    border: "0.15vh solid #D6DEE5",
    background: "#F2F3F5",
    fontSize: "clamp(12px, 0.9vw, 16px)"
  },

  chatList: {
    flex: 1,
    overflowY: "auto"
  },
  chatItem: {
    display: "flex",
    padding: "1.2vh 1.4vw",
    cursor: "pointer",
    borderBottom: "0.15vh solid #F2F3F5"
  },
  chatAvatar: {
    width: "3.2vw",
    height: "3.2vw",
    minWidth: "40px",
    minHeight: "40px",
    borderRadius: "50%",
    background: "#D0DAE3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "clamp(14px, 1vw, 20px)",
    fontWeight: 600,
    marginRight: "1vw"
  },
  chatMeta: { flex: 1 },
  chatName: {
    fontWeight: 600,
    fontSize: "clamp(12px, 1vw, 18px)"
  },
  chatLastMessage: {
    color: "#66788A",
    fontSize: "clamp(10px, 0.8vw, 16px)",
    marginTop: "0.4vh"
  },

  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },
  chatHeader: {
    padding: "1.6vh 1.6vw",
    fontWeight: 600,
    fontSize: "clamp(14px, 1.4vw, 22px)",
    borderBottom: "0.15vh solid #D6DEE5"
  },

  messageContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "2vh 2vw",
    overflowY: "auto",
    gap: "1.2vh"
  },
  messageBubble: {
    maxWidth: "65%",
    padding: "1vh 1vw",
    borderRadius: "1.6vh",
    fontSize: "clamp(12px, 1vw, 18px)",
    lineHeight: 1.35,
    boxShadow: "0 0.2vh 0.4vh rgba(0,0,0,0.08)",
    borderTopLeftRadius: "1.4vh",
    borderTopRightRadius: "1.4vh"
  },

  timeLabel: {
    fontSize: "clamp(9px, 0.8vw, 14px)",
    color: "#8A8A8A",
    marginTop: "0.5vh",
    textAlign: "right"
  },

  inputRow: {
    display: "flex",
    padding: "1.6vh 1vw",
    borderTop: "0.15vh solid #D6DEE5",
    background: "#FFFFFF",
    gap: "0.8vw"
  },
  inputText: {
    flex: 1,
    padding: "1.2vh 1vw",
    borderRadius: "1vh",
    border: "0.15vh solid #D6DEE5",
    fontSize: "clamp(12px, 1vw, 18px)"
  },
  sendButton: {
    width: "4vw",
    minWidth: "48px",
    background: "#4C8BF5",
    color: "white",
    border: "none",
    borderRadius: "1vh",
    fontSize: "clamp(14px, 1.2vw, 20px)",
    cursor: "pointer"
  },

  emptyChat: {
    margin: "auto",
    fontSize: "clamp(16px, 1.4vw, 24px)",
    color: "#9AA5B1"
  }
};
