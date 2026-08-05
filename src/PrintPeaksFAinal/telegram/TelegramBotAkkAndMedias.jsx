import React, { useState, useEffect, useRef } from "react";
import axios from "../../api/axiosInstance";
import { Megaphone, Users, User } from "lucide-react";
import {FiLogOut, FiArrowDown, FiArrowUp} from "react-icons/fi";

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
  // Діалог підтвердження мітки 🤖: {kind, mark, payload, onLinked}
  const [markConfirm, setMarkConfirm] = useState(null);
  const [markResolving, setMarkResolving] = useState(false);
  const [viewMode, setViewMode] = useState("contacts");
  const [contacts, setContacts] = useState([]);
  const allContactsRef = useRef([]);
  const [contactsSearch, setContactsSearch] = useState("");
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState(null);
  const [contactsSort, setContactsSort] = useState("newest"); // "newest" | "oldest"
  const [authSending, setAuthSending] = useState(false);
  const [codeDelivery, setCodeDelivery] = useState(null); // {typeHuman, isCodeViaApp, canResend}
  const [resendCooldown, setResendCooldown] = useState(0);
  const [shareInfo, setShareInfo] = useState(null); // {hasOwnAccount, isOwnShared, sharedAccount}
  const [isSharedSession, setIsSharedSession] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const [qrExpiresIn, setQrExpiresIn] = useState(0);
  const qrPollingRef = useRef(false);
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

  // Ref щоб long-poll loop читав актуальний currentChatId без рестарту
  const currentChatIdRef = useRef(null);
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

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
          setIsSharedSession(!!j.isShared);
          loadShareInfo();

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
  // LOGS POLLING (тільки під час авторизації)
  // Після того як authState === "ready" — припиняємо, щоб не довбити бекенд
  // QR має свій власний polling — теж не запускаємо logs
  // =====================================================================
  useEffect(() => {
    if (authState === "ready" || authState === "loading" || authState === "qr") return;

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
    return () => (mounted = false);
  }, [authState]);

  // =====================================================================
  // REAL-TIME: long-poll /updates після авторизації
  // Бекенд тримає запит до 25с, повертає одразу як з'являється update.
  // Затримка доставки <1с, без агресивного polling.
  // =====================================================================
  useEffect(() => {
    if (authState !== "ready") return;
    let mounted = true;

    async function pollUpdates() {
      while (mounted) {
        try {
          const { data: j } = await axios.get(API + "/updates", { timeout: 35000 });
          if (!mounted) return;

          if (j.ok && Array.isArray(j.updates) && j.updates.length > 0) {
            // Групуємо updates по chatId щоб робити мінімум setChats викликів
            const byChat = new Map();
            for (const upd of j.updates) {
              const id = String(upd.chatId);
              if (!byChat.has(id)) byChat.set(id, []);
              byChat.get(id).push(upd);
            }

            setChats((prev) => {
              let next = prev;
              for (const [chatIdStr, updates] of byChat) {
                const idx = next.findIndex(c => String(c.chatId) === chatIdStr);
                if (idx === -1) continue; // невідомий чат — підтягнеться на наступному loadInitial

                const chat = next[idx];
                const lastUpd = updates[updates.length - 1];
                const newLastMessage = {
                  text: lastUpd.text || lastUpd.mediaType || "",
                  date: lastUpd.timestamp ? new Date(lastUpd.timestamp).getTime() : Date.now()
                };

                // Якщо чат відкритий — дописати повідомлення в кінець
                const isOpen = String(currentChatIdRef.current) === chatIdStr;
                const newMsgs = isOpen
                  ? updates.map(u => ({
                      sender: u.sender,
                      direction: u.sender === "me" ? "out" : "in",
                      text: u.text,
                      mediaType: u.mediaType,
                      mediaUrl: u.mediaUrl,
                      timestamp: u.timestamp ? new Date(u.timestamp).getTime() : Date.now(),
                      date: u.timestamp ? new Date(u.timestamp).getTime() : Date.now()
                    }))
                  : [];

                const updatedChat = {
                  ...chat,
                  lastMessage: newLastMessage,
                  messages: isOpen ? [...(chat.messages || []), ...newMsgs] : chat.messages
                };

                // Підняти чат нагору списку
                next = [updatedChat, ...next.slice(0, idx), ...next.slice(idx + 1)];
              }
              return next;
            });

            // Якщо відкритий чат отримав повідомлення — проскролити
            if (byChat.has(String(currentChatIdRef.current))) {
              setTimeout(scrollToBottom, 50);
            }
          }
        } catch (e) {
          if (!mounted) return;
          console.log("pollUpdates error:", e?.message || e);
          // Невелика пауза, щоб не довбити при NETWORK_ERROR
          await new Promise(r => setTimeout(r, 3000));
        }
      }
    }

    pollUpdates();
    return () => { mounted = false; };
  }, [authState]);

  // =====================================================================
  // SEND PHONE
  // =====================================================================
  const sendPhone = async (opts = {}) => {
    setAuthSending(true);
    try {
      const { data: j } = await axios.post(API + "/login/sendCode", { phone, forceSMS: !!opts.forceSMS });
      if (j.ok) {
        setAuthState("code");
        setCodeDelivery({
          typeHuman: j.typeHuman,
          isCodeViaApp: j.isCodeViaApp,
          canResend: j.canResend !== false
        });
        // ResendCode дозволений раз на 60с щоб не злити Telegram
        setResendCooldown(60);
      } else if (j.error === "RATE_LIMIT") {
        alert(j.message || "Зачекай перед повторним запитом");
        setResendCooldown(j.waitSec || 60);
      } else if (j.error === "FLOOD_WAIT") {
        alert(j.message);
      } else {
        alert(j.error);
      }
    } catch (e) { alert(e.message); }
    setAuthSending(false);
  };

  // ── SHARE: завантажити інфо про спільний доступ
  const loadShareInfo = async () => {
    try {
      const { data: j } = await axios.get(API + "/share");
      if (j.ok) setShareInfo(j);
    } catch (e) { console.log("loadShareInfo error:", e); }
  };

  const toggleShare = async () => {
    if (!shareInfo) return;
    const next = !shareInfo.isOwnShared;
    const msg = next
      ? "Включити спільний доступ? Усі ERP-юзери без власного Telegram зможуть бачити твої чати, контакти і відправляти повідомлення від твого імені."
      : "Виключити спільний доступ? Інші юзери більше не зможуть користуватись твоїм Telegram.";
    if (!window.confirm(msg)) return;

    try {
      const { data: j } = await axios.post(API + "/share", { shared: next });
      if (j.ok) {
        setShareInfo(prev => ({ ...prev, isOwnShared: j.isShared }));
      } else {
        alert(j.message || j.error);
      }
    } catch (e) { alert(e.message); }
  };

  // ── RESEND через інший канал (Api.auth.ResendCode)
  const resendCode = async () => {
    setAuthSending(true);
    try {
      const { data: j } = await axios.post(API + "/login/resendCode");
      if (j.ok) {
        setCodeDelivery(prev => ({
          ...(prev || {}),
          typeHuman: j.typeHuman || prev?.typeHuman,
          canResend: true
        }));
        if (j.timeout) setResendCooldown(j.timeout);
        else setResendCooldown(60);
      } else if (j.error === "FLOOD_WAIT") {
        alert(j.message);
      } else if (j.error === "SEND_CODE_UNAVAILABLE") {
        // Telegram заборонив зміну каналу — більше не показуємо кнопку Resend
        setCodeDelivery(prev => ({ ...(prev || {}), canResend: false }));
        alert(j.message);
      } else if (j.error === "PHONE_CODE_EXPIRED") {
        setAuthState("phone");
        setCodeDelivery(null);
        alert(j.message);
      } else {
        alert(j.message || j.error || "Не вдалось перевідправити");
      }
    } catch (e) { alert(e.message); }
    setAuthSending(false);
  };

  // ── QR-LOGIN: оминає sendCode цілком, юзер сканує QR з телефону
  const startQrLogin = async () => {
    setAuthSending(true);
    try {
      const { data: j } = await axios.post(API + "/login/qrStart");
      if (j.ok) {
        setQrUrl(j.qrUrl);
        setQrExpiresIn(j.expiresIn || 30);
        setAuthState("qr");
        if (!qrPollingRef.current) {
          qrPollingRef.current = true;
          pollQrStatus();
        }
      } else {
        alert(j.message || j.error || "Не вдалось почати QR-логін");
      }
    } catch (e) { alert(e.message); }
    setAuthSending(false);
  };

  const pollQrStatus = async () => {
    while (qrPollingRef.current) {
      try {
        const { data: j } = await axios.get(API + "/login/qrPoll");
        if (!qrPollingRef.current) return;

        if (j.ok && j.status === "waiting") {
          if (j.qrUrl) setQrUrl(j.qrUrl);
          if (j.expiresIn) setQrExpiresIn(j.expiresIn);
        } else if (j.ok && j.status === "password_needed") {
          qrPollingRef.current = false;
          setAuthState("password");
          alert("Потрібен пароль 2FA");
          return;
        } else if (j.ok && j.status === "success") {
          qrPollingRef.current = false;
          setAuthState("ready");
          setThisUser(j.me);
          setQrUrl(null);
          loadShareInfo();
          await loadInitial();
          return;
        } else if (!j.ok) {
          qrPollingRef.current = false;
          alert("QR-помилка: " + (j.message || j.error));
          setAuthState("phone");
          setQrUrl(null);
          return;
        }
      } catch (e) {
        console.log("qrPoll error:", e?.message);
      }
      await new Promise(r => setTimeout(r, 2500));
    }
  };

  const cancelQrLogin = () => {
    qrPollingRef.current = false;
    setQrUrl(null);
    setAuthState("phone");
  };

  // Декремент qr expires щосекунди
  useEffect(() => {
    if (qrExpiresIn <= 0 || !qrUrl) return;
    const t = setTimeout(() => setQrExpiresIn(s => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [qrExpiresIn, qrUrl]);

  // ── ІМПОРТ SESSION з .env (оминає sendCode/SignIn flow)
  const importEnvSession = async () => {
    if (!window.confirm("Імпортувати готову SESSION з .env? Це обійде логін через код.")) return;
    setAuthSending(true);
    try {
      const { data: j } = await axios.post(API + "/login/importEnvSession");
      if (j.ok) {
        alert(`Сесію імпортовано! Використано: ${j.usedCredentials}. Користувач: ${j.me.firstName || ""} ${j.me.lastName || ""} (@${j.me.username || ""}).`);
        setAuthState("ready");
        setThisUser(j.me);
        loadShareInfo();
        await loadInitial();
      } else {
        alert(j.message || j.error || "Не вдалось імпортувати");
      }
    } catch (e) { alert(e.message); }
    setAuthSending(false);
  };

  // Декремент cooldown щосекунди
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(s => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

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

    // Контакти вантажимо ПАРАЛЕЛЬНО — щоб падіння /init не залишало порожній екран
    loadContacts();

    try {
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
    } catch (e) {
      console.log("loadInitial error:", e);
    }
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
  // Спільний виклик add-to-erp. Якщо контакт має мітку 🤖:ID, яка вказує на
  // наявного клієнта — бекенд може попросити підтвердження замість створення
  // дубліката. Тоді показуємо діалог і чекаємо на рішення оператора.
  const sendAddToErp = async (payload, onLinked) => {
    const orderId = getCurrentOrderId();
    const { data: j } = await axios.post(API + "/contacts/add-to-erp", {
      ...payload,
      orderId: orderId || undefined
    });

    if (j.ok || j.error === "ALREADY_IN_ERP") {
      const erpId = j.ok ? j.erpUser.id : j.erpUserId;
      onLinked(erpId);
      if (j.order) {
        window.dispatchEvent(new CustomEvent('orderUserAssigned', { detail: j.order }));
      } else if (orderId) {
        assignUserToCurrentOrder(erpId);
      }
      return;
    }

    if (j.error === "MARK_NEEDS_CONFIRM" || j.error === "MARK_CONFLICT" || j.error === "MARK_REUSE_CONFIRM") {
      setMarkConfirm({ kind: j.error, mark: j.mark || {}, payload, onLinked });
      return;
    }

    alert("Помилка: " + j.error);
  };

  // Рішення оператора: прив'язати до клієнта з мітки або створити нового
  const resolveMarkConfirm = async (choice) => {
    if (!markConfirm) return;
    const { kind, payload, onLinked, mark } = markConfirm;
    setMarkConfirm(null);
    setMarkResolving(true);

    // "link" означає різне: для вільного номера — відновити клієнта під ним,
    // для зайнятого — прив'язати до наявного клієнта
    let decision = { ignoreMark: true };
    if (choice === "link") {
      decision = kind === "MARK_REUSE_CONFIRM"
        ? { reuseConfirmed: true }
        : { forceLinkErpId: mark.erpId };
    }

    try {
      await sendAddToErp({ ...payload, ...decision }, onLinked);
    } catch (e) {
      alert("Помилка мережі: " + e.message);
    } finally {
      setMarkResolving(false);
    }
  };

  const addToErp = async (chat) => {
    if (!chat.tgUserId || !chat.accessHash) return;
    setAddingToErp(chat.chatId);
    cancelPendingAvatars(); // Звільнити з'єднання для POST
    try {
      await sendAddToErp({
        tgUserId: chat.tgUserId,
        accessHash: chat.accessHash,
        firstName: chat.firstName,
        lastName: chat.lastName,
        username: chat.username,
        phone: chat.phone
      }, (erpId) => setErpSuccess(prev => ({ ...prev, [chat.chatId]: erpId })));
    } catch (e) {
      alert("Помилка мережі: " + e.message);
    } finally {
      setAddingToErp(null);
    }
  };

  // =====================================================================
  // LOAD CONTACTS
  // =====================================================================
  const sortContactsList = (list, sort) => {
    return sort === "newest" ? [...list].reverse() : [...list];
  };

  const loadContacts = async () => {
    setContactsLoading(true);
    setContactsError(null);
    try {
      const { data: j } = await axios.get(API + "/contacts");
      if (j.ok) {
        // API повертає в порядку додавання (oldest first)
        // зберігаємо оригінал (oldest) в ref, відображаємо за поточним сортуванням
        allContactsRef.current = j.contacts;
        setContacts(sortContactsList(j.contacts, contactsSort));
      } else {
        setContactsError(j.error || "UNKNOWN_ERROR");
      }
    } catch (e) {
      console.log("loadContacts error:", e);
      setContactsError(e.message || "NETWORK_ERROR");
    } finally {
      setContactsLoading(false);
    }
  };

  const toggleContactsSort = () => {
    const next = contactsSort === "newest" ? "oldest" : "newest";
    setContactsSort(next);
    const q = contactsSearch.trim().toLowerCase();
    let list = allContactsRef.current;
    if (q) {
      list = list.filter(ct =>
        (ct.firstName && ct.firstName.toLowerCase().includes(q)) ||
        (ct.lastName && ct.lastName.toLowerCase().includes(q)) ||
        (ct.username && ct.username.toLowerCase().includes(q)) ||
        (ct.phone && ct.phone.includes(contactsSearch.trim()))
      );
    }
    setContacts(sortContactsList(list, next));
  };

  const handleContactsSearch = (val) => {
    setContactsSearch(val);
    if (!val.trim()) {
      setContacts(sortContactsList(allContactsRef.current, contactsSort));
      return;
    }
    const q = val.toLowerCase();
    const filtered = allContactsRef.current.filter(ct =>
      (ct.firstName && ct.firstName.toLowerCase().includes(q)) ||
      (ct.lastName && ct.lastName.toLowerCase().includes(q)) ||
      (ct.username && ct.username.toLowerCase().includes(q)) ||
      (ct.phone && ct.phone.includes(val))
    );
    setContacts(sortContactsList(filtered, contactsSort));
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
      await sendAddToErp({
        tgUserId: ct.tgUserId,
        accessHash: ct.accessHash,
        firstName: ct.firstName,
        lastName: ct.lastName,
        username: ct.username,
        phone: ct.phone
      }, (erpId) => setContacts(prev => prev.map(c =>
        c.tgUserId === ct.tgUserId ? { ...c, erpUserId: erpId } : c
      )));
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
              <h3 style={{ fontWeight: 400, textAlign: "center", color: "var(--admingrey, #666)" }}>
                Вхід в Telegram
              </h3>
              <div style={{ textAlign: "center", color: "var(--admingrey, #666)", margin: "8px 0 24px", fontSize: "0.9em" }}>
                Натисни кнопку нижче — на наступному екрані з'явиться QR-код,<br />
                який треба відсканувати з вже залогіненого Telegram на телефоні.
              </div>

              {!authSending && (
                <div className="tg-auth-buttons">
                  <div
                    className="tg-auth-btn tg-auth-btn--primary"
                    onClick={startQrLogin}
                    style={{ background: "var(--adminlightgreen, #e2f2eb)" }}
                  >
                    <span className="tg-auth-btn-text" style={{ color: "var(--admingreen, #0e935b)", fontWeight: 600 }}>
                      УВІЙТИ ЧЕРЕЗ QR
                    </span>
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
              {codeDelivery && (
                <div style={{ textAlign: "center", color: "var(--admingrey, #666)", margin: "4px 0 8px", fontSize: "0.9em" }}>
                  Код надіслано: <b>{codeDelivery.typeHuman}</b>
                  {codeDelivery.isCodeViaApp && (
                    <div style={{ marginTop: 4, color: "var(--adminorange, #f5a623)" }}>
                      Якщо код не приходить — натисни "ІНШИЙ СПОСІБ" нижче
                    </div>
                  )}
                </div>
              )}
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
                  {codeDelivery?.canResend && (
                    <div
                      className="tg-auth-btn"
                      onClick={resendCooldown > 0 ? undefined : resendCode}
                      style={resendCooldown > 0 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                      title={resendCooldown > 0 ? `Доступно через ${resendCooldown}с` : "Спробувати інший канал"}
                    >
                      <span className="tg-auth-btn-text">
                        {resendCooldown > 0
                          ? `ІНШИЙ СПОСІБ (${resendCooldown}с)`
                          : "ІНШИЙ СПОСІБ"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="telegramIntegration_connectLog">
                {connectionLogs?.map((l, i) => (
                  <div key={i} style={l.includes('Потрібен пароль') ? {color: 'var(--adminred, #ee3c23)'} : undefined}>{l}</div>
                ))}
              </div>
            </>
          )}

          {authState === "qr" && (
            <>
              <h3 style={{ fontWeight: 400, textAlign: "center" }}>Відскануй QR-код</h3>
              <div style={{ textAlign: "center", color: "var(--admingrey, #666)", margin: "8px 0 16px", fontSize: "0.9em" }}>
                <div>1. Відкрий Telegram на телефоні</div>
                <div>2. Налаштування → Пристрої → Підключити пристрій</div>
                <div>3. Наведи камеру на QR нижче</div>
              </div>
              {qrUrl ? (
                <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=20&data=${encodeURIComponent(qrUrl)}`}
                    alt="QR Login"
                    style={{ width: 260, height: 260, background: "#fff", borderRadius: 8 }}
                  />
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: 30 }}><Loader /></div>
              )}
              {qrExpiresIn > 0 && (
                <div style={{ textAlign: "center", color: "var(--admingrey, #666)", fontSize: "0.85em" }}>
                  QR оновиться через {qrExpiresIn}с
                </div>
              )}
              <div className="tg-auth-buttons" style={{ marginTop: 16 }}>
                <div className="tg-auth-btn" onClick={cancelQrLogin}>
                  <span className="tg-auth-btn-text">СКАСУВАТИ</span>
                </div>
              </div>
              <div className="telegramIntegration_connectLog">
                {connectionLogs?.map((l, i) => (
                  <div key={i}>{l}</div>
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
            {isSharedSession && shareInfo?.sharedAccount && (
              <div style={{ fontSize: "0.75em", color: "var(--adminorange, #f5a623)" }}>
                Спільний доступ від {shareInfo.sharedAccount.ownerName || `user#${shareInfo.sharedAccount.ownerId}`}
              </div>
            )}
            {shareInfo?.isOwnShared && (
              <div style={{ fontSize: "0.75em", color: "var(--admingreen, #0e935b)" }}>
                Спільний доступ УВІМКНЕНО
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "stretch", gap: 0, marginLeft: "auto", height: 36, overflow: "hidden" }}>
            <button
              className="tg-sort-btn"
              title={contactsSort === "newest" ? "Спочатку нові" : "Спочатку старі"}
              onClick={toggleContactsSort}
            >
              <span className="flip-front">
                {contactsSort === "newest" ? <FiArrowDown /> : <FiArrowUp />}
              </span>
            </button>
            {shareInfo?.hasOwnAccount && (
              <button
                className="tg-sort-btn"
                title={shareInfo.isOwnShared ? "Вимкнути спільний доступ" : "Увімкнути спільний доступ для інших ERP-юзерів"}
                onClick={toggleShare}
                style={{ color: shareInfo.isOwnShared ? "var(--admingreen, #0e935b)" : "var(--admingrey, #666)" }}
              >
                <span className="flip-front" style={{ fontSize: 18 }}>
                  {shareInfo.isOwnShared ? "👥" : "👤"}
                </span>
              </button>
            )}
            {!isSharedSession && (
              <button
                className="tg-logout-btn"
                title="Вийти з Telegram"
                onClick={async () => {
                  if (!window.confirm("Вийти з Telegram акаунту?")) return;
                  try {
                    const { data: j } = await axios.post(API + "/logout");
                    if (j && j.ok === false) {
                      alert(j.message || j.error);
                      return;
                    }
                    setAuthState("phone");
                    setChats([]);
                    setCurrentChatId(null);
                    setThisUser(null);
                    setShareInfo(null);
                  } catch (e) {
                    alert("Помилка: " + e.message);
                  }
                }}
              >
                <span className="flip-front"><FiLogOut /></span>
              </button>
            )}
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
            {!contactsLoading && contactsError && (
              <div className="tg-contacts-error" style={{ padding: "1rem", textAlign: "center", color: "var(--adminred, #ee3c23)" }}>
                <div style={{ marginBottom: 8 }}>Не вдалось завантажити контакти: {contactsError}</div>
                <div className="tg-auth-btn tg-auth-btn--primary" style={{ display: "inline-block", cursor: "pointer" }} onClick={loadContacts}>
                  <span className="tg-auth-btn-text">Перезавантажити</span>
                </div>
              </div>
            )}
            {!contactsLoading && !contactsError && contacts.length === 0 && (
              <div className="tg-contacts-empty" style={{ padding: "1rem", textAlign: "center", color: "var(--admingrey, #666)" }}>
                <div style={{ marginBottom: 8 }}>Контактів не знайдено</div>
                <div className="tg-auth-btn" style={{ display: "inline-block", cursor: "pointer" }} onClick={loadContacts}>
                  <span className="tg-auth-btn-text">Перезавантажити</span>
                </div>
              </div>
            )}
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
                  {!ct.erpUserId && ct.markErpId ? (
                    <span
                      className="tg-contact-mark"
                      title={`В імені контакту є мітка ERP №${ct.markErpId}${ct.markVchasno ? " з ознакою Вчасно" : ""}, але зв'язку в базі немає`}
                    >
                      {ct.markVchasno ? "🔑 " : ""}🤖 №{ct.markErpId}
                    </span>
                  ) : null}
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
                    if (!ct.erpUserId && addingContactToErp !== ct.tgUserId && !markResolving) addToErpFromContacts(ct);
                  }}
                >
                  <span className="flip-front">
                    {addingContactToErp === ct.tgUserId
                      ? "Додаю клієнта..."
                      : ct.erpUserId
                        ? `ID клієнта №${ct.erpUserId}`
                        : ct.markErpId
                          ? `Відновити зв'язок №${ct.markErpId}`
                          : "Додати до ERP"}
                  </span>
                </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {markConfirm && (
        <div className="tg-mark-overlay" onClick={() => setMarkConfirm(null)}>
          <div className="tg-mark-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tg-mark-title">
              {markConfirm.kind === "MARK_CONFLICT"
                ? "Мітка вказує на зайнятого клієнта"
                : markConfirm.kind === "MARK_REUSE_CONFIRM"
                  ? `Відновити клієнта під номером №${markConfirm.mark.erpId}?`
                  : "Контакт уже має мітку ERP"}
            </div>

            <div className="tg-mark-note">
              {markConfirm.kind === "MARK_CONFLICT"
                ? `Клієнт №${markConfirm.mark.erpId} уже прив'язаний до іншого Telegram-акаунта. Прив'язати до нього цей контакт не можна.`
                : markConfirm.kind === "MARK_REUSE_CONFIRM"
                  ? `Клієнта №${markConfirm.mark.erpId} у базі немає, номер вільний. Але до нього прив'язано замовлень: ${markConfirm.mark.orphanOrders}. Якщо це той самий клієнт — історія повернеться до нього. Якщо ні — чужі замовлення приліпляться до нового клієнта.`
                  : `В імені контакту стоїть мітка 🤖:${markConfirm.mark.erpId}, але дані не збігаються з клієнтом №${markConfirm.mark.erpId}. Це може бути той самий клієнт зі зміненим іменем — або зовсім інша людина, якщо ID зсунулись.`}
            </div>

            {markConfirm.mark.vchasnoFromMark && (
              <div className="tg-mark-note tg-mark-note--vchasno">
                🔑 У назві контакту є ознака «Вчасно» — клієнту буде увімкнено цей прапорець.
              </div>
            )}

            <div className="tg-mark-compare">
              <div className="tg-mark-col">
                <div className="tg-mark-col-head">Контакт у Telegram</div>
                <div className="tg-mark-value">{markConfirm.mark.contactName || "—"}</div>
                <div className="tg-mark-sub">
                  {markConfirm.payload.username ? `@${markConfirm.payload.username}` : ""}
                </div>
                <div className="tg-mark-sub">{markConfirm.mark.contactPhone || ""}</div>
              </div>

              {markConfirm.kind === "MARK_REUSE_CONFIRM" ? (
                <div className="tg-mark-col">
                  <div className="tg-mark-col-head">Номер №{markConfirm.mark.erpId} в ERP</div>
                  <div className="tg-mark-value">Клієнта немає — номер вільний</div>
                  <div className="tg-mark-sub">
                    Замовлень на цьому номері: {markConfirm.mark.orphanOrders}
                  </div>
                </div>
              ) : (
                <div className="tg-mark-col">
                  <div className="tg-mark-col-head">Клієнт №{markConfirm.mark.erpId} в ERP</div>
                  <div className="tg-mark-value">{markConfirm.mark.name || "—"}</div>
                  <div className="tg-mark-sub">
                    {markConfirm.mark.tgUsername ? `${markConfirm.mark.tgUsername}` : ""}
                  </div>
                  <div className="tg-mark-sub">{markConfirm.mark.phone || ""}</div>
                </div>
              )}
            </div>

            <div className="tg-mark-actions">
              {markConfirm.kind !== "MARK_CONFLICT" && (
                <div
                  className="tg-mark-btn tg-mark-btn--link"
                  onClick={() => resolveMarkConfirm("link")}
                >
                  {markConfirm.kind === "MARK_REUSE_CONFIRM"
                    ? `Відновити під №${markConfirm.mark.erpId}`
                    : `Це він — прив'язати до №${markConfirm.mark.erpId}`}
                </div>
              )}
              <div
                className="tg-mark-btn tg-mark-btn--new"
                onClick={() => resolveMarkConfirm("new")}
              >
                {markConfirm.kind === "MARK_REUSE_CONFIRM"
                  ? "Створити нового (новий номер)"
                  : "Створити нового клієнта"}
              </div>
              <div
                className="tg-mark-btn tg-mark-btn--cancel"
                onClick={() => setMarkConfirm(null)}
              >
                Скасувати
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
