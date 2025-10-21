import React, {useEffect, useState} from "react";
import axios from "../../../../api/axiosInstance";
import {useNavigate} from "react-router-dom";
import {Spinner} from "react-bootstrap";

const Materials2NoteBack = ({
                                materialAndDrukBack,
                                setMaterialAndDrukBack,
                                count,
                                setCount,
                                prices,
                                type,
                                name,
                                buttonsArr,
                                buttonsArrDruk,
                                buttonsArrColor,
                                selectArr,
                                typeUse,
                                size
                            }) => {
    const [paper, setPaper] = useState([]);
    const [error, setError] = useState(null);
    const [load, setLoad] = useState(true);
    const navigate = useNavigate();

    // Новий стан для даних ламінування
    const [lamination, setLamination] = useState([]);
    const [loadLamination, setLoadLamination] = useState(false);

    // Масив кнопок для вибору типу ламінування
    const buttonsArrLamination = [
        "з глянцевим ламінуванням",
        "з матовим ламінуванням",
        "з ламінуванням SoftTouch",
        "з холодним матовим ламінуванням"

    ];

    const handleSelectChange = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const selectedId = selectedOption.getAttribute("data-id") || "default";
        const selectedValue = e.target.value || "";
        setMaterialAndDrukBack((prev) => ({
            ...prev,
            material: selectedValue,
            materialId: selectedId
        }));
    };

    const handleSelectTypeChange = (e) => {
        const selectedValue = e.target.value || "";
        setMaterialAndDrukBack((prev) => ({
            ...prev,
            materialTypeUse: selectedValue
        }));
    };

    const handleSelectDrukSidesChange = (e) => {
        const selectedValue = e.target.value || "";
        setMaterialAndDrukBack((prev) => ({
            ...prev,
            drukSides: selectedValue
        }));
    };

    const handleSelectDrukColorChange = (e) => {
        const selectedValue = e.target.value || "";
        setMaterialAndDrukBack((prev) => ({
            ...prev,
            drukColor: selectedValue
        }));
    };

    let handleClick = (e) => {
        setMaterialAndDrukBack({
            ...materialAndDrukBack,
            drukSides: e
        });
    };

    useEffect(() => {
        let data = {
            name: "MaterialsPrices",
            inPageCount: 999999,
            currentPage: 1,
            search: "",
            columnName: {
                column: "id",
                reverse: false
            },
            size: size,
            typeOfPosluga: "Note/Booklet",
            material: {
                type: materialAndDrukBack.materialType,
                typeUse: materialAndDrukBack.materialTypeUse
            }
        };
        setLoad(true);
        setError(null);
        axios
            .post(`/materials/NotAll`, data)
            .then((response) => {
                setPaper(response.data.rows);
                setLoad(false);
                if (response.data && response.data.rows && response.data.rows[0]) {
                    setMaterialAndDrukBack((prev) => ({
                        ...prev,
                        material: response.data.rows[0].name,
                        materialId: response.data.rows[0].id
                    }));
                } else {
                    setMaterialAndDrukBack((prev) => ({
                        ...prev,
                        material: "Немає",
                        materialId: 0
                    }));
                }
            })
            .catch((error) => {
                setLoad(false);
                setError(error.message);
                // if (error.response?.status === 403) {
                //     navigate("/login");
                // }
                console.log(error.message);
            });
    }, [materialAndDrukBack.materialTypeUse, size]);

    // Логіка завантаження даних для ламінування (тільки якщо ламінування увімкнено)
    useEffect(() => {
        if (materialAndDrukBack.laminationType !== "Не потрібно") {
            const data = {
                name: "MaterialsPrices",
                inPageCount: 999999,
                currentPage: 1,
                type: "SheetCut",
                search: "",
                columnName: {
                    column: "id",
                    reverse: false
                },
                size: size,
                material: {
                    type: "Ламінування",
                    material: materialAndDrukBack.laminationTypeUse
                }
            };
            setLoadLamination(true);
            setError(null);
            axios
                .post(`/materials/NotAll`, data)
                .then((response) => {
                    setLamination(response.data.rows);
                    setLoadLamination(false);
                    if (response.data && response.data.rows && response.data.rows[0]) {
                        setMaterialAndDrukBack((prev) => ({
                            ...prev,
                            laminationmaterial: response.data.rows[0].name,
                            laminationmaterialId: response.data.rows[0].id
                        }));
                    } else {
                        setMaterialAndDrukBack((prev) => ({
                            ...prev,
                            laminationmaterial: "Немає",
                            laminationmaterialId: 0
                        }));
                    }
                })
                .catch((err) => {
                    setLoadLamination(false);
                    setError(err.message);
                    // if (err.response?.status === 403) {
                    //     navigate("/login");
                    // }
                    console.log(err.message);
                });
        }
    }, [materialAndDrukBack.laminationType, materialAndDrukBack.laminationTypeUse, size]);

    // Обробник для перемикання ламінування (toggle)
    const handleToggleLamination = () => {
        setMaterialAndDrukBack((prev) => ({
            ...prev,
            laminationType: prev.laminationType === "Не потрібно" ? "з глянцевим ламінуванням" : "Не потрібно",
        }));
    };

    // Обробник для вибору типу ламінування
    const handleSelectLaminationTypeUseChange = (e) => {
        const selectedValue = e.target.value || "";
        setMaterialAndDrukBack((prev) => ({
            ...prev,
            laminationTypeUse: selectedValue
        }));
    };

    const handleColorCountChange = (e) => {
        const value = Number(e.target.value);
        const value2 = e.target.value;
      if (value % 2 !== 0) {
        setMaterialAndDrukBack((prev) => ({
          ...prev,
          count: value+1
        }));
      } else {
        setMaterialAndDrukBack((prev) => ({
          ...prev,
          count: value
        }));
      }
    };

    return (
        <div
            className="d-flex flex-column allArtemElem"
            style={{position: "absolute", marginLeft: "45vw"}}
        >
            {/* Заголовок "Блок:" */}


            {/* 1. Кількість аркушів */}
            <div
                className="d-flex align-items-center"

            >
                <div
                    className="d-flex "
                    style={{
                        fontSize: "1vw",
                        width: "6vw",

                        fontWeight: "bold",

                    }}
                >
                    Блок:
                </div>
                <span
                    style={{
                        fontSize: "1vw",
                        marginRight: "0.5vw",

                        whiteSpace: "nowrap",

                    }}
                >
                Кількість аркушів:
            </span>
                <input
                    className="inputsArtem"
                    type="number"
                    value={materialAndDrukBack.count}
                    onChange={handleColorCountChange}
                    style={{
                        width: "5vw",
                        fontSize: "0.8vw",
                        padding: "0.5vw",


                    }}
                    min={2}
                    step={2}

                />
                <div className="inputsArtemx allArtemElem" style={{border: "transparent", marginTop: "-2vh"}}> шт</div>
                <div className="inputsArtemx allArtemElem" style={{border: "transparent", marginTop: "-1.8vh", width: "8vw",opacity:"0.5", fontSize:"0.8vw"}}>Сторінок: {materialAndDrukBack.count*2} шт</div>
            </div>

            {/* 2. Друк */}
            <div
                className="d-flex align-items-center"
                style={{marginTop: "1vh", marginLeft: "6vw"}}
            >
            <span
                style={{
                    fontSize: "1vw",
                    marginRight: "0.5vw",
                    whiteSpace: "nowrap"
                }}
            >
                Друк:
            </span>
                <div
                    className="ArtemNewSelectContainer"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <select
                        name="drukColorSelect"
                        value={materialAndDrukBack.drukColor || ""}
                        onChange={handleSelectDrukColorChange}
                        className="selectArtem"
                        style={{marginRight: "1vw"}}
                    >
                        {buttonsArrColor.map((item, iter) => (
                            <option
                                key={item + iter}
                                className="optionInSelectArtem"
                                value={item}
                                data-id={item}
                            >
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Якщо друк потрібен, показати додатковий селект "drukSides" */}
                {materialAndDrukBack.drukColor !== "Не потрібно" && (
                    <div
                        className="ArtemNewSelectContainer"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                    >
                        <select
                            name="drukSidesSelect"
                            value={materialAndDrukBack.drukSides || ""}
                            onChange={handleSelectDrukSidesChange}
                            className="selectArtem"
                        >
                            {buttonsArrDruk.map((item, iter) => (
                                <option
                                    key={item + iter}
                                    className="optionInSelectArtem"
                                    value={item}
                                    data-id={item}
                                >
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* 3. Матеріал */}
            <div
                className="d-flex align-items-center"
                style={{marginTop: "1vh", marginLeft: "6vw"}}
            >
            <span
                style={{
                    fontSize: "1vw",


                    marginRight: "0.5vw",
                    whiteSpace: "nowrap"
                }}
            >
                Матеріал:
            </span>
                {/* Перший селект: тип матеріалу */}
                <div
                    className="ArtemNewSelectContainer"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: "1vw"
                    }}
                >
                    <select
                        name="materialTypeUseSelect"
                        value={materialAndDrukBack.materialTypeUse || ""}
                        onChange={handleSelectTypeChange}
                        className="selectArtem"
                    >
                        {buttonsArr.map((item, iter) => (
                            <option
                                key={item + iter}
                                className="optionInSelectArtem"
                                value={item}
                                data-id={item}
                            >
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Другий селект: конкретний матеріал */}
                <div
                    className="ArtemNewSelectContainer"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <select
                        name="materialSelect"
                        value={materialAndDrukBack.material || ""}
                        onChange={handleSelectChange}
                        className="selectArtem"
                    >
                        {paper.map((item, iter) => (
                            <option
                                key={item.name + iter}
                                className="optionInSelectArtem"
                                value={item.name}
                                data-id={item.id}
                            >
                                {item.name} {item.thickness} gsm
                            </option>
                        ))}
                    </select>
                    {load && <Spinner animation="border" variant="danger" size="sm"/>}
                    {error && <div>{error}</div>}
                </div>
            </div>

            {/* 4. Ламінація */}
            <div
                className="d-flex"
                style={{display: "flex", marginTop: "0.5vh", marginLeft: "5.3vw", alignItems: "center"}}
            >
                <div
                    className={`toggleContainer scale04ForButtonToggle ${
                        materialAndDrukBack.laminationType === "Не потрібно"
                            ? "disabledCont"
                            : "enabledCont"
                    }`}

                    onClick={handleToggleLamination}
                >
                    <div
                        className={`toggle-button ${
                            materialAndDrukBack.laminationType === "Не потрібно"
                                ? "disabled"
                                : "enabledd"
                        }`}
                    ></div>
                </div>
                <div>{"Ламінація:"}</div>

                <div
                    className="laminationContainer"

                >


                    {/* Якщо ламінування не вимкнено, показати додаткові селекти */}
                    {materialAndDrukBack.laminationType !== "Не потрібно" && (
                        <div
                            className="d-flex interFont"
                            style={{marginTop: "-0.7vh", marginLeft: "-1vw"}}
                        >
                            <div
                                className="ArtemNewSelectContainer interFont"
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginRight: "1vw"
                                }}
                            >
                                <select
                                    name="laminationTypeUse"
                                    value={materialAndDrukBack.laminationTypeUse || ""}
                                    onChange={handleSelectLaminationTypeUseChange}
                                    className="selectArtem"
                                >
                                    {buttonsArrLamination.map((item, iter) => (
                                        <option
                                            key={item + iter}
                                            value={item}
                                            data-id={item}
                                            className="optionInSelectArtem"
                                        >
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div
                                className="ArtemNewSelectContainer interFont"
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}
                            >
                                <select
                                    name="laminationMaterial"
                                    value={materialAndDrukBack.laminationmaterial || ""}
                                    onChange={(e) => {
                                        const selectedOption =
                                            e.target.options[e.target.selectedIndex];
                                        const selectedId =
                                            selectedOption.getAttribute("data-id") || "default";
                                        const selectedValue = e.target.value || "";
                                        setMaterialAndDrukBack((prev) => ({
                                            ...prev,
                                            laminationmaterial: selectedValue,
                                            laminationmaterialId: selectedId
                                        }));
                                    }}
                                    className="selectArtem interFont"
                                >
                                    {lamination.map((item, iter) => (
                                        <option
                                            key={item.name + iter}
                                            value={item.thickness}
                                            data-id={item.id}
                                            className="optionInSelectArtem"
                                        >
                                            {item.thickness} мл
                                        </option>
                                    ))}
                                </select>
                                {loadLamination && (
                                    <Spinner animation="border" variant="danger" size="sm"/>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

};

export default Materials2NoteBack;
