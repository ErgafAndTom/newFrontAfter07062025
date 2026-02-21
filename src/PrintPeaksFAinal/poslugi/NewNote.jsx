import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { ScModal, ScSection, ScCountSize, ScPricing, ScAddButton, ScTabs } from "./shared";
import { useModalState, useModalPricing, useOrderUnitSave } from "./shared/hooks";

import NewNoModalSizeNote from "./newnomodals/note/NewNoModalSizeNote";
import Materials2NoteFront from "./newnomodals/note/Materials2NoteFront";
import Materials2NoteBack from "./newnomodals/note/Material2NoteBack";
import PerepletPereplet from "./newnomodals/PerepletPerepletNote";

// ========== DEFAULTS ==========
const SERVICES_NOTE = ["Блокнот", "Документ", "Щоденник", "Нотатник", "Книга", "Підручник", "Журнал", "Звіт", "Інструкція"];

const DEFAULTS = {
  size: { x: 148, y: 210 },
  materialAndDrukBody: {
    materialType: "Папір", materialTypeUse: "Офісний",
    drukColor: "Не потрібно", drukSides: "односторонній", drukId: "Не потрібно",
    thickness: "", material: "", materialId: "",
    laminationType: "Не потрібно", laminationTypeUse: "", laminationmaterial: "", laminationmaterialId: "",
    typeUse: "",
  },
  materialAndDrukInBody: {
    ColorDrukMaterialType: "Не потрібно", BwDrukMaterialType: "Не потрібно", NonDrukMaterialType: "Не потрібно",
    ColorDrukMaterialTypeUse: "Офісний", BwDrukMaterialTypeUse: "Офісний", NonDrukMaterialTypeUse: "Офісний",
    ColorDrukLaminationType: "Не потрібно", BwDrukLaminationType: "Не потрібно", NonDrukLaminationType: "Не потрібно",
    ColorDrukLaminationTypeUse: "з глянцевим ламінуванням", BwDrukLaminationTypeUse: "з глянцевим ламінуванням", NonDrukLaminationTypeUse: "з глянцевим ламінуванням",
    ColorDrukLaminationMaterial: "Не потрібно", BwDrukLaminationMaterial: "Не потрібно", NonDrukLaminationMaterial: "Не потрібно",
    ColorDrukLaminationMaterialId: "", BwDrukLaminationMaterialId: "", NonDrukLaminationMaterialId: "",
    ColorDrukMaterial: "", BwDrukMaterial: "", NonDrukMaterial: "",
    ColorDrukMaterialId: "", BwDrukMaterialId: "", NonDrukMaterialId: "",
    typeUse: "",
    colorCount: 1, bwCount: 1, nonCount: 1,
  },
  materialAndDrukFront: {
    materialType: "Папір", materialTypeUse: "Цупкий",
    drukColor: "Кольоровий", drukSides: "односторонній", drukId: "Не потрібно",
    thickness: "", material: "", materialId: "",
    laminationType: "Не потрібно", laminationTypeUse: "з глянцевим ламінуванням",
    laminationmaterial: "", laminationmaterialId: "",
    typeUse: "",
  },
  materialAndDrukBack: {
    materialType: "Папір", materialTypeUse: "Офісний",
    drukColor: "Не потрібно", drukSides: "односторонній", drukId: "Не потрібно",
    thickness: "", material: "Офісний папір А3", materialId: "",
    laminationType: "Не потрібно", laminationTypeUse: "з глянцевим ламінуванням",
    laminationmaterial: "", laminationmaterialId: "",
    typeUse: "",
    count: 50,
  },
  material: { type: "Не потрібно", thickness: "", material: "", materialId: "", typeUse: "" },
  color: { sides: "Не потрібно", one: "", two: "", allSidesColor: "CMYK" },
  lamination: { type: "Не потрібно", material: "", materialId: "", size: "" },
  pereplet: { type: "", thickness: "Тонкі", material: "", materialId: "", size: ">120", typeUse: "Брошурування до 120 аркушів" },
  count: 1,
  selectedService: "Блокнот",
};

const fmt2 = (v) =>
  new Intl.NumberFormat("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v) || 0);

// ========== COMPONENT ==========
const NewNote = ({
  thisOrder,
  setThisOrder,
  setSelectedThings2,
  showNewNote,
  setShowNewNote,
  editingOrderUnit,
  setEditingOrderUnit,
}) => {
  const navigate = useNavigate();

  // Modal state detection
  const { isEdit, options } = useModalState(editingOrderUnit, showNewNote);

  // ========== STATE ==========
  const [size, setSize] = useState(DEFAULTS.size);
  const [materialAndDrukBody, setMaterialAndDrukBody] = useState(DEFAULTS.materialAndDrukBody);
  const [materialAndDrukInBody, setMaterialAndDrukInBody] = useState(DEFAULTS.materialAndDrukInBody);
  const [materialAndDrukFront, setMaterialAndDrukFront] = useState(DEFAULTS.materialAndDrukFront);
  const [materialAndDrukBack, setMaterialAndDrukBack] = useState(DEFAULTS.materialAndDrukBack);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [color, setColor] = useState(DEFAULTS.color);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);
  const [big, setBig] = useState("Не потрібно");
  const [cute, setCute] = useState("Не потрібно");
  const [porizka, setPorizka] = useState({ type: "Не потрібно" });
  const [cuteLocal, setCuteLocal] = useState({ leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" });
  const [holes, setHoles] = useState("Не потрібно");
  const [holesR, setHolesR] = useState("");
  const [count, setCount] = useState(DEFAULTS.count);
  const [pereplet, setPereplet] = useState(DEFAULTS.pereplet);
  const [selectedService, setSelectedService] = useState(DEFAULTS.selectedService);
  const [services, setServices] = useState(SERVICES_NOTE);
  const [isEditServices, setIsEditServices] = useState(false);
  const [error, setError] = useState(null);

  // ========== PRICING HOOK ==========
  const calcData = useMemo(() => {
    const data = {
      size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count,
      pereplet, materialAndDrukFront, materialAndDrukInBody, materialAndDrukBack,
    };
    if (porizka.type !== "Не потрібно") data.porizka = porizka;
    return data;
  }, [size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count, porizka, materialAndDrukFront, materialAndDrukInBody, materialAndDrukBack, pereplet]);

  const { pricesThis } = useModalPricing("Note", calcData, showNewNote);

  // ========== SAVE HOOK ==========
  const { saveOrderUnit } = useOrderUnitSave(
    thisOrder, setThisOrder, setSelectedThings2,
    () => setShowNewNote(false),
    setEditingOrderUnit
  );

  const handleClose = () => {
    if (setEditingOrderUnit) setEditingOrderUnit(null);
    setShowNewNote(false);
  };

  // ========== EFFECTS ==========

  // Init / Edit mode
  useEffect(() => {
    if (!showNewNote) return;

    if (!isEdit) {
      setSize(DEFAULTS.size);
      setMaterialAndDrukBody(DEFAULTS.materialAndDrukBody);
      setMaterialAndDrukInBody(DEFAULTS.materialAndDrukInBody);
      setMaterialAndDrukFront(DEFAULTS.materialAndDrukFront);
      setMaterialAndDrukBack(DEFAULTS.materialAndDrukBack);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setLamination(DEFAULTS.lamination);
      setBig("Не потрібно");
      setCute("Не потрібно");
      setPorizka({ type: "Не потрібно" });
      setCuteLocal({ leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" });
      setHoles("Не потрібно");
      setHolesR("");
      setCount(DEFAULTS.count);
      setPereplet(DEFAULTS.pereplet);
      setSelectedService(DEFAULTS.selectedService);
      setError(null);
      return;
    }

    // EDIT mode
    const opt = options || {};
    const safeNum = (v, fb) => { const n = Number(v); return Number.isFinite(n) ? n : fb; };

    setCount(safeNum(opt?.count, safeNum(editingOrderUnit?.amount, DEFAULTS.count)) || DEFAULTS.count);
    if (opt?.size) setSize({ x: safeNum(opt.size.x, DEFAULTS.size.x), y: safeNum(opt.size.y, DEFAULTS.size.y) });
    if (opt?.materialAndDrukFront) setMaterialAndDrukFront(opt.materialAndDrukFront);
    if (opt?.materialAndDrukBack) setMaterialAndDrukBack(opt.materialAndDrukBack);
    if (opt?.materialAndDrukInBody) setMaterialAndDrukInBody(opt.materialAndDrukInBody);
    if (opt?.material) setMaterial(opt.material);
    if (opt?.color) setColor(opt.color);
    if (opt?.lamination) setLamination(opt.lamination);
    if (opt?.pereplet) setPereplet(opt.pereplet);
    if (opt?.big !== undefined) setBig(opt.big);
    if (opt?.cute !== undefined) setCute(opt.cute);
    if (opt?.cuteLocal) setCuteLocal(opt.cuteLocal);
    if (opt?.holes !== undefined) setHoles(opt.holes);
    if (opt?.holesR !== undefined) setHolesR(opt.holesR);
    if (opt?.porizka) setPorizka(opt.porizka);

    const svc = opt?.selectedService || editingOrderUnit?.newField1 || editingOrderUnit?.nameOrderUnit;
    if (svc) setSelectedService(svc.charAt(0).toUpperCase() + svc.slice(1).trim());

    setError(null);
  }, [showNewNote, isEdit, options, editingOrderUnit]);

  // Auto-calc pereplet size based on page count
  useEffect(() => {
    const allPapers = 2 + materialAndDrukBack.count;
    if (allPapers <= 120) {
      setPereplet((prev) => ({ ...prev, size: "<120", typeUse: "Брошурування до 120 аркушів" }));
    } else if (allPapers > 120 && allPapers <= 280) {
      setPereplet((prev) => ({ ...prev, size: ">120", typeUse: "Брошурування від 120 до 280 аркушів" }));
    } else {
      setPereplet((prev) => ({ ...prev, size: "", typeUse: "" }));
    }
  }, [materialAndDrukBack.count]);

  // ========== HANDLERS ==========

  const handleSave = () => {
    const toCalcData = {
      nameOrderUnit: `${selectedService.toLowerCase() ? selectedService.toLowerCase() + " " : ""}`,
      type: "Note",
      size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count,
      pereplet, materialAndDrukFront, materialAndDrukInBody, materialAndDrukBack,
    };
    if (porizka.type !== "Не потрібно") toCalcData.porizka = porizka;

    saveOrderUnit(toCalcData, editingOrderUnit, setError);
  };

  // ========== PRICING DATA ==========
  const sc = pricesThis?.sheetCount || 0;
  const scBack = pricesThis?.sheetCountBack || 0;

  const pricingLines = pricesThis
    ? [
        { label: "Обкладинка: Друк", perUnit: pricesThis.priceDrukFront, count: sc, total: (pricesThis.priceDrukFront || 0) * sc },
        { label: "Обкладинка: Матеріал", perUnit: pricesThis.priceMaterialFront, count: sc, total: (pricesThis.priceMaterialFront || 0) * sc },
        { label: "Обкладинка: Ламінація", perUnit: pricesThis.priceLaminationFront, count: sc, total: (pricesThis.priceLaminationFront || 0) * sc },
        { label: "Блок: Друк", perUnit: pricesThis.priceDrukBack, count: scBack, total: (pricesThis.priceDrukBack || 0) * scBack },
        { label: "Блок: Матеріал", perUnit: pricesThis.priceMaterialBack, count: scBack, total: (pricesThis.priceMaterialBack || 0) * scBack },
        { label: "Блок: Ламінація", perUnit: pricesThis.priceLaminationBack, count: scBack, total: (pricesThis.priceLaminationBack || 0) * scBack },
        { label: "Брошурування", perUnit: pricesThis.pricePerepletUnit, count, total: pricesThis.totalPerepletPrice || 0 },
      ]
    : [];

  const pricingExtras = pricesThis
    ? [
        { label: "За виріб", value: `${fmt2(pricesThis.priceForItemWithExtras)} грн` },
        { label: "Кратність", value: `${pricesThis.sheetsPerUnit || 0} шт` },
      ]
    : [];

  // ========== RENDER ==========
  return (
    <ScModal
      show={showNewNote}
      onClose={handleClose}
      modalStyle={{ width: "95vw" }}
      rightContent={
        <>
          {pricesThis && (
            <ScPricing
              lines={pricingLines}
              totalPrice={Number(pricesThis.price) || 0}
              extras={pricingExtras}
              fmt={fmt2}
              countUnit="шт"
            />
          )}
          <ScAddButton onClick={handleSave} isEdit={isEdit} />
        </>
      }
      errorContent={
        error && (
          <div className="sc-error">
            {typeof error === "string" ? error : error?.message || "Помилка"}
          </div>
        )
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
            if (!trimmed || services.includes(trimmed)) {
              alert(services.includes(trimmed) ? "Така назва вже існує" : "");
              return;
            }
            setServices((prev) => [...prev, trimmed]);
            setSelectedService(trimmed);
          }}
          onRemoveService={(service) => {
            if (services.length === 1) { alert("Повинен бути хоча б один товар"); return; }
            if (!window.confirm(`Видалити "${service}"?`)) return;
            setServices((prev) => prev.filter((s) => s !== service));
            if (selectedService === service) setSelectedService(services[0] || "");
          }}
        />
      }
    >
      {/* 1. Кількість + Розмір */}
      <ScCountSize
        count={count}
        onCountChange={(v) => setCount(v)}
        sizeComponent={
          <NewNoModalSizeNote
            size={size}
            setSize={setSize}
            prices={[]}
            type={"SheetCut"}
            buttonsArr={["односторонній", "двосторонній"]}
            color={color}
            setColor={setColor}
            count={count}
            setCount={setCount}
            defaultt={"А3 (297 х 420 мм)"}
          />
        }
      />

      {/* 2. Обкладинка */}
      <Materials2NoteFront
        materialAndDrukFront={materialAndDrukFront}
        setMaterialAndDrukFront={setMaterialAndDrukFront}
        count={count}
        setCount={setCount}
        prices={[]}
        size={size}
        selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
        name={"Обкладинки:"}
        buttonsArr={["Офісний", "Тонкий", "Середній", "Цупкий"]}
        buttonsArrDruk={["односторонній", "двосторонній"]}
        buttonsArrColor={["Не потрібно", "Чорнобілий", "Кольоровий"]}
        buttonsArrLamination={["з глянцевим ламінуванням", "з матовим ламінуванням", "з ламінуванням SoftTouch"]}
        typeUse={null}
      />

      {/* 3. Блок */}
      <Materials2NoteBack
        materialAndDrukBack={materialAndDrukBack}
        setMaterialAndDrukBack={setMaterialAndDrukBack}
        count={count}
        setCount={setCount}
        prices={[]}
        size={size}
        selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
        name={"Чорно-білий друк на монохромному принтері:"}
        buttonsArr={["Офісний", "Тонкий", "Середній", "Цупкий"]}
        buttonsArrDruk={["односторонній", "двосторонній"]}
        buttonsArrColor={["Не потрібно", "Чорнобілий", "Кольоровий"]}
        buttonsArrLamination={["з глянцевим ламінуванням", "з матовим ламінуванням", "з ламінуванням SoftTouch"]}
        typeUse={null}
      />

      {/* 4. Брошурування */}
      <ScSection style={{ position: "relative", zIndex: 50 }}>
        <PerepletPereplet
          size={size}
          pereplet={pereplet}
          setPereplet={setPereplet}
          prices={[]}
          type={"SheetCut"}
          buttonsArr={["Брошурування до 120 аркушів", "Брошурування від 120 до 280 аркушів"]}
          defaultt={"А3 (297 х 420 мм)"}
        />
      </ScSection>
    </ScModal>
  );
};

export default NewNote;
