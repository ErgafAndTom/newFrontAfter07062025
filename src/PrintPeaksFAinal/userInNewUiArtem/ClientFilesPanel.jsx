import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import axios from "../../api/axiosInstance";
import {
  FiPlus, FiMinus, FiLink, FiTrash2, FiFolder, FiArrowUp, FiDownload, FiRefreshCw, FiX,
  FiFolderPlus, FiFilePlus, FiUploadCloud, FiSearch, FiList, FiGrid, FiImage, FiChevronRight,
  FiChevronUp, FiChevronDown, FiExternalLink, FiCopy, FiSidebar, FiAlertTriangle,
} from "react-icons/fi";
import { formatBytes } from "../../utils/fileUtils";
import {
  FileFormatIcon, fileFormat, splitName, canBrowserRender, FORMAT_GROUPS,
} from "../../utils/printFileFormats";
import { loadFileSettings } from "../user/profile/DesignSettings";
import CompanyFilesPanel from "./CompanyFilesPanel";
import "./ClientFilesPanel.css";
import "./FileBrowser.css";

/* ══ Провідник файлів клієнта ════════════════════════════════════════════
   Розмітка — префікс pfm- (FileBrowser.css), піктограми форматів —
   utils/printFileFormats. Обгортка зберігає класи cfp-modal / cfp-modal--jtx:
   за ними розмір панелі задають модалка й сторінка наряду (jobTicket.css),
   а старі правила cfp-* усередині більше не працюють — вони лишились для
   CompanyFilesPanel / OrderFilesPanel.

   Режими перегляду (ідентифікатори збережені — вибір користувача з
   localStorage не губиться):
   table — список з колонками, tiles — плитка, icons — великі мініатюри. */
const VIEW_KEY = "printpeaks_files_view";
const PREVIEW_KEY = "printpeaks_files_preview";
const SORT_KEY = "printpeaks_files_sort";
const VIEWS = [
  { id: "table", label: "Список", icon: <FiList /> },
  { id: "tiles", label: "Плитка", icon: <FiGrid /> },
  { id: "icons", label: "Великі мініатюри", icon: <FiImage /> },
];
const SORTS = [
  { id: "name", label: "Назва" },
  { id: "date", label: "Дата" },
  { id: "size", label: "Розмір" },
  { id: "type", label: "Тип" },
];

/* Мініатюри плиток. Макети (PDF/AI/EPS/PSD/CDR/TIFF), офісні документи і важкі зображення
   малює бекенд — /files/:id/thumb віддає WebP на кількасот пікселів і
   кешує його на диску. Дрібні картинки, GIF (анімація) і SVG браузер
   тягне повним файлом, як раніше. Якщо бекенд мініатюру не дав (404 —
   формат без прев'ю), картинка, що влазить у ліміт, береться повністю,
   решта лишається піктограмою. Перегляд вибраного файла може дозволити
   собі більше. */
const THUMB_LIMIT = 8 * 1024 * 1024;
const DIRECT_IMG_LIMIT = 512 * 1024;
const SERVER_THUMB_EXT = new Set([
  "pdf", "ai", "eps", "epsf", "ps", "psd", "psb", "cdr", "tif", "tiff",
  // офіс: перша сторінка через LibreOffice на сервері (або вбудоване прев'ю)
  "doc", "docx", "docm", "dot", "dotx", "rtf", "odt",
  "xls", "xlsx", "xlsm", "ods",
  "ppt", "pptx", "pptm", "pps", "ppsx", "odp",
]);
const SERVER_RASTER_EXT = new Set(["jpg", "jpeg", "jpe", "jfif", "png", "webp", "avif", "bmp"]);
const PREVIEW_IMG_LIMIT = 40 * 1024 * 1024;
const PREVIEW_PDF_LIMIT = 60 * 1024 * 1024;

const nameOf = (f) => f?.originalName || f?.fileName || "";
const isDirectory = (f) => f?.mimeType === "directory";
const rowKey = (f) => f.id || f.fileName;
const canThumb = (f) => !isDirectory(f) && canBrowserRender(nameOf(f)) && (f?.size || 0) <= THUMB_LIMIT;
/* Чи просити мініатюру в бекенда (а не тягнути файл повністю) */
const wantsServerThumb = (f) => {
  if (isDirectory(f) || !f?.id) return false;
  const ext = fileFormat(nameOf(f)).ext;
  if (SERVER_THUMB_EXT.has(ext)) return true;
  return SERVER_RASTER_EXT.has(ext) && (f?.size || 0) > DIRECT_IMG_LIMIT;
};
const canPreviewImg = (f) => !isDirectory(f) && canBrowserRender(nameOf(f)) && (f?.size || 0) <= PREVIEW_IMG_LIMIT;
const canPreviewPdf = (f) => !isDirectory(f) && fileFormat(nameOf(f)).ext === "pdf" && (f?.size || 0) <= PREVIEW_PDF_LIMIT;

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

/* Ширина мініатюри з бекенда: плитка ~150–260 px × щільність екрана.
   Бекенд округлює до своїх кроків (160/240/320/480/640). */
const thumbWidth = (big) => Math.round((big ? 260 : 180) * Math.min(window.devicePixelRatio || 1, 2));

/* Ключ кешу містить версію файла: замінили файл — нова мініатюра.
   Файли, для яких бекенд мініатюри не має, запам'ятовуємо, щоб при
   поверненні в папку не питати знову. */
const thumbVersion = (f) => `${f.size || 0}-${new Date(f.updatedAt || f.createdAt || 0).getTime() || 0}`;
const thumbKey = (f, w) => `t:${f.id}:${w}:${thumbVersion(f)}`;
const thumbMissing = new Set();

const fetchThumbUrl = async (f, w) => {
  const key = thumbKey(f, w);
  if (blobCache.has(key)) return blobCache.get(key);
  if (thumbMissing.has(key)) throw new Error("no thumb");
  try {
    const res = await axios.get(`/api/client-files/files/${f.id}/thumb`, {
      params: { w, v: thumbVersion(f) },
      responseType: "blob",
    });
    const url = URL.createObjectURL(res.data);
    blobCache.set(key, url);
    return url;
  } catch (e) {
    thumbMissing.add(key);
    throw e;
  }
};

/* Звідки брати мініатюру плитки: з бекенда, а якщо не вийшло — повним
   файлом (лише формати, які браузер малює сам, і в межах ліміту) */
const loadTileThumb = async (f, w) => {
  if (wantsServerThumb(f)) {
    try {
      return await fetchThumbUrl(f, w);
    } catch (e) {
      if (!canThumb(f)) throw e;
    }
  }
  return fetchBlobUrl(f.id);
};

const cachedTileThumb = (f, w) => {
  if (wantsServerThumb(f)) {
    const hit = blobCache.get(thumbKey(f, w));
    if (hit) return hit;
    if (!thumbMissing.has(thumbKey(f, w))) return null;
  }
  return canThumb(f) ? blobCache.get(f.id) || null : null;
};

/* Дата: сьогодні/учора — з часом, решта — повна дата */
const pad2 = (n) => String(n).padStart(2, "0");
const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const now = new Date();
  const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(dt)) / 86400000);
  const time = `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
  if (diff === 0) return `Сьогодні ${time}`;
  if (diff === 1) return `Учора ${time}`;
  return `${pad2(dt.getDate())}.${pad2(dt.getMonth() + 1)}.${dt.getFullYear()}`;
};
const fmtDateFull = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleString("uk-UA", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const plural = (n, one, few, many) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};

/* Мініатюра плитки: вантажиться, коли плитка з'явилась у вьюпорті — у
   папці на сотні сканів інакше стартували б сотні запитів одразу. Якщо
   браузер не зміг намалювати файл — лишається піктограма формату. */
const PfmThumb = ({ file, iconSize, big = false }) => {
  const w = thumbWidth(big);
  const ver = thumbVersion(file);
  const [url, setUrl] = useState(() => cachedTileThumb(file, w));
  const [failed, setFailed] = useState(false);
  const ref = useRef(null);
  const wanted = wantsServerThumb(file) || canThumb(file);

  // Перемкнули «Плитка» ↔ «Великі мініатюри» — інша ширина, свій кеш
  useEffect(() => {
    setUrl(cachedTileThumb(file, w));
    setFailed(false);
  }, [file.id, ver, w]); // eslint-disable-line

  useEffect(() => {
    if (!wanted || url || failed || !ref.current) return undefined;
    let alive = true;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((en) => en.isIntersecting)) return;
      io.disconnect();
      loadTileThumb(file, w).then((u) => { if (alive) setUrl(u); }).catch(() => { if (alive) setFailed(true); });
    }, { rootMargin: "200px" });
    io.observe(ref.current);
    return () => { alive = false; io.disconnect(); };
  }, [file.id, ver, w, wanted, url, failed]); // eslint-disable-line

  if (wanted && url && !failed) {
    const fmt = fileFormat(nameOf(file));
    return (
      <>
        <img
          ref={ref}
          className="pfm-thumb-img"
          src={url}
          alt=""
          draggable={false}
          onError={() => setFailed(true)}
        />
        {/* на справжній мініатюрі формат не видно — підписуємо окремо */}
        <span className="pfm-card-ext" style={{ "--pff-tone": `var(--pff-${fmt.tone})` }}>{fmt.ext}</span>
      </>
    );
  }
  return (
    <span ref={ref} className="pfm-thumb-icon">
      <FileFormatIcon name={nameOf(file)} isDir={isDirectory(file)} size={iconSize} />
    </span>
  );
};

/* Ім'я з тихішим розширенням: «Макет візитки» + «.cdr» */
const FileName = ({ name, isDir }) => {
  if (isDir) return <span className="pfm-name-base">{name}</span>;
  const { base, ext } = splitName(name);
  return (
    <>
      <span className="pfm-name-base">{base}</span>
      {ext && <span className="pfm-name-ext">.{ext}</span>}
    </>
  );
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
  // inline — панель вбудована в сторінку (колонка файлів наряду), а не
  // відкрита оверлеєм поверх усього: без порталу, без затемнення й без
  // закриття по кліку повз неї.
  inline = false,
  // hideCatalog лишився в сигнатурі для сумісності: каталог робіт живе
  // в jobTicket/JobCatalog.jsx, панель файлів його більше не малює.
  hideCatalog = false,
}) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null); // null | {name, percent, index, total}
  const [dragActive, setDragActive] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(""); // підпапка відносно кореня
  const [sort, setSort] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SORT_KEY) || "null");
      if (s && SORTS.some((x) => x.id === s.col)) return { col: s.col, desc: !!s.desc };
    } catch { /* без збереженого сортування */ }
    return { col: "date", desc: true };
  });
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCompanyFiles, setShowCompanyFiles] = useState(false);

  const [viewMode, setViewMode] = useState(() => {
    try {
      const v = localStorage.getItem(VIEW_KEY);
      return VIEWS.some((x) => x.id === v) ? v : "table";
    } catch { return "table"; }
  });
  const [showPreview, setShowPreview] = useState(() => {
    try { return localStorage.getItem(PREVIEW_KEY) !== "0"; } catch { return true; }
  });
  /* Виділення множинне: Ctrl/Cmd — додати-зняти по одному, Shift —
     діапазон від попереднього кліку, звичайний клік — лише цей файл.
     Перегляд показує останній вибраний. */
  const [selectedIds, setSelectedIds] = useState([]);
  const anchorRef = useRef(null);
  const [query, setQuery] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [imgDims, setImgDims] = useState(null); // {w, h} для зображення в перегляді
  const [ctxMenu, setCtxMenu] = useState(null); // {x, y, file}

  const dragCounter = useRef(0);
  const inputRef = useRef(null);
  const dirInputRef = useRef(null);   // окремий input із webkitdirectory
  const contentRef = useRef(null);

  useEffect(() => { try { localStorage.setItem(VIEW_KEY, viewMode); } catch {} }, [viewMode]);
  useEffect(() => { try { localStorage.setItem(PREVIEW_KEY, showPreview ? "1" : "0"); } catch {} }, [showPreview]);
  useEffect(() => { try { localStorage.setItem(SORT_KEY, JSON.stringify(sort)); } catch {} }, [sort]);

  // На сторінці наряду перегляд — постійна частина розкладки.
  const previewOn = inline || showPreview;

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
    if (!userId) return undefined;
    const id = setInterval(() => fetchFiles(true), 5000);
    return () => clearInterval(id);
  }, [userId, fetchFiles]);

  const uploadFile = async (file, subfolderOverride, index = 1, total = 1) => {
    if (!userId || !file) return;
    const formData = new FormData();
    formData.append("file", file, file.name);

    // Визначити підпапку: subfolderOverride (з webkitdirectory) або currentFolder
    const folder = subfolderOverride || currentFolder || "";
    if (folder) formData.append("folder", folder);

    setUploadProgress({ name: file.name, percent: 0, index, total });

    try {
      const res = await axios.post(`/api/client-files/users/${userId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          const all = evt.total || file.size || 1;
          const pct = Math.round((evt.loaded * 100) / all);
          setUploadProgress({ name: file.name, percent: pct, index, total });
        },
      });
      // файл з підпапки в поточному списку не показуємо — він з'явиться
      // в ній самій
      if (!subfolderOverride || subfolderOverride === currentFolder) {
        setFiles((prev) => [res.data, ...prev]);
      }
    } catch (e) {
      setError(e.message || `Помилка завантаження: ${file.name}`);
    } finally {
      setUploadProgress(null);
    }
  };

  const uploadFiles = async (fileList) => {
    const list = Array.from(fileList || []);
    for (let i = 0; i < list.length; i += 1) {
      const file = list[i];
      // webkitRelativePath = "FolderName/subfolder/file.ext"
      // Беремо все крім імені файлу як підпапку
      const relPath = file.webkitRelativePath || "";
      const parts = relPath.split("/");
      let subfolder = "";
      if (parts.length > 1) {
        const dirParts = parts.slice(0, -1);
        subfolder = currentFolder
          ? `${currentFolder}/${dirParts.join("/")}`
          : dirParts.join("/");
      }
      // eslint-disable-next-line no-await-in-loop
      await uploadFile(file, subfolder || undefined, i + 1, list.length);
    }
    // Оновити список після завантаження (щоб побачити нові підпапки)
    fetchFiles();
  };

  const deleteFile = async (fileId) => {
    try {
      await axios.delete(`/api/client-files/files/${fileId}`);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
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

  const downloadFile = (f) => openFile(f.id, { download: true, name: nameOf(f) });

  // DnD
  const onDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current += 1; setDragActive(true); };
  const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current -= 1; if (dragCounter.current <= 0) setDragActive(false); };
  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = "copy"; };

  /**
   * Збирає всі файли з перетягнутої папки, зберігаючи структуру підпапок.
   *
   * dataTransfer.files для папки віддає лише саму папку без вмісту, тому
   * читаємо дерево через webkitGetAsEntry: інакше перетягування папки
   * мовчки нічого не завантажувало б.
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
          const nested = await Promise.all(all.map((en) => collectEntry(en, dirPath)));
          return resolve(nested.flat());
        }
        all.push(...batch);
        return readBatch();
      }, () => resolve([]));
      return readBatch();
    }

    return resolve([]);
  });

  const onDrop = async (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false); dragCounter.current = 0;

    const items = e.dataTransfer?.items;
    const hasEntryApi = items?.length && typeof items[0].webkitGetAsEntry === "function";

    if (hasEntryApi) {
      // знімаємо entry синхронно — після await items уже недоступні
      const entries = Array.from(items)
        .map((it) => (it.kind === "file" ? it.webkitGetAsEntry() : null))
        .filter(Boolean);

      if (entries.some((en) => en.isDirectory)) {
        const collected = (await Promise.all(entries.map((en) => collectEntry(en)))).flat();
        for (let i = 0; i < collected.length; i += 1) {
          const { file, subfolder } = collected[i];
          const target = subfolder && currentFolder
            ? `${currentFolder}/${subfolder}`
            : (subfolder || currentFolder || "");
          // eslint-disable-next-line no-await-in-loop
          await uploadFile(file, target || undefined, i + 1, collected.length);
        }
        fetchFiles();
        return;
      }
    }

    if (e.dataTransfer?.files?.length) uploadFiles(e.dataTransfer.files);
  };

  const linkedOrderIds = (f) => (f?.OrderFileLinks || []).map((l) => l.orderId);
  const isLinkedToCurrentOrder = (f) => !!orderId && linkedOrderIds(f).includes(orderId);

  const linkToOrder = async (file) => {
    if (!orderId) return;
    try {
      let fileId = file.id;

      // Папка (FS або DB) — створити/знайти DB-запис через create-folder + лінк атомарно
      if (isDirectory(file)) {
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
        const uncPath = data.folderPath.replace(/\//g, "\\");
        window.open(`ppfolder://${encodeURIComponent(uncPath)}`, "_self");
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
    setCurrentFolder((prev) => (prev ? `${prev}/${folderName}` : folderName));
  };

  const goBack = () => {
    setCurrentFolder((prev) => {
      const parts = prev.split("/");
      parts.pop();
      return parts.join("/");
    });
  };

  /* клік по тій самій колонці — міняє напрям; нова колонка — назва йде
     А→Я, решта (дата, розмір) — від більшого */
  const toggleSort = (col) => {
    setSort((prev) => (prev.col === col
      ? { col, desc: !prev.desc }
      : { col, desc: col !== "name" && col !== "type" }));
  };

  // Папки завжди зверху, файли сортуються
  const sortedFiles = useMemo(() => {
    const dirs = files.filter(isDirectory)
      .sort((a, b) => nameOf(a).localeCompare(nameOf(b), "uk"));
    const rest = files.filter((f) => !isDirectory(f));
    const { col, desc } = sort;
    const sorted = [...rest].sort((a, b) => {
      let cmp = 0;
      if (col === "name") {
        cmp = nameOf(a).toLowerCase().localeCompare(nameOf(b).toLowerCase(), "uk", { numeric: true });
      } else if (col === "type") {
        cmp = fileFormat(nameOf(a)).ext.localeCompare(fileFormat(nameOf(b)).ext, "uk")
          || nameOf(a).localeCompare(nameOf(b), "uk", { numeric: true });
      } else if (col === "size") {
        cmp = (a.size || 0) - (b.size || 0);
      } else {
        cmp = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      return desc ? -cmp : cmp;
    });
    return [...dirs, ...sorted];
  }, [files, sort]);

  /* пошук — по видимій назві, у межах поточної папки */
  const searchedFiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedFiles;
    return sortedFiles.filter((f) => nameOf(f).toLowerCase().includes(q));
  }, [sortedFiles, query]);

  /* лічильники для фільтра за типом — лише по файлах (папки не рахуємо) */
  const groupCounts = useMemo(() => {
    const counts = {};
    searchedFiles.forEach((f) => {
      if (isDirectory(f)) return;
      const g = fileFormat(nameOf(f)).group;
      counts[g] = (counts[g] || 0) + 1;
    });
    return counts;
  }, [searchedFiles]);

  const fileCount = useMemo(() => searchedFiles.filter((f) => !isDirectory(f)).length, [searchedFiles]);
  const presentGroups = FORMAT_GROUPS.filter((g) => groupCounts[g.id]);

  // фільтр, що став порожнім (файли видалили / пішли з пошуку), знімаємо
  useEffect(() => {
    if (typeFilter !== "all" && !groupCounts[typeFilter]) setTypeFilter("all");
  }, [groupCounts, typeFilter]);

  /* папки фільтр за типом не ховає — це навігація, а не файли */
  const visibleFiles = useMemo(() => {
    if (typeFilter === "all") return searchedFiles;
    return searchedFiles.filter((f) => isDirectory(f) || fileFormat(nameOf(f)).group === typeFilter);
  }, [searchedFiles, typeFilter]);

  const selectedId = selectedIds.length ? selectedIds[selectedIds.length - 1] : null;

  const selectedFile = useMemo(
    () => visibleFiles.find((f) => rowKey(f) === selectedId) || null,
    [visibleFiles, selectedId]);

  /* усі виділені — для гуртових дій */
  const selectedFiles = useMemo(
    () => visibleFiles.filter((f) => selectedIds.includes(rowKey(f))),
    [visibleFiles, selectedIds]);

  const downloadableSelection = selectedFiles.filter((f) => !isDirectory(f));
  const selectionBytes = downloadableSelection.reduce((s, f) => s + (f.size || 0), 0);
  const totalBytes = visibleFiles.reduce((s, f) => s + (isDirectory(f) ? 0 : (f.size || 0)), 0);

  // вибір скидається при зміні папки — інакше в перегляді висить файл,
  // якого в новому списку вже немає
  useEffect(() => { setSelectedIds([]); anchorRef.current = null; }, [currentFolder]);

  /* Перегляд вибраного: картинка або PDF (через <object>). */
  useEffect(() => {
    setPreviewUrl(null);
    setImgDims(null);
    if (!previewOn || !selectedFile) return undefined;
    if (!canPreviewImg(selectedFile) && !canPreviewPdf(selectedFile)) return undefined;
    let alive = true;
    setPreviewBusy(true);
    fetchBlobUrl(selectedFile.id)
      .then((u) => { if (alive) setPreviewUrl(u); })
      .catch(() => {})
      .finally(() => { if (alive) setPreviewBusy(false); });
    return () => { alive = false; };
  }, [selectedFile, previewOn]);

  // закрити контекстне меню кліком повз нього / по Esc / прокруткою
  useEffect(() => {
    if (!ctxMenu) return undefined;
    const close = () => setCtxMenu(null);
    const onKey = (e) => { if (e.key === "Escape") setCtxMenu(null); };
    window.addEventListener("click", close);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [ctxMenu]);

  const clearSelection = () => { setSelectedIds([]); anchorRef.current = null; };

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

  /* Гуртове видалення — лише з підтвердженням: одним кліком по кошику
     в рядку видаляється один файл, а тут може піти пів папки */
  const deleteSelection = async () => {
    const list = downloadableSelection;
    if (!list.length) return;
    const ok = window.confirm(list.length === 1
      ? `Видалити файл «${nameOf(list[0])}»?`
      : `Видалити ${list.length} ${plural(list.length, "файл", "файли", "файлів")}?`);
    if (!ok) return;
    for (const f of list) {
      // eslint-disable-next-line no-await-in-loop
      await deleteFile(f.id);
    }
    clearSelection();
  };

  /* один клік — вибір, подвійний — відкрити (папку зайти, файл відкрити) */
  const activate = (f) => {
    if (isDirectory(f)) openSubfolder(f.fileName);
    else openFile(f.id);
  };

  const copyName = (f) => {
    try { navigator.clipboard?.writeText(nameOf(f)); } catch { /* буфер недоступний */ }
  };

  /* Клавіатура у вмісті: стрілки — рух виділення (у сітці вгору/вниз — на
     цілий ряд), Enter — відкрити, Esc — зняти, Ctrl+A — усе, Delete —
     видалити вибране з підтвердженням. */
  const onContentKeyDown = (e) => {
    if (e.target !== contentRef.current) return;
    if (e.key === "Escape") { clearSelection(); return; }
    if ((e.ctrlKey || e.metaKey) && (e.key === "a" || e.key === "A")) {
      e.preventDefault();
      setSelectedIds(visibleFiles.map(rowKey));
      return;
    }
    if (e.key === "Enter" && selectedFile) { e.preventDefault(); activate(selectedFile); return; }
    if (e.key === "Delete" && downloadableSelection.length) { e.preventDefault(); deleteSelection(); return; }
    if (e.key === "Backspace" && currentFolder) { e.preventDefault(); goBack(); return; }

    const moves = { ArrowDown: 1, ArrowUp: -1, ArrowRight: 1, ArrowLeft: -1 };
    if (!(e.key in moves) || !visibleFiles.length) return;
    if (viewMode === "table" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) return;
    e.preventDefault();
    let step = moves[e.key];
    if (viewMode !== "table" && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      const grid = contentRef.current?.querySelector(".pfm-grid");
      const cols = grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length : 1;
      step *= Math.max(1, cols);
    }
    const cur = selectedFile ? visibleFiles.indexOf(selectedFile) : -1;
    const next = Math.max(0, Math.min(visibleFiles.length - 1, cur < 0 ? 0 : cur + step));
    const key = rowKey(visibleFiles[next]);
    anchorRef.current = next;
    setSelectedIds([key]);
    const el = contentRef.current?.querySelector(`[data-key="${CSS.escape(String(key))}"]`);
    el?.scrollIntoView({ block: "nearest" });
  };

  const breadcrumbs = currentFolder ? currentFolder.split("/") : [];
  const goToCrumb = (idx) => setCurrentFolder(breadcrumbs.slice(0, idx + 1).join("/"));
  const rootLabel = (clientName || "").trim()
    || (companyId ? `Компанія №${companyId}` : `Клієнт №${userId}`);

  /* значки нарядів + «прив'язати до цього наряду» */
  const orderBadges = (f, withAdd = true) => (
    <>
      {linkedOrderIds(f).map((oid) => (
        <span
          key={oid}
          className={`pfm-ord${oid === orderId ? " is-current" : ""}`}
          title={oid === orderId ? "Прив'язано до цього наряду" : `Прив'язано до замовлення №${oid}`}
        >
          <span className="pfm-ord-num">{oid}</span>
          {f.id && (
            <button
              type="button"
              className="pfm-ord-unlink"
              onClick={(e) => { e.stopPropagation(); unlinkFromOrder(f.id, oid); }}
              title={`Відв'язати від замовлення ${oid}`}
            ><FiMinus /></button>
          )}
        </span>
      ))}
      {withAdd && orderId && !isLinkedToCurrentOrder(f) && (
        <button
          type="button"
          className="pfm-ord-add"
          onClick={(e) => { e.stopPropagation(); linkToOrder(f); }}
          title={`Прив'язати до наряду №${orderId}`}
        ><FiPlus /></button>
      )}
    </>
  );

  /* кнопки дій у рядку / на плитці */
  const rowActions = (f) => {
    if (isDirectory(f)) return null;
    return (
      <>
        <button
          type="button"
          className="pfm-act"
          onClick={(e) => { e.stopPropagation(); downloadFile(f); }}
          title="Завантажити"
        ><FiDownload /></button>
        {selectMode ? (
          <button
            type="button"
            className="pfm-act"
            onClick={(e) => { e.stopPropagation(); onSelectFile?.(f.id); }}
            title="Прив'язати до замовлення"
          ><FiLink /></button>
        ) : (
          <button
            type="button"
            className="pfm-act pfm-act--danger"
            onClick={(e) => { e.stopPropagation(); deleteFile(f.id); }}
            title="Видалити файл"
          ><FiTrash2 /></button>
        )}
      </>
    );
  };

  const itemProps = (f, index) => {
    const key = rowKey(f);
    return {
      "data-key": key,
      onClick: (e) => { e.stopPropagation(); selectAt(e, key, index); },
      onDoubleClick: (e) => { e.stopPropagation(); activate(f); },
      onContextMenu: (e) => {
        e.preventDefault(); e.stopPropagation();
        // правий клік по невиділеному — виділяє лише його, по
        // виділеному — зберігає поточну групу
        if (!selectedIds.includes(key)) { anchorRef.current = index; setSelectedIds([key]); }
        setCtxMenu({ x: e.clientX, y: e.clientY, file: f });
      },
      title: nameOf(f),
    };
  };

  const SortMark = ({ col }) => {
    if (sort.col !== col) return <FiChevronDown className="pfm-sort-mark is-idle" />;
    return sort.desc
      ? <FiChevronDown className="pfm-sort-mark" />
      : <FiChevronUp className="pfm-sort-mark" />;
  };

  const ariaSort = (col) => (sort.col !== col ? "none" : (sort.desc ? "descending" : "ascending"));

  /* ── вміст: список ── */
  const renderTable = () => (
    <div className="pfm-table" role="grid" aria-multiselectable="true">
      <div className="pfm-thead" role="row">
        <span className="pfm-th pfm-c-icon" aria-hidden="true" />
        <button type="button" role="columnheader" aria-sort={ariaSort("name")} className="pfm-th pfm-c-name" onClick={() => toggleSort("name")}>
          <span>Назва</span><SortMark col="name" />
        </button>
        <button type="button" role="columnheader" aria-sort={ariaSort("type")} className="pfm-th pfm-c-kind" onClick={() => toggleSort("type")}>
          <span>Тип</span><SortMark col="type" />
        </button>
        <button type="button" role="columnheader" aria-sort={ariaSort("size")} className="pfm-th pfm-c-size" onClick={() => toggleSort("size")}>
          <span>Розмір</span><SortMark col="size" />
        </button>
        <button type="button" role="columnheader" aria-sort={ariaSort("date")} className="pfm-th pfm-c-date" onClick={() => toggleSort("date")}>
          <span>Додано</span><SortMark col="date" />
        </button>
        <span className="pfm-th pfm-c-ord" role="columnheader"><span>Наряди</span></span>
        <span className="pfm-th pfm-c-act" aria-hidden="true" />
      </div>

      {visibleFiles.map((f, index) => {
        const isDir = isDirectory(f);
        const name = nameOf(f);
        const fmt = isDir ? null : fileFormat(name);
        const selected = selectedIds.includes(rowKey(f));
        return (
          <div
            key={rowKey(f)}
            role="row"
            aria-selected={selected}
            className={`pfm-row${selected ? " is-selected" : ""}${isDir ? " is-dir" : ""}${isLinkedToCurrentOrder(f) ? " is-linked" : ""}`}
            {...itemProps(f, index)}
          >
            <span className="pfm-c-icon"><FileFormatIcon name={name} isDir={isDir} size={26} /></span>
            <span className="pfm-c-name pfm-name"><FileName name={name} isDir={isDir} /></span>
            <span className="pfm-c-kind">{isDir ? "Папка" : fmt.kind}</span>
            <span className="pfm-c-size">{isDir ? "" : formatBytes(f.size)}</span>
            <span className="pfm-c-date" title={f.createdAt ? fmtDateFull(f.createdAt) : undefined}>{fmtDate(f.createdAt)}</span>
            <span className="pfm-c-ord">{orderBadges(f)}</span>
            <span className="pfm-c-act">{rowActions(f)}</span>
          </div>
        );
      })}
    </div>
  );

  /* ── вміст: плитка / великі мініатюри ── */
  const renderGrid = () => {
    const big = viewMode === "icons";
    return (
      <div className={`pfm-grid${big ? " pfm-grid--big" : ""}`} role="grid" aria-multiselectable="true">
        {visibleFiles.map((f, index) => {
          const isDir = isDirectory(f);
          const name = nameOf(f);
          const fmt = isDir ? null : fileFormat(name);
          const selected = selectedIds.includes(rowKey(f));
          return (
            <div
              key={rowKey(f)}
              role="gridcell"
              aria-selected={selected}
              className={`pfm-card${selected ? " is-selected" : ""}${isDir ? " is-dir" : ""}${isLinkedToCurrentOrder(f) ? " is-linked" : ""}`}
              {...itemProps(f, index)}
            >
              <div className="pfm-card-media">
                <PfmThumb file={f} iconSize={big ? 64 : 44} big={big} />
                <span className="pfm-card-ords">{orderBadges(f)}</span>
                <span className="pfm-card-acts">{rowActions(f)}</span>
              </div>
              <div className="pfm-card-body">
                <div className="pfm-card-name"><FileName name={name} isDir={isDir} /></div>
                <div className="pfm-card-meta" title={isDir ? undefined : fmt.kind}>
                  {isDir ? "Папка" : `${(fmt.ext || "файл").toUpperCase()} · ${formatBytes(f.size)}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* ── порожній стан ── */
  const renderEmpty = () => {
    if (loading) return null;
    if (query.trim()) {
      return (
        <div className="pfm-empty">
          <FiSearch className="pfm-empty-icon" />
          <strong>Нічого не знайдено</strong>
          <span>За запитом «{query.trim()}» у цій папці файлів немає</span>
          {!(inline && orderId) && (
            <button type="button" className="pfm-btn" onClick={() => setQuery("")}><span>Очистити пошук</span></button>
          )}
        </div>
      );
    }
    return (
      <div className="pfm-empty">
        <FiUploadCloud className="pfm-empty-icon" />
        <strong>{currentFolder ? "Папка порожня" : "Файлів поки немає"}</strong>
        <span>Перетягніть сюди файли або цілу папку — структура збережеться</span>
        <button type="button" className="pfm-btn pfm-btn--primary" onClick={() => inputRef.current?.click()}>
          <FiFilePlus /><span>Додати файли</span>
        </button>
      </div>
    );
  };

  /* ── перегляд вибраного ── */
  const renderPreview = () => {
    if (!selectedFile) {
      return inline ? null : (
        // без файлу панель просто порожня — підпис «Виберіть файл»
        // колись прибрали на прохання: він нічого не додавав
        <aside className="pfm-pv is-empty" aria-label="Перегляд" />
      );
    }
    const f = selectedFile;
    const isDir = isDirectory(f);
    const name = nameOf(f);
    const fmt = isDir ? null : fileFormat(name);
    const isImg = canPreviewImg(f);
    const isPdf = canPreviewPdf(f);
    const multi = selectedIds.length > 1;
    // фізичний розмір друку при 300 dpi — те, що друкарю треба одразу
    const mm = (px) => Math.round((px / 300) * 25.4);

    return (
      <aside className="pfm-pv" aria-label="Перегляд">
        <div className={`pfm-pv-stage${isImg && previewUrl ? " is-image" : ""}`}>
          {previewBusy && <span className="pfm-spinner" aria-label="Завантаження" />}
          {!previewBusy && previewUrl && isImg && (
            <img
              className="pfm-pv-img"
              src={previewUrl}
              alt=""
              onLoad={(e) => setImgDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              onError={() => setPreviewUrl(null)}
            />
          )}
          {!previewBusy && previewUrl && isPdf && (
            <object className="pfm-pv-pdf" data={`${previewUrl}#toolbar=0&navpanes=0&view=Fit`} type="application/pdf">
              <FileFormatIcon name={name} size={72} />
            </object>
          )}
          {!previewBusy && !previewUrl && (
            <FileFormatIcon name={name} isDir={isDir} size={inline ? 64 : 88} />
          )}
        </div>

        <div className="pfm-pv-info">
          <div className="pfm-pv-head">
            <div className="pfm-pv-title">
              <div className="pfm-pv-name" title={name}>{name}</div>
              <div className="pfm-pv-kind">
                {isDir ? "Папка" : fmt.kind}
                {multi && <em> · вибрано {selectedIds.length}</em>}
              </div>
            </div>
            <button type="button" className="pfm-icon-btn" onClick={clearSelection} title="Закрити перегляд">
              <FiX />
            </button>
          </div>

          <dl className="pfm-pv-props">
            {!isDir && (<><dt>Розмір</dt><dd>{formatBytes(f.size) || "—"}</dd></>)}
            {imgDims && (
              <>
                <dt>Пікселі</dt><dd>{imgDims.w} × {imgDims.h}</dd>
                <dt>Друк 300 dpi</dt><dd>{mm(imgDims.w)} × {mm(imgDims.h)} мм</dd>
              </>
            )}
            <dt>Додано</dt><dd>{fmtDateFull(f.createdAt)}</dd>
            {multi && selectionBytes > 0 && (<><dt>Разом</dt><dd>{formatBytes(selectionBytes)}</dd></>)}
            {/* «у наряд» — кнопкою нижче, тут лише те, що вже прив'язано */}
            <dt>Наряди</dt>
            <dd className="pfm-pv-ords">
              {linkedOrderIds(f).length ? orderBadges(f, false) : "—"}
            </dd>
          </dl>

          <div className="pfm-pv-actions">
            <button type="button" className="pfm-btn pfm-btn--primary" onClick={() => activate(f)}>
              {isDir ? <FiFolder /> : <FiExternalLink />}
              <span>{isDir ? "Відкрити папку" : "Відкрити"}</span>
            </button>
            {!isDir && (
              <button
                type="button"
                className="pfm-btn"
                onClick={() => (multi && downloadableSelection.length > 1 ? downloadSelection() : downloadFile(f))}
              >
                <FiDownload />
                <span>{multi && downloadableSelection.length > 1 ? `Завантажити ${downloadableSelection.length}` : "Завантажити"}</span>
              </button>
            )}
            {orderId && (
              <button
                type="button"
                className="pfm-btn"
                onClick={() => (multi ? linkSelection() : linkToOrder(f))}
                disabled={!multi && isLinkedToCurrentOrder(f)}
              >
                <FiPlus />
                <span>{!multi && isLinkedToCurrentOrder(f) ? "Вже в наряді" : "У наряд"}</span>
              </button>
            )}
            {!isDir && !selectMode && (
              <button
                type="button"
                className="pfm-btn pfm-btn--danger pfm-btn--square"
                onClick={() => (multi ? deleteSelection() : deleteFile(f.id))}
                title={multi ? "Видалити вибрані" : "Видалити"}
              ><FiTrash2 /></button>
            )}
          </div>
        </div>
      </aside>
    );
  };

  /* контекстне меню — порталом у body: предок із transform/filter
     зсунув би position:fixed відносно курсора */
  const renderCtxMenu = () => {
    if (!ctxMenu) return null;
    const f = ctxMenu.file;
    const isDir = isDirectory(f);
    const multiDl = downloadableSelection.length > 1;
    const W = 240;
    const H = 230;
    const left = Math.min(ctxMenu.x, window.innerWidth - W - 8);
    const top = Math.min(ctxMenu.y, window.innerHeight - H - 8);
    const run = (fn) => () => { fn(); setCtxMenu(null); };
    return ReactDOM.createPortal(
      <div className="pfm-ctx" style={{ left, top }} onClick={(e) => e.stopPropagation()} role="menu">
        <div className="pfm-ctx-head">
          <FileFormatIcon name={nameOf(f)} isDir={isDir} size={16} />
          <span>{nameOf(f)}</span>
        </div>
        <button type="button" role="menuitem" onClick={run(() => activate(f))}>
          {isDir ? <FiFolder /> : <FiExternalLink />}
          <span>{isDir ? "Відкрити папку" : "Відкрити"}</span>
        </button>
        {!isDir && (
          <button type="button" role="menuitem" onClick={run(() => (multiDl ? downloadSelection() : downloadFile(f)))}>
            <FiDownload />
            <span>{multiDl ? `Завантажити вибране (${downloadableSelection.length})` : "Завантажити"}</span>
          </button>
        )}
        {orderId && (
          <button
            type="button"
            role="menuitem"
            disabled={selectedFiles.length <= 1 && isLinkedToCurrentOrder(f)}
            onClick={run(() => (selectedFiles.length > 1 ? linkSelection() : linkToOrder(f)))}
          >
            <FiPlus />
            <span>{selectedFiles.length > 1 ? `У наряд №${orderId} (${selectedFiles.length})` : `У наряд №${orderId}`}</span>
          </button>
        )}
        <button type="button" role="menuitem" onClick={run(() => copyName(f))}>
          <FiCopy /><span>Копіювати назву</span>
        </button>
        {!isDir && !selectMode && (
          <>
            <span className="pfm-ctx-sep" />
            <button
              type="button"
              role="menuitem"
              className="is-danger"
              onClick={run(() => (multiDl ? deleteSelection() : deleteFile(f.id)))}
            >
              <FiTrash2 />
              <span>{multiDl ? `Видалити вибране (${downloadableSelection.length})` : "Видалити"}</span>
            </button>
          </>
        )}
      </div>,
      document.body
    );
  };

  const multiSelected = selectedIds.length > 1;

  const panel = (
    <div
      className={`cfp-modal pfm${inline ? " pfm--inline" : " pfm--modal"}${hideCatalog || inline ? " cfp-modal--jtx" : ""}${dragActive ? " is-dragging" : ""}`}
      onClick={(e) => e.stopPropagation()}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* ── ПАНЕЛЬ ІНСТРУМЕНТІВ ──────────────────────────────────────── */}
      <div className="pfm-bar">
        <button
          type="button"
          className="pfm-icon-btn"
          onClick={goBack}
          disabled={!currentFolder}
          title="На рівень вище (Backspace)"
        ><FiArrowUp /></button>

        <label className="pfm-search">
          <FiSearch aria-hidden="true" />
          <input
            type="text"
            value={query}
            placeholder={breadcrumbs.length
              ? `Пошук у «${breadcrumbs[breadcrumbs.length - 1]}»`
              : (companyId ? `Пошук файлів компанії №${companyId}` : `Пошук файлів клієнта №${userId}`)}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" className="pfm-search-clear" onClick={() => setQuery("")} title="Очистити">
              <FiX />
            </button>
          )}
        </label>

        <div className="pfm-seg" role="group" aria-label="Режим перегляду">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              className={`pfm-icon-btn${viewMode === v.id ? " is-active" : ""}`}
              aria-pressed={viewMode === v.id}
              onClick={() => setViewMode(v.id)}
              title={v.label}
            >{v.icon}</button>
          ))}
        </div>

        {!inline && (
          <button
            type="button"
            className={`pfm-icon-btn${showPreview ? " is-active" : ""}`}
            aria-pressed={showPreview}
            onClick={() => setShowPreview((v) => !v)}
            title="Панель перегляду"
          ><FiSidebar /></button>
        )}

        <button
          type="button"
          className={`pfm-icon-btn${loading ? " is-spinning" : ""}`}
          onClick={() => fetchFiles()}
          title="Оновити"
          aria-label="Оновити список файлів"
        ><FiRefreshCw /></button>

        <span className="pfm-bar-sep" aria-hidden="true" />

        <div className="pfm-seg" role="group" aria-label="Додати">
          <button type="button" className="pfm-icon-btn" onClick={createFolder} title="Нова папка">
            <FiFolderPlus />
          </button>
          <button
            type="button"
            className="pfm-icon-btn"
            onClick={() => dirInputRef.current?.click()}
            title="Завантажити папку з диска — структура підпапок збережеться"
          ><FiUploadCloud /></button>
          <button
            type="button"
            className="pfm-icon-btn pfm-icon-btn--primary"
            onClick={() => inputRef.current?.click()}
            title="Додати файли — або перетягніть файли чи цілу папку в панель"
          ><FiFilePlus /></button>
        </div>

        {!inline && onClose && (
          <button type="button" className="pfm-icon-btn pfm-close" onClick={onClose} title="Закрити">
            <FiX />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => { uploadFiles(e.target.files); e.target.value = ""; }}
        />
        {/* Вибір цілої папки: webkitdirectory дає файлам webkitRelativePath,
            з якого uploadFiles відтворює підпапки. */}
        <input
          ref={dirInputRef}
          type="file"
          multiple
          hidden
          webkitdirectory=""
          directory=""
          onChange={(e) => { uploadFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {/* ── ДРУГИЙ РЯД: шлях + фільтр за типом + сортування, або дії над
          кількома вибраними ── */}
      {multiSelected ? (
        <div className="pfm-sub pfm-sub--selection">
          <button type="button" className="pfm-icon-btn pfm-icon-btn--sm" onClick={clearSelection} title="Зняти виділення (Esc)">
            <FiX />
          </button>
          <span className="pfm-sel-count">
            Вибрано {selectedIds.length}
            {selectionBytes > 0 && <em> · {formatBytes(selectionBytes)}</em>}
          </span>
          <span className="pfm-sub-spacer" />
          {downloadableSelection.length > 0 && (
            <button type="button" className="pfm-btn pfm-btn--sm" onClick={downloadSelection}>
              <FiDownload /><span>Завантажити</span>
            </button>
          )}
          {orderId && (
            <button type="button" className="pfm-btn pfm-btn--sm" onClick={linkSelection}>
              <FiPlus /><span>У наряд</span>
            </button>
          )}
          {downloadableSelection.length > 0 && !selectMode && (
            <button type="button" className="pfm-btn pfm-btn--sm pfm-btn--danger" onClick={deleteSelection}>
              <FiTrash2 /><span>Видалити</span>
            </button>
          )}
        </div>
      ) : (
        <div className="pfm-sub">
          <nav className="pfm-crumbs" aria-label="Шлях">
            <button
              type="button"
              className={`pfm-crumb${breadcrumbs.length ? "" : " is-current"}`}
              onClick={() => setCurrentFolder("")}
              title={rootLabel}
            >
              <FiFolder /><span>{rootLabel}</span>
            </button>
            {breadcrumbs.map((part, i) => (
              <React.Fragment key={`${part}-${i}`}>
                <FiChevronRight className="pfm-crumb-sep" aria-hidden="true" />
                <button
                  type="button"
                  className={`pfm-crumb${i === breadcrumbs.length - 1 ? " is-current" : ""}`}
                  onClick={() => goToCrumb(i)}
                  title={part}
                ><span>{part}</span></button>
              </React.Fragment>
            ))}
          </nav>

          {presentGroups.length > 1 && (
            <div className="pfm-chips" role="group" aria-label="Тип файлів">
              <button
                type="button"
                className={`pfm-chip${typeFilter === "all" ? " is-active" : ""}`}
                onClick={() => setTypeFilter("all")}
              ><span>Усі</span><em>{fileCount}</em></button>
              {presentGroups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`pfm-chip${typeFilter === g.id ? " is-active" : ""}`}
                  onClick={() => setTypeFilter((cur) => (cur === g.id ? "all" : g.id))}
                ><span>{g.label}</span><em>{groupCounts[g.id]}</em></button>
              ))}
            </div>
          )}

          {viewMode !== "table" && (
            <div className="pfm-sortbar" role="group" aria-label="Сортування">
              {SORTS.filter((s) => s.id !== "type").map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`pfm-sortbtn${sort.col === s.id ? " is-active" : ""}`}
                  onClick={() => toggleSort(s.id)}
                  title={`Сортувати: ${s.label.toLowerCase()}`}
                >
                  <span>{s.label}</span>
                  {sort.col === s.id && (sort.desc ? <FiChevronDown /> : <FiChevronUp />)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* смуга стану: завантаження списку / вивантаження файлів / помилка */}
      {loading && !uploadProgress && <div className="pfm-loadbar" aria-hidden="true" />}
      {uploadProgress && (
        <div className="pfm-upload" role="status">
          <FiUploadCloud />
          <span className="pfm-upload-name">{uploadProgress.name}</span>
          {uploadProgress.total > 1 && (
            <span className="pfm-upload-count">{uploadProgress.index} з {uploadProgress.total}</span>
          )}
          <span className="pfm-upload-pct">{uploadProgress.percent}%</span>
          <span className="pfm-upload-track"><span style={{ width: `${uploadProgress.percent}%` }} /></span>
        </div>
      )}
      {error && (
        <div className="pfm-error" role="alert">
          <FiAlertTriangle />
          <span>{error}</span>
          <button type="button" className="pfm-icon-btn pfm-icon-btn--sm" onClick={() => setError(null)} title="Сховати">
            <FiX />
          </button>
        </div>
      )}

      {/* ── ТІЛО: вміст папки + перегляд ── */}
      <div className={`pfm-body${previewOn ? " has-preview" : ""}${selectedFile ? " has-selection" : ""}`}>
        <div
          ref={contentRef}
          className={`pfm-content pfm-content--${viewMode}`}
          tabIndex={0}
          onKeyDown={onContentKeyDown}
          onClick={clearSelection}
        >
          {visibleFiles.length === 0
            ? renderEmpty()
            : (viewMode === "table" ? renderTable() : renderGrid())}
        </div>

        {previewOn && renderPreview()}

        {dragActive && (
          <div className="pfm-drop">
            <div className="pfm-drop-box">
              <FiUploadCloud />
              <strong>Відпустіть, щоб завантажити</strong>
              <span>у «{breadcrumbs.length ? breadcrumbs.join(" / ") : rootLabel}»</span>
            </div>
          </div>
        )}
      </div>

      {/* ── СТАТУС-РЯДОК: лише в модальному провіднику — там це єдиний вхід
          у локальну папку й у файли компанії. На сторінці наряду він
          тільки з'їдав би висоту. ── */}
      {!inline && (
        <div className="pfm-status">
          <button type="button" className="pfm-link" onClick={openFolder} title="Відкрити папку на цьому ПК">
            <FiFolder /><span>Локальна папка</span>
          </button>
          <span className="pfm-status-text">
            {visibleFiles.length} {plural(visibleFiles.length, "об'єкт", "об'єкти", "об'єктів")}
            {totalBytes > 0 && ` · ${formatBytes(totalBytes)}`}
            {(query || typeFilter !== "all") && files.length !== visibleFiles.length && ` · з ${files.length}`}
          </span>
          {companyId ? (
            <button type="button" className="pfm-link" onClick={() => setShowCompanyFiles(true)} title="Файли компанії">
              <FiFolder /><span>Файли компанії</span>
            </button>
          ) : <span />}
        </div>
      )}

      {renderCtxMenu()}

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
