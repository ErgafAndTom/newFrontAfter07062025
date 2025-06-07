import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import StatusBar from "./StatusBar";

const FiltrOrders = ({ typeSelect, setTypeSelect, startDate, endDate, setEndDate, setStartDate, setStatuses, statuses }) => {
    const navigate = useNavigate();
    const [load, setLoad] = useState(false);
    const [show, setShow] = useState(false);
    const [error, setError] = useState(false);
    const [isEnabledDataSearch, setIsEnabledDataSearch] = useState(false);
    const [isEnabledStatusSearch, setIsEnabledStatusSearch] = useState(false);

    // Стани для збереження вибраних дат

    const handleToggleDataSearch = () => {
        if (isEnabledDataSearch) {
            setEndDate("")
            setStartDate("")
        }
        setIsEnabledDataSearch(!isEnabledDataSearch);
    };
    const handleToggleStatusSearch = () => {
        if (isEnabledStatusSearch) {
            setStatuses({...statuses, status0: true, status1: true, status2: true, status3: true, status4: true, status5: true})
        } else {
            setStatuses({...statuses, status0: false, status1: false, status2: false, status3: false, status4: false, status5: false})
        }
        setIsEnabledStatusSearch(!isEnabledStatusSearch);
    };

    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const handleClose = () => {
        setIsAnimating(false); // Початок анімації закриття
        setTimeout(() => {
            setIsVisible(false);
            setShow(false);
        }, 300);
    };

    useEffect(() => {
        if (show) {
            setIsVisible(true); // Спочатку показуємо модальне вікно
            setTimeout(() => setIsAnimating(true), 100); // Запускаємо анімацію появи
        } else {
            setIsAnimating(false); // Початок анімації закриття
            setTimeout(() => setIsVisible(false), 300);
        }
    }, [show]);

    const handleCloseSearch = useCallback(() => {
        setShow(false);
    }, []);

    const handleClickFilter = useCallback(() => {
        setShow(show => !show);
    }, []);

    return (
        <div>
            <div className="d-flex">
                <button className="btn btn-sm btn-warning adminFont" onClick={handleClickFilter}>
                    <i className="fas fa-search">filtres</i>
                </button>
                {/*<>*/}
                {/*    <input type="text" className="" placeholder="Search" />*/}
                {/*</>*/}
                {/*<button className="btn btn-primary">*/}
                {/*    <i className="fas fa-search"></i>*/}
                {/*</button>*/}
            </div>
            {show && (
                <div>
                    {isVisible && (
                        <div style={{ position: "relative" }}>
                            <div
                                style={{
                                    width: "100vw",
                                    zIndex: "99",
                                    height: "100vh",
                                    background: "rgba(0, 0, 0, 0.5)",
                                    opacity: isAnimating ? 1 : 0,
                                    transition: "opacity 0.3s ease-in-out",
                                    position: "fixed",
                                    left: "0",
                                    bottom: "0"
                                }}
                                onClick={handleClose}
                            ></div>
                            <div
                                className="d-flex flex-column"
                                style={{
                                    zIndex: "100",
                                    position: "absolute",
                                    background: "#dcd9ce",
                                    top: "0%",
                                    left: "0%",
                                    transform: isAnimating
                                        ? "translate(0, 0) scale(1)"
                                        : "translate(-10%, -10%) scale(0.8)",
                                    opacity: isAnimating ? 1 : 0,
                                    transition:
                                        "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
                                    borderRadius: "0.3vw",
                                    width: "35vw",
                                    padding: "0.5vw",
                                }}
                            >
                                <div className="d-flex flex-column">
                                    <div className="d-flex align-items-center">
                                        <div
                                            className={`toggleContainer ${isEnabledDataSearch ? 'enabledCont' : 'disabledCont'}`}
                                            onClick={handleToggleDataSearch}
                                            style={{ transform: "scale(0.4)" }}
                                        >
                                            <div className={`toggle-button ${isEnabledDataSearch ? 'enabledd' : 'disabled'}`}>
                                            </div>
                                        </div>
                                        <div className="d-flex adminFontTable">Фільтр дати</div>

                                        {isEnabledDataSearch && (
                                            <div className="d-flex align-items-center" style={{ marginLeft: "auto" }}>
                                                <div className="d-flex align-items-center">
                                                    <label htmlFor="start-date" className="adminFontTable">Від:</label>
                                                    <input
                                                        type="date"
                                                        id="start-date"
                                                        value={startDate}
                                                        className="adminFontTable"
                                                        onChange={(e) => setStartDate(e.target.value)}
                                                    />
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <label htmlFor="end-date" className="adminFontTable">До:</label>
                                                    <input
                                                        type="date"
                                                        id="end-date"
                                                        value={endDate}
                                                        className="adminFontTable"
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {/* Відображення datePicker при увімкненому фільтрі дати */}
                                    <div className="d-flex flex-column mt-3">
                                        <div className="d-flex align-items-center">
                                            <div
                                                className={`toggleContainer ${isEnabledStatusSearch ? 'enabledCont' : 'disabledCont'}`}
                                                onClick={handleToggleStatusSearch}
                                                style={{transform: "scale(0.4)"}}
                                            >
                                                <div
                                                    className={`toggle-button ${isEnabledStatusSearch ? 'enabledd' : 'disabled'}`}>
                                                </div>
                                            </div>
                                            <div className="d-flex adminFontTable">Фільтр статусу</div>
                                        </div>

                                        {isEnabledStatusSearch && (
                                            <div className="d-flex align-items-center" style={{ margin: "auto" }}>
                                                <div className={`btn btn-lg ${statuses.status0 ? 'statusEnabled' : 'statusDisabled'}`} style={{}}
                                                     onClick={statuses.status0 ? () => setStatuses({...statuses, status0: false}) : () => setStatuses({...statuses, status0: true})}>
                                                    <StatusBar item={{status: "0"}}/>
                                                </div>
                                                <div className={`btn btn-lg ${statuses.status1 ? 'statusEnabled' : 'statusDisabled'}`} style={{}}
                                                     onClick={statuses.status1 ? () => setStatuses({...statuses, status1: false}) : () => setStatuses({...statuses, status1: true})}>
                                                    <StatusBar item={{status: "1"}}/>
                                                </div>
                                                <div className={`btn btn-lg ${statuses.status2 ? 'statusEnabled' : 'statusDisabled'}`} style={{}}
                                                     onClick={statuses.status2 ? () => setStatuses({...statuses, status2: false}) : () => setStatuses({...statuses, status2: true})}>
                                                    <StatusBar item={{status: "2"}}/>
                                                </div>
                                                <div className={`btn btn-lg ${statuses.status3 ? 'statusEnabled' : 'statusDisabled'}`} style={{}}
                                                     onClick={statuses.status3 ? () => setStatuses({...statuses, status3: false}) : () => setStatuses({...statuses, status3: true})}>
                                                    <StatusBar item={{status: "3"}}/>
                                                </div>
                                                <div className={`btn btn-lg ${statuses.status4 ? 'statusEnabled' : 'statusDisabled'}`} style={{}}
                                                     onClick={statuses.status4 ? () => setStatuses({...statuses, status4: false}) : () => setStatuses({...statuses, status4: true})}>
                                                    <StatusBar item={{status: "4"}}/>
                                                </div>
                                                <div className={`btn btn-lg ${statuses.status5 ? 'statusEnabled' : 'statusDisabled'}`} style={{}}
                                                     onClick={statuses.status5 ? () => setStatuses({...statuses, status5: false}) : () => setStatuses({...statuses, status5: true})}>
                                                    <StatusBar item={{status: 'Відміна'}}/>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FiltrOrders;
