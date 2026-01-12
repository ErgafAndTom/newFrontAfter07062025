import {MDBContainer} from "mdb-react-ui-kit";
import {Row} from "react-bootstrap";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import axios from '../../api/axiosInstance';

import versantIcon from "../public/photoe@2x.png";
import MaterialsInPhoto from "./newnomodals/photo/MaterialsInPhoto";
import SizesInPhoto from "./newnomodals/photo/SizesInPhoto";
import PhotoPosluga from "./newnomodals/photo/PhotoPosluga";
import {useNavigate} from "react-router-dom";
import Loader from "../../components/calc/Loader";

const NewPhoto = ({
                      thisOrder,
                      newThisOrder,
                      setNewThisOrder,
                      selectedThings2,
                      showNewPhoto,
                      setShowNewPhoto,
                      setThisOrder,
                      setSelectedThings2,
                      editingOrderUnit,
                      setEditingOrderUnit,

                  }) => {
    // const [show, setShow] = useState(false);
    const navigate = useNavigate();
    

    const safeSetShowNewPhoto = (val) => {
        if (typeof setShowNewPhoto === "function") return setShowNewPhoto(val);
        console.warn("setShowNewPhoto is not a function", { receivedType: typeof setShowNewPhoto, receivedValue: setShowNewPhoto });
    };

    const safeSetEditingOrderUnit = (val) => {
        if (typeof setEditingOrderUnit === "function") return setEditingOrderUnit(val);
        // optional: no-op
    };

    const isEdit = Boolean(editingOrderUnit?.id || editingOrderUnit?.idKey);

    const safeNum = (v, fallback) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
    };

    const parseOptionsJson = (ou) => {
        if (!ou?.optionsJson) return null;
        try {
            return JSON.parse(ou.optionsJson);
        } catch (e) {
            console.error("Bad optionsJson in NewPhoto", e);
            return null;
        }
    };

    const options = useMemo(() => parseOptionsJson(editingOrderUnit), [editingOrderUnit]);

    const DEFAULTS = {
        size: { x: 100, y: 150 },
        material: { type: "Фотопапір", thickness: "", material: "", materialId: "", typeUse: "А3" },
        photo: { type: "Не потрібно", thickness: "Тонкий", material: "", materialId: "", typeUse: "Тонкий" },
        color: { sides: "односторонній", one: "", two: "", allSidesColor: "CMYK" },
        lamination: { type: "Не потрібно", material: "", size: "" },
        big: "Не потрібно",
        cute: "Не потрібно",
        cuteLocal: { leftTop: false, rightTop: false, rightBottom: false, leftBottom: false },
        holes: "Не потрібно",
        holesR: "",
        count: 1,
        selectedService: "Фото",
    };

    // Canonical labels used in UI buttons
    const SERVICE_ALIASES = useMemo(
        () => ({
            "Диплома": "Диплом",
            "Сертифіката": "Сертифікат",
            "Подяки": "Подяка",
            "Візуалізації": "Візуалізація",
            "Графіки": "Графік",
        }),
        []
    );

    const normalizeService = (v) => {
        if (!v) return DEFAULTS.selectedService;
        return SERVICE_ALIASES[v] || v;
    };

const [load, setLoad] = useState(false);
    const [isVisible, setIsVisible] = useState(showNewPhoto);
    const [isAnimating, setIsAnimating] = useState(false);
    const [error, setError] = useState(null);
    const handleClose = () => {
        setIsAnimating(false); // Начинаем анимацию закрытия
        setTimeout(() => {
            setIsVisible(false)
            safeSetShowNewPhoto(false);
        }, 300); // После завершения анимации скрываем модальное окно
    }
    const handleShow = useCallback((event) => {
        safeSetShowNewPhoto(true);
    }, []);


    const [size, setSize] = useState({
        x: 100,
        y: 150
    });
    const [material, setMaterial] = useState({
        type: "Фотопапір",
        thickness: "",
        material: "",
        materialId: "",
        typeUse: "А3"
    });
    const [photo, setPhoto] = useState({
        type: "Не потрібно",
        thickness: "Тонкий",
        material: "",
        materialId: "",
        typeUse: "Тонкий"
    });
    const [color, setColor] = useState({
        sides: "односторонній",
        one: "",
        two: "",
        allSidesColor: "CMYK",
    });
    const [lamination, setLamination] = useState({
        type: "Не потрібно",
        material: "",
        size: ""
    });
    const [big, setBig] = useState("Не потрібно");
    const [cute, setCute] = useState("Не потрібно");
    const [cuteLocal, setCuteLocal] = useState({
        leftTop: false,
        rightTop: false,
        rightBottom: false,
        leftBottom: false,
    });
    const [holes, setHoles] = useState("Не потрібно");
    const [holesR, setHolesR] = useState("");
    const [count, setCount] = useState(1);
    const [prices, setPrices] = useState(null);
    const [pricesThis, setPricesThis] = useState(null);
    const [selectedService, setSelectedService] = useState("Фото");

    // ✅ Hydrate form state on open (like Vishichka)
    useEffect(() => {
        if (!showNewPhoto) return;

        // NEW
        if (!isEdit) {
            setSize(DEFAULTS.size);
            setMaterial(DEFAULTS.material);
            setPhoto(DEFAULTS.photo);
            setColor(DEFAULTS.color);
            setLamination(DEFAULTS.lamination);
            setBig(DEFAULTS.big);
            setCute(DEFAULTS.cute);
            setCuteLocal(DEFAULTS.cuteLocal);
            setHoles(DEFAULTS.holes);
            setHolesR(DEFAULTS.holesR);
            setCount(DEFAULTS.count);
            setSelectedService(DEFAULTS.selectedService);
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

        setLamination({
            type: opt?.lamination?.type ?? DEFAULTS.lamination.type,
            material: opt?.lamination?.material ?? DEFAULTS.lamination.material,
            size: opt?.lamination?.size ?? DEFAULTS.lamination.size,
        });

        setBig(opt?.big ?? DEFAULTS.big);
        setCute(opt?.cute ?? DEFAULTS.cute);

        setCuteLocal({
            leftTop: Boolean(opt?.cuteLocal?.leftTop ?? DEFAULTS.cuteLocal.leftTop),
            rightTop: Boolean(opt?.cuteLocal?.rightTop ?? DEFAULTS.cuteLocal.rightTop),
            rightBottom: Boolean(opt?.cuteLocal?.rightBottom ?? DEFAULTS.cuteLocal.rightBottom),
            leftBottom: Boolean(opt?.cuteLocal?.leftBottom ?? DEFAULTS.cuteLocal.leftBottom),
        });

        setHoles(opt?.holes ?? DEFAULTS.holes);
        setHolesR(opt?.holesR ?? DEFAULTS.holesR);

        // Tabs value can be persisted in different places depending on legacy versions.
        // Prefer optionsJson.selectedService, then optionsJson.photo.service, then DB field newField1 / description.
        const serviceFromOptions = opt?.selectedService || opt?.photo?.service;
        const serviceFallback = editingOrderUnit?.newField1 || editingOrderUnit?.nameOrderUnit || editingOrderUnit?.description;
        setSelectedService(normalizeService(serviceFromOptions || serviceFallback || DEFAULTS.selectedService));
    }, [showNewPhoto, isEdit, options, editingOrderUnit]);


    const addNewOrderUnit = e => {
        let dataToSend = {
            orderId: thisOrder.id,
            ...(isEdit && (editingOrderUnit?.id || editingOrderUnit?.idKey) ? { orderUnitId: (editingOrderUnit.id || editingOrderUnit.idKey) } : {}),
            toCalc: {
                nameOrderUnit: `${selectedService.toLowerCase() ? selectedService.toLowerCase() + " " : ""}`,
                type: "Photo",
                // ✅ Persist top service buttons state
                selectedService: normalizeService(selectedService),
                // ✅ Extra persistence for legacy DB schemas (doesn't affect pricing)
                newField1: normalizeService(selectedService),
                size: size,
                material: {
                    ...material,
                    type: "Не потрібно",
                },
                color: {
                    ...color,
                    sides: "Не потрібно",
                },
                lamination: lamination,
                big: big,
                cute: cute,
                cuteLocal: cuteLocal,
                holes: holes,
                holesR: holesR,
                count: count,
                photo: {
                    ...photo,
                    // ✅ Also keep it inside optionsJson (photo block is always serialized)
                    service: normalizeService(selectedService),
                },
            }
        };

        axios.post(`/orderUnits/OneOrder/OneOrderUnitInOrder`, dataToSend)
            .then(response => {
                // console.log(response.data);
                setThisOrder(response.data);
                // setSelectedThings2(response.data.order.OrderUnits || []);
                setSelectedThings2(response.data.OrderUnits);
                safeSetShowNewPhoto(false)
            })
            .catch(error => {
                if (error.response.status === 403) {
                    navigate('/login');
                }
                console.log(error.message);
                // setErr(error)
            });
    }


    useEffect(() => {
        let dataToSend = {
            type: "Photo",
            // optional, harmless for calc endpoint; helps debugging and future persistence
            selectedService: normalizeService(selectedService),
            size: size,
            material: material,
            color: color,
            lamination: lamination,
            big: big,
            cute: cute,
            cuteLocal: cuteLocal,
            holes: holes,
            count: count,
            photo: {
                ...photo,
                service: normalizeService(selectedService),
            },
        }
        axios.post(`/calc/pricing`, dataToSend)
            .then(response => {
                // console.log(response.data);
                setPricesThis(response.data.prices)
                setError(null)
            })
            .catch(error => {
                setError(error)
                if (error.response.status === 403) {
                    navigate('/login');
                }
                console.log(error.message);
            })
    }, [selectedService, size, material, color, lamination, big, cute, cuteLocal, holes, holesR, count, photo]);
    let handleClick = (e) => {
        setColor({
            sides: e,
            one: "",
            two: "",
            allSidesColor: "CMYK",
        })
    }
    let handleChange = (e) => {
        setCount(e)
    }


    useEffect(() => {
        if (showNewPhoto) {
            setIsVisible(true); // Сначала показываем модальное окно
            setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
        } else {
            setIsAnimating(false); // Начинаем анимацию закрытия
            setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
        }
    }, [showNewPhoto]);

    return (
        <>
          <style>{`
      .uiverse-topright{
        position:absolute;
        top:3vw;
        right:3vw;
        width:25vmin;
        height:30vmin;
        background: transparent;
       }
      .u-stack img{display:block;max-width:60%;}
      .u-stack{width:100%;max-width:400px;transition:0.25s ease;}
      .u-stack:hover{transform:rotate(5deg);}
      .u-stack:hover .u-card:before{transform:translateY(-2%) rotate(-4deg);}
      .u-stack:hover .u-card:after{transform:translateY(2%) rotate(4deg);}
      .u-card{aspect-ratio:3/2;border:1px solid;background:#f2f0e7;position:relative;
        transition:0.15s ease;cursor:pointer;padding:5% 5% 15% 5%;}
      .u-card:before,.u-card:after{content:"";display:block;position:absolute;height:100%;width:100%;
        border:1px solid;background:transparent;transform-origin:center;z-index:-1;transition:0.15s ease;top:0;left:0;}
      .u-card:before{transform:translateY(-2%) rotate(-6deg);}
      .u-card:after{transform:translateY(2%) rotate(6deg);}
      .u-image{width:100%;border:1px solid;background:#ebebe6;aspect-ratio:1/1;position:relative;
        display:flex;align-items:center;justify-content:center;}
      `}</style>
            {isVisible === true ? (
                <div>
                    <div
                      style={{
                        position: 'fixed',
                        inset: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(15, 15, 15, 0.45)',
                        backdropFilter: 'blur(2px)',
                        WebkitBackdropFilter: 'blur(2px)',
                        zIndex: 99,
                        opacity: isAnimating ? 1 : 0,
                        transition: 'opacity 200ms ease'
                      }}
                        onClick={handleClose}
                    ></div>
                    <div className="d-flex flex-column" style={{
                        zIndex: "100",
                        position: "fixed",
                        background: "#dcd9ce",
                        top: "50%",
                        left: "50%",
                        transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.8)", // анимация масштаба
                        opacity: isAnimating ? 1 : 0, // анимация прозрачности
                        transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out", // плавная анимация
                        borderRadius: "1vw",
                        width: "95vw",
                        height: "95vh",
                        // padding: "20px"
                    }}>
                      <div className="uiverse-topright">
                        <div className="u-stack">
                          <div className="u-card">
                            <div className="u-image">
                              <img src={versantIcon} alt="Versant" />
                            </div>
                          </div>
                        </div>
                      </div>
                        <div className="d-flex">
                            <div className="m-auto text-center fontProductName">
                                {/*<div className="d-flex flex-wrap justify-content-center">*/}
                                {/*    {["Фото", "Диплома", "Сертифіката", "Подяки", "Візуалізації", "Графіки"].map((service, index) => (*/}
                                {/*        <button*/}
                                {/*            key={index}*/}
                                {/*            className={`btn ${selectedService === service ? 'adminButtonAdd' : 'adminButtonAdd-primary'} m-1`}*/}
                                {/*            style={{minWidth: "5vw"}}*/}
                                {/*            onClick={() => setSelectedService(service)}*/}
                                {/*        >*/}
                                {/*            {service}*/}
                                {/*        </button>*/}
                                {/*    ))}*/}
                                {/*</div>*/}
                              <div className="d-flex flex-wrap justify-content-center">
                                    {["Фото", "Диплом", "Сертифікат", "Подяка", "Візуалізація", "Графік"].map((service, index) => (
                                        <button
                                            key={index}
                                            className={`btn ${selectedService === service ? 'adminButtonAdd' : 'adminButtonAdd-primary'} m-1`}
                                            style={{minWidth: "5vw"}}
                                            onClick={() => setSelectedService(service)}
                                        >
                                            {service}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div
                                className="btn btn-close btn-lg"
                                style={{
                                    margin: "0.5vw",
                                }}
                                onClick={handleClose}
                            >
                            </div>
                        </div>
                        <div className="d-flex flex-row inputsArtemkilk allArtemElem" style={{
                            marginLeft: "1.4vw",
                            border: "transparent",
                            justifyContent: "left",
                            marginTop: "1vw"
                        }}> У кількості:
                            <input
                                className="d-flex inputsArtemNumber inputsArtem "
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
                                // disabled
                                onChange={(event) => handleChange(event.target.value)}
                            />
                            <div className="inputsArtemx allArtemElem"
                                 style={{border: "transparent", marginTop: "-2vh"}}> шт
                            </div>
                        </div>

                        <div className="d-flex flex-column" style={{padding: "0vw"}}>

                            <MDBContainer fluid style={{width: '100%'}}>
                                <Row xs={1} md={6} className="">
                                    <div className="d-flex flex-column">
                                        <SizesInPhoto
                                            size={size}
                                            setSize={setSize}
                                            prices={prices}
                                            type={"Photo"}
                                            buttonsArr={["односторонній"]}
                                            color={color}
                                            setColor={setColor}
                                            count={count}
                                            setCount={setCount}

                                        />
                                        <MaterialsInPhoto
                                            material={material}
                                            setMaterial={setMaterial}
                                            count={count}
                                            setCount={setCount}
                                            prices={prices}
                                            size={size}
                                            selectArr={["3,5 мм", "4 мм", "5 мм", "6 мм", "8 мм"]}
                                            name={"Фото друк на фото принтері:"}
                                            buttonsArr={["Тонкий",
                                                "Середньої щільності",
                                                "Цупкі", "Самоклеючі"]}
                                            typeUse={"Фото"}
                                        />


                                    </div>
                                </Row>
                                <div className="d-flex">
                                    {thisOrder && (
                                        <div
                                            className="d-flex align-content-between justify-content-between"
                                            style={{
                                                height: "15vmin",
                                                marginLeft: "2.5vw",
                                                fontWeight: "bold",
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                transition: "all 0.3s ease",

                                            }}
                                        >
                                            <button className="adminButtonAdd" variant="danger"
                                                    onClick={addNewOrderUnit}
                                            >
                                                {isEdit ? "Зберегти зміни" : "Додати до замовлення"}
                                            </button>

                                        </div>
                                    )}
                                </div>
                                {error &&
                                    <div>{error.message}</div>
                                }
                                {null === pricesThis ? (
                                    <div style={{width: '50vw'}}>

                                    </div>
                                ) : (
                                    <div className="d-flex justify-content-between pricesBlockContainer"
                                         style={{height: "20vmin"}}>
                                        <div className="" style={{height: "19vmin"}}>
                                            {/*<div className="adminFont fontInfoForPricing1">*/}
                                            {/*    {pricesThis.skolkoListovNaOdin}шт. - Виробів з 1 листа A3(можливо зробити)*/}
                                            {/*</div>*/}
                                            {/*<div className="adminFont fontInfoForPricing">*/}
                                            {/*    {pricesThis.skolko}шт. - Затрачено листів (A3)*/}
                                            {/*</div>*/}
                                            <div className="fontInfoForPricing">
                                                Матеріали: {pricesThis.priceForThisUnitOfPapper} грн
                                                * {pricesThis.skolko} шт
                                                = {pricesThis.priceForThisUnitOfPapper * pricesThis.skolko} грн
                                            </div>
                                            <div className=" fontInfoForPricing">
                                                Друк: {pricesThis.priceForDrukThisUnit} грн * {pricesThis.skolko} шт
                                                = {pricesThis.priceForDrukThisUnit * pricesThis.skolko} грн
                                            </div>
                                            {/*<div className="adminFont fontInfoForPricing">*/}
                                            {/*    {pricesThis.priceForThisUnitOfLamination}грн. * {pricesThis.skolko}шт.*/}
                                            {/*    = {pricesThis.priceForThisAllUnitsOfLamination}грн. - Ціна за ламінацію*/}
                                            {/*</div>*/}
                                            {/*<div className="adminFont fontInfoForPricing">*/}
                                            {/*    {pricesThis.priceForThisUnitOfBig}грн. * {count}шт.*/}
                                            {/*    = {pricesThis.priceForAllUnitsOfBig}грн.*/}
                                            {/*    - Ціна за бігування*/}
                                            {/*</div>*/}
                                            {/*<div className="adminFont fontInfoForPricing">*/}
                                            {/*    {pricesThis.priceForThisUnitOfCute}грн. * {count}шт.*/}
                                            {/*    = {pricesThis.priceForAllUnitsOfCute}грн.*/}
                                            {/*    - Ціна за скруглення кутів*/}
                                            {/*</div>*/}
                                            {/*<div className="adminFont fontInfoForPricing">*/}
                                            {/*    {pricesThis.priceForThisUnitOfHoles}грн. * {count}шт.*/}
                                            {/*    = {pricesThis.priceForAllUnitsOfHoles}грн.*/}
                                            {/*    - Ціна за дірки*/}
                                            {/*</div>*/}
                                            {/*<div className="adminFont fontInfoForPricing">*/}
                                            {/*    {pricesThis.priceForThisUnitOfPapper * pricesThis.skolko}+*/}
                                            {/*    {pricesThis.priceForDrukThisUnit * pricesThis.skolko}+*/}
                                            {/*    {pricesThis.priceForThisAllUnitsOfLamination}+*/}
                                            {/*    {pricesThis.priceForAllUnitsOfBig}+*/}
                                            {/*    {pricesThis.priceForAllUnitsOfCute}+*/}
                                            {/*    {pricesThis.priceForAllUnitsOfHoles}=*/}
                                            {/*    {pricesThis.price}*/}
                                            {/*</div>*/}
                                            <div className="fontInfoForPricing1">
                                                Загалом {pricesThis.price} грн
                                            </div>
                                        </div>


                                        <img
                                            className="versant80-img-icon"
                                            // alt="sssss"
                                            src={versantIcon}
                                            style={{height: "16vmin"}}
                                        />
                                    </div>
                                )}
                            </MDBContainer>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    style={{display: "none"}}
                ></div>
            )}
        </>
    )

    return (
        <div>
            <Loader/>
        </div>
    )
};

export default NewPhoto;
