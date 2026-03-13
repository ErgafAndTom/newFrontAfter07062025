import React, { useState, useEffect, useRef } from "react";
import axios from "../../api/axiosInstance";
import { Megaphone, Users, User } from "lucide-react";
import {FiLogOut} from "react-icons/fi";

import "./styles.css";

// ГЛАВНЫЙ КОМПОНЕНТ РЕНДЕРА СООБЩЕНИЙ (модульный фреймворк)
import Message from "./Message";

// ПАРСЕР СООБЩЕНИЙ (будет создан файлом №2)
import { parseMessage } from "./messageParser";

// LOADER MEDiA (файл №3)
import { preloadMediaForMessages, preloadMediaForMessage } from "./mediaLoader";

// Аватарка
import TelegramAvatar from "../Messages/TelegramAvatar";
import noAvatarSvg from "../Messages/noAvatar.svg";

import Loader from "../../components/calc/Loader";
import {normalizeTelegramMessage} from "./dop/tgNormalizeMessage";

const API = "/api/telegramAkk";

// Черга аватарок — максимум 2 одночасно, щоб не блокувати інші запити
const avatarQueue = { pending: [], active: 0, MAX: 2 };
function enqueueAvatar(fn) {
  return new Promise((resolve) => {
    const run = () => { avatarQueue.active++; fn().finally(() => { avatarQueue.active--; const next = avatarQueue.pending.shift(); if (next) next(); }).then(resolve); };
    if (avatarQueue.active < avatarQueue.MAX) run();
    else avatarQueue.pending.push(run);
  });
}
// Скасувати всі аватарки, що чекають у черзі
export function cancelPendingAvatars() {
  avatarQueue.pending.length = 0;
}

function ContactAvatar({ tgUserId, accessHash, alt, size = 64 }) {
  const [src, setSrc] = useState(noAvatarSvg);
  useEffect(() => {
    const controller = new AbortController();
    enqueueAvatar(() =>
      axios.get(API + `/contacts/avatar/${tgUserId}${accessHash ? `?ah=${accessHash}` : ""}`, {
        responseType: "blob",
        signal: controller.signal
      })
      .then(res => { if (!controller.signal.aborted) setSrc(URL.createObjectURL(res.data)); })
      .catch(() => {})
    );
    return () => controller.abort();
  }, [tgUserId, accessHash]);
  return (
    <img
      src={src}
      alt={alt || ""}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
    />
  );
}

function formatPhone(phone) {
  if (!phone) return "";
  const d = phone.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("38")) {
    return `+38 (${d.slice(2, 5)}) ${d.slice(5, 8)}-${d.slice(8, 10)}-${d.slice(10, 12)}`;
  }
  if (d.length === 10 && d.startsWith("0")) {
    return `+38 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8, 10)}`;
  }
  return phone.startsWith("+") ? phone : "+" + phone;
}

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

  // ── ERP contact integration ──
  const [addingToErp, setAddingToErp] = useState(null);
  const [addingContactToErp, setAddingContactToErp] = useState(null);
  const [erpSuccess, setErpSuccess] = useState({});
  const [viewMode, setViewMode] = useState("contacts");
  const [contacts, setContacts] = useState([]);
  const allContactsRef = useRef([]);
  const [contactsSearch, setContactsSearch] = useState("");
  const [contactsLoading, setContactsLoading] = useState(false);
  const [authSending, setAuthSending] = useState(false);
  const contactsSearchTimer = useRef(null);

  const [connectionLogs, setConnectionLogs] = useState([]);
  const [initProgress, setInitProgress] = useState({
    stage: "idle",
    percent: 0,
    details: "",
    current: 0,
    total: 0
  });

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
              tgUserId: c.tgUserId ?? null,
              accessHash: c.accessHash ?? null,
              firstName: c.firstName ?? null,
              lastName: c.lastName ?? null,
              phone: c.phone ?? null,
              isUser: c.isUser ?? false,
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
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    pollLogs();

    async function pollLogs2() {
      while (mounted) {
        try {
          const { data: j2 } = await axios.get(API + "/login/statusInitProgress");
          if (j2.initProgress) {
            setInitProgress({
              ...initProgress,
              stage: j2.initProgress.stage || initProgress.stage,         // название текущего этапа
              current: j2.initProgress.current || initProgress.current,            // сколько итераций выполнено
              total: j2.initProgress.total || initProgress.total,              // всего итераций
              percent: j2.initProgress.percent || initProgress.percent,            // %
              details: j2.initProgress.details || initProgress.details
            });
          }

        } catch {}
        await new Promise((r) => setTimeout(r, 30));
      }
    }

    pollLogs2();
    return () => (mounted = false);
  }, [authState]);

  // =====================================================================
  // SEND PHONE
  // =====================================================================
  const sendPhone = async () => {
    setAuthSending(true);
    try {
      const { data: j } = await axios.post(API + "/login/sendCode", { phone });
      if (j.ok) setAuthState("code");
      else alert(j.error);
    } catch (e) { alert(e.message); }
    setAuthSending(false);
  };

  // =====================================================================
  // SEND CODE
  // =====================================================================
  const sendCodeVerify = async () => {
    setAuthSending(true);
    try {
      const { data: j } = await axios.post(API + "/login/enterCode", { code });
      if (j.ok) {
        setAuthState("ready");
        loadInitial();
      } else if (j.error === "PASSWORD_NEEDED") {
        setAuthState("password");
      } else alert(j.error);
    } catch (e) { alert(e.message); }
    setAuthSending(false);
  };

  // =====================================================================
  // SEND PASSWORD
  // =====================================================================
  const sendPassword = async () => {
    setAuthSending(true);
    try {
      const { data: j } = await axios.post(API + "/login/password", { password });
      if (j.ok) {
        setAuthState("ready");
        setThisUser(j.user);
        loadInitial();
      } else alert(j.error);
    } catch (e) { alert(e.message); }
    setAuthSending(false);
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
        ...c,
        chatId: c.chatId ?? null,
        username: c.username ?? null,
        title: c.title ?? "",
        tgUserId: c.tgUserId ?? null,
        accessHash: c.accessHash ?? null,
        firstName: c.firstName ?? null,
        lastName: c.lastName ?? null,
        phone: c.phone ?? null,
        isUser: c.isUser ?? false,
        lastMessage: c.lastMessage ?? null,
        messages: []
      }));
    }

    setChats(normalized);
    loadContacts();
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
      // let parsed = j.messages.map((m) => parseMessage(m));
      let parsed = j.messages.map((m) => normalizeTelegramMessage(m));

      // LOAD ALL MEDIA (MTProto file-loader)
      let parsedAndMedia = await preloadMediaForMessages(parsed);

      setChats((prev) =>
        prev.map((c) =>
          c.chatId === chatId ? { ...c, messages: parsedAndMedia } : c
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
  // async function preloadMediaForMessages(messages) {
  //   const result = [];
  //
  //   for (const msg of messages) {
  //     // если это текстовое сообщение — просто пропускаем
  //     if (!msg.raw) {
  //       result.push(msg);
  //       continue;
  //     }
  //
  //     const m = msg.raw;
  //
  //     const fileInfo = extractFileInfo(m);
  //
  //     if (!fileInfo) {
  //       result.push(msg);
  //       continue;
  //     }
  //
  //     const url = await loadFileFromServer(fileInfo);
  //
  //     result.push({
  //       ...msg,
  //       mediaUrl: url,
  //       mediaType: fileInfo.type === "photo"
  //         ? "photo"
  //         : (fileInfo.mimeType?.includes("video") ? "video"
  //           : fileInfo.mimeType?.includes("audio") ? "audio"
  //             : fileInfo.mimeType?.includes("gif") ? "gif"
  //               : fileInfo.mimeType?.includes("webp") ? "sticker"
  //                 : "file")
  //     });
  //   }
  //
  //   return result;
  // }

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
  // ADD TO ERP (from chat list)
  // =====================================================================
  const addToErp = async (chat) => {
    if (!chat.tgUserId || !chat.accessHash) return;
    setAddingToErp(chat.chatId);
    cancelPendingAvatars(); // Звільнити з'єднання для POST
    try {
      const orderId = getCurrentOrderId();
      const { data: j } = await axios.post(API + "/contacts/add-to-erp", {
        tgUserId: chat.tgUserId,
        accessHash: chat.accessHash,
        firstName: chat.firstName,
        lastName: chat.lastName,
        username: chat.username,
        phone: chat.phone,
        orderId: orderId || undefined
      });
      if (j.ok || j.error === "ALREADY_IN_ERP") {
        const erpId = j.ok ? j.erpUser.id : j.erpUserId;
        setErpSuccess(prev => ({ ...prev, [chat.chatId]: erpId }));
        if (j.order) {
          window.dispatchEvent(new CustomEvent('orderUserAssigned', { detail: j.order }));
        } else if (orderId) {
          assignUserToCurrentOrder(erpId);
        }
      } else {
        alert("Помилка: " + j.error);
      }
    } catch (e) {
      alert("Помилка мережі: " + e.message);
    } finally {
      setAddingToErp(null);
    }
  };

  // =====================================================================
  // LOAD CONTACTS
  // =====================================================================
  const loadContacts = async () => {
    setContactsLoading(true);
    try {
      const { data: j } = await axios.get(API + "/contacts");
      if (j.ok) {
        const reversed = [...j.contacts].reverse();
        allContactsRef.current = reversed;
        setContacts(reversed);
      }
    } catch (e) {
      console.log("loadContacts error:", e);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleContactsSearch = (val) => {
    setContactsSearch(val);
    if (!val.trim()) {
      setContacts(allContactsRef.current);
      return;
    }
    const q = val.toLowerCase();
    setContacts(allContactsRef.current.filter(ct =>
      (ct.firstName && ct.firstName.toLowerCase().includes(q)) ||
      (ct.lastName && ct.lastName.toLowerCase().includes(q)) ||
      (ct.username && ct.username.toLowerCase().includes(q)) ||
      (ct.phone && ct.phone.includes(val))
    ));
  };

  // =====================================================================
  // ADD TO ERP (from contacts panel)
  // =====================================================================
  // Визначаємо поточне замовлення з URL
  const getCurrentOrderId = () => {
    const m = window.location.pathname.match(/^\/Orders\/(\d+)/);
    return m ? Number(m[1]) : null;
  };

  // Прив'язати клієнта до поточного замовлення
  const assignUserToCurrentOrder = async (userId) => {
    const orderId = getCurrentOrderId();
    if (!orderId) return;
    try {
      const { data } = await axios.put("/api/orders/OneOrder/user", { orderId, userId });
      // Оновити замовлення без перезавантаження сторінки
      window.dispatchEvent(new CustomEvent('orderUserAssigned', { detail: data }));
    } catch (e) {
      console.error("Помилка прив'язки клієнта до замовлення:", e);
    }
  };

  const addToErpFromContacts = async (ct) => {
    if (!ct.tgUserId || !ct.accessHash) return;
    setAddingContactToErp(ct.tgUserId);
    cancelPendingAvatars(); // Звільнити з'єднання для POST
    try {
      const orderId = getCurrentOrderId();
      const { data: j } = await axios.post(API + "/contacts/add-to-erp", {
        tgUserId: ct.tgUserId,
        accessHash: ct.accessHash,
        firstName: ct.firstName,
        lastName: ct.lastName,
        username: ct.username,
        phone: ct.phone,
        orderId: orderId || undefined
      });
      if (j.ok || j.error === "ALREADY_IN_ERP") {
        const erpId = j.ok ? j.erpUser.id : j.erpUserId;
        setContacts(prev => prev.map(c =>
          c.tgUserId === ct.tgUserId ? { ...c, erpUserId: erpId } : c
        ));
        // Якщо бекенд повернув оновлене замовлення — оновити UI
        if (j.order) {
          window.dispatchEvent(new CustomEvent('orderUserAssigned', { detail: j.order }));
        } else if (orderId) {
          // Fallback: окремий запит (для старих версій бекенду)
          assignUserToCurrentOrder(erpId);
        }
      } else {
        alert("Помилка: " + j.error);
      }
    } catch (e) {
      alert("Помилка мережі: " + e.message);
    } finally {
      setAddingContactToErp(null);
    }
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
              <input
                className="tg-auth-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+380…"
              />

              {!authSending && (
                <div className="tg-auth-buttons">
                  <div className="tg-auth-btn" onClick={() => setPhone("+380677509676")}>
                    <span className="tg-auth-btn-text">+38 (067) 750-96-76</span>
                  </div>
                  <div className="tg-auth-btn tg-auth-btn--primary" onClick={sendPhone}>
                    <span className="tg-auth-btn-text">ВІДПРАВИТИ</span>
                  </div>
                </div>
              )}

              <div className="telegramIntegration_connectLog">
                {connectionLogs?.map((l, i) => (
                  <div key={i} style={l.includes('Потрібен пароль') ? {color: 'var(--adminred, #ee3c23)'} : undefined}>{l}</div>
                ))}
              </div>
            </>
          )}

          {authState === "code" && (
            <>
              <h3 style={{fontWeight: 400}}>Введіть код</h3>
              <input
                className="tg-auth-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              {!authSending && (
                <div className="tg-auth-buttons">
                  <div className="tg-auth-btn tg-auth-btn--primary" onClick={sendCodeVerify}>
                    <span className="tg-auth-btn-text">УВІЙТИ</span>
                  </div>
                </div>
              )}

              <div className="telegramIntegration_connectLog">
                {connectionLogs?.map((l, i) => (
                  <div key={i} style={l.includes('Потрібен пароль') ? {color: 'var(--adminred, #ee3c23)'} : undefined}>{l}</div>
                ))}
              </div>
            </>
          )}

          {authState === "password" && (
            <>
              <h3 style={{fontWeight: 400, color: 'var(--admingrey, #666)'}}>Введіть пароль Telegram</h3>
              <input
                className="tg-auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {!authSending && (
                <div className="tg-auth-buttons">
                  <div className="tg-auth-btn tg-auth-btn--primary" onClick={sendPassword}>
                    <span className="tg-auth-btn-text">ВІДПРАВИТИ</span>
                  </div>
                </div>
              )}

              <div className="telegramIntegration_connectLog">
                {connectionLogs?.map((l, i) => (
                  <div key={i} style={l.includes('Потрібен пароль') ? {color: 'var(--adminred, #ee3c23)'} : undefined}>{l}</div>
                ))}
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
          <div
            className="telegramIntegration_botAvatar"
            style={{ cursor: "pointer" }}
            title="Відкрити в Telegram Desktop"
            onClick={() => {
              if (thisUser?.username) {
                window.open(`tg://resolve?domain=${thisUser.username}`, "_self");
              }
            }}
          >
            {thisUser?.username && (
              <TelegramAvatar
                link={thisUser.username}
                size={45}
                defaultSrc={thisUser.username[0]?.toUpperCase()}
              />
            )}
          </div>

          <div className="telegramIntegration_botMeta">
            <div className="telegramIntegration_botUsername">
              {thisUser?.username ? "@" + thisUser.username : ""}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "stretch", gap: 0, marginLeft: "auto", height: 36, overflow: "hidden" }}>
            <button
              className="tg-logout-btn"
              title="Вийти з Telegram"
              onClick={async () => {
                if (!window.confirm("Вийти з Telegram акаунту?")) return;
                try {
                  await axios.post(API + "/logout");
                  setAuthState("phone");
                  setChats([]);
                  setCurrentChatId(null);
                  setThisUser(null);
                } catch (e) {
                  alert("Помилка: " + e.message);
                }
              }}
            >
              <span className="flip-front"><FiLogOut /></span>
            </button>
          </div>
        </div>


        <input
          className="tg-contacts-search"
          placeholder="Пошук контактів"
          value={contactsSearch}
          onChange={(e) => handleContactsSearch(e.target.value)}
        />

        {/* CHAT LIST / CONTACTS */}
        {viewMode === "chats" ? (
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
                    {c.rawJson?.isChannel && (
                      <Megaphone size={16} className="me-1"/>
                    )}
                    {c.rawJson?.isGroup && (
                      <Users size={16} className="me-1"/>
                    )}
                    {c.rawJson?.isUser && (
                      <User size={16} className="me-1"/>
                    )}
                    {c.rawJson?.name || c.rawJson?.title || c.title || "Chat " + c.chatId}
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

                {c.isUser && (
                  <div
                    className={`tg-add-erp-btn ${erpSuccess[c.chatId] ? "tg-add-erp-btn--done" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!erpSuccess[c.chatId]) addToErp(c);
                    }}
                  >
                    {addingToErp === c.chatId
                      ? "..."
                      : erpSuccess[c.chatId]
                        ? `ID клієнта №${erpSuccess[c.chatId]}`
                        : "Додати"}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="tg-contacts-panel">
            {contactsLoading && <div className="tg-contacts-loading">Завантаження...</div>}
            {contacts.map(ct => (
              <div key={ct.tgUserId} className="tg-contact-row">
                <div
                  className="telegramIntegration_chatAvatar"
                  style={{ cursor: "pointer" }}
                  title="Відкрити в Telegram Desktop"
                  onClick={() => {
                    if (ct.username) {
                      window.open(`tg://resolve?domain=${ct.username}`, "_self");
                    } else if (ct.phone) {
                      window.open(`tg://resolve?phone=${ct.phone.replace(/\D/g, "")}`, "_self");
                    }
                  }}
                >
                  <ContactAvatar tgUserId={ct.tgUserId} accessHash={ct.accessHash} alt={ct.firstName || ct.username || ""} size={64} />
                </div>
                <div className="tg-contact-name">
                  {[ct.firstName, ct.lastName].filter(Boolean).join(" ") || ct.username || ct.tgUserId}
                </div>
                <div className="tg-contact-username">
                  {ct.username ? `@${ct.username}` : ""}
                </div>
                <div className="tg-contact-phone">
                  {ct.phone ? formatPhone(ct.phone) : ""}
                </div>
                <div className="tg-add-erp-wrap">
                <div
                  className={`tg-add-erp-btn ${ct.erpUserId ? "tg-add-erp-btn--done" : ""} ${addingContactToErp === ct.tgUserId ? "tg-add-erp-btn--loading" : ""}`}
                  onClick={() => {
                    if (!ct.erpUserId && addingContactToErp !== ct.tgUserId) addToErpFromContacts(ct);
                  }}
                >
                  <span className="flip-front">
                    {addingContactToErp === ct.tgUserId
                      ? "Додаю клієнта..."
                      : ct.erpUserId
                        ? `ID клієнта №${ct.erpUserId}`
                        : "Додати до ERP"}
                  </span>
                </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>


    </div>
  );
}
