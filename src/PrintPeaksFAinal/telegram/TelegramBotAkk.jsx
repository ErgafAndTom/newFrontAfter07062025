// ===============================================================
//   TelegramBotAkk — ПОЛНОСТЬЮ ИНТЕГРИРОВАННЫЙ КЛИЕНТ MTProto
// ===============================================================

import React, { useState, useEffect, useRef } from "react";
import axios from "../../api/axiosInstance";

import "./styles.css";
import TelegramAvatar from "../Messages/TelegramAvatar";
import Loader from "../../components/calc/Loader";

const API = "/api/telegramAkk";

export default function TelegramBotAkk() {
  // ===========================================================
  // STATE
  // ===========================================================
  const [authState, setAuthState] = useState("loading"); // loading, phone, code, password, ready
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  const [thisUser, setThisUser] = useState(null);

  const [chats, setChats] = useState([]);            // [{ chatId, username, title, messages: [...] }]
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messageInput, setMessageInput] = useState("");

  const [status, setStatus] = useState("green");
  const [errorCount, setErrorCount] = useState(0);
  const [lastErrorType, setLastErrorType] = useState(null);

  const [connectionLogs, setConnectionLogs] = useState([]);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // ===========================================================
  // 1) Проверка login при загрузке
  // ===========================================================
  useEffect(() => {
    async function checkLogin() {
      try {
        const { data: j } = await axios.get(API + "/login/statusFull");

        if (j.ready === true && j.state === "AUTHENTICATED") {
          setAuthState("ready");
          setThisUser(j.me);
          return;
        }

        // клиент инициализируется — пробуем снова
        if (
          j.state === "CLIENT_NOT_READY" ||
          j.state === "NO_CLIENT" ||
          j.state === "SESSION_EXISTS_NOT_READY"
        ) {
          setTimeout(checkLogin, 600);
          return;
        }

        // авторизации нет
        setAuthState("phone");
      } catch (err) {
        setAuthState("phone");
      }
    }

    checkLogin();
  }, []);

  // ===========================================================
  // 2) Поллинг логов (до авторизации)
  // ===========================================================
  useEffect(() => {
    if (authState === "ready") return;

    let mounted = true;

    async function pollLogs() {
      while (mounted) {
        try {
          const { data: j } = await axios.get(API + "/login/status");
          if (j?.logs) setConnectionLogs(j.logs.slice(-200));
        } catch (e) {}

        await new Promise((r) => setTimeout(r, 300));
      }
    }

    pollLogs();
    return () => (mounted = false);
  }, [authState]);

  const openChat = async (id) => {
    setCurrentChatId(id);

    // Загружаем историю
    const { data: j } = await axios.get(API + "/history", {
      params: { chatId: id, offsetId: 0, limit: 50 }
    });

    if (j.ok) {
      setChats((prev) =>
        prev.map((c) =>
          c.chatId === id
            ? {
              ...c,
              messages: j.messages  // ВСЕ сообщения из базы/Telegram
            }
            : c
        )
      );
    }

    scrollToBottom();
  };

  // ===========================================================
  // 3) Загрузка диалогов (БД → init)
  // ===========================================================
  useEffect(() => {
    if (authState !== "ready") return;

    async function load() {
      try {
        const { data: json } = await axios.get(API + "/init");

        if (json?.chats) {
          const normalized = json.chats.map((c) => ({
            chatId: c.chatId,
            username: c.username,
            title: c.title,
            messages: c.messages || [],

            // lastMessage пришёл из базы
            lastMessage: c.lastMessage || null
          }));

          setChats(normalized);
        }
      } catch (err) {
        console.log("loadInitial error:", err);
      }
    }

    load();
  }, [authState]);


  const onHistoryScroll = async (e) => {
    if (e.target.scrollTop > 50) return; // догружаем только наверху

    const chat = chats.find((c) => c.chatId === currentChatId);
    if (!chat || chat.messages.length === 0) return;

    const oldestMessage = chat.messages[0];
    const offsetId = oldestMessage.messageId;

    const { data: j } = await axios.get(API + "/history", {
      params: { chatId: currentChatId, offsetId, limit: 50 }
    });

    if (j.ok && j.messages.length > 0) {
      setChats((prev) =>
        prev.map((c) =>
          c.chatId === currentChatId
            ? {
              ...c,
              messages: [...j.messages, ...c.messages]
            }
            : c
        )
      );
    }
  };

  // ===========================================================
  // 4) login flows
  // ===========================================================
  const sendPhone = async () => {
    const { data: j } = await axios.post(API + "/login/sendCode", { phone });
    if (j.ok) setAuthState("code");
    else alert(j.error);
  };

  const sendCodeVerify = async () => {
    const { data: j } = await axios.post(API + "/login/enterCode", { code });
    if (j.ok) setAuthState("ready");
    else if (j.error === "PASSWORD_NEEDED") setAuthState("password");
    else alert(j.error);
  };

  const sendPassword = async () => {
    const { data: j } = await axios.post(API + "/login/password", { password });
    if (j.ok) {
      setAuthState("ready");
      setThisUser(j.user);
    } else alert(j.error);
  };

  // ===========================================================
  // 5) Long-poll /updates  → ВСЕГДА данные уже в БД
  // ===========================================================
  useEffect(() => {
    if (authState !== "ready") return;

    let mounted = true;

    async function poll() {
      while (mounted) {
        try {
          const res = await axios.get(API + "/updates");
          const json = res.data;

          setStatus("green");
          setErrorCount(0);
          setLastErrorType(null);

          // --------------------------------------------
          //  добавляем обновления в UI (данные уже в БД!)
          // --------------------------------------------
          if (json?.updates?.length > 0) {
            json.updates.forEach((u) => {
              const newMsg = {
                text: u.text,
                mediaType: u.mediaType,
                mediaUrl: u.mediaUrl,
                sender: u.sender,
                timestamp: u.timestamp
              };

              setChats((prev) => {
                const existing = prev.find((x) => x.chatId === u.chatId);

                if (!existing) {
                  return [
                    ...prev,
                    {
                      chatId: u.chatId,
                      username: u.username || "",
                      title: u.username || "",
                      messages: [newMsg],
                      lastMessage: newMsg
                    }
                  ];
                }

                return prev.map((c) =>
                  c.chatId === u.chatId
                    ? {
                      ...c,
                      messages: [...(c.messages || []), newMsg],
                      lastMessage: newMsg
                    }
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

        await new Promise((r) => setTimeout(r, 30));
      }
    }

    poll();
    return () => (mounted = false);
  }, [authState]);

  const detectErrorType = (error) => {
    if (error?.code === "ECONNABORTED") return "timeout";
    if (error?.response?.status >= 500) return "5xx";
    if (error?.response?.status >= 400) return "4xx";
    return "network";
  };

  const fmtTime = (t) =>
    new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ===========================================================
  // 6) Отправка сообщения
  // ===========================================================
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!currentChatId || !messageInput.trim()) return;

    // локально сразу рисуем (UI responsive)
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
          ? { ...c, messages: [...(c.messages || []), msg], lastMessage: msg }
          : c
      )
    );

    scrollToBottom();

    await axios.post(API + "/send", {
      chatId: currentChatId,
      text: messageInput
    });

    setMessageInput("");
  };

  // ===========================================================
  // 7) рендер сообщений
  // ===========================================================
  const renderMessage = (m) => {
    const isUser = m.sender === "me";

    return (
      <div
        style={{
          display: "flex",
          justifyContent: isUser ? "flex-end" : "flex-start",
          width: "100%"
        }}
      >
        <div
          className="telegramIntegration_messageBubble"
          style={{
            background: isUser ? "#D9FDD3" : "#FFFFFF",
            borderBottomRightRadius: isUser ? 4 : 14,
            borderBottomLeftRadius: isUser ? 14 : 4,
            marginLeft: isUser ? 40 : 0,
            marginRight: isUser ? 0 : 40
          }}
        >
          {m.text && <div>{m.text}</div>}
          <div className="telegramIntegration_timeLabel">
            {fmtTime(m.timestamp)}
          </div>
        </div>
      </div>
    );
  };

  // ===========================================================
  //            AUTH UI
  // ===========================================================
  if (authState !== "ready") {
    return (
      <div className="telegramIntegration_app">
        <div className="telegramIntegration_emptyChat">
          {authState === "loading" && (
            <>
              <Loader />
              <div className="telegramIntegration_connectLog">
                {connectionLogs.join("\n")}
              </div>
            </>
          )}

          {authState === "phone" && (
            <>
              <h3>Вход по номеру</h3>
              <input
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+380…"
              />
              <div className="btn adminButtonAdd" onClick={sendPhone}>
                Отправить phone
              </div>
              <pre className="telegramIntegration_connectLog">
                {connectionLogs.join("\n")}
              </pre>
            </>
          )}

          {authState === "code" && (
            <>
              <h3>Введите код</h3>
              <input
                className="form-control"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <div className="btn adminButtonAdd" onClick={sendCodeVerify}>
                Войти
              </div>
              <pre className="telegramIntegration_connectLog">
                {connectionLogs.join("\n")}
              </pre>
            </>
          )}

          {authState === "password" && (
            <>
              <h3>Введите пароль 2FA</h3>
              <input
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="btn adminButtonAdd" onClick={sendPassword}>
                Отправить
              </div>
              <pre className="telegramIntegration_connectLog">
                {connectionLogs.join("\n")}
              </pre>
            </>
          )}
        </div>
      </div>
    );
  }

  // ===========================================================
  //                    MAIN UI
  // ===========================================================

  return (
    <div className="telegramIntegration_app">
      {/* LEFT PANEL */}
      <div className="telegramIntegration_leftPanel">

        <div className="telegramIntegration_leftHeader">
          <div className="telegramIntegration_botAvatar">
            {thisUser && thisUser.username && (
              <TelegramAvatar
                link={thisUser.username}
                size={45}
                defaultSrc={thisUser.username[0]?.toUpperCase()}
              />
            )}
          </div>

          <div className="telegramIntegration_botMeta">
            <div className="telegramIntegration_botName">Telegram Account</div>
            <div className="telegramIntegration_botUsername">
              @{thisUser?.username}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              className="telegramIntegration_statusDot"
              style={{
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
            <div style={{ fontSize: 11 }}>{errorCount === 0 ? "OK" : lastErrorType}</div>
          </div>
        </div>

        <div className="telegramIntegration_chatList">
          {chats.map((c) => (
            <div
              key={c.chatId}
              onClick={() => openChat(c.chatId)}
              // onClick={() => setCurrentChatId(c.chatId)}
              className="telegramIntegration_chatItem"
              style={{
                background: currentChatId === c.chatId ? "#E3EDF7" : "transparent"
              }}
            >
              <div className="telegramIntegration_chatAvatar">
                <TelegramAvatar link={c.username} size={45} defaultSrc="" />
              </div>

              <div className="telegramIntegration_chatMeta">
                <div className="telegramIntegration_chatName">
                  {c.username || c.title}
                </div>

                <div className="telegramIntegration_chatLastMessage UsersOrdersLikeTable-contract-text">
                  {c.lastMessage?.text || ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="telegramIntegration_rightPanel">
        {currentChatId ? (
          <>
            <div className="telegramIntegration_chatHeader">
              @{chats.find((x) => x.chatId === currentChatId)?.username}
            </div>

            <div className="telegramIntegration_messageContainer">
              onScroll={onHistoryScroll}
              {chats
                .find((c) => c.chatId === currentChatId)
                ?.messages?.map((m, i) => <div key={i}>{renderMessage(m)}</div>)}

              <div ref={messagesEndRef} />
            </div>

            <form className="telegramIntegration_inputRow" onSubmit={sendMessage}>
              <input
                className="telegramIntegration_inputText"
                value={messageInput}
                placeholder="Сообщение…"
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button className="telegramIntegration_sendButton">➤</button>
            </form>
          </>
        ) : (
          <div className="telegramIntegration_emptyChat">Выберите чат</div>
        )}
      </div>
    </div>
  );
}
