import {useState} from "react";
import {Button} from "@mui/material";
import ClientPip from "../components/ClientPip";
import PortalPopup from "../components/PortalPopup";
import ClientFull from "../components/ClientFull";
import OrderFull from "../components/OrderFull";
import {useNavigate} from "react-router-dom";
import "./Artboard.css";
import "../../global.css";

const Artboard = () => {
    const [isClientPipOpen, setClientPipOpen] = useState(false);
    const [isClientFullOpen, setClientFullOpen] = useState(false);
    const [isOrderFullOpen, setOrderFullOpen] = useState(false);
    const navigate = useNavigate();

    const openClientPip = () => {
        setClientPipOpen(true);
    };

    const closeClientPip = () => {
        setClientPipOpen(false);
    };

    const openClientFull = () => {
        setClientFullOpen(true);
    };

    const closeClientFull = () => {
        setClientFullOpen(false);
    };

    const openOrderFull = () => {
        setOrderFullOpen(true);
    };

    const closeOrderFull = () => {
        setOrderFullOpen(false);
    };

    const onButtonClick = () => {
        navigate("/plus-prod");
    };

    const onButtonClick1 = () => {
        navigate("/client-pip");
    };

    const onContainerClick = () => {
        navigate("/order-full");
    };

    const onKnopAClick = () => {
        navigate("/client-full");
    };

    return (
        <>
            <div className="div627">
                <img className="toggle-icon" alt="" src="/4-toggle.svg"/>
                <div className="contained">
                    <div className="text-icon">
                        <div className="enabled">
                            <div className="container">
                                <div className="light-elevation02dp">
                                    <div className="shadow">
                                        <div className="rectangle"/>
                                        <div className="rectangle1"/>
                                        <div className="rectangle2"/>
                                    </div>
                                </div>
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai"/>
                                </div>
                            </div>
                            <div className="label49">Enabled</div>
                            <div className="iconcontentadd-24px">
                                <div className="light-elevation02dp"/>
                                <img className="color-icon22" alt="" src="/-color1.svg"/>
                            </div>
                        </div>
                        <div className="enabled1">
                            <div className="container">
                                <div className="light-elevation02dp">
                                    <div className="shadow">
                                        <div className="rectangle3"/>
                                        <div className="rectangle4"/>
                                        <div className="rectangle5"/>
                                    </div>
                                </div>
                                <div className="light-elevation02dp">
                                    <div className="stateslight-primary-contai"/>
                                </div>
                            </div>
                            <div className="label49">HOVERED</div>
                            <div className="iconcontentadd-24px">
                                <div className="light-elevation02dp"/>
                                <img className="color-icon22" alt="" src="/-color1.svg"/>
                            </div>
                        </div>
                        <div className="enabled2">
                            <div className="container">
                                <div className="light-elevation02dp">
                                    <div className="shadow">
                                        <div className="rectangle3"/>
                                        <div className="rectangle4"/>
                                        <div className="rectangle5"/>
                                    </div>
                                </div>
                                <div className="light-elevation02dp">
                                    <div className="stateslight-primary-contai1"/>
                                </div>
                            </div>
                            <div className="label49">Focused</div>
                            <div className="iconcontentadd-24px">
                                <div className="light-elevation02dp"/>
                                <img className="color-icon22" alt="" src="/-color1.svg"/>
                            </div>
                        </div>
                        <div className="enabled3">
                            <div className="light-elevation02dp">
                                <div className="light-elevation02dp">
                                    <div className="light-elevation02dp">
                                        <div className="rectangle9"/>
                                        <div className="rectangle10"/>
                                        <div className="rectangle11"/>
                                    </div>
                                </div>
                                <div className="container"/>
                                <div className="states3"/>
                            </div>
                            <div className="label52">pressed</div>
                            <div className="iconcontentadd-24px">
                                <div className="light-elevation02dp"/>
                                <img className="color-icon22" alt="" src="/-color1.svg"/>
                            </div>
                            <img className="pressed-icon" alt="" src="/pressed.svg"/>
                        </div>
                        <div className="enabled4">
                            <div className="container">
                                <div className="light-elevation02dp">
                                    <div className="light-elevation02dp">
                                        <div className="rectangle9"/>
                                        <div className="rectangle10"/>
                                        <div className="rectangle11"/>
                                    </div>
                                </div>
                                <div className="light-elevation02dp">
                                    <div className="light-elevation02dp">
                                        <div className="light-elevation02dp">
                                            <div className="rectangle9"/>
                                            <div className="rectangle10"/>
                                            <div className="rectangle11"/>
                                        </div>
                                    </div>
                                    <div className="stateslight-surface-contai1"/>
                                </div>
                            </div>
                            <div className="label49">dragged</div>
                            <div className="iconcontentadd-24px">
                                <div className="light-elevation02dp"/>
                                <img className="color-icon22" alt="" src="/-color1.svg"/>
                            </div>
                        </div>
                        <div className="enabled5">
                            <div className="container5">
                                <div className="light-elevation02dp">
                                    <div className="rectangle18"/>
                                </div>
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai"/>
                                </div>
                            </div>
                            <div className="label49">disabled</div>
                            <div className="iconcontentadd-24px5">
                                <div className="light-elevation02dp"/>
                                <img className="color-icon22" alt="" src="/-color2.svg"/>
                            </div>
                        </div>
                    </div>
                    <div className="text-only">
                        <div className="enabled6">
                            <div className="container">
                                <div className="light-elevation02dp">
                                    <div className="shadow">
                                        <div className="rectangle"/>
                                        <div className="rectangle1"/>
                                        <div className="rectangle2"/>
                                    </div>
                                </div>
                                <div className="light-elevation02dp">
                                    <div className=""/>
                                </div>
                            </div>
                            <div className="label55">Enabled</div>
                        </div>
                        <div className="enabled7">
                            <div className="container">
                                <div className="light-elevation02dp">
                                    <div className="shadow">
                                        <div className="rectangle3"/>
                                        <div className="rectangle4"/>
                                        <div className="rectangle5"/>
                                    </div>
                                </div>
                                <div className="light-elevation02dp">
                                    <div className="stateslight-primary-contai"/>
                                </div>
                            </div>
                            <div className="label56">HOVERED</div>
                        </div>
                        <div className="enabled8">
                            <div className="container">
                                <div className="light-elevation02dp3">
                                    <div className="shadow">
                                        <div className="rectangle3"/>
                                        <div className="rectangle4"/>
                                        <div className="rectangle5"/>
                                    </div>
                                </div>
                                <div className="light-elevation02dp">
                                    <div className="stateslight-primary-contai1"/>
                                </div>
                            </div>
                            <div className="label57">Focused</div>
                        </div>
                        <div className="enabled9">
                            <div className="container">
                                <div className="light-elevation02dp">
                                    <div className="light-elevation02dp">
                                        <div className="rectangle9"/>
                                        <div className="rectangle10"/>
                                        <div className="rectangle11"/>
                                    </div>
                                </div>
                                <div className="states9">
                                    <div className="stateslight-primary-contai5"/>
                                    <div className="ribble-overlay">
                                        <div className="rectangle-copy-7"/>
                                    </div>
                                </div>
                                <img className="pressed-icon1" alt="" src="/pressed1.svg"/>
                            </div>
                            <div className="label58">pressed</div>
                        </div>
                        <div className="enabled10">
                            <div className="container">
                                <div className="light-elevation02dp">
                                    <div className="light-elevation02dp">
                                        <div className="light-elevation02dp">
                                            <div className="rectangle9"/>
                                            <div className="rectangle10"/>
                                            <div className="rectangle11"/>
                                        </div>
                                    </div>
                                    <div className="stateslight-surface-contai1"/>
                                </div>
                            </div>
                            <div className="label55">dragged</div>
                        </div>
                        <div className="enabled11">
                            <div className="container5">
                                <div className="light-elevation02dp4">
                                    <div className="rectangle18"/>
                                </div>
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai4"/>
                                </div>
                            </div>
                            <div className="label56">disabled</div>
                        </div>
                    </div>
                </div>
                <div className="outlined">
                    <div className="text-icon">
                        <div className="enabled12">
                            <div className="container12">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai5"/>
                                </div>
                            </div>
                            <div className="label49">disabled</div>
                            <div className="iconcontentadd-24px">
                                <div className="light-elevation02dp"/>
                                <img className="color-icon22" alt="" src="/-color3.svg"/>
                            </div>
                        </div>
                        <div className="light-button2-outlinedb">
                            <div className="container13">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai5"/>
                                </div>
                            </div>
                            <div className="label49">dragged</div>
                            <div className="iconcontentadd-24px">
                                <div className="light-elevation02dp"/>
                                <img className="color-icon22" alt="" src="/-color3.svg"/>
                            </div>
                        </div>
                        <div className="light-button2-outlinedb1">
                            <div className="light-elevation02dp">
                                <div className="color1"/>
                                <div className="states3"/>
                            </div>
                            <div className="label63">pressed</div>
                            <img className="pressed-icon2" alt="" src="/pressed2.svg"/>
                            <div className="iconcontentadd-24px">
                                <div className="light-elevation02dp"/>
                                <img className="color-icon22" alt="" src="/-color3.svg"/>
                            </div>
                        </div>
                        <div className="light-button2-outlinedb2">
                            <div className="container15">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai5"/>
                                </div>
                            </div>
                            <div className="label63">Focused</div>
                            <div className="iconcontentadd-24px">
                                <div className="light-elevation02dp"/>
                                <img className="color-icon22" alt="" src="/-color3.svg"/>
                            </div>
                        </div>
                        <div className="light-button2-outlinedb3">
                            <div className="container16">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai5"/>
                                </div>
                            </div>
                            <div className="label49">HOVERED</div>
                            <div className="iconcontentadd-24px">
                                <div className="light-elevation02dp"/>
                                <img className="color-icon22" alt="" src="/-color3.svg"/>
                            </div>
                        </div>
                        <div className="enabled">
                            <div className="container17">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai5"/>
                                </div>
                            </div>
                            <div className="label49">Enabled</div>
                            <div className="iconcontentadd-24px">
                                <div className="light-elevation02dp"/>
                                <img className="color-icon22" alt="" src="/-color3.svg"/>
                            </div>
                        </div>
                    </div>
                    <div className="text-only1">
                        <div className="enabled6">
                            <div className="container18">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai5"/>
                                </div>
                            </div>
                            <div className="label55">Enabled</div>
                        </div>
                        <div className="enabled7">
                            <div className="container19">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai5"/>
                                </div>
                            </div>
                            <div className="label56">HOVERED</div>
                        </div>
                        <div className="enabled8">
                            <div className="container20">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai5"/>
                                </div>
                            </div>
                            <div className="label57">Focused</div>
                        </div>
                        <div className="enabled9">
                            <img className="container-icon" alt="" src="/container.svg"/>
                            <div className="label58">pressed</div>
                        </div>
                        <div className="enabled10">
                            <div className="container21">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai5"/>
                                </div>
                            </div>
                            <div className="label55">dragged</div>
                        </div>
                        <div className="enabled11">
                            <div className="container22">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai5"/>
                                </div>
                            </div>
                            <div className="label56">disabled</div>
                        </div>
                    </div>
                </div>
                <div className="text69">
                    <div className="text-icon">
                        <div className="light-button1-textb-te">
                            <div className="states3">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai"/>
                                </div>
                            </div>
                            <div className="label73">Enabled</div>
                            <div className="iconcontentadd-24px6">
                                <div className="light-elevation02dp"/>
                                <img className="color-icon22" alt="" src="/-color4.svg"/>
                            </div>
                        </div>
                        <div className="light-button1-textb-te1">
                            <div className="states3">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai"/>
                                </div>
                            </div>
                            <div className="label73">Enabled</div>
                            <div className="iconcontentadd-24px6">
                                <div className="light-elevation02dp"/>
                                <img className="color-icon22" alt="" src="/-color4.svg"/>
                            </div>
                        </div>
                        <div className="light-button1-textb-te2">
                            <div className="states3">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai"/>
                                </div>
                            </div>
                            <div className="label73">Enabled</div>
                            <div className="iconcontentadd-24px6">
                                <div className="light-elevation02dp"/>
                                <img className="color-icon22" alt="" src="/-color4.svg"/>
                            </div>
                        </div>
                        <div className="light-button1-textb-te3">
                            <div className="states3">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai"/>
                                </div>
                            </div>
                            <div className="label73">Enabled</div>
                            <div className="iconcontentadd-24px6">
                                <div className="light-elevation02dp"/>
                                <img className="color-icon22" alt="" src="/-color4.svg"/>
                            </div>
                        </div>
                        <div className="light-button1-textb-te4">
                            <div className="states3">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai"/>
                                </div>
                            </div>
                            <div className="label73">Enabled</div>
                            <div className="iconcontentadd-24px6">
                                <div className="light-elevation02dp"/>
                                <img className="color-icon22" alt="" src="/-color4.svg"/>
                            </div>
                        </div>
                        <div className="light-button1-textb-te5">
                            <div className="states3">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai"/>
                                </div>
                            </div>
                            <div className="label73">Enabled</div>
                            <div className="iconcontentadd-24px6">
                                <div className="light-elevation02dp"/>
                                <img className="color-icon22" alt="" src="/-color4.svg"/>
                            </div>
                        </div>
                    </div>
                    <div className="text-only2">
                        <div className="light-button1-texta-te">
                            <div className="states3">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai21"/>
                                </div>
                            </div>
                            <div className="label79">disabled</div>
                        </div>
                        <div className="light-button1-texta-te1">
                            <div className="states3">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai22"/>
                                </div>
                            </div>
                            <div className="label79">dragged</div>
                        </div>
                        <div className="light-button1-texta-te2">
                            <img className="container-icon" alt="" src="/container1.svg"/>
                            <div className="label79">pressed</div>
                        </div>
                        <div className="light-button1-texta-te3">
                            <div className="light-elevation02dp">
                                <div className="states3"/>
                                <div className="states31"/>
                            </div>
                            <div className="label79">Focused</div>
                        </div>
                        <div className="light-button1-texta-te4">
                            <div className="states3">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai23"/>
                                </div>
                            </div>
                            <div className="label79">HOVERED</div>
                        </div>
                        <div className="light-button1-texta-te5">
                            <div className="container33">
                                <div className="light-elevation02dp">
                                    <div className="stateslight-surface-contai22"/>
                                </div>
                            </div>
                            <div className="label79">Enabled</div>
                        </div>
                    </div>
                </div>
                <img className="fab-icon" alt="" src="/fab.svg"/>
                <div className="extended">
                    <div className="light-fab-2-extendedho">
                        <div className="container34">
                            <div className="light-elevation02dp">
                                <div className="shadow">
                                    <div className="rectangle35"/>
                                    <div className="rectangle36"/>
                                    <div className="rectangle37"/>
                                </div>
                            </div>
                            <div className="light-elevation02dp">
                                <div className="stateslight-primary-contai6">
                                    <div className="button"/>
                                </div>
                            </div>
                        </div>
                        <div className="iconcontentadd-24px12">
                            <div className="light-elevation02dp"/>
                            <img className="color-icon22" alt="" src="/-color5.svg"/>
                        </div>
                        <div className="label85">CREATE</div>
                    </div>
                    <div className="light-fab-2-extendedho1">
                        <div className="container34">
                            <div className="light-elevation02dp">
                                <div className="shadow">
                                    <div className="rectangle35"/>
                                    <div className="rectangle36"/>
                                    <div className="rectangle37"/>
                                </div>
                            </div>
                            <div className="light-elevation02dp">
                                <div className="stateslight-primary-contai6">
                                    <div className="button"/>
                                </div>
                            </div>
                        </div>
                        <div className="iconcontentadd-24px12">
                            <div className="light-elevation02dp"/>
                            <img className="color-icon22" alt="" src="/-color5.svg"/>
                        </div>
                        <div className="label85">CREATE</div>
                    </div>
                    <div className="light-fab-2-extendedfo">
                        <div className="container34">
                            <div className="light-elevation02dp">
                                <div className="shadow">
                                    <div className="rectangle35"/>
                                    <div className="rectangle36"/>
                                    <div className="rectangle37"/>
                                </div>
                            </div>
                            <div className="light-elevation02dp">
                                <div className="stateslight-primary-contai6">
                                    <div className="button"/>
                                </div>
                            </div>
                        </div>
                        <div className="iconcontentadd-24px12">
                            <div className="light-elevation02dp"/>
                            <img className="color-icon22" alt="" src="/-color5.svg"/>
                        </div>
                        <div className="label85">CREATE</div>
                    </div>
                    <div className="light-fab-2-extendedpr">
                        <div className="container34">
                            <div className="light-elevation02dp">
                                <div className="shadow">
                                    <div className="rectangle35"/>
                                    <div className="rectangle36"/>
                                    <div className="rectangle37"/>
                                </div>
                            </div>
                            <div className="light-elevation02dp">
                                <div className="stateslight-primary-contai6">
                                    <div className="button"/>
                                </div>
                            </div>
                        </div>
                        <div className="iconcontentadd-24px12">
                            <div className="light-elevation02dp"/>
                            <img className="color-icon22" alt="" src="/-color5.svg"/>
                        </div>
                        <div className="label85">CREATE</div>
                    </div>
                    <div className="light-fab-2-extended">
                        <div className="container34">
                            <div className="light-elevation02dp">
                                <div className="shadow">
                                    <div className="rectangle35"/>
                                    <div className="rectangle36"/>
                                    <div className="rectangle37"/>
                                </div>
                            </div>
                            <div className="light-elevation02dp">
                                <div className="stateslight-primary-contai6">
                                    <div className="button"/>
                                </div>
                            </div>
                        </div>
                        <div className="iconcontentadd-24px12">
                            <div className="light-elevation02dp"/>
                            <img className="color-icon22" alt="" src="/-color5.svg"/>
                        </div>
                        <div className="label85">CREATE</div>
                    </div>
                    <div className="light-fab-2-extendedho2">
                        <div className="container34">
                            <div className="light-elevation02dp">
                                <div className="shadow">
                                    <div className="rectangle35"/>
                                    <div className="rectangle36"/>
                                    <div className="rectangle37"/>
                                </div>
                            </div>
                            <div className="light-elevation02dp">
                                <div className="stateslight-primary-contai6">
                                    <div className="button"/>
                                </div>
                            </div>
                        </div>
                        <div className="iconcontentadd-24px12">
                            <div className="light-elevation02dp"/>
                            <img className="color-icon22" alt="" src="/-color5.svg"/>
                        </div>
                        <div className="label85">CREATE</div>
                    </div>
                    <div className="light-fab-2-extendedfo1">
                        <div className="container34">
                            <div className="light-elevation02dp">
                                <div className="shadow">
                                    <div className="rectangle35"/>
                                    <div className="rectangle36"/>
                                    <div className="rectangle37"/>
                                </div>
                            </div>
                            <div className="light-elevation02dp">
                                <div className="stateslight-primary-contai6">
                                    <div className="button"/>
                                </div>
                            </div>
                        </div>
                        <div className="iconcontentadd-24px12">
                            <div className="light-elevation02dp"/>
                            <img className="color-icon22" alt="" src="/-color5.svg"/>
                        </div>
                        <div className="label85">CREATE</div>
                    </div>
                    <div className="light-fab-2-extendedpr1">
                        <div className="container34">
                            <div className="light-elevation02dp">
                                <div className="shadow">
                                    <div className="rectangle35"/>
                                    <div className="rectangle36"/>
                                    <div className="rectangle37"/>
                                </div>
                            </div>
                            <div className="light-elevation02dp">
                                <div className="stateslight-primary-contai6">
                                    <div className="button"/>
                                </div>
                            </div>
                        </div>
                        <div className="iconcontentadd-24px12">
                            <div className="light-elevation02dp"/>
                            <img className="color-icon22" alt="" src="/-color5.svg"/>
                        </div>
                        <div className="label85">CREATE</div>
                    </div>
                </div>
                <img className="mini-icon" alt="" src="/mini.svg"/>
                <img className="states-icon" alt="" src="/states.svg"/>
                <div className="logo1">
                    <b className="print-peaks-erp2248">
                        <li className="print9">PRINT</li>
                        <li className="print9">PEAKS</li>
                        <li className="print9">
                            <span>ERP</span>
                            <span className="span226">2.24</span>
                        </li>
                    </b>
                </div>
                <div className="div628">
                    <div className="div629">Розмір виробу</div>
                    <div className="picker-top-label2">
                        <div className="placement-area2"/>
                        <div className="field-button14"/>
                        <div className="text70">Розмір</div>
                        <div className="chevron45">
                            <img className="shape-icon46" alt="" src="/shape7.svg"/>
                        </div>
                        <div className="cursor-area2"/>
                        <div className="touch-area2"/>
                        <div className="menu">
                            <div className="placement-area3"/>
                            <div className="background"/>
                            <div className="hover"/>
                            <div className="menu-item"/>
                            <div className="home">Home</div>
                            <div className="menu-item1"/>
                            <div className="documents">Documents</div>
                            <div className="menu-item2"/>
                            <div className="gallery">Gallery</div>
                            <div className="checkmark">
                                <img className="shape-icon47" alt="" src="/shape10.svg"/>
                            </div>
                        </div>
                        <div className="field-button15"/>
                        <div className="text71">А4 (210 х 297 мм)</div>
                        <div className="icondropdown-arrowsmall9">
                            <img className="mask-icon9" alt="" src="/mask1.svg"/>
                        </div>
                    </div>
                    <div className="div630">
                        <div className="div631"/>
                        <div className="div632">
                            <span>{`210 `}</span>
                            <span className="span227">мм</span>
                        </div>
                    </div>
                    <div className="div633">
                        <div className="div631"/>
                        <div className="div632">
                            <span>{`297 `}</span>
                            <span className="span227">мм</span>
                        </div>
                    </div>
                    <div className="div636">х</div>
                </div>
                <div className="div637">
                    <div className="div638">Розмір виробу</div>
                    <div className="div639">
                        <div className="field-button16"/>
                        <div className="text72">А4 (210 х 297 мм)</div>
                        <div className="icondropdown-arrowsmall10">
                            <div className="dropdownbuttoncarotdown-b4"/>
                            <img className="mask-icon10" alt="" src="/mask3.svg"/>
                        </div>
                    </div>
                    <div className="div640">х</div>
                    <div className="div641">
                        <div className="container-l-color34"/>
                        <div className="div642"/>
                        <div className="label93">мм</div>
                        <div className="input-text34">297</div>
                        <div className="chevron46">
                            <div className="frame44"/>
                            <img className="shape-icon48" alt="" src="/shape2.svg"/>
                        </div>
                        <div className="chevron47">
                            <div className="frame44"/>
                            <img className="shape-icon49" alt="" src="/shape3.svg"/>
                        </div>
                    </div>
                    <div className="div643">
                        <div className="container-l-color34"/>
                        <div className="div642"/>
                        <div className="label93">мм</div>
                        <div className="input-text34">210</div>
                        <div className="chevron46">
                            <div className="frame44"/>
                            <img className="shape-icon48" alt="" src="/shape2.svg"/>
                        </div>
                        <div className="chevron47">
                            <div className="frame44"/>
                            <img className="shape-icon49" alt="" src="/shape3.svg"/>
                        </div>
                    </div>
                </div>
                <div className="div645">
                    <div className="div646"/>
                </div>
                <div className="div647">
                    <div className="div648">
                        <span>{`0 `}</span>
                        <span className="span227">мм</span>
                    </div>
                    <div className="div649">
                        <span>1000</span>
                        <span className="span227"> мм</span>
                    </div>
                    <div className="div650">
                        <div className="track2"/>
                    </div>
                    <div className="div651">
                        <div className="track3"/>
                    </div>
                    <img className="handle-icon1" alt="" src="/handle.svg"/>
                </div>
                <div className="div652">
                    <div className="div653">Розмір виробу</div>
                    <div className="div654">
                        <div className="field-button16"/>
                        <div className="text72">А4 (210 х 297 мм)</div>
                        <div className="icondropdown-arrowsmall11">
                            <div className="dropdownbuttoncarotdown-b5"/>
                            <img className="mask-icon11" alt="" src="/mask2.svg"/>
                        </div>
                    </div>
                    <div className="div655">х</div>
                    <div className="div656">
                        <div className="container-l-color36"/>
                        <div className="div657"/>
                        <div className="label95">мм</div>
                        <div className="input-text36">297</div>
                        <div className="chevron50">
                            <div className="frame48"/>
                            <img className="shape-icon52" alt="" src="/shape8.svg"/>
                        </div>
                        <div className="chevron51">
                            <div className="frame48"/>
                            <img className="shape-icon53" alt="" src="/shape9.svg"/>
                        </div>
                    </div>
                    <div className="div658">
                        <div className="container-l-color36"/>
                        <div className="div657"/>
                        <div className="label95">мм</div>
                        <div className="input-text36">210</div>
                        <div className="chevron50">
                            <div className="frame48"/>
                            <img className="shape-icon52" alt="" src="/shape8.svg"/>
                        </div>
                        <div className="chevron51">
                            <div className="frame48"/>
                            <img className="shape-icon53" alt="" src="/shape9.svg"/>
                        </div>
                    </div>
                </div>
                <div className="form">
                    <div className="light-elevation02dp">
                        <div className="base204"/>
                        <img className="control-icon" alt="" src="/control.svg"/>
                    </div>
                </div>
                <div className="bind-mat2">
                    <div className="metal4">
                        <img className="r-1581-icon" alt="" src="/r-1581.svg"/>
                        <div className="metal-text4">Металева пружинка</div>
                    </div>
                    <div className="tberd5">
                        <div className="tverd-text25">Твердим переплітом</div>
                    </div>
                    <div className="skoba4">
                        <div className="tverd-text25">Скоба</div>
                    </div>
                </div>
                <div className="plus-zam1">
                    <div className="div660"/>
                    <div className="plus-zam-text5">Додати до замовлення</div>
                </div>
                <div className="material">
                    <div className="div661">Матеріал:</div>
                    <div className="div662">
                        <div className="div663">Офісний папір 80-90 г/м2</div>
                    </div>
                </div>
                <div className="print10">
                    <div className="print-text">Друк:</div>
                    <div className="side">
                        <div className="side-text">Односторонній</div>
                    </div>
                    <div className="side1">
                        <div className="side-text">Двосторонній</div>
                    </div>
                </div>
                <div className="paper-format1">
                    <div className="div661">Формат:</div>
                    <div className="div665">
                        <div className="div666">А4</div>
                    </div>
                    <div className="div667">
                        <div className="div668">А5</div>
                    </div>
                    <div className="div669">
                        <div className="div631"/>
                        <div className="div671">
                            <span>{`210 `}</span>
                            <span className="span227">мм</span>
                        </div>
                    </div>
                    <div className="div672">
                        <div className="div631"/>
                        <div className="div671">
                            <span>{`297 `}</span>
                            <span className="span227">мм</span>
                        </div>
                    </div>
                    <div className="div675">х</div>
                    <div className="div676">
                        <div className="div668">А6</div>
                    </div>
                </div>
                <button className="button19" autoFocus={true} onClick={onButtonClick}>
                    <div className="div660"/>
                    <div className="plus-prod-text5">Додати до пресетів</div>
                </button>
                <div className="arckush1">
                    <div className="arckush-text">аркушів</div>
                    <div className="kilkist9">
                        <div className="container-l-color38"/>
                        <div className="top-label15">
                            <div className="label97">Кількість</div>
                        </div>
                        <div className="div679">
                            <div className="input-text38">|</div>
                            <div className="div680"/>
                            <div className="label98">шт</div>
                        </div>
                        <div className="chevron54">
                            <div className="frame52"/>
                            <img className="shape-icon56" alt="" src="/shape4.svg"/>
                        </div>
                        <div className="chevron55">
                            <div className="frame52"/>
                            <img className="shape-icon57" alt="" src="/shape5.svg"/>
                        </div>
                    </div>
                </div>
                <div className="base205"/>
                <div className="base206"/>
                <div className="base207"/>
                <div className="base208"/>
                <div className="base209"/>
                <div className="base210"/>
                <img className="icon153" alt="" src="/-545.svg"/>
                <img className="icon154" alt="" src="/-546.svg"/>
                <div className="primary-007bff"/>
                <img className="temp-svg-icon" alt="" src="/--temp--svg-.svg"/>
                <img className="icon155" alt="" src="/-203.svg"/>
                <div className="iconmaps360-24px22">
                    <div className="boundary48"/>
                    <img className="color-icon48" alt="" src="/-color.svg"/>
                </div>
                <div className="iconmaps360-24px23">
                    <div className="boundary49"/>
                    <img className="color-icon49" alt="" src="/-color.svg"/>
                </div>
                <div className="base211"/>
                <div className="base212"/>
                <img className="base-icon18" alt="" src="/base9.svg"/>
                <div className="base213"/>
                <div className="iconmaps360-24px24">
                    <div className="boundary48"/>
                    <img className="color-icon48" alt="" src="/-color.svg"/>
                </div>
                <div className="iconmaps360-24px25">
                    <div className="boundary48"/>
                    <img className="color-icon48" alt="" src="/-color.svg"/>
                </div>
                <img className="radio-icon18" alt="" src="/radio9.svg"/>
                <div className="base214"/>
                <div className="base215"/>
                <div className="base216"/>
                <div className="base217"/>
                <div className="base218"/>
                <div className="base219"/>
                <div className="base220"/>
                <div className="base221"/>
                <div className="base222"/>
                <div className="base223"/>
                <img className="icon156" alt="" src="/-544.svg"/>
                <img className="icon157" alt="" src="/-193.svg"/>
                <img className="icon158" alt="" src="/-194.svg"/>
                <img className="icon159" alt="" src="/-195.svg"/>
                <img className="icon160" alt="" src="/-196.svg"/>
                <img className="icon161" alt="" src="/-197.svg"/>
                <div className="iconmaps360-24px26">
                    <div className="boundary49"/>
                    <img className="color-icon49" alt="" src="/-color.svg"/>
                </div>
                <div className="iconmaps360-24px27">
                    <div className="boundary48"/>
                    <img className="color-icon48" alt="" src="/-color.svg"/>
                </div>
                <div className="iconmaps360-24px28">
                    <div className="light-elevation02dp"/>
                    <img className="color-icon54" alt="" src="/-color.svg"/>
                </div>
                <div className="iconmaps360-24px29">
                    <div className="boundary48"/>
                    <img className="color-icon48" alt="" src="/-color.svg"/>
                </div>
                <div className="iconmaps360-24px30">
                    <div className="boundary48"/>
                    <img className="color-icon48" alt="" src="/-color.svg"/>
                </div>
                <div className="base224"/>
                <div className="base225"/>
                <div className="iconmaps360-24px31">
                    <div className="boundary49"/>
                    <img className="color-icon49" alt="" src="/-color.svg"/>
                </div>
                <div className="base226"/>
                <img className="base-icon19" alt="" src="/base10.svg"/>
                <img
                    className="photo-2024-07-02-08-58-25-icon3"
                    alt=""
                    src="/photo-20240702-0858251@2x.png"
                />
                <div className="div681"/>
                <img className="icon162" alt="" src="/-672.svg"/>
                <div className="iconmaps360-24px32">
                    <div className="boundary48"/>
                    <img className="color-icon48" alt="" src="/-color.svg"/>
                </div>
                <div className="div682">
                    <div className="base227"/>
                    <div className="base228"/>
                    <img className="base-icon20" alt="" src="/base5.svg"/>
                    <img className="base-icon21" alt="" src="/base6.svg"/>
                    <div className="base229"/>
                    <div className="base230"/>
                    <div className="base231"/>
                    <div className="base232"/>
                    <div className="base233"/>
                    <div className="base234"/>
                    <div className="base235"/>
                    <div className="base236"/>
                    <div className="base237"/>
                    <div className="base238"/>
                    <div className="base239"/>
                    <div className="div683">Статус</div>
                    <div className="div684">Номер</div>
                    <div className="div685">Кількість</div>
                    <div className="div686">Ціна</div>
                    <div className="div687">Знижка</div>
                    <div className="div688">Сума</div>
                    <div className="div689">Дата створення</div>
                    <div className="div690">Дата завершення</div>
                    <div className="div691">Загальна сума</div>
                    <div className="div692">Матеріал</div>
                    <div className="div693">Назва</div>
                    <div className="div694">П.І.Б</div>
                    <div className="del5">DEL</div>
                    <img className="avatar-line-icon1" alt="" src="/avatarline.svg"/>
                    <img
                        className="number-symbol-24-regular-icon1"
                        alt=""
                        src="/numbersymbol24regular.svg"
                    />
                </div>
                <div className="div695">
                    <img className="cart-icon1" alt="" src="/cart1.svg"/>
                    <img className="cart-icon2" alt="" src="/cart2.svg"/>
                </div>
                <div className="div696">
                    <img
                        className="nicepng-impresora-png-2954431-icon"
                        alt=""
                        src="/nicepng-impresorapng-2954431@2x.png"
                    />
                    <img
                        className="surecolor-p9000-front-800x800-icon1"
                        alt=""
                        src="/surecolorp9000front800x8002png1@2x.png"
                    />
                    <img
                        className="p800-fca-bnr-690x460-icon"
                        alt=""
                        src="/p800-fcabnr-690x460@2x.png"
                    />
                    <img
                        className="c-888b-11ee-b65c-9c8e994ea4a7-icon"
                        alt=""
                        src="/8099499c888b11eeb65c9c8e994ea4a7-1b31b3c0e78811eeb65d9c8e994ea4a7@2x.png"
                    />
                    <img
                        className="prynter-kyocera-ecosys-pa6000x-icon"
                        alt=""
                        src="/prynterkyoceraecosyspa6000x110c0t3nl053808844755934@2x.png"
                    />
                    <img className="icon163" alt="" src="/39-1500@2x.png"/>
                    <img className="icon164" alt="" src="/662-11@2x.png"/>
                    <div className="div697"/>
                </div>
                <div className="div698">
                    <div className="container-l-color39"/>
                    <div className="input-text39">|</div>
                    <div className="div699"/>
                    <div className="label99">грн</div>
                </div>
                <div className="div700">
                    <div className="div701"/>
                    <img className="icon165" alt="" src="/-1976--2.svg"/>
                    <div className="div702">
                        <div className="div703"/>
                        <div className="text74">
                            <li className="print9">Взяти</li>
                            <li className="print9">в роботу</li>
                        </div>
                    </div>
                    <div className="div704">
                        <div className="light-elevation02dp">
                            <div className="base240"/>
                            <div className="div705">{`Оплатити `}</div>
                        </div>
                    </div>
                    <div className="div706">
                        <img className="container-icon" alt="" src="/base.svg"/>
                        <div className="div707">Внести</div>
                    </div>
                    <div className="div708">
                        <div className="div709">За все замовлення:</div>
                        <div className="div710">
                            <div className="container-l-color39"/>
                            <div className="input-text39">|</div>
                            <div className="div699"/>
                            <div className="label99">грн</div>
                        </div>
                    </div>
                    <div className="div712">
                        <div className="div709">Загальна сума</div>
                        <div className="div710">
                            <div className="container-l-color39"/>
                            <div className="input-text39">|</div>
                            <div className="div699"/>
                            <div className="label99">грн</div>
                        </div>
                    </div>
                    <div className="div716">
                        <div className="div717">Знижка</div>
                        <div className="div718">
                            <div className="container-l-color39"/>
                            <div className="input-text39">|</div>
                            <div className="div699"/>
                            <div className="label99">грн</div>
                        </div>
                        <div className="div720">
                            <div className="container-l-color43"/>
                            <div className="input-text43">|</div>
                            <div className="div721"/>
                            <div className="label103">%</div>
                        </div>
                        <img className="autorenew-icon1" alt="" src="/autorenew.svg"/>
                    </div>
                    <div className="div722">
                        <div className="div723">Предоплата</div>
                        <div className="div710">
                            <div className="container-l-color39"/>
                            <div className="input-text39">|</div>
                            <div className="div699"/>
                            <div className="label99">грн</div>
                        </div>
                    </div>
                    <div className="div726">
                        <div className="div727">К оплаті</div>
                        <div className="div710">
                            <div className="container-l-color39"/>
                            <div className="input-text39">|</div>
                            <div className="div699"/>
                            <div className="label99">грн</div>
                        </div>
                    </div>
                </div>
                <div className="div730">
                    <div className="div731"/>
                    <div className="div732">
                        <div className="field-button18"/>
                        <div className="div733">
                            <li className="print9">Пилипенко</li>
                            <li className="print9">Артем Юрійович</li>
                        </div>
                    </div>
                    <div className="div734">
                        <div className="field-button19"/>
                        <div className="div735">+38 065 666 66 66</div>
                        <img className="icon166" alt="" src="/-542.svg"/>
                        <img className="viber-icon10" alt="" src="/viber.svg"/>
                        <img className="whatsapp-icon10" alt="" src="/whatsapp.svg"/>
                    </div>
                    <div className="div736">
                        <div className="field-button20"/>
                        <div className="aiatomas9">@aiatomas</div>
                    </div>
                    <img className="barcode-icon11" alt="" src="/cliente.svg"/>
                    <img className="icon167" alt="" src="/clientf@2x.png"/>
                    <div className="div737">
                        <div className="div738"/>
                        <i className="i18">-10%</i>
                    </div>
                    <div className="div739">
                        <Button
                            className="button20"
                            disableElevation
                            color="warning"
                            size="2x"
                            variant="text"
                            href="/"
                            sx={{borderRadius: "0px 0px 0px 0px", width: 53, height: 46}}
                            onClick={openClientPip}
                        />
                        <Button
                            className="cart1"
                            disableElevation
                            size="2x"
                            variant="text"
                            sx={{borderRadius: "0px 0px 0px 0px", width: 53, height: 46}}
                        />
                        <Button
                            className="button21"
                            disableElevation
                            color="warning"
                            size="2x"
                            variant="text"
                            href="/"
                            sx={{borderRadius: "0px 0px 0px 0px", width: 53, height: 46}}
                        />
                    </div>
                </div>
                <img className="signal-icon9" alt="" src="/signal3.svg"/>
                <img className="icon168" alt="" src="/-189.svg"/>
                <img className="icon169" alt="" src="/-184.svg"/>
                <img
                    className="phone-portrait-outline-icon3"
                    alt=""
                    src="/phoneportraitoutline.svg"
                />
                <div className="div740"/>
                <img className="signal-icon10" alt="" src="/signal4.svg"/>
                <img className="viber-icon11" alt="" src="/viber3.svg"/>
                <img className="whatsapp-icon11" alt="" src="/whatsapp4.svg"/>
                <img className="g10-icon1" alt="" src="/g101.svg"/>
                <img className="icon170" alt="" src="/-1954.svg"/>
                <a className="cart2">
                    <div className="div701"/>
                    <div className="div742"/>
                    <div className="div743"/>
                </a>
                <img className="cart-icon3" alt="" src="/cart3.svg"/>
                <img className="expanding-cart-icon" alt="" src="/expanding-cart.svg"/>
                <div className="logo2">
                    <b className="print-peaks-erp2248">
                        <li className="print9">PRINT</li>
                        <li className="print9">PEAKS</li>
                        <li className="print9">
                            <span>ERP</span>
                            <span className="span226">2.24</span>
                        </li>
                    </b>
                </div>
                <div className="div744">
                    <div className="container-l-color46"/>
                    <div className="div745"/>
                    <div className="label106">грн</div>
                    <div className="input-text46">|</div>
                    <div className="top-label16">
                        <div className="label107">Ціна</div>
                    </div>
                </div>
                <div className="div746">
                    <div className="container-l-color46"/>
                    <div className="div745"/>
                    <div className="label108">мм</div>
                    <div className="input-text46">|</div>
                    <div className="top-label17">
                        <div className="label107">Розмір</div>
                    </div>
                </div>
                <div className="stepsiconshorizontal">
                    <div className="div748">
                        <div className="div749"/>
                        <b className="shipping">Shipping</b>
                        <div className="choose-your-shipping">
                            Choose your shipping options
                        </div>
                        <img className="truck-moving-icon" alt="" src="/truckmoving.svg"/>
                    </div>
                    <div className="div750">
                        <div className="div751"/>
                        <b className="confirm-order">Confirm order</b>
                        <div className="verify-order-details">Verify order details</div>
                        <img className="info-icon" alt="" src="/info.svg"/>
                    </div>
                    <div className="div752">
                        <img className="icon171" alt="" src="/-1.svg"/>
                        <b className="billing">Billing</b>
                        <div className="enter-billing-information">
                            Enter billing information
                        </div>
                        <img className="credit-card-icon" alt="" src="/creditcard.svg"/>
                    </div>
                </div>
                <div className="div753">
                    <img className="icon172" alt="" src="/-1497.svg"/>
                    <div className="untitled-6">
                        <img className="untitled-6-icon2" alt="" src="/untitled-6@2x.png"/>
                    </div>
                    <div className="versant80-img1">
                        <img className="untitled-6-icon2" alt="" src="/untitled-1@2x.png"/>
                    </div>
                    <div className="untitled-4">
                        <img
                            className="untitled-6-icon2"
                            alt=""
                            src="/untitled-41@2x.png"
                        />
                    </div>
                    <div className="untitled-7">
                        <img className="untitled-6-icon2" alt="" src="/untitled-7@2x.png"/>
                    </div>
                    <div className="untitled-31">
                        <img className="untitled-6-icon2" alt="" src="/untitled-3@2x.png"/>
                    </div>
                </div>
                <Button
                    className="button22"
                    disableElevation
                    color="warning"
                    size="2x"
                    variant="text"
                    href="/order-pip"
                    sx={{borderRadius: "0px 0px 0px 0px", width: 46, height: 50}}
                />
                <div className="div754">
                    <img className="icon173" alt="" src="/-14971.svg"/>
                    <div className="untitled-51">
                        <img className="untitled-6-icon2" alt="" src="/untitled-5@2x.png"/>
                    </div>
                    <div className="untitled-81">
                        <img className="untitled-6-icon2" alt="" src="/untitled-8@2x.png"/>
                    </div>
                    <div className="untitled-101">
                        <img
                            className="untitled-6-icon2"
                            alt=""
                            src="/untitled-10@2x.png"
                        />
                    </div>
                    <div className="untitled-111">
                        <img
                            className="untitled-6-icon2"
                            alt=""
                            src="/untitled-11@2x.png"
                        />
                    </div>
                </div>
                <div className="div755" onClick={openClientFull}>
                    <div className="base241"/>
                    <div className="div756">Клієнти</div>
                </div>
                <div className="locofy-1970">
                    <button className="button23" onClick={onButtonClick1}>
                        <div className="light-elevation02dp">
                            <div className="base243"/>
                        </div>
                        <div className="compo">
                            <div className="div757">Клієнти</div>
                        </div>
                    </button>
                    <button className="button24" autoFocus={false} disabled={false}>
                        <div className="base244"/>
                        <div className="div758">Ліди</div>
                    </button>
                    <div className="div759">
                        <div className="light-elevation02dp">
                            <div className="base246"/>
                        </div>
                        <div className="div760">Постачальники</div>
                    </div>
                    <div className="div761">
                        <div className="base247"/>
                        <div className="div762">Підрядники</div>
                    </div>
                    <div className="div763">
                        <div className="base248"/>
                        <div className="div764">Налаштування</div>
                    </div>
                    <button className="button25">
                        <div className="base249"/>
                        <div className="div765">Документи</div>
                    </button>
                    <div className="div766">
                        <div className="base250"/>
                        <div className="div767">Звіти</div>
                    </div>
                    <div className="div768">
                        <div className="base251"/>
                        <div className="div769">Ціни</div>
                    </div>
                    <button className="button26" onClick={openOrderFull}>
                        <div className="base252"/>
                        <div className="div770">Замовлення</div>
                    </button>
                    <button className="button27">
                        <div className="base253"/>
                        <div className="div771">Дашборд</div>
                    </button>
                    <div className="div772">
                        <div className="base254"/>
                        <div className="div773">Нова Пошта</div>
                    </div>
                </div>
                <div className="div774">
                    <div className="light-elevation02dp">
                        <div className="base246"/>
                    </div>
                    <div className="div760">Постачальники</div>
                </div>
                <div className="base257">
                    <div className="base258"/>
                </div>
                <div className="div776">
                    <div className="base259"/>
                    <div className="div777">Підрядники</div>
                </div>
                <div className="div778">
                    <div className="base260"/>
                    <div className="div779">Документи</div>
                </div>
                <div className="div780">
                    <div className="base261"/>
                    <div className="div769">Ціни</div>
                </div>
                <div className="div782">
                    <div className="base262"/>
                    <div className="div783">Дашборд</div>
                </div>
                <div className="div784">
                    <div className="base263"/>
                    <div className="div773">Нова Пошта</div>
                </div>
                <div className="div786">
                    <div className="base264"/>
                    <div className="div767">Звіти</div>
                </div>
                <div className="div788">
                    <div className="base265"/>
                    <div className="div764">Налаштування</div>
                </div>
                <button className="button28" autoFocus={true}>
                    <div className="base244"/>
                    <div className="div758">Ліди</div>
                </button>
                <div className="div791" onClick={onContainerClick}>
                    <div className="base252"/>
                    <div className="div792">Замовлення</div>
                </div>
                <div className="div793">
                    <div className="div794">
                        <div className="div795">
                            <div className="div796"/>
                            <img className="icon174" alt="" src="/-1324.svg"/>
                            <div className="div797">
                                <span>{`Прорахунок `}</span>
                                <span className="span227">{`- це ті замовлення які ще навіть не розпочаті `}</span>
                            </div>
                        </div>
                    </div>
                    <div className="div798">
                        <div className="div799"/>
                        <img
                            className="shopping-cart-arrow-up-icon2"
                            alt=""
                            src="/shoppingcartarrowup1.svg"
                        />
                        <div className="div800">
                            <li className="print9">
                                <span className="span235">Віддані</span>
                                <span className="span236">{`- `}</span>
                            </li>
                            <li className="print9">
                                <span className="span236">це замовлення яківже віддали</span>
                                {` `}
                            </li>
                        </div>
                    </div>
                    <div className="div801">
                        <img className="icon175" alt="" src="/-522.svg"/>
                        <img
                            className="flag-finish-b-o-icon2"
                            alt=""
                            src="/flagfinishbo1.svg"
                        />
                        <div className="div802">
                            <li className="print9">
                                <span className="span235">Виконані</span>
                                <span>{`- `}</span>
                            </li>
                            <li className="print9">
                                <span>це замовлення які чекають на тримання</span>
                                {` `}
                            </li>
                        </div>
                    </div>
                    <div className="div803">
                        <img className="icon175" alt="" src="/-520.svg"/>
                        <img className="icon177" alt="" src="/-523.svg"/>
                        <div className="div804">
                            <li className="print9">
                                <span className="span239">Виробництво</span>
                                <span className="span240">{` - це ті замовлення які `}</span>
                            </li>
                            <li className="print9">
                                <span className="span240">ще друкуються</span>
                                {` `}
                            </li>
                        </div>
                    </div>
                </div>
                <div className="kilkist10">
                    <div className="container-l-color38"/>
                    <div className="top-label15">
                        <div className="label97">Кількість</div>
                    </div>
                    <div className="div679">
                        <div className="input-text38">|</div>
                        <div className="div680"/>
                        <div className="label98">шт</div>
                    </div>
                    <div className="chevron54">
                        <div className="frame52"/>
                        <img className="shape-icon56" alt="" src="/shape4.svg"/>
                    </div>
                    <div className="chevron55">
                        <div className="frame52"/>
                        <img className="shape-icon57" alt="" src="/shape5.svg"/>
                    </div>
                </div>
                <div className="div807">
                    <div className="bind-text4">
                        <b className="div661">Брошурування</b>
                    </div>
                    <div className="form1">
                        <div className="light-elevation02dp">
                            <div className="base268"/>
                            <img className="control-icon1" alt="" src="/control.svg"/>
                            <div className="bind-text6">зшивок</div>
                            <div className="bloci">
                                <div className="bloci-text">аркушів в блоці</div>
                                <div className="kilkist9">
                                    <div className="container-l-color38"/>
                                    <div className="top-label15">
                                        <div className="label97">Кількість</div>
                                    </div>
                                    <div className="div679">
                                        <div className="input-text38">|</div>
                                        <div className="div680"/>
                                        <div className="label98">шт</div>
                                    </div>
                                    <div className="chevron54">
                                        <div className="frame52"/>
                                        <img className="shape-icon56" alt="" src="/shape4.svg"/>
                                    </div>
                                    <div className="chevron55">
                                        <div className="frame52"/>
                                        <img className="shape-icon57" alt="" src="/shape5.svg"/>
                                    </div>
                                </div>
                            </div>
                            <div className="kilkist12">
                                <div className="container-l-color38"/>
                                <div className="top-label15">
                                    <div className="label97">Кількість</div>
                                </div>
                                <div className="div679">
                                    <div className="input-text38">|</div>
                                    <div className="div680"/>
                                    <div className="label98">шт</div>
                                </div>
                                <div className="chevron54">
                                    <div className="frame52"/>
                                    <img className="shape-icon56" alt="" src="/shape4.svg"/>
                                </div>
                                <div className="chevron55">
                                    <div className="frame52"/>
                                    <img className="shape-icon57" alt="" src="/shape5.svg"/>
                                </div>
                            </div>
                            <div className="bind-mat3">
                                <div className="metal4">
                                    <div className="r-15814"/>
                                    <div className="metal-text4">Металева пружинка</div>
                                </div>
                                <div className="tberd6">
                                    <div className="tverd-text25">Твердим переплітом</div>
                                </div>
                                <div className="skoba5">
                                    <div className="tverd-text25">Скоба</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <img
                    className="surecolor-p9000-front-800x800-icon2"
                    alt=""
                    src="/surecolorp9000front800x8002png@2x.png"
                />
                <div className="div812">
                    <div className="stateslight-primary-contai6">
                        <button className="knopa3" onClick={onKnopAClick}>
                            <div className="light-elevation02dp">
                                <div className="light-elevation02dp">
                                    <div className="base270"/>
                                </div>
                                <div className="div815">Клієнти</div>
                            </div>
                        </button>
                        <button className="knopb3" autoFocus={false} disabled={false}>
                            <div className="base271"/>
                            <div className="div816">Ліди</div>
                        </button>
                        <button className="knopc3">
                            <div className="light-elevation02dp">
                                <div className="base273"/>
                            </div>
                            <div className="div817">Постачальники</div>
                        </button>
                        <button className="knopd3">
                            <div className="base274"/>
                            <div className="div818">Підрядники</div>
                        </button>
                        <button className="knope3">
                            <div className="light-elevation02dp">
                                <div className="base275"/>
                                <div className="div817">Налаштування</div>
                            </div>
                        </button>
                        <button className="knopf3">
                            <div className="base276"/>
                            <div className="div821">Документи</div>
                        </button>
                        <button className="knopg3">
                            <div className="base277"/>
                            <div className="div822">Звіти</div>
                        </button>
                        <button className="knoph3">
                            <div className="base278"/>
                            <div className="div823">Ціни</div>
                        </button>
                        <button
                            className="knopi3"
                            autoFocus={true}
                            onClick={onContainerClick}
                        >
                            <div className="base279"/>
                            <div className="div824">Замовлення</div>
                        </button>
                        <button className="knopj3">
                            <div className="base280"/>
                            <div className="div771">Дашборд</div>
                        </button>
                        <button className="knopk3">
                            <div className="base281"/>
                            <div className="div826">Нова Пошта</div>
                        </button>
                    </div>
                </div>
            </div>
            {isClientPipOpen && (
                <PortalPopup
                    overlayColor="rgba(113, 113, 113, 0.3)"
                    placement="Centered"
                    onOutsideClick={closeClientPip}
                >
                    <ClientPip onClose={closeClientPip}/>
                </PortalPopup>
            )}
            {isClientFullOpen && (
                <PortalPopup
                    overlayColor="rgba(113, 113, 113, 0.3)"
                    placement="Centered"
                    onOutsideClick={closeClientFull}
                >
                    <ClientFull onClose={closeClientFull}/>
                </PortalPopup>
            )}
            {isOrderFullOpen && (
                <PortalPopup
                    overlayColor="rgba(113, 113, 113, 0.3)"
                    placement="Centered"
                    onOutsideClick={closeOrderFull}
                >
                    <OrderFull onClose={closeOrderFull}/>
                </PortalPopup>
            )}
        </>
    );
};

export default Artboard;
