import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import axios from "../../api/axiosInstance";
import { Spinner } from "react-bootstrap";
import { FiPlus, FiMinus, FiLink, FiTrash2, FiFolder, FiChevronDown, FiChevronUp, FiChevronsUp,
  FiList, FiGrid, FiImage, FiSearch, FiArrowUp, FiDownload, FiEye, FiRefreshCw, FiX, FiFolderPlus, FiFilePlus, FiUploadCloud, FiCalendar } from "react-icons/fi";
import { fileTypeMeta, shortName, formatBytes } from "../../utils/fileUtils";
import { loadFileSettings } from "../user/profile/DesignSettings";
import { DOCK_ICONS, DOCK_IMAGES } from "../../components/dock/dockIcons";
import CompanyFilesPanel from "./CompanyFilesPanel";
import "./ClientFilesPanel.css";

/* ── Провідник: режими перегляду ────────────────────────────────────────
   table  — колонки (назва/тип/розмір/дата), як було
   tiles  — середні плитки: іконка + назва + рядок мети
   icons  — велика сітка з прев'ю зображень
   Вибір режиму і стан панелі деталей переживають перезавантаження. */
const VIEW_KEY = "printpeaks_files_view";
const PREVIEW_KEY = "printpeaks_files_preview";
const VIEWS = [
  { id: "table", label: "Таблиця", icon: <FiList size={14} /> },
  { id: "tiles", label: "Плитки", icon: <FiGrid size={14} /> },
  { id: "icons", label: "Великі іконки", icon: <FiImage size={14} /> },
];

/* прев'ю тягнемо тим самим download-ендпоінтом (окремого thumbnail на
   бекенді немає), тому за розміром — лише невеликі зображення, інакше
   сітка з важкими сканами вбила б і мережу, і пам'ять */
const FILE_ORDER_EDITORS = [
  { value: "SheetCutBW", label: "Black & White", icon: "printer", tint: "--adminorange" },
  { value: "SheetCut", label: "Digital Print", icon: "printer", tint: "--adminorange" },
  { value: "Photo", label: "Photo", icon: "photo", tint: "--adminorange" },
  { value: "Wide", label: "Wide Photo", icon: "wideprint", tint: "--adminorange" },
  { value: "DigitalPrintWide", label: "Digital Print Wide", icon: "wideprint", tint: "--adminorange" },
  { value: "Vishichka", label: "Plotter Cut", icon: "plotter", tint: "--adminblue" },
  { value: "Magnets", label: "Magnets", icon: "magnet", tint: "--adminblue" },
  { value: "Laminator", label: "Lamination", icon: "laminate", tint: "--adminblue" },
  { value: "PerepletMet", label: "Binding", icon: "binding", tint: "--adminblue" },
  { value: "BigOvshik", label: "Postpress", icon: "postpress", tint: "--adminblue" },
  { value: "Calendar", label: "Calendar", icon: "calendar", tint: "--adminrose" },
  { value: "Diplom", label: "Diplom", icon: "diploma", tint: "--adminrose" },
  { value: "Folder", label: "Folder", icon: "folder", tint: "--adminrose" },
  { value: "Note", label: "Note", icon: "note", tint: "--adminrose" },
  { value: "Booklet", label: "Booklet", icon: "booklet", tint: "--adminrose" },
  { value: "Cup", label: "Mug", icon: "mug", tint: "--adminrose" },
  { value: "Scans", label: "Scans", icon: "scan", tint: "--adminpurple" },
  { value: "Delivery", label: "Delivery", icon: "car", tint: "--adminpurple" },
  { value: "WideFactory", label: "Wide Factory", icon: "factory", tint: "--adminpurple" },
];

const FILE_EDITOR_LABELS = {
  SheetCutBW: "\u0427/\u0411 \u0434\u0440\u0443\u043a",
  SheetCut: "\u0426\u0438\u0444\u0440\u043e\u0432\u0438\u0439 \u0434\u0440\u0443\u043a",
  Photo: "\u0424\u043e\u0442\u043e\u0434\u0440\u0443\u043a",
  Wide: "\u0428\u0438\u0440\u043e\u043a\u0435 \u0444\u043e\u0442\u043e",
  DigitalPrintWide: "\u0428\u0438\u0440\u043e\u043a\u0438\u0439 \u0434\u0440\u0443\u043a",
  Vishichka: "\u041f\u043b\u043e\u0442\u0435\u0440\u043d\u0430 \u043f\u043e\u0440\u0456\u0437\u043a\u0430",
  Magnets: "\u041c\u0430\u0433\u043d\u0456\u0442\u0438",
  Laminator: "\u041b\u0430\u043c\u0456\u043d\u0430\u0446\u0456\u044f",
  PerepletMet: "\u041f\u0435\u0440\u0435\u043f\u043b\u0456\u0442",
  BigOvshik: "\u041f\u043e\u0441\u0442\u043f\u0440\u0435\u0441",
  Calendar: "\u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u0456",
  Diplom: "\u0414\u0438\u043f\u043b\u043e\u043c\u0438",
  Folder: "\u041f\u0430\u043f\u043a\u0438",
  Note: "\u0411\u043b\u043e\u043a\u043d\u043e\u0442\u0438",
  Booklet: "\u0411\u0443\u043a\u043b\u0435\u0442\u0438",
  Cup: "\u0427\u0430\u0448\u043a\u0438",
  Scans: "\u0421\u043a\u0430\u043d\u0443\u0432\u0430\u043d\u043d\u044f",
  Delivery: "\u0414\u043e\u0441\u0442\u0430\u0432\u043a\u0430",
  WideFactory: "\u0428\u0438\u0440\u043e\u043a\u0438\u0439 \u0446\u0435\u0445",
};

const FILE_EDITOR_GROUPS = [
  { id: "print", label: "\u0414\u0440\u0443\u043a", tint: "--adminorange", values: ["SheetCutBW", "SheetCut", "Photo", "Wide", "DigitalPrintWide"] },
  { id: "postpress", label: "\u041f\u043e\u0441\u0442\u043f\u0440\u0435\u0441", tint: "--adminblue", values: ["Vishichka", "Magnets", "Laminator", "PerepletMet", "BigOvshik"] },
  { id: "goods", label: "\u0422\u043e\u0432\u0430\u0440\u0438", tint: "--adminrose", values: ["Calendar", "Diplom", "Folder", "Note", "Booklet", "Cup"] },
  { id: "services", label: "\u041f\u043e\u0441\u043b\u0443\u0433\u0438", tint: "--adminpurple", values: ["Scans", "Delivery", "WideFactory"] },
];

FILE_ORDER_EDITORS.forEach((editor) => {
  editor.label = FILE_EDITOR_LABELS[editor.value];
});

const THUMB_LIMIT = 6 * 1024 * 1024;
const isImageFile = (f) => String(f?.mimeType || "").startsWith("image/") && (f?.size || 0) <= THUMB_LIMIT;
const isPdfFile = (f) => String(f?.mimeType || "") === "application/pdf";

/* Кеш об'єктних URL на весь модуль: та сама картинка не тягнеться вдруге
   ні при зміні режиму, ні при поверненні в папку. */
const blobCache = new Map();

const fetchBlobUrl = async (fileId) => {
  if (blobCache.has(fileId)) return blobCache.get(fileId);
  const res = await axios.get(`/api/client-files/files/${fileId}/download`, { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  blobCache.set(fileId, url);
  return url;
};

/* Мініатюра однієї плитки: вантажиться, коли плитка з'явилась у вьюпорті —
   у папці на сотні сканів інакше стартували б сотні запитів одразу. */
const CfpThumb = ({ file, fallback }) => {
  const [url, setUrl] = useState(() => blobCache.get(file.id) || null);
  const ref = useRef(null);

  useEffect(() => {
    if (url || !isImageFile(file) || !ref.current) return undefined;
    let alive = true;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((en) => en.isIntersecting)) return;
      io.disconnect();
      fetchBlobUrl(file.id).then((u) => { if (alive) setUrl(u); }).catch(() => {});
    }, { rootMargin: "200px" });
    io.observe(ref.current);
    return () => { alive = false; io.disconnect(); };
  }, [file, url]);

  if (url) return <img ref={ref} className="cfp-thumb-img" src={url} alt="" draggable={false} />;
  return <span ref={ref} className="cfp-thumb-glyph">{fallback}</span>;
};

const ClientFilesPanel = ({
  userId,
  clientName = "",
  onClose,
  selectMode = false,
  onSelectFile,
  orderId,
  companyId,
  companyName = "",
  workspaceSwapped = false,
  onToggleWorkspaceSwap,
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

  /* ── стан провідника ── */
  const [viewMode, setViewMode] = useState(() => {
    try { return localStorage.getItem(VIEW_KEY) || "table"; } catch { return "table"; }
  });
  const [showPreview, setShowPreview] = useState(() => {
    try { return localStorage.getItem(PREVIEW_KEY) !== "0"; } catch { return true; }
  });
  /* Виділення множинне: Ctrl/Cmd — додати-зняти по одному, Shift —
     діапазон від попереднього кліку, звичайний клік — лише цей файл.
     Деталі показують останній вибраний. */
  const [selectedIds, setSelectedIds] = useState([]);
  const anchorRef = useRef(null);
  const [query, setQuery] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [ctxMenu, setCtxMenu] = useState(null); // {x, y, file}

  const dragCounter = useRef(0);
  const inputRef = useRef(null);
  const dirInputRef = useRef(null);   // окремий input із webkitdirectory

  useEffect(() => { try { localStorage.setItem(VIEW_KEY, viewMode); } catch {} }, [viewMode]);
  useEffect(() => { try { localStorage.setItem(PREVIEW_KEY, showPreview ? "1" : "0"); } catch {} }, [showPreview]);

  // In the inline order workspace the preview is a permanent part of the layout.
  useEffect(() => {
    if (inline) setShowPreview(true);
  }, [inline]);
  useEffect(() => {
    if (!inline || !orderId) return undefined;
    const syncFileSearch = (event) => setQuery(String(event.detail?.query ?? ""));
    setQuery(String(window.__ppFileSearchQuery ?? ""));
    window.addEventListener("pp-file-search", syncFileSearch);
    return () => window.removeEventListener("pp-file-search", syncFileSearch);
  }, [inline, orderId]);

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

  /**
   * Відкрити або зберегти файл.
   *
   * Бекенд для зображень і PDF віддає Content-Disposition: inline, тому
   * без прапорця вони відкриваються вкладкою (це і є «Відкрити»). Дія
   * «Завантажити» передає download:true й зберігає файл на диск попри
   * inline — інакше замість збереження щоразу відкривалась вкладка.
   *
   * @param {number} fileId
   * @param {{download?: boolean, name?: string}} [opts]
   */
  const openFile = async (fileId, opts = {}) => {
    const { download = false, name } = opts;
    try {
      const res = await axios.get(`/api/client-files/files/${fileId}/download`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: res.headers["content-type"] || "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const disposition = res.headers["content-disposition"] || "";
      const isInline = disposition.startsWith("inline");

      if (isInline && !download) {
        window.open(url, "_blank");
      } else {
        const match = disposition.match(/filename="?([^"]+)"?/);
        const a = document.createElement("a");
        a.href = url;
        // ім'я з заголовка, інакше — те, що показує список
        a.download = match ? decodeURIComponent(match[1]) : (name || "file");
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      setError("Не вдалось завантажити файл");
    }
  };

  const downloadFile = (f) =>
    openFile(f.id, { download: true, name: f.originalName || f.fileName });

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
      setSortDesc(col !== "name");
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

  /* пошук — по видимій назві, у межах поточної папки */
  const visibleFiles = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedFiles;
    return sortedFiles.filter((f) =>
      String(f.originalName || f.fileName || "").toLowerCase().includes(q));
  }, [sortedFiles, query]);

  const selectedId = selectedIds.length ? selectedIds[selectedIds.length - 1] : null;

  const selectedFile = React.useMemo(
    () => visibleFiles.find((f) => (f.id || f.fileName) === selectedId) || null,
    [visibleFiles, selectedId]);

  /* усі виділені файли (без папок) — для гуртового завантаження
     й прив'язки до наряду */
  const selectedFiles = React.useMemo(
    () => visibleFiles.filter((f) => selectedIds.includes(f.id || f.fileName)),
    [visibleFiles, selectedIds]);

  const downloadableSelection = selectedFiles.filter((f) => f.mimeType !== "directory");

  // вибір скидається при зміні папки — інакше в деталях висить файл,
  // якого в новому списку вже немає
  useEffect(() => { setSelectedIds([]); anchorRef.current = null; }, [currentFolder]);

  /* Прев'ю вибраного: картинка або перша сторінка PDF (через <object>).
     Тягнемо лише коли панель деталей відкрита. */
  useEffect(() => {
    setPreviewUrl(null);
    if (!showPreview || !selectedFile || selectedFile.mimeType === "directory") return undefined;
    if (!isImageFile(selectedFile) && !isPdfFile(selectedFile)) return undefined;
    let alive = true;
    setPreviewBusy(true);
    fetchBlobUrl(selectedFile.id)
      .then((u) => { if (alive) setPreviewUrl(u); })
      .catch(() => {})
      .finally(() => { if (alive) setPreviewBusy(false); });
    return () => { alive = false; };
  }, [selectedFile, showPreview]);

  // закрити контекстне меню кліком повз нього / по Esc
  useEffect(() => {
    if (!ctxMenu) return undefined;
    const close = () => setCtxMenu(null);
    const onKey = (e) => { if (e.key === "Escape") setCtxMenu(null); };
    window.addEventListener("click", close);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("click", close); window.removeEventListener("keydown", onKey); };
  }, [ctxMenu]);

  const rowKey = (f) => f.id || f.fileName;
  const isDirectory = (f) => f?.mimeType === "directory";

  /* Клік по файлу з урахуванням модифікаторів. index — позиція у
     visibleFiles, потрібна для діапазону по Shift. */
  const selectAt = (e, key, index) => {
    if (e.shiftKey && anchorRef.current != null) {
      const from = Math.min(anchorRef.current, index);
      const to = Math.max(anchorRef.current, index);
      setSelectedIds(visibleFiles.slice(from, to + 1).map(rowKey));
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      anchorRef.current = index;
      setSelectedIds((prev) => (prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]));
      return;
    }
    anchorRef.current = index;
    setSelectedIds([key]);
  };

  /* Гуртове завантаження: браузер блокує лавину одночасних збережень,
     тому файли йдуть по одному з невеликою паузою. */
  const downloadSelection = async () => {
    for (const f of downloadableSelection) {
      // eslint-disable-next-line no-await-in-loop
      await downloadFile(f);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 350));
    }
  };

  /* Прив'язати все виділене до поточного наряду */
  const linkSelection = async () => {
    for (const f of selectedFiles) {
      if (isLinkedToCurrentOrder(f)) continue;
      // eslint-disable-next-line no-await-in-loop
      await linkToOrder(f);
    }
  };

  /* один клік — вибір, подвійний — відкрити (папку зайти, файл відкрити) */
  const activate = (f) => {
    if (isDirectory(f)) openSubfolder(f.fileName);
    else openFile(f.id);
  };

  const breadcrumbs = currentFolder ? currentFolder.split("/") : [];
  const goToCrumb = (idx) => setCurrentFolder(breadcrumbs.slice(0, idx + 1).join("/"));

  const SortArrow = ({ col }) => {
    if (sortColumn !== col) return <FiChevronsUp size={11} style={{ opacity: 0.3, marginLeft: 4 }}/>;
    return sortDesc
      ? <FiChevronDown size={11} style={{ color: "currentColor", marginLeft: 4 }}/>
      : <FiChevronUp size={11} style={{ color: "currentColor", marginLeft: 4 }}/>;
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
        {/* ── ПАНЕЛЬ ІНСТРУМЕНТІВ ────────────────────────────────────
            Навігація (назад/вгору + хлібні крихти), пошук у поточній
            папці, перемикач режиму перегляду і дії над сховищем. */}
        <div className="cfp-toolbar">
          <div className="cfp-toolbar-nav">
            <button
              type="button"
              className="cfp-tool-btn"
              onClick={goBack}
              disabled={!currentFolder}
              title="На рівень вище"
            ><FiArrowUp size={15} /></button>
            <div className="cfp-view-switch cfp-view-switch--left" role="group" aria-label={"\u0420\u0435\u0436\u0438\u043c \u043f\u0435\u0440\u0435\u0433\u043b\u044f\u0434\u0443"}>
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`cfp-view-btn${viewMode === v.id ? " is-active" : ""}`}
                  onClick={() => setViewMode(v.id)}
                  title={v.label}
                >{v.icon}</button>
              ))}
            </div>

            <button
              type="button"
              className="cfp-tool-btn cfp-refresh-action cfp-refresh-action--left"
              onClick={() => fetchFiles()}
              title={"\u041e\u043d\u043e\u0432\u0438\u0442\u0438"}
              aria-label={"\u041e\u043d\u043e\u0432\u0438\u0442\u0438 \u0441\u043f\u0438\u0441\u043e\u043a \u0444\u0430\u0439\u043b\u0456\u0432"}
            ><FiRefreshCw /></button>

            <div className="cfp-crumbs">
              {/* Корінь — не кнопка, а підпис: він називає сховище (папка
                  компанії або клієнта) разом із номером. Повернутись у
                  корінь є чим — стрілка «вгору» ліворуч. */}
              <button
                type="button"
                className="cfp-crumb cfp-crumb-root"
                onClick={() => setCurrentFolder("")}
              >
                {companyId
                  ? `Файли компанії №${companyId}`
                  : `Файли клієнта №${userId}`}
              </button>
              {breadcrumbs.map((part, i) => (
                <React.Fragment key={`${part}-${i}`}>
                  <span className="cfp-crumb-sep">/</span>
                  <button type="button" className="cfp-crumb" onClick={() => goToCrumb(i)}>{part}</button>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="cfp-toolbar-right">
            <label className="cfp-search">
              <FiSearch size={13} />
              <input
                type="text"
                value={query}
                placeholder="Пошук у папці"
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button type="button" className="cfp-search-clear" onClick={() => setQuery("")}>
                  <FiX size={12} />
                </button>
              )}
            </label>

            <div className="cfp-sort-switch" role="group" aria-label={"\u0421\u043e\u0440\u0442\u0443\u0432\u0430\u043d\u043d\u044f \u0444\u0430\u0439\u043b\u0456\u0432"}>
              <button
                type="button"
                className={`cfp-sort-btn${sortColumn === "name" ? " is-active" : ""}`}
                onClick={() => toggleSort("name")}
                title={"\u0421\u043e\u0440\u0442\u0443\u0432\u0430\u0442\u0438 \u0437\u0430 \u043d\u0430\u0437\u0432\u043e\u044e"}
              >
                <span className="cfp-sort-letter" aria-hidden="true">{"\u0407"}</span>
                <SortArrow col="name" />
              </button>
              <button
                type="button"
                className={`cfp-sort-btn${sortColumn === "date" ? " is-active" : ""}`}
                onClick={() => toggleSort("date")}
                title={"\u0421\u043e\u0440\u0442\u0443\u0432\u0430\u0442\u0438 \u0437\u0430 \u0434\u0430\u0442\u043e\u044e"}
              >
                <FiCalendar className="cfp-sort-icon" aria-hidden="true" />
                <SortArrow col="date" />
              </button>
            </div>

            <div className="cfp-view-switch" role="group" aria-label="Режим перегляду">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`cfp-view-btn${viewMode === v.id ? " is-active" : ""}`}
                  onClick={() => setViewMode(v.id)}
                  title={v.label}
                >{v.icon}</button>
              ))}
            </div>

            {downloadableSelection.length > 0 && (
              <button
                type="button"
                className="cfp-tool-btn cfp-tool-btn--wide"
                onClick={downloadSelection}
                title={`Завантажити вибране (${downloadableSelection.length})`}
              >
                <FiDownload size={14} />
                <span>{downloadableSelection.length}</span>
              </button>
            )}

            {orderId && selectedFiles.length > 1 && (
              <button
                type="button"
                className="cfp-tool-btn cfp-tool-btn--wide"
                onClick={linkSelection}
                title={`Прив'язати вибране до наряду ${orderId}`}
              >
                <FiPlus size={14} />
                <span>у наряд</span>
              </button>
            )}

            <button
              type="button"
              className={`cfp-tool-btn cfp-preview-toggle${showPreview ? " is-active" : ""}`}
              onClick={() => setShowPreview((v) => !v)}
              title="Панель перегляду"
            ><FiEye size={15} /></button>

            <button
              type="button"
              className="cfp-tool-btn cfp-refresh-action"
              onClick={() => fetchFiles()}
              title="Оновити"
              aria-label="Оновити список файлів"
            ><FiRefreshCw /></button>

            <button className="nui-client-rect-btn cfp-toolbar-action" onClick={createFolder} title="Нова папка">
              <FiFolderPlus aria-hidden="true" />
              <span className="nui-client-rect-btn-text">Нова папка</span>
            </button>
            <button
              className="nui-client-rect-btn cfp-toolbar-action"
              onClick={() => inputRef.current?.click()}
              title="Додати файли — або перетягніть сюди файли чи цілу папку"
            >
              <FiFilePlus aria-hidden="true" />
              <span className="nui-client-rect-btn-text">Додати файли</span>
            </button>
            <button
              className="nui-client-rect-btn cfp-toolbar-action"
              onClick={() => dirInputRef.current?.click()}
              title="Додати папку з диска — структура підпапок збережеться"
            >
              <FiUploadCloud aria-hidden="true" />
              <span className="nui-client-rect-btn-text">Додати папку</span>
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={(e) => uploadFiles(e.target.files)}
          />

          {/* Вибір цілої папки: webkitdirectory дає файлам
              webkitRelativePath, з якого uploadFiles відтворює підпапки.
              Атрибути нестандартні для JSX, тому пишемо їх малими. */}
          <input
            ref={dirInputRef}
            type="file"
            multiple
            webkitdirectory=""
            directory=""
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

        {loading && (
          <div style={{ textAlign: "center", padding: 12 }}>
            <Spinner animation="grow" variant="dark" size="sm"/>
          </div>
        )}
        {error && <div className="alert alert-danger" style={{ margin: "0 16px" }}>{error}</div>}

        {/* ── ТІЛО: вміст папки + панель деталей ── */}
        <div className={`cfp-body${showPreview ? " has-preview" : ""}`}>
          <div
            className={`cfp-content cfp-content--${viewMode}`}
            onClick={() => { setSelectedIds([]); anchorRef.current = null; }}
          >
            {!loading && visibleFiles.length === 0 && (
              <div className="cfp-empty">
                {query ? "Нічого не знайдено" : "Файлів поки немає"}
              </div>
            )}

            {viewMode === "table" && visibleFiles.length > 0 && (
              <div className="cfp-list-header">
                <div></div>
                <div className="cfp-sort-col" onClick={() => toggleSort("name")}>Назва<SortArrow col="name"/></div>
                <div className="cfp-sort-col" onClick={() => toggleSort("type")}>Тип<SortArrow col="type"/></div>
                <div className="cfp-sort-col" onClick={() => toggleSort("size")}>Розмір<SortArrow col="size"/></div>
                <div className="cfp-sort-col" onClick={() => toggleSort("date")}>Дата<SortArrow col="date"/></div>
                <div>Зам.</div>
                <div><FiTrash2 size={13}/></div>
              </div>
            )}

            {visibleFiles.map((f, index) => {
              const isDir = isDirectory(f);
              const name = f.originalName || f.fileName;
              const meta = isDir
                ? { icon: <FiFolder size={24}/>, color: "var(--adminorange, #f5a623)" }
                : fileTypeMeta(name);
              const key = rowKey(f);
              const selected = selectedIds.includes(key);

              const common = {
                onClick: (e) => { e.stopPropagation(); selectAt(e, key, index); },
                onDoubleClick: (e) => { e.stopPropagation(); activate(f); },
                onContextMenu: (e) => {
                  e.preventDefault(); e.stopPropagation();
                  // правий клік по невиділеному — виділяє лише його, по
                  // виділеному — зберігає поточну групу
                  if (!selectedIds.includes(key)) { anchorRef.current = index; setSelectedIds([key]); }
                  setCtxMenu({ x: e.clientX, y: e.clientY, file: f });
                },
                title: name,
              };

              if (viewMode === "table") {
                return (
                  <div
                    key={key}
                    className={`cfp-file-row${selected ? " is-selected" : ""}`}
                    {...common}
                  >
                    <div className="cfp-file-icon" style={{ color: meta.color }}>{meta.icon}</div>
                    <div className="cfp-file-name">{name}</div>
                    <div className="cfp-file-type">{isDir ? "—" : getExt(name)}</div>
                    <div className="cfp-file-size">{isDir ? "—" : formatBytes(f.size)}</div>
                    <div className="cfp-file-date">{isDir ? "" : formatDate(f.createdAt)}</div>
                    <div className="cfp-file-orders">
                      {linkedOrderIds(f).map(oid => (
                        <span key={oid} className={`cfp-order-badge${oid === orderId ? " cfp-order-badge--current" : ""}`}>
                          {oid}
                          <button
                            className="cfp-order-unlink-btn"
                            onClick={(e) => { e.stopPropagation(); unlinkFromOrder(f.id, oid); }}
                            title={`Відв'язати від замовлення ${oid}`}
                          ><FiMinus size={10}/></button>
                        </span>
                      ))}
                      {orderId && (
                        <button
                          className={`cfp-order-plus-btn${isLinkedToCurrentOrder(f) ? " cfp-order-plus-btn--muted" : ""}`}
                          onClick={(e) => { e.stopPropagation(); linkToOrder(f); }}
                          title={`Прив'язати до замовлення ${orderId}`}
                          disabled={isLinkedToCurrentOrder(f)}
                        ><FiPlus size={12}/></button>
                      )}
                    </div>
                    <div className="cfp-file-actions">
                      {isDir ? null : selectMode ? (
                        <button
                          className="cfp-select-btn"
                          onClick={(e) => { e.stopPropagation(); onSelectFile?.(f.id); }}
                          title="Прив'язати до замовлення"
                        ><FiLink size={14}/></button>
                      ) : (
                        <button
                          className="cfp-admin-btn cfp-admin-btn-red"
                          onClick={(e) => { e.stopPropagation(); deleteFile(f.id); }}
                          title="Видалити файл"
                        >
                          <span className="cfp-btn-inner"><FiTrash2 size={14}/></span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              // плитки й великі іконки — та сама картка, різний масштаб
              return (
                <div
                  key={key}
                  className={`cfp-card${selected ? " is-selected" : ""}`}
                  {...common}
                >
                  <div className="cfp-card-thumb" style={{ color: meta.color }}>
                    {isDir || !isImageFile(f)
                      ? <span className="cfp-thumb-glyph">{meta.icon}</span>
                      : <CfpThumb file={f} fallback={meta.icon} />}
                  </div>
                  <div className="cfp-card-name">{shortName(name, viewMode === "icons" ? 28 : 36)}</div>
                  <div className="cfp-card-meta">
                    {isDir ? "папка" : `${getExt(name) || "файл"} · ${formatBytes(f.size)}`}
                  </div>
                  <div className="cfp-card-orders">
                    {linkedOrderIds(f).map(oid => (
                      <span key={oid} className={`cfp-order-badge${oid === orderId ? " cfp-order-badge--current" : ""}`}>
                        {oid}
                        <button
                          className="cfp-order-unlink-btn"
                          onClick={(e) => { e.stopPropagation(); unlinkFromOrder(f.id, oid); }}
                          title={`Відв'язати від замовлення ${oid}`}
                        ><FiMinus size={10}/></button>
                      </span>
                    ))}
                    {orderId && (
                      <button
                        className={`cfp-order-plus-btn${isLinkedToCurrentOrder(f) ? " cfp-order-plus-btn--muted" : ""}`}
                        onClick={(e) => { e.stopPropagation(); linkToOrder(f); }}
                        title={`Прив'язати до замовлення ${orderId}`}
                        disabled={isLinkedToCurrentOrder(f)}
                      ><FiPlus size={12}/></button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── ПАНЕЛЬ ПЕРЕГЛЯДУ ── */}
          {showPreview && (
            <aside className="cfp-preview">
              {!selectedFile ? (
                /* без файлу панель просто порожня — підпис «Виберіть файл»
                   прибрано на прохання: він нічого не додавав */
                null
              ) : (
                <>
                  <div className="cfp-preview-stage">
                    {previewBusy && <Spinner animation="grow" variant="dark" size="sm"/>}
                    {!previewBusy && previewUrl && isImageFile(selectedFile) && (
                      <img className="cfp-preview-img" src={previewUrl} alt="" />
                    )}
                    {!previewBusy && previewUrl && isPdfFile(selectedFile) && (
                      <object className="cfp-preview-pdf" data={previewUrl} type="application/pdf">
                        <span className="cfp-preview-note">PDF не показується — відкрийте файл</span>
                      </object>
                    )}
                    {!previewBusy && !previewUrl && (
                      <span
                        className="cfp-preview-glyph"
                        style={{ color: isDirectory(selectedFile)
                          ? "var(--adminorange, #f5a623)"
                          : fileTypeMeta(selectedFile.originalName || selectedFile.fileName).color }}
                      >
                        {isDirectory(selectedFile)
                          ? <FiFolder size={64}/>
                          : fileTypeMeta(selectedFile.originalName || selectedFile.fileName).icon}
                      </span>
                    )}
                  </div>

                  <div className="cfp-preview-name">{selectedFile.originalName || selectedFile.fileName}</div>

                  <dl className="cfp-preview-props">
                    <dt>Тип</dt>
                    <dd>{isDirectory(selectedFile) ? "папка" : (getExt(selectedFile.originalName || selectedFile.fileName) || "—")}</dd>
                    <dt>Розмір</dt>
                    <dd>{isDirectory(selectedFile) ? "—" : formatBytes(selectedFile.size)}</dd>
                    <dt>Додано</dt>
                    <dd>{formatDate(selectedFile.createdAt) || "—"}</dd>
                    <dt>Замовлення</dt>
                    <dd>
                      {linkedOrderIds(selectedFile).length
                        ? linkedOrderIds(selectedFile).join(", ")
                        : "—"}
                    </dd>
                  </dl>

                  <div className="cfp-preview-actions">
                    <button className="nui-client-rect-btn" onClick={() => activate(selectedFile)}>
                      <span className="nui-client-rect-btn-text">
                        {isDirectory(selectedFile) ? "Відкрити папку" : "Відкрити"}
                      </span>
                    </button>
                    {orderId && (
                      <button
                        className="nui-client-rect-btn"
                        onClick={() => linkToOrder(selectedFile)}
                        disabled={isLinkedToCurrentOrder(selectedFile)}
                      >
                        <span className="nui-client-rect-btn-text">
                          {isLinkedToCurrentOrder(selectedFile) ? "Вже в наряді" : "У наряд"}
                        </span>
                      </button>
                    )}
                    {!isDirectory(selectedFile) && (
                      <button className="nui-client-rect-btn" onClick={() => deleteFile(selectedFile.id)}>
                        <span className="nui-client-rect-btn-text">Видалити</span>
                      </button>
                    )}
                  </div>
                </>
              )}
              {inline && orderId && (
                <section className="cfp-order-editors" aria-label="Order services">
                  <div className="cfp-order-editors-head">
                    <strong>{"\u0414\u043e\u0434\u0430\u0442\u0438 \u0434\u043e \u0437\u0430\u043c\u043e\u0432\u043b\u0435\u043d\u043d\u044f"}</strong>
                    <span>{"\u041e\u0431\u0435\u0440\u0456\u0442\u044c \u043f\u043e\u0441\u043b\u0443\u0433\u0443"}</span>
                  </div>
                  <div className="cfp-order-editor-groups">
                    {FILE_EDITOR_GROUPS.map((group) => (
                      <section
                        key={group.id}
                        className={`cfp-order-editor-group is-${group.id}`}
                        style={{ "--cfp-group-tint": `var(${group.tint}, #666)` }}
                      >
                        <h3 className="cfp-order-editor-group-title">{group.label}</h3>
                        <div className="cfp-order-editors-grid">
                          {FILE_ORDER_EDITORS.filter((editor) => group.values.includes(editor.value)).map((editor) => {
                            const image = DOCK_IMAGES[editor.value];
                            return (
                              <button
                                key={editor.value}
                                type="button"
                                className="cfp-order-editor-btn"
                                style={{ "--cfp-editor-tint": `var(${editor.tint}, #666)` }}
                                onClick={() => window.dispatchEvent(new CustomEvent(
                                  "pp-open-order-editor",
                                  { detail: { value: editor.value } }
                                ))}
                                title={editor.label}
                              >
                                <span className={`cfp-order-editor-icon${image ? " has-img" : ""}`} aria-hidden="true">
                                  {image ? <img src={image} alt="" draggable={false} /> : DOCK_ICONS[editor.icon]}
                                </span>
                                <span className="cfp-order-editor-label">{editor.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </section>
              )}
              {inline && orderId && onToggleWorkspaceSwap && (
                <button
                  type="button"
                  className={`cfp-workspace-swap${workspaceSwapped ? " is-swapped" : ""}`}
                  onClick={onToggleWorkspaceSwap}
                  title={workspaceSwapped ? "Повернути блоки на місце" : "Поміняти крайні блоки місцями"}
                  aria-label={workspaceSwapped ? "Повернути блоки на місце" : "Поміняти крайні блоки місцями"}
                >
                  <span className="cfp-workspace-swap-arrow" aria-hidden="true" />
                </button>
              )}
            </aside>
          )}
        </div>

        {/* контекстне меню — той самий набір дій, що й у панелі деталей */}
        {ctxMenu && (
          <div className="cfp-ctx" style={{ left: ctxMenu.x, top: ctxMenu.y }} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => { activate(ctxMenu.file); setCtxMenu(null); }}>
              {isDirectory(ctxMenu.file) ? "Відкрити папку" : "Відкрити"}
            </button>
            {!isDirectory(ctxMenu.file) && (
              <button
                type="button"
                onClick={() => {
                  if (downloadableSelection.length > 1) downloadSelection();
                  else downloadFile(ctxMenu.file);
                  setCtxMenu(null);
                }}
              >
                <FiDownload size={12}/>
                {downloadableSelection.length > 1
                  ? `Завантажити вибране (${downloadableSelection.length})`
                  : "Завантажити"}
              </button>
            )}
            {orderId && (
              <button
                type="button"
                disabled={isLinkedToCurrentOrder(ctxMenu.file)}
                onClick={() => { linkToOrder(ctxMenu.file); setCtxMenu(null); }}
              >У наряд {orderId}</button>
            )}
            {!isDirectory(ctxMenu.file) && (
              <button type="button" className="is-danger" onClick={() => { deleteFile(ctxMenu.file.id); setCtxMenu(null); }}>
                <FiTrash2 size={12}/> Видалити
              </button>
            )}
          </div>
        )}

        {/* ── СТАТУС-РЯДОК ──
            На сторінці наряду (inline) прибраний на прохання користувача:
            лічильник об'єктів і «Локальна папка» там лише з'їдали висоту.
            У модальному провіднику лишається — це єдиний вхід у локальну
            папку й у файли компанії. */}
        {!inline && (
        <div className="cfp-statusbar">
          <button className="cfp-status-link" onClick={openFolder} title="Відкрити папку на цьому ПК">
            <FiFolder size={13}/>
            <span>Локальна папка</span>
          </button>

          <span className="cfp-statusbar-text">
            {`Об'єктів: ${visibleFiles.length}`}
            {query && files.length !== visibleFiles.length && ` з ${files.length}`}
            {selectedIds.length > 1
              ? ` · вибрано: ${selectedIds.length}`
              : selectedFile ? ` · вибрано: ${shortName(selectedFile.originalName || selectedFile.fileName, 30)}` : ""}
          </span>

          {companyId && !inline ? (
            <button className="cfp-status-link" onClick={() => setShowCompanyFiles(true)} title="Файли компанії">
              <FiFolder size={13}/>
              <span>Файли компанії</span>
            </button>
          ) : <span/>}
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
