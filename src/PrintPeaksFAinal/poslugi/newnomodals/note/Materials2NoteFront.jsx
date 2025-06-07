import React, {useEffect, useState} from "react";
import axios from "../../../../api/axiosInstance";
import {useNavigate} from "react-router-dom";
import {Spinner} from "react-bootstrap";
import "./styles.css";
import NewNoModalCornerRounding from "../NewNoModalBig";
import BigInBooklet from "../BigInBooklet";
import NewSheetCutBw from "../../NewSheetCutBw";

const Materials2NoteFront = ({
                                 materialAndDrukFront,
                                 setMaterialAndDrukFront,
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
                                 size,
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
        "З глянцевим ламінуванням",
        "З матовим ламінуванням",
        "З ламінуванням Soft Touch"
    ];

    const handleSelectChange = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const selectedId = selectedOption.getAttribute("data-id") || "default";
        const selectedValue = e.target.value || "";

        setMaterialAndDrukFront((prev) => ({
            ...prev,
            material: selectedValue,
            materialId: selectedId
        }));
    };

    const handleSelectTypeChange = (e) => {
        const selectedValue = e.target.value || "";
        setMaterialAndDrukFront((prev) => ({
            ...prev,
            materialTypeUse: selectedValue
        }));
    };

    const handleSelectDrukSidesChange = (e) => {
        const selectedValue = e.target.value || "";
        setMaterialAndDrukFront((prev) => ({
            ...prev,
            drukSides: selectedValue
        }));
    };

    const handleSelectDrukColorChange = (e) => {
        const selectedValue = e.target.value || "";
        setMaterialAndDrukFront((prev) => ({
            ...prev,
            drukColor: selectedValue
        }));
    };

    let handleClick = (e) => {
        setMaterialAndDrukFront({
            ...materialAndDrukFront,
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
            material: {
                type: materialAndDrukFront.materialType,
                typeUse: materialAndDrukFront.materialTypeUse
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
                    setMaterialAndDrukFront((prev) => ({
                        ...prev,
                        material: response.data.rows[0].name,
                        materialId: response.data.rows[0].id
                    }));
                } else {
                    setMaterialAndDrukFront((prev) => ({
                        ...prev,
                        material: "Немає",
                        materialId: 0
                    }));
                }
            })
            .catch((error) => {
                setLoad(false);
                setError(error.message);
                if (error.response?.status === 403) {
                    navigate("/login");
                }
                console.log(error.message);
            });
    }, [materialAndDrukFront.materialTypeUse, size]);

    // Логіка завантаження даних для ламінування (тільки якщо ламінування увімкнено)
    useEffect(() => {
        if (materialAndDrukFront.laminationType !== "Не потрібно") {
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
                    material: materialAndDrukFront.laminationTypeUse
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
                        setMaterialAndDrukFront((prev) => ({
                            ...prev,
                            laminationmaterial: response.data.rows[0].name,
                            laminationmaterialId: response.data.rows[0].id
                        }));
                    } else {
                        setMaterialAndDrukFront((prev) => ({
                            ...prev,
                            laminationmaterial: "Немає",
                            laminationmaterialId: 0
                        }));
                    }
                })
                .catch((err) => {
                    setLoadLamination(false);
                    setError(err.message);
                    if (err.response?.status === 403) {
                        navigate("/login");
                    }
                    console.log(err.message);
                });
        }
    }, [materialAndDrukFront.laminationType, materialAndDrukFront.laminationTypeUse, size]);

    // Обробник для перемикання ламінування (toggle)
    const handleToggleLamination = () => {
        setMaterialAndDrukFront((prev) => ({
            ...prev,
            laminationType: prev.laminationType === "Не потрібно" ? "" : "Не потрібно"
        }));
    };

    let handleToggleAll = (e) => {
        if (materialAndDrukFront.materialAndDrukFront === "Не потрібно") {
            setMaterialAndDrukFront({
                ...materialAndDrukFront,
                materialAndDrukFront: "2",
            })
        } else {
            setMaterialAndDrukFront({
                ...materialAndDrukFront,
                materialAndDrukFront: "Не потрібно",
            })
        }
    }

    // Обробник для вибору типу ламінування
    const handleSelectLaminationTypeUseChange = (e) => {
        const selectedValue = e.target.value || "";
        setMaterialAndDrukFront((prev) => ({
            ...prev,
            laminationTypeUse: selectedValue
        }));
    };

    return (
        <div className="d-flex flex-column allArtemElem">
            {/* Назва (заголовок) */}


            {/* Блок "Друк" (або, якщо потрібно, "Кількість аркушів") */}
            <div style={{display: "flex", marginTop: "1vh"}}>
                <div className="d-flex">
                    <div
                        className={`toggleContainer scale04ForButtonToggle ${materialAndDrukFront.materialAndDrukFront === "Не потрібно" ? 'disabledCont' : 'enabledCont'}`}
                        onClick={handleToggleAll}
                    >
                        <div
                            className={`toggle-button ${materialAndDrukFront.materialAndDrukFront === "Не потрібно" ? 'disabled' : 'enabledd'}`}>
                        </div>
                    </div>
                    <div
                        className="d-flex "
                        style={{
                            fontSize: "1vw",
                            width: "9vw",
                            alignItems: "center",
                            fontFamily: "inter",


                            fontWeight: "bold",
                        }}
                    >
                        {name}
                    </div>
                </div>

            </div>


            {materialAndDrukFront.materialAndDrukFront !== "Не потрібно" &&
                <div>
                    <div className="d-flex" style={{marginTop: "1vh", marginLeft: "9vw"}}>
                        <div
                            style={{
                                fontSize: "1vw",
                                fontFamily: "inter",


                                marginLeft: "1vw",
                                whiteSpace: "nowrap",
                                alignSelf: "center",
                            }}
                        >
                            Друк:
                        </div>
                        <div
                            className="ArtemNewSelectContainer"
                            style={{
                                marginLeft: "0.5vw",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <select
                                name="materialSelect"
                                value={materialAndDrukFront.drukColor || ""}
                                onChange={handleSelectDrukColorChange}
                                className="selectArtem"
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
                        {materialAndDrukFront.drukColor !== "Не потрібно" && (
                            <div
                                className="ArtemNewSelectContainer"
                                style={{
                                    marginLeft: "1vw",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <select
                                    name="materialSelect"
                                    value={materialAndDrukFront.drukSides || ""}
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

                    {/* Блок "Матеріал" */}
                    <div style={{display: "flex", alignItems: "center", marginTop: "2vh", marginLeft: "9vw"}}>
                        <div
                            style={{
                                fontSize: "1vw",
                                fontFamily: "inter",


                                marginLeft: "1vw",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Матеріал:
                        </div>
                        <div
                            className="ArtemNewSelectContainer"
                            style={{
                                marginLeft: "0.5vw",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <select
                                name="materialSelect"
                                value={materialAndDrukFront.materialTypeUse || ""}
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
                        <div
                            className="ArtemNewSelectContainer"
                            style={{
                                marginLeft: "1vw",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <select
                                name="materialSelect"
                                value={materialAndDrukFront.material || ""}
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

                    {/* Блок "Ламінація" */}
                    <div
                        style={{display: "flex", alignItems: "center", marginTop: "1vh", marginLeft: "9vw"}}>
                        <div
                            className={`toggleContainer scale04ForButtonToggle ${
                                materialAndDrukFront.laminationType === "Не потрібно"
                                    ? "disabledCont"
                                    : "enabledCont"
                            }`}
                            onClick={handleToggleLamination}
                        >
                            <div
                                className={`toggle-button ${
                                    materialAndDrukFront.laminationType === "Не потрібно"
                                        ? "disabled"
                                        : "enabledd"
                                }`}
                            ></div>
                        </div>
                        <div>{"Ламінація:"}</div>


                        {materialAndDrukFront.laminationType !== "Не потрібно" && (
                            <>
                                <div
                                    className="laminationContainer"
                                    style={{}}
                                >
                                    <select
                                        name="laminationTypeUse"
                                        value={materialAndDrukFront.laminationTypeUse || ""}
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
                                    className="ArtemNewSelectContainer"
                                    style={{
                                        marginLeft: "1vw",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <select
                                        name="laminationMaterial"
                                        value={materialAndDrukFront.laminationmaterial || ""}
                                        onChange={(e) => {
                                            const selectedOption = e.target.options[e.target.selectedIndex];
                                            const selectedId = selectedOption.getAttribute("data-id") || "default";
                                            const selectedValue = e.target.value || "";
                                            setMaterialAndDrukFront((prev) => ({
                                                ...prev,
                                                laminationmaterial: selectedValue,
                                                laminationmaterialId: selectedId,
                                            }));
                                        }}
                                        className="selectArtem"
                                    >
                                        {lamination.map((item, iter) => (
                                            <option
                                                key={item.name + iter}
                                                value={item.thickness}
                                                data-id={item.id}
                                                className="optionInSelectArtem"
                                            >
                                                {item.thickness} gsm
                                            </option>
                                        ))}
                                    </select>
                                    {loadLamination && <Spinner animation="border" variant="danger" size="sm"/>}
                                </div>
                            </>
                        )}
                    </div>
                    {/* Блок "Біговка" */}
                    {materialAndDrukFront.big &&
                        <div style={{marginLeft: "8vw"}}>
                            <BigInBooklet
                                materialAndDrukFront={materialAndDrukFront}
                                setMaterialAndDrukFront={setMaterialAndDrukFront}
                                count={count}
                                setCount={setCount}
                                prices={prices}
                                type={"SheetCut"}
                                buttonsArr={[]}
                                selectArr={["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                            />
                        </div>
                    }
                </div>

            }
        </div>
    );
};

export default Materials2NoteFront;
