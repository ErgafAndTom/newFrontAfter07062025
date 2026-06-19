import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from '../../api/axiosInstance';
import NewNoModalSize from "./newnomodals/NewNoModalSizeColor";
import Materials2 from "./newnomodals/Materials2";
import SliderComponent from "./newnomodals/SlidersComponent";
import { useNavigate } from "react-router-dom";

import ScModal from "./shared/ScModal";
import ScCountSize from "./shared/ScCountSize";
import ScSection from "./shared/ScSection";
import ScPricing from "./shared/ScPricing";
import ScAddButton from "./shared/ScAddButton";
import ScTabs from "./shared/ScTabs";
import ServiceSettingsModal from "./shared/ServiceSettingsModal";
import useServiceTabs from "../../hooks/useServiceTabs";
import "./shared/sc-base.css";

const DEFAULTS = {
  size: { x: 420, y: 594 },
  material: { type: "Папір Широкоформат", thickness: "", material: "", materialId: "" },
  color: { sides: "односторонній", one: "", two: "", allSidesColor: "CMYK" },
  lamination: { type: "Не потрібно", material: "" },
  big: "Не потрібно",
  cute: "Не потрібно",
  cuteLocal: { leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" },
  holes: "Не потрібно",
  holesR: "Не потрібно",
  count: 1,
  selectedService: "Плакат",
};

const SERVICES = ["Плакат", "Креслення", "Фотографія", "Афіша", "Лекала", "Холст"];

const NewWide = ({
  thisOrder,
  setShowNewWide,
  showNewWide,
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

  const isEdit = Boolean(editingOrderUnit && (editingOrderUnit.id || editingOrderUnit.ID || editingOrderUnit.idKey));
  const skipInitialPricing = useRef(false);

  const safeSetShowNewWide = useCallback((val) => {
    if (typeof setShowNewWide === "function") setShowNewWide(val);
  }, [setShowNewWide]);

  const safeSetEditingOrderUnit = useCallback((val) => {
    if (typeof setEditingOrderUnit === "function") setEditingOrderUnit(val);
  }, [setEditingOrderUnit]);

  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);

  const [size, setSize] = useState(DEFAULTS.size);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [color, setColor] = useState(DEFAULTS.color);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);
  const [big, setBig] = useState(DEFAULTS.big);
  const [cute, setCute] = useState(DEFAULTS.cute);
  const [cuteLocal, setCuteLocal] = useState(DEFAULTS.cuteLocal);
  const [holes, setHoles] = useState(DEFAULTS.holes);
  const [holesR, setHolesR] = useState(DEFAULTS.holesR);
  const [count, setCount] = useState(DEFAULTS.count);
  const [selectedService, setSelectedService] = useState(DEFAULTS.selectedService);
  const { services, addService, removeService, updateService, reorderServices } = useServiceTabs("Wide", SERVICES);
  const [showSettings, setShowSettings] = useState(false);

  const DEFAULT_SIZES = [
    { label: "A2", x: 420, y: 594 }, { label: "A1", x: 594, y: 841 },
    { label: "A0", x: 841, y: 1189 }, { label: "60×90", x: 600, y: 900 },
    { label: "70×100", x: 700, y: 1000 }, { label: "90×120", x: 900, y: 1200 },
  ];

  const sizeButtons = useMemo(() => {
    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
    const sizes = svc?.presets?.sizes;
    if (Array.isArray(sizes) && sizes.length > 0) return sizes;
    return DEFAULT_SIZES;
  }, [services, selectedService]);

  const handleServiceSelect = useCallback((name) => {
    setSelectedService(name);
    if (isEdit) return;
    const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === name);
    const p = svc?.presets;
    if (!p) return;
    if (p.sizeX || p.sizeY) {
      setSize({ x: p.sizeX ? Number(p.sizeX) : size.x, y: p.sizeY ? Number(p.sizeY) : size.y });
    }
  }, [services, isEdit, size]);

  const [prices, setPrices] = useState(null);
  const [pricesThis, setPricesThis] = useState(null);

  const handleChangeCount = (val) => {
    const n = Number(val);
    if (Number.isFinite(n) && n > 0) setCount(n);
  };

  const handleClose = () => {
    safeSetShowNewWide(false);
    safeSetEditingOrderUnit(null);
  };

  // Завантаження прайсів
  useEffect(() => {
    axios.get(`/getpricesNew`)
      .then((response) => setPrices(response.data))
      .catch((e) => console.log(e?.message));
  }, []);

  // Гідрація стейтів (NEW vs EDIT)
  useEffect(() => {
    if (!showNewWide) return;

    if (!isEdit) {
      setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setLamination(DEFAULTS.lamination);
      setBig(DEFAULTS.big);
      setCute(DEFAULTS.cute);
      setCuteLocal(DEFAULTS.cuteLocal);
      setHoles(DEFAULTS.holes);
      setHolesR(DEFAULTS.holesR);
      setCount(DEFAULTS.count);
      setSelectedService(DEFAULTS.selectedService);
      setError(null);
      setPricesThis(null);
      return;
    }

    let opts = {};
    try {
      if (editingOrderUnit?.optionsJson) {
        opts = JSON.parse(editingOrderUnit.optionsJson) || {};
      }
    } catch (e) {
      opts = {};
    }

    const sizeFromFields = (editingOrderUnit?.newField2 && editingOrderUnit?.newField3)
      ? { x: Number(editingOrderUnit.newField2) || DEFAULTS.size.x, y: Number(editingOrderUnit.newField3) || DEFAULTS.size.y }
      : null;
    setSize(opts.size || sizeFromFields || editingOrderUnit?.size || DEFAULTS.size);
    setMaterial(opts.material || editingOrderUnit?.material || DEFAULTS.material);
    setColor(opts.color || DEFAULTS.color);
    setLamination(opts.lamination || DEFAULTS.lamination);
    setBig(opts.big ?? DEFAULTS.big);
    setCute(opts.cute ?? DEFAULTS.cute);
    setCuteLocal(opts.cuteLocal || DEFAULTS.cuteLocal);
    setHoles(opts.holes ?? DEFAULTS.holes);
    setHolesR(opts.holesR ?? DEFAULTS.holesR);

    const cnt =
      opts.count ??
      editingOrderUnit?.amount ??
      editingOrderUnit?.newField5 ?? editingOrderUnit?.newField2 ?? DEFAULTS.count;
    setCount(Number(cnt) > 0 ? Number(cnt) : DEFAULTS.count);
    if (isEdit) skipInitialPricing.current = true;

    const svc =
      opts.selectedService ||
      opts.newField1 ||
      editingOrderUnit?.newField1 ||
      DEFAULTS.selectedService;
    setSelectedService(svc);

    setError(null);
    setPricesThis(null);
  }, [showNewWide, isEdit, editingOrderUnit, safeSetEditingOrderUnit, safeSetShowNewWide]);

  // Pricing
  useEffect(() => {
    // В edit-mode пропускаємо перший виклик pricing — показуємо збережені ціни
    if (skipInitialPricing.current) {
      skipInitialPricing.current = false;
      if (editingOrderUnit) {
        const storedPrice = parseFloat(editingOrderUnit.priceForAllThis) || 0;
        const storedPerUnit = parseFloat(editingOrderUnit.priceForOneThis) || 0;
        setPricesThis((prev) => ({
          ...prev,
          price: storedPrice,
          priceForOneThis: storedPerUnit,
        }));
      }
      return;
    }

    if (!showNewWide) return;

    const dataToSend = {
      type: "Wide",
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
  }, [showNewWide, size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count]);

  const saveOrderUnit = () => {
    if (!thisOrder?.id) return;

    const toCalc = {
      nameOrderUnit: selectedService ? `${selectedService.toLowerCase()} ` : "",
      type: "Wide",
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
    };

    const dataToSend = {
      orderId: thisOrder.id,
      ...(isEdit ? { orderUnitId: (editingOrderUnit.id || editingOrderUnit.ID || editingOrderUnit.idKey), idKey: editingOrderUnit.idKey } : {}),
      toCalc,
    };

    setLoad(true);
    axios.post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then((response) => {
        setThisOrder?.(response.data);
        setSelectedThings2?.(response.data.OrderUnits);
        safeSetShowNewWide(false);
        safeSetEditingOrderUnit(null);
      })
      .catch((e) => {
        setError(e);
        if (e?.response?.status === 403) navigate('/login');
        console.log(e?.message);
      })
      .finally(() => setLoad(false));
  };

  // ========== PRICING DATA ==========

  const sc = pricesThis?.sheetCount || 0;
  const pricingLines = [
    { label: "Друк", perUnit: pricesThis?.priceDrukPerSheet, count: sc, total: (parseFloat(pricesThis?.priceDrukPerSheet) || 0) * sc },
    { label: "Матеріали", perUnit: pricesThis?.pricePaperPerSheet, count: sc, total: (parseFloat(pricesThis?.pricePaperPerSheet) || 0) * sc },
  ];

  const pricingSimpleLines = pricesThis?.porizka && pricesThis.porizka !== 0
    ? [{ label: "Порізка", value: (parseFloat(pricesThis.porizka) || 0) * sc }]
    : [];

  const pricingExtras = [
    { label: "За виріб", value: `${fmt2(pricesThis?.priceForItemWithExtras || 0)} грн` },
  ];

  // ========== RENDER ==========

  return (
    <ScModal
      show={showNewWide}
      onClose={handleClose}
      modalStyle={{ width: "54vw" }}
      modalClassName="sc-modal-wide"
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
        <>
          <div className="sc-tabs-count-row">
            <div className="sc-count-inline">
              <input className="inputsArtem" type="number" value={count} min={1}
                onChange={(e) => handleChangeCount(e.target.value)}
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
              const sId = typeof service === 'string' ? null : service?.id;
              const sName = typeof service === 'string' ? service : service?.name;
              if (sId) await removeService(sId);
              if (selectedService === sName) {
                const first = services.find((s) => (typeof s === 'string' ? s : s?.name) !== sName);
                setSelectedService(first ? (typeof first === 'string' ? first : first.name) : "");
              }
            }}
            onUpdateService={updateService}
            onReorderServices={reorderServices}
            defaultSizes={DEFAULT_SIZES}
            extraToggles={[]}
            thicknessOptions={[]}
            hideSidesOption
            hideLaminationOption
            materialType="Папір Широкоформат"
          />
          <div className="sc-section sc-section-card" style={{ margin: "0 2rem" }}>
            <div className="sc-sides sc-size-row">
              {sizeButtons.map((f) => (
                <button key={f.label}
                  className={`sc-side-btn${size.x === f.x && size.y === f.y ? " sc-side-active" : ""}`}
                  onClick={() => setSize({ x: f.x, y: f.y })}
                >
                  <span className="sc-side-text">{f.label}</span>
                </button>
              ))}
              <button className={`sc-side-btn${!sizeButtons.some((f) => size.x === f.x && size.y === f.y) ? " sc-side-active" : ""}`}
                onClick={() => {}}
              >
                <span className="sc-side-text">Свій розмір</span>
              </button>
              <div className="sc-size-inline-inputs">
                <input className="inputsArtem" type="number" value={size.x} min={10}
                  onChange={(e) => setSize({ x: Number(e.target.value) || 0, y: size.y })} />
                <span className="sc-size-x">x</span>
                <input className="inputsArtem" type="number" value={size.y} min={10}
                  onChange={(e) => setSize({ x: size.x, y: Number(e.target.value) || 0 })} />
                <span className="sc-size-mm">мм</span>
              </div>
            </div>
          </div>
        </>
      }
    >

      {/* 2. Слайдер розміру */}
      <ScSection>
        <SliderComponent
          size={size}
          setSize={setSize}
          prices={prices}
          type={"Wide"}
          buttonsArr={["односторонній"]}
          color={color}
          setColor={setColor}
          count={count}
          setCount={setCount}
        />
      </ScSection>

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
          name={"Широкоформатний фотодрук:"}
          buttonsArr={[]}
          preferredMaterialName={(() => {
            const svc = services.find((s) => (typeof s === 'string' ? s : s?.name) === selectedService);
            return svc?.presets?.materialName || undefined;
          })()}
        />
      </ScSection>
    </ScModal>
  );
};

export default NewWide;
