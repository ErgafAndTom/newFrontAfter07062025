import {Switch} from "@chakra-ui/react";
import {Switch as MuiSwitch, FormControlLabel} from "@mui/material";
import {useNavigate} from "react-router-dom";
import "./CPM.css";

const CPM = () => {
    const navigate = useNavigate();

    const onCPMANClick = () => {
        navigate("/plus-prod");
    };

    return (
        <div className="cpm">
            <div className="fon15"/>
            <div className="r1575"/>
            <div className="cpmc">
                <b className="print-peaks-logo">
                    <li className="print8">PRINT</li>
                    <li className="print8">PEAKS</li>
                    <li className="print8">
                        <span>ERP</span>
                        <span className="span158">2.24</span>
                    </li>
                </b>
            </div>
            <button className="cpmd" autoFocus={true}>
                <div className="r1581"/>
                <div className="plus-zam-text4">Додати до замовлення</div>
            </button>
            <div className="cpmad">
                <div className="versant80-img">
                    <img className="untitled-1-icon1" alt="" src="/untitled-12@2x.png"/>
                </div>
                <div className="wideb4"/>
                <div className="div533">
                    <div className="div534">
                        <div className="div535"/>
                        <div className="text50">
                            <span>{`1 `}</span>
                            <span className="span158">грн</span>
                            <span>{` x 30 `}</span>
                            <span className="span158">шт</span>
                            <span>{` = 300 `}</span>
                            <span className="span158">грн</span>
                        </div>
                    </div>
                    <div className="div536">
                        <div className="div537"/>
                        <div className="text51">
                            <span>{`30 `}</span>
                            <span className="span158">грн</span>
                            <span>{` x 30 `}</span>
                            <span className="span158">шт</span>
                            <span>{` = 900 `}</span>
                            <span className="span158">грн</span>
                        </div>
                    </div>
                    <div className="div538">
                        <div className="div535"/>
                        <div className="text52">
                            <span>{`30 `}</span>
                            <span className="span158">грн</span>
                            <span>{` x 30 `}</span>
                            <span className="span158">шт</span>
                            <span>{` = 900 `}</span>
                            <span className="span158">грн</span>
                        </div>
                    </div>
                    <div className="div540">
                        <div className="div537"/>
                        <div className="text50">
                            <span>{`0 `}</span>
                            <span className="span158">грн</span>
                            <span>{` x 0 `}</span>
                            <span className="span158">шт</span>
                            <span>{` = 0 `}</span>
                            <span className="span158">грн</span>
                        </div>
                    </div>
                    <div className="div542">
                        <div className="div537"/>
                        <div className="text50">
                            <span>{`40 `}</span>
                            <span className="span158">грн</span>
                            <span>{` x 30 `}</span>
                            <span className="span158">шт</span>
                            <span>{` = 1200 `}</span>
                            <span className="span158">грн</span>
                        </div>
                    </div>
                    <div className="div544">
                        <div className="div535"/>
                        <div className="text50">
                            <span>{`0 `}</span>
                            <span className="span158">грн</span>
                            <span>{` x 0 `}</span>
                            <span className="span158">шт</span>
                            <span>{` = 0 `}</span>
                            <span className="span158">грн</span>
                        </div>
                    </div>
                    <div className="div546">
                        <div className="div537"/>
                        <div className="text50">
                            <span>{`0 `}</span>
                            <span className="span158">грн</span>
                            <span>{` x 0 `}</span>
                            <span className="span158">шт</span>
                            <span>{` = 0 `}</span>
                            <span className="span158">грн</span>
                        </div>
                    </div>
                    <div className="div548">
                        <div className="div535"/>
                        <div className="text50">
                            <span>{`0 `}</span>
                            <span className="span158">грн</span>
                            <span>{` x 0 `}</span>
                            <span className="span158">шт</span>
                            <span>{` = 0 `}</span>
                            <span className="span158">грн</span>
                        </div>
                    </div>
                    <div className="div550">
                        <div className="div535"/>
                        <div className="text58">
              <span>
                <i className="i16">47</i>
              </span>
                            <i>
                                <span> аркушів розміру Sr A3 буде витрачено</span>
                                <span className="span183"/>
                                <span/>
                            </i>
                        </div>
                    </div>
                    <div className="div552">
                        <div className="div553">
                            <div className="div537"/>
                        </div>
                        <div className="text52">
              <span>
                <i className="i16">35</i>
              </span>
                            <i>
                                <span>{` `}</span>
                                <span className="span183">виробів</span>
                                <span> вказаного розміру вміщується на аркуші Sr A3</span>
                            </i>
                        </div>
                    </div>
                    <div className="sum-text4">
                        <div className="div537"/>
                        <div className="sum-text5">
              <span>
                <span>{`Загальна вартість: `}</span>
                <b className="b11">{`3300 `}</b>
              </span>
                            <b className="b11">
                                <span className="span185">грн</span>
                            </b>
                        </div>
                    </div>
                </div>
            </div>
            <button className="cpman" autoFocus={true} onClick={onCPMANClick}>
                <div className="r1581"/>
                <div className="plus-prod-text4">Додати до пресетів</div>
            </button>
            <div className="div556">
                <div className="bind-text2">
                    <b className="bind-text3">Брошурування:</b>
                </div>
                <div className="form-switches1">
                    <Switch className="switch1" colorScheme="teal"/>
                    <div className="kilkist7">
                        <div className="container-l-color31"/>
                        <div className="top-label12">
                            <div className="label43">Кількість</div>
                        </div>
                        <div className="div557">
                            <div className="input-text31">|</div>
                            <div className="div558"/>
                            <div className="label44">шт</div>
                        </div>
                        <div className="chevron40">
                            <div className="frame38"/>
                            <img className="shape-icon40" alt="" src="/shape4.svg"/>
                        </div>
                        <div className="chevron41">
                            <div className="frame38"/>
                            <img className="shape-icon41" alt="" src="/shape6.svg"/>
                        </div>
                    </div>
                    <div className="bind-mat1">
                        <button className="metal3" autoFocus={true}>
                            <button className="button11" autoFocus={true}>
                                <div className="r1581"/>
                                <div className="metal-text3">Металева пружинка</div>
                            </button>
                        </button>
                        <button className="tberd4" autoFocus={true}>
                            <div className="tverd-text11">Твердим переплітом</div>
                        </button>
                        <button className="skoba3" autoFocus={true}>
                            <div className="skoba-text3">Скоба</div>
                        </button>
                    </div>
                </div>
                <div className="div559">
                    <button className="cpmaz2" autoFocus={true}>
                        <div className="r1581"/>
                        <div className="text60">
                            <span className="span186">{`До 120 `}</span>
                            <span className="span187">аркушів</span>
                        </div>
                    </button>
                    <button className="cpmaz3" autoFocus={true}>
                        <div className="div561"/>
                        <div className="text61">
                            <span className="span186">{`120-280 `}</span>
                            <span className="span187">аркушів</span>
                        </div>
                    </button>
                </div>
            </div>
            <div className="div562">
                <div className="div563">
                    <button className="button12"/>
                    <img className="border-radius-icon" alt="" src="/borderradius.svg"/>
                    <div className="div564"/>
                    <img
                        className="border-radius-icon1"
                        alt=""
                        src="/borderradius1.svg"
                    />
                    <div className="div565"/>
                    <img
                        className="border-radius-icon2"
                        alt=""
                        src="/borderradius2.svg"
                    />
                    <div className="div566"/>
                    <img
                        className="border-radius-icon3"
                        alt=""
                        src="/borderradius3.svg"
                    />
                    <div className="div567"/>
                    <img
                        className="border-radius-icon4"
                        alt=""
                        src="/borderradius4.svg"
                    />
                    <div className="div568"/>
                    <img
                        className="border-radius-icon5"
                        alt=""
                        src="/borderradius5.svg"
                    />
                    <div className="div569"/>
                    <img
                        className="border-radius-icon6"
                        alt=""
                        src="/borderradius6.svg"
                    />
                    <div className="div570"/>
                    <img className="icon77" alt="" src="/-683.svg"/>
                    <div className="div571"/>
                    <img
                        className="border-radius-icon7"
                        alt=""
                        src="/borderradius7.svg"
                    />
                    <div className="div572"/>
                    <img
                        className="border-radius-icon8"
                        alt=""
                        src="/borderradius8.svg"
                    />
                    <div className="div573"/>
                    <img
                        className="border-radius-icon9"
                        alt=""
                        src="/borderradius9.svg"
                    />
                </div>
                <div className="krugl-button">Скруглення кутів:</div>
                <button className="krugm-button">
                    <div className="div574">
                        <img
                            className="vector-radius-icon"
                            alt=""
                            src="/vectorradius.svg"
                        />
                    </div>
                    <div className="tverd-text12">
                        <span className="span190">{`3 `}</span>
                        <span className="span191">мм</span>
                    </div>
                </button>
                <button className="krugn-button">
                    <div className="div575">
                        <img
                            className="vector-radius-icon"
                            alt=""
                            src="/vectorradius.svg"
                        />
                    </div>
                    <div className="tverd-text13">
                        <span className="span190">{`6 `}</span>
                        <span className="span191">мм</span>
                    </div>
                </button>
                <button className="krugo-button">
                    <div className="div576">
                        <img
                            className="vector-radius-icon"
                            alt=""
                            src="/vectorradius.svg"
                        />
                    </div>
                    <div className="tverd-text14">
                        <span className="span190">{`8 `}</span>
                        <span className="span191">мм</span>
                    </div>
                </button>
                <button className="krugp-button">
                    <div className="div576">
                        <img
                            className="vector-radius-icon"
                            alt=""
                            src="/vectorradius.svg"
                        />
                    </div>
                    <div className="tverd-text15">
                        <span className="span190">{`10 `}</span>
                        <span className="span191">мм</span>
                    </div>
                </button>
                <button className="krugq-button">
                    <div className="div576">
                        <img
                            className="vector-radius-icon"
                            alt=""
                            src="/vectorradius.svg"
                        />
                    </div>
                    <div className="tverd-text16">
                        <span className="span190">{`12 `}</span>
                        <span className="span191">мм</span>
                    </div>
                </button>
                <FormControlLabel
                    className="krugr-button7"
                    control={<MuiSwitch color="warning" size="medium"/>}
                />
            </div>
            <div className="div579">
                <button className="otvora-button">
                    <div className="div580"/>
                    <img className="icon78" alt="" src="/-127.svg"/>
                </button>
                <button className="otvorb-button">
                    <div className="div581"/>
                    <img className="icon79" alt="" src="/-127.svg"/>
                    <img className="icon80" alt="" src="/-127.svg"/>
                </button>
                <button className="otvorc-button">
                    <div className="div581"/>
                    <img className="icon79" alt="" src="/-127.svg"/>
                    <img className="icon80" alt="" src="/-127.svg"/>
                    <img className="icon83" alt="" src="/-127.svg"/>
                </button>
                <button className="otvord-button">
                    <div className="div581"/>
                    <img className="icon79" alt="" src="/-127.svg"/>
                    <img className="icon80" alt="" src="/-127.svg"/>
                    <img className="icon86" alt="" src="/-127.svg"/>
                    <img className="icon87" alt="" src="/-127.svg"/>
                </button>
                <button className="otvore-button">
                    <div className="div581"/>
                    <img className="icon88" alt="" src="/-127.svg"/>
                </button>
                <button className="otvorf-button">
                    <div className="div581"/>
                    <img className="icon89" alt="" src="/-127.svg"/>
                    <img className="icon90" alt="" src="/-127.svg"/>
                </button>
                <button className="otvorg-button">
                    <div className="div581"/>
                    <img className="icon79" alt="" src="/-127.svg"/>
                    <img className="icon86" alt="" src="/-127.svg"/>
                    <img className="icon88" alt="" src="/-127.svg"/>
                </button>
                <button className="otvorh-button">
                    <div className="div581"/>
                    <img className="icon94" alt="" src="/-127.svg"/>
                    <img className="icon95" alt="" src="/-127.svg"/>
                    <img className="icon96" alt="" src="/-127.svg"/>
                    <img className="icon97" alt="" src="/-127.svg"/>
                </button>
                <div className="otvori-button">Cвердління отворів:</div>
                <button className="otvorj-button">
                    <div className="div588"/>
                    <div className="tverd-text17">
                        <span className="span190">{`4 `}</span>
                        <span className="span191">мм</span>
                    </div>
                    <img className="diameter-icon" alt="" src="/diameter.svg"/>
                </button>
                <button className="otvork-button">
                    <div className="div588"/>
                    <div className="tverd-text18">
                        <span className="span190">{`3,5 `}</span>
                        <span className="span191">мм</span>
                    </div>
                    <img className="diameter-icon1" alt="" src="/diameter.svg"/>
                </button>
                <button className="otvorl-button">
                    <div className="div588"/>
                    <div className="tverd-text17">
                        <span className="span190">{`5 `}</span>
                        <span className="span191">мм</span>
                    </div>
                    <img className="diameter-icon2" alt="" src="/diameter.svg"/>
                </button>
                <button className="otvorm-button">
                    <div className="div588"/>
                    <div className="tverd-text17">
                        <span className="span190">{`6 `}</span>
                        <span className="span191">мм</span>
                    </div>
                    <img className="diameter-icon2" alt="" src="/diameter.svg"/>
                </button>
                <button className="otvorn-button">
                    <div className="div588"/>
                    <div className="tverd-text17">
                        <span className="span190">{`8 `}</span>
                        <span className="span191">мм</span>
                    </div>
                    <img className="diameter-icon2" alt="" src="/diameter.svg"/>
                </button>
                <FormControlLabel
                    className="otvoro-button"
                    control={<MuiSwitch color="warning" size="medium"/>}
                />
            </div>
            <div className="div593">
                <button className="zgina-button">
                    <div className="r1581">
                        <img className="icon98" alt="" src="/-699.svg"/>
                    </div>
                </button>
                <button className="zginb-button">
                    <div className="div561">
                        <img className="icon99" alt="" src="/-699.svg"/>
                        <img className="icon100" alt="" src="/-699.svg"/>
                    </div>
                </button>
                <button className="zginc-button">
                    <div className="div561">
                        <img className="icon101" alt="" src="/-699.svg"/>
                        <img className="icon102" alt="" src="/-699.svg"/>
                        <img className="icon103" alt="" src="/-699.svg"/>
                    </div>
                </button>
                <button className="zgind-button">
                    <div className="div561">
                        <img className="icon104" alt="" src="/-699.svg"/>
                        <img className="icon105" alt="" src="/-699.svg"/>
                        <img className="icon106" alt="" src="/-699.svg"/>
                        <img className="icon107" alt="" src="/-699.svg"/>
                    </div>
                </button>
                <button className="zgine-button">
                    <div className="div561"/>
                    <img className="icon108" alt="" src="/-699.svg"/>
                    <img className="icon109" alt="" src="/-699.svg"/>
                    <img className="icon110" alt="" src="/-699.svg"/>
                    <img className="icon111" alt="" src="/-699.svg"/>
                    <img className="icon112" alt="" src="/-699.svg"/>
                    <img className="icon113" alt="" src="/-699.svg"/>
                </button>
                <button className="zginf-button" autoFocus={true}>
                    <div className="div561"/>
                    <img className="icon114" alt="" src="/-699.svg"/>
                    <img className="icon115" alt="" src="/-699.svg"/>
                    <img className="icon116" alt="" src="/-699.svg"/>
                    <img className="icon117" alt="" src="/-699.svg"/>
                    <img className="icon118" alt="" src="/-699.svg"/>
                    <img className="icon119" alt="" src="/-699.svg"/>
                    <img className="icon120" alt="" src="/-699.svg"/>
                </button>
                <button className="zging-button">
                    <div className="div561"/>
                    <img className="icon121" alt="" src="/-699.svg"/>
                    <img className="icon122" alt="" src="/-699.svg"/>
                    <img className="icon123" alt="" src="/-699.svg"/>
                    <img className="icon124" alt="" src="/-699.svg"/>
                    <img className="icon125" alt="" src="/-699.svg"/>
                </button>
                <button className="zginh-button">
                    <div className="div561"/>
                    <img className="icon126" alt="" src="/-699.svg"/>
                    <img className="icon127" alt="" src="/-699.svg"/>
                    <img className="icon128" alt="" src="/-699.svg"/>
                    <img className="icon129" alt="" src="/-699.svg"/>
                    <img className="icon130" alt="" src="/-699.svg"/>
                    <img className="icon131" alt="" src="/-699.svg"/>
                    <img className="icon132" alt="" src="/-699.svg"/>
                    <img className="icon133" alt="" src="/-699.svg"/>
                    <img className="icon134" alt="" src="/-699.svg"/>
                </button>
                <button className="zgini-button" autoFocus={true}>
                    <div className="div561"/>
                    <img className="icon135" alt="" src="/-699.svg"/>
                    <img className="icon136" alt="" src="/-699.svg"/>
                    <img className="icon137" alt="" src="/-699.svg"/>
                    <img className="icon138" alt="" src="/-699.svg"/>
                    <img className="icon139" alt="" src="/-699.svg"/>
                    <img className="icon140" alt="" src="/-699.svg"/>
                    <img className="icon141" alt="" src="/-699.svg"/>
                    <img className="icon142" alt="" src="/-699.svg"/>
                </button>
                <button className="zginj-button" autoFocus={true} disabled={false}>
                    <div className="div561"/>
                    <img className="icon143" alt="" src="/-699.svg"/>
                    <img className="icon144" alt="" src="/-699.svg"/>
                    <img className="icon145" alt="" src="/-699.svg"/>
                    <img className="icon146" alt="" src="/-699.svg"/>
                    <img className="icon147" alt="" src="/-699.svg"/>
                    <img className="icon148" alt="" src="/-699.svg"/>
                    <img className="icon149" alt="" src="/-699.svg"/>
                    <img className="icon150" alt="" src="/-699.svg"/>
                    <img className="icon151" alt="" src="/-699.svg"/>
                    <img className="icon152" alt="" src="/-699.svg"/>
                </button>
                <div className="zgink-button">Згинання:</div>
                <FormControlLabel
                    className="zginl-button"
                    control={<MuiSwitch color="warning" size="medium"/>}
                />
            </div>
            <div className="div604">
                <div className="laminationa-button">
                    <button className="cpmaz4" autoFocus={true}>
                        <div className="div605"/>
                        <div className="text62">Глянецева</div>
                    </button>
                    <button className="cpmba" autoFocus={true}>
                        <div className="r1581"/>
                        <div className="text63">Матова</div>
                    </button>
                    <button className="cpmbb">
                        <div className="div605"/>
                        <div className="text64">Soft Velvet</div>
                    </button>
                </div>
                <div className="laminationb-button">Ламінація:</div>
                <button className="laminationc-button">
                    <div className="div608">
                        <div className="div609"/>
                    </div>
                    <div className="tverd-text22">
                        <span className="span190">{`30 `}</span>
                        <span className="span191">мкм</span>
                    </div>
                </button>
                <button className="button13">
                    <div className="laminationd-button"/>
                    <div className="laminatione-button">
                        <span className="span190">{`80 `}</span>
                        <span className="span191">мкм</span>
                    </div>
                </button>
                <button className="button14">
                    <div className="laminationd-button"/>
                    <div className="laminationg-button">
                        <span className="span190">{`100 `}</span>
                        <span className="span191">мкм</span>
                    </div>
                </button>
                <button className="button15">
                    <div className="laminationh-button"/>
                    <div className="laminationi-button">
                        <span className="span190">{`125 `}</span>
                        <span className="span191">мкм</span>
                    </div>
                </button>
                <button className="button16">
                    <div className="laminationd-button"/>
                    <button className="laminationk-button">
                        <span className="span190">{`150 `}</span>
                        <span className="span191">мкм</span>
                    </button>
                </button>
                <button className="button17">
                    <div className="laminationd-button"/>
                    <div className="laminationm-button">
                        <span className="span190">{`175 `}</span>
                        <span className="span191">мкм</span>
                    </div>
                </button>
                <button className="button18">
                    <div className="laminationd-button"/>
                    <button className="laminationo-button">
                        <span className="span190">{`250 `}</span>
                        <span className="span191">мкм</span>
                    </button>
                </button>
                <FormControlLabel
                    className="laminationp-button"
                    control={<MuiSwitch color="warning" size="medium"/>}
                />
            </div>
            <div className="div611">
                <div className="otvori-button1">Скан документів:</div>
                <FormControlLabel
                    className="krugr-button8"
                    control={<MuiSwitch color="warning" size="medium"/>}
                />
                <div className="kilkist8">
                    <div className="container-l-color31"/>
                    <div className="top-label12">
                        <div className="label43">Кількість</div>
                    </div>
                    <div className="div557">
                        <div className="input-text31">|</div>
                        <div className="div558"/>
                        <div className="label44">шт</div>
                    </div>
                    <div className="chevron40">
                        <div className="frame38"/>
                        <img className="shape-icon40" alt="" src="/shape4.svg"/>
                    </div>
                    <div className="chevron41">
                        <div className="frame38"/>
                        <img className="shape-icon41" alt="" src="/shape6.svg"/>
                    </div>
                </div>
                <button className="otvorl-button1" autoFocus={true}>
                    <div className="r1581"/>
                    <div className="tverd-text23">А4</div>
                </button>
                <button className="otvorl-button2" autoFocus={true}>
                    <div className="div561"/>
                    <div className="tverd-text23">А3</div>
                </button>
            </div>
            <div className="size-1">
                <div className="mam1">
                    <div className="div616">
                        <div className="div617"/>
                        <div className="div618">
                            <span>{`297 `}</span>
                            <span className="span224">мм</span>
                        </div>
                    </div>
                    <div className="div619">
                        <div className="field-button12"/>
                        <div className="text65">А4 (210 х 297 мм)</div>
                        <div className="icondropdown-arrowsmall7">
                            <img className="mask-icon7" alt="" src="/mask1.svg"/>
                        </div>
                    </div>
                    <div className="mam">
                        <div className="div617"/>
                        <div className="div621">
                            <span>{`210 `}</span>
                            <span className="span224">мм</span>
                        </div>
                    </div>
                    <div className="div622">х</div>
                </div>
                <button className="sizec-buttom1">
                    <div className="div605"/>
                    <div className="text66">Двосторонній</div>
                </button>
                <button className="sized-buttom1">
                    <div className="r1581"/>
                    <div className="text67">Односторонній</div>
                </button>
                <div className="sizee-buttom">
                    <div className="container-l-color31"/>
                    <div className="top-label14">
                        <b className="label43">Кількість</b>
                    </div>
                    <div className="chevron-2">
                        <div className="input-text31">|</div>
                        <div className="div558"/>
                        <div className="label44">шт</div>
                    </div>
                    <div className="chevron40">
                        <div className="frame38"/>
                        <img className="shape-icon40" alt="" src="/shape4.svg"/>
                    </div>
                    <div className="chevron41">
                        <div className="frame38"/>
                        <img className="shape-icon41" alt="" src="/shape5.svg"/>
                    </div>
                </div>
                <div className="div626">
                    <div className="field-button12"/>
                    <div className="text68">Дизайнерський папір 400 г/м2</div>
                    <div className="icondropdown-arrowsmall8">
                        <img className="mask-icon7" alt="" src="/mask1.svg"/>
                    </div>
                </div>
                <div className="cpmas8">
                    Кольоровий друк на промисловій цифровій машині:
                </div>
            </div>
        </div>
    );
};

export default CPM;
