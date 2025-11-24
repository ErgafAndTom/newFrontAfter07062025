import React, { useEffect, useState, useRef } from "react";

// backend proxied через package.json: "proxy": "http://localhost:5555"
const API = "/api/telegram";

export default function TelegramBot() {
  const [lastUpdate, setLastUpdate] = useState(0);

  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const [status, setStatus] = useState("green"); // 'green' | 'yellow' | 'red' | 'gray'
  const [errorCount, setErrorCount] = useState(0);
  const [lastErrorType, setLastErrorType] = useState(null); // 'timeout' | '5xx' | '4xx' | 'network' | 'other' | null

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // ================= INIT LOAD =================
  useEffect(() => {
    async function loadInitialChats() {
      try {
        const res = await fetch(`${API}/init`);
        const json = await res.json();
        if (json.chats) setChats(json.chats);
      } catch (err) {
        console.error("INIT load error:", err);
      }
    }
    loadInitialChats();
  }, []);


  // ================= LONGPOLL =================
  useEffect(() => {
    let mounted = true;

    async function poll() {
      while (mounted) {
        try {
          console.log("Как узнало что пришло сообщение? Не выажно делаем запрос на его получение?? Да!");
          const res = await fetch(`${API}/updates`);
          console.log(res);

          if (res.status < 200 || res.status >= 300) {
            throw { response: { status: res.status } };
          }

          // УСПЕХ: зелёный
          setStatus("green");
          setErrorCount(0);
          setLastErrorType(null);

          const json = await res.json();

          if (json.updates && json.updates.length > 0) {
            json.updates.forEach((u) => {
              setChats((prev) => {
                let existing = prev.find((x) => x.username === u.username);
                const newMsg = {
                  text: u.text,
                  mediaType: u.mediaType,
                  mediaUrl: u.mediaUrl,
                  sender: "them",
                  timestamp: u.timestamp
                };

                if (!existing) {
                  return [
                    ...prev,
                    { username: u.username, chatId: u.chatId, messages: [newMsg] }
                  ];
                }

                return prev.map((chat) =>
                  chat.username === u.username
                    ? { ...chat, messages: [...chat.messages, newMsg] }
                    : chat
                );
              });

              setLastUpdate(Date.now());
              scrollToBottom();
            });
          }
        } catch (err) {
          console.error("LongPoll error:", err);
          const type = detectErrorType(err);

          setErrorCount(prev => {
            const next = prev + 1;

            if (next === 1) {
              // первая ошибка подряд → жёлтый
              setStatus("yellow");
            } else if (next >= 2 && next <= 10) {
              // от 2 до 10 подряд → красный
              setStatus("red");
            } else {
              // более 10 подряд → серый
              setStatus("gray");
            }

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


  // ================= STATUS =================
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (!lastUpdate) return setStatus("red");
  //
  //     const diff = Date.now() - lastUpdate;
  //     if (diff < 1500) setStatus("green");
  //     else if (diff < 5000) setStatus("yellow");
  //     else setStatus("red");
  //   }, 700);
  //   return () => clearInterval(interval);
  // }, [lastUpdate]);


  // ================= SEND MESSAGE =================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentChat || !messageInput.trim()) return;

    const msg = {
      sender: "me",
      text: messageInput,
      timestamp: Date.now()
    };

    setChats((prev) =>
      prev.map((c) =>
        c.username === currentChat
          ? { ...c, messages: [...c.messages, msg] }
          : c
      )
    );

    try {
      await fetch(`${API}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentChat,
          text: messageInput
        })
      });
    } catch (err) {
      console.error("Send error:", err);
    }

    setMessageInput("");
    scrollToBottom();
  };

  // FORMAT TIME
  const fmtTime = (t) => {
    const d = new Date(t);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };


  function detectErrorType(error) {
    // таймаут (axios / fetch с AbortController)
    if (error.code === "ECONNABORTED" || error.name === "AbortError") {
      return "timeout";
    }

    // есть HTTP-ответ
    if (error.response && error.response.status) {
      const status = error.response.status;

      if (status >= 500) return "5xx";
      if (status >= 400) return "4xx";
      return String(status);
    }

    // запрос ушёл, но ответа нет (network error)
    if (error.request) {
      return "network";
    }

    // что-то странное
    return "other";
  }


  // ================= RENDER MESSAGE =================
  const renderMessage = (m) => {
    return (
      <div
        style={{
          ...styles.messageBubble,
          alignSelf: m.sender === "me" ? "flex-end" : "flex-start",
          background: m.sender === "me" ? "#D9FDD3" : "#FFFFFF",
        }}
      >
        {/* PHOTO */}
        {m.mediaType === "photo" && (
          <img
            src={m.mediaUrl}
            alt="img"
            style={{ maxWidth: "240px", borderRadius: 10 }}
          />
        )}

        {/* DOCUMENT */}
        {m.mediaType === "document" && (
          <a
            href={m.mediaUrl}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#4C8BF5" }}
          >
            📄 Скачать файл
          </a>
        )}

        {/* STICKER */}
        {m.mediaType === "sticker" && (
          <img
            src={m.mediaUrl}
            alt="sticker"
            style={{ width: 120, height: 120 }}
          />
        )}

        {/* TEXT */}
        {m.text && <div>{m.text}</div>}

        <div style={styles.timeLabel}>{fmtTime(m.timestamp)}</div>
      </div>
    );
  };


  // UI render
  return (
    <div style={styles.app}>
      {/* LEFT PANEL */}
      <div style={styles.leftPanel}>
        <div style={styles.leftHeader}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#4C8BF5", display:"flex",justifyContent:"center",alignItems:"center", color:"white", fontSize:18 }}>B</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>Telegram Bot</div>
            <div style={{ fontSize: 13, color: "#666" }}>@bot</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background:
                  status === "green"
                    ? "#4CAF50" // зелёный — последний запрос успешный
                    : status === "yellow"
                      ? "#FBC02D" // жёлтый — первая ошибка
                      : status === "red"
                        ? "#F44336" // красный — 2–10 ошибок подряд
                        : "#9E9E9E", // серый — >10 ошибок подряд
              }}
            />
            <span style={{ fontSize: 10, opacity: 0.8 }}>
    {errorCount === 0 ? "OK" : lastErrorType || "error"}
  </span>
          </div>
        </div>

        {/* CHATS LIST */}
        <div style={styles.chatList}>
          {chats.map((c) => (
            <div
              key={c.username}
              onClick={() => setCurrentChat(c.username)}
              style={{
                ...styles.chatItem,
                background: currentChat === c.username ? "#E3EDF7" : "transparent"
              }}
            >
              <div style={styles.chatAvatar}>{c.username[0]?.toUpperCase()}</div>
              <div style={styles.chatMeta}>
                <div style={styles.chatName}>@{c.username}</div>
                <div style={styles.chatLastMessage}>
                  {c.messages[c.messages.length - 1]?.text || ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={styles.rightPanel}>
        {currentChat ? (
          <>
            <div style={styles.chatHeader}>@{currentChat}</div>

            <div style={styles.messageContainer}>
              {chats
                .find((c) => c.username === currentChat)
                ?.messages.map((m, i) => <div key={i}>{renderMessage(m)}</div>)}

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
    width: 320,
    borderRight: "1px solid #D6DEE5",
    display: "flex",
    flexDirection: "column",
    background: "#FFFFFF"
  },
  leftHeader: {
    display: "flex",
    alignItems: "center",
    padding: "12px 14px",
    borderBottom: "1px solid #D6DEE5",
    gap: 10
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#4C8BF5",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    fontSize: 18
  },
  botMeta: {
    flex: 1
  },
  botName: {
    fontWeight: 600,
    fontSize: 15
  },
  botUsername: {
    fontSize: 13,
    color: "#7A8B9A"
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: "50%"
  },

  searchWrap: {
    padding: "10px 16px"
  },
  searchInput: {
    width: "100%",
    padding: "10px",
    borderRadius: 8,
    border: "1px solid #D6DEE5",
    background: "#F2F3F5"
  },

  chatList: {
    flex: 1,
    overflowY: "auto"
  },
  chatItem: {
    display: "flex",
    padding: "10px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #F2F3F5"
  },
  chatAvatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "#D0DAE3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 600,
    marginRight: 12
  },
  chatMeta: {
    flex: 1
  },
  chatName: {
    fontWeight: 600,
    fontSize: 15
  },
  chatLastMessage: {
    color: "#66788A",
    fontSize: 13,
    marginTop: 2
  },

  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },
  chatHeader: {
    padding: "14px 16px",
    fontWeight: 600,
    fontSize: 18,
    borderBottom: "1px solid #D6DEE5"
  },
  messageContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: 20,
    overflowY: "auto",
    gap: 10
  },
  messageBubble: {
    maxWidth: "65%",
    padding: "10px 14px",
    borderRadius: 12,
    fontSize: 15,
    lineHeight: 1.4,
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)"
  },

  inputRow: {
    display: "flex",
    padding: 12,
    borderTop: "1px solid #D6DEE5",
    background: "#FFFFFF",
    gap: 8
  },
  inputText: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #D6DEE5",
    fontSize: 15
  },
  sendButton: {
    width: 52,
    background: "#4C8BF5",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 18,
    cursor: "pointer"
  },

  emptyChat: {
    margin: "auto",
    fontSize: 20,
    color: "#9AA5B1"
  }
};
