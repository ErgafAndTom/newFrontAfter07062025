// src/components/order/OrderFilesPanel.jsx
import axios from "../../api/axiosInstance";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./OrderFilesPanel.css";
import {
  FiUploadCloud, FiPlus, FiX, FiFile, FiImage, FiMusic, FiVideo, FiArchive, FiFileText, FiCode
} from "react-icons/fi";

// ---- thin SVG icons (stroke) ----
const IconFile = ({size=50}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6 a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <path d="M14 2v6h6" />
  </svg>
);
const IconImage = ({size=50}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.3" />
    <path d="M21 15l-5-5-9 9" />
  </svg>
);
const IconMusic = ({size=50}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="2.6" />
    <circle cx="18" cy="16" r="2.6" />
  </svg>
);
const IconVideo = ({size=50}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="15" height="14" rx="2" />
    <path d="M23 7l-6 4v2l6 4V7z" />
  </svg>
);
const IconArchive = ({size=50}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" />
    <rect x="3" y="8" width="18" height="13" rx="2" />
    <path d="M9 12h6" />
  </svg>
);
const IconCode = ({size=50}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);
const IconPdf = ({size=50}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <path d="M14 2v6h6" />
    <path d="M8 13h8M8 17h8" />
  </svg>
);
const IconText = ({size=50}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16M4 11h16M4 15h10" />
  </svg>
);

// helper: extension
function getExt(name = "") {
  const m = String(name || "").toLowerCase().match(/\.([a-z0-9]+)(?:\?.*)?$/i);
  return m ? m[1] : "";
}

// shortName: trim to max chars then "..."
function shortName(name = "", max = 40) {
  if (!name) return "";
  if (name.length <= max) return name;
  return name.slice(0, max) + "...";
}

// returns {type, color, iconJSX}
function fileTypeMeta(name = "") {
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

function formatBytes(bytes) {
  if (bytes == null) return "";
  const k = 1024, sizes = ["B","KB","MB","GB","TB"];
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  return `${(bytes / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

const OrderFilesPanel = ({
                           thisOrder,
                           listEndpoint,
                           uploadEndpoint,
                           height,
                         }) => {
  const navigate = useNavigate();

  const listUrl   = listEndpoint   || `/orders/${thisOrder?.id}/getFiles`;
  const uploadUrl = uploadEndpoint || `/orders/${thisOrder?.id}/addNewFile`;

  const [files, setFiles] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState(null);

  const [uploads, setUploads] = useState([]); // {tempId, name, size, progress, controller}
  const dragCounter = useRef(0);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const fetchFiles = useCallback(async () => {
    if (!thisOrder?.id) return;
    try {
      setError(null);
      setLoadingList(true);
      const res = await axios.post(listUrl, { id: thisOrder.id });
      const rows = Array.isArray(res.data) ? res.data : (res.data?.rows || []);
      setFiles(rows.map(f => ({
        id: f.id,
        fileName: f.fileName || "файл",
        fileLink: f.fileLink,
        previewUrl: f.previewUrl || f.thumbnailUrl || null,
        size: f.size,
        createdAt: f.createdAt,
      })));
    } catch (e) {
      if (e.response?.status === 403) navigate("/login");
      else setError(e.message || "Помилка отримання файлів");
    } finally {
      setLoadingList(false);
    }
  }, [listUrl, navigate, thisOrder?.id]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const uploadFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const list = Array.from(fileList);

    list.forEach(async (file) => {
      const tempId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const controller = new AbortController();

      setUploads(prev => [...prev, { tempId, name: file.name, size: file.size, progress: 0, controller }]);

      try {
        const formData = new FormData();
        formData.append("file", file, file.name);

        const res = await axios.post(uploadUrl, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          signal: controller.signal,
          onUploadProgress: (evt) => {
            const total = evt.total || file.size || 1;
            const pct = Math.max(0, Math.min(100, Math.round((evt.loaded * 100) / total)));
            setUploads(prev => prev.map(u => u.tempId === tempId ? { ...u, progress: pct } : u));
          },
        });

        const f = res.data;
        setFiles(prev => [...prev, {
          id: f.id,
          fileName: f.fileName || file.name,
          fileLink: f.fileLink,
          previewUrl: f.previewUrl || null,
          size: f.size ?? file.size,
          createdAt: f.createdAt || new Date().toISOString(),
        }]);
      } catch (e) {
        if (axios.isCancel?.(e) || e.name === "CanceledError" || e.message === "canceled") {
          // cancelled
        } else {
          setError(e.message || `Помилка завантаження: ${file.name}`);
        }
      } finally {
        setUploads(prev => prev.filter(u => u.tempId !== tempId));
      }
    });
  };

  const cancelUpload = (tempId) => {
    setUploads(prev => {
      const u = prev.find(x => x.tempId === tempId);
      try { u?.controller?.abort(); } catch {}
      return prev.filter(x => x.tempId !== tempId);
    });
  };

  // DnD handlers (keep drag counter to handle nested enter/leave)
  const onDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current += 1; setDragActive(true); };
  const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current -= 1; if (dragCounter.current <= 0) setDragActive(false); };
  const onDragOver   = (e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = "copy"; };
  const onDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false); dragCounter.current = 0;
    const dropped = e.dataTransfer?.files;
    if (dropped?.length) uploadFiles(dropped);
  };

  // paste
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onPaste = (e) => {
      const fl = e.clipboardData?.files;
      if (fl && fl.length > 0) { e.preventDefault(); uploadFiles(fl); }
    };
    el.addEventListener("paste", onPaste);
    return () => el.removeEventListener("paste", onPaste);
  }, []);

  const openPicker = () => inputRef.current?.click();
  const onPickFiles = (e) => uploadFiles(e.target.files);

  // overall progress (weighted by size when available)
  const overallProgress = (() => {
    if (!uploads || uploads.length === 0) return 0;
    const totalSize = uploads.reduce((s, u) => s + (u.size || 0), 0);
    if (totalSize > 0) {
      const uploadedBytes = uploads.reduce((s, u) => s + ((u.progress || 0) / 100) * (u.size || 0), 0);
      return Math.round((uploadedBytes / totalSize) * 100);
    } else {
      const avg = uploads.reduce((s, u) => s + (u.progress || 0), 0) / uploads.length;
      return Math.round(avg);
    }
  })();

  return (
    <div
      ref={containerRef}
      className={`order-files-panel ${dragActive ? "drag-active" : ""}`}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      title="Перетягни файли або натисни «+»"
      style={{ height }}
    >
      <div className="drop-hint">
        <div className="left-hint">
          <FiUploadCloud style={{ marginRight: 8, opacity: 0.9 }} />
          <div style={{opacity:"0.85", whiteSpace:"nowrap"}}>Перетягни файли або натисни "+"</div>
        </div>
        <button
          type="button"
          className="AddButtonFilesOrder"
          onClick={openPicker}
          title="Додати файли"
          aria-label="Додати файли"
        >
          +
        </button>
        <input ref={inputRef} type="file" multiple style={{ display: "none" }} onChange={onPickFiles}/>
      </div>

      {/* Overall uploads progress bar (shows only when uploads.length > 0) */}
      {uploads.length > 0 && (
        <div className="uploads-overall" aria-live="polite">
          <div className="uploads-overall-info">
            Завантаження {uploads.length} {uploads.length === 1 ? "файлу" : "файлів"} — {overallProgress}%
          </div>
          <div className="uploads-overall-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={overallProgress}>
            <div className="uploads-overall-bar"/>
          </div>
        </div>
      )}

      {(loadingList) && (
        <div className="files-loading">
          <Spinner animation="grow" variant="dark" />
          <span className="">Завантаження списку…</span>
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="files-grid-scroll"
           onDragEnter={onDragEnter}
           onDragOver={onDragOver}
           onDragLeave={onDragLeave}
           onDrop={onDrop}>

        <div className="files-grid"
             onDragEnter={onDragEnter}
             onDragOver={onDragOver}
             onDragLeave={onDragLeave}
             onDrop={onDrop}>

          {/* uploads */}
          {uploads.map(u => {
            const meta = fileTypeMeta(u.name);
            return (
              <div key={u.tempId} className="file-tile uploading" title={u.name}>
                <div className="tile-top">
                  <a className="tile-link" onClick={(e)=>e.preventDefault()} href="#" tabIndex={0}>
                    <div className={`tile-icon tile-icon--${meta.type}`} style={{ borderColor: meta.color }}>
                      <div className="tile-icon-inner">{meta.icon}</div>
                    </div>
                  </a>
                </div>

                <div className="tile-name">{shortName(u.name, 40)}</div>
                <div className="tile-sub">{formatBytes(u.size)}</div>

                <button className="tile-cancel" onClick={() => cancelUpload(u.tempId)} aria-label="Скасувати">
                  <FiX size={10}/>
                </button>

                <div className="tile-progress" aria-hidden>
                  <div className="tile-progress-bar"/>
                </div>

                <div className="tile-progress-percent">{u.progress ? `${u.progress}%` : ""}</div>
              </div>
            );
          })}

          {/* files */}
          {files.map(f => {
            const meta = fileTypeMeta(f.fileName);
            return (
              <div key={f.id} className="file-tile" title={f.fileName}>
                <div className="tile-top">
                  <a className="tile-link" href={f.fileLink || "#"} target={f.fileLink ? "_blank" : undefined} rel="noreferrer">
                    {f.previewUrl ? (
                      <div className="tile-icon preview">
                        <img src={f.previewUrl} alt={f.fileName} />
                      </div>
                    ) : (
                      <div className={`tile-icon tile-icon--${meta.type}`} style={{ borderColor: meta.color }}>
                        <div className="tile-icon-inner" style={{ color: meta.type === "image" ? "#111" : "#111" }}>{meta.icon}</div>
                      </div>
                    )}
                  </a>
                </div>

                <div className="tile-name">{shortName(f.fileName, 40)}</div>
                <div className="tile-sub">{f.size != null ? formatBytes(f.size) : ""}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* drag overlay: видимий під час dragActive */}
      <div className={`drag-overlay ${dragActive ? "visible" : ""}`} aria-hidden>
        <div className="drag-overlay-box">
          <div className="drag-overlay-icon"><IconFile size={48} /></div>
          <div className="drag-overlay-text">Кинь файли сюди</div>
          <div className="drag-overlay-hint">або натисни «+»</div>
        </div>
      </div>
    </div>
  );
};

export default OrderFilesPanel;
