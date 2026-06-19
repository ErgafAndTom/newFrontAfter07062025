import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import NewNoModalCornerRounding from "./newnomodals/NewNoModalBig";
import Materials2 from "./newnomodals/Materials2";
import NewNoModalProkleyka from "./newnomodals/NewNoModalProkleyka";
import Porizka from "./newnomodals/Porizka";

import ScModal from "./shared/ScModal";
import useServiceTabs from "../../hooks/useServiceTabs";
import ScSection from "./shared/ScSection";
import ScToggleSection from "./shared/ScToggleSection";
import ScPricing from "./shared/ScPricing";
import ScAddButton from "./shared/ScAddButton";
import ScTabs from "./shared/ScTabs";
import ServiceSettingsModal from "./shared/ServiceSettingsModal";

import "./Poslugy.css";
import "./shared/sc-base.css";

/* ===================== CONSTANTS ===================== */

const FIXED_SIZE = { x: 330, y: 660 };
const TYPE_KEY = "DigitalPrintWide";

const emptyPrice = { pricePerUnit: 0, count: 0, totalPrice: 0 };
const normalize = (obj = {}) => ({
  pricePerUnit: Number(obj.pricePerUnit) || 0,
  count: Number(obj.count) || 0,
  totalPrice: Number(obj.totalPrice) || 0,
});

const DEFAULTS = {
  count: 1,
  size: { ...FIXED_SIZE },
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
  big: "Не потрібно",
  porizka: { type: "Не потрібно" },
  prokleyka: "Не потрібно",
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

/* ===================== COMPONENT ===================== */

const DigitalPrintWide = ({
  thisOrder,
  setShowDigitalPrintWide,
  setThisOrder,
  setSelectedThings2,
  showDigitalPrintWide,
  editingOrderUnit,
}) => {
  const fmt2 = (v) =>
    new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(v) || 0);

  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const handleClose = () => {
    setShowDigitalPrintWide(false);
  };

  /* ====== STATE ====== */

  // Розмір зафіксовано — 330x660
  const [size] = useState(FIXED_SIZE);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [color, setColor] = useState(DEFAULTS.color);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);
  const [big, setBig] = useState(DEFAULTS.big);
  const [porizka, setPorizka] = useState(DEFAULTS.porizka);
  const [prokleyka, setProkleyka] = useState(DEFAULTS.prokleyka);
  const [count, setCount] = useState(DEFAULTS.count);
  const [prices] = useState([]);

  const [pricesThis, setPricesThis] = useState({
    big: emptyPrice,
    prokleyka: emptyPrice,
  });

  const [selectedService, setSelectedService] = useState("Обгортка");
  const [showSettings, setShowSettings] = useState(false);
  const { services, addService, removeService, updateService, reorderServices, loading: servicesLoading } = useServiceTabs(
    "DigitalPrintWide",
    ["Обгортка", "Етикетка", "Меню", "Рукав"]
  );

  const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.idKey);
  const skipInitialPricing = useRef(false);

  // Застосувати пресети при виборі категорії
  const handleServiceSelect = useCallback((name) => {
    setSelectedService(name);
    if (isEdit) return;
    const svc = services.find((s) => (typeof s === "string" ? s : s?.name) === name);
    const p = svc?.presets;
    if (!p) return;

    if (p.thickness) {
      const isSelf = p.thickness === "Самоклеючі";
      setMaterial((prev) => ({
        ...prev,
        type: isSelf ? "Плівка" : "Папір",
        thickness: p.thickness,
        typeUse: p.thickness,
        material: "",
        materialId: 0,
        a: "",
        x: null,
        y: null,
      }));
    }
    if (p.lamination !== undefined) {
      if (p.lamination) {
        const lamType = p.laminationType || "з глянцевим ламінуванням";
        const isOn = p.laminationDefault !== false;
        if (isOn) {
          setLamination({
            type: lamType,
            material: lamType,
            materialId: "",
            size: p.laminationThickness ? String(p.laminationThickness) : "",
            typeUse: "А3_force",
          });
        } else {
          setLamination(DEFAULTS.lamination);
        }
      } else {
        setLamination(DEFAULTS.lamination);
      }
    }
    if (p.ZgynDefault) setBig(p.ZgynCount || "1");
    if (p.ProklDefault) setProkleyka(p.ProklCount || "1");
    if (p.PorizkaDefault) setPorizka((prev) => ({ ...prev, type: "Потрібно" }));
  }, [services, isEdit]);

  /* ===================== INIT MODAL (NEW/EDIT) ===================== */

  const options = parseOptionsJson(editingOrderUnit);

  useEffect(() => {
    if (!showDigitalPrintWide) return;
    if (error) setError(null);
    if (isEdit) skipInitialPricing.current = true;

    if (!isEdit) {
      setCount(DEFAULTS.count);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setLamination(DEFAULTS.lamination);
      setBig(DEFAULTS.big);
      setPorizka(DEFAULTS.porizka);
      setProkleyka(DEFAULTS.prokleyka);
      return;
    }

    const opt = options || {};
    setCount(safeNum(opt?.count, safeNum(editingOrderUnit?.amount, DEFAULTS.count)));
    setMaterial(opt?.material ?? DEFAULTS.material);
    setColor(opt?.color ?? DEFAULTS.color);
    setLamination(opt?.lamination ?? DEFAULTS.lamination);
    setBig(opt?.big ?? DEFAULTS.big);
    setPorizka(opt?.porizka ?? DEFAULTS.porizka);
    setProkleyka(opt?.prokleyka ?? DEFAULTS.prokleyka);
  }, [
    showDigitalPrintWide,
    isEdit,
    editingOrderUnit?.id,
    editingOrderUnit?.idKey,
    editingOrderUnit?.optionsJson,
  ]);

  /* ===================== SAVE ===================== */

  const addNewOrderUnit = () => {
    const dataToSend = {
      orderId: thisOrder.id,
      ...(isEdit ? { orderUnitId: editingOrderUnit?.id || editingOrderUnit?.idKey, idKey: editingOrderUnit?.id || editingOrderUnit?.idKey } : {}),
      toCalc: {
        nameOrderUnit: `${selectedService ? selectedService.toLowerCase() + " " : ""}`,
        type: TYPE_KEY,
        newField6: TYPE_KEY,
        size,
        material,
        color,
        lamination,
        big,
        cute: "Не потрібно",
        cuteLocal: { leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" },
        prokleyka,
        lyuversy: "Не потрібно",
        design: "Не потрібно",
        holes: "Не потрібно",
        holesR: "",
        count,
        porizka,
        selectedService,
        newField1: selectedService,
      },
    };

    axios
      .post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then((response) => {
        setThisOrder?.(response.data);
        setSelectedThings2?.(response.data.OrderUnits);
        setShowDigitalPrintWide(false);
      })
      .catch((err) => {
        setError(err);
        if (err.response?.status === 403) navigate("/login");
        console.log(err.response);
      });
  };

  /* ===================== PRICING ===================== */

  useEffect(() => {
    if (skipInitialPricing.current) {
      skipInitialPricing.current = false;
      if (editingOrderUnit) {
        const storedPrice = parseFloat(editingOrderUnit.priceForAllThis) || 0;
        const storedPerUnit = parseFloat(editingOrderUnit.priceForOneThis) || 0;
        const sc = Number(editingOrderUnit.newField5) || 1;
        setPricesThis((prev) => ({
          ...prev,
          price: storedPrice,
          sheetCount: sc,
          priceDrukPerSheet: storedPerUnit > 0 ? storedPerUnit : storedPrice / sc,
          pricePaperPerSheet: 0,
          priceLaminationPerSheet: 0,
          porizka: 0,
        }));
      }
      return;
    }

    const dataToSend = {
      type: TYPE_KEY,
      size,
      material,
      color,
      lamination,
      big,
      cute: "Не потрібно",
      prokleyka,
      lyuversy: "Не потрібно",
      design: "Не потрібно",
      cuteLocal: { leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" },
      holes: "Не потрібно",
      holesR: "",
      count,
      porizka,
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
        }));
      })
      .catch((err) => {
        if (err.response?.status === 403) navigate("/login");
        console.log(err.message);
      });
  }, [
    material,
    color,
    lamination.materialId,
    big,
    count,
    porizka,
    prokleyka,
    navigate,
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
    { label: "Проклейка", perUnit: pricesThis.prokleyka?.pricePerUnit, count: pricesThis.prokleyka?.count, total: pricesThis.prokleyka?.totalPrice },
  ];

  const pricingSimpleLines = pricesThis.porizka !== 0
    ? [{ label: "Порізка", value: pricesThis.porizka }]
    : [];

  const pricingExtras = [
    { label: "За 1 виріб", value: `${count ? fmt2(pricesThis.price / count) : "0,00"} грн` },
    { label: "Розмір", value: `${FIXED_SIZE.x}×${FIXED_SIZE.y} мм` },
    { label: "Аркушів", value: `${sc} шт` },
  ];

  /* ===================== RENDER ===================== */

  return (
    <ScModal
      show={showDigitalPrintWide}
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
        <>
          <div className="sc-tabs-count-row">
            <div className="sc-count-inline">
              <input
                className="inputsArtem"
                type="number"
                value={count}
                min={1}
                onChange={(e) => setCount(Number(e.target.value) || 1)}
                style={{ width: "4.4rem", textAlign: "center" }}
              />
              <span className="inputsArtemx" style={{ border: "transparent" }}>шт</span>
            </div>
            <ScTabs
              services={services}
              selectedService={selectedService}
              onSelect={handleServiceSelect}
              isEditServices={false}
              setIsEditServices={() => {}}
              onSettingsClick={() => setShowSettings(true)}
            />
          </div>
          <ServiceSettingsModal
            show={showSettings}
            onClose={() => setShowSettings(false)}
            services={services}
            onAddService={async (name) => {
              const added = await addService(name);
              if (added) setSelectedService(added.name);
            }}
            onRemoveService={async (service) => {
              const sId = typeof service === "string" ? null : service?.id;
              const sName = typeof service === "string" ? service : service?.name;
              if (sId) await removeService(sId);
              if (selectedService === sName) {
                const first = services.find((s) => (typeof s === "string" ? s : s?.name) !== sName);
                setSelectedService(first ? (typeof first === "string" ? first : first.name) : "");
              }
            }}
            onUpdateService={updateService}
            onReorderServices={reorderServices}
            defaultSizes={[{ label: "330×660", x: 330, y: 660 }]}
            thicknessOptions={["Тонкий", "Середній", "Цупкий", "Самоклеючі"]}
            extraToggles={[
              { key: "hideZgyn", label: "Згинання", defaultKey: "ZgynDefault", params: [
                { key: "ZgynCount", label: "Кількість", options: ["1","2","3","4","5","6","7","8","9"] }
              ]},
              { key: "hideProkl", label: "Проклейка", defaultKey: "ProklDefault", params: [
                { key: "ProklCount", label: "Кількість", options: ["1","2","3","4","5","6","7","8","9"] }
              ]},
              { key: "hidePorizka", label: "Порізка", defaultKey: "PorizkaDefault" },
            ]}
          />
          {/* Розмір зафіксовано — 330x660 мм */}
          <div className="sc-section sc-section-card" style={{ margin: "0 2rem" }}>
            <div className="sc-sides sc-size-row">
              <button className="sc-side-btn sc-side-active">
                <span className="sc-side-text">330×660</span>
              </button>
              <span className="sc-size-mm" style={{ marginLeft: "1rem" }}>
                Фіксований формат
              </span>
            </div>
          </div>
        </>
      }
    >
      {/* Сторонність */}
      <ScSection>
        <div style={{ display: "flex" }}>
          {[
            { value: "односторонній", label: "Односторонній" },
            { value: "двосторонній", label: "Двосторонній" },
            { value: "Не потрібно", label: "Без друку" },
          ].map((opt) => {
            const isActive = color.sides === opt.value;
            return (
              <div
                key={opt.value}
                className={isActive ? "buttonsArtem buttonsArtemActive" : "buttonsArtem"}
                onClick={() => setColor({ ...color, sides: opt.value })}
              >
                <div>{opt.label}</div>
              </div>
            );
          })}
        </div>
      </ScSection>

      {/* Матеріал */}
      <ScSection style={{ position: "relative", zIndex: 30 }}>
        <Materials2
          material={material}
          setMaterial={setMaterial}
          setError={null}
          count={count}
          setCount={setCount}
          prices={prices}
          size={size}
          name={"Цифровий друк широкий:"}
          buttonsArr={["Тонкий", "Середній", "Цупкий", "Самоклеючі"]}
          typeUse={null}
          typeOfPosluga={"DigitalPrintWide"}
          autoSelectFirst={true}
          preferredMaterialName={(() => {
            const svc = services.find((s) => (typeof s === "string" ? s : s?.name) === selectedService);
            return svc?.presets?.materialName || undefined;
          })()}
        />
      </ScSection>

      {/* Ламінація */}
      <ScToggleSection
        label="Ламінування"
        title="Ламінування"
        isOn={lamination.type !== "Не потрібно"}
        onToggle={() => {
          if (lamination.type === "Не потрібно") {
            const svc = services.find((s) => (typeof s === "string" ? s : s?.name) === selectedService);
            const presetLamType = svc?.presets?.laminationType || "з глянцевим ламінуванням";
            const presetLamThick = svc?.presets?.laminationThickness ? String(svc.presets.laminationThickness) : "";
            setLamination({
              ...lamination,
              type: presetLamType,
              material: presetLamType,
              materialId: "",
              size: presetLamThick,
              typeUse: "А3_force",
            });
          } else {
            setLamination({ type: "Не потрібно", material: "", materialId: "", size: "", typeUse: "А3_force" });
          }
        }}
      >
        <NewNoModalLamination
          lamination={lamination}
          setLamination={setLamination}
          prices={prices}
          size={size}
          type={"DigitalPrintWide"}
          typeOfPosluga={"DigitalPrintWide"}
          paperTypeUse={"А3_force"}
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
            "з холодним матовим ламінуванням": "холодне",
          }}
        />
      </ScToggleSection>

      {/* Згинання */}
      <ScToggleSection
        label="Згинання"
        title="Згинання"
        isOn={big !== "Не потрібно"}
        onToggle={() => (big === "Не потрібно" ? setBig("1") : setBig("Не потрібно"))}
        style={{ position: "relative", zIndex: 25 }}
      >
        <NewNoModalCornerRounding
          big={big}
          setBig={setBig}
          prices={prices}
          type={"DigitalPrintWide"}
          buttonsArr={[]}
          selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
        />
      </ScToggleSection>

      {/* Проклейка */}
      <ScToggleSection
        label="Проклейка"
        title="Проклейка"
        isOn={prokleyka !== "Не потрібно"}
        onToggle={() => (prokleyka === "Не потрібно" ? setProkleyka("1") : setProkleyka("Не потрібно"))}
        style={{ position: "relative", zIndex: 20 }}
      >
        <NewNoModalProkleyka
          prokleyka={prokleyka}
          setProkleyka={setProkleyka}
          prices={prices}
          type={"DigitalPrintWide"}
          buttonsArr={[]}
          selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
        />
      </ScToggleSection>

      {/* Порізка */}
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
          porizka={porizka}
          setPorizka={setPorizka}
          prices={prices}
          type={"DigitalPrintWide"}
        />
      </ScToggleSection>
    </ScModal>
  );
};

export default DigitalPrintWide;
