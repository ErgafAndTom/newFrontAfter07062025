import "./styles.css";
// import AddPaysInOrder from "./AddPayInOrder";
import ModalDeleteOrder from "../../Orders/ModalDeleteOrder";
import React, {useState, useEffect} from "react";
import axios from "../../../api/axiosInstance";
import {useNavigate} from "react-router-dom";
import {Spinner} from "react-bootstrap";
import AddContrAgentInProfileAdmin from "./AddContrAgentInProfileAdmin";

/**
 * RESTORED VERSION — 04 May 2025
 * Оригінальна логіка на «showPays / setShowPays» із плавною анімацією, списком реквізитів
 * та генерацією документів (накладна / акт, рахунок).
 */
function PaysInOrderRestoredForAdmin({user}) {
    const navigate = useNavigate();

    // ──────────────────────────── STATE ────────────────────────────
    const [load, setLoad] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    // Delete‑flow
    const [thisOrderForDelete, setThisOrderForDelete] = useState(null);
    const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);

    // Add / view contractor
    const [showAddPay, setShowAddPay] = useState(false);
    const [showAddPayView, setShowAddPayView] = useState(false);
    const [showAddPayWriteId, setShowAddPayWriteId] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        type: "",
        address: "",
        bankName: "",
        iban: "",
        edrpou: "",
        email: "",
        phone: "",
        taxSystem: "",
        pdv: "",
        comment: "",
    });

    // Pagination & filters
    const [inPageCount, setInPageCount] = useState(500);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(null);
    const [typeSelect, setTypeSelect] = useState("");
    const [thisColumn, setThisColumn] = useState({column: "id", reverse: true});
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Modal animation flags
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // ──────────────────────────── HELPERS ────────────────────────────
    // const handleClose = () => {
    //     setIsAnimating(false);
    //     setTimeout(() => {
    //         setIsVisible(false);
    //         setActiveContrAgentTab(false);
    //     }, 300);
    // };

    const openAddPay = () => {
        setShowAddPay(!showAddPay);
        setShowAddPayView(false);
        setFormData({
            name: "",
            type: "",
            address: "",
            bankName: "",
            iban: "",
            edrpou: "",
            email: "",
            phone: "",
            taxSystem: "",
            pdv: "",
            comment: "",
            contractorId: "",
            contractorName: "",
        });
    };

    const openSeePay = (e, item) => {
        setShowAddPay(!showAddPay);
        setShowAddPayView(true);
        setShowAddPayWriteId(item.id);
        setFormData({
            name: item.name,
            type: item.type,
            contractorId: item.id,
            contractorName: item.Contractor.name
        });
    };

    const openDeletePay = (e, item) => {
        setShowDeleteOrderModal(true);
        setThisOrderForDelete(item);
    };

    // const generateInvoice = (e, item) => {
    //     e.preventDefault();
    //     setLoad(true);
    //     axios
    //         .post(
    //             `/api/invoices/from-order/${thisOrder.id}/document`,
    //             { supplierId: thisOrder.executorId, buyerId: item.id },
    //             { responseType: "blob" }
    //         )
    //         .then(resp => downloadBlob(resp, `invoice_${thisOrder.id}.docx`))
    //         .catch(handleAxiosError)
    //         .finally(() => setLoad(false));
    // };

    // const downloadBlob = (response, fallbackName) => {
    //     const contentDisposition = response.headers["content-disposition"];
    //     let fileName = fallbackName;
    //     if (contentDisposition) {
    //         const match = contentDisposition.match(/filename="(.+)"/);
    //         if (match?.length === 2) fileName = match[1];
    //     }
    //
    //     const url = window.URL.createObjectURL(new Blob([response.data]));
    //     const link = document.createElement("a");
    //     link.href = url;
    //     link.setAttribute("download", fileName);
    //     document.body.appendChild(link);
    //     link.click();
    //     link.remove();
    //     window.URL.revokeObjectURL(url);
    // };

    const handleAxiosError = (error) => {
        if (error.response?.status === 403) navigate("/login");
        setError(error.message);
        setLoad(false);
    };

    // ──────────────────────────── DATA FETCH ────────────────────────────
    useEffect(() => {
        const payload = {
            inPageCount,
            currentPage,
            search: typeSelect,
            columnName: thisColumn,
            startDate,
            endDate,
        };

        setLoad(true);
        axios
            .post(`/api/contractorsN/getPPContractors`, payload)
            .then((response) => {
                // console.log(response.data.rows);
                setData(response.data.rows);
                setPageCount(Math.ceil(response.data.count / inPageCount));
                setError(null);
                setLoad(false);
            })
            .catch(handleAxiosError);
    }, [typeSelect, thisColumn, startDate, endDate]);

    // ──────────────────────────── MODAL ANIMATION ──────────────────────
    // useEffect(() => {
    //     if (showPays) {
    //         setIsVisible(true);
    //         setTimeout(() => setIsAnimating(true), 100);
    //     } else {
    //         setIsAnimating(false);
    //         setTimeout(() => setIsVisible(false), 300);
    //     }
    //     // console.log(showPays);
    // }, [showPays]);

    // ──────────────────────────── RENDER ───────────────────────────────
    // if (!isVisible) return null;

    return (
        <div>
            {/* Overlay */}
            {/*<div*/}
            {/*    onClick={handleClose}*/}
            {/*    style={{*/}
            {/*        width: "100vw",*/}
            {/*        height: "100vh",*/}
            {/*        position: "fixed",*/}
            {/*        left: 0,*/}
            {/*        top: 0,*/}
            {/*        background: "rgba(0,0,0,0.2)",*/}
            {/*        opacity: isAnimating ? 1 : 0,*/}
            {/*        transition: "opacity .3s ease-in-out",*/}
            {/*        zIndex: 100,*/}
            {/*    }}*/}
            {/*/>*/}

            {/* Modal */}
            <div
                style={{
                    // position: "fixed",
                    // left: "50%",
                    // top: "50%",
                    // transform: isAnimating
                    //     ? "translate(-50%, -50%) scale(1)"
                    //     : "translate(-50%, -50%) scale(0.8)",
                    // opacity: isAnimating ? 1 : 0,
                    transition: "opacity .3s, transform .3s",
                    backgroundColor: "#FBFAF6",
                    width: "86vw",
                    height: "65vh",
                    borderRadius: "1vw",
                    zIndex: 2,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Header */}
                {/*<div className="d-flex">*/}
                {/*    <div className="m-auto text-center fontProductName">Реквізити</div>*/}
                {/*    /!*<button className="btn btn-close btn-lg" style={{margin: "0.5vw"}} onClick={handleClose}/>*!/*/}
                {/*</div>*/}

                {/* Body */}
                <div style={{padding: "1vw", overflow: "auto"}}>
                    {error && <div className="text-danger mb-2">{error}</div>}

                    {load ? (
                        <div className="d-flex justify-content-center align-items-center" style={{height: "100%"}}>
                            <Spinner animation="border" variant="dark"/>
                        </div>
                    ) : (
                        <table className="ContractorTable w-100">
                            <thead>
                            <tr className="ContractorRow">
                                <th className="fontSize1VH">№</th>
                                <th className="fontSize1VH">Найменування</th>
                                <th className="fontSize1VH">Найменування Contractor</th>
                                <th className="fontSize1VH">Податкова система</th>
                                <th className="fontSize1VH">Тел</th>
                                <th className="fontSize1VH">E-mail</th>
                                <th className="fontSize1VH">НДС/ПДВ</th>
                                <th className="fontSize1VH">юзер/клієнт</th>
                                <th className="fontSize1VH">last оновл.</th>
                                <th className="fontSize1VH">Дії</th>
                            </tr>
                            </thead>
                            <tbody>
                            {data?.map((item, idx) => (
                                <tr className="ContractorRow" key={item.id}>
                                    <td className="ContractorCell fontSize1VH">{idx + 1}</td>
                                    <td className="ContractorCell ContractorName fontSize1VH">{item.name}</td>
                                    <td className="ContractorCell fontSize1VH">{item.Contractor.name}</td>
                                    <td className="ContractorCell fontSize1VH">{item.Contractor.taxSystem}</td>
                                    <td className="ContractorCell fontSize1VH">{item.Contractor.phone}</td>
                                    <td className="ContractorCell fontSize1VH">{item.Contractor.email}</td>
                                    <td className="ContractorCell fontSize1VH">{item.Contractor.pdv ? '+' : '-'}</td>
                                    <td className="ContractorCell fontSize1VH">{`${item.Contractor.User.firstName} ${item.Contractor.User.lastName} ${item.Contractor.User.familyName} (${item.Contractor.User.phoneNumber})`}</td>
                                    <td className="ContractorCell fontSize1VH">{`${new Date(item.updatedAt).toLocaleDateString()} ${new Date(item.updatedAt).toLocaleTimeString()}`}</td>
                                    <td className="ContractorCell ContractorActions fontSize1VH">
                                        {/*<button className="ContractorViewBtn" style={{background: "green"}}*/}
                                        {/*        onClick={(e) => generateInvoice(e, item)}>*/}
                                        {/*    Генерим инвойс + получаем*/}
                                        {/*</button>*/}
                                        {/*<button className="ContractorViewBtn" style={{background: "green"}}*/}
                                        {/*        onClick={(e) => generateDoc1(e, item)}>*/}
                                        {/*    Рахунок*/}
                                        {/*</button>*/}
                                        <button className="adminButtonAdd" onClick={(e) => openSeePay(e, item)}>
                                            Переглянути/Редагувати
                                        </button>
                                        <button
                                            // className="ContractorMoreBtn"
                                            className="adminButtonAdd"
                                            style={{background: '#ff5d5d',}}
                                            onClick={(e) => openDeletePay(e, item)}
                                        >
                                            {/*⋮*/}
                                            Видалити
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}

                    <button className="adminButtonAdd" onClick={openAddPay} style={{marginTop: "2.2vmin"}}>
                        Додати контрагента для Доков
                    </button>

                    {showAddPay && (
                        <AddContrAgentInProfileAdmin
                            showAddPay={showAddPay}
                            setShowAddPay={setShowAddPay}
                            formData={formData}
                            setFormData={setFormData}
                            user={user}
                            // thisOrder={thisOrder}
                            // setThisOrder={setThisOrder}
                            data={data}
                            setData={setData}
                            showAddPayView={showAddPayView}
                            setShowAddPayView={setShowAddPayView}
                            showAddPayWriteId={showAddPayWriteId}
                            setShowAddPayWriteId={setShowAddPayWriteId}
                        />
                    )}

                    <ModalDeleteOrder
                        showDeleteOrderModal={showDeleteOrderModal}
                        setShowDeleteOrderModal={setShowDeleteOrderModal}
                        thisOrderForDelete={thisOrderForDelete}
                        setThisOrderForDelete={setThisOrderForDelete}
                        data={data}
                        setData={setData}
                        url="/api/contractorsN/deletePPContractor"
                    />
                </div>
            </div>
        </div>
    );
}

export default PaysInOrderRestoredForAdmin;
