import React, { useState, useEffect, useRef } from "react";
import axios from "../../api/axiosInstance";

import "./styles.css";
import TelegramAvatar from "../Messages/TelegramAvatar";
import Loader from "../../components/calc/Loader";

const API = "/api/telegramAkk";

export default function TelegramBotAkk() {
  const [authState, setAuthState] = useState("loading"); // loading → phone → code → password → ready
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [thisUser, setThisUser] = useState(null);

  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messageInput, setMessageInput] = useState("");

  const [status, setStatus] = useState("green");
  const [errorCount, setErrorCount] = useState(0);
  const [lastErrorType, setLastErrorType] = useState(null);

  const [connectionLogs, setConnectionLogs] = useState([]);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // ----------------------------------------------------------------------
  // 1) ПРОВЕРКА СЕССИИ ПРИ ЗАГРУЗКЕ
  // ----------------------------------------------------------------------
  useEffect(() => {
    async function checkLogin() {
      try {
        const { data: j } = await axios.get(API + "/login/statusFull");


        console.log(j);

        if (j.ready === true && j.state === "AUTHENTICATED") {
          setAuthState("ready");
          await loadInitial();
          return;
        }

        if (
          j.state === "CLIENT_NOT_READY" ||
          j.state === "NO_CLIENT" ||
          j.state === "SESSION_EXISTS_NOT_READY"
        ) {
          setTimeout(checkLogin, 600);
          return;
        }

        if (
          j.state === "NOT_AUTHENTICATED" ||
          j.state === "UNKNOWN_AUTH_ERROR"
        ) {
          setAuthState("phone");
          return;
        }

        if (j.state === "NO_DB_SESSION" || j.state === "DB_SESSION_EMPTY") {
          setAuthState("phone");
          return;
        }

        setAuthState("phone");
      } catch (e) {
        setAuthState("phone");
      }
    }

    checkLogin();
  }, []);

  // ----------------------------------------------------------------------
  // 2) Отправка телефона
  // ----------------------------------------------------------------------
  const sendPhone = async () => {
    const { data: j } = await axios.post(API + "/login/sendCode", { phone });

    if (j.ok) setAuthState("code");
    else alert(j.error);
  };

  // ----------------------------------------------------------------------
  // 3) Поллинг логов
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (authState === "ready") return;

    let mounted = true;

    async function pollLogs() {
      while (mounted) {
        try {
          const { data: j } = await axios.get(API + "/login/status");
          if (j.logs) setConnectionLogs(j.logs.slice(-200));
        } catch (e) {}
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    pollLogs();
    return () => (mounted = false);
  }, [authState]);

  // ----------------------------------------------------------------------
  // 4) Отправка кода
  // ----------------------------------------------------------------------
  const sendCodeVerify = async () => {
    const { data: j } = await axios.post(API + "/login/enterCode", { code });

    if (j.ok) {
      setAuthState("ready");
      loadInitial();
    } else if (j.error === "PASSWORD_NEEDED") {
      setAuthState("password");
    } else alert(j.error);
  };

  // ----------------------------------------------------------------------
  // 5) Отправка пароля 2FA
  // ----------------------------------------------------------------------
  const sendPassword = async () => {
    const { data: j } = await axios.post(API + "/login/password", { password });

    if (j.ok) {
      setAuthState("ready");
      setThisUser(j.user)
      loadInitial();
    } else alert(j.error);
  };

  // ----------------------------------------------------------------------
  // 6) Первичная загрузка чатов
  // ----------------------------------------------------------------------
  const loadInitial = async () => {
    const { data: json } = await axios.get(API + "/init");

    if (json?.chats) {
      const normalized = json.chats.map((c) => ({
        ...c,
        messages: c.messages || []
      }));
      setChats(normalized);
    }
  };

  // ----------------------------------------------------------------------
  // 7) ЛОНГПОЛЛ ОБНОВЛЕНИЙ
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (authState !== "ready") return;

    let mounted = true;

    async function poll() {
      while (mounted) {
        try {
          const res = await axios.get(API + "/updates");

          setStatus("green");
          setErrorCount(0);
          setLastErrorType(null);

          const json = res.data;

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
                      username: u.username,
                      chatId: u.chatId,
                      messages: [newMsg]
                    }
                  ];
                }

                return prev.map((c) =>
                  c.chatId === u.chatId
                    ? { ...c, messages: [...(c.messages || []), newMsg] }
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
    if (error?.code === "ECONNABORTED") return "timeout";
    if (error?.response?.status >= 500) return "5xx";
    if (error?.response?.status >= 400) return "4xx";
    return "network";
  };

  const fmtTime = (t) =>
    new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ----------------------------------------------------------------------
  // 8) ОТПРАВКА СООБЩЕНИЯ
  // ----------------------------------------------------------------------
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
          ? { ...c, messages: [...(c.messages || []), msg] }
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

  // ----------------------------------------------------------------------
  // 9) РЕНДЕР МЕССЕДЖА
  // ----------------------------------------------------------------------
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
          {m.mediaType === "photo" && (
            <img src={m.mediaUrl} alt="" style={{ width: 240, borderRadius: 10 }} />
          )}

          {m.mediaType === "document" && (
            <a href={m.mediaUrl} target="_blank" rel="noreferrer">
              📄 Скачать файл
            </a>
          )}

          {m.mediaType === "sticker" && (
            <img src={m.mediaUrl} alt="" style={{ width: 120, height: 120 }} />
          )}

          {m.text && <div>{m.text}</div>}

          <div className="telegramIntegration_timeLabel">
            {fmtTime(m.timestamp)}
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------------------------
  //                           AUTH UI
  // ----------------------------------------------------------------------
  if (authState === "loading") {
    return (
      <div className="telegramIntegration_app d-flex flex-column">
        <div className="telegramIntegration_emptyChat" style={{ margin: "0" }}>
          <h1 className="d-flex justify-content-center align-items-center">
            <Loader/>
          </h1>
          <div className="telegramIntegration_connectLog" style={{ margin: "0", height: "100%" }}>
            {connectionLogs?.join("\n")}
          </div>
        </div>
      </div>
    );
  }

  if (authState !== "ready") {
    return (
      <div className="telegramIntegration_app">
        <div className="telegramIntegration_emptyChat">
          {authState === "phone" && (
            <>
              <h3>Вход по номеру</h3>
              <input
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+380…"
              />
              <div className="d-flex align-content-between justify-content-between">
                <div
                  className="btn adminButtonAdd"
                  onClick={() => setPhone("+380937370071")}
                >
                  >+380937370071
                </div>
                <div
                  className="btn adminButtonAdd"
                  onClick={() => setPhone("+380975629025")}
                >
                  >+380975629025
                </div>
                <div className="btn adminButtonAdd" onClick={sendPhone}>
                  Отправить phone
                </div>
              </div>

              <div className="telegramIntegration_connectLog">
                {connectionLogs?.join("\n")}
              </div>
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

              <div className="telegramIntegration_connectLog">
                {connectionLogs?.join("\n")}
              </div>
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
                Отправить пароль
              </div>

              <div className="telegramIntegration_connectLog">
                {connectionLogs?.join("\n")}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  //                           MAIN UI
  // ----------------------------------------------------------------------
  return (
    <div className="telegramIntegration_app">
      {/* LEFT */}
      <div className="telegramIntegration_leftPanel">
        <div className="telegramIntegration_leftHeader">
          <div className="telegramIntegration_botAvatar">
            <TelegramAvatar link={thisUser?.username} size={45} defaultSrc="" />
          </div>

          <div className="telegramIntegration_botMeta">
            <div className="telegramIntegration_botName">Telegram Account</div>
            <div className="telegramIntegration_botUsername">@me</div>
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
            <div style={{ fontSize: 11, opacity: 0.7 }}>
              {errorCount === 0 ? "OK" : lastErrorType}
            </div>
          </div>
        </div>

        <div className="telegramIntegration_chatList">
          {chats.map((c) => (
            <div
              key={c.chatId}
              onClick={() => setCurrentChatId(c.chatId)}
              className="telegramIntegration_chatItem"
              style={{
                background: currentChatId === c.chatId ? "#E3EDF7" : "transparent"
              }}
            >
              <div className="telegramIntegration_chatAvatar">
                <TelegramAvatar link={c.username} size={45} defaultSrc="" />
              </div>

              <div className="telegramIntegration_chatMeta">
                <div className="telegramIntegration_chatName">{c.username}</div>
                <div className="telegramIntegration_chatLastMessage UsersOrdersLikeTable-contract-text">
                  {c.messages?.[c.messages?.length - 1]?.text || ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="telegramIntegration_rightPanel">
        {currentChatId ? (
          <>
            <div className="telegramIntegration_chatHeader">
              @{chats.find((x) => x.chatId === currentChatId)?.username}
            </div>

            <div className="telegramIntegration_messageContainer">
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
