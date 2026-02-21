import React, { useCallback, useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import NewNoModalSize from "./newnomodals/NewNoModalSizeColor";
import Materials2 from "./newnomodals/Materials2";
import SliderComponent from "./newnomodals/SlidersComponent";
import { useNavigate } from "react-router-dom";
import Luvarsi from "./newnomodals/wideFactory/Luvarsi";
import PlotterCutting from "./newnomodals/wideFactory/PlotterCutting";
import MontajnaPlivkaWideFactory from "./newnomodals/wideFactory/MontajnaPlivkaWideFactory";
import LaminationWideFactory from "./newnomodals/wideFactory/LaminationWideFactory";
import ScModal from "./shared/ScModal";
import ScCountSize from "./shared/ScCountSize";
import ScSection from "./shared/ScSection";
import ScPricing from "./shared/ScPricing";
import ScAddButton from "./shared/ScAddButton";
import ScTabs from "./shared/ScTabs";
import "./shared/sc-base.css";

// ========== CONSTANTS ==========

const CATEGORY_DEFAULT_MATERIAL = {
  "Баннер FactoryWide": { material: "Банер литий", materialId: 406, a: "510" },
  "Плівка FactoryWide": { material: "Біла плівка Oracal Orajet 3640", materialId: 402, a: "90" },
  "Папір FactoryWide": { material: "City-light ", materialId: 397, a: "150" },
  "ПВХ FactoryWide": { material: "ПВХ", materialId: 408, a: "3" },
};

const DEFAULTS = {
  size: { x: 420, y: 594 },
  material: { type: "Баннер FactoryWide", thickness: "", material: "Банер литий", materialId: 406, a: "510" },
  color: { sides: "односторонній", one: "", two: "", allSidesColor: "CMYK" },
  lamination: { type: "Не потрібно", material: "", materialId: "" },
  big: "Не потрібно",
  cute: "Не потрібно",
  cuteLocal: { leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" },
  luversi: { type: "Не потрібно", thickness: "", material: "", materialId: "", size: 100 },
  plotterCutting: { type: "Не потрібно", thickness: "", material: "", materialId: "", size: 100 },
  montajnaPlivka: { type: "Не потрібно", thickness: "", material: "", materialId: "", size: 100 },
  holes: "Не потрібно",
  holesR: "Не потрібно",
  count: 1,
  selectedDruk: "Екосольвентний друк",
  selectedService: "Баннер",
  selectWideFactory: "Баннер FactoryWide",
};

const DRUK_OPTIONS = ["Екосольвентний друк", "УФ друк"];

const CATEGORY_SERVICES = {
  "Баннер FactoryWide": ["Баннер"],
  "Плівка FactoryWide": ["Наліпки", "Стікера", "Графік роботи"],
  "Папір FactoryWide": ["Афіша", "Плакат", "Реклама"],
  "ПВХ FactoryWide": ["Таблички"],
};

const CATEGORIES = [
  "Плівка FactoryWide",
  "Баннер FactoryWide",
  "Папір FactoryWide",
  "ПВХ FactoryWide",
];

// ========== COMPONENT ==========

const WideFactory = ({
  thisOrder,
  setShowWideFactory,
  showWideFactory,
  setThisOrder,
  setSelectedThings2,
  editingOrderUnit,
  setEditingOrderUnit,
}) => {
  const navigate = useNavigate();

  const fmt2 = (v) =>
    new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(v) || 0);

  const editId = editingOrderUnit?.id ?? editingOrderUnit?.ID ?? editingOrderUnit?.idKey ?? null;
  const isEdit = Boolean(editId);

  const safeSetShowWideFactory = useCallback((val) => {
    if (typeof setShowWideFactory === "function") setShowWideFactory(val);
  }, [setShowWideFactory]);

  const safeSetEditingOrderUnit = useCallback((val) => {
    if (typeof setEditingOrderUnit === "function") setEditingOrderUnit(val);
  }, [setEditingOrderUnit]);

  // ========== STATE ==========

  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);

  const [selectWideFactory, setSelectWideFactory] = useState(DEFAULTS.selectWideFactory);
  const [services, setServices] = useState(CATEGORY_SERVICES[DEFAULTS.selectWideFactory]);
  const [selectedDruk, setSelectedDruk] = useState(DEFAULTS.selectedDruk);
  const [isEditServices, setIsEditServices] = useState(false);

  const [size, setSize] = useState(DEFAULTS.size);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [color, setColor] = useState(DEFAULTS.color);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);
  const [big, setBig] = useState(DEFAULTS.big);
  const [cute, setCute] = useState(DEFAULTS.cute);
  const [cuteLocal, setCuteLocal] = useState(DEFAULTS.cuteLocal);
  const [luversi, setLuversi] = useState(DEFAULTS.luversi);
  const [plotterCutting, setPlotterCutting] = useState(DEFAULTS.plotterCutting);
  const [montajnaPlivka, setMontajnaPlivka] = useState(DEFAULTS.montajnaPlivka);
  const [holes, setHoles] = useState(DEFAULTS.holes);
  const [holesR, setHolesR] = useState(DEFAULTS.holesR);
  const [count, setCount] = useState(DEFAULTS.count);
  const [selectedService, setSelectedService] = useState(DEFAULTS.selectedService);

  const [prices, setPrices] = useState(null);
  const [pricesThis, setPricesThis] = useState(null);

  // ========== HANDLERS ==========

  const handleChangeCount = (val) => {
    const n = Number(val);
    if (Number.isFinite(n) && n > 0) setCount(n);
  };

  const handleClose = () => {
    safeSetShowWideFactory(false);
    safeSetEditingOrderUnit(null);
  };

  const handleClickWideFactory = (e) => {
    const def = CATEGORY_DEFAULT_MATERIAL[e] || {};
    setMaterial((prev) => ({
      ...prev,
      type: e,
      material: def.material || "",
      materialId: def.materialId || "",
      a: def.a || "",
    }));
    setSelectWideFactory(e);
    const newServices = CATEGORY_SERVICES[e] || CATEGORY_SERVICES[DEFAULTS.selectWideFactory];
    setServices(newServices);
  };

  // Sync selectedService when services change
  useEffect(() => {
    if (!services || services.length === 0) return;
    setSelectedService((prev) => (prev && services.includes(prev)) ? prev : services[0]);
  }, [services]);

  // ========== HYDRATION (NEW vs EDIT) ==========

  const safeParseOptions = (raw) => {
    if (!raw) return null;
    if (typeof raw === "object") return raw;
    try { return JSON.parse(raw); } catch (e) { return null; }
  };

  useEffect(() => {
    if (!showWideFactory) return;

    if (!isEdit) {
      setSelectWideFactory(DEFAULTS.selectWideFactory);
      setServices(CATEGORY_SERVICES[DEFAULTS.selectWideFactory]);
      setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setLamination(DEFAULTS.lamination);
      setBig(DEFAULTS.big);
      setCute(DEFAULTS.cute);
      setCuteLocal(DEFAULTS.cuteLocal);
      setLuversi(DEFAULTS.luversi);
      setPlotterCutting(DEFAULTS.plotterCutting);
      setMontajnaPlivka(DEFAULTS.montajnaPlivka);
      setHoles(DEFAULTS.holes);
      setHolesR(DEFAULTS.holesR);
      setCount(DEFAULTS.count);
      setSelectedDruk(DEFAULTS.selectedDruk);
      setSelectedService(DEFAULTS.selectedService);
      setError(null);
      setPricesThis(null);
      return;
    }

    const opts = safeParseOptions(editingOrderUnit?.optionsJson) || {};
    const factoryType = opts?.material?.type || editingOrderUnit?.type || DEFAULTS.selectWideFactory;
    const newServices = CATEGORY_SERVICES[factoryType] || CATEGORY_SERVICES[DEFAULTS.selectWideFactory];

    setSelectWideFactory(factoryType);
    setServices(newServices);

    if (opts.size?.x && opts.size?.y) setSize(opts.size);
    else if (editingOrderUnit?.newField2 && editingOrderUnit?.newField3) {
      setSize({ x: Number(editingOrderUnit.newField2), y: Number(editingOrderUnit.newField3) });
    }

    if (opts.material) setMaterial(opts.material);
    if (opts.color) setColor(opts.color);
    if (opts.lamination) setLamination(opts.lamination);
    if (opts.big) setBig(opts.big);
    if (opts.cute) setCute(opts.cute);
    if (opts.cuteLocal) setCuteLocal(opts.cuteLocal);
    if (opts.holes) setHoles(opts.holes);
    if (opts.holesR) setHolesR(opts.holesR);

    if (typeof opts.count !== "undefined") setCount(Number(opts.count) || 1);
    else if (editingOrderUnit?.amount) setCount(Number(editingOrderUnit.amount) || 1);
    else if (editingOrderUnit?.newField5) setCount(Number(editingOrderUnit.newField5) || 1);

    if (opts.selectedDruk) setSelectedDruk(opts.selectedDruk);
    if (opts.luversi) setLuversi(opts.luversi);
    if (opts.plotterCutting) setPlotterCutting(opts.plotterCutting);
    if (opts.montajnaPlivka) setMontajnaPlivka(opts.montajnaPlivka);

    const svc = opts.selectedService || opts.newField1 || editingOrderUnit?.newField1 || newServices[0];
    setSelectedService(svc);

    setError(null);
    setPricesThis(null);
  }, [showWideFactory, isEdit, editId]);

  // ========== PRICING ==========

  useEffect(() => {
    if (!showWideFactory) return;

    const dataToSend = {
      type: "WideFactory",
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
      selectedDruk,
      luversi,
      plotterCutting,
      montajnaPlivka,
    };

    axios.post(`/calc/pricing`, dataToSend)
      .then((response) => {
        setPricesThis(response.data.prices);
        setError(null);
      })
      .catch((e) => {
        console.log(e?.message);
        setError(e);
      });
  }, [showWideFactory, size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count, selectedDruk, luversi, plotterCutting, montajnaPlivka]);

  // ========== SAVE ==========

  const saveOrderUnit = () => {
    if (!thisOrder?.id) return;

    const toCalc = {
      nameOrderUnit: selectedService ? `${selectedService.toLowerCase()} ` : "",
      type: "WideFactory",
      newField6: "WideFactory",
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
      selectedService,
      newField1: selectedService,
      selectedDruk,
      luversi,
      plotterCutting,
      montajnaPlivka,
    };

    const dataToSend = {
      orderId: thisOrder.id,
      ...(isEdit ? { orderUnitId: editId, idKey: editId } : {}),
      toCalc,
    };

    setLoad(true);
    axios.post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then((response) => {
        setThisOrder?.(response.data);
        setSelectedThings2?.(response.data.OrderUnits);
        safeSetShowWideFactory(false);
        safeSetEditingOrderUnit(null);
      })
      .catch((e) => {
        setError(e);
        if (e?.response?.status === 403) navigate("/login");
        console.log(e?.message);
      })
      .finally(() => setLoad(false));
  };

  // ========== PRICING DATA ==========

  const sc = pricesThis?.sheetCount || 0;
  const totalM2 = pricesThis?.totalSizeInM2One || 0;

  const pricingLines = [
    { label: "Друк", perUnit: pricesThis?.priceDrukPerSheet, count: totalM2, total: parseFloat(pricesThis?.oneItemWideDrukPrice) || 0 },
    { label: "Матеріали", perUnit: pricesThis?.pricePaperPerSheet, count: totalM2, total: parseFloat(pricesThis?.oneItemWideMaterialPrice) || 0 },
  ];

  const pricingSimpleLines = [];
  if (pricesThis?.porizka && pricesThis.porizka !== 0) {
    pricingSimpleLines.push({ label: "Порізка", value: (parseFloat(pricesThis.porizka) || 0) * sc });
  }
  if (lamination.type !== "Не потрібно" && pricesThis?.totalWideLaminationPrice) {
    pricingSimpleLines.push({ label: "Ламінація", value: parseFloat(pricesThis.totalWideLaminationPrice) || 0 });
  }
  if (plotterCutting.type !== "Не потрібно" && pricesThis?.totalWidePlotterCuttingPrice) {
    pricingSimpleLines.push({ label: "Плоттерна порізка", value: parseFloat(pricesThis.totalWidePlotterCuttingPrice) || 0 });
  }
  if (montajnaPlivka.type !== "Не потрібно" && pricesThis?.totalWideMontajnaPlivkaPrice) {
    pricingSimpleLines.push({ label: "Монтажна плівка", value: parseFloat(pricesThis.totalWideMontajnaPlivkaPrice) || 0 });
  }
  if (luversi.type !== "Не потрібно" && pricesThis?.totalOneItemWideLuversiPrice) {
    pricingSimpleLines.push({ label: "Люверси", value: parseFloat(pricesThis.totalOneItemWideLuversiPrice) || 0 });
  }

  const pricingExtras = [
    { label: "За виріб", value: `${fmt2(pricesThis?.priceForItemWithExtras || 0)} грн` },
  ];

  // ========== RENDER ==========

  return (
    <ScModal
      show={showWideFactory}
      onClose={handleClose}
      modalStyle={{ width: "55vw" }}
      rightContent={
        <>
          {pricesThis && (
            <ScPricing
              lines={pricingLines}
              simpleLines={pricingSimpleLines}
              totalPrice={pricesThis.price || 0}
              extras={pricingExtras}
              fmt={fmt2}
              countUnit="м2"
            />
          )}
          <ScAddButton onClick={saveOrderUnit} isEdit={isEdit} disabled={load} />
        </>
      }
      errorContent={
        error && (
          <div className="sc-error">
            {error?.response?.data?.error || error?.message || "Помилка"}
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
            if (services.length === 1) {
              alert("Повинен бути хоча б один товар");
              return;
            }
            if (!window.confirm(`Видалити "${service}"?`)) return;
            setServices((prev) => prev.filter((s) => s !== service));
            if (selectedService === service) setSelectedService(services[0] || "");
          }}
        />
      }
    >
      {/* 1. Тип друку */}
      <ScSection>
        <div style={{ display: "flex" }}>
          {DRUK_OPTIONS.map((druk) => {
            const isActive = selectedDruk === druk;
            return (
              <div
                key={druk}
                className={isActive ? "buttonsArtem buttonsArtemActive" : "buttonsArtem"}
                onClick={() => setSelectedDruk(druk)}
              >
                <div>{druk}</div>
              </div>
            );
          })}
        </div>
      </ScSection>

      {/* 2. Кількість + Розмір */}
      <ScCountSize
        count={count}
        onCountChange={handleChangeCount}
        sizeComponent={
          <NewNoModalSize
            size={size}
            setSize={setSize}
            prices={prices}
            type={"WideFactory"}
            buttonsArr={[]}
            color={color}
            setColor={setColor}
            count={count}
            setCount={setCount}
          />
        }
      />

      {/* 3. Слайдер розміру */}
      <ScSection>
        <SliderComponent
          size={size}
          setSize={setSize}
          type="WideFactory"
        />
      </ScSection>

      {/* 4. Категорії + Матеріал */}
      <ScSection style={{ position: "relative", zIndex: 60 }}>
        <div style={{ display: "flex", marginBottom: "0.8vh" }}>
          {CATEGORIES.map((val) => {
            const isActive = selectWideFactory === val;
            return (
              <div
                key={val}
                className={isActive ? "buttonsArtem buttonsArtemActive" : "buttonsArtem"}
                onClick={() => handleClickWideFactory(val)}
              >
                <div>{val.split(" ")[0]}</div>
              </div>
            );
          })}
        </div>
        <Materials2
          material={material}
          setMaterial={setMaterial}
          count={count}
          setCount={setCount}
          prices={prices}
          size={size}
          selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
          name={"Широкоформатний фотодрук:"}
          buttonsArr={[]}
        />
      </ScSection>

      {/* 6. Постобробка — умовні секції */}

      {selectWideFactory === "Баннер FactoryWide" && (
        <ScSection>
          <Luvarsi
            luversi={luversi}
            setLuversi={setLuversi}
            selectArr={[100, 200, 300, 400, 500]}
            type={"Luversi"}
            buttonsArr={['По кутам (на "павук")', "По периметру"]}
          />
        </ScSection>
      )}

      {selectWideFactory === "Плівка FactoryWide" && (
        <>
          {selectedDruk === "Екосольвентний друк" && (
            <ScSection>
              <LaminationWideFactory
                lamination={lamination}
                setLamination={setLamination}
                selectArr={[100, 200, 300, 400, 500]}
                type={"LaminationWideFactory"}
                buttonsArr={["з глянцевим ламінуванням", "з матовим ламінуванням"]}
              />
            </ScSection>
          )}
          <ScSection>
            <PlotterCutting
              plotterCutting={plotterCutting}
              setPlotterCutting={setPlotterCutting}
              plivkaOrPVH={"Плотер плівка FactoryWide"}
              selectArr={[100, 200, 300, 400, 500]}
              type={"PlotterCuttingWideFactory"}
              buttonsArr={["Простая", "Середня", "Складна"]}
            />
          </ScSection>
          <ScSection>
            <MontajnaPlivkaWideFactory
              montajnaPlivka={montajnaPlivka}
              plotterCutting={plotterCutting}
              setMontajnaPlivka={setMontajnaPlivka}
              selectArr={[100, 200, 300, 400, 500]}
              type={"MontajnaPlivkaWideFactory"}
              buttonsArr={[]}
            />
          </ScSection>
        </>
      )}

      {selectWideFactory === "Папір FactoryWide" && selectedDruk === "Екосольвентний друк" && (
        <ScSection>
          <LaminationWideFactory
            lamination={lamination}
            setLamination={setLamination}
            selectArr={[100, 200, 300, 400, 500]}
            type={"LaminationWideFactory"}
            buttonsArr={["Глянцева", "Матова"]}
          />
        </ScSection>
      )}

      {selectWideFactory === "ПВХ FactoryWide" && (
        <ScSection>
          <PlotterCutting
            plotterCutting={plotterCutting}
            setPlotterCutting={setPlotterCutting}
            plivkaOrPVH={"Плотер ПВХ FactoryWide"}
            selectArr={[100, 200, 300, 400, 500]}
            type={"PlotterCuttingWideFactory"}
            buttonsArr={["Простая", "Середня", "Складна"]}
          />
        </ScSection>
      )}
    </ScModal>
  );
};

export default WideFactory;
