import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import axios from "../../../api/axiosInstance";
import {
  DEFAULT_EXTRA_SETTINGS,
  EXTRA_SHEETS_KEY,
  EXTRA_UNIT_DEFAULTS,
  EXTRA_UNIT_TYPE_LABELS,
  normalizeExtraSettings,
} from "./zapasRules";
import "./ServiceSettingsModal.css";

const PRESET_COLORS = [
  { name: "green", value: "#0e935b" },
  { name: "orange", value: "#f5a623" },
  { name: "blue", value: "#3c60a6" },
  { name: "red", value: "#ee3c23" },
  { name: "rose", value: "#ef7aaa" },
  { name: "purple", value: "#6a5acd" },
  { name: "cyan", value: "#00A8C6" },
  { name: "coral", value: "#ff7f50" },
];

const THICKNESS_OPTIONS = ["Тонкий", "Середній", "Цупкий", "Самоклеючі"];
const VISHICHKA_OPTIONS = [
  { label: "Висічка", value: "sheet_cut" },
  { label: "Стікерпак", value: "stickerpack" },
  { label: "Порізка", value: "single_items" },
];

const LAMINATION_OPTIONS = [
  { label: "глянцеве", value: "з глянцевим ламінуванням" },
  { label: "матове", value: "з матовим ламінуванням" },
  { label: "SoftTouch", value: "з ламінуванням SoftTouch" },
  { label: "холодне", value: "з холодним матовим ламінуванням" },
];

const Toggle = ({ value, onChange, label }) => (
  <div className="ssm-preset-toggle">
    <div
      className={`ssm-toggle-track${value ? " ssm-toggle-on" : ""}`}
      onClick={() => onChange(!value)}
    >
      <div className="ssm-toggle-thumb" />
    </div>
    <span className="ssm-toggle-label">{value ? "ON" : "OFF"}{label ? ` — ${label}` : ""}</span>
  </div>
);

/**
 * Висувна секція пресету. Полів у пресеті десятки, і суцільним стовпцем вони
 * ховають одне одного — тому кожна група згорнута, а в заголовку видно
 * коротке резюме, щоб не розкривати заради перевірки.
 */
const PresetGroup = ({ title, summary, open, onToggle, children }) => (
  <div className={`ssm-group${open ? " ssm-group-open" : ""}`}>
    <button type="button" className="ssm-group-head" onClick={onToggle}>
      <span className="ssm-group-arrow">{open ? "▾" : "▸"}</span>
      <span className="ssm-group-title">{title}</span>
      {summary ? <span className="ssm-group-summary">{summary}</span> : null}
    </button>
    {open && <div className="ssm-group-body">{children}</div>}
  </div>
);

/**
 * Таблиця правил запасу: від якого до якого обсягу скільки давати понад тираж.
 * Одиниця залежить від того, для чого правила — аркуші друку чи готові вироби.
 */
const ZapasRanges = ({ title, hint, unit, ranges, onChange, onEdit, onCommit }) => {
  const [draft, setDraft] = useState({ from: "", to: "", sheets: "" });
  const list = ranges || [];

  const patchRange = (i, field, value) => {
    const arr = [...list];
    arr[i] = { ...arr[i], [field]: value };
    onEdit(arr);
  };

  const numInput = (value, onValue, placeholder) => (
    <input
      className="ssm-preset-size-input ssm-range-input"
      type="number"
      placeholder={placeholder}
      value={value ?? ""}
      onChange={(e) => onValue(e.target.value)}
      onBlur={onCommit}
    />
  );

  return (
    <div className="ssm-ranges">
      <div className="ssm-ranges-title">{title}</div>
      {hint && <div className="ssm-ranges-empty">{hint}</div>}

      {list.length === 0 && (
        <div className="ssm-ranges-empty">
          Правил немає — запас доведеться вбивати вручну
        </div>
      )}

      {list.map((r, i) => (
        <div key={i} className="ssm-range-row">
          <span className="ssm-range-word">від</span>
          {numInput(r.from, (v) => patchRange(i, "from", v))}
          <span className="ssm-range-word">до</span>
          {numInput(r.to, (v) => patchRange(i, "to", v), "∞")}
          <span className="ssm-range-word">{unit} →</span>
          {numInput(r.sheets, (v) => patchRange(i, "sheets", v))}
          <span className="ssm-range-word">{unit} запасу</span>
          <button
            className="ssm-delete-btn"
            onClick={() => onChange(list.filter((_, idx) => idx !== i))}
            title="Видалити правило"
          >
            &times;
          </button>
        </div>
      ))}

      <div className="ssm-range-row ssm-range-add">
        <span className="ssm-range-word">від</span>
        <input className="ssm-preset-size-input ssm-range-input" type="number"
               value={draft.from} onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}/>
        <span className="ssm-range-word">до</span>
        <input className="ssm-preset-size-input ssm-range-input" type="number" placeholder="∞"
               value={draft.to} onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}/>
        <span className="ssm-range-word">{unit} →</span>
        <input className="ssm-preset-size-input ssm-range-input" type="number"
               value={draft.sheets} onChange={(e) => setDraft((d) => ({ ...d, sheets: e.target.value }))}/>
        <span className="ssm-range-word">{unit} запасу</span>
        <button
          className="ssm-add-btn"
          onClick={() => {
            if (draft.from === "" || draft.sheets === "") {
              alert("Вкажіть початок діапазону і кількість");
              return;
            }
            onChange([...list, { ...draft }].sort((a, b) => (Number(a.from) || 0) - (Number(b.from) || 0)));
            setDraft({ from: "", to: "", sheets: "" });
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};

/**
 * В яких одиницях запасає кожен тип роботи. Дефолти прописані в коді, тут
 * лише те, що користувач вирішив зробити інакше.
 */
const ExtraUnitsByType = ({ unitByType, onChange }) => {
  const [open, setOpen] = useState(false);
  const current = (type) => unitByType?.[type] || EXTRA_UNIT_DEFAULTS[type] || "sheets";

  return (
    <div className="ssm-units">
      <button type="button" className="ssm-units-toggle" onClick={() => setOpen((v) => !v)}>
        {open ? "▾" : "▸"} Одиниці запасу за типами робіт
      </button>
      {open && (
        <div className="ssm-units-list">
          {EXTRA_UNIT_TYPE_LABELS.map(([type, label]) => {
            const mode = current(type);
            return (
              <div key={type} className="ssm-units-row">
                <span className="ssm-units-name">{label}</span>
                <div className="ssm-preset-btns">
                  {[["sheets", "аркуші"], ["items", "вироби"]].map(([value, text]) => (
                    <button
                      key={value}
                      className={`ssm-preset-opt-btn${mode === value ? " ssm-opt-active" : ""}`}
                      onClick={() => onChange({ ...(unitByType || {}), [type]: value })}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ServiceSettingsModal = ({
  show,
  onClose,
  services,
  onAddService,
  onRemoveService,
  onUpdateService,
  onReorderServices,
  defaultSizes,
  extraToggles,
  thicknessOptions,
  hideSidesOption,
  hideLaminationOption,
  materialType,
  materialCategories,
  customPresetSections,
  hideMaterialOption,
  // додатковий клас на overlay/модалку — дозволяє конкретній послузі
  // мати власне оформлення налаштувань, не чіпаючи решту
  variant,
  // режим для калькуляторів без списку товарів (магніти, ламінація, чашки…):
  // показуємо лише спільні налаштування браку й запасу
  extraOnly,
}) => {
  const [newName, setNewName] = useState("");
  const [newSizeLabel, setNewSizeLabel] = useState("");
  const [newSizeX, setNewSizeX] = useState("");
  const [newSizeY, setNewSizeY] = useState("");
  const [dragIdx, setDragIdx] = useState(null);
  const [serviceDragIdx, setServiceDragIdx] = useState(null);
  const [localServices, setLocalServices] = useState(null);
  const [colorPickerForId, setColorPickerForId] = useState(null);
  const [customHex, setCustomHex] = useState("");
  const [orderNameForId, setOrderNameForId] = useState(null);
  const [orderNameDraft, setOrderNameDraft] = useState("");
  const [presetForId, setPresetForId] = useState(null);
  const [presetDraft, setPresetDraft] = useState({});
  // які групи пресету розгорнуті; за замовчуванням усі згорнуті
  const [openGroups, setOpenGroups] = useState({});
  // Брак і запас — спільні для всіх товарів усіх калькуляторів, тому
  // окрема настройка (AppSetting), а не частина пресету конкретного товару
  const [extraSettings, setExtraSettings] = useState(DEFAULT_EXTRA_SETTINGS);
  const [extraOpen, setExtraOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false);
  // Для кастомних material selects (Note/Booklet)
  const [customMaterials, setCustomMaterials] = useState({});
  const [customMatLoading, setCustomMatLoading] = useState({});
  const [customMatOpen, setCustomMatOpen] = useState(null);
  // Цупкість ламінації (мкм) — список з API
  const [laminationThicknesses, setLaminationThicknesses] = useState([]);
  const [laminationThickLoading, setLaminationThickLoading] = useState(false);

  // Завантажити матеріали коли змінюється товщина в пресеті
  const loadMaterials = useCallback((thickness) => {
    if (!thickness) { setMaterials([]); return; }
    const isCustomType = !["Тонкий", "Середній", "Цупкий", "Самоклеючі", "Офісний"].includes(thickness);
    const isSelf = thickness === "Самоклеючі";
    setMaterialsLoading(true);
    const matType = isCustomType ? thickness : isSelf ? "Плівка" : "Папір";
    axios.post("/materials/NotAll", {
      name: "MaterialsPrices",
      inPageCount: 999999,
      currentPage: 1,
      search: "",
      columnName: { column: "id", reverse: false },
      size: { x: 210, y: 297 },
      material: {
        type: matType,
        thickness: isCustomType ? "" : thickness,
        typeUse: isCustomType ? "А3" : thickness,
        material: "",
        materialId: "",
      },
    }).then((res) => {
      setMaterials(res?.data?.rows || []);
    }).catch(() => {
      setMaterials([]);
    }).finally(() => {
      setMaterialsLoading(false);
    });
  }, []);

  const loadCustomMaterials = useCallback((key, thickness) => {
    if (!thickness) { setCustomMaterials((prev) => ({ ...prev, [key]: [] })); return; }
    const isSelf = thickness === "Самоклеючі";
    setCustomMatLoading((prev) => ({ ...prev, [key]: true }));
    axios.post("/materials/NotAll", {
      name: "MaterialsPrices", inPageCount: 999999, currentPage: 1, search: "",
      columnName: { column: "id", reverse: false },
      size: { x: 310, y: 440 },
      material: { type: isSelf ? "Плівка" : "Папір", thickness, typeUse: thickness, material: "", materialId: "" },
    }).then((res) => {
      setCustomMaterials((prev) => ({ ...prev, [key]: res?.data?.rows || [] }));
    }).catch(() => {
      setCustomMaterials((prev) => ({ ...prev, [key]: [] }));
    }).finally(() => {
      setCustomMatLoading((prev) => ({ ...prev, [key]: false }));
    });
  }, []);

  // Завантажити доступні цупкості ламінації при зміні типу
  const loadLaminationThicknesses = useCallback((laminationType) => {
    if (!laminationType) { setLaminationThicknesses([]); return; }
    setLaminationThickLoading(true);
    // Спробувати обидва варіанти регістру (uppercase / lowercase)
    const variants = [
      laminationType,
      laminationType.charAt(0).toUpperCase() + laminationType.slice(1),
      laminationType.charAt(0).toLowerCase() + laminationType.slice(1),
    ];
    const tryFetch = (idx) => {
      if (idx >= variants.length) {
        setLaminationThicknesses([]);
        setLaminationThickLoading(false);
        return;
      }
      axios.post("/materials/NotAll", {
        name: "MaterialsPrices", inPageCount: 999999, currentPage: 1, search: "",
        columnName: { column: "id", reverse: false },
        size: { x: 310, y: 440 },
        material: {
          type: "Ламінування",
          material: variants[idx],
          materialId: "",
          thickness: "",
          typeUse: "А3",
        },
      }).then((res) => {
        const rows = res?.data?.rows || [];
        if (rows.length === 0) {
          tryFetch(idx + 1);
          return;
        }
        // Унікальні значення товщин
        const uniq = Array.from(new Set(rows.map((r) => String(r.thickness)).filter(Boolean)))
          .sort((a, b) => Number(a) - Number(b));
        setLaminationThicknesses(uniq);
        setLaminationThickLoading(false);
      }).catch(() => {
        setLaminationThicknesses([]);
        setLaminationThickLoading(false);
      });
    };
    tryFetch(0);
  }, []);

  // Перезавантажити цупкості коли змінюється тип ламінації
  useEffect(() => {
    if (!presetForId || !presetDraft.lamination || !presetDraft.laminationType) {
      setLaminationThicknesses([]);
      return;
    }
    loadLaminationThicknesses(presetDraft.laminationType);
  }, [presetForId, presetDraft.lamination, presetDraft.laminationType, loadLaminationThicknesses]);

  // Спільні налаштування браку й запасу — вантажимо при відкритті модалки
  useEffect(() => {
    if (!show) return;
    let cancelled = false;
    axios.get(`/api/app-settings/${EXTRA_SHEETS_KEY}`)
      .then(({ data }) => { if (!cancelled) setExtraSettings(normalizeExtraSettings(data?.value)); })
      .catch(() => { /* ще не збережене — лишаються дефолти */ });
    return () => { cancelled = true; };
  }, [show]);

  // Завантажити матеріали коли відкривається пресет
  useEffect(() => {
    if (!presetForId) return;
    if (presetDraft.thickness) {
      loadMaterials(presetDraft.thickness);
    } else if (thicknessOptions && thicknessOptions.length === 0) {
      // Без товщини — завантажити матеріали для конкретного типу
      const matType = (materialCategories && presetDraft.materialCategory) || materialType || "Фотопапір";
      loadMaterials(matType);
    }
  }, [presetForId, presetDraft.thickness, presetDraft.materialCategory, loadMaterials, thicknessOptions]);

  if (!show) return null;

  const openPreset = (service) => {
    if (presetForId === service.id) {
      setPresetForId(null);
      return;
    }
    setPresetForId(service.id);
    const p = service.presets || {};
    // Побудувати draft з extraToggles та customPresetSections
    const toggleDefaults = {};
    if (extraToggles) {
      extraToggles.forEach((t) => {
        toggleDefaults[t.key] = p[t.key] ?? false;
        if (t.defaultKey) toggleDefaults[t.defaultKey] = p[t.defaultKey] ?? false;
        if (t.params) {
          t.params.forEach((param) => {
            toggleDefaults[param.key] = p[param.key] ?? (param.type === "corners" ? null : "");
          });
        }
      });
    }
    if (customPresetSections) {
      customPresetSections.forEach((s) => { toggleDefaults[s.key] = p[s.key] ?? (s.type === "number" ? "" : ""); });
    }
    setPresetDraft({
      sizeX: p.sizeX ?? "",
      sizeY: p.sizeY ?? "",
      sides: p.sides ?? "",
      thickness: p.thickness ?? "",
      materialCategory: p.materialCategory ?? "",
      materialName: p.materialName ?? "",
      vishichkaType: p.vishichkaType ?? "",
      plivka: p.plivka ?? false,
      plivkaName: p.plivkaName ?? "",
      lamination: p.lamination ?? false,
      laminationDefault: p.laminationDefault ?? true,
      ...toggleDefaults,
      laminationType: p.laminationType ?? "",
      laminationThickness: p.laminationThickness ?? "",
      sizes: Array.isArray(p.sizes) ? [...p.sizes] : (defaultSizes ? [...defaultSizes] : []),
    });
    setOpenGroups({});
    setNewRange({ from: "", to: "", sheets: "" });
  };

  const handleSavePreset = async (service) => {
    const presets = { ...presetDraft };
    // Видаляємо порожні поля щоб не засмічувати
    if (!presets.sizeX && !presets.sizeY) { delete presets.sizeX; delete presets.sizeY; }
    if (!presets.sides) delete presets.sides;
    if (!presets.thickness) delete presets.thickness;
    if (!presets.materialCategory) delete presets.materialCategory;
    if (!presets.materialName) delete presets.materialName;
    if (!presets.vishichkaType) delete presets.vishichkaType;
    if (!presets.plivkaName) delete presets.plivkaName;
    if (!presets.laminationType) delete presets.laminationType;
    if (!presets.laminationThickness) delete presets.laminationThickness;
    // sizes: зберігаємо якщо відрізняються від дефолтних
    if (Array.isArray(presets.sizes) && defaultSizes &&
        JSON.stringify(presets.sizes) === JSON.stringify(defaultSizes)) {
      delete presets.sizes;
    }

    await onUpdateService(service.id, { presets: Object.keys(presets).length > 0 ? presets : null });
    setPresetForId(null);
  };

  const handleClearPreset = async (service) => {
    await onUpdateService(service.id, { presets: null });
    setPresetForId(null);
  };

  const handleSetColor = async (service, color) => {
    await onUpdateService(service.id, { color });
    setColorPickerForId(null);
  };

  const handleSaveOrderName = async (service) => {
    await onUpdateService(service.id, { orderName: orderNameDraft.trim() || null });
    setOrderNameForId(null);
  };

  const handleClearOrderName = async (service) => {
    await onUpdateService(service.id, { orderName: null });
    setOrderNameDraft("");
    setOrderNameForId(null);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await onAddService(newName.trim());
    setNewName("");
  };

  const handleDelete = async (service) => {
    if (services.length <= 1) {
      alert("Повинен бути хоча б один товар");
      return;
    }
    if (!window.confirm(`Видалити "${service.name}"?`)) return;
    await onRemoveService(service);
  };

  const displayedServices = localServices || services || [];
  const activePresetService = displayedServices.find((s) => s.id === presetForId);

  const toggleGroup = (key) => setOpenGroups((g) => ({ ...g, [key]: !g[key] }));

  // Брак і запас зберігаються одразу: правила легко набити й піти,
  // не натиснувши жодної кнопки «зберегти».
  const persistExtra = (patch) => {
    const next = { ...extraSettings, ...patch };
    setExtraSettings(next);
    axios.put(`/api/app-settings/${EXTRA_SHEETS_KEY}`, { value: next })
      .catch((e) => console.error("[extra_sheets] не збереглось:", e?.message));
  };

  const extraTitle = [
    extraSettings.brakEnabled ? "" : "брак вимкнено",
    extraSettings.zapasEnabled ? "" : "запас вимкнено",
    extraSettings.zapasRanges?.length ? `${extraSettings.zapasRanges.length} прав.` : "без правил",
  ].filter(Boolean).join(" · ");

  // Які групи взагалі мають вміст для цієї послуги
  const hasThicknessOpt = !thicknessOptions || thicknessOptions.length > 0;
  const hasPrintGroup = !hideSidesOption || hasThicknessOpt || !hideMaterialOption;
  const hasFinishGroup = !extraToggles
    || (extraToggles && extraToggles.length > 0)
    || (customPresetSections && customPresetSections.length > 0);

  // Короткі резюме в заголовках згорнутих груп
  const sizeSummary = presetDraft.sizeX && presetDraft.sizeY
    ? `${presetDraft.sizeX}×${presetDraft.sizeY} мм`
    : "";
  const printSummary = [
    presetDraft.sides,
    presetDraft.thickness,
    presetDraft.materialName,
  ].filter(Boolean).join(" · ");
  const finishSummary = (() => {
    const on = [];
    if (extraToggles) extraToggles.forEach((t) => { if (presetDraft[t.key]) on.push(t.label); });
    if (presetDraft.vishichkaType) {
      on.push(VISHICHKA_OPTIONS.find((v) => v.value === presetDraft.vishichkaType)?.label || presetDraft.vishichkaType);
    }
    if (presetDraft.plivka) on.push("монт. плівка");
    return on.join(" · ");
  })();
  const laminationSummary = presetDraft.lamination
    ? [LAMINATION_OPTIONS.find((l) => l.value === presetDraft.laminationType)?.label,
       presetDraft.laminationThickness ? `${presetDraft.laminationThickness} мкм` : ""].filter(Boolean).join(" · ") || "увімкнено"
    : "";

  return ReactDOM.createPortal(
    <div className={`ssm-overlay${variant ? ` ${variant}` : ""}`} onClick={onClose}>
      <div className="ssm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ssm-header">
          <span className="ssm-header-title">
            {extraOnly ? "Брак і запас" : "Налаштування товарів"}
          </span>
          <button className="ssm-close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Service list */}
        {!extraOnly && <div className="ssm-service-list">
          {displayedServices.map((service, i) => (
            <div
              key={service.id}
              className={`ssm-service-row${serviceDragIdx === i ? " ssm-service-dragging" : ""}`}
              draggable={!!onReorderServices}
              onDragStart={() => setServiceDragIdx(i)}
              onDragOver={(e) => {
                if (serviceDragIdx === null || serviceDragIdx === i) return;
                e.preventDefault();
                setLocalServices((prev) => {
                  const arr = [...(prev || services)];
                  const [moved] = arr.splice(serviceDragIdx, 1);
                  arr.splice(i, 0, moved);
                  return arr;
                });
                setServiceDragIdx(i);
              }}
              onDragEnd={() => {
                if (localServices && onReorderServices) {
                  onReorderServices(localServices.map((s) => s.id));
                }
                setServiceDragIdx(null);
                setLocalServices(null);
              }}
              style={{
                ...(onReorderServices ? { cursor: "grab" } : null),
                ...(service.color ? { "--svc-color": service.color } : null),
              }}
            >
              <span className="ssm-service-name">{service.name}</span>

              {/* Товар за замовчуванням — відкривається першим при вході в калькулятор */}
              <button
                className={`ssm-default-btn${service.isDefault ? " ssm-default-set" : ""}`}
                onClick={() => onUpdateService(service.id, { isDefault: !service.isDefault })}
                title="Відкривати цей товар за замовчуванням"
              >
                {service.isDefault ? "★" : "☆"}
              </button>

              {/* Color swatch */}
              <div
                className="ssm-color-swatch"
                style={{ background: service.color || "transparent" }}
                onClick={() => {
                  setColorPickerForId(colorPickerForId === service.id ? null : service.id);
                  setCustomHex(service.color || "");
                  setOrderNameForId(null);
                }}
                title="Колір кнопки"
              />

              {/* Order name button */}
              <button
                className={`ssm-orderName-btn${service.orderName ? " ssm-orderName-set" : ""}`}
                onClick={() => {
                  setOrderNameForId(orderNameForId === service.id ? null : service.id);
                  setOrderNameDraft(service.orderName || "");
                  setColorPickerForId(null);
                }}
                title="Назва замовлення за замовчуванням"
              >
                Aa
              </button>

              {/* Preset button */}
              <button
                className={`ssm-preset-btn${presetForId === service.id ? " ssm-preset-active" : ""}`}
                onClick={() => openPreset(service)}
                title="Налаштування за замовчуванням"
              >
                {"\u2699"}
                {service.presets && <span className="ssm-preset-dot" title="\u041f\u0440\u0435\u0441\u0435\u0442 \u0437\u0430\u0441\u0442\u043e\u0441\u043e\u0432\u0443\u0454\u0442\u044c\u0441\u044f \u0437\u0430 \u0437\u0430\u043c\u043e\u0432\u0447\u0443\u0432\u0430\u043d\u043d\u044f\u043c" />}
              </button>

              {/* Delete */}
              <button
                className="ssm-delete-btn"
                onClick={() => handleDelete(service)}
                title="Видалити"
              >
                &times;
              </button>
            </div>
          ))}
        </div>}

        {/* Order name editor (shown below service list when active) */}
        {!extraOnly && orderNameForId && (() => {
          const svc = services.find((s) => s.id === orderNameForId);
          if (!svc) return null;
          return (
            <div className="ssm-orderName-picker">
              <span className="ssm-orderName-label">Назва замовлення за замовчуванням:</span>
              <input
                className="ssm-add-input"
                placeholder={svc.name.toLowerCase()}
                value={orderNameDraft}
                onChange={(e) => setOrderNameDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveOrderName(svc)}
                autoFocus
              />
              <button className="ssm-add-btn" onClick={() => handleSaveOrderName(svc)}>&#10003;</button>
              {svc.orderName && (
                <button className="ssm-delete-btn" onClick={() => handleClearOrderName(svc)} title="Скинути">
                  &times;
                </button>
              )}
            </div>
          );
        })()}

        {/* Color picker (shown below service list when active) */}
        {!extraOnly && colorPickerForId && (() => {
          const svc = services.find((s) => s.id === colorPickerForId);
          if (!svc) return null;
          return (
            <div className="ssm-color-picker">
              {/* No color */}
              <div
                className="ssm-color-no"
                onClick={() => handleSetColor(svc, null)}
                title="Без кольору"
              >
                &times;
              </div>
              {/* Preset colors */}
              {PRESET_COLORS.map((c) => (
                <div
                  key={c.name}
                  className={`ssm-color-option${svc.color === c.value ? " ssm-color-selected" : ""}`}
                  style={{ background: c.value }}
                  onClick={() => handleSetColor(svc, c.value)}
                  title={c.name}
                />
              ))}
              {/* Custom HEX */}
              <div className="ssm-color-custom">
                <input
                  type="color"
                  className="ssm-color-native"
                  value={customHex || "#666666"}
                  onChange={(e) => {
                    setCustomHex(e.target.value);
                    handleSetColor(svc, e.target.value);
                  }}
                  title="Вибрати колір"
                />
                <input
                  className="ssm-color-hex-input"
                  placeholder="#HEX"
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && /^#[0-9a-fA-F]{3,6}$/.test(customHex)) {
                      handleSetColor(svc, customHex);
                    }
                  }}
                />
              </div>
            </div>
          );
        })()}

        {/* Add new */}
        {!extraOnly && <div className="ssm-add-row">
          <input
            className="ssm-add-input"
            placeholder="Нова назва товару..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button className="ssm-add-btn" onClick={handleAdd}>+</button>
        </div>}

        {/* Брак і запас — спільні для всіх товарів, не для окремої назви */}
        <div className="ssm-global-section">
          <PresetGroup
            title={extraOnly ? "Брак і запас" : "Брак і запас — для всіх товарів"}
            summary={extraTitle}
            open={extraOnly || extraOpen}
            onToggle={() => setExtraOpen((v) => !v)}
          >
            <div className="ssm-preset-hint">
              Ці вироби не входять у вартість замовлення, але враховуються в собівартість:
              на 2 зайві блокноти піде і папір, і друк, і пружини.
              Налаштування спільні для всіх товарів і всіх калькуляторів.
            </div>

            <div className="ssm-preset-field">
              <span className="ssm-preset-label">Брак:</span>
              <Toggle
                value={extraSettings.brakEnabled}
                onChange={(v) => persistExtra({ brakEnabled: v })}
                label="показувати в замовленні"
              />
            </div>

            <div className="ssm-preset-field">
              <span className="ssm-preset-label">Запас:</span>
              <Toggle
                value={extraSettings.zapasEnabled}
                onChange={(v) => persistExtra({ zapasEnabled: v })}
                label="показувати в замовленні"
              />
            </div>

            {extraSettings.zapasEnabled && (
              <>
                <ZapasRanges
                  title="Друк, постпрес, послуги — запас в АРКУШАХ"
                  hint="аркуші проходять весь ланцюжок: друк, ламінація, різка"
                  unit="арк"
                  ranges={extraSettings.zapasRanges}
                  onChange={(next) => persistExtra({ zapasRanges: next })}
                  onEdit={(next) => setExtraSettings((s) => ({ ...s, zapasRanges: next }))}
                  onCommit={() => persistExtra({})}
                />
                <ZapasRanges
                  title="Товари — запас у ВИРОБАХ"
                  hint="на зайвий виріб іде й поштучне: пружини, чашки, магніти"
                  unit="шт"
                  ranges={extraSettings.zapasRangesItems}
                  onChange={(next) => persistExtra({ zapasRangesItems: next })}
                  onEdit={(next) => setExtraSettings((s) => ({ ...s, zapasRangesItems: next }))}
                  onCommit={() => persistExtra({})}
                />
              </>
            )}

            <ExtraUnitsByType
              unitByType={extraSettings.unitByType}
              onChange={(next) => persistExtra({ unitByType: next })}
            />
          </PresetGroup>
        </div>

        {/* Preset config panel */}
        {!extraOnly && activePresetService && (
          <div className="ssm-preset-panel">
            <div className="ssm-preset-title">
              Пресет для "{activePresetService.name}"
            </div>

            {/* Size */}
            <PresetGroup
              title="Розмір"
              summary={sizeSummary}
              open={!!openGroups.size}
              onToggle={() => toggleGroup("size")}
            >
            <div className="ssm-preset-field">
              <span className="ssm-preset-label">Розмір:</span>
              <div className="ssm-preset-size-inputs">
                <input
                  className="ssm-preset-size-input"
                  type="number"
                  placeholder="X"
                  value={presetDraft.sizeX}
                  onChange={(e) => setPresetDraft((d) => ({ ...d, sizeX: e.target.value }))}
                />
                <span className="ssm-preset-size-x">&times;</span>
                <input
                  className="ssm-preset-size-input"
                  type="number"
                  placeholder="Y"
                  value={presetDraft.sizeY}
                  onChange={(e) => setPresetDraft((d) => ({ ...d, sizeY: e.target.value }))}
                />
                <span className="ssm-preset-size-x">мм</span>
              </div>
            </div>

            {/* Size buttons editor */}
            {presetDraft.sizes && (
              <div className="ssm-sizes-inline">
                <div className="ssm-sizes-list">
                  {presetDraft.sizes.map((s, i) => {
                    const isSelected = String(presetDraft.sizeX) === String(s.x) && String(presetDraft.sizeY) === String(s.y);
                    return (
                      <div
                        key={`${s.label}-${i}`}
                        className={`ssm-size-item${isSelected ? " ssm-size-selected" : ""}${dragIdx === i ? " ssm-size-dragging" : ""}`}
                        draggable
                        onDragStart={() => setDragIdx(i)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (dragIdx === null || dragIdx === i) return;
                          setPresetDraft((d) => {
                            const arr = [...d.sizes];
                            const [moved] = arr.splice(dragIdx, 1);
                            arr.splice(i, 0, moved);
                            setDragIdx(i);
                            return { ...d, sizes: arr };
                          });
                        }}
                        onDragEnd={() => setDragIdx(null)}
                        onClick={() => setPresetDraft((d) => ({ ...d, sizeX: String(s.x), sizeY: String(s.y) }))}
                        style={{ cursor: "grab" }}
                      >
                        <span className="ssm-size-label">{s.label}</span>
                        <span className="ssm-size-dims">{s.x}×{s.y}</span>
                        <button
                          className="ssm-delete-btn"
                          style={{ fontSize: "0.8rem", padding: 0 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (presetDraft.sizes.length <= 1) { alert("Повинен бути хоча б один розмір"); return; }
                            setPresetDraft((d) => ({ ...d, sizes: d.sizes.filter((_, idx) => idx !== i) }));
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="ssm-size-add-row">
                  <input
                    className="ssm-add-input"
                    placeholder="Назва"
                    value={newSizeLabel}
                    onChange={(e) => setNewSizeLabel(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    className="ssm-preset-size-input"
                    type="number"
                    placeholder="X"
                    value={newSizeX}
                    onChange={(e) => setNewSizeX(e.target.value)}
                  />
                  <span className="ssm-preset-size-x">&times;</span>
                  <input
                    className="ssm-preset-size-input"
                    type="number"
                    placeholder="Y"
                    value={newSizeY}
                    onChange={(e) => setNewSizeY(e.target.value)}
                  />
                  <button
                    className="ssm-add-btn"
                    onClick={() => {
                      if (!newSizeLabel.trim() || !newSizeX || !newSizeY) {
                        alert("Введіть назву та розміри");
                        return;
                      }
                      setPresetDraft((d) => ({
                        ...d,
                        sizes: [...(d.sizes || []), { label: newSizeLabel.trim(), x: Number(newSizeX), y: Number(newSizeY) }],
                      }));
                      setNewSizeLabel(""); setNewSizeX(""); setNewSizeY("");
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            </PresetGroup>

            {/* Друк і матеріал */}
            {hasPrintGroup && (
            <PresetGroup
              title="Друк і матеріал"
              summary={printSummary}
              open={!!openGroups.print}
              onToggle={() => toggleGroup("print")}
            >
            {/* Sides */}
            {!hideSidesOption && <div className="ssm-preset-field">
              <span className="ssm-preset-label">Сторонність:</span>
              <div className="ssm-preset-btns">
                {[
                  { label: "Одност.", value: "односторонній" },
                  { label: "Двост.", value: "двосторонній" },
                  { label: "Без друку", value: "Не потрібно" },
                ].map((s) => (
                  <button
                    key={s.value}
                    className={`ssm-preset-opt-btn${presetDraft.sides === s.value ? " ssm-opt-active" : ""}`}
                    onClick={() => setPresetDraft((d) => ({ ...d, sides: d.sides === s.value ? "" : s.value }))}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>}

            {/* Thickness */}
            {(!thicknessOptions || thicknessOptions.length > 0) && <div className="ssm-preset-field">
              <span className="ssm-preset-label">Товщина:</span>
              <div className="ssm-preset-btns">
                {(thicknessOptions || THICKNESS_OPTIONS).map((t) => (
                  <button
                    key={t}
                    className={`ssm-preset-opt-btn${presetDraft.thickness === t ? " ssm-opt-active" : ""}`}
                    onClick={() => {
                      setPresetDraft((d) => {
                        const newThickness = d.thickness === t ? "" : t;
                        return { ...d, thickness: newThickness, materialName: "" };
                      });
                      setMaterialDropdownOpen(false);
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>}

            {/* Material category (e.g. Плівка/Баннер/Папір/ПВХ) — приховати для Note/Booklet */}
            {!hideMaterialOption && <React.Fragment>
            {materialCategories && materialCategories.length > 0 && (
              <div className="ssm-preset-field">
                <span className="ssm-preset-label">Тип мат.:</span>
                <div className="ssm-preset-btns">
                  {materialCategories.map((c) => (
                    <button
                      key={c.value}
                      className={`ssm-preset-opt-btn${presetDraft.materialCategory === c.value ? " ssm-opt-active" : ""}`}
                      onClick={() => {
                        setPresetDraft((d) => ({ ...d, materialCategory: d.materialCategory === c.value ? "" : c.value, materialName: "" }));
                        setMaterialDropdownOpen(false);
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Material name — dropdown */}
            <div className="ssm-preset-field">
              <span className="ssm-preset-label">Матеріал:</span>
              <div className="ssm-material-select-wrap">
                <div
                  className="ssm-material-select"
                  onClick={() => {
                    if ((!thicknessOptions || thicknessOptions.length > 0) && !presetDraft.thickness) { alert("Спочатку оберіть товщину"); return; }
                    setMaterialDropdownOpen((v) => !v);
                  }}
                >
                  <span className={presetDraft.materialName ? "ssm-material-value" : "ssm-material-placeholder"}>
                    {presetDraft.materialName || "Виберіть матеріал"}
                  </span>
                  <span className="ssm-material-arrow">{materialDropdownOpen ? "\u25B2" : "\u25BC"}</span>
                </div>
                {materialDropdownOpen && (
                  <div className="ssm-material-dropdown">
                    {materialsLoading ? (
                      <div className="ssm-material-item ssm-material-loading">Завантаження...</div>
                    ) : materials.length === 0 ? (
                      <div className="ssm-material-item ssm-material-loading">Немає матеріалів</div>
                    ) : (
                      materials.map((m) => (
                        <div
                          key={m.id}
                          className={`ssm-material-item${presetDraft.materialName === m.name ? " ssm-material-active" : ""}`}
                          onClick={() => {
                            setPresetDraft((d) => ({ ...d, materialName: m.name }));
                            setMaterialDropdownOpen(false);
                          }}
                        >
                          <span>{m.name}</span>
                          {m.thickness && (
                            <span className="ssm-material-gsm">{m.thickness} г/м²</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            </React.Fragment>}
            </PresetGroup>
            )}

            {/* Постобробка */}
            {hasFinishGroup && (
            <PresetGroup
              title="Постобробка"
              summary={finishSummary}
              open={!!openGroups.finish}
              onToggle={() => toggleGroup("finish")}
            >
            {/* Vishichka type — тільки для Vishichka */}
            {!extraToggles && (
              <>
                <div className="ssm-preset-field">
                  <span className="ssm-preset-label">Висічка:</span>
                  <div className="ssm-preset-btns">
                    {VISHICHKA_OPTIONS.map((v) => (
                      <button
                        key={v.value}
                        className={`ssm-preset-opt-btn${presetDraft.vishichkaType === v.value ? " ssm-opt-active" : ""}`}
                        onClick={() => setPresetDraft((d) => ({ ...d, vishichkaType: d.vishichkaType === v.value ? "" : v.value }))}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ssm-preset-field">
                  <span className="ssm-preset-label">Монт. плівка:</span>
                  <Toggle
                    value={presetDraft.plivka}
                    onChange={(v) => {
                      setPresetDraft((d) => ({ ...d, plivka: v, plivkaName: v ? d.plivkaName : "" }));
                      const merged = { ...(activePresetService?.presets || {}), ...presetDraft, plivka: v };
                      if (!v) merged.plivkaName = "";
                      onUpdateService(activePresetService.id, { presets: merged });
                    }}
                  />
                </div>
                {presetDraft.plivka && (
                  <div className="ssm-preset-field">
                    <span className="ssm-preset-label">Плівка:</span>
                    <input
                      className="ssm-preset-size-input"
                      style={{ width: "100%", textAlign: "left", flex: 1 }}
                      placeholder="Назва плівки (необов'язково)"
                      value={presetDraft.plivkaName}
                      onChange={(e) => setPresetDraft((d) => ({ ...d, plivkaName: e.target.value }))}
                    />
                  </div>
                )}
              </>
            )}

            {/* Extra toggles — для інших калькуляторів */}
            {extraToggles && extraToggles.map((t) => {
              const sectionOn = presetDraft[t.key] ?? false;
              const defaultOn = t.defaultKey ? (presetDraft[t.defaultKey] ?? false) : false;
              return (
                <React.Fragment key={t.key}>
                  <div className="ssm-preset-field">
                    <span className="ssm-preset-label">{t.label}:</span>
                    <Toggle
                      value={sectionOn}
                      onChange={(v) => {
                        setPresetDraft((d) => ({ ...d, [t.key]: v }));
                        const merged = { ...(activePresetService?.presets || {}), ...presetDraft, [t.key]: v };
                        onUpdateService(activePresetService.id, { presets: merged });
                      }}
                    />
                  </div>
                  {/* За замовч. — застосовувати з пресету */}
                  {sectionOn && t.defaultKey && (
                    <div className="ssm-preset-field">
                      <span className="ssm-preset-label">За замовч.:</span>
                      <Toggle
                        value={defaultOn}
                        onChange={(v) => {
                          setPresetDraft((d) => ({ ...d, [t.defaultKey]: v }));
                          const merged = { ...(activePresetService?.presets || {}), ...presetDraft, [t.defaultKey]: v };
                          onUpdateService(activePresetService.id, { presets: merged });
                        }}
                      />
                    </div>
                  )}
                  {/* Параметри — кнопки опцій або corners-grid */}
                  {sectionOn && defaultOn && t.params && t.params.map((p) => (
                    <div key={p.key} className="ssm-preset-field">
                      <span className="ssm-preset-label">{p.label}:</span>
                      {p.type === "corners" ? (
                        <div className="ssm-preset-btns">
                          {[
                            { k: "leftTop", l: "↖" },
                            { k: "rightTop", l: "↗" },
                            { k: "rightBottom", l: "↘" },
                            { k: "leftBottom", l: "↙" },
                          ].map((c) => {
                            const corners = presetDraft[p.key] || { leftTop: true, rightTop: true, rightBottom: true, leftBottom: true };
                            const isActive = corners[c.k];
                            return (
                              <button
                                key={c.k}
                                className={`ssm-preset-opt-btn${isActive ? " ssm-opt-active" : ""}`}
                                onClick={() => {
                                  const newCorners = { ...corners, [c.k]: !isActive };
                                  setPresetDraft((d) => ({ ...d, [p.key]: newCorners }));
                                  const merged = { ...(activePresetService?.presets || {}), ...presetDraft, [p.key]: newCorners };
                                  onUpdateService(activePresetService.id, { presets: merged });
                                }}
                              >
                                {c.l}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="ssm-preset-btns">
                          {p.options.map((opt) => {
                            const val = String(presetDraft[p.key] ?? "");
                            const isActive = val === String(opt);
                            return (
                              <button
                                key={opt}
                                className={`ssm-preset-opt-btn${isActive ? " ssm-opt-active" : ""}`}
                                onClick={() => {
                                  const newVal = isActive ? "" : String(opt);
                                  setPresetDraft((d) => ({ ...d, [p.key]: newVal }));
                                  const merged = { ...(activePresetService?.presets || {}), ...presetDraft, [p.key]: newVal };
                                  if (!newVal) delete merged[p.key];
                                  onUpdateService(activePresetService.id, { presets: merged });
                                }}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </React.Fragment>
              );
            })}

            {/* Custom preset sections — для Note/Booklet */}
            {customPresetSections && customPresetSections.map((section) => (
              <div key={section.key} className="ssm-preset-field">
                <span className="ssm-preset-label">{section.label}:</span>
                {section.type === "number" ? (
                  <input
                    className="ssm-preset-size-input"
                    type="number"
                    placeholder={section.placeholder || ""}
                    value={presetDraft[section.key] || ""}
                    onChange={(e) => setPresetDraft((d) => ({ ...d, [section.key]: e.target.value }))}
                    style={{ width: "5rem" }}
                  />
                ) : section.type === "text" ? (
                  <input
                    className="ssm-preset-size-input"
                    type="text"
                    placeholder={section.placeholder || ""}
                    value={presetDraft[section.key] || ""}
                    onChange={(e) => setPresetDraft((d) => ({ ...d, [section.key]: e.target.value }))}
                    style={{ width: "100%", textAlign: "left", flex: 1 }}
                  />
                ) : section.type === "materialSelect" ? (
                  <div className="ssm-material-select-wrap">
                    <div className="ssm-material-select"
                      onClick={() => {
                        const thVal = presetDraft[section.thicknessKey];
                        if (!thVal) { alert("Спочатку оберіть папір"); return; }
                        if (customMatOpen === section.key) { setCustomMatOpen(null); return; }
                        loadCustomMaterials(section.key, thVal);
                        setCustomMatOpen(section.key);
                      }}
                    >
                      <span className={presetDraft[section.key] ? "ssm-material-value" : "ssm-material-placeholder"}>
                        {presetDraft[section.key] || "Виберіть матеріал"}
                      </span>
                      <span className="ssm-material-arrow">{customMatOpen === section.key ? "\u25B2" : "\u25BC"}</span>
                    </div>
                    {customMatOpen === section.key && (
                      <div className="ssm-material-dropdown">
                        {customMatLoading[section.key] ? (
                          <div className="ssm-material-item ssm-material-loading">Завантаження...</div>
                        ) : (customMaterials[section.key] || []).length === 0 ? (
                          <div className="ssm-material-item ssm-material-loading">Немає матеріалів</div>
                        ) : (customMaterials[section.key] || []).map((m) => (
                          <div key={m.id}
                            className={`ssm-material-item${presetDraft[section.key] === m.name ? " ssm-material-active" : ""}`}
                            onClick={() => {
                              setPresetDraft((d) => {
                                const updated = { ...d, [section.key]: m.name, [section.key + "Id"]: m.id };
                                // Зберігаємо одразу
                                if (activePresetService) {
                                  const merged = { ...(activePresetService.presets || {}), ...updated };
                                  onUpdateService(activePresetService.id, { presets: merged });
                                }
                                return updated;
                              });
                              setCustomMatOpen(null);
                            }}
                          >
                            <span>{m.name}</span>
                            {m.thickness && <span className="ssm-material-gsm">{m.thickness} г/м²</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="ssm-preset-btns">
                    {section.options.map((opt) => {
                      const val = typeof opt === 'string' ? opt : opt.value;
                      const label = typeof opt === 'string' ? opt : opt.label;
                      return (
                        <button
                          key={val}
                          className={`ssm-preset-opt-btn${presetDraft[section.key] === val ? " ssm-opt-active" : ""}`}
                          onClick={() => setPresetDraft((d) => ({ ...d, [section.key]: d[section.key] === val ? "" : val }))}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            </PresetGroup>
            )}

            {/* Ламінація */}
            {!hideLaminationOption && (
            <PresetGroup
              title="Ламінація"
              summary={laminationSummary}
              open={!!openGroups.lamination}
              onToggle={() => toggleGroup("lamination")}
            >
            {/* Lamination — toggle + вибір типу */}
            {!hideLaminationOption && <div className="ssm-preset-field">
              <span className="ssm-preset-label">Ламінація:</span>
              <Toggle
                value={presetDraft.lamination}
                onChange={(v) => {
                  setPresetDraft((d) => ({ ...d, lamination: v, laminationType: v ? (d.laminationType || LAMINATION_OPTIONS[0].value) : "" }));
                  const merged = { ...(activePresetService?.presets || {}), ...presetDraft, lamination: v };
                  if (!v) merged.laminationType = "";
                  else if (!merged.laminationType) merged.laminationType = LAMINATION_OPTIONS[0].value;
                  onUpdateService(activePresetService.id, { presets: merged });
                }}
              />
            </div>}
            {!hideLaminationOption && presetDraft.lamination && (
              <div className="ssm-preset-field">
                <span className="ssm-preset-label">За замовч.:</span>
                <Toggle
                  value={presetDraft.laminationDefault}
                  onChange={(v) => setPresetDraft((d) => ({ ...d, laminationDefault: v }))}
                />
              </div>
            )}
            {!hideLaminationOption && presetDraft.lamination && (
              <div className="ssm-preset-field">
                <span className="ssm-preset-label">Тип:</span>
                <div className="ssm-preset-btns">
                  {LAMINATION_OPTIONS.map((l) => (
                    <button
                      key={l.value}
                      className={`ssm-preset-opt-btn${presetDraft.laminationType === l.value ? " ssm-opt-active" : ""}`}
                      onClick={() => {
                        setPresetDraft((d) => ({ ...d, laminationType: l.value, laminationThickness: "" }));
                        const merged = { ...(activePresetService?.presets || {}), ...presetDraft, laminationType: l.value };
                        delete merged.laminationThickness;
                        onUpdateService(activePresetService.id, { presets: merged });
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!hideLaminationOption && presetDraft.lamination && presetDraft.laminationType && (
              <div className="ssm-preset-field">
                <span className="ssm-preset-label">Цупкість:</span>
                <div className="ssm-preset-btns">
                  {laminationThickLoading ? (
                    <span className="ssm-material-placeholder">Завантаження...</span>
                  ) : laminationThicknesses.length === 0 ? (
                    <span className="ssm-material-placeholder">Немає варіантів</span>
                  ) : (
                    laminationThicknesses.map((t) => (
                      <button
                        key={t}
                        className={`ssm-preset-opt-btn${String(presetDraft.laminationThickness) === String(t) ? " ssm-opt-active" : ""}`}
                        onClick={() => {
                          const newVal = String(presetDraft.laminationThickness) === String(t) ? "" : String(t);
                          setPresetDraft((d) => ({ ...d, laminationThickness: newVal }));
                          const merged = { ...(activePresetService?.presets || {}), ...presetDraft, laminationThickness: newVal };
                          if (!newVal) delete merged.laminationThickness;
                          onUpdateService(activePresetService.id, { presets: merged });
                        }}
                      >
                        {t} мкм
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
            </PresetGroup>
            )}


            {/* Save / Clear */}
            <button
              className="ssm-preset-save-btn"
              onClick={() => handleSavePreset(activePresetService)}
            >
              ЗБЕРЕГТИ ПРЕСЕТ
            </button>
            {activePresetService.presets && (
              <button
                className="ssm-preset-clear-btn"
                onClick={() => handleClearPreset(activePresetService)}
              >
                СКИНУТИ ПРЕСЕТ
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ServiceSettingsModal;
