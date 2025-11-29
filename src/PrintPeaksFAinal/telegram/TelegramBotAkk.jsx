import React, { useState, useEffect, useRef } from "react";
import axios from "../../api/axiosInstance";
import "./styles.css";
import TelegramAvatar from "../Messages/TelegramAvatar";
import Loader from "../../components/calc/Loader";

const API = "/api/telegramAkk";

export default function TelegramBotAkk() {
  const [authState, setAuthState] = useState("loading");
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // =====================================================================
  // LOGIN STATUS CHECK
  // =====================================================================
  useEffect(() => {
    async function checkLogin() {
      try {
        const { data: j } = await axios.get(API + "/login/statusFull");
        console.log("statusFull:", j);

        if (j.ready === true && j.state === "AUTHENTICATED") {
          setAuthState("ready");
          setThisUser(j.me);


          let normalized = [];

          if (Array.isArray(j.chats)) {
            normalized = j.chats.map((c) => ({
              chatId: c.chatId ?? null,
              username: c.username ?? null,
              title: c.title ?? "",
              lastMessage: c.lastMessage ?? null,
              messages: c.messages ?? []
            }));
          }

          setChats(normalized);
          await loadInitial();
          return;
        }

        // Состояния, требующие ожидания
        if (
          j.state === "CLIENT_NOT_READY" ||
          j.state === "NO_CLIENT" ||
          j.state === "SESSION_EXISTS_NOT_READY"
        ) {
          setTimeout(checkLogin, 700);
          return;
        }

        setAuthState("phone");
      } catch (e) {
        console.log("statusFull error", e);
        setAuthState("phone");
      }
    }

    checkLogin();
  }, []);

  // =====================================================================
  // SEND PHONE
  // =====================================================================
  const sendPhone = async () => {
    const { data: j } = await axios.post(API + "/login/sendCode", { phone });
    if (j.ok) setAuthState("code");
    else alert(j.error);
  };

  // =====================================================================
  // LOGS POLLING (до авторизации)
  // =====================================================================
  useEffect(() => {
    // if (authState === "ready") return;
    let mounted = true;

    async function pollLogs() {
      while (mounted) {
        try {
          const { data: j } = await axios.get(API + "/login/status");
          if (j.logs) setConnectionLogs(j.logs.slice(-200));
        } catch {}
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    pollLogs();

    return () => (mounted = false);
  }, [authState]);

  // =====================================================================
  // SEND CODE
  // =====================================================================
  const sendCodeVerify = async () => {
    const { data: j } = await axios.post(API + "/login/enterCode", { code });
    if (j.ok) {
      setAuthState("ready");
      loadInitial();
    } else if (j.error === "PASSWORD_NEEDED") {
      setAuthState("password");
    } else alert(j.error);
  };

  // =====================================================================
  // SEND PASSWORD
  // =====================================================================
  const sendPassword = async () => {
    const { data: j } = await axios.post(API + "/login/password", { password });
    if (j.ok) {
      setAuthState("ready");
      setThisUser(j.user);
      loadInitial();
    } else alert(j.error);
  };

  // =====================================================================
  // LOAD INITIAL CHATS (/init)
  // =====================================================================
  const loadInitial = async () => {
    console.log("loadInitial start");
    const response = await axios.get(API + "/init");
    console.log("init response:", response.data);

    let json = response.data;

    if (!json?.ok) {
      console.log("init failed:", json.error);
      return;
    }

    let normalized = [];

    if (Array.isArray(json.chats)) {
      normalized = json.chats.map((c) => ({
        chatId: c.chatId ?? null,
        username: c.username ?? null,
        title: c.title ?? "",
        lastMessage: c.lastMessage ?? null,
        messages: c.messages ?? []
      }));
    }

    setChats(normalized);
  };


  const handleOpenChat = async (chatId) => {
    setCurrentChatId(chatId);

    // очищаем messages, чтобы не мигало
    setChats((prev) =>
      prev.map((c) =>
        c.chatId === chatId ? { ...c, messages: [] } : c
      )
    );

    await loadChatHistory(chatId);
  };


  const loadChatHistory = async (chatId) => {
    try {
      let dataToSend = {
        chatId: chatId,
      }
      const { data: j } = await axios.post(
        API + `/history`, dataToSend
      );
      console.log(j);

      if (!j.ok) return;
      const historyMsgs = (j.messages || []).map((m) => ({
        text: m.message ?? "",
        timestamp: (m.date ?? 0) * 1000,
        sender:
          m.out === true
            ? "me"
            : "them",
        mediaType: "text",
        mediaUrl: null
      }));

      // Вставляем историю в state
      setChats((prev) =>
        prev.map((c) =>
          c.chatId === chatId
            ? {
              ...c,
              messages: [...historyMsgs]
            }
            : c
        )
      );

      scrollToBottom();
    } catch (err) {
      console.log("loadChatHistory error:", err);
    }
  };

  // =====================================================================
  // LONG POLLING UPDATES
  // =====================================================================
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
                text: u.text ?? "",
                mediaType: u.mediaType ?? "text",
                mediaUrl: u.mediaUrl ?? null,
                sender: u.sender ?? "them",
                timestamp: u.timestamp ?? Date.now()
              };

              setChats((prev) => {
                const exists = prev.find((c) => c.chatId === u.chatId);
                if (!exists) {
                  return [
                    ...prev,
                    {
                      chatId: u.chatId,
                      username: "",
                      title: "",
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

        await new Promise((r) => setTimeout(r, 850));
      }
    }

    poll();
    return () => (mounted = false);
  }, [authState]);

  const detectErrorType = (error) => {
    if (error?.code === "ECONNABORTED") return "timeout";
    if (error?.response?.status) return error?.response?.status;
    return "network";
  };

  const fmtTime = (t) => {
    try {
      return new Date(t).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "";
    }
  };

  // =====================================================================
  // SEND MESSAGE
  // =====================================================================
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

    await axios.post(API + "/send", {
      chatId: currentChatId,
      text: messageInput
    });

    setMessageInput("");
  };

  // =====================================================================
  // RENDER MESSAGE
  // =====================================================================
  const renderMessage = (m) => {
    if (!m) return null;

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
            marginRight: isUser ? 0 : 40,
            // width: "9vw", maxWidth: "9vw"
          }}
        >
          {m.text && <div className="UsersOrdersLikeTable-contract-text">{m.text}</div>}
          <div className="telegramIntegration_timeLabel">
            {fmtTime(m.timestamp)}
          </div>
        </div>
      </div>
    );
  };

  // =====================================================================
  // RENDER UI
  // =====================================================================

  if (authState === "loading") {
    return (
      <div className="telegramIntegration_app d-flex flex-column">
        <div className="telegramIntegration_emptyChat" style={{ margin: "0" }}>
          <h1 className="d-flex justify-content-center align-items-center">
            <Loader />
          </h1>
          <div
            className="telegramIntegration_connectLog"
            style={{ margin: "0", height: "100%" }}
          >
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
                  +380937370071
                </div>
                <div
                  className="btn adminButtonAdd"
                  onClick={() => setPhone("+380975629025")}
                >
                  +380975629025
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

  // =====================================================================
  // MAIN UI
  // =====================================================================

  return (
    <div className="telegramIntegration_app">
      {/* LEFT */}
      <div className="telegramIntegration_leftPanel">
        <div className="telegramIntegration_leftHeader">
          <div className="telegramIntegration_botAvatar">
            {thisUser?.username && (
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
              {thisUser?.username ? "@" + thisUser.username : ""}
            </div>
            {/*<div className="adminButtonAdd" onClick={() => loadInitial()}>*/}
            {/*  loadInitial()*/}
            {/*</div>*/}
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

        {/*<div className="telegramIntegration_connectLog">*/}
        {/*  {connectionLogs?.join("\n")}*/}
        {/*</div>*/}

        {/* CHAT LIST */}
        <div className="telegramIntegration_chatList">
          {chats.map((c) => (
            <div
              key={c.chatId}
              // onClick={() => setCurrentChatId(c.chatId)}
              onClick={() => handleOpenChat(c.chatId)}
              className="telegramIntegration_chatItem"
              style={{
                background:
                  currentChatId === c.chatId ? "#E3EDF7" : "transparent"
              }}
            >
              <div className="telegramIntegration_chatAvatar">
                <TelegramAvatar
                  link={c.username}
                  size={45}
                  defaultSrc={(c.username?.[0] ?? c.title?.[0] ?? "").toUpperCase()}
                />
              </div>

              <div className="telegramIntegration_chatMeta">
                <div className="telegramIntegration_chatName">
                  {c.username || c.title || "Chat " + c.chatId}
                </div>

                <div
                  className="telegramIntegration_chatLastMessage UsersOrdersLikeTable-contract-text"
                  style={{
                    width: "13vw"
                  }}
                >
                  {c.messages?.[c.messages.length - 1]?.text ??
                    c.lastMessage?.text ??
                    ""}
                </div>

                <div className="telegramIntegration_timeLabel">
                  {new Date(c.lastMessage.date).toLocaleString()}
                  {/*{fmtTime(c.lastMessage.date)}*/}
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
              {chats.find((x) => x.chatId === currentChatId)?.username
                ? "@" + chats.find((x) => x.chatId === currentChatId)?.username
                : chats.find((x) => x.chatId === currentChatId)?.title}
            </div>

            <div className="telegramIntegration_messageContainer">
              {chats
                .find((c) => c.chatId === currentChatId)
                ?.messages?.map((m, i) => (
                  <div key={i}>{renderMessage(m)}</div>
                ))}
              <div ref={messagesEndRef} />
            </div>

            <form
              className="telegramIntegration_inputRow"
              onSubmit={sendMessage}
            >
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
