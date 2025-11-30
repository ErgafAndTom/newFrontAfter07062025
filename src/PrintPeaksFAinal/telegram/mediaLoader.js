// ==========================================================================
// mediaLoader.js
// Универсальный загрузчик медиа через backend MTProto file-loader
// /api/telegramAkk/file
// ==========================================================================

import axios from "../../api/axiosInstance";

// Глобальный кэш — чтобы не грузить один и тот же файл дважды
const mediaCache = new Map();

// ==========================================================================
// MAIN EXPORT FUNCTION
// ==========================================================================
//
// preloadMediaForMessages(messages)
// → возвращает копию массива сообщений с заполненным msg.mediaUrl
//
export async function preloadMediaForMessages(messages) {
  const result = [];

  for (const msg of messages) {
    if (!needsMediaLoad(msg)) {
      result.push(msg);
      continue;
    }

    const url = await loadMedia(msg);
    msg.mediaUrl = url;

    result.push(msg);
  }

  return result;
}


export async function preloadMediaForMessage(msg) {
  const url = await loadMedia(msg);
  msg.mediaUrl = url;

  return msg;
}



// ==========================================================================
// needsMediaLoad
// Определяем — надо ли грузить медиа для сообщения
// ==========================================================================

function needsMediaLoad(msg) {
  if (!msg) return false;
  if (!msg.media) return false; // текстовое сообщение

  switch (msg.mediaType) {
    case "photo":
    case "video":
    case "voice":
    case "gif":
    case "sticker":
    case "document":
    case "document-image":
    case "webpage-photo":
    case "webpage-video":
      return true;
  }

  return false;
}



// ==========================================================================
// loadMedia(msg)
// Загружает конкретный файл → возвращает Blob URL
// ==========================================================================

async function loadMedia(msg) {
  const fileKey = buildCacheKey(msg);
  if (mediaCache.has(fileKey)) return mediaCache.get(fileKey);

  const filePayload = extractFileDescriptor(msg);
  if (!filePayload) return null;

  try {
    // Выполняем запрос к backend MTProto loader
    const API = "/api/telegramAkk";
    const response = await axios.post(
      API + "/file",
      filePayload,
      {
        responseType: "arraybuffer"
      }
    );

    const buffer = response.data;

    // Определяем MIME-тип
    const mime = detectMime(msg);

    // Создаём URL
    const blob = new Blob([buffer], { type: mime });
    const url = URL.createObjectURL(blob);

    mediaCache.set(fileKey, url);
    return url;
  } catch (err) {
    console.log("mediaLoader error:", err);
    return null;
  }
}



// ==========================================================================
// buildCacheKey
// Уникальный ключ для кэша
// ==========================================================================

function buildCacheKey(msg) {
  const media = msg.media;

  if (media.photo) {
    const sizes = media.photo.sizes ?? [];
    const biggest = sizes[sizes.length - 1];
    return `photo_${biggest?.location?.id}_${biggest?.location?.accessHash}`;
  }

  if (media.document) {
    return `doc_${media.document.id}_${media.document.accessHash}`;
  }

  if (media.webPage?.photo) {
    const ph = media.webPage.photo;
    const big = ph.sizes?.[ph.sizes.length - 1];
    return `webpage_photo_${big?.location?.id}_${big?.location?.accessHash}`;
  }

  return `msg_${msg.id}`;
}



// ==========================================================================
// detectMime — определяем MIME по типу
// ==========================================================================

function detectMime(msg) {
  const m = msg.media;

  if (msg.mediaType === "photo") return "image/jpeg";
  if (msg.mediaType === "gif") return "video/mp4";
  if (msg.mediaType === "video") return m.document?.mimeType ?? "video/mp4";
  if (msg.mediaType === "voice") return "audio/ogg";
  if (msg.mediaType === "sticker") return "image/webp";
  if (msg.mediaType === "document-image") return m.document?.mimeType ?? "image/jpeg";

  if (m.document?.mimeType) return m.document.mimeType;

  return "application/octet-stream";
}



// ==========================================================================
// extractFileDescriptor(msg)
// Преобразует GramJS/MTProto объект в payload для backend
// ==========================================================================

function extractFileDescriptor(msg) {
  const m = msg.media;

  try {
    // PHOTO
    if (m.photo) {
      const sizes = m.photo.sizes ?? [];
      const biggest = sizes[sizes.length - 1];

      return {
        type: "photo",
        fileId: biggest.location.id,
        accessHash: biggest.location.accessHash,
        fileReference: arrayBufferToBase64(biggest.location.fileReference),
        dcId: biggest.location.dcId
      };
    }

    // DOCUMENT (видео, gif, sticker, файл, голос, gif/mp4)
    if (m.document) {
      return {
        type: "document",
        fileId: m.document.id,
        accessHash: m.document.accessHash,
        fileReference: arrayBufferToBase64(m.document.fileReference),
        dcId: m.document.dcId,
        mimeType: m.document.mimeType
      };
    }

    // WEBPAGE PHOTO
    if (m.webPage?.photo) {
      const ph = m.webPage.photo;
      const sizes = ph.sizes ?? [];
      const biggest = sizes[sizes.length - 1];

      return {
        type: "webpage-photo",
        fileId: biggest.location.id,
        accessHash: biggest.location.accessHash,
        fileReference: arrayBufferToBase64(biggest.location.fileReference),
        dcId: biggest.location.dcId
      };
    }

    return null;
  } catch (err) {
    console.log("extractFileDescriptor error:", err);
    return null;
  }
}



// ==========================================================================
// arrayBufferToBase64
// Backend обычно принимает fileReference как base64
// ==========================================================================

function arrayBufferToBase64(buf) {
  if (!buf) return null;

  const bytes = new Uint8Array(buf);
  let binary = "";

  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
