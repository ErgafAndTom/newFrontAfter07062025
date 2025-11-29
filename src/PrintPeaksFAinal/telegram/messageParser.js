// ============================================================
// messageParser.js
// Полный нормализатор Telegram RAW → Unified Message Model
// ============================================================

//
// Unified message format, который будет потребляться Message.jsx:
//
// {
//     id,
//     chatId,
//     direction: "in"|"out",
//     sender,
//     timestamp,
//     edited,
//     replyTo: { id, text, mediaPreview },
//     forward: { fromName, fromChat },
//     groupedId,
//     text,
//     entities: [],
//     mediaType: "photo"|"video"|"gif"|"document"|...,
//     media,
//     raw,
//     mediaUrl: null // заполняет mediaLoader.js
// }
//
// Все медиа-объекты остаются "сырыми". mediaLoader.js создаст URL.
//


// ===============================
// helper: safe getter
// ===============================
const get = (obj, path, def = null) => {
  try {
    return path.split(".").reduce((a, p) => a[p], obj) ?? def;
  } catch {
    return def;
  }
};


// ===============================
// MAIN EXPORT
// ===============================
export function parseMessage(raw) {
  if (!raw) return null;

  const unified = {
    id: raw.messageId ?? raw.id ?? null,
    chatId: raw.chatId ?? get(raw, "peerId.channelId") ?? get(raw, "peerId.userId") ?? null,
    direction: raw.out ? "out" : "in",
    sender: raw.out ? "me" : "them",
    timestamp: raw.date ? raw.date * 1000 : Date.now(),
    edited: raw.editDate ? raw.editDate * 1000 : null,

    text: extractText(raw),
    entities: extractEntities(raw),

    replyTo: extractReply(raw),
    forward: extractForward(raw),

    groupedId: raw.groupedId ?? null,

    mediaType: detectMediaType(raw),
    media: raw.media ?? null,

    raw, // сохраняем "как есть" для Message.jsx
    mediaUrl: null // будет заполнено mediaLoader.js
  };

  return unified;
}


// ============================================================
// extractText()
// ============================================================
function extractText(raw) {
  if (!raw) return "";

  // Telegram может прислать:
  // raw.message
  // raw.rawJson.message
  return raw.message ?? get(raw, "rawJson.message") ?? "";
}


// ============================================================
// extractEntities()
// Преобразуем Telegram Entities → удобный массив:
// [
//   { type: "bold", offset, length },
//   { type: "link", url, offset, length },
//   ...
// ]
// ============================================================
function extractEntities(raw) {
  const e = raw.entities ?? get(raw, "rawJson.entities") ?? [];

  return e.map((en) => {
    let type = en.className || en._;
    type = type.replace("MessageEntity", "").toLowerCase();

    return {
      type,
      offset: en.offset,
      length: en.length,
      url: en.url ?? null,
      userId: en.userId ?? null,
      language: en.language ?? null,
    };
  });
}


// ============================================================
// extractReply()
// ============================================================
function extractReply(raw) {
  const replyTo = raw.replyTo ?? get(raw, "rawJson.replyTo") ?? null;
  if (!replyTo) return null;

  const id = replyTo.replyToMsgId ?? replyTo.msgId ?? null;
  if (!id) return null;

  // Возможен preview в raw.replyMessage
  const preview = get(raw, "replyMessage") ?? null;

  return {
    id,
    text: preview?.message ?? "",
    mediaPreview: detectMediaPreview(preview),
  };
}


// ============================================================
// extractForward()
// ============================================================
function extractForward(raw) {
  const fwd = raw.fwdFrom ?? get(raw, "rawJson.fwdFrom");
  if (!fwd) return null;

  return {
    fromName:
      fwd.fromName ??
      get(fwd, "fromId.userId") ??
      get(fwd, "fromId.channelId") ??
      null,
    fromChat:
      fwd.fromName ??
      get(fwd, "fromId.channelId") ??
      null
  };
}


// ============================================================
// detectMediaType()
// ============================================================
function detectMediaType(raw) {
  if (!raw.media) return "text";

  const m = raw.media;

  if (m.photo) return "photo";
  if (m.webPage) return detectWebPageType(m.webPage);

  if (m.document) {
    const mime = m.document.mimeType ?? "";

    if (mime.startsWith("image/") && !mime.includes("webp"))
      return "document-image";

    if (mime === "image/webp") return "sticker";
    if (mime === "video/mp4" && hasGifAttribute(m.document)) return "gif";
    if (mime.startsWith("video/")) return "video";
    if (mime === "audio/ogg" && hasVoiceAttribute(m.document)) return "voice";

    return "document";
  }

  if (m.poll) return "poll";
  if (m.geo) return "location";
  if (m.contact) return "contact";
  if (m.dice) return "dice";

  return "unknown";
}


// ============================================================
// detectWebPageType()
// ============================================================
function detectWebPageType(page) {
  if (!page) return "webpage";

  if (page.photo && page.embedUrl) return "webpage-video";
  if (page.photo) return "webpage-photo";

  return "webpage";
}


// ============================================================
// detectMediaPreview() (для reply preview)
// ============================================================
function detectMediaPreview(m) {
  if (!m) return null;
  if (m.photo) return { type: "photo", photo: m.photo };
  if (m.document) return { type: "document", document: m.document };
  return null;
}


// ============================================================
// hasVoiceAttribute
// ============================================================
function hasVoiceAttribute(doc) {
  if (!doc?.attributes) return false;
  return doc.attributes.some((a) => a.voice === true);
}


// ============================================================
// hasGifAttribute
// ============================================================
function hasGifAttribute(doc) {
  if (!doc?.attributes) return false;
  return doc.attributes.some((a) => a.className === "DocumentAttributeAnimated");
}
