import React, { useEffect, useState, useCallback } from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import { ScModal, ScSection, ScPricing, ScAddButton } from "./shared";
import { useModalState, useOrderUnitSave } from "./shared/hooks";
import "./Poslugy.css";

import PerepletSize from "./newnomodals/PerepletSize";
import PerepletPereplet from "./newnomodals/PerepletPereplet";

const fmt2 = (v) =>
  new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v));

const PerepletMet = ({
  thisOrder,
  setThisOrder,
  setSelectedThings2,
  setShowPerepletMet,
  showPerepletMet,
  editingOrderUnit,
  setEditingOrderUnit,
}) => {
  const navigate = useNavigate();
  const { isEdit, options } = useModalState(editingOrderUnit, showPerepletMet);

  // ========== STATE ==========
  const [size, setSize] = useState({ x: 210, y: 297 });
  const [material, setMaterial] = useState({ type: "Не потрібно", thickness: "Тонкі", material: "", materialId: "", typeUse: null });
  const [pereplet, setPereplet] = useState({ type: "", thickness: "Тонкі", material: "", materialId: "", size: "<120", typeUse: "Брошурування до 120 аркушів" });
  const [color, setColor] = useState({ sides: "Не потрібно", one: "", two: "", allSidesColor: "CMYK" });
  const [lamination, setLamination] = useState({ type: "Не потрібно", material: "", materialId: "", size: "" });
  const [big, setBig] = useState("Не потрібно");
  const [cute, setCute] = useState("Не потрібно");
  const [cuteLocal, setCuteLocal] = useState({ leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" });
  const [holes, setHoles] = useState("Не потрібно");
  const [holesR, setHolesR] = useState("");
  const [count, setCount] = useState(1);
  const [prices] = useState([]);
  const [pricesThis, setPricesThis] = useState(null);
  const [error, setError] = useState(null);

  // Save hook
  const { saveOrderUnit } = useOrderUnitSave(
    thisOrder,
    setThisOrder,
    setSelectedThings2,
    () => setShowPerepletMet(false),
    setEditingOrderUnit
  );

  const handleClose = () => {
    if (setEditingOrderUnit) setEditingOrderUnit(null);
    setShowPerepletMet(false);
  };

  // ========== RESET / HYDRATE ==========
  const resetDefaults = useCallback(() => {
    setSize({ x: 210, y: 297 });
    setMaterial({ type: "Не потрібно", thickness: "Тонкі", material: "", materialId: "", typeUse: null });
    setPereplet({ type: "", thickness: "Тонкі", material: "", materialId: "", size: "<120", typeUse: "Брошурування до 120 аркушів" });
    setColor({ sides: "Не потрібно", one: "", two: "", allSidesColor: "CMYK" });
    setLamination({ type: "Не потрібно", material: "", materialId: "", size: "" });
    setBig("Не потрібно");
    setCute("Не потрібно");
    setCuteLocal({ leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" });
    setHoles("Не потрібно");
    setHolesR("");
    setCount(1);
    setError(null);
  }, []);

  useEffect(() => {
    if (!showPerepletMet) return;
    if (!isEdit) { resetDefaults(); return; }

    const opt = options || {};
    if (opt.size) setSize(opt.size);
    if (opt.material) setMaterial(opt.material);
    if (opt.pereplet) setPereplet(opt.pereplet);
    if (opt.color) setColor(opt.color);
    if (opt.lamination) setLamination(opt.lamination);
    if (opt.big !== undefined) setBig(opt.big);
    if (opt.cute !== undefined) setCute(opt.cute);
    if (opt.cuteLocal) setCuteLocal(opt.cuteLocal);
    if (opt.holes !== undefined) setHoles(opt.holes);
    if (opt.holesR !== undefined) setHolesR(opt.holesR);
    setCount(Number(opt.count ?? editingOrderUnit?.amount ?? 1) || 1);
    setError(null);
  }, [showPerepletMet, isEdit, options, editingOrderUnit, resetDefaults]);

  // ========== PRICING ==========
  useEffect(() => {
    if (!showPerepletMet) return;
    axios
      .post("/calc/pricing", {
        type: "PerepletMet", size, material, color, lamination,
        big, cute, cuteLocal, holes, holesR, count, pereplet,
      })
      .then(({ data }) => { setPricesThis(data.prices); setError(null); })
      .catch((err) => {
        setError(err);
        if (err?.response?.status === 403) navigate("/login");
      });
  }, [showPerepletMet, size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count, pereplet, navigate]);

  // ========== SAVE ==========
  const handleSave = () => {
    if (!thisOrder?.id) return;
    const opt = options || {};

    saveOrderUnit({
      nameOrderUnit: opt?.nameOrderUnit || "Брошурування",
      type: "PerepletMet",
      size, material, color, lamination,
      big, cute, cuteLocal, holes, holesR, count, pereplet,
    }, editingOrderUnit, setError);
  };

  // ========== PRICING DATA ==========
  const perepletLabel = pereplet.material
    ? `Прошивка ${pereplet.material}`
    : "Прошивка";
  const pricingLines = pricesThis
    ? [{ label: perepletLabel, perUnit: pricesThis.priceForOneOfPereplet || 0, count, total: pricesThis.price || 0 }]
    : [];

  // ========== RENDER ==========
  return (
    <ScModal
      show={showPerepletMet}
      onClose={handleClose}
      modalStyle={{ width: "40vw" }}
      rightContent={
        <>
          <ScPricing
            lines={pricingLines}
            totalPrice={pricesThis?.price || 0}
            fmt={fmt2}
          />
          <ScAddButton onClick={handleSave} isEdit={isEdit} />
        </>
      }
      errorContent={
        error && (
          <div className="sc-error">
            {error?.response?.data?.error || error?.message || "Помилка"}
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

      {/* 2. Розмір */}
      <ScSection title="">
        <PerepletSize
          size={size} setSize={setSize}
          prices={prices} type="SheetCut"
          buttonsArr={["односторонній", "двосторонній"]}
          color={color} setColor={setColor}
          count={count} setCount={setCount}
          defaultt="А3 (297 х 420 мм)"
        />
      </ScSection>

      {/* 3. Переплет */}
      <ScSection title="">
        <PerepletPereplet
          size={size}
          pereplet={pereplet} setPereplet={setPereplet}
          prices={prices} type="SheetCut"
          buttonsArr={["Брошурування до 120 аркушів", "Брошурування від 120 до 280 аркушів"]}
          defaultt="А3 (297 х 420 мм)"
        />
      </ScSection>

    </ScModal>
  );
};

export default PerepletMet;
