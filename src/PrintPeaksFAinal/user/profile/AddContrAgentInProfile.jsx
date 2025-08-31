import React, {useEffect, useState} from "react";
import axios from "../../../api/axiosInstance";
import {useNavigate} from "react-router-dom";
import {Form, Spinner} from "react-bootstrap";

function AddContrAgentInProfile({
                                    showAddPay,
                                    setShowAddPay,
                                    formData,
                                    setFormData,
                                    data,
                                    setData,
                                    showAddPayView,
                                    setShowAddPayView,
                                    showAddPayWriteId,
                                    setShowAddPayWriteId,
                                    user
                                }) {
    const [load, setLoad] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

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
        const {name, value, type, checked} = e.target;
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
            clientId: user.id,
        };
        axios.post(`/api/contractorsN/addContractor`, dataToSend)
            .then(response => {
                // console.log(response.data);
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
                width: "50vw",
                // height: "50vh",
                cursor: "auto",
            }}>
                <div className="d-flex">
                    <div className="m-auto text-center fontProductName ">
                        <h2 className="AddContractorInOrderTitle">Додати контрагента</h2>
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
                <div style={{
                    border: "none",
                    borderRadius: "1vw",
                    marginTop: "0",
                    marginLeft: "0.3vw",
                }}>

                    <div style={{padding: "1vw"}}>
                        {load && (
                            <div className="d-flex justify-content-center align-items-center" style={{height: "100%"}}>
                                <Spinner animation="border" className="mainLoader" variant="dark"/></div>
                        )}
                        {!load && (

                            <form className="AddContractorInOrderContainer" onSubmit={handleSubmit}>
                                {/*<h2 className="AddContractorInOrderTitle">Додати контрагента</h2>*/}

                                {/*<div className="AddContractorInOrderTabs">*/}
                                {/*    <button className="AddContractorInOrderTab AddContractorInOrderTabActive">Українська Компанія</button>*/}
                                {/*    <button className="AddContractorInOrderTab">Іноземна Компанія</button>*/}
                                {/*</div>*/}

                                <div className="AddContractorInOrderSubtitle">Банківські реквізити:</div>

                                <div className="AddContractorInOrderFieldGroup">
                                    <div className="AddContractorInOrderFieldRow">
                                        <label className="adminFontTable">Найменування</label>
                                        <input required value={formData.name} name="name" type="text"
                                               placeholder="Найменування ФОП або ТОВ"
                                               className="AddContractorInOrderInput" onChange={handleChange}/>
                                    </div>
                                    {/*<div className="AddContractorInOrderFieldRow">*/}
                                    {/*    <label className="adminFontTable">Тип</label>*/}
                                    {/*    <select value={formData.type} name="type" onChange={handleChange} className="AddContractorInOrderSelect">*/}
                                    {/*        <option value="Фізична особа">Фізична особа</option>*/}
                                    {/*        <option value="Юридична особа">Юридична особа</option>*/}
                                    {/*    </select>*/}
                                    {/*</div>*/}
                                    <div className="AddContractorInOrderFieldRow">
                                        <label className="adminFontTable">Адреса</label>
                                        <input value={formData.address} name="address" type="text" placeholder="Адреса"
                                               className="AddContractorInOrderInput" onChange={handleChange}/>
                                    </div>
                                    <div className="AddContractorInOrderFieldRow">
                                        <label className="adminFontTable">Назва банку</label>
                                        <input value={formData.bankName} name="bankName" type="text"
                                               placeholder="Назва банку" className="AddContractorInOrderInput"
                                               onChange={handleChange}/>
                                    </div>
                                    <div className="AddContractorInOrderFieldRow">
                                        <label className="adminFontTable">IBAN</label>
                                        <input value={formData.iban} name="iban" type="text"
                                               placeholder="UA 123456789 123456789123456"
                                               className="AddContractorInOrderInput" onChange={handleChange}/>
                                    </div>
                                    <div className="AddContractorInOrderFieldRow">
                                        <label className="adminFontTable">ЄДРПОУ</label>
                                        <input value={formData.edrpou} name="edrpou" type="text" placeholder="123456789"
                                               className="AddContractorInOrderInput" onChange={handleChange}/>
                                    </div>
                                </div>

                                <h3 className="AddContractorInOrderSubtitle">Контакти:</h3>

                                <div className="AddContractorInOrderFieldGroup">
                                    <div className="AddContractorInOrderFieldRow">
                                        <label className="adminFontTable">E-mail</label>
                                        <input value={formData.email} name="email" type="email"
                                               placeholder="example@mail.com" className="AddContractorInOrderInput"
                                               onChange={handleChange}/>
                                    </div>
                                    <div className="AddContractorInOrderFieldRow">
                                        <label className="adminFontTable">Номер телефону:</label>
                                        <input value={formData.phone} name="phone" type="text"
                                               placeholder="+380 111 111 111" className="AddContractorInOrderInput"
                                               onChange={handleChange}/>
                                    </div>
                                </div>

                                <h3 className="AddContractorInOrderSubtitle">Система оподаткування та Опис</h3>

                                <div className="AddContractorInOrderFieldGroup">
                                    <div className="AddContractorInOrderFieldRow">
                                        <label className="adminFontTable">Система оподаткування</label>
                                        <select value={formData.taxSystem} name="taxSystem" onChange={handleChange}
                                                required className="AddContractorInOrderSelect">
                                            {/*<option value="">Оберіть систему оподаткування</option>*/}
                                            <option value="ФОП">ФОП</option>
                                            {/*<option value="ФОП 2 група">2 група</option>*/}
                                            {/*<option value="ФОП 3 група">3 група</option>*/}
                                            {/*<option value="3 група із ПДВ">3 група із ПДВ</option>*/}
                                            {/*<option value="4 група">4 група</option>*/}
                                            {/*<option value="загальна система без ПДВ">Загальна система</option>*/}
                                            <option value="ТОВ">ТОВ</option>
                                            {/*<option value="загальна система із ПДВ">загальна система із ПДВ</option>*/}
                                            {/*<option value="Дія.Сіті">Дія.Сіті</option>*/}
                                            <option value="Неприбуткова організація">Неприбуткова організація</option>
                                        </select>
                                    </div>
                                    {/*<div className="AddContractorInOrderFieldRow">*/}
                                    {/*    <label className="adminFontTable">ПДВ</label>*/}
                                    {/*    <input*/}
                                    {/*        name="pdv"*/}
                                    {/*        type="checkbox"*/}
                                    {/*        checked={formData.pdv === "true"}*/}
                                    {/*        onChange={handleChange}*/}
                                    {/*    />*/}
                                    {/*</div>*/}
                                    <div className="AddContractorInOrderFieldRow">
                                        <label className="adminFontTable">ПДВ</label>
                                        <Form.Check
                                            type="checkbox"
                                            name="pdv"
                                            id="pdv-checkbox"
                                            label=""
                                            className="fontSize2-5VH"
                                            checked={formData.pdv === "true"}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="AddContractorInOrderFieldRow">
                                        <label className="adminFontTable">Коментар</label>
                                        <textarea name="comment" placeholder="Залиште коментар" onChange={handleChange}
                                                  className="AddContractorInOrderTextarea"/>
                                    </div>
                                </div>

                                {showAddPayView &&
                                    <div className="AddContractorInOrderSubmitBlock">
                                        <button className="AddContractorInOrderSubmitBtn"
                                                onClick={handleSubmitUpdate}>Редагувати
                                        </button>
                                    </div>
                                }
                                {!showAddPayView &&
                                    <div className="AddContractorInOrderSubmitBlock">
                                        <button type="submit" className="AddContractorInOrderSubmitBtn"
                                                onClick={handleSubmitAdd}>Додати
                                        </button>
                                    </div>
                                }

                                {error && (
                                    <div>{error}</div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddContrAgentInProfile;
