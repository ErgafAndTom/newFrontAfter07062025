import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "../../api/axiosInstance";
import {
  parseOrderUnitForShipping,
  calculatePositionWeight,
  getEnvelopeRecommendation,
  ENVELOPES,
} from "./npWeightUtils";
import NP from "../userInNewUiArtem/NP";
import NovaPoshtaThermalButton from "./NovaPoshtaThermalButton";
import "./NovaPoshtaCalculator.css";

let nextPkgId = 1;
let nextSplitUid = 1;

export default function NovaPoshtaCalculator({ onClose }) {
  const [order, setOrder] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Per-package edit mode: { [pkgId]: { weight, width, height, thickness, envelope } }
  const [editingPkg, setEditingPkg] = useState(null);
  const [pkgOverrides, setPkgOverrides] = useState({});

  // Split mode: { pkgId, selectedItems: Set, splitCounts: { [uid]: number } }
  const [splitMode, setSplitMode] = useState(null);

  // Auto-detect order from URL
  useEffect(() => {
    const match = window.location.pathname.match(/\/Orders\/(\d+)/);
    if (match) {
      fetchOrder(match[1]);
    }
  }, []);

  const fetchOrder = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/Orders/OneOrder", { id });
      const data = res.data;
      if (!data || !data.id) {
        setError("Замовлення не знайдено");
        setLoading(false);
        return;
      }
      setOrder(data);

      // Fetch waybills for this order
      axios.get(`/novaposhta/waybills/${data.id}`)
        .then(r => setWaybills(r.data || []))
        .catch(() => setWaybills([]));

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
      // All items in first package
      setPackages([
        { id: nextPkgId++, itemIds: items.map((i) => i.uid) },
      ]);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Помилка завантаження");
    }
    setLoading(false);
  }, []);

  const handleSearch = () => {
    const id = searchId.trim();
    if (id) fetchOrder(id);
  };

  // Weight getter for an item
  const getWeight = (item) =>
    item.manualWeight !== null ? item.manualWeight : item.autoWeight;

  // Update manual weight
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

  // Toggle edit mode for a package
  const toggleEdit = (pkgId) => {
    if (editingPkg === pkgId) {
      setEditingPkg(null);
    } else {
      setEditingPkg(pkgId);
      // Initialize overrides from current calculated values if not set
      if (!pkgOverrides[pkgId]) {
        const pkg = packages.find((p) => p.id === pkgId);
        if (pkg) {
          const rec = getPackageRecommendation(pkg);
          const physWeight = getPackageWeight(pkg);
          const w = rec ? rec.dimensions.width : 0;
          const h = rec ? rec.dimensions.height : 0;
          const t = rec ? rec.dimensions.thickness : 10;
          const vw = (w / 10) * (h / 10) * (t / 10) / 4000;
          setPkgOverrides((prev) => ({
            ...prev,
            [pkgId]: {
              weight: String(Math.max(physWeight, vw, 0.1).toFixed(2)),
              width: rec ? String(w) : "",
              height: rec ? String(h) : "",
              thickness: rec ? String(t) : "",
              envelope: rec?.recommended?.name || null,
            },
          }));
        }
      }
    }
  };

  // Update override field; auto-recalculate volumetric weight for box or on dimension change
  const setOverride = (pkgId, field, value) => {
    setPkgOverrides((prev) => {
      const current = prev[pkgId] || {};
      const updated = { ...current, [field]: value };

      // When switching to a specific envelope — substitute its physical dimensions
      if (field === 'envelope' && value && value !== 'box') {
        const envObj = ENVELOPES.find((e) => e.name === value);
        if (envObj) {
          updated.width = String(envObj.width);
          updated.height = String(envObj.height);
        }
      }

      const isBox = updated.envelope === 'box';
      if (isBox || ['width', 'height', 'thickness'].includes(field)) {
        const wCm = (parseFloat(updated.width) || 0) / 10;
        const hCm = (parseFloat(updated.height) || 0) / 10;
        const tCm = (parseFloat(updated.thickness) || 0) / 10;
        const vw = wCm * hCm * tCm / 4000;
        updated.weight = Math.max(0.1, vw).toFixed(2);
      }
      return { ...prev, [pkgId]: updated };
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
          const originalWeight = getWeight(original);
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
        t = r ? r.dimensions.thickness : 5;
        weightStr = String(Math.max(pw, 0.1).toFixed(2));
      } else {
        // Box — use computed content dimensions with safety margin
        w = r ? r.dimensions.width : 0;
        h = r ? r.dimensions.height : 0;
        t = r ? r.dimensions.thickness : 10;
        const vw = (w / 10) * (h / 10) * (t / 10) / 4000;
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

  // Open NP.jsx with prefill for a specific package
  const openTTN = (pkg) => {
    const rec = getPackageRecommendation(pkg);
    const weight = getPackageWeight(pkg);
    const items = pkg.itemIds
      .map((id) => parsedItems.find((it) => it.uid === id))
      .filter(Boolean);

    const maxW = Math.max(...items.map((i) => Math.min(i.sizeX, i.sizeY)), 0);
    const maxH = Math.max(...items.map((i) => Math.max(i.sizeX, i.sizeY)), 0);
    const margin = 1 + marginValue;

    const description = items.map((i) => `${i.name} x${i.count}`).join(", ");

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

    setNpPrefill({
      Weight: String(Math.max(finalWeight, 0.1)),
      Length: String(Math.round(finalHeight)),
      Width: String(Math.round(finalWidth)),
      Height: String(finalThickness),
      SeatsAmount: String(packages.length),
      CargoType: isDocuments ? "Documents" : "Cargo",
      Cost: String(order?.allPrice || order?.price || "1"),
      Description: description.substring(0, 200),
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
            if (order?.id) {
              axios.get(`/novaposhta/waybills/${order.id}`)
                .then(r => setWaybills(r.data || []))
                .catch(() => {});
            }
          }
        }}
        thisOrder={npOrder}
        setThisOrder={() => {}}
        prefillData={npPrefill}
      />
    );
  }

  return (
    <div className="npc-overlay">
      <div className="npc-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="npc-header">
          <svg className="npc-header-logo" viewBox="0 0 191 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.29 18.6216H8.01973V14.25C8.01973 13.1023 7.16401 12.2492 6.01295 12.2492H0.5V16.8775H3.00658V29.7508H8.01973V23.3784H14.29V29.7508H19.3031V12.2492H14.29V18.6216Z" fill="#DA291C"/>
            <path d="M30.844 12C25.5506 12 21.6885 15.7978 21.6885 21C21.6885 26.2022 25.5506 30 30.844 30C36.1373 30 39.9994 26.2022 39.9994 21C39.9994 15.7978 36.1297 12 30.844 12ZM30.844 25.1225C28.4585 25.1225 26.7092 23.3708 26.7092 21C26.7092 18.6292 28.4661 16.8775 30.844 16.8775C33.2294 16.8775 34.9787 18.6292 34.9787 21C34.9787 23.3708 33.2218 25.1225 30.844 25.1225Z" fill="#DA291C"/>
            <path d="M55.5084 20.4941C56.7503 19.7391 57.5227 18.448 57.5227 16.9002C57.5227 14.1971 55.7658 12.2492 52.2824 12.2492H42.3772V29.7508H52.2824C55.94 29.7508 58.0755 27.6292 58.0755 24.6997C58.0755 22.8196 57.0759 21.302 55.5084 20.4941ZM47.042 16.1451H50.7754C51.9568 16.1451 52.6307 16.719 52.6307 17.693C52.6307 18.6669 51.9568 19.2408 50.7754 19.2408H47.042V16.1451ZM51.1238 25.9002H47.0345V22.6535H51.1238C52.3808 22.6535 53.0775 23.25 53.0775 24.2768C53.0775 25.3037 52.3808 25.9002 51.1238 25.9002Z" fill="#DA291C"/>
            <path d="M65.7467 12.2492L58.8252 29.7508H64.164L65.2772 26.5268H72.3274L73.4406 29.7508H78.8854L71.9639 12.2492H65.7467ZM66.6327 22.6007L68.6092 16.8775H68.9878L70.9643 22.6007H66.6327Z" fill="#DA291C"/>
            <path d="M102.861 12.2492H86.0644V16.8775H88.5709V29.7508H93.5841V16.87H99.8543V29.7433H104.867V14.25C104.86 12.974 104.133 12.2492 102.861 12.2492Z" fill="#DA291C"/>
            <path d="M116.401 12C111.107 12 107.245 15.7978 107.245 21C107.245 26.2022 111.107 30 116.401 30C121.694 30 125.556 26.2022 125.556 21C125.556 15.7978 121.687 12 116.401 12ZM116.401 25.1225C114.015 25.1225 112.266 23.3708 112.266 21C112.266 18.6292 114.023 16.8775 116.401 16.8775C118.779 16.8775 120.535 18.6292 120.535 21C120.535 23.3708 118.779 25.1225 116.401 25.1225Z" fill="#DA291C"/>
            <path d="M147.494 25.1225H142.731V12.2492H137.71V25.1225H132.947V12.2492H127.934V29.7508H152.508V12.2492H147.494V25.1225Z" fill="#DA291C"/>
            <path d="M171.939 16.87V12.2492H154.893V16.87H160.906V29.7508H165.919V16.87H171.939Z" fill="#DA291C"/>
            <path d="M185.055 29.7508H190.5L183.579 12.2492H177.361L170.44 29.7508H175.779L176.892 26.5268H183.942L185.055 29.7508ZM178.247 22.6007L180.224 16.8775H180.602L182.579 22.6007H178.247Z" fill="#DA291C"/>
          </svg>
          <button className="npc-close-btn" onClick={onClose} aria-label="Закрити">&#x2715;</button>
        </div>

        {/* Body */}
        <div className="npc-body">
          {/* Search if no order */}
          {!order && !loading && (
            <div className="npc-search">
              <input
                className="npc-search-input"
                placeholder="ID замовлення..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className="npc-search-btn" onClick={handleSearch}>
                Знайти
              </button>
            </div>
          )}

          {loading && <div className="npc-loading">Завантаження...</div>}
          {error && <div className="npc-needs-parcel">{error}</div>}

          {/* Positions list */}
          {parsedItems.length > 0 && (
            <>
              <div>
                <div className="npc-section-title">позиції замовлення</div>
                <div className="npc-positions">
                  <div className="npc-pos-header">
                    <span>Назва</span>
                    <span style={{ textAlign: "center" }}>Розмір, мм</span>
                    <span style={{ textAlign: "center" }}>Кіл.</span>
                    <span style={{ textAlign: "right" }}>Вага, кг</span>
                    <span></span>
                  </div>
                  {parsedItems.map((item) => (
                    <div className="npc-pos-row" key={item.uid}>
                      <span className="npc-pos-name" title={item.name}>
                        {item.name}
                      </span>
                      <span className="npc-pos-size">
                        {Math.round(item.sizeX)}×{Math.round(item.sizeY)}
                      </span>
                      <span className="npc-pos-count">{item.count}</span>
                      <span className="npc-pos-weight">
                        <input
                          className="npc-weight-input"
                          type="number"
                          step="0.01"
                          min="0"
                          value={
                            item.manualWeight !== null
                              ? item.manualWeight
                              : Math.round(item.autoWeight * 100) / 100
                          }
                          onChange={(e) =>
                            setItemWeight(item.uid, e.target.value)
                          }
                          title="Вага (кг). Можна скоригувати вручну"
                        />
                      </span>
                      <span className="npc-pos-move" title="Редагується авто-вага">
                        ⚖
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety margin */}
              <label className="npc-margin-toggle">
                <input
                  type="checkbox"
                  checked={safetyMargin}
                  onChange={(e) => setSafetyMargin(e.target.checked)}
                />
                додати +15% запас на пакування
              </label>

              {/* Packages */}
              <div className="npc-section-title">
                {packages.length === 1 && 'одна посилка'}
                {packages.length === 2 && 'дві посилки'}
                {packages.length === 3 && 'три посилки'}
                {packages.length === 4 && 'чотири посилки'}
                {packages.length >= 5 && `${packages.length} посилок`}
              </div>
              <div className="npc-packages">
                {packages.map((pkg, pkgIdx) => {
                  const pkgItems = pkg.itemIds
                    .map((id) => parsedItems.find((it) => it.uid === id))
                    .filter(Boolean);
                  const rec = getPackageRecommendation(pkg);
                  const weight = getPackageWeight(pkg);

                  const isEditing = editingPkg === pkg.id;
                  const ov = pkgOverrides[pkg.id];
                  const isSplitting = splitMode?.pkgId === pkg.id;

                  return (
                    <div className="npc-package" key={pkg.id}>
                      <div className="npc-package-header">
                        <span className="npc-package-title">
                          Посилка №{pkgIdx + 1}
                        </span>
                        <span className="npc-package-info">
                          {ov ? ov.weight : weight} кг
                          {` \u00A0·\u00A0 ${pkgItems.reduce((sum, it) => sum + (it.count || 1), 0)} шт`}
                          {ov?.envelope && ov.envelope !== "box"
                            ? `   ·  конверт ${ov.envelope}`
                            : ov?.envelope === "box"
                            ? "   ·  коробка"
                            : rec?.recommended
                            ? `   ·  конверт ${rec.recommended.name}`
                            : rec
                            ? "   ·  коробка"
                            : ""}
                        </span>
                        {packages.length > 1 && (
                          <button
                            className="npc-package-remove"
                            onClick={() => removePackage(pkg.id)}
                            title="Видалити посилку"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Items in this package */}
                      <div className="npc-package-items">
                        {pkgItems.length === 0 && (
                          <div className="npc-package-empty">
                            Перемістіть позиції сюди
                          </div>
                        )}
                        {pkgItems.map((item) => {
                          const isSelected = isSplitting && splitMode.selectedItems.has(item.uid);
                          const splitCount = isSelected ? splitMode.selectedItems.get(item.uid) : null;
                          const isPartial = isSelected && splitCount < item.count;
                          return (
                          <React.Fragment key={item.uid}>
                          <div
                            className={`npc-pos-row npc-pkg-item${
                              isSplitting ? " npc-split-selectable" : ""
                            }${isSelected ? " npc-split-selected" : ""}`}
                            title={
                              isSplitting
                                ? "Виберіть для перенесення"
                                : "Клікніть, щоб перемістити в іншу посилку"
                            }
                            onClick={() => {
                              if (isSplitting) {
                                toggleSplitItem(item.uid);
                                return;
                              }
                              if (packages.length < 2) return;
                              const otherPkg = packages.find(
                                (p) => p.id !== pkg.id
                              );
                              if (otherPkg) {
                                moveItem(item.uid, pkg.id, otherPkg.id);
                              }
                            }}
                          >
                            <span className="npc-pos-name">{item.name}</span>
                            <span className="npc-pos-size">
                              {Math.round(item.sizeX)}×{Math.round(item.sizeY)}
                            </span>
                            <span className="npc-pos-count">{item.count}</span>
                            <span className="npc-pos-weight">
                              {(Math.round(getWeight(item) * 100) / 100).toFixed(2)}
                            </span>
                            <span className="npc-pos-move">
                              {isSplitting
                                ? isSelected
                                  ? "✓"
                                  : "○"
                                : "↔"}
                            </span>
                          </div>
                          {isSelected && item.count > 1 && (
                            <div className="npc-split-qty-row" onClick={(e) => e.stopPropagation()}>
                              <span className="npc-split-qty-label">Перенести:</span>
                              <input
                                className="npc-split-qty-input"
                                type="number"
                                min="1"
                                max={item.count}
                                value={splitCount}
                                onChange={(e) => setSplitCount(item.uid, e.target.value)}
                              />
                              <span className="npc-split-qty-total">з {item.count} шт</span>
                              {isPartial && (
                                <span className="npc-split-qty-remain">
                                  (залишиться {item.count - splitCount})
                                </span>
                              )}
                            </div>
                          )}
                          </React.Fragment>
                          );
                        })}
                      </div>

                      {/* Split mode hint */}
                      {isSplitting && (
                        <div className="npc-split-hint">
                          Виберіть позиції для нової посилки. Можна змінити кількість.
                        </div>
                      )}

                      {/* Envelope recommendation — hide when waybills exist */}
                      {rec && !isEditing && waybills.length === 0 && (() => {
                        const activeEnvName = ov?.envelope || rec.recommended?.name;
                        return (
                        <div className="npc-envelope-row">
                          <div className="npc-envelopes">
                            {rec.allEnvelopes.map((env) => (
                              <div
                                className={`npc-envelope${
                                  env.fits ? " npc-envelope-fits" : ""
                                }${
                                  activeEnvName === env.name
                                    ? " npc-envelope-recommended"
                                    : ""
                                }`}
                                key={env.name}
                                onClick={() => setEnvelopeQuick(pkg.id, env.name)}
                                style={{ cursor: "pointer" }}
                              >
                                <span className="npc-envelope-name">{env.name}</span>
                                <span className="npc-envelope-size">{env.width}x{env.height}</span>
                                <span className="npc-envelope-sheet">{env.fitsSheet}</span>
                              </div>
                            ))}
                            <div
                              className={`npc-envelope npc-envelope-fits${ov?.envelope === "box" ? " npc-envelope-recommended" : ""}`}
                              onClick={() => setEnvelopeQuick(pkg.id, "box")}
                              style={{ cursor: "pointer" }}
                            >
                              <span className="npc-envelope-name">КОР</span>
                              <span className="npc-envelope-size">Коробка</span>
                              <span className="npc-envelope-sheet">Вантаж</span>
                            </div>
                          </div>
                          <div className="npc-envelope-info">
                            {rec.needsParcel && (
                              <div className="npc-needs-parcel">
                                Не влазить у конверт
                              </div>
                            )}
                            <div className="npc-summary">
                              <div className="npc-summary-item">
                                <span className="npc-summary-label">Вага</span>
                                <span className="npc-summary-value">
                                  {ov ? ov.weight : weight} кг
                                </span>
                              </div>
                              <div className="npc-summary-item">
                                <span className="npc-summary-label">Розмір</span>
                                <span className="npc-summary-value">
                                  {ov ? `${ov.width}×${ov.height}` : `${rec.dimensions.width}×${rec.dimensions.height}`} мм
                                </span>
                              </div>
                              <div className="npc-summary-item">
                                <span className="npc-summary-label">Товщина</span>
                                <span className="npc-summary-value">
                                  {ov ? ov.thickness : rec.dimensions.thickness} мм
                                </span>
                              </div>
                              <div className="npc-summary-item">
                                <span className="npc-summary-label">Тип</span>
                                <span className="npc-summary-value">
                                  {ov?.envelope && ov.envelope !== "box"
                                    ? "Документи"
                                    : ov?.envelope === "box" || rec.needsParcel
                                    ? "Вантаж"
                                    : "Документи"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        );
                      })()}

                      {/* Edit mode — hide when waybills exist */}
                      {isEditing && ov && waybills.length === 0 && (
                        <div className="npc-package-edit">
                          <div className="npc-edit-row">
                            <span className="npc-edit-label">Вага</span>
                            <input
                              className="npc-edit-input"
                              type="number"
                              step="0.01"
                              min="0"
                              value={ov.weight}
                              readOnly={ov.envelope === "box"}
                              style={ov.envelope === "box" ? { opacity: 0.6, cursor: "default" } : {}}
                              onChange={(e) =>
                                ov.envelope !== "box" && setOverride(pkg.id, "weight", e.target.value)
                              }
                            />
                            <span className="npc-edit-unit">
                              кг{ov.envelope === "box" && <span style={{ fontSize: "0.75em", opacity: 0.6, marginLeft: "0.3rem" }}>об'єм</span>}
                            </span>
                          </div>
                          <div className="npc-edit-row">
                            <span className="npc-edit-label">Ширина</span>
                            <input
                              className="npc-edit-input"
                              type="number"
                              step="1"
                              min="0"
                              value={ov.width}
                              onChange={(e) =>
                                setOverride(pkg.id, "width", e.target.value)
                              }
                            />
                            <span className="npc-edit-unit">мм</span>
                          </div>
                          <div className="npc-edit-row">
                            <span className="npc-edit-label">Висота</span>
                            <input
                              className="npc-edit-input"
                              type="number"
                              step="1"
                              min="0"
                              value={ov.height}
                              onChange={(e) =>
                                setOverride(pkg.id, "height", e.target.value)
                              }
                            />
                            <span className="npc-edit-unit">мм</span>
                          </div>
                          <div className="npc-edit-row">
                            <span className="npc-edit-label">Товщина</span>
                            <input
                              className="npc-edit-input"
                              type="number"
                              step="0.1"
                              min="0"
                              value={ov.thickness}
                              onChange={(e) =>
                                setOverride(pkg.id, "thickness", e.target.value)
                              }
                            />
                            <span className="npc-edit-unit">мм</span>
                          </div>
                          <div className="npc-edit-row">
                            <span className="npc-edit-label">Конверт</span>
                            <div className="npc-envelope-select">
                              {ENVELOPES.map((env) => (
                                <button
                                  key={env.name}
                                  className={`npc-envelope-option${
                                    ov.envelope === env.name
                                      ? " npc-envelope-option-active"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    setOverride(
                                      pkg.id,
                                      "envelope",
                                      ov.envelope === env.name ? null : env.name
                                    )
                                  }
                                >
                                  {env.name}
                                </button>
                              ))}
                              <button
                                className={`npc-envelope-option${
                                  ov.envelope === "box"
                                    ? " npc-envelope-option-active"
                                    : ""
                                }`}
                                onClick={() =>
                                  setOverride(pkg.id, "envelope", ov.envelope === "box" ? null : "box")
                                }
                              >
                                Коробка
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      {pkgItems.length > 0 && (
                        <div className="npc-actions">
                          {waybills.length > 0 ? (
                            waybills.map(w => (
                              <React.Fragment key={w.id}>
                                <button
                                  className="npc-btn npc-btn-primary"
                                  onClick={() => {
                                    axios.get(`/novaposhta/print/${w.ref}`, { responseType: 'blob' })
                                      .then(res => {
                                        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `TTN_${w.intDocNumber}.pdf`;
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                      })
                                      .catch(err => alert('Помилка: ' + err.message));
                                  }}
                                >
                                  <span>{w.intDocNumber}</span>
                                </button>
                                <button
                                  className="npc-btn npc-btn-sticker"
                                  onClick={() => {
                                    axios.get(`/novaposhta/print-sticker/${w.ref}`, { responseType: 'blob' })
                                      .then(res => {
                                        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `Sticker_${w.intDocNumber}.pdf`;
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                      })
                                      .catch(err => alert('Помилка: ' + err.message));
                                  }}
                                >
                                  <span>НАЛІПКА</span>
                                </button>
                                {w.ref && (
                                  <NovaPoshtaThermalButton
                                    waybillRef={w.ref}
                                    intDocNumber={w.intDocNumber}
                                  />
                                )}
                              </React.Fragment>
                            ))
                          ) : (
                            <button
                              className={`npc-btn ${isEditing ? "npc-btn-secondary" : "npc-btn-outline"}`}
                              onClick={() => toggleEdit(pkg.id)}
                            >
                              <span>{isEditing ? "Готово" : "Редагувати"}</span>
                            </button>
                          )}
                          {pkgItems.length > 1 && !isSplitting && (
                            <button
                              className="npc-btn npc-btn-outline"
                              onClick={() => startSplit(pkg.id)}
                            >
                              <span>Розділити</span>
                            </button>
                          )}
                          {isSplitting && (
                            <>
                              <button
                                className="npc-btn npc-btn-primary"
                                onClick={confirmSplit}
                                disabled={splitMode.selectedItems.size === 0}
                              >
                                <span>Підтвердити ({splitMode.selectedItems.size})</span>
                              </button>
                              <button
                                className="npc-btn npc-btn-danger"
                                onClick={() => setSplitMode(null)}
                              >
                                <span>Скасувати</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Create TTN + Add package buttons */}
              <div className="npc-actions">
                {waybills.length === 0 && (
                  <button
                    className="npc-btn npc-btn-primary"
                    onClick={() => openTTN(packages[0])}
                  >
                    <span>Створити ТТН</span>
                  </button>
                )}
                <button
                  className="npc-btn npc-btn-outline"
                  onClick={addPackage}
                >
                  <span>+ Додати ще одну посилку</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
