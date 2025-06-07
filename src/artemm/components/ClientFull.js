import { useState } from "react";
import SettingClient from "./SettingClient";
import PortalPopup from "./PortalPopup";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "./ClientFull.css";

const ClientFull = ({ className = "", onClose }) => {
  const [isSettingClientOpen, setSettingClientOpen] = useState(false);
  const navigate = useNavigate();

  const openSettingClient = () => {
    setSettingClientOpen(true);
  };

  const closeSettingClient = () => {
    setSettingClientOpen(false);
  };

  const onKnopAClick = () => {
    navigate("/client-full");
  };

  const onKnopIClick = () => {
    navigate("/order-full");
  };

  return (
    <>
      <div className={`client-full ${className}`}>
        <div className="clientfa" />
        <div className="clientfb">
          <button className="knopa1" onClick={onKnopAClick}>
            <div className="div243">
              <div className="div243">
                <div className="base71" />
              </div>
              <div className="div244">Клієнти</div>
            </div>
          </button>
          <button className="knopb1" autoFocus={false} disabled={false}>
            <div className="base72" />
            <div className="div245">Ліди</div>
          </button>
          <button className="knopc1">
            <div className="div243">
              <div className="base74" />
            </div>
            <div className="div246">Постачальники</div>
          </button>
          <button className="knopd1">
            <div className="base75" />
            <div className="div247">Підрядники</div>
          </button>
          <button className="knope1">
            <div className="div243">
              <div className="base76" />
              <div className="div246">Налаштування</div>
            </div>
          </button>
          <button className="knopf1">
            <div className="base77" />
            <div className="div250">Документи</div>
          </button>
          <button className="knopg1">
            <div className="base78" />
            <div className="div251">Звіти</div>
          </button>
          <button className="knoph1">
            <div className="base79" />
            <div className="div252">Ціни</div>
          </button>
          <button className="knopi1" onClick={onKnopIClick}>
            <div className="base80" />
            <div className="div253">Замовлення</div>
          </button>
          <button className="knopj1">
            <div className="base81" />
            <div className="div254">Дашборд</div>
          </button>
          <button className="knopk1">
            <div className="base82" />
            <div className="div255">Нова Пошта</div>
          </button>
        </div>
        <div className="clientfc" />
        <div className="clientfd">
          <b className="print-peaks-erp2242">
            <li className="print2">PRINT</li>
            <li className="print2">PEAKS</li>
            <li className="print2">
              <span>ERP</span>
              <span className="span11">2.24</span>
            </li>
          </b>
        </div>
        <div className="clientfe">
          <div className="div256" />
          <div className="div257">
            <div className="div258">№</div>
          </div>
          <div className="div259">
            <div className="div260">П.І.Б</div>
            <img className="name-icon1" alt="" src="/name.svg" />
          </div>
          <div className="phone1">
            <div className="div261">П.І.Б</div>
            <img
              className="phone-portrait-outline-icon1"
              alt=""
              src="/phoneportraitoutline.svg"
            />
          </div>
          <div className="e-mail2">
            <div className="div262">П.І.Б</div>
            <img className="email-icon1" alt="" src="/email.svg" />
          </div>
          <div className="telegram9">
            <div className="div263">П.І.Б</div>
            <img className="telegram-icon1" alt="" src="/telegram.svg" />
          </div>
          <div className="telegram10">
            <div className="div264">П.І.Б</div>
          </div>
          <div className="telegram11">
            <div className="div265">П.І.Б</div>
          </div>
          <div className="telegram12">
            <div className="div266">П.І.Б</div>
          </div>
          <div className="telegram13">
            <div className="div267">П.І.Б</div>
          </div>
          <div className="telegram14">
            <div className="div268">П.І.Б</div>
          </div>
          <div className="telegram15">
            <div className="div269">П.І.Б</div>
          </div>
          <div className="telegram16">
            <div className="div270">П.І.Б</div>
          </div>
          <div className="div271">№</div>
          <img
            className="discount-solid-icon1"
            alt=""
            src="/discountsolid.svg"
          />
          <img
            className="gift-card-money-24-filled-icon1"
            alt=""
            src="/giftcardmoney24filled.svg"
          />
          <img className="money-icon1" alt="" src="/money.svg" />
          <img className="detective-icon1" alt="" src="/detective.svg" />
          <img className="death-alt-icon1" alt="" src="/deathalt.svg" />
          <img
            className="calendar-plus-fill-icon1"
            alt=""
            src="/calendarplusfill.svg"
          />
          <img
            className="setting-3-bold-icon1"
            alt=""
            src="/setting3-bold.svg"
          />
          <div className="iconmaps360-24px11">
            <div className="boundary11" />
            <img className="color-icon11" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px12">
            <div className="boundary11" />
            <img className="color-icon11" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px13">
            <div className="boundary11" />
            <img className="color-icon11" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px14">
            <div className="boundary14" />
            <img className="color-icon14" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px15">
            <div className="boundary14" />
            <img className="color-icon14" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px16">
            <div className="boundary11" />
            <img className="color-icon11" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px17">
            <div className="div243" />
            <img className="color-icon17" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px18">
            <div className="boundary11" />
            <img className="color-icon11" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px19">
            <div className="boundary11" />
            <img className="color-icon11" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px20">
            <div className="boundary11" />
            <img className="color-icon11" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px21">
            <div className="boundary14" />
            <img className="color-icon14" alt="" src="/-color.svg" />
          </div>
        </div>
        <div className="clientff">
          <img className="icon56" alt="" src="/-14.svg" />
          <img className="icon57" alt="" src="/-14.svg" />
          <img className="icon58" alt="" src="/-14.svg" />
          <img className="icon59" alt="" src="/-14.svg" />
          <img className="icon60" alt="" src="/-14.svg" />
          <img className="icon61" alt="" src="/-14.svg" />
          <div className="div272">1</div>
          <div className="div273">5</div>
          <div className="div274">3</div>
          <div className="div275">2</div>
          <div className="div276">6</div>
          <div className="div277">4</div>
        </div>
        <div className="clientfg">
          <img className="base-icon7" alt="" src="/base2.svg" />
          <img className="base-icon8" alt="" src="/base3.svg" />
          <img className="base-icon9" alt="" src="/base3.svg" />
          <img className="base-icon10" alt="" src="/base4.svg" />
          <img className="base-icon11" alt="" src="/base4.svg" />
          <div className="base83" />
          <div className="base84" />
          <div className="base85" />
          <div className="base86" />
          <div className="base87" />
          <div className="base88" />
          <div className="base89" />
          <div className="base90" />
          <div className="base91" />
          <div className="base92" />
          <div className="base93" />
          <div className="base94" />
          <div className="base95" />
          <div className="base96" />
          <div className="base97" />
          <div className="base98" />
          <div className="base99" />
          <div className="base100" />
          <div className="base101" />
          <div className="base102" />
          <div className="base103" />
          <div className="base104" />
          <div className="base105" />
          <div className="base106" />
          <div className="base107" />
          <div className="base108" />
          <div className="base109" />
          <div className="base110" />
          <div className="base111" />
          <div className="base112" />
          <div className="base113" />
          <div className="base114" />
          <div className="base115" />
          <div className="base116" />
          <div className="base117" />
          <div className="base118" />
          <div className="base119" />
          <div className="base120" />
          <div className="base121" />
          <div className="base122" />
          <div className="base123" />
          <div className="base124" />
          <div className="div278">20001</div>
          <div className="div279">20001</div>
          <div className="div280">20001</div>
          <div className="div281">20001</div>
          <div className="patricia-ross1">Patricia Ross</div>
          <div className="div282">Пилипенко Артем Юрійович</div>
          <div className="charles-mcdonald1">Charles McDonald</div>
          <div className="div283">Пилипенко Артем Юрійович</div>
          <div className="div284">+38 097 562 90 25</div>
          <div className="div285">+38 097 562 90 25</div>
          <div className="div286">+38 097 562 90 25</div>
          <div className="div287">+38 097 562 90 25</div>
          <div className="frankfullermailcom1">frank.fuller@mail.com</div>
          <div className="aaronmccoymailcom1">aaron.mccoy@mail.com</div>
          <div className="joserobertsmailcom1">jose.roberts@mail.com</div>
          <div className="chadwilliamsonmailcom1">chad.williamson@mail.com</div>
          <div className="aiatomas5">@aiatomas</div>
          <div className="aiatomas6">@aiatomas</div>
          <div className="aiatomas7">@aiatomas</div>
          <div className="aiatomas8">@aiatomas</div>
          <div className="div288">15%</div>
          <div className="div289">15%</div>
          <div className="div290">15%</div>
          <div className="div291">15%</div>
          <div className="div292">2 000 грн</div>
          <div className="div293">2 000 грн</div>
          <div className="div294">2 000 грн</div>
          <div className="div295">2 000 грн</div>
          <div className="div296">2 375 456 грн</div>
          <div className="div297">2 375 456 грн</div>
          <div className="div298">2 375 456 грн</div>
          <div className="div299">2 375 456 грн</div>
          <div className="div300">35 000 грн</div>
          <div className="div301">35 000 грн</div>
          <div className="div302">35 000 грн</div>
          <div className="div303">35 000 грн</div>
          <div className="div304">2 000 грн</div>
          <div className="div305">2 000 грн</div>
          <div className="div306">2 000 грн</div>
          <div className="div307">2 000 грн</div>
          <div className="div308">02.07.2024</div>
          <div className="div309">02.07.2024</div>
          <div className="div310">02.07.2024</div>
          <div className="div311">02.07.2024</div>
          <img className="icon62" alt="" src="/--11@2x.png" />
          <img className="icon63" alt="" src="/--11@2x.png" />
          <img className="icon64" alt="" src="/--11@2x.png" />
          <img className="icon65" alt="" src="/--11@2x.png" />
          <img className="radio-icon9" alt="" src="/radio.svg" />
          <img className="radio-icon10" alt="" src="/radio1.svg" />
          <img className="radio-icon11" alt="" src="/radio2.svg" />
          <img className="radio-icon12" alt="" src="/radio3.svg" />
          <img className="radio-icon13" alt="" src="/radio4.svg" />
          <img className="radio-icon14" alt="" src="/radio5.svg" />
          <img className="radio-icon15" alt="" src="/radio6.svg" />
          <img className="radio-icon16" alt="" src="/radio7.svg" />
          <img className="radio-icon17" alt="" src="/radio8.svg" />
          <img className="viber-icon5" alt="" src="/viber1.svg" />
          <img className="viber-icon6" alt="" src="/viber1.svg" />
          <img className="viber-icon7" alt="" src="/viber1.svg" />
          <img className="signal-icon4" alt="" src="/signal.svg" />
          <img className="signal-icon5" alt="" src="/signal.svg" />
          <img className="signal-icon6" alt="" src="/signal.svg" />
          <img className="whatsapp-icon5" alt="" src="/whatsapp1.svg" />
          <img className="whatsapp-icon6" alt="" src="/whatsapp1.svg" />
          <img className="whatsapp-icon7" alt="" src="/whatsapp1.svg" />
          <img className="barcode-icon4" alt="" src="/barcode.svg" />
          <img className="barcode-icon5" alt="" src="/barcode.svg" />
          <img className="barcode-icon6" alt="" src="/barcode.svg" />
          <img className="barcode-icon7" alt="" src="/barcode.svg" />
          <a className="a1" onClick={openSettingClient}>
            <div className="base125" />
            <img className="icon66" alt="" src="/.svg" />
          </a>
          <img className="icon67" alt="" src="/1.svg" />
          <img className="signal-icon7" alt="" src="/signal1.svg" />
          <img
            className="icontoggleradio-button-check3"
            alt=""
            src="/icontoggleradio-button-checked-24px.svg"
          />
          <img
            className="icontoggleradio-button-check4"
            alt=""
            src="/icontoggleradio-button-checked-24px.svg"
          />
          <img
            className="icontoggleradio-button-check5"
            alt=""
            src="/icontoggleradio-button-checked-24px.svg"
          />
          <img className="viber-icon8" alt="" src="/viber2.svg" />
          <img className="whatsapp-icon8" alt="" src="/whatsapp2.svg" />
          <img className="icon68" alt="" src="/1.svg" />
          <img className="icon69" alt="" src="/1.svg" />
        </div>
      </div>
      {isSettingClientOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.3)"
          placement="Centered"
          onOutsideClick={closeSettingClient}
        >
          <SettingClient onClose={closeSettingClient} />
        </PortalPopup>
      )}
    </>
  );
};

ClientFull.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
};

export default ClientFull;
