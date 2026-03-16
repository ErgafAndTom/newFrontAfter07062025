import React from "react";

// ---- SVG icons (stroke) ----
export const IconFile = ({size=50}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6 a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <path d="M14 2v6h6" />
  </svg>
);
export const IconImage = ({size=50}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.3" />
    <path d="M21 15l-5-5-9 9" />
  </svg>
);
export const IconMusic = ({size=50}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="2.6" />
    <circle cx="18" cy="16" r="2.6" />
  </svg>
);
export const IconVideo = ({size=50}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="15" height="14" rx="2" />
    <path d="M23 7l-6 4v2l6 4V7z" />
  </svg>
);
export const IconArchive = ({size=50}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" />
    <rect x="3" y="8" width="18" height="13" rx="2" />
    <path d="M9 12h6" />
  </svg>
);
export const IconCode = ({size=50}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);
export const IconPdf = ({size=50}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <path d="M14 2v6h6" />
    <path d="M8 13h8M8 17h8" />
  </svg>
);
export const IconText = ({size=50}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16M4 11h16M4 15h10" />
  </svg>
);

// helper: extension
export function getExt(name = "") {
  const m = String(name || "").toLowerCase().match(/\.([a-z0-9]+)(?:\?.*)?$/i);
  return m ? m[1] : "";
}

// shortName: trim to max chars then "..."
export function shortName(name = "", max = 40) {
  if (!name) return "";
  if (name.length <= max) return name;
  return name.slice(0, max) + "...";
}

// returns {type, color, icon}
export function fileTypeMeta(name = "") {
  const ext = getExt(name);
  if (["doc","docx"].includes(ext)) return { type: "word", color: "#2B579A", icon: <IconFile size={50} /> };
  if (["xls","xlsx","csv"].includes(ext)) return { type: "excel", color: "#217346", icon: <IconFile size={50} /> };
  if (["ppt","pptx"].includes(ext)) return { type: "ppt", color: "#D24726", icon: <IconFile size={50} /> };
  if (["pdf"].includes(ext)) return { type: "pdf", color: "#E23B2E", icon: <IconPdf size={50} /> };
  if (["psd","ai","indd","eps"].includes(ext)) return { type: "adobe", color: "#6E2CAC", icon: <IconFile size={50} /> };
  if (["png","jpg","jpeg","gif","webp","bmp","tiff","svg"].includes(ext)) return { type: "image", color: "#6C8EF5", icon: <IconImage size={50} /> };
  if (["mp3","wav","flac","aac","ogg"].includes(ext)) return { type: "audio", color: "#6B7280", icon: <IconMusic size={50} /> };
  if (["mp4","mov","avi","mkv","webm"].includes(ext)) return { type: "video", color: "#6B7280", icon: <IconVideo size={50} /> };
  if (["zip","rar","7z","tar","gz"].includes(ext)) return { type: "archive", color: "#9B7D3A", icon: <IconArchive size={50} /> };
  if (["js","ts","jsx","tsx","json","yml","yaml","xml","html","css"].includes(ext)) return { type: "code", color: "#4B5563", icon: <IconCode size={50} /> };
  if (["txt","md","rtf","log"].includes(ext)) return { type: "text", color: "#4B5563", icon: <IconText size={50} /> };
  return { type: "file", color: "#9CA3AF", icon: <IconFile size={50} /> };
}

export function formatBytes(bytes) {
  if (bytes == null) return "";
  const k = 1024, sizes = ["B","KB","MB","GB","TB"];
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  return `${(bytes / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}
