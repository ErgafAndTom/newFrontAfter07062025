import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "../../api/axiosInstance";
import {
  parseOrderUnitForShipping,
  calculatePositionWeight,
  getEnvelopeRecommendation,
  ENVELOPES,
} from "./npWeightUtils";
import NP from "../userInNewUiArtem/NP";
import NovaPoshtaThermalButton from "./NovaPoshtaThermalButton";
import {
  NpHeader,
  NpMark,
  NpCheck,
  NpNumber,
  NpAlert,
  NpFieldError,
  npInvalid,
  focusNpField,
  clientDisplayName,
  fmtNum,
  formatTtn,
  NP_DEFAULT_DESCRIPTION,
  plural,
  positionsInfo,
} from "./NpBrand";
import { describeNpError, unwrapBlobError } from "./npErrors";
import "./NovaPoshta.css";

// Envelope is flat — thickness is fixed regardless of contents
const ENVELOPE_THICKNESS_MM = "0.1";

let nextPkgId = 1;
let nextSplitUid = 1;

// Об'ємна вага НП: Д×Ш×В (см) / 4000
const volWeight = (wMm, hMm, tMm) =>
  ((parseFloat(wMm) || 0) / 10) * ((parseFloat(hMm) || 0) / 10) * ((parseFloat(tMm) || 0) / 10) / 4000;

// Помилку повертає наверх: її показує картка ТТН (відповідь-блоб розгортається в JSON)
const downloadPdf = (url, filename) =>
  axios
    .get(url, { responseType: "blob" })
    .then((res) => {
      const href = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(href);
    })
    .catch(async (err) => {
      throw await unwrapBlobError(err);
    });

const positive = (v) => (parseFloat(String(v ?? "").replace(",", ".")) || 0) > 0;

/**
 * Мініатюра пакування: контур конверта в реальних пропорціях і пунктиром —
 * вміст посилки в тому ж масштабі. Видно, чи влазить, ще до того як читати цифри.
 */
function PackGlyph({ env, content, scale, over }) {
  const base = 38;
  const mid = 24;
  const cw = content.w * scale;
  const ch = content.h * scale;
  return (
    <svg className={`npw-glyph${over ? " is-over" : ""}`} viewBox="0 0 48 40" aria-hidden="true">
      {env ? (
        (() => {
          const ew = env.width * scale;
          const eh = env.height * scale;
          const x = mid - ew / 2;
          const y = base - eh;
          return (
            <>
              <rect className="npw-glyph-shell" x={x} y={y} width={ew} height={eh} />
              <polyline
                className="npw-glyph-flap"
                points={`${x},${y} ${mid},${y + Math.min(eh * 0.42, ew * 0.5)} ${x + ew},${y}`}
              />
            </>
          );
        })()
      ) : (
        <>
          <rect className="npw-glyph-shell" x={mid - cw / 2 - 2} y={base - ch - 2} width={cw + 4} height={ch + 2} />
          <line className="npw-glyph-flap" x1={mid} y1={base - ch - 2} x2={mid} y2={base - ch * 0.6} />
        </>
      )}
      {cw > 0 && ch > 0 && (
        <rect className="npw-glyph-content" x={mid - cw / 2} y={base - ch} width={cw} height={ch} />
      )}
    </svg>
  );
}

export default function NovaPoshtaCalculator({ onClose }) {
  const [order, setOrder] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  // error — опис для NpAlert (describeNpError); searchError — текст під полем номера
  const [error, setError] = useState(null);
  const [searchError, setSearchError] = useState("");
  const lastSearchId = useRef(null);
  // Помилки дій з готовими ТТН (PDF, термодрук): { [waybillId]: опис }
  const [ttnErrors, setTtnErrors] = useState({});
  // Після спроби «Створити ТТН» показуємо блок з переліком помилок пакування
  const [ttnTried, setTtnTried] = useState(false);

  // Parsed items: { ...parsedFields, autoWeight, manualWeight }
  const [parsedItems, setParsedItems] = useState([]);

  // Packages: [ { id, itemIds: [orderUnitId, ...] } ]
  const [packages, setPackages] = useState([{ id: nextPkgId++, itemIds: [] }]);

  const [safetyMargin, setSafetyMargin] = useState(true);
  const marginValue = safetyMargin ? 0.15 : 0;

  // NP.jsx modal state
  const [showNP, setShowNP] = useState(false);
  const [npPrefill, setNpPrefill] = useState(null);
  const [npOrder, setNpOrder] = useState(null);

  // Waybills for current order
  const [waybills, setWaybills] = useState([]);
  const [copiedTtn, setCopiedTtn] = useState(null);

  // Ручні правки пакування: { [pkgId]: { weight, width, height, thickness, envelope } }
  const [pkgOverrides, setPkgOverrides] = useState({});

  // Split mode: { pkgId, selectedItems: Map<uid, splitCount> }
  const [splitMode, setSplitMode] = useState(null);

  const loadWaybills = useCallback((orderId) => {
    if (!orderId) return;
    axios
      .get(`/novaposhta/waybills/${orderId}`)
      .then((r) => setWaybills(r.data || []))
      .catch(() => setWaybills([]));
  }, []);

  const fetchOrder = useCallback(async (id) => {
    if (!id) return;
    lastSearchId.current = id;
    setLoading(true);
    setError(null);
    setSearchError("");
    const notFound = () => setSearchError(
      `Замовлення №${id} не знайдено. Перевірте номер — можливо, в ньому помилка або замовлення видалене.`
    );
    try {
      const res = await axios.post("/Orders/OneOrder", { id });
      const data = res.data;
      if (!data || !data.id) {
        notFound();
        setLoading(false);
        return;
      }
      setOrder(data);
      loadWaybills(data.id);

      // Parse positions
      const units = data.OrderUnits || [];
      const items = units
        .filter((u) => {
          const type = u.newField6 || "";
          return type !== "Delivery" && type !== "Scans";
        })
        .map((u, idx) => {
          const parsed = parseOrderUnitForShipping(u);
          const autoWeight = calculatePositionWeight(parsed);
          // Use stable unique id: prefer real id, fallback to index
          const uid = u.id != null ? u.id : `idx_${idx}`;
          return { ...parsed, autoWeight, manualWeight: null, uid };
        });

      setParsedItems(items);
      setPkgOverrides({});
      setSplitMode(null);
      // All items in first package
      setPackages([{ id: nextPkgId++, itemIds: items.map((i) => i.uid) }]);
    } catch (e) {
      if (e.response?.status === 404) notFound();
      else setError(describeNpError(e, "order"));
    }
    setLoading(false);
  }, [loadWaybills]);

  // Auto-detect order from URL
  useEffect(() => {
    const match = window.location.pathname.match(/\/Orders\/(\d+)/);
    if (match) fetchOrder(match[1]);
  }, [fetchOrder]);

  // Esc: спершу скасовує розділення, потім закриває вікно (у формі накладної не діє)
  useEffect(() => {
    if (showNP) return undefined;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (splitMode) setSplitMode(null);
      else if (onClose) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showNP, splitMode, onClose]);

  const handleSearch = () => {
    const id = searchId.trim().replace(/^№\s*/, "");
    if (!id) return setSearchError("Вкажіть номер замовлення.");
    if (!/^\d+$/.test(id)) return setSearchError("Номер замовлення — лише цифри, наприклад 1234.");
    fetchOrder(id);
  };

  const setTtnError = (id, described) =>
    setTtnErrors((prev) => {
      const next = { ...prev };
      if (described) next[id] = described;
      else delete next[id];
      return next;
    });

  const pdf = (w, url, filename) => {
    setTtnError(w.id, null);
    downloadPdf(url, filename).catch((err) => setTtnError(w.id, describeNpError(err, "print")));
  };

  // Weight getter for an item
  const getWeight = (item) =>
    item.manualWeight !== null ? item.manualWeight : item.autoWeight;

  // Update manual weight ("" — повернути розрахункову)
  const setItemWeight = (uid, value) => {
    setParsedItems((prev) =>
      prev.map((it) =>
        it.uid === uid
          ? { ...it, manualWeight: value === "" ? null : parseFloat(value) || 0 }
          : it
      )
    );
  };

  // Move item to another package
  const moveItem = (uid, fromPkgId, toPkgId) => {
    setPackages((prev) =>
      prev.map((pkg) => {
        if (pkg.id === fromPkgId) {
          return { ...pkg, itemIds: pkg.itemIds.filter((id) => id !== uid) };
        }
        if (pkg.id === toPkgId) {
          return { ...pkg, itemIds: [...pkg.itemIds, uid] };
        }
        return pkg;
      })
    );
  };

  const addPackage = () => {
    setPackages((prev) => [...prev, { id: nextPkgId++, itemIds: [] }]);
  };

  const removePackage = (pkgId) => {
    if (packages.length <= 1) return;
    const pkg = packages.find((p) => p.id === pkgId);
    if (!pkg) return;
    if (splitMode?.pkgId === pkgId) setSplitMode(null);
    // Move orphaned items to first remaining package
    setPackages((prev) => {
      const remaining = prev.filter((p) => p.id !== pkgId);
      remaining[0] = {
        ...remaining[0],
        itemIds: [...remaining[0].itemIds, ...pkg.itemIds],
      };
      return remaining;
    });
  };

  // Start split mode for a package
  const startSplit = (pkgId) => {
    setSplitMode({ pkgId, selectedItems: new Map() }); // Map<uid, splitCount>
  };

  // Toggle item selection in split mode (or update split count)
  const toggleSplitItem = (uid) => {
    if (!splitMode) return;
    setSplitMode((prev) => {
      const next = new Map(prev.selectedItems);
      if (next.has(uid)) {
        next.delete(uid);
      } else {
        // Default: full count
        const item = parsedItems.find((it) => it.uid === uid);
        next.set(uid, item ? item.count : 1);
      }
      return { ...prev, selectedItems: next };
    });
  };

  // Update split quantity for a selected item
  const setSplitCount = (uid, value) => {
    if (!splitMode) return;
    const item = parsedItems.find((it) => it.uid === uid);
    if (!item) return;
    const num = parseInt(value) || 0;
    const clamped = Math.max(0, Math.min(num, item.count));
    setSplitMode((prev) => {
      const next = new Map(prev.selectedItems);
      next.set(uid, clamped);
      return { ...prev, selectedItems: next };
    });
  };

  // Confirm split — move selected items (or partial quantities) to a new package
  const confirmSplit = () => {
    if (!splitMode || splitMode.selectedItems.size === 0) return;
    const { pkgId, selectedItems } = splitMode;
    const newPkgId = nextPkgId++;
    const newItemIds = [];
    const removeFromSource = new Set(); // uids to fully remove
    const partialSplits = []; // { originalUid, splitCount }

    for (const [uid, splitCount] of selectedItems) {
      const item = parsedItems.find((it) => it.uid === uid);
      if (!item) continue;
      if (splitCount >= item.count) {
        // Full move
        removeFromSource.add(uid);
        newItemIds.push(uid);
      } else if (splitCount > 0) {
        // Partial split — clone item
        partialSplits.push({ originalUid: uid, splitCount });
      }
    }

    // Create cloned items for partial splits
    if (partialSplits.length > 0) {
      setParsedItems((prev) => {
        const updated = [...prev];
        for (const { originalUid, splitCount } of partialSplits) {
          const idx = updated.findIndex((it) => it.uid === originalUid);
          if (idx === -1) continue;
          const original = updated[idx];
          const remainCount = original.count - splitCount;
          const ratio = splitCount / original.count;

          // Reduce original count
          updated[idx] = {
            ...original,
            count: remainCount,
            autoWeight: original.autoWeight * (1 - ratio),
            manualWeight: original.manualWeight !== null
              ? original.manualWeight * (1 - ratio)
              : null,
          };

          // Create clone for new package
          const cloneUid = `split_${nextSplitUid++}`;
          updated.push({
            ...original,
            uid: cloneUid,
            count: splitCount,
            autoWeight: original.autoWeight * ratio,
            manualWeight: original.manualWeight !== null
              ? original.manualWeight * ratio
              : null,
          });
          newItemIds.push(cloneUid);
        }
        return updated;
      });
    }

    setPackages((prev) =>
      prev.map((pkg) => {
        if (pkg.id === pkgId) {
          return {
            ...pkg,
            itemIds: pkg.itemIds.filter((id) => !removeFromSource.has(id)),
          };
        }
        return pkg;
      }).concat([{ id: newPkgId, itemIds: newItemIds }])
    );
    setSplitMode(null);
  };

  // Envelope recommendation per package
  const getPackageRecommendation = useCallback(
    (pkg) => {
      const items = pkg.itemIds
        .map((id) => parsedItems.find((it) => it.uid === id))
        .filter(Boolean);
      if (!items.length) return null;
      return getEnvelopeRecommendation(items, marginValue);
    },
    [parsedItems, marginValue]
  );

  // Total weight per package (with margin)
  const getPackageWeight = useCallback(
    (pkg) => {
      const items = pkg.itemIds
        .map((id) => parsedItems.find((it) => it.uid === id))
        .filter(Boolean);
      const raw = items.reduce((sum, it) => sum + getWeight(it), 0);
      return Math.round(raw * (1 + marginValue) * 100) / 100;
    },
    [parsedItems, marginValue]
  );

  // Те, що показано в полях пакування, поки немає ручних правок
  const autoSpec = (pkg) => {
    const rec = getPackageRecommendation(pkg);
    return {
      weight: getPackageWeight(pkg).toFixed(2),
      width: String(rec ? rec.dimensions.width : 0),
      height: String(rec ? rec.dimensions.height : 0),
      thickness: String(rec ? rec.dimensions.thickness : 0),
      envelope: null,
    };
  };

  // Пряма правка ваги/габаритів. Зміна габаритів перераховує вагу як більшу
  // з фактичної та об'ємної — саме за нею НП рахує тариф.
  const editSpec = (pkg, field, value) => {
    const physical = getPackageWeight(pkg);
    setPkgOverrides((prev) => {
      const current = prev[pkg.id] || autoSpec(pkg);
      const updated = { ...current, [field]: value };
      if (["width", "height", "thickness"].includes(field)) {
        const vw = volWeight(updated.width, updated.height, updated.thickness);
        updated.weight = Math.max(physical, vw, 0.1).toFixed(2);
      }
      return { ...prev, [pkg.id]: updated };
    });
  };

  const resetSpec = (pkgId) => {
    setPkgOverrides((prev) => {
      const next = { ...prev };
      delete next[pkgId];
      return next;
    });
  };

  // Quick envelope/box selection from card click (no edit mode needed)
  const setEnvelopeQuick = useCallback((pkgId, envName) => {
    setPkgOverrides((prev) => {
      const existing = prev[pkgId];
      const pkg = packages.find((p) => p.id === pkgId);
      if (!pkg) return prev;

      // Toggle off if same envelope clicked again
      if (existing && existing.envelope === envName) {
        return { ...prev, [pkgId]: { ...existing, envelope: null } };
      }

      const r = getPackageRecommendation(pkg);
      const pw = getPackageWeight(pkg);
      const envObj = envName !== "box" ? ENVELOPES.find((e) => e.name === envName) : null;

      let w, h, t, weightStr;
      if (envObj) {
        // Envelope — use physical envelope dimensions
        w = envObj.width;
        h = envObj.height;
        t = ENVELOPE_THICKNESS_MM;
        weightStr = String(Math.max(pw, 0.1).toFixed(2));
      } else {
        // Box — use computed content dimensions with safety margin
        w = r ? r.dimensions.width : 0;
        h = r ? r.dimensions.height : 0;
        t = r ? r.dimensions.thickness : 10;
        const vw = volWeight(w, h, t);
        weightStr = String(Math.max(pw, vw, 0.1).toFixed(2));
      }

      return { ...prev, [pkgId]: {
        weight: weightStr,
        width: String(w),
        height: String(h),
        thickness: String(t),
        envelope: envName,
      } };
    });
  }, [packages, getPackageRecommendation, getPackageWeight]);

  const pkgItemsOf = (pkg) =>
    pkg.itemIds.map((id) => parsedItems.find((it) => it.uid === id)).filter(Boolean);

  // Одне місце ТТН з посилки: вага, Д×Ш×В у мм і тип
  const seatOf = (pkg) => {
    const rec = getPackageRecommendation(pkg);
    const weight = getPackageWeight(pkg);
    const items = pkgItemsOf(pkg);

    const maxW = Math.max(...items.map((i) => Math.min(i.sizeX, i.sizeY)), 0);
    const maxH = Math.max(...items.map((i) => Math.max(i.sizeX, i.sizeY)), 0);
    const margin = 1 + marginValue;

    // Use overrides if set, otherwise auto-calculated values
    const ov = pkgOverrides[pkg.id];
    const finalWeight = ov ? parseFloat(ov.weight) || weight : weight;
    const finalWidth = ov ? parseFloat(ov.width) || Math.round(maxW * margin) : Math.round(maxW * margin);
    const finalHeight = ov ? parseFloat(ov.height) || Math.round(maxH * margin) : Math.round(maxH * margin);
    const finalThickness = ov ? parseFloat(ov.thickness) || (rec ? rec.dimensions.thickness : 10) : (rec ? rec.dimensions.thickness : 10);

    // Determine cargo type: if envelope override selected → Documents, else auto
    let isDocuments = rec && !rec.needsParcel;
    if (ov?.envelope && ov.envelope !== "box") {
      isDocuments = true;
    } else if (ov?.envelope === "box") {
      isDocuments = false;
    }
    const pack = ov?.envelope || rec?.recommended?.name || "box";

    return {
      Weight: String(Math.max(finalWeight, 0.1)),
      Length: String(Math.round(finalHeight)),
      Width: String(Math.round(finalWidth)),
      Height: String(finalThickness),
      CargoType: isDocuments ? "Documents" : "Cargo",
      Pack: pack === "box" ? "Коробка" : `Конверт ${pack}`,
    };
  };

  // Помилки пакування: вага й габарити кожної непорожньої посилки мають бути > 0.
  // Ключ — `pkg-<id>-weight` / `pkg-<id>-dims`, той самий, що в data-np-field.
  const packErrors = (() => {
    const out = {};
    packages.forEach((pkg, i) => {
      if (!pkg.itemIds.length) return;
      const ov = pkgOverrides[pkg.id];
      const weight = ov ? ov.weight : getPackageWeight(pkg);
      if (!positive(weight)) {
        out[`pkg-${pkg.id}-weight`] = { pkg: i + 1, what: "вага", text: "Вкажіть вагу посилки більше 0 кг." };
      }
      if (ov && (!positive(ov.width) || !positive(ov.height) || !positive(ov.thickness))) {
        out[`pkg-${pkg.id}-dims`] = { pkg: i + 1, what: "габарити", text: "Вкажіть ширину, висоту й товщину більше 0 мм." };
      }
    });
    return out;
  })();
  const packErrorList = Object.entries(packErrors);
  const packAlert = ttnTried && packErrorList.length
    ? {
        kind: "validation",
        title: "Перевірте пакування",
        items: packErrorList.map(([field, e]) => ({ field, label: `Посилка ${e.pkg}, ${e.what}`, text: e.text })),
        hint: "Виправте позначені поля — потім можна переходити до накладної.",
        details: "",
      }
    : null;

  // Відкрити форму накладної: кожна непорожня посилка — окреме місце однієї ТТН
  const openTTN = () => {
    if (packErrorList.length) {
      setTtnTried(true);
      const first = packErrorList[0][0];
      setTimeout(() => focusNpField(first), 30);
      return;
    }
    setTtnTried(false);
    const filled = packages.filter((p) => p.itemIds.length > 0);
    const shipPkgs = filled.length ? filled : packages.slice(0, 1);
    const seatList = shipPkgs.map(seatOf);
    const [first] = seatList;

    // Опис — «Поліграфічна продукція», перелік позицій (по місцях) — у додатковій інформації
    const seatItems = shipPkgs.map(pkgItemsOf);
    const totalWeight = seatList.reduce((s, x) => s + (parseFloat(x.Weight) || 0), 0);

    setNpPrefill({
      // Верхні поля — одномісний формат; для кількох посилок вага — сума місць
      Weight: String(Math.round(totalWeight * 100) / 100),
      Length: first.Length,
      Width: first.Width,
      Height: first.Height,
      SeatsAmount: String(seatList.length),
      Seats: seatList.length > 1 ? seatList : null,
      // Хоч одна коробка — вся накладна йде як вантаж
      CargoType: seatList.some((s) => s.CargoType === "Cargo") ? "Cargo" : "Documents",
      Cost: String(order?.allPrice || order?.price || "1"),
      Description: NP_DEFAULT_DESCRIPTION,
      AdditionalInformation: positionsInfo(seatItems),
      RecipientsPhone: order?.client?.phoneNumber || order?.User?.phoneNumber || "",
    });

    // Build a minimal order object for NP.jsx
    // API returns client (not User) as the customer alias
    const clientUser = order?.client || order?.User || { phoneNumber: "" };
    setNpOrder({
      ...order,
      User: clientUser,
      userId: clientUser?.id || order?.userId,
    });
    setShowNP(true);
  };

  // NP modal render
  if (showNP && npOrder) {
    return (
      <NP
        showNP={showNP}
        setShowNP={(v) => {
          setShowNP(v);
          if (!v) {
            setNpPrefill(null);
            setNpOrder(null);
            // Refresh waybills after NP modal closes
            loadWaybills(order?.id);
          }
        }}
        onCloseAll={onClose}
        thisOrder={npOrder}
        setThisOrder={() => {}}
        prefillData={npPrefill}
      />
    );
  }

  const hasWaybills = waybills.length > 0;
  const orderClient = order?.client || order?.User;
  const filledPackages = packages.filter((p) => p.itemIds.length > 0);
  const totalPcs = parsedItems.reduce((s, it) => s + (it.count || 1), 0);
  const totalKg = filledPackages.reduce((s, p) => {
    const ov = pkgOverrides[p.id];
    return s + (ov ? parseFloat(ov.weight) || 0 : getPackageWeight(p));
  }, 0);
  const showMove = packages.length > 1 && !hasWaybills;

  // Порожнє замовлення: посилку зібрати нема з чого. Доставка й сканування
  // в посилку не йдуть — якщо є лише вони, кажемо про це окремо.
  const orderUnits = order?.OrderUnits || [];
  const emptyOrder = order && !loading && parsedItems.length === 0 && !hasWaybills
    ? {
        kind: "validation",
        title: `У замовленні №${order.id} поки нічого відправляти`,
        items: [{
          field: null,
          label: null,
          text: orderUnits.length
            ? "Тут лише доставка чи сканування — у посилку вони не йдуть."
            : "У замовленні ще немає жодної позиції.",
        }],
        hint: "Додайте в замовлення продукцію, яку треба відправити, і відкрийте Нову Пошту знову — вагу й пакування порахуємо автоматично.",
        details: "",
        retry: true,
      }
    : null;

  const pickAnotherOrder = () => {
    setOrder(null);
    setParsedItems([]);
    setWaybills([]);
    setSearchId("");
    setSearchError("");
    setError(null);
  };

  const copyTtn = (w) => {
    const raw = String(w.intDocNumber || "");
    if (!raw || !navigator.clipboard) return;
    navigator.clipboard.writeText(raw).then(() => {
      setCopiedTtn(w.id);
      setTimeout(() => setCopiedTtn((c) => (c === w.id ? null : c)), 1600);
    }).catch(() => {});
  };

  const renderPackage = (pkg, pkgIdx) => {
    const pkgItems = pkgItemsOf(pkg);
    const rec = getPackageRecommendation(pkg);
    const weight = getPackageWeight(pkg);
    const ov = pkgOverrides[pkg.id];
    const spec = ov || autoSpec(pkg);
    const isSplitting = splitMode?.pkgId === pkg.id;
    const pcs = pkgItems.reduce((sum, it) => sum + (it.count || 1), 0);
    const canSplit = pkgItems.length > 1 || (pkgItems[0]?.count || 0) > 1;

    // Що зараз обрано: ручний вибір → рекомендований конверт → коробка
    const activePack = ov?.envelope || rec?.recommended?.name || (rec ? "box" : null);
    const packName = !rec
      ? "—"
      : activePack === "box"
      ? "Коробка"
      : `Конверт ${activePack}`;
    const isDocs = ov?.envelope && ov.envelope !== "box"
      ? true
      : ov?.envelope === "box" || rec?.needsParcel
      ? false
      : true;
    const chosenEnv = ov?.envelope && ov.envelope !== "box"
      ? rec?.allEnvelopes.find((e) => e.name === ov.envelope)
      : null;
    const missReason = (env) =>
      !env.widthOk || !env.heightOk
        ? "розмір"
        : !env.thicknessOk
        ? "товщина"
        : !env.weightOk
        ? "вага"
        : "";

    // спільний масштаб мініатюр: найбільший конверт або вміст, якщо він більший
    const content = { w: rec ? rec.dimensions.width : 0, h: rec ? rec.dimensions.height : 0 };
    const glyphScale = Math.min(34 / Math.max(458, content.h), 40 / Math.max(324, content.w));

    return (
      <section className={`npw-pkg${isSplitting ? " is-splitting" : ""}`} key={pkg.id}>
        <div className="npw-pkg-head">
          <span className="npw-pkg-no">{pkgIdx + 1}</span>
          <h3 className="npw-pkg-title">Посилка</h3>
          <div className="npw-pkg-chips">
            <span className="npw-chip npw-chip--num">{fmtNum(ov ? ov.weight : weight)} кг</span>
            <span className="npw-chip npw-chip--num">{pcs} шт</span>
            {rec && <span className="npw-chip npw-chip--pack">{packName}</span>}
          </div>
          <div className="npw-pkg-tools">
            {canSplit && !isSplitting && !hasWaybills && (
              <button type="button" className="npw-btn npw-btn--sm npw-btn--ghost" onClick={() => startSplit(pkg.id)}>
                Розділити
              </button>
            )}
            {packages.length > 1 && !hasWaybills && (
              <button
                type="button"
                className="npw-icon-btn npw-icon-btn--danger"
                onClick={() => removePackage(pkg.id)}
                title="Прибрати посилку — її позиції повернуться в першу"
                aria-label="Прибрати посилку"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" fill="none" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className={`npw-table${isSplitting ? " has-check" : ""}${showMove && !isSplitting ? " has-move" : ""}`} role="table">
          {pkgItems.length > 0 && (
            <div className="npw-tr npw-tr--head" role="row">
              {isSplitting && <span className="npw-th" />}
              <span className="npw-th">Позиція</span>
              <span className="npw-th npw-th--num">Розмір, мм</span>
              <span className="npw-th npw-th--num">Кількість</span>
              <span className="npw-th npw-th--num">Вага, кг</span>
              {showMove && !isSplitting && <span className="npw-th npw-th--num">У посилку</span>}
            </div>
          )}

          {pkgItems.length === 0 && (
            <div className="npw-pkg-empty">
              Порожня посилка — перенесіть сюди позиції кнопками «У посилку»
            </div>
          )}

          {pkgItems.map((item) => {
            const isSelected = isSplitting && splitMode.selectedItems.has(item.uid);
            const splitCount = isSelected ? splitMode.selectedItems.get(item.uid) : null;
            const autoW = Math.round(item.autoWeight * 100) / 100;
            return (
              <div
                key={item.uid}
                role="row"
                className={`npw-tr${isSplitting ? " is-pickable" : ""}${isSelected ? " is-selected" : ""}`}
                onClick={isSplitting ? () => toggleSplitItem(item.uid) : undefined}
              >
                {isSplitting && (
                  <span className="npw-td npw-td--check">
                    <span className={`npw-tick${isSelected ? " is-on" : ""}`} aria-hidden="true" />
                  </span>
                )}
                <span className="npw-td npw-td--name" title={item.name}>
                  {item.name.replace(/,\s*$/, "")}
                </span>
                <span className="npw-td npw-td--num npw-td--size">
                  {Math.round(item.sizeX)}×{Math.round(item.sizeY)}
                </span>
                <span className="npw-td npw-td--num npw-td--qty">
                  {isSelected && item.count > 1 ? (
                    <span className="npw-split-qty" onClick={(e) => e.stopPropagation()}>
                      <NpNumber
                        className="npw-input npw-input--num npw-input--xs"
                        value={splitCount}
                        min="1"
                        max={item.count}
                        step="1"
                        onCommit={(v) => setSplitCount(item.uid, v)}
                        title="Скільки штук перенести в нову посилку"
                      />
                      <span className="npw-split-of">з {item.count}</span>
                    </span>
                  ) : (
                    item.count
                  )}
                </span>
                <span className="npw-td npw-td--num npw-td--weight">
                  {isSplitting || hasWaybills ? (
                    fmtNum(getWeight(item))
                  ) : (
                    <span className="npw-weight">
                      <NpNumber
                        className="npw-input npw-input--num npw-input--xs"
                        value={item.manualWeight !== null ? item.manualWeight : autoW}
                        step="0.01"
                        min="0"
                        onCommit={(v) => setItemWeight(item.uid, v)}
                        title="Вага позиції, кг"
                      />
                      {item.manualWeight !== null ? (
                        <button
                          type="button"
                          className="npw-mini-btn"
                          onClick={() => setItemWeight(item.uid, "")}
                          title={`Повернути розрахункову вагу (${fmtNum(autoW)} кг)`}
                          aria-label="Повернути розрахункову вагу"
                        >
                          ↺
                        </button>
                      ) : (
                        <span
                          className="npw-auto-tag"
                          title="Розраховано з формату, щільності паперу й кількості"
                        >
                          авто
                        </span>
                      )}
                    </span>
                  )}
                </span>
                {showMove && !isSplitting && (
                  <span className="npw-td npw-td--move">
                    {packages.map((p, i) => (
                      <button
                        type="button"
                        key={p.id}
                        className={`npw-move-btn${p.id === pkg.id ? " is-active" : ""}`}
                        disabled={p.id === pkg.id}
                        onClick={() => moveItem(item.uid, pkg.id, p.id)}
                        title={p.id === pkg.id ? "Ця посилка" : `Перенести в посилку ${i + 1}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {isSplitting && (
          <div className="npw-split-bar">
            <span className="npw-split-hint">
              Позначте, що поїде окремою посилкою. Кількість можна зменшити — решта лишиться тут.
            </span>
            <button
              type="button"
              className="npw-btn npw-btn--sm npw-btn--primary"
              onClick={confirmSplit}
              disabled={splitMode.selectedItems.size === 0}
            >
              У нову посилку · {splitMode.selectedItems.size}
            </button>
            <button type="button" className="npw-btn npw-btn--sm npw-btn--ghost" onClick={() => setSplitMode(null)}>
              Скасувати
            </button>
          </div>
        )}

        {/* Пакування — після створення ТТН уже не редагується */}
        {rec && !hasWaybills && (
          <div className="npw-pack">
            <div className="npw-pack-tiles" role="radiogroup" aria-label="Пакування">
              {rec.allEnvelopes.map((env) => {
                const active = activePack === env.name;
                const reason = missReason(env);
                return (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={active}
                    key={env.name}
                    className={`npw-pack-tile${active ? " is-active" : ""}${env.fits ? " is-fit" : " is-miss"}`}
                    onClick={() => setEnvelopeQuick(pkg.id, env.name)}
                    title={env.fits
                      ? `Конверт ${env.name} ${env.width}×${env.height} мм — влазить`
                      : `Конверт ${env.name} ${env.width}×${env.height} мм — не підходить: ${reason}`}
                  >
                    <PackGlyph env={env} content={content} scale={glyphScale} over={!env.fits} />
                    <span className="npw-pack-name">{env.name}</span>
                    <span className="npw-pack-size">{env.width}×{env.height}</span>
                    <span className="npw-pack-note">{env.fits ? `до ${env.fitsSheet}` : `✕ ${reason}`}</span>
                  </button>
                );
              })}
              <button
                type="button"
                role="radio"
                aria-checked={activePack === "box"}
                className={`npw-pack-tile is-fit${activePack === "box" ? " is-active" : ""}`}
                onClick={() => setEnvelopeQuick(pkg.id, "box")}
                title="Коробка — розмір за вмістом, відправляється як вантаж"
              >
                <PackGlyph env={null} content={content} scale={glyphScale} />
                <span className="npw-pack-name">Коробка</span>
                <span className="npw-pack-size">за вмістом</span>
                <span className="npw-pack-note">вантаж</span>
              </button>
            </div>

            <div className="npw-pack-spec">
              <label className="npw-field" data-np-field={`pkg-${pkg.id}-weight`}>
                <span className="npw-field-label">Вага, кг</span>
                <NpNumber
                  {...npInvalid(packErrors, `pkg-${pkg.id}-weight`, "npw-input npw-input--num")}
                  value={spec.weight}
                  step="0.01"
                  min="0"
                  onCommit={(v) => editSpec(pkg, "weight", v)}
                />
              </label>
              <div className="npw-field npw-field--dims" data-np-field={`pkg-${pkg.id}-dims`}>
                <span className="npw-field-label">Ширина × висота × товщина, мм</span>
                <div className="npw-dims">
                  <NpNumber {...npInvalid(packErrors, `pkg-${pkg.id}-dims`, "npw-input npw-input--num")} value={spec.width} step="1" min="0"
                    aria-label="Ширина, мм" onCommit={(v) => editSpec(pkg, "width", v)} />
                  <span className="npw-dims-x">×</span>
                  <NpNumber {...npInvalid(packErrors, `pkg-${pkg.id}-dims`, "npw-input npw-input--num")} value={spec.height} step="1" min="0"
                    aria-label="Висота, мм" onCommit={(v) => editSpec(pkg, "height", v)} />
                  <span className="npw-dims-x">×</span>
                  <NpNumber {...npInvalid(packErrors, `pkg-${pkg.id}-dims`, "npw-input npw-input--num")} value={spec.thickness} step="0.1" min="0"
                    aria-label="Товщина, мм" onCommit={(v) => editSpec(pkg, "thickness", v)} />
                </div>
              </div>
              <div className="npw-field npw-field--type">
                <span className="npw-field-label">Тип</span>
                <span className={`npw-type-tag${isDocs ? "" : " is-cargo"}`}>{isDocs ? "Документи" : "Вантаж"}</span>
              </div>
              {ov && (
                <button
                  type="button"
                  className="npw-btn npw-btn--sm npw-btn--ghost npw-pack-reset"
                  onClick={() => resetSpec(pkg.id)}
                  title="Скинути ручні правки й повернутись до розрахунку"
                >
                  ↺ Авто
                </button>
              )}
              {/* тексти — окремим рядком на всю ширину, щоб поля лишались на одній лінії */}
              {(packErrors[`pkg-${pkg.id}-weight`] || packErrors[`pkg-${pkg.id}-dims`]) && (
                <div className="npw-pack-errors">
                  <NpFieldError field={`pkg-${pkg.id}-weight`}>{packErrors[`pkg-${pkg.id}-weight`]?.text}</NpFieldError>
                  <NpFieldError field={`pkg-${pkg.id}-dims`}>{packErrors[`pkg-${pkg.id}-dims`]?.text}</NpFieldError>
                </div>
              )}
            </div>

            {chosenEnv && !chosenEnv.fits ? (
              <div className="npw-note npw-note--warn">
                Вміст не влазить у конверт {chosenEnv.name}: {missReason(chosenEnv)}. Оберіть більший або коробку.
              </div>
            ) : rec.needsParcel && !ov?.envelope ? (
              <div className="npw-note">
                Не влазить у жоден конверт — пакуємо в коробку й відправляємо як вантаж.
              </div>
            ) : null}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="npw-overlay">
      <div
        className="npw-modal npw-modal--calc"
        role="dialog"
        aria-modal="true"
        aria-label="Нова Пошта — пакування"
        onClick={(e) => e.stopPropagation()}
      >
        <NpHeader
          step={0}
          orderId={order?.id}
          clientName={clientDisplayName(orderClient)}
          onClose={onClose}
        />

        <div className="npw-body">
          {!order && !loading && (
            <div className="npw-search">
              <NpMark size={44} />
              <div className="npw-search-title">Відправлення для замовлення</div>
              <div className="npw-search-row">
                <input
                  {...npInvalid(searchError ? { orderId: searchError } : null, "orderId")}
                  placeholder="Номер замовлення"
                  inputMode="numeric"
                  autoFocus
                  value={searchId}
                  onChange={(e) => {
                    setSearchId(e.target.value);
                    setSearchError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <button type="button" className="npw-btn npw-btn--primary" onClick={handleSearch}>
                  Знайти
                </button>
              </div>
              <NpFieldError field="orderId">{searchError}</NpFieldError>
            </div>
          )}

          {loading && <div className="npw-loading">Завантаження замовлення…</div>}
          <NpAlert
            error={error}
            onRetry={() => lastSearchId.current && fetchOrder(lastSearchId.current)}
            onClose={() => setError(null)}
          />

          {emptyOrder && (
            <div className="npw-empty">
              <NpAlert error={emptyOrder} onRetry={pickAnotherOrder} retryLabel="Інше замовлення" />
            </div>
          )}

          {hasWaybills && (
            <section className="npw-section">
              <h2 className="npw-label">{waybills.length > 1 ? "Накладні" : "Накладна"}</h2>
              <div className="npw-ttns">
                {waybills.map((w) => (
                  <div className="npw-ttn" key={w.id} data-has-error={ttnErrors[w.id] ? "" : undefined}>
                    <div className="npw-ttn-main">
                      <button
                        type="button"
                        className="npw-ttn-num"
                        onClick={() => copyTtn(w)}
                        title="Скопіювати номер ТТН"
                      >
                        {formatTtn(w.intDocNumber)}
                        <span className="npw-ttn-copy">{copiedTtn === w.id ? "скопійовано" : "копіювати"}</span>
                      </button>
                      <span className="npw-ttn-meta">
                        {[
                          w.recipientName,
                          w.costOnSite ? `доставка ${w.costOnSite} грн` : null,
                          w.estimatedDeliveryDate ? `орієнтовно ${w.estimatedDeliveryDate}` : null,
                        ].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                    <div className="npw-ttn-actions">
                      <button
                        type="button"
                        className="npw-btn npw-btn--sm"
                        onClick={() => pdf(w, `/novaposhta/print/${w.ref}`, `TTN_${w.intDocNumber}.pdf`)}
                      >
                        ТТН · PDF
                      </button>
                      <button
                        type="button"
                        className="npw-btn npw-btn--sm"
                        onClick={() => pdf(w, `/novaposhta/print-sticker/${w.ref}`, `Sticker_${w.intDocNumber}.pdf`)}
                      >
                        Наліпка · PDF
                      </button>
                      {w.ref && (
                        <NovaPoshtaThermalButton
                          waybillRef={w.ref}
                          intDocNumber={w.intDocNumber}
                          className="npw-btn npw-btn--sm npw-btn--primary"
                          onError={(d) => setTtnError(w.id, d)}
                        />
                      )}
                    </div>
                    {ttnErrors[w.id] && (
                      <div className="npw-ttn-alert">
                        <NpAlert error={ttnErrors[w.id]} onClose={() => setTtnError(w.id, null)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {parsedItems.length > 0 && (
            <section className="npw-section">
              <div className="npw-toolbar">
                <h2 className="npw-label">
                  {packages.length} {plural(packages.length, ["посилка", "посилки", "посилок"])}
                </h2>
                {!hasWaybills && (
                  <NpCheck checked={safetyMargin} onChange={setSafetyMargin}>
                    +15% на пакування
                  </NpCheck>
                )}
              </div>

              <div className="npw-packages">{packages.map(renderPackage)}</div>

              {!hasWaybills && (
                <button type="button" className="npw-add-pkg" onClick={addPackage}>
                  <span aria-hidden="true">+</span> Додати посилку
                </button>
              )}
            </section>
          )}
        </div>

        {parsedItems.length > 0 && (
          <footer className="npw-foot">
            {packAlert && (
              <div className="npw-foot-notes">
                <NpAlert error={packAlert} compact />
              </div>
            )}
            <dl className="npw-stats">
              <div className="npw-stat">
                <dt>Позицій</dt>
                <dd>{parsedItems.length}</dd>
              </div>
              <div className="npw-stat">
                <dt>Штук</dt>
                <dd>{totalPcs}</dd>
              </div>
              <div className="npw-stat">
                <dt>Вага</dt>
                <dd>{fmtNum(totalKg)} <small>кг</small></dd>
              </div>
              <div className="npw-stat">
                <dt>Місць</dt>
                <dd>{filledPackages.length}</dd>
              </div>
            </dl>
            {hasWaybills ? (
              <span className="npw-foot-done">
                <span className="npw-foot-done-mark" aria-hidden="true">✓</span>
                ТТН створено
              </span>
            ) : (
              <button
                type="button"
                className="npw-btn npw-btn--primary npw-btn--cta"
                disabled={filledPackages.length === 0}
                onClick={openTTN}
              >
                Створити ТТН
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path d="M3 9h11M10 4.5L14.5 9 10 13.5" stroke="currentColor" strokeWidth="1.7" fill="none" />
                </svg>
              </button>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}
