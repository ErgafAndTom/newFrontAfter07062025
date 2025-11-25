import React, { useEffect, useState, useRef } from "react";
import TelegramAvatar from "../Messages/TelegramAvatar";
import "./styles.css";

// backend proxied через package.json: "proxy": "http://localhost:5555"
const API = "/api/telegram";

export default function TelegramBot() {
  const [lastUpdate, setLastUpdate] = useState(0);

  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);

  const [messageInput, setMessageInput] = useState("");

  const [status, setStatus] = useState("green");
  const [errorCount, setErrorCount] = useState(0);
  const [lastErrorType, setLastErrorType] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };


  // ====================================
  // INIT LOAD
  // ====================================
  useEffect(() => {
    async function loadInitialChats() {
      try {
        const res = await fetch(`${API}/init`);
        const json = await res.json();

        if (json.chats) setChats(json.chats);
      } catch (e) {
        console.error("INIT error:", e);
      }
    }
    loadInitialChats();
  }, []);

  // ====================================
  // FRONT LONGPOLL
  // ====================================
  useEffect(() => {
    let mounted = true;

    async function poll() {
      while (mounted) {
        try {
          const res = await fetch(`${API}/updates`);

          if (!res.ok) throw { response: { status: res.status } };

          setStatus("green");
          setErrorCount(0);
          setLastErrorType(null);

          const json = await res.json();

          if (json.updates?.length > 0) {
            json.updates.forEach((u) => {
              setChats((prev) => {
                let existing = prev.find((x) => x.username === u.username);

                const newMsg = {
                  text: u.text,
                  mediaType: u.mediaType,
                  mediaUrl: u.mediaUrl,
                  sender: u.sender,        // <<< ВАЖНО
                  timestamp: u.timestamp
                };

                if (!existing) {
                  return [
                    ...prev,
                    { username: u.username, chatId: u.chatId, messages: [newMsg] }
                  ];
                }

                return prev.map((c) =>
                  c.username === u.username
                    ? { ...c, messages: [...c.messages, newMsg] }
                    : c
                );
              });

              setLastUpdate(Date.now());
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
  }, []);

  // ====================================
  // SEND MESSAGE
  // ====================================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentChat || !messageInput.trim()) return;

    const msg = {
      sender: "me",
      text: messageInput,
      timestamp: Date.now(),
      mediaType: "text",
      mediaUrl: null
    };

    setChats((prev) =>
      prev.map((c) =>
        c.username === currentChat
          ? { ...c, messages: [...c.messages, msg] }
          : c
      )
    );

    scrollToBottom();

    try {
      await fetch(`${API}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentChat,
          text: messageInput
        })
      });
    } catch (e) {
      console.error("Send error:", e);
    }

    setMessageInput("");
  };

  const detectErrorType = (error) => {
    if (error.name === "AbortError") return "timeout";
    if (error.response?.status >= 500) return "5xx";
    if (error.response?.status >= 400) return "4xx";
    if (error.request) return "network";
    return "other";
  };

  const fmtTime = (t) => {
    const d = new Date(t);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // ====================================
  // RENDER MESSAGE
  // ====================================
  const renderMessage = (m) => {
    // Бот -> слева, Юзер -> справа
    const isUser = m.sender === "me";
    console.log(m);

    console.log(chats);
    console.log(chats);


    return (
      <div
        style={{
          display: "flex",
          justifyContent: isUser ? "flex-end" : "flex-start",
          width: "100%"
        }}
      >
        <div
          style={{
            ...styles.messageBubble,
            background: isUser ? "#D9FDD3" : "#FFFFFF",
            borderBottomRightRadius: isUser ? 4 : 14,
            borderBottomLeftRadius: isUser ? 14 : 4,
            marginLeft: isUser ? 40 : 0,
            marginRight: isUser ? 0 : 40
          }}
        >
          {/* PHOTO */}
          {m.mediaType === "photo" && (
            <img
              src={m.mediaUrl}
              alt=""
              style={{ width: "240px", borderRadius: 10 }}
            />
          )}

          {/* DOCUMENT */}
          {m.mediaType === "document" && (
            <a href={m.mediaUrl} target="_blank" rel="noreferrer">
              📄 Скачать файл
            </a>
          )}

          {/* STICKER */}
          {m.mediaType === "sticker" && (
            <img
              src={m.mediaUrl}
              alt=""
              style={{ width: 120, height: 120 }}
            />
          )}

          {m.text && <div>{m.text}</div>}

          <div style={styles.timeLabel}>{fmtTime(m.timestamp)}</div>
          <div style={styles.timeLabel}>{m.sender}</div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.app}>
      {/* LEFT */}
      <div style={styles.leftPanel}>
        <div style={styles.leftHeader}>
          <div style={styles.avatar}>
            <TelegramAvatar link={""} size={45} defaultSrc="" />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Telegram Bot</div>
            <div style={{ fontSize: 12, color: "#777" }}>@bot</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background:
                  status === "green"
                    ? "#4CAF50"
                    : status === "yellow"
                      ? "#FBC02D"
                      : status === "red"
                        ? "#F44336"
                        : "#888"
              }}
            />
            <div style={{ fontSize: 11, opacity: 0.7 }}>
              {errorCount === 0 ? "OK" : lastErrorType}
            </div>
          </div>
        </div>

        <div style={styles.chatList}>
          {chats.map((c) => (
            <div
              key={c.username}
              onClick={() => setCurrentChat(c.username)}
              style={{
                ...styles.chatItem,
                background:
                  currentChat === c.username ? "#E3EDF7" : "transparent"
              }}
            >
              <div style={styles.chatAvatar}>
                {/*{c.username[0]?.toUpperCase()}*/}
                <TelegramAvatar link={c.username} size={45} defaultSrc="" />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, height: "1.3vh", fontSize: "1.3vh" }}>{c.firstName}</div>
                <div style={{ fontWeight: 600, fontSize: "0.7vh" }}>@{c.username}</div>
                <div style={{ color: "#777", fontSize: "1vh" }}>
                  {c.messages[c.messages.length - 1]?.text || ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div style={styles.rightPanel}>
        {currentChat ? (
          <>
            <div style={styles.chatHeader}>@{currentChat}</div>

            <div style={styles.messageContainer}>
              {chats
                .find((c) => c.username === currentChat)
                ?.messages.map((m, i) => (
                  <div key={i}>{renderMessage(m)}</div>
                ))}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={styles.inputRow}>
              <input
                style={styles.inputText}
                value={messageInput}
                placeholder="Сообщение…"
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button style={styles.sendButton}>➤</button>
            </form>
          </>
        ) : (
          <div style={styles.emptyChat}>Выберите чат</div>
        )}
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

