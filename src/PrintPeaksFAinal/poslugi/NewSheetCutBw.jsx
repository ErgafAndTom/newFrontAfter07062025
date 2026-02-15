import axios from '../../api/axiosInstance';
import "./Poslugy.css";
import React, {useEffect, useState, useMemo} from "react";
import NewNoModalSize from "./newnomodals/NewNoModalSize_colum";
import NewNoModalLaminationNew from "./newnomodals/NewNoModalLaminationNew";
import Materials2 from "./newnomodals/Materials2";

const DEFAULT_SIZE = {
  x: 210, y: 297
};
const DEFAULTS = {
  size: DEFAULT_SIZE,
  material: {
    type: "Папір",
    thickness: "Офісний",
    material: "",
    materialId: "",
    typeUse: "Офісний",
  },
  color: {
    sides: "односторонній",
    one: "",
    two: "",
    allSidesColor: "Чорно-білий",
  },
  lamination: {
    enabled: false,
    type: "Ламінування",
    material: "з глянцевим ламінуванням",  // ← змінено з "матового" на "глянцеве"
    materialId: null,
    size: "",
    thickness: "125 мкм"
  },
  count: 1,
  selectedService: "Документ",
};

function parseOptionsJson(orderUnit) {
  if (!orderUnit?.optionsJson) return null;
  try {
    return JSON.parse(orderUnit.optionsJson);
  } catch {
    return null;
  }
}

export default function NewSheetCutBW({
                                        thisOrder,
                                        newThisOrder,
                                        selectedThings2,
                                        setNewThisOrder,
                                        setThisOrder,
                                        setSelectedThings2,
                                        showNewSheetCutBW,
                                        setShowNewSheetCutBW,
                                        editingOrderUnit,
                                        setEditingOrderUnit,

                                      }) {


  const [count, setCount] = useState(1);
  const [selectedService, setSelectedService] = useState("Зображення");
  const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.idKey);
  const [size, setSize] = useState({
    x: 210,
    y: 297
  });
  const options = useMemo(
    () => parseOptionsJson(editingOrderUnit),
    [editingOrderUnit]
  );

  const [material, setMaterial] = useState({
    type: "Папір",
    thickness: "Офісний",
    material: "",
    materialId: "",
    typeUse: "Офісний",
  });

  const [color, setColor] = useState({
    sides: "односторонній",
    one: "",
    two: "",
    allSidesColor: "Чорно-білий",
  });
  const [big, setBig] = useState("Не потрібно");
  const [cute, setCute] = useState("Не потрібно");
  const [cuteLocal, setCuteLocal] = useState("Не потрібно");
  const [holes, setHoles] = useState("Не потрібно");
  const [error, setError] = useState("Не потрібно");
  const [prices, setPrices] = useState([]);
  const [pricesThis, setPricesThis] = useState([]);
  const [isEditServices, setIsEditServices] = useState(false);

  if (!showNewSheetCutBW) return null;

  // ✅ безпечні значення
  const safeSize = useMemo(() => {
    return editingOrderUnit?.optionsJson
      ? JSON.parse(editingOrderUnit.optionsJson)?.size || DEFAULT_SIZE
      : DEFAULT_SIZE;
  }, [editingOrderUnit]);

  const safeCount = editingOrderUnit?.amount || 1;
  const [lamination, setLamination] = useState({
    enabled: false,
    type: "Ламінування",
    material: "з глянцевим ламінуванням",  // ← змінено
    materialId: null,
    size: "",
    thickness: "125 мкм"
  });

  const safeLamination = lamination || {
    type: "Не потрібно",
    material: "",
    materialId: 0,
    size: "",
  };

  const [services, setServices] = useState([
    "Документ",
    "Договір",
    "Дипломна робота",
    "Курсова робота",
    "Реферат",
    "Креслення",
    "Аналізи",
    "Квиток",
  ]);

  useEffect(() => {
    if (!showNewSheetCutBW) return;

    setSize({
      x: DEFAULT_SIZE.x,
      y: DEFAULT_SIZE.y,
    });

    // NEW
    if (!isEdit) {
      setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setLamination(DEFAULTS.lamination);
      setCount(DEFAULTS.count);
      setSelectedService(DEFAULTS.selectedService);
      setError(null);
      return;
    }

    // EDIT
    const opt = options || {};
    const savedName = options?.nameOrderUnit || "";


    setCount(opt.count ?? editingOrderUnit?.amount ?? DEFAULTS.count);

    setSize({
      x: opt?.size?.x ?? DEFAULT_SIZE.x,
      y: opt?.size?.y ?? DEFAULT_SIZE.y,
    });

    setMaterial({
      type: opt?.material?.type ?? DEFAULTS.material.type,
      thickness: opt?.material?.thickness ?? DEFAULTS.material.thickness,
      material: opt?.material?.material ?? "",
      materialId: opt?.material?.materialId ?? "",
      typeUse: opt?.material?.typeUse ?? DEFAULTS.material.typeUse,
    });

    setColor({
      sides: opt?.color?.sides ?? DEFAULTS.color.sides,
      one: opt?.color?.one ?? "",
      two: opt?.color?.two ?? "",
      allSidesColor: opt?.color?.allSidesColor ?? DEFAULTS.color.allSidesColor,
    });

    setLamination({
      enabled: Boolean(opt?.lamination?.materialId),
      type: opt?.lamination?.type ?? "",
      material: opt?.lamination?.material ?? "",
      materialId: opt?.lamination?.materialId ?? null,
      size: opt?.lamination?.size ?? "",
    });

    const matched = services.find(
      (s) => s.toLowerCase() === savedName.toLowerCase()
    );

    setSelectedService(matched || services[0] || "");

    setError(null);
  }, [showNewSheetCutBW, isEdit, options, editingOrderUnit]);

  const addNewOrderUnit = () => {
    // 🔒 ВАЛІДАЦІЯ — дивись пункт 2 нижче
    if (!material?.materialId) {
      setError("Виберіть будь ласка матеріал");
      return;
    }

    let dataToSend = {
      orderId: thisOrder?.id,
      ...(isEdit && (editingOrderUnit?.id || editingOrderUnit?.idKey)
        ? {orderUnitId: editingOrderUnit.id || editingOrderUnit.idKey}
        : {}),
      toCalc: {
        nameOrderUnit: selectedService || "",
        type: "SheetCutBW",
        size,
        material,
        color,
        lamination,
        big,
        cute,
        cuteLocal,
        holes,
        count,
      },
    };

    axios
      .post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then((response) => {
        setThisOrder(response.data);
        setSelectedThings2(response.data.OrderUnits);

        // ✅ ЗАКРИВАЄМО ВІКНО
        setEditingOrderUnit(null);
        setShowNewSheetCutBW(false);

        // 🧹 чистимо помилки
        setError(null);
      })
      .catch((error) => {
        setError(error);
        if (error?.response?.status === 403) {
          navigate("/login");
        }
      });
  };

  useEffect(() => {
    if (!size) return;

    const dataToSend = {
      type: "SheetCutBW",
      size,
      material,
      color,
      lamination,
      big,
      cute,
      cuteLocal,
      holes,
      count,
    };

    axios
      .post(`/calc/pricing`, dataToSend)
      .then((response) => {
        setPricesThis(response.data.prices);
        setError(null);
      })
      .catch((error) => {
        setError(error);
      });
  }, [
    size,
    material,
    color,
    lamination?.enabled,
    lamination?.materialId,
    lamination?.type,
    lamination?.thickness,
    count,
  ]);


  return (
    <div className="sc-wrap">
      {/* ===== OVERLAY ===== */}
      <div
        className="bw-overlay"
        onClick={() => {
          setEditingOrderUnit(null);
          setShowNewSheetCutBW(false);
        }}
      />

      {/* ===== MODAL ===== */}
      <div className="sc-modal" style={{ minHeight: 'auto', height: 'auto', width: '48vw', maxWidth: '860px' }} onClick={(e) => e.stopPropagation()}>

        {/* ===== BODY: left + right ===== */}
        <div className="sc-body">

          {/* ===== LEFT: options ===== */}
          <div className="sc-left-sections" style={{ flex: '7 1 0' }}>

            {/* 1. Кількість + Розмір */}
            <div className="sc-section">
              <div className="sc-title">Кількість та розмір</div>
              <div className="sc-row d-flex flex-row align-items-center justify-content-between">
                <div className="d-flex flex-row" style={{ alignItems: "center" }}>
                  <input
                    className="inputsArtem"
                    type="number"
                    value={count}
                    min={1}
                    onChange={(event) => setCount(Number(event.target.value || 1))}
                  />
                  <div className="inputsArtemx" style={{ border: "transparent" }}>шт</div>
                </div>
                <div style={{ marginLeft: "auto", paddingRight: 0 }}>
                  <NewNoModalSize
                    size={size}
                    setSize={setSize}
                    type="SheetCutBW"
                    count={count}
                    showSize={true}
                    showSides={false}
                    showCount={true}
                  />
                </div>
              </div>
            </div>

            {/* 2. Сторонність */}
            <div className="sc-section">
              <div className="sc-title">Сторонність</div>
              <div className="sc-sides">
                <button
                  className={`sc-side-btn sc-side-left ${color.sides === "односторонній" ? "sc-side-active" : ""}`}
                  onClick={() => setColor({ ...color, sides: "односторонній" })}
                >
                  <span className="sc-side-text">Односторонній</span>
                </button>
                <button
                  className={`sc-side-btn sc-side-right ${color.sides === "двосторонній" ? "sc-side-active" : ""}`}
                  onClick={() => setColor({ ...color, sides: "двосторонній" })}
                >
                  <span className="sc-side-text">Двосторонній</span>
                </button>
              </div>
            </div>

            {/* 3. Матеріал */}
            <div className="sc-section" style={{ position: "relative", zIndex: 60 }}>
              <div className="sc-title">Матеріал</div>
              <div className="sc-row">
                <Materials2
                  material={material}
                  setMaterial={setMaterial}
                  count={count}
                  setCount={setCount}
                  size={size}
                  name={"Чорно-білий друк на монохромному принтері:"}
                  buttonsArr={["Офісний"]}
                  typeUse={null}
                />
              </div>
            </div>

            {/* 4. Ламінування */}
            <div className="sc-section" style={{ position: "relative", zIndex: 40, marginBottom: "1.5vh" }}>
              <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                <div className="sc-title" style={{ marginBottom: 0 }}>Ламінування</div>
                <NewNoModalLaminationNew
                  showSwitch={true}
                  showOptions={false}
                  lamination={lamination}
                  setLamination={setLamination}
                  type="SheetCutBW"
                  size={safeSize}
                  buttonsArr={[
                    "з глянцевим ламінуванням",
                    "з матовим ламінуванням",
                    "з ламінуванням Soft Touch",
                  ]}
                />
              </div>
              {lamination.enabled && (
                <div className="sc-row sc-lam-row">
                  <NewNoModalLaminationNew
                    showSwitch={false}
                    showOptions={true}
                    lamination={lamination}
                    setLamination={setLamination}
                    type="SheetCutBW"
                    size={safeSize}
                    buttonsArr={[
                      "з глянцевим ламінуванням",
                      "з матовим ламінуванням",
                      "з ламінуванням Soft Touch",
                    ]}
                  />
                </div>
              )}
            </div>

          </div>
          {/* END sc-left */}

          {/* ===== RIGHT: pricing ===== */}
          <div className="sc-right" style={{ flex: '3 1 0', width: 'auto', minWidth: 0, maxWidth: 'none' }}>
            {pricesThis && (
              <div className="sc-prices-grid">
                <div className="sc-price-label">Друк:</div>
                <div className="sc-price-line">
                  <span className="sc-val">{(pricesThis.priceDrukPerSheet || 0).toFixed(2)}</span>
                  <span className="sc-unit">грн</span>
                  <span className="sc-op">&times;</span>
                  <span className="sc-val">{pricesThis.sheetCount || 0}</span>
                  <span className="sc-unit">шт</span>
                  <span className="sc-op">=</span>
                  <span className="sc-total">{((pricesThis.priceDrukPerSheet || 0) * (pricesThis.sheetCount || 0)).toFixed(2)}</span>
                  <span className="sc-unit">грн</span>
                </div>

                <div className="sc-price-label">Матеріали:</div>
                <div className="sc-price-line">
                  <span className="sc-val">{(pricesThis.pricePaperPerSheet || 0).toFixed(2)}</span>
                  <span className="sc-unit">грн</span>
                  <span className="sc-op">&times;</span>
                  <span className="sc-val">{pricesThis.sheetCount || 0}</span>
                  <span className="sc-unit">шт</span>
                  <span className="sc-op">=</span>
                  <span className="sc-total">{((pricesThis.pricePaperPerSheet || 0) * (pricesThis.sheetCount || 0)).toFixed(2)}</span>
                  <span className="sc-unit">грн</span>
                </div>

                <div className="sc-price-label">Ламінація:</div>
                <div className="sc-price-line">
                  <span className="sc-val">{(pricesThis.priceLaminationPerSheet || 0).toFixed(2)}</span>
                  <span className="sc-unit">грн</span>
                  <span className="sc-op">&times;</span>
                  <span className="sc-val">{pricesThis.sheetCount || 0}</span>
                  <span className="sc-unit">шт</span>
                  <span className="sc-op">=</span>
                  <span className="sc-total">{((pricesThis.priceLaminationPerSheet || 0) * (pricesThis.sheetCount || 0)).toFixed(2)}</span>
                  <span className="sc-unit">грн</span>
                </div>

                <div className="sc-price-total">
                  {pricesThis.price || 0}
                  <span className="sc-unit">грн</span>
                </div>
              </div>
            )}
          </div>
          {/* END sc-right */}

        </div>
        {/* END sc-body */}

        {/* ===== ERROR ===== */}
        {typeof error === "string" && (
          <div className="sc-error">{error}</div>
        )}

        {/* ===== SERVICE TABS ===== */}
        <div className="sc-tabs">
          {services.map((service) => (
            <div
              key={service}
              style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
            >
              <button
                className={`btn ${selectedService === service ? "adminButtonAdd" : "adminButtonAdd-active"}`}
                style={{ fontSize: "clamp(0.7rem, 0.7vh, 2.5vh)", minWidth: "2vw", height: "2vh" }}
                onClick={() => setSelectedService(service)}
              >
                <span className="sc-tab-text">{service}</span>
              </button>

              {isEditServices && (
                <button
                  type="button"
                  onClick={() => {
                    if (services.length === 1) {
                      alert("Повинен бути хоча б один товар");
                      return;
                    }
                    if (!window.confirm(`Видалити "${service}"?`)) return;
                    setServices((prev) => prev.filter((s) => s !== service));
                    if (selectedService === service) {
                      setSelectedService(services[0] || "");
                    }
                  }}
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: "none",
                    background: "transparent",
                    color: "red",
                    lineHeight: "0px",
                    cursor: "pointer",
                  }}
                >
                  x
                </button>
              )}
            </div>
          ))}

          {isEditServices && (
            <button
              className="btn adminButtonAdd"
              style={{ fontSize: "clamp(0.7rem, 0.7vh, 2.5vh)", minWidth: "2vw", height: "2vh" }}
              onClick={() => {
                const name = prompt("Введіть назву товару");
                if (!name) return;
                const trimmed = name.trim();
                if (!trimmed) return;
                if (services.includes(trimmed)) {
                  alert("Така назва вже існує");
                  return;
                }
                setServices((prev) => [...prev, trimmed]);
                setSelectedService(trimmed);
              }}
            >
              ➕
            </button>
          )}

          <button
            className={`btn sc-settings-btn ${isEditServices ? "adminButtonAdd" : "adminButtonAdd-active"}`}
            style={{ fontSize: "clamp(0.7rem, 0.7vh, 2.5vh)", minWidth: "2vw", height: "2vh" }}
            onClick={() => setIsEditServices((v) => !v)}
            title={isEditServices ? "Завершити редагування" : "Налаштування назв товарів"}
          >
            {isEditServices ? "✔️" : "⚙️"}
          </button>
        </div>

        {/* ===== ACTION BUTTON ===== */}
        <div className="sc-action">
          <button className="adminButtonAdd" onClick={addNewOrderUnit}>
            {isEdit ? "Зберегти зміни" : "Додати до замовлення"}
          </button>
        </div>

      </div>
      {/* END sc-modal */}
    </div>
  );
}
