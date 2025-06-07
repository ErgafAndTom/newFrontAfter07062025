import {Switch} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";
import "./BWPrint.css";

const BWPrint = () => {
    const navigate = useNavigate();

    const onButtonClick = () => {
        navigate("/plus-prod");
    };

    return (
        <div className="bw-print">
            <div className="fon1"/>
            <div className="fon"/>
            <div className="logo">
                <b className="print-peaks-erp2244">
                    <li className="print4">PRINT</li>
                    <li className="print4">PEAKS</li>
                    <li className="print4">
                        <span>ERP</span>
                        <span className="span28">2.24</span>
                    </li>
                </b>
            </div>
            <div className="calc">
                <div className="untitled-3">
                    <img className="untitled-3-icon1" alt="" src="/untitled-31@2x.png"/>
                </div>
                <div className="sum">
                    <div className="text2">
                        <span>{`4 `}</span>
                        <span className="span29">грн</span>
                    </div>
                    <div className="text3">
                        <span>{`4004 `}</span>
                        <span className="span29">грн</span>
                    </div>
                    <div className="text4">Ціна за друк</div>
                    <div className="text5">
                        <span>{`1002 `}</span>
                        <span className="span29">шт</span>
                    </div>
                    <div className="text6">х</div>
                    <div className="text7">=</div>
                    <div className="text8">
                        <span>{`45 `}</span>
                        <span className="span29">грн</span>
                    </div>
                    <div className="text9">
                        <span>{`45 `}</span>
                        <span className="span29">грн</span>
                    </div>
                    <div className="text10">Ціна за прошивку</div>
                    <div className="text11">
                        <span>{`1 `}</span>
                        <span className="span29">шт</span>
                    </div>
                    <div className="text12">х</div>
                    <div className="text13">=</div>
                </div>
                <div className="summ">
                    <div className="sum-text">Загальна вартість:</div>
                    <b className="text14">
                        <span>{`4049 `}</span>
                        <span className="span29">грн</span>
                    </b>
                </div>
                <div className="plus-zam">
                    <div className="div408"/>
                    <div className="plus-zam-text">Додати до замовлення</div>
                </div>
                <div className="wideb"/>
            </div>
            <div className="b-w">
                <div className="bw-text">
                    Чорно-білий друк на монохромному принтері:
                </div>
                <div className="paper-format">
                    <button className="button3">
                        <div className="div409">А4</div>
                    </button>
                    <button className="button4">
                        <div className="div410">А5</div>
                    </button>
                    <button className="button5">
                        <div className="div411"/>
                        <div className="div412">
                            <span className="span36">{`210 `}</span>
                            <span className="span37">мм</span>
                        </div>
                    </button>
                    <button className="button6">
                        <div className="div411"/>
                        <div className="div412">
                            <span className="span36">{`297 `}</span>
                            <span className="span37">мм</span>
                        </div>
                    </button>
                    <div className="div415">х</div>
                    <button className="button7">
                        <div className="div410">А6</div>
                    </button>
                </div>
                <div className="arckush">
                    <div className="kilkist1">
                        <div className="container-l-color15"/>
                        <div className="top-label2">
                            <div className="label17">Кількість</div>
                        </div>
                        <div className="div417">
                            <div className="input-text15">|</div>
                            <div className="div418"/>
                            <div className="label18">шт</div>
                        </div>
                        <div className="chevron6">
                            <div className="frame6"/>
                            <img className="shape-icon6" alt="" src="/shape4.svg"/>
                        </div>
                        <div className="chevron7">
                            <div className="frame6"/>
                            <img className="shape-icon7" alt="" src="/shape5.svg"/>
                        </div>
                    </div>
                </div>
                <button className="sizec-buttom">
                    <div className="div419"/>
                    <div className="text15">Двосторонній</div>
                </button>
                <button className="sized-buttom">
                    <div className="div408"/>
                    <div className="text16">Односторонній</div>
                </button>
                <button className="button8">
                    <div className="div421">Офісний папір 80-90 г/м2</div>
                </button>
            </div>
            <button className="button9" autoFocus={true} onClick={onButtonClick}>
                <div className="div408"/>
                <div className="plus-prod-text">Додати до пресетів</div>
            </button>
            <div className="div423">
                <div className="bind-text">
                    <b className="bind-text1">Брошурування:</b>
                </div>
                <div className="form-switches">
                    <Switch className="switch" colorScheme="teal"/>
                    <div className="kilkist2">
                        <div className="container-l-color15"/>
                        <div className="top-label2">
                            <div className="label17">Кількість</div>
                        </div>
                        <div className="div417">
                            <div className="input-text15">|</div>
                            <div className="div418"/>
                            <div className="label18">шт</div>
                        </div>
                        <div className="chevron6">
                            <div className="frame6"/>
                            <img className="shape-icon6" alt="" src="/shape4.svg"/>
                        </div>
                        <div className="chevron7">
                            <div className="frame6"/>
                            <img className="shape-icon7" alt="" src="/shape6.svg"/>
                        </div>
                    </div>
                    <div className="bind-mat">
                        <button className="metal" autoFocus={true}>
                            <button className="button10" autoFocus={true}>
                                <div className="div408"/>
                                <div className="metal-text">Металева пружинка</div>
                            </button>
                        </button>
                        <button className="tberd" autoFocus={true}>
                            <div className="tverd-text">Твердим переплітом</div>
                        </button>
                        <button className="skoba" autoFocus={true}>
                            <div className="skoba-text">Скоба</div>
                        </button>
                    </div>
                </div>
                <div className="div426">
                    <button className="cpmaz" autoFocus={true}>
                        <div className="div408"/>
                        <div className="text17">
                            <span className="span40">{`До 120 `}</span>
                            <span className="span41">аркушів</span>
                        </div>
                    </button>
                    <button className="cpmaz1" autoFocus={true}>
                        <div className="div428"/>
                        <div className="text18">
                            <span className="span40">{`120-280 `}</span>
                            <span className="span41">аркушів</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BWPrint;
