import React, {useEffect, useState, useRef} from "react";
import ReactDOM from "react-dom";
import axios from "../../../api/axiosInstance";
import {useNavigate} from "react-router-dom";
import {Spinner} from "react-bootstrap";

/* Кеш списків матеріалів на час життя вкладки.
   Список за однією комбінацією (тип + щільність + розмір + послуга +
   сортування) не змінюється, поки користувач клацає туди-сюди в модалці,
   а запит важкий (усі позиції прайсу). Без кешу кожне перемикання
   товщини або розміру знову чекало на мережу. */
const materialsCache = new Map();
const MATERIALS_CACHE_TTL = 60000;

const readMaterialsCache = (key) => {
  const hit = materialsCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > MATERIALS_CACHE_TTL) {
    materialsCache.delete(key);
    return null;
  }
  return hit.rows;
};

const Materials2 = ({
                      material,
                      setMaterial,
                      buttonsArr = [],
                      size,
                      editingOrderUnit,
                      typeOfPosluga,
                      disabled = false,
                      preferredMaterialName,
                      // уточнює вибір серед однойменних матеріалів різної щільності
                      preferredMaterialThickness,
                      autoSelectFirst = true,
                      // додатковий клас на випадайку — вона рендериться порталом
                      // у body, тож інакше стилі конкретної послуги до неї не дійдуть
                      dropdownClassName = "",
                      // перевизначає глобальне налаштування сортування
                      // (Profile → Калькулятори) для конкретного виклику
                      sortOverride,
                    }) => {
  const [paper, setPaper] = useState([]);
  const [error, setError] = useState(null);
  const [load, setLoad] = useState(true);
  const [open, setOpen] = useState(false);
  const [dropdownWidth, setDropdownWidth] = useState("auto");
  const [dropdownStyle, setDropdownStyle] = useState({});

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const portalRef = useRef(null);
  const measureRef = useRef(null);

  const isEdit = Boolean(editingOrderUnit?.idKey || editingOrderUnit?.id);

  // ✅ зміна товщини/типу: очищаємо вибраний матеріал (особливо для new order)
  const handleClickThickness = (thickness) => {
    const isSelf = thickness === "Самоклеючі";

    setMaterial((prev) => ({
      ...prev,
      type: isSelf ? "Плівка" : "Папір",
      thickness,
      typeUse: thickness,

      // ✅ важливо: при зміні категорії — скидаємо вибір матеріалу
      material: "",
      materialId: 0,
      a: "",
      x: null,
      y: null,
    }));
  };

  const handleSelect = (item) => {
    setMaterial((prev) => ({
      ...prev,
      material: item?.name || "",
      materialId: item?.id || 0,
      a: item?.thickness || "",
      x: item?.x || "",
      y: item?.y || "",
    }));
    setOpen(false);
  };

  // ✅ Завантаження списку матеріалів (без примусового setMaterial("Немає"))
  useEffect(() => {
    // 🔽 Глобальне налаштування сортування матеріалів (Profile → Калькулятори),
    // якщо конкретний виклик явно не задав своє через sortOverride
    let sortPref = { column: "id", reverse: false };
    if (sortOverride) {
      sortPref = {
        column: ["id", "article", "name", "createdAt"].includes(sortOverride.column) ? sortOverride.column : "id",
        reverse: !!sortOverride.reverse,
      };
    } else {
      try {
        const raw = localStorage.getItem("printpeaks_material_sort");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            sortPref = {
              column: ["id", "article", "name", "createdAt"].includes(parsed.column) ? parsed.column : "id",
              reverse: !!parsed.reverse,
            };
          }
        }
      } catch (e) { /* ignore */ }
    }

    const data = {
      name: "MaterialsPrices",
      inPageCount: 999999,
      currentPage: 1,
      search: "",
      columnName: sortPref,
      typeOfPosluga: typeOfPosluga,
      size,
      material, // бек у тебе фільтрує по type/thickness
    };

    let cancelled = false;

    const cacheKey = JSON.stringify({
      t: material?.type,
      th: material?.thickness,
      x: size?.x,
      y: size?.y,
      p: typeOfPosluga,
      s: sortPref,
    });

    const applyRows = (rows) => {
      if (cancelled) return;
      setPaper(rows);
      setLoad(false);

        // Якщо є preferredMaterialName — завжди вибирати його
        if (preferredMaterialName && rows.length > 0) {
          // назва матеріалу не унікальна: під однією назвою лежать різні
          // щільності, тож коли задано preferredMaterialThickness — обираємо
          // серед однойменних саме потрібні грами, інакше візьметься перший за id
          const wanted = String(preferredMaterialName).toLowerCase();
          const sameName = rows.filter((r) => (r.name || "").toLowerCase() === wanted);
          const pool = sameName.length
            ? sameName
            : rows.filter((r) => (r.name || "").toLowerCase().includes(wanted));
          const byThickness = preferredMaterialThickness
            ? (pool.length ? pool : rows).find(
                (r) => String(r.thickness) === String(preferredMaterialThickness)
              )
            : null;
          const target = byThickness || pool[0] || rows[0];
          if (String(target.id) !== String(material?.materialId)) {
            setMaterial((prev) => ({
              ...prev,
              material: target.name,
              materialId: target.id,
              a: target.thickness || "",
              x: target.x || "",
              y: target.y || "",
            }));
          }
        } else {
          // Авто-вибір матеріалу якщо нічого не вибрано або поточний відсутній у результатах
          const currentExists = rows.some((r) => String(r.id) === String(material?.materialId));
          const isOffice = material?.typeUse === 'Офісний' || material?.thickness === 'Офісний';
          const needsAutoSelect = !material?.materialId || material.materialId === 0 || material.materialId === "0" || !currentExists;

          // Для "Офісний" — завжди авто-вибирати матеріал за розміром
          if (rows.length > 0 && (isOffice || (autoSelectFirst && needsAutoSelect))) {
            const sizeMatch = size?.x && size?.y
              ? rows.find((r) => Number(r.x) === Number(size.x) && Number(r.y) === Number(size.y))
              : null;
            const target = sizeMatch || rows[0];
            // Оновлюємо тільки якщо реально потрібно (інший матеріал або немає вибору)
            if (needsAutoSelect || (isOffice && String(target.id) !== String(material?.materialId))) {
              setMaterial((prev) => ({
                ...prev,
                material: target.name,
                materialId: target.id,
                a: target.thickness || "",
                x: target.x || "",
                y: target.y || "",
              }));
            }
          }
        }
    };

    const cached = readMaterialsCache(cacheKey);
    if (cached) {
      // список уже є — показуємо без мережі й без миготіння лоадера
      applyRows(cached);
      return () => { cancelled = true; };
    }

    setLoad(true);
    setError(null);

    axios
      .post(`/materials/NotAll`, data)
      .then((response) => {
        const rawRows = response?.data?.rows || [];
        const rows = Array.isArray(rawRows) ? rawRows : [];
        materialsCache.set(cacheKey, { rows, at: Date.now() });
        applyRows(rows);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoad(false);
        setError(err?.message || "Error");
        if (err?.response?.status === 403) navigate("/login");
      });

    return () => {
      cancelled = true;
    };
    /* size навмисно НЕ в залежностях: це об'єкт, який батько створює
       наново на кожен рендер, тож ефект перезапитував список нескінченно.
       Значення беремо з size.x/size.y — вони примітиви. */
  }, [material?.thickness, material?.type, size?.x, size?.y, typeOfPosluga, preferredMaterialName, preferredMaterialThickness, autoSelectFirst, sortOverride?.column, sortOverride?.reverse]);

  // 📏 автоширина
  useEffect(() => {
    if (!measureRef.current) return;
    const widths = Array.from(measureRef.current.children).map((el) =>
      el.getBoundingClientRect().width
    );
    if (widths.length > 0) {
      const maxWidth = Math.ceil(Math.max(...widths)) + 30;
      setDropdownWidth(`${maxWidth}px`);
    }
  }, [paper]);

  // клік поза селектом
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inContainer = dropdownRef.current?.contains(event.target);
      const inPortal = portalRef.current?.contains(event.target);
      if (!inContainer && !inPortal) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const title =
    material?.material && material.material !== "Немає"
      ? material.material
      : "Виберіть матеріал";
  const hasButtons = buttonsArr.length > 0;

  return (
    <div className={`d-flex flex-row align-items-center w-100 ${hasButtons ? "justify-content-between gap-3" : "justify-content-center"}`} >

      {/* Кнопки зліва */}
      {hasButtons && (
      <div style={{display: "flex"}}>
        {buttonsArr.map((item, index) => {
          const isActive = item === material?.thickness;
          return (
            <div
              className={
                isActive
                  ? "buttonsArtem buttonsArtemActive"
                  : "buttonsArtem"
              }
              key={index}
              onClick={() => handleClickThickness(item)}
            >
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* SELECT справа */}
      <div
        className={`custom-select-container selectArtem selectArtemBefore${material?.materialId && material.materialId !== 0 && material.materialId !== "0" ? " sc-has-value" : ""}`}
        ref={dropdownRef}
        style={{ minWidth: hasButtons ? dropdownWidth : "100%", width: hasButtons ? undefined : "100%" }}
      >
        {/* tapping hand loader */}
        {!(material?.materialId && material.materialId !== 0 && material.materialId !== "0") && (
          <div className="sc-hand">
            <div className="sc-hand-finger"/>
            <div className="sc-hand-finger"/>
            <div className="sc-hand-finger"/>
            <div className="sc-hand-finger"/>
            <div className="sc-hand-palm"/>
            <div className="sc-hand-thumb"/>
          </div>
        )}
        <div
          className="custom-select-header"
          onClick={() => {
            if (disabled) return;
            if (!open && dropdownRef.current) {
              const rect = dropdownRef.current.getBoundingClientRect();
              const vh = window.innerHeight || document.documentElement.clientHeight;
              const viewportW = window.innerWidth || document.documentElement.clientWidth;
              const margin = 12;
              // якщо пунктів широкий dropdownWidth — використовуємо його, інакше ширину триггера
              const naturalWidth = Math.max(rect.width, parseInt(dropdownWidth, 10) || 0);
              // не вилазимо за правий край viewport
              let left = rect.left;
              if (left + naturalWidth + margin > viewportW) {
                left = Math.max(margin, viewportW - naturalWidth - margin);
              }
              // не вилазимо за нижній/верхній край viewport
              const spaceBelow = vh - rect.bottom - margin;
              const spaceAbove = rect.top - margin;
              const flipUp = spaceBelow < 200 && spaceAbove > spaceBelow;
              const maxHeight = Math.max(120, flipUp ? spaceAbove : spaceBelow);

              const base = {
                position: "fixed",
                left,
                width: rect.width,
                maxWidth: `calc(100vw - ${margin * 2}px)`,
                maxHeight,
                overflowY: "auto",
                zIndex: 99999,
              };
              if (flipUp) {
                base.bottom = vh - rect.top + 2;
              } else {
                base.top = rect.bottom + 2;
              }
              setDropdownStyle(base);
            }
            setOpen(!open);
          }}
          style={disabled ? { pointerEvents: "none", opacity: 0.7 } : undefined}
        >
          {title}
          <span className="gsm-sub" style={{marginRight: "0.8vw"}}>
          <sub style={{marginRight: "0.8vw"}}>
            {material.x && material.y && (
              <sub>
                {material.x}x{material.y}
              </sub>
            )}
          </sub>
            {material?.a ? (
              <sub>
                {material.a} г/м<sub>2</sub>
              </sub>
            ) : null}
        </span>
        </div>

        {open && ReactDOM.createPortal(
          <div ref={portalRef} className={`custom-select-dropdown${dropdownClassName ? ` ${dropdownClassName}` : ""}`} style={{ ...dropdownStyle, minWidth: hasButtons ? dropdownWidth : dropdownStyle.width }}>
            {paper.map((item) => (
              <div
                key={item.id}
                className={`custom-option ${
                  String(item.id) === String(material?.materialId) ? "active" : ""
                }`}
                onClick={() => handleSelect(item)}
              >
                <span className="name">{item.name}</span>
                <span className="gsm-sub">
                <sub style={{marginRight: "0.8vw"}}>
                  {item.x && item.y && (
                    <sub>
                      {item.x}x{item.y}
                    </sub>
                  )}
                </sub>
                <sub>
                  {item.thickness} г/м<sub>2</sub>
                </sub>
              </span>
              </div>
            ))}
          </div>,
          document.body
        )}

        {/* hidden measure */}
        <div
          ref={measureRef}
          style={{
            position: "absolute",
            visibility: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {paper.map((item) => (
            <div key={item.id} style={{fontSize: "15px", padding: "8px 12px"}}>
              {item.name} {item.x}x{item.y} {item.thickness}gsm
            </div>
          ))}
        </div>

        {load && <Spinner animation="border" variant="danger" size="sm"/>}
        {error && <div>{error}</div>}
      </div>

    </div>
  );

};

export default Materials2;
