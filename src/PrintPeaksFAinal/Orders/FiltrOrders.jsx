import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import StatusBar from "./StatusBar";
import  "./FiltrOrders.css";

const FiltrOrders = ({ typeSelect, setTypeSelect, startDate, endDate, setEndDate, setStartDate, setStatuses, statuses, payments, setPayments }) => {
    const navigate = useNavigate();
    const [load, setLoad] = useState(false);
    const [show, setShow] = useState(false);
    const [error, setError] = useState(false);
    const [isEnabledDataSearch, setIsEnabledDataSearch] = useState(false);
    const [isEnabledStatusSearch, setIsEnabledStatusSearch] = useState(false);
    const [isEnabledPaymentsSearch, setIsEnabledPaymentsSearch] = useState(false);

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

  const handleTogglePaymentsSearch = () => {
    if (isEnabledPaymentsSearch) {
      setPayments({...payments, payment0: true, payment1: true, payment2: true, payment3: true})
    } else {
      setPayments({...payments, payment0: false, payment1: false, payment2: false, payment3: false})
    }
    setIsEnabledPaymentsSearch(!isEnabledPaymentsSearch);
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
        <div className="d-flex align-content-center justify-content-center">
            <div className="d-flex flex-row">
                <button className="adminButtonAdd" onClick={handleClickFilter}>
                    <i className="fas fa-search">Фільтр</i>
                </button>
                {/*<>*/}
                {/*    <input type="text" className="" placeholder="Search" />*/}
                {/*</>*/}
                {/*<button className="btn btn-primary">*/}
                {/*    <i className="fas fa-search"></i>*/}
                {/*</button>*/}
            </div>
            {show && (
                <div className="" style={{margin: "0"}}>
                    {isVisible && (
                      <div className="pp-filters-row">

                        {/* ФІЛЬТР ДАТИ */}
                        <div className="pp-inline-item">
                          <label className="pp-toggle">
                            <input
                              type="checkbox"
                              checked={isEnabledDataSearch}
                              onChange={handleToggleDataSearch}
                            />
                            <span className="pp-toggle-slider" />
                          </label>

                          <div className="pp-label-title">ФІЛЬТР ДАТИ</div>
                        </div>

                        {/* ВІД/ДО — також в один рядок */}
                        {isEnabledDataSearch && (
                          <div className="pp-date-row">
                            <div className="pp-date-item-inline">
                              <label className="pp-label-small">ВІД:</label>
                              <input
                                type="date"
                                className="pp-input"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                              />
                            </div>

                            <div className="pp-date-item-inline">
                              <label className="pp-label-small">ДО:</label>
                              <input
                                type="date"
                                className="pp-input"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                              />
                            </div>
                          </div>
                        )}

                        {/* ФІЛЬТР СТАТУСІВ */}
                        <div className="pp-inline-item">
                          <label className="pp-toggle">
                            <input
                              type="checkbox"
                              checked={isEnabledStatusSearch}
                              onChange={handleToggleStatusSearch}
                            />
                            <span className="pp-toggle-slider" />
                          </label>

                          <div className="pp-label-title">СТАТУС ЗАМОВЛЕНЬ</div>
                        </div>

                        {isEnabledStatusSearch && (
                          <div className="pp-status-row">
                            {[
                              ["status0", "ОФОРМЛЕННЯ"],
                              ["status1", "ДРУКУЄТЬСЯ"],
                              ["status2", "ПОСТПРЕСС"],
                              ["status3", "ГОТОВЕ"],
                              ["status4", "ВІДДАЛИ"],
                              ["status5", "ВИДАЛЕНО"],
                            ].map(([key, label]) => (
                              <div
                                key={key}
                                className={`pp-status-tile ${statuses[key] ? "active" : ""}`}
                                onClick={() => setStatuses({ ...statuses, [key]: !statuses[key] })}
                              >
                                {label}
                              </div>
                            ))}
                          </div>
                        )}

                        {payments && (
                          <>
                            {/* ФІЛЬТР Payments */}
                            <div className="pp-inline-item">
                              <label className="pp-toggle">
                                <input
                                  type="checkbox"
                                  checked={isEnabledPaymentsSearch}
                                  onChange={handleTogglePaymentsSearch}
                                />
                                <span className="pp-toggle-slider" />
                              </label>

                              <div className="pp-label-title">СТАТУС Оплати</div>
                            </div>

                            {isEnabledPaymentsSearch && (
                              <div className="pp-status-row">
                                {[
                                  ["payment0", "У процессі"],
                                  ["payment1", "Оплачено"],
                                  ["payment2", "Відміна/Просрочено"],
                                  // ["payment3", "Просрочено"],
                                ].map(([key, label]) => (
                                  <div
                                    key={key}
                                    className={`pp-status-tile ${payments[key] ? "active" : ""}`}
                                    onClick={() => setPayments({ ...payments, [key]: !payments[key] })}
                                  >
                                    {label}
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}

                      </div>

                    )}
                </div>
            )}
        </div>
    );
};

export default FiltrOrders;
