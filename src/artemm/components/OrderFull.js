import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "./OrderFull.css";

const OrderFull = ({ className = "", onClose }) => {
  const navigate = useNavigate();

  const onKnopAClick = () => {
    navigate("/client-full");
  };

  return (
    <div className={`order-full ${className}`}>
      <div className="zakaza" />
      <div className="zakazb" />
      <div className="zakazc">
        <img className="icon70" alt="" src="/-14.svg" />
        <img className="icon71" alt="" src="/-14.svg" />
        <img className="icon72" alt="" src="/-14.svg" />
        <img className="icon73" alt="" src="/-14.svg" />
        <img className="icon74" alt="" src="/-14.svg" />
        <img className="icon75" alt="" src="/-14.svg" />
        <div className="div312">1</div>
        <div className="div313">5</div>
        <div className="div314">3</div>
        <div className="div315">2</div>
        <div className="div316">6</div>
        <div className="div317">4</div>
      </div>
      <div className="zakazd">
        <div className="base126" />
        <div className="base127" />
      </div>
      <div className="zakaze">
        <div className="base128" />
        <div className="base129" />
        <div className="base130" />
        <div className="base131" />
      </div>
      <div className="zakazf">
        <button className="knopa2" onClick={onKnopAClick}>
          <div className="div318">
            <div className="div318">
              <div className="base133" />
            </div>
            <div className="div319">Клієнти</div>
          </div>
        </button>
        <button className="knopb2" autoFocus={false} disabled={false}>
          <div className="base134" />
          <div className="div320">Ліди</div>
        </button>
        <button className="knopc2">
          <div className="div318">
            <div className="base136" />
          </div>
          <div className="div321">Постачальники</div>
        </button>
        <button className="knopd2">
          <div className="base137" />
          <div className="div322">Підрядники</div>
        </button>
        <button className="knope2">
          <div className="div318">
            <div className="base138" />
            <div className="div321">Налаштування</div>
          </div>
        </button>
        <button className="knopf2">
          <div className="base139" />
          <div className="div325">Документи</div>
        </button>
        <button className="knopg2">
          <div className="base140" />
          <div className="div326">Звіти</div>
        </button>
        <button className="knoph2">
          <div className="base141" />
          <div className="div327">Ціни</div>
        </button>
        <button className="knopi2">
          <div className="base142" />
          <div className="div328">Замовлення</div>
        </button>
        <button className="knopj2">
          <div className="base143" />
          <div className="div329">Дашборд</div>
        </button>
        <button className="knopk2">
          <div className="base144" />
          <div className="div330">Нова Пошта</div>
        </button>
      </div>
      <div className="zakazg">
        <b className="print-peaks-erp2243">
          <li className="tintoreto-gesso-sr">PRINT</li>
          <li className="tintoreto-gesso-sr">PEAKS</li>
          <li className="tintoreto-gesso-sr">
            <span>ERP</span>
            <span className="span12">2.24</span>
          </li>
        </b>
      </div>
      <div className="zakazh">
        <div className="base145" />
        <div className="base146" />
        <img className="base-icon12" alt="" src="/base5.svg" />
        <img className="base-icon13" alt="" src="/base6.svg" />
        <div className="base147" />
        <div className="base148" />
        <div className="base149" />
        <div className="base150" />
        <div className="base151" />
        <div className="base152" />
        <div className="base153" />
        <div className="base154" />
        <div className="base155" />
        <div className="base156" />
        <div className="base157" />
        <div className="div331">Статус</div>
        <div className="div332">Номер</div>
        <div className="div333">Кількість</div>
        <div className="div334">Ціна</div>
        <div className="div335">Знижка</div>
        <div className="div336">Сума</div>
        <div className="div337">Дата створення</div>
        <div className="div338">Дата завершення</div>
        <div className="div339">Загальна сума</div>
        <div className="div340">Матеріал</div>
        <div className="div341">Назва</div>
        <div className="div342">П.І.Б</div>
        <div className="del">DEL</div>
        <img className="avatar-line-icon" alt="" src="/avatarline.svg" />
        <img
          className="number-symbol-24-regular-icon"
          alt=""
          src="/numbersymbol24regular.svg"
        />
      </div>
      <div className="zakazi">
        <div className="div343">
          <div className="base158" />
          <div className="div344">30002</div>
          <div className="div345">1</div>
          <img className="barcode-icon8" alt="" src="/barcode1.svg" />
        </div>
        <div className="base159" />
        <div className="base160" />
        <img className="base-icon14" alt="" src="/base7.svg" />
        <div className="base161" />
        <div className="base162" />
        <div className="base163" />
        <div className="base164" />
        <div className="base165" />
        <div className="base166" />
        <div className="base167" />
        <div className="base168" />
        <div className="base169" />
        <div className="base170" />
        <div className="del1">DEL</div>
        <div className="base171" />
        <div className="div346">
          <span>{`99,50 `}</span>
          <span className="span13">грн</span>
        </div>
        <div className="div347">
          <span>19 90019</span>
          <span className="span13">грн</span>
        </div>
        <div className="div348">10%</div>
        <div className="div349">10.02.2024 13:51</div>
        <div className="div350">15.02.2024 14:51</div>
        <b className="b">
          <span>{`17 910 `}</span>
          <span className="span13">грн</span>
        </b>
        <div className="div351">Пилипенко Артем Юрійович</div>
        <div className="div352">
          <img
            className="photo-2024-07-02-08-58-25-icon"
            alt=""
            src="/photo-20240702-085825@2x.png"
          />
        </div>
        <div className="sra3-container">
          <li className="tintoreto-gesso-sr">
            Друк SrA3 на дизайнерському картоні 400 г/м2 +
          </li>
          <li className="tintoreto-gesso-sr">{`матова ламінація + 4 біги + плотерна порізка + `}</li>
          <li className="tintoreto-gesso-sr">свердлення 2 дірок</li>
        </div>
        <div className="xerox-versant-40-container">
          <li className="tintoreto-gesso-sr">{`Xerox Versant 4+0 SR A3 200 шт(200х10=2000), `}</li>
          <li className="tintoreto-gesso-sr">
            Tintoreto gesso SR A3 200 шт (200х10=2000),
          </li>
          <li className="tintoreto-gesso-sr">
            Матова ламінація SR A3 200 шт (200х50=10000),
          </li>
          <li className="tintoreto-gesso-sr">Біговка 800 шт (800х1=800),</li>
          <li className="tintoreto-gesso-sr">
            Свердлення дірок 400 шт (50х2=100),
          </li>
          <li className="tintoreto-gesso-sr">
            Плотерна порізка 100 шт (50*100=5000).
          </li>
        </div>
        <div className="div353">4+0</div>
        <div className="div354">
          <span>{`200 `}</span>
          <span className="span13">шт</span>
        </div>
        <div className="div355">
          <div className="base172" />
          <div className="div356">Відвантажен</div>
        </div>
        <div className="base173" />
        <div className="div357">Пилипенко Артем Юрійович</div>
        <div className="base174" />
        <div className="base175" />
        <img className="base-icon15" alt="" src="/base8.svg" />
        <img className="base-icon16" alt="" src="/base6.svg" />
        <div className="base176" />
        <div className="base177" />
        <div className="base178" />
        <div className="base179" />
        <div className="base180" />
        <div className="base181" />
        <div className="base182" />
        <div className="base183" />
        <div className="base184" />
        <div className="base185" />
        <div className="base186" />
        <div className="div358">
          <span>{`2 `}</span>
          <span className="span17">
            <span className="span18">м</span>
            <span className="span19">2</span>
          </span>
        </div>
        <div className="div359">
          <span>{`700 `}</span>
          <span className="span20">грн</span>
          <span>{` `}</span>
        </div>
        <div className="div360">
          <span>{`1400 `}</span>
          <span className="span20">грн</span>
        </div>
        <div className="div361">Пилипенко Артем Юрійович</div>
        <div className="del2">DEL</div>
        <div className="div362">30002</div>
        <div className="div363">2</div>
        <img className="barcode-icon9" alt="" src="/barcode2.svg" />
        <div className="div364">
          <img
            className="photo-2024-07-02-08-58-25-icon"
            alt=""
            src="/photo-20240702-085825@2x.png"
          />
        </div>
        <div className="div365">
          <li className="tintoreto-gesso-sr">{`Широкоформатний фотодрук на матовому `}</li>
          <li className="tintoreto-gesso-sr">папері 180 г/м2</li>
        </div>
        <div className="epson-p9000-40-container">
          <li className="tintoreto-gesso-sr">
            <span className="epson-p9000-40">Epson P9000 4+0 2 м</span>
            <span className="span22">{`2 `}</span>
            <span>{`(2х350=700), `}</span>
          </li>
          <li className="tintoreto-gesso-sr">{`Матовий папір 180 г/м2 (2х350=700), `}</li>
        </div>
        <b className="b1">
          <span>{`1 400 `}</span>
          <span className="span13">грн</span>
        </b>
        <div className="div366">10.02.2024 13:51</div>
        <div className="div367">15.02.2024 14:51</div>
        <div className="div368">Відвантажен</div>
        <div className="div369">
          <div className="base158" />
          <div className="div344">30003</div>
          <div className="div345">1</div>
          <img className="barcode-icon8" alt="" src="/barcode1.svg" />
        </div>
        <div className="base188" />
        <div className="base189" />
        <img className="base-icon17" alt="" src="/base7.svg" />
        <div className="base190" />
        <div className="base191" />
        <div className="base192" />
        <div className="base193" />
        <div className="base194" />
        <div className="base195" />
        <div className="base196" />
        <div className="base197" />
        <div className="base198" />
        <div className="base199" />
        <div className="del3">DEL</div>
        <div className="base200" />
        <div className="div372">
          <span>{`99,50 `}</span>
          <span className="span13">грн</span>
        </div>
        <div className="div373">
          <span>19 90019</span>
          <span className="span13">грн</span>
        </div>
        <div className="div374">10%</div>
        <div className="div375">10.02.2024 13:51</div>
        <div className="div376">15.02.2024 14:51</div>
        <b className="b2">
          <span>{`17 910 `}</span>
          <span className="span13">грн</span>
        </b>
        <div className="div377">Пилипенко Артем Юрійович</div>
        <div className="div378">
          <img
            className="photo-2024-07-02-08-58-25-icon"
            alt=""
            src="/photo-20240702-085825@2x.png"
          />
        </div>
        <div className="sra3-container1">
          <li className="tintoreto-gesso-sr">
            Друк SrA3 на дизайнерському картоні 400 г/м2 +
          </li>
          <li className="tintoreto-gesso-sr">{`матова ламінація + 4 біги + плотерна порізка + `}</li>
          <li className="tintoreto-gesso-sr">свердлення 2 дірок</li>
        </div>
        <div className="xerox-versant-40-container1">
          <li className="tintoreto-gesso-sr">{`Xerox Versant 4+0 SR A3 200 шт(200х10=2000), `}</li>
          <li className="tintoreto-gesso-sr">
            Tintoreto gesso SR A3 200 шт (200х10=2000),
          </li>
          <li className="tintoreto-gesso-sr">
            Матова ламінація SR A3 200 шт (200х50=10000),
          </li>
          <li className="tintoreto-gesso-sr">Біговка 800 шт (800х1=800),</li>
          <li className="tintoreto-gesso-sr">
            Свердлення дірок 400 шт (50х2=100),
          </li>
          <li className="tintoreto-gesso-sr">
            Плотерна порізка 100 шт (50*100=5000).
          </li>
        </div>
        <div className="div379">4+0</div>
        <div className="div380">
          <span>{`200 `}</span>
          <span className="span13">шт</span>
        </div>
        <div className="div381">
          <div className="base201" />
          <div className="div356">Скасований</div>
        </div>
        <div className="base202" />
        <div className="div383">Пилипенко Артем Юрійович</div>
        <div className="del4">DEL</div>
      </div>
      <div className="zakazj">
        <div className="base172" />
        <div className="div384">Відвантажен</div>
      </div>
    </div>
  );
};

OrderFull.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
};

export default OrderFull;
