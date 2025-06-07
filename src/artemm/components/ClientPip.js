import { useState } from "react";
import SettingClient from "./SettingClient";
import PortalPopup from "./PortalPopup";
import PropTypes from "prop-types";
import "./ClientPip.css";

const ClientPip = ({className = null}) => {
  const [isSettingClientOpen, setSettingClientOpen] = useState(false);

  const openSettingClient = () => {
    setSettingClientOpen(true);
  };

  const closeSettingClient = () => {
    setSettingClientOpen(false);
  };

  return (
    <>
      <div className={`client-pip ${className}`}>
        <div className="clienta1" />
        <div className="clientb1" />
        <div className="clientc1" />
        <div className="clientd1">
          <div className="div187" />
          <div className="div188">
            <div className="div189">№</div>
          </div>
          <div className="div190">
            <div className="div191">П.І.Б</div>
            <img className="name-icon" alt="" src="/name.svg" />
          </div>
          <div className="phone">
            <div className="div192">П.І.Б</div>
            <img
              className="phone-portrait-outline-icon"
              alt=""
              src="/phoneportraitoutline.svg"
            />
          </div>
          <div className="e-mail1">
            <div className="div193">П.І.Б</div>
            <img className="email-icon" alt="" src="/email.svg" />
          </div>
          <div className="telegram1">
            <div className="div194">П.І.Б</div>
            <img className="telegram-icon" alt="" src="/telegram.svg" />
          </div>
          <div className="telegram2">
            <div className="div195">П.І.Б</div>
          </div>
          <div className="telegram3">
            <div className="div196">П.І.Б</div>
          </div>
          <div className="telegram4">
            <div className="div197">П.І.Б</div>
          </div>
          <div className="telegram5">
            <div className="div198">П.І.Б</div>
          </div>
          <div className="telegram6">
            <div className="div199">П.І.Б</div>
          </div>
          <div className="telegram7">
            <div className="div200">П.І.Б</div>
          </div>
          <div className="telegram8">
            <div className="div201">П.І.Б</div>
          </div>
          <div className="div202">№</div>
          <img
            className="discount-solid-icon"
            alt=""
            src="/discountsolid.svg"
          />
          <img
            className="gift-card-money-24-filled-icon"
            alt=""
            src="/giftcardmoney24filled.svg"
          />
          <img className="money-icon" alt="" src="/money.svg" />
          <img className="detective-icon" alt="" src="/detective.svg" />
          <img className="death-alt-icon" alt="" src="/deathalt.svg" />
          <img
            className="calendar-plus-fill-icon"
            alt=""
            src="/calendarplusfill.svg"
          />
          <img
            className="setting-3-bold-icon"
            alt=""
            src="/setting3-bold.svg"
          />
          <div className="iconmaps360-24px">
            <div className="boundary" />
            <img className="color-icon" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px1">
            <div className="boundary" />
            <img className="color-icon" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px2">
            <div className="boundary" />
            <img className="color-icon" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px3">
            <div className="boundary3" />
            <img className="color-icon3" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px4">
            <div className="boundary3" />
            <img className="color-icon3" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px5">
            <div className="boundary" />
            <img className="color-icon" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px6">
            <div className="boundary6" />
            <img className="color-icon6" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px7">
            <div className="boundary" />
            <img className="color-icon" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px8">
            <div className="boundary" />
            <img className="color-icon" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px9">
            <div className="boundary" />
            <img className="color-icon" alt="" src="/-color.svg" />
          </div>
          <div className="iconmaps360-24px10">
            <div className="boundary3" />
            <img className="color-icon3" alt="" src="/-color.svg" />
          </div>
        </div>
        <div className="cliente">
          <img className="icon42" alt="" src="/-14.svg" />
          <img className="icon43" alt="" src="/-14.svg" />
          <img className="icon44" alt="" src="/-14.svg" />
          <img className="icon45" alt="" src="/-14.svg" />
          <img className="icon46" alt="" src="/-14.svg" />
          <img className="icon47" alt="" src="/-14.svg" />
          <div className="div203">1</div>
          <div className="div204">5</div>
          <div className="div205">3</div>
          <div className="div206">2</div>
          <div className="div207">6</div>
          <div className="div208">4</div>
        </div>
        <div className="clientf">
          <b className="print-peaks-erp2241">
            <li className="print1">PRINT</li>
            <li className="print1">PEAKS</li>
            <li className="print1">
              <span>ERP</span>
              <span className="span10">2.24</span>
            </li>
          </b>
        </div>
        <div className="clientg1">
          <img className="base-icon2" alt="" src="/base2.svg" />
          <img className="base-icon3" alt="" src="/base3.svg" />
          <img className="base-icon4" alt="" src="/base3.svg" />
          <img className="base-icon5" alt="" src="/base4.svg" />
          <img className="base-icon6" alt="" src="/base4.svg" />
          <div className="base27" />
          <div className="base28" />
          <div className="base29" />
          <div className="base30" />
          <div className="base31" />
          <div className="base32" />
          <div className="base33" />
          <div className="base34" />
          <div className="base35" />
          <div className="base36" />
          <div className="base37" />
          <div className="base38" />
          <div className="base39" />
          <div className="base40" />
          <div className="base41" />
          <div className="base42" />
          <div className="base43" />
          <div className="base44" />
          <div className="base45" />
          <div className="base46" />
          <div className="base47" />
          <div className="base48" />
          <div className="base49" />
          <div className="base50" />
          <div className="base51" />
          <div className="base52" />
          <div className="base53" />
          <div className="base54" />
          <div className="base55" />
          <div className="base56" />
          <div className="base57" />
          <div className="base58" />
          <div className="base59" />
          <div className="base60" />
          <div className="base61" />
          <div className="base62" />
          <div className="base63" />
          <div className="base64" />
          <div className="base65" />
          <div className="base66" />
          <div className="base67" />
          <div className="base68" />
          <div className="div209">20001</div>
          <div className="div210">20001</div>
          <div className="div211">20001</div>
          <div className="div212">20001</div>
          <div className="patricia-ross">Patricia Ross</div>
          <div className="div213">Пилипенко Артем Юрійович</div>
          <div className="charles-mcdonald">Charles McDonald</div>
          <div className="div214">Пилипенко Артем Юрійович</div>
          <div className="div215">+38 097 562 90 25</div>
          <div className="div216">+38 097 562 90 25</div>
          <div className="div217">+38 097 562 90 25</div>
          <div className="div218">+38 097 562 90 25</div>
          <div className="frankfullermailcom">frank.fuller@mail.com</div>
          <div className="aaronmccoymailcom">aaron.mccoy@mail.com</div>
          <div className="joserobertsmailcom">jose.roberts@mail.com</div>
          <div className="chadwilliamsonmailcom">chad.williamson@mail.com</div>
          <div className="aiatomas1">@aiatomas</div>
          <div className="aiatomas2">@aiatomas</div>
          <div className="aiatomas3">@aiatomas</div>
          <div className="aiatomas4">@aiatomas</div>
          <div className="div219">15%</div>
          <div className="div220">15%</div>
          <div className="div221">15%</div>
          <div className="div222">15%</div>
          <div className="div223">2 000 грн</div>
          <div className="div224">2 000 грн</div>
          <div className="div225">2 000 грн</div>
          <div className="div226">2 000 грн</div>
          <div className="div227">2 375 456 грн</div>
          <div className="div228">2 375 456 грн</div>
          <div className="div229">2 375 456 грн</div>
          <div className="div230">2 375 456 грн</div>
          <div className="div231">35 000 грн</div>
          <div className="div232">35 000 грн</div>
          <div className="div233">35 000 грн</div>
          <div className="div234">35 000 грн</div>
          <div className="div235">2 000 грн</div>
          <div className="div236">2 000 грн</div>
          <div className="div237">2 000 грн</div>
          <div className="div238">2 000 грн</div>
          <div className="div239">02.07.2024</div>
          <div className="div240">02.07.2024</div>
          <div className="div241">02.07.2024</div>
          <div className="div242">02.07.2024</div>
          <img className="icon48" alt="" src="/--11@2x.png" />
          <img className="icon49" alt="" src="/--11@2x.png" />
          <img className="icon50" alt="" src="/--11@2x.png" />
          <img className="icon51" alt="" src="/--11@2x.png" />
          <img className="radio-icon" alt="" src="/radio.svg" />
          <img className="radio-icon1" alt="" src="/radio1.svg" />
          <img className="radio-icon2" alt="" src="/radio2.svg" />
          <img className="radio-icon3" alt="" src="/radio3.svg" />
          <img className="radio-icon4" alt="" src="/radio4.svg" />
          <img className="radio-icon5" alt="" src="/radio5.svg" />
          <img className="radio-icon6" alt="" src="/radio6.svg" />
          <img className="radio-icon7" alt="" src="/radio7.svg" />
          <img className="radio-icon8" alt="" src="/radio8.svg" />
          <img className="viber-icon1" alt="" src="/viber1.svg" />
          <img className="viber-icon2" alt="" src="/viber1.svg" />
          <img className="viber-icon3" alt="" src="/viber1.svg" />
          <img className="signal-icon" alt="" src="/signal.svg" />
          <img className="signal-icon1" alt="" src="/signal.svg" />
          <img className="signal-icon2" alt="" src="/signal.svg" />
          <img className="whatsapp-icon1" alt="" src="/whatsapp1.svg" />
          <img className="whatsapp-icon2" alt="" src="/whatsapp1.svg" />
          <img className="whatsapp-icon3" alt="" src="/whatsapp1.svg" />
          <img className="barcode-icon" alt="" src="/barcode.svg" />
          <img className="barcode-icon1" alt="" src="/barcode.svg" />
          <img className="barcode-icon2" alt="" src="/barcode.svg" />
          <img className="barcode-icon3" alt="" src="/barcode.svg" />
          <a className="a" onClick={openSettingClient}>
            <div className="base69" />
            <img className="icon52" alt="" src="/.svg" />
          </a>
          <img className="icon53" alt="" src="/1.svg" />
          <img className="signal-icon3" alt="" src="/signal1.svg" />
          <img
            className="icontoggleradio-button-check"
            alt=""
            src="/icontoggleradio-button-checked-24px.svg"
          />
          <img
            className="icontoggleradio-button-check1"
            alt=""
            src="/icontoggleradio-button-checked-24px.svg"
          />
          <img
            className="icontoggleradio-button-check2"
            alt=""
            src="/icontoggleradio-button-checked-24px.svg"
          />
          <img className="viber-icon4" alt="" src="/viber2.svg" />
          <img className="whatsapp-icon4" alt="" src="/whatsapp2.svg" />
          <img className="icon54" alt="" src="/1.svg" />
          <img className="icon55" alt="" src="/1.svg" />
        </div>
        <div className="clienth1">
          <img className="cart-icon" alt="" src="/cart.svg" />
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

ClientPip.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
};

export default ClientPip;
