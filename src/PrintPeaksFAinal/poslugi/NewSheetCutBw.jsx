import axios from '../../api/axiosInstance';
import "./NewSheetCutBw.css";
import React, {useEffect, useState, useMemo} from "react";
import NewNoModalSize from "./newnomodals/NewNoModalSize_colum";
import NewNoModalLaminationNew from "./newnomodals/NewNoModalLaminationNew";
import Materials2 from "./newnomodals/Materials2";

const DEFAULT_SIZE = { x: 210, y: 297 };
const DEFAULTS = {

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
    type: "",
    material: "",
    materialId: null,
    size: "",
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
    type: "",
    material: "",
    materialId: null,
    size: ""
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
      x: opt?.size?.x ?? DEFAULTS.size.x,
      y: opt?.size?.y ?? DEFAULTS.size.y,
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
        ? { orderUnitId: editingOrderUnit.id || editingOrderUnit.idKey }
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
    count,
  ]);


  return (
    <> <div
      className="bw-overlay"
      onClick={() => {
        setEditingOrderUnit(null);
        setShowNewSheetCutBW(false);
      }}
    />
    <div className="bw-modal">

      {/* ===== OVERLAY ===== */}


      {/* ===== MODAL ===== */}
      <div
        className="bw-modal"
        onClick={(e) => e.stopPropagation()}
      >
      {/*/!* ===== HEADER ===== *!/*/}
      {/*<div className="bw-header">*/}
      {/*  <span>Чорно-білий друк</span>*/}
      {/*  <button*/}
      {/*    className="bw-close"*/}
      {/*    onClick={() => {*/}
      {/*      setEditingOrderUnit(null);*/}
      {/*      setShowNewSheetCutBW(false);*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    ✕*/}
      {/*  </button>*/}
      {/*</div>*/}

      {/* ===== CONTENT ===== */}
      {/* ===== CONTENT ===== */}
      <div className="bw-content">

        <div className="bw-layout">

          {/* ===== LEFT 70% ===== */}
          <div className="bw-left">

            {/* 1️⃣ Кількість + Розмір */}
            <div className="bw-title">Кількість та розмір</div>
            <div className="bw-row">

             <div className='d-flex flex-row justify-content-center align-items-center gap-5'>
              <div
                className="d-flex flex-row inputsArtemkilk allArtemElem"
                style={{
                  marginLeft: "1.4vw",
                  border: "transparent",
                  justifyContent: "left",

                }}
              >

                <input
                  className="d-flex inputsArtemNumber inputsArtem"
                  style={{

                    alignItems: "center",
                    justifyContent: "center",
                    paddingLeft: "0.7vw",
                  }}
                  type="number"
                  value={count}
                  min={1}
                  onChange={(event) => setCount(Number(event.target.value || 1))}
                />
                <div
                  className="inputsArtemx allArtemElem"
                  style={{ border: "transparent", marginTop: "1vh" }}
                >
                  шт
                </div>
              </div>
              <div>
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

            {/* 2️⃣ Сторонність */}
            <div className="bw-title">Сторонність</div>
            <div className="bw-row ">

              <NewNoModalSize
                size={safeSize}
                setSize={setSize}
                type="SheetCutBW"
                buttonsArr={["односторонній", "двосторонній"]}
                color={color}
                setColor={setColor}
                count={count}
                setCount={setCount}
                showSize={false}              />

            </div>

            {/* 3️⃣ Матеріал */}
            {/* ===== MATERIAL ===== */}
            <div className="bw-title">Матеріал</div>
            <div className="bw-row">

<div className='d-flex flex-row justify-content-center align-items-center'>
              <Materials2
                material={material}
                setMaterial={setMaterial}
                count={count}
                setCount={setCount}
                size={safeSize}
                name={"Чорно-білий друк на монохромному принтері:"}
                buttonsArr={["Офісний"]}
                typeUse={null}
              />
            </div>
            </div>


            {/* 4️⃣ Ламінація */}
            <div className="bw-title d-flex flex-row align-items-center gap-3">Ламінація
              <NewNoModalLaminationNew
                showSwitch={true}
                showOptions={false}   // ⬅️ ТІЛЬКИ СВІТЧ
                lamination={lamination}
                setLamination={setLamination}
                type="SheetCutBW"
                size={safeSize}
                buttonsArr={[
                  "З глянцевим ламінуванням",
                  "З матовим ламінуванням",
                  "З ламінуванням Soft Touch",
                ]}
              />
            </div>
            {lamination.enabled && (
              <div className="bw-row d-flex flex-row justify-content-center align-items-center">
                <NewNoModalLaminationNew
                  showSwitch={false}     // світч уже зверху
                  showOptions={true}     // тут тільки UI
                  lamination={lamination}
                  setLamination={setLamination}
                  type="SheetCutBW"
                  size={safeSize}
                  buttonsArr={[
                    "З глянцевим ламінуванням",
                    "З матовим ламінуванням",
                    "З ламінуванням Soft Touch",
                  ]}
                />
              </div>
            )}

          </div>





          </div>

          {/* ===== RIGHT 30% ===== */}
          <div className="bw-right">

            <div className="bw-summary">
              <div className="bw-summary-title">Чорно-білий друк</div>
            </div>

            <div className="bw-summary bw-sticky">
              <div className="bw-summary-title">
                <div className="bw-sticky">
                  <div className="bw-summary-title" style={{fontWeight:"500"}}>Розрахунок:</div>

                  {pricesThis && (
                    <div className="bw-sticky">
                      <div style={{ fontWeight: "500" }}>Друк:</div>

                      <div className="bw-calc-line">
                        {(pricesThis.priceDrukPerSheet || 0).toFixed(2)}
                        <span className="bw-sub">грн</span>

                        <span className="bw-op">×</span>

                        {pricesThis.sheetCount || 0}
                        <span className="bw-sub">шт</span>

                        <span className="bw-op">=</span>

                        {(
                          (pricesThis.priceDrukPerSheet || 0) *
                          (pricesThis.sheetCount || 0)
                        ).toFixed(2)}
                        <span className="bw-sub">грн</span>
                      </div>

                      <div style={{ fontWeight: "500" }}>Матеріали:</div>

                      <div className="bw-calc-line">
                        {(pricesThis.pricePaperPerSheet || 0).toFixed(2)}
                        <span className="bw-sub">грн</span>

                        <span className="bw-op">×</span>

                        {pricesThis.sheetCount || 0}
                        <span className="bw-sub">шт</span>

                        <span className="bw-op">=</span>

                        {(
                          (pricesThis.pricePaperPerSheet || 0) *
                          (pricesThis.sheetCount || 0)
                        ).toFixed(2)}
                        <span className="bw-sub">грн</span>
                      </div>

                      <div style={{ fontWeight: "500" }}>Ламінація:</div>

                      <div className="bw-calc-line">
                        {(pricesThis.priceLaminationPerSheet || 0).toFixed(2)}
                        <span className="bw-sub">грн</span>

                        <span className="bw-op">×</span>

                        {pricesThis.sheetCount || 0}
                        <span className="bw-sub">шт</span>

                        <span className="bw-op">=</span>

                        {(
                          (pricesThis.priceLaminationPerSheet || 0) *
                          (pricesThis.sheetCount || 0)
                        ).toFixed(2)}
                        <span className="bw-sub">грн</span>
                      </div>

                      <div
                        className="bw-calc-total d-flex justify-content-center align-content-center"
                        style={{ fontWeight: "500", color: "red" }}
                      >
                        {pricesThis.price || 0}
                        <span className="bw-sub">грн</span>
                      </div>
                    </div>
                  )}




                </div>

              </div>
              {/* тут буде калькуляція */}
            </div>

          </div>

        </div>
        {typeof error === "string" && (
          <div className="bw-error">
            {error}
          </div>
        )}
        <div className="bw-product-tabs">
          {services.map((service) => (
            <div
              key={service}
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <button
                className={`btn ${
                  selectedService === service
                    ? "adminButtonAdd"
                    : "adminButtonAdd-active"
                }`}
                onClick={() => setSelectedService(service)}
              >
                {service}
              </button>

              {/* КНОПКА ВИДАЛЕННЯ */}
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
                    fontSize: "24px",
                    lineHeight: "0px",
                    cursor: "pointer",

                  }}
                >
                  x
                </button>
              )}
            </div>
          ))}

          {/* КНОПКА ДОДАВАННЯ */}
          {isEditServices && (
            <button
              className="btn adminButtonAdd"
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

              <div className="bw-text-gray">➕</div>
            </button>
          )}

          {/* КНОПКА НАЛАШТУВАНЬ */}
          <button
            className={`btn  ${
              isEditServices ? "adminButtonAdd" : "adminButtonAdd-active"
            }`}
            onClick={() => setIsEditServices((v) => !v)}
            title={isEditServices ? "Завершити редагування" : "Налаштування назв товарів"}
          >
            <div className="bw-text-gray">{isEditServices ? "✔️" : "⚙️"}</div>
          </button>

        </div>

        {/* BUTTON */}
        <div className="bw-action">
          <button className="adminButtonAdd" variant="danger"
                  onClick={addNewOrderUnit}
          >
            {isEdit ? "Зберегти зміни" : "Додати до замовлення"}


          </button>

        </div>
      </div>
    </div>
    </>
  );
}
