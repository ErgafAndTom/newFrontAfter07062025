// Vishichka.jsx
import { MDBContainer } from "mdb-react-ui-kit";
import { Row } from "react-bootstrap";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "../../api/axiosInstance";
import NewNoModalSize from "./newnomodals/NewNoModalSizeColor";
import versantIcon from "../../components/newUIArtem/printers/p9.svg";
import Materials2 from "./newnomodals/Materials2";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/calc/Loader";
import VishichkaVibor from "./newnomodals/vishichka/VishichkaVibor";
import PlivkaMontajna from "./newnomodals/plivka/PlivkaMontajna";
import NewNoModalLamination from "./newnomodals/NewNoModalLamination";
import {columnTranslations as editingOrderUnit} from "../user/translations";

/**
 * Мапа типів висічки (лейбл -> typeUse)
 */
const VISHICHKA_MAP = {
  SHEET_CUT: {
    label: "з плотерною порізкою на надрукованих аркушах",
    typeUse: "sheet_cut",
  },
  STICKERPACK: {
    label: "з плотерною порізкою стікерпаків",
    typeUse: "stickerpack",
  },
  SINGLE_ITEMS: {
    label: "з плотерною порізкою окремими виробами",
    typeUse: "single_items",
  },
};
const isEdit = Boolean(editingOrderUnit?.id);

const DEFAULTS = {
  count: 1,
  size: { x: 310, y: 440 },

  // ✅ для нового замовлення: показує "Виберіть матеріал"
  material: {
    type: "Плівка",
    thickness: "Самоклеючі",
    material: "",
    materialId: 0,
    typeUse: "Самоклеючі",
    a: "",
  },

  color: {
    sides: "односторонній",
    one: "",
    two: "",
    allSidesColor: "CMYK",
  },

  lamination: {
    type: "Не потрібно",
    material: "З глянцевим ламінуванням",
    materialId: "",
    size: "",
    typeUse: "А3",
  },

  // ✅ для нового замовлення: дефолт як на твоєму скріні
  vishichka: {
    type: "vishichka",
    thickness: "Тонкі",
    material: VISHICHKA_MAP.SHEET_CUT.label,
    materialId: "", // підтягнемо з pricing.selectedVishichka.id
    typeUse: VISHICHKA_MAP.SHEET_CUT.typeUse,
  },

  plivkaMontajna: {
    type: "plivka",
    thickness: "Тонкі",
    material: "Немає Монтажної плівки",
    materialId: "0",
    typeUse: null,
  },

  big: "Не потрібно",
  cute: "Не потрібно",
  cuteLocal: {
    leftTop: false,
    rightTop: false,
    rightBottom: false,
    leftBottom: false,
    radius: "",
  },
  holes: "Не потрібно",
  holesR: "",
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

function normalizeVishichkaByLabel(v) {
  const label = (v?.material || "").trim();
  if (!label) return v;

  const found = Object.values(VISHICHKA_MAP).find((x) => x.label === label);
  if (!found) return v;

  return {
    ...v,
    type: v?.type || "vishichka",
    typeUse: found.typeUse,
  };
}

const Vishichka = ({
                     thisOrder,
                     newThisOrder,
                     setNewThisOrder,
                     selectedThings2,
                     setShowVishichka,
                     setThisOrder,
                     setSelectedThings2,
                     showVishichka,
                     editingOrderUnit,
                   }) => {
  const navigate = useNavigate();

  const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.idKey);
  const options = useMemo(() => parseOptionsJson(editingOrderUnit), [editingOrderUnit]);

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(null);

  // ✅ prices має бути масивом (інакше десь падає .map)
  const [prices, setPrices] = useState([]);

  // state
  const [count, setCount] = useState(DEFAULTS.count);
  const [size, setSize] = useState(DEFAULTS.size);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [color, setColor] = useState(DEFAULTS.color);
  const [lamination, setLamination] = useState(DEFAULTS.lamination);

  const [vishichka, setVishichka] = useState(normalizeVishichkaByLabel(DEFAULTS.vishichka));
  const [plivkaMontajna, setPlivkaMontajna] = useState(DEFAULTS.plivkaMontajna);

  const [big, setBig] = useState(DEFAULTS.big);
  const [cute, setCute] = useState(DEFAULTS.cute);
  const [cuteLocal, setCuteLocal] = useState(DEFAULTS.cuteLocal);
  const [holes, setHoles] = useState(DEFAULTS.holes);
  const [holesR, setHolesR] = useState(DEFAULTS.holesR);

  const [pricesThis, setPricesThis] = useState(null);
  const [selectedService, setSelectedService] = useState("Наліпки");

  const setVishichkaSafe = useCallback((nextOrUpdater) => {
    setVishichka((prev) => {
      const next = typeof nextOrUpdater === "function" ? nextOrUpdater(prev) : nextOrUpdater;
      const merged = { ...prev, ...(next || {}) };
      return normalizeVishichkaByLabel(merged);
    });
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      setShowVishichka(false);
    }, 300);
  };

  const handleChangeCount = (v) => setCount(safeNum(v, 1));

  /**
   * ✅ ГОЛОВНЕ: кожен раз при відкритті модалки
   * - якщо New (не edit) -> повний reset до дефолтів
   * - якщо Edit -> підтягуємо з optionsJson
   */
  useEffect(() => {
    if (!showVishichka) return;

    setError(null);

    if (!isEdit) {
      setCount(DEFAULTS.count);
      setSize(DEFAULTS.size);
      setMaterial(DEFAULTS.material);
      setColor(DEFAULTS.color);
      setLamination(DEFAULTS.lamination);
      setVishichkaSafe(DEFAULTS.vishichka);
      setPlivkaMontajna(DEFAULTS.plivkaMontajna);
      setBig(DEFAULTS.big);
      setCute(DEFAULTS.cute);
      setCuteLocal(DEFAULTS.cuteLocal);
      setHoles(DEFAULTS.holes);
      setHolesR(DEFAULTS.holesR);
      setSelectedService("Наліпки");
      setPricesThis(null);
      return;
    }

    // EDIT
    const opt = options || null;

    setCount(safeNum(opt?.count, safeNum(editingOrderUnit?.amount, DEFAULTS.count)) || DEFAULTS.count);

    setSize({
      x: safeNum(opt?.size?.x, safeNum(editingOrderUnit?.newField2, DEFAULTS.size.x)),
      y: safeNum(opt?.size?.y, safeNum(editingOrderUnit?.newField3, DEFAULTS.size.y)),
    });

    setMaterial({
      type: opt?.material?.type ?? DEFAULTS.material.type,
      thickness: opt?.material?.thickness ?? DEFAULTS.material.thickness,
      material: opt?.material?.material ?? DEFAULTS.material.material,
      materialId: opt?.material?.materialId ?? DEFAULTS.material.materialId,
      typeUse: opt?.material?.typeUse ?? DEFAULTS.material.typeUse,
      a: opt?.material?.a ?? DEFAULTS.material.a,
    });

    setColor({
      sides: opt?.color?.sides ?? DEFAULTS.color.sides,
      one: opt?.color?.one ?? DEFAULTS.color.one,
      two: opt?.color?.two ?? DEFAULTS.color.two,
      allSidesColor: opt?.color?.allSidesColor ?? DEFAULTS.color.allSidesColor,
    });

    setLamination({
      type: opt?.lamination?.type ?? DEFAULTS.lamination.type,
      material: opt?.lamination?.material ?? DEFAULTS.lamination.material,
      materialId: opt?.lamination?.materialId ?? DEFAULTS.lamination.materialId,
      size: opt?.lamination?.size ?? DEFAULTS.lamination.size,
      typeUse: opt?.lamination?.typeUse ?? DEFAULTS.lamination.typeUse,
    });

    setVishichkaSafe({
      type: opt?.vishichka?.type ?? DEFAULTS.vishichka.type,
      thickness: opt?.vishichka?.thickness ?? DEFAULTS.vishichka.thickness,
      material: opt?.vishichka?.material ?? DEFAULTS.vishichka.material,
      materialId: opt?.vishichka?.materialId ?? DEFAULTS.vishichka.materialId,
      typeUse: opt?.vishichka?.typeUse ?? DEFAULTS.vishichka.typeUse,
    });

    setPlivkaMontajna({
      type: opt?.plivkaMontajna?.type ?? DEFAULTS.plivkaMontajna.type,
      thickness: opt?.plivkaMontajna?.thickness ?? DEFAULTS.plivkaMontajna.thickness,
      material: opt?.plivkaMontajna?.material ?? DEFAULTS.plivkaMontajna.material,
      materialId: opt?.plivkaMontajna?.materialId ?? DEFAULTS.plivkaMontajna.materialId,
      typeUse: opt?.plivkaMontajna?.typeUse ?? DEFAULTS.plivkaMontajna.typeUse,
    });

    setBig(opt?.big ?? DEFAULTS.big);
    setCute(opt?.cute ?? DEFAULTS.cute);

    setCuteLocal({
      leftTop: opt?.cuteLocal?.leftTop ?? DEFAULTS.cuteLocal.leftTop,
      rightTop: opt?.cuteLocal?.rightTop ?? DEFAULTS.cuteLocal.rightTop,
      rightBottom: opt?.cuteLocal?.rightBottom ?? DEFAULTS.cuteLocal.rightBottom,
      leftBottom: opt?.cuteLocal?.leftBottom ?? DEFAULTS.cuteLocal.leftBottom,
      radius: opt?.cuteLocal?.radius ?? DEFAULTS.cuteLocal.radius,
    });

    setHoles(opt?.holes ?? DEFAULTS.holes);
    setHolesR(opt?.holesR ?? DEFAULTS.holesR);
    setPricesThis(null);
  }, [showVishichka, isEdit, options, editingOrderUnit, setVishichkaSafe]);

  // MODAL ANIMATION
  useEffect(() => {
    if (showVishichka) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 100);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [showVishichka]);

  // CATALOG PRICES (для Materials2 / Size / інше)
  useEffect(() => {
    axios
      .get(`/getpricesNew`)
      .then((res) => {
        const data = res?.data;
        const arr = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
        setPrices(arr);
      })
      .catch((err) => {
        if (err?.response?.status === 403) navigate("/login");
        console.log(err?.message);
      });
  }, [navigate]);

  // PRICING
  useEffect(() => {
    if (!showVishichka) return;

    const dataToSend = {
      type: "Vishichka",
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
      vishichka,
      plivkaMontajna,
    };

    axios
      .post(`/calc/pricing`, dataToSend)
      .then((response) => {
        const p = response?.data?.prices ?? null;
        setPricesThis(p);

        // ✅ підтягнути materialId висічки з pricing, але без зациклення
        const selectedV = p?.selectedVishichka;

        if (selectedV?.id) {
          setVishichka((prev) => {
            const prevId = prev?.materialId ? String(prev.materialId) : "";
            const nextId = String(selectedV.id);

            const shouldSetId = !prevId || prevId === "0";
            const shouldSetLabel = !prev?.material;

            if (!shouldSetId && !shouldSetLabel) return prev;

            const next = {
              ...prev,
              materialId: shouldSetId ? selectedV.id : prev.materialId,
              // label не перетираємо, якщо вже є
              material: shouldSetLabel ? (selectedV.name || prev.material) : prev.material,
              type: prev?.type || selectedV.type || "vishichka",
              typeUse: prev?.typeUse || selectedV.typeUse || prev?.typeUse,
            };
            return normalizeVishichkaByLabel(next);
          });
        }
      })
      .catch((err) => {
        if (err?.response?.status === 403) navigate("/login");
        console.log(err?.message);
      });
  }, [
    showVishichka,
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
    vishichka,
    plivkaMontajna,
    navigate,
  ]);

  // SAVE
  const addNewOrderUnit = () => {
    const v = normalizeVishichkaByLabel(vishichka);

    if (!v?.material || !v?.typeUse) {
      setError({ response: { data: { error: "Оберіть тип плотерної порізки" } } });
      return;
    }

    if (!v?.materialId) {
      setError({
        response: {
          data: {
            error:
              "Не вдалося визначити ID висічки (materialId). Перемкніть тип висічки або оновіть сторінку.",
          },
        },
      });
      return;
    }

    const nameOrderUnit = selectedService ? `${selectedService.toLowerCase()} ` : "";

    const dataToSend = {
      orderId: thisOrder?.id,
      toCalc: {
        nameOrderUnit,
        type: "Vishichka",
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
        vishichka: v,
        plivkaMontajna,
      },
    };

    axios
      .post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
      .then((response) => {
        setThisOrder(response.data);
        setSelectedThings2(response.data?.OrderUnits || []);
        setShowVishichka(false);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        if (err?.response?.status === 403) navigate("/login");
        console.log(err?.message);
      });
  };

  // якщо модалка закрита — нічого не рендеримо
  if (!isVisible) return <div style={{ display: "none" }} />;

  return (
    <div>
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 15, 15, 0.45)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          zIndex: 99,
          opacity: isAnimating ? 1 : 0,
          transition: "opacity 200ms ease",
        }}
        onClick={handleClose}
      />

      <div
        className="d-flex flex-column"
        style={{
          zIndex: "100",
          position: "fixed",
          background: "#dcd9ce",
          top: "50%",
          left: "50%",
          transform: isAnimating
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.8)",
          opacity: isAnimating ? 1 : 0,
          transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
          borderRadius: "1vw",
          width: "95vw",
          height: "95vh",
        }}
      >
        <div className="d-flex">
          <div className="m-auto text-center fontProductName">
            <div className="d-flex flex-wrap justify-content-center">
              {[
                "Наліпки",
                "Стікери",
                "Стікерпак",
                "Стікерсет",
                "Бірки",
                "Листівки",
                "Коробочки",
                "Фішки",
                "Цінник",
                "Меню",
              ].map((service, index) => (
                <button
                  key={index}
                  className={`btn ${
                    selectedService === service ? "adminButtonAdd" : "adminButtonAdd-primary"
                  } m-1`}
                  style={{ minWidth: "5vw" }}
                  onClick={() => setSelectedService(service)}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>

          <div className="btn btn-close btn-lg" style={{ margin: "0.5vw" }} onClick={handleClose} />
        </div>

        <div className="d-flex flex-column">
          <div
            className="d-flex flex-row inputsArtemkilk allArtemElem"
            style={{
              marginLeft: "1.4vw",
              border: "transparent",
              justifyContent: "left",
              marginTop: "1vw",
            }}
          >
            У кількості:
            <input
              className="d-flex inputsArtemNumber inputsArtem"
              style={{
                marginLeft: "1vw",
                width: "5vw",
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: "0.5vw",
              }}
              type="number"
              value={count}
              min={1}
              onChange={(e) => handleChangeCount(e.target.value)}
            />
            <div className="inputsArtemx allArtemElem" style={{ border: "transparent", marginTop: "-2vh" }}>
              шт
            </div>
          </div>

          <MDBContainer fluid style={{ width: "100%", marginLeft: "-2vh", marginTop: "2vh" }}>
            <Row xs={1} md={0} className="">
              <div className="d-flex flex-column">
                <NewNoModalSize
                  size={size}
                  setSize={setSize}
                  prices={prices}
                  type={"Vishichka"}
                  buttonsArr={["односторонній", "двосторонній"]}
                  color={color}
                  setColor={setColor}
                  count={count}
                  setCount={setCount}
                  defaultt={"А3 (297 х 420 мм)"}
                />

                <div className="d-flex flex-column" style={{ marginLeft: "-2vh" }}>
                  <Materials2
                    material={material}
                    setMaterial={setMaterial}
                    count={count}
                    setCount={setCount}
                    prices={prices}
                    size={size}
                    selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                    name={"Чорно-білий друк на монохромному принтері:"}
                    buttonsArr={["Тонкий", "Середній", "Цупкий", "Самоклеючі"]}
                    typeUse={null}
                    editingOrderUnit={editingOrderUnit}
                  />
                </div>

                <VishichkaVibor
                  size={size}
                  vishichka={vishichka}
                  setVishichka={setVishichkaSafe}
                  prices={prices}
                  isEdit={isEdit}
                  buttonsArr={[
                    VISHICHKA_MAP.SHEET_CUT.label,
                    VISHICHKA_MAP.STICKERPACK.label,
                    VISHICHKA_MAP.SINGLE_ITEMS.label,
                  ]}
                  editingOrderUnit={editingOrderUnit}
                />

                <NewNoModalLamination
                  lamination={lamination}
                  setLamination={setLamination}
                  prices={prices}
                  size={size}
                  type={"SheetCut"}
                  isVishichka={true}
                  buttonsArr={[
                    "з глянцевим ламінуванням",
                    "з матовим ламінуванням",
                    "з ламінуванням SoftTouch",
                    "з холодним матовим ламінуванням",
                  ]}
                  selectArr={["30", "70", "80", "100", "125", "250"]}
                />

                <PlivkaMontajna
                  size={size}
                  plivkaMontajna={plivkaMontajna}
                  setPlivkaMontajna={setPlivkaMontajna}
                  vishichka={vishichka}
                  setVishichka={setVishichkaSafe}
                  prices={prices}
                  buttonsArr={[
                    VISHICHKA_MAP.SHEET_CUT.label,
                    VISHICHKA_MAP.STICKERPACK.label,
                    VISHICHKA_MAP.SINGLE_ITEMS.label,
                  ]}
                />
              </div>
            </Row>

            {/* Кнопка додати */}
            <div className="d-flex">
              {thisOrder && (
                <div
                  className="d-flex align-content-between justify-content-between"
                  style={{
                    width: "90vw",
                    marginLeft: "2.5vw",
                    fontWeight: "bold",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    transition: "all 0.3s ease",
                    height: "3vw",
                  }}
                >
                  <button className="adminButtonAdd" onClick={addNewOrderUnit}>
                    Додати до замовлення
                  </button>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  transition: "all 0.3s ease",
                  color: "red",
                  width: "20vw",
                  marginLeft: "2.5vw",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "3vw",
                  marginTop: "1vh",
                  marginBottom: "1vh",
                  border: "1px solid red",
                  borderRadius: "10px",
                  padding: "10px",
                  backgroundColor: "rgba(255, 0, 0, 0.2)",
                  fontSize: "1.5vw",
                  fontWeight: "bold",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                {error?.response?.data?.error || "Помилка"}
              </div>
            )}

            {/* Pricing */}
            {!pricesThis ? (
              <div style={{ width: "100%", padding: "2vh" }}>
                <Loader />
              </div>
            ) : (
              <div className="d-flex justify-content-between pricesBlockContainer" style={{ height: "12vw" }}>
                <div style={{ padding: "1vh" }}>
                  <div className="fontInfoForPricing">
                    Друк: {pricesThis.priceDrukPerSheet} грн * {pricesThis.sheetCount} шт ={" "}
                    {pricesThis.priceDrukPerSheet * pricesThis.sheetCount} грн
                  </div>

                  <div className="fontInfoForPricing">
                    Матеріали: {pricesThis.pricePaperPerSheet} грн * {pricesThis.sheetCount} шт ={" "}
                    {pricesThis.pricePaperPerSheet * pricesThis.sheetCount} грн
                  </div>

                  <div className="fontInfoForPricing">
                    Висічка: {pricesThis.priceVishichkaPerSheet} грн * {pricesThis.sheetCount} шт ={" "}
                    {pricesThis.totalVishichkaPrice} грн
                  </div>

                  <div className="fontInfoForPricing">
                    Монтажка + вибірка: {pricesThis.pricePlivkaPerSheet} грн * {pricesThis.sheetCount} шт ={" "}
                    {pricesThis.totalPlivkaPrice} грн
                  </div>

                  <div className="fontInfoForPricing">
                    Ламінація: {pricesThis.priceLaminationPerSheet} грн * {pricesThis.sheetCount} шт ={" "}
                    {pricesThis.priceLaminationPerSheet * pricesThis.sheetCount} грн
                  </div>

                  <div className="fontInfoForPricing1" style={{ marginTop: "0.5vw", color: "#ee3c23" }}>
                    Загалом: {pricesThis.price} грн
                  </div>

                  <div className="fontInfoForPricing">
                    - З одного аркуша можна виробити: {pricesThis.sheetsPerUnit} шт
                  </div>

                  <div className="fontInfoForPricing">
                    - Використано аркушів(А3/SrA3/SrA3+): {pricesThis.sheetCount} шт
                  </div>

                  <div className="fontInfoForPricing1">За 1 аркуш: {pricesThis.priceForItemWithExtras} грн</div>
                  <div className="fontInfoForPricing1">За 1 виріб: {pricesThis.priceForItemWithExtras} грн</div>
                </div>

                <img className="versant80-img-icon" alt="printer" src={versantIcon} style={{ height: "16vmin" }} />
              </div>
            )}
          </MDBContainer>
        </div>
      </div>
    </div>
  );
};

export default Vishichka;
