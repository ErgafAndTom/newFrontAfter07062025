import React from 'react';
import "./PlusClient.css";

// Импорт изображений
import nameIcon from './public/name.svg';
import phonePortraitOutlineIcon from './public/phoneportraitoutline.svg';
import emailIcon from './public/email.svg';
import signalIcon2 from './public/signal2.svg';
import viberIcon3 from './public/viber3.svg';
import whatsappIcon3 from './public/whatsapp3.svg';
import telegramIcon from './public/telegram.svg';
import icon76 from './public/-1968--2@2x.png';
import layer1Icon from './public/layer1.svg';
import vehicleDeliveryVanIcon from './public/vehicledeliveryvan.svg';

const PlusClientComponent = () => {
    return (
        <div className="plus-client">
            <div className="new">
                <div className="div385"></div>
                <div className="div386"></div>
                <img className="name-icon2" alt="" src={nameIcon} />
                <img className="phone-portrait-outline-icon2" alt="" src={phonePortraitOutlineIcon} />
                <img className="email-icon2" alt="" src={emailIcon} />
                <img className="signal-icon8" alt="" src={signalIcon2} />
                <img className="viber-icon9" alt="" src={viberIcon3} />
                <img className="whatsapp-icon9" alt="" src={whatsappIcon3} />
                <img className="telegram-icon2" alt="" src={telegramIcon} />
                <img className="icon76" alt="" src={icon76} />
                <div className="div387">
                    <div className="div388"></div>
                    <input className="i11" type="text" placeholder="Нік"/>
                </div>
                <div className="div389">
                    <div className="div388"></div>
                    {/*<i className="telegram17">@telegram</i>*/}
                    <input className="telegram17" type="text" placeholder="@telegram"/>
                </div>
                <div className="div391">
                    <div className="div388"></div>
                    {/*<i className="e-mail3">E-mail</i>*/}
                    <input className="e-mail3" type="text" placeholder="E-mail"/>
                </div>
                <div className="div393">
                    <div className="div394"></div>
                    {/*<i className="i12">Номер телефона</i>*/}
                    <input className="i12" type="text" placeholder="Номер телефона"/>
                </div>
                <div className="div395">
                    <div className="div396"></div>
                    <div className="div397">Додати файли</div>
                </div>
                <div className="div398">
                    <div className="div396"></div>
                    <div className="div400">Додати клієнта</div>
                </div>
                <div className="div401">
                    <div className="div388"></div>
                    {/*<i className="i13">Адреса поставок</i>*/}
                    <input className="i13" type="text" placeholder="Адреса поставок"/>
                </div>
                <div className="div403">
                    <div className="div404"></div>
                    <i className="i14">Місто</i>
                </div>
                <div className="div405">
                    <div className="div406"></div>
                    <i className="i15">Відділення</i>
                </div>
                <img className="layer1-icon" alt="" src={layer1Icon} />
                <img className="vehicle-delivery-van-icon" alt="" src={vehicleDeliveryVanIcon} />
            </div>
            <div className="div407"></div>
        </div>
    );
};

export default PlusClientComponent;
