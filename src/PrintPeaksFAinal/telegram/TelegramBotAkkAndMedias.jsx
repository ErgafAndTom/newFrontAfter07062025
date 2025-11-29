import React, { useState, useEffect, useRef } from "react";
import axios from "../../api/axiosInstance";

import "./styles.css";

// ГЛАВНЫЙ КОМПОНЕНТ РЕНДЕРА СООБЩЕНИЙ (модульный фреймворк)
import Message from "./Message";

// ПАРСЕР СООБЩЕНИЙ (будет создан файлом №2)
import { parseMessage } from "./messageParser";

// LOADER MEDiA (файл №3)
import { preloadMediaForMessages } from "./mediaLoader";

// Аватарка
import TelegramAvatar from "../Messages/TelegramAvatar";

import Loader from "../../components/calc/Loader";

const API = "/api/telegramAkk";

export default function TelegramBotAkkAndMedias() {
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

          // normalize chats
          let normalized = [];
          if (Array.isArray(j.chats)) {
            normalized = j.chats.map((c) => ({
              chatId: c.chatId ?? null,
              username: c.username ?? null,
              title: c.title ?? "",
              lastMessage: c.lastMessage ?? null,
              messages: []
            }));
          }

          setChats(normalized);

          await loadInitial();
          return;
        }

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
  // LOGS POLLING (до авторизации)
  // =====================================================================
  useEffect(() => {
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
  // SEND PHONE
  // =====================================================================
  const sendPhone = async () => {
    const { data: j } = await axios.post(API + "/login/sendCode", { phone });
    if (j.ok) setAuthState("code");
    else alert(j.error);
  };

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
  // LOAD /init
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
        messages: []
      }));
    }

    setChats(normalized);
  };

  // =====================================================================
  // OPEN CHAT
  // =====================================================================
  const handleOpenChat = async (chatId) => {
    setCurrentChatId(chatId);

    setChats((prev) =>
      prev.map((c) =>
        c.chatId === chatId ? { ...c, messages: [] } : c
      )
    );

    await loadChatHistory(chatId);
  };

  // =====================================================================
  // LOAD /history
  // =====================================================================
  const loadChatHistory = async (chatId) => {
    try {
      const { data: j } = await axios.post(API + `/history`, { chatId });

      if (!j.ok) return;

      // PARSE ALL RAW MESSAGES
      let parsed = j.messages.map((m) => parseMessage(m));

      // LOAD ALL MEDIA (MTProto file-loader)
      parsed = await preloadMediaForMessages(parsed);

      setChats((prev) =>
        prev.map((c) =>
          c.chatId === chatId ? { ...c, messages: parsed } : c
        )
      );

      scrollToBottom();
    } catch (err) {
      console.log("loadChatHistory error:", err);
    }
  };


  async function loadFileFromServer(info) {
    if (!info || !info.fileId || !info.accessHash || !info.fileReference) {
      return null;
    }

    try {
      const response = await axios.post(
        API + "/file",
        {
          type: info.type,
          fileId: info.fileId,
          accessHash: info.accessHash,
          fileReference: info.fileReference,
          dcId: info.dcId,
          mimeType: info.mimeType
        },
        {
          responseType: "arraybuffer"
        }
      );

      const mime = info.mimeType || "application/octet-stream";
      const blob = new Blob([response.data], { type: mime });
      const url = URL.createObjectURL(blob);

      return url;
    } catch (err) {
      console.log("loadFileFromServer error:", err);
      return null;
    }
  }

  /**
   * Определяет тип fileLocation из raw MTProto message и формирует объект info
   */
  function extractFileInfo(msg) {
    if (!msg || !msg.media) return null;

    // PHOTO
    if (msg.media.photo) {
      const photo = msg.media.photo;
      const size = photo.sizes?.slice(-1)[0];
      const loc = size?.location;

      if (!loc) return null;

      return {
        type: "photo",
        fileId: loc.volumeId ? loc.volumeId : loc.id,
        accessHash: loc.secret ?? loc.accessHash,
        fileReference: photo.fileReference ? Buffer.from(photo.fileReference).toString("base64") : null,
        dcId: loc.dcId,
        mimeType: "image/jpeg"
      };
    }

    // DOCUMENT (GIF, WEBP, VIDEO, AUDIO, STICKER, ANIMATION и т. д.)
    if (msg.media.document) {
      const doc = msg.media.document;

      let mime = "application/octet-stream";
      if (doc.mimeType) mime = doc.mimeType;

      return {
        type: "document",
        fileId: doc.id,
        accessHash: doc.accessHash,
        fileReference: doc.fileReference ? Buffer.from(doc.fileReference).toString("base64") : null,
        dcId: doc.dcId,
        mimeType: mime
      };
    }

    return null;
  }

  /**
   * Основная функция — обрабатывает массив сообщений
   */
  async function preloadMediaForMessages(messages) {
    const result = [];

    for (const msg of messages) {
      // если это текстовое сообщение — просто пропускаем
      if (!msg.raw) {
        result.push(msg);
        continue;
      }

      const m = msg.raw;

      const fileInfo = extractFileInfo(m);

      if (!fileInfo) {
        result.push(msg);
        continue;
      }

      const url = await loadFileFromServer(fileInfo);

      result.push({
        ...msg,
        mediaUrl: url,
        mediaType: fileInfo.type === "photo"
          ? "photo"
          : (fileInfo.mimeType?.includes("video") ? "video"
            : fileInfo.mimeType?.includes("audio") ? "audio"
              : fileInfo.mimeType?.includes("gif") ? "gif"
                : fileInfo.mimeType?.includes("webp") ? "sticker"
                  : "file")
      });
    }

    return result;
  }

  // =====================================================================
  // SEND MESSAGE
  // =====================================================================
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!currentChatId || !messageInput.trim()) return;

    const localMsg = {
      localTemporary: true,
      sender: "me",
      text: messageInput,
      timestamp: Date.now(),
      mediaType: "text",
      mediaUrl: null
    };

    setChats((prev) =>
      prev.map((c) =>
        c.chatId === currentChatId
          ? { ...c, messages: [...c.messages, localMsg] }
          : c
      )
    );

    scrollToBottom();

    try {
      await axios.post(API + "/send", {
        chatId: currentChatId,
        text: messageInput
      });
    } catch (err) {
      console.log("send error", err);
    }

    setMessageInput("");
  };

  // =====================================================================
  // RENDER UI (BEFORE AUTH)
  // =====================================================================

  if (authState === "loading") {
    return (
      <div className="telegramIntegration_app d-flex flex-column">
        <div className="telegramIntegration_emptyChat" style={{ margin: 0 }}>
          <h1 className="d-flex justify-content-center align-items-center">
            <Loader />
          </h1>
          <div
            className="telegramIntegration_connectLog"
            style={{ margin: 0, height: "100%" }}
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
  // MAIN UI (AFTER AUTH)
  // =====================================================================

  return (
    <div className="telegramIntegration_app">

      {/* LEFT PANEL */}
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
            <div className="telegramIntegration_botName">
              Telegram Account
            </div>

            <div className="telegramIntegration_botUsername">
              {thisUser?.username ? "@" + thisUser.username : ""}
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
            <div style={{ fontSize: 11, opacity: 0.7 }}>
              {errorCount === 0 ? "OK" : lastErrorType}
            </div>
          </div>
        </div>

        {/* CHAT LIST */}
        <div className="telegramIntegration_chatList">
          {chats.map((c) => (
            <div
              key={c.chatId}
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
                  style={{ width: "13vw" }}
                >
                  {c.lastMessage?.text ?? ""}
                </div>

                <div className="telegramIntegration_timeLabel">
                  {c.lastMessage?.date
                    ? new Date(c.lastMessage.date).toLocaleString()
                    : ""}
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
              {chats.find((x) => x.chatId === currentChatId)?.username
                ? "@" + chats.find((x) => x.chatId === currentChatId)?.username
                : chats.find((x) => x.chatId === currentChatId)?.title}
            </div>

            <div className="telegramIntegration_messageContainer">
              {chats
                .find((c) => c.chatId === currentChatId)
                ?.messages?.map((msg, i) => (
                  <Message key={i} msg={msg} />
                ))}

              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
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
              <button className="telegramIntegration_sendButton">
                ➤
              </button>
            </form>
          </>
        ) : (
          <div className="telegramIntegration_emptyChat">
            Выберите чат
          </div>
        )}
      </div>

    </div>
  );
}
