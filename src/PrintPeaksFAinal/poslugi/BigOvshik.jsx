import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import ServiceModalWrapper from "./shared/ServiceModalWrapper";
import CountInput from "./shared/CountInput";
import { useModalState, useOrderUnitSave } from "./shared/hooks";
import "./shared/ServiceModal.css";

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

  // ========== PRICING COMPONENT ==========
  const BigOvshikPrice = () => (
    <div className="bw-summary-title">
      <div className="bw-sticky">
        <div className="bwsubOP">Ламінація:</div>
        <div className="bw-calc-line">
          {fmt2(pricesThis.priceLaminationPerSheet)}
          <span className="bw-sub">грн</span>
          <span className="bw-op">×</span>
          {pricesThis.sheetCount}
          <span className="bw-sub">шт</span>
          <span className="bw-op">=</span>
          {fmt2(pricesThis.priceLaminationPerSheet * pricesThis.sheetCount)}
          <span className="bw-sub">грн</span>
        </div>

        <div className="bwsubOP">Згинання:</div>
        <div className="bw-calc-line">
          {fmt2(pricesThis.big.pricePerUnit)}
          <span className="bw-sub">грн</span>
          <span className="bw-op">×</span>
          {pricesThis.big.count}
          <span className="bw-op">=</span>
          {fmt2(pricesThis.big.totalPrice)}
          <span className="bw-sub">грн</span>
        </div>

        <div className="bwsubOP">Проклейка:</div>
        <div className="bw-calc-line">
          {fmt2(pricesThis.prokleyka.pricePerUnit)}
          <span className="bw-sub">грн</span>
          <span className="bw-op">×</span>
          {pricesThis.prokleyka.count}
          <span className="bw-op">=</span>
          {fmt2(pricesThis.prokleyka.totalPrice)}
          <span className="bw-sub">грн</span>
        </div>

        <div className="bwsubOP">Люверси:</div>
        <div className="bw-calc-line">
          {fmt2(pricesThis.lyuversy.pricePerUnit)}
          <span className="bw-sub">грн</span>
          <span className="bw-op">×</span>
          {pricesThis.lyuversy.count}
          <span className="bw-op">=</span>
          {fmt2(pricesThis.lyuversy.totalPrice)}
          <span className="bw-sub">грн</span>
        </div>

        <div className="bwsubOP">Скруглення:</div>
        <div className="bw-calc-line">
          {fmt2(pricesThis.cute.pricePerUnit)}
          <span className="bw-sub">грн</span>
          <span className="bw-op">×</span>
          {pricesThis.cute.count}
          <span className="bw-op">=</span>
          {fmt2(pricesThis.cute.totalPrice)}
          <span className="bw-sub">грн</span>
        </div>

        <div className="bwsubOP">Свердління:</div>
        <div className="bw-calc-line">
          {fmt2(pricesThis.holes.pricePerUnit)}
          <span className="bw-sub">грн</span>
          <span className="bw-op">×</span>
          {pricesThis.holes.count}
          <span className="bw-op">=</span>
          {fmt2(pricesThis.holes.totalPrice)}
          <span className="bw-sub">грн</span>
        </div>

        <div className="bwsubOP">Дизайн:</div>
        <div className="bw-calc-line">
          {fmt2(pricesThis.design.totalPrice)}
          <span className="bw-sub">грн</span>
        </div>

        <div
          className="bw-calc-total d-flex justify-content-center align-content-center"
          style={{ fontWeight: "500", color: "red" }}
        >
          {fmt2(totalPriceFull)}
          <span className="bw-sub">грн</span>
        </div>
      </div>
    </div>
  );

  // ========== LEFT CONTENT ==========
  const leftContent = (
    <>
      {/* Count */}
      <div className="bw-title">Кількість</div>
      <div className="bw-row">
        <CountInput count={count} setCount={setCount} />
      </div>

      {/* Zgynanna (Bending) */}
      <div className="bw-row" style={{ marginTop: "1vh" }}>
        <NewNoModalCornerRounding
          big={big}
          setBig={setBig}
          type="SheetCut"
          buttonsArr={[]}
          selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
        />
      </div>

      {/* Prokleyka */}
      <div className="bw-row">
        <NewNoModalProkleyka
          prokleyka={prokleyka}
          setProkleyka={setProkleyka}
          type="SheetCut"
          buttonsArr={[]}
          selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
        />
      </div>

      {/* Lyuversy */}
      <div className="bw-row">
        <NewNoModalLyuversy
          lyuversy={lyuversy}
          setLyuversy={setLyuversy}
          type="SheetCut"
          buttonsArr={[]}
          selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
        />
      </div>

      {/* Cute (Corner rounding) */}
      <div className="bw-row">
        <NewNoModalCute
          cute={cute}
          setCute={setCute}
          cuteLocal={cuteLocal}
          setCuteLocal={setCuteLocal}
          type="SheetCut"
          selectArr={["3", "6", "8", "10", "13"]}
        />
      </div>

      {/* Holes */}
      <div className="bw-row">
        <NewNoModalHoles
          holes={holes}
          setHoles={setHoles}
          holesR={holesR}
          setHolesR={setHolesR}
          type="SheetCut"
          selectArr={["", "3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
        />
      </div>

      {/* Design */}
      <div className="bw-row">
        <div className="d-flex flex-row allArtemElem">
          <label className="switch scale04ForButtonToggle" aria-label="Дизайн">
            <input
              type="checkbox"
              checked={design !== "Не потрібно"}
              onChange={() => setDesign(design === "Не потрібно" ? "0" : "Не потрібно")}
            />
            <span className="slider" />
          </label>

          <div className="PostpressNames">
            Дизайн:
            {design !== "Не потрібно" && (
              <div className="d-flex align-items-center">
                <input
                  type="number"
                  min={0}
                  value={design}
                  onChange={(e) => setDesign(e.target.value)}
                  className="d-flex inputsArtemNumber inputsArtem"
                  style={{ width: "80px", marginLeft: "8px" }}
                />
                <span className="inputsArtemx allArtemElem" style={{ marginLeft: "4px" }}>грн</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // ========== RIGHT CONTENT ==========
  const rightContent = <BigOvshikPrice />;

  // ========== BOTTOM CONTENT ==========
  const bottomContent = (
    <div className="bw-action">
      <button className="adminButtonAdd" onClick={handleSave}>
        {isEdit ? "Зберегти зміни" : "Додати до замовлення"}
      </button>
    </div>
  );

  // ========== RENDER ==========
  return (
    <ServiceModalWrapper
      show={showBigOvshik}
      onClose={() => setShowBigOvshik(false)}
      leftContent={leftContent}
      rightContent={rightContent}
      bottomContent={bottomContent}
      error={error?.response?.data?.error || (typeof error === "string" ? error : null)}
      className="service-wide"
      setEditingOrderUnit={setEditingOrderUnit}
    />
  );
};

export default BigOvshik;
