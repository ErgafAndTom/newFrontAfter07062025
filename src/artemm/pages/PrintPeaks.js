import {useState} from "react";
import {useNavigate} from "react-router-dom";
import "./PrintPeaks.css";
import "../../global.css";

const PrintPeaks = () => {
    const [isClientPipOpen, setClientPipOpen] = useState(false);
    const navigate = useNavigate();

    const openClientPip = () => {
        setClientPipOpen(true);
    };

    const closeClientPip = () => {
        setClientPipOpen(false);
    };

    const onButtonClick = () => {
        navigate("/plus-client");
    };

    const onImagBClick = () => {
        navigate("/photo");
    };

    const onImagCClick = () => {
        navigate("/cpm");
    };

    const onImagDClick = () => {
        navigate("/wide");
    };

    const onImagFClick = () => {
        navigate("/bw-print");
    };

    const onKnopAClick = () => {
        window.open("/client-full");
    };

    const onKnopIClick = () => {
        window.open("/order-full");
    };

    return (
        <>
            <div className="cpm">
                <div className="fon15" id="Fon1"></div>
                <div className="r1575" id="fon"></div>
                <button className="cpmd" autofocus="{true}">
                    <div className="r1581"></div>
                    <div className="plus-zam-text5">Додати до замовлення</div>
                </button>
                <div className="cpmad">
                    <div className="wideb4"></div>
                    <div className="div477">
                        <div className="div478">
                            <div className="div479"></div>
                            <div className="text36">
                                <span>1 </span>
                                <span className="span107">грн</span>
                                <span> x 30 </span>
                                <span className="span107">шт</span>
                                <span> = 300 </span>
                                <span className="span107">грн</span>
                            </div>
                        </div>
                        <div className="div480">
                            <div className="div481"></div>
                            <div className="text37">
                                <span>30 </span>
                                <span className="span107">грн</span>
                                <span> x 30 </span>
                                <span className="span107">шт</span>
                                <span> = 900 </span>
                                <span className="span107">грн</span>
                            </div>
                        </div>
                        <div className="div482">
                            <div className="div479"></div>
                            <div className="text38">
                                <span>30 </span>
                                <span className="span107">грн</span>
                                <span> x 30 </span>
                                <span className="span107">шт</span>
                                <span> = 900 </span>
                                <span className="span107">грн</span>
                            </div>
                        </div>
                        <div className="div484">
                            <div className="div481"></div>
                            <div className="text36">
                                <span>0 </span>
                                <span className="span107">грн</span>
                                <span> x 0 </span>
                                <span className="span107">шт</span>
                                <span> = 0 </span>
                                <span className="span107">грн</span>
                            </div>
                        </div>
                        <div className="div486">
                            <div className="div481"></div>
                            <div className="text36">
                                <span>40 </span>
                                <span className="span107">грн</span>
                                <span> x 30 </span>
                                <span className="span107">шт</span>
                                <span> = 1200 </span>
                                <span className="span107">грн</span>
                            </div>
                        </div>
                        <div className="div488">
                            <div className="div479"></div>
                            <div className="text36">
                                <span>0 </span>
                                <span className="span107">грн</span>
                                <span> x 0 </span>
                                <span className="span107">шт</span>
                                <span> = 0 </span>
                                <span className="span107">грн</span>
                            </div>
                        </div>
                        <div className="div490">
                            <div className="div481"></div>
                            <div className="text36">
                                <span>0 </span>
                                <span className="span107">грн</span>
                                <span> x 0 </span>
                                <span className="span107">шт</span>
                                <span> = 0 </span>
                                <span className="span107">грн</span>
                            </div>
                        </div>
                        <div className="div492">
                            <div className="div479"></div>
                            <div className="text36">
                                <span>0 </span>
                                <span className="span107">грн</span>
                                <span> x 0 </span>
                                <span className="span107">шт</span>
                                <span> = 0 </span>
                                <span className="span107">грн</span>
                            </div>
                        </div>
                        <div className="div494">
                            <div className="div479"></div>
                            <div className="text44">
              <span>
                <i className="i16">47</i>
              </span>
                                <i>
                                    <span> аркушів розміру Sr A3 буде витрачено</span>
                                    <span className="span131"> </span>
                                    <span> </span>
                                </i>
                            </div>
                        </div>
                        <div className="div496">
                            <div className="div497">
                                <div className="div481"></div>
                            </div>
                            <div className="text38">
              <span>
                <i className="i16">35</i>
              </span>
                                <i>
                                    <span> </span>
                                    <span className="span131">виробів</span>
                                    <span> вказаного розміру вміщується на аркуші Sr A3</span>
                                </i>
                            </div>
                        </div>
                        <div className="sum-text4">
                            <div className="div481"></div>
                            <div className="sum-text5">
              <span>
                <span>Загальна вартість: </span>
                <b className="b5">3300 </b>
              </span>
                                <b className="b5">
                                    <span className="span133">грн</span>
                                </b>
                            </div>
                        </div>
                    </div>
                    <img
                        className="versant80-img-icon"
                        alt=""
                        src="./public/versant80@2x.png"
                    />
                </div>
                <button className="cpman" autofocus="{true}" id="cPMAN">
                    <div className="r1581"></div>
                    <div className="plus-prod-text4">Додати до пресетів</div>
                </button>
                <div className="cpmas8">Кольоровий друк на промисловій цифровій машині:</div>
                <a className="print-peaks-logo6" id="Logo">
                    <b className="print-peaks-logo7">
                        <li className="print8">PRINT</li>
                        <li className="print8">PEAKS</li>
                        <li className="print8">
                            <span>ERP</span>
                            <span className="span107">2.24</span>
                        </li>
                    </b>
                </a>
                <div className="quantity10" id="Kilkist">
                    <div className="input-text25">|</div>
                    <input
                        className="input11"
                        placeholder="Обсяг"
                        type="number"
                        min="1"
                        max="9999"
                        step="1"
                    />

                    <div className="frame16"></div>
                    <div className="div500"></div>
                    <div className="label27" id="Шт">шт</div>
                </div>
                <div className="sizes8" id="Size">
                    <select className="sizes9">
                        <option value="А7">А7 (7,5х10,5 см)</option>
                        <option value="А6">А6 (10,5х14,8 см)</option>
                        <option value="А5">А5 (14,8Х21 см)</option>
                        <option value="А4">А4 (21х29,7 см)</option>
                        <option value="А3">А3 (29,7х42 см)</option>
                        <option value="SR A4 ">SR A4 (22,5x32 см)</option>
                        <option value="SR A3">SR A3 (32х45 см)</option>
                        <option value="5х9 см">5х9 см</option>
                        <option value="10х15 см">10х15 см</option>
                        <option value="10х10 см">10х10 см</option>
                        <option value="12х12 см">12х12 см</option>
                        <option value="13х18 см">13х18 см</option>
                    </select>
                    <input
                        className="size-wide4"
                        placeholder="Ширина"
                        type="number"
                        min="45"
                        max="320"
                        step="1"
                        maxlength="4"
                        minlength="2"
                        name="11"
                    />

                    <input
                        className="size-hight4"
                        placeholder="Висота"
                        type="number"
                        min="45"
                        max="480"
                        step="1"
                        maxlength="4"
                        minlength="2"
                    />

                    <div className="div501">х</div>
                </div>
                <div className="div502" id="Side">
                    <button className="bothside1">
                        <div className="text46">Двосторонній</div>
                    </button>
                    <button className="oneside1">
                        <div className="text47">Односторонній</div>
                    </button>
                </div>
                <div className="lamination" id="Lamination">
                    <div className="laminationb-button">Ламінація:</div>
                    <div className="laminationp-button">
                        <div className="div497">
                            <div className="base211"></div>
                            <img className="control-icon8" alt="" src="public/control.svg"/>
                        </div>
                    </div>
                    <button className="gloss-lam">
                        <div className="div503"></div>
                        <div className="text48">Глянецева</div>
                    </button>
                    <button className="mat-lam">
                        <div className="r1581"></div>
                        <div className="text49">Матова</div>
                    </button>
                    <button className="soft-lam">
                        <div className="div503"></div>
                        <div className="text50">Soft Velvet</div>
                    </button>
                    <select className="thik-lam" id="Material">
                        <option value="125 мкм">125 мкм</option>
                        <option value="100 мкм">100 мкм</option>
                        <option value="80 мкм">80 мкм</option>
                    </select>
                </div>
                <div className="zgin" id="Zgin">
                    <div className="zgink-button">Згинання:</div>
                    <div className="zginl-button">
                        <div className="div497">
                            <div className="base211"></div>
                            <img className="control-icon8" alt="" src="public/control.svg"/>
                        </div>
                    </div>
                    <select className="zgin-kilkist" id="Material">
                        <option value="1 згин">1 згин</option>
                        <option value="2 згинаКрейла 170">2 згина</option>
                        <option value="3 згини">3 згини</option>
                        <option value="4 згини">4 згини</option>
                    </select>
                </div>
                <div className="krugl-kut">
                    <div className="krugl-button">Скруглення кутів:</div>
                    <div className="krugr-button7">
                        <div className="div497">
                            <div className="base211"></div>
                            <img className="control-icon8" alt="" src="public/control.svg"/>
                        </div>
                    </div>
                    <select className="zkrugl-kut" id="Size_k">
                        <option value="3,5 мм">3,5 мм</option>
                        <option value="4 мм">4 мм</option>
                        <option value="5 мм">5 мм</option>
                        <option value="6 мм">6 мм</option>
                        <option value="8 мм">8 мм</option>
                    </select>
                </div>
                <div className="broshura1">
                    <div className="bind-text2">
                        <b className="bind-text3">Брошурування:</b>
                    </div>
                    <div className="form-switches11">
                        <div className="div506">
                            <div className="base214"></div>
                            <img className="control-icon8" alt="" src="public/control.svg"/>
                        </div>
                        <div className="bind-mat1">
                            <button className="metal3" autofocus="{true}">
                                <button className="button12" autofocus="{true}">
                                    <div className="r1581"></div>
                                    <div className="metal-text3">Металева пружинка</div>
                                </button>
                            </button>
                            <button className="tberd4" autofocus="{true}">
                                <div className="tverd-text12">Твердим переплітом</div>
                            </button>
                            <button className="skoba3" autofocus="{true}">
                                <div className="skoba-text3">Скоба</div>
                            </button>
                        </div>
                    </div>
                    <div className="div507">
                        <button className="cpmaz2" autofocus="{true}">
                            <div className="r1581"></div>
                            <div className="text51">
                                <span className="span135">До 120 </span>
                                <span className="span136">аркушів</span>
                            </div>
                        </button>
                        <button className="cpmaz3" autofocus="{true}">
                            <div className="div509"></div>
                            <div className="text52">
                                <span className="span135">120-280 </span>
                                <span className="span136">аркушів</span>
                            </div>
                        </button>
                    </div>
                    <div className="quantity11" id="Kilkist">
                        <div className="input-text25">|</div>
                        <input
                            className="input11"
                            placeholder="Обсяг"
                            type="number"
                            min="1"
                            max="9999"
                            step="1"
                        />

                        <div className="frame16"></div>
                        <div className="div500"></div>
                        <div className="label27" id="Шт">шт</div>
                    </div>
                </div>
                <div className="scan">
                    <div className="otvori-button">Скан документів:</div>
                    <div className="krugr-button8">
                        <div className="div497">
                            <div className="base211"></div>
                            <img className="control-icon8" alt="" src="public/control.svg"/>
                        </div>
                    </div>
                    <button className="otvorl-button" autofocus="{true}">
                        <div className="r1581"></div>
                        <div className="tverd-text13">А4</div>
                    </button>
                    <button className="otvorl-button1" autofocus="{true}">
                        <div className="div509"></div>
                        <div className="tverd-text13">А3</div>
                    </button>
                    <div className="quantity12" id="Kilkist">
                        <div className="input-text25">|</div>
                        <input
                            className="input11"
                            placeholder="Обсяг"
                            type="number"
                            min="1"
                            max="9999"
                            step="1"
                        />

                        <div className="frame16"></div>
                        <div className="div500"></div>
                        <div className="label27" id="Шт">шт</div>
                    </div>
                </div>
                <div className="dirki" id="Dirki">
                    <div className="otvori-button1">Cвердління отворів:</div>
                    <div className="otvoro-button">
                        <div className="div497">
                            <div className="base211"></div>
                            <img className="control-icon8" alt="" src="public/control.svg"/>
                        </div>
                    </div>
                    <select className="zkrugl-kut1" id="size_o">
                        <option value="3,5 мм">3,5 мм</option>
                        <option value="4 мм">4 мм</option>
                        <option value="5 мм">5 мм</option>
                        <option value="6 мм">6 мм</option>
                        <option value="8 мм">8 мм</option>
                    </select>
                    <div className="div514">
                        <button className="otvora-button">
                            <div className="div515"></div>
                            <img className="icon77" alt="" src="./public/-127.svg"/>
                        </button>
                        <button className="otvorb-button">
                            <div className="div516"></div>
                            <img className="icon78" alt="" src="./public/-127.svg"/>

                            <img className="icon79" alt="" src="./public/-127.svg"/>
                        </button>
                        <button className="otvorc-button">
                            <div className="div516"></div>
                            <img className="icon78" alt="" src="./public/-127.svg"/>

                            <img className="icon79" alt="" src="./public/-127.svg"/>

                            <img className="icon82" alt="" src="./public/-127.svg"/>
                        </button>
                        <button className="otvord-button">
                            <div className="div516"></div>
                            <img className="icon78" alt="" src="./public/-127.svg"/>

                            <img className="icon79" alt="" src="./public/-127.svg"/>

                            <img className="icon85" alt="" src="./public/-127.svg"/>

                            <img className="icon86" alt="" src="./public/-127.svg"/>
                        </button>
                        <button className="otvore-button">
                            <div className="div516"></div>
                            <img className="icon87" alt="" src="./public/-127.svg"/>
                        </button>
                        <button className="otvorf-button">
                            <div className="div516"></div>
                            <img className="icon88" alt="" src="./public/-127.svg"/>

                            <img className="icon89" alt="" src="./public/-127.svg"/>
                        </button>
                        <button className="otvorg-button">
                            <div className="div516"></div>
                            <img className="icon78" alt="" src="./public/-127.svg"/>

                            <img className="icon91" alt="" src="./public/-127.svg"/>

                            <img className="icon92" alt="" src="./public/-127.svg"/>
                        </button>
                        <button className="otvorh-button">
                            <div className="div516"></div>
                            <img className="icon93" alt="" src="./public/-127.svg"/>

                            <img className="icon94" alt="" src="./public/-127.svg"/>

                            <img className="icon95" alt="" src="./public/-127.svg"/>

                            <img className="icon96" alt="" src="./public/-127.svg"/>
                        </button>
                    </div>
                </div>
                <div className="div523">
                    <div className="field-button4"></div>
                    <div className="text53">Сатін</div>
                    <div className="icondropdown-arrowsmall3">
                        <img className="mask-icon3" alt="" src="./public/mask1.svg"/>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrintPeaks;
