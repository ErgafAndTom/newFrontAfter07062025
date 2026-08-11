import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import axios from "../../api/axiosInstance";
import { Spinner } from "react-bootstrap";
import { FiPlus, FiMinus, FiLink, FiTrash2, FiFolder, FiChevronLeft, FiChevronDown, FiChevronUp, FiChevronsUp } from "react-icons/fi";
import { fileTypeMeta, shortName, formatBytes } from "../../utils/fileUtils";
import { loadFileSettings } from "../user/profile/DesignSettings";
import CompanyFilesPanel from "./CompanyFilesPanel";
import "./ClientFilesPanel.css";

const ClientFilesPanel = ({
  userId,
  clientName = "",
  onClose,
  selectMode = false,
  onSelectFile,
  orderId,
  companyId,
  companyName = "",
  // inline — панель вбудована в сторінку (колонка клієнта в наряді), а не
  // відкрита оверлеєм поверх усього: без порталу, без затемнення й без
  // закриття по кліку повз неї.
  inline = false,
}) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null); // null | {name, percent}
  const [dragActive, setDragActive] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(""); // підпапка відносно кореня
  const [sortColumn, setSortColumn] = useState(null); // "name" | "type" | "size" | "date"
  const [sortDesc, setSortDesc] = useState(true); // true = DESC (більше→менше)
  const [showCompanyFiles, setShowCompanyFiles] = useState(false);
  const dragCounter = useRef(0);
  const inputRef = useRef(null);

  const fetchFiles = useCallback(async (silent = false) => {
    if (!userId) return;
    try {
      if (!silent) { setError(null); setLoading(true); }
      await axios.post(`/api/client-files/users/${userId}/sync`).catch(() => {});
      const params = currentFolder ? { folder: currentFolder } : {};
      const res = await axios.get(`/api/client-files/users/${userId}`, { params });
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      if (!silent) setError(e.message || "Помилка отримання файлів");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [userId, currentFolder]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  // Автооновлення кожні 5 сек (тихий sync + fetch)
  useEffect(() => {
    if (!userId) return;
    const id = setInterval(() => fetchFiles(true), 5000);
    return () => clearInterval(id);
  }, [userId, fetchFiles]);


  const uploadFile = async (file, subfolderOverride) => {
    if (!userId || !file) return;
    const formData = new FormData();
    formData.append("file", file, file.name);

    // Визначити підпапку: subfolderOverride (з webkitdirectory) або currentFolder
    const folder = subfolderOverride || currentFolder || "";
    if (folder) formData.append("folder", folder);

    setUploadProgress({ name: file.name, percent: 0 });

    try {
      const res = await axios.post(`/api/client-files/users/${userId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          const total = evt.total || file.size || 1;
          const pct = Math.round((evt.loaded * 100) / total);
          setUploadProgress({ name: file.name, percent: pct });
        },
      });
      setFiles(prev => [res.data, ...prev]);
    } catch (e) {
      setError(e.message || `Помилка завантаження: ${file.name}`);
    } finally {
      setUploadProgress(null);
    }
  };

  const uploadFiles = async (fileList) => {
    const list = Array.from(fileList);
    for (const file of list) {
      // webkitRelativePath = "FolderName/subfolder/file.ext"
      // Беремо все крім імені файлу як підпапку
      const relPath = file.webkitRelativePath || "";
      const parts = relPath.split("/");
      let subfolder = "";
      if (parts.length > 1) {
        // "MyFolder/sub/file.pdf" → "MyFolder/sub"
        const dirParts = parts.slice(0, -1);
        subfolder = currentFolder
          ? `${currentFolder}/${dirParts.join("/")}`
          : dirParts.join("/");
      }
      await uploadFile(file, subfolder || undefined);
    }
    // Оновити список після завантаження папки (щоб побачити нові підпапки)
    fetchFiles();
  };

  const deleteFile = async (fileId) => {
    try {
      await axios.delete(`/api/client-files/files/${fileId}`);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (e) {
      setError(e.message || "Помилка видалення");
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

  // DnD
  const onDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current += 1; setDragActive(true); };
  const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current -= 1; if (dragCounter.current <= 0) setDragActive(false); };
  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = "copy"; };
  /**
   * Збирає всі файли з перетягнутої папки, зберігаючи структуру підпапок.
   *
   * dataTransfer.files для папки віддає лише саму папку без вмісту, тому
   * читаємо дерево через webkitGetAsEntry: інакше перетягування папки
   * (єдиний шлях додати її після того, як окрему кнопку «Додати папку»
   * прибрано) молча нічого не завантажувало б.
   *
   * @returns {Promise<Array<{file: File, subfolder: string}>>}
   */
  const collectEntry = (entry, prefix = "") => new Promise((resolve) => {
    if (!entry) return resolve([]);

    if (entry.isFile) {
      return entry.file(
        (file) => resolve([{ file, subfolder: prefix }]),
        () => resolve([])
      );
    }

    if (entry.isDirectory) {
      const dirPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const reader = entry.createReader();
      const all = [];
      // readEntries віддає вміст порціями — читаємо, поки не порожньо
      const readBatch = () => reader.readEntries(async (batch) => {
        if (!batch.length) {
          const nested = await Promise.all(all.map(en => collectEntry(en, dirPath)));
          return resolve(nested.flat());
        }
        all.push(...batch);
        readBatch();
      }, () => resolve([]));
      return readBatch();
    }

    resolve([]);
  });

  const onDrop = async (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false); dragCounter.current = 0;

    const items = e.dataTransfer?.items;
    const hasEntryApi = items?.length && typeof items[0].webkitGetAsEntry === "function";

    if (hasEntryApi) {
      // знімаємо entry синхронно — після await items уже недоступні
      const entries = Array.from(items)
        .map(it => (it.kind === "file" ? it.webkitGetAsEntry() : null))
        .filter(Boolean);

      if (entries.some(en => en.isDirectory)) {
        const collected = (await Promise.all(entries.map(en => collectEntry(en)))).flat();
        for (const { file, subfolder } of collected) {
          const target = subfolder && currentFolder
            ? `${currentFolder}/${subfolder}`
            : (subfolder || currentFolder || "");
          await uploadFile(file, target || undefined);
        }
        fetchFiles();
        return;
      }
    }

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

  const linkedOrderIds = (f) => (f.OrderFileLinks || []).map(l => l.orderId);
  const isLinkedToCurrentOrder = (f) => orderId && linkedOrderIds(f).includes(orderId);

  const linkToOrder = async (file) => {
    if (!orderId) return;
    try {
      const isDir = file.mimeType === 'directory';
      let fileId = file.id;

      // Папка (FS або DB) — створити/знайти DB-запис через create-folder + лінк атомарно
      if (isDir) {
        const res = await axios.post(`/api/client-files/users/${userId}/create-folder`, {
          folder: currentFolder,
          name: file.fileName || file.originalName,
          orderId,
        });
        fileId = res.data?.id;
        if (!fileId) { setError("Не вдалось створити запис папки"); return; }
        // Явний link як fallback (якщо create-folder не створив OrderFileLink)
        await axios.post(`/api/client-files/orders/${orderId}/link`, { fileId }).catch(() => {});
        await fetchFiles();
        return;
      }

      // Звичайний файл
      if (!fileId) { setError("Файл не має ID"); return; }
      await axios.post(`/api/client-files/orders/${orderId}/link`, { fileId });
      await fetchFiles();
    } catch (e) {
      if (e.response?.status !== 409) setError("Помилка прив'язки");
      else await fetchFiles();
    }
  };

  const unlinkFromOrder = async (fileId, targetOrderId) => {
    try {
      await axios.delete(`/api/client-files/orders/${targetOrderId}/unlink/${fileId}`);
      fetchFiles();
    } catch (e) {
      setError("Помилка відв'язки");
    }
  };

  const openFolder = async () => {
    if (!userId) return;
    try {
      const fileSets = loadFileSettings();
      const { data } = await axios.post(`/api/client-files/users/${userId}/open-folder`, {
        folderMode: fileSets.folderMode,
        networkPath: fileSets.networkPath,
      });
      // Відкриваємо папку на робочому ПК через кастомний протокол ppfolder://
      if (data.folderPath) {
        const uncPath = data.folderPath.replace(/\//g, '\\');
        window.open(`ppfolder://${encodeURIComponent(uncPath)}`, '_self');
      }
    } catch (e) {
      setError("Не вдалось відкрити папку");
    }
  };

  const createFolder = async () => {
    const name = window.prompt("Назва нової папки:");
    if (!name || !name.trim()) return;
    try {
      await axios.post(`/api/client-files/users/${userId}/create-folder`, {
        folder: currentFolder,
        name: name.trim(),
      });
      fetchFiles();
    } catch (e) {
      setError(e.response?.data?.error || "Не вдалось створити папку");
    }
  };

  const openSubfolder = (folderName) => {
    setCurrentFolder(prev => prev ? `${prev}/${folderName}` : folderName);
  };

  const goBack = () => {
    setCurrentFolder(prev => {
      const parts = prev.split("/");
      parts.pop();
      return parts.join("/");
    });
  };

  const toggleSort = (col) => {
    if (sortColumn === col) {
      setSortDesc(prev => !prev);
    } else {
      setSortColumn(col);
      setSortDesc(true);
    }
  };

  // Папки завжди зверху, файли сортуються
  const sortedFiles = React.useMemo(() => {
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
        const ea = getExt(a.originalName || a.fileName);
        const eb = getExt(b.originalName || b.fileName);
        cmp = ea.localeCompare(eb, "uk");
      } else if (sortColumn === "size") {
        cmp = (a.size || 0) - (b.size || 0);
      } else if (sortColumn === "date") {
        cmp = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
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

  const panel = (
      <div
        className={`cfp-modal ${inline ? "cfp-modal--inline " : ""}${dragActive ? "cfp-drag-active" : ""}`}
        onClick={(e) => e.stopPropagation()}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* Header */}
        <div className="cfp-header">
          <div className="cfp-header-right">
            {/* Свідомо БЕЗ .cfp-admin-btn: у того класу власні ::before і
                ::after — «cover layers» з z-index:1, що ховають бордер, і
                вони боролися за той самий ::before з nui-заливкою, через
                що ховер не було видно. Лишається лише
                .nui-client-rect-btn — той самий клас, що в «Змінити
                клієнта», тож вигляд і анімація беруться з одного джерела. */}
            <button className="nui-client-rect-btn" onClick={createFolder} title="Нова папка">
              <span className="nui-client-rect-btn-text">Нова папка</span>
            </button>
            {/* «Додати папку» прибрана — папку тепер можна перетягнути в цю
                ж панель (onDrop обходить її вміст). «Додати файли» переїхала
                під список файлів (нижче) — дія над усім вмістом стоїть після
                нього, а не в шапці. */}
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={(e) => uploadFiles(e.target.files)}
          />
        </div>

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

        {/* Breadcrumb for subfolder */}
        {currentFolder && (
          <div className="cfp-breadcrumb">
            <button className="cfp-admin-btn cfp-back-btn" onClick={goBack}>
              <span className="cfp-btn-inner">
                <FiChevronLeft size={14}/>
                <span>Назад</span>
              </span>
            </button>
            <span className="cfp-breadcrumb-path">/{currentFolder}</span>
          </div>
        )}

        {/* List header */}
        <div className="cfp-list-header">
          <div></div>
          <div className="cfp-sort-col" onClick={() => toggleSort("name")}>Назва<SortArrow col="name"/></div>
          <div className="cfp-sort-col" onClick={() => toggleSort("type")}>Тип<SortArrow col="type"/></div>
          <div className="cfp-sort-col" onClick={() => toggleSort("size")}>Розмір<SortArrow col="size"/></div>
          <div className="cfp-sort-col" onClick={() => toggleSort("date")}>Дата<SortArrow col="date"/></div>
          <div>Зам.</div>
          <div><FiTrash2 size={13}/></div>
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
              <div key={f.id || f.fileName} className="cfp-file-row">
                <div className="cfp-file-icon" style={{ color: meta.color }}>
                  {meta.icon}
                </div>
                <div
                  className="cfp-file-name"
                  onClick={() => isDir ? openSubfolder(f.fileName) : openFile(f.id)}
                  title={f.originalName || f.fileName}
                >
                  {shortName(f.originalName || f.fileName, 50)}
                </div>
                <div className="cfp-file-type">{isDir ? "—" : getExt(f.originalName || f.fileName)}</div>
                <div className="cfp-file-size">{isDir ? "—" : formatBytes(f.size)}</div>
                <div className="cfp-file-date">{isDir ? "" : formatDate(f.createdAt)}</div>
                <div className="cfp-file-orders">
                  {linkedOrderIds(f).map(oid => (
                    <span key={oid} className={`cfp-order-badge${oid === orderId ? " cfp-order-badge--current" : ""}`}>
                      {oid}
                      <button
                        className="cfp-order-unlink-btn"
                        onClick={() => unlinkFromOrder(f.id, oid)}
                        title={`Відв'язати від замовлення ${oid}`}
                      ><FiMinus size={10}/></button>
                    </span>
                  ))}
                  {orderId && (
                    <button
                      className={`cfp-order-plus-btn${isLinkedToCurrentOrder(f) ? " cfp-order-plus-btn--muted" : ""}`}
                      onClick={() => linkToOrder(f)}
                      title={`Прив'язати до замовлення ${orderId}`}
                      disabled={isLinkedToCurrentOrder(f)}
                    ><FiPlus size={12}/></button>
                  )}
                </div>
                <div className="cfp-file-actions">
                  {isDir ? null : selectMode ? (
                    <button
                      className="cfp-select-btn"
                      onClick={() => onSelectFile?.(f.id)}
                      title="Прив'язати до замовлення"
                    >
                      <FiLink size={14}/>
                    </button>
                  ) : (
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

        {/* Status bar. В inline-режимі (колонка клієнта в наряді) підпис
            «Файли клієнта»/«Файли компанії» вже стоїть eyebrow-заголовком
            над панеллю, а кнопка «Файли компанії» більше не потрібна: файли
            компанії тепер не окремий перегляд, а те саме сховище, яке ця
            панель і показує. Тому тут лишається лише кількість файлів. */}
        {/* В inline-режимі внизу — сама дія «Додати файли»: лічильник і
            підпис звідси прибрані (підпис уже стоїть eyebrow-заголовком над
            панеллю, а кількість файлів видно зі списку). */}
        {inline ? (
          <div className="cfp-footer-actions">
            <button
              className="nui-client-rect-btn"
              onClick={() => inputRef.current?.click()}
              title="Додати файли — або перетягніть сюди файли чи цілу папку"
            >
              <span className="nui-client-rect-btn-text">Додати файли</span>
            </button>
          </div>
        ) : (
          <div className="cfp-statusbar-flex">
            <button className="cfp-admin-btn" onClick={openFolder} title="Відкрити папку клієнта">
              <span className="cfp-btn-inner">
                <FiFolder size={14}/>
                <span>Відкрити локальну папку</span>
              </span>
            </button>
            <span className="cfp-statusbar-text">
              {selectMode ? "Прив'язати файл" : 'Файли клієнта'}
              {clientName && ` — ${clientName}`}
              {files.length > 0 && ` (${files.filter(f => f.mimeType !== "directory").length})`}
            </span>
            {companyId ? (
              <button className="cfp-admin-btn" onClick={() => setShowCompanyFiles(true)} title="Файли компанії">
                <span className="cfp-btn-inner">
                  <FiFolder size={14}/>
                  <span>Файли компанії</span>
                </span>
              </button>
            ) : <div/>}
          </div>
        )}

        {showCompanyFiles && companyId && (
          <CompanyFilesPanel
            companyId={companyId}
            companyName={companyName}
            onClose={() => setShowCompanyFiles(false)}
          />
        )}
      </div>
  );

  if (inline) return panel;

  return ReactDOM.createPortal(
    <div className="cfp-overlay" onClick={onClose}>{panel}</div>,
    document.body
  );
};

export default ClientFilesPanel;
