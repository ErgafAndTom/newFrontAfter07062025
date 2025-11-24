import React, { useEffect, useState, useRef } from "react";

// backend proxied через package.json: "proxy": "http://localhost:5555"
const API = "/api/telegram";

export default function TelegramBot() {
  const [status, setStatus] = useState("red");
  const [lastUpdate, setLastUpdate] = useState(0);

  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);

  // инфо о боте (заполним фейково, пока нет API)
  const [botInfo, setBotInfo] = useState({
    name: "Telegram Bot",
    username: "bot"
  });

  const [searchInput, setSearchInput] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // ===== LONGPOLL какая-то магия =====
  useEffect(() => {
    let mounted = true;

    async function poll() {
      while (mounted) {
        try {
          const res = await fetch(`${API}/updates`);
          const json = await res.json();

          if (json.updates && json.updates.length > 0) {
            json.updates.forEach((u) => {
              const username = u.username;
              const text = u.text;

              setChats((prev) => {
                let c = prev.find((x) => x.username === username);

                if (!c) {
                  return [
                    ...prev,
                    {
                      username,
                      messages: [{ sender: "them", text }]
                    }
                  ];
                }

                return prev.map((chat) =>
                  chat.username === username
                    ? {
                      ...chat,
                      messages: [...chat.messages, { sender: "them", text }]
                    }
                    : chat
                );
              });

              setLastUpdate(Date.now());
              scrollToBottom();
            });
          }
        } catch (e) {
          console.error("LongPoll error:", e);
        }

        await new Promise((r) => setTimeout(r, 500));
      }
    }

    poll();

    return () => {
      mounted = false;
    };
  }, []);

  // ===== БЛОК СТАТУСА =====
  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastUpdate) {
        setStatus("red");
        return;
      }
      const diff = Date.now() - lastUpdate;
      if (diff < 1500) setStatus("green");
      else if (diff < 5000) setStatus("yellow");
      else setStatus("red");
    }, 700);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  // ===== ПОИСК/ДОБАВЛЕНИЕ ЧАТА =====
  const handleAddChat = (e) => {
    e.preventDefault();
    const username = searchInput.trim().toLowerCase();
    if (!username) return;

    setChats((prev) => {
      if (prev.find((c) => c.username === username)) return prev;

      return [...prev, { username, messages: [] }];
    });

    setCurrentChat(username);
    setSearchInput("");
  };

  // ===== ОТПРАВКА СООБЩЕНИЯ =====
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentChat || !messageInput.trim()) return;

    const text = messageInput;

    // локально добавили
    setChats((prev) =>
      prev.map((c) =>
        c.username === currentChat
          ? { ...c, messages: [...c.messages, { sender: "me", text }] }
          : c
      )
    );

    try {
      await fetch(`${API}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentChat,
          text
        })
      });
    } catch (err) {
      console.error("Send error:", err);
    }

    setMessageInput("");
    scrollToBottom();
  };

  const statusColor =
    status === "green" ? "#4CAF50" : status === "yellow" ? "#FBC02D" : "#F44336";

  const botInitial = botInfo.name[0]?.toUpperCase() || "B";

  return (
    <div style={styles.app}>
      {/* LEFT PANEL */}
      <div style={styles.leftPanel}>
        <div style={styles.leftHeader}>
          <div style={styles.botAvatar}>{botInitial}</div>

          <div style={styles.botMeta}>
            <div style={styles.botName}>{botInfo.name}</div>
            <div style={styles.botUsername}>@{botInfo.username}</div>
          </div>

          <div style={{ ...styles.statusDot, background: statusColor }} />
        </div>

        <form onSubmit={handleAddChat} style={styles.searchWrap}>
          <input
            style={styles.searchInput}
            value={searchInput}
            placeholder="Поиск или новый чат…"
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>

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
                {c.username[0]?.toUpperCase()}
              </div>

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
                ?.messages.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.messageBubble,
                      alignSelf: m.sender === "me" ? "flex-end" : "flex-start",
                      background:
                        m.sender === "me" ? "#D9FDD3" : "#FFFFFF"
                    }}
                  >
                    {m.text}
                  </div>
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
