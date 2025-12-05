import React, { useEffect, useState, useRef } from "react";
import axios from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import {Spinner} from "react-bootstrap";
import {Form} from "react-bootstrap";

function AddPaysInOrder({ showAddPay, setShowAddPay,  data, setData, showAddPayView, setShowAddPayView, showAddPayWriteId, setShowAddPayWriteId, thisOrder, setThisOrder }) {
    const [load, setLoad] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
   const dropdownRef = useRef(null);  // ✅ для доступу до контейнера селекта
  const [open, setOpen] = useState(false);  // ✅ відкриття / закриття випадаючого списку
  const [formData, setFormData] = useState({
    taxSystem: "ФОП", //   ✅ обране значення системи оподаткування
    // ...інші поля твоєї форми
  });
    const handleClose = () => {
        setIsAnimating(false); // Начинаем анимацию закрытия
        setTimeout(() => {
            setIsVisible(false)
            setShowAddPay(false);
        }, 300); // После завершения анимации скрываем модальное окно
    }

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData(prev => ({ ...prev, [name]: value }));
    // };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox'
                ? (checked ? "true" : "false")
                : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    };

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();
        setLoad(true);
        let dataToSend = {
            formData: formData,
            contractorId: showAddPayWriteId
        };
        axios.post(`/api/contractorsN/updateContractor`, dataToSend)
            .then(response => {
                // console.log(response.data);
                setData(prevData =>
                    prevData.map(obj =>
                        obj.id === response.data.id ? response.data : obj
                    )
                );
                setError(null);
                setLoad(false);
                setShowAddPay(false)
                // setPageCount(Math.ceil(response.data.count / inPageCount));
            })
            .catch(error => {
                if (error.response.status === 403) {
                    navigate('/login');
                }
                setError(error.message);
                setLoad(false);
            });
    };

    const handleSubmitAdd = async (e) => {
        e.preventDefault();
        setLoad(true);
        let dataToSend = {
            formData: formData,
            clientId: thisOrder.clientId,
        };
        axios.post(`/api/contractorsN/addContractor`, dataToSend)
            .then(response => {
                console.log(response.data);
                console.log(data);
                setData([
                    ...data,
                    response.data
                ]);
                setError(null);
                setLoad(false);
                setShowAddPay(false)
                // setPageCount(Math.ceil(response.data.count / inPageCount));
            })
            .catch(error => {
                if (error.response.status === 403) {
                    navigate('/login');
                }
                setError(error.message);
                setLoad(false);
            });
    };

    useEffect(() => {
        if (showAddPay) {
            setIsVisible(true); // Сначала показываем модальное окно
            setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
        } else {
            setIsAnimating(false); // Начинаем анимацию закрытия
            setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
        }
    }, [showAddPay]);

    return (
        <div>
            <div className="" onClick={handleClose} style={{
                width: "150vw",
                zIndex: "101",
                height: "150vh",
                background: "rgba(0, 0, 0, 0.2)",
                opacity: isAnimating ? 1 : 0, // для анимации прозрачности
                transition: "opacity 0.3s ease-in-out", // плавная анимация
                position: "fixed",
                // transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.8)", // анимация масштаба
                left: "-10vw",
                bottom: "-10vh"
            }}>
            </div>
            <div style={{
                zIndex: "101",
                display: "flex",
                flexDirection: "column",
                position: "fixed",
                // backgroundColor: '#FBFAF6',
                backgroundColor: '#FAF8F3FF',
                left: "50%",
                top: "50%",
                transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.8)", // анимация масштаба
                opacity: isAnimating ? 1 : 0, // анимация прозрачности
                transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out", // плавная анимация
                borderRadius: "1vw",
                width: "40vw",
                // height: "50vh",
                cursor: "auto",
            }}>
                <div className="d-flex">
                    {/*<div className="m-auto text-center fontProductName ">*/}
                    {/*    <h2 className="AddContractorInOrderTitle">Додати контрагента</h2>*/}
                    {/*</div>*/}
                    {/*<div*/}
                    {/*    className="btn btn-close btn-lg"*/}
                    {/*    style={{*/}
                    {/*        margin: "0.5vw",*/}
                    {/*    }}*/}
                    {/*    onClick={handleClose}*/}
                    {/*>*/}
                    {/*</div>*/}
                </div>
                <div style={{
                    border: "none",
                    borderRadius: "1vw",
                    marginTop: "0",
                    marginLeft: "0.3vw",
                }}>

                    <div style={{padding: "1vw"}}>
                        {load && (
                            <div className="d-flex justify-content-center align-items-center" style={{height: "100%"}}><Spinner animation="border" className="mainLoader" variant="dark" /></div>
                        )}
                        {!load && (

                            <form className="AddContractorInOrderContainer" onSubmit={handleSubmit}>
                                {/*<h2 className="AddContractorInOrderTitle">Додати контрагента</h2>*/}

                                {/*<div className="AddContractorInOrderTabs">*/}
                                {/*    <button className="AddContractorInOrderTab AddContractorInOrderTabActive">Українська Компанія</button>*/}
                                {/*    <button className="AddContractorInOrderTab">Іноземна Компанія</button>*/}
                                {/*</div>*/}

                                {/*<div className="AddContractorInOrderSubtitle">Банківські реквізити:</div>*/}

                                <div className="AddContractorInOrderFieldGroup">
                                    <div className="AddContractorInOrderFieldRow">
                                        <div className="adminFontTable">Контрагент </div>
                                        <input required value={formData.name} name="name" type="text" placeholder="Назва ФОП / компанії / організації" className="AddContractorInOrderInput" onChange={handleChange} />
                                    </div>
                                    {/*<div className="AddContractorInOrderFieldRow">*/}
                                    {/*    <div className="adminFontTable">Тип</div>*/}
                                    {/*    <select value={formData.type} name="type" onChange={handleChange} className="AddContractorInOrderSelect">*/}
                                    {/*        <option value="Фізична особа">Фізична особа</option>*/}
                                    {/*        <option value="Юридична особа">Юридична особа</option>*/}
                                    {/*    </select>*/}
                                    {/*</div>*/}
                                  <div className="AddContractorInOrderFieldGroup d-flex flex-row justify-content-start  ">
                                    <div className="AddContractorInOrderFieldRow">
                                      <div className="adminFontTable">Система оподаткування</div>
                                      {/* CUSTOM SELECT: Система оподаткування */}
                                      <div
                                        className="custom-select-container-rah selectArtem-rah justify-content-start align-items-center"
                                        ref={dropdownRef}
                                        style={{  width: "18vw", fontSize: "1.5vh" }}
                                      >
                                        <div
                                          className="custom-select-header-rah"
                                          style={{  }}
                                          onClick={() => setOpen(!open)}
                                        >
                                          {formData.taxSystem
                                            ? formData.taxSystem
                                            : "Оберіть систему оподаткування"}
                                          <span
                                            className={`arrow-rah ${open ? "up" : "down"}`}
                                            style={{ color: "#f2a901", fontSize:"3vh", marginLeft:"1vh" }}
                                          >
      ▾                                  </span>
                                        </div>

                                        {open && (
                                          <div className="custom-select-dropdown-rah">
                                            {[
                                              { value: "ФОП", label: "ФОП" },
                                              { value: "ТОВ", label: "ТОВ" },
                                              { value: "Неприбуткова організація", label: "Неприбуткова організація" },
                                            ].map((option, i) => (
                                              <div
                                                key={i}
                                                className={`custom-option-rah ${
                                                  formData.taxSystem === option.value ? "active" : ""
                                                }`}
                                                onClick={() => {
                                                  setFormData({ ...formData, taxSystem: option.value });
                                                  setOpen(false);
                                                }}
                                              >
                                                <span className="name">{option.label}</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                      </div>
                                      <div className="AddContractorInOrderFieldRow" style={{
                                        width: "4vw", position: "absolute", right: "3.2vw",
                                      }}>
                                        <div className="adminFontTable" >
                                          ПДВ
                                        </div>

                                        <div className="checkbox-wrapper-10" >
                                          <input
                                            type="checkbox"
                                            name="pdv"
                                            id="pdv-checkbox"
                                            // style={{ height: "2vw", width:"3vw"}}
                                            className="tgl tgl-flip"
                                            // checked={formData.pdv === "true"}
                                            onChange={handleChange}
                                            style={{
                                              maxWidth: "2vw"
                                            }}
                                          />
                                          <label
                                            htmlFor="pdv-checkbox"
                                            data-tg-on="Так"
                                            data-tg-off="Ні"
                                            className="tgl-btn"

                                          ></label>
                                        </div>
                                      </div>


                                    </div>



                                  </div>
                                    <div className="AddContractorInOrderFieldRow">
                                        <div className="adminFontTable">Адреса</div>
                                        <input value={formData.address} name="address" type="text" placeholder="Адреса ФОП / компанії / організації" className="AddContractorInOrderInput" onChange={handleChange} />
                                    </div>
                                    <div className="AddContractorInOrderFieldRow">
                                        <div className="adminFontTable">Банк</div>
                                        <input value={formData.bankName} name="bankName" type="text" placeholder="Банк контрагента" className="AddContractorInOrderInput" onChange={handleChange} />
                                    </div>
                                    <div className="AddContractorInOrderFieldRow">
                                        <div className="adminFontTable">IBAN</div>
                                        <input value={formData.iban} name="iban" type="text" placeholder="UA 123456789 123456789123456" className="AddContractorInOrderInput" onChange={handleChange} />
                                    </div>
                                    <div className="AddContractorInOrderFieldRow">
                                        <div className="adminFontTable">ЄДРПОУ</div>
                                        <input value={formData.edrpou} name="edrpou" type="text" placeholder="123456789" className="AddContractorInOrderInput" onChange={handleChange} />
                                    </div>
                                </div>

                                {/*<h3 className="AddContractorInOrderSubtitle">Контакти:</h3>*/}

                                <div className="AddContractorInOrderFieldGroup">
                                    <div className="AddContractorInOrderFieldRow">
                                        <div className="adminFontTable">E-mail</div>
                                        <input value={formData.email} name="email" type="email" placeholder="example@mail.com" className="AddContractorInOrderInput" onChange={handleChange} />
                                    </div>
                                    <div className="AddContractorInOrderFieldRow">
                                        <div className="adminFontTable">Номер телефону:</div>
                                        <input value={formData.phone} name="phone" type="text" placeholder="+380 111 111 111" className="AddContractorInOrderInput" onChange={handleChange} />
                                    </div>
                                </div>
                              <div className="AddContractorInOrderFieldRow">
                                <div className="adminFontTable">Коментар</div>
                                <textarea name="comment" placeholder="Залиште коментар" onChange={handleChange} className="AddContractorInOrderTextarea" />
                              </div>
                                {/*<h3 className="AddContractorInOrderSubtitle">Система оподаткування та Опис</h3>*/}



                                {showAddPayView &&
                                    <div className="AddContractorInOrderSubmitBlock">
                                        <button className="adminButtonAdd" style={{background: "lightgray", fontSize: "1.2vh"}} onClick={handleSubmitUpdate}>Редагувати</button>
                                    </div>
                                }
                                {!showAddPayView &&
                                    <div className="AddContractorInOrderSubmitBlock">
                                        <button type="submit" className="adminButtonAdd" style={{marginTop:"1.5vh"}} onClick={handleSubmitAdd}>Додати</button>
                                    </div>
                                }

                                {error && (
                                    <div>{error}v</div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddPaysInOrder;
