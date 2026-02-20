import axios from '../../api/axiosInstance';
import React, { useEffect, useState, useMemo } from "react";
import NewNoModalSize from "./newnomodals/NewNoModalSize_colum";
import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import Materials2 from "./newnomodals/Materials2";

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

const DEFAULT_SIZE = { x: 210, y: 297 };

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
    type: "Не потрібно",
    material: "",
    materialId: "",
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
  const fmt2 = (v) =>
    new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(v) || 0);

  const [count, setCount] = useState(1);
  const [selectedService, setSelectedService] = useState("Документ");
  const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.idKey);
  const [size, setSize] = useState({ x: 210, y: 297 });

  const options = useMemo(
    () => parseOptionsJson(editingOrderUnit),
    [editingOrderUnit]
  );

  const [material, setMaterial] = useState(DEFAULTS.material);

  const [color, setColor] = useState(DEFAULTS.color);

  const [error, setError] = useState(null);
  const [pricesThis, setPricesThis] = useState({});
  const [isEditServices, setIsEditServices] = useState(false);

  const [lamination, setLamination] = useState(DEFAULTS.lamination);

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

  /* ===================== INIT MODAL (NEW/EDIT) ===================== */

  useEffect(() => {
    if (!showNewSheetCutBW) return;

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

    setLamination(opt?.lamination ?? DEFAULTS.lamination);

    const matched = services.find(
      (s) => s.toLowerCase() === savedName.toLowerCase()
    );
    setSelectedService(matched || services[0] || "");
    setError(null);
  }, [showNewSheetCutBW, isEdit, options, editingOrderUnit]);

  /* ===================== SAVE ===================== */

  const addNewOrderUnit = () => {
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
        count,
        big: "Не потрібно",
        cute: "Не потрібно",
        holes: "Не потрібно",
        prokleyka: "Не потрібно",
        lyuversy: "Не потрібно",
        design: "Не потрібно",
        porizka: false,
      },
    };

    axios
      .post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then((response) => {
        setThisOrder(response.data);
        setSelectedThings2(response.data.OrderUnits);
        setEditingOrderUnit(null);
        setShowNewSheetCutBW(false);
        setError(null);
      })
      .catch((err) => {
        setError(err);
      });
  };

  /* ===================== PRICING ===================== */

  useEffect(() => {
    if (!size) return;

    const dataToSend = {
      type: "SheetCutBW",
      size,
      material,
      color,
      lamination,
      count,
      big: "Не потрібно",
      cute: "Не потрібно",
      holes: "Не потрібно",
      prokleyka: "Не потрібно",
      lyuversy: "Не потрібно",
      design: "Не потрібно",
      porizka: false,
    };

    axios
      .post(`/calc/pricing`, dataToSend)
      .then((response) => {
        setPricesThis(response.data.prices);
        setError(null);
      })
      .catch((err) => {
        setError(err);
      });
  }, [
    size,
    material,
    color,
    lamination?.materialId,
    lamination?.type,
    count,
  ]);

  /* ===================== PRICING DATA ===================== */

  const sc = pricesThis.sheetCount || 0;

  const pricingLines = [
    { label: "Друк", perUnit: pricesThis.priceDrukPerSheet, count: sc, total: (pricesThis.priceDrukPerSheet || 0) * sc },
    { label: "Матеріали", perUnit: pricesThis.pricePaperPerSheet, count: sc, total: (pricesThis.pricePaperPerSheet || 0) * sc },
    { label: "Ламінація", perUnit: pricesThis.priceLaminationPerSheet, count: sc, total: (pricesThis.priceLaminationPerSheet || 0) * sc },
  ];

  const pricingExtras = [];

  const handleClose = () => {
    setEditingOrderUnit(null);
    setShowNewSheetCutBW(false);
  };

  /* ===================== RENDER ===================== */

  return (
    <ScModal
      show={showNewSheetCutBW}
      onClose={handleClose}
      modalStyle={{ width: "35vw" }}
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
      errorContent={
        typeof error === "string" ? (
          <div className="sc-error">{error}</div>
        ) : error?.response?.data?.error ? (
          <div className="sc-error">{error.response.data.error}</div>
        ) : null
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
            setServices((prev) => prev.filter((s) => s !== service));
            if (selectedService === service) {
              setSelectedService(services[0] || "");
            }
          }}
        />
      }
    >
      {/* 1. Кількість + Розмір */}
      <ScCountSize
        count={count}
        onCountChange={(v) => setCount(Number(v) || 1)}
        sizeComponent={
          <NewNoModalSize
            size={size}
            setSize={setSize}
            type="SheetCutBW"
            count={count}
            showSize={true}
            showSides={false}
            showCount={true}
          />
        }
      />

      {/* 2. Сторонність */}
      <ScSides
        value={color.sides}
        onChange={(sides) => setColor({ ...color, sides })}
      />

      {/* 3. Матеріал */}
      <ScSection style={{ position: "relative", zIndex: 60 }}>
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
      </ScSection>

      {/* 4. Ламінування */}
      <ScToggleSection
        label="Ламінування"
        title="Ламінування"
        isOn={lamination.type !== "Не потрібно"}
        onToggle={() => {
          if (lamination.type === "Не потрібно") {
            setLamination({ ...lamination, type: "з глянцевим ламінуванням", material: "з глянцевим ламінуванням", materialId: "", size: "", typeUse: "А3" });
          } else {
            setLamination({ type: "Не потрібно", material: "", materialId: "", size: "", typeUse: "А3" });
          }
        }}
        style={{ position: "relative", zIndex: 40 }}
      >
        <NewNoModalLamination
          lamination={lamination}
          setLamination={setLamination}
          prices={[]}
          size={size}
          type={"SheetCut"}
          buttonsArr={[
            "з глянцевим ламінуванням",
            "з матовим ламінуванням",
            "з ламінуванням SoftTouch",
          ]}
          selectArr={["30", "70", "80", "100", "125", "250"]}
          labelMap={{
            "з глянцевим ламінуванням": "глянцеве",
            "з матовим ламінуванням": "матове",
            "з ламінуванням SoftTouch": "SoftTouch",
          }}
        />
      </ScToggleSection>
    </ScModal>
  );
}
