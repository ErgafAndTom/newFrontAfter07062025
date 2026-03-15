// OrderFilesPanel — файли замовлення (cfp-* стилі як ClientFilesPanel)
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import axios from "../../api/axiosInstance";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FiPlus, FiMinus, FiFolder, FiFolderPlus,
  FiChevronDown, FiChevronUp, FiChevronsUp, FiLink, FiArrowLeft,
} from "react-icons/fi";
import { fileTypeMeta, shortName, formatBytes } from "../../utils/fileUtils";
import "../userInNewUiArtem/ClientFilesPanel.css";
import ClientFilesPanel from "../userInNewUiArtem/ClientFilesPanel";

const OrderFilesPanel = ({ thisOrder, onClose }) => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showClientFiles, setShowClientFiles] = useState(false);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDesc, setSortDesc] = useState(true);
  const [currentFolder, setCurrentFolder] = useState("");
  const dragCounter = useRef(0);
  const inputRef = useRef(null);
  const folderInputRef = useRef(null);

  const orderId = thisOrder?.id;
  const clientId = thisOrder?.clientId;

  // Fetch files — root: order-linked files, subfolder: client files endpoint
  const fetchFiles = useCallback(async (silent = false) => {
    if (!orderId) return;
    try {
      if (!silent) { setError(null); setLoading(true); }
      let res;
      if (currentFolder) {
        // Inside a folder → fetch from client files endpoint
        res = await axios.get(`/api/client-files/users/${clientId}`, {
          params: { folder: currentFolder },
        });
      } else {
        // Root → fetch order-linked files
        res = await axios.get(`/api/client-files/orders/${orderId}`);
      }
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      if (e.response?.status === 403) navigate("/login");
      else if (!silent) setError(e.message || "Помилка отримання файлів");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [navigate, orderId, clientId, currentFolder]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  // Folder navigation
  const openFolder = (folderName) => {
    setCurrentFolder(prev => prev ? `${prev}/${folderName}` : folderName);
  };
  const goBack = () => {
    setCurrentFolder(prev => {
      const parts = prev.split("/");
      parts.pop();
      return parts.join("/");
    });
  };

  // Upload file → client folder + auto-link to order
  const uploadFile = async (file, folder, skipLink = false) => {
    if (!orderId || !file) return;
    const formData = new FormData();
    formData.append("file", file, file.name);
    if (folder) formData.append("folder", folder);
    if (skipLink) formData.append("skipLink", "true");
    setUploadProgress({ name: file.name, percent: 0 });
    try {
      await axios.post(`/api/client-files/orders/${orderId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          const total = evt.total || file.size || 1;
          const pct = Math.round((evt.loaded * 100) / total);
          setUploadProgress({ name: file.name, percent: pct });
        },
      });
    } catch (e) {
      setError(e.message || `Помилка завантаження: ${file.name}`);
    } finally {
      setUploadProgress(null);
    }
  };

  const uploadFiles = async (fileList) => {
    const list = Array.from(fileList);
    const createdFolders = new Set();
    for (const file of list) {
      const relPath = file.webkitRelativePath || "";
      const parts = relPath.split("/");
      let subfolder = "";
      if (parts.length > 1) {
        subfolder = parts.slice(0, -1).join("/");
        const topFolder = parts[0];
        if (!createdFolders.has(topFolder) && clientId) {
          try {
            await axios.post(`/api/client-files/users/${clientId}/create-folder`, {
              folder: "",
              name: topFolder,
              orderId,
            });
          } catch {}
          createdFolders.add(topFolder);
        }
      }
      // Files inside a folder → skipLink (folder itself is linked)
      const isInsideFolder = parts.length > 1;
      await uploadFile(file, subfolder || undefined, isInsideFolder);
    }
    fetchFiles();
  };

  // Unlink file from order (only at root level)
  const unlinkFile = async (fileId) => {
    try {
      await axios.delete(`/api/client-files/orders/${orderId}/unlink/${fileId}`);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (e) {
      setError(e.message || "Помилка відв'язки");
    }
  };

  // Link file from client files modal
  const linkFile = async (fileId) => {
    try {
      await axios.post(`/api/client-files/orders/${orderId}/link`, { fileId });
      setShowClientFiles(false);
      fetchFiles();
    } catch (e) {
      if (e.response?.status === 409) setError("Файл вже прив'язано");
      else setError(e.message || "Помилка прив'язки");
      setShowClientFiles(false);
    }
  };

  const openFile = async (fileId) => {
    try {
      const res = await axios.get(`/api/client-files/files/${fileId}/download`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: res.headers["content-type"] || "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const disposition = res.headers["content-disposition"] || "";
      const isInline = disposition.startsWith("inline");
      if (isInline) {
        window.open(url, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = url;
        const match = disposition.match(/filename="?([^"]+)"?/);
        a.download = match ? decodeURIComponent(match[1]) : "file";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      setError("Не вдалось завантажити файл");
    }
  };

  // Create folder in client's storage + link to order (atomic)
  const createFolder = async () => {
    const name = window.prompt("Назва нової папки:");
    if (!name || !name.trim() || !clientId) return;
    try {
      await axios.post(`/api/client-files/users/${clientId}/create-folder`, {
        folder: currentFolder,
        name: name.trim(),
        orderId: !currentFolder ? orderId : undefined,
      });
      fetchFiles();
    } catch (e) {
      setError(e.response?.data?.error || "Не вдалось створити папку");
    }
  };

  // DnD
  const onDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current += 1; setDragActive(true); };
  const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current -= 1; if (dragCounter.current <= 0) setDragActive(false); };
  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = "copy"; };
  const onDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false); dragCounter.current = 0;
    if (e.dataTransfer?.files?.length) uploadFiles(e.dataTransfer.files);
  };

  const getExt = (name) => {
    if (!name) return "";
    const dot = name.lastIndexOf(".");
    return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
  };

  const formatDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    return dt.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "2-digit" });
  };

  const toggleSort = (col) => {
    if (sortColumn === col) setSortDesc(prev => !prev);
    else { setSortColumn(col); setSortDesc(true); }
  };

  const sortedFiles = React.useMemo(() => {
    if (!sortColumn) return files;
    return [...files].sort((a, b) => {
      let cmp = 0;
      if (sortColumn === "name") {
        cmp = (a.originalName || a.fileName || "").toLowerCase().localeCompare((b.originalName || b.fileName || "").toLowerCase(), "uk");
      } else if (sortColumn === "type") {
        cmp = getExt(a.originalName || a.fileName).localeCompare(getExt(b.originalName || b.fileName), "uk");
      } else if (sortColumn === "size") {
        cmp = (a.size || 0) - (b.size || 0);
      } else if (sortColumn === "date") {
        cmp = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      return sortDesc ? -cmp : cmp;
    });
  }, [files, sortColumn, sortDesc]);

  const SortArrow = ({ col }) => {
    if (sortColumn !== col) return <FiChevronsUp size={11} style={{ opacity: 0.3, marginLeft: 4 }}/>;
    return sortDesc
      ? <FiChevronDown size={11} style={{ color: "var(--adminorange, #f5a623)", marginLeft: 4 }}/>
      : <FiChevronUp size={11} style={{ color: "var(--adminorange, #f5a623)", marginLeft: 4 }}/>;
  };

  const isRoot = !currentFolder;

  return ReactDOM.createPortal(
    <div className="cfp-overlay" onClick={onClose}>
      <div
        className={`cfp-modal ${dragActive ? "cfp-drag-active" : ""}`}
        onClick={(e) => e.stopPropagation()}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* Header */}
        <div className="cfp-header">
          <button className="cfp-admin-btn" onClick={() => setShowClientFiles(true)} title="Файли клієнта">
            <span className="cfp-btn-inner">
              <FiLink size={14}/>
              <span>Файли клієнта</span>
            </span>
          </button>
          <div className="cfp-header-right">
            <button className="cfp-admin-btn" onClick={createFolder} title="Нова папка">
              <span className="cfp-btn-inner">
                <FiPlus size={14}/>
                <span>Нова папка</span>
              </span>
            </button>
            <button className="cfp-admin-btn" onClick={() => folderInputRef.current?.click()} title="Додати папку">
              <span className="cfp-btn-inner">
                <FiFolderPlus size={14}/>
                <span>Додати папку</span>
              </span>
            </button>
            <button className="cfp-admin-btn" onClick={() => inputRef.current?.click()} title="Додати файли">
              <span className="cfp-btn-inner">
                <FiPlus size={14}/>
                <span>Додати файли</span>
              </span>
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={(e) => uploadFiles(e.target.files)}
          />
          <input
            ref={folderInputRef}
            type="file"
            multiple
            webkitdirectory=""
            directory=""
            style={{ display: "none" }}
            onChange={(e) => uploadFiles(e.target.files)}
          />
        </div>

        {/* Back button + breadcrumb when inside folder */}
        {!isRoot && (
          <div className="cfp-breadcrumb">
            <button className="cfp-admin-btn" onClick={goBack} title="Назад">
              <span className="cfp-btn-inner">
                <FiArrowLeft size={14}/>
                <span>Назад</span>
              </span>
            </button>
            <span className="cfp-breadcrumb-path">
              {currentFolder.split("/").map((part, i, arr) => (
                <span key={i}>
                  {i > 0 && " / "}
                  <span style={{ fontWeight: i === arr.length - 1 ? 600 : 400 }}>{part}</span>
                </span>
              ))}
            </span>
          </div>
        )}

        {/* Upload progress */}
        {uploadProgress && (
          <div className="cfp-upload-progress">
            {uploadProgress.name} — {uploadProgress.percent}%
            <div className="cfp-progress-track">
              <div className="cfp-progress-bar" style={{ width: `${uploadProgress.percent}%` }}/>
            </div>
          </div>
        )}

        {/* Drag overlay */}
        {dragActive && (
          <div className="cfp-drag-overlay">Кинь файли сюди</div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: 20 }}>
            <Spinner animation="grow" variant="dark" size="sm"/>
          </div>
        )}
        {error && <div className="alert alert-danger" style={{ margin: "0 16px" }}>{error}</div>}

        {/* List header */}
        <div className="cfp-list-header" style={{ gridTemplateColumns: isRoot ? "40px 1fr 60px 80px 80px 36px" : "40px 1fr 60px 80px 80px" }}>
          <div></div>
          <div className="cfp-sort-col" onClick={() => toggleSort("name")}>Назва<SortArrow col="name"/></div>
          <div className="cfp-sort-col" onClick={() => toggleSort("type")}>Тип<SortArrow col="type"/></div>
          <div className="cfp-sort-col" onClick={() => toggleSort("size")}>Розмір<SortArrow col="size"/></div>
          <div className="cfp-sort-col" onClick={() => toggleSort("date")}>Дата<SortArrow col="date"/></div>
          {isRoot && <div><FiMinus size={13}/></div>}
        </div>

        {/* Files list */}
        <div className="cfp-list">
          {!loading && files.length === 0 && (
            <div className="cfp-empty">Файлів поки немає</div>
          )}

          {sortedFiles.map(f => {
            const isDir = f.mimeType === "directory";
            const meta = isDir
              ? { icon: <FiFolder size={24}/>, color: "var(--adminorange, #f5a623)" }
              : fileTypeMeta(f.originalName || f.fileName);
            return (
              <div
                key={f.id || f.fileName}
                className="cfp-file-row"
                style={{ gridTemplateColumns: isRoot ? "40px 1fr 60px 80px 80px 36px" : "40px 1fr 60px 80px 80px" }}
              >
                <div className="cfp-file-icon" style={{ color: meta.color }}>
                  {meta.icon}
                </div>
                <div
                  className="cfp-file-name"
                  onClick={() => isDir ? openFolder(f.originalName || f.fileName) : openFile(f.id)}
                  title={f.originalName || f.fileName}
                  style={isDir ? { cursor: "pointer" } : undefined}
                >
                  {shortName(f.originalName || f.fileName, 50)}
                </div>
                <div className="cfp-file-type">{isDir ? "—" : getExt(f.originalName || f.fileName)}</div>
                <div className="cfp-file-size">{isDir ? "—" : formatBytes(f.size)}</div>
                <div className="cfp-file-date">{formatDate(f.createdAt)}</div>
                {isRoot && (
                  <div className="cfp-file-actions">
                    <button
                      className="cfp-admin-btn cfp-admin-btn-red"
                      onClick={() => unlinkFile(f.id)}
                      title="Відв'язати від замовлення"
                    >
                      <span className="cfp-btn-inner">
                        <FiMinus size={14}/>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Status bar */}
        <div className="cfp-statusbar">
          Файли замовлення №{orderId}
          {files.length > 0 && ` (${files.length})`}
        </div>
      </div>

      {/* Client files panel for linking */}
      {showClientFiles && clientId && (
        <ClientFilesPanel
          userId={clientId}
          clientName={thisOrder?.client?.firstName ? `${thisOrder.client.firstName} ${thisOrder.client.lastName || ''}` : ''}
          onClose={() => setShowClientFiles(false)}
          selectMode={true}
          onSelectFile={linkFile}
          orderId={orderId}
        />
      )}
    </div>,
    document.body
  );
};

export default OrderFilesPanel;
