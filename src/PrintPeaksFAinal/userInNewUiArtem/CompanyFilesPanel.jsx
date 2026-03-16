import React, { useCallback, useEffect, useState, useMemo, lazy, Suspense } from "react";
import ReactDOM from "react-dom";
import axios from "../../api/axiosInstance";
import { Spinner } from "react-bootstrap";
import { FiFolder, FiChevronDown, FiChevronUp, FiChevronsUp, FiTrash2 } from "react-icons/fi";
import { fileTypeMeta, shortName, formatBytes } from "../../utils/fileUtils";
import { loadFileSettings } from "../user/profile/DesignSettings";
import "./ClientFilesPanel.css";

const ClientFilesPanel = lazy(() => import("./ClientFilesPanel"));

const CompanyFilesPanel = ({ companyId, companyName = "", onClose }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDesc, setSortDesc] = useState(true);
  const [openClientId, setOpenClientId] = useState(null);
  const [openClientName, setOpenClientName] = useState("");

  const fetchFiles = useCallback(async () => {
    if (!companyId) return;
    try {
      setError(null);
      setLoading(true);
      const res = await axios.get(`/api/client-files/company/${companyId}`);
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.message || "Помилка отримання файлів компанії");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

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

  const deleteFile = async (fileId) => {
    try {
      await axios.delete(`/api/client-files/files/${fileId}`);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (e) {
      setError(e.message || "Помилка видалення");
    }
  };

  const openFolder = async (userId) => {
    if (!userId) return;
    try {
      const fileSets = loadFileSettings();
      await axios.post(`/api/client-files/users/${userId}/open-folder`, {
        folderMode: fileSets.folderMode,
        networkPath: fileSets.networkPath,
        networkUser: fileSets.networkUser,
        networkPass: fileSets.networkPass,
      });
    } catch (e) {
      setError("Не вдалось відкрити папку");
    }
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

  const getClientName = (f) => {
    const c = f.client;
    if (!c) return "—";
    const parts = [c.firstName, c.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : (c.username || `#${c.id}`);
  };

  const toggleSort = (col) => {
    if (sortColumn === col) {
      setSortDesc(prev => !prev);
    } else {
      setSortColumn(col);
      setSortDesc(true);
    }
  };

  const sortedFiles = useMemo(() => {
    const dirs = files.filter(f => f.mimeType === "directory");
    const rest = files.filter(f => f.mimeType !== "directory");
    if (!sortColumn) return [...dirs, ...rest];

    const sorted = [...rest].sort((a, b) => {
      let cmp = 0;
      if (sortColumn === "name") {
        const na = (a.originalName || a.fileName || "").toLowerCase();
        const nb = (b.originalName || b.fileName || "").toLowerCase();
        cmp = na.localeCompare(nb, "uk");
      } else if (sortColumn === "type") {
        cmp = getExt(a.originalName || a.fileName).localeCompare(getExt(b.originalName || b.fileName), "uk");
      } else if (sortColumn === "size") {
        cmp = (a.size || 0) - (b.size || 0);
      } else if (sortColumn === "date") {
        cmp = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      } else if (sortColumn === "client") {
        cmp = getClientName(a).localeCompare(getClientName(b), "uk");
      }
      return sortDesc ? -cmp : cmp;
    });
    return [...dirs, ...sorted];
  }, [files, sortColumn, sortDesc]);

  const SortArrow = ({ col }) => {
    if (sortColumn !== col) return <FiChevronsUp size={11} style={{ opacity: 0.3, marginLeft: 4 }}/>;
    return sortDesc
      ? <FiChevronDown size={11} style={{ color: "var(--adminorange, #f5a623)", marginLeft: 4 }}/>
      : <FiChevronUp size={11} style={{ color: "var(--adminorange, #f5a623)", marginLeft: 4 }}/>;
  };

  return ReactDOM.createPortal(
    <div className="cfp-overlay" onClick={onClose}>
      <div className="cfp-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cfp-header">
          <span style={{ fontSize: "var(--font-size-xs, 15px)", color: "var(--admingrey)", textTransform: "uppercase" }}>
            Файли компанії — {companyName}
          </span>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 20 }}>
            <Spinner animation="grow" variant="dark" size="sm"/>
          </div>
        )}
        {error && <div className="alert alert-danger" style={{ margin: "0 16px" }}>{error}</div>}

        {/* List header */}
        <div className="cfp-list-header cof-grid">
          <div></div>
          <div className="cfp-sort-col" onClick={() => toggleSort("name")}>Назва<SortArrow col="name"/></div>
          <div className="cfp-sort-col" onClick={() => toggleSort("type")}>Тип<SortArrow col="type"/></div>
          <div className="cfp-sort-col" onClick={() => toggleSort("size")}>Розмір<SortArrow col="size"/></div>
          <div className="cfp-sort-col" onClick={() => toggleSort("date")}>Дата<SortArrow col="date"/></div>
          <div className="cfp-sort-col" onClick={() => toggleSort("client")}>Клієнт<SortArrow col="client"/></div>
          <div><FiTrash2 size={13}/></div>
        </div>

        {/* Files list */}
        <div className="cfp-list">
          {!loading && files.length === 0 && (
            <div className="cfp-empty">Файлів поки немає</div>
          )}

          {sortedFiles.map((f, idx) => {
            const isDir = f.mimeType === "directory";
            const meta = isDir
              ? { icon: <FiFolder size={24}/>, color: "var(--adminorange, #f5a623)" }
              : fileTypeMeta(f.originalName || f.fileName);
            return (
              <div key={f.id || `${f.fileName}-${idx}`} className="cfp-file-row cof-grid">
                <div className="cfp-file-icon" style={{ color: meta.color }}>
                  {meta.icon}
                </div>
                <div
                  className="cfp-file-name"
                  onClick={() => isDir ? openFolder(f.userId) : openFile(f.id)}
                  title={f.originalName || f.fileName}
                >
                  {shortName(f.originalName || f.fileName, 50)}
                </div>
                <div className="cfp-file-type">{isDir ? "—" : getExt(f.originalName || f.fileName)}</div>
                <div className="cfp-file-size">{isDir ? "—" : formatBytes(f.size)}</div>
                <div className="cfp-file-date">{isDir ? "" : formatDate(f.createdAt)}</div>
                <div
                  className="cfp-file-client cfp-file-client--link"
                  title={getClientName(f)}
                  onClick={() => {
                    if (f.client?.id || f.userId) {
                      setOpenClientId(f.client?.id || f.userId);
                      setOpenClientName(getClientName(f));
                    }
                  }}
                >
                  {shortName(getClientName(f), 25)}
                </div>
                <div className="cfp-file-actions">
                  {!isDir && (
                    <button
                      className="cfp-admin-btn cfp-admin-btn-red"
                      onClick={() => deleteFile(f.id)}
                      title="Видалити файл"
                    >
                      <span className="cfp-btn-inner">
                        <FiTrash2 size={14}/>
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status bar */}
        <div className="cfp-statusbar">
          Файли компанії — {companyName}
          {files.length > 0 && ` (${files.filter(f => f.mimeType !== "directory").length})`}
        </div>

        {openClientId && (
          <Suspense fallback={null}>
            <ClientFilesPanel
              userId={openClientId}
              clientName={openClientName}
              companyId={companyId}
              companyName={companyName}
              onClose={() => { setOpenClientId(null); setOpenClientName(""); }}
            />
          </Suspense>
        )}
      </div>
    </div>,
    document.body
  );
};

export default CompanyFilesPanel;
