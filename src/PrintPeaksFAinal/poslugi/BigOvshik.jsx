import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import { ScModal, ScSection, ScToggleSection, ScPricing, ScAddButton } from "./shared";
import { useModalState, useOrderUnitSave } from "./shared/hooks";
import "./Poslugy.css";

// Import existing postpress components
import NewNoModalCornerRounding from "./newnomodals/NewNoModalBig";
import NewNoModalCute from "./newnomodals/NewNoModalCute";
import NewNoModalHoles from "./newnomodals/NewNoModalHoles";
import NewNoModalProkleyka from "./newnomodals/NewNoModalProkleyka";
import NewNoModalLyuversy from "./newnomodals/NewNoModalLyuversy";

// ========== HELPERS ==========
const emptyPrice = { pricePerUnit: 0, count: 0, totalPrice: 0 };

const normalize = (obj = {}) => ({
  pricePerUnit: Number(obj.pricePerUnit) || 0,
  count: Number(obj.count) || 0,
  totalPrice: Number(obj.totalPrice) || 0,
});

const fmt2 = (v) =>
  new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v));

function safeNum(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// ========== DEFAULTS ==========
const DEFAULTS = {
  size: { x: 297, y: 420 },
  material: { type: "Не потрібно", material: "", materialId: "", size: "" },
  color: { sides: "Не потрібно", one: "", two: "", allSidesColor: "CMYK" },
  count: 1,
  big: "Не потрібно",
  prokleyka: "Не потрібно",
  lyuversy: "Не потрібно",
  cute: "Не потрібно",
  holes: "Не потрібно",
  holesR: "",
  cuteLocal: {
    leftTop: false,
    rightTop: false,
    rightBottom: false,
    leftBottom: false,
    radius: "",
  },
  design: "Не потрібно",
  lamination: { type: "Не потрібно", material: "", materialId: "", size: "" },
};

const BigOvshik = ({
  thisOrder,
  setThisOrder,
  showBigOvshik,
  setSelectedThings2,
  setShowBigOvshik,
  editingOrderUnit,
  setEditingOrderUnit,
}) => {
  const navigate = useNavigate();

  // Modal state detection
  const { isEdit, options } = useModalState(editingOrderUnit, showBigOvshik);

  // ========== STATE ==========
  const [size, setSize] = useState(DEFAULTS.size);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [color, setColor] = useState(DEFAULTS.color);
  const [count, setCount] = useState(DEFAULTS.count);

  const [big, setBig] = useState(DEFAULTS.big);
  const [prokleyka, setProkleyka] = useState(DEFAULTS.prokleyka);
  const [lyuversy, setLyuversy] = useState(DEFAULTS.lyuversy);
  const [cute, setCute] = useState(DEFAULTS.cute);
  const [cuteLocal, setCuteLocal] = useState(DEFAULTS.cuteLocal);
  const [holes, setHoles] = useState(DEFAULTS.holes);
  const [holesR, setHolesR] = useState(DEFAULTS.holesR);
  const [design, setDesign] = useState(DEFAULTS.design);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);

  const [error, setError] = useState(null);

  // Pricing state
  const [pricesThis, setPricesThis] = useState({
    big: emptyPrice,
    prokleyka: emptyPrice,
    lamination: emptyPrice,
    lyuversy: emptyPrice,
    cute: emptyPrice,
    holes: emptyPrice,
    priceLaminationPerSheet: 0,
    sheetCount: 0,
    design: { pricePerUnit: 0, totalPrice: 0 },
  });

  // Save hook
  const { saveOrderUnit } = useOrderUnitSave(
    thisOrder,
    setThisOrder,
    setSelectedThings2,
    () => setShowBigOvshik(false),
    setEditingOrderUnit
  );

  // ========== CLOSE ==========
  const handleClose = () => {
    if (setEditingOrderUnit) setEditingOrderUnit(null);
    setShowBigOvshik(false);
  };

  // ========== RESET/HYDRATE ==========
  const resetToDefaults = useCallback(() => {
    setSize(DEFAULTS.size);
    setMaterial(DEFAULTS.material);
    setColor(DEFAULTS.color);
    setCount(DEFAULTS.count);
    setBig(DEFAULTS.big);
    setProkleyka(DEFAULTS.prokleyka);
    setLyuversy(DEFAULTS.lyuversy);
    setCute(DEFAULTS.cute);
    setCuteLocal(DEFAULTS.cuteLocal);
    setHoles(DEFAULTS.holes);
    setHolesR(DEFAULTS.holesR);
    setDesign(DEFAULTS.design);
    setLamination(DEFAULTS.lamination);
    setError(null);
  }, []);

  const hydrateFromEditUnit = useCallback(() => {
    if (!options) {
      resetToDefaults();
      if (editingOrderUnit?.amount) setCount(safeNum(editingOrderUnit.amount, 1));
      return;
    }

    setSize(options?.size ?? DEFAULTS.size);
    setMaterial(options?.material ?? DEFAULTS.material);
    setColor(options?.color ?? DEFAULTS.color);
    setCount(
      safeNum(options?.count, NaN) ||
      (editingOrderUnit?.amount ? safeNum(editingOrderUnit.amount, 1) : DEFAULTS.count)
    );
    setBig(options?.big ?? DEFAULTS.big);
    setProkleyka(options?.prokleyka ?? DEFAULTS.prokleyka);
    setLyuversy(options?.lyuversy ?? DEFAULTS.lyuversy);
    setCute(options?.cute ?? DEFAULTS.cute);
    setCuteLocal(options?.cuteLocal ?? DEFAULTS.cuteLocal);
    setHoles(options?.holes ?? DEFAULTS.holes);
    setHolesR(options?.holesR ?? DEFAULTS.holesR);
    setDesign(options?.design ?? DEFAULTS.design);
    setLamination(options?.lamination ?? DEFAULTS.lamination);
    setError(null);
  }, [options, editingOrderUnit, resetToDefaults]);

  // Initialize when modal opens
  useEffect(() => {
    if (!showBigOvshik) return;
    if (isEdit) hydrateFromEditUnit();
    else resetToDefaults();
  }, [showBigOvshik, isEdit, hydrateFromEditUnit, resetToDefaults]);

  // Update design pricing locally
  useEffect(() => {
    const v = design === "Не потрібно" ? 0 : Number(design) || 0;
    setPricesThis((prev) => ({
      ...prev,
      design: { pricePerUnit: v, totalPrice: v },
    }));
  }, [design]);

  // Fetch pricing
  useEffect(() => {
    if (!showBigOvshik) return;

    const dataToSend = {
      type: "BigOvshik",
      size,
      material,
      color,
      big,
      lamination,
      prokleyka,
      lyuversy,
      cute,
      cuteLocal,
      holes,
      holesR,
      count,
      design,
    };

    axios
      .post("/calc/pricing", dataToSend)
      .then(({ data }) => {
        const p = data?.prices ?? {};
        setPricesThis((prev) => ({
          ...prev,
          big: normalize(p.big),
          prokleyka: normalize(p.prokleyka),
          lamination: normalize(p.lamination),
          lyuversy: normalize(p.lyuversy),
          cute: normalize(p.cute),
          holes: normalize(p.holes),
          priceLaminationPerSheet: Number(p.priceLaminationPerSheet) || 0,
          sheetCount: Number(p.sheetCount) || 0,
          design: prev.design,
        }));
      })
      .catch((err) => {
        if (err?.response?.status === 403) navigate("/login");
      });
  }, [size, material, color, big, lamination, prokleyka, lyuversy, cute, cuteLocal, holes, holesR, count, design, showBigOvshik, navigate]);

  // Total price calculation
  const totalPriceFull = useMemo(() => {
    const laminationCost =
      pricesThis.priceLaminationPerSheet && pricesThis.sheetCount
        ? pricesThis.priceLaminationPerSheet * pricesThis.sheetCount
        : pricesThis.lamination.totalPrice;

    return (
      laminationCost +
      pricesThis.big.totalPrice +
      pricesThis.prokleyka.totalPrice +
      pricesThis.lyuversy.totalPrice +
      pricesThis.cute.totalPrice +
      pricesThis.holes.totalPrice +
      pricesThis.design.totalPrice
    );
  }, [pricesThis]);

  // Save handler
  const handleSave = () => {
    if (!thisOrder?.id) return;

    const nameOrderUnit =
      [
        design !== "Не потрібно" ? "Дизайн" : null,
        prokleyka !== "Не потрібно" ? "Проклейка" : null,
        lyuversy !== "Не потрібно" ? "Люверси" : null,
        big !== "Не потрібно" ? "Згинання" : null,
        cute !== "Не потрібно" ? "Скруглення" : null,
        holes !== "Не потрібно" ? "Свердління" : null,
      ]
        .filter(Boolean)
        .join(", ") || "Постпресс";

    const toCalcData = {
      nameOrderUnit,
      type: "BigOvshik",
      size,
      material,
      color,
      lamination,
      big,
      prokleyka,
      lyuversy,
      cute,
      cuteLocal,
      holes,
      holesR,
      design,
      count,
      window: "наліпки",
    };

    saveOrderUnit(toCalcData, editingOrderUnit, setError);
  };

  // ========== PRICING DATA ==========
  const pricingLines = [
    {
      label: "Ламінація",
      perUnit: pricesThis.priceLaminationPerSheet,
      count: pricesThis.sheetCount,
      total: (pricesThis.priceLaminationPerSheet || 0) * (pricesThis.sheetCount || 0),
    },
    { label: "Згинання", perUnit: pricesThis.big.pricePerUnit, count: pricesThis.big.count, total: pricesThis.big.totalPrice },
    { label: "Проклейка", perUnit: pricesThis.prokleyka.pricePerUnit, count: pricesThis.prokleyka.count, total: pricesThis.prokleyka.totalPrice },
    { label: "Люверси", perUnit: pricesThis.lyuversy.pricePerUnit, count: pricesThis.lyuversy.count, total: pricesThis.lyuversy.totalPrice },
    { label: "Скруглення", perUnit: pricesThis.cute.pricePerUnit, count: pricesThis.cute.count, total: pricesThis.cute.totalPrice },
    { label: "Свердління", perUnit: pricesThis.holes.pricePerUnit, count: pricesThis.holes.count, total: pricesThis.holes.totalPrice },
  ];

  const pricingSimpleLines = design !== "Не потрібно"
    ? [{ label: "Дизайн", value: pricesThis.design.totalPrice }]
    : [];

  // ========== RENDER ==========
  return (
    <ScModal
      show={showBigOvshik}
      onClose={handleClose}
      modalStyle={{ width: "40vw" }}
      rightContent={
        <>
          <ScPricing
            lines={pricingLines}
            simpleLines={pricingSimpleLines}
            totalPrice={totalPriceFull}
            fmt={fmt2}
          />
          <ScAddButton onClick={handleSave} isEdit={isEdit} />
        </>
      }
      errorContent={
        error && (
          <div className="sc-error">
            {error?.response?.data?.error || (typeof error === "string" ? error : "Помилка")}
          </div>
        )
      }
    >
      {/* 1. Кількість */}
      <ScSection title="">
        <div className="d-flex flex-row align-items-center">
          <input
            className="inputsArtem"
            type="number"
            min={1}
            value={count}
            onChange={(e) => setCount(Math.max(1, +e.target.value || 1))}
          />
          <div className="inputsArtemx">шт</div>
        </div>
      </ScSection>

      {/* 2. Згинання */}
      <ScToggleSection
        label="Згинання"
        title="Згинання"
        isOn={big !== "Не потрібно"}
        onToggle={() => big === "Не потрібно" ? setBig("1") : setBig("Не потрібно")}
        style={{ position: "relative", zIndex: 60 }}
      >
        <NewNoModalCornerRounding
          big={big} setBig={setBig}
          type="SheetCut" buttonsArr={[]}
          selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
        />
      </ScToggleSection>

      {/* 3. Проклейка */}
      <ScToggleSection
        label="Проклейка"
        title="Проклейка"
        isOn={prokleyka !== "Не потрібно"}
        onToggle={() => prokleyka === "Не потрібно" ? setProkleyka("1") : setProkleyka("Не потрібно")}
        style={{ position: "relative", zIndex: 50 }}
      >
        <NewNoModalProkleyka
          prokleyka={prokleyka} setProkleyka={setProkleyka}
          type="SheetCut" buttonsArr={[]}
          selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
        />
      </ScToggleSection>

      {/* 4. Люверси */}
      <ScToggleSection
        label="Люверси"
        title="Люверси"
        isOn={lyuversy !== "Не потрібно"}
        onToggle={() => lyuversy === "Не потрібно" ? setLyuversy("1") : setLyuversy("Не потрібно")}
        style={{ position: "relative", zIndex: 40 }}
      >
        <NewNoModalLyuversy
          lyuversy={lyuversy} setLyuversy={setLyuversy}
          type="SheetCut" buttonsArr={[]}
          selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
        />
      </ScToggleSection>

      {/* 5. Скруглення кутів */}
      <ScToggleSection
        label="Скруглення"
        title="Скруглення кутів"
        isOn={cute !== "Не потрібно"}
        onToggle={() => {
          if (cute === "Не потрібно") {
            setCute(4);
            setCuteLocal({ leftTop: true, rightTop: true, rightBottom: true, leftBottom: true, radius: "6" });
          } else {
            setCute("Не потрібно");
            setCuteLocal({ leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" });
          }
        }}
        style={{ position: "relative", zIndex: 30 }}
      >
        <NewNoModalCute
          cute={cute} setCute={setCute}
          cuteLocal={cuteLocal} setCuteLocal={setCuteLocal}
          type="SheetCut" selectArr={["3", "6", "8", "10", "13"]}
        />
      </ScToggleSection>

      {/* 6. Свердління отворів */}
      <ScToggleSection
        label="Свердління"
        title="Свердління отворів"
        isOn={holes !== "Не потрібно"}
        onToggle={() => {
          if (holes === "Не потрібно") { setHoles(1); setHolesR("5 мм"); }
          else { setHoles("Не потрібно"); setHolesR(""); }
        }}
        style={{ position: "relative", zIndex: 20 }}
      >
        <NewNoModalHoles
          holes={holes} setHoles={setHoles}
          holesR={holesR} setHolesR={setHolesR}
          type="SheetCut" buttonsArr={[]}
          selectArr={["", "3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
        />
      </ScToggleSection>

      {/* 7. Дизайн */}
      <ScToggleSection
        label="Дизайн"
        title="Дизайн"
        isOn={design !== "Не потрібно"}
        onToggle={() => setDesign(design === "Не потрібно" ? "0" : "Не потрібно")}
        style={{ position: "relative", zIndex: 10 }}
      >
        <div className="d-flex align-items-center">
          <input
            type="number"
            min={0}
            value={design}
            onChange={(e) => setDesign(e.target.value)}
            className="inputsArtem"
            style={{ width: "80px" }}
          />
          <span className="inputsArtemx">грн</span>
        </div>
      </ScToggleSection>

    </ScModal>
  );
};

export default BigOvshik;
