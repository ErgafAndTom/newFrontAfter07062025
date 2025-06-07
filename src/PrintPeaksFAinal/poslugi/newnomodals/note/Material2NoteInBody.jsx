import React, { useEffect, useState } from "react";
import axios from "../../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";

const Materials2NoteInBody = ({
                                  materialAndDrukInBody,
                                  setMaterialAndDrukInBody,
                                  count, // global count – більше не використовується
                                  setCount,
                                  prices,
                                  type,
                                  name,
                                  buttonsArr,
                                  buttonsArrDruk,
                                  buttonsArrColor,
                                  buttonsArrLamination,
                                  selectArr,
                                  typeUse,
                                  size
                              }) => {
    // Стан для матеріалів по гілках
    const [paperColorDruk, setPaperColorDruk] = useState([]);
    const [paperBwDruk, setPaperBwDruk] = useState([]);
    const [paperNonDruk, setPaperNonDruk] = useState([]);
    const [loadPaperColor, setLoadPaperColor] = useState(true);
    const [loadPaperBW, setLoadPaperBW] = useState(true);
    const [loadPaperNON, setLoadPaperNON] = useState(true);

    // Стан для ламінування по гілках
    const [laminationColorDruk, setLaminationColorDruk] = useState([]);
    const [laminationBwDruk, setLaminationBwDruk] = useState([]);
    const [laminationNonDruk, setLaminationNonDruk] = useState([]);
    const [loadLaminationColor, setLoadLaminationColor] = useState(true);
    const [loadLaminationBW, setLoadLaminationBW] = useState(true);
    const [loadLaminationNON, setLoadLaminationNON] = useState(true);

    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Загальний обробник для вибору матеріалу
    const handleSelectChange = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const selectedId = selectedOption.getAttribute("data-id") || "default";
        const selectedValue = e.target.value || "";
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            material: selectedValue,
            materialId: selectedId
        }));
    };

    // ------------- Гілка "Color" (Кольоровий друк) -------------
    const handleSelectTypeColorChange = (e) => {
        const selectedValue = e.target.value || "";
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            ColorDrukMaterialTypeUse: selectedValue
        }));
    };

    const handleToggleColor = () => {
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            ColorDrukMaterialType:
                prev.ColorDrukMaterialType === "Не потрібно" ? "Папір" : "Не потрібно"
        }));
    };
    const handleSelectColorDrukChange = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const selectedId = selectedOption.getAttribute("data-id") || "default";
        const selectedValue = e.target.value || "";
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            ColorDrukMaterial: selectedValue,
            ColorDrukMaterialId: selectedId
        }));
    };

    const handleToggleColorLamination = () => {
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            ColorDrukLaminationType:
                prev.ColorDrukLaminationType === "Не потрібно" ? "" : "Не потрібно"
        }));
    };

    const handleSelectDrukColorLamination = (e) => {
        const selectedValue = e.target.value || "";
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            ColorDrukLaminationTypeUse: selectedValue
        }));
    };
    const handleSelectDrukColorLaminationTh = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const selectedId = selectedOption.getAttribute("data-id") || "default";
        const selectedValue = e.target.value || "";
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            ColorDrukLaminationMaterial: selectedValue,
            ColorDrukLaminationMaterialId: selectedId
        }));
    };

    // Обробники для оновлення кількості у гілці "Color"
    const handleColorCountChange = (e) => {
        const value = Number(e.target.value);
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            colorCount: value
        }));
    };

    useEffect(() => {
        const data = {
            name: "MaterialsPrices",
            inPageCount: 999999,
            currentPage: 1,
            search: "",
            columnName: { column: "id", reverse: false },
            size: size,
            material: {
                type: materialAndDrukInBody.ColorDrukMaterialType,
                typeUse: materialAndDrukInBody.ColorDrukMaterialTypeUse
            }
        };
        setLoadPaperColor(true);
        setError(null);
        axios
            .post(`/materials/NotAll`, data)
            .then((response) => {
                setPaperColorDruk(response.data.rows);
                setLoadPaperColor(false);
                if (response.data?.rows?.[0]) {
                    setMaterialAndDrukInBody((prev) => ({
                        ...prev,
                        ColorDrukMaterial: response.data.rows[0].name,
                        ColorDrukMaterialId: response.data.rows[0].id
                    }));
                } else {
                    setMaterialAndDrukInBody((prev) => ({
                        ...prev,
                        ColorDrukMaterial: "Немає",
                        ColorDrukMaterialId: 0
                    }));
                }
            })
            .catch((err) => {
                setLoadPaperColor(false);
                setError(err.message);
                if (err.response?.status === 403) {
                    navigate("/login");
                }
                console.log(err.message);
            });
    }, [
        materialAndDrukInBody.ColorDrukMaterialType,
        materialAndDrukInBody.ColorDrukMaterialTypeUse,
        size
    ]);

    useEffect(() => {
        const data = {
            name: "MaterialsPrices",
            inPageCount: 999999,
            currentPage: 1,
            type: "SheetCut",
            search: "",
            columnName: { column: "id", reverse: false },
            size: size,
            material: {
                type: "Ламінування",
                material: materialAndDrukInBody.ColorDrukLaminationTypeUse
            }
        };
        setLoadLaminationColor(true);
        setError(null);
        axios
            .post(`/materials/NotAll`, data)
            .then((response) => {
                setLaminationColorDruk(response.data.rows);
                setLoadLaminationColor(false);
                if (response.data?.rows?.[0]) {
                    setMaterialAndDrukInBody((prev) => ({
                        ...prev,
                        ColorDrukLaminationMaterial: response.data.rows[0].name,
                        ColorDrukLaminationMaterialId: response.data.rows[0].id
                    }));
                } else {
                    setMaterialAndDrukInBody((prev) => ({
                        ...prev,
                        ColorDrukLaminationMaterial: "Немає",
                        ColorDrukLaminationMaterialId: 0
                    }));
                }
            })
            .catch((err) => {
                setLoadLaminationColor(false);
                setError(err.message);
                if (err.response?.status === 403) {
                    navigate("/login");
                }
                console.log(err.message);
            });
    }, [
        materialAndDrukInBody.ColorDrukLaminationType,
        materialAndDrukInBody.ColorDrukLaminationTypeUse,
        size
    ]);

    // ------------- Гілка "BW" (Ч/Б друк) -------------
    const handleSelectTypeBWChange = (e) => {
        const selectedValue = e.target.value || "";
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            BwDrukMaterialTypeUse: selectedValue
        }));
    };

    const handleToggleBw = () => {
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            BwDrukMaterialType:
                prev.BwDrukMaterialType === "Не потрібно" ? "Папір" : "Не потрібно"
        }));
    };

    const handleSelectBWDrukChange = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const selectedId = selectedOption.getAttribute("data-id") || "default";
        const selectedValue = e.target.value || "";
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            BwDrukMaterial: selectedValue,
            BwDrukMaterialId: selectedId
        }));
    };

    const handleToggleBwLamination = () => {
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            BwDrukLaminationType:
                prev.BwDrukLaminationType === "Не потрібно" ? "" : "Не потрібно"
        }));
    };

    const handleSelectDrukBwLamination = (e) => {
        const selectedValue = e.target.value || "";
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            BwDrukLaminationTypeUse: selectedValue
        }));
    };
    const handleSelectDrukBWLaminationTh = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const selectedId = selectedOption.getAttribute("data-id") || "default";
        const selectedValue = e.target.value || "";
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            BwDrukLaminationMaterial: selectedValue,
            BwDrukLaminationMaterialId: selectedId
        }));
    };

    // Обробники для оновлення кількості у гілці "BW"
    const handleBwCountChange = (e) => {
        const value = Number(e.target.value);
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            bwCount: value
        }));
    };

    useEffect(() => {
        const data = {
            name: "MaterialsPrices",
            inPageCount: 999999,
            currentPage: 1,
            search: "",
            columnName: { column: "id", reverse: false },
            size: size,
            material: {
                type: materialAndDrukInBody.BwDrukMaterialType,
                typeUse: materialAndDrukInBody.BwDrukMaterialTypeUse
            }
        };
        setLoadPaperBW(true);
        setError(null);
        axios
            .post(`/materials/NotAll`, data)
            .then((response) => {
                setPaperBwDruk(response.data.rows);
                setLoadPaperBW(false);
                if (response.data?.rows?.[0]) {
                    setMaterialAndDrukInBody((prev) => ({
                        ...prev,
                        BwDrukMaterial: response.data.rows[0].name,
                        BwDrukMaterialId: response.data.rows[0].id
                    }));
                } else {
                    setMaterialAndDrukInBody((prev) => ({
                        ...prev,
                        BwDrukMaterial: "Немає",
                        BwDrukMaterialId: 0
                    }));
                }
            })
            .catch((err) => {
                setLoadPaperBW(false);
                setError(err.message);
                if (err.response?.status === 403) {
                    navigate("/login");
                }
                console.log(err.message);
            });
    }, [
        materialAndDrukInBody.BwDrukMaterialType,
        materialAndDrukInBody.BwDrukMaterialTypeUse,
        size
    ]);

    useEffect(() => {
        const data = {
            name: "MaterialsPrices",
            inPageCount: 999999,
            currentPage: 1,
            type: "SheetCut",
            search: "",
            columnName: { column: "id", reverse: false },
            size: size,
            material: {
                type: "Ламінування",
                material: materialAndDrukInBody.BwDrukLaminationTypeUse
            }
        };
        setLoadLaminationBW(true);
        setError(null);
        axios
            .post(`/materials/NotAll`, data)
            .then((response) => {
                setLaminationBwDruk(response.data.rows);
                setLoadLaminationBW(false);
                if (response.data?.rows?.[0]) {
                    setMaterialAndDrukInBody((prev) => ({
                        ...prev,
                        BwDrukLaminationMaterial: response.data.rows[0].name,
                        BwDrukLaminationMaterialId: response.data.rows[0].id
                    }));
                } else {
                    setMaterialAndDrukInBody((prev) => ({
                        ...prev,
                        BwDrukLaminationMaterial: "Немає",
                        BwDrukLaminationMaterialId: 0
                    }));
                }
            })
            .catch((err) => {
                setLoadLaminationBW(false);
                setError(err.message);
                if (err.response?.status === 403) {
                    navigate("/login");
                }
                console.log(err.message);
            });
    }, [
        materialAndDrukInBody.BwDrukLaminationType,
        materialAndDrukInBody.BwDrukLaminationTypeUse,
        size
    ]);

    // ------------- Гілка "Non" (Без друку) -------------
    const handleSelectTypeNONChange = (e) => {
        const selectedValue = e.target.value || "";
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            NonDrukMaterialTypeUse: selectedValue
        }));
    };

    const handleToggleNonDruk = () => {
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            NonDrukMaterialType:
                prev.NonDrukMaterialType === "Не потрібно" ? "Папір" : "Не потрібно"
        }));
    };

    const handleSelectNonDrukChange = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const selectedId = selectedOption.getAttribute("data-id") || "default";
        const selectedValue = e.target.value || "";
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            NonDrukMaterial: selectedValue,
            NonDrukMaterialId: selectedId
        }));
    };

    const handleToggleNonDrukLamination = () => {
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            NonDrukLaminationType:
                prev.NonDrukLaminationType === "Не потрібно" ? "" : "Не потрібно"
        }));
    };

    // Обробник для вибору типу ламінації в Non
    const handleSelectDrukNonLamination = (e) => {
        const selectedValue = e.target.value || "";
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            NonDrukLaminationTypeUse: selectedValue
        }));
    };
    const handleSelectDrukNonLaminationTh = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const selectedId = selectedOption.getAttribute("data-id") || "default";
        const selectedValue = e.target.value || "";
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            NonDrukLaminationMaterial: selectedValue,
            NonDrukLaminationMaterialId: selectedId
        }));
    };

    // Обробники для оновлення кількості у гілці "Non"
    const handleNonCountChange = (e) => {
        const value = Number(e.target.value);
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            nonCount: value
        }));
    };

    useEffect(() => {
        const data = {
            name: "MaterialsPrices",
            inPageCount: 999999,
            currentPage: 1,
            search: "",
            columnName: { column: "id", reverse: false },
            size: size,
            material: {
                type: materialAndDrukInBody.NonDrukMaterialType,
                typeUse: materialAndDrukInBody.NonDrukMaterialTypeUse
            }
        };
        setLoadPaperNON(true);
        setError(null);
        axios
            .post(`/materials/NotAll`, data)
            .then((response) => {
                setPaperNonDruk(response.data.rows);
                setLoadPaperNON(false);
                if (response.data?.rows?.[0]) {
                    setMaterialAndDrukInBody((prev) => ({
                        ...prev,
                        NonDrukMaterial: response.data.rows[0].name,
                        NonDrukMaterialId: response.data.rows[0].id
                    }));
                } else {
                    setMaterialAndDrukInBody((prev) => ({
                        ...prev,
                        NonDrukMaterial: "Немає",
                        NonDrukMaterialId: 0
                    }));
                }
            })
            .catch((err) => {
                setLoadPaperNON(false);
                setError(err.message);
                if (err.response?.status === 403) {
                    navigate("/login");
                }
                console.log(err.message);
            });
    }, [
        materialAndDrukInBody.NonDrukMaterialType,
        materialAndDrukInBody.NonDrukMaterialTypeUse,
        size
    ]);

    useEffect(() => {
        const data = {
            name: "MaterialsPrices",
            inPageCount: 999999,
            currentPage: 1,
            type: "SheetCut",
            search: "",
            columnName: { column: "id", reverse: false },
            size: size,
            material: {
                type: "Ламінування",
                material: materialAndDrukInBody.NonDrukLaminationTypeUse
            }
        };
        setLoadLaminationNON(true);
        setError(null);
        axios
            .post(`/materials/NotAll`, data)
            .then((response) => {
                setLaminationNonDruk(response.data.rows);
                setLoadLaminationNON(false);
                if (response.data?.rows?.[0]) {
                    setMaterialAndDrukInBody((prev) => ({
                        ...prev,
                        NonDrukLaminationMaterial: response.data.rows[0].name,
                        NonDrukLaminationMaterialId: response.data.rows[0].id
                    }));
                } else {
                    setMaterialAndDrukInBody((prev) => ({
                        ...prev,
                        NonDrukLaminationMaterial: "Немає",
                        NonDrukLaminationMaterialId: 0
                    }));
                }
            })
            .catch((err) => {
                setLoadLaminationNON(false);
                setError(err.message);
                if (err.response?.status === 403) {
                    navigate("/login");
                }
                console.log(err.message);
            });
    }, [
        materialAndDrukInBody.NonDrukLaminationType,
        materialAndDrukInBody.NonDrukLaminationTypeUse,
        size
    ]);

    // Спільний обробник для вибору сторін друку
    const handleSelectDrukSidesChange = (e) => {
        const selectedValue = e.target.value || "";
        setMaterialAndDrukInBody((prev) => ({
            ...prev,
            drukSides: selectedValue
        }));
    };

    return (
        <div
            className="d-flex allArtemElem"
            style={{ margin: "0", padding: "0", borderBottom: "0.08vw solid gray", marginBottom: "0.5vw" }}
        >
            <div
                className="d-flex align-items-center justify-content-center"
                style={{
                    fontSize: "1vw",
                    width: "9vw",
                    fontFamily: "inter",


                    margin: "0",
                    padding: "0",
                    fontWeight: "bold"
                }}
            >
                Блок:
            </div>

            <div className="d-flex flex-column">
                {/* ------------- Гілка "Color" ------------- */}
                <div className="d-flex blockInNoteInBody">
                    <div className="d-flex">
                        <div
                            className={`toggleContainer scale04ForButtonToggle ${
                                materialAndDrukInBody.ColorDrukMaterialType === "Не потрібно" ? "disabledCont" : "enabledCont"
                            }`}
                            onClick={handleToggleColor}
                        >
                            <div
                                className={`toggle-button ${
                                    materialAndDrukInBody.ColorDrukMaterialType === "Не потрібно" ? "disabled" : "enabledd"
                                }`}
                            ></div>
                        </div>
                        <span
                            style={{
                                fontSize: "0.8vw",
                                marginRight: "0.633vw",
                                fontFamily: "inter",


                                whiteSpace: "nowrap",
                                marginTop: "0.8vw"
                            }}
                        >
              З Кольоровим друком:
            </span>
                    </div>
                    {materialAndDrukInBody.ColorDrukMaterialType === "Не потрібно" ? (
                        <div style={{ display: "flex", alignItems: "center", borderBottom: "0.08vw solid gray" }}></div>
                    ) : (
                        <div style={{ display: "flex", borderBottom: "0.08vw solid gray" }}>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <div className="d-flex align-items-center" style={{ marginTop: "0.5vw" }}>
                                    <span style={{ fontSize: "0.8vw", marginRight: "0.5vw", fontFamily: "inter" }}></span>
                                    <input className="inputsArtem"
                                        type="number"
                                        value={materialAndDrukInBody.colorCount || 0}
                                        onChange={handleColorCountChange}
                                        style={{ width: "3vw", fontSize: "0.8vw", padding: "0.2vw" }}
                                    />
                                </div>
                                <div style={{ fontSize: "0.8vw", fontFamily: "inter" }}>Матеріал: </div>
                                <div
                                    className="ArtemNewSelectContainer"
                                    style={{ marginTop: "0", display: "flex", justifyContent: "center", alignItems: "center" }}
                                >
                                    <select
                                        name="materialSelect"
                                        value={materialAndDrukInBody.ColorDrukMaterialTypeUse || ""}
                                        onChange={handleSelectTypeColorChange}
                                        className="selectArtem"
                                    >
                                        {buttonsArr.map((item, iter) => (
                                            <option key={item + iter} className="optionInSelectArtem" value={item} data-id={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div
                                    className="ArtemNewSelectContainer"
                                    style={{ marginTop: "0", display: "flex", justifyContent: "center", alignItems: "center" }}
                                >
                                    <select
                                        name="materialSelect"
                                        value={materialAndDrukInBody.ColorDrukMaterial || ""}
                                        onChange={handleSelectColorDrukChange}
                                        className="selectArtem"
                                    >
                                        {paperColorDruk.map((item, iter) => (
                                            <option key={200 + iter} className="optionInSelectArtem" value={item.name} data-id={item.id}>
                                                {item.name} {item.thickness} мл
                                            </option>
                                        ))}
                                    </select>
                                    {loadPaperColor && <Spinner animation="border" variant="danger" size="sm" />}
                                    {error && <div>{error}</div>}
                                </div>
                            </div>
                            {/* Інпут для кількості у гілці "Color" */}
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <div
                                    className={`toggleContainer scale04ForButtonToggle ${
                                        materialAndDrukInBody.ColorDrukLaminationType === "Не потрібно" ? "disabledCont" : "enabledCont"
                                    }`}
                                    onClick={handleToggleColorLamination}

                                >
                                    <div
                                        className={`toggle-button ${
                                            materialAndDrukInBody.ColorDrukLaminationType === "Не потрібно" ? "disabled" : "enabledd"
                                        }`}
                                    ></div>
                                </div>
                                <span
                                    style={{
                                        fontSize: "0.8vw",
                                        marginRight: "0.633vw",
                                        fontFamily: "inter",


                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    Ламінація:
                                </span>
                                {materialAndDrukInBody.ColorDrukLaminationType !== "Не потрібно" && (
                                    <>
                                        <div
                                            className="ArtemNewSelectContainer"
                                            style={{ marginTop: "0", display: "flex", justifyContent: "center", alignItems: "center" }}
                                        >
                                            <select
                                                name="materialSelect"
                                                value={materialAndDrukInBody.ColorDrukLaminationTypeUse || ""}
                                                onChange={handleSelectDrukColorLamination}
                                                className="selectArtem"
                                            >
                                                {buttonsArrLamination.map((item, iter) => (
                                                    <option key={item + iter} className="optionInSelectArtem" value={item} data-id={item}>
                                                        {item}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div
                                            className="ArtemNewSelectContainer"
                                            style={{ marginTop: "0", display: "flex", justifyContent: "center", alignItems: "center" }}
                                        >
                                            <select
                                                name="materialSelect"
                                                value={materialAndDrukInBody.ColorDrukLaminationMaterial || ""}
                                                onChange={handleSelectDrukColorLaminationTh}
                                                className="selectArtem"
                                            >
                                                {laminationColorDruk.map((item, iter) => (
                                                    <option key={item.thickness + iter} className="optionInSelectArtem" value={item.thickness} data-id={item.id}>
                                                        {item.thickness} мл
                                                    </option>
                                                ))}
                                            </select>
                                            {loadLaminationColor && <Spinner animation="border" variant="danger" size="sm" />}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ------------- Гілка "BW" ------------- */}
                <div className="d-flex blockInNoteInBody">
                    <div className="d-flex">
                        <div
                            className={`toggleContainer scale04ForButtonToggle ${
                                materialAndDrukInBody.BwDrukMaterialType === "Не потрібно" ? "disabledCont" : "enabledCont"
                            }`}
                            onClick={handleToggleBw}
                        >
                            <div
                                className={`toggle-button ${
                                    materialAndDrukInBody.BwDrukMaterialType === "Не потрібно" ? "disabled" : "enabledd"
                                }`}
                            ></div>
                        </div>
                        <span
                            style={{
                                fontSize: "0.8vw",
                                marginRight: "0.633vw",
                                fontFamily: "inter",


                                whiteSpace: "nowrap",
                                marginTop: "0.77vw"
                            }}
                        >
              З Ч/Б друком:
            </span>
                    </div>
                    {materialAndDrukInBody.BwDrukMaterialType === "Не потрібно" ? (
                        <div style={{ display: "flex", alignItems: "center", borderBottom: "0.08vw solid gray" }}></div>
                    ) : (
                        <div style={{ display: "flex", borderBottom: "0.08vw solid gray" }}>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <div className="d-flex align-items-center" style={{ marginTop: "0.5vw" }}>
                                    <span style={{ fontSize: "0.8vw", marginRight: "0.5vw", fontFamily: "inter" }}></span>
                                    <input className="inputsArtem"
                                        type="number"
                                           min={1}
                                        value={materialAndDrukInBody.bwCount || 0}
                                        onChange={handleBwCountChange}
                                        style={{ width: "3vw", fontSize: "0.8vw", padding: "0.2vw" }}
                                    />
                                </div>
                                <div style={{ fontSize: "0.8vw", fontFamily: "inter" }}>Матеріал: </div>
                                <div
                                    className="ArtemNewSelectContainer"
                                    style={{ marginTop: "0", display: "flex", justifyContent: "center", alignItems: "center" }}
                                >
                                    <select
                                        name="materialSelect"
                                        value={materialAndDrukInBody.BwDrukMaterialTypeUse || ""}
                                        onChange={(event) => handleSelectTypeBWChange(event)}
                                        className="selectArtem"
                                    >
                                        {buttonsArr.map((item, iter) => (
                                            <option key={item + iter} className="optionInSelectArtem" value={item} data-id={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div
                                    className="ArtemNewSelectContainer"
                                    style={{ marginTop: "0", display: "flex", justifyContent: "center", alignItems: "center" }}
                                >
                                    <select
                                        name="materialSelect"
                                        value={materialAndDrukInBody.BwDrukMaterial || ""}
                                        onChange={handleSelectBWDrukChange}
                                        className="selectArtem"
                                    >
                                        {paperBwDruk.map((item, iter) => (
                                            <option key={item.name + iter} className="optionInSelectArtem" value={item.name} data-id={item.id}>
                                                {item.name} {item.thickness} мл
                                            </option>
                                        ))}
                                    </select>
                                    {loadPaperBW && <Spinner animation="border" variant="danger" size="sm" />}
                                    {error && <div>{error}</div>}
                                </div>
                            </div>
                            {/* Інпут для кількості у гілці "BW" */}

                            <div style={{ display: "flex", alignItems: "center" }}>
                                <div
                                    className={`toggleContainer scale04ForButtonToggle ${
                                        materialAndDrukInBody.BwDrukLaminationType === "Не потрібно" ? "disabledCont" : "enabledCont"
                                    }`}
                                    onClick={handleToggleBwLamination}
                                >
                                    <div
                                        className={`toggle-button ${
                                            materialAndDrukInBody.BwDrukLaminationType === "Не потрібно" ? "disabled" : "enabledd"
                                        }`}
                                    ></div>
                                </div>
                                <span
                                    style={{
                                        fontSize: "0.8vw",
                                        marginRight: "0.633vw",
                                        fontFamily: "inter",


                                        whiteSpace: "nowrap"
                                    }}
                                >
                  Ламінація:
                </span>
                                {materialAndDrukInBody.BwDrukLaminationType !== "Не потрібно" && (
                                    <>
                                        <div
                                            className="ArtemNewSelectContainer"
                                            style={{ marginTop: "0", display: "flex", justifyContent: "center", alignItems: "center" }}
                                        >
                                            <select
                                                name="materialSelect"
                                                value={materialAndDrukInBody.BwDrukLaminationTypeUse || ""}
                                                onChange={handleSelectDrukBwLamination}
                                                className="selectArtem"
                                            >
                                                {buttonsArrLamination.map((item, iter) => (
                                                    <option key={item + iter} className="optionInSelectArtem" value={item} data-id={item}>
                                                        {item}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {materialAndDrukInBody.drukColor !== "Не потрібно" && (
                                            <div
                                                className="ArtemNewSelectContainer"
                                                style={{ marginTop: "0", display: "flex", justifyContent: "center", alignItems: "center" }}
                                            >
                                                <select
                                                    name="materialSelect"
                                                    value={materialAndDrukInBody.BwDrukLaminationMaterial || ""}
                                                    onChange={handleSelectDrukBWLaminationTh}
                                                    className="selectArtem"
                                                >
                                                    {laminationBwDruk.map((item, iter) => (
                                                        <option key={item.thickness + iter} className="optionInSelectArtem" value={item.thickness} data-id={item.id}>
                                                            {item.thickness} мл
                                                        </option>
                                                    ))}
                                                </select>
                                                {loadLaminationBW && <Spinner animation="border" variant="danger" size="sm" />}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ------------- Гілка "Non" (Без друку) ------------- */}
                <div className="d-flex blockInNoteInBody">
                    <div className="d-flex">
                        <div
                            className={`toggleContainer scale04ForButtonToggle ${
                                materialAndDrukInBody.NonDrukMaterialType === "Не потрібно" ? "disabledCont" : "enabledCont"
                            }`}
                            onClick={handleToggleNonDruk}
                        >
                            <div
                                className={`toggle-button ${
                                    materialAndDrukInBody.NonDrukMaterialType === "Не потрібно" ? "disabled" : "enabledd"
                                }`}
                            ></div>
                        </div>
                        <span
                            style={{
                                fontSize: "0.8vw",
                                marginRight: "0.633vw",
                                fontFamily: "inter",


                                whiteSpace: "nowrap",
                                marginTop: "0.77vw"
                            }}
                        >
              Без друку:
            </span>
                    </div>
                    {materialAndDrukInBody.NonDrukMaterialType === "Не потрібно" ? (
                        <div style={{ display: "flex", alignItems: "center", borderBottom: "0.08vw solid gray" }}></div>
                    ) : (
                        <div style={{ display: "flex", borderBottom: "0.08vw solid gray" }}>

                            <div style={{ display: "flex", alignItems: "center" }}>
                                <div className="d-flex align-items-center" style={{ marginTop: "0.5vw" }}>
                                    <span style={{ fontSize: "0.8vw", marginRight: "0.5vw", fontFamily: "inter" }}></span>
                                    <input className="inputsArtem"
                                        type="number"
                                        value={materialAndDrukInBody.nonCount || 0}
                                        onChange={handleNonCountChange}
                                        style={{ width: "3vw", fontSize: "0.8vw", padding: "0.2vw" }}
                                    />
                                </div>
                                <div style={{ fontSize: "0.8vw", fontFamily: "inter" }}>Матеріал: </div>
                                <div
                                    className="ArtemNewSelectContainer"
                                    style={{ marginTop: "0", display: "flex", justifyContent: "center", alignItems: "center" }}
                                >
                                    <select
                                        name="materialSelect"
                                        value={materialAndDrukInBody.NonDrukMaterialTypeUse || ""}
                                        onChange={(event) => handleSelectTypeNONChange(event)}
                                        className="selectArtem"
                                    >
                                        {buttonsArr.map((item, iter) => (
                                            <option key={item + iter} className="optionInSelectArtem" value={item} data-id={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div
                                    className="ArtemNewSelectContainer"
                                    style={{ marginTop: "0", display: "flex", justifyContent: "center", alignItems: "center" }}
                                >
                                    <select
                                        name="materialSelect"
                                        value={materialAndDrukInBody.NonDrukMaterial || ""}
                                        onChange={handleSelectNonDrukChange}
                                        className="selectArtem"
                                    >
                                        {paperNonDruk.map((item, iter) => (
                                            <option key={item.name + iter} className="optionInSelectArtem" value={item.name} data-id={item.id}>
                                                {item.name} {item.thickness} мл
                                            </option>
                                        ))}
                                    </select>
                                    {loadPaperNON && <Spinner animation="border" variant="danger" size="sm" />}
                                    {error && <div>{error}</div>}
                                </div>
                            </div>
                            {/* Інпут для кількості у гілці "Non" */}

                            <div style={{ display: "flex", alignItems: "center" }}>
                                <div
                                    className={`toggleContainer scale04ForButtonToggle ${
                                        materialAndDrukInBody.NonDrukLaminationType === "Не потрібно" ? "disabledCont" : "enabledCont"
                                    }`}
                                    onClick={handleToggleNonDrukLamination}
                                >
                                    <div
                                        className={`toggle-button ${
                                            materialAndDrukInBody.NonDrukLaminationType === "Не потрібно" ? "disabled" : "enabledd"
                                        }`}
                                    ></div>
                                </div>
                                <span
                                    style={{
                                        fontSize: "0.8vw",
                                        marginRight: "0.633vw",
                                        fontFamily: "inter",


                                        whiteSpace: "nowrap"
                                    }}
                                >
                  Ламінація:
                </span>
                                {materialAndDrukInBody.NonDrukLaminationType !== "Не потрібно" && (
                                    <>
                                        <div
                                            className="ArtemNewSelectContainer"
                                            style={{ marginTop: "0", display: "flex", justifyContent: "center", alignItems: "center" }}
                                        >
                                            <select
                                                name="materialSelect"
                                                value={materialAndDrukInBody.NonDrukLaminationTypeUse || ""}
                                                onChange={handleSelectDrukNonLamination}
                                                className="selectArtem"
                                            >
                                                {buttonsArrLamination.map((item, iter) => (
                                                    <option key={item + iter} className="optionInSelectArtem" value={item} data-id={item}>
                                                        {item}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {materialAndDrukInBody.drukColor !== "Не потрібно" && (
                                            <div
                                                className="ArtemNewSelectContainer"
                                                style={{ marginTop: "0", display: "flex", justifyContent: "center", alignItems: "center" }}
                                            >
                                                <select
                                                    name="materialSelect"
                                                    value={materialAndDrukInBody.NonDrukLaminationMaterial || ""}
                                                    onChange={handleSelectDrukNonLaminationTh}
                                                    className="selectArtem"
                                                >
                                                    {laminationNonDruk.map((item, iter) => (
                                                        <option key={item.thickness + iter} className="optionInSelectArtem" value={item.thickness} data-id={item.id}>
                                                            {item.thickness} мл
                                                        </option>
                                                    ))}
                                                </select>
                                                {loadLaminationNON && <Spinner animation="border" variant="danger" size="sm" />}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Materials2NoteInBody;
