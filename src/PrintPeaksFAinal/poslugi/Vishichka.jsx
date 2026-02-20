// Vishichka.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "../../api/axiosInstance";
import NewNoModalSize from "./newnomodals/NewNoModalSizeColor";
import Materials2 from "./newnomodals/Materials2";
import { useNavigate } from "react-router-dom";
import PlivkaMontajna from "./newnomodals/plivka/PlivkaMontajna";
import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import {columnTranslations as editingOrderUnit} from "../user/translations";

import ScModal from "./shared/ScModal";
import ScCountSize from "./shared/ScCountSize";
import ScSides from "./shared/ScSides";
import ScSection from "./shared/ScSection";
import ScToggleSection from "./shared/ScToggleSection";
import ScPricing from "./shared/ScPricing";
import ScAddButton from "./shared/ScAddButton";
import ScTabs from "./shared/ScTabs";

import "./Poslugy.css";
import "./shared/sc-base.css";

/**
 * Мапа типів висічки (лейбл -> typeUse)
 */
const VISHICHKA_MAP = {
  SHEET_CUT: {
    label: "З плотерною надсічкою на надрукованих аркушах",
    typeUse: "sheet_cut",
  },
  STICKERPACK: {
    label: "З плотерною порізкою стікерпаків",
    typeUse: "stickerpack",
  },
  SINGLE_ITEMS: {
    label: "З плотерною порізкою окремими виробами",
    typeUse: "single_items",
  },
};
const isEdit = Boolean(editingOrderUnit?.id);

const DEFAULTS = {
  count: 1,
  size: { x: 310, y: 440 },

  // ✅ для нового замовлення: показує "Виберіть матеріал"
  material: {
    type: "Плівка",
    thickness: "Самоклеючі",
    material: "",
    materialId: 0,
    typeUse: "Самоклеючі",
    a: "",
  },

  color: {
    sides: "односторонній",
    one: "",
    two: "",
    allSidesColor: "CMYK",
  },

  lamination: {
    type: "Не потрібно",
    material: "З глянцевим ламінуванням",
    materialId: "",
    size: "",
    typeUse: "А3",
  },

  // ✅ для нового замовлення: дефолт як на твоєму скріні
  vishichka: {
    type: "vishichka",
    thickness: "Тонкі",
    material: VISHICHKA_MAP.SHEET_CUT.label,
    materialId: "", // підтягнемо з pricing.selectedVishichka.id
    typeUse: VISHICHKA_MAP.SHEET_CUT.typeUse,
  },

  plivkaMontajna: {
    type: "plivka",
    thickness: "Тонкі",
    material: "Немає Монтажної плівки",
    materialId: "0",
    typeUse: null,
  },

  big: "Не потрібно",
  cute: "Не потрібно",
  cuteLocal: {
    leftTop: false,
    rightTop: false,
    rightBottom: false,
    leftBottom: false,
    radius: "",
  },
  holes: "Не потрібно",
  holesR: "",
};

function safeNum(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function parseOptionsJson(editingOrderUnit) {
  if (!editingOrderUnit?.optionsJson) return null;
  try {
    return JSON.parse(editingOrderUnit.optionsJson);
  } catch (e) {
    console.error("Bad optionsJson", e);
    return null;
  }
}

function normalizeVishichkaByLabel(v) {
  const label = (v?.material || "").trim();
  if (!label) return v;

  const found = Object.values(VISHICHKA_MAP).find((x) => x.label === label);
  if (!found) return v;

  return {
    ...v,
    type: v?.type || "vishichka",
    typeUse: found.typeUse,
  };
}

const Vishichka = ({
                     thisOrder,
                     newThisOrder,
                     setNewThisOrder,
                     selectedThings2,
                     setShowVishichka,
                     setThisOrder,
                     setSelectedThings2,
                     showVishichka,
                     editingOrderUnit,
                   }) => {
  const fmt2 = (v) =>
    new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(v));

  const navigate = useNavigate();

  const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.idKey);
  const options = useMemo(() => parseOptionsJson(editingOrderUnit), [editingOrderUnit]);

  const [error, setError] = useState(null);

  // ✅ prices має бути масивом (інакше десь падає .map)
  const [prices, setPrices] = useState([]);

  // state
  const [count, setCount] = useState(DEFAULTS.count);
  const [size, setSize] = useState(DEFAULTS.size);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [color, setColor] = useState(DEFAULTS.color);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);

  const [vishichka, setVishichka] = useState(normalizeVishichkaByLabel(DEFAULTS.vishichka));
  const [plivkaMontajna, setPlivkaMontajna] = useState(DEFAULTS.plivkaMontajna);

  const [big, setBig] = useState(DEFAULTS.big);
  const [cute, setCute] = useState(DEFAULTS.cute);
  const [cuteLocal, setCuteLocal] = useState(DEFAULTS.cuteLocal);
  const [holes, setHoles] = useState(DEFAULTS.holes);
  const [holesR, setHolesR] = useState(DEFAULTS.holesR);

  const [pricesThis, setPricesThis] = useState({
    priceDrukPerSheet: 0,
    pricePaperPerSheet: 0,
    priceVishichkaPerSheet: 0,
    pricePlivkaPerSheet: 0,
    priceLaminationPerSheet: 0,
    totalVishichkaPrice: 0,
    totalPlivkaPrice: 0,
    sheetCount: 0,
    sheetsPerUnit: 0,
    price: 0,
    priceForItemWithExtras: 0,
  });
  const [selectedService, setSelectedService] = useState("Наліпки");
  const [isEditServices, setIsEditServices] = useState(false);
  const [services, setServices] = useState([
    "Наліпки", "Стікери", "Стікерпак", "Стікерсет", "Бірки",
    "Листівки", "Коробочки", "Фішки", "Цінник", "Меню",
  ]);

  const setVishichkaSafe = useCallback((nextOrUpdater) => {
    setVishichka((prev) => {
      const next = typeof nextOrUpdater === "function" ? nextOrUpdater(prev) : nextOrUpdater;
      const merged = { ...prev, ...(next || {}) };
      return normalizeVishichkaByLabel(merged);
    });
  }, []);

  const handleClose = () => {
    setShowVishichka(false);
  };

  const handleChangeCount = (v) => setCount(safeNum(v, 1));

  /**
   * ✅ ГОЛОВНЕ: кожен раз при відкритті модалки
   * - якщо New (не edit) -> повний reset до дефолтів
   * - якщо Edit -> підтягуємо з optionsJson
   */
  useEffect(() => {
    if (!showVishichka) return;

    setError(null);

    if (!isEdit) {
      setCount(DEFAULTS.count);
      setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setLamination(DEFAULTS.lamination);
      setVishichkaSafe(DEFAULTS.vishichka);
      setPlivkaMontajna(DEFAULTS.plivkaMontajna);
      setBig(DEFAULTS.big);
      setCute(DEFAULTS.cute);
      setCuteLocal(DEFAULTS.cuteLocal);
      setHoles(DEFAULTS.holes);
      setHolesR(DEFAULTS.holesR);
      setSelectedService("Наліпки");
      setPricesThis({
        priceDrukPerSheet: 0, pricePaperPerSheet: 0,
        priceVishichkaPerSheet: 0, pricePlivkaPerSheet: 0,
        priceLaminationPerSheet: 0, totalVishichkaPrice: 0,
        totalPlivkaPrice: 0, sheetCount: 0, sheetsPerUnit: 0,
        price: 0, priceForItemWithExtras: 0,
      });
      return;
    }

    // EDIT
    const opt = options || null;

    setCount(safeNum(opt?.count, safeNum(editingOrderUnit?.amount, DEFAULTS.count)) || DEFAULTS.count);

    setSize({
      x: safeNum(opt?.size?.x, safeNum(editingOrderUnit?.newField2, DEFAULTS.size.x)),
      y: safeNum(opt?.size?.y, safeNum(editingOrderUnit?.newField3, DEFAULTS.size.y)),
    });

    setMaterial({
      type: opt?.material?.type ?? DEFAULTS.material.type,
      thickness: opt?.material?.thickness ?? DEFAULTS.material.thickness,
      material: opt?.material?.material ?? DEFAULTS.material.material,
      materialId: opt?.material?.materialId ?? DEFAULTS.material.materialId,
      typeUse: opt?.material?.typeUse ?? DEFAULTS.material.typeUse,
      a: opt?.material?.a ?? DEFAULTS.material.a,
    });

    setColor({
      sides: opt?.color?.sides ?? DEFAULTS.color.sides,
      one: opt?.color?.one ?? DEFAULTS.color.one,
      two: opt?.color?.two ?? DEFAULTS.color.two,
      allSidesColor: opt?.color?.allSidesColor ?? DEFAULTS.color.allSidesColor,
    });

    setLamination({
      type: opt?.lamination?.type ?? DEFAULTS.lamination.type,
      material: opt?.lamination?.material ?? DEFAULTS.lamination.material,
      materialId: opt?.lamination?.materialId ?? DEFAULTS.lamination.materialId,
      size: opt?.lamination?.size ?? DEFAULTS.lamination.size,
      typeUse: opt?.lamination?.typeUse ?? DEFAULTS.lamination.typeUse,
    });

    setVishichkaSafe({
      type: opt?.vishichka?.type ?? DEFAULTS.vishichka.type,
      thickness: opt?.vishichka?.thickness ?? DEFAULTS.vishichka.thickness,
      material: opt?.vishichka?.material ?? DEFAULTS.vishichka.material,
      materialId: opt?.vishichka?.materialId ?? DEFAULTS.vishichka.materialId,
      typeUse: opt?.vishichka?.typeUse ?? DEFAULTS.vishichka.typeUse,
    });

    setPlivkaMontajna({
      type: opt?.plivkaMontajna?.type ?? DEFAULTS.plivkaMontajna.type,
      thickness: opt?.plivkaMontajna?.thickness ?? DEFAULTS.plivkaMontajna.thickness,
      material: opt?.plivkaMontajna?.material ?? DEFAULTS.plivkaMontajna.material,
      materialId: opt?.plivkaMontajna?.materialId ?? DEFAULTS.plivkaMontajna.materialId,
      typeUse: opt?.plivkaMontajna?.typeUse ?? DEFAULTS.plivkaMontajna.typeUse,
    });

    setBig(opt?.big ?? DEFAULTS.big);
    setCute(opt?.cute ?? DEFAULTS.cute);

    setCuteLocal({
      leftTop: opt?.cuteLocal?.leftTop ?? DEFAULTS.cuteLocal.leftTop,
      rightTop: opt?.cuteLocal?.rightTop ?? DEFAULTS.cuteLocal.rightTop,
      rightBottom: opt?.cuteLocal?.rightBottom ?? DEFAULTS.cuteLocal.rightBottom,
      leftBottom: opt?.cuteLocal?.leftBottom ?? DEFAULTS.cuteLocal.leftBottom,
      radius: opt?.cuteLocal?.radius ?? DEFAULTS.cuteLocal.radius,
    });

    setHoles(opt?.holes ?? DEFAULTS.holes);
    setHolesR(opt?.holesR ?? DEFAULTS.holesR);
    setPricesThis({
      priceDrukPerSheet: 0, pricePaperPerSheet: 0,
      priceVishichkaPerSheet: 0, pricePlivkaPerSheet: 0,
      priceLaminationPerSheet: 0, totalVishichkaPrice: 0,
      totalPlivkaPrice: 0, sheetCount: 0, sheetsPerUnit: 0,
      price: 0, priceForItemWithExtras: 0,
    });
  }, [showVishichka, isEdit, options, editingOrderUnit, setVishichkaSafe]);

  // CATALOG PRICES (для Materials2 / Size / інше)
  useEffect(() => {
    axios
      .get(`/getpricesNew`)
      .then((res) => {
        const data = res?.data;
        const arr = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
        setPrices(arr);
      })
      .catch((err) => {
        if (err?.response?.status === 403) navigate("/login");
        console.log(err?.message);
      });
  }, [navigate]);

  // PRICING
  useEffect(() => {
    if (!showVishichka) return;

    const dataToSend = {
      type: "Vishichka",
      size,
      material,
      color,
      lamination,
      big,
      cute,
      cuteLocal,
      holes,
      holesR,
      count,
      vishichka,
      plivkaMontajna,
    };

    axios
      .post(`/calc/pricing`, dataToSend)
      .then((response) => {
        const p = response?.data?.prices ?? null;
        setPricesThis(p);

        // ✅ підтягнути materialId висічки з pricing, але без зациклення
        const selectedV = p?.selectedVishichka;

        if (selectedV?.id) {
          setVishichka((prev) => {
            const prevId = prev?.materialId ? String(prev.materialId) : "";
            const nextId = String(selectedV.id);

            const shouldSetId = !prevId || prevId === "0";
            const shouldSetLabel = !prev?.material;

            if (!shouldSetId && !shouldSetLabel) return prev;

            const next = {
              ...prev,
              materialId: shouldSetId ? selectedV.id : prev.materialId,
              // label не перетираємо, якщо вже є
              material: shouldSetLabel ? (selectedV.name || prev.material) : prev.material,
              type: prev?.type || selectedV.type || "vishichka",
              typeUse: prev?.typeUse || selectedV.typeUse || prev?.typeUse,
            };
            return normalizeVishichkaByLabel(next);
          });
        }
      })
      .catch((err) => {
        if (err?.response?.status === 403) navigate("/login");
        console.log(err?.message);
      });
  }, [
    showVishichka,
    size,
    material,
    color,
    lamination,
    big,
    cute,
    cuteLocal,
    holes,
    holesR,
    count,
    vishichka,
    plivkaMontajna,
    navigate,
  ]);

  // SAVE
  const addNewOrderUnit = () => {
    const v = normalizeVishichkaByLabel(vishichka);

    if (!v?.material || !v?.typeUse) {
      setError({ response: { data: { error: "Оберіть тип плотерної порізки" } } });
      return;
    }

    if (!v?.materialId) {
      setError({
        response: {
          data: {
            error:
              "Не вдалося визначити ID висічки (materialId). Перемкніть тип висічки або оновіть сторінку.",
          },
        },
      });
      return;
    }

    const nameOrderUnit = selectedService ? `${selectedService.toLowerCase()} ` : "";

    const dataToSend = {
      orderId: thisOrder?.id,
      toCalc: {
        nameOrderUnit,
        type: "Vishichka",
        size,
        material,
        color,
        lamination,
        big,
        cute,
        cuteLocal,
        holes,
        holesR,
        count,
        vishichka: v,
        plivkaMontajna,
      },
    };

    axios
      .post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then((response) => {
        setThisOrder(response.data);
        setSelectedThings2(response.data?.OrderUnits || []);
        setShowVishichka(false);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        if (err?.response?.status === 403) navigate("/login");
        console.log(err?.message);
      });
  };

  /* ===================== PRICING DATA ===================== */

  const sc = pricesThis?.sheetCount || 0;

  const pricingLines = [
    { label: "Друк", perUnit: pricesThis?.priceDrukPerSheet, count: sc, total: (pricesThis?.priceDrukPerSheet || 0) * sc },
    { label: "Матеріали", perUnit: pricesThis?.pricePaperPerSheet, count: sc, total: (pricesThis?.pricePaperPerSheet || 0) * sc },
    { label: "Висічка", perUnit: pricesThis?.priceVishichkaPerSheet, count: sc, total: pricesThis?.totalVishichkaPrice || 0 },
    { label: "Монтажка + вибірка", perUnit: pricesThis?.pricePlivkaPerSheet, count: sc, total: pricesThis?.totalPlivkaPrice || 0 },
    { label: "Ламінація", perUnit: pricesThis?.priceLaminationPerSheet, count: sc, total: (pricesThis?.priceLaminationPerSheet || 0) * sc },
  ];

  const pricingExtras = [
    { label: "За 1 виріб", value: `${fmt2(pricesThis?.priceForItemWithExtras || 0)} грн` },
    { label: "На аркуші", value: `${pricesThis?.sheetsPerUnit || 0} шт` },
    { label: "Аркушів", value: `${sc} шт` },
  ];

  if (!showVishichka) return null;

  return (
    <ScModal
      show={showVishichka}
      onClose={handleClose}
      modalStyle={{ width: "44.5vw" }}
      rightContent={
        <>
          {pricesThis && (
            <ScPricing
              lines={pricingLines}
              totalPrice={pricesThis.price || 0}
              extras={pricingExtras}
              fmt={fmt2}
            />
          )}
          <ScAddButton onClick={addNewOrderUnit} isEdit={isEdit} />
        </>
      }
      tabsContent={
        <ScTabs
          services={services}
          selectedService={selectedService}
          onSelect={setSelectedService}
          isEditServices={isEditServices}
          setIsEditServices={setIsEditServices}
          onAddService={() => {
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
          onRemoveService={(service) => {
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
        />
      }
      errorContent={
        typeof error === "string"
          ? <div className="sc-error">{error}</div>
          : error?.response?.data?.error
            ? <div className="sc-error">{error.response.data.error}</div>
            : null
      }
    >
      {/* 1. Кількість + Розмір */}
      <ScCountSize
        count={count}
        onCountChange={handleChangeCount}
        sizeComponent={
          <NewNoModalSize
            size={size}
            setSize={setSize}
            prices={prices}
            type="Vishichka"
            buttonsArr={[]}
            color={color}
            setColor={setColor}
            count={count}
            setCount={setCount}
            defaultt="А3 (297 х 420 мм)"
          />
        }
      />

      {/* 2. Сторонність */}
      <ScSides
        value={color.sides}
        onChange={(sides) => setColor({ ...color, sides })}
        options={[
          { value: "односторонній", label: "Односторонній" },
          { value: "двосторонній", label: "Двосторонній" },
          { value: "Не потрібно", label: "Без друку" },
        ]}
      />

      {/* 3. Матеріал */}
      <ScSection style={{ position: "relative", zIndex: 60 }}>
        <Materials2
          material={material}
          setMaterial={setMaterial}
          count={count}
          setCount={setCount}
          prices={prices}
          size={size}
          selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
          name="Чорно-білий друк на монохромному принтері:"
          buttonsArr={["Тонкий", "Середній", "Цупкий", "Самоклеючі"]}
          typeUse={null}
          editingOrderUnit={editingOrderUnit}
        />
      </ScSection>

      {/* 4. Плотерна порізка */}
      <ScSection style={{ position: "relative", zIndex: 50, marginTop: 0 }}>
        <div className="sc-row d-flex flex-row">
          {[
            { key: "SHEET_CUT", label: "Висічка" },
            { key: "STICKERPACK", label: "Стікерпак" },
            { key: "SINGLE_ITEMS", label: "Порізка" },
          ].map((btn) => (
            <button
              key={btn.key}
              className={`buttonsArtem${vishichka.typeUse === VISHICHKA_MAP[btn.key].typeUse ? " buttonsArtemActive" : ""}`}
              onClick={() =>
                setVishichkaSafe({
                  ...vishichka,
                  material: VISHICHKA_MAP[btn.key].label,
                  typeUse: VISHICHKA_MAP[btn.key].typeUse,
                  type: "vishichka",
                  materialId: "",
                })
              }
            >
              <div>{btn.label}</div>
            </button>
          ))}
        </div>
      </ScSection>

      {/* 5. Монтажна плівка */}
      <ScSection style={{ position: "relative", zIndex: 40, marginTop: 0 }}>
        <PlivkaMontajna
          size={size}
          plivkaMontajna={plivkaMontajna}
          setPlivkaMontajna={setPlivkaMontajna}
          vishichka={vishichka}
          setVishichka={setVishichkaSafe}
          prices={prices}
          buttonsArr={[
            VISHICHKA_MAP.SHEET_CUT.label,
            VISHICHKA_MAP.STICKERPACK.label,
            VISHICHKA_MAP.SINGLE_ITEMS.label,
          ]}
        />
      </ScSection>

      {/* 6. Ламінування */}
      <ScToggleSection
        label="Ламінування"
        isOn={lamination.type !== "Не потрібно"}
        onToggle={() => {
          if (lamination.type === "Не потрібно") {
            setLamination({
              ...lamination,
              type: "з глянцевим ламінуванням",
              material: "з глянцевим ламінуванням",
              materialId: "",
              size: "",
              typeUse: "А3",
            });
          } else {
            setLamination({
              type: "Не потрібно",
              material: "",
              materialId: "",
              size: "",
              typeUse: "А3",
            });
          }
        }}
        style={{ position: "relative", zIndex: 30 }}
      >
        <NewNoModalLamination
          lamination={lamination}
          setLamination={setLamination}
          prices={prices}
          size={size}
          type="SheetCut"
          isVishichka={true}
          buttonsArr={[
            "з глянцевим ламінуванням",
            "з матовим ламінуванням",
            "з ламінуванням SoftTouch",
            "з холодним матовим ламінуванням",
          ]}
          selectArr={["30", "70", "80", "100", "125", "250"]}
          labelMap={{
            "з глянцевим ламінуванням": "глянцеве",
            "з матовим ламінуванням": "матове",
            "з ламінуванням SoftTouch": "SoftTouch",
            "з холодним матовим ламінуванням": "холодне матове",
          }}
        />
      </ScToggleSection>
    </ScModal>
  );
};

export default Vishichka;
