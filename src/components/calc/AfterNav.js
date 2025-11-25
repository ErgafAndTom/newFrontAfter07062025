import React, {useEffect, useState} from "react";
import {Link, Route, Routes, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import Loader from "./Loader";
import Desktop from "../admin/crm/Desktop/Desktop";
import Vimogi from "../admin/crm/Vimogi/Vimogi";
import Files from "./files/Files";
import CreateOrder from "./createorder/CreateOrder";
import { Login } from "../../PrintPeaksFAinal/login/Login";
import Profile from "../../PrintPeaksFAinal/user/profile/Profile";
import NewUIArtem from "../../PrintPeaksFAinal/NewUIArtem";
import { TableStorage } from "../../PrintPeaksFAinal/Storage/TableStorage";
import CustomStorageTable from "../../PrintPeaksFAinal/Storage/CustomStorageTable";
import UsersCustomTable from "../../PrintPeaksFAinal/user/UsersCustomTable";
import CustomOrderTable2 from "../../PrintPeaksFAinal/Orders/CustomOrderTable2";
import TableManager from "../../PrintPeaksFAinal/dataMenager/TableManager";
import ExportImportComponent from "../../PrintPeaksFAinal/dataMenager/ExportImportComponent";
import Colorprinthelpsmall from "../admin/crm/Vimogi/Colorprinthelpsmall";
import Printphotohelpsmall from "../admin/crm/Vimogi/Printphotohelpsmall";
import Layouthelpsmall from "../admin/crm/Vimogi/Layouthelpsmall";
import Bukletvimogi from "../admin/crm/Vimogi/Bukletvimogi";
import Holeshelpsmall from "../admin/crm/Vimogi/Holeshelpsmall";
import Skobatab from "../admin/crm/Vimogi/Skobatab";
import Bindmettab from "../admin/crm/Vimogi/bindmettab";
import Vilettab from "../admin/crm/Vimogi/vilettab";
import Сolortab from "../admin/crm/Vimogi/Colortab";
import Blacktab from "../admin/crm/Vimogi/Blacktab";
import Goldtab from "../admin/crm/Vimogi/Goldtab";
import Phototab from "../admin/crm/Vimogi/Phototab";
import Widephototab from "../admin/crm/Vimogi/Widephototab";
import Holsttab from "../admin/crm/Vimogi/Holsttab";
import CounterpartyList from "../../PrintPeaksFAinal/novaPoshta/CounterpartyList";
import LifeHackLikeBoards2 from "../../PrintPeaksFAinal/lifeHacksBoard/LifeHackLikeBoards2";
import UserFiles from "../../PrintPeaksFAinal/user/UserFiles";
import Payments from "../../PrintPeaksFAinal/user/Payments";
import Invoices from "../../pages/Invoices";
import ClientUserProfile from "../../PrintPeaksFAinal/user/client/ClientUserProfile";
import TrelloBoardAI from "../../PrintPeaksFAinal/trelloLikeBoards/TrelloBoardAI";
import Graph3D from "../../PrintPeaksFAinal/Graph3D";
import CompanyTabl from "../../PrintPeaksFAinal/company/CompanyTabl";
import Graph3D_with_comments from "../../PrintPeaksFAinal/Graph3D_with_comments";
import CompanyPage from "../../PrintPeaksFAinal/company/CompanyPage";
import UsersOrdersLikeTable from "../../PrintPeaksFAinal/user/UsersOrdersLikeTable";
import UserPageDetails from "../../PrintPeaksFAinal/user/UserPageDetails";
import Shifts from "../../PrintPeaksFAinal/checkbox/shifts/Shifts";
import axios from "../../api/axiosInstance";
import {searchChange} from "../../actions/searchAction";
import {FiPhone} from "react-icons/fi";
import {FaTelegramPlane} from "react-icons/fa";
import FiltrOrders from "../../PrintPeaksFAinal/Orders/FiltrOrders";
import TelegramAvatar from "../../PrintPeaksFAinal/Messages/TelegramAvatar";
import {RiCalculatorLine} from "react-icons/ri";
import ModalDeleteOrder from "../../PrintPeaksFAinal/Orders/ModalDeleteOrder";
import AddCashModal from "../../PrintPeaksFAinal/checkbox/shifts/AddCashModal";
import ClientCabinet from "../../PrintPeaksFAinal/userInNewUiArtem/ClientCabinet";
import Pagination from "../../PrintPeaksFAinal/tools/Pagination";
import Graph2DForBD from "../../PrintPeaksFAinal/Graph2DForBD";
import Cash from "../../PrintPeaksFAinal/checkbox/CashCash/Cash";
import MockTelegramChat from "../../PrintPeaksFAinal/telegramIntergra/MockTelegramChat";
import ContentTest from "../../PrintPeaksFAinal/telegram/ContentTest";

import TelegramBot from "../../PrintPeaksFAinal/telegram/TelegramBot";
import TelegramBotAkk from "../../PrintPeaksFAinal/telegram/TelegramBotAkk";




const AfterNav = () => {
    const user = useSelector(state => state.auth.user);
     // console.log(user);
    const pricesIsLoading = useSelector((state) => state.prices.pricesIsLoading);
    const pricesError = useSelector((state) => state.prices.pricesError);
    const token = useSelector((state) => state.auth.token);

    if (pricesIsLoading) {
        return (
            <div>
                <Routes>
                    <Route path="/" element={<Loader />} />
                    <Route path="/files" element={<Loader />} />
                    <Route path="/createOrder" element={<Loader />} />
                    <Route path="/login" element={<Loader />} />
                    <Route path="/admin" element={<Loader />} />
                    <Route path="/currentUser" element={<Loader />} />
                </Routes>
            </div>
        );
    }
    if (pricesError) {
        return (
            <div>
                <Routes>
                    <Route path="/" element={<div>{pricesError}</div>} />
                    <Route path="/files" element={<div>{pricesError}</div>} />
                    <Route path="/createOrder" element={<div>{pricesError}</div>} />
                    <Route path="/login" element={<div>{pricesError}</div>} />
                    <Route path="/admin" element={<div>{pricesError}</div>} />
                    <Route path="/currentUser" element={<div>{pricesError}</div>} />
                </Routes>
            </div>
        );
    }
    return (
        <div>
            <Routes>
                <Route path="/" element={<Desktop />} />
                <Route path="/db2" element={<ExportImportComponent />} />
                {/*<Route path="/TG" element={<TelegramBot />} />*/}
                {/*<Route path="/TG" element={<MockTelegramChat />} />*/}
                <Route path="/TG" element={<TelegramBot />} />
                <Route path="/TG2" element={<TelegramBotAkk />} />
                <Route path="/db3" element={<TableManager />} />
                <Route path="/dbGraph" element={<Graph3D_with_comments />} />
                <Route path="/dbGraph2" element={<Graph2DForBD />} />
                <Route path="/Trello" element={<TrelloBoardAI />} />
                <Route path="/Trello2" element={<LifeHackLikeBoards2 />} />
                <Route path="/Vimogi" element={<Vimogi />} />
                <Route path="/files" element={<Files />} />
                <Route path="/createOrder" element={<CreateOrder />} />
                <Route path="/login" element={<Login />} />
                {/*<Route path="/Users" element={<UsersCustomTable />} />*/}

                <Route path="/Users" element={<UsersOrdersLikeTable />} />
                <Route path="/Users/:id" element={<UserPageDetails />} />

                <Route path="/Companys" element={<CompanyTabl />} />
                <Route path="/Companys/:id" element={<CompanyPage  />} />
                <Route path="/currentUser" element={<Profile />} />
                <Route path="/client/:id" element={<ClientUserProfile />} />
                <Route path="/myFiles" element={<UserFiles />} />
                <Route path="/myPayments" element={<Payments />} />

                <Route path="/Shifts" element={<Shifts/>} />
                <Route path="/Shifts/:id" element={<CompanyTabl />} />

                <Route path="/Cashs" element={<Cash/>} />
                <Route path="/Cashs/:id" element={<CompanyTabl />} />

                <Route path="/Orders" element={<CustomOrderTable2 />} />
                {/*<Route path="/OrdersOld" element={<CustomOrderTable />} />*/}
                <Route path="/Orders/:id" element={<NewUIArtem />} />
                <Route path="/Storage" element={<CustomStorageTable name={"Склад"} />} />
                <Route path="/Devices" element={<TableStorage name={"Devices"} />} />
                <Route path="/Desktop" element={<Desktop />} />
                <Route path="/CounterpartyList" element={<CounterpartyList />} />

                <Route path="/Invoices" element={<Invoices />} />

                {/* Додаємо маршрути для вкладок Vimogi */}

                <Route path="/Vimogi" element={<Vimogi />}>
                    {/* Головні вкладки Vimogi */}
                    <Route path="colorprinthelp" element={<Colorprinthelpsmall />}>
                        {/* Вкладені маршрути для цифрового друку */}
                        <Route path="colortab" element={<Сolortab />} />
                        <Route path="blacktab" element={<Blacktab />} />
                        <Route path="goldtab" element={<Goldtab />} />
                    </Route>
                    {/* Інші вкладки */}
                    <Route path="ofsethelp" element={<div></div>} />
                    <Route path="photoprinthelp" element={<Printphotohelpsmall />}>
                        <Route path="phototab" element={<Phototab />} />
                        <Route path="widephototab" element={<Widephototab />} />
                        <Route path="holsttab" element={<Holsttab />} />
                    </Route>
                    <Route path="wideindustrialhelp" element={<div></div>} />
                    <Route path="plotercuthelp" element={<div></div>} />
                    <Route path="layouthelp" element={<Layouthelpsmall />}>
                        <Route path="holeshelpsmall" element={<Holeshelpsmall />} />
                        <Route path="bukletvimogi" element={<Bukletvimogi />} />
                        <Route path="skobatab" element={<Skobatab />} />
                        <Route path="bindmettab" element={<Bindmettab />} />
                        <Route path="vilettab" element={<Vilettab />} />
                    </Route>
                    <Route path="Sublimationhelp" element={<div></div>} />
                </Route>
            </Routes>
        </div>
    );
};

export default AfterNav;
