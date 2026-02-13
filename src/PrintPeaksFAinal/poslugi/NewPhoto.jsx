import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import ServiceModalWrapper from "./shared/ServiceModalWrapper";
import PricingSummary from "./shared/PricingSummary";
import CountInput from "./shared/CountInput";
import ProductTabs from "./shared/ProductTabs";
import { useModalState, useModalPricing, useOrderUnitSave } from "./shared/hooks";
import "./shared/ServiceModal.css";

// ========== DEFAULTS ==========
const DEFAULT_SIZE = { x: 100, y: 150 };

const DEFAULTS = {
  size: DEFAULT_SIZE,
  material: {
    type: "Фотопапір",
    thickness: "",
    material: "",
    materialId: "",
    typeUse: "А3",
  },
  photo: {
    type: "Не потрібно",
    thickness: "Тонкий",
    material: "",
    materialId: "",
    typeUse: "Тонкий",
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
    size: "",
  },
  count: 1,
  selectedService: "Фото",
};

const SIZE_FORMATS = [
  { name: "100 x 150 мм", x: 100, y: 150 },
  { name: "130 x 180 мм", x: 130, y: 180 },
  { name: "Polaroid (72 x 86 мм)", x: 72, y: 86 },
  { name: "A5 (148 x 210 мм)", x: 148, y: 210 },
  { name: "A4 (210 x 297 мм)", x: 210, y: 297 },
  { name: "A3 (297 x 420 мм)", x: 297, y: 420 },
];

const SERVICES = ["Фото", "Диплом", "Сертифікат", "Подяка", "Візуалізація", "Графік"];

const SERVICE_ALIASES = {
  "Диплома": "Диплом",
  "Сертифіката": "Сертифікат",
  "Подяки": "Подяка",
  "Візуалізації": "Візуалізація",
  "Графіки": "Графік",
};

const normalizeService = (v) => {
  if (!v) return DEFAULTS.selectedService;
  return SERVICE_ALIASES[v] || v;
};

const NewPhoto = ({
  thisOrder,
  setThisOrder,
  setSelectedThings2,
  showNewPhoto,
  setShowNewPhoto,
  editingOrderUnit,
  setEditingOrderUnit,
}) => {
  const navigate = useNavigate();

  // Modal state detection
  const { isEdit, options } = useModalState(editingOrderUnit, showNewPhoto);

  // ========== STATE ==========
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [photo, setPhoto] = useState(DEFAULTS.photo);
  const [color, setColor] = useState(DEFAULTS.color);
  const [count, setCount] = useState(DEFAULTS.count);
  const [selectedService, setSelectedService] = useState(DEFAULTS.selectedService);
  const [services, setServices] = useState(SERVICES);
  const [error, setError] = useState(null);

  // Dropdowns
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [customSize, setCustomSize] = useState(false);
  const [localX, setLocalX] = useState(DEFAULT_SIZE.x);
  const [localY, setLocalY] = useState(DEFAULT_SIZE.y);

  const sizeDropdownRef = useRef(null);
  const materialDropdownRef = useRef(null);

  // Pricing hook
  const calcData = useMemo(
    () => ({
      selectedService: normalizeService(selectedService),
      size,
      material,
      color: { ...color, sides: "Не потрібно" },
      lamination: DEFAULTS.lamination,
      big: "Не потрібно",
      cute: "Не потрібно",
      cuteLocal: {
        leftTop: false,
        rightTop: false,
        rightBottom: false,
        leftBottom: false,
      },
      holes: "Не потрібно",
      count,
      photo: {
        ...photo,
        service: normalizeService(selectedService),
      },
    }),
    [selectedService, size, material, color, count, photo]
  );

  const { pricesThis } = useModalPricing("Photo", calcData, showNewPhoto);

  // Save hook
  const { saveOrderUnit } = useOrderUnitSave(
    thisOrder,
    setThisOrder,
    setSelectedThings2,
    () => setShowNewPhoto(false),
    setEditingOrderUnit
  );

  // ========== EFFECTS ==========

  // Initialize/reset state when modal opens
  useEffect(() => {
    if (!showNewPhoto) return;

    // NEW mode - set defaults
    if (!isEdit) {
      setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material);
      setPhoto(DEFAULTS.photo);
      setColor(DEFAULTS.color);
      setCount(DEFAULTS.count);
      setSelectedService(DEFAULTS.selectedService);
      setLocalX(DEFAULTS.size.x);
      setLocalY(DEFAULTS.size.y);
      setCustomSize(false);
      setError(null);
      return;
    }

    // EDIT mode - load from options
    const opt = options || {};

    const safeNum = (v, fallback) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    };

    setCount(safeNum(opt?.count, safeNum(editingOrderUnit?.amount, DEFAULTS.count)) || DEFAULTS.count);

    setSize({
      x: safeNum(opt?.size?.x, DEFAULT_SIZE.x),
      y: safeNum(opt?.size?.y, DEFAULT_SIZE.y),
    });
    setLocalX(safeNum(opt?.size?.x, DEFAULT_SIZE.x));
    setLocalY(safeNum(opt?.size?.y, DEFAULT_SIZE.y));

    setMaterial({
      type: opt?.material?.type ?? DEFAULTS.material.type,
      thickness: opt?.material?.thickness ?? DEFAULTS.material.thickness,
      material: opt?.material?.material ?? DEFAULTS.material.material,
      materialId: opt?.material?.materialId ?? DEFAULTS.material.materialId,
      typeUse: opt?.material?.typeUse ?? DEFAULTS.material.typeUse,
    });

    setPhoto({
      type: opt?.photo?.type ?? DEFAULTS.photo.type,
      thickness: opt?.photo?.thickness ?? DEFAULTS.photo.thickness,
      material: opt?.photo?.material ?? DEFAULTS.photo.material,
      materialId: opt?.photo?.materialId ?? DEFAULTS.photo.materialId,
      typeUse: opt?.photo?.typeUse ?? DEFAULTS.photo.typeUse,
    });

    setColor({
      sides: opt?.color?.sides ?? DEFAULTS.color.sides,
      one: opt?.color?.one ?? DEFAULTS.color.one,
      two: opt?.color?.two ?? DEFAULTS.color.two,
      allSidesColor: opt?.color?.allSidesColor ?? DEFAULTS.color.allSidesColor,
    });

    // Service tabs
    const serviceFromOptions = opt?.selectedService || opt?.photo?.service;
    const serviceFallback = editingOrderUnit?.newField1 || editingOrderUnit?.nameOrderUnit;
    setSelectedService(normalizeService(serviceFromOptions || serviceFallback || DEFAULTS.selectedService));

    // Check if custom size
    const foundFormat = SIZE_FORMATS.find(
      (f) => f.x === safeNum(opt?.size?.x, DEFAULT_SIZE.x) && f.y === safeNum(opt?.size?.y, DEFAULT_SIZE.y)
    );
    setCustomSize(!foundFormat);

    setError(null);
  }, [showNewPhoto, isEdit, options, editingOrderUnit]);

  // Fetch materials
  useEffect(() => {
    if (!showNewPhoto) return;

    const data = {
      name: "MaterialsPrices",
      inPageCount: 999999,
      currentPage: 1,
      search: "",
      columnName: { column: "id", reverse: false },
      material,
      size,
    };

    axios
      .post(`/materials/NotAll`, data)
      .then((response) => {
        const rows = response.data.rows || [];
        setMaterials(rows);

        // Auto-select first material if none selected
        if (rows.length > 0 && !material.materialId) {
          setMaterial((prev) => ({
            ...prev,
            material: rows[0].name,
            materialId: rows[0].id,
          }));
        }
      })
      .catch((err) => {
        setMaterials([]);
        if (err?.response?.status === 403) {
          navigate("/login");
        }
      });
  }, [size, showNewPhoto, navigate]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target)) {
        setSizeDropdownOpen(false);
      }
      if (materialDropdownRef.current && !materialDropdownRef.current.contains(event.target)) {
        setMaterialDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ========== HANDLERS ==========

  const handleSizeSelect = (format) => {
    if (format.name === "Задати свій розмір") {
      setCustomSize(true);
      setSizeDropdownOpen(false);
      return;
    }

    setSize({ x: format.x, y: format.y });
    setLocalX(format.x);
    setLocalY(format.y);
    setCustomSize(false);
    setSizeDropdownOpen(false);
  };

  const applyCustomSize = () => {
    setSize({ x: localX, y: localY });
  };

  const handleMaterialSelect = (item) => {
    setMaterial((prev) => ({
      ...prev,
      material: item?.name || "",
      materialId: item?.id || 0,
    }));
    setMaterialDropdownOpen(false);
  };

  const handleSave = () => {
    const toCalcData = {
      nameOrderUnit: `${selectedService.toLowerCase() || ""} `,
      type: "Photo",
      selectedService: normalizeService(selectedService),
      newField1: normalizeService(selectedService),
      size,
      material: { ...material, type: "Не потрібно" },
      color: { ...color, sides: "Не потрібно" },
      lamination: DEFAULTS.lamination,
      big: "Не потрібно",
      cute: "Не потрібно",
      cuteLocal: {
        leftTop: false,
        rightTop: false,
        rightBottom: false,
        leftBottom: false,
      },
      holes: "Не потрібно",
      holesR: "",
      count,
      photo: {
        ...photo,
        service: normalizeService(selectedService),
      },
    };

    saveOrderUnit(toCalcData, editingOrderUnit, setError);
  };

  // ========== RENDER HELPERS ==========

  const selectedSizeFormat = SIZE_FORMATS.find((f) => f.x === size.x && f.y === size.y);
  const sizeTitle = customSize
    ? "Задати свій розмір"
    : selectedSizeFormat?.name || `${size.x} x ${size.y} мм`;
  const materialTitle = material?.material || "Виберіть матеріал";

  // Custom pricing summary for Photo
  const PhotoPrice = () => {
    if (!pricesThis) {
      return (
        <div className="bw-summary-title">
          <div className="bw-sticky">
            <div className="bwsubOP">Розрахунок завантажується...</div>
          </div>
        </div>
      );
    }

    return (
      <div className="bw-summary-title">
        <div className="bw-sticky">
          <div className="bwsubOP">Матеріали:</div>
          <div className="bw-calc-line">
            {(pricesThis.priceForThisUnitOfPapper || 0).toFixed(2)}
            <span className="bw-sub">грн</span>
            <span className="bw-op">×</span>
            {pricesThis.skolko || 0}
            <span className="bw-sub">шт</span>
            <span className="bw-op">=</span>
            {((pricesThis.priceForThisUnitOfPapper || 0) * (pricesThis.skolko || 0)).toFixed(2)}
            <span className="bw-sub">грн</span>
          </div>

          <div className="bwsubOP">Друк:</div>
          <div className="bw-calc-line">
            {(pricesThis.priceForDrukThisUnit || 0).toFixed(2)}
            <span className="bw-sub">грн</span>
            <span className="bw-op">×</span>
            {pricesThis.skolko || 0}
            <span className="bw-sub">шт</span>
            <span className="bw-op">=</span>
            {((pricesThis.priceForDrukThisUnit || 0) * (pricesThis.skolko || 0)).toFixed(2)}
            <span className="bw-sub">грн</span>
          </div>

          <div
            className="bw-calc-total d-flex justify-content-center align-content-center"
            style={{ fontWeight: "500", color: "red" }}
          >
            {pricesThis.price || 0}
            <span className="bw-sub">грн</span>
          </div>
        </div>
      </div>
    );
  };

  // ========== LEFT CONTENT ==========
  const leftContent = (
    <>
      {/* Count */}
      <div className="bw-title">Кількість</div>
      <div className="bw-row">
        <CountInput count={count} setCount={setCount} />
      </div>

      {/* Size */}
      <div className="bw-title">Розмір</div>
      <div className="bw-row">
        <div className="d-flex flex-row justify-content-between align-items-center w-100 gap-2">
          {/* Custom size inputs */}
          {customSize && (
            <div className="d-flex align-items-center gap-1">
              <input
                className="inputsArtem"
                type="number"
                value={localX}
                min={45}
                max={310}
                onChange={(e) => setLocalX(Number(e.target.value))}
                onBlur={applyCustomSize}
                style={{ width: "60px" }}
              />
              <span style={{ color: "#666" }}>x</span>
              <input
                className="inputsArtem"
                type="number"
                value={localY}
                min={45}
                max={440}
                onChange={(e) => setLocalY(Number(e.target.value))}
                onBlur={applyCustomSize}
                style={{ width: "60px" }}
              />
              <span style={{ color: "#666", fontSize: "12px" }}>мм</span>
            </div>
          )}

          {/* Size Dropdown */}
          <div
            className="custom-select-container selectArtem selectArtemBefore"
            ref={sizeDropdownRef}
            style={{ zIndex: 10, flex: customSize ? "0 0 auto" : "1" }}
          >
            <div
              className="custom-select-header"
              onClick={() => setSizeDropdownOpen(!sizeDropdownOpen)}
            >
              {sizeTitle}
            </div>

            {sizeDropdownOpen && (
              <div className="custom-select-dropdown">
                <div
                  className="custom-option"
                  onClick={() => handleSizeSelect({ name: "Задати свій розмір" })}
                >
                  <span className="name">Задати свій розмір</span>
                </div>
                {SIZE_FORMATS.map((item) => (
                  <div
                    key={item.name}
                    className={`custom-option ${!customSize && item.name === sizeTitle ? "active" : ""}`}
                    onClick={() => handleSizeSelect(item)}
                  >
                    <span className="name">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Material */}
      <div className="bw-title">Матеріал</div>
      <div className="bw-row">
        <div
          className="custom-select-container selectArtem selectArtemBefore"
          ref={materialDropdownRef}
          style={{ width: "100%" }}
        >
          <div
            className="custom-select-header"
            onClick={() => setMaterialDropdownOpen(!materialDropdownOpen)}
          >
            {materialTitle}
          </div>

          {materialDropdownOpen && (
            <div className="custom-select-dropdown">
              {materials.map((item) => (
                <div
                  key={item.id}
                  className={`custom-option ${
                    String(item.id) === String(material?.materialId) ? "active" : ""
                  }`}
                  onClick={() => handleMaterialSelect(item)}
                >
                  <span className="name">{item.name}</span>
                  <span className="gsm-sub">
                    <sub>{item.thickness} gsm</sub>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  // ========== RIGHT CONTENT ==========
  const rightContent = <PhotoPrice />;

  // ========== BOTTOM CONTENT ==========
  const bottomContent = (
    <>
      {/* Service tabs */}
      <div className="bw-product-tabs">
        {services.map((service) => (
          <button
            key={service}
            className={`btn ${selectedService === service ? "adminButtonAdd" : "adminButtonAdd-active"}`}
            style={{
              fontSize: "clamp(0.7rem, 0.7vh, 2.5vh)",
              minWidth: "2vw",
              height: "2vh",
            }}
            onClick={() => setSelectedService(service)}
          >
            {service}
          </button>
        ))}
      </div>

      {/* Action button */}
      <div className="bw-action">
        <button className="adminButtonAdd" variant="danger" onClick={handleSave}>
          {isEdit ? "Зберегти зміни" : "Додати до замовлення"}
        </button>
      </div>
    </>
  );

  // ========== RENDER ==========
  return (
    <ServiceModalWrapper
      show={showNewPhoto}
      onClose={() => setShowNewPhoto(false)}
      leftContent={leftContent}
      rightContent={rightContent}
      bottomContent={bottomContent}
      error={error}
      className="service-photo"
      setEditingOrderUnit={setEditingOrderUnit}
    />
  );
};

export default NewPhoto;
