// ============================================================
// normalizeTelegramMessage.js
// Улучшенный нормализатор RAW Telegram → compact Unified Base
// ============================================================

// Safe getter
const get = (obj, path, def = null) => {
  try {
    return path.split(".").reduce((a, p) => a[p], obj) ?? def;
  } catch {
    return def;
  }
};


// ============================================================
// MAIN EXPORT
// ============================================================
export function normalizeTelegramMessage(raw) {
  if (!raw) return null;

  const base = {
    ...raw,
    id: raw.id ?? raw.messageId ?? null,
    date: raw.date ? raw.date * 1000 : Date.now(),
    editDate: raw.editDate ? raw.editDate * 1000 : null,

    text: extractText(raw),
    entities: extractEntities(raw),

    media: extractMedia(raw),
    mediaType: detectMediaType(raw),

    service: Boolean(raw.action),
    action: raw.action ?? null,

    reply: extractReply(raw),
    forward: extractForward(raw),

    reactions: raw.reactions ?? null,

    raw
  };

  return base;
}



// ============================================================
// extractText()
// ============================================================
function extractText(raw) {
  return (
    raw.message ??
    get(raw, "rawJson.message") ??
    ""
  );
}



// ============================================================
// extractEntities()
// ============================================================
function extractEntities(raw) {
  const entities = raw.entities ?? get(raw, "rawJson.entities") ?? [];

  return entities.map((e) => {
    let type = e.className || e._ || "";
    type = type.replace("MessageEntity", "").toLowerCase();

    return {
      type,
      offset: e.offset,
      length: e.length,
      url: e.url ?? null,
      userId: e.userId ?? null,
      language: e.language ?? null
    };
  });
}



// ============================================================
// extractReply()
// ============================================================
function extractReply(raw) {
  const r = raw.replyTo ?? get(raw, "rawJson.replyTo");
  if (!r) return null;

  const id = r.replyToMsgId ?? r.msgId ?? null;
  if (!id) return null;

  const preview = raw.replyMessage ?? get(raw, "rawJson.replyMessage") ?? null;

  return {
    messageId: id,
    peerId: r.replyToPeerId ?? r.peerId ?? null,
    text: preview?.message ?? "",
    mediaPreview: detectMediaPreview(preview)
  };
}



// ============================================================
// extractForward()
//
// Telegram может отдавать:
// - fwdFrom.fromName
// - fwdFrom.fromId.userId
// - fwdFrom.fromId.channelId
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
    fromId:
      get(fwd, "fromId.userId") ??
      get(fwd, "fromId.channelId") ??
      null,
    date: fwd.date ? fwd.date * 1000 : null
  };
}



// ============================================================
// extractMedia()
// Возвращает raw-структуру медиа, но в аккуратном виде.
// ============================================================
function extractMedia(raw) {
  const m = raw.media;
  if (!m) return null;

  // фото
  if (m.photo) {
    return {
      type: "photo",
      id: m.photo.id,
      sizes: m.photo.sizes ?? [],
      raw: m
    };
  }

  // документ
  if (m.document) {
    return {
      type: detectDocumentType(m.document),
      mime: m.document.mimeType,
      id: m.document.id,
      attributes: m.document.attributes ?? [],
      raw: m
    };
  }

  // гео
  if (m.geo) {
    return { type: "geo", geo: m.geo, raw: m };
  }

  // контакт
  if (m.contact) {
    return { type: "contact", contact: m.contact, raw: m };
  }

  // webPage, poll и др.
  return { type: detectMediaType(raw), raw: m };
}



// ============================================================
// detectMediaType()
// Полное определение типа
// ============================================================
function detectMediaType(raw) {
  const m = raw.media;
  if (!m) return "text";

  if (m.photo) return "photo";
  if (m.geo) return "geo";
  if (m.contact) return "contact";
  if (m.poll) return "poll";
  if (m.webPage) return detectWebPageType(m.webPage);

  if (m.document) {
    const doc = m.document;
    const mime = doc.mimeType ?? "";
    if (mime.startsWith("image/") && !mime.includes("webp")) return "image";
    if (mime === "image/webp") return "sticker";
    if (mime === "video/mp4" && hasGifAttribute(doc)) return "gif";
    if (mime.startsWith("video/")) return "video";
    return "document";
  }

  return "unknown";
}



// ============================================================
// detectDocumentType()
// ============================================================
function detectDocumentType(doc) {
  const mime = doc.mimeType ?? "";
  if (mime === "image/webp") return "sticker";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return hasGifAttribute(doc) ? "gif" : "video";
  return "document";
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
// detectMediaPreview()
// ============================================================
function detectMediaPreview(m) {
  if (!m) return null;
  if (m.photo) return { type: "photo", photo: m.photo };
  if (m.document) return { type: "document", document: m.document };
  return null;
}



// ============================================================
// hasGifAttribute / hasVoiceAttribute
// ============================================================
function hasGifAttribute(doc) {
  return doc?.attributes?.some((a) => a.className === "DocumentAttributeAnimated");
}

function hasVoiceAttribute(doc) {
  return doc?.attributes?.some((a) => a.voice === true);
}
