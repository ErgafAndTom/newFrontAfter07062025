import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import NewNoModalSize from "./newnomodals/NewNoModalSizeColor";
import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import NewNoModalCornerRounding from "./newnomodals/NewNoModalBig";
import NewNoModalCute from "./newnomodals/NewNoModalCute";
import NewNoModalHoles from "./newnomodals/NewNoModalHoles";
import Materials2 from "./newnomodals/Materials2";
import { useNavigate } from "react-router-dom";
import NewNoModalLyuversy from "./newnomodals/NewNoModalLyuversy";
import Porizka from "./newnomodals/Porizka";
import NewNoModalProkleyka from "./newnomodals/NewNoModalProkleyka";

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

const emptyPrice = { pricePerUnit: 0, count: 0, totalPrice: 0 };
const normalize = (obj = {}) => ({
  pricePerUnit: Number(obj.pricePerUnit) || 0,
  count: Number(obj.count) || 0,
  totalPrice: Number(obj.totalPrice) || 0,
});

const DEFAULTS = {
  count: 1,
  size: { x: 310, y: 440 },
  material: {
    type: "Папір",
    thickness: "Цупкий",
    material: "",
    materialId: "0",
    typeUse: "Цупкий",
  },
  color: {
    sides: "односторонній",
    one: "",
    two: "",
    allSidesColor: "CMYK",
  },
  lamination: {
    type: "Не потрібно",
    material: "",
    materialId: "",
    size: "",
  },
  pereplet: {
    type: "",
    thickness: "Тонкі",
    material: "",
    materialId: "",
    size: "<120",
    typeUse: "Брошурування до 120 аркушів",
  },
  big: "Не потрібно",
  cute: "Не потрібно",
  porizka: { type: "Не потрібно" },
  cuteLocal: {
    leftTop: true,
    rightTop: true,
    rightBottom: true,
    leftBottom: true,
    radius: "6",
  },
  holes: "Не потрібно",
  holesR: "",
  prokleyka: "Не потрібно",
  lyuversy: "Не потрібно",
  design: "Не потрібно",
};

function safeNum(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function calcItemsPerSheet(sheetX, sheetY, itemX, itemY) {
  const sx = Number(sheetX) || 0;
  const sy = Number(sheetY) || 0;
  const ix = Number(itemX) || 0;
  const iy = Number(itemY) || 0;
  if (!sx || !sy || !ix || !iy) return 0;
  const normal = Math.floor(sx / ix) * Math.floor(sy / iy);
  const rotated = Math.floor(sx / iy) * Math.floor(sy / ix);
  return Math.max(normal, rotated);
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

/* ===================== COMPONENT ===================== */

const NewSheetCut = ({
                       thisOrder,
                       newThisOrder,
                       setNewThisOrder,
                       selectedThings2,
                       setShowNewSheetCut,
                       setThisOrder,
                       setSelectedThings2,
                       showNewSheetCut,
                       editingOrderUnit,
                     }) => {
  const fmt2 = (v) =>
    new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(v));

  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const handleClose = () => {
    setShowNewSheetCut(false);
  };

  /* ====== STATE ====== */

  const [size, setSize] = useState({ x: 310, y: 440 });
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [color, setColor] = useState(DEFAULTS.color);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);
  const [pereplet, setPereplet] = useState(DEFAULTS.pereplet);
  const [big, setBig] = useState("Не потрібно");
  const [cute, setCute] = useState("Не потрібно");
  const [porizka, setPorizka] = useState({ type: "Не потрібно" });
  const [cuteLocal, setCuteLocal] = useState(DEFAULTS.cuteLocal);
  const [holes, setHoles] = useState("Не потрібно");
  const [prokleyka, setProkleyka] = useState("Не потрібно");
  const [lyuversy, setLyuversy] = useState("Не потрібно");
  const [design, setDesign] = useState("Не потрібно");
  const [holesR, setHolesR] = useState("");
  const [count, setCount] = useState(1);
  const [prices, setPrices] = useState([]);

  const [pricesThis, setPricesThis] = useState({
    big: emptyPrice,
    prokleyka: emptyPrice,
    lyuversy: emptyPrice,
    cute: emptyPrice,
    holes: emptyPrice,
    design: { pricePerUnit: 0, totalPrice: 0 },
  });

  const [selectedService, setSelectedService] = useState("Зображення");
  const [isEditServices, setIsEditServices] = useState(false);
  const [services, setServices] = useState([
    "Зображення", "Листівка", "Візитка", "Флаєр", "Буклет",
    "Брошура", "Картка", "Диплом", "Сертифікат", "Подяка",
    "Зін", "Презентація", "Бланк", "Афіша", "Календар",
    "Плакат", "Візуалізація", "Меню", "Документ", "Бейджі", "Холдер",
  ]);

  /* ===================== INIT MODAL (NEW/EDIT) ===================== */

  const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.idKey);
  const options = parseOptionsJson(editingOrderUnit);

  useEffect(() => {
    if (!showNewSheetCut) return;
    if (error) setError(null);

    if (!isEdit) {
      setCount(DEFAULTS.count);
      setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setLamination(DEFAULTS.lamination);
      setPereplet(DEFAULTS.pereplet);
      setBig(DEFAULTS.big);
      setCute(DEFAULTS.cute);
      setPorizka(DEFAULTS.porizka);
      setCuteLocal(DEFAULTS.cuteLocal);
      setHoles(DEFAULTS.holes);
      setHolesR(DEFAULTS.holesR);
      setProkleyka(DEFAULTS.prokleyka);
      setLyuversy(DEFAULTS.lyuversy);
      setDesign(DEFAULTS.design);
      return;
    }

    const opt = options || {};
    setCount(safeNum(opt?.count, safeNum(editingOrderUnit?.amount, DEFAULTS.count)));
    setSize({
      x: safeNum(opt?.size?.x, safeNum(editingOrderUnit?.newField2, DEFAULTS.size.x)),
      y: safeNum(opt?.size?.y, safeNum(editingOrderUnit?.newField3, DEFAULTS.size.y)),
    });
    setMaterial(opt?.material ?? DEFAULTS.material);
    setColor(opt?.color ?? DEFAULTS.color);
    setLamination(opt?.lamination ?? DEFAULTS.lamination);
    setPereplet(opt?.pereplet ?? DEFAULTS.pereplet);
    setBig(opt?.big ?? DEFAULTS.big);
    setCute(opt?.cute ?? DEFAULTS.cute);
    setPorizka(opt?.porizka ?? DEFAULTS.porizka);
    setCuteLocal(opt?.cuteLocal ?? DEFAULTS.cuteLocal);
    setHoles(opt?.holes ?? DEFAULTS.holes);
    setHolesR(opt?.holesR ?? DEFAULTS.holesR);
    setProkleyka(opt?.prokleyka ?? DEFAULTS.prokleyka);
    setLyuversy(opt?.lyuversy ?? DEFAULTS.lyuversy);
    setDesign(opt?.design ?? DEFAULTS.design);
  }, [
    showNewSheetCut,
    isEdit,
    editingOrderUnit?.id,
    editingOrderUnit?.idKey,
    editingOrderUnit?.optionsJson,
  ]);

  /* ===================== SAVE ===================== */

  const addNewOrderUnit = () => {
    let dataToSend = {
      orderId: thisOrder.id,
      toCalc: {
        nameOrderUnit: `${selectedService.toLowerCase() ? selectedService.toLowerCase() + " " : ""}`,
        type: "SheetCut",
        size, material, color, lamination,
        big, cute, cuteLocal, prokleyka, lyuversy, design,
        holes, holesR, count, porizka,
      },
    };

    axios
      .post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then((response) => {
        setThisOrder(response.data);
        setSelectedThings2(response.data.OrderUnits);
        setShowNewSheetCut(false);
      })
      .catch((error) => {
        setError(error);
        if (error.response?.status === 403) navigate("/login");
        console.log(error.response);
      });
  };

  /* ===================== PRICING ===================== */

  useEffect(() => {
    setPricesThis((prev) => ({
      ...prev,
      design: {
        pricePerUnit: design === "Не потрібно" ? 0 : Number(design) || 0,
        totalPrice: design === "Не потрібно" ? 0 : Number(design) || 0,
      },
    }));
  }, [design]);

  useEffect(() => {
    let dataToSend = {
      type: "SheetCut",
      size, material, color, lamination,
      big, cute, prokleyka, lyuversy, design,
      cuteLocal, holes, holesR, count, porizka,
    };

    axios
      .post("/calc/pricing", dataToSend)
      .then(({ data }) => {
        const p = data?.prices ?? {};
        setPricesThis((prev) => ({
          ...prev,
          ...p,
          big: normalize(p.big),
          prokleyka: normalize(p.prokleyka),
          lyuversy: normalize(p.lyuversy),
          cute: normalize(p.cute),
          holes: normalize(p.holes),
          design: prev.design,
        }));
      })
      .catch((err) => {
        if (err.response?.status === 403) navigate("/login");
        console.log(err.message);
      });
  }, [
    size, material, color, lamination.materialId,
    big, cute, cuteLocal, holes, holesR,
    count, porizka, lyuversy, prokleyka, design, navigate,
  ]);

  useEffect(() => {
    if (error) setError(null);
  }, [material]);

  /* ===================== PRICING DATA ===================== */

  const sc = pricesThis.sheetCount || 0;

  const pricingLines = [
    { label: "Друк", perUnit: pricesThis.priceDrukPerSheet, count: sc, total: (pricesThis.priceDrukPerSheet || 0) * sc },
    { label: "Матеріали", perUnit: pricesThis.pricePaperPerSheet, count: sc, total: (pricesThis.pricePaperPerSheet || 0) * sc },
    { label: "Ламінація", perUnit: pricesThis.priceLaminationPerSheet, count: sc, total: (pricesThis.priceLaminationPerSheet || 0) * sc },
    { label: "Згинання", perUnit: pricesThis.big?.pricePerUnit, count: pricesThis.big?.count, total: pricesThis.big?.totalPrice },
    { label: "Скруглення", perUnit: pricesThis.cute?.pricePerUnit, count: pricesThis.cute?.count, total: pricesThis.cute?.totalPrice },
    { label: "Отвори", perUnit: pricesThis.holes?.pricePerUnit, count: pricesThis.holes?.count, total: pricesThis.holes?.totalPrice },
    { label: "Проклейка", perUnit: pricesThis.prokleyka?.pricePerUnit, count: pricesThis.prokleyka?.count, total: pricesThis.prokleyka?.totalPrice },
    { label: "Люверси", perUnit: pricesThis.lyuversy?.pricePerUnit, count: pricesThis.lyuversy?.count, total: pricesThis.lyuversy?.totalPrice },
  ];

  const pricingSimpleLines = pricesThis.porizka !== 0
    ? [{ label: "Порізка", value: pricesThis.porizka }]
    : [];

  const pricingExtras = [
    { label: "За 1 виріб", value: `${count ? fmt2(pricesThis.price / count) : "0,00"} грн` },
    { label: "На одному аркуші", value: `${calcItemsPerSheet(material.x || 320, material.y || 450, size.x, size.y)} шт` },
    { label: "Аркушів", value: `${sc} шт` },
  ];

  /* ===================== RENDER ===================== */

  return (
    <ScModal
      show={showNewSheetCut}
      onClose={handleClose}
      rightContent={
        <>
          {pricesThis && (
            <ScPricing
              lines={pricingLines}
              simpleLines={pricingSimpleLines}
              totalPrice={pricesThis.price || 0}
              extras={pricingExtras}
              fmt={fmt2}
            />
          )}
          <ScAddButton onClick={addNewOrderUnit} isEdit={isEdit} />
        </>
      }
      errorContent={
        error && (
          <div className="sc-error">
            {error.response?.data?.error || "Помилка"}
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
        onCountChange={(v) => setCount(v)}
        sizeComponent={
          <NewNoModalSize
            size={size}
            setSize={setSize}
            prices={prices}
            type={"SheetCut"}
            buttonsArr={[]}
            color={color}
            setColor={setColor}
            count={count}
            setCount={setCount}
            defaultt={"А3 (297 х 420 мм)"}
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
          setError={null}
          count={count}
          setCount={setCount}
          prices={prices}
          size={size}
          selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
          name={"Кольоровий друк:"}
          buttonsArr={["Офісний", "Тонкий", "Середній", "Цупкий", "Самоклеючі"]}
          typeUse={null}
          typeOfPosluga={"NewSheetCut"}
        />
      </ScSection>

      {/* 4. Ламінація */}
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
      >
        <NewNoModalLamination
          lamination={lamination}
          setLamination={setLamination}
          prices={prices}
          size={size}
          type={"SheetCut"}
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

      {/* 5. Згинання */}
      <ScToggleSection
        label="Згинання"
        title="Згинання"
        isOn={big !== "Не потрібно"}
        onToggle={() => big === "Не потрібно" ? setBig("1") : setBig("Не потрібно")}
        style={{ position: "relative", zIndex: 50 }}
      >
        <NewNoModalCornerRounding
          big={big} setBig={setBig}
          prices={prices} type={"SheetCut"}
          buttonsArr={[]}
          selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
        />
      </ScToggleSection>

      {/* 6. Скруглення кутів */}
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
        style={{ position: "relative", zIndex: 40 }}
      >
        <NewNoModalCute
          cute={cute} setCute={setCute}
          cuteLocal={cuteLocal} setCuteLocal={setCuteLocal}
          prices={prices} type={"SheetCut"}
          buttonsArr={[]}
          selectArr={["3", "6", "8", "10", "13"]}
        />
      </ScToggleSection>

      {/* 7. Свердління отворів */}
      <ScToggleSection
        label="Свердління"
        title="Свердління отворів"
        isOn={holes !== "Не потрібно"}
        onToggle={() => {
          if (holes === "Не потрібно") { setHoles(1); setHolesR("5 мм"); }
          else { setHoles("Не потрібно"); setHolesR(""); }
        }}
        style={{ position: "relative", zIndex: 30 }}
      >
        <NewNoModalHoles
          holes={holes} setHoles={setHoles}
          holesR={holesR} setHolesR={setHolesR}
          prices={prices} type={"SheetCut"}
          buttonsArr={[]}
          selectArr={["", "3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
        />
      </ScToggleSection>

      {/* 8. Проклейка */}
      <ScToggleSection
        label="Проклейка"
        title="Проклейка"
        isOn={prokleyka !== "Не потрібно"}
        onToggle={() => prokleyka === "Не потрібно" ? setProkleyka("1") : setProkleyka("Не потрібно")}
        style={{ position: "relative", zIndex: 20 }}
      >
        <NewNoModalProkleyka
          prokleyka={prokleyka} setProkleyka={setProkleyka}
          prices={prices} type={"SheetCut"}
          buttonsArr={[]}
          selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
        />
      </ScToggleSection>

      {/* 9. Люверси */}
      <ScToggleSection
        label="Люверси"
        title="Люверси"
        isOn={lyuversy !== "Не потрібно"}
        onToggle={() => lyuversy === "Не потрібно" ? setLyuversy("1") : setLyuversy("Не потрібно")}
        style={{ position: "relative", zIndex: 10 }}
      >
        <NewNoModalLyuversy
          lyuversy={lyuversy} setLyuversy={setLyuversy}
          type={"SheetCut"} buttonsArr={[]}
          selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
        />
      </ScToggleSection>

      {/* 10. Порізка */}
      <ScToggleSection
        label="Порізка"
        title="Порізка"
        isOn={porizka.type !== "Не потрібно"}
        onToggle={() => {
          if (porizka.type === "Не потрібно") setPorizka({ ...porizka, type: "Потрібно" });
          else setPorizka({ type: "Не потрібно" });
        }}
      >
        <Porizka
          porizka={porizka} setPorizka={setPorizka}
          prices={prices} type={"SheetCut"}
        />
      </ScToggleSection>

    </ScModal>
  );
};

export default NewSheetCut;
